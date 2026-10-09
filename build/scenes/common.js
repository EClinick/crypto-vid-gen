// Shared helpers for all quadrants. Pure functions of time.
window.U = {
  clamp:(x,a=0,b=1)=>Math.min(b,Math.max(a,x)),
  lerp:(a,b,k)=>a+(b-a)*k,
  prog:(t,a,b)=>Math.min(1,Math.max(0,(t-a)/(b-a))),        // 0..1 progress of t within [a,b]
  easeOutCubic:k=>1-Math.pow(1-k,3),
  easeInCubic:k=>k*k*k,
  easeInOutCubic:k=>k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2,
  easeOutQuint:k=>1-Math.pow(1-k,5),
  easeOutBack:(k,s=1.70158)=>1+(s+1)*Math.pow(k-1,3)+s*Math.pow(k-1,2),
  easeOutExpo:k=>k===1?1:1-Math.pow(2,-10*k),
  // critically-damped-ish spring 0->1
  spring:(k,zeta=0.55,w=12)=>{if(k<=0)return 0;const t=k;const wd=w*Math.sqrt(1-zeta*zeta);return 1-Math.exp(-zeta*w*t)*(Math.cos(wd*t)+zeta*w/wd*Math.sin(wd*t));},
  loopT:(t,period,offset=0)=>((t-offset)%period+period)%period,
  el:(tag,css,html)=>{const e=document.createElement(tag);if(css)e.style.cssText=css;if(html!==undefined)e.innerHTML=html;return e;},
};
