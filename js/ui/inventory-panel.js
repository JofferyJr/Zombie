export function inventoryWeight(inventory, itemCatalog) {
  const map = new Map(itemCatalog.map(i => [i.id, i]));
  return inventory.items.reduce((sum, s) => sum + (map.get(s.itemId)?.weight ?? 0) * s.quantity, 0);
}

export function renderInventoryHtml(inventory, itemCatalog) {
  const map = new Map(itemCatalog.map(i => [i.id, i]));
  const groups = new Map();
  for (const stack of inventory.items) {
    const item = map.get(stack.itemId) ?? { name: stack.itemId, category: 'other' };
    if (!groups.has(item.category)) groups.set(item.category, []);
    groups.get(item.category).push(`<li><span>${item.name ?? item.id ?? stack.itemId}</span><strong>×${stack.quantity}</strong></li>`);
  }
  return `<section class="inventory-panel"><header><h2>Inventory</h2><span>${inventoryWeight(inventory, itemCatalog).toFixed(1)} / ${inventory.weightLimit} kg · ${inventory.items.length}/${inventory.capacity} slots</span></header>${[...groups].map(([category, rows]) => `<h3>${category}</h3><ul>${rows.join('')}</ul>`).join('') || '<p>Empty</p>'}</section>`;
}

export function mountInventoryPanel(root, inventory, itemCatalog) { root.innerHTML = renderInventoryHtml(inventory, itemCatalog); }
