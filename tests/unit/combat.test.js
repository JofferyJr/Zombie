import test from 'node:test';
import assert from 'node:assert/strict';
import { computeAwareness } from '../../js/combat/detection.js';
import { resolveAttack } from '../../js/combat/combat-system.js';
import { toggleTacticalMode, queueTacticalOrder } from '../../js/combat/tactical-mode.js';
import { spawnDistrictInfected } from '../../js/zombies/zombie-system.js';
import { createRng } from '../../js/core/rng.js';

const catalog = [
  {id:'walker',evolutionDay:1,health:45,speed:28,awareness:40,noiseSensitivity:1,threatValue:1},
  {id:'runner',evolutionDay:1,health:35,speed:55,awareness:50,noiseSensitivity:1.2,threatValue:2},
  {id:'heavy',evolutionDay:8,health:100,speed:20,awareness:35,noiseSensitivity:.8,threatValue:4},
];

test('awareness progresses from unaware to pursuing with stronger cues', () => {
  const observer = { awareness: 40, x:0, y:0 };
  assert.equal(computeAwareness({observer,target:{x:200,y:0,visible:false},noise:0,light:.2}), 'unaware');
  assert.equal(computeAwareness({observer,target:{x:80,y:0,visible:false},noise:30,light:.2}), 'investigating');
  assert.equal(computeAwareness({observer,target:{x:25,y:0,visible:true},noise:50,light:1}), 'pursuing');
});

test('attack resolution is deterministic and charges stamina', () => {
  const weapon = {accuracy:.75,damage:20,noise:10,staminaCost:12};
  const a = resolveAttack({attacker:{stamina:50,skill:.1},target:{health:60},weapon,rng:createRng('A')});
  const b = resolveAttack({attacker:{stamina:50,skill:.1},target:{health:60},weapon,rng:createRng('A')});
  assert.deepEqual(a,b);
  assert.equal(a.attackerStamina,38);
});

test('tactical mode toggles pause and queues move order', () => {
  const state = {flags:{tacticalPaused:false},tactical:{orders:[]}};
  toggleTacticalMode(state,true);
  assert.equal(state.flags.tacticalPaused,true);
  queueTacticalOrder(state,'player',{type:'move',x:90,y:80});
  assert.equal(state.tactical.orders.length,1);
});

test('infected evolution excludes heavy before day 8 and allows it from day 8', () => {
  const early = spawnDistrictInfected({districtId:'northern-suburbs',day:7,seed:'HX-Z',catalog});
  assert.ok(early.every(z => z.typeId !== 'heavy'));
  const lateTypes = new Set();
  for (let i=0;i<20;i++) for (const z of spawnDistrictInfected({districtId:'railway-district',day:8,seed:`HX-Z-${i}`,catalog})) lateTypes.add(z.typeId);
  assert.ok(lateTypes.has('heavy'));
});
