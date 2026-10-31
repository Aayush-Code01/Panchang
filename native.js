/* Shubhly native extras (App Store / Play Store builds only; does nothing in a browser).
   1. Morning reminder: the app works out each day on the phone, so it schedules its own local notifications
      for the next 14 days and tops them up every time it opens. No server, nothing leaves the phone.
   2. Real haptics through the Taptic Engine / vibration motor instead of the web fallback.
   Needs globals from the page: calc, verdict, segments, observance, fmt, ist, todayIST, ls, $, go, haptic. */
(function(){
 const C=window.Capacitor;
 if(!(C&&C.isNativePlatform&&C.isNativePlatform()))return;
 const plug=n=>(C.Plugins&&C.Plugins[n])||(C.registerPlugin&&C.registerPlugin(n));
 const LN=plug('LocalNotifications'), HP=plug('Haptics'), android=C.getPlatform&&C.getPlatform()==='android';
 document.documentElement.classList.add('native');

 /* ---------- haptics ---------- */
 if(HP){
  window.haptic=function(n=1){try{n>1?HP.notification({type:'SUCCESS'}):HP.impact({style:'LIGHT'})}catch(e){}};
  window.hapticTick=function(){try{HP.selectionChanged?HP.selectionChanged():HP.impact({style:'LIGHT'})}catch(e){}};
 }
 if(!LN)return;

 /* ---------- morning reminder ---------- */
 const DAYS=14, BASE=7000, PREF=()=>Object.assign({on:false,at:'sunrise'},ls.get('remind',{}));
 const addDays=(ds,n)=>{const d=new Date(ds+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)};
 const short=t=>fmt(t).replace(':00','').replace(' am','am').replace(' pm','pm');
 const span=(a,b)=>{const A=short(a),B=short(b),pa=A.slice(-2),pb=B.slice(-2);return (pa===pb?A.slice(0,-2):A)+'–'+B};

 function message(ds,la,lo){
  const r=calc(ds,la,lo),v=verdict(r),ob=(typeof observance==='function')?observance(r):null,S=segments(r).filter(s=>s.b<=+r.set+1);
  // the longest unbroken stretch of good or best time between sunrise and sunset (a stretch holding the best window wins ties)
  const runs=[];S.forEach(s=>{const ok=s.cls==='best'||s.cls==='good',L=runs[runs.length-1];
   if(ok&&L&&L.b===s.a)L.b=s.b,L.best=L.best||s.cls==='best';else if(ok)runs.push({a:s.a,b:s.b,best:s.cls==='best'})});
  const best=runs.sort((x,y)=>(y.b-y.a)+(y.best?20*60e3:0)-((x.b-x.a)+(x.best?20*60e3:0)))[0];
  const title=v[1]+(ob?' · '+ob.n:'');
  const parts=[];
  if(best)parts.push('Best time '+span(best.a,best.b));
  parts.push('Avoid '+span(r.rahu[0],r.rahu[1]));
  let body=parts.join(' · ')+'.';
  if(v[0]==='slow')body='Go gently today. '+body;else if(v[0]==='good')body='A day to move ahead. '+body;
  return {title,body,r};
 }
 function fireAt(ds,r,p){
  const [y,m,d]=ds.split('-').map(Number);
  if(p.at==='sunrise')return new Date(+r.rise+10*60e3);
  const [hh,mm]=String(p.at).split(':').map(Number);return new Date(y,m-1,d,hh||7,mm||0);
 }
 let busy=false;
 async function refresh(){
  if(busy)return;busy=true;
  try{
   const p=PREF();
   const pend=await LN.getPending();const mine=(pend.notifications||[]).filter(n=>n.id>=BASE&&n.id<BASE+100).map(n=>({id:n.id}));
   if(mine.length)await LN.cancel({notifications:mine});
   if(!p.on)return;
   const v=($('loc')||{}).value||'';if(!/^-?\d/.test(v))return;
   const [la,lo]=v.split(',').map(Number),t0=todayIST(),now=Date.now(),list=[];
   for(let i=0;i<=DAYS;i++){const ds=addDays(t0,i),mm=message(ds,la,lo),at=fireAt(ds,mm.r,p);
    if(+at<=now+60e3)continue;
    list.push({id:BASE+i,title:mm.title,body:mm.body,schedule:{at,allowWhileIdle:true},channelId:android?'daily':undefined,extra:{ds}})}
   if(list.length)await LN.schedule({notifications:list});
  }catch(e){console.warn('reminder',e)}finally{busy=false}
 }
 async function enable(){
  let st=await LN.checkPermissions();if(st.display!=='granted')st=await LN.requestPermissions();
  if(st.display!=='granted'){const p=PREF();p.on=false;ls.set('remind',p);paint();
   const n=$('remNote');if(n)n.textContent='Notifications are off for Shubhly. Turn them on in your phone’s Settings.';return}
  const p=PREF();p.on=true;ls.set('remind',p);paint();await refresh();
 }

 /* settings rows, placed above Location */
 function paint(){
  const p=PREF(),t=$('tglRem'),seg=$('segRem'),other=$('remTime');if(!t)return;
  t.checked=p.on;$('remWhen').style.display=p.on?'':'none';
  const preset=['sunrise','07:00','08:00'].includes(p.at)?p.at:'other';
  seg.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===preset)));
  other.style.display=preset==='other'?'':'none';if(preset==='other')other.value=p.at;
 }
 function mount(){
  const loc=[...document.querySelectorAll('#sheet .grp-t')].find(g=>/Location/.test(g.textContent));if(!loc||$('tglRem'))return;
  const html=`<div class="grp-t">Morning reminder</div><div class="grp-b">
   <div class="row"><span>Daily note<small>Your day, best time and what to avoid</small></span><input type="checkbox" class="tgl" id="tglRem" aria-label="Morning reminder"></div>
   <div class="row" id="remWhen"><span>When</span><div class="seg" id="segRem"><button type="button" data-v="sunrise">Sunrise</button><button type="button" data-v="07:00">7 am</button><button type="button" data-v="08:00">8 am</button><button type="button" data-v="other">Other</button></div></div>
   <div class="row" id="remOtherRow"><input type="time" id="remTime" aria-label="Reminder time" style="display:none;margin-left:auto"></div>
   <p class="rem-note" id="remNote">Made on your phone. Nothing is sent anywhere.</p></div>`;
  loc.insertAdjacentHTML('beforebegin',html);
  $('tglRem').onchange=()=>{if($('tglRem').checked)enable();else{const p=PREF();p.on=false;ls.set('remind',p);paint();refresh()}};
  $('segRem').onclick=e=>{const b=e.target.closest('button');if(!b)return;const p=PREF();
   if(b.dataset.v==='other'){p.at=$('remTime').value||'06:30';}else p.at=b.dataset.v;ls.set('remind',p);paint();refresh()};
  $('remTime').onchange=()=>{const p=PREF();if($('remTime').value){p.at=$('remTime').value;ls.set('remind',p);refresh()}};
  const st=document.createElement('style');st.textContent='#remOtherRow:has(#remTime[style*="none"]){display:none}.rem-note{margin:2px 14px 10px;font-size:12.5px;color:var(--muted)}';document.head.appendChild(st);
  paint();
 }

 if(android&&LN.createChannel)LN.createChannel({id:'daily',name:'Morning reminder',description:'Your day, best time and what to avoid',importance:3,visibility:1}).catch(()=>{});
 mount();
 // reschedule whenever the place or day changes, and each time the app comes back to the front
 if(typeof window.go==='function'){const g=window.go;window.go=function(){const out=g.apply(this,arguments);setTimeout(refresh,400);return out}}
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
 setTimeout(refresh,1200);
 window.ShubhlyRemind={refresh,message};
})();
