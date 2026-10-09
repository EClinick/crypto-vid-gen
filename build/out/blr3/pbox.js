const fs=require('fs');const b=fs.readFileSync(process.argv[2]);let n=0,off=0;for(let i=0;i<b.length;i++){if(b[i]===10){n++;if(n===3){off=i+1;break;}}}
const W=+b.toString('latin1',0,40).split(/\s+/)[1],H=+b.toString('latin1',0,40).split(/\s+/)[2];let x0=1e9,x1=-1,y0=1e9,y1=-1;
for(let y=0;y<H;y+=2)for(let x=0;x<W;x+=2){const i=off+(y*W+x)*3;const r=b[i],g=b[i+1],bb=b[i+2];if(r>200&&g<170&&bb<140&&r-bb>90){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}}
console.log(process.argv[3],'x',x0,x1,'w',x1-x0,'y',y0,y1,'cy',(y0+y1)/2);
