/* ===== KONFIGURATION: alle Kauf-Links an EINER Stelle =====
   Solange ein Wert '#bald' ist, zeigt der Knopf "Bald verfügbar".
   Später z. B. einzel:'https://www.digistore24.com/…', paket:'https://…' */
const LINKS={einzel:'#bald',paket:'#bald'};
const WORKER_URL='https://funki-versand.funki-versand.workers.dev'; // Adresse des Versand-Workers (https://funki-versand.<konto>.workers.dev) – leer = Formular zeigt „Bald verfügbar“
const TIKTOK_HANDLE=''; // z. B. '@name' – leer = „Folge Funki auf TikTok“
/* ========================================================= */
(function(){
'use strict';
var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
var B=document.body.getAttribute('data-base')||''; // '../' auf Landingpages

/* Kauf-Knöpfe */
var follow=TIKTOK_HANDLE?('Folge '+TIKTOK_HANDLE+' auf TikTok'):'Folge Funki auf TikTok';
document.querySelectorAll('[data-link]').forEach(function(a){
  var url=LINKS[a.getAttribute('data-link')];
  if(!url||url==='#bald'){
    a.setAttribute('aria-disabled','true');a.setAttribute('role','button');a.removeAttribute('href');a.tabIndex=0;
    a.textContent='Bald verfügbar';
    var n=a.parentNode.nextElementSibling;if(n&&!n.classList.contains('note'))n=null;
    if(n)n.textContent=follow+' – Start in Kürze.';
    var show=function(e){e.preventDefault();if(n)n.textContent=follow+' – Start in Kürze.';coins(1)};
    a.addEventListener('click',show);
    a.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' ')show(e)});
  }else{a.href=url;a.rel='noopener';}
});

/* Anmeldeformular: nur aktiv, wenn WORKER_URL gesetzt ist */
document.querySelectorAll('form.optin').forEach(function(f){
  if(!WORKER_URL)return;
  var btn=f.querySelector('.btn'),note=f.querySelector('.note'),em=f.elements.email,cb=f.elements.einwilligung;
  em.disabled=false;cb.disabled=false;btn.disabled=false;btn.removeAttribute('aria-disabled');btn.textContent='Anleitung holen';
  f.addEventListener('submit',function(e){
    e.preventDefault();
    if(!em.value||!em.checkValidity()){note.textContent='Bitte gib eine gültige E-Mail-Adresse ein.';em.focus();return}
    if(!cb.checked){note.textContent='Bitte stimme dem E-Mail-Versand zu (Haken setzen).';cb.focus();return}
    btn.disabled=true;note.textContent='Moment …';
    fetch(WORKER_URL.replace(/\/$/,'')+'/anmelden',{method:'POST',headers:{'content-type':'application/json'},
      body:JSON.stringify({email:em.value.trim(),wort:f.getAttribute('data-wort'),einwilligung:true,website:f.elements.website.value})})
    .then(function(r){return r.json().catch(function(){return{}}).then(function(j){return[r.status,j]})})
    .then(function(a){
      if(a[1].ok){location.href=B+'danke/'+(a[1].status==='pdf'?'?s=pdf':'');return}
      btn.disabled=false;
      note.textContent=a[0]===429?'Zu viele Versuche – bitte probier es später nochmal.':'Das hat leider nicht geklappt. Bitte prüfe die Adresse und versuche es nochmal.';
    }).catch(function(){btn.disabled=false;note.textContent='Keine Verbindung – bitte versuche es nochmal.'});
  });
});

/* Funki-Animation */
var FR={stehen:3,laufen:4,jubeln:2,zeigen:2,tippen:2};
Object.keys(FR).forEach(function(k){for(var i=0;i<FR[k];i++){var im=new Image();im.src=B+'img/funki-'+k+'_'+i+'.png'}});
document.querySelectorAll('img.funki').forEach(function(img){
  var a=img.getAttribute('data-anim'),n=FR[a],i=0,t=+img.getAttribute('data-ms')||260;
  if(RM||!n)return;
  setInterval(function(){i=(i+1)%n;img.src=B+'img/funki-'+a+'_'+i+'.png'},t);
});
var hero=document.getElementById('heroFunki');
function setAnim(img,a){img.setAttribute('data-anim',a)}

/* HUD: Level + Münzen */
var coinN=+(sessionStorage.getItem('fk-coins')||0),coinEl=document.getElementById('coins'),lvEl=document.getElementById('lv');
function draw(){coinEl.textContent='x'+String(coinN).padStart(4,'0')}
function coins(d){coinN+=d;draw();try{sessionStorage.setItem('fk-coins',coinN)}catch(e){}
  var c=document.querySelector('.hud .coin');c.classList.remove('pop');void c.offsetWidth;c.classList.add('pop')}
draw();
var seen={};
var io=new IntersectionObserver(function(es){es.forEach(function(e){
  if(!e.isIntersecting)return;
  var id=e.target.id;
  if(e.target.classList.contains('rv'))e.target.classList.add('in');
  if(e.target.dataset.lv){lvEl.textContent=e.target.dataset.lv;
    if(!seen[id]){seen[id]=1;coins(+e.target.dataset.coins||0)}}
})},{threshold:.35});
document.querySelectorAll('.rv,[data-lv]').forEach(function(e){io.observe(e)});
if(RM)document.querySelectorAll('.rv').forEach(function(e){e.classList.add('in')});

/* Spiel starten */
var st=document.getElementById('start');
if(st)st.addEventListener('click',function(e){
  e.preventDefault();coins(5);
  if(hero&&!RM){setAnim(hero,'jubeln');setTimeout(function(){setAnim(hero,'stehen')},900)}
  document.getElementById('level-1').scrollIntoView({behavior:RM?'auto':'smooth'});
});

/* Parallax-Sterne (3 Ebenen, Canvas) */
var cv=document.getElementById('stars'),cx=cv.getContext('2d'),W,H,L=[],sy=0;
function size(){var d=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;cv.width=W*d;cv.height=H*d;cx.setTransform(d,0,0,d,0,0);cx.imageSmoothingEnabled=false;
  L=[{n:Math.round(W*H/9000),s:2,v:6,p:.04,c:'#6b6a9a'},{n:Math.round(W*H/16000),s:3,v:14,p:.1,c:'#c9c7ee'},{n:Math.round(W*H/40000),s:4,v:26,p:.2,c:'#FFD700'}].map(function(l){
    l.a=[];for(var i=0;i<l.n;i++)l.a.push({x:Math.random()*W,y:Math.random()*H,t:Math.random()*6});return l});frame(0,true)}
var last=0;
function frame(ts,once){
  var dt=Math.min((ts-last)/1000||0,.05);last=ts;
  cx.clearRect(0,0,W,H);
  L.forEach(function(l){cx.fillStyle=l.c;l.a.forEach(function(st){
    if(!once&&!RM){st.y+=l.v*dt;if(st.y>H+4){st.y=-4;st.x=Math.random()*W}}
    var y=((st.y-sy*l.p)%H+H)%H;
    cx.globalAlpha=l.s>2?(.55+.45*Math.sin(ts/600+st.t)):.7;
    cx.fillRect(Math.round(st.x),Math.round(y),l.s,l.s)})});
  cx.globalAlpha=1;
  if(!once&&!RM&&!document.hidden)requestAnimationFrame(frame);
}
addEventListener('scroll',function(){sy=scrollY;if(RM)frame(performance.now(),true)},{passive:true});
document.addEventListener('visibilitychange',function(){if(!document.hidden&&!RM)requestAnimationFrame(frame)});
var rt;addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(size,150)});
size();if(!RM)requestAnimationFrame(frame);
})();

/* Besucherzaehler (anonym, ohne Cookies) */
try{fetch(WORKER_URL+'/z',{method:'POST',keepalive:true,headers:{'content-type':'application/json'},body:JSON.stringify({p:location.pathname,r:document.referrer})})}catch(e){}
