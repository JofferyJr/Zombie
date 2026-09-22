import test from 'node:test';
import assert from 'node:assert/strict';
import { createNewGameConfig, renderNewGameStep } from '../../js/ui/new-game.js';

const valid = {
  difficulty: 'survival', startingDate: 'day3', seed: 'hx-test-0001',
  name: 'Lin Wei', age: '24', gender: 'male', backgroundId: 'civilian',
  traits: ['calm', 'resourceful'], hometown: 'Leitian'
};

test('creates and normalizes a valid new game configuration', () => {
  const config = createNewGameConfig(valid);
  assert.equal(config.seed, 'HX-TEST-0001');
  assert.equal(config.character.name, 'Lin Wei');
  assert.equal(config.character.age, 24);
  assert.deepEqual(config.character.traits, ['calm', 'resourceful']);
});

test('rejects blank name and unsupported difficulty/date/background', () => {
  assert.throws(() => createNewGameConfig({ ...valid, name: '  ' }), /name/i);
  assert.throws(() => createNewGameConfig({ ...valid, difficulty: 'nightmare' }), /difficulty/i);
  assert.throws(() => createNewGameConfig({ ...valid, startingDate: 'year1' }), /starting date/i);
  assert.throws(() => createNewGameConfig({ ...valid, backgroundId: 'wizard' }), /background/i);
});

test('generates an HX seed when no seed is supplied', () => {
  const config = createNewGameConfig({ ...valid, seed: '' });
  assert.match(config.seed, /^HX-[A-F0-9]{4}-[A-F0-9]{4}$/);
});

test('wizard renderer exposes the four required steps', () => {
  const state = { step: 0, form: valid };
  const difficulty = renderNewGameStep(state);
  assert.match(difficulty, /Difficulty/i);
  assert.match(renderNewGameStep({ ...state, step: 1 }), /World seed/i);
  assert.match(renderNewGameStep({ ...state, step: 2 }), /Character name/i);
  assert.match(renderNewGameStep({ ...state, step: 3 }), /Leizhou — Leitian/i);
});
