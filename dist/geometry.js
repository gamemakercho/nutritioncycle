import {CONFIG as C} from './config.js';
import {BIKE_MANIFEST} from './bike-manifest.js';
// Manifest hubs remain fixed across all pedal frames, poses and nutrition states.
export function wheelGeometry(){
 const m=BIKE_MANIFEST,s=C.bike.pack.scale,rearSupport=m.wheels.rearWheel.radius*s,frontSupport=m.wheels.frontWheel.radius*s;
 const originX=C.bike.pickup.x-m.world.frontAxle[0]*s,originY=C.bike.groundDY-m.world.groundY*s;
 return {ground:C.bike.groundDY,originX,originY,rearX:originX+m.world.rearAxle[0]*s,frontX:originX+m.world.frontAxle[0]*s,rearY:originY+m.world.rearAxle[1]*s,frontY:originY+m.world.frontAxle[1]*s,rearSupport,frontSupport};
}
