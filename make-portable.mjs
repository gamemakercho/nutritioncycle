import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const dist=path.join(root,'dist');
const data=file=>'data:'+(file.endsWith('.svg')?'image/svg+xml':'image/png')+';base64,'+fs.readFileSync(path.join(dist,file)).toString('base64');
const icons=Object.fromEntries(fs.readdirSync(path.join(dist,'assets/icons')).filter(f=>f.endsWith('.svg')).map(f=>[f.slice(0,-4),data('assets/icons/'+f)]));
let js=['config.js','bike-manifest.js','foods.js','model.js','bike-renderer.js','geometry.js','view.js','render.js','app.js'].map(file=>{
 let code=fs.readFileSync(path.join(dist,file),'utf8').replace(/^import .*?;\s*$/gm,'').replace(/\bexport /g,'');
 if(file==='config.js')code+='\nconst C=CONFIG;';
 if(file==='bike-manifest.js'){const pack=JSON.parse(fs.readFileSync(path.join(dist,'assets/bike-pack/manifest.json'),'utf8'));code+=`\nObject.assign(BIKE_MANIFEST.assets,${JSON.stringify(Object.fromEntries(Object.entries(pack.assets).map(([name,file])=>[name,data('assets/bike-pack/'+file)])))});`;}
 if(file==='foods.js')code+=`\nconst ICON_URLS=${JSON.stringify(icons)};FOODS.forEach(f=>f.image=ICON_URLS[f.id]);C.endings[0].path=${JSON.stringify(data('assets/endings/ending-01.png'))};C.endings[1].path=${JSON.stringify(data('assets/endings/ending-02.png'))};`;
 if(file==='app.js')code=code.replace('src="assets/icons/${id}.svg"','src="${ICON_URLS[id]}"');
 return code;
}).join('\n');
let html=fs.readFileSync(path.join(dist,'index.html'),'utf8');
html=html.replace('<link rel="stylesheet" href="style.css">',`<style>${fs.readFileSync(path.join(dist,'style.css'),'utf8')}</style>`).replace('<script type="module" src="app.js"></script>',`<script type="module">${js}</script>`);
fs.writeFileSync(path.join(root,'튼튼바퀴_게임.html'),html);console.log('Built offline game: 튼튼바퀴_게임.html');

// GitHub Pages publishes this repository root.
fs.writeFileSync(path.join(root,"index.html"),html);
console.log("Updated GitHub Pages entry: index.html");
