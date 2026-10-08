import test from 'node:test';import assert from 'node:assert/strict';
import {Game} from '../dist/model.js';import {CONFIG as C} from '../dist/config.js';
import {Renderer} from '../dist/render.js';import {FoodBikeRenderer} from '../dist/bike-renderer.js';
import {BIKE_MANIFEST as M} from '../dist/bike-manifest.js';import {viewFor,projectX} from '../dist/view.js';

// Canvas adapter exercises actual rendering state; raster output is checked separately.
function setup(portrait=false,kmh=112){
 const ctx={save(){},restore(){},scale(){},translate(){},drawImage(){},clearRect(){},fillText(){}};
 const r=Object.create(Renderer.prototype);r.ctx=r.sceneCtx=ctx;r.canvas={width:1280,height:720};r.scene={};r.smear={width:0,getContext:()=>ctx};r.portrait=portrait;
 r.resize=()=>{r.view=viewFor(portrait?390:1280,portrait?844:720,portrait);};
 r.poly=r.rect=r.comic=()=>{};r.background=()=>{};r.speedometer=n=>r.dial=n;r.particles=[];
 r.bikeSprite=Object.create(FoodBikeRenderer.prototype);r.bikeSprite.manifest=M;r.bikeSprite.reset();r.bikeSprite.draw=()=>{};r.resetBike();r.bikeSprite.update(kmh,.3,100);
 const g=new Game();g.distance=C.finishDistance;g.time=35;g.displayedSpeedKmh=kmh;r.lastDistance=r.lastBikeDistance=g.distance;r.lastBikeTime=g.time;
 r.turbo=1;r.space=1;r.sceneryDistance=100;r.spaceDistance=100;r.comicAge=0;g.finish(true);
 return {g,r};
}
test('finish restores road immediately while keeping blur, scrolling, fast pedals, wheels and saved dial',()=>{
 const {g,r}=setup(),snapshot=g.finishSnapshot,phase=r.bikeSprite.pedalPhase,wheel=r.bikeSprite.distance;
 r.draw(g,1/60,'finish',1/60);assert.equal(r.space,0);assert.equal(r.turbo,1);assert.ok(r.sceneryDistance>100);assert.equal(r.bikeSprite.fast,true);assert.equal(r.bikeSprite.speedKmh,112);assert.equal(r.bikeSprite.poseMix,1);assert.notEqual(r.bikeSprite.pedalPhase,phase);assert.ok(r.bikeSprite.distance>wheel);assert.equal(r.dial,112);assert.equal(g.finishSnapshot,snapshot);assert.equal(g.distance,C.finishDistance);
});
test('whole bicycle leaves right edge before ending in landscape and portrait; late frames cannot restore it',()=>{
 for(const portrait of [false,true]){
  const {g,r}=setup(portrait);let previous=0;
  for(let t=0;t<=C.finishExitDuration+1e-8;t+=.1){r.draw(g,.1,'finish',t);assert.ok(r.finishOffset>=previous);previous=r.finishOffset;}
  assert.ok(C.finishExitDuration<C.finishAnimation);assert.ok(Math.abs(r.finishOffset-C.finishExitDistance)<1e-8);
  // Includes the transparent sheet/trail margins, much wider than the visible tyre extent.
  assert.ok(projectX(r.finishOffset-100,r.view)>r.view.width);
  r.draw(g,0,'ending1',0);assert.equal(r.lastBikeOffset,C.finishExitDistance);
  const skipped=setup(portrait);skipped.r.draw(skipped.g,.1,'finish',.1);skipped.r.draw(skipped.g,0,'ending1',0);assert.equal(skipped.r.lastBikeOffset,C.finishExitDistance);
 }
});
test('pause freezes the exit and wheel animation, resume continues, restart clears the exit',()=>{
 const {g,r}=setup();r.draw(g,.2,'finish',.2);const frozen=[r.finishOffset,r.sceneryDistance,r.bikeSprite.distance,r.bikeSprite.pedalPhase];r.draw(g,0,'paused',.2);assert.deepEqual([r.finishOffset,r.sceneryDistance,r.bikeSprite.distance,r.bikeSprite.pedalPhase],frozen);
 r.draw(g,.1,'finish',.3);assert.ok(r.finishOffset>frozen[0]);g.reset();r.resetBike();r.draw(g,0,'countdown',0);assert.equal(r.lastBikeOffset,0);assert.equal(r.finishOffset,0);assert.equal(r.space,0);assert.equal(r.dial,0);
});
test('even slower finishes use 100km/h motion while results keep actual finish speed',()=>{
 const {g,r}=setup(false,60);r.draw(g,.3,'finish',.3);assert.equal(r.bikeSprite.speedKmh,100);assert.equal(r.bikeSprite.fast,true);assert.equal(r.bikeSprite.poseMix,1);assert.equal(r.dial,60);assert.equal(g.finishSnapshot.finishSpeedKmh,60);assert.equal(g.finishSnapshot.hasHighSpeedEnding,false);
});
