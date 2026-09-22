import { createRng } from '../core/rng.js';

export function createLocalMap(districtId, seed) {
  if (districtId !== 'northern-suburbs' && districtId !== 'railway-district') {
    return { id: districtId, width: 1600, height: 1200, roads: [], buildings: [], collisions: [], containers: [], exits: [] };
  }
  const rng = createRng(`${seed}:${districtId}:local`);
  const prefix = `${districtId}-${rng.int(1000, 9999)}`;
  const templates = districtId === 'northern-suburbs' ? [
    ['clinic', 220, 180, 250, 180, false, 'suburban-medical'],
    ['convenience-store', 610, 180, 220, 170, false, 'suburban-store'],
    ['apartment', 1040, 150, 330, 280, true, 'suburban-residential'],
    ['house', 240, 700, 230, 180, true, 'suburban-residential'],
    ['workshop', 650, 690, 260, 190, true, 'suburban-industrial'],
    ['warehouse', 1080, 700, 300, 210, true, 'suburban-warehouse'],
  ] : [
    ['station', 220, 170, 430, 260, false, 'transit'], ['warehouse', 800, 190, 300, 220, true, 'transit'],
    ['checkpoint', 1220, 220, 180, 160, false, 'transit'], ['shop', 280, 720, 220, 180, true, 'commercial'],
    ['depot', 690, 690, 330, 210, true, 'transit'], ['tenement', 1150, 670, 270, 230, true, 'residential'],
  ];
  const buildings = templates.map(([kind, x, y, width, height, claimable, lootProfile], index) => ({ id: `${prefix}-building-${index}`, kind, x, y, width, height, claimable, lootProfile }));
  const containers = buildings.map((b, index) => ({ id: `${prefix}-container-${index}`, buildingId: b.id, x: b.x + 36, y: b.y + 36, lootProfile: b.lootProfile }));
  return {
    id: districtId,
    width: 1600, height: 1200,
    roads: [{ x: 0, y: 510, width: 1600, height: 170 }, { x: 520, y: 0, width: 150, height: 1200 }],
    buildings,
    collisions: buildings.map(({ x, y, width, height }) => ({ x, y, width, height })),
    containers,
    exits: [{ id: `${prefix}-exit-east`, x: 1530, y: 575, targetDistrictId: districtId === 'northern-suburbs' ? 'railway-district' : 'northern-suburbs' }],
  };
}

export function drawLocalMap(ctx, map, state) {
  const canvas = ctx.canvas;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const scaleX = canvas.width / map.width, scaleY = canvas.height / map.height;
  ctx.fillStyle = '#182126'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#2b3438'; for (const r of map.roads) ctx.fillRect(r.x * scaleX, r.y * scaleY, r.width * scaleX, r.height * scaleY);
  for (const b of map.buildings) {
    ctx.fillStyle = b.claimable ? '#37464a' : '#303b3f'; ctx.fillRect(b.x * scaleX, b.y * scaleY, b.width * scaleX, b.height * scaleY);
    ctx.fillStyle = '#d9e0e2'; ctx.font = '12px sans-serif'; ctx.fillText(b.kind, (b.x + 8) * scaleX, (b.y + 18) * scaleY);
  }
  for (const vehicle of Object.values(state.vehicles ?? {})) {
    if (vehicle.currentDistrictId !== state.world.districtId) continue;
    ctx.fillStyle = state.player.vehicleId === vehicle.id ? '#d1b06b' : '#7f8c92';
    ctx.fillRect((vehicle.x-13)*scaleX,(vehicle.y-8)*scaleY,26*scaleX,16*scaleY);
  }
  for (const npc of Object.values(state.npcs ?? {})) {
    if (npc.districtId && npc.districtId !== state.world.districtId) continue;
    ctx.beginPath(); ctx.arc(npc.x * scaleX, npc.y * scaleY, 7, 0, Math.PI * 2); ctx.fillStyle = npc.recruited ? '#75a8b5' : '#c7aa73'; ctx.fill();
  }
  for (const zombie of Object.values(state.zombies ?? {})) {
    if (zombie.districtId && zombie.districtId !== state.world.districtId) continue;
    ctx.beginPath(); ctx.arc(zombie.x * scaleX, zombie.y * scaleY, 7, 0, Math.PI * 2); ctx.fillStyle = zombie.awarenessState === 'pursuing' ? '#b45b57' : '#6d7b68'; ctx.fill();
  }
  ctx.beginPath(); ctx.arc(state.player.x * scaleX, state.player.y * scaleY, 8, 0, Math.PI * 2); ctx.fillStyle = '#e8ecee'; ctx.fill();
}
