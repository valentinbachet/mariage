/* =====================================================================
   LA CARRERA · course dans Séville, Team Agathe contre Team Valentin
   Dépend de : CONFIG, api, store, did, tr, pick, esc, toast, confetti, now, $
   ===================================================================== */
(function(){
const G={};
const HEADS={agathe:new Image(),valentin:new Image()};
HEADS.agathe.src="img/head-agathe.png";HEADS.valentin.src="img/head-valentin.png";
const TEAM_NAME={agathe:"Agathe",valentin:"Valentin"};

let team=store.get("team",null),nick=(window.Profile&&Profile.name)||store.get("nick",""),best=store.get("best",0);
/* identité : le profil (e-mail + code) s'il existe, sinon ce téléphone */
const meKey=()=>(window.Profile&&Profile.key())||Live.dev;
if(window.Profile)Profile.on(()=>{nick=Profile.name||store.get("nick","");team=store.get("team",null)||team;if(state!=="play"){loadBoard();if(state==="idle")idleScreen()}});
let board={teams:{agathe:0,valentin:0},screen:{agathe:0,valentin:0},top:[]};
let state="idle"; // idle | play | over
let cv,ctx,W,H,dpr,raf=null,last=0;
let P,obs,items,fx,speed,dist,bonus,cava,tAlive,nextSpawn,nextItem,cause,shake,seed;
let combo,mult,maxMult,texts,flash,inv,dying,zone,zoneT,rings,fans,targets,startBest,defiDone,comboPop;
/* textes propres au jeu (fr par défaut si une langue manque) */
const L={
 fr:{profWhy:"Créez votre profil (e-mail + code à 4 chiffres) : votre équipe et votre record vous suivront sur tous vos appareils, sous votre prénom.",podium:r=>`Tu es ${r}${r>1?"e":"er"} au classement : mets ta tête sur le podium !`,faceAdd:"Ajouter ma tête",faceChange:"Changer ma photo",combo:"COMBO",comboLost:"combo perdu",ole:"¡OLÉ ! ×2 et invincible",passed:n=>`${n} dépassé·e !`,beatMe:"Record battu !",you:"ton record",next:"Prochain",
  zone:(i,n)=>`Palier ${i+1} · ${n}`,gain:(p,t)=>`+${p} pour Team ${t} 🔥`,gap:(a,b)=>`L'écart passe de ${a} à ${b}`,ahead:t=>`Team ${t} repasse devant ! 🎉`,lead:n=>`Avance portée à ${n}`,
  miss:n=>`Encore ${n} pts pour battre ton record et faire gagner ta team`,stats:(m,c,x)=>`${m} m · ${c} 🥂 · combo max ×${x}`,
  defi:"Défi du jour",defiOk:"Défi réussi !",defiPts:(p,t)=>`+${p} pour Team ${t}`,defiDone:"réussi aujourd'hui ✓",defiTomorrow:"nouveau défi demain"},
 es:{profWhy:"Crea tu perfil (e-mail + código de 4 cifras): tu equipo y tu récord te seguirán en todos tus dispositivos, con tu nombre.",podium:r=>`¡Vas ${r}.º en la clasificación! Pon tu cara en el podio`,faceAdd:"Poner mi cara",faceChange:"Cambiar mi foto",combo:"COMBO",comboLost:"combo perdido",ole:"¡OLÉ! ×2 e invencible",passed:n=>`¡Has adelantado a ${n}!`,beatMe:"¡Récord batido!",you:"tu récord",next:"Siguiente",
  zone:(i,n)=>`Nivel ${i+1} · ${n}`,gain:(p,t)=>`+${p} para el Team ${t} 🔥`,gap:(a,b)=>`La diferencia pasa de ${a} a ${b}`,ahead:t=>`¡El Team ${t} vuelve a ir delante! 🎉`,lead:n=>`Ventaja de ${n}`,
  miss:n=>`Te faltan ${n} pts para batir tu récord y sumar para tu equipo`,stats:(m,c,x)=>`${m} m · ${c} 🥂 · combo máx ×${x}`,
  defi:"Reto del día",defiOk:"¡Reto conseguido!",defiPts:(p,t)=>`+${p} para el Team ${t}`,defiDone:"conseguido hoy ✓",defiTomorrow:"nuevo reto mañana"},
 en:{profWhy:"Create your profile (email + 4-digit code): your team and record will follow you on all your devices, under your name.",podium:r=>`You're #${r} on the board: put your face on the podium!`,faceAdd:"Add my face",faceChange:"Change my photo",combo:"COMBO",comboLost:"combo lost",ole:"¡OLÉ! ×2 and invincible",passed:n=>`You passed ${n}!`,beatMe:"Record beaten!",you:"your best",next:"Next",
  zone:(i,n)=>`Stage ${i+1} · ${n}`,gain:(p,t)=>`+${p} for Team ${t} 🔥`,gap:(a,b)=>`The gap goes from ${a} to ${b}`,ahead:t=>`Team ${t} is back in front! 🎉`,lead:n=>`Lead stretched to ${n}`,
  miss:n=>`${n} more pts to beat your best and score for your team`,stats:(m,c,x)=>`${m} m · ${c} 🥂 · best combo ×${x}`,
  defi:"Daily challenge",defiOk:"Challenge done!",defiPts:(p,t)=>`+${p} for Team ${t}`,defiDone:"done today ✓",defiTomorrow:"new challenge tomorrow"}};
const t2=k=>(L[lang]||L.fr)[k]??L.fr[k];
const buzz=p=>{try{navigator.vibrate&&navigator.vibrate(p)}catch(e){}};
/* paliers : le décor et le ciel changent, petit coup d'accélérateur */
const ZONES=[{at:0,n:"Triana",sky:["#f7d9a8","#fbefdc"],lm:"giralda"},{at:250,n:"Torre del Oro",sky:["#f6c58f","#fbe6cc"],lm:"torre"},
 {at:550,n:"Plaza de España",sky:["#f2b08a","#f9dcc2"],lm:"plaza"},{at:900,n:"Hacienda",sky:["#e3998e","#f5d3c3"],lm:"hacienda"}];
/* défi du jour : un par jour, +100 pour la team, une fois par jour et par joueur */
const DEFI_PTS=100;
const DEFIS=[
 {fr:"Attrape 15 cavas en une partie",es:"Coge 15 cavas en una partida",en:"Grab 15 cavas in one run",ok:r=>r.cava>=15},
 {fr:"Cours 400 m",es:"Corre 400 m",en:"Run 400 m",ok:r=>r.m>=400},
 {fr:"Atteins le combo ×3",es:"Llega al combo ×3",en:"Reach a ×3 combo",ok:r=>r.mult>=3},
 {fr:"Attrape une bague 💍",es:"Coge un anillo 💍",en:"Grab a ring 💍",ok:r=>r.rings>=1},
 {fr:"Atteins la Plaza de España",es:"Llega a la Plaza de España",en:"Reach Plaza de España",ok:r=>r.zone>=2},
 {fr:"Attrape un éventail doré",es:"Coge un abanico dorado",en:"Grab a golden fan",ok:r=>r.fans>=1},
 {fr:"Attrape 30 cavas en une partie",es:"Coge 30 cavas en una partida",en:"Grab 30 cavas in one run",ok:r=>r.cava>=30}];
const dayKey=()=>new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Madrid"}).format(new Date(now()));
const todayDefi=()=>DEFIS[Math.floor(Date.parse(dayKey()+"T12:00:00Z")/864e5)%DEFIS.length];
const defiDoneToday=()=>store.get("defi-"+dayKey(),false);
let tuto=!store.get("tutoDone",false),passed=0,slow=1,hintT=0,pulse=0;

/* ---------- classement : un record par joueur, total d'équipe = somme des records ----------
   Stocké dans Firebase (live/carrera/p/<appareil>) via live.js ; démo locale sinon. */
function computeBoard(v){
 const t={agathe:0,valentin:0},scr={agathe:0,valentin:0},top=[];
 for(const k in (v||{})){const p=v[k];if(!p||!t.hasOwnProperty(p.team))continue;t[p.team]+=(p.best||0)+(p.bonus||0);
  if(p.screen)scr[p.team]+=p.best||0;else top.push({name:p.n,team:p.team,best:p.best||0,me:window.Live&&k===meKey(),f:p.f||""})}
 top.sort((a,b)=>b.best-a.best);return{teams:t,screen:scr,top:top.slice(0,10),all:top};
}
async function loadBoard(){
 if(!window.Live)return;
 try{await Live.hold();const raw=await Live.db.get("carrera/p");board=computeBoard(raw);const m=raw&&raw[meKey()];if(m&&m.best>best){best=m.best;store.set("best",best)}renderBoard()}catch(e){}finally{Live.release()}
}
async function pushScore(sc){
 if(!window.Live)return;
 try{await Live.hold();await Live.db.tx("carrera/p/"+meKey(),cur=>({...(cur||{}),n:nick,team,best:Math.max(cur&&cur.best||0,sc),t:Live.db.now()}));}catch(e){}finally{Live.release()}
 loadBoard();
}
async function pushDefi(){
 if(!window.Live)return;const d=dayKey();
 try{await Live.hold();await Live.db.tx("carrera/p/"+meKey(),cur=>{cur=cur||{};const done=cur.d||{};if(done[d])return cur;
  return{...cur,n:nick,team,best:cur.best||0,bonus:(cur.bonus||0)+DEFI_PTS,d:{...done,[d]:1},t:Live.db.now()}})}catch(e){}finally{Live.release()}
 loadBoard();
}
function defiLine(){
 if(runLocked())return"";const df=todayDefi(),done=defiDoneToday();
 return`<div class="gdefi${done?" ok":""}"><small>🎯 ${t2("defi")}</small><b>${esc(df[lang]||df.fr)}</b><span>${done?t2("defiDone")+" · "+t2("defiTomorrow"):t2("defiPts")(DEFI_PTS,TEAM_NAME[team])}</span></div>`;
}
/* podium : les 3 meilleurs peuvent mettre leur tête */
const myRank=()=>{const i=(board.top||[]).findIndex(p=>p.me);return i<0?0:i+1};
function faceAsk(){
 const el=document.getElementById("faceAsk");if(!el)return;const r=myRank();
 el.innerHTML=r&&r<=3?`<div class="faceask"><b>${t2("podium")(r)}</b><button type="button" class="btn btn-ghost btn-sm" id="faceBtn">📸 ${store.get("faceSet",false)?t2("faceChange"):t2("faceAdd")}</button>
  <input type="file" accept="image/*" capture="user" id="faceIn" hidden></div>`:"";
}
async function setFace(file){
 try{const f=await shrinkImg(file,180,0.78,true);await Live.hold();await Live.db.tx("carrera/p/"+meKey(),cur=>({...(cur||{}),n:nick,team,best:cur&&cur.best||0,f}));store.set("faceSet",true);toast("📸 ✓")}
 catch(e){toast("📸 ✗")}finally{Live.release()}
 loadBoard();
}
function renderBoard(){
 const a=board.teams.agathe||0,v=board.teams.valentin||0,tot=a+v||1;
 $("#teamScore").innerHTML=`<div class="tsb">
  <div class="tsb-side"><img src="img/head-agathe.png" alt=""><div><small>Team</small><b>Agathe</b><span class="tabnum">${fmt(a)} pts</span></div></div>
  <div class="tsb-side r"><div><small>Team</small><b>Valentin</b><span class="tabnum">${fmt(v)} pts</span></div><img src="img/head-valentin.png" alt=""></div></div>
  <div class="tsb-bar"><i style="width:${(a/tot*100).toFixed(1)}%"></i></div>${(board.screen&&(board.screen.agathe||board.screen.valentin))?`<p class="hint" style="margin:-6px 0 12px;text-align:center">${tr("runScreen")(fmt(board.screen.agathe||0),fmt(board.screen.valentin||0))}</p>`:""}`;
 const top=board.top||[];
 const pod=top.slice(0,3),face=s=>s.f?`<img src="${s.f}" alt="">`:`<img class="hd" src="img/head-${s.team}.png" alt="">`;
 const podium=pod.length?`<div class="podium">${[1,0,2].filter(i=>pod[i]).map(i=>`<div class="pd p${i+1} ${pod[i].team}"><div class="pf">${face(pod[i])}<i>${i+1}</i></div><b>${esc(pod[i].name||"?")}</b><span class="tabnum">${fmt(pod[i].best)}</span></div>`).join("")}</div>`:"";
 $("#lb").innerHTML=`<div class="topline">${tr("runTop")}</div>`+podium+(top.length>3?`<ol class="lb" start="4">${top.slice(3).map((s,i)=>`<li class="${s.team}"><span class="rk">${i+4}</span><span class="nm">${esc(s.name||"?")}<small>Team ${TEAM_NAME[s.team]||""}</small></span><b class="tabnum">${fmt(s.best)}</b></li>`).join("")}</ol>`:top.length?"":`<p class="muted" style="text-align:center">${tr(runLocked()?"runNoScoreYet":"runNoScore")}</p>`);
 faceAsk();
}
const fmt=n=>Math.round(n).toLocaleString(lang).replace(/ | /g," ");

/* ---------- interface ---------- */
function gui(html){$("#gui").innerHTML=html;$("#gui").hidden=!html}
function showTeamPick(){
 gui(`<div class="gpanel"><div class="eyebrow">${tr("runPick")}</div>
  <div class="pick">
   <button type="button" data-team="agathe"><img src="img/head-agathe.png" alt=""><b>Team Agathe</b></button>
   <button type="button" data-team="valentin"><img src="img/head-valentin.png" alt=""><b>Team Valentin</b></button></div>
  <p class="gsmall">${tr("runPickNote")}</p></div>`);
}
function showNick(){
 const guess=nick||(typeof R!=="undefined"&&R.people&&R.people[0]&&R.people[0].name)||"";
 gui(`<div class="gpanel"><div class="eyebrow">Team ${TEAM_NAME[team]}</div><div class="gtitle">${tr("runNickQ")}</div>
  <input id="nickIn" maxlength="20" value="${esc(guess)}" autocomplete="nickname" placeholder="${tr("runNickPh")}">
  <p class="gsmall">${tr("runNickLock")}</p>
  <button type="button" class="btn btn-gold" id="nickOk">${tr("next")}</button></div>`);
 setTimeout(()=>$("#nickIn")&&$("#nickIn").focus(),50);
}
function showReady(){
 gui(`<div class="gpanel ready"><img class="bighead" src="img/head-${team}.png" alt="">
  <div class="gtitle">${tr("runReady")(TEAM_NAME[team])}</div>
  <div class="howto"><div><b>👆</b><span>${tr("runHow1")}</span></div><div><b>👆👆</b><span>${tr("runHow2")}</span></div></div>
  <p class="gsmall">${tr("runHow")}</p>${defiLine()}
  <div id="faceAsk"></div><button type="button" class="btn btn-gold" id="goBtn">${tr("runGo")}</button>
  ${best?`<p class="gsmall">${tr("runBest")} : <b class="tabnum">${fmt(best)}</b></p>`:""}</div>`);
}
function impactLine(sc,isBest){
 if(cause==="pause")return`<div class="gsmall">${tr("runNotBest")}</div>`;
 const other=team==="agathe"?"valentin":"agathe",gain=isBest?sc-startBest:0;
 if(!gain)return`<div class="gimpact miss">${t2("miss")(fmt(startBest-sc+1))}</div>`;
 const gb=(board.teams[other]||0)-(board.teams[team]||0),ga=gb-gain;
 const l2=gb>0&&ga>0?t2("gap")(fmt(gb),fmt(ga)):gb>0?t2("ahead")(TEAM_NAME[team]):t2("lead")(fmt(-ga));
 return`<div class="gimpact"><b>${t2("gain")(fmt(gain),TEAM_NAME[team])}</b><span>${l2}</span><div class="gbar"><i style="width:${Math.max(6,Math.min(100,gain/(Math.abs(gb)+gain)*100)).toFixed(0)}%"></i></div></div>`;
}
function showOver(sc,isBest){
 const m=Math.floor(dist/(H/100)/4);
 gui(`<div class="gpanel over"><div class="eyebrow">${esc(tr("runCause")[cause]||"")}</div>
  <div class="gscore tabnum">${fmt(sc)}</div><div class="gsmall">${t2("stats")(fmt(m),cava,maxMult)}${isBest?` · <b>${tr("runNewBest")}</b>`:""}</div>
  ${impactLine(sc,isBest)}<div id="faceAsk"></div>${defiLine()}
  <div class="gbtns"><button type="button" class="btn btn-gold" id="goBtn">${tr("runAgain")}</button></div>
  <div class="gsmall">${tr("runBest")} : <b class="tabnum">${fmt(best)}</b> · ${tr("runBestOnly")}</div></div>`);
}
/* ouverture 7 jours avant le mariage (CONFIG.RUN_AT) ; le mode test débloque */
const runLocked=()=>CONFIG.RUN_AT&&now()<Date.parse(CONFIG.RUN_AT)&&!(window.Live&&Live.test());
function showLocked(){
 const d=new Intl.DateTimeFormat({fr:"fr-FR",es:"es-ES",en:"en-GB"}[lang]||"fr-FR",{timeZone:"Europe/Madrid",day:"numeric",month:"long"}).format(new Date(CONFIG.RUN_AT));
 gui(`<div class="gpanel"><div class="pick" style="pointer-events:none"><button type="button" tabindex="-1"><img src="img/head-agathe.png" alt=""><b>Team Agathe</b></button><button type="button" tabindex="-1"><img src="img/head-valentin.png" alt=""><b>Team Valentin</b></button></div>
  <div class="gtitle">${window.ICO?ICO.lock:""} ${tr("runLockT")(d)}</div><p class="gsmall">${tr("runLockD")}</p></div>`);
}
function idleScreen(){if(runLocked())return showLocked();if(!team)showTeamPick();else if(!nick)showNick();else showReady()}

/* ---------- moteur ---------- */
function size(){
 const box=$("#game").getBoundingClientRect();if(!box.width)return false;
 dpr=Math.min(2,devicePixelRatio||1);W=box.width;H=Math.round(Math.min(W*1.05,460));
 cv.style.height=H+"px";cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);return true;
}
const GROUND=()=>H*0.82;
function reset(){
 const u=H/100;
 P={x:W*0.2,y:GROUND(),vy:0,air:false,jumps:0,hold:false,w:7*u,h:15*u,head:15*u,run:0};
 obs=[];items=[];fx=[];speed=25*u;dist=0;bonus=0;cava=0;tAlive=0;nextSpawn=W*1.3;nextItem=W*0.5;cause="";shake=0;seed=1;
 passed=0;slow=1;hintT=3.2;P.rot=0;
 combo=0;mult=1;maxMult=1;texts=[];flash=0;inv=0;dying=0;zone=0;zoneT=0;rings=0;fans=0;comboPop=0;defiDone=defiDoneToday();startBest=best;
 targets=(board.all||[]).filter(p=>!p.me&&p.name!==nick&&p.best>0).map(p=>{const o={name:p.name,best:p.best};if(p.f){o.img=new Image();o.img.src=p.f}return o});
 if(best>0)targets.push({name:t2("you"),best,me:true});targets.sort((a,b)=>a.best-b.best);
}
function rnd(a,b){return a+Math.random()*(b-a)}
function spawnObstacle(){
 const u=H/100,g=GROUND(),pool=tAlive<7?["bollard","bollard","tourist"]:["tourist","tourist","bollard"];
 if(tAlive>14)pool.push("caleche");if(tAlive>20)pool.push("pigeon");if(tAlive>28)pool.push("bull","tourist");
 const k=pool[Math.random()*pool.length|0];let o;
 if(k==="tourist")o={k,w:8*u,h:17*u,y:g,c:["#3e7cb1","#e07a5f","#81b29a","#f2cc8f"][Math.random()*4|0]};
 if(k==="bollard")o={k,w:4*u,h:9*u,y:g};
 if(k==="caleche")o={k,w:27*u,h:18*u,y:g};
 if(k==="pigeon")o={k,w:7*u,h:4*u,y:g-rnd(19,27)*u,flap:0};
 if(k==="bull")o={k,w:17*u,h:12*u,y:g,extra:speed*0.55,warn:1.0};
 o.x=W+(k==="bull"?W*0.6:20);obs.push(o);
 const e=tAlive<12?rnd(1.6,2.3):tAlive<25?rnd(1.2,1.85):rnd(0.95,1.6);nextSpawn=speed*e+o.w;
}
function spawnItem(){
 const u=H/100,g=GROUND(),r=Math.random(),fan=tAlive>10&&!inv&&r<0.045,ring=!fan&&r<0.105;
 const n=ring||fan?1:(Math.random()<0.45?3:1),y=g-rnd(8,tAlive<10?22:30)*u;
 for(let i=0;i<n;i++)items.push({k:fan?"fan":ring?"ring":"cava",x:W+20+i*6*u,y:y-(n>1?Math.sin(i/(n-1)*Math.PI)*6*u:0),w:4*u,h:7*u,bob:Math.random()*6});
 nextItem=speed*rnd(1.1,2.4);
}
function jump(){
 if(state!=="play"||dying>0)return;
 const u=H/100;
 if(!P.air){P.vy=-112*u;P.air=true;P.jumps=1;P.hold=true;puff(P.x,GROUND())}
 else if(P.jumps<2){P.vy=-95*u;P.jumps=2;P.hold=true;puff(P.x,P.y)}
}
function release(){P&&(P.hold=false);if(P&&P.vy<-48*H/100&&state==="play")P.vy=-48*H/100}
function puff(x,y){for(let i=0;i<6;i++)fx.push({x,y,vx:rnd(-30,10),vy:rnd(-40,-5),t:0.4,c:"rgba(226,161,60,.7)"})}
function hit(o){
 const u=H/100,px=P.x-P.w*0.45,pw=P.w*0.9,pt=P.y-P.h-P.head*0.75,pb=P.y;
 const m=1.2*u,ox=o.x+m,ow=o.w-2*m,ot=o.y-o.h+m,ob=o.y;
 return px<ox+ow&&px+pw>ox&&pt<ob&&pb>ot;
}
function pop(x,y,s,c,big){texts.push({x,y,s,c:c||C.deep,t:big?1.3:0.9,big:!!big})}
function burst(x,y,c,n){for(let i=0;i<(n||8);i++)fx.push({x,y,vx:rnd(-70,70),vy:rnd(-90,10),t:0.55,c})}
function runStats(){return{cava,m:Math.floor(dist/(H/100)/4),mult:maxMult,rings,fans,zone}}
function update(dt){
 const u=H/100,g=GROUND();
 for(const f of fx){f.x+=f.vx*dt;f.y+=f.vy*dt;f.vy+=200*dt;f.t-=dt}fx=fx.filter(f=>f.t>0);
 for(const t of texts){t.t-=dt;t.y-=(t.big?14:34)*dt}texts=texts.filter(t=>t.t>0);
 if(flash>0)flash-=dt;if(comboPop>0)comboPop-=dt;if(zoneT>0)zoneT-=dt;if(shake>0)shake-=dt;
 if(dying>0){ // petit ralenti de chute avant l'écran de fin
  dying-=dt;P.rot+=dt*7;P.vy+=200*u*dt;P.y=Math.min(g,P.y+P.vy*dt*0.45);
  for(const o of obs)o.x-=speed*dt*0.12;if(dying<=0)end();return;
 }
 tAlive+=dt;speed=Math.min(70*u,25*u+tAlive*0.75*u+Math.max(0,tAlive-12)*0.55*u)+zone*1.5*u;
 if(inv>0)inv-=dt;
 const dx=speed*dt;dist+=dx;
 // joueur
 P.vy+=(P.vy<0&&P.hold?250:330)*u*dt;P.y+=P.vy*dt;
 if(P.y>=g){P.y=g;P.vy=0;if(P.air)puff(P.x,g);P.air=false;P.jumps=0}
 P.run+=dt*speed/(6*u);
 // apparition
 nextSpawn-=dx;if(nextSpawn<=0)spawnObstacle();
 nextItem-=dx;if(nextItem<=0)spawnItem();
 for(const o of obs){
  if(o.k==="bull"){if(o.warn>0){o.warn-=dt;continue}o.x-=dx+o.extra*dt}else o.x-=dx;
  if(o.k==="pigeon"){o.flap+=dt*14;o.x-=8*u*dt}
  if(!o.dead&&o.k==="bull"&&o.warn>0)continue;
  if(!o.dead&&hit(o)){
   if(inv>0){o.dead=true;bonus+=20;pop(o.x,o.y-o.h,"+20",C.ochre);burst(o.x+o.w/2,o.y-o.h/2,"#f3d27a",12);shake=0.12;buzz(20);continue}
   cause=o.k;dying=0.75;shake=0.35;P.vy=-70*u;flash=0;buzz([70,40,140]);return;
  }
 }
 obs=obs.filter(o=>!o.dead);
 for(const o of obs)if(!o.passed&&o.x+o.w<P.x-P.w){o.passed=true;passed++;if(tuto&&passed>=3){tuto=false;store.set("tutoDone",true)}}
 obs=obs.filter(o=>o.x+o.w>-20);
 for(const it of items){it.x-=dx;it.bob+=dt*4;
  const iy=it.y+Math.sin(it.bob)*u;
  if(Math.abs(it.x-P.x)<P.w*0.8&&iy>P.y-P.h-P.head&&iy-it.h<P.y){it.got=true;
   const x2=inv>0?2:1;
   if(it.k==="cava"){cava++;combo++;const nm=combo>=20?5:combo>=10?3:combo>=5?2:1;
    if(nm>mult){mult=nm;maxMult=Math.max(maxMult,mult);comboPop=0.6;pop(W/2,H*0.3,`${t2("combo")} ×${mult} !`,C.red,true);buzz([20,30,20])}else buzz(12);
    const pts=10*mult*x2;bonus+=pts;pop(it.x,iy-it.h,"+"+pts,mult>1?C.red:C.deep);burst(it.x,iy-it.h/2,"#e2a13c",8)}
   else if(it.k==="ring"){rings++;const pts=50*x2;bonus+=pts;flash=0.35;pop(it.x,iy-it.h,"💍 +"+pts,C.red,false);burst(it.x,iy-it.h/2,"#fff",14);buzz(40)}
   else{fans++;inv=5;flash=0.5;pop(W/2,H*0.3,t2("ole"),C.red,true);burst(it.x,iy-it.h/2,"#f3d27a",18);buzz([30,40,30,40,60])}}
  else if(!it.missed&&it.k==="cava"&&it.x<P.x-P.w){it.missed=true;if(combo>=5)pop(P.x,P.y-P.h-P.head-4*u,t2("comboLost"),"#8a7a6a");combo=0;mult=1}}
 items=items.filter(i=>!i.got&&i.x>-20);
 // paliers
 const m=Math.floor(dist/u/4);
 if(zone<ZONES.length-1&&m>=ZONES[zone+1].at){zone++;zoneT=2.4;bonus+=25;pop(P.x+10*u,P.y-P.h-P.head,"+25",C.ochre);buzz([20,40,20])}
 // rivaux
 const sc=score();
 while(targets.length&&sc>targets[0].best){const tg=targets.shift();pop(W/2,H*0.42,tg.me?t2("beatMe"):t2("passed")(tg.name),C.red,true);burst(P.x,P.y-P.h,"#c2185b",16);buzz([30,30,30])}
 // défi du jour
 if(!defiDone&&!runLocked()&&todayDefi().ok(runStats())){defiDone=true;store.set("defi-"+dayKey(),true);pushDefi();
  pop(W/2,H*0.52,"🎯 "+t2("defiOk")+" "+t2("defiPts")(DEFI_PTS,TEAM_NAME[team]),C.deep,true);buzz([40,60,40]);try{confetti()}catch(e){}}
}
function score(){return Math.floor(dist/(H/100)/4)+bonus}

/* ---------- dessin ---------- */
const C={sky1:"#f7d9a8",sky2:"#fbefdc",wall:"#faf6ee",ochre:"#e2a13c",red:"#9b2a22",deep:"#5a1712",ink:"#2a1d18",sand:"#e8b765",sand2:"#d99a3f"};
function hash(n){const x=Math.sin(n*127.1)*43758.5453;return x-Math.floor(x)}
function mix(a,b,k){const p=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)),A=p(a),B=p(b);return"rgb("+A.map((v,i)=>Math.round(v+(B[i]-v)*k)).join(",")+")"}
function drawLandmark(kind,gx,g,u){
 ctx.fillStyle="rgba(155,42,34,.18)";
 if(kind==="giralda"){ctx.fillRect(gx,g-58*u,9*u,58*u);ctx.fillRect(gx+1.5*u,g-66*u,6*u,8*u);ctx.fillRect(gx+3*u,g-72*u,3*u,6*u);
  ctx.beginPath();ctx.moveTo(gx+3*u,g-72*u);ctx.lineTo(gx+4.5*u,g-77*u);ctx.lineTo(gx+6*u,g-72*u);ctx.fill()}
 if(kind==="torre"){ctx.fillRect(gx,g-40*u,16*u,40*u);ctx.fillRect(gx+3*u,g-52*u,10*u,12*u);ctx.fillRect(gx+5*u,g-60*u,6*u,8*u);
  ctx.beginPath();ctx.arc(gx+8*u,g-60*u,3*u,Math.PI,0);ctx.fill();for(let i=0;i<4;i++)ctx.fillRect(gx+i*4.4*u,g-43*u,2.4*u,3*u)}
 if(kind==="plaza"){ctx.fillRect(gx,g-40*u,80*u,40*u);ctx.fillRect(gx-5*u,g-66*u,10*u,66*u);ctx.fillRect(gx+75*u,g-66*u,10*u,66*u);
  ctx.fillRect(gx-3*u,g-73*u,6*u,7*u);ctx.fillRect(gx+77*u,g-73*u,6*u,7*u);ctx.beginPath();ctx.arc(gx,g-73*u,3*u,Math.PI,0);ctx.arc(gx+80*u,g-73*u,3*u,Math.PI,0);ctx.fill();
  ctx.fillStyle="rgba(255,255,255,.3)";for(let i=0;i<8;i++){ctx.beginPath();ctx.arc(gx+9*u+i*9*u,g-50*u+16*u,3*u,Math.PI,0);ctx.fill();ctx.fillRect(gx+6*u+i*9*u,g-34*u,6*u,6*u)}}
 if(kind==="hacienda"){ctx.fillRect(gx,g-42*u,64*u,42*u);ctx.fillRect(gx+22*u,g-58*u,20*u,16*u);ctx.beginPath();ctx.moveTo(gx+22*u,g-58*u);ctx.quadraticCurveTo(gx+32*u,g-68*u,gx+42*u,g-58*u);ctx.fill();
  ctx.fillStyle="rgba(255,255,255,.4)";ctx.beginPath();ctx.arc(gx+32*u,g-52*u,3*u,0,7);ctx.fill();for(let i=0;i<5;i++){ctx.beginPath();ctx.arc(gx+9*u+i*11.5*u,g-34*u,3.6*u,Math.PI,0);ctx.fill();ctx.fillRect(gx+5.4*u+i*11.5*u,g-34*u,7.2*u,7*u)}}
}
function drawBG(){
 const g=GROUND(),u=H/100,Z=ZONES[zone||0],Zp=ZONES[Math.max(0,(zone||0)-1)],k=zoneT>1.4?1-(zoneT-1.4):1;
 const sk=ctx.createLinearGradient(0,0,0,g);sk.addColorStop(0,mix(Zp.sky[0],Z.sky[0],k));sk.addColorStop(1,mix(Zp.sky[1],Z.sky[1],k));ctx.fillStyle=sk;ctx.fillRect(0,0,W,g);
 // soleil
 ctx.fillStyle="rgba(226,161,60,.35)";ctx.beginPath();ctx.arc(W*0.78,g*0.28,9*u,0,7);ctx.fill();
 // Giralda lointaine
 const gx=((W*1.2-dist*0.06)%(W*1.6)+W*1.6)%(W*1.6)-W*0.3;
 drawLandmark(Z.lm,gx,g,u);
 // maisons blanches (parallaxe 0.4)
 const off=dist*0.4,bw=26*u,start=Math.floor(off/bw)-1;
 for(let i=start;i<start+W/bw+3;i++){
  const x=i*bw-off,hh=(26+hash(i)*20)*u,top=g-hh;
  ctx.fillStyle=C.wall;ctx.fillRect(x,top,bw+1,hh);
  ctx.fillStyle=hash(i+3)>.5?C.ochre:"#f0c27a";ctx.fillRect(x,top,bw+1,2*u);ctx.fillRect(x,g-4*u,bw+1,4*u);
  ctx.fillStyle="rgba(42,29,24,.12)";ctx.fillRect(x+bw,top,1,hh);
  // fenêtres et balcons
  for(let r=0;r<Math.floor(hh/(11*u))-1;r++){
   const wy=top+5*u+r*11*u;
   for(let c=0;c<2;c++){const wx=x+4*u+c*11*u;
    ctx.fillStyle=hash(i*7+r+c)>.35?"#2f5d50":C.deep;ctx.fillRect(wx,wy,5*u,7*u);
    ctx.fillStyle=C.ink;ctx.fillRect(wx-1*u,wy+7*u,7*u,0.8*u);
    if(hash(i+r*3+c)>.6){ctx.fillStyle="#c2185b";ctx.beginPath();ctx.arc(wx+2.5*u,wy+6.6*u,1.6*u,0,7);ctx.fill()}}
  }
  // oranger
  if(hash(i*11)>.55){const tx=x+bw*0.6;ctx.fillStyle="#6b4a2b";ctx.fillRect(tx,g-12*u,1.4*u,12*u);
   ctx.fillStyle="#3f6b3a";ctx.beginPath();ctx.arc(tx+0.7*u,g-14*u,5*u,0,7);ctx.fill();
   ctx.fillStyle="#f08a24";for(let k=0;k<4;k++){ctx.beginPath();ctx.arc(tx-2*u+hash(i+k)*5*u,g-16*u+hash(i*k+1)*5*u,0.9*u,0,7);ctx.fill()}}
 }
 // sol : albero + bande rouge de la barrera
 ctx.fillStyle=C.red;ctx.fillRect(0,g,W,1.6*u);ctx.fillStyle=C.wall;ctx.fillRect(0,g+1.6*u,W,0.5*u);
 ctx.fillStyle=C.sand;ctx.fillRect(0,g+2.1*u,W,H-g);
 ctx.fillStyle=C.sand2;const so=dist%(9*u);
 for(let x=-so;x<W;x+=9*u){ctx.fillRect(x,g+6*u,4*u,0.6*u);ctx.fillRect(x+4.5*u,g+11*u,3*u,0.6*u)}
}
function drawPlayer(){
 if(inv>0){const u=H/100,a=inv<1.2?(Math.floor(inv*10)%2?0.15:0.45):0.4;ctx.save();ctx.globalAlpha=a;ctx.fillStyle="#f3d27a";ctx.beginPath();ctx.ellipse(P.x,P.y-P.h*0.9,P.w*1.6,P.h*1.25,0,0,7);ctx.fill();ctx.restore()}
 if(P.rot){ctx.save();ctx.translate(P.x,P.y-P.h*0.6);ctx.rotate(P.rot);ctx.translate(-P.x,-(P.y-P.h*0.6));drawPlayer0();ctx.restore()}else drawPlayer0();
}
function drawPlayer0(){
 const u=H/100,x=P.x,y=P.y,leg=Math.sin(P.run*1.0)*(P.air?0.3:1),tall=team==="valentin";
 const bh=P.h*(tall?1.08:1),hip=y-bh*0.45;
 ctx.lineCap="round";
 // jambes
 ctx.strokeStyle=tall?"#4a3426":"#2a1d18";ctx.lineWidth=2.2*u;
 ctx.beginPath();ctx.moveTo(x,hip);ctx.lineTo(x+leg*3.5*u,y-0.5*u);ctx.moveTo(x,hip);ctx.lineTo(x-leg*3.5*u,y-0.5*u);ctx.stroke();
 // corps
 if(tall){ctx.fillStyle="#46504a";ctx.fillRect(x-3.6*u,hip-bh*0.55,7.2*u,bh*0.58);ctx.fillStyle="#f4f1ea";ctx.fillRect(x-1.4*u,hip-bh*0.55,2.8*u,bh*0.5)}
 else{ctx.fillStyle="#d8c49a";ctx.beginPath();ctx.moveTo(x-3.4*u,hip-bh*0.55);ctx.lineTo(x+3.4*u,hip-bh*0.55);ctx.lineTo(x+5*u,hip+bh*0.12);ctx.lineTo(x-5*u,hip+bh*0.12);ctx.fill();
  ctx.strokeStyle="#b9a273";ctx.lineWidth=0.7*u;ctx.beginPath();ctx.moveTo(x-3.4*u,hip-bh*0.2);ctx.lineTo(x+3.4*u,hip-bh*0.2);ctx.stroke()}
 // bras
 ctx.strokeStyle=tall?"#46504a":"#d8c49a";ctx.lineWidth=1.8*u;
 ctx.beginPath();ctx.moveTo(x,hip-bh*0.48);ctx.lineTo(x-leg*3*u+2*u,hip-bh*0.1);ctx.moveTo(x,hip-bh*0.48);ctx.lineTo(x+leg*3*u-2*u,hip-bh*0.12);ctx.stroke();
 // grosse tête
 const im=HEADS[team],hh=P.head*(tall?1.05:1),hw=im.width?hh*im.width/im.height:hh*0.75,bob=P.air?0:Math.abs(Math.sin(P.run))*0.8*u;
 const tilt=P.air?-0.12:Math.sin(P.run)*0.05;
 ctx.save();ctx.translate(x,hip-bh*0.5-hh*0.42-bob);ctx.rotate(tilt);
 if(im.complete&&im.width)ctx.drawImage(im,-hw/2,-hh/2,hw,hh);else{ctx.fillStyle="#f1d2b6";ctx.beginPath();ctx.ellipse(0,0,hw/2,hh/2,0,0,7);ctx.fill()}
 ctx.restore();
}
function drawObs(o){
 const u=H/100,x=o.x,y=o.y;
 if(o.k==="bollard"){ctx.fillStyle=C.ink;ctx.fillRect(x,y-o.h,o.w,o.h);ctx.fillStyle=C.ochre;ctx.fillRect(x,y-o.h+1.5*u,o.w,1.2*u);ctx.beginPath();ctx.arc(x+o.w/2,y-o.h,o.w/2,Math.PI,0);ctx.fillStyle=C.ink;ctx.fill()}
 if(o.k==="tourist"){const cx=x+o.w/2;
  ctx.strokeStyle="#2a1d18";ctx.lineWidth=1.6*u;ctx.beginPath();ctx.moveTo(cx-1.5*u,y-6*u);ctx.lineTo(cx-1.5*u,y);ctx.moveTo(cx+1.5*u,y-6*u);ctx.lineTo(cx+1.5*u,y);ctx.stroke();
  ctx.fillStyle="#e9e3d6";ctx.fillRect(cx-3*u,y-7*u,6*u,2*u);
  ctx.fillStyle=o.c;ctx.fillRect(cx-3.5*u,y-13*u,7*u,6.5*u);
  ctx.fillStyle="#f1c9a5";ctx.beginPath();ctx.arc(cx,y-15*u,2.6*u,0,7);ctx.fill();
  ctx.fillStyle="#f4ecd8";ctx.fillRect(cx-4.5*u,y-17.5*u,9*u,1.2*u);ctx.fillRect(cx-2.6*u,y-19.5*u,5.2*u,2.2*u);
  ctx.fillStyle=C.ink;ctx.fillRect(cx-5.5*u,y-12*u,3*u,2.2*u);ctx.fillStyle="#fff";ctx.fillRect(cx-5.2*u,y-11.6*u,1*u,1*u)}
 if(o.k==="caleche"){
  ctx.fillStyle="#6d4c33";ctx.fillRect(x,y-11*u,9*u,5*u);ctx.fillRect(x+7*u,y-15*u,2.6*u,6*u);ctx.fillRect(x+7.5*u,y-17*u,4*u,2.6*u);
  ctx.strokeStyle="#6d4c33";ctx.lineWidth=1.3*u;const l=Math.sin(dist/(3*u));
  ctx.beginPath();ctx.moveTo(x+1*u,y-6*u);ctx.lineTo(x+1*u+l*u,y);ctx.moveTo(x+8*u,y-6*u);ctx.lineTo(x+8*u-l*u,y);ctx.stroke();
  ctx.fillStyle=C.deep;ctx.fillRect(x+11*u,y-14*u,15*u,9*u);ctx.fillStyle=C.ochre;ctx.fillRect(x+11*u,y-14.5*u,15*u,1.2*u);
  ctx.fillStyle=C.ink;ctx.fillRect(x+10*u,y-18*u,17*u,1.2*u);ctx.fillRect(x+11*u,y-18*u,0.8*u,4*u);ctx.fillRect(x+25.2*u,y-18*u,0.8*u,4*u);
  ctx.strokeStyle=C.red;ctx.lineWidth=0.9*u;for(const wx of [x+14*u,x+23*u]){ctx.beginPath();ctx.arc(wx,y-3*u,3*u,0,7);ctx.stroke();ctx.beginPath();ctx.moveTo(wx-3*u,y-3*u);ctx.lineTo(wx+3*u,y-3*u);ctx.stroke()}}
 if(o.k==="pigeon"){const f=Math.sin(o.flap)*1.8*u;ctx.fillStyle="#8b8f99";ctx.beginPath();ctx.ellipse(x+o.w/2,y-o.h/2,o.w/2,o.h/2,0,0,7);ctx.fill();
  ctx.beginPath();ctx.moveTo(x+2*u,y-o.h/2);ctx.lineTo(x+3.5*u,y-o.h/2-2.5*u-f);ctx.lineTo(x+5*u,y-o.h/2);ctx.fill();ctx.fillStyle="#e2a13c";ctx.fillRect(x-0.8*u,y-o.h/2-0.3*u,1*u,0.6*u)}
 if(o.k==="bull"){
  if(o.warn>0){if(Math.floor(o.warn*8)%2){ctx.fillStyle=C.red;ctx.font=`700 ${10*u}px Jost, sans-serif`;ctx.textAlign="right";ctx.fillText("¡TORO!",W-3*u,GROUND()-24*u)}return}
  const l=Math.sin(dist/(2*u))*1.5*u;ctx.fillStyle="#1d1412";ctx.fillRect(x+3*u,y-10*u,12*u,6.5*u);ctx.beginPath();ctx.ellipse(x+3*u,y-8*u,3.5*u,3*u,0,0,7);ctx.fill();
  ctx.strokeStyle="#1d1412";ctx.lineWidth=1.5*u;ctx.beginPath();for(const lx of [x+4*u,x+7*u,x+11*u,x+14*u]){ctx.moveTo(lx,y-4*u);ctx.lineTo(lx+(lx%2?l:-l),y)}ctx.stroke();
  ctx.strokeStyle="#f4ecd8";ctx.lineWidth=1*u;ctx.beginPath();ctx.moveTo(x+1.5*u,y-10*u);ctx.quadraticCurveTo(x-1*u,y-13*u,x+0.5*u,y-14.5*u);ctx.moveTo(x+4.5*u,y-10*u);ctx.quadraticCurveTo(x+6*u,y-13*u,x+5*u,y-14.5*u);ctx.stroke();
  ctx.fillStyle=C.red;ctx.fillRect(x+15*u,y-10*u,1.4*u,5*u)}
}
function drawItem(it){
 const u=H/100,x=it.x,y=it.y+Math.sin(it.bob)*u;
 if(it.k==="cava"){ctx.fillStyle="rgba(255,255,255,.85)";ctx.beginPath();ctx.moveTo(x-1.8*u,y-7*u);ctx.lineTo(x+1.8*u,y-7*u);ctx.lineTo(x+1.2*u,y-3*u);ctx.lineTo(x-1.2*u,y-3*u);ctx.fill();
  ctx.fillStyle=C.ochre;ctx.fillRect(x-1.4*u,y-5.8*u,2.8*u,2.6*u);ctx.fillStyle="rgba(255,255,255,.85)";ctx.fillRect(x-0.3*u,y-3*u,0.6*u,2.6*u);ctx.fillRect(x-1.5*u,y-0.6*u,3*u,0.6*u)}
 else if(it.k==="fan"){const s=Math.sin(it.bob*1.5)*0.15;ctx.save();ctx.translate(x,y-3*u);ctx.rotate(s);
  ctx.fillStyle="rgba(243,210,122,.35)";ctx.beginPath();ctx.arc(0,-1*u,6.5*u,0,7);ctx.fill();
  ctx.fillStyle="#e2a13c";ctx.beginPath();ctx.moveTo(0,2*u);ctx.arc(0,2*u,6*u,Math.PI*1.15,Math.PI*1.85);ctx.closePath();ctx.fill();
  ctx.strokeStyle="#9b2a22";ctx.lineWidth=0.5*u;ctx.beginPath();for(let i=0;i<6;i++){const a=Math.PI*(1.15+i*0.14);ctx.moveTo(0,2*u);ctx.lineTo(Math.cos(a)*6*u,2*u+Math.sin(a)*6*u)}ctx.stroke();ctx.restore()}
 else{ctx.strokeStyle="#f3d27a";ctx.lineWidth=1.1*u;ctx.beginPath();ctx.arc(x,y-3*u,2.4*u,0,7);ctx.stroke();ctx.fillStyle="#fff";ctx.beginPath();ctx.moveTo(x,y-7.2*u);ctx.lineTo(x+1.2*u,y-5.8*u);ctx.lineTo(x,y-5*u);ctx.lineTo(x-1.2*u,y-5.8*u);ctx.fill()}
}
function drawFlag(){
 if(!targets||!targets.length)return;const u=H/100,tg=targets[0],rem=tg.best-score(),x=P.x+rem*4*u;
 if(x>W+5*u||x<P.x)return;const g=GROUND();
 ctx.fillStyle=C.ink;ctx.fillRect(x,g-26*u,0.7*u,26*u);ctx.fillStyle=tg.me?C.ochre:"#c2185b";
 ctx.beginPath();ctx.moveTo(x+0.7*u,g-26*u);ctx.lineTo(x+9*u,g-23.5*u);ctx.lineTo(x+0.7*u,g-21*u);ctx.fill();
 ctx.fillStyle=C.deep;ctx.font=`600 ${2.8*u}px Jost, sans-serif`;ctx.textAlign="center";
 if(tg.img&&tg.img.complete&&tg.img.width){const r=4.5*u;ctx.save();ctx.beginPath();ctx.arc(x,g-32*u,r,0,7);ctx.clip();ctx.drawImage(tg.img,x-r,g-32*u-r,2*r,2*r);ctx.restore();ctx.fillText(String(tg.name).slice(0,12),x,g-38*u)}
 else ctx.fillText(String(tg.name).slice(0,12),x,g-27.5*u);
}
function drawHUD(){
 const u=H/100;ctx.fillStyle=C.deep;ctx.textAlign="left";ctx.font=`400 ${7*u}px "Bodoni Moda", Georgia, serif`;ctx.fillText(fmt(score()),4*u,10*u);
 ctx.font=`500 ${3.2*u}px Jost, sans-serif`;ctx.fillStyle=C.red;ctx.fillText(`🥂 ${cava}`,4*u,15*u);
 if(combo>0){const k=1+Math.max(0,comboPop)*0.8,x=16*u;ctx.save();ctx.translate(x,14*u);ctx.scale(k,k);
  if(mult>1){ctx.fillStyle=C.red;ctx.font=`700 ${4.2*u}px Jost, sans-serif`;ctx.fillText(`×${mult}`,0,0)}else if(combo>=2){ctx.fillStyle="rgba(90,23,18,.6)";ctx.font=`600 ${2.6*u}px Jost, sans-serif`;ctx.fillText(`combo ${combo}`,0,0)}ctx.restore();
  const nxt=combo<5?5:combo<10?10:combo<20?20:0;if(nxt){const prev=nxt===5?0:nxt===10?5:10;ctx.fillStyle="rgba(90,23,18,.15)";ctx.fillRect(4*u,17*u,22*u,0.9*u);ctx.fillStyle=C.ochre;ctx.fillRect(4*u,17*u,22*u*(combo-prev)/(nxt-prev),0.9*u)}}
 if(inv>0){ctx.fillStyle="rgba(90,23,18,.15)";ctx.fillRect(4*u,19.5*u,22*u,0.9*u);ctx.fillStyle="#f3d27a";ctx.fillRect(4*u,19.5*u,22*u*inv/5,0.9*u)}
 ctx.textAlign="right";ctx.fillStyle=C.red;ctx.font=`500 ${3.2*u}px Jost, sans-serif`;ctx.fillText(`TEAM ${TEAM_NAME[team].toUpperCase()}`,W-4*u,8*u);
 if(targets&&targets.length){const tg=targets[0];ctx.fillStyle=C.deep;ctx.font=`500 ${3*u}px Jost, sans-serif`;ctx.fillText(`${t2("next")} : ${String(tg.name).slice(0,14)} · ${fmt(tg.best)}`,W-4*u,13*u)}
 if(zoneT>0){const a=Math.min(1,zoneT,2.4-zoneT+0.2);ctx.save();ctx.globalAlpha=Math.max(0,a);ctx.textAlign="center";ctx.fillStyle=C.deep;
  ctx.font=`italic 400 ${6.5*u}px "Bodoni Moda", Georgia, serif`;ctx.fillText(t2("zone")(zone,ZONES[zone].n),W/2,H*0.2);ctx.restore()}
 for(const t of texts){ctx.save();ctx.globalAlpha=Math.min(1,t.t*2);ctx.textAlign="center";ctx.fillStyle=t.c;
  if(t.big){const k=1+Math.max(0,t.t-1)*1.2;ctx.translate(t.x,t.y);ctx.scale(k,k);ctx.font=`italic 700 ${6*u}px "Bodoni Moda", Georgia, serif`;ctx.fillText(t.s,0,0)}
  else{ctx.font=`700 ${3.6*u}px Jost, sans-serif`;ctx.fillText(t.s,t.x,t.y)}ctx.restore()}
 if(slow<1||hintT>0){
  const a=slow<1?1:Math.min(1,hintT),k=1+Math.sin(pulse*9)*0.06;
  ctx.save();ctx.globalAlpha=a;ctx.textAlign="center";ctx.fillStyle=slow<1?C.red:C.deep;
  ctx.translate(W/2,H*0.36);ctx.scale(k,k);
  ctx.font=`italic 400 ${slow<1?11*u:7*u}px "Bodoni Moda", Georgia, serif`;ctx.fillText(slow<1?tr("runTapNow"):tr("runTapHint"),0,0);
  ctx.restore();
  // flèche au-dessus du coureur
  ctx.save();ctx.globalAlpha=a;ctx.fillStyle=C.ochre;const ax=P.x,ay=P.y-P.h-P.head-6*u-Math.abs(Math.sin(pulse*6))*3*u;
  ctx.beginPath();ctx.moveTo(ax,ay-6*u);ctx.lineTo(ax+4*u,ay);ctx.lineTo(ax+1.4*u,ay);ctx.lineTo(ax+1.4*u,ay+4*u);ctx.lineTo(ax-1.4*u,ay+4*u);ctx.lineTo(ax-1.4*u,ay);ctx.lineTo(ax-4*u,ay);ctx.closePath();ctx.fill();ctx.restore();
 }
}
function draw(){
 ctx.save();if(shake>0)ctx.translate(rnd(-4,4),rnd(-4,4));
 drawBG();if(state==="play")drawFlag();items.forEach(drawItem);obs.forEach(drawObs);drawPlayer();
 for(const f of fx){ctx.globalAlpha=Math.max(0,f.t*2);ctx.fillStyle=f.c;ctx.fillRect(f.x,f.y,3,3)}ctx.globalAlpha=1;
 if(state==="play")drawHUD();ctx.restore();
 if(flash>0){ctx.fillStyle=`rgba(243,210,122,${Math.min(.5,flash)})`;ctx.fillRect(0,0,W,H)}
}
function loop(t){
 const dt=Math.min(0.033,(t-last)/1000||0);last=t;
 if(state==="play"){
  slow=1;pulse+=dt;hintT-=dt;
  if(tuto&&!P.air&&!dying){const o=obs.find(o=>o.k!=="pigeon"&&o.x+o.w>P.x&&(o.k!=="bull"||o.warn<=0));
   if(o){const d=o.x-(P.x+P.w*0.5);if(d<speed*0.5&&d>-o.w*0.5)slow=0.16}}
  update(dt*slow)}else if(shake>0)shake-=dt;draw();
 if(state==="play"||shake>0)raf=requestAnimationFrame(loop);else raf=null;
}

/* ---------- partie ---------- */
function start(){
 if(!size())return;reset();state="play";gui("");last=performance.now();
 if(!raf)raf=requestAnimationFrame(loop);
}
function end(){
 state="over";shake=0.2;dying=0;P.rot=0;const sc=score(),isBest=sc>best;
 if(isBest){best=sc;store.set("best",best)}
 if(isBest&&sc>0)pushScore(sc);
 showOver(sc,isBest);if(isBest&&sc>50)confetti();
}
function pause(){if(state==="play"&&!dying){state="over";cause="pause";showOver(score(),false)}}
G.pause=pause;G.dbg=()=>({obs,P,state,dying,combo,mult,zone,inv,speed,targets,tAlive,score:P?score():0});

/* ---------- soirée : jeux à venir ---------- */
function renderTonight(){
 const n=now();
 $("#tonight").innerHTML=`<div class="topline">${tr("runTonight")}</div>`+CONFIG.EVENING_GAMES.map(g=>{
  const test=window.Live&&Live.test(),open=n>=Date.parse(g.at)||test;
  const btn=g.url?`<a class="btn btn-gold btn-sm" href="${g.url}" target="_blank" rel="noopener">${tr("runPlay")}</a>`:g.id&&window.Soiree?`<button type="button" class="btn btn-gold btn-sm" data-evening="${g.id}">${tr("runPlay")}</button>`:`<span class="gsmall">${tr("runSoon")}</span>`;
  return `<div class="night${open?" open":""}"${g.img?` style="--img:url(${window.ART?ART(g.img):g.img})"`:""}><div><div class="eyebrow${open?"":" lk"}">${test?Live.t("test"):open?tr("runOpen"):"🔒 "+tr("opensOn")(gameWhen(g.at))}</div><h3>${esc(pick(g.title))}</h3><p class="muted">${esc(pick(g.text))}</p></div>
   ${open?btn:""}</div>`}).join("");
}

/* ---------- branchements ---------- */
G.init=function(){
 cv=$("#gc");ctx=cv.getContext("2d");
 $("#gui").addEventListener("click",e=>{
  const t=e.target.closest("button");if(!t)return;
  if(t.dataset.team){team=t.dataset.team;store.set("team",team);if(window.Profile&&Profile.id)Profile.update({team});drawStatic();
   if(window.Profile&&!Profile.id){Profile.need(t2("profWhy")).then(ok=>{if(ok){nick=Profile.name;Profile.update({team});showReady()}else if(!nick)showNick();else showReady()});return}
   if(!nick)showNick();else showReady();return}
  if(t.id==="nickOk"){const v=$("#nickIn").value.trim();if(!v){$("#nickIn").focus();return}nick=v.slice(0,20);store.set("nick",nick);showReady();return}
  if(t.id==="faceBtn"){$("#faceIn").click();return}
  if(t.id==="goBtn"){if(runLocked())return showLocked();start();return}
 });
 $("#gui").addEventListener("change",e=>{if(e.target.id==="faceIn"&&e.target.files[0])setFace(e.target.files[0])});
 $("#gui").addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target.id==="nickIn")$("#nickOk").click()});
 const down=e=>{if(state!=="play")return;e.preventDefault();jump()};
 cv.addEventListener("pointerdown",down);cv.addEventListener("pointerup",release);cv.addEventListener("pointercancel",release);
 addEventListener("keydown",e=>{if((e.code==="Space"||e.code==="ArrowUp")&&state==="play"){e.preventDefault();if(!e.repeat)jump()}});
 addEventListener("keyup",e=>{if(e.code==="Space"||e.code==="ArrowUp")release()});
 document.addEventListener("visibilitychange",()=>{if(document.hidden)pause()});
 addEventListener("resize",()=>{if(state!=="play")drawStatic()});
 loadBoard();setInterval(()=>{if(!document.hidden&&state!=="play")loadBoard()},60000);
};
function drawStatic(){if(!team){const t=team;team="valentin";if(size()){reset();draw()}team=t;return}if(size()){if(state!=="over"){reset()}draw()}}
G.show=function(){ loadBoard(); if(state!=="play"){drawStatic();if(state==="idle")idleScreen()} renderBoard();renderTonight() };
G.refresh=function(){renderBoard();renderTonight();if(state==="idle")idleScreen()};
window.Carrera=G;
})();
Carrera.init();
if(document.querySelector('#jeux.on')&&document.querySelector('.sub.on[data-subp="course"]'))Carrera.show();
