import { createRng } from '../core/rng.js';
import { computeAwareness } from '../combat/detection.js';

export function spawnDistrictInfected({ districtId, day, seed, catalog }) {
  const eligible = catalog.filter(type => (type.evolutionDay ?? 1) <= day);
  if (!eligible.length) return [];
  const rng = createRng(`${seed}:${districtId}:infected:day${day}`);
  const count = districtId === 'railway-district' ? 4 : 2;
  return Array.from({ length: count }, (_, index) => {
    const type = rng.pick(eligible);
    return { id: `${districtId}-infected-${day}-${index}`, typeId: type.id, health: type.health, speed: type.speed, awareness: type.awareness, noiseSensitivity: type.noiseSensitivity, threatValue: type.threatValue, x: rng.int(120, 1480), y: rng.int(120, 1080), awarenessState: 'unaware', lastKnownNoisePosition: null };
  });
}

export function updateInfected(zombie, player, dtSeconds, { noise = 0, light = 1 } = {}) {
  const distance = Math.hypot(player.x - zombie.x, player.y - zombie.y);
  const visible = distance < 160;
  zombie.awarenessState = computeAwareness({ observer: zombie, target: { ...player, visible }, noise, light });
  if (zombie.awarenessState === 'investigating' || zombie.awarenessState === 'alerted') zombie.lastKnownNoisePosition = { x: player.x, y: player.y };
  const target = zombie.awarenessState === 'pursuing' ? player : zombie.lastKnownNoisePosition;
  if (target && ['investigating','alerted','pursuing'].includes(zombie.awarenessState)) {
    const dx = target.x - zombie.x, dy = target.y - zombie.y, len = Math.hypot(dx, dy) || 1;
    zombie.x += dx / len * zombie.speed * dtSeconds;
    zombie.y += dy / len * zombie.speed * dtSeconds;
  }
  return zombie;
}
