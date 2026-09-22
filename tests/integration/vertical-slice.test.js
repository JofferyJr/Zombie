import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createInitialGameState } from '../../js/core/game-state.js';
import { generateLeitianWorld } from '../../js/world/world-generator.js';
import { createLocalMap } from '../../js/world/local-map.js';
import { generateContainerLoot, takeFromContainer, addItem } from '../../js/world/loot-system.js';
import { createSurvivor, recruitSurvivor } from '../../js/npc/survivor-system.js';
import { claimShelter, depositToShelter } from '../../js/shelter/shelter-system.js';
import { assignJob } from '../../js/npc/jobs.js';
import { spawnVehicle, enterVehicle, travelToDistrict } from '../../js/vehicles/vehicle-system.js';
import { initializeVerticalSliceFactions } from '../../js/factions/faction-system.js';
import { executeTrade } from '../../js/economy/trade-system.js';
import { tickRegionalSimulation } from '../../js/world/regional-sim.js';
import { saveGame, loadGame } from '../../js/save/save-db.js';
import { exportSave, importSave } from '../../js/save/save-transfer.js';

async function json(name){return JSON.parse(await readFile(new URL(`../../data/${name}.json`,import.meta.url),'utf8'));}
function memoryAdapter(){const map=new Map();return{async put(r){map.set(r.slotId,structuredClone(r));},async get(k){return structuredClone(map.get(k)??null);},async list(){return [...map.values()].map(v=>structuredClone(v));}};}

test('complete Leitian domain loop survives save/export round trips',async()=>{
 const items=await json('items'), vehicles=await json('vehicles'), districts=await json('districts');
 const config={seed:'HX-INTEGRATION',difficulty:'survival',startingDate:'day3',character:{name:'Lin Wei',backgroundId:'civilian'}};
 const state=createInitialGameState(config); state.world.generated=generateLeitianWorld({seed:config.seed,content:{districts}}); initializeVerticalSliceFactions(state,config.seed);
 const map=createLocalMap('northern-suburbs',config.seed,{}); state.world.localBuildings=Object.fromEntries(map.buildings.map(b=>[b.id,b]));
 const container=map.containers[0]; state.world.containers[container.id]={items:generateContainerLoot({containerId:container.id,lootProfile:container.lootProfile,seed:config.seed,items}),looted:false}; const first=state.world.containers[container.id].items[0]; takeFromContainer(state,container.id,first.itemId,1,items); assert.ok(state.inventory.items.length>0);
 const water=items.find(i=>i.id==='bottled-water'); state.inventory=addItem(state.inventory,{itemId:water.id,quantity:2},items).inventory;
 const survivor=createSurvivor(config.seed,0); state.npcs[survivor.id]=survivor; recruitSurvivor(state,survivor.id); assert.equal(survivor.recruited,true);
 const apt=map.buildings.find(b=>b.kind==='apartment'); claimShelter(state,apt.id); assignJob(state,apt.id,survivor.id,'guard'); depositToShelter(state,apt.id,water.id,1); assert.equal(state.shelters[apt.id].storage[0].itemId,water.id);
 const vanType=vehicles[0],van=spawnVehicle({id:'van1',typeId:vanType.id,x:520,y:600,seed:config.seed,type:vanType}); state.vehicles[van.id]=van; enterVehicle(state,van.id,'player'); travelToDistrict(state,van.id,'railway-district'); assert.equal(state.world.districtId,'railway-district');
 const cra=state.factions['central-restoration-authority']; executeTrade(state,{factionId:cra.id,direction:'buy',item:water,quantity:1,offeredValue:999,itemCatalog:items}); assert.ok(state.inventory.items.some(s=>s.itemId===water.id));
 state.world.day=3;state.world.minutes=600;tickRegionalSimulation(state,30);assert.equal(state.world.threats['railway-district'],'orange');
 const adapter=memoryAdapter();await saveGame('slot',state,{adapter});const loaded=await loadGame('slot',{adapter});assert.equal(loaded.world.districtId,'railway-district');
 const imported=await importSave(exportSave(loaded));assert.equal(imported.world.threats['railway-district'],'orange');assert.equal(imported.npcs[survivor.id].recruited,true);
});
