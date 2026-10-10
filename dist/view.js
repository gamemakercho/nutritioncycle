import {CONFIG as C} from './config.js';
export function displayMode(expanded,width,height){return {portrait:!expanded,rotated:expanded&&height>width};}
export function viewFor(width,height,portrait){if(!portrait)return {portrait:false,width:C.width,height:C.height};return {portrait:true,width:C.portrait.width,height:C.portrait.width*Math.max(1.35,height/Math.max(1,width))};}
export function roadProjection(view){if(!view.portrait)return {top:310,bottom:676,scale:1};const top=view.height*C.portrait.roadTopRatio,bottom=view.height*C.portrait.roadBottomRatio;return {top,bottom,scale:(bottom-top)/(676-310)};}
export const projectX=(x,view)=>x*view.width/C.width;
export function projectY(y,view){const road=roadProjection(view);return road.top+(y-310)*road.scale;}
export function dragWorldDelta(dx,dy,bounds,portrait,rotated){const width=rotated?bounds.height:bounds.width,height=rotated?bounds.width:bounds.height;const view=viewFor(width||C.width,height||C.height,portrait);return (rotated?-dx:dy)*view.height/Math.max(1,height)/roadProjection(view).scale;}
export function turboTarget(kmh){return kmh<C.turbo.threshold?0:.45+.55*Math.min(1,(kmh-C.turbo.threshold)/(100-C.turbo.threshold));}
export function spaceTarget(kmh,heldSeconds=0,finished=false){return !finished&&kmh>=C.space.threshold&&heldSeconds+1e-9>=C.space.holdSeconds?1:0;}
// Finish motion is presentation only; the saved race result remains authoritative.
export const finishMotionSpeed=g=>g.finishSnapshot?.success?Math.max(100,g.finishSnapshot.finishSpeedKmh):g.displayedSpeedKmh;
export const finishExitOffset=elapsed=>C.finishExitDistance*Math.max(0,Math.min(1,elapsed/C.finishExitDuration));
export function foodAppearance(food,m){if(food.kind==='food'&&m.overfedFoods?.includes(food.id))return {color:'#ed5c55',type:'overfed'};if(food.kind==='snack')return m.snackFull?{color:'#ed5c55',type:'caution'}:{color:'#e4ba45',type:'normal'};if(food.kind==='excessSnack'||food.kind==='spoiled'||food.kind==='overfed')return {color:'#ed5c55',type:'caution'};const needed=food.kind==='water'||food.kind==='food'&&m.counts[food.group]<C.targets[food.group];return needed?{color:'#4cac63',type:'needed'}:{color:'#e4ba45',type:'normal'};}
