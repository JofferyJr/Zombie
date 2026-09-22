import { formatGameTime } from '../core/game-clock.js';
const DISTRICT_NAMES = { 'northern-suburbs': 'Northern Suburbs', 'railway-district': 'Railway District' };

export function renderHudHtml(state) {
  const p = state.player, w = state.world;
  const vehicle = p.vehicleId ? state.vehicles?.[p.vehicleId] : null;
  return `<aside class="hud-panel"><div class="hud-location"><strong>${DISTRICT_NAMES[w.districtId] ?? w.districtId}</strong><span>Day ${w.day} · ${formatGameTime(w.minutes)} · ${w.weather}</span></div><div class="hud-bars"><span>Health ${Math.round(p.health)}</span><span>Stamina ${Math.round(p.stamina)}</span><span class="secondary">Hunger ${Math.round(p.hunger)}</span><span class="secondary">Thirst ${Math.round(p.thirst)}</span><span>Infection ${Math.round(p.infection)}%</span></div>${vehicle ? `<div class="vehicle-hud">Fuel ${vehicle.fuel.toFixed(1)} · Condition ${Math.round(vehicle.condition)} · Cargo ${vehicle.cargo?.length ?? 0}</div>` : ''}</aside>`;
}

export function mountHud(root, state) { root.innerHTML = renderHudHtml(state); }
