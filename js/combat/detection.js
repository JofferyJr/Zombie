export function computeAwareness({ observer, target, noise = 0, light = 1 }) {
  const distance = Math.hypot((target.x ?? 0) - (observer.x ?? 0), (target.y ?? 0) - (observer.y ?? 0));
  const sense = observer.awareness ?? 40;
  if (target.visible && distance <= sense + light * 80) return 'pursuing';
  const cue = noise * (observer.noiseSensitivity ?? 1) + Math.max(0, sense - distance) * .5;
  if (cue >= 45) return 'alerted';
  if (cue >= 20) return 'investigating';
  if (cue >= 8) return 'suspicious';
  return 'unaware';
}
