const {chromium}=require('playwright-core');const path=require('path'),os=require('os');
(async()=>{const br=await chromium.launch({executablePath:path.join(os.homedir(),'.cache/ms-playwright/chromium-1200/chrome-linux64/chrome')});
const p=await br.newPage({viewport:{width:1920,height:1080}});p.on('console',m=>console.log('C',m.text()));p.on('pageerror',e=>console.log('E',e.message));
await p.goto('file://'+path.resolve('stage.html')+'?only=tr');await p.evaluate(()=>window.__ready);
console.log(await p.evaluate(t=>{try{window.SCENES.tr.render(document.getElementById("tr"),t);return "ok"}catch(e){return e.stack}},+process.argv[2]));
console.log(await p.evaluate(()=>{const r=document.getElementById("tr");const b=r.firstChild.children[3];const c=b.querySelector("circle");return [b.style.cssText,JSON.stringify(c.getBoundingClientRect()),JSON.stringify(document.getElementById("stage").getBoundingClientRect()),getComputedStyle(document.getElementById("stage")).display]}));
await p.screenshot({path:'out/trref/dbg.png'});await br.close();})();
