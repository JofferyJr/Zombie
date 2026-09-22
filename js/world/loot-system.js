import { createRng } from '../core/rng.js';

function catalogMap(items) { return new Map(items.map(item => [item.id, item])); }
function cloneInventory(inventory) { return { ...inventory, items: inventory.items.map(s => ({ ...s })) }; }
function weightOf(inventory, map) { return inventory.items.reduce((sum, s) => sum + (map.get(s.itemId)?.weight ?? 0) * s.quantity, 0); }

export function generateContainerLoot({ containerId, lootProfile, seed, items }) {
  if (!items.length) return [];
  const rng = createRng(`${seed}:${containerId}:${lootProfile}`);
  const count = Math.min(items.length, rng.int(1, Math.min(3, items.length)));
  const pool = [...items];
  const stacks = [];
  for (let i = 0; i < count; i++) {
    const index = rng.int(0, pool.length - 1);
    const item = pool.splice(index, 1)[0];
    stacks.push({ itemId: item.id, quantity: rng.int(1, Math.min(item.stackSize ?? 1, 3)) });
  }
  return stacks;
}

export function addItem(inventory, stack, itemCatalog) {
  const map = catalogMap(itemCatalog);
  const item = map.get(stack.itemId);
  if (!item) throw new Error(`Unknown item: ${stack.itemId}`);
  const next = cloneInventory(inventory);
  let remaining = Math.max(0, Math.floor(stack.quantity));
  let weight = weightOf(next, map);
  for (const existing of next.items.filter(x => x.itemId === stack.itemId)) {
    while (remaining > 0 && existing.quantity < item.stackSize && weight + item.weight <= next.weightLimit + 1e-9) {
      existing.quantity++; remaining--; weight += item.weight;
    }
  }
  while (remaining > 0 && next.items.length < next.capacity) {
    const roomByWeight = Math.floor((next.weightLimit - weight + 1e-9) / item.weight);
    const quantity = Math.min(remaining, item.stackSize, roomByWeight);
    if (quantity <= 0) break;
    next.items.push({ itemId: item.id, quantity });
    remaining -= quantity; weight += quantity * item.weight;
  }
  return { inventory: next, remainder: remaining };
}

export function takeFromContainer(state, containerId, itemId, quantity, itemCatalog) {
  const container = state.world.containers?.[containerId];
  if (!container) throw new Error('Container not found');
  const source = container.items.find(s => s.itemId === itemId);
  if (!source || source.quantity <= 0) return state;
  const requested = Math.min(source.quantity, Math.max(0, Math.floor(quantity)));
  const result = addItem(state.inventory, { itemId, quantity: requested }, itemCatalog);
  const moved = requested - result.remainder;
  state.inventory = result.inventory;
  source.quantity -= moved;
  container.items = container.items.filter(s => s.quantity > 0);
  container.looted = container.items.length === 0;
  return state;
}
