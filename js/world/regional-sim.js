import { createRng } from '../core/rng.js';
import { applyShelterJobs } from '../npc/jobs.js';
import { triggerScheduledEvents } from '../quests/radio-system.js';
import { advanceResearch } from '../research/research-system.js';
const WEATHER = ['clear', 'cloudy', 'rain', 'fog'];

function absoluteMinute(world) { return (world.day - 1) * 1440 + world.minutes; }

export function tickRegionalSimulation(state, elapsedMinutes) {
  if (elapsedMinutes < 30) return state;
  const now = absoluteMinute(state.world);
  if (now <= (state.world.lastRegionalTickMinute ?? -1)) return state;
  state.world.lastRegionalTickMinute = now;
  for (const shelterId of Object.keys(state.shelters ?? {})) applyShelterJobs(state, shelterId);
  triggerScheduledEvents(state);
  advanceResearch(state, elapsedMinutes);
  if (state.world.minutes % 180 === 0) {
    const period = Math.floor(now / 180);
    state.world.weather = createRng(`${state.meta.seed}:weather:${period}`).pick(WEATHER);
  }
  return state;
}
