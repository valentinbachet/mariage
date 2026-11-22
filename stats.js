/* =====================================================================
   FRÉQUENTATION · statistiques anonymes, sans cookie ni service extérieur
   Chaque ouverture de rubrique est notée dans la base temps réel :
     stats/{AAAA-MM-JJ}/{clé} = { v: n° aléatoire du téléphone, x: n° de la visite,
                                  p: rubrique, l: langue, s: provenance (« mail#ancre » ou ""), t: heure }
   Aucun nom, aucun e-mail. Les mariés (appareils passés par #maries-…) et le mode
   « aperçu du jour J » ne sont pas comptés. Tableau de bord : dans l'espace privé des mariés.
   ===================================================================== */
(function(){
const S=window.__src||"";                       /* « mail#ancre » si arrivée par le bouton d'un e-mail */
const visit=Math.random().toString(36).slice(2,8);
const dev=String(store.get("did","")||"").slice(0,10);
const seen=new Set();
const off=()=>store.get("admin",false)===true||simOffset!=null||!window.Live||!dev;
const day=t=>new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Madrid"}).format(new Date(t));
let queue=[],timer=null;
function log(p){
 if(off()||!p||seen.has(p))return;seen.add(p);
 queue.push({v:dev,x:visit,p:String(p).slice(0,24),l:lang,s:seen.size===1?S:"",t:Date.now()});
 clearTimeout(timer);timer=setTimeout(flush,1500);
}
async function flush(){
 const q=queue;queue=[];if(!q.length||off())return;
 try{await Live.hold();const db=Live.db;for(const e of q)await db.set("stats/"+day(e.t)+"/"+db.key(),e)}catch(e){}finally{try{Live.release()}catch(_){}}
}
addEventListener("pagehide",flush);

/* on note la rubrique affichée (et le sous-onglet des jeux) */
const cur=()=>{const v=document.querySelector(".view.on");if(!v)return"";if(v.id==="jeux"){const s=document.querySelector(".sub.on");return"jeux/"+(s?s.dataset.subp:"")}return v.id};
const tick=()=>setTimeout(()=>log(cur()),50);
if(typeof go==="function"){const g0=go;window.go=function(){const r=g0.apply(this,arguments);tick();return r}}
if(typeof showSub==="function"){const s0=showSub;window.showSub=function(){const r=s0.apply(this,arguments);tick();return r}}
tick();

/* ---------------- tableau de bord (espace privé des mariés) ---------------- */
const NAMES={accueil:"Accueil",programme:"Programme",pratique:"Pratique",rsvp:"RSVP",table:"Ma table",soiree:"Jeux du soir",
 "jeux/playlist":"Jeux › Playlist","jeux/course":"Jeux › Carrera","jeux/piste":"Jeux › Piste","jeux/carte":"Jeux › Carte","jeux/capsule":"Jeux › Capsule"};
const bar=(n,max,label,extra)=>`<div class="stb"><span>${label}</span><i style="width:${max?Math.max(2,Math.round(n/max*100)):0}%"></i><b class="tabnum">${n}${extra||""}</b></div>`;
async function render(){
 const body=document.getElementById("admBody");if(!body||document.getElementById("admStats"))return;
 const box=document.createElement("div");box.id="admStats";box.innerHTML=`<h3>📈 Fréquentation</h3><p class="muted">Chargement…</p>`;body.prepend(box);
 let st={},u={},songs={};
 try{await Live.hold();const db=Live.db;[st,u,songs]=await Promise.all([db.get("stats"),db.get("u"),db.get("pl/songs")].map(p=>p.catch(()=>null)));}catch(e){}finally{try{Live.release()}catch(_){}}
 st=st||{};u=u||{};songs=songs||{};
 const all=[];for(const d in st)for(const k in st[d]){const e=st[d][k];if(e&&e.v)all.push({...e,d})}
 const devs=new Set(all.map(e=>e.v)),visits=new Set(all.map(e=>e.v+e.x));
 const today=day(Date.now()),todayDevs=new Set(all.filter(e=>e.d===today).map(e=>e.v));
 /* 30 derniers jours */
 const days=[];for(let i=29;i>=0;i--){const t=Date.now()-i*864e5;days.push(day(t))}
 const perDay=days.map(d=>new Set(all.filter(e=>e.d===d).map(e=>e.v)).size),maxDay=Math.max(1,...perDay);
 const count=(key,filter)=>{const m={};all.filter(filter||(()=>1)).forEach(e=>{const k=key(e);if(!k)return;(m[k]=m[k]||new Set()).add(e.v)});return Object.entries(m).map(([k,s])=>[k,s.size]).sort((a,b)=>b[1]-a[1])};
 const pages=count(e=>e.p),langs=count(e=>e.l),mails=count(e=>e.s.replace(/^mail/,"")||"",e=>e.s);
 const mx=a=>Math.max(1,...a.map(x=>x[1]));
 const LANG={fr:"Français",es:"Español",en:"English"};
 box.innerHTML=`<h3>📈 Fréquentation</h3>
  <div class="stk"><div><b class="tabnum">${devs.size}</b><small>visiteurs uniques</small></div><div><b class="tabnum">${visits.size}</b><small>visites</small></div><div><b class="tabnum">${todayDevs.size}</b><small>aujourd'hui</small></div><div><b class="tabnum">${Object.keys(u).length}</b><small>profils</small></div><div><b class="tabnum">${Object.values(songs).filter(x=>x&&!x.hide).length}</b><small>chansons</small></div></div>
  <div class="stdays" title="Visiteurs uniques par jour, 30 derniers jours">${perDay.map((n,i)=>`<i style="height:${Math.round(n/maxDay*100)}%" title="${days[i]} : ${n}"></i>`).join("")}</div>
  <p class="stcap"><span>${days[0].slice(8)}/${days[0].slice(5,7)}</span><span>visiteurs par jour (30 j)</span><span>aujourd'hui</span></p>
  <h4>Rubriques</h4>${pages.length?pages.map(([k,n])=>bar(n,mx(pages),NAMES[k]||k)).join(""):`<p class="muted">Pas encore de visite.</p>`}
  <h4>Langues</h4>${langs.map(([k,n])=>bar(n,mx(langs),LANG[k]||k)).join("")||`<p class="muted">—</p>`}
  <h4>Arrivées par les e-mails</h4>${mails.length?mails.map(([k,n])=>bar(n,mx(mails),k?"bouton vers "+k:"bouton du mail")).join(""):`<p class="muted">Aucune pour l'instant.</p>`}
  <p class="muted" style="font-size:13px;margin-top:10px">Comptage anonyme par téléphone, sans nom ni e-mail. Vos propres visites ne sont pas comptées.</p>`;
}
new MutationObserver(()=>{const b=document.getElementById("admBody");if(b&&b.children.length&&!document.getElementById("admStats")&&!/…/.test(b.textContent.slice(0,3)))render()}).observe(document.body,{childList:true,subtree:true});
window.Stats={render,flush};
})();
