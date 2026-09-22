import test from 'node:test';
import assert from 'node:assert/strict';
import { saveGame, loadGame, listSaves } from '../../js/save/save-db.js';
import { exportSave, importSave, suggestSaveFilename } from '../../js/save/save-transfer.js';

function memoryAdapter(){const map=new Map();return {async put(record){map.set(record.slotId,structuredClone(record));},async get(id){return structuredClone(map.get(id)??null);},async list(){return [...map.values()].map(value=>structuredClone(value));}};}
function richState(){return {meta:{version:1,seed:'HX-SAVE',difficulty:'survival'},world:{day:4,minutes:600,districtId:'railway-district',containers:{c1:{looted:true,items:[]}}},player:{name:'Lin Wei'},inventory:{items:[]},shelters:{apt:{storage:[{itemId:'water',quantity:2}]}},npcs:{n1:{recruited:true}},zombies:{},vehicles:{v1:{fuel:22}},factions:{cra:{reputation:7}},quests:{q1:{status:'active'}},research:{infectionObservationUnlocked:true},flags:{tacticalPaused:false}};}

test('save adapter round-trips full vertical-slice state unchanged',async()=>{
 const adapter=memoryAdapter(), state=richState(); await saveGame('slot-1',state,{adapter}); const loaded=await loadGame('slot-1',{adapter}); assert.deepEqual(loaded,state);
 const list=await listSaves({adapter}); assert.equal(list.length,1); assert.equal(list[0].playerName,'Lin Wei'); assert.equal(list[0].districtId,'railway-district');
});

test('import rejects malformed, missing, and future-version payloads',async()=>{
 await assert.rejects(()=>importSave('{oops'),/valid JSON/i);
 await assert.rejects(()=>importSave(JSON.stringify({world:{}})),/version/i);
 await assert.rejects(()=>importSave(JSON.stringify({...richState(),meta:{version:99}})),/unsupported/i);
});

test('export/import valid version-1 hxs state and filename',async()=>{
 const state=richState(); const blob=exportSave(state); assert.equal(blob.type,'application/json'); const restored=await importSave(blob); assert.deepEqual(restored,state);
 assert.equal(suggestSaveFilename(state),'Moshi_Huaxia_Lin_Wei_Day4.hxs');
});
