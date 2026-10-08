import {CONFIG as C} from './config.js';
import {GROUPS,FOODS} from './foods.js';
export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function metrics(records,water,time,overfeeding={}){
 const recent=records.filter(r=>time-r.time<C.recordWindow-1e-9);const counts=Array(5).fill(0);
 const foodCounts={};let snacks=0;for(const r of recent){if(r.kind==='food'){counts[r.group]++;if(r.foodId)foodCounts[r.foodId]=(foodCounts[r.foodId]||0)+1;}if(r.kind==='snack')snacks++;}
 const N=counts.reduce((a,b)=>a+b,0);const F=counts.reduce((a,c,i)=>a+Math.min(c/C.targets[i],1),0)/5;
 const proportions=counts.map(c=>N?c/N:0),weights=C.targets.map(t=>t/C.targets.reduce((a,b)=>a+b));
 const I=N<5?0:clamp((Math.max(...proportions.map((p,i)=>p-weights[i]))-C.imbalanceAllowance)/C.imbalanceRange,0,1);
 const H=clamp((C.waterLow-water)/C.waterLow,0,1),K=snacks>C.snackFree?1:0;
 const overfedFoods=Object.keys(foodCounts).filter(id=>foodCounts[id]>=C.overfeed.threshold);let protectedNutrition=0;
 for(const [id,entry] of Object.entries(overfeeding)){if(entry.active&&!overfedFoods.includes(id))overfedFoods.push(id);const weight=entry.active?1:clamp((entry.graceUntil-time)/C.overfeed.graceSeconds,0,1);protectedNutrition=Math.max(protectedNutrition,entry.protectedNutrition*weight);}
 return {counts,foodCounts,overfedFoods,protectedNutrition,N,F,I,H,K,snacks,proportions,weights,balanced:F>=.8&&I<.15};
}
export function nutritionMultiplier(m){return .75+.75*m.F-.55*m.I;}
export function desiredSpeed(m,spoiled=false){let M=clamp(Math.max(nutritionMultiplier(m),m.protectedNutrition||0)-.25*m.H-.2*m.K,C.minMultiplier,C.maxMultiplier);if(spoiled)M=Math.max(C.minMultiplier,M*C.spoiledMultiplier);return C.baseSpeed*M;}
export const displayedSpeed=speed=>Math.round(clamp(speed/C.maxInternalSpeed*C.maxDisplaySpeed,0,C.maxDisplaySpeed));
export const poseFor=(fast,kmh)=>fast?kmh>C.fastExit:kmh>=C.fastEnter;
export const itemScrollSpeed=speed=>speed<=0?0:C.itemBaseScrollSpeed+clamp(speed,0,C.maxInternalSpeed)*C.pixelDistanceScale;
export const itemsOverlap=(a,b)=>Math.abs(a.x-b.x)<C.itemGapX-.001&&Math.abs(a.y-b.y)<C.itemGapY-.001;
export function leastGroup(m){if(m.F>=1&&m.I>0)return m.proportions.map((p,i)=>p-m.weights[i]).indexOf(Math.min(...m.proportions.map((p,i)=>p-m.weights[i])));const ratios=m.counts.map((c,i)=>c/C.targets[i]);return ratios.indexOf(Math.min(...ratios));}
export function advice(m,water){if(water<C.waterLow)return '물이 부족해요!';if(m.K)return '단 간식은 잠깐 쉬어 가요!';if(m.N<3)return '다양한 식품을 모아 봐!';if(m.F>=1&&m.I===0)return '균형 좋아요! 물도 챙겨요!';return GROUPS[leastGroup(m)].hint;}
export class Game{
 constructor(seed=12345){this.seed=seed;this.reset();}
 reset(){this.time=0;this.distance=0;this.water=C.waterStart;this.records=[];this.totals=Array(7).fill(0);this.spoiledHits=0;this.overfedHits=0;this.overfeeding={};this.topSpeedHeldSec=0;this.spoiledUntil=0;this.speed=15;this.displayedSpeedKmh=50;this.fast=false;this.y=C.bike.startY;this.targetY=this.y;this.items=[];this.nextSpawn=0;this.nextId=1;this.lastOffered=Array(5).fill(-8);this.lastWater=-6;this.offerCount=0;this.balanceIntegral=0;this.imbalanceIntegral=0;this.dryIntegral=0;this.snackIntegral=0;this.finishSnapshot=null;this.events=[];this.m=metrics([],this.water,0);}
 random(){this.seed=(1664525*this.seed+1013904223)>>>0;return this.seed/4294967296;}
 syncMetrics(){let m=metrics(this.records,this.water,this.time,this.overfeeding);for(const [id,entry] of Object.entries(this.overfeeding)){if(entry.active&&(m.foodCounts[id]||0)<=C.overfeed.releaseCount){entry.active=false;entry.graceUntil=this.time+C.overfeed.graceSeconds;this.events.push({type:'overfeedEnd',food:FOODS.find(f=>f.id===id)});}if(!entry.active&&this.time>=entry.graceUntil)delete this.overfeeding[id];}this.m=metrics(this.records,this.water,this.time,this.overfeeding);return this.m;}
 take(food){
  if(this.finishSnapshot)return;const before=this.syncMetrics(),red=food.kind==='food'&&before.overfedFoods.includes(food.id);let eventFood=food;
  if(this.totals[food.group]>=0)this.totals[food.group]++;
  if(food.kind==='water')this.water=clamp(this.water+C.waterRecovery,0,100);
  else if(food.kind==='spoiled'||red){if(red){this.overfedHits++;eventFood={...food,kind:'overfed'};}else this.spoiledHits++;this.spoiledUntil=this.time+C.spoiledDuration;this.syncMetrics();this.speed=desiredSpeed(this.m,true);this.displayedSpeedKmh=displayedSpeed(this.speed);this.topSpeedHeldSec=0;}
  else {this.records.push({kind:food.kind,group:food.group,foodId:food.id,time:this.time});const after=metrics(this.records,this.water,this.time,this.overfeeding);if(food.kind==='food'&&(after.foodCounts[food.id]||0)>=C.overfeed.threshold&&!this.overfeeding[food.id]?.active){this.overfeeding[food.id]={active:true,protectedNutrition:clamp(nutritionMultiplier(before)*C.overfeed.retention,C.minMultiplier,C.maxMultiplier),graceUntil:0};this.events.push({type:'overfeedStart',food});}}
  this.syncMetrics();this.events.push({type:'take',food:eventFood,y:this.y+C.bike.pickup.dy});
 }
 foodFor(group,preferSafe=false){let list=FOODS.filter(f=>f.group===group);if(preferSafe){const safe=list.filter(f=>!this.m.overfedFoods.includes(f.id));if(safe.length)list=safe;else list=FOODS.filter(f=>f.kind==='food'&&!this.m.overfedFoods.includes(f.id));}return list[Math.floor(this.random()*list.length)];} placeItem(food,x,wantedY){
  const min=C.bike.minY+C.bike.groundDY+10,max=C.bike.maxY+C.bike.groundDY-12;
  for(let attempt=0;attempt<30;attempt++){
   let free=[[min,max]];
   for(const other of this.items){if(Math.abs(other.x-x)>=C.itemGapX)continue;const lo=other.y-C.itemGapY,hi=other.y+C.itemGapY;free=free.flatMap(([a,b])=>hi<=a||lo>=b?[[a,b]]:[...(lo>a?[[a,Math.min(lo,b)]]:[]),...(hi<b?[[Math.max(hi,a),b]]:[])]);}
   if(free.length){const candidates=free.map(([a,b])=>clamp(wantedY,a,b)).sort((a,b)=>Math.abs(a-wantedY)-Math.abs(b-wantedY));const item={id:this.nextId++,food,x,y:candidates[0],taken:false,born:this.time};this.items.push(item);return item;}
   x+=C.itemGapX+8;
  }
  const item={id:this.nextId++,food,x:Math.max(x,...this.items.map(i=>i.x+C.itemGapX+8)),y:clamp(wantedY,min,max),taken:false,born:this.time};this.items.push(item);return item;
 }
 spawn(){
  // A fair scheduled option, plus a second choice. Randomness never removes required options.
  const m=metrics(this.records,this.water,this.time);let g;
  if(this.offerCount<5)g=[0,2,1,3,4][this.offerCount];
  else {const overdue=this.lastOffered.map((t,i)=>({i,age:this.time-t})).sort((a,b)=>b.age-a.age)[0];g=overdue.age>=6?overdue.i:leastGroup(m);}
  let primary=this.foodFor(g,true);this.lastOffered[g]=this.time;
  let secondary;const needsWater=this.time-this.lastWater>=4.8||(this.water<30&&this.time-this.lastWater>=2.4);
  if(needsWater){secondary=this.foodFor(6);this.lastWater=this.time;}
  else {const r=this.random();if(r<.25)secondary=this.foodFor(5);else if(r<.5&&this.time>=5){const bad=FOODS.filter(f=>f.kind==='spoiled');secondary=bad[Math.floor(this.random()*bad.length)];}else {let other=(g+1+Math.floor(this.random()*4))%5;secondary=this.foodFor(other);this.lastOffered[other]=this.time;}}
  // Continuous road positions and staggered arrival times, without lane bands.
  const min=C.bike.minY+C.bike.groundDY+10,max=C.bike.maxY+C.bike.groundDY-12,span=max-min;
  const phase=(this.offerCount*.381966+this.random()*.28)%1;
  const firstY=min+phase*span;
  let secondY=min+this.random()*span;
  if(Math.abs(secondY-firstY)<C.itemSeparation){secondY=firstY<span/2+min?Math.min(max,firstY+C.itemSeparation):Math.max(min,firstY-C.itemSeparation);}
  const entrance=this.offerCount===0?1040:C.itemStartX;
  [primary,secondary].forEach((food,i)=>this.placeItem(food,entrance+i*C.itemStagger,i===0?firstY:secondY));this.offerCount++;
 }
 step(dt){
  if(this.finishSnapshot||dt<=0)return;dt=Math.min(dt,C.timeLimit-this.time);
  // Substeps keep input/collisions consistent at different frame rates.
  let remain=dt;while(remain>1e-9&&!this.finishSnapshot){const d=Math.min(remain,1/120);this.substep(d);remain-=d;}
 }
 substep(dt){
  this.syncMetrics();const target=desiredSpeed(this.m,this.time<this.spoiledUntil);
  this.speed+=(target-this.speed)*(1-Math.exp(-dt/C.speedResponse));this.displayedSpeedKmh=displayedSpeed(this.speed);this.fast=poseFor(this.fast,this.displayedSpeedKmh);
  this.targetY=clamp(this.targetY,C.bike.minY,C.bike.maxY);const wanted=(this.targetY-this.y)*(1-Math.exp(-dt/C.moveResponse));this.y+=clamp(wanted,-C.moveSpeed*dt,C.moveSpeed*dt);
  const remaining=C.finishDistance-this.distance;const toFinish=remaining/this.speed;const available=C.timeLimit-this.time;const actual=Math.min(dt,toFinish,available);
  this.time+=actual;this.distance+=this.speed*actual;this.water=clamp(this.water-C.waterDrain*actual,0,100);
  this.balanceIntegral+=this.m.F*actual;this.imbalanceIntegral+=this.m.I*actual;this.dryIntegral+=this.m.H*actual;this.snackIntegral+=this.m.K*actual;
  if(this.time+1e-9>=this.nextSpawn){this.spawn();this.nextSpawn+=C.spawnInterval;}
  const pickup=C.bike.pickup;
  for(const item of this.items){const old=item.x;item.x-=itemScrollSpeed(this.speed)*actual;
   const rx=pickup.rx+C.itemRadius,ry=pickup.ry+C.itemRadius;const vertical=Math.abs(item.y-(this.y+pickup.dy));
   if(!item.taken&&vertical<ry&&old>=pickup.x-rx&&item.x<=pickup.x+rx){const dx=Math.max(0,Math.abs(item.x-pickup.x)-C.itemRadius);if((dx/pickup.rx)**2+(Math.max(0,vertical-C.itemRadius)/pickup.ry)**2<=1){item.taken=true;this.take(item.food);}}
  }this.items=this.items.filter(i=>!i.taken&&i.x>-80);
  this.records=this.records.filter(r=>this.time-r.time<C.recordWindow);
  this.syncMetrics();this.topSpeedHeldSec=this.displayedSpeedKmh>=C.space.threshold?this.topSpeedHeldSec+actual:0;
  if(this.distance>=C.finishDistance-1e-8&&this.time<=C.timeLimit+1e-8)this.finish(true);
  else if(this.time>=C.timeLimit-1e-8)this.finish(false);
 }
 finish(success){if(this.finishSnapshot)return;const finishSpeedKmh=this.displayedSpeedKmh;this.finishSnapshot=Object.freeze({success,time:this.time,distance:Math.min(this.distance,C.finishDistance),finishSpeedKmh,totals:[...this.totals],spoiledHits:this.spoiledHits,overfedHits:this.overfedHits,averageBalance:this.balanceIntegral/Math.max(this.time,.001),averageImbalance:this.imbalanceIntegral/Math.max(this.time,.001),averageDry:this.dryIntegral/Math.max(this.time,.001),averageSnack:this.snackIntegral/Math.max(this.time,.001),hasHighSpeedEnding:success&&finishSpeedKmh>=C.endingThreshold});this.speed=0;this.displayedSpeedKmh=0;this.fast=false;this.topSpeedHeldSec=0;}
}
