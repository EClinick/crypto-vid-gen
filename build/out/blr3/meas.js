// node meas.js file.ppm -> phone L,R at y=700 and top y of "9:41" glyphs (first dark px in x 540-700)
const fs=require('fs');const b=fs.readFileSync(process.argv[2]);let n=0,off=0;for(let i=0;i<b.length;i++){if(b[i]===10){n++;if(n===3){off=i+1;break;}}}
const W=+b.toString('latin1',0,40).split(/\s+/)[1];const px=(x,y)=>{const i=off+(y*W+x)*3;return [b[i],b[i+1],b[i+2]];};
const white=(x,y)=>px(x,y).every(v=>v>252);
let L=-1,R=-1;const y=700;for(let x=200;x<960;x++)if(white(x,y)&&white(x+5,y)&&white(x+20,y)){L=x;break;}for(let x=1720;x>960;x--)if(white(x,y)&&white(x-5,y)&&white(x-20,y)){R=x;break;}
let T=-1;outer:for(let yy=0;yy<700;yy++)for(let x=540;x<720;x++){if(px(x,yy).every(v=>v<90)){T=yy;break outer;}}
let N=-1;outer2:for(let yy=400;yy<1080;yy++)for(let x=800;x<1120;x++){const p=px(x,yy);if(p[0]<90&&p[1]<90&&p[2]<90){N=yy;break outer2;}}
console.log(process.argv[3],'L',L,'R',R,'W',R-L,'C',(L+R)/2,'clockTop',T);
