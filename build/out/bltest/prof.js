const {chromium}=require('playwright-core');const os=require('os'),path=require('path');
(async()=>{let T=Date.now();const b=await chromium.launch({executablePath:path.join(os.homedir(),'.cache/ms-playwright/chromium-1200/chrome-linux64/chrome')});console.log('launch',Date.now()-T);T=Date.now();
const p=await b.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:0.5});await p.goto('file://'+path.resolve(__dirname,'../../stage.html')+'?only=bl');await p.evaluate(()=>window.__ready);console.log('ready',Date.now()-T);
for(const t of [0.2,2.2,2.6]){T=Date.now();const d=await p.evaluate(t=>{const a=performance.now();window.renderFrame(t);return performance.now()-a;},t);const r=Date.now()-T;T=Date.now();await p.screenshot({type:'png'});console.log(t,'render',d.toFixed(1),r,'shot',Date.now()-T);}
await b.close();})();
