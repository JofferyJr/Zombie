import test from 'node:test';
import assert from 'node:assert/strict';
import { triggerScheduledEvents } from '../../js/quests/radio-system.js';
import { acceptQuest, completeQuestObjective } from '../../js/quests/quest-system.js';
import { startResearch, advanceResearch } from '../../js/research/research-system.js';
import { tickRegionalSimulation } from '../../js/world/regional-sim.js';

function state(day=2,minutes=540){return {
 meta:{seed:'HX-Q'}, world:{day,minutes,weather:'cloudy',lastRegionalTickMinute:0,radioLog:[],threats:{'railway-district':'yellow'},blockedRoutes:[],triggeredEvents:{}},
 player:{communityId:'player-community'}, inventory:{items:[]}, shelters:{apt:{id:'apt',storage:[],jobs:{},resources:{}}}, npcs:{}, quests:{}, research:{},
 factions:{'central-restoration-authority':{id:'central-restoration-authority',reputation:0,trust:0,fear:0,favor:0,tradeAccess:20,intelAccess:0}}
};}

test('Day 2 distress radio offers quest and completion rewards CRA reputation plus research note',()=>{
 const s=state(); triggerScheduledEvents(s);
 assert.ok(s.world.radioLog.some(m=>/distress/i.test(m.text)));
 assert.equal(s.quests['distress-north-001'].status,'offered');
 acceptQuest(s,'distress-north-001');
 completeQuestObjective(s,'distress-north-001','reach-signal');
 assert.equal(s.quests['distress-north-001'].status,'completed');
 assert.equal(s.factions['central-restoration-authority'].reputation,5);
 assert.ok(s.shelters.apt.storage.some(x=>x.itemId==='research-note'));
});

test('infection research requires note and unlocks after 360 in-game minutes',()=>{
 const s=state(); assert.throws(()=>startResearch(s,'infection-observation-1'),/research note/i);
 s.shelters.apt.storage.push({itemId:'research-note',quantity:1}); startResearch(s,'infection-observation-1');
 advanceResearch(s,359); assert.notEqual(s.research.infectionObservationUnlocked,true);
 advanceResearch(s,1); assert.equal(s.research.infectionObservationUnlocked,true);
});

test('regional tick triggers scheduled railway horde world change',()=>{
 const s=state(3,600); tickRegionalSimulation(s,30);
 assert.equal(s.world.threats['railway-district'],'orange');
 assert.ok(s.world.blockedRoutes.includes('railway-district:freight-logistics-park'));
 assert.ok(s.world.radioLog.some(m=>/horde/i.test(m.text)));
});
