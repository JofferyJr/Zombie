export function advanceClock(state, minutes) {
  if (!Number.isFinite(minutes) || minutes < 0) throw new Error('minutes must be non-negative');
  const total = state.world.minutes + minutes;
  const days = Math.floor(total / 1440);
  state.world.minutes = Math.floor(total % 1440);
  state.world.day += days;
  return state;
}

export function formatGameTime(minutes) {
  const hour = Math.floor(minutes / 60) % 24;
  const minute = Math.floor(minutes % 60);
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}
