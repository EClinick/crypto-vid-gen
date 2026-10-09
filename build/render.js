// Usage: node render.js --out out/x.mp4 [--fps 30] [--scale 0.5] [--only tl] [--from 0] [--to 14.744] [--workers 4] [--audio]
// Renders stage.html frame-by-frame (deterministic renderFrame(t)) and encodes with ffmpeg.
const {chromium}=require('playwright-core');const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process');
const os=require('os');
const a=process.argv.slice(2);const arg=(k,d)=>{const i=a.indexOf('--'+k);return i<0?d:(a[i+1]===undefined||a[i+1].startsWith('--')?true:a[i+1]);};
const fps=+arg('fps',30),scale=+arg('scale',0.5),only=arg('only',null),from=+arg('from',0),to=+arg('to',14.744),workers=+arg('workers',6);
const out=path.resolve(arg('out','out/render.mp4'));const audio=arg('audio',!only); // full-stage renders always carry the mp3 soundtrack
const EXE=path.join(os.homedir(),'.cache/ms-playwright/chromium-1200/chrome-linux64/chrome');
const W=only?1920:3840,H=only?1080:2160;
(async()=>{
  const tmp=fs.mkdtempSync(path.join(path.dirname(out),'.frames-'));
  const N=Math.round((to-from)*fps);
  const browser=await chromium.launch({executablePath:EXE,args:['--disable-gpu-vsync','--font-render-hinting=none','--force-color-profile=srgb']});
  const url='file://'+path.join(__dirname,'stage.html')+(only?`?only=${only}`:'');
  let next=0;const t0=Date.now();
  await Promise.all(Array.from({length:workers},async()=>{
    const page=await browser.newPage({viewport:{width:W,height:H},deviceScaleFactor:scale});
    page.on('pageerror',e=>console.error('PAGEERROR',e.message));
    await page.goto(url);await page.evaluate(()=>window.__ready);
    while(true){const i=next++;if(i>=N)break;const t=from+i/fps;
      await page.evaluate(t=>window.renderFrame(t),t);
      await page.screenshot({path:path.join(tmp,`f${String(i).padStart(5,'0')}.png`),clip:{x:0,y:0,width:W,height:H}});
      if(i%60===0)process.stdout.write(`\r${i}/${N} ${((Date.now()-t0)/1000).toFixed(0)}s`);}
    await page.close();
  }));
  await browser.close();
  const ff=['-y','-v','error','-framerate',String(fps),'-i',path.join(tmp,'f%05d.png')];
  if(audio)ff.push('-i',path.resolve(__dirname,'../leomeethewoo_2107862685421572096.mp3'),'-map','0:v','-map','1:a','-c:a','aac','-b:a','192k','-shortest');
  ff.push('-c:v','libx264','-pix_fmt','yuv420p','-crf',scale>=1?'16':'20','-preset','medium',out);
  execFileSync('ffmpeg',ff,{stdio:'inherit'});fs.rmSync(tmp,{recursive:true});
  console.log(`\ndone ${out} ${((Date.now()-t0)/1000).toFixed(0)}s`);
})();
