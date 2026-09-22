import test from 'node:test';
import assert from 'node:assert/strict';
import { advanceClock } from '../../js/core/game-clock.js';
import { createLocalMap } from '../../js/world/local-map.js';
import { updateLocalSimulation } from '../../js/world/local-sim.js';
import { tickRegionalSimulation } from '../../js/world/regional-sim.js';
import { renderHudHtml } from '../../js/ui/hud.js';

test('advancing 120 minutes from 23:30 rolls to next day 01:30', () => {
  const state = { world: { day: 1, minutes: 23 * 60 + 30 } };
  advanceClock(state, 120);
  assert.equal(state.world.day, 2);
  assert.equal(state.world.minutes, 90);
});

test('regional weather changes only on 180-minute boundaries and is deterministic', () => {
  const make = () => ({ meta: { seed: 'HX-WEATHER' }, world: { day: 1, minutes: 179, weather: 'cloudy', lastRegionalTickMinute: 0, threats: {} }, shelters: {}, npcs: {} });
  const a = make();
  tickRegionalSimulation(a, 29);
  assert.equal(a.world.weather, 'cloudy');
  a.world.minutes = 180;
  tickRegionalSimulation(a, 30);
  const b = make(); b.world.minutes = 180; tickRegionalSimulation(b, 30);
  assert.equal(a.world.weather, b.world.weather);
});

test('Northern Suburbs map is deterministic and contains six buildings plus required landmarks', () => {
  const a = createLocalMap('northern-suburbs', 'HX-MAP', {});
  const b = createLocalMap('northern-suburbs', 'HX-MAP', {});
  assert.deepEqual(a, b);
  assert.equal(a.width, 1600); assert.equal(a.height, 1200);
  assert.equal(a.buildings.length, 6);
  assert.ok(a.buildings.some(x => x.kind === 'clinic'));
  assert.ok(a.buildings.some(x => x.kind === 'convenience-store'));
  assert.ok(a.buildings.some(x => x.kind === 'apartment' && x.claimable));
});

test('local simulation moves player and sprint drains stamina', () => {
  const state = { flags: { tacticalPaused: false }, player: { x: 100, y: 100, stamina: 100 }, world: { minutes: 480, day: 1 } };
  const map = { width: 1600, height: 1200, collisions: [] };
  updateLocalSimulation(state, { right: true, sprint: true, map }, 1);
  assert.ok(state.player.x > 100);
  assert.ok(state.player.stamina < 100);
});

test('tactical pause prevents local actor movement', () => {
  const state = { flags: { tacticalPaused: true }, player: { x: 100, y: 100, stamina: 100 }, world: { minutes: 480, day: 1 } };
  updateLocalSimulation(state, { right: true, sprint: false, map: { width: 1600, height: 1200, collisions: [] } }, 1);
  assert.equal(state.player.x, 100);
});


test('HUD html includes survival status and formatted time', () => {
  const html = renderHudHtml({ player: { health: 88, stamina: 70, hunger: 12, thirst: 9, infection: 0 }, world: { districtId: 'northern-suburbs', day: 2, minutes: 510, weather: 'rain' }, vehicles: {} });
  assert.match(html, /88/);
  assert.match(html, /Day 2/);
  assert.match(html, /08:30/);
  assert.match(html, /Northern Suburbs/);
});
