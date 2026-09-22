import { createRng } from '../core/rng.js';

export function generateLeitianWorld({ seed, content }) {
  const districts = (content.districts ?? []).filter(d => d.cityId === 'leitian').map(d => ({ ...d }));
  if (!districts.some(d => d.id === 'northern-suburbs')) throw new Error('Leitian content requires northern-suburbs');
  const rng = createRng(`${seed}:leitian-world`);
  const possibleHomes = districts.filter(d => d.id !== 'northern-suburbs');
  const minorFactionHomeDistrict = rng.pick(possibleHomes.length ? possibleHomes : districts).id;
  const roadCandidates = ['north-rail-secondary', 'steel-river-service', 'freight-riverside-link'];
  const blockedCount = rng.int(0, 2);
  const blockedRoads = [];
  while (blockedRoads.length < blockedCount) {
    const id = rng.pick(roadCandidates);
    if (!blockedRoads.includes(id)) blockedRoads.push(id);
  }
  const lootSeedByDistrict = Object.fromEntries(districts.map(d => [d.id, rng.int(1, 2147483646)]));
  return {
    regionId: 'leizhou', cityId: 'leitian', districts,
    minorFactionSeed: { homeDistrictId: minorFactionHomeDistrict, roll: rng.int(1, 999999) },
    blockedRoads,
    lootSeedByDistrict,
  };
}
