import test from 'node:test';
import assert from 'node:assert/strict';
import { createSurvivor, recruitSurvivor } from '../../js/npc/survivor-system.js';
import { assignJob, applyShelterJobs } from '../../js/npc/jobs.js';
import { claimShelter, depositToShelter } from '../../js/shelter/shelter-system.js';
import { renderShelterHtml } from '../../js/ui/shelter-panel.js';

function baseState() {
  return {
    meta:{seed:'HX-S'}, player:{communityId:'player-community'},
    inventory:{items:[{itemId:'bottled-water',quantity:2}]},
    world:{localBuildings:{apt:{id:'apt',kind:'apartment',claimable:true},clinic:{id:'clinic',claimable:false}}},
    npcs:{}, shelters:{}, vehicles:{}
  };
}

test('survivor generation is deterministic and recruitment joins community', () => {
  const a=createSurvivor('HX-S',0), b=createSurvivor('HX-S',0);
  assert.deepEqual(a,b);
  const state=baseState(); state.npcs[a.id]=a; recruitSurvivor(state,a.id);
  assert.equal(state.npcs[a.id].communityId,'player-community');
  assert.equal(state.npcs[a.id].recruited,true);
});

test('claiming validates building and rejects duplicate claim', () => {
  const state=baseState();
  assert.throws(()=>claimShelter(state,'clinic'),/claimable/i);
  claimShelter(state,'apt');
  assert.equal(state.shelters.apt.buildingId,'apt');
  assert.throws(()=>claimShelter(state,'apt'),/already/i);
});

test('jobs validate role and apply guard/mechanic effects', () => {
  const state=baseState(); const npc=createSurvivor('HX-S',1); npc.communityId='player-community'; state.npcs[npc.id]=npc; claimShelter(state,'apt');
  assignJob(state,'apt',npc.id,'guard'); applyShelterJobs(state,'apt');
  assert.ok(state.shelters.apt.security>35);
  assignJob(state,'apt',npc.id,'mechanic'); applyShelterJobs(state,'apt');
  assert.equal(state.shelters.apt.vehicleMaintenanceUnlocked,true);
  assert.throws(()=>assignJob(state,'apt',npc.id,'wizard'),/job/i);
});

test('deposit moves an item stack from inventory to shelter storage', () => {
  const state=baseState(); claimShelter(state,'apt');
  depositToShelter(state,'apt','bottled-water',1);
  assert.equal(state.inventory.items[0].quantity,1);
  assert.equal(state.shelters.apt.storage[0].quantity,1);
});

test('shelter renderer exposes overview people jobs and storage tabs',()=>{
  const state=baseState(); claimShelter(state,'apt');
  const html=renderShelterHtml(state,'apt');
  for(const label of ['Overview','People','Jobs','Storage']) assert.match(html,new RegExp(label));
});
