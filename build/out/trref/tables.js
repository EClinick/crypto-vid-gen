const {execFileSync}=require('child_process');const W=960,H=540;
const raw=execFileSync('ffmpeg',['-v','error','-t','2.97','-i','../leomeethewoo_2107862685421572096.mp4','-vf','crop=1920:1080:1920:0,fps=30,scale=960:540','-f','rawvideo','-pix_fmt','rgb24','-'],{maxBuffer:1e9});
const F=raw.length/(W*H*3);const out={A:[],B:[]};
function blobs(b){const lab=new Uint8Array(W*H);const sat=i=>{const r=b[i*3],g=b[i*3+1],bl=b[i*3+2];return Math.max(r,g,bl)-Math.min(r,g,bl)};const res=[];
 for(let i=0;i<W*H;i++){if(lab[i]||sat(i)<14)continue;const st=[i];lab[i]=1;let n=0,sx=0,sy=0,x0=1e9,x1=-1,y0=1e9,y1=-1,r=0,g=0,bb=0;
  while(st.length){const j=st.pop();const x=j%W,y=(j/W)|0;n++;sx+=x;sy+=y;x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);r+=b[j*3];g+=b[j*3+1];bb+=b[j*3+2];
   for(const k of [j-1,j+1,j-W,j+W]){if(k<0||k>=W*H||lab[k])continue;if(Math.abs((k%W)-x)>1)continue;if(sat(k)<14)continue;lab[k]=1;st.push(k);}}
  if(n>40)res.push({cx:sx/n*2,cy:sy/n*2,d:Math.max(x1-x0,y1-y0)*2+2,edge:x0<2||y0<2||x1>W-3||y1>H-3,r:r/n,g:g/n,b:bb/n});}
 return res;}
for(let f=0;f<F;f++){const t=f/30;const b=raw.subarray(f*W*H*3,(f+1)*W*H*3);
 if(t<0.966){const bl=blobs(b).filter(x=>!x.edge);const fg=bl.filter(x=>x.d>110),bg=bl.filter(x=>x.d<=110&&x.d>70);
  const m=fg.find(x=>x.r<140&&x.g<100);// maroon
  const ang=x=>Math.atan2(x.cy-540,x.cx-960)*180/Math.PI;
  // bg rotation mod 30 (lattice offset -10.5 at t0)
  const bgm=bg.map(x=>{let a=((ang(x)+10.5)%30+30)%30;if(a>15)a-=30;return a});const bgr=bg.map(x=>Math.hypot(x.cx-960,x.cy-540));
  const fgr=fg.map(x=>Math.hypot(x.cx-960,x.cy-540));
  out.A.push([+t.toFixed(4),m?+ang(m).toFixed(2):null,+(fgr.reduce((a,c)=>a+c,0)/fgr.length).toFixed(1),+(fg.reduce((a,c)=>a+c.d,0)/fg.length).toFixed(1),+(bgm.reduce((a,c)=>a+c,0)/bgm.length).toFixed(2),+(bgr.reduce((a,c)=>a+c,0)/bgr.length).toFixed(1),+(bg.reduce((a,c)=>a+c.d,0)/bg.length).toFixed(1)]);}
 else{let P={x0:1e9,x1:-1,y0:1e9,y1:-1};for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=(y*W+x)*3;if(b[i]>200&&b[i+2]>230&&b[i+1]<175){P.x0=Math.min(P.x0,x);P.x1=Math.max(P.x1,x);P.y0=Math.min(P.y0,y);P.y1=Math.max(P.y1,y);}}
  out.B.push([+t.toFixed(4),(P.x0+P.x1+1),(P.y0+P.y1+1),(P.x1-P.x0+1)*2]);}}
console.log(JSON.stringify(out));
