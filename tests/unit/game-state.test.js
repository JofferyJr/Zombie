import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createInitialGameState, assertSerializableGameState } from '../../js/core/game-state.js';
import { EventBus } from '../../js/core/event-bus.js';

test('creates a Leizhou/Leitian vertical-slice state with stable defaults', () => {
  const state = createInitialGameState({
    seed: 'HX-TEST-001',
    difficulty: 'survival',
    startingDate: 'day3',
    character: { name: 'Lin Wei', backgroundId: 'civilian' },
  });
  assert.equal(state.meta.version, 1);
  assert.equal(state.meta.seed, 'HX-TEST-001');
  assert.equal(state.world.regionId, 'leizhou');
  assert.equal(state.world.cityId, 'leitian');
  assert.equal(state.world.districtId, 'northern-suburbs');
  assert.equal(state.player.name, 'Lin Wei');
  assert.deepEqual(state.inventory.items, []);
  assert.deepEqual(state.shelters, {});
  assert.deepEqual(state.npcs, {});
  assert.deepEqual(state.zombies, {});
  assert.deepEqual(state.vehicles, {});
});

test('game state is JSON serializable', () => {
  const state = createInitialGameState({
    seed: 'HX-A', difficulty: 'casual', startingDate: 'day0',
    character: { name: 'A', backgroundId: 'student' },
  });
  assert.equal(assertSerializableGameState(state), true);
  assert.doesNotThrow(() => JSON.stringify(state));
});

test('EventBus subscribes, emits and unsubscribes listeners', () => {
  const bus = new EventBus();
  const seen = [];
  const listener = payload => seen.push(payload);
  bus.on('radio', listener);
  bus.emit('radio', { id: 1 });
  bus.off('radio', listener);
  bus.emit('radio', { id: 2 });
  assert.deepEqual(seen, [{ id: 1 }]);
});

test('index shell exposes required roots and module entrypoint', async () => {
  const html = await readFile(new URL('../../index.html', import.meta.url), 'utf8');
  for (const id of ['app', 'game-canvas', 'hud-root', 'modal-root']) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
  assert.match(html, /<script[^>]+type=["']module["'][^>]+src=["']\.\/js\/main\.js["']/);
});
