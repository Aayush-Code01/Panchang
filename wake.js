/* Shubhly sign-up: the sun climbs over the horizon and wakes up. Drawn frame by frame so every part moves together. */
window.ShubhlyWake=function(svg){
 const cx=512,hz=660,R=168,CY=545,W=32,RW=44,L=262,EX=60,EY=-46,HX=R+60,sun='#F09A3E',ink='#1E2140';
 const ang=i=>Math.PI+(i+1)*Math.PI/6, r1=R+48, rL=R+118, rH=R+172, LT=hz-W/2;
 const cl=x=>x<0?0:x>1?1:x, seg=(t,a,b)=>cl((t-a)/(b-a)), lerp=(a,b,p)=>a+(b-a)*p;
 const eio=p=>p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2, eos=p=>1-Math.pow(1-p,4), eis=p=>p*p*(3-2*p);
 const eob=(p,c=1.2)=>p<=0?0:p>=1?1:1+(c+1)*Math.pow(p-1,3)+c*Math.pow(p-1,2), bump=p=>Math.sin(Math.PI*p);
 const top=CY-rH*Math.sin(Math.PI/3)-RW/2-6;
 svg.setAttribute('viewBox',`${cx-L-W/2-4} ${top.toFixed(0)} ${2*L+W+8} ${(hz+W/2+4-top).toFixed(0)}`);
 const CR='#C9712B',NL='#F9CC94',FX=[-33,-11,11,33],FL=[27,34,38,35];
 const fingers=k=>`<g class="f${k}">${FX.map((x,i)=>`<rect class="fi" data-i="${i}" x="${x-10}" y="-10" width="20" rx="10" fill="${sun}" stroke="${CR}" stroke-width="4"/><ellipse class="nl" data-i="${i}" cx="${x}" rx="5.5" ry="4.5" fill="${NL}"/>`).join('')}<rect class="th" x="38" y="-24" width="19" height="36" rx="9.5" fill="${sun}" stroke="${CR}" stroke-width="4" transform="rotate(-28 47 -6)"/></g>`;
 svg.innerHTML=`<defs><clipPath id="wkA"><rect x="0" y="0" width="1024" height="${hz-W/2-12}"/></clipPath><clipPath id="wkP"><rect x="0" y="0" width="1024" height="${LT+2}"/></clipPath></defs>
 <g clip-path="url(#wkA)">
 <g class="bd"><circle class="sn" r="${R}" fill="${sun}"/>
 <path class="lL" fill="none" stroke="${ink}" stroke-width="16" stroke-linecap="round"/><path class="lR" fill="none" stroke="${ink}" stroke-width="16" stroke-linecap="round"/>
 <ellipse class="eL" fill="${ink}"/><ellipse class="eR" fill="${ink}"/><path class="mo" fill="none" stroke="${ink}" stroke-linecap="round"/></g></g>
 <g clip-path="url(#wkP)"><ellipse class="pL" fill="${sun}"/><ellipse class="pR" fill="${sun}"/></g>
 ${[0,1,2,4].map(i=>`<line class="r r${i}" stroke="${sun}" stroke-width="${RW}" stroke-linecap="round" opacity="0"/>`).join('')}
 <line class="hz" stroke="var(--wk-line,#1E2140)" stroke-width="${W}" stroke-linecap="round" y1="${hz}" y2="${hz}"/>
 ${fingers('L')}${fingers('R')}
 <line class="rh" stroke="var(--wk-line,#1E2140)" stroke-width="${RW}" stroke-linecap="round" opacity="0"/>`;
 const q$=c=>svg.querySelector('.'+c), A=(el,o)=>{for(const k in o)el.setAttribute(k,typeof o[k]==='number'?(+o[k].toFixed(2)):o[k])};
 const E={bd:q$('bd'),sn:q$('sn'),lL:q$('lL'),lR:q$('lR'),eL:q$('eL'),eR:q$('eR'),mo:q$('mo'),hz:q$('hz'),rh:q$('rh'),pL:q$('pL'),pR:q$('pR'),
  fL:q$('fL'),fR:q$('fR'),r:{0:q$('r0'),1:q$('r1'),2:q$('r2'),4:q$('r4')}};
 const rayAt=(el,a,len,op)=>A(el,{x1:cx+r1*Math.cos(a),y1:CY+r1*Math.sin(a),x2:cx+(r1+len)*Math.cos(a),y2:CY+(r1+len)*Math.sin(a),opacity:op});
 let blinkAt=-9;
 function frame(t){
  // 1. horizon draws out from the middle
  const hp=eos(seg(t,0,.7));A(E.hz,{x1:cx-L*hp,x2:cx+L*hp,opacity:hp>.01?1:0});
  // 2. sun climbs: slow start, a little hesitation, then up
  const r=seg(t,1.05,2.55), pull=eio(r)-.035*bump(seg(r,.35,.6)), sy=CY+(1-pull)*300;
  const effort=bump(seg(t,1.2,2.4)), st=bump(seg(t,2.5,3.1));
  const sxk=1+.03*effort-.045*st, syk=1-.03*effort+.07*st;
  E.bd.setAttribute('transform',`translate(${cx} ${hz}) scale(${sxk.toFixed(4)} ${syk.toFixed(4)}) translate(${-cx} ${-hz})`);
  A(E.sn,{cx,cy:sy});
  // 3. hands reach up from behind the horizon, curl fingers over it, hold on while it climbs, then let go and tuck in
  const reach=eos(seg(t,.45,1.0)), curl=eos(seg(t,.85,1.15)), go=eio(seg(t,2.55,3.0)), uncurl=seg(t,2.5,2.7);
  for(const d of [-1,1]){
   const k=d<0?'L':'R', hx0=cx+d*HX, py0=LT-26+(1-reach)*70+3*effort;
   const sa=d<0?Math.PI*.86:Math.PI*.14, shx=cx+R*.92*Math.cos(sa)*sxk, shy=hz+(sy+R*.92*Math.sin(sa)-hz)*syk;
   const hx=lerp(hx0,shx,go), hy=lerp(py0,shy,go), sc=1-go;
   A(E['p'+k],{cx:hx,cy:hy,rx:44*sc,ry:32*sc,opacity:t>.4&&go<1?1:0});
   const c=curl*(1-uncurl), fg=E['f'+k], sx=(d<0?1:-1)*sc;
   fg.setAttribute('transform',`translate(${hx.toFixed(1)} ${(hy+26*sc).toFixed(1)}) scale(${sx.toFixed(3)} ${sc.toFixed(3)})`);
   fg.querySelectorAll('.fi').forEach(r=>r.setAttribute('height',(10+FL[r.dataset.i]*c).toFixed(1)));
   fg.querySelectorAll('.nl').forEach(n=>{n.setAttribute('cy',(FL[n.dataset.i]*c-10).toFixed(1));n.setAttribute('opacity',c>.75?((c-.75)*4).toFixed(2):0)});
   fg.querySelector('.th').setAttribute('opacity',c>.3?1:0);
   fg.setAttribute('opacity',c>.02&&go<1?1:0);
  }
  // 4. wakes: eyes open, one blink, smile grows
  const o=eob(seg(t,2.75,3.05),.8), lid=1-seg(t,2.72,2.8);
  let blink=bump(seg(t,3.35,3.53)); if(t>5){const k=t-blinkAt;blink=k>=0&&k<.18?bump(k/.18):0}
  const ey=sy+EY;
  for(const d of [-1,1]){const x=cx+d*EX,k=d<0?'L':'R';
   A(E['l'+k],{d:`M${x-24},${ey+4} Q${x},${ey+24} ${x+24},${ey+4}`,opacity:lid});
   A(E['e'+k],{cx:x,cy:ey,rx:19,ry:Math.max(.1,31*o*(1-.92*blink)),opacity:o>0?1:0})}
  const m=eob(seg(t,2.85,3.3),.9), w=lerp(36,72,m), dep=lerp(18,80,m), m0=sy+lerp(42,12,m);
  A(E.mo,{d:`M${(cx-w).toFixed(1)},${m0.toFixed(1)} Q${cx},${(m0+dep).toFixed(1)} ${(cx+w).toFixed(1)},${m0.toFixed(1)}`,'stroke-width':lerp(22,32,m)});
  // 5. the long ray grows on the left, travels right like a clock hand leaving a short ray at each place, and stops at its own place
  const g=eos(seg(t,3.25,3.6)), tr=seg(t,3.65,4.85), step=tr*3, kk=Math.min(2,Math.floor(step)), fr=step-kk;
  const pos=tr>=1?3:kk+(.25*fr+.75*eis(fr)), set=eob(seg(t,4.85,5.25),1.6)-1;
  const ra=ang(0)+(ang(1)-ang(0))*pos + (tr>=1?set*0:0);
  rayAt(E.rh,ra,(rH-r1)*g,g>.01?1:0);
  for(const i of [0,1,2]){const leave=seg(t,3.65+(i+.18)*0.4,3.65+(i+.18)*0.4+.35);rayAt(E.r[i],ang(i),(rL-r1)*eob(leave,1.4),leave>.01?1:0)}
  const l4=seg(t,4.75,5.15);rayAt(E.r[4],ang(4),(rL-r1)*eob(l4,1.6),l4>.01?1:0);
 }
 let raf;
 function run(t0s){let t0=null;cancelAnimationFrame(raf);const loop=now=>{if(t0==null)t0=now;const t=t0s+(now-t0)/1000;
   if(t>5.4&&t-blinkAt>4.6)blinkAt=t+.05;frame(t);if(svg.isConnected)raf=requestAnimationFrame(loop)};raf=requestAnimationFrame(loop)}
 const api={frame,play:()=>run(0),still:()=>{blinkAt=-9;run(5.6)},stop:()=>cancelAnimationFrame(raf)};window.__wk=api;return api;
};
