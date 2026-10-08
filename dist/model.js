import {CONFIG as C} from './config.js';
import {GROUPS,FOODS} from './foods.js';
export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function metrics(records,water,time){
 const recent=records.filter(r=>time-r.time<C.recordWindow-1e-9);const counts=Array(5).fill(0);
 let snacks=0;for(const r of recent){if(r.kind==='food')counts[r.group]++;if(r.kind==='snack')snacks++;}
 const N=counts.reduce((a,b)=>a+b,0);const F=counts.reduce((a,c,i)=>a+Math.min(c/C.targets[i],1),0)/5;
 const proportions=counts.map(c=>N?c/N:0),weights=C.targets.map(t=>t/C.targets.reduce((a,b)=>a+b));
 const I=N<5?0:clamp((Math.max(...proportions.map((p,i)=>p-weights[i]))-C.imbalanceAllowance)/C.imbalanceRange,0,1);
 const H=clamp((C.waterLow-water)/C.waterLow,0,1),K=snacks>C.snackFree?1:0;
 return {counts,N,F,I,H,K,snacks,proportions,weights,balanced:F>=.8&&I<.15};
}
export function desiredSpeed(m,spoiled=false){let M=clamp(.75+.75*m.F-.55*m.I-.25*m.H-.2*m.K,C.minMultiplier,C.maxMultiplier);if(spoiled)M=Math.max(C.minMultiplier,M*C.spoiledMultiplier);return C.baseSpeed*M;}
export const displayedSpeed=speed=>Math.round(clamp(speed/C.maxInternalSpeed*C.maxDisplaySpeed,0,C.maxDisplaySpeed));
export const poseFor=(fast,kmh)=>fast?kmh>C.fastExit:kmh>=C.fastEnter;
export function leastGroup(m){if(m.F>=1&&m.I>0)return m.proportions.map((p,i)=>p-m.weights[i]).indexOf(Math.min(...m.proportions.map((p,i)=>p-m.weights[i])));const ratios=m.counts.map((c,i)=>c/C.targets[i]);return ratios.indexOf(Math.min(...ratios));}
export function advice(m,water){if(water<C.waterLow)return '물이 부족해요!';if(m.K)return '단 간식은 잠깐 쉬어 가요!';if(m.N<3)return '다양한 식품을 모아 봐!';if(m.F>=1&&m.I===0)return '균형 좋아요! 물도 챙겨요!';return GROUPS[leastGroup(m)].hint;}
export class Game{
 constructor(seed=12345){this.seed=seed;this.reset();}
 reset(){this.time=0;this.distance=0;this.water=C.waterStart;this.records=[];this.totals=Array(7).fill(0);this.spoiledHits=0;this.spoiledUntil=0;this.speed=15;this.displayedSpeedKmh=50;this.fast=false;this.y=C.bike.startY;this.targetY=this.y;this.items=[];this.nextSpawn=0;this.nextId=1;this.lastOffered=Array(5).fill(-8);this.lastWater=-6;this.offerCount=0;this.balanceIntegral=0;this.imbalanceIntegral=0;this.dryIntegral=0;this.snackIntegral=0;this.finishSnapshot=null;this.events=[];this.m=metrics([],this.water,0);}
 random(){this.seed=(1664525*this.seed+1013904223)>>>0;return this.seed/4294967296;}
 take(food){if(this.finishSnapshot)return;this.totals[food.group]>=0&&this.totals[food.group]++;if(food.kind==='water'){this.water=clamp(this.water+C.waterRecovery,0,100);}else if(food.kind==='spoiled'){this.spoiledHits++;this.spoiledUntil=this.time+C.spoiledDuration;this.m=metrics(this.records,this.water,this.time);this.speed=desiredSpeed(this.m,true);this.displayedSpeedKmh=displayedSpeed(this.speed);}else this.records.push({kind:food.kind,group:food.group,time:this.time});this.events.push({type:'take',food,y:this.y+C.bike.pickup.dy});}
 foodFor(group){const list=FOODS.filter(f=>f.group===group);return list[Math.floor(this.random()*list.length)];}
 spawn(){
  // A fair scheduled option, plus a second choice. Randomness never removes required options.
  const m=metrics(this.records,this.water,this.time);let g;
  if(this.offerCount<5)g=[0,2,1,3,4][this.offerCount];
  else {const overdue=this.lastOffered.map((t,i)=>({i,age:this.time-t})).sort((a,b)=>b.age-a.age)[0];g=overdue.age>=6?overdue.i:leastGroup(m);}
  let primary=this.foodFor(g);this.lastOffered[g]=this.time;
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
  [primary,secondary].forEach((food,i)=>this.items.push({id:this.nextId++,food,x:entrance+i*(C.itemStagger+this.random()*60),y:i===0?firstY:secondY,taken:false,born:this.time}));this.offerCount++;
 }
 step(dt){
  if(this.finishSnapshot||dt<=0)return;dt=Math.min(dt,C.timeLimit-this.time);
  // Substeps keep input/collisions consistent at different frame rates.
  let remain=dt;while(remain>1e-9&&!this.finishSnapshot){const d=Math.min(remain,1/120);this.substep(d);remain-=d;}
 }
 substep(dt){
  this.m=metrics(this.records,this.water,this.time);const target=desiredSpeed(this.m,this.time<this.spoiledUntil);
  this.speed+=(target-this.speed)*(1-Math.exp(-dt/C.speedResponse));this.displayedSpeedKmh=displayedSpeed(this.speed);this.fast=poseFor(this.fast,this.displayedSpeedKmh);
  this.targetY=clamp(this.targetY,C.bike.minY,C.bike.maxY);const wanted=(this.targetY-this.y)*(1-Math.exp(-dt/C.moveResponse));this.y+=clamp(wanted,-C.moveSpeed*dt,C.moveSpeed*dt);
  const remaining=C.finishDistance-this.distance;const toFinish=remaining/this.speed;const available=C.timeLimit-this.time;const actual=Math.min(dt,toFinish,available);
  this.time+=actual;this.distance+=this.speed*actual;this.water=clamp(this.water-C.waterDrain*actual,0,100);
  this.balanceIntegral+=this.m.F*actual;this.imbalanceIntegral+=this.m.I*actual;this.dryIntegral+=this.m.H*actual;this.snackIntegral+=this.m.K*actual;
  if(this.time+1e-9>=this.nextSpawn){this.spawn();this.nextSpawn+=C.spawnInterval;}
  const pickup=C.bike.pickup;
  for(const item of this.items){const old=item.x;item.x-=this.speed*C.pixelDistanceScale*actual;
   const rx=pickup.rx+C.itemRadius,ry=pickup.ry+C.itemRadius;const vertical=Math.abs(item.y-(this.y+pickup.dy));
   if(!item.taken&&vertical<ry&&old>=pickup.x-rx&&item.x<=pickup.x+rx){const dx=Math.max(0,Math.abs(item.x-pickup.x)-C.itemRadius);if((dx/pickup.rx)**2+(Math.max(0,vertical-C.itemRadius)/pickup.ry)**2<=1){item.taken=true;this.take(item.food);}}
  }this.items=this.items.filter(i=>!i.taken&&i.x>-80);
  this.records=this.records.filter(r=>this.time-r.time<C.recordWindow);
  if(this.distance>=C.finishDistance-1e-8&&this.time<=C.timeLimit+1e-8)this.finish(true);
  else if(this.time>=C.timeLimit-1e-8)this.finish(false);
 }
 finish(success){if(this.finishSnapshot)return;const finishSpeedKmh=this.displayedSpeedKmh;this.finishSnapshot=Object.freeze({success,time:this.time,distance:Math.min(this.distance,C.finishDistance),finishSpeedKmh,totals:[...this.totals],spoiledHits:this.spoiledHits,averageBalance:this.balanceIntegral/Math.max(this.time,.001),averageImbalance:this.imbalanceIntegral/Math.max(this.time,.001),averageDry:this.dryIntegral/Math.max(this.time,.001),averageSnack:this.snackIntegral/Math.max(this.time,.001),hasHighSpeedEnding:success&&finishSpeedKmh>=C.endingThreshold});}
}
