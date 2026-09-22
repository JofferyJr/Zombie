import test from 'node:test';
import assert from 'node:assert/strict';
import { createRng } from '../../js/core/rng.js';

test('same seed produces same random sequence', () => {
  const a = createRng('HX-1');
  const b = createRng('HX-1');
  assert.deepEqual([a.next(), a.int(1, 10), a.pick(['a','b','c'])], [b.next(), b.int(1, 10), b.pick(['a','b','c'])]);
});

test('rng validates invalid pick and chance inputs', () => {
  const rng = createRng('HX-1');
  assert.throws(() => rng.pick([]), /empty/i);
  assert.throws(() => rng.chance(1.1), /0\.\.1/);
  assert.throws(() => rng.int(5, 2), /min/i);
});
