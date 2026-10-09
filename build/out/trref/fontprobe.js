const {chromium}=require('playwright-core');const path=require('path'),os=require('os');
(async()=>{const br=await chromium.launch({executablePath:path.join(os.homedir(),'.cache/ms-playwright/chromium-1200/chrome-linux64/chrome')});
const p=await br.newPage();await p.goto('file://'+path.resolve('stage.html')+'?only=tr');await p.evaluate(()=>window.__ready);
const r=await p.evaluate(async()=>{const out=[];const c=document.createElement('canvas');c.width=3000;c.height=300;const g=c.getContext('2d');
for(const f of ['Inter','Geist','Manrope','DM Sans','Figtree','Plus Jakarta Sans','Outfit','Urbanist'])for(const w of [500,600,700]){
 await document.fonts.load(`${w} 100px "${f}"`);const m=s=>{g.font=`${w} 100px "${f}"`;const mm=g.measureText(s);return mm.actualBoundingBoxRight+mm.actualBoundingBoxLeft};
 g.font=`${w} 100px "${f}"`;const cap=g.measureText('H').actualBoundingBoxAscent;
 out.push([f,w,(m('0x082E...CA88')/cap).toFixed(2),(m('$27.70M')/cap).toFixed(2),(m('+$22.24M')/cap).toFixed(2),cap.toFixed(1)]);}
return out;});console.log('ref 9.68 4.85 5.85');r.forEach(x=>console.log(x.join(' ')));await br.close();})();
