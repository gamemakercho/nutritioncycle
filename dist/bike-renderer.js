import {CONFIG as C} from './config.js';
import {BIKE_MANIFEST} from './bike-manifest.js';
import {clamp,poseFor} from './model.js';

// The supplied renderer.js's two-axle similarity transform is reused verbatim.
export function frameTransform(frame,world){
 const sx=frame.frontAxle[0]-frame.rearAxle[0],sy=frame.frontAxle[1]-frame.rearAxle[1];
 const tx=world.frontAxle[0]-world.rearAxle[0],ty=world.frontAxle[1]-world.rearAxle[1];
 const scale=Math.hypot(tx,ty)/Math.hypot(sx,sy),angle=Math.atan2(ty,tx)-Math.atan2(sy,sx);
 const a=Math.cos(angle)*scale,b=Math.sin(angle)*scale,c=-b,d=a;
 return [a,b,c,d,world.rearAxle[0]-a*frame.rearAxle[0]-c*frame.rearAxle[1],world.rearAxle[1]-b*frame.rearAxle[0]-d*frame.rearAxle[1]];
}
export function pedalFps(kmh,fast){if(kmh<=0)return 0;return fast?clamp(12+(kmh-70)*.13,12,16):3+kmh*.1;}
export function wheelRadiusAt(kind,angle,state,rotation,manifest=BIKE_MANIFEST){
 const r=manifest.wheels[kind].radius;if(kind==='frontWheel')return r*(1-.12*state.H*(1-Math.sin(angle)));
 const excess=state.proportions.map((p,i)=>p-state.weights[i]),dominant=excess.indexOf(Math.max(...excess));
 const phase=angle-(C.bike.pack.foodAngles[dominant]+rotation);
 const wave=state.I*(.18*Math.cos(phase)+.05*Math.cos(phase*3))+.03*state.K*Math.sin((angle-rotation)*6);
 return r*(1+wave*(1-Math.sin(angle))*.6);
}
function mappedTexture(image,wheel){
 const canvas=document.createElement('canvas');canvas.width=352;canvas.height=352;const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
 const scale=160/wheel.nativeRadius;ctx.drawImage(image,176-wheel.pivot[0]*scale,176-wheel.pivot[1]*scale,image.width*scale,image.height*scale);
 return {image:canvas,pivot:[176,176],nativeRadius:160};
}
function frontStructure(texture){
 const canvas=document.createElement('canvas');canvas.width=352;canvas.height=352;const ctx=canvas.getContext('2d');ctx.drawImage(texture.image,0,0);const pixels=ctx.getImageData(0,0,352,352),d=pixels.data;
 // Keep the PNG tyre/spokes/hub. Its cyan water is replaced at render time by
 // the current hydration height; the original PNG remains byte-for-byte intact.
 for(let y=0;y<352;y++)for(let x=0;x<352;x++){const r=Math.hypot(x-176,y-176);if(r<22||r>138)continue;const i=(y*352+x)*4,red=d[i],green=d[i+1],blue=d[i+2];if((blue>=130&&blue-red>45&&green-red>28)||(red>180&&green>180&&blue>180))d[i+3]=0;}
 ctx.putImageData(pixels,0,0);return {...texture,image:canvas};
}
export class FoodBikeRenderer{
 constructor(manifest,images){this.manifest=manifest;this.images=images;this.textures={rearWheel:mappedTexture(images.rearWheel,manifest.wheels.rearWheel),frontWheel:frontStructure(mappedTexture(images.frontWheel,manifest.wheels.frontWheel))};this.reset();}
 reset(){this.speedKmh=0;this.fast=false;this.distance=0;this.pedalPhase=0;this.poseMix=0;}
 update(displayedSpeedKmh,dt,traveledPixels=0){this.speedKmh=Math.round(Math.max(0,displayedSpeedKmh));this.fast=poseFor(this.fast,this.speedKmh);dt=Math.max(0,dt);this.distance+=Number.isFinite(traveledPixels)?Math.max(0,traveledPixels):0;this.pedalPhase=(this.pedalPhase+pedalFps(this.speedKmh,this.fast)*dt/4)%1;const target=Number(this.fast),step=dt/C.poseTransition;this.poseMix+=clamp(target-this.poseMix,-step,step);}
 get phase(){return Math.floor(this.pedalPhase*4)%4;}
 get frame(){const ids=this.fast?this.manifest.animations.fast:this.manifest.animations.normal;return this.manifest.frames[ids[this.phase]];}
 wheelAngles(){return {rear:this.distance/this.manifest.wheels.rearWheel.radius,front:this.distance/this.manifest.wheels.frontWheel.radius};}
 drawWater(ctx,state){const r=this.manifest.wheels.frontWheel.radius*.8,y=r*(1-2*clamp(state.water,0,100));ctx.save();ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.clip();if(state.water>0){ctx.fillStyle='#25c7eb';ctx.fillRect(-r,y,r*2,r*2);ctx.fillStyle='#0d9dd7';ctx.fillRect(-r,Math.max(y,r*.4),r*2,r*2);ctx.strokeStyle='#e5fcff';ctx.lineWidth=2;ctx.beginPath();for(let i=0;i<=16;i++){const x=-r+i*r/8,yy=y+Math.sin(i*.7+this.distance/80)*1.4;i?ctx.lineTo(x,yy):ctx.moveTo(x,yy);}ctx.stroke();for(const [x,bubbleY,br] of [[-18,28,5],[15,39,3],[27,9,3]]){if(bubbleY>y+br){ctx.beginPath();ctx.arc(x,bubbleY,br,0,Math.PI*2);ctx.fillStyle='#b6effb';ctx.fill();}}}ctx.restore();}
 drawWheel(ctx,kind,state){const wheel=this.manifest.wheels[kind],texture=this.textures[kind],rotation=this.distance/wheel.radius;ctx.save();ctx.translate(...wheel.center);ctx.imageSmoothingEnabled=false;if(kind==='frontWheel')this.drawWater(ctx,state);else ctx.globalAlpha=.75+.25*state.F;
  const paint=()=>{ctx.rotate(rotation);ctx.scale(wheel.radius/texture.nativeRadius,wheel.radius/texture.nativeRadius);ctx.drawImage(texture.image,-texture.pivot[0],-texture.pivot[1]);};
  const deform=kind==='rearWheel'?state.I>1e-4||state.K:state.H>1e-4;
  if(!deform)paint();else for(let i=0;i<C.bike.pack.deformSegments;i++){const a0=i*Math.PI*2/C.bike.pack.deformSegments-.003,a1=(i+1)*Math.PI*2/C.bike.pack.deformSegments+.003,r0=wheelRadiusAt(kind,a0,state,rotation,this.manifest),r1=wheelRadiusAt(kind,a1,state,rotation,this.manifest),sx1=Math.cos(a0)*wheel.radius,sy1=Math.sin(a0)*wheel.radius,sx2=Math.cos(a1)*wheel.radius,sy2=Math.sin(a1)*wheel.radius,dx1=Math.cos(a0)*r0,dy1=Math.sin(a0)*r0,dx2=Math.cos(a1)*r1,dy2=Math.sin(a1)*r1,det=sx1*sy2-sx2*sy1;ctx.save();ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(dx1,dy1);ctx.lineTo(dx2,dy2);ctx.closePath();ctx.clip();ctx.transform((dx1*sy2-dx2*sy1)/det,(dy1*sy2-dy2*sy1)/det,(sx1*dx2-sx2*dx1)/det,(sx1*dy2-sx2*dy1)/det,0,0);paint();ctx.restore();}
  if(kind==='frontWheel'&&state.water<C.waterLow){ctx.beginPath();ctx.arc(0,0,wheel.radius+4,0,Math.PI*2);ctx.strokeStyle='#f0b577';ctx.lineWidth=3;ctx.stroke();}ctx.restore();}
 drawFrame(ctx,pose,alpha){if(alpha<.001)return;const frame=this.manifest.frames[this.manifest.animations[pose][this.phase]],r=frame.sourceRect;ctx.save();ctx.globalAlpha=alpha;ctx.imageSmoothingEnabled=false;ctx.transform(...frameTransform(frame,this.manifest.world));ctx.drawImage(this.images.riderFrame,r[0],r[1],r[2],r[3],0,0,r[2],r[3]);ctx.restore();}
 draw(ctx,x,y,scale,state){ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);this.drawWheel(ctx,'rearWheel',state);this.drawWheel(ctx,'frontWheel',state);this.drawFrame(ctx,'normal',1-this.poseMix);this.drawFrame(ctx,'fast',this.poseMix);ctx.restore();}
}
