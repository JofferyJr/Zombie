export function toggleTacticalMode(state, enabled = !state.flags.tacticalPaused) {
  state.flags.tacticalPaused = Boolean(enabled);
  state.tactical ??= { selectedActorId: 'player', orders: [] };
  return state;
}

export function queueTacticalOrder(state, actorId, order) {
  state.tactical ??= { selectedActorId: actorId, orders: [] };
  state.tactical.orders.push({ actorId, ...order });
  return state;
}

export function executeQueuedOrders(state) {
  const orders = state.tactical?.orders ?? [];
  for (const order of orders) {
    const actor = order.actorId === 'player' ? state.player : state.npcs?.[order.actorId];
    if (!actor) continue;
    if (order.type === 'move') { actor.x = order.x; actor.y = order.y; }
  }
  if (state.tactical) state.tactical.orders = [];
  return state;
}
