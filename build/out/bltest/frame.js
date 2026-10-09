// node frame.js t out.png  -> full-res 1920x1080 bl quadrant frame
const {chromium}=require('playwright-core');const os=require('os'),path=require('path');
(async()=>{const b=await chromium.launch({executablePath:path.join(os.homedir(),'.cache/ms-playwright/chromium-1200/chrome-linux64/chrome'),args:['--font-render-hinting=none','--force-color-profile=srgb']});const p=await b.newPage({viewport:{width:1920,height:1080}});
p.on('pageerror',e=>console.error(e.message));
await p.goto('file://'+path.resolve(__dirname,'../../stage.html')+'?only=bl');await p.evaluate(()=>window.__ready);
for(let i=2;i<process.argv.length;i+=2){await p.evaluate(t=>window.renderFrame(t),+process.argv[i]);await p.screenshot({path:process.argv[i+1]});}
await b.close();})();
