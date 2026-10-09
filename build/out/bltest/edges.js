const fs=require('fs');const [f,y]=[process.argv[2],+process.argv[3]];const b=fs.readFileSync(f);let n=0,off=0;for(let i=0;i<b.length;i++){if(b[i]===10){n++;if(n===3){off=i+1;break;}}}
const W=1920;const white=x=>{const i=off+(y*W+x)*3;return b[i]>252&&b[i+1]>252&&b[i+2]>252;};
let L=-1,R=-1;for(let x=200;x<960;x++)if(white(x)&&white(x+5)&&white(x+20)){L=x;break;}for(let x=1720;x>960;x--)if(white(x)&&white(x-5)&&white(x-20)){R=x;break;}console.log(f.split('/').pop(),'y',y,'L',L,'R',R,'W',R-L,'C',(L+R)/2);
