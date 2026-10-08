import test from 'node:test';
import assert from 'node:assert/strict';
import {Game,itemScrollSpeed,displayedSpeed,internalSpeed} from '../dist/model.js';
import {CONFIG as C} from '../dist/config.js';
import {byId,FOODS} from '../dist/foods.js';
import {spaceTarget} from '../dist/view.js';

function ready(){
 const g=new Game();g.water=100;g.speed=internalSpeed(100);g.displayedSpeedKmh=100;g.nextSpawn=100;
 g.records=C.targets.flatMap((n,group)=>Array.from({length:n},()=>({kind:'food',group,foodId:FOODS.find(f=>f.group===group).id,time:0})));
 g.syncMetrics();return g;
}
test('four continuous seconds enter space, then each full second adds exactly 1 km/h',()=>{
 const g=ready();g.step(3.999);assert.equal(g.spaceActive,false);g.step(.001);assert.equal(g.spaceActive,true);assert.equal(g.displayedSpeedKmh,100);
 g.step(.999);assert.equal(g.displayedSpeedKmh,100);g.step(.001);assert.equal(g.displayedSpeedKmh,101);
 g.step(2);assert.equal(g.displayedSpeedKmh,103);assert.equal(g.speed,internalSpeed(103));assert.equal(spaceTarget(g.displayedSpeedKmh,g.topSpeedHeldSec),1);
});
test('charging restarts from zero after falling below 100; pause never adds charge or boost',()=>{
 const g=ready();g.step(3);g.speed=internalSpeed(98);g.step(.001);assert.equal(g.topSpeedHeldSec,0);
 g.speed=internalSpeed(100);g.step(3);assert.equal(g.spaceActive,false);const charge=g.topSpeedHeldSec;g.step(0);assert.equal(g.topSpeedHeldSec,charge);
 g.step(1);g.step(.75);const state=[g.time,g.distance,g.spaceElapsed,g.displayedSpeedKmh];g.step(0);assert.deepEqual([g.time,g.distance,g.spaceElapsed,g.displayedSpeedKmh],state);
});
test('every red type immediately breaks space at 80, including the first candy and a red overfed food',()=>{
 for(const id of ['candy','soda','badbread','badapple','apple']){
  const g=ready();g.step(6);assert.equal(g.displayedSpeedKmh,102);
  if(id==='apple'){g.overfeeding.apple={active:true,protectedNutrition:1.275,graceUntil:0};g.records.push({kind:'food',group:3,foodId:'apple',time:g.time});g.syncMetrics();}
  g.take(byId(id));assert.equal(g.speed,internalSpeed(80),id);assert.equal(g.displayedSpeedKmh,80,id);assert.equal(g.spaceActive,false,id);assert.equal(g.spaceElapsed,0);assert.equal(g.topSpeedHeldSec,0);assert.equal(spaceTarget(g.displayedSpeedKmh,g.topSpeedHeldSec),0);
  g.step(.1);assert.ok(g.displayedSpeedKmh<=80);assert.ok(g.events.some(e=>e.type==='spaceBreak'));
 }
});
test('safe pickups keep the boost; a mistake requires recovery and a fresh four-second charge',()=>{
 const g=ready();g.step(5);g.take(byId('water'));g.take(byId('banana'));assert.equal(g.spaceActive,true);g.step(1);assert.equal(g.displayedSpeedKmh,102);
 g.take(byId('candy'));g.step(2.9);assert.equal(g.displayedSpeedKmh,80);assert.equal(g.topSpeedHeldSec,0);
 g.step(.8);assert.equal(g.spaceActive,false);assert.equal(g.displayedSpeedKmh,100);assert.ok(g.topSpeedHeldSec<1);
 g.step(3);assert.equal(g.spaceActive,false);g.step(1);assert.equal(g.spaceActive,true);assert.equal(g.displayedSpeedKmh,100);
});
test('food acceleration steepens with speed and continues beyond 100',()=>{
 const speed=kmh=>itemScrollSpeed(internalSpeed(kmh));
 assert.equal(speed(50),225);assert.equal(speed(100),525);assert.equal(speed(120),771);
 assert.ok(speed(100)-speed(80)>speed(80)-speed(60));assert.ok(speed(120)-speed(100)>speed(100)-speed(80));assert.equal(displayedSpeed(internalSpeed(125)),125);
});
test('restart clears boost; finish records speeds over 100 before restoring the road',()=>{
 const g=ready();g.step(9);assert.equal(g.displayedSpeedKmh,105);g.finish(true);
 assert.equal(g.finishSnapshot.finishSpeedKmh,105);assert.equal(g.finishSnapshot.hasHighSpeedEnding,true);assert.equal(g.spaceActive,false);assert.equal(g.displayedSpeedKmh,0);assert.equal(g.topSpeedHeldSec,0);
 g.reset();assert.equal(g.spaceElapsed,0);assert.equal(g.spaceRecoveryUntil,0);assert.equal(g.spaceActive,false);
});
test('hydration shortage still ends space boost and returns to nutrition-based speed',()=>{
 const g=ready();g.step(5);g.water=0;g.step(.5);assert.equal(g.spaceActive,false);assert.ok(g.displayedSpeedKmh<100);assert.equal(g.topSpeedHeldSec,0);
});
test('a mistake visibly holds 80 even after nutrient records decay during space',()=>{
 const g=ready();g.step(5);g.records=[];g.syncMetrics();g.take(byId('badbread'));assert.equal(g.displayedSpeedKmh,80);g.step(2.9);assert.equal(g.displayedSpeedKmh,80);g.step(.7);assert.ok(g.displayedSpeedKmh<80);
});
