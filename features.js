/* Panchang: tabs (Today, Plan, Personal, Professional, Practice). Shared by all copies.
   Uses globals from the page: Astronomy, Panchang, calc, segments, verdict, TARA, VI, I, sv, ls, $, fmt, hm, ist,
   todayIST, haptic, M, render, openSheet. Per-copy config: window.ME = {name, self:true|false, her:bool} */
(function(){
const ME=Object.assign({name:'You',self:true},window.ME||{});
const NAKN=Panchang.NAK,RS=['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const WDN=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],WDS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const TARAN=['Janma','Sampat','Vipat','Kshema','Pratyari','Sadhana','Naidhana','Mitra','Parama Mitra'];
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ic=p=>sv(p,22);
const IC={
 today:ic('<circle cx="12" cy="12" r="4"/><path d="M12 2.8v2M12 19.2v2M5.5 5.5l1.4 1.4M17.1 17.1l1.4 1.4M2.8 12h2M19.2 12h2M5.5 18.5l1.4-1.4M17.1 6.9l1.4-1.4"/>'),
 plan:ic('<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4M9 15l2 2 4-4"/>'),
 heart:ic('<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/>'),
 work:ic('<rect x="3.5" y="7.5" width="17" height="12" rx="2.5"/><path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5M3.5 13h17"/>'),
 home:ic('<path d="M4 11 12 4l8 7M6 9.5V20h12V9.5M10 20v-5h4v5"/>'),
 car:ic('<path d="M4.5 16.5v-4l2-5h11l2 5v4zM7 16.5V19M17 16.5V19"/><circle cx="8" cy="13.3" r=".9"/><circle cx="16" cy="13.3" r=".9"/>'),
 travel:ic('<path d="M4 12l16-7-6 16-2.5-6.5z"/>'),
 health:ic('<path d="M3 12h4l2-5 4 10 2-5h6"/>'),
 learn:ic('<path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5zM12 6.5v13"/>'),
 gift:ic('<rect x="4" y="9" width="16" height="11" rx="2"/><path d="M12 9v11M4 13h16M12 9c-1.5-3-5-3.5-5-1.2C7 9 9.5 9 12 9zm0 0c1.5-3 5-3.5 5-1.2C17 9 14.5 9 12 9z"/>'),
 coin:ic('<circle cx="12" cy="12" r="8.5"/><path d="M9 8.5h6M9 11.5h6M11 8.5c2.6 0 2.6 3 0 3h-1.5l4 4"/>'),
 back:sv('<path d="M15 5l-7 7 7 7"/>',18),
 plus:sv('<path d="M12 5v14M5 12h14"/>',18),
 check:'<svg width="13" height="10" viewBox="0 0 13 10"><path d="M1.5 5l3.5 3.5L11.5 1.5" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};
IC.lotus=I.lotus;IC.spark=I.spark;
const gearHTML=()=>{const g=$('gearBtn');return g?g.innerHTML:''};

/* ---------- helpers ---------- */
function loc(){const v=($('loc')||{}).value||'28.4595,77.0266';const [a,b]=v.split(',').map(Number);return isFinite(a)?[a,b]:[28.4595,77.0266]}
const addDays=(ds,n)=>new Date(+new Date(ds+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const dObj=ds=>new Date(ds+'T00:00:00Z');
function dayLabel(ds){const d=Math.round((dObj(ds)-dObj(todayIST()))/864e5);if(d===0)return'Today';if(d===1)return'Tomorrow';return dObj(ds).toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short',timeZone:'UTC'})}
const hIST=t=>ist(t).getUTCHours()+ist(t).getUTCMinutes()/60;
function personDay(r,b){const t=((r.nak.idx-b.nak+27)%27)%9,house=((r.moonRashi.idx-b.rashi+12)%12)+1;
  return{tara:{name:TARAN[t]},chandra:{house,q:[1,3,6,7,10,11].includes(house)?'good':[4,8,12].includes(house)?'bad':'mixed',ashtama:house===8}}}
const vFor=(r,b)=>verdict(personDay(r,b));
const VK={good:'k-good',mixed:'k-mixed',slow:'k-slow'};
const vPill=(vc,vt)=>`<span class="kpill ${VK[vc]}">${VI[vc].replace(/width="\d+" height="\d+"/,'width="16" height="16"')}${vt.replace(' day','')}</span>`;
const people=()=>ls.get('people',[]);
const savePeople=a=>ls.set('people',a);
const partner=()=>people().find(p=>p.rel==='Partner');
const REL={Partner:'#C77A6E',Child:'#D6A64E',Parent:'#7F9C77',Sibling:'#6E8FB8',Friend:'#9A86B8'};

/* ---------- birth chart for a person ---------- */
function ayan(d){const y=2000+(d.getTime()-Date.UTC(2000,0,1,12))/31557600000;return 23.853+(y-2000)*.013969}
const n360=x=>((x%360)+360)%360;
function moonSid(dt){return n360(Astronomy.Ecliptic(Astronomy.GeoVector('Moon',dt,true)).elon-ayan(dt))}
function birthChart(dob,time,lat,lon){const [y,m,d]=dob.split('-').map(Number);const [hh,mm]=(time||'12:00').split(':').map(Number);
  const dt=new Date(Date.UTC(y,m-1,d,hh,mm)-5.5*3600e3),ms=moonSid(dt),nak=Math.floor(ms/(360/27)),rashi=Math.floor(ms/30);
  let lagna=null,unsure=false;
  if(time){const lst=n360(Astronomy.SiderealTime(dt)*15+lon)*Math.PI/180,eps=23.4393*Math.PI/180,ph=lat*Math.PI/180;
    lagna=Math.floor(n360(n360(Math.atan2(Math.cos(lst),-(Math.sin(lst)*Math.cos(eps)+Math.tan(ph)*Math.sin(eps)))*180/Math.PI)-ayan(dt))/30)}
  else{const a=moonSid(new Date(Date.UTC(y,m-1,d,0,0)-5.5*3600e3)),b=moonSid(new Date(Date.UTC(y,m-1,d,23,59)-5.5*3600e3));unsure=Math.floor(a/(360/27))!==Math.floor(b/(360/27))}
  return{nak,rashi,lagna,unsure,pada:Math.floor((ms%(360/27))/(360/108))+1}}

/* ---------- compatibility (gentle, traditional) ---------- */
const GANA=[],NADI=[];[[0,4,6,7,12,14,16,21,26],[1,3,5,10,11,19,20,24,25],[2,8,9,13,15,17,18,22,23]].forEach((L,g)=>L.forEach(n=>GANA[n]=g));
[[0,5,6,11,12,17,18,23,24],[1,4,7,10,13,16,19,22,25],[2,3,8,9,14,15,20,21,26]].forEach((L,g)=>L.forEach(n=>NADI[n]=g));
const LORD=[2,5,3,1,0,3,5,2,4,6,6,4];// Su0 Mo1 Ma2 Me3 Ju4 Ve5 Sa6
const FR=[[0,1,1,0,1,-1,-1],[1,0,0,1,0,0,0],[1,1,0,-1,1,0,0],[1,-1,0,0,0,1,0],[1,1,1,-1,0,-1,0],[-1,-1,0,1,0,0,1],[-1,-1,-1,1,0,1,0]];
function match(a,b){const out=[];
  const n=((b.rashi-a.rashi+12)%12)+1,bh=[1,7,3,11,4,10].includes(n)?3:(LORD[a.rashi]===LORD[b.rashi]||FR[LORD[a.rashi]][LORD[b.rashi]]>0)?2:1;
  out.push(['Emotional bond',bh,bh===3?'Your Moon signs sit in an easy, supportive pattern. You tend to feel understood by each other.':bh===2?'Your Moon signs differ, but their ruling planets get along, which softens the gap.':'Your moods can run on different rhythms. Talking about feelings early and kindly keeps the bond close.']);
  const f1=FR[LORD[a.rashi]][LORD[b.rashi]],f2=FR[LORD[b.rashi]][LORD[a.rashi]],gm=(f1>=0&&f2>=0)?(f1+f2>=1?3:2):1;
  out.push(['Friendship',gm,gm===3?'The planets ruling your Moon signs are natural friends. Easy companionship.':gm===2?'A steady, respectful friendship that grows with shared plans.':'You see the world a little differently. Curiosity about each other\'s view helps a lot.']);
  const ga=GANA[a.nak],gb=GANA[b.nak],gn=ga===gb?3:(ga+gb===1)?2:1;
  out.push(['Temperament',gn,gn===3?'Similar natures. You handle life at a similar pace.':gn===2?'Close temperaments, with small differences that keep things interesting.':'One of you is more intense, the other gentler. Patience turns this into balance.']);
  const T=[1,3,5,7,8],t1=((b.nak-a.nak+27)%27)%9,t2=((a.nak-b.nak+27)%27)%9,tg=(T.includes(t1)?1:0)+(T.includes(t2)?1:0),tr=tg===2?3:tg===1?2:1;
  out.push(['Luck together',tr,tr===3?'Your birth stars support each other. Good things tend to happen when you plan together.':tr===2?'Mostly supportive. Pick good days for big joint decisions.':'Choose good days for important decisions together. The Plan tab helps.']);
  const nd=NADI[a.nak]!==NADI[b.nak]?3:1;
  out.push(['Health & family',nd,nd===3?'Different nadis, traditionally a healthy sign for family life.':'Same nadi. Tradition suggests looking after each other\'s rest and health a little more.']);
  const sc=out.reduce((s,x)=>s+x[1],0);
  const head=sc>=13?'A warm, natural match':sc>=10?'A good match with room to grow':'A match that grows with care';
  return{head,out}}

/* ---------- activities ---------- */
const DH=[3,11,20,25],CH=[6,14,21,22,23],LG=[0,7,12],MR=[4,13,16,26];
const U=(...a)=>[...new Set(a.flat())];
const ACT={
 love:{t:'Love & marriage',s:'dates, proposals, wedding talks',ic:'heart',a:[
  {id:'compat',t:'Compatibility finder',d:'see how two people match',special:1},
  {id:'date',t:'A date or a heart-to-heart',d:'first date, saying how you feel',naks:U(MR,LG,[3,11,14]),wds:[1,3,5]},
  {id:'propose',t:'Proposal or engagement',d:'asking the big question, roka',naks:[3,4,9,11,12,14,16,18,20,25,26],wds:[1,3,4,5],grow:1},
  {id:'talk',t:'An important conversation',d:'clearing the air, big decisions together',naks:U(LG,MR,[3,21]),wds:[1,3,4]},
  {id:'wedding',t:'Fix a wedding date',d:'for the families to discuss with their pandit',naks:[3,4,9,11,12,14,16,18,20,25,26],wds:[1,3,4,5],grow:1}]},
 home:{t:'Home & property',s:'moving, buying, building',ic:'home',a:[
  {id:'griha',t:'Move into a new home',d:'griha pravesh',naks:U(DH,MR,[21,22,23]),wds:[1,3,4,5],grow:1},
  {id:'property',t:'Buy or book property',d:'flat, house, land',naks:U(DH,[4,7,9,12,16,26]),wds:[4,5,1]},
  {id:'build',t:'Start construction or renovation',d:'foundation, big repairs',naks:U(DH,[4,7,12,13,16,21]),wds:[1,3,4,5]},
  {id:'vehicle',t:'Buy a vehicle',d:'car, bike, scooter',naks:U(CH,LG,MR),wds:[1,3,4,5]}]},
 travel:{t:'Travel',s:'trips, journeys, moving cities',ic:'travel',a:[
  {id:'trip',t:'Start a journey',d:'holiday, work trip, pilgrimage',naks:[0,4,6,7,12,16,21,22,26],wds:[1,3,4,5],travel:1},
  {id:'relocate',t:'Move to a new city',d:'relocating, a long stay abroad',naks:[0,6,7,12,16,21,26],wds:[1,3,4,5],travel:1}]},
 health:{t:'Health & body',s:'treatment, new habits',ic:'health',a:[
  {id:'treat',t:'Start a treatment',d:'a new course of care or therapy',naks:U(LG,DH,MR),wds:[0,1,3,4],note:'For anything urgent or surgical, always follow your doctor\'s timing.'},
  {id:'fit',t:'Start a fitness habit',d:'gym, yoga, running',naks:U(LG,[4,6,21,22]),wds:[0,2,4]},
  {id:'diet',t:'Begin a fast or detox',d:'vrat, a cleaner routine',naks:U(LG,[21,26]),wds:[1,4],anyT:1}]},
 learn:{t:'Learning',s:'courses, skills, exams',ic:'learn',a:[
  {id:'course',t:'Start a course or class',d:'new skill, music, language',naks:[0,6,7,12,13,14,21,22,23,26],wds:[0,3,4],grow:1},
  {id:'exam',t:'Exam or test day check',d:'see how the day looks for you',naks:U(LG,[6,21,26]),wds:[3,4]}]},
 spirit:{t:'Spiritual',s:'puja, mantra, giving',ic:'lotus',a:[
  {id:'puja',t:'Puja or havan at home',d:'katha, havan, special prayers',naks:[3,7,11,12,16,20,21,25,26],wds:[1,4,5],anyT:1},
  {id:'mantra',t:'Begin a mantra practice',d:'start a daily jap or sadhana',naks:[0,6,7,12,21,26],wds:[1,4],anyT:1},
  {id:'donate',t:'Donate or give',d:'charity, feeding, helping',naks:U(LG,MR,DH),wds:[4,6],anyT:1}]},
 family:{t:'Family events',s:'naming, mundan, functions',ic:'gift',a:[
  {id:'naming',t:'Naming ceremony',d:'namkaran',naks:[0,3,4,6,7,12,13,14,16,20,21,22,23,25,26],wds:[1,3,4,5]},
  {id:'mundan',t:'Mundan',d:'first haircut',naks:[0,4,6,7,12,13,14,21,22,23,26],wds:[1,3,4,5]},
  {id:'party',t:'Party or family function',d:'birthday, anniversary, get-together',naks:U(MR,LG,[3,21]),wds:[1,3,4,5]}]},
 career:{t:'Career',s:'jobs, meetings, launches',ic:'work',a:[
  {id:'job',t:'Interview or joining',d:'new job, internship, new role',naks:[0,3,6,7,11,12,13,16,20,21,25,26],wds:[1,3,4,5]},
  {id:'meet',t:'Important meeting',d:'boss, client, appraisal, negotiation',naks:U(LG,MR,DH,[21]),wds:[3,4,0]},
  {id:'raise',t:'Ask for a raise',d:'salary talk, promotion',naks:[3,7,12,21,26,11],wds:[4,3]},
  {id:'launch',t:'Launch something new',d:'product, business, website',naks:[0,3,7,11,12,13,20,21,25,26],wds:[3,4,5],grow:1},
  {id:'resign',t:'Resign or move on',d:'notice, exit talk',naks:U(DH,[6,7,16]),wds:[3,5]}]},
 money:{t:'Money',s:'invest, buy, borrow, sign',ic:'coin',a:[
  {id:'invest',t:'Invest',d:'stocks, gold, mutual funds, FD',naks:[0,3,7,12,21,26,11,20],wds:[3,4,5],grow:1},
  {id:'buy',t:'Big purchase',d:'phone, gadgets, jewellery',naks:U(CH,LG,MR),wds:[3,4,5]},
  {id:'loan',t:'Take a loan or start an EMI',d:'home loan, car loan, credit',naks:[6,14,21,22,23],wds:[3,4]},
  {id:'repay',t:'Repay a loan',d:'close a debt, prepay',naks:U(LG,CH,DH),wds:[2],anyT:1},
  {id:'sign',t:'Sign a contract',d:'deal, agreement, partnership',naks:U(DH,LG,[13,16]),wds:[3,4,5]}]}
};
const RIKTA=new Set(['Chaturthi','Navami','Chaturdashi','Amavasya']);
function scoreDay(r,a,b){const p=personDay(r,b);if(p.chandra.ashtama)return{s:-9,why:[]};
  if(!a.anyT&&RIKTA.has(r.tithi.name))return{s:-9,why:[]};
  let s=0;const why=[];
  if(a.naks.includes(r.nak.idx)){s+=3;why.push(`${r.nak.name} star suits it`)}
  const tq=TARA[p.tara.name][0];if(tq==='good'){s+=2;why.push('a strong day for '+(ME.self?'you':ME.name))}else if(tq==='bad')s-=3;
  if(p.chandra.q==='good')s+=1;else if(p.chandra.q==='bad')s-=2;
  if(a.wds.includes(r.wd)){s+=1;why.push(WDN[r.wd]+' suits it')}
  if(r.yoga.bad)s-=1;if(r.karana.vishti&&!a.anyT)s-=2;if(a.grow&&r.tithi.paksha==='Shukla'){s+=.5;why.push('waxing moon')}
  return{s,why}}
function windows(r,a,after){const ok=new Set(['best','good'].concat(a.travel?['ok']:[]));
  return segments(r).filter(g=>ok.has(g.cls)).map(g=>({a:Math.max(g.a,after||0),b:g.b,cls:g.cls,tag:g.tag})).filter(g=>g.b-g.a>=20*60e3&&hIST(g.a)>=6&&hIST(g.a)<21.5)
    .sort((x,y)=>(y.cls==='best')-(x.cls==='best')||(y.b-y.a)-(x.b-x.a))}
function findTimes(a,b,days=30){const [lat,lon]=loc(),t0=todayIST(),now=Date.now(),out=[];
  for(let i=0;i<days;i++){const ds=addDays(t0,i),r=calc(ds,lat,lon),sc=scoreDay(r,a,b||BIRTH);if(sc.s<3)continue;const w=windows(r,a,i===0?now:0);if(!w.length)continue;out.push({ds,r,s:sc.s,why:sc.why,w})}
  return out}
function quick(a){const L=findTimes(a,BIRTH,30),t=todayIST(),td=L.find(x=>x.ds===t);return td?{tq:'good',lab:'Today'}:L.length?{tq:'mixed',lab:dayLabel(L[0].ds).replace('Tomorrow','Tmrw')}:{tq:'slow',lab:'Later'}}

/* ---------- views ---------- */
const view={plan:['home'],personal:['home'],work:['home']};
function paneHead(tab,eyebrow,title,canBack){return`<header class="pane-h"><div>${canBack?`<button type="button" class="back" data-back="${tab}">${IC.back}Back</button>`:''}<div class="eyebrow">${eyebrow}</div><h1>${title}</h1></div><button type="button" class="pill gear" data-gear aria-label="Settings">${gearHTML()}</button></header>`}
function wire(el,tab){el.querySelectorAll('[data-back]').forEach(b=>b.onclick=()=>{view[tab].pop();draw(tab);scrollTo(0,0)});
  el.querySelectorAll('[data-gear]').forEach(b=>b.onclick=()=>openSheet())}
function go2(tab,v){view[tab].push(v);draw(tab);scrollTo(0,0)}

function catTiles(keys,tab){return`<div class="cgrid">${keys.map(k=>`<button type="button" class="cat card" data-cat="${k}"><span class="ci">${IC[ACT[k].ic]}</span><span><b>${ACT[k].t}</b><small>${ACT[k].s}</small></span></button>`).join('')}</div>`}
function actList(k){return`<div class="card alist">${ACT[k].a.map(a=>{const q=a.special?{tq:'mixed',lab:'Check'}:quick(a);return`<button type="button" class="arow" data-act="${k}:${a.id}"><span><b>${a.t}</b><small>${a.d}</small></span><span style="display:flex;align-items:center;gap:8px"><span class="tq ${VK[q.tq]}">${q.lab}</span><span class="chv">›</span></span></button>`}).join('')}</div>`}
function wireCats(el,tab){el.querySelectorAll('[data-cat]').forEach(b=>b.onclick=()=>go2(tab,'cat:'+b.dataset.cat));el.querySelectorAll('[data-act]').forEach(b=>b.onclick=()=>go2(tab,'act:'+b.dataset.act))}
function resultView(tab,k,id){const a=ACT[k].a.find(x=>x.id===id),L=findTimes(a,BIRTH,30),t=todayIST(),td=L.find(x=>x.ds===t);
  const best=L.slice().sort((x,y)=>y.s-x.s||x.ds.localeCompare(y.ds))[0];
  let top;
  if(td)top=`<span class="kpill k-good">${VI.good.replace(/width="\d+" height="\d+"/,'width="16" height="16"')}Today works</span><div class="ans">Yes, go ahead today.</div><div class="when">Best window: <b>${hm(td.w[0].a)} – ${fmt(td.w[0].b)}</b></div>`;
  else if(L.length)top=`<span class="kpill k-mixed">${VI.mixed.replace(/width="\d+" height="\d+"/,'width="16" height="16"')}A better day is coming</span><div class="ans">${dayLabel(L[0].ds)} looks better.</div><div class="when"><b>${hm(L[0].w[0].a)} – ${fmt(L[0].w[0].b)}</b> · ${L[0].why[0]||'a supportive day'}</div>`;
  else top=`<span class="kpill k-slow">${VI.slow.replace(/width="\d+" height="\d+"/,'width="16" height="16"')}Quiet month</span><div class="ans">No standout days in the next 30.</div><div class="when">Choose any calm, good window from the Today tab.</div>`;
  const slots=L.slice(0,8).map(x=>{const d=dObj(x.ds);return`<div class="slot"><div class="d"><small>${WDS[x.r.wd]}</small><b>${d.getUTCDate()}</b><small>${d.toLocaleDateString('en-IN',{month:'short',timeZone:'UTC'})}</small></div><div><div class="t">${hm(x.w[0].a)} – ${fmt(x.w[0].b)}${x===best?'<span class="tagb">Best pick</span>':''}</div><div class="w">${x.why.slice(0,3).join(' · ')||'A supportive day'}${x.w[1]?` · also ${hm(x.w[1].a)} – ${fmt(x.w[1].b)}`:''}</div></div></div>`}).join('');
  return paneHead(tab,ACT[k].t,a.t,true)+`<div class="card res-top">${top}</div>${slots?`<h2 class="sec-t">Good times, next 30 days</h2><div class="card slots">${slots}</div>`:''}<p class="note2">${a.note?a.note+' ':''}Worked out from ${ME.self?'your':ME.name+'’s'} birth star and Moon sign, the day's star, weekday and tithi, and the good choghadiya windows. Traditional guidance to help you plan, not a guarantee.</p>`}

function drawPlan(){const el=$('pane-plan'),v=view.plan[view.plan.length-1];let h;
  if(v==='home')h=paneHead('plan','Find a good time','Plan')+`<p class="pane-lead">Pick what you're planning. We'll find the kindest times in the next 30 days for ${ME.self?'you':ME.name}.</p>`+catTiles(['love','home','travel','health','learn','spirit','family','money'],'plan')+`<p class="note2">Work and money decisions are also in Professional.</p>`;
  else if(v.startsWith('cat:')){const k=v.slice(4);h=paneHead('plan','Plan',ACT[k].t,true)+actList(k)}
  else{const [k,id]=v.slice(4).split(':');if(id==='compat')return drawCompat();h=resultView('plan',k,id)}
  el.innerHTML=h;wire(el,'plan');wireCats(el,'plan')}
const CMP={a:'me',b:'',nb:{name:'',dob:'',time:'',place:'28.4595,77.0266'},res:null};
function drawCompat(){const el=$('pane-plan'),P=people(),opts=$('loc').innerHTML.replace(/ selected(="")?/g,'').replace(/<option[^>]*id="nearOpt"[^>]*>.*?<\/option>/,'');
  if(!CMP.b)CMP.b=(P.find(p=>p.rel==='Partner')||P[0]||{id:'new'}).id;
  const who=(sel,val,me)=>`<select id="${sel}">${me?`<option value="me"${val==='me'?' selected':''}>${ME.self?'You':esc(ME.name)}</option>`:''}${P.map(p=>`<option value="${p.id}"${val===p.id?' selected':''}>${esc(p.name)} · ${p.rel}</option>`).join('')}${me?'':`<option value="new"${val==='new'?' selected':''}>Someone new…</option>`}</select>`;
  const nb=CMP.nb;
  let h=paneHead('plan','Love & marriage','Compatibility',true)+`<p class="pane-lead">See how two people's stars meet, the traditional way. Gentle guidance, not a verdict.</p><div class="card form">
   <div class="frow"><label class="l">First person</label>${who('cA',CMP.a,true)}</div>
   <div class="frow"><label class="l">Second person</label>${who('cB',CMP.b,false)}</div>
   <div id="cNew" ${CMP.b==='new'?'':'hidden'}>
    <div class="frow"><label class="l">Their name</label><input type="text" id="cName" value="${esc(nb.name)}" placeholder="Name" autocomplete="off"></div>
    <div class="frow"><label class="l">Date of birth</label><input type="date" id="cDob" value="${nb.dob}"></div>
    <div class="frow"><label class="l">Time of birth</label><input type="time" id="cTime" value="${nb.time}"><label class="chk2"><input type="checkbox" id="cNoT" ${nb.dob&&!nb.time?'checked':''}> I don't know the time</label></div>
    <div class="frow"><label class="l">Place of birth</label><select id="cPlace">${opts}</select></div></div></div>
   <button type="button" class="btnp" id="cGo">Check compatibility</button><div id="cRes"></div>`;
  el.innerHTML=h;wire(el,'plan');const pl=$('cPlace');pl.value=nb.place;if(!pl.value)pl.selectedIndex=0;
  const keep=()=>{CMP.a=$('cA').value;CMP.b=$('cB').value;Object.assign(CMP.nb,{name:$('cName').value,dob:$('cDob').value,time:$('cNoT').checked?'':$('cTime').value,place:pl.value})};
  $('cB').onchange=()=>{keep();$('cNew').hidden=CMP.b!=='new';CMP.res=null;$('cRes').innerHTML=''};$('cA').onchange=()=>{keep();CMP.res=null;$('cRes').innerHTML=''};
  ['cName','cDob','cTime','cPlace'].forEach(i=>$(i).addEventListener('change',keep));$('cNoT').onchange=()=>{if($('cNoT').checked)$('cTime').value='';keep()};
  $('cGo').onclick=()=>{keep();const get=v=>v==='me'?{name:ME.self?'You':ME.name,nak:BIRTH.nak,rashi:BIRTH.rashi,me:1}:P.find(p=>p.id===v);
    let A=get(CMP.a),B;if(CMP.b==='new'){if(!nb.name.trim()){$('cName').focus();return}if(!nb.dob){$('cDob').focus();return}const [la,lo]=nb.place.split(',').map(Number);B=Object.assign({name:nb.name.trim(),fresh:1},birthChart(nb.dob,nb.time,la,lo))}else B=get(CMP.b);
    if(!A||!B)return;if(A.id&&A.id===B.id){$('cRes').innerHTML='<p class="note2" style="margin-top:14px">Pick two different people.</p>';return}
    CMP.res={A,B};showCompat();haptic(2);setTimeout(()=>{const r=$('cRes');if(r)r.scrollIntoView({behavior:'smooth',block:'start'})},60)};
  if(CMP.res)showCompat()}
function showCompat(){const {A,B}=CMP.res,m=match(A,B),us=A.me||B.me,other=A.me?B:A;
  const fix=t=>us?t:t.replace(/\bOne of you\b/g,'One of them').replace(/\bYour\b/g,'Their').replace(/\byour\b/g,'their').replace(/\bYou\b/g,'They').replace(/\byou\b/g,'they');
  const nm=us?`You and ${esc(other.name)}`:`${esc(A.name)} and ${esc(B.name)}`;
  $('cRes').innerHTML=`<div class="card gcard" style="margin-top:22px"><div class="sub">${nm}</div><h3 style="margin-top:2px">${m.head}</h3>
   <div class="chips3"><div><span>${esc(A.me?'You':A.name)}</span><b>${RS[A.rashi]} Moon</b><span>${NAKN[A.nak]}</span></div><div><span>${esc(B.me?'You':B.name)}</span><b>${RS[B.rashi]} Moon</b><span>${NAKN[B.nak]}</span></div></div>
   <div style="margin-top:8px">${m.out.map(([k,l,tx])=>`<div class="asp"><b>${k}</b><span class="lvl l${l}"><i></i><i></i><i></i></span><p>${fix(tx)}</p></div>`).join('')}</div>
   ${B.unsure?'<p class="note2" style="margin:8px 0 0">The Moon changed stars on that birth date, so a birth time would make this more exact.</p>':''}
   ${B.fresh?`<button type="button" class="btnp" id="cSave" style="margin-top:14px;background:var(--g-row);color:var(--ink);border:1px solid var(--g-edge)">Save ${esc(B.name)} to Personal</button>`:''}</div>
   <p class="note2" style="margin-top:14px">Based on Moon signs and birth stars (five parts of the traditional Ashtakoot match). For a wedding, families usually also consult a pandit for the full 36-point match. Every relationship is built by the two people in it.</p>`;
  const sv2=$('cSave');if(sv2)sv2.onclick=()=>{const nb=CMP.nb,rec=Object.assign({id:Date.now().toString(36),name:B.name,rel:partner()?'Friend':'Partner',dob:nb.dob,time:nb.time,place:nb.place},birthChart(nb.dob,nb.time,...nb.place.split(',').map(Number)));
    const L=people();L.push(rec);savePeople(L);CMP.b=rec.id;CMP.res.B=rec;sv2.outerHTML='<p class="note2" style="margin-top:12px">Saved to Personal ✓</p>';renderGlance()}}

/* ---------- Professional ---------- */
function workScore(r){const p=personDay(r,BIRTH),tq=TARA[p.tara.name][0];let s=(tq==='good'?2:tq==='bad'?-2:0)+(p.chandra.q==='good'?1:p.chandra.q==='bad'?-1:0)+([3,4].includes(r.wd)?1:0)-(r.yoga.bad?1:0);if(p.chandra.ashtama)s=-3;
  return s>=2?['good','Strong day for work']:s>=0?['mixed','Steady day for work']:['slow','Keep work routine']}
function drawWork(){const el=$('pane-work'),v=view.work[view.work.length-1];
  if(v!=='home'){if(v.startsWith('act:')){const [k,id]=v.slice(4).split(':');el.innerHTML=resultView('work',k,id)}else{const k=v.slice(4);el.innerHTML=paneHead('work','Professional',ACT[k].t,true)+actList(k)}wire(el,'work');wireCats(el,'work');return}
  const [lat,lon]=loc(),t=todayIST(),r=calc(t,lat,lon),[vc,vt]=workScore(r),now=Date.now();
  const W=windows(r,{},now).filter(g=>g.cls!=='ok');const focus=W.slice().sort((a,b)=>a.a-b.a)[0];
  const rahuLeft=+r.rahu[1]>now;
  const line=vc==='good'?'Good energy for bold moves: pitch, negotiate, decide.':vc==='mixed'?'A steady day. Good for progress on what\'s already moving.':'A day for routine work and preparation. Save big moves for a stronger day.';
  let wk='';for(let i=0;i<7;i++){const ds=addDays(t,i),rr=calc(ds,lat,lon),[c]=workScore(rr),d=dObj(ds);wk+=`<div class="${i===0?'tdy':''}"><small>${WDS[rr.wd]}</small><b>${d.getUTCDate()}</b><i style="background:${c==='good'?'var(--good)':c==='mixed'?'var(--best)':'var(--avoid)'}"></i></div>`}
  el.innerHTML=paneHead('work','Work & money','Professional')+`<div class="two"><div><div class="card gcard"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><h3>${vt}</h3>${vPill(vc,{good:'Strong',mixed:'Steady',slow:'Routine'}[vc]+' day')}</div><p>${line}</p>
    <div class="chips3"><div><span>Best for focus</span><b>${focus?hm(focus.a)+' – '+fmt(focus.b):'Tomorrow morning'}</b></div><div><span>${rahuLeft?'Avoid signing':'Rahu Kaal'}</span><b>${hm(r.rahu[0])} – ${fmt(r.rahu[1])}</b></div></div></div>
    <div class="card gcard"><h3>This week at work</h3><div class="week">${wk}</div><div class="wkey"><span><i style="background:var(--good)"></i>Strong</span><span><i style="background:var(--best)"></i>Steady</span><span><i style="background:var(--avoid)"></i>Routine</span></div></div></div>
    <div><h2 class="sec-t"><span class="hic">${IC.work}</span>Career</h2>${actList('career')}<h2 class="sec-t"><span class="hic">${IC.coin}</span>Money</h2>${actList('money')}<p class="note2">Traditional timing to help you choose a good moment. It isn't financial advice: check the numbers, and talk to an advisor for big decisions.</p></div></div>`;
  wire(el,'work');wireCats(el,'work')}

/* ---------- Personal ---------- */
function personSummary(p){const [lat,lon]=loc(),r=calc(todayIST(),lat,lon),[vc,vt]=vFor(r,p);return{vc,vt,line:TARA[personDay(r,p).tara.name][1].replace(/for you/,'for '+p.name).replace(/your/g,'their')}}
function drawPersonal(){const el=$('pane-personal'),v=view.personal[view.personal.length-1];let h='';
  if(v==='home'){const P=people();h=paneHead('personal','Love & family','Personal');
    h+=`<p class="pane-lead">${P.length?'How today looks for the people you love.':'Add your partner, children or family to see how each day looks for them, and the best days for you together.'}</p>`;
    h+=`<div class="plist">${P.map(p=>{const s=personSummary(p);return`<button type="button" class="person card" data-p="${p.id}"><span class="av" style="background:${REL[p.rel]||'#B9A27C'}">${esc(p.name[0]||'?')}</span><span><b>${esc(p.name)}</b><small>${p.rel} · ${NAKN[p.nak]}, ${RS[p.rashi]} Moon</small></span>${vPill(s.vc,s.vt)}</button>`}).join('')}<button type="button" class="addp" data-add>${IC.plus}Add ${P.length?'someone':'your partner or family'}</button></div>`;
    el.innerHTML=h;wire(el,'personal');el.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>go2('personal','p:'+b.dataset.p));el.querySelector('[data-add]').onclick=()=>go2('personal','edit:new');return}
  if(v.startsWith('edit:'))return drawForm(v.slice(5));
  const p=people().find(x=>x.id===v.slice(2));if(!p){view.personal=['home'];return drawPersonal()}
  const [lat,lon]=loc(),t=todayIST(),r=calc(t,lat,lon),[vc,vt]=vFor(r,p),me=verdict(personDay(r,BIRTH));
  h=paneHead('personal',p.rel,esc(p.name),true);
  h+=`<div class="two"><div><div class="card gcard"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><h3>Today for ${esc(p.name)}</h3>${vPill(vc,vt)}</div><p>${personSummary(p).line}.</p>
   <div class="chips3"><div><span>Moon sign</span><b>${RS[p.rashi]}</b></div><div><span>Birth star</span><b>${NAKN[p.nak]}</b></div>${p.lagna!=null?`<div><span>Rising</span><b>${RS[p.lagna]}</b></div>`:''}</div>${p.unsure?'<p class="note2" style="margin:10px 0 0">The Moon changed stars on this birth date. Adding a birth time makes this exact.</p>':''}</div>`;
  if(ME.self&&['Partner','Child','Parent','Sibling','Friend'].includes(p.rel)){
    const tog=(a,b)=>a==='slow'||b==='slow'?['slow','Be gentle']:a==='good'&&b==='good'?['good','Lovely']:['mixed','Steady'];
    let wk='';for(let i=0;i<7;i++){const ds=addDays(t,i),rr=calc(ds,lat,lon),[c]=tog(vFor(rr,p)[0],verdict(personDay(rr,BIRTH))[0]),d=dObj(ds);wk+=`<div class="${i===0?'tdy':''}"><small>${WDS[rr.wd]}</small><b>${d.getUTCDate()}</b><i style="background:${c==='good'?'var(--good)':c==='mixed'?'var(--best)':'var(--avoid)'}"></i></div>`}
    const [tc]=tog(vc,me[0]),tl={good:'A lovely day together. Plan something you both enjoy.',mixed:'A steady day together. Small kind gestures go a long way.',slow:'One of you may feel low on energy. Be extra gentle with each other today.'}[tc];
    h+=`<div class="card gcard"><h3>You and ${esc(p.name)}</h3><p>${tl}</p><div class="week">${wk}</div><div class="wkey"><span><i style="background:var(--good)"></i>Lovely</span><span><i style="background:var(--best)"></i>Steady</span><span><i style="background:var(--avoid)"></i>Be gentle</span></div></div>`}
  h+='</div><div>';
  if(ME.self&&p.rel==='Partner'){const m=match({nak:BIRTH.nak,rashi:BIRTH.rashi},p);
    h+=`<div class="card gcard"><h3>${m.head}</h3><div class="sub">Your connection, the traditional way</div><div style="margin-top:8px">${m.out.map(([k,l,tx])=>`<div class="asp"><b>${k}</b><span class="lvl l${l}"><i></i><i></i><i></i></span><p>${tx}</p></div>`).join('')}</div></div><p class="note2">Based on your Moon signs and birth stars (parts of the traditional Ashtakoot match). Every relationship is built by the two of you, not the stars.</p>`}
  h+=`<button type="button" class="btnp" data-edit style="background:var(--g-row);color:var(--ink);border:1px solid var(--g-edge)">Edit details</button><button type="button" class="btnd" data-del>Remove ${esc(p.name)}</button></div></div>`;
  el.innerHTML=h;wire(el,'personal');el.querySelector('[data-edit]').onclick=()=>go2('personal','edit:'+p.id);
  el.querySelector('[data-del]').onclick=()=>{savePeople(people().filter(x=>x.id!==p.id));view.personal=['home'];drawPersonal();renderGlance()}}
function drawForm(id){const el=$('pane-personal'),P=people(),p=P.find(x=>x.id===id)||{rel:partner()?'Child':'Partner',time:'',place:'28.4595,77.0266'};
  const opts=$('loc').innerHTML.replace(/ selected(="")?/g,'').replace(/<option[^>]*id="nearOpt"[^>]*>.*?<\/option>/,'');
  el.innerHTML=paneHead('personal',id==='new'?'Add someone':'Edit',id==='new'?'New person':esc(p.name),true)+`<div class="card form">
   <div class="frow"><label class="l">Name</label><input type="text" id="fName" value="${esc(p.name||'')}" placeholder="Their name" autocomplete="off"></div>
   <div class="frow"><label class="l">Relationship</label><div class="seg" id="fRel">${['Partner','Child','Parent','Sibling','Friend'].map(x=>`<button type="button" data-v="${x}" aria-pressed="${x===p.rel}">${x}</button>`).join('')}</div></div>
   <div class="frow"><label class="l">Date of birth</label><input type="date" id="fDob" value="${p.dob||''}"></div>
   <div class="frow"><label class="l">Time of birth</label><input type="time" id="fTime" value="${p.time||''}"><label class="chk2"><input type="checkbox" id="fNoT" ${p.dob&&!p.time?'checked':''}> I don't know the time</label></div>
   <div class="frow"><label class="l">Place of birth</label><select id="fPlace">${opts}</select></div></div>
   <button type="button" class="btnp" id="fSave">Save</button><p class="note2">Saved only on this device${ls.get('ghTok','')?' and your private sync':''}. Indian birthplaces only for now.</p>`;
  wire(el,'personal');const pl=$('fPlace');pl.value=p.place||'28.4595,77.0266';if(!pl.value)pl.selectedIndex=0;
  el.querySelectorAll('#fRel button').forEach(b=>b.onclick=()=>el.querySelectorAll('#fRel button').forEach(x=>x.setAttribute('aria-pressed',x===b)));
  $('fNoT').onchange=()=>{if($('fNoT').checked)$('fTime').value=''};$('fTime').oninput=()=>{if($('fTime').value)$('fNoT').checked=false};
  $('fSave').onclick=()=>{const name=$('fName').value.trim(),dob=$('fDob').value,time=$('fNoT').checked?'':$('fTime').value,rel=(el.querySelector('#fRel [aria-pressed="true"]')||{}).dataset?.v||'Partner';
    if(!name){$('fName').focus();return}if(!dob){$('fDob').focus();return}
    const [la,lo]=pl.value.split(',').map(Number),ch=birthChart(dob,time,la,lo);
    const rec=Object.assign({id:id==='new'?Date.now().toString(36):id,name,rel,dob,time,place:pl.value},ch);
    const L=people().filter(x=>x.id!==rec.id);L.push(rec);L.sort((a,b)=>['Partner','Child','Parent','Sibling','Friend'].indexOf(a.rel)-['Partner','Child','Parent','Sibling','Friend'].indexOf(b.rel));savePeople(L);
    haptic(2);view.personal=['home','p:'+rec.id];drawPersonal();renderGlance();scrollTo(0,0)}}

/* ---------- Practice: kind acts ---------- */
function kindActs(ds){const p=partner(),kid=people().find(x=>x.rel==='Child'),par=people().find(x=>x.rel==='Parent');
  const pool=[['Say one kind thing to yourself','Out loud, in the mirror. Mean it.'],['Thank someone for something small','A colleague, the guard, the delivery person.'],['Write down 3 good things','From today, however small.'],['Give someone your full attention','10 minutes, phone away.'],['Do one thing your future self will thank you for','Small counts.'],['Compliment someone\'s work','Be specific about what you liked.'],['Message an old friend','Just to say you thought of them.'],['Let something go','One worry you can\'t control today.']];
  if(p)pool.push([`Tell ${p.name} one thing you love about them`,'Something you haven\'t said in a while.'],[`Make ${p.name}\'s day a little easier`,'Take one task off their plate.']);
  if(kid)pool.push([`10 phone-free minutes with ${kid.name}`,'Play, read or just be together.']);
  pool.push([par?`Call ${par.name}`:'Call a parent or an elder','Ask how their day was, and listen.']);
  const n=Math.floor(dObj(ds)/864e5),pick=[];let i=n*7;while(pick.length<3){const x=pool[(i*5+3)%pool.length];if(!pick.includes(x))pick.push(x);i++}
  if(p&&!pick.some(x=>x[0].includes(p.name)))pick[1]=pool.find(x=>x[0].includes(p.name));return pick}
function drawKind(){const box=$('kindBox');if(!box)return;const ds=$('date').value||todayIST(),k='habit:'+ds,done=ls.get(k,[]),acts=kindActs(ds);
  box.innerHTML=acts.map((a,i)=>`<button type="button" class="ka${done.includes(i)?' done':''}" data-i="${i}"><span class="cb">${done.includes(i)?IC.check:''}</span><span><b>${esc(a[0])}</b><small>${esc(a[1])}</small></span></button>`).join('');
  box.querySelectorAll('.ka').forEach(b=>b.onclick=()=>{const i=+b.dataset.i,d=ls.get(k,[]),j=d.indexOf(i);if(j<0)d.push(i);else d.splice(j,1);ls.set(k,d);if(j<0&&d.length===acts.length)haptic(2);drawKind();renderGlance()})}

/* ---------- Today: at a glance ---------- */
function renderGlance(){const box=$('glance');if(!box)return;const [lat,lon]=loc(),t=todayIST(),r=calc(t,lat,lon),[wc,wt]=workScore(r),p=partner()||people()[0];
  const ds=$('date').value||t,done=ls.get('ritual:'+ds,[]).length,tot=document.querySelectorAll('#prac .pi').length||4,kd=ls.get('habit:'+ds,[]).length;
  const dot=c=>`<i style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${c==='good'?'var(--good)':c==='mixed'?'var(--best)':'var(--avoid)'}"></i>`;
  let ph;if(p){const [vc,vt]=vFor(r,p);ph=`<button type="button" class="gl card" data-go="personal"><span class="k">${IC.heart}${esc(p.name)}</span><b>${dot(vc)} ${vt}</b><small>${personSummary(p).line}</small></button>`}
  else ph=`<button type="button" class="gl card" data-go="personal"><span class="k">${IC.heart}Personal</span><b>Add your partner</b><small>See how each day looks for them</small></button>`;
  box.innerHTML=(ME.noWork?'':`<button type="button" class="gl card" data-go="work"><span class="k">${IC.work}Work</span><b>${dot(wc)} ${wt}</b><small>Career and money timing</small></button>`)+`${ph}
   <button type="button" class="gl card" data-go="practice"><span class="k">${IC.lotus}Practice</span><b>${done} of ${tot} done</b><small>${kd?kd+' kind act'+(kd>1?'s':'')+' today':'Mantras, kind acts, intention'}</small></button>
   <button type="button" class="gl card" data-go="plan"><span class="k">${IC.plan}Plan</span><b>Planning something?</b><small>Find a good time</small></button>`;
  box.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>setTab(b.dataset.go))}

/* ---------- tabs ---------- */
const TABS=[['today','Today',IC.today],['plan','Plan',IC.plan],['personal','Personal',IC.heart],['work','Professional',IC.work],['practice','Practice',IC.lotus]].filter(t=>!(ME.noWork&&t[0]==='work'));
function draw(tab){if(tab==='plan')drawPlan();else if(tab==='work')drawWork();else if(tab==='personal')drawPersonal();else if(tab==='practice'){drawKind()}}
let cur='today';
function setTab(t){if(t===cur){if(t!=='today'&&view[t]&&view[t].length>1){view[t]=['home'];draw(t)}scrollTo({top:0,behavior:'smooth'});return}
  cur=t;document.body.dataset.tab=t;document.querySelectorAll('.tabbar button').forEach(b=>b.setAttribute('aria-selected',b.dataset.t===t));placeInd();draw(t);scrollTo(0,0);try{sessionStorage.setItem('tab',t)}catch(e){}}
window.setTab=setTab;
function nameEyebrow(){const e=$('eyebrow'),h=$('title');if(!e||!ME.first)return;const T=h.textContent.trim();
  let t=e.textContent.replace(' · until sunrise','').replace(/^(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)/,m=>m.slice(0,3)).replace(/ (January|February|March|April|May|June|July|August|September|October|November|December)/,(m,mo)=>' '+mo.slice(0,3));
  if(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)/.test(t)&&!['Today','Tomorrow','Yesterday'].includes(T))t=t.replace(/^\w{3} /,'');
  if(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun) /.test(t)&&T!=='Today'&&T!=='Tomorrow'&&T!=='Yesterday')t=t.slice(4);
  e.innerHTML=`<b class="eb-name">${esc(ME.self?'Hi '+ME.first:ME.first+'’s day')}</b>`;
  h.innerHTML=`${esc(T)}<span class="tdate">${esc(t)}</span>`}
function placeInd(){const nav=document.querySelector('.tabbar');if(!nav)return;const b=nav.querySelector(`[data-t="${cur}"]`),i=nav.querySelector('.tind');if(!b||!i)return;i.style.width=b.offsetWidth+'px';i.style.transform=`translateX(${b.offsetLeft}px)`}
function dragTabs(nav){let sx=0,on=false,dragging=false,last=null,ind=nav.querySelector('.tind');const btns=()=>[...nav.querySelectorAll('button')];
  const at=x=>btns().find(b=>{const r=b.getBoundingClientRect();return x>=r.left&&x<r.right});
  let sy=0;nav.addEventListener('pointerdown',e=>{on=true;dragging=false;sx=e.clientX;sy=e.clientY;last=null});
  nav.addEventListener('pointermove',e=>{if(!on)return;if(!dragging){const dx=Math.abs(e.clientX-sx),dy=Math.abs(e.clientY-sy);if(dy>6&&dy>dx){on=false;return}if(dx<10)return}
    if(!dragging){dragging=true;nav.classList.add('drag');try{nav.setPointerCapture(e.pointerId)}catch(_){}}
    const nr=nav.getBoundingClientRect(),w=ind.offsetWidth,x=Math.max(5,Math.min(nr.width-5-w,e.clientX-nr.left-w/2));ind.style.transform=`translateX(${x}px) scale(1.06,1.08)`;
    const b=at(Math.max(nr.left+6,Math.min(nr.right-6,e.clientX)));if(b&&b!==last){btns().forEach(x=>x.classList.toggle('hov',x===b));last=b;if(typeof hapticTick==='function')hapticTick()}});
  const end=e=>{if(!on)return;on=false;nav.classList.remove('drag');btns().forEach(x=>x.classList.remove('hov'));
    if(dragging){const b=last;dragging=false;if(b){nav._skip=Date.now();if(b.dataset.t===cur)placeInd();else setTab(b.dataset.t);haptic()}else placeInd()}};
  nav.addEventListener('pointerup',end);nav.addEventListener('pointercancel',end);
  nav.addEventListener('click',e=>{if(nav._skip&&Date.now()-nav._skip<400){e.stopPropagation();e.preventDefault()}},true);
  addEventListener('resize',placeInd);
  let ly=scrollY,acc=0;addEventListener('scroll',()=>{const y=scrollY,d=y-ly;ly=y;if(innerWidth>=1080)return;acc=(Math.sign(d)===Math.sign(acc)?acc:0)+d;
    if(y<60||acc<-24)document.body.classList.remove('mini');else if(acc>24&&y+innerHeight<document.documentElement.scrollHeight-40)document.body.classList.add('mini')},{passive:true})}

function init(){const app=document.querySelector('.app');
  ['plan','personal','work','practice'].forEach(k=>{const s=document.createElement('section');s.className='pane';s.id='pane-'+k;app.appendChild(s)});
  // practice pane: header + mantras + kind acts + intention
  const pp=$('pane-practice'),sp=document.querySelector('.s-prac'),sa=document.querySelector('.s-aff');
  pp.innerHTML=paneHead('practice','Small acts, every day','Practice')+'<div class="two"><div id="ppL"></div><div id="ppR"></div></div>';
  wire(pp,'practice');
  const kind=document.createElement('section');kind.className='s-kind';kind.innerHTML=`<div class="sec-title"><h2><span class="hic">${IC.heart}</span>Kind acts</h2><span>3 for today</span></div><div class="card kact" id="kindBox"></div>`;
  $('ppL').appendChild(sp);$('ppR').appendChild(kind);$('ppR').appendChild(sa);
  // today: glance section in column 3
  const gl=document.createElement('section');gl.className='s-glance';gl.innerHTML='<div class="sec-title"><h2><span class="hic">'+IC.spark+'</span>At a glance</h2></div><div class="glance" id="glance"></div>';
  const c3=document.querySelector('.c3');if(c3){c3.prepend(gl);const dd=document.querySelector('.d-det'),dc=document.querySelector('.d-chart');if(dd)c3.appendChild(dd);if(dc)c3.appendChild(dc)}else app.appendChild(gl);gl.style.order=5;
  const nav=document.createElement('nav');nav.className='tabbar';nav.setAttribute('role','tablist');
  nav.innerHTML='<span class="tind"></span>'+TABS.map(([k,l,i])=>`<button type="button" role="tab" data-t="${k}" aria-selected="${k==='today'}">${i}<span>${l}</span></button>`).join('');
  document.body.appendChild(nav);const fitL=()=>nav.querySelectorAll('span').forEach(sp=>{const b=sp.parentElement;if(b.dataset.t==='work'){sp.textContent='Professional';if(sp.scrollWidth>sp.clientWidth+1)sp.textContent='Work'}});requestAnimationFrame(fitL);addEventListener('resize',fitL);if(document.fonts)document.fonts.ready.then(fitL);nav.querySelectorAll('button').forEach(b=>b.onclick=()=>setTab(b.dataset.t));dragTabs(nav);requestAnimationFrame(placeInd);if(document.fonts)document.fonts.ready.then(placeInd);
  document.body.dataset.tab='today';
  // sankalp chip opens Practice
  document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('.daynav .dsk')){setTab('practice')}},true);
  // re-render hooks
  const R=window.render;window.render=function(){const x=R.apply(this,arguments);try{nameEyebrow();renderGlance();if(cur!=='today'&&(!view[cur]||view[cur].length===1))draw(cur)}catch(e){console.error(e)}return x};
  try{nameEyebrow();renderGlance();drawKind()}catch(e){console.error(e)}
  let t0=null;try{t0=sessionStorage.getItem('tab')}catch(e){}if(t0&&t0!=='today')setTab(t0)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
