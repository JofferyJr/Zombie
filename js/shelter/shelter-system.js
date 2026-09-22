export function claimShelter(state, buildingId) {
  const building = state.world.localBuildings?.[buildingId];
  if (!building?.claimable) throw new Error('Building is not claimable');
  if (state.shelters[buildingId]) throw new Error('Shelter already claimed');
  state.shelters[buildingId] = {
    id: buildingId, buildingId, name: building.kind === 'apartment' ? 'Northern Apartment Shelter' : `${building.kind} Shelter`,
    security:35, space:18, waterAccess:'limited', power:'offline', storageCapacity:40, beds:8, noise:12, escapeRoutes:2,
    storage:[], rooms:{ sleeping:{slots:8}, storage:{slots:40}, workshop:{slots:1} }, jobs:{},
    resources:{ food:0, water:0, medicine:0, fuel:0, materials:0 }, vehicleMaintenanceUnlocked:false, medicalRecoveryBonus:false,
  };
  return state;
}

export function depositToShelter(state, shelterId, itemId, quantity) {
  const shelter = state.shelters[shelterId];
  if (!shelter) throw new Error('Shelter not found');
  const stack = state.inventory.items.find(s => s.itemId === itemId);
  if (!stack || quantity <= 0) throw new Error('Item not available');
  const moved = Math.min(stack.quantity, Math.floor(quantity));
  let target = shelter.storage.find(s => s.itemId === itemId);
  if (!target) { target = {itemId,quantity:0}; shelter.storage.push(target); }
  target.quantity += moved; stack.quantity -= moved;
  state.inventory.items = state.inventory.items.filter(s => s.quantity > 0);
  return state;
}
