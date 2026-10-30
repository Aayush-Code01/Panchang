/* Shubhly scene: a glowing sun rising behind a frosted-glass horizon, a smile of light, and a dial of rays where one long
   cream ray marks "the right moment". One source for the icon, launch screen, sign-up animation and social image.
   ShubhlyScene(svg,{W,H,cx,hz,R,bg,mode}) -> {frame(t),play(),still(),stop()}. mode 'full' (sign-up) or 'quick' (launch). */
(function(){
let N=0;
window.ShubhlyScene=function(svg,o){
 o=Object.assign({W:1024,H:1024,cx:512,hz:640,R:186,bg:true,mode:'full'},o);
 const {W,H,cx,hz,R}=o, id='s'+(++N), CY=hz-R*.4, quick=o.mode==='quick';
 const ang=i=>Math.PI+(i+1)*Math.PI/6, r1=R*1.27, rS=R*1.56, rH=R*2.08, ws=R*.15, wl=R*.17;
 const cl=x=>x<0?0:x>1?1:x, seg=(t,a,b)=>cl((t-a)/(b-a)), lerp=(a,b,p)=>a+(b-a)*p, bump=p=>Math.sin(Math.PI*p);
 const eio=p=>p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2, eos=p=>1-Math.pow(1-p,4), eis=p=>p*p*(3-2*p);
 const eob=(p,c=1.1)=>p<=0?0:p>=1?1:1+(c+1)*Math.pow(p-1,3)+c*Math.pow(p-1,2);
 const FX=[-.3,-.1,.1,.3], FL=[.12,.155,.165,.135], FXc=R*1.62;
 svg.setAttribute('viewBox',`0 0 ${W} ${H}`);
 svg.innerHTML=`<defs>
 <linearGradient id="${id}bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2F3373"/><stop offset=".55" stop-color="#1E2048"/><stop offset="1" stop-color="#13142B"/></linearGradient>
 <radialGradient id="${id}gl" class="glg" cx="${cx}" cy="${CY}" r="${R*2.6}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FF9E4A" stop-opacity=".55"/><stop offset=".45" stop-color="#E9734A" stop-opacity=".15"/><stop offset="1" stop-color="#E9734A" stop-opacity="0"/></radialGradient>
 <radialGradient id="${id}sn" class="sng" cx="${cx-R*.3}" cy="${CY-R*.4}" r="${R*1.25}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFF1CF"/><stop offset=".32" stop-color="#FFC56A"/><stop offset=".72" stop-color="#F5953A"/><stop offset="1" stop-color="#DB6A2A"/></radialGradient>
 <linearGradient id="${id}gs" x1="0" y1="${hz}" x2="0" y2="${H}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#A8B0F5" stop-opacity=".2"/><stop offset=".35" stop-color="#6C74C8" stop-opacity=".12"/><stop offset="1" stop-color="#1A1C46" stop-opacity=".35"/></linearGradient>
 <radialGradient id="${id}df"><stop offset="0" stop-color="#FFA552" stop-opacity=".85"/><stop offset=".6" stop-color="#F07F48" stop-opacity=".25"/><stop offset="1" stop-color="#F07F48" stop-opacity="0"/></radialGradient>
 <filter id="${id}bl" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="${R*.2}"/></filter>
 <filter id="${id}sf" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="${R*.07}"/></filter>
 <filter id="${id}fg" x="-100%" y="-100%" width="300%" height="300%"><feDropShadow dx="0" dy="0" stdDeviation="${R*.05}" flood-color="#FF9E4A" flood-opacity=".7"/></filter>
 <clipPath id="${id}up"><rect x="0" y="0" width="${W}" height="${hz}"/></clipPath>
 <clipPath id="${id}dn"><rect x="0" y="${hz}" width="${W}" height="${H-hz}"/></clipPath></defs>
 ${o.bg?`<rect width="${W}" height="${H}" fill="url(#${id}bg)"/>`:''}
 <rect class="glow" width="${W}" height="${H}" fill="url(#${id}gl)"/>
 <circle class="bloom" r="${R*1.22}" fill="#FF9440" filter="url(#${id}bl)"/>
 <g clip-path="url(#${id}up)"><circle class="sun" r="${R}" fill="url(#${id}sn)"/>
  <path class="smile" fill="none" stroke="#FFF4DD" stroke-width="${R*.115}" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1"/></g>
 ${[0,1,2,4].map(i=>`<line class="ry ry${i}" stroke="#FFD39A" stroke-width="${ws}" stroke-linecap="round" opacity="0"/>`).join('')}
 <line class="rh" stroke="#FFF3DE" stroke-width="${wl}" stroke-linecap="round" opacity="0"/>
 <g clip-path="url(#${id}dn)"><ellipse class="refg" rx="${R*1.7}" ry="${R*.55}" fill="url(#${id}df)" filter="url(#${id}bl)"/>
  <rect x="0" y="${hz}" width="${W}" height="${H-hz}" fill="url(#${id}gs)"/></g>
 <line class="edge" x1="0" x2="${W}" y1="${hz+1}" y2="${hz+1}" stroke="#FFFFFF" stroke-width="${Math.max(1.5,R*.016)}"/>
 <line class="edge2" x1="0" x2="${W}" y1="${hz+R*.06}" y2="${hz+R*.06}" stroke="#FFFFFF" stroke-opacity=".07" stroke-width="${Math.max(1,R*.012)}"/>
 ${quick?'':`<g filter="url(#${id}fg)">`+FX.map((x,i)=>`<line class="fg fgL" stroke="#FFBE6A" stroke-width="${R*.17}" stroke-linecap="round" opacity="0"/><line class="fg fgR" stroke="#FFBE6A" stroke-width="${R*.17}" stroke-linecap="round" opacity="0"/>`).join('')+'</g>'}`;
 const q=c=>svg.querySelector('.'+c), A=(el,a)=>{for(const k in a)el.setAttribute(k,typeof a[k]==='number'?+a[k].toFixed(3):a[k])};
 const E={glow:q('glow'),bloom:q('bloom'),sun:q('sun'),smile:q('smile'),rh:q('rh'),refg:q('refg'),edge:q('edge'),edge2:q('edge2'),
  gl:svg.querySelector('.glg'),sn:svg.querySelector('.sng'),ry:{0:q('ry0'),1:q('ry1'),2:q('ry2'),4:q('ry4')},
  fL:[...svg.querySelectorAll('.fgL')],fR:[...svg.querySelectorAll('.fgR')]};
 const ray=(el,a,len,op)=>A(el,{x1:cx+r1*Math.cos(a),y1:CY+r1*Math.sin(a),x2:cx+(r1+len)*Math.cos(a),y2:CY+(r1+len)*Math.sin(a),opacity:op});
 // timeline (seconds). quick = launch screen: just the rise, the smile and the rays together.
 const T=quick?{edge:[-1,-.99],rise:[0,.9],smile:[.55,1],rays:[.65,1.05],long:[.65,1.05],end:1.1}
              :{edge:[0,.6],fin:[.3,.68],rise:[.7,1.95],let:[1.9,2.15],smile:[2.0,2.5],long:[2.45,2.7],trav:[2.7,3.5],set:[3.5,3.85],end:3.9};
 let glowT=0;
 function frame(t){
  const e=eos(seg(t,...T.edge));A(E.edge,{'stroke-opacity':.5*e,x1:W/2-W/2*e,x2:W/2+W/2*e});A(E.edge2,{opacity:e});
  const r=seg(t,...T.rise), p=quick?eos(r):eio(r)-.03*bump(seg(r,.35,.6)), sy=lerp(hz+R*1.15,CY,p), up=cl((hz-sy+R)/(2*R));
  const breathe=t>T.end+.5?.04*Math.sin((t-T.end)*Math.PI*2/7):0;
  A(E.sun,{cx,cy:sy});A(E.sn,{cy:sy-R*.4});A(E.gl,{cy:sy});
  A(E.bloom,{cx,cy:sy,opacity:.18+.37*up+breathe});A(E.refg,{cx,cy:hz+R*.12,opacity:.15+.6*up});
  A(E.glow,{opacity:.35+.65*up+breathe});
  // smile of light draws from the middle outwards
  const s=eos(seg(t,...T.smile)), mw=R*.44, my=sy+R*.08;
  A(E.smile,{d:`M${cx-mw},${my} Q${cx},${my+R*.42} ${cx+mw},${my}`,'stroke-dasharray':`${s} 1`,'stroke-dashoffset':(s-1)/2*-1+(1-s)/2,opacity:s>.01?.92:0});
  E.smile.setAttribute('stroke-dashoffset',((s-1)/2).toFixed(3)*-1+0);E.smile.setAttribute('stroke-dasharray',`${s.toFixed(3)} ${(2-s).toFixed(3)}`);E.smile.setAttribute('stroke-dashoffset',(-(1-s)/2).toFixed(3));
  if(quick){const g=eob(seg(t,...T.rays),1.2);[0,1,2,4].forEach(i=>ray(E.ry[i],ang(i),(rS-r1)*g,g>.01?.8:0));ray(E.rh,ang(3),(rH-r1)*g,g>.01?1:0);return}
  // fingers of light curl over the glass edge while the sun pulls itself up, then let go
  const eff=bump(seg(t,.8,1.9));
  for(const d of [-1,1])(d<0?E.fL:E.fR).forEach((f,i)=>{const j=d<0?i:3-i,x=cx+d*FXc+FX[i]*R;
   const g=eos(seg(t,T.fin[0]+j*.05,T.fin[1]+j*.05)),l=eio(seg(t,T.let[0]+(3-j)*.03,T.let[1]+(3-j)*.03)),len=(FL[j]*R*g+R*.02*eff)*(1-l);
   A(f,{x1:x,y1:hz-R*.03,x2:x,y2:hz-R*.03+len,opacity:g>.02&&l<.98?.95:0})});
  // the long ray grows on the left, travels right like a clock hand leaving a short ray at each place, then rests
  const g=eos(seg(t,...T.long)), tr=seg(t,...T.trav), st=tr*3, k=Math.min(2,Math.floor(st)), fr=st-k;
  const pos=tr>=1?3:k+(.3*fr+.7*eis(fr)), over=bump(seg(t,...T.set))*.08;
  ray(E.rh,ang(0)+(ang(1)-ang(0))*(pos+over),(rH-r1)*g,g>.01?1:0);
  for(const i of [0,1,2]){const a0=T.trav[0]+(i+.2)*(T.trav[1]-T.trav[0])/3,lv=seg(t,a0,a0+.3);ray(E.ry[i],ang(i),(rS-r1)*eob(lv,1.2),lv>.01?.8:0)}
  const l4=seg(t,T.set[0],T.set[1]);ray(E.ry[4],ang(4),(rS-r1)*eob(l4,1.3),l4>.01?.8:0);
 }
 let raf;
 function run(t0s,loop){let t0=null;cancelAnimationFrame(raf);const f=now=>{if(t0==null)t0=now;const t=t0s+(now-t0)/1000;frame(t);
   if(svg.isConnected&&(loop||t<T.end+.1))raf=requestAnimationFrame(f)};raf=requestAnimationFrame(f)}
 const api={frame,end:T.end,play:(loop=true)=>run(0,loop),still:(loop=true)=>run(T.end+.6,loop),stop:()=>cancelAnimationFrame(raf)};
 window.__scene=api;return api;
};})();
