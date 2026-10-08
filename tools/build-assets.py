from PIL import Image, ImageDraw
from pathlib import Path
import json, math, shutil
root=Path(__file__).resolve().parent.parent
out=root/'dist/assets'
source=root/'sources/rider-generated.png'
(root/'sources').mkdir(exist_ok=True)
# Source is retained with the project.
sheet=Image.open(source).convert('RGBA')
print('Generated sheet:',sheet.size)
cw,ch=sheet.width//4,sheet.height//2
atlas=Image.new('RGBA',(640,320))
frames=[]
for row in range(2):
 for phase in range(4):
  cell=sheet.crop((phase*cw,row*ch,(phase+1)*cw,(row+1)*ch))
  # Equal cells and a single hand anchor. Pack the generated torso separately
  # from deterministic articulated legs so shoe centers land on the pedals.
  hand=(336,217) if row==0 else (350,207)
  scale=.32
  cut=259 if row==0 else 230
  torso=cell.crop((0,0,cw,cut)).resize((round(cw*scale),round(cut*scale)),Image.Resampling.NEAREST)
  dx=126-round(hand[0]*scale);dy=85-round(hand[1]*scale)
  frame=Image.new('RGBA',(160,160));d=ImageDraw.Draw(frame)
  hip=(65,94) if row==0 else (62,77)
  pedals=[]
  for leg in range(2):
   a=phase*math.pi/2+leg*math.pi
   foot=(round(86+14*math.cos(a)),round(126+14*math.sin(a)))
   knee=(round(hip[0]+20+8*math.cos(a)),round((hip[1]+foot[1])/2-4+6*math.sin(a)))
   pts=[hip,knee,foot]
   d.line(pts,fill='#111b2c',width=19)
   d.line(pts,fill='#223247' if leg else '#2f4055',width=13)
   d.line([hip,knee],fill='#3f5063',width=3)
   d.rectangle((foot[0]-5,foot[1]-7,foot[0]+4,foot[1]-1),fill='#ecf2ef')
   d.polygon([(foot[0]-8,foot[1]-4),(foot[0]+5,foot[1]-4),(foot[0]+10,foot[1]),(foot[0]+10,foot[1]+5),(foot[0]-8,foot[1]+5)],fill='#111b2c')
   d.rectangle((foot[0]-7,foot[1]+2,foot[0]+9,foot[1]+4),fill='#eff3ed')
   d.line((foot[0]-1,foot[1]-2,foot[0]+4,foot[1]-2),fill='#b8c9dc',width=2)
   pedals.append(list(foot))
  frame.alpha_composite(torso,(dx,dy))
  atlas.alpha_composite(frame,(phase*160,row*160))
  frames.append({'pose':'normal' if row==0 else 'fast','phase':phase,'x':phase*160,'y':row*160,'w':160,'h':160,'hands':[126,85],'feet':pedals})
atlas.save(out/'sprites/rider.png')
manifest={'image':'assets/sprites/rider.png','cell':{'w':160,'h':160},'columns':4,'rows':2,'anchor':[78,109],'handle':[126,85],'crank':[86,126],'rearWheel':[6,157],'frontWheel':[152,177.5],'ground':227,'pedalRadius':14,'frames':frames,'preparation':'Generated pink-uniform torsos aligned to one hand anchor; articulated pixel legs packed to exact four pedal phases.'}
(out/'sprites/manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf8')

ink='#15283b'
def icon(name):
 im=Image.new('RGBA',(32,32));d=ImageDraw.Draw(im)
 def poly(p,c):d.polygon(p,fill=c);d.line(p+[p[0]],fill=ink,width=2)
 def box(b,c):d.rectangle(b,fill=c,outline=ink,width=2)
 def oval(b,c):d.ellipse(b,fill=c,outline=ink,width=2)
 if name=='rice':
  poly([(4,15),(28,15),(26,25),(21,29),(11,29),(6,25)],'#62aace');d.rectangle((7,17,11,23),fill='#b4e6ef');oval((5,7,27,19),'#fff4d8')
  for x,y in [(10,8),(17,6),(21,10),(9,13),(16,13)]:d.rectangle((x,y,x+3,y+1),fill='#d9caaa')
 elif name in ['carrot','broccoli','cucumber']:
  if name=='carrot':
   poly([(10,10),(21,14),(12,28),(5,30),(5,23)],'#ff972b');d.line((12,15,16,17),fill='#ffd45d',width=2);poly([(11,11),(10,3),(15,2),(17,9),(20,3),(24,5),(19,13)],'#54b636');d.line((9,20,13,22),fill='#bd5d20',width=2)
  elif name=='broccoli':
   poly([(13,15),(22,14),(21,26),(17,30),(12,29),(15,20)],'#8bc348')
   for b in [(2,9,17,23),(9,3,23,19),(17,7,30,22)]:oval(b,'#399a46')
   for x,y in [(7,11),(13,6),(19,10),(24,14)]:d.rectangle((x,y,x+3,y+3),fill='#82ca46')
  else:
   poly([(7,27),(3,23),(18,3),(23,2),(28,7),(13,28)],'#429a49');d.line((9,23,23,6),fill='#8ece52',width=3)
 elif name in ['apple','badapple']:
  poly([(5,11),(11,7),(16,9),(23,7),(29,13),(28,24),(22,30),(16,28),(10,30),(4,24),(2,16)],'#f04448' if name=='apple' else '#a99c57');d.line((16,8,18,2),fill='#593b27',width=3);poly([(18,4),(24,1),(28,3),(23,6)],'#73af43');d.rectangle((7,12,10,17),fill='#ffc8a1')
  if name=='badapple':d.rectangle((7,19,12,24),fill='#427044');d.rectangle((20,11,24,16),fill='#477046')
 elif name=='fish':
  poly([(8,14),(2,8),(2,24),(9,21),(14,26),(25,23),(31,15),(25,7),(15,8)],'#3ca5e9');poly([(12,10),(18,4),(23,5),(21,10)],'#acdafa');d.line((9,18,21,22),fill='#a3e5f7',width=3);d.rectangle((24,11,26,13),fill=ink)
 elif name=='egg':
  oval((7,2,27,30),'#f9f5d8');oval((12,14,23,25),'#ffbb24');d.rectangle((16,17,19,19),fill='#ffe862')
 elif name=='tofu':
  poly([(4,11),(21,5),(29,11),(29,25),(12,30),(4,24)],'#fff4d5');d.line([(4,11),(12,17),(29,11)],fill='#cabfa7',width=2);d.line((12,17,12,29),fill='#cabfa7',width=2)
 elif name in ['milk','water','soda','yogurt']:
  if name=='milk':poly([(10,3),(23,3),(23,7),(28,12),(28,29),(6,29),(6,12),(10,7)],'#ecf6eb');poly([(23,7),(28,12),(28,29),(21,29),(21,12)],'#398ddb');box((9,2,23,6),'#58b4ed');d.rectangle((9,15,17,24),fill='#69cbed');d.rectangle((12,13,15,26),fill='#69cbed')
  elif name=='yogurt':box((5,8,27,12),'#82ccf3');poly([(6,12),(26,12),(23,28),(9,28)],'#f3f3da');d.rectangle((11,16,22,21),fill='#72c0de')
  else:
   box((12,1,21,5),'#b6dff4');poly([(12,5),(21,5),(21,9),(26,14),(26,29),(7,29),(7,14),(12,9)],'#69c4f6' if name=='water' else '#cf8ded');d.rectangle((10,17,24,25),fill='#f4faff');d.rectangle((10,12,13,16),fill='#eefbff');d.rectangle((15,18,19,23),fill='#2da7e5' if name=='water' else '#9f59d5')
 elif name=='candy':
  poly([(2,10),(8,13),(8,9),(12,7),(22,12),(25,10),(30,14),(29,22),(23,19),(19,25),(9,21),(7,23),(1,19)],'#bd74e8');d.line((13,9,9,19),fill='#ffd877',width=4);d.line((21,12,17,22),fill='#ffd877',width=4)
 elif name=='cheese':poly([(4,12),(25,4),(29,10),(29,27),(4,27)],'#ffcd42');d.line((4,12,29,10),fill='#fff18a',width=2);d.ellipse((9,16,13,20),fill='#d99927');d.ellipse((20,21,25,25),fill='#d99927')
 elif name=='banana':poly([(5,5),(10,4),(10,13),(15,19),(22,20),(28,17),(27,23),(22,28),(13,28),(6,22),(3,14)],'#ffdc4e');d.line([(7,9),(8,18),(14,24),(22,25)],fill='#c99928',width=2)
 elif name=='grapes':
  d.line((16,4,16,11),fill='#507844',width=3);poly([(16,4),(22,1),(28,3),(23,7)],'#6fbc45')
  for x,y in [(7,9),(17,9),(3,16),(12,16),(21,16),(8,23),(17,23)]:oval((x,y,x+8,y+8),'#9267c6');d.rectangle((x+2,y+2,x+3,y+3),fill='#d5b9fa')
 elif name=='corn':
  poly([(6,25),(8,9),(14,3),(22,4),(26,11),(22,24),(13,30)],'#ffd752')
  for x,y in [(13,8),(19,8),(11,14),(18,14),(10,20),(17,20)]:d.rectangle((x,y,x+2,y+3),fill='#dba128')
  poly([(5,15),(11,25),(22,25),(28,15),(24,28),(14,31),(6,28)],'#76ad40')
 elif name=='potato':oval((4,6,29,29),'#cda472');d.rectangle((9,12,11,14),fill='#937249');d.rectangle((21,20,23,22),fill='#937249');d.line((9,8,18,7),fill='#ecd0a0',width=2)
 elif name=='badbread':
  poly([(5,28),(5,13),(3,11),(5,5),(12,2),(21,2),(28,6),(30,11),(26,14),(26,28)],'#dbaa68');poly([(8,25),(8,13),(6,10),(9,6),(21,6),(26,10),(22,14),(22,25)],'#f5db9b')
  for x,y in [(9,15),(18,10),(16,22)]:d.rectangle((x,y,x+4,y+3),fill='#548450');d.rectangle((x+1,y-1,x+2,y+4),fill='#548450')
 if name.startswith('bad'):
  d.line((23,1,30,8),fill='#182433',width=5);d.line((30,1,23,8),fill='#182433',width=5);d.line((23,1,30,8),fill='#ff6655',width=3);d.line((30,1,23,8),fill='#ff6655',width=3)
 im.save(out/'icons'/f'{name}.png')
for name in ['rice','corn','potato','fish','egg','tofu','carrot','broccoli','cucumber','apple','banana','grapes','milk','cheese','yogurt','candy','soda','water','badbread','badapple']:icon(name)
print('Packed 8 rider frames and 20 transparent food icons.')
