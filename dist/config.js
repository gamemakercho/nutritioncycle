export const CONFIG={
  width:1280,height:720,timeLimit:60,finishDistance:1100,baseSpeed:20,maxInternalSpeed:30,
  minMultiplier:.4,maxMultiplier:1.5,maxDisplaySpeed:100,speedResponse:.12,
  moveSpeed:680,moveResponse:.065,spawnInterval:1.2,recordWindow:20,
  targets:[3,2,3,2,2],imbalanceAllowance:.12,imbalanceRange:.5,snackFree:2,
  waterStart:75,waterMax:100,waterDrain:3,waterRecovery:30,waterLow:25,
  spoiledMultiplier:.65,spoiledDuration:3,fastEnter:70,fastExit:65,endingThreshold:70,
  poseTransition:.2,pixelDistanceScale:8,itemStartX:1340,itemRadius:16,
  scenery:{cloud:.65,mountain:2,tree:12,rail:23,road:38,foreground:54},
  itemSize:78,itemLabelSize:17,itemStagger:155,itemSeparation:92,
  bike:{x:280,minY:245,maxY:535,startY:415,groundDY:118,pickup:{x:354,dy:118,rx:38,ry:23},
    rear:{x:-72,y:48,r:62,growth:8,tire:5,outlineWidth:4},front:{x:74,y:68.5,r:45},crank:{x:8,y:17},handle:{x:48,y:-24},
    sprite:{path:'assets/sprites/rider.png',manifest:'assets/sprites/manifest.json',x:-78,y:-109,w:160,h:160}},
  speedometer:{x:1174,y:105,r:87},
  endings:[{path:'assets/endings/ending-01.png',duration:1.8},{path:'assets/endings/ending-02.png',duration:2.4}],endingTransition:.18,finishAnimation:1.05
};
