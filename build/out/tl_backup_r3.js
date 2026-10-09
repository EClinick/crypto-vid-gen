// TOP-LEFT quadrant: category cards -> score gauge overview -> phone -> credit line unlock -> sunburst credit line.
(function(){
const P = 5.9666;
// reference-sampled badge values (15fps) for the big cards and overview
const seq=(t0,vals)=>vals.map((v,i)=>[t0+i/15,v]);
const BIGV=[seq(0,[25,32,38,43,45,46,46,46,46]), seq(0.533,[20,27,30,32,32]), seq(0.8,[22,28,31,32,32]), seq(1.067,[21,29,37,46,46]), seq(1.333,[21,29,37,45,45]), seq(1.6,[21,30,40,50,61,71,71])];
const OVW=[18,21,24,27,30,33,35,37,39,40,42,43,44,45,45,46,46,46,46,46], OVA=[12,15,17,19,21,23,24,26,27,28,29,30,30,31,31,32,32,32,32,32], OVC=[19,22,26,29,32,35,37,39,41,43,44,45,46,47,48,48,49,49,49,49], OVS=[29,33,38,43,48,52,55,59,61,64,66,68,69,70,71,72,73,73,73,73];
const OVV=[seq(2.0,OVW),seq(2.0,OVA),seq(2.0,OVA),seq(2.0,OVC),seq(2.0,OVC),seq(2.0,OVS)];
// odometer column positions (digit value, continuous) for thousands/hundreds/tens/ones: 710 -> 1000
const step=(pts)=>pts;
const lin=(t,pts)=>{ if(t<=pts[0][0])return pts[0][1]; for(let i=0;i<pts.length-1;i++){ if(t<=pts[i+1][0]){const k=(t-pts[i][0])/(pts[i+1][0]-pts[i][0]); return pts[i][1]+(pts[i+1][1]-pts[i][1])*k;} } return pts[pts.length-1][1]; };
const ODO=[
  [[2.3,0],[2.333,0.3],[2.4,0.7],[2.467,1],[2.6,1]],
  [[1.9,7],[2.2,7],[2.267,7.95],[2.333,8],[2.4,8.25],[2.467,9],[2.533,9.05],[2.6,9.15],[2.667,9.5],[2.733,10],[2.9,10]],
  [[1.9,1],[2.0,1],[2.067,1.5],[2.133,2],[2.2,3.5],[2.267,5],[2.333,6],[2.4,7],[2.467,8],[2.533,8.5],[2.6,9],[2.667,9.3],[2.733,9.65],[2.8,10],[2.9,10]],
  [[1.9,0],[2.0,0],[2.067,0.5],[2.133,1],[2.2,3.5],[2.267,5],[2.333,6],[2.4,7],[2.467,8],[2.533,8.1],[2.6,9],[2.733,9.1],[2.8,9.5],[2.867,9.75],[2.95,9.92],[3.03,10]],
];
const DARK = '#1c2a12';
const NS = 'http://www.w3.org/2000/svg';

// ---- small helpers -------------------------------------------------------
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const prog=(t,a,b)=>clamp((t-a)/(b-a));
const eOutC=k=>1-Math.pow(1-k,3), eInOutC=k=>k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;
const eOutSine=k=>Math.sin(k*Math.PI/2), eInQ=k=>k*k;
// Catmull-Rom keyframe interpolation through [[t,v],...]
function kf(t, pts){
  if(t<=pts[0][0]) return pts[0][1];
  const n=pts.length; if(t>=pts[n-1][0]) return pts[n-1][1];
  let i=0; while(t>pts[i+1][0]) i++;
  const p0=pts[Math.max(0,i-1)], p1=pts[i], p2=pts[i+1], p3=pts[Math.min(n-1,i+2)];
  const k=(t-p1[0])/(p2[0]-p1[0]);
  const m1=(p2[1]-p0[1])/(p2[0]-p0[0])*(p2[0]-p1[0]);
  const m2=(p3[1]-p1[1])/(p3[0]-p1[0])*(p2[0]-p1[0]);
  const k2=k*k,k3=k2*k;
  return (2*k3-3*k2+1)*p1[1]+(k3-2*k2+k)*m1+(-2*k3+3*k2)*p2[1]+(k3-k2)*m2;
}
const div=(css,html)=>{const e=document.createElement('div');if(css)e.style.cssText=css;if(html!==undefined)e.innerHTML=html;return e;};
const deg=a=>a*Math.PI/180;
function arcPath(cx,cy,r,a0,a1){ // degrees, screen coords (0=right, 90=down), clockwise a0->a1
  if(a1-a0<0.01) a1=a0+0.01;
  const x0=cx+r*Math.cos(deg(a0)), y0=cy+r*Math.sin(deg(a0)), x1=cx+r*Math.cos(deg(a1)), y1=cy+r*Math.sin(deg(a1));
  return `M${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 ${(a1-a0)>180?1:0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}

// ---- icons (24x24 viewBox, stroke) ---------------------------------------
const ICON = {
  dollar: `<text x="12" y="18.6" text-anchor="middle" font-family="Inter" font-weight="400" font-size="21" fill="${DARK}" stroke="none">$</text>`,
  card: `<rect x="6" y="5.5" width="14.5" height="10" rx="2.2"/><path d="M6 9h14.5"/><path d="M3.5 9.2v6.6a2.2 2.2 0 0 0 2.2 2.2h11.2"/>`,
  wallet: `<path d="M6.2 5.2h9.6a1.6 1.6 0 0 1 1.6 1.6v1.6"/><path d="M5 6.6v11a1.8 1.8 0 0 0 1.8 1.8h11a1.8 1.8 0 0 0 1.8-1.8V10.2a1.8 1.8 0 0 0-1.8-1.8H6.4A1.4 1.4 0 0 1 5 7v-.4a1.4 1.4 0 0 1 1.4-1.4"/><rect x="14.4" y="11.8" width="5.4" height="3.6" rx="1"/>`,
  cex: `<path d="M4.5 9h14.5M15.3 5.2l3.8 3.8-3.8 3.8"/><path d="M19.5 15H5M8.7 11.2L4.9 15l3.8 3.8"/>`,
  bank: `<path d="M3.6 8.6L12 3.8l8.4 4.8z"/><path d="M4 9.6h16"/><path d="M6.4 11v6.8M10.1 11v6.8M13.9 11v6.8M17.6 11v6.8"/><path d="M3.8 19.6h16.4"/>`,
  socials: `<path d="M12 3.4l2.1 1.5 2.6-.1.8 2.4 2.1 1.5-.8 2.5.8 2.5-2.1 1.5-.8 2.4-2.6-.1L12 20.6l-2.1-1.5-2.6.1-.8-2.4-2.1-1.5.8-2.5-.8-2.5 2.1-1.5.8-2.4 2.6.1z"/><path d="M8.6 12.1l2.4 2.4 4.4-4.7"/>`,
};
function iconSVG(name, size, sw){
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${DARK}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" style="display:block">${ICON[name]}</svg>`;
}

const CATS = [
  {k:'cash',   t:'Cash held',        s:'Average balance<br>over 30 days',          c:'#ccff0f', ic:'dollar', side:-1},
  {k:'card',   t:'Card Spending',    s:'Monthly swipe volume<br>&amp; consistency',c:'#6ce4fe', ic:'card',   side:-1},
  {k:'wallet', t:'On-chain Wallets', s:'Holdings &amp; transaction',               s2:'Holdings &amp; transaction<br>history', c:'#d27efa', ic:'wallet', side:-1},
  {k:'cex',    t:'CEX Accounts',     s:'Exchange history &amp;<br>realized PnL',   c:'#f6be07', ic:'cex',    side:1},
  {k:'bank',   t:'Bank accounts',    s:'Income &amp; spend patterns',             c:'#f583a5', ic:'bank',   side:1},
  {k:'socials',t:'Socials',          s:'Reputation &amp;<br>identity signals',     c:'#fcf249', ic:'socials',side:1},
];

// A category item: badge + ring + icon + title + subtitle, centered on the icon (0,0)
function makeItem(cat, M, sub){
  const root = div(`position:absolute;left:0;top:0;width:0;height:0;`);
  const R = M.ringR, W = M.ringW, pad = R+W;
  const svg = document.createElementNS(NS,'svg');
  svg.setAttribute('width',2*pad); svg.setAttribute('height',2*pad);
  svg.style.cssText=`position:absolute;left:${-pad}px;top:${-pad}px;overflow:visible`;
  svg.innerHTML = `
    <defs><filter id="sh_${M.id}_${cat.k}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="${W*0.35}"/></filter></defs>
    <path d="${arcPath(pad,pad+W*0.25,R,133,407)}" stroke="rgba(0,0,0,0.07)" stroke-width="${W}" fill="none" stroke-linecap="round" filter="url(#sh_${M.id}_${cat.k})"/>
    <path d="${arcPath(pad,pad,R,133,407)}" stroke="#eeeeec" stroke-width="${W}" fill="none" stroke-linecap="round"/>
    <path d="${arcPath(pad,pad,R-W*0.5+1,133,407)}" stroke="rgba(0,0,0,0.035)" stroke-width="2" fill="none"/>
    <path class="arc" d="" stroke="${cat.c}" stroke-width="${W}" fill="none" stroke-linecap="round"/>`;
  root.appendChild(svg);
  const ic = div(`position:absolute;left:${-M.iconR}px;top:${-M.iconR}px;width:${2*M.iconR}px;height:${2*M.iconR}px;border-radius:50%;background:${cat.c};display:flex;align-items:center;justify-content:center;box-shadow:0 ${M.iconR*0.08}px ${M.iconR*0.25}px rgba(0,0,0,0.06)`,
    iconSVG(cat.ic, M.iconR*(cat.ic==='dollar'?1.3:1.3), cat.ic==='dollar'?1.6:1.9));
  root.appendChild(ic);
  const bx = cat.side<0 ? -M.badgeDX : M.badgeDX2;
  const badge = div(`position:absolute;left:${bx}px;top:${M.badgeDY}px;transform:translate(-50%,-50%);height:${M.badgeH}px;padding:0 ${M.badgeH*0.36}px;border-radius:${M.badgeH/2}px;background:#e9e9e6;display:flex;align-items:center;font:500 ${M.badgeF}px/1 Inter;letter-spacing:-0.01em;color:${DARK};white-space:nowrap;font-feature-settings:'tnum' 0`);
  badge.innerHTML = `<span style="color:${M.plusC};font-weight:400">+</span><span class="n">00</span>`;
  root.appendChild(badge);
  const title = div(`position:absolute;left:-600px;width:1200px;top:${M.titleDY}px;transform:translateY(-50%);text-align:center;font:${M.titleW} ${M.titleF}px/1 Newsreader;font-variation-settings:'opsz' 36;letter-spacing:-0.012em;color:${DARK};white-space:nowrap`, cat.t);
  root.appendChild(title);
  const st = div(`position:absolute;left:-600px;width:1200px;top:${M.subDY}px;text-align:center;font:400 ${M.subF}px/${M.subLH}px Inter;letter-spacing:-0.005em;color:#5c6254;white-space:nowrap`, sub);
  root.appendChild(st);
  return {root, arc:svg.querySelector('.arc'), n:badge.querySelector('.n'), M, pad, set(arcLen, num){
    this.arc.setAttribute('d', arcLen>0.5? arcPath(pad,pad,R,133,133+arcLen):'');
    this.arc.style.opacity = arcLen>0.5?1:0;
    this.n.textContent = String(Math.round(num));
  }};
}

const BIG = {id:'big', iconR:124, ringR:175, ringW:40, badgeDX:313, badgeDX2:300, badgeDY:-195, badgeH:117, badgeF:80, plusC:'#1c2a12',
  titleF:124, titleW:480, titleDY:250, subF:66, subDY:335, subLH:83};
const SMALL = {id:'sm', iconR:39, ringR:53, ringW:13, badgeDX:96, badgeDX2:104, badgeDY:-58, badgeH:40, badgeF:24, plusC:DARK,
  titleF:38, titleW:450, titleDY:76, subF:20.5, subDY:100, subLH:25.5};

// ---- gauge (radial ticks) -------------------------------------------------
function makeGauge(cx,cy,ri,ro,n,sw,opts={}){
  const svg=document.createElementNS(NS,'svg');
  const pad=40; const W=2*(ro+pad), H=ro+pad+(opts.below||0);
  svg.setAttribute('width',W); svg.setAttribute('height',H);
  svg.style.cssText=`position:absolute;left:${cx-ro-pad}px;top:${cy-ro-pad}px;overflow:visible`;
  const c=ro+pad;
  let s=`<defs>
    <radialGradient id="gb_${opts.id}" cx="${c}" cy="${c}" r="${ro}" gradientUnits="userSpaceOnUse">
      <stop offset="${ri/ro}" stop-color="#f2fcd0"/><stop offset="${(ri/ro+1)/2}" stop-color="#e6fb98"/><stop offset="1" stop-color="#dcf879"/></radialGradient>
  </defs>
  <path class="band" d="" stroke="url(#gb_${opts.id})" stroke-width="${ro-ri}" fill="none"/>`;
  for(let i=0;i<n;i++){
    const a=deg(180+180*i/(n-1));
    const x0=c+ri*Math.cos(a), y0=c+ri*Math.sin(a), x1=c+ro*Math.cos(a), y1=c+ro*Math.sin(a);
    s+=`<line x1="${x0.toFixed(2)}" y1="${y0.toFixed(2)}" x2="${x1.toFixed(2)}" y2="${y1.toFixed(2)}" stroke-width="${sw}" stroke-linecap="butt"/>`;
  }
  svg.innerHTML=s;
  const lines=[...svg.querySelectorAll('line')], band=svg.querySelector('.band');
  return {svg, set(frac){
    const rm=(ri+ro)/2;
    band.setAttribute('d', frac>0.002? arcPath(c,c,rm,180,180+180*frac+0.6):'');
    lines.forEach((l,i)=>{const on=i/(n-1)<=frac+1e-6; l.setAttribute('stroke', on? (opts.on||'#c6f02c') : (opts.off||'#dfdfdd'));});
  }};
}

// ---- odometer -------------------------------------------------------------
function makeOdo(cols, fontPx, opts={}){
  const lh = fontPx*1.18;
  const root = div(`position:absolute;display:flex;align-items:flex-start;justify-content:center;font:${opts.weight||500} ${fontPx}px/${lh}px Inter;letter-spacing:${opts.ls||'-0.045em'};color:${opts.color||DARK};white-space:nowrap`);
  const colEls=[];
  for(let i=0;i<cols;i++){
    const fid=`odo_${opts.id}_${i}`;
    const svg=`<svg width="0" height="0" style="position:absolute"><filter id="${fid}" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="0 0"/></filter></svg>`;
    const c=div(`position:relative;height:${lh*1.6}px;margin:${-lh*0.3}px 0;overflow:hidden`);
    let digits=''; for(let r=0;r<5;r++) for(let d=0;d<10;d++) digits+=`<div style="height:${lh}px">${(opts.blank0&&i===0&&d===0)?'&nbsp;':d}</div>`;
    const strip=div(`position:relative;filter:url(#${fid})`, digits);
    c.innerHTML=svg; c.appendChild(strip);
    root.appendChild(c);
    colEls.push({c,strip,blur:c.querySelector('feGaussianBlur')});
  }
  return {root, lh, set(positions, vels, widths){
    colEls.forEach((ce,i)=>{
      const p=positions[i];
      ce.strip.style.transform=`translateY(${(lh*0.3-((p%50+50)%50)*lh).toFixed(2)}px)`;
      {const ga=(Math.min(1,Math.abs(vels[i])/10)*0.3).toFixed(3); const m=`linear-gradient(to bottom,transparent 0,rgba(0,0,0,${ga}) 12%,#000 26%,#000 76%,rgba(0,0,0,${ga}) 90%,transparent 100%)`; ce.c.style.webkitMaskImage=m; ce.c.style.maskImage=m;}
      ce.blur.setAttribute('stdDeviation',`0 ${Math.min(fontPx*0.09, Math.abs(vels[i])*fontPx*0.005).toFixed(2)}`);
      if(widths) { ce.c.style.width = widths[i].toFixed(2)+'px'; ce.c.style.opacity = 1; }
    });
  }};
}

// ---- phone ----------------------------------------------------------------
function chevron(size,color='#5d615a'){return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 6l6 6-6 6"/></svg>`;}
function sparkle(size,color){return `<svg width="${size}" height="${size}" viewBox="0 0 24 24"><path d="M12 0C12.8 7.5 16.5 11.2 24 12 16.5 12.8 12.8 16.5 12 24 11.2 16.5 7.5 12.8 0 12 7.5 11.2 11.2 7.5 12 0z" fill="${color}"/></svg>`;}
function lockSVG(open, color, size){
  const shackle = open? `<path d="M7 11V7.2a4.6 4.6 0 0 1 9.2 0" />` : `<path d="M7.4 11V8a4.6 4.6 0 0 1 9.2 0v3"/>`;
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.3" stroke-linecap="round">${shackle}<rect x="5" y="10.6" width="14" height="11" rx="2" fill="${color}" stroke="none"/><rect x="11" y="14.2" width="2" height="3.8" rx="1" fill="${open?'#cfe86a':'#eee'}" stroke="none"/></svg>`;
}
function outlinedDollar(size){
  return `<svg width="${size}" height="${size}" viewBox="0 0 40 40"><text x="20" y="31" text-anchor="middle" font-family="Inter" font-weight="800" font-size="34" fill="#ccff0f" stroke="${DARK}" stroke-width="2.4" paint-order="stroke" stroke-linejoin="round">$</text><text x="20" y="31" text-anchor="middle" font-family="Inter" font-weight="800" font-size="34" fill="none" stroke="#ccff0f" stroke-width="0" >$</text></svg>`;
}
function smallRing(cx,cy,val,arcA0,arcA1,color){
  const r=33,w=6.5,p=r+w;
  return `<div style="position:absolute;left:${cx-p}px;top:${cy-p}px;width:${2*p}px;height:${2*p}px">
    <svg width="${2*p}" height="${2*p}" style="position:absolute;left:0;top:0;overflow:visible"><circle cx="${p}" cy="${p}" r="${r}" stroke="#ececea" stroke-width="${w}" fill="none"/>
    ${arcA1>arcA0?`<path d="${arcPath(p,p,r,arcA0,arcA1)}" stroke="${color}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`:''}</svg>
    <div style="position:absolute;left:0;top:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;font:400 23px Inter;letter-spacing:-0.02em;color:#2a2f26">${val}</div></div>`;
}

function makePhone(){
  const W=524,H=1092;
  const ph = div(`position:absolute;left:0;top:0;width:${W}px;height:${H}px;transform-origin:0 0`);
  // side buttons
  ph.innerHTML = `
   <div style="position:absolute;left:-5px;top:228px;width:8px;height:58px;border-radius:3px;background:#2a2a30"></div>
   <div style="position:absolute;left:-5px;top:318px;width:8px;height:96px;border-radius:3px;background:#2a2a30"></div>
   <div style="position:absolute;left:-5px;top:430px;width:8px;height:96px;border-radius:3px;background:#2a2a30"></div>
   <div style="position:absolute;right:-5px;top:340px;width:8px;height:150px;border-radius:3px;background:#2a2a30"></div>
   <div style="position:absolute;inset:0;border-radius:92px;background:linear-gradient(90deg,#3a3a42,#16161a 6%,#16161a 94%,#3a3a42);box-shadow:0 30px 60px rgba(0,0,0,0.10)"></div>`;
  const scr = div(`position:absolute;left:17px;top:17px;width:${W-34}px;height:${H-34}px;border-radius:76px;background:#f4f4f3;overflow:hidden`);
  ph.appendChild(scr);
  // content uses phone-outer coordinates: wrap with offset
  const c = div(`position:absolute;left:-17px;top:-17px;width:${W}px;height:${H}px`);
  scr.appendChild(c);
  const add=(css,html)=>{const e=div('position:absolute;'+css,html);c.appendChild(e);return e;};
  // lime glow behind gauge
  add(`left:-60px;top:135px;width:644px;height:420px;background:radial-gradient(ellipse 52% 50% at 50% 55%, rgba(214,250,70,0.55), rgba(226,252,140,0.25) 55%, rgba(244,244,243,0) 80%)`);
  // status bar
  add(`left:72px;top:40px;width:120px;font:600 22px/32px Inter;letter-spacing:-0.01em;color:#111;text-align:center`,'23:59');
  add(`left:184px;top:34px;width:152px;height:46px;border-radius:23px;background:#0b0b0d`);
  add(`left:366px;top:46px;width:110px;height:22px`,`<svg width="110" height="22" viewBox="0 0 110 22">
    <rect x="2" y="13" width="4" height="6" rx="1" fill="#111"/><rect x="8" y="10" width="4" height="9" rx="1" fill="#111"/><rect x="14" y="6.5" width="4" height="12.5" rx="1" fill="#111"/><rect x="20" y="3" width="4" height="16" rx="1" fill="#111"/>
    <path d="M33 8.5a14 14 0 0 1 19 0M36.5 12a9 9 0 0 1 12 0M40 15.5a4 4 0 0 1 5 0" stroke="#111" stroke-width="2.6" fill="none" stroke-linecap="round"/><circle cx="42.5" cy="18" r="1.6" fill="#111"/>
    <rect x="60" y="3" width="34" height="17" rx="5" fill="#111"/><text x="77" y="16" text-anchor="middle" font-family="Inter" font-weight="700" font-size="12" fill="#fff">100</text><rect x="95.5" y="8.5" width="2.5" height="6" rx="1" fill="#111"/></svg>`);
  // header
  add(`left:42px;top:95px;width:52px;height:52px;border-radius:50%;background:radial-gradient(circle at 50% 45%,#d9ff3e,#c8f71a 70%,#dff98a);box-shadow:0 4px 12px rgba(190,240,40,0.45);display:flex;align-items:center;justify-content:center;font:500 27px Newsreader;color:${DARK}`,'M');
  add(`left:107px;top:100px;font:500 30px/42px Newsreader;letter-spacing:-0.01em;color:${DARK}`,'Score');
  add(`left:367px;top:93px;width:52px;height:52px;border-radius:50%;border:1.5px solid #e2e2e0;box-sizing:border-box;display:flex;align-items:center;justify-content:center`,
    `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5l4.5 4.5"/></svg>`);
  add(`left:427px;top:93px;width:52px;height:52px;border-radius:50%;border:1.5px solid #e2e2e0;box-sizing:border-box;display:flex;align-items:center;justify-content:center`,
    `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round"><path d="M4 6.5h16M4 12h16M4 17.5h16"/></svg>`);
  // gauge
  const g = makeGauge(260,376,143,210,61,2.6,{id:'ph',on:'#c4ef25'});
  g.set(1); c.appendChild(g.svg);
  add(`left:60px;top:282px;width:400px;text-align:center;font:500 92px/100px Inter;letter-spacing:-0.05em;color:${DARK}`,'1000');
  // rewards / lottery cards
  const cardCss=`border-radius:22px;background:linear-gradient(180deg,rgba(255,255,255,0.92),rgba(250,250,249,0.96));border:1.5px solid rgba(225,225,222,0.9);box-shadow:0 6px 18px rgba(0,0,0,0.03)`;
  const rwg=div('position:absolute;left:0;top:0;width:100%;height:100%'); c.appendChild(rwg); const addR=(css,html)=>{const e=div('position:absolute;'+css,html);rwg.appendChild(e);return e;};
  addR(`left:38px;top:429px;width:217px;height:106px;${cardCss}`);
  addR(`left:57px;top:443px;font:400 19px/24px Inter;color:#7a7c77`,'Rewards');
  addR(`left:214px;top:441px;width:28px;height:28px;border-radius:50%;background:#f0f0ee;display:flex;align-items:center;justify-content:center`,chevron(16));
  const rewards = addR(`left:56px;top:482px;font:500 30px/38px Inter;letter-spacing:-0.02em;color:${DARK}`,'$54.20');
  addR(`left:268px;top:429px;width:217px;height:106px;${cardCss}`);
  addR(`left:287px;top:443px;font:400 19px/24px Inter;color:#7a7c77`,'Lottery');
  addR(`left:404px;top:441px;width:68px;height:28px;border-radius:14px;background:#d6ff3c;box-shadow:0 0 12px rgba(200,250,40,0.7);display:flex;align-items:center;justify-content:center;font:500 17px Inter;letter-spacing:-0.02em;color:#2a3a10`,'$1.1M');
  addR(`left:452px;top:411px;width:30px;height:30px`,sparkle(30,'#d3fb3a'));
  addR(`left:445px;top:403px;width:14px;height:14px`,sparkle(14,'#d3fb3a'));
  addR(`left:286px;top:482px;font:500 30px/38px Inter;color:${DARK}`,`7 <span style="font-size:19px;color:#7a7c77;font-weight:400">Entries</span>`);
  // credit line card (complex; separate layers)
  const credit = div(`position:absolute;left:35px;top:558px;width:452px;height:136px;transform-origin:226px 68px`); ph.appendChild(credit);
  const cBase = div(`position:absolute;inset:0;border-radius:24px;background:linear-gradient(180deg,#ececeb 0%,#e3e3e2 55%,#dcdcdb 100%);box-shadow:inset 0 1px 0 rgba(255,255,255,0.9)`);
  credit.appendChild(cBase);
  // glass layers
  const glassWrap = div(`position:absolute;inset:-30px -10px;opacity:0`);
  const limeWrap = div(`position:absolute;inset:0;filter:url(#tl_liquid)`);
  const glassGray = div(`position:absolute;left:10px;right:10px;top:30px;bottom:30px;border-radius:26px;background:linear-gradient(90deg,#f2f2f2 0%,#d8d8d8 4%,#b9b9b9 11%,#d6d6d6 19%,#e7e7e7 28%,#e7e7e7 72%,#d6d6d6 81%,#b9b9b9 89%,#d8d8d8 96%,#f2f2f2 100%)`);
  const glassLime = div(`position:absolute;left:10px;right:10px;top:30px;bottom:30px;border-radius:26px;`);
  const glassSwirl = div(`position:absolute;left:50%;top:50%;width:260px;height:260px;margin:-130px 0 0 -130px;border-radius:50%;background:conic-gradient(from 0deg, rgba(255,255,255,0) 0deg, rgba(255,255,255,0.75) 25deg, rgba(255,255,255,0) 60deg, rgba(255,255,255,0) 180deg, rgba(255,255,255,0.65) 205deg, rgba(255,255,255,0) 240deg);-webkit-mask-image:radial-gradient(circle, transparent 38%, #000 42%, #000 58%, transparent 63%);filter:blur(2px)`);
  const glassRing = div(`position:absolute;left:50%;top:50%;width:300px;height:220px;margin:-110px 0 0 -150px;border-radius:50%;background:radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0) 30%, rgba(255,255,255,0.55) 48%, rgba(255,255,255,0) 66%);opacity:0`);
  glassWrap.appendChild(glassGray); limeWrap.appendChild(glassLime); limeWrap.appendChild(glassRing); limeWrap.appendChild(glassSwirl); glassWrap.appendChild(limeWrap);
  credit.appendChild(glassWrap);
  // sun-state lime card
  const cLime = div(`position:absolute;inset:0;border-radius:24px;background:linear-gradient(170deg,#e4fd6a 0%,#d8fb3e 45%,#cdf515 100%);box-shadow:0 10px 24px rgba(190,240,30,0.35);opacity:0`);
  credit.appendChild(cLime);
  const cTitle = div(`position:absolute;left:20px;top:33px;transform:translateY(-50%);font:400 19px/24px Inter;color:#30352c`,'Credit line');
  credit.appendChild(cTitle);
  const cChev = div(`position:absolute;left:410px;top:16px;width:28px;height:28px;border-radius:50%;background:rgba(0,0,0,0.06);display:flex;align-items:center;justify-content:center`,chevron(16,'#585c55'));
  credit.appendChild(cChev);
  const cLock = div(`position:absolute;left:206px;top:46px;width:44px;height:44px;display:flex;align-items:center;justify-content:center`,lockSVG(false,'#5c5f59',38));
  credit.appendChild(cLock);
  const cLockOpen = div(`position:absolute;left:202px;top:44px;width:50px;height:50px;opacity:0`,lockSVG(true,'#ffffff',50));
  credit.appendChild(cLockOpen);
  const cAmt = div(`position:absolute;left:19px;top:59px;font:500 31px/40px Inter;letter-spacing:-0.025em;color:${DARK};opacity:0;white-space:nowrap`);
  credit.appendChild(cAmt);
  const cBarT = div(`position:absolute;left:20px;top:104px;width:412px;height:10px;border-radius:5px;background:rgba(190,240,20,0.55);opacity:0`);
  const cBar = div(`position:absolute;left:0;top:0;height:10px;border-radius:5px;background:#26360f`);
  cBarT.appendChild(cBar); credit.appendChild(cBarT);
  // cash held row
  const low=div('position:absolute;left:0;top:0;width:100%;height:100%'); c.appendChild(low); const addL=(css,html)=>{const e=div('position:absolute;'+css,html);low.appendChild(e);return e;};
  addL(`left:43px;top:741px;width:54px;height:54px;border-radius:50%;background:#ccff0f;box-shadow:0 6px 14px rgba(190,240,30,0.35);display:flex;align-items:center;justify-content:center`,outlinedDollar(40));
  addL(`left:115px;top:744px;font:500 19.5px/24px Inter;color:${DARK}`,'Cash Held');
  addL(`left:115px;top:770px;font:400 15.5px/20px Inter;color:#8a8c86`,'Average balance over 30 days');
  low.insertAdjacentHTML('beforeend', smallRing(446,768,'+73',100,250,'#ccff0f'));
  addL(`left:39px;top:814px;width:116px;height:38px;border-radius:19px;background:#ccff0f;box-shadow:0 5px 12px rgba(190,240,30,0.4);display:flex;align-items:center;justify-content:center;font:500 18.5px Inter;color:${DARK}`,'<span style="font-size:24px;font-weight:300;margin-right:6px;margin-top:-3px">+</span>Top up');
  // card spending row
  addL(`left:43px;top:900px;width:54px;height:54px;border-radius:50%;background:#7ce6fb;display:flex;align-items:center;justify-content:center`,iconSVG('card',34,1.7));
  addL(`left:116px;top:903px;font:500 19px/24px Inter;color:#2c3029`,'Card Spending');
  addL(`left:116px;top:929px;font:400 15.5px/20px Inter;color:#9a9c96`,'How much you swipe each month');
  low.insertAdjacentHTML('beforeend', smallRing(446,927,'+0',0,0,'#7ce6fb'));
  // tab bar
  add(`left:60px;top:980px;font:400 16px Inter;color:#c8c8c6`,'ⓘ Keep');
  add(`left:120px;top:950px;width:280px;height:76px;border-radius:38px;background:rgba(255,255,255,0.95);box-shadow:0 8px 24px rgba(0,0,0,0.07)`);
  add(`left:157px;top:972px;width:32px;height:32px`,`<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8f918c" stroke-width="1.6" stroke-linejoin="round"><path d="M4.5 10.5L12 4.5l7.5 6V19a1 1 0 0 1-1 1h-4v-5.5h-5V20h-4a1 1 0 0 1-1-1z"/></svg>`);
  add(`left:244px;top:970px;width:38px;height:38px`,`<svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#2a2d27" stroke-width="1.6" stroke-linecap="round"><path d="M3.5 16.5a8.5 8.5 0 0 1 17 0"/><path d="M12 16.5l3.6-4.6"/><path d="M7 16.5a5 5 0 0 1 2-4"/></svg>`);
  add(`left:338px;top:972px;width:32px;height:32px`,`<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8f918c" stroke-width="1.5" stroke-linejoin="round"><path d="M12 3.5c.7 4.6 3.4 7.4 8 8.2-4.6.8-7.3 3.6-8 8.2-.7-4.6-3.4-7.4-8-8.2 4.6-.8 7.3-3.6 8-8.2z"/></svg>`);
  add(`left:175px;top:1053px;width:174px;height:7px;border-radius:4px;background:#121214`);
  return {ph, rwg, low, rewards, credit, cBase, glassRing, glassWrap, glassGray, glassLime, glassSwirl, cLime, cTitle, cChev, cLock, cLockOpen, cAmt, cBarT, cBar};
}

// ===========================================================================
window.SCENES.tl = {
  init(root){
    root.style.background='#f6f6f6';
    root.innerHTML='';
    // liquid displacement filter
    root.insertAdjacentHTML('beforeend',`<svg width="0" height="0" style="position:absolute"><defs>
      <filter id="tl_liquid" x="-10%" y="-30%" width="120%" height="160%" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.006 0.012" numOctaves="2" seed="7" result="n"/>
        <feDisplacementMap in="SourceGraphic" in2="n" scale="0" xChannelSelector="R" yChannelSelector="G"/>
      </filter></defs></svg>`);
    this.disp = root.querySelector('#tl_liquid feDisplacementMap');
    this.turb = root.querySelector('#tl_liquid feTurbulence');

    // ---- layer A: big category cards
    const A = div(`position:absolute;inset:0;background:#f6f6f6;transform-origin:960px 540px`); root.appendChild(A);
    this.big = CATS.map(cat=>{const it=makeItem(cat,BIG,cat.s); it.root.style.left='960px'; it.root.style.top='418px'; it.root.style.display='none'; A.appendChild(it.root); return it;});
    this.A=A;

    // ---- layer B: overview
    const Bbg = div(`position:absolute;inset:0;background:#f6f6f6;display:none`); root.appendChild(Bbg); this.Bbg=Bbg;
    // lime haze at bottom (unscaled backdrop)
    Bbg.appendChild(div(`position:absolute;left:0;top:560px;width:1920px;height:520px;background:linear-gradient(180deg,rgba(246,246,246,0) 0%,rgba(236,250,196,0.55) 70%,rgba(232,250,180,0.75) 100%)`));
    const B = div(`position:absolute;inset:0;transform-origin:960px 540px;display:none`); root.appendChild(B);
    B.appendChild(div(`position:absolute;left:${960-447}px;top:${822-447}px;width:894px;height:894px;border-radius:50%;background:radial-gradient(circle, rgba(246,248,238,1) 0 60%, rgba(236,252,170,0.0) 66%, rgba(220,250,110,1) 78%, rgba(212,248,90,1) 92%, rgba(222,250,140,0) 100%);-webkit-mask-image:linear-gradient(180deg,transparent 0 46%,#000 52%,rgba(0,0,0,0.85) 100%)`));
    B.appendChild(div(`position:absolute;left:${960-300}px;top:${822-300}px;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle at 50% 40%, #f7f7f5 0 55%, #f0f6e2 100%)`));
    const g = makeGauge(960,822,307,445,61,6,{id:'ov',on:'#c4ee2c'}); B.appendChild(g.svg); this.gOv=g;
    const OVPOS = {wallet:[638,215],cex:[1296,215],card:[405,446],bank:[1514,446],cash:[330,712],socials:[1589,712]};
    this.ov = CATS.map(cat=>{const it=makeItem(cat,SMALL,cat.s2||cat.s); const p=OVPOS[cat.k]; it.root.style.left=p[0]+'px'; it.root.style.top=p[1]+'px'; B.appendChild(it.root); return it;});
    const odo = makeOdo(4,186,{id:'ov',blank0:true,weight:500}); odo.root.style.left='560px'; odo.root.style.width='800px'; odo.root.style.top=(748-odo.lh/2)+'px'; B.appendChild(odo.root); this.odo=odo;
    this.B=B;

    // ---- layer C: phone (+ sunburst)
    const C = div(`position:absolute;inset:0;background:#ffffff;display:none;overflow:hidden`); root.appendChild(C);
    const sun = div(`position:absolute;inset:0;display:none`);
    const sunFade = div(`position:absolute;inset:0;background:radial-gradient(circle at 960px 543px, #fff 0, #fff 400px, rgba(255,255,255,0.59) 700px, rgba(255,255,255,0.13) 1000px, rgba(255,255,255,0) 1085px);`);
    sun.appendChild(sunFade);
    C.appendChild(sun); this.sun=sun;
    const phone = makePhone(); C.appendChild(phone.ph); this.phone=phone;
    this.C=C;
  },

  render(root, t){
    const lt = ((t%P)+P)%P;
    const A=this.A,B=this.B,C=this.C;
    A.style.display = lt<2.0?'block':'none';
    B.style.display = (lt>=2.0&&lt<3.26)?'block':'none';
    this.Bbg.style.display = B.style.display;
    C.style.display = lt>=3.26?'block':'none';

    if(lt<2.0){
      // camera: slow zoom-out, accelerating on Socials
      let s = 1 - 0.106*Math.min(lt,1.7);
      if(lt>1.7){ const k=(lt-1.7)/0.3; s = (1-0.106*1.7)*(1 - 0.30*eInQ(k)); }
      A.style.transform=`scale(${s.toFixed(4)})`;
      const R=[[0,0.533,25,46,0.34, 30,62,1],[0.533,0.8,20,32,0.2, 40,60,1],[0.8,1.067,22,32,0.2, 120,155,1],[1.067,1.333,21,46,0.2, 50,78,0],[1.333,1.6,21,45,0.2, 62,94,0],[1.6,2.0,21,71,0.36, 70,110,0]];
      this.big.forEach((it,i)=>{const r=R[i]; const on=lt>=r[0]-0.004&&lt<r[1]-0.004; it.root.style.display=on?'block':'none';
        if(on){const kq=eOutC(prog(lt,r[0],r[1]));
          it.set(r[5]+(r[6]-r[5])*kq, lin(lt-0.015, BIGV[i])); return;
          const kp=0; const k=0; const ka=eOutC(prog(lt,r[0],r[1]));
          it.set(r[5]+(r[6]-r[5])*ka, r[2]+(r[3]-r[2])*k);} });
    }
    else if(lt<3.26){
      const s = kf(lt,[[2.0,1.32],[2.27,1.14],[2.53,1.05],[2.8,1.008],[3.07,0.963],[3.15,0.93],[3.2,0.82],[3.267,0.66]]);
      const bty = kf(lt,[[3.07,0],[3.15,-16],[3.22,-77],[3.267,-110]]);
      B.style.transform=`translateY(${bty.toFixed(2)}px) scale(${s.toFixed(4)})`;
      const sP = kf(lt+0.01,[[2.0,1.32],[2.27,1.14],[2.53,1.05],[2.8,1.008],[3.07,0.963],[3.15,0.93],[3.2,0.82],[3.267,0.66]]);
      const zb = Math.max(0, (s-sP)/0.01 - 1.6)*2.0;
      B.style.filter = zb>0.05?`blur(${zb.toFixed(2)}px)`:'none';
      // gauge fill
      const f = lin(lt,[[2.0,0.08],[2.067,0.2],[2.133,0.33],[2.2,0.5],[2.267,0.62],[2.333,0.72],[2.4,0.77],[2.467,0.83],[2.533,0.88],[2.6,0.9],[2.667,0.93],[2.733,0.96],[2.8,0.97],[2.9,0.99],[3.0,1.0],[3.3,1.0]]);
      this.gOv.set(clamp(f));
      // badges + arcs
      const OV=[[18,46,60,105],[12,32,40,70],[12,32,140,230],[19,48,50,80],[19,49,60,95],[29,73,100,145]];
      const kb = kf(lt,[[2.0,0],[2.1,0.15],[2.4,0.6],[2.7,0.85],[2.9,0.95],[3.07,1],[3.27,1.03]]);
      this.ov.forEach((it,i)=>{const o=OV[i]; it.set(o[2]+(o[3]-o[2])*kb, lin(lt-0.02,OVV[i]));});
      // odometer 710 -> 1000 (columns: thousands, hundreds, tens, ones)
      const posAt=(x)=>[ lin(x,ODO[0]), lin(x,ODO[1]), lin(x,ODO[2]), lin(x,ODO[3]) ];
      const pos=posAt(lt), pos2=posAt(lt+1/120);
      const vel=pos.map((p,i)=>(pos2[i]-p)*120);
      if(!this.dw){ const cv=document.createElement('canvas').getContext('2d'); cv.font='500 186px Inter'; cv.letterSpacing='-8.4px'; this.dw=[...'0123456789'].map(d=>cv.measureText(d).width); }
      const dw=this.dw;
      const widths=pos.map((p,i)=>{ if(i===0) return dw[1]*clamp(p*2.5); const a=Math.floor(p), f=p-a; return dw[((a%10)+10)%10]*(1-f)+dw[((a+1)%10+10)%10]*f; });
      this.odo.set(pos, vel, widths);
    }
    else {
      const ph=this.phone;
      let S, cy, sunOn=false;
      if(lt<5.095){
        S = kf(lt,[[3.267,2.95],[3.283,2.67],[3.317,2.0],[3.35,1.605],[3.383,1.452],[3.417,1.348],[3.45,1.261],[3.483,1.189],[3.517,1.14],[3.55,1.103],[3.583,1.08],[3.617,1.05],[3.65,1.026],[3.683,1.007],[3.717,0.995],[3.75,0.988],[3.8,0.985],[3.85,0.985],[3.9,0.99],[3.95,1.007],[3.983,1.066],[4.017,1.184],[4.05,1.287],[4.083,1.394],[4.117,1.499],[4.15,1.58],[4.2,1.66],[4.25,1.73],[4.3,1.80],[4.35,1.865],[4.4,1.90],[4.45,1.943],[4.5,1.98],[4.55,2.02],[4.6,2.05],[4.7,2.095],[4.75,2.122],[4.8,2.19],[4.85,2.222],[4.9,2.256],[4.95,2.30],[5.0,2.45],[5.05,2.6],[5.1,2.9]]);
        cy = kf(lt,[[3.267,250],[3.283,269],[3.317,329],[3.35,367],[3.383,395],[3.417,419],[3.45,437],[3.483,455],[3.517,470],[3.55,481],[3.583,491],[3.617,499],[3.65,509],[3.683,515],[3.717,522],[3.75,527],[3.8,535],[3.85,546],[3.9,553],[3.95,562],[3.983,569],[4.017,582],[4.05,594],[4.1,602],[4.15,609],[4.2,614],[4.25,618],[4.3,620],[4.35,622],[4.4,624],[4.5,626.5],[4.6,628],[4.7,629],[5.1,629.5]]);
      } else {
        sunOn=true;
        S = kf(lt,[[5.1,1.43],[5.133,1.561],[5.2,1.876],[5.3,2.135],[5.4,2.296],[5.5,2.41],[5.65,2.532],[5.8,2.595],[5.95,2.513],[5.967,2.505]]);
        cy = 613;
      }
      const tx = 960 - 262*S, ty = 540 - cy*S;
      ph.ph.style.transform=`translate(${tx.toFixed(2)}px,${ty.toFixed(2)}px) scale(${S.toFixed(4)})`;
      this.sun.style.display=sunOn?'block':'none';
      if(sunOn){ const ph0=21.1-30*(lt-5.15)+90; this.sun.style.background=`repeating-conic-gradient(from ${ph0.toFixed(3)}deg at 960px 543px, #d3ff3a 0deg 14.9deg, #ffffff 15.1deg 29.8deg, #d3ff3a 30deg)`; }
      ph.rwg.style.transform=sunOn?'translateY(8px)':'none'; ph.low.style.transform=sunOn?'translateY(14px)':'none';

      // credit card states
      const gl = !sunOn && lt>=4.26;
      const kG = prog(lt,4.28,4.42);     // gray -> glass start
      const kL = eOutC(prog(lt,4.5,5.02));      // lime fill growth
      if(sunOn){
        ph.credit.style.transform='none';
        ph.cBase.style.opacity=0; ph.glassWrap.style.opacity=0; ph.cLime.style.opacity=1;
        ph.cLock.style.opacity=0; ph.cLockOpen.style.opacity=0;
        ph.cTitle.style.color='#7d9a26'; ph.cTitle.style.top='31px';
        ph.cChev.style.background='rgba(255,255,255,0.25)';
        const amt=kf(lt-0.012,[[5.1,201],[5.133,209],[5.2,224],[5.267,240],[5.333,255],[5.4,270],[5.467,284],[5.533,297],[5.6,307],[5.667,319],[5.733,328],[5.8,335],[5.867,339],[5.933,340],[5.967,340]]);
        const rw=kf(lt-0.012,[[5.1,40.3],[5.133,41.0],[5.2,42.52],[5.267,44.07],[5.333,45.61],[5.4,47.11],[5.467,48.53],[5.533,49.87],[5.6,50.9],[5.667,52.17],[5.733,53.07],[5.8,53.75],[5.867,54.14],[5.933,54.2],[5.967,54.2]]);
        ph.cAmt.style.opacity=1; ph.cAmt.innerHTML=`$${Math.round(amt)}<span style="font-size:18px;font-weight:400;color:#6f8f17;letter-spacing:0"> / $500 left</span>`;
        ph.cBarT.style.opacity=1; ph.cBar.style.width=(412*amt/500).toFixed(1)+'px';
        ph.rewards.textContent='$'+rw.toFixed(2);
      } else {
        ph.rewards.textContent='$54.20';
        ph.cAmt.style.opacity=0; ph.cBarT.style.opacity=0; ph.cLime.style.opacity=0;
        ph.cTitle.style.color='#30352c'; ph.cTitle.style.top='33px';
        ph.cChev.style.background='rgba(0,0,0,0.06)';
        const cs = gl? kf(lt,[[4.1,1.0],[4.2,1.03],[4.267,1.1],[4.333,1.2],[4.4,1.29],[4.467,1.35],[4.533,1.41],[4.667,1.47],[4.8,1.5],[4.933,1.55],[5.0,1.58],[5.1,1.62]]) : 1;
        ph.credit.style.transform=`scale(${cs.toFixed(4)})`;
        ph.cBase.style.opacity = gl? (1-kG):1;
        ph.glassWrap.style.opacity = gl? kG:0;
        ph.cLock.style.opacity = gl? 1-prog(lt,4.28,4.36):1;
        ph.cLockOpen.style.opacity = gl? prog(lt,4.3,4.38):0;
        if(gl){
          const r = 94*kL;   // lime radius % of card
          const a = (0.95-0.4*prog(lt,4.7,5.0))*prog(lt,4.48,4.58);
          const bA=0.95*prog(lt,4.72,5.0);
          ph.glassLime.style.background=`radial-gradient(ellipse ${r*0.62+8}% ${r*1.3+20}% at 50% 52%, rgba(214,255,40,${a}) 0%, rgba(206,250,40,${a*0.95}) 55%, rgba(206,250,40,0) 100%), linear-gradient(90deg, rgba(205,248,60,${bA}) 0%, rgba(232,252,170,${bA}) 13%, rgba(212,250,70,${bA}) 27%, rgba(206,248,56,${bA}) 50%, rgba(212,250,70,${bA}) 73%, rgba(232,252,170,${bA}) 87%, rgba(205,248,60,${bA}) 100%)`;
          ph.glassGray.style.opacity = 1-prog(lt,4.75,5.02);
          ph.glassSwirl.style.transform=`rotate(${(lt-4.1)*160}deg) scale(${(0.9+0.6*kL).toFixed(3)})`;
          ph.glassRing.style.opacity = 0.9*prog(lt,4.55,4.9);
          ph.glassSwirl.style.opacity = 0.8*Math.sin(Math.PI*prog(lt,4.35,5.1));
          this.disp.setAttribute('scale', (16*Math.sin(Math.PI*prog(lt,4.3,4.88))).toFixed(2));
          this.turb.setAttribute('seed', String(7+Math.floor((lt-4.1)*12)));
        }
      }
    }
  }
};
})();
