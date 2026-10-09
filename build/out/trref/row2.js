const {execFileSync}=require('child_process');const W=1920,H=1080;
for(const t of process.argv.slice(2)){
const b=execFileSync('ffmpeg',['-v','error','-ss',t,'-i',process.env.VID||'../leomeethewoo_2107862685421572096.mp4','-frames:v','1','-vf',process.env.CROP||'crop=1920:1080:1920:0','-f','rawvideo','-pix_fmt','rgb24','-'],{maxBuffer:1e8});
let P={x0:1e9,x1:-1,y0:1e9,y1:-1},D={x0:1e9,x1:-1,y0:1e9,y1:-1},G={x0:1e9,x1:-1,y0:1e9,y1:-1};const cols=new Uint8Array(W);
const up=(o,x,y)=>{o.x0=Math.min(o.x0,x);o.x1=Math.max(o.x1,x);o.y0=Math.min(o.y0,y);o.y1=Math.max(o.y1,y)};
for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=(y*W+x)*3,r=b[i],g=b[i+1],bl=b[i+2];
 if(r>200&&bl>230&&g<175)up(P,x,y);
 else if(r<60&&g<60&&bl<60){ if(!(x>P.x0-5&&x<P.x1+5&&y>P.y0-5&&y<P.y1+5)){up(D,x,y);cols[x]=1;}}
 else if(g>170&&r<120&&bl<170&&g-r>80)up(G,x,y);}
// dark text runs (gaps > 25px)
let runs=[],s=-1,gap=0;for(let x=0;x<W;x++){if(cols[x]){if(s<0)s=x;gap=0;}else if(s>=0){gap++;if(gap>25){runs.push([s,x-gap]);s=-1;gap=0;}}}if(s>=0)runs.push([s,W]);
console.log(t,'purple',JSON.stringify(P),'d',P.x1-P.x0,'dark',JSON.stringify(D),'runs',JSON.stringify(runs),'green',JSON.stringify(G));}
