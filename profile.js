/* =====================================================================
   PROFIL · e-mail + code à 4 chiffres
   Retient, sur tous les appareils : prénom, chanson et cœurs, secrets trouvés,
   équipe et record de la Carrera, photo du podium.
   - identifiant = empreinte de l'e-mail (l'e-mail lui-même n'est pas stocké)
   - le lien personnel des e-mails (?g=…) connecte directement (même empreinte, calculée par annonces.gs)
   Données : u/{id} = { n: prénom, pin: empreinte du code, team, eggs:{…}, t }
   ===================================================================== */
(function(){
const PT={
 fr:{title:"Mon profil",why:"Votre profil retient votre prénom, votre chanson et vos cœurs, vos secrets et votre record à la Carrera, sur tous vos appareils.",
  email:"E-mail",code:"Code à 4 chiffres",codeNew:"Choisissez un code à 4 chiffres",name:"Votre prénom",go:"Continuer",create:"Créer mon profil",
  newP:"Nouveau profil : quel est votre prénom ?",wrong:"Code incorrect pour cet e-mail.",bad:"E-mail ou code invalide (4 chiffres).",needName:"Indiquez votre prénom.",
  hello:n=>`Bonjour ${n} ! Votre profil est retrouvé.`,welcome:n=>`Bienvenue ${n} ! Votre profil est créé.`,logged:n=>`Connecté·e : ${n}`,logout:"Se déconnecter",
  setPin:"Choisissez un code à 4 chiffres pour retrouver votre profil sur un autre appareil.",save:"Enregistrer",saved:"Code enregistré ✓",close:"Fermer",later:"Plus tard",
  forgot:"Code oublié ? Demandez-le à Agathe ou Valentin, ils peuvent le réinitialiser.",forgotBtn:"Code oublié ? Recevoir un lien par e-mail",forgotNeed:"Indiquez d'abord votre e-mail.",forgotSent:"Si cette adresse est connue, un lien vient de vous être envoyé. Pensez à regarder dans les indésirables.",newPin:"Vous êtes reconnu·e. Choisissez votre nouveau code à 4 chiffres.",me:"Mon profil",offline:"Connexion impossible, réessayez dans un instant"},
 es:{title:"Mi perfil",why:"Tu perfil guarda tu nombre, tu canción y tus corazones, tus secretos y tu récord en la Carrera, en todos tus dispositivos.",
  email:"E-mail",code:"Código de 4 cifras",codeNew:"Elige un código de 4 cifras",name:"Tu nombre",go:"Continuar",create:"Crear mi perfil",
  newP:"Perfil nuevo: ¿cómo te llamas?",wrong:"Código incorrecto para este e-mail.",bad:"E-mail o código no válido (4 cifras).",needName:"Indica tu nombre.",
  hello:n=>`¡Hola ${n}! Hemos recuperado tu perfil.`,welcome:n=>`¡Bienvenido/a ${n}! Tu perfil está creado.`,logged:n=>`Conectado/a: ${n}`,logout:"Cerrar sesión",
  setPin:"Elige un código de 4 cifras para recuperar tu perfil en otro dispositivo.",save:"Guardar",saved:"Código guardado ✓",close:"Cerrar",later:"Más tarde",
  forgot:"¿Olvidaste el código? Pídeselo a Agathe o Valentin, pueden restablecerlo.",forgotBtn:"¿Olvidaste el código? Recibir un enlace por e-mail",forgotNeed:"Escribe primero tu e-mail.",forgotSent:"Si conocemos esta dirección, te acabamos de enviar un enlace. Mira también en spam.",newPin:"Te hemos reconocido. Elige tu nuevo código de 4 cifras.",me:"Mi perfil",offline:"No se pudo conectar, inténtalo en un momento"},
 en:{title:"My profile",why:"Your profile keeps your name, your song and hearts, your secrets and your Race record, on all your devices.",
  email:"Email",code:"4-digit code",codeNew:"Choose a 4-digit code",name:"Your first name",go:"Continue",create:"Create my profile",
  newP:"New profile: what's your first name?",wrong:"Wrong code for this email.",bad:"Invalid email or code (4 digits).",needName:"Enter your first name.",
  hello:n=>`Hi ${n}! Your profile is back.`,welcome:n=>`Welcome ${n}! Your profile is created.`,logged:n=>`Signed in: ${n}`,logout:"Sign out",
  setPin:"Choose a 4-digit code to get your profile back on another device.",save:"Save",saved:"Code saved ✓",close:"Close",later:"Later",
  forgot:"Forgot your code? Ask Agathe or Valentin, they can reset it.",forgotBtn:"Forgot your code? Get a link by email",forgotNeed:"Enter your email first.",forgotSent:"If we know this address, a link is on its way. Check your spam folder too.",newPin:"We know it's you. Choose your new 4-digit code.",me:"My profile",offline:"Couldn't connect, try again in a moment"}};
const t=k=>(PT[lang]||PT.fr)[k]??PT.fr[k];
const SALT=()=>CONFIG.PROFILE_SALT||"change-moi-2027";
const ok=e=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

async function sha(s){const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s));return new Uint8Array(b)}
const b64u=u=>btoa(String.fromCharCode(...u)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
const hex=u=>[...u].map(x=>x.toString(16).padStart(2,"0")).join("");
async function idFor(email){return b64u(await sha(String(email).trim().toLowerCase()+"|"+SALT())).slice(0,14)}
async function pinHash(id,pin){return hex(await sha(id+"|"+pin)).slice(0,24)}
const srv=()=>typeof api!=="undefined"&&api.on();
const tell=(type,o)=>{if(srv())api.post({type,lang,...o}).catch(()=>{})};
async function db(fn){if(!window.Live)throw new Error("live");try{await Live.hold();return await fn(Live.db)}finally{Live.release()}}

const Pf={id:store.get("prof",""),name:store.get("profN",""),data:null,needPin:false,fns:[],prevKeys:[]};
const emit=()=>{Pf.fns.forEach(f=>{try{f(Pf)}catch(e){console.warn(e)}});renderBtn()};

/* lien personnel des e-mails */
(function(){const q=new URLSearchParams(location.search),g=q.get("g"),n=q.get("n");
 if(g&&/^[A-Za-z0-9_-]{6,24}$/.test(g)){if(Pf.id!==g||q.get("r")){Pf.pending={id:g,n:(n||"").slice(0,30),reset:!!q.get("r")}}}
 if(g||n){try{const u=new URL(location.href);u.searchParams.delete("g");u.searchParams.delete("n");u.searchParams.delete("r");history.replaceState(null,"",u.pathname+u.search+u.hash)}catch(e){}}})();

async function setActive(id,data){
 const before=Pf.id;Pf.id=id;Pf.data=data||{};Pf.name=Pf.data.n||Pf.name||"";Pf.needPin=!Pf.data.pin;
 store.set("prof",id);store.set("profN",Pf.name);
 if(before!==id){await merge(before)}
 emit();
}
/* rapatrie ce que ce téléphone avait déjà fait sans profil (ou sous un autre) */
async function merge(before){
 const id=Pf.id,key="u_"+id,olds=[before?("u_"+before):"","d_"+did,store.get("pid",""),window.Live?Live.dev:""].filter(k=>k&&k!==key);
 const eggs={...(Pf.data.eggs||{})};store.get("eggs",[]).forEach(e=>eggs[e]=true);
 store.set("eggs",Object.keys(eggs));
 try{await db(async x=>{
  await x.update("u/"+id,{eggs,n:Pf.name||null,t:x.now()});
  if(!Pf.data.team&&store.get("team",null))await x.update("u/"+id,{team:store.get("team",null)});
  for(const o of olds){
   // Carrera : on garde le meilleur
   const c=await x.get("carrera/p/"+o);
   if(c&&!c.screen){await x.tx("carrera/p/"+key,cur=>{cur=cur||{};return{...c,...cur,n:Pf.name||cur.n||c.n,team:cur.team||c.team,best:Math.max(cur.best||0,c.best||0),bonus:(cur.bonus||0)+(c.bonus||0),d:{...(c.d||{}),...(cur.d||{})},f:cur.f||c.f||null}});await x.remove("carrera/p/"+o)}
   // playlist : chanson et cœurs
   const pm=await x.get("pl/people/"+o),pv=await x.get("pl/votes/"+o);
   if(pm){const cur=await x.get("pl/people/"+key);if(!cur){await x.set("pl/people/"+key,{...pm,n:Pf.name||pm.n});if(pm.song)await x.update("pl/songs/"+pm.song,{pid:key,by:Pf.name||pm.n})}await x.remove("pl/people/"+o)}
   if(pv){const cur=await x.get("pl/votes/"+key)||{};await x.set("pl/votes/"+key,{...pv,...cur});await x.remove("pl/votes/"+o)}
  }
 })}catch(e){console.warn(e)}
 Pf.data.eggs=eggs;
 const tm=Pf.data.team||store.get("team",null);if(tm)store.set("team",tm);
 if(Pf.name)store.set("nick",Pf.name);
}
async function load(){
 if(Pf.pending){const p=Pf.pending;Pf.pending=null;
  try{const d=await db(x=>x.get("u/"+p.id));if(d)await setActive(p.id,d);else{const nd={n:p.n||knownName0()||"",t:Date.now()};await db(x=>x.update("u/"+p.id,nd));await setActive(p.id,nd)}
   if(p.reset){Pf.needPin=true;emit();setTimeout(()=>open(t("newPin")),400)}}catch(e){}
  return}
 if(Pf.id){try{const d=await db(x=>x.get("u/"+Pf.id));if(d){Pf.data=d;Pf.name=d.n||Pf.name;Pf.needPin=!d.pin;store.set("profN",Pf.name)
   const eg=new Set([...store.get("eggs",[]),...Object.keys(d.eggs||{})]);store.set("eggs",[...eg]);if(d.team)store.set("team",d.team);if(Pf.name)store.set("nick",Pf.name)}
  else{Pf.id="";store.set("prof","")}}catch(e){}}
 emit();
}
const knownName0=()=>store.get("photoName","")||store.get("nick","")||"";

/* connexion / création ; renvoie "ok" | "wrong" | "new" (prénom requis) | "bad" */
async function attach(email,pin,name){
 email=String(email||"").trim().toLowerCase();pin=String(pin||"").trim();
 if(!ok(email)||!/^\d{4}$/.test(pin))return"bad";
 const id=await idFor(email),h=await pinHash(id,pin);
 const d=await db(x=>x.get("u/"+id));
 if(d&&d.pin&&d.pin!==h)return"wrong";
 if(d){const upd={pin:h};if(!d.n&&name)upd.n=name.trim().slice(0,30);await db(x=>x.update("u/"+id,upd));store.set("profE",email);await setActive(id,{...d,...upd});tell("profile",{email,n:Pf.name});return"ok"}
 if(!name||!name.trim())return"new";
 const nd={n:name.trim().slice(0,30),pin:h,t:Date.now()};await db(x=>x.set("u/"+id,nd));store.set("profE",email);await setActive(id,nd);tell("profile",{email,n:nd.n});return"created";
}
async function check(email,pin){email=String(email||"").trim().toLowerCase();if(!ok(email)||!/^\d{4}$/.test(String(pin)))return"bad";
 const id=await idFor(email),d=await db(x=>x.get("u/"+id));if(!d||!d.pin)return"ok";return d.pin===(await pinHash(id,pin))?"ok":"wrong"}
async function setPin(pin){if(!Pf.id||!/^\d{4}$/.test(pin))return false;const h=await pinHash(Pf.id,pin);await db(x=>x.update("u/"+Pf.id,{pin:h}));Pf.data.pin=h;Pf.needPin=false;emit();return true}
async function update(f){Object.assign(Pf.data||(Pf.data={}),f);if(!Pf.id)return;try{await db(x=>x.update("u/"+Pf.id,f))}catch(e){}}
function logout(){Pf.id="";Pf.name="";Pf.data=null;["prof","profN","profE","pid","nick","team","best","eggs","faceSet","photoName","mySong","votes","voiceSent","capSent"].forEach(k=>{try{localStorage.removeItem("av27_"+k)}catch(e){}});emit()}

/* ---------- la fenêtre « Mon profil » ---------- */
let sheet=null,waiters=[];
function open(reason){
 close(true);sheet=document.createElement("div");sheet.className="psheet";sheet.setAttribute("role","dialog");
 const draw=(stage,msg)=>{
  let body;
  if(Pf.id)body=`${reason&&Pf.needPin?`<p>${esc(reason)}</p>`:""}<p class="pwho">👤 <b>${esc(t("logged")(Pf.name||"…"))}</b></p>${Pf.needPin?`${reason?"":`<p>${t("setPin")}</p>`}<input id="pfPin" class="pin" inputmode="numeric" maxlength="4" placeholder="••••"><button type="button" class="btn btn-gold" data-pf="pin">${t("save")}</button>`:""}
   <button type="button" class="btn btn-ghost btn-sm" data-pf="out">${t("logout")}</button>`;
  else body=`<p>${reason?esc(reason):t("why")}</p>
   <label>${t("email")}<input id="pfE" type="email" autocomplete="email" inputmode="email" value="${esc(store.get("profE","")||(typeof R!=="undefined"&&R&&R.email)||"")}"></label>
   <label>${stage==="new"?t("codeNew"):t("code")}<input id="pfC" class="pin" inputmode="numeric" maxlength="4" autocomplete="one-time-code" placeholder="••••"></label>
   ${stage==="new"?`<label class="pnew">${t("newP")}<input id="pfN" maxlength="30" autocomplete="given-name" value="${esc(knownName0())}"></label>`:""}
   <button type="button" class="btn btn-gold" data-pf="go">${stage==="new"?t("create"):t("go")}</button>${srv()?`<button type="button" class="plink" data-pf="forgot">${t("forgotBtn")}</button>`:`<small>${t("forgot")}</small>`}`;
  sheet.innerHTML=`<div class="pcard"><button type="button" class="px" data-pf="x" aria-label="${t("close")}">×</button><span class="eyebrow">${t("title")}</span>${body}<p class="perr">${msg?esc(msg):""}</p></div>`;
  sheet.dataset.stage=stage||"";
 };
 draw(Pf.id&&Pf.needPin?"pin":"");document.body.appendChild(sheet);requestAnimationFrame(()=>sheet.classList.add("on"));
 sheet.addEventListener("click",async e=>{
  if(e.target===sheet){close();return}const b=e.target.closest("[data-pf]");if(!b)return;const a=b.dataset.pf;
  if(a==="x"){close();return}
  if(a==="forgot"){const e1=String($("#pfE").value||"").trim().toLowerCase();if(!ok(e1)){draw(sheet.dataset.stage,t("forgotNeed"));$("#pfE").focus();return}
   tell("forgot",{email:e1});store.set("profE",e1);const pe=sheet.querySelector(".perr");pe.textContent=t("forgotSent");pe.classList.add("ok");b.disabled=true;return}
  if(a==="out"){logout();close();return}
  if(a==="pin"){const v=($("#pfPin")||{}).value||"";if(await setPin(v.trim())){toast(t("saved"));close(true)}else draw("pin",t("bad"));return}
  if(a==="go"){b.disabled=true;try{
    const r=await attach($("#pfE").value,$("#pfC").value,($("#pfN")||{}).value);
    if(r==="ok"){toast(t("hello")(Pf.name));close(true)}else if(r==="created"){toast(t("welcome")(Pf.name));close(true)}
    else if(r==="new"){const e1=$("#pfE").value,c1=$("#pfC").value;draw("new",sheet.dataset.stage==="new"?t("needName"):"");$("#pfE").value=e1;$("#pfC").value=c1;setTimeout(()=>$("#pfN")&&$("#pfN").focus(),50)}
    else{const e1=$("#pfE").value;draw(sheet.dataset.stage,r==="wrong"?t("wrong"):t("bad"));$("#pfE").value=e1}
   }catch(err){draw(sheet.dataset.stage,t("offline"))}finally{b.disabled=false}}
 });
 setTimeout(()=>{const i=sheet&&(sheet.querySelector("#pfE")&&!sheet.querySelector("#pfE").value?sheet.querySelector("#pfE"):sheet.querySelector("#pfC,#pfPin"));if(i)i.focus()},120);
}
function close(done){if(!sheet)return;const s=sheet;sheet=null;s.classList.remove("on");setTimeout(()=>s.remove(),300);
 const w=waiters;waiters=[];w.forEach(f=>f(!!Pf.id))}
/* demande un profil avant une action qui doit être retenue ; résout true si connecté */
function need(reason){if(Pf.id)return Promise.resolve(true);return new Promise(res=>{waiters.push(res);open(reason)})}

/* bouton « Mon profil » dans la barre du haut */
function renderBtn(){
 const tb=document.querySelector(".hero .topbar");if(!tb)return;let b=tb.querySelector(".pbtn");
 if(!b){b=document.createElement("button");b.type="button";b.className="pbtn";b.addEventListener("click",()=>open());const lg=tb.querySelector(".lang");lg?lg.before(b):tb.appendChild(b)}
 b.innerHTML=Pf.id?`<span class="pav">${esc((Pf.name||"?").slice(0,1).toUpperCase())}</span>`:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4.5 4.4-7 8-7s7 2.5 8 7"/></svg>`;
 b.setAttribute("aria-label",t("me"));b.classList.toggle("on",!!Pf.id);b.classList.toggle("warn",!!Pf.id&&Pf.needPin);
}

window.Profile={get id(){return Pf.id},get name(){return Pf.name},get data(){return Pf.data},get needPin(){return Pf.needPin},
 key:()=>Pf.id?"u_"+Pf.id:"",on:f=>Pf.fns.push(f),need,open,attach,check,update,setPin,idFor,logout,refresh:renderBtn,
 ready:null};
window.Profile.ready=load();
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",renderBtn);else renderBtn();
})();
