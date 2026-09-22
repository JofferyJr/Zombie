import { createInitialGameState } from './core/game-state.js';
import { loadCoreContent } from './world/content-loader.js';
import { generateLeitianWorld } from './world/world-generator.js';
import { createLocalMap, drawLocalMap } from './world/local-map.js';
import { renderMainMenu, renderGameplayShell } from './ui/app-shell.js';
import { mountNewGame } from './ui/new-game.js';
import { mountHud } from './ui/hud.js';
import { addItem } from './world/loot-system.js';
import { createSurvivor, recruitSurvivor } from './npc/survivor-system.js';
import { claimShelter } from './shelter/shelter-system.js';
import { assignJob } from './npc/jobs.js';
import { spawnVehicle, enterVehicle, travelToDistrict } from './vehicles/vehicle-system.js';
import { initializeVerticalSliceFactions } from './factions/faction-system.js';
import { executeTrade } from './economy/trade-system.js';
import { tickRegionalSimulation } from './world/regional-sim.js';
import { saveGame, loadGame, listSaves } from './save/save-db.js';
import { exportSave, suggestSaveFilename } from './save/save-transfer.js';
import { loadSettings, applySettings, mountSettingsPanel } from './ui/settings-panel.js';

const app = document.querySelector('#app');
const canvas = document.querySelector('#game-canvas');
const hud = document.querySelector('#hud-root');
const modal = document.querySelector('#modal-root');
const ctx = canvas.getContext('2d');
const testMode = new URLSearchParams(location.search).get('test') === '1';

let state = null;
let map = null;
let items = [];
let vehicles = [];
let zombies = [];
let settings = applySettings(loadSettings());

function resize() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(innerWidth * dpr);
  canvas.height = Math.round(innerHeight * dpr);
}
addEventListener('resize', resize);
resize();

async function catalogs() {
  if (!items.length) items = await fetch('./data/items.json').then(r => r.json());
  if (!vehicles.length) vehicles = await fetch('./data/vehicles.json').then(r => r.json());
  if (!zombies.length) zombies = await fetch('./data/zombies.json').then(r => r.json());
}

function closeModal() { modal.innerHTML = ''; }

function buildMap() {
  map = createLocalMap(state.world.districtId, state.meta.seed);
  state.world.localBuildings = Object.fromEntries(map.buildings.map(b => [b.id, b]));
}

function render() {
  if (!state || !map) return;
  drawLocalMap(ctx, map, state);
  mountHud(hud, state);
}

function addTestButton(label, fn) {
  const host = app.querySelector('#game-actions');
  if (!host) return;
  const b = document.createElement('button');
  b.textContent = label;
  b.dataset.testHelper = '';
  b.addEventListener('click', fn);
  host.appendChild(b);
}

function openShelter() {
  const shelterId = Object.keys(state.shelters)[0];
  if (!shelterId) {
    modal.innerHTML = '<div class="modal-card"><p>No shelter claimed.</p><button data-close>Close</button></div>';
  } else {
    const recruited = Object.values(state.npcs).find(n => n.recruited);
    modal.innerHTML = `<div class="modal-card"><h2>Shelter</h2>
      <p>${state.shelters[shelterId].name}</p>
      ${recruited ? '<button data-guard>Assign Guard</button>' : ''}
      <button data-close>Close</button></div>`;
    modal.querySelector('[data-guard]')?.addEventListener('click', () => {
      assignJob(state, shelterId, recruited.id, 'guard');
      openShelter();
    });
  }
  modal.querySelector('[data-close]')?.addEventListener('click', closeModal);
}

function openTrader() {
  const factionId = 'central-restoration-authority';
  const faction = state.factions[factionId];
  const water = items.find(i => i.id === 'bottled-water');
  modal.innerHTML = `<div class="modal-card"><h2>${faction.shortName} Trader</h2>
    <p>Water stock: ${faction.market.stock['bottled-water'] ?? 0}</p>
    <button data-buy>Buy Water</button><button data-close>Close</button></div>`;
  modal.querySelector('[data-buy]').addEventListener('click', () => {
    executeTrade(state, { factionId, direction:'buy', item:water, quantity:1, offeredValue:999, itemCatalog:items });
    openTrader();
  });
  modal.querySelector('[data-close]').addEventListener('click', closeModal);
}

function openRadio() {
  const messages = (state.world.radioLog ?? []).slice(-8).map(m => `<li><strong>${m.source}</strong> — ${m.text}</li>`).join('');
  modal.innerHTML = `<div class="modal-card"><h2>Radio & Intel</h2><ul>${messages || '<li>No messages.</li>'}</ul><button data-close>Close</button></div>`;
  modal.querySelector('[data-close]').addEventListener('click', closeModal);
}

async function manualSave() {
  await saveGame('manual-1', state);
  let status = app.querySelector('[data-save-status]');
  if (!status) {
    status = document.createElement('span');
    status.dataset.saveStatus = '';
    app.querySelector('#game-actions')?.appendChild(status);
  }
  status.textContent = 'Saved';
}

function installActions() {
  app.querySelector('[data-game-action="save"]')?.addEventListener('click', manualSave);
  app.querySelector('[data-game-action="export"]')?.addEventListener('click', () => {
    const blob = exportSave(state);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = suggestSaveFilename(state);
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  });
  app.querySelector('[data-game-action="menu"]')?.addEventListener('click', showMainMenu);

  if (!testMode) return;
  addTestButton('Debug: Loot Starter Store', () => {
    const water = items.find(i => i.id === 'bottled-water');
    if (water) state.inventory = addItem(state.inventory, { itemId: water.id, quantity: 2 }, items).inventory;
  });
  addTestButton('Debug: Recruit Survivor', () => {
    const npc = Object.values(state.npcs).find(n => !n.recruited);
    if (npc) recruitSurvivor(state, npc.id);
  });
  addTestButton('Debug: Claim Apartment', () => {
    const apt = map.buildings.find(b => b.kind === 'apartment');
    if (apt && !state.shelters[apt.id]) claimShelter(state, apt.id);
  });
  addTestButton('Shelter', openShelter);
  addTestButton('Debug: Enter Van', () => {
    const v = Object.values(state.vehicles)[0];
    if (v) enterVehicle(state, v.id, 'player');
  });
  addTestButton('Travel: Railway District', () => {
    const v = Object.values(state.vehicles)[0];
    if (!v) return;
    if (!state.player.vehicleId) enterVehicle(state, v.id, 'player');
    travelToDistrict(state, v.id, 'railway-district');
    buildMap();
    renderGameplay();
  });
  addTestButton('Debug: Open Trader', openTrader);
  addTestButton('Debug: Advance Event Time', () => {
    state.world.day = 3;
    state.world.minutes = 600;
    tickRegionalSimulation(state, 30);
    openRadio();
  });
}

function renderGameplay() {
  renderGameplayShell(app, state);
  app.classList.add('gameplay');
  installActions();
  render();
}

async function enterLoadedState(next) {
  await catalogs();
  state = next;
  initializeVerticalSliceFactions(state, state.meta.seed);
  if (!Object.keys(state.vehicles ?? {}).length) {
    const type = vehicles[0];
    const van = spawnVehicle({ id:'leitian-utility-van', typeId:type.id, x:520, y:600, seed:state.meta.seed, type });
    state.vehicles[van.id] = van;
  }
  if (!Object.keys(state.npcs ?? {}).length) {
    const npc = createSurvivor(state.meta.seed, 0);
    npc.districtId = state.world.districtId;
    state.npcs[npc.id] = npc;
  }
  buildMap();
  renderGameplay();
}

async function startNewGame(config) {
  await catalogs();
  const content = await loadCoreContent();
  const next = createInitialGameState(config);
  next.world.generated = generateLeitianWorld({ seed: config.seed, content });
  initializeVerticalSliceFactions(next, config.seed);
  const type = vehicles[0];
  const van = spawnVehicle({ id:'leitian-utility-van', typeId:type.id, x:520, y:600, seed:config.seed, type });
  next.vehicles[van.id] = van;
  const npc = createSurvivor(config.seed, 0);
  npc.districtId = next.world.districtId;
  next.npcs[npc.id] = npc;
  await enterLoadedState(next);
}

async function showLoadMenu() {
  const saves = await listSaves();
  app.innerHTML = `<section class="menu-card"><h2>Load Game</h2>
    <div class="save-list">${saves.map(s => `<button data-slot="${s.slotId}">${s.playerName} · Day ${s.day} · ${s.districtId}</button>`).join('') || '<p>No saves.</p>'}</div>
    <button data-back>Back</button></section>`;
  app.querySelectorAll('[data-slot]').forEach(b => b.addEventListener('click', async () => {
    const loaded = await loadGame(b.dataset.slot);
    if (loaded) await enterLoadedState(loaded);
  }));
  app.querySelector('[data-back]')?.addEventListener('click', showMainMenu);
}

async function showMainMenu() {
  state = null;
  map = null;
  hud.innerHTML = '';
  modal.innerHTML = '';
  app.classList.remove('gameplay');
  let saves = [];
  try { saves = await listSaves(); } catch {}
  renderMainMenu(app, {
    hasSaves: saves.length > 0,
    onNewGame: () => mountNewGame(app, { onStart: startNewGame }),
    onContinue: async () => {
      const loaded = saves[0] ? await loadGame(saves[0].slotId) : null;
      if (loaded) await enterLoadedState(loaded);
    },
    onLoad: showLoadMenu,
    onImport: () => {},
    onSettings: () => mountSettingsPanel(modal, settings, { onClose: s => { settings = s; } }),
  });
}

function loop() {
  if (state && map) render();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
showMainMenu();
