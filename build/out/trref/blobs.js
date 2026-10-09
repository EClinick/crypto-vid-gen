const fs=require('fs');const {execFileSync}=require('child_process');
const W=960,H=540;const t=process.argv[2];
const b=execFileSync('ffmpeg',['-v','error','-ss',t,'-i','../leomeethewoo_2107862685421572096.mp4','-frames:v','1','-vf','crop=1920:1080:1920:0,scale=960:540','-f','rawvideo','-pix_fmt','rgb24','-'],{maxBuffer:1e8});
const lab=new Int32Array(W*H).fill(-1);const sat=i=>{const r=b[i*3],g=b[i*3+1],bl=b[i*3+2];return Math.max(r,g,bl)-Math.min(r,g,bl)};
const blobs=[];
for(let i=0;i<W*H;i++){if(lab[i]>=0||sat(i)<14)continue;const st=[i];lab[i]=blobs.length;let n=0,sx=0,sy=0,x0=1e9,x1=-1,y0=1e9,y1=-1,r=0,g=0,bb=0;
 while(st.length){const j=st.pop();const x=j%W,y=(j/W)|0;n++;sx+=x;sy+=y;x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);r+=b[j*3];g+=b[j*3+1];bb+=b[j*3+2];
  for(const k of [j-1,j+1,j-W,j+W]){if(k<0||k>=W*H||lab[k]>=0)continue;if(Math.abs((k%W)-x)>1)continue;if(sat(k)<14)continue;lab[k]=blobs.length;st.push(k);}}
 if(n>40)blobs.push({cx:+(sx/n*2).toFixed(0),cy:+(sy/n*2).toFixed(0),d:Math.max(x1-x0,y1-y0)*2+2,box:[x0*2,y0*2,x1*2,y1*2],col:'#'+[r,g,bb].map(v=>Math.round(v/n).toString(16).padStart(2,'0')).join('')});else blobs.push(null);}
console.log(t,JSON.stringify(blobs.filter(x=>x).sort((a,b)=>a.cy-b.cy)));
