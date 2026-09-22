import test from 'node:test';
import assert from 'node:assert/strict';
import { initializeVerticalSliceFactions, changeFactionRelation } from '../../js/factions/faction-system.js';
import { getTradeQuote, executeTrade } from '../../js/economy/trade-system.js';
import { renderTradeHtml } from '../../js/ui/trade-panel.js';

const water={id:'bottled-water',name:'Bottled Water',baseValue:6,weight:.5,stackSize:4,category:'food'};
function state(){return {meta:{seed:'HX-F'},world:{districtId:'railway-district'},factions:{},inventory:{capacity:10,weightLimit:30,items:[]}};}

test('initializes CRA plus deterministic minor faction with separate relation values',()=>{
 const a=state(),b=state(); initializeVerticalSliceFactions(a,'HX-F'); initializeVerticalSliceFactions(b,'HX-F');
 assert.ok(a.factions['central-restoration-authority']); assert.deepEqual(a.factions,b.factions);
 const minor=Object.values(a.factions).find(f=>f.procedural); assert.ok(minor); assert.equal(typeof minor.reputation,'number'); assert.equal(typeof minor.trust,'number'); assert.equal(typeof minor.fear,'number');
 changeFactionRelation(a,'central-restoration-authority',{reputation:5,trust:2,fear:1}); assert.equal(a.factions['central-restoration-authority'].reputation,5);
});

test('higher trade access lowers markup quote',()=>{
 const market={stock:2,targetStock:5,markup:1.25};
 const low=getTradeQuote({item:water,market,relation:{tradeAccess:0},world:{}});
 const high=getTradeQuote({item:water,market,relation:{tradeAccess:80},world:{}});
 assert.ok(high<low);
});

test('buy trade moves market stock into player inventory',()=>{
 const s=state(); initializeVerticalSliceFactions(s,'HX-F'); const cra=s.factions['central-restoration-authority']; cra.market={stock:{'bottled-water':3}};
 executeTrade(s,{factionId:cra.id,direction:'buy',item:water,quantity:1,offeredValue:100,itemCatalog:[water]});
 assert.equal(s.inventory.items[0].itemId,'bottled-water'); assert.equal(cra.market.stock['bottled-water'],2);
});

test('trade panel shows buy and barter-equivalent value',()=>{
 const s=state(); initializeVerticalSliceFactions(s,'HX-F'); const cra=s.factions['central-restoration-authority']; cra.market={stock:{'bottled-water':3}};
 const html=renderTradeHtml(s,cra.id,[water]); assert.match(html,/Buy Water/i); assert.match(html,/Barter value/i);
});
