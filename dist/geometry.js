import {CONFIG as C} from './config.js';
// Both wheels support the same road contact plane, including deformation.
export function wheelGeometry(m,spin=0){
 const r=C.bike.rear.r+C.bike.rear.growth*m.F,map=[0,2,1,5,4,3],weights=[3,3,2,1,1.5,1.5];
 const excess=m.proportions.map((p,i)=>p-m.weights[i]);const dominant=excess.indexOf(Math.max(...excess));const dom=map.indexOf(dominant);
 const offsets=[-Math.PI/2];for(const weight of weights)offsets.push(offsets.at(-1)+weight/12*Math.PI*2);
 const domAngle=(offsets[dom]+offsets[dom+1])/2;
 const radius=a=>r*(1+m.I*(.18*Math.cos(a-domAngle)+.075*Math.cos(3*a))+.025*m.K*Math.sin(a*6));
 const outline=Array.from({length:96},(_,i)=>{const a=i/96*Math.PI*2,rr=radius(a)+C.bike.rear.tire;return [Math.cos(a)*rr,Math.sin(a)*rr];});
 const support=Math.max(...outline.map(([x,y])=>Math.round(x/2)*2*Math.sin(spin)+Math.round(y/2)*2*Math.cos(spin)))+C.bike.rear.outlineWidth/2;
 const squash=1-m.H*.1,frontSupport=(Math.round(C.bike.front.r/2)*2+3.5)*squash;
 return {ground:C.bike.groundDY,rearY:C.bike.groundDY-support,frontY:C.bike.groundDY-frontSupport,rearSupport:support,frontSupport,squash,r,map,offsets,radius,outline};
}
