import { createRng } from '../core/rng.js';
import { advanceClock } from '../core/game-clock.js';

const DEFAULT_VAN = { id:'utility-van', seats:5, cargo:20, fuelCapacity:55, fuelUsePerKm:.12, speed:150, noise:45, reliability:.82, offRoadAbility:.4 };
const ROUTES = new Map([
  ['northern-suburbs:railway-district', 14],
  ['railway-district:northern-suburbs', 14],
]);

export function spawnVehicle({ id, typeId, x, y, seed, type = DEFAULT_VAN }) {
  const rng = createRng(`${seed}:vehicle:${id}`);
  return { id, typeId, x, y, currentDistrictId:'northern-suburbs', fuel:type.fuelCapacity, fuelCapacity:type.fuelCapacity, fuelUsePerKm:type.fuelUsePerKm, speed:type.speed, noise:type.noise, condition:rng.int(84,96), reliability:type.reliability, offRoadAbility:type.offRoadAbility, seats:type.seats, cargoCapacity:type.cargo, cargo:[], occupants:[] };
}

export function enterVehicle(state, vehicleId, actorId) {
  const vehicle = state.vehicles[vehicleId]; if (!vehicle) throw new Error('Vehicle not found');
  if (actorId === 'player') {
    if (state.player.vehicleId === vehicleId) { state.player.vehicleId = null; vehicle.occupants = vehicle.occupants.filter(id=>id!=='player'); return state; }
    state.player.vehicleId = vehicleId; state.player.x = vehicle.x; state.player.y = vehicle.y;
  }
  if (!vehicle.occupants.includes(actorId)) vehicle.occupants.push(actorId);
  return state;
}

export function driveVehicle(state, vehicleId, input, dtSeconds) {
  const v=state.vehicles[vehicleId]; if(!v) throw new Error('Vehicle not found');
  if(v.fuel<=0) return state;
  let dx=(input.right?1:0)-(input.left?1:0), dy=(input.down?1:0)-(input.up?1:0);
  if(dx&&dy){dx*=Math.SQRT1_2;dy*=Math.SQRT1_2;}
  const distancePx=Math.hypot(dx,dy)*v.speed*dtSeconds;
  v.x=Math.max(16,Math.min(1584,v.x+dx*v.speed*dtSeconds)); v.y=Math.max(16,Math.min(1184,v.y+dy*v.speed*dtSeconds));
  v.fuel=Math.max(0,v.fuel-(distancePx/1000)*v.fuelUsePerKm);
  if(state.player.vehicleId===vehicleId){state.player.x=v.x;state.player.y=v.y;}
  return state;
}

export function travelToDistrict(state, vehicleId, targetDistrictId) {
  const v=state.vehicles[vehicleId]; if(!v) throw new Error('Vehicle not found');
  const routeId=`${state.world.districtId}:${targetDistrictId}`; const km=ROUTES.get(routeId);
  if(!km) throw new Error('No known route');
  const needed=km*v.fuelUsePerKm; if(v.fuel+1e-9<needed) throw new Error('Not enough fuel for district travel');
  v.fuel-=needed;
  if((state.world.blockedRoutes??[]).includes(routeId)) v.condition=Math.max(0,v.condition-5);
  v.currentDistrictId=targetDistrictId; v.x=targetDistrictId==='railway-district'?180:1420; v.y=600;
  state.world.districtId=targetDistrictId; state.player.x=v.x; state.player.y=v.y;
  advanceClock(state, Math.max(15,Math.round(km/40*60)));
  return state;
}
