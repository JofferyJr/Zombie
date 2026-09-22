function overlaps(x, y, rect, radius = 12) {
  return x + radius > rect.x && x - radius < rect.x + rect.width && y + radius > rect.y && y - radius < rect.y + rect.height;
}

export function updateLocalSimulation(state, input, dtSeconds) {
  if (state.flags?.tacticalPaused) return state;
  const speed = input.sprint && state.player.stamina > 0 ? 150 : 92;
  let dx = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  let dy = (input.down ? 1 : 0) - (input.up ? 1 : 0);
  if (dx && dy) { const n = Math.SQRT1_2; dx *= n; dy *= n; }
  const map = input.map ?? { width: 1600, height: 1200, collisions: [] };
  const nextX = Math.max(16, Math.min(map.width - 16, state.player.x + dx * speed * dtSeconds));
  const nextY = Math.max(16, Math.min(map.height - 16, state.player.y + dy * speed * dtSeconds));
  if (!(map.collisions ?? []).some(r => overlaps(nextX, state.player.y, r))) state.player.x = nextX;
  if (!(map.collisions ?? []).some(r => overlaps(state.player.x, nextY, r))) state.player.y = nextY;
  if (input.sprint && (dx || dy)) state.player.stamina = Math.max(0, state.player.stamina - 9 * dtSeconds);
  else state.player.stamina = Math.min(100, state.player.stamina + 4 * dtSeconds);
  state.player.hunger = Math.min(100, (state.player.hunger ?? 0) + 0.002 * dtSeconds);
  state.player.thirst = Math.min(100, (state.player.thirst ?? 0) + 0.004 * dtSeconds);
  return state;
}
