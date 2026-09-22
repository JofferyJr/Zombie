import test from 'node:test';
import assert from 'node:assert/strict';
import { generateContainerLoot, addItem, takeFromContainer } from '../../js/world/loot-system.js';
import { renderInventoryHtml } from '../../js/ui/inventory-panel.js';

const items = [
  { id: 'water', category:'food', weight: .5, stackSize: 4, baseValue: 6 },
  { id: 'scrap', category:'materials', weight: 1, stackSize: 8, baseValue: 4 },
];

test('container loot is deterministic by container id and seed', () => {
  const a = generateContainerLoot({ containerId:'c1', lootProfile:'suburban-store', seed:'HX-1', items });
  const b = generateContainerLoot({ containerId:'c1', lootProfile:'suburban-store', seed:'HX-1', items });
  assert.deepEqual(a,b);
});

test('addItem merges stacks and rejects capacity or weight overflow', () => {
  let inventory = { capacity:2, weightLimit:3, items:[{ itemId:'water', quantity:2 }] };
  let result = addItem(inventory, { itemId:'water', quantity:2 }, items);
  assert.equal(result.inventory.items[0].quantity, 4);
  assert.equal(result.remainder, 0);
  result = addItem(result.inventory, { itemId:'scrap', quantity:4 }, items);
  assert.equal(result.remainder, 3);
});

test('taken container loot stays changed after serialization', () => {
  const state = { inventory:{capacity:4,weightLimit:20,items:[]}, world:{containers:{c1:{items:[{itemId:'water',quantity:2}]}}} };
  takeFromContainer(state,'c1','water',1,items);
  const restored = JSON.parse(JSON.stringify(state));
  assert.equal(restored.world.containers.c1.items[0].quantity,1);
  assert.equal(restored.inventory.items[0].quantity,1);
});

test('inventory renderer groups status with weight total', () => {
  const html = renderInventoryHtml({ capacity:4,weightLimit:20,items:[{itemId:'water',quantity:2}] }, items);
  assert.match(html,/water/i);
  assert.match(html,/1\.0 \/ 20/);
});
