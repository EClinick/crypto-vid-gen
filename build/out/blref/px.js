// node px.js file.ppm x,y x,y ...
const fs=require('fs');const b=fs.readFileSync(process.argv[2]);let s=b.toString('latin1',0,50).split(/\s+/);const W=+s[1],H=+s[2];
let off=0,n=0;for(let i=0;i<b.length;i++){if(b[i]===10){n++;if(n===3){off=i+1;break;}}}
for(const p of process.argv.slice(3)){const [x,y]=p.split(',').map(Number);const i=off+(y*W+x)*3;console.log(p,'#'+[b[i],b[i+1],b[i+2]].map(v=>v.toString(16).padStart(2,'0')).join(''));}
