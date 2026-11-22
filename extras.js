/* =====================================================================
   EXTRAS · ciel de Séville en direct, fête du RSVP, mur photo, secrets
   Dépend de : CONFIG, lang, store, toast, confetti, now, whenLabel, esc, $, Live, shrinkImg
   ===================================================================== */
(function(){
const X={
 fr:{profWhy:"Vos photos seront signées de votre prénom : connectez-vous ou créez votre profil (e-mail + code à 4 chiffres).",dj:"🎧 Wiki-wiki ! ¡Que suene la música!",eggK:(n,t)=>`Secret trouvé · ${n}/${t}`,owlT:"🦉 1 h du matin…",owlD:"…et vous êtes sur notre site de mariage ? On vous aime. Allez dormir. Ou danser.",poly:"Trois langues en cinq secondes : ¡qué arte! 🇫🇷🇪🇸🇬🇧",nameQ:"Votre prénom (pour la légende)",nameNeed:"Ajoutez votre prénom, il apparaîtra sous vos photos",secrets:(n,t)=>`🤫 ${t} secrets sont cachés sur ce site · trouvés : ${n}/${t}`,found:(n,t)=>`Secret trouvé ! (${n}/${t})`,all:"Tous les secrets trouvés !",allSub:"Montrez cet écran au bar : ça vaut bien un verre de cava.",
  wish:"Une étoile filante : faites un vœu ✨",sunny:"Grand soleil sur Séville 😎",clock:"Séville",
  ole:"¡Olé !",yesT:"¡Olé ! On danse déjà",yesSub:"Merci ! On a hâte de vous voir à Séville.",tap:"touchez pour fermer",
  countdown:(d,h,m,s)=>`Plus que ${d} j ${h} h ${m} min ${s} s ⏳ (oui, on compte)`,amp:"💛",
  murK:"Le mur photo",murT:"Vos photos en direct",murD:"Envoyez vos photos de la soirée : elles défilent en direct sur le grand écran, puis restent ici en album.",
  murLockT:t=>`Le mur photo ouvre le ${t}`,murLockD:"Vos photos de la soirée défileront en direct sur le grand écran.",
  send:"Envoyer des photos",sending:(a,b)=>`Envoi ${a}/${b}…`,sent:n=>`${n} photo${n>1?"s":""} envoyée${n>1?"s":""} 📸`,fail:"Envoi impossible, réessayez",
  all2:n=>`Voir les ${n} photos`,less:"Réduire",none:"Aucune photo pour l'instant : soyez le premier !",by:n=>`par ${n}`},
 es:{profWhy:"Tus fotos irán firmadas con tu nombre: conéctate o crea tu perfil (e-mail + código de 4 cifras).",dj:"🎧 ¡Wiki-wiki! ¡Que suene la música!",eggK:(n,t)=>`Secreto encontrado · ${n}/${t}`,owlT:"🦉 La 1 de la mañana…",owlD:"…¿y estás en la web de nuestra boda? Te queremos. Vete a dormir. O a bailar.",poly:"Tres idiomas en cinco segundos: ¡qué arte! 🇫🇷🇪🇸🇬🇧",nameQ:"Tu nombre (para el pie de foto)",nameNeed:"Añade tu nombre, aparecerá bajo tus fotos",secrets:(n,t)=>`🤫 Hay ${t} secretos escondidos en esta web · encontrados: ${n}/${t}`,found:(n,t)=>`¡Secreto encontrado! (${n}/${t})`,all:"¡Todos los secretos!",allSub:"Enseña esta pantalla en la barra: te has ganado una copa de cava.",
  wish:"Una estrella fugaz: pide un deseo ✨",sunny:"Sol radiante en Sevilla 😎",clock:"Sevilla",
  ole:"¡Olé!",yesT:"¡Olé! Ya estamos bailando",yesSub:"¡Gracias! Tenemos muchas ganas de veros en Sevilla.",tap:"toca para cerrar",
  countdown:(d,h,m,s)=>`Quedan ${d} d ${h} h ${m} min ${s} s ⏳ (sí, los contamos)`,amp:"💛",
  murK:"El muro de fotos",murT:"Vuestras fotos en directo",murD:"Enviad vuestras fotos de la fiesta: aparecen en directo en la pantalla grande y luego se quedan aquí como álbum.",
  murLockT:t=>`El muro de fotos abre el ${t}`,murLockD:"Vuestras fotos de la fiesta aparecerán en directo en la pantalla grande.",
  send:"Enviar fotos",sending:(a,b)=>`Enviando ${a}/${b}…`,sent:n=>`${n} foto${n>1?"s":""} enviada${n>1?"s":""} 📸`,fail:"No se pudo enviar, inténtalo de nuevo",
  all2:n=>`Ver las ${n} fotos`,less:"Ver menos",none:"Aún no hay fotos: ¡sé el primero!",by:n=>`de ${n}`},
 en:{profWhy:"Your photos will be signed with your name: sign in or create your profile (email + 4-digit code).",dj:"🎧 Wicka-wicka! ¡Que suene la música!",eggK:(n,t)=>`Secret found · ${n}/${t}`,owlT:"🦉 1 a.m.…",owlD:"…and you're on our wedding website? We love you. Go to sleep. Or go dancing.",poly:"Three languages in five seconds: ¡qué arte! 🇫🇷🇪🇸🇬🇧",nameQ:"Your first name (for the caption)",nameNeed:"Add your first name, it will appear under your photos",secrets:(n,t)=>`🤫 ${t} secrets are hidden on this site · found: ${n}/${t}`,found:(n,t)=>`Secret found! (${n}/${t})`,all:"All secrets found!",allSub:"Show this screen at the bar: that's worth a glass of cava.",
  wish:"A shooting star: make a wish ✨",sunny:"Blazing sun over Seville 😎",clock:"Seville",
  ole:"¡Olé!",yesT:"¡Olé! We're already dancing",yesSub:"Thank you! We can't wait to see you in Seville.",tap:"tap to close",
  countdown:(d,h,m,s)=>`Only ${d} d ${h} h ${m} min ${s} s to go ⏳ (yes, we're counting)`,amp:"💛",
  murK:"The photo wall",murT:"Your photos, live",murD:"Send your photos from the party: they appear live on the big screen, then stay here as an album.",
  murLockT:t=>`The photo wall opens on ${t}`,murLockD:"Your party photos will appear live on the big screen.",
  send:"Send photos",sending:(a,b)=>`Sending ${a}/${b}…`,sent:n=>`${n} photo${n>1?"s":""} sent 📸`,fail:"Couldn't send, please try again",
  all2:n=>`See all ${n} photos`,less:"Show less",none:"No photos yet: be the first!",by:n=>`by ${n}`}};
const x=k=>(X[lang]||X.fr)[k]??X.fr[k];
const isDrape=()=>document.documentElement.getAttribute("data-avstyle")==="drape";

/* ---------------- sons : castagnettes synthétisées ---------------- */
let AC=null;
function castanets(){
 try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();const t0=AC.currentTime+0.02;
  [0,.11,.22,.5,.61,.72,1,1.06,1.12,1.3].forEach(dt=>{const len=0.04,b=AC.createBuffer(1,AC.sampleRate*len,AC.sampleRate),d=b.getChannelData(0);
   for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,6);
   const s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();s.buffer=b;f.type="bandpass";f.frequency.value=2600;f.Q.value=3;g.gain.value=0.9;
   s.connect(f);f.connect(g);g.connect(AC.destination);s.start(t0+dt)})}catch(e){}
}

/* ---------------- la fête : les mariés dansent une sevillana ---------------- */
const DANCERS=`<svg class="dz" viewBox="0 0 220 210" aria-hidden="true">
 <ellipse cx="62" cy="196" rx="44" ry="6" fill="rgba(43,42,40,.12)"/><ellipse cx="158" cy="196" rx="30" ry="6" fill="rgba(43,42,40,.12)"/>
 <g class="dA"><g class="dA-body">
  <path class="armL" d="M48 74L24 44" stroke="#e2c4a6" stroke-width="7" stroke-linecap="round"/>
  <path class="armR" d="M76 74L100 46" stroke="#e2c4a6" stroke-width="7" stroke-linecap="round"/>
  <g class="skirt">
   <path d="M44 96h36l14 34H30z" fill="#fff" stroke="#b39663" stroke-width="2"/>
   <path d="M30 128h64l16 32H14z" fill="#fff" stroke="#b39663" stroke-width="2"/>
   <path d="M14 158h96c8 12 14 22 18 32-44 8-88 8-132 0 4-10 10-20 18-32z" fill="#fff" stroke="#b39663" stroke-width="2"/>
   <path d="M24 134c8 4 16 4 24 0s16-4 24 0 16 4 24 0M8 166c10 5 20 5 30 0s20-5 30 0 20 5 30 0 20 5 30 0" fill="none" stroke="#b39663" stroke-width="1.5"/></g>
  <path d="M46 66h32l4 32H42z" fill="#fff" stroke="#b39663" stroke-width="2"/><path d="M46 80h32" stroke="#6b7a4b" stroke-width="3"/>
 </g><image class="hA" href="img/head-agathe.png" x="34" y="4" width="56" height="68"/></g>
 <g class="dV"><g class="dV-body">
  <path class="legL" d="M148 126l-6 62" stroke="#2b2a28" stroke-width="11" stroke-linecap="round"/><path class="legR" d="M168 126l6 62" stroke="#2b2a28" stroke-width="11" stroke-linecap="round"/>
  <path class="armL" d="M142 80l-22-30" stroke="#2b2a28" stroke-width="9" stroke-linecap="round"/><path class="armR" d="M174 80l22-32" stroke="#2b2a28" stroke-width="9" stroke-linecap="round"/>
  <path d="M138 70h40l4 58h-48z" fill="#2b2a28"/><path d="M152 70h12l-6 22z" fill="#fff"/><path d="M155 74h6l-3 4z" fill="#6b7a4b"/>
 </g><image class="hV" href="img/head-valentin.png" x="128" y="2" width="60" height="72"/></g>
</svg>`;
function fiesta(title,sub,sound){
 const old=document.querySelector(".fiesta");if(old)old.remove();
 const el=document.createElement("div");el.className="fiesta";el.setAttribute("role","dialog");
 el.innerHTML=`<div class="petals">${Array.from({length:26},(_,i)=>`<i style="left:${(i*37)%100}%;animation-delay:${(i%9)*0.35}s;animation-duration:${3.2+(i%5)*0.6}s;--r:${(i*47)%360}deg"></i>`).join("")}</div>
  <div class="fz">${DANCERS}<h3>${esc(title)}</h3>${sub?`<p>${esc(sub)}</p>`:""}<small>${x("tap")}</small></div>`;
 document.body.appendChild(el);requestAnimationFrame(()=>el.classList.add("on"));
 const close=()=>{el.classList.remove("on");setTimeout(()=>el.remove(),400)};
 el.addEventListener("click",close);setTimeout(close,7000);
 if(sound!==false)castanets();try{confetti()}catch(e){}
}
window.fiesta=fiesta;

/* ---------------- secrets ---------------- */
const EGGS=["photo","amp","sky","dessin","vinyle","nuit","langues"];
/* la célébration n'arrive qu'à la première découverte ; l'animation du secret, elle, revient à chaque fois */
const EGG_NAME={
 fr:{photo:"Les trois coups d'¡Olé !",vinyle:"Le vinyle qui scratche",amp:"La photo qui glisse",sky:"Le ciel qui répond",dessin:"Les dessins qui parlent",date:"Le compte à rebours à la seconde",nuit:"Le hibou de 1 h du matin",langues:"Le polyglotte"},
 es:{photo:"Los tres toques de ¡Olé!",vinyle:"El vinilo que hace scratch",amp:"La foto que se desliza",sky:"El cielo que responde",dessin:"Los dibujos que hablan",date:"La cuenta atrás al segundo",nuit:"El búho de la 1 de la mañana",langues:"El políglota"},
 en:{photo:"Three taps for ¡Olé!",vinyle:"The scratching record",amp:"The sliding photo",sky:"The sky that answers",dessin:"The talking drawings",date:"The countdown to the second",nuit:"The 1 a.m. owl",langues:"The polyglot"}};
function chime(){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();const t0=AC.currentTime+0.02;
 [659,784,988,1319].forEach((f,i)=>{const o=AC.createOscillator(),g=AC.createGain();o.type="triangle";o.frequency.value=f;g.gain.setValueAtTime(0,t0+i*0.09);g.gain.linearRampToValueAtTime(0.18,t0+i*0.09+0.02);g.gain.exponentialRampToValueAtTime(0.001,t0+i*0.09+0.5);o.connect(g);g.connect(AC.destination);o.start(t0+i*0.09);o.stop(t0+i*0.09+0.55)})}catch(e){}}
function secretCard(id,n,t){
 const old=document.querySelector(".eggcard");if(old)old.remove();
 const el=document.createElement("div");el.className="eggcard";el.setAttribute("role","status");
 el.innerHTML=`<div class="eg-spark">${Array.from({length:12},(_,i)=>`<i style="--a:${i*30}deg"></i>`).join("")}</div><div class="eg-ico">🗝️</div>
  <div class="eg-txt"><small>${x("eggK")(n,t)}</small><b>${esc((EGG_NAME[lang]||EGG_NAME.fr)[id]||"")}</b><span class="eg-dots">${Array.from({length:t},(_,i)=>`<i class="${i<n?"on":""}"></i>`).join("")}</span></div>`;
 document.body.appendChild(el);requestAnimationFrame(()=>el.classList.add("on"));chime();try{navigator.vibrate&&navigator.vibrate([20,40,20,40,60])}catch(e){}
 const close=()=>{el.classList.remove("on");setTimeout(()=>el.remove(),500)};el.addEventListener("click",close);setTimeout(close,4200);
}
function found(id){
 const f=store.get("eggs",[]).filter(i=>EGGS.includes(i));if(f.includes(id))return false;f.push(id);store.set("eggs",f);renderSecrets();
 if(window.Profile&&Profile.id){const eg={...((Profile.data&&Profile.data.eggs)||{})};f.forEach(k=>eg[k]=true);Profile.update({eggs:eg})}
 setTimeout(()=>secretCard(id,f.length,EGGS.length),600);
 if(f.length>=EGGS.length)setTimeout(()=>fiesta(x("all"),x("allSub")),5000);
 return true;
}
function renderSecrets(){
 let el=document.getElementById("secrets");
 if(!el){const sig=document.querySelector("footer .sig");if(!sig)return;el=document.createElement("div");el.id="secrets";el.className="secrets";sig.after(el)}
 el.textContent=x("secrets")(store.get("eggs",[]).filter(i=>EGGS.includes(i)).length,EGGS.length);
}
// 1. trois tapes sur la photo d'accueil
let taps=[];
document.addEventListener("click",e=>{
 if(e.target.closest(".hero-img")&&!e.target.closest(".orb")){const n=Date.now();taps=taps.filter(t=>n-t<1500);taps.push(n);
  if(taps.length>=3){taps=[];found("photo");fiesta(x("ole"),"",true);olé()}}
});
// 2. appui long sur le « & »
let ampT=null;
function hearts(el){const r=el.getBoundingClientRect();for(let i=0;i<14;i++){const h=document.createElement("span");h.className="egg-heart";h.textContent=["💛","🤍","💚"][i%3];
 h.style.left=(r.left+r.width/2)+"px";h.style.top=(r.top+r.height/2+scrollY)+"px";h.style.setProperty("--dx",(Math.random()*240-120)+"px");h.style.setProperty("--dy",(-80-Math.random()*160)+"px");
 h.style.animationDelay=(i*0.04)+"s";document.body.appendChild(h);setTimeout(()=>h.remove(),1800)}}
/* 2. faire glisser la photo d'accueil : la même photo, en 2026 */
let sw=null;
document.addEventListener("pointerdown",e=>{const h=e.target.closest(".hero-img");if(!h||e.target.closest(".orb"))return;sw={x:e.clientX,y:e.clientY,h}});
document.addEventListener("pointerup",e=>{if(!sw)return;const dx=e.clientX-sw.x,dy=e.clientY-sw.y,h=sw.h;sw=null;
 if(Math.abs(dx)<60||Math.abs(dx)<Math.abs(dy)*1.5)return;
 const im=h.querySelector("img:not(.orb)");if(!im)return;
 if(!im.dataset.orig)im.dataset.orig=im.getAttribute("src");
 const to2026=!im.src.includes("p-2026");
 im.classList.add("fade");
 setTimeout(()=>{im.src=to2026?"img/p-2026.jpg":im.dataset.orig;im.classList.remove("fade")},350);
 let y=h.querySelector(".year");if(!y){y=document.createElement("span");y.className="year";h.appendChild(y)}
 y.textContent=to2026?"2026":"";y.hidden=!to2026;
 if(to2026){found("amp");try{navigator.vibrate&&navigator.vibrate(20)}catch(_){}}});
document.addEventListener("pointercancel",()=>{sw=null});
// 5. trois tapes sur le vinyle de la playlist (page Jeux) : il scratche
function scratchSnd(){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();const t0=AC.currentTime+0.02,len=0.9,b=AC.createBuffer(1,AC.sampleRate*len,AC.sampleRate),d=b.getChannelData(0);
 for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;const src=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();src.buffer=b;f.type="bandpass";f.Q.value=6;
 [[0,400],[.12,2400],[.24,500],[.4,2600],[.52,600],[.68,3000]].forEach(([t,v])=>f.frequency.linearRampToValueAtTime(v,t0+t));
 g.gain.setValueAtTime(0,t0);[[.02,.9],[.11,.1],[.14,.9],[.23,.1],[.27,.9],[.39,.1],[.42,.9],[.51,.1],[.55,.9],[.85,0]].forEach(([t,v])=>g.gain.linearRampToValueAtTime(v,t0+t));
 src.connect(f);f.connect(g);g.connect(AC.destination);src.start(t0)}catch(e){}}
/* geste de scratch : des allers-retours rapides du doigt sur le vinyle (3 changements de sens en moins d'1,2 s) */
const SC={on:false,x:0,dir:0,rev:[],last:0,x0:0,y0:0};
function scratchBoom(x0,y0){
 const v=document.createElement("span");v.className="vinyl";v.textContent="💿";v.style.left=x0+"px";v.style.top=(y0+scrollY)+"px";document.body.appendChild(v);setTimeout(()=>v.remove(),1700);
 for(let i=0;i<7;i++){const nt=document.createElement("span");nt.className="note";nt.textContent=["♪","♫","♬"][i%3];nt.style.left=(x0-20+Math.random()*40)+"px";nt.style.top=(y0+scrollY-10)+"px";
  nt.style.setProperty("--dx",(Math.random()*160-80)+"px");nt.style.setProperty("--r",(Math.random()*60-30)+"deg");nt.style.animationDelay=(0.15+i*0.12)+"s";document.body.appendChild(nt);setTimeout(()=>nt.remove(),2600)}
 scratchSnd();try{navigator.vibrate&&navigator.vibrate([30,30,30,30,60])}catch(_){}
 setTimeout(()=>toast(x("dj")),400);found("vinyle");
}
document.addEventListener("pointerdown",e=>{const bn=e.target.closest("#plBan");if(!bn)return;const r=bn.getBoundingClientRect();if(e.clientX<r.left+r.width*0.4)return;
 SC.on=true;SC.x=e.clientX;SC.dir=0;SC.rev=[];SC.x0=e.clientX;SC.y0=e.clientY});
document.addEventListener("pointermove",e=>{if(!SC.on)return;const dx=e.clientX-SC.x;if(Math.abs(dx)<12)return;const d=Math.sign(dx);
 if(SC.dir&&d!==SC.dir){const n=Date.now();SC.rev=SC.rev.filter(t=>n-t<1200);SC.rev.push(n);
  if(SC.rev.length>=3){SC.on=false;SC.rev=[];scratchBoom(e.clientX,e.clientY)}}
 SC.dir=d;SC.x=e.clientX});
["pointerup","pointercancel"].forEach(t=>document.addEventListener(t,()=>{SC.on=false}));


/* ---------------- petits bruitages synthétisés (aucun fichier son) ---------------- */
function ac(){AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(AC.state==="suspended")AC.resume();return AC}
function tone(o){/* {f:[f0,f1,(f2)],dur,type,vol,at,vib,vibD,lp,bp,q} */
 const a=ac(),t=a.currentTime+0.02+(o.at||0),d=o.dur||.4,os=a.createOscillator(),g=a.createGain();os.type=o.type||"sine";
 const f=o.f;os.frequency.setValueAtTime(f[0],t);if(f.length===2)os.frequency.exponentialRampToValueAtTime(f[1],t+d);if(f.length===3){os.frequency.exponentialRampToValueAtTime(f[1],t+d*.4);os.frequency.exponentialRampToValueAtTime(f[2],t+d)}
 if(o.vib){const l=a.createOscillator(),lg=a.createGain();l.frequency.value=o.vib;lg.gain.value=o.vibD||8;l.connect(lg);lg.connect(os.frequency);l.start(t);l.stop(t+d)}
 let n=os;if(o.lp){const fl=a.createBiquadFilter();fl.type="lowpass";fl.frequency.value=o.lp;n.connect(fl);n=fl}if(o.bp){const fl=a.createBiquadFilter();fl.type="bandpass";fl.frequency.value=o.bp;fl.Q.value=o.q||4;n.connect(fl);n=fl}
 const v=o.vol||.25;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+Math.min(.05,d/4));g.gain.setValueAtTime(v,t+d*.7);g.gain.exponentialRampToValueAtTime(.001,t+d);
 n.connect(g);g.connect(a.destination);os.start(t);os.stop(t+d+.05)}
function noise(o){/* {dur,at,vol,lp,hp,bp,q,trem} */
 const a=ac(),t=a.currentTime+0.02+(o.at||0),d=o.dur||.2,b=a.createBuffer(1,Math.ceil(a.sampleRate*d),a.sampleRate),x=b.getChannelData(0);
 for(let i=0;i<x.length;i++){const k=i/x.length;x[i]=(Math.random()*2-1)*(o.shape?o.shape(k):Math.pow(1-k,3))*(o.trem?(.5+.5*Math.sin(i/a.sampleRate*o.trem*6.283)):1)}
 const s=a.createBufferSource(),g=a.createGain();s.buffer=b;let n=s;
 for(const [ty,fq] of [["lowpass",o.lp],["highpass",o.hp],["bandpass",o.bp]])if(fq){const fl=a.createBiquadFilter();fl.type=ty;fl.frequency.value=fq;if(ty==="bandpass")fl.Q.value=o.q||3;n.connect(fl);n=fl}
 g.gain.value=o.vol||.4;n.connect(g);g.connect(a.destination);s.start(t)}
function pluck(freq,at,vol){/* corde de guitare (Karplus-Strong) */
 const a=ac(),dur=1.6,N=Math.round(a.sampleRate/freq),b=a.createBuffer(1,Math.ceil(a.sampleRate*dur),a.sampleRate),x=b.getChannelData(0);
 for(let i=0;i<N;i++)x[i]=Math.random()*2-1;for(let i=N;i<x.length;i++)x[i]=.996*.5*(x[i-N]+x[i-N+1]);
 const s=a.createBufferSource(),g=a.createGain();s.buffer=b;g.gain.value=vol||.35;s.connect(g);g.connect(a.destination);s.start(a.currentTime+.02+(at||0))}
function bells(notes,step,type){notes.forEach((f,i)=>tone({f:[f],dur:.7,type:type||"triangle",vol:.16,at:i*(step||.12)}))}
const SFX={
 taureau(){tone({f:[118,92],dur:1.1,type:"sawtooth",lp:520,vol:.32,vib:5,vibD:3})},
 chat(){tone({f:[520,880,560],dur:.75,type:"sawtooth",bp:1100,q:2.5,vol:.45,vib:6,vibD:10})},
 chien(){[0,.26].forEach(at=>{tone({f:[330,190],dur:.16,type:"sawtooth",lp:1400,vol:.42,at});noise({dur:.12,at,bp:900,q:1.5,vol:.35})})},
 cigogne(){for(let i=0;i<12;i++)noise({dur:.03,at:i*.07,bp:1300,q:4,vol:.8})},
 paon(){[0,.55].forEach(at=>tone({f:[880,1500,760],dur:.45,type:"sawtooth",bp:1400,q:2,vol:.3,at,vib:9,vibD:20}))},
 caleche(){[0,.22,.5,.72,1,1.22].forEach((at,i)=>noise({dur:.05,at,bp:i%2?650:900,q:6,vol:1}));bells([1568,1568],.35)},
 cheval(){tone({f:[620,1250,520],dur:1,type:"sawtooth",bp:1200,q:1.5,vol:.35,vib:13,vibD:60})},
 vespa(){tone({f:[70,128],dur:1.3,type:"sawtooth",lp:900,vol:.28,vib:28,vibD:6});noise({dur:1.3,lp:500,vol:.12,trem:30,shape:k=>Math.min(1,k*8)*(1-k)})},
 guitare(){[164.8,220,261.6,329.6,440].forEach((f,i)=>pluck(f,i*.035))},
 guitariste(){[[164.8,207.7,246.9,329.6],[174.6,220,261.6,349.2],[196,246.9,293.7,392],[174.6,220,261.6,349.2]].forEach((ch,j)=>ch.forEach((f,i)=>pluck(f,j*.42+i*.03,.28)))},
 maries(){bells([1047,1319,1568,2093],.16)},
 barque(){tone({f:[196],dur:.9,type:"sawtooth",lp:700,vol:.22});tone({f:[247],dur:.9,type:"sawtooth",lp:700,vol:.16});noise({dur:.9,lp:700,vol:.08,shape:k=>Math.sin(k*3.14)})},
 valises(){noise({dur:.9,lp:420,vol:.25,trem:18,shape:k=>Math.sin(k*3.14)});bells([784,988,1175],.18,"sine")},
 naranjo(){noise({dur:.5,hp:2500,vol:.25,shape:k=>Math.sin(k*3.14)*(.6+.4*Math.sin(k*40))});tone({f:[500,180],dur:.12,type:"sine",vol:.4,at:.55})},
 oiseaux(){[0,.18,.32,.6,.74].forEach(at=>tone({f:[2600,4200],dur:.09,type:"sine",vol:.18,at}))},
 pigeons(){[0,.7].forEach(at=>{tone({f:[420,360],dur:.28,type:"sine",vol:.3,at,vib:22,vibD:18});tone({f:[380,330],dur:.38,type:"sine",vol:.26,at:at+.3,vib:20,vibD:14})})},
 papillons(){bells([2093,2637,3136,2349,2794].sort(()=>Math.random()-.5),.09,"sine")},
 torero(){},flamenca(){}
};
const SPEAK=new Set(["maries","torero","flamenca","taureau"]);
function olé(){/* finale flamenca : rasgueado + palmas + castagnettes (pas de voix de synthèse) */
 try{
  const E=[82.4,123.5,164.8,207.7,246.9,329.6],F=[87.3,130.8,174.6,220,261.6,349.2];
  [[F,0],[F,.12],[E,.36],[E,.44],[E,.52],[E,.6]].forEach(([ch,at],k)=>ch.forEach((f,i)=>pluck(f,at+(k%2?(5-i):i)*.012,.22)));
  [.36,.66,.96,1.12,1.28].forEach(at=>noise({dur:.06,at,bp:1800,q:1.2,vol:.9}));
  setTimeout(()=>{try{castanets()}catch(_){}},700);
  [[0,659],[.14,698],[.28,659],[.5,880]].forEach(([at,f])=>tone({f:[f],dur:at>.4?.6:.16,type:"sawtooth",lp:2200,vol:.12,at:1.1+at,vib:at>.4?6:0,vibD:6}));
 }catch(_){}}
/* les petits mariés de la frise : 3 appuis = ¡Olé! */
let ftaps=[];document.addEventListener("click",e=>{if(!e.target.closest(".fme"))return;const n=Date.now();ftaps=ftaps.filter(t=>n-t<1500);ftaps.push(n);if(ftaps.length>=3){ftaps=[];olé()}});
// 4. les petits dessins de la page Pratique parlent
const SAY={
 fr:{taureau:"Muuu… ¡olé !",torero:"¡Olé !",chat:"Miaou 🐾",cigogne:"Clac-clac-clac",paon:"Admirez ma roue 🦚",caleche:"Clip-clop 🐴",cheval:"Hiii ! 🐴",chien:"Ouaf ! 🐾",vespa:"Vroum vroum 🛵",guitariste:"♪ Sevillanas ♪",guitare:"♪ Tiriri ♪",maries:"Sí, quiero 💍",flamenca:"¡Arsa ! 💃",barque:"Ohé du bateau ⛵",valises:"Prêts pour Séville ✈️",naranjo:"Ne goûtez pas, elles sont amères 🍊",oiseaux:"Cui cui",pigeons:"Rou-rou",papillons:"✨"},
 es:{taureau:"Muuu… ¡olé!",torero:"¡Olé!",chat:"Miau 🐾",cigogne:"Clac-clac-clac",paon:"Mirad mi cola 🦚",caleche:"Clop-clop 🐴",cheval:"¡Hiii! 🐴",chien:"¡Guau! 🐾",vespa:"Brum brum 🛵",guitariste:"♪ Sevillanas ♪",guitare:"♪ Tiriri ♪",maries:"Sí, quiero 💍",flamenca:"¡Arsa! 💃",barque:"¡Ah del barco! ⛵",valises:"¡Listos para Sevilla! ✈️",naranjo:"No las probéis, son amargas 🍊",oiseaux:"Pío pío",pigeons:"Cu-cú",papillons:"✨"},
 en:{taureau:"Mooo… ¡olé!",torero:"¡Olé!",chat:"Meow 🐾",cigogne:"Clack-clack-clack",paon:"Admire my tail 🦚",caleche:"Clip-clop 🐴",cheval:"Neigh! 🐴",chien:"Woof! 🐾",vespa:"Vroom vroom 🛵",guitariste:"♪ Sevillanas ♪",guitare:"♪ Strum ♪",maries:"Sí, quiero 💍",flamenca:"¡Arsa! 💃",barque:"Ahoy! ⛵",valises:"Ready for Seville ✈️",naranjo:"Don't taste them, they're bitter 🍊",oiseaux:"Tweet tweet",pigeons:"Coo-coo",papillons:"✨"}};
document.addEventListener("click",e=>{
 const c=e.target.closest(".acc");if(!c||e.target.closest("a,button,summary,input"))return;const r=c.getBoundingClientRect();
 if(e.clientY<r.bottom-r.width/3)return;
 const names=(c.dataset.acc||"").split("+"),xr=(e.clientX-r.left)/r.width;
 const who=names.length>1&&xr>0.5&&!/^(papillons|oiseaux|pigeons)$/.test(names[1])?names[1]:names[0];
 const b=document.createElement("span");b.className="say";b.textContent=(SAY[lang]||SAY.fr)[who]||"¡Olé!";
 b.style.left=Math.min(r.width-20,Math.max(20,e.clientX-r.left))+"px";b.style.top=(e.clientY-r.top-14)+"px";c.appendChild(b);setTimeout(()=>b.remove(),2200);
 try{(SFX[who]||(()=>castanets()))()}catch(_){}
 if(who==="torero"||who==="flamenca")castanets();
 if(SPEAK.has(who)&&window.sayAloud){const say=who==="taureau"?"¡Olé!":b.textContent;setTimeout(()=>sayAloud(say,/[¡¿]|^Sí|olé/i.test(say)?"es-ES":({fr:"fr-FR",es:"es-ES",en:"en-GB"}[lang]||"fr-FR")),who==="taureau"?1000:who==="maries"?150:450)}
 found("dessin");
});

// 6. le site ouvert entre 1 h et 2 h du matin
let owlDay="";
function owl(){const d=new Date(now());if(d.getHours()!==1)return;const k=d.toDateString();if(owlDay===k)return;owlDay=k;fiesta(x("owlT"),x("owlD"),false);found("nuit")}
// 7. passer par les trois langues en moins de 5 secondes
let lt=[];
document.addEventListener("click",e=>{const b=e.target.closest("[data-lang]");if(!b)return;const n=Date.now();lt=lt.filter(v=>n-v.t<5000);lt.push({t:n,l:b.dataset.lang});
 if(new Set(lt.map(v=>v.l)).size>=3){lt=[];setTimeout(()=>{toast(x("poly"));found("langues")},300)}});

/* ---------------- ciel de Séville en direct ---------------- */
const LAT=37.389,LON=-5.984,rad=Math.PI/180;
function sunTimes(ms){
 const d=new Date(ms),n=Math.floor((Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate())-Date.UTC(d.getUTCFullYear(),0,0))/864e5);
 const decl=23.44*Math.sin(2*Math.PI*(284+n)/365)*rad,B=2*Math.PI*(n-81)/364,eot=9.87*Math.sin(2*B)-7.53*Math.cos(B)-1.5*Math.sin(B);
 const h0=Math.acos(Math.max(-1,Math.min(1,(Math.sin(-0.833*rad)-Math.sin(LAT*rad)*Math.sin(decl))/(Math.cos(LAT*rad)*Math.cos(decl)))))/rad;
 const noon=12-LON/15-eot/60,day=Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate());
 return{rise:day+(noon-h0/15)*36e5,set:day+(noon+h0/15)*36e5};
}
const hx=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)),mixc=(a,b,k)=>{const A=hx(a),B=hx(b);return"#"+A.map((v,i)=>Math.round(v+(B[i]-v)*k).toString(16).padStart(2,"0")).join("")};
const SKY=[[-1,"#1f2740","#4a5674"],[-0.25,"#2f3a5c","#6a6f8c"],[-0.05,"#7d7fa6","#eab49c"],[0.08,"#f0b796","#f8dcc6"],[0.3,"#c7d8de","#efe9df"],[1,"#b7d0db","#ece9e2"]];
function skyAt(e){for(let i=1;i<SKY.length;i++){if(e<=SKY[i][0]){const a=SKY[i-1],b=SKY[i],k=(e-a[0])/(b[0]-a[0]);return[mixc(a[1],b[1],k),mixc(a[2],b[2],k)]}}return[SKY[5][1],SKY[5][2]]}
const clockF=new Intl.DateTimeFormat("fr-FR",{timeZone:"Europe/Madrid",hour:"2-digit",minute:"2-digit"});
function buildSky(){
 const hero=document.querySelector(".hero");if(!hero||hero.querySelector(".sky"))return;
 const s=document.createElement("div");s.className="sky";s.setAttribute("aria-hidden","true");
 s.innerHTML=`<div class="stars">${Array.from({length:46},(_,i)=>`<i style="left:${(i*61.8)%100}%;top:${(i*37.3)%62}%;animation-delay:${(i%7)*0.4}s;transform:scale(${0.5+(i%4)*0.25})"></i>`).join("")}</div>`;
 hero.prepend(s);
 /* soleil / lune : dans l'arche de la photo, au-dessus d'elle, pour rester visible et touchable */
 const hi=hero.querySelector(".hero-img");if(hi&&!hi.querySelector(".orb"))hi.insertAdjacentHTML("beforeend",`<button type="button" class="orb" tabindex="-1" aria-hidden="true"></button><i class="shoot"></i>`);
 const tb=hero.querySelector(".topbar");if(tb&&!tb.querySelector(".skyclock")){const c=document.createElement("span");c.className="skyclock";tb.prepend(c)}
 const ob=hero.querySelector(".orb");if(ob)ob.addEventListener("click",e=>{e.stopPropagation();
  if(hero.classList.contains("is-night")){const sh=hero.querySelector(".shoot");sh.classList.remove("go");void sh.offsetWidth;sh.classList.add("go");toast(x("wish"))}
  else{ob.classList.add("cool");setTimeout(()=>ob.classList.remove("cool"),3500);toast(x("sunny"))}
  found("sky")});
}
function paintSky(){
 const hero=document.querySelector(".hero"),s=hero&&hero.querySelector(".sky");if(!s)return;
 const t=now(),{rise,set}=sunTimes(t);let e,frac;
 if(t>=rise&&t<=set){frac=(t-rise)/(set-rise);e=Math.sin(Math.PI*frac)}
 else{const nr=t<rise?rise:sunTimes(t+864e5).rise,ps=t>set?set:sunTimes(t-864e5).set;frac=(t-ps)/(nr-ps);e=-Math.min(1,Math.min(t-ps,nr-t)/36e5/2.5)}
 const [top,mid]=skyAt(e),night=e<-0.08;
 if(!night&&(t<rise||t>set))frac=t>set?1:0; /* aube / crépuscule : le soleil reste au bord de son côté */
 s.style.setProperty("--top",top);s.style.setProperty("--mid",mid);
 /* course le long de l'arche : du bord gauche (lever) au bord droit (coucher), au plus haut à midi / minuit */
 const orb=hero.querySelector(".hero-img .orb"),hi=hero.querySelector(".hero-img");
 if(orb&&hi){orb.classList.toggle("moon",night);const W=hi.clientWidth,R=Math.max(40,W/2-62),a=Math.PI*(1-Math.min(1,Math.max(0,frac)));
  orb.style.left=(W/2+R*Math.cos(a))+"px";orb.style.top=(34+58*(1-Math.sin(a)))+"px"}
 s.style.setProperty("--stars",night?1:Math.max(0,-e*3-0.2));
 hero.classList.toggle("is-night",night);hero.classList.toggle("is-dusk",!night&&e<0.12);
 const c=hero.querySelector(".skyclock");if(c)c.textContent=`${x("clock")} · ${clockF.format(new Date(t))}`;
}

/* ---------------- mur photo (côté invités) ---------------- */
const PH={list:[],open:false,all:false,busy:false};
const murOpen=()=>CONFIG.PHOTO_WALL!==false&&now()>=Date.parse(CONFIG.PHOTOS_AT||"2027-05-07T18:00:00+02:00")||(window.Live&&Live.test());
function author(){const r=typeof R!=="undefined"?R:null;return (window.Profile&&Profile.name)||store.get("nick","")||store.get("photoName","")||(r&&r.people&&r.people[0]&&r.people[0].name)||(r&&r.household)||""}
async function loadPhotos(){
 if(!window.Live||!murOpen())return;
 try{await Live.hold();const v=await Live.db.get("photos")||{};PH.list=Object.entries(v).filter(([k,p])=>p&&!p.hide&&p.th).map(([k,p])=>({k,...p})).sort((a,b)=>b.t-a.t)}catch(e){}finally{Live.release()}
 renderMur();
}
function renderMur(){
 const box=document.getElementById("murBox");if(!box)return;
 const sec=document.getElementById("mur");if(sec)sec.hidden=!murOpen();
 const img=window.ART?ART("img/jeu-photos.svg"):"img/jeu-photos.svg";
 if(!murOpen()){box.innerHTML=`<div class="gban mur lockd" style="--img:url(${img})"><div><span class="eyebrow">${x("murK")}</span><b>🔒 ${x("murLockT")(whenLabel(CONFIG.PHOTOS_AT))}</b><p>${x("murLockD")}</p></div></div>`;return}
 const L=PH.list,shown=PH.all?L:L.slice(0,9);
 box.innerHTML=`<div class="gban mur" style="--img:url(${img})"><div><span class="eyebrow">${x("murK")}</span><b>${x("murT")}</b><p>${x("murD")}</p>
  ${window.Profile&&Profile.id?`<small class="murwho">📸 ${esc(x("by")(Profile.name||"?"))}</small>`:""}
  <label class="btn btn-gold btn-sm" ${PH.busy?'aria-disabled="true"':""}>📸 <span id="murBtnT">${x("send")}</span><input type="file" accept="image/*" multiple id="murIn" hidden></label></div></div>
  ${L.length?`<div class="murgrid">${shown.map(p=>`<button type="button" data-ph="${p.k}" style="background-image:url(${p.th})" aria-label="${esc(x("by")(p.n||"?"))}"></button>`).join("")}</div>
  ${L.length>9?`<button type="button" class="btn btn-ghost btn-sm murmore" id="murMore">${PH.all?x("less"):x("all2")(L.length)}</button>`:""}`:`<p class="muted" style="text-align:center;margin:4px 0 0">${x("none")}</p>`}`;
}
async function upload(files){
 if(PH.busy||!files.length)return;PH.busy=true;let ok=0;const n=files.length,by=author();
 try{await Live.hold();
  for(let i=0;i<n;i++){const b=document.getElementById("murBtnT");if(b)b.textContent=x("sending")(i+1,n);
   try{const th=await shrinkImg(files[i],320,0.62,true),full=await shrinkImg(files[i],1400,0.74,false),k=Live.db.key();
    await Live.db.set("photosFull/"+k,full);await Live.db.set("photos/"+k,{t:Live.db.now(),n:by.slice(0,30),th,dev:Live.dev});ok++}catch(e){}}
 }finally{Live.release();PH.busy=false}
 toast(ok?x("sent")(ok):x("fail"));loadPhotos();
}
function lightbox(k){
 const p=PH.list.find(p=>p.k===k);if(!p)return;
 const el=document.createElement("div");el.className="lbx";el.innerHTML=`<figure><img src="${p.th}" alt=""><figcaption>${esc(x("by")(p.n||"?"))}</figcaption></figure>`;
 document.body.appendChild(el);el.addEventListener("click",()=>el.remove());
 (async()=>{try{await Live.hold();const f=await Live.db.get("photosFull/"+k);if(f)el.querySelector("img").src=f}catch(e){}finally{Live.release()}})();
}
document.addEventListener("change",async e=>{if(e.target.id==="murIn"&&e.target.files.length){const f=[...e.target.files];e.target.value="";
 if(window.Profile&&!Profile.id&&!(await Profile.need(x("profWhy"))))return;upload(f)}});
document.addEventListener("click",e=>{const t=e.target.closest("[data-ph]");if(t){lightbox(t.dataset.ph);return}
 if(e.target.closest("#murMore")){PH.all=!PH.all;renderMur()}});

/* ---------------- branchements ---------------- */
function init(){
 const acc=document.getElementById("accueil"),hist=document.getElementById("histoire");
 if(acc&&hist&&!document.getElementById("mur")){const s=document.createElement("section");s.id="mur";s.innerHTML=`<div class="wrap"><div id="murBox"></div></div>`;hist.before(s)}
 buildSky();paintSky();renderSecrets();renderMur();loadPhotos();
 if(/^#mur/.test(location.hash))setTimeout(()=>go(location.hash.slice(1)),50);
 setInterval(()=>{paintSky();owl()},60000);setTimeout(owl,1500);setInterval(()=>{if(!document.hidden&&document.querySelector("#accueil:not([hidden])"))loadPhotos()},90000);
 try{console.log("%c¡Hola, curioso! 👀  Un secret de plus : il n'y en a pas dans la console. Allez danser.","font:16px Georgia;color:#6b7a4b")}catch(e){}
}
if(window.Profile)Profile.on(()=>{renderSecrets();renderMur()});
window.Extras={refresh(){paintSky();renderSecrets();renderMur();loadPhotos()},fiesta,found,rsvpYes:()=>fiesta(x("yesT"),x("yesSub"))};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
