import test from 'node:test';import assert from 'node:assert/strict';
import {Game,desiredSpeed} from '../dist/model.js';import {byId,GROUPS,FOODS} from '../dist/foods.js';import {foodAppearance} from '../dist/view.js';
test('first oil or sugar fills shared gauge forever; repeat food causes the same slowdown as spoiled food',()=>{
 for(const first of ['sesame_oil','soda']){
  const g=new Game();g.time=10;g.speed=15;g.nextSpawn=100;assert.equal(g.m.snackFull,false);const speed=g.speed;
  g.take(byId(first));assert.equal(g.m.snackFull,true);assert.equal(g.speed,speed);assert.equal(g.spoiledUntil,0);assert.equal(g.snackHits,0);
  assert.equal(foodAppearance(byId('sesame_oil'),g.m).type,'caution');assert.equal(foodAppearance(byId('soda'),g.m).type,'caution');
  g.time=35;g.records=[];g.syncMetrics();assert.equal(g.m.snackFull,true);assert.equal(g.m.snacks,0);
  g.take(byId(first==='soda'?'sesame_oil':'soda'));assert.equal(g.snackHits,1);assert.equal(g.spoiledHits,0);assert.equal(g.spoiledUntil,38);assert.equal(g.speed,desiredSpeed(g.m,true));assert.equal(g.m.K,1);assert.equal(g.events.at(-1).food.kind,'excessSnack');
  g.time=36;g.take(byId('sesame_oil'));assert.equal(g.spoiledUntil,39);assert.equal(g.speed,desiredSpeed(g.m,true));assert.equal(g.m.snackFull,true);
  g.step(3.5);assert.equal(g.m.K,0);assert.equal(g.m.snackFull,true);assert.ok(g.speed>desiredSpeed(g.m,true));g.reset();assert.equal(g.m.snackFull,false);assert.equal(g.snackHits,0);
 }
});
test('safe spawn remains valid when every normal food is temporarily overfed',()=>{
 const g=new Game();for(const f of FOODS.filter(f=>f.kind==='food')){g.take(f);g.take(f);}for(let group=0;group<5;group++)assert.equal(g.foodFor(group,true).kind,'water');g.offerCount=6;g.spawn();assert.ok(g.items.every(item=>item.food&&Number.isFinite(item.x)));
});
test('first oil is safe in space; additional oil drops to 80 and survives in result totals',()=>{
 const g=new Game();g.spaceActive=true;g.speed=33;g.displayedSpeedKmh=110;g.topSpeedHeldSec=4;
 g.take(byId('sesame_oil'));assert.equal(g.spaceActive,true);assert.equal(g.displayedSpeedKmh,110);g.take(byId('soda'));assert.equal(g.spaceActive,false);assert.equal(g.displayedSpeedKmh,80);g.finish(true);assert.equal(g.finishSnapshot.snackHits,1);assert.equal(g.finishSnapshot.totals[5],2);
});
test('second same food turns red, remains red until all servings expire, then becomes safe',()=>{
 const g=new Game();g.time=1;g.take(byId('apple'));assert.notEqual(foodAppearance(byId('apple'),g.m).type,'overfed');g.time=5;g.take(byId('apple'));assert.equal(foodAppearance(byId('apple'),g.m).type,'overfed');assert.notEqual(foodAppearance(byId('banana'),g.m).type,'overfed');g.time=21;g.syncMetrics();assert.equal(foodAppearance(byId('apple'),g.m).type,'overfed');g.time=25;g.syncMetrics();assert.notEqual(foodAppearance(byId('apple'),g.m).type,'overfed');assert.ok(g.m.protectedNutrition>0);
 assert.equal(GROUPS[5].short,'당류');assert.equal(GROUPS[5].icon,'sesame_oil');
});
