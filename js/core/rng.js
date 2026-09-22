function hashString32(value) {
  let h = 2166136261 >>> 0;
  for (const ch of String(value)) {
    h ^= ch.codePointAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createRng(seed) {
  const nextRaw = mulberry32(hashString32(seed));
  return {
    next: () => nextRaw(),
    int(min, max) {
      if (!Number.isInteger(min) || !Number.isInteger(max) || min > max) throw new Error('int requires integer min <= max');
      return Math.floor(nextRaw() * (max - min + 1)) + min;
    },
    pick(array) {
      if (!Array.isArray(array) || array.length === 0) throw new Error('Cannot pick from empty array');
      return array[Math.floor(nextRaw() * array.length)];
    },
    chance(probability) {
      if (probability < 0 || probability > 1) throw new Error('chance probability must be within 0..1');
      return nextRaw() < probability;
    },
  };
}
