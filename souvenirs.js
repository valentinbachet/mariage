/* =====================================================================
   SOUVENIRS · mode Jour J, livre d'or vocal, capsule 2028, récap du week-end,
   espace privé des mariés, appli installable
   Dépend de : CONFIG, EVENTS, lang, store, toast, now, whenLabel, esc, $, pick, hm, shuttleTime, songs, Live, go
   ===================================================================== */
(function(){
const S={
 fr:{signed:n=>`Signé : ${n}`,profWhy:"Votre message sera signé de votre prénom : connectez-vous ou créez votre profil (e-mail + code à 4 chiffres).",admProf:"Profils des invités",admNoPin:"pas encore de code",admReset:"Réinitialiser le code",admResetOk:"Code effacé : l'invité en choisira un nouveau à sa prochaine connexion.",jjK:"Le fil de la journée",jjNow:"En ce moment",jjNext:"Prochaine étape",jjIn:d=>`dans ${d}`,jjDone:"terminé",
  busGo:"Navette aller",busBack:"Navette retour",scratch:"La carte à gratter s'ouvre",reveal:"Révélation de la carte gagnante",
  souvK:"Pour les mariés",voiceT:"Le livre d'or vocal",voiceD:"Laissez-nous un message de 30 secondes : on les écoutera tous après le mariage.",
  rec:"Enregistrer",stop:"Stop",again:"Recommencer",sendV:"Envoyer mon message",sentV:"Merci ! Votre message est bien arrivé 💛",micNo:"Micro indisponible : autorisez-le dans les réglages du navigateur",
  capT:"La capsule « dans un an »",capD:"Écrivez-nous un mot ou une prédiction (« Dans un an, vous aurez… »). C'est scellé : on l'ouvrira le 7 mai 2028.",
  capPh:"Dans un an, vous…",seal:"Sceller mon message 🔒",sealed:"Scellé jusqu'au 7 mai 2028 ✉️",capN:n=>`${n} message${n>1?"s":""} déjà scellé${n>1?"s":""}`,
  nameQ:"Votre prénom",nameNeed:"Ajoutez votre prénom",lockT:t=>`S'ouvre le ${t}`,lockD:"Pendant le week-end du mariage.",
  recK:"Le week-end en chiffres",recT:"Merci pour ces trois jours",photos:"photos partagées",voices:"messages vocaux",runs:"points à la Carrera",
  winTeam:t=>`Team ${t} remporte la Carrera`,champ:n=>`${n} remporte le tournoi des duels`,scratchW:n=>`${n} a gratté la carte gagnante`,
  topSong:"La chanson la plus votée",bestRun:n=>`${n} signe le meilleur score de la Carrera`,capsule:n=>n>1?`${n} messages dorment dans la capsule jusqu'au 7 mai 2028`:"Un message dort dans la capsule jusqu'au 7 mai 2028",
  word:"Un mot de nous deux",allPhotos:"Voir tout l'album",
  install:"📲 Gardez le site sur votre écran d'accueil : il marche même sans réseau à l'hacienda.",installBtn:"Installer",iosSafari:"Ouvrez ce site dans Safari, puis Partager ⎋ › « Sur l'écran d'accueil ».",iosHow:"En bas de Safari, touchez Partager ⎋ (le carré avec la flèche), puis « Sur l'écran d'accueil ».",later:"Plus tard",
  admK:"Espace des mariés",admVoices:"Livre d'or vocal",admCap:"La capsule",admCapLocked:(n,t)=>`🔒 ${n} message${n>1?"s":""} scellé${n>1?"s":""}. Ouverture le ${t}.`,listen:"▶ Écouter",admNone:"Rien pour l'instant.",admPhotos:n=>`${n} photos sur le mur`},
 es:{signed:n=>`Firmado: ${n}`,profWhy:"Tu mensaje irá firmado con tu nombre: conéctate o crea tu perfil (e-mail + código de 4 cifras).",admProf:"Perfiles de los invitados",admNoPin:"sin código aún",admReset:"Restablecer el código",admResetOk:"Código borrado: el invitado elegirá uno nuevo al conectarse.",jjK:"El hilo del día",jjNow:"Ahora mismo",jjNext:"Siguiente",jjIn:d=>`dentro de ${d}`,jjDone:"terminado",
  busGo:"Autobús de ida",busBack:"Autobús de vuelta",scratch:"Se abre el rasca y gana",reveal:"Revelación de la carta ganadora",
  souvK:"Para los novios",voiceT:"El libro de firmas de voz",voiceD:"Dejadnos un mensaje de 30 segundos: los escucharemos todos después de la boda.",
  rec:"Grabar",stop:"Parar",again:"Repetir",sendV:"Enviar mi mensaje",sentV:"¡Gracias! Tu mensaje ha llegado 💛",micNo:"Micrófono no disponible: actívalo en los ajustes del navegador",
  capT:"La cápsula «dentro de un año»",capD:"Escribidnos unas palabras o una predicción («Dentro de un año tendréis…»). Queda sellada: la abriremos el 7 de mayo de 2028.",
  capPh:"Dentro de un año, vosotros…",seal:"Sellar mi mensaje 🔒",sealed:"Sellado hasta el 7 de mayo de 2028 ✉️",capN:n=>`${n} mensaje${n>1?"s":""} ya sellado${n>1?"s":""}`,
  nameQ:"Tu nombre",nameNeed:"Añade tu nombre",lockT:t=>`Se abre el ${t}`,lockD:"Durante el fin de semana de la boda.",
  recK:"El fin de semana en cifras",recT:"Gracias por estos tres días",photos:"fotos compartidas",voices:"mensajes de voz",runs:"puntos en la Carrera",
  winTeam:t=>`El Team ${t} gana la Carrera`,champ:n=>`${n} gana el torneo de duelos`,scratchW:n=>`${n} rascó la carta ganadora`,
  topSong:"La canción más votada",bestRun:n=>`${n} firma la mejor marca de la Carrera`,capsule:n=>n>1?`${n} mensajes duermen en la cápsula hasta el 7 de mayo de 2028`:"Un mensaje duerme en la cápsula hasta el 7 de mayo de 2028",
  word:"Unas palabras de los dos",allPhotos:"Ver todo el álbum",
  install:"📲 Guarda la web en tu pantalla de inicio: funciona incluso sin cobertura en la hacienda.",installBtn:"Instalar",iosSafari:"Abre esta web en Safari y luego Compartir ⎋ › «Añadir a pantalla de inicio».",iosHow:"Abajo en Safari, toca Compartir ⎋ (el cuadrado con la flecha) y luego «Añadir a pantalla de inicio».",later:"Más tarde",
  admK:"Espacio de los novios",admVoices:"Libro de firmas de voz",admCap:"La cápsula",admCapLocked:(n,t)=>`🔒 ${n} mensaje${n>1?"s":""} sellado${n>1?"s":""}. Se abre el ${t}.`,listen:"▶ Escuchar",admNone:"Nada por ahora.",admPhotos:n=>`${n} fotos en el muro`},
 en:{signed:n=>`Signed: ${n}`,profWhy:"Your message will be signed with your name: sign in or create your profile (email + 4-digit code).",admProf:"Guest profiles",admNoPin:"no code yet",admReset:"Reset code",admResetOk:"Code cleared: the guest will choose a new one next time they sign in.",jjK:"Today, step by step",jjNow:"Right now",jjNext:"Next up",jjIn:d=>`in ${d}`,jjDone:"done",
  busGo:"Shuttle there",busBack:"Shuttle back",scratch:"The scratch card opens",reveal:"Winning card revealed",
  souvK:"For the newlyweds",voiceT:"The voice guestbook",voiceD:"Leave us a 30-second message: we'll listen to them all after the wedding.",
  rec:"Record",stop:"Stop",again:"Start over",sendV:"Send my message",sentV:"Thank you! Your message arrived 💛",micNo:"Microphone unavailable: allow it in your browser settings",
  capT:"The one-year time capsule",capD:"Write us a note or a prediction (\"In a year, you'll have…\"). It's sealed: we'll open it on 7 May 2028.",
  capPh:"In a year, you'll…",seal:"Seal my message 🔒",sealed:"Sealed until 7 May 2028 ✉️",capN:n=>`${n} message${n>1?"s":""} already sealed`,
  nameQ:"Your first name",nameNeed:"Add your first name",lockT:t=>`Opens on ${t}`,lockD:"During the wedding weekend.",
  recK:"The weekend in numbers",recT:"Thank you for these three days",photos:"photos shared",voices:"voice messages",runs:"points in the Race",
  winTeam:t=>`Team ${t} wins the Race`,champ:n=>`${n} wins the duel tournament`,scratchW:n=>`${n} scratched the winning card`,
  topSong:"Most-voted song",bestRun:n=>`${n} set the best score in the Race`,capsule:n=>n>1?`${n} messages are asleep in the capsule until 7 May 2028`:"One message is asleep in the capsule until 7 May 2028",
  word:"A word from us",allPhotos:"See the whole album",
  install:"📲 Keep the site on your home screen: it works even with no signal at the hacienda.",installBtn:"Install",iosSafari:"Open this site in Safari, then Share ⎋ › \"Add to Home Screen\".",iosHow:"At the bottom of Safari, tap Share ⎋ (the square with the arrow), then \"Add to Home Screen\".",later:"Later",
  admK:"Newlyweds' corner",admVoices:"Voice guestbook",admCap:"The capsule",admCapLocked:(n,t)=>`🔒 ${n} sealed message${n>1?"s":""}. Opens on ${t}.`,listen:"▶ Listen",admNone:"Nothing yet.",admPhotos:n=>`${n} photos on the wall`}};
const s=k=>(S[lang]||S.fr)[k]??S.fr[k];
const T=k=>Date.parse(CONFIG[k]);
const SOUV_AT=()=>Date.parse(CONFIG.SOUVENIRS_AT||CONFIG.PHOTOS_AT||"2027-05-06T18:00:00+02:00");
const CAP_OPEN=()=>Date.parse(CONFIG.CAPSULE_OPEN||"2028-05-07T10:00:00+02:00");
const RECAP_AT=()=>Date.parse(CONFIG.RECAP_AT||"2027-05-09T10:00:00+02:00");
const isTest=()=>!!(window.Live&&Live.test());
function who(){const r=typeof R!=="undefined"?R:null;return (window.Profile&&Profile.name)||store.get("nick","")||store.get("photoName","")||(r&&r.people&&r.people[0]&&r.people[0].name)||(r&&r.household)||""}
function nameField(id){return window.Profile&&Profile.id?`<small class="murwho">${esc(s("signed")(Profile.name||"?"))}</small>`:""}
async function takeName(){if(window.Profile&&!Profile.id&&!(await Profile.need(s("profWhy"))))return"";return who()}
async function withDb(fn){if(!window.Live)return null;try{await Live.hold();return await fn(Live.db)}catch(e){console.warn(e);return null}finally{Live.release()}}
const card=(img,k,t,d,inner,locked)=>`<div class="gban souv${locked?" lockd":""}" style="--img:url(${window.ART?ART(img):img})"><div><span class="eyebrow">${k}</span><b>${t}</b><p>${d}</p>${inner||""}</div></div>`;

/* ================= 1. MODE JOUR J ================= */
function dayItems(){
 const it=[],add=(t,ico,label,sub)=>{if(t&&!isNaN(t))it.push({t,ico,label,sub})};
 for(const e of EVENTS){
  const steps=(e.steps||[]).filter(x=>x[0]);
  if(!steps.length)add(Date.parse(e.start),"✨",pick(e.title),e.place);
  for(const [h,l] of steps){const [H,M]=h.split(":").map(Number);
   let t=Date.parse(e.start.slice(0,11)+String(H).padStart(2,"0")+":"+String(M).padStart(2,"0")+":00+02:00");if(t<Date.parse(e.start)-6*36e5)t+=864e5;
   add(t,"✨",pick(l),steps.indexOf(steps.find(x=>x[0]===h))===0?e.place:"")}
 }
 const hotel=(typeof HOTELS!=="undefined"&&HOTELS[0]&&HOTELS[0].name)||"";
 (CONFIG.SHUTTLE_GO||[]).forEach(h=>add(shuttleTime(h),"🚌",s("busGo"),hotel));
 (CONFIG.SHUTTLE_BACK||[]).forEach(h=>add(shuttleTime(h),"🚌",s("busBack"),""));
 if(CONFIG.GAME_TIMES)(CONFIG.EVENING_GAMES||[]).forEach(g=>add(Date.parse(g.at),"🎮",pick(g.title),""));
 if(CONFIG.SCRATCH_AT&&CONFIG.GAME_TIMES)add(T("SCRATCH_AT"),"🎟️",s("scratch"),"");
 if(CONFIG.SCRATCH_REVEAL&&CONFIG.GAME_TIMES)add(T("SCRATCH_REVEAL"),"🏆",s("reveal"),"");
 return it.sort((a,b)=>a.t-b.t);
}
function renderJourJ(){
 let box=document.getElementById("jourj");
 if(!box){const live=document.querySelector(".live .wrap");if(!live)return;box=document.createElement("div");box.id="jourj";live.appendChild(box)}
 const n=now(),d0=new Date(n),day=new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Madrid"}).format(d0);
 // la « journée » va de 6 h à 6 h le lendemain (heure de Séville)
 let start=Date.parse(day+"T06:00:00+02:00");if(n<start)start-=864e5;const end=start+864e5;
 const items=dayItems().filter(x=>x.t>=start&&x.t<end);
 if(!items.length||n>items[items.length-1].t+3*36e5){box.innerHTML="";return}
 const nxt=items.find(x=>x.t>n),cur=[...items].reverse().find(x=>x.t<=n);
 box.innerHTML=`<div class="jj"><div class="jj-k">${s("jjK")}</div>
  ${nxt?`<div class="jj-next"><small>${s("jjNext")} · ${s("jjIn")(dur(nxt.t-n))}</small><b>${nxt.ico} ${esc(nxt.label)}</b><span class="tabnum">${hm(nxt.t)}${nxt.sub?" · "+esc(nxt.sub):""}</span></div>`:""}
  <ol class="jj-list">${items.map(x=>`<li class="${x===cur?"cur":x.t<n?"past":""}"><span class="tabnum">${hm(x.t)}</span><i>${x.ico}</i><b>${esc(x.label)}</b>${x===cur?`<em>${s("jjNow")}</em>`:""}</li>`).join("")}</ol></div>`;
}

/* ================= 2. LIVRE D'OR VOCAL + CAPSULE ================= */
const V={rec:null,chunks:[],blob:null,url:"",t0:0,timer:null,sent:store.get("voiceSent",false),capSent:store.get("capSent",false),capN:0};
function renderSouv(){
 let box=document.getElementById("souvBox");
 if(!box){const mur=document.getElementById("mur");if(!mur)return;const sec=document.createElement("section");sec.id="souvenirs";sec.innerHTML=`<div class="wrap" id="souvBox"></div>`;mur.after(sec);box=document.getElementById("souvBox")}
 const open=now()>=SOUV_AT()||isTest(),capClosed=now()>=CAP_OPEN();
 if(capClosed){box.innerHTML="";return}
 if(!open){box.innerHTML=card("img/jeu-capsule.svg",s("souvK"),`🔒 ${s("capT")}`,s("lockT")(whenLabel(new Date(SOUV_AT()).toISOString()))+". "+s("lockD"),"",true);return}
 let vin;
 if(V.sent)vin=`<p class="ok">${s("sentV")}</p><button type="button" class="btn btn-ghost btn-sm" data-v="again">${s("again")}</button>`;
 else if(V.rec)vin=`<div class="vrec"><span class="vdot"></span><b class="tabnum" id="vT">0:00</b> / 0:30<button type="button" class="btn btn-gold btn-sm" data-v="stop">■ ${s("stop")}</button></div>`;
 else if(V.blob)vin=`<audio controls src="${V.url}"></audio>${nameField("vName")}<div class="row"><button type="button" class="btn btn-gold btn-sm" data-v="send">${s("sendV")}</button><button type="button" class="btn btn-ghost btn-sm" data-v="again">${s("again")}</button></div>`;
 else vin=`<button type="button" class="btn btn-gold btn-sm" data-v="rec">🎙️ ${s("rec")}</button>`;
 const cin=capClosed?"":V.capSent?`<p class="ok">${s("sealed")}</p>`:`<textarea id="capTxt" maxlength="500" rows="3" placeholder="${s("capPh")}"></textarea>${nameField("cName")}<button type="button" class="btn btn-gold btn-sm" data-v="seal">${s("seal")}</button>`;
 /* capsule dans Jeux › Capsule ; livre d'or vocal retiré (le code d'enregistrement reste, non affiché) */
 box.innerHTML=(card("img/jeu-capsule.svg",s("souvK"),s("capT"),s("capD"),cin+(V.capN?`<small class="capn">${s("capN")(V.capN)}</small>`:"")));
}
async function startRec(){
 try{const st=await navigator.mediaDevices.getUserMedia({audio:true});
  const mt=["audio/webm;codecs=opus","audio/mp4","audio/webm","audio/ogg"].find(t=>window.MediaRecorder&&MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported(t))||"";
  const r=new MediaRecorder(st,mt?{mimeType:mt,audioBitsPerSecond:32000}:{audioBitsPerSecond:32000});V.chunks=[];
  r.ondataavailable=e=>{if(e.data.size)V.chunks.push(e.data)};
  r.onstop=()=>{st.getTracks().forEach(t=>t.stop());clearInterval(V.timer);V.blob=new Blob(V.chunks,{type:r.mimeType||mt||"audio/webm"});V.dur=Math.round((Date.now()-V.t0)/1000);
   if(V.url)URL.revokeObjectURL(V.url);V.url=URL.createObjectURL(V.blob);V.rec=null;renderSouv()};
  V.rec=r;V.t0=Date.now();r.start();renderSouv();
  V.timer=setInterval(()=>{const e=(Date.now()-V.t0)/1000,el=document.getElementById("vT");if(el)el.textContent=`0:${String(Math.floor(e)).padStart(2,"0")}`;if(e>=30&&V.rec)V.rec.stop()},250);
 }catch(e){toast(s("micNo"))}
}
async function sendVoice(){
 const n=await takeName();if(!n||!V.blob)return;
 const data=await new Promise(ok=>{const f=new FileReader();f.onload=()=>ok(f.result);f.readAsDataURL(V.blob)});
 const r=await withDb(async db=>{const k=db.key();await db.set("voicesData/"+k,data);await db.set("voices/"+k,{t:db.now(),n:n.slice(0,30),d:V.dur||0,type:V.blob.type});return k});
 if(r){V.sent=true;store.set("voiceSent",true);V.blob=null;renderSouv()}else toast("✗");
}
async function seal(){
 const m=(document.getElementById("capTxt")||{}).value||"";if(!m.trim()){document.getElementById("capTxt").focus();return}
 const n=await takeName();if(!n)return;
 const r=await withDb(async db=>{await db.set("capsule/"+db.key(),{t:db.now(),n:n.slice(0,30),m:m.trim().slice(0,500)});return 1});
 if(r){V.capSent=true;store.set("capSent",true);V.capN++;renderSouv();toast("✉️")}else toast("✗");
}
async function loadCapN(){if(!(now()>=SOUV_AT()||isTest()))return;const v=await withDb(db=>db.get("capsule"));V.capN=v?Object.keys(v).length:0;renderSouv()}
document.addEventListener("click",e=>{const b=e.target.closest("[data-v]");if(!b)return;const a=b.dataset.v;
 if(a==="rec")startRec();else if(a==="stop"&&V.rec)V.rec.stop();else if(a==="again"){V.sent=false;store.set("voiceSent",false);V.blob=null;renderSouv()}
 else if(a==="send")sendVoice();else if(a==="seal")seal()});

/* ================= 3. RÉCAP DU WEEK-END ================= */
let RC=null;
async function loadRecap(){
 if(now()<RECAP_AT())return;
 RC=await withDb(async db=>{const [p,v,c,cp,tr,sc]=await Promise.all(["photos","voices","carrera/p","capsule","tour/state","scratch"].map(x=>db.get(x).catch(()=>null)));return{p:p||{},v:v||{},c:c||{},cp:cp||{},tr,sc}})||{p:{},v:{},c:{},cp:{}};
 renderRecap();
}
function renderRecap(){
 let box=document.getElementById("recap");
 if(now()<RECAP_AT()){if(box)box.remove();return}
 if(!box){const live=document.querySelector("#accueil .live");if(!live)return;box=document.createElement("section");box.id="recap";live.before(box)}
 if(!RC){box.innerHTML="";return}
 const ph=Object.values(RC.p).filter(x=>x&&!x.hide&&x.th),nv=Object.keys(RC.v).length,nc=Object.keys(RC.cp).length;
 const tm={agathe:0,valentin:0};let best=null,tot=0;
 for(const k in RC.c){const x=RC.c[k];if(!x||!tm.hasOwnProperty(x.team))continue;const pts=(x.best||0)+(x.bonus||0);tm[x.team]+=pts;tot+=pts;if(!x.screen&&(!best||x.best>best.best))best=x}
 const win=tm.agathe===tm.valentin?null:tm.agathe>tm.valentin?"Agathe":"Valentin";
 const sw=RC.sc&&window.Live&&Live.scratchResult?(Live.scratchResult(RC.sc)||{}).winner:null;
 const sl=typeof songs!=="undefined"?songs.filter(x=>!x.ex):[],top=sl.length?[...sl].sort((a,b)=>b.votes-a.votes)[0]:null;
 const pick6=[...ph].sort((a,b)=>((a.t*9301)%97)-((b.t*9301)%97)).slice(0,6);
 const word=CONFIG.RECAP_WORD?pick(CONFIG.RECAP_WORD):"";
 const facts=[win&&`🏁 ${s("winTeam")(win)}`,RC.tr&&RC.tr.champN&&`⚔️ ${s("champ")(esc(RC.tr.champN))}`,sw&&sw.n&&`🎟️ ${s("scratchW")(esc(sw.n))}`,best&&`🏃 ${s("bestRun")(esc(best.n||"?"))}`,
  top&&`🎶 ${s("topSong")} : <b>${esc(top.title)}</b>${top.artist?" · "+esc(top.artist):""}`,nc&&`✉️ ${s("capsule")(nc)}`].filter(Boolean);
 box.innerHTML=`<div class="wrap"><div class="recap"><span class="eyebrow">${s("recK")}</span><h2>${s("recT")}</h2>
  <div class="rnums"><div><b class="tabnum">${ph.length}</b><small>${s("photos")}</small></div>${nv?`<div><b class="tabnum">${nv}</b><small>${s("voices")}</small></div>`:""}<div><b class="tabnum">${Math.round(tot).toLocaleString(lang)}</b><small>${s("runs")}</small></div></div>
  ${facts.length?`<ul class="rfacts">${facts.map(f=>`<li>${f}</li>`).join("")}</ul>`:""}
  ${pick6.length?`<div class="rgrid">${pick6.map(p=>`<button type="button" data-ph="${Object.keys(RC.p).find(k=>RC.p[k]===p)||""}" style="background-image:url(${p.th})"></button>`).join("")}</div><a class="btn btn-ghost btn-sm" href="#mur">${s("allPhotos")}</a>`:""}
  ${word?`<div class="rword"><small>${s("word")}</small><p>${esc(word)}</p><span class="sig">Agathe &amp; Valentin</span></div>`:""}</div></div>`;
}

/* ================= 4. ESPACE PRIVÉ DES MARIÉS (#maries-<clé>) ================= */
async function renderAdmin(){
 let v=document.getElementById("maries");
 if(!v){v=document.createElement("section");v.className="view";v.id="maries";v.hidden=true;document.querySelector("main").appendChild(v)}
 v.hidden=false;v.innerHTML=`<div class="wrap"><div class="sec-head"><span class="eyebrow">${s("admK")}</span><h2>Agathe &amp; Valentin</h2></div><div id="admBody"><p class="muted">…</p></div></div>`;
 const d=await withDb(async db=>({v:await db.get("voices")||{},c:await db.get("capsule")||{},p:await db.get("photos")||{},u:await db.get("u")||{}}))||{v:{},c:{},p:{},u:{}};
 const vs=Object.entries(d.v).sort((a,b)=>a[1].t-b[1].t),cs=Object.values(d.c).sort((a,b)=>a.t-b.t),np=Object.values(d.p).filter(x=>x&&!x.hide).length;
 const capOpen=now()>=CAP_OPEN()||isTest();
 document.getElementById("admBody").innerHTML=`<p class="muted">${s("admPhotos")(np)}</p>
  <h3>🎙️ ${s("admVoices")} (${vs.length})</h3>${vs.length?`<ul class="admv">${vs.map(([k,x])=>`<li><b>${esc(x.n||"?")}</b><small>${new Date(x.t).toLocaleString(lang,{timeZone:"Europe/Madrid",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})} · ${x.d||"?"} s</small><button type="button" class="btn btn-ghost btn-sm" data-listen="${k}">${s("listen")}</button></li>`).join("")}</ul>`:`<p class="muted">${s("admNone")}</p>`}
  <h3>👤 ${s("admProf")} (${Object.keys(d.u).length})</h3>${Object.keys(d.u).length?`<ul class="admv">${Object.entries(d.u).sort((a,b)=>String(a[1].n||"").localeCompare(String(b[1].n||""))).map(([k,u])=>`<li><b>${esc(u.n||"?")}</b><small>${u.pin?"🔒":s("admNoPin")} · ${Object.keys(u.eggs||{}).length}/7 🤫${u.team?" · Team "+esc(u.team):""}</small>${u.pin?`<button type="button" class="btn btn-ghost btn-sm" data-reset="${k}">${s("admReset")}</button>`:""}</li>`).join("")}</ul>`:`<p class="muted">${s("admNone")}</p>`}
  <h3>✉️ ${s("admCap")} (${cs.length})</h3>${!cs.length?`<p class="muted">${s("admNone")}</p>`:capOpen?`<div class="admc">${cs.map(x=>`<blockquote><p>${esc(x.m)}</p><cite>${esc(x.n||"?")}</cite></blockquote>`).join("")}</div>`:`<p>${s("admCapLocked")(cs.length,whenLabel(new Date(CAP_OPEN()).toISOString()))}</p>`}`;
}
document.addEventListener("click",async e=>{const b=e.target.closest("[data-listen]");if(!b)return;const k=b.dataset.listen;
 const src=await withDb(db=>db.get("voicesData/"+k));if(!src)return;const a=document.createElement("audio");a.controls=true;a.src=src;b.replaceWith(a);a.play().catch(()=>{})});
document.addEventListener("click",async e=>{const b=e.target.closest("[data-reset]");if(!b)return;
 await withDb(db=>db.update("u/"+b.dataset.reset,{pin:null}));b.replaceWith(Object.assign(document.createElement("small"),{textContent:s("admResetOk")}))});
window.Souvenirs={admin:renderAdmin};

/* ================= 5. APPLI INSTALLABLE ================= */
let deferred=null;
const standalone=()=>matchMedia("(display-mode: standalone)").matches||navigator.standalone;
const UA=navigator.userAgent,ios=/iphone|ipad|ipod/i.test(UA),mobile=/android|iphone|ipad|ipod/i.test(UA);
/* l'installation ne marche que sur le vrai site (pas dans l'aperçu Claude, ni dans une page intégrée) ; sur iPhone, seulement depuis Safari */
const embedded=(()=>{try{return window.top!==window.self}catch(e){return true}})()||/claude\.ai|claudeusercontent|anthropic/.test(location.host);
const iosSafari=ios&&/Safari/.test(UA)&&!/CriOS|FxiOS|EdgiOS|GSA|Instagram|FBAN|FBAV|Line|WhatsApp/.test(UA);
function renderInstall(){
 const old=document.getElementById("installBar");if(old)old.remove();
 if(embedded||standalone()||!mobile||store.get("installLater",0)>Date.now())return;
 if(!deferred&&!ios)return;
 const b=document.createElement("div");b.id="installBar";b.className="installbar";
 b.innerHTML=`<p>${s("install")}${ios&&!deferred?`<br><small>${iosSafari?s("iosHow"):s("iosSafari")}</small>`:""}</p><div>${deferred?`<button type="button" class="btn btn-gold btn-sm" data-inst="go">${s("installBtn")}</button>`:""}<button type="button" class="btn btn-ghost btn-sm" data-inst="later">${s("later")}</button></div>`;
 const live=document.querySelector("#accueil .live .wrap");if(live)live.prepend(b);
}
addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferred=e;renderInstall()});
document.addEventListener("click",async e=>{const b=e.target.closest("[data-inst]");if(!b)return;
 if(b.dataset.inst==="go"&&deferred){deferred.prompt();try{await deferred.userChoice}catch(_){}deferred=null}
 else store.set("installLater",Date.now()+14*864e5);
 renderInstall()});
function registerSW(){
 try{if(!("serviceWorker" in navigator)||location.protocol!=="https:"||/claude\.ai|claudeusercontent|anthropic/.test(location.host))return;
  navigator.serviceWorker.register("sw.js").catch(()=>{})}catch(e){}
}

/* ================= branchements ================= */
function refresh(){renderJourJ();renderSouv();renderRecap();renderInstall()}
function init(){
 registerSW();refresh();loadCapN();loadRecap();
 setInterval(()=>{if(!document.hidden)renderJourJ()},30000);
 const m=/^#maries-(.+)$/.exec(location.hash);if(m)setTimeout(()=>go(location.hash.slice(1)),60);
}
if(window.Profile)Profile.on(()=>renderSouv());
window.Souvenirs.refresh=()=>{refresh();if(now()>=RECAP_AT()&&!RC)loadRecap()};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
