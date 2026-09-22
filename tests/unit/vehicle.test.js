import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnVehicle, enterVehicle, driveVehicle, travelToDistrict } from '../../js/vehicles/vehicle-system.js';

const type={id:'utility-van',seats:5,cargo:20,fuelCapacity:55,fuelUsePerKm:.12,speed:150,noise:45,reliability:.82,offRoadAbility:.4};
function state(){return {player:{id:'player',vehicleId:null,x:100,y:100},vehicles:{},world:{districtId:'northern-suburbs',day:1,minutes:480,blockedRoutes:[]}};}

test('player can enter and locally drive utility van consuming fuel',()=>{
 const s=state(); const v=spawnVehicle({id:'van1',typeId:'utility-van',x:100,y:100,seed:'HX-V',type}); s.vehicles[v.id]=v;
 enterVehicle(s,'van1','player'); assert.equal(s.player.vehicleId,'van1');
 const before=v.fuel; driveVehicle(s,'van1',{right:true},10); assert.ok(v.x>100); assert.ok(v.fuel<before);
});

test('district travel consumes fuel and preserves vehicle while blocked route degrades condition',()=>{
 const s=state(); const v=spawnVehicle({id:'van1',typeId:'utility-van',x:100,y:100,seed:'HX-V',type}); s.vehicles[v.id]=v; enterVehicle(s,'van1','player');
 s.world.blockedRoutes=['northern-suburbs:railway-district']; const before=v.condition;
 travelToDistrict(s,'van1','railway-district');
 assert.equal(s.world.districtId,'railway-district'); assert.equal(s.vehicles.van1.currentDistrictId,'railway-district'); assert.ok(v.condition<before); assert.ok(v.fuel<55);
});

test('district travel is prevented when fuel is zero',()=>{
 const s=state(); const v=spawnVehicle({id:'van1',typeId:'utility-van',x:100,y:100,seed:'HX-V',type}); v.fuel=0; s.vehicles[v.id]=v;
 assert.throws(()=>travelToDistrict(s,'van1','railway-district'),/fuel/i);
 assert.equal(s.world.districtId,'northern-suburbs');
});
