/* =====================================================================
   LIVE · temps réel des jeux du soir (Le grand écran, Les duels)
   - Firebase Realtime Database si soiree-config.js est rempli
   - sinon démo locale (localStorage + BroadcastChannel, entre onglets)
   Autonome : utilisé par index.html (manette, duels) et ecran.html.
   ===================================================================== */
(function(){
const FB_VER="10.12.2";
const S={get(k,d){try{const v=localStorage.getItem("av27_"+k);return v==null?d:JSON.parse(v)}catch(e){return d}},
         set(k,v){try{localStorage.setItem("av27_"+k,JSON.stringify(v))}catch(e){}}};
const dev=S.get("did",null)||(()=>{const v=Math.random().toString(36).slice(2,10)+Date.now().toString(36).slice(-4);S.set("did",v);return v})();
/* un identifiant par onglet : deux onglets du même navigateur jouent comme deux invités (utile pour tester) */
const tab=(()=>{try{let v=sessionStorage.getItem("av27_tab");if(!v){v=Math.random().toString(36).slice(2,6);sessionStorage.setItem("av27_tab",v)}return v}catch(e){return Math.random().toString(36).slice(2,6)}})();
const did=dev+"-"+tab;
const cfg=()=>window.SOIREE_CONFIG||{};

/* ---------------- Firebase ---------------- */
function loadScript(src){return new Promise((ok,ko)=>{const s=document.createElement("script");s.src=src;s.onload=ok;s.onerror=ko;document.head.appendChild(s)})}
function makeFirebase(conf){
 let db=null,offset=0,connected=false,ready=null;const connCbs=[];
 return{kind:"firebase",
  async open(){
   if(!ready)ready=(async()=>{
    if(!window.firebase||!firebase.database){
     await loadScript(`https://www.gstatic.com/firebasejs/${FB_VER}/firebase-app-compat.js`);
     await loadScript(`https://www.gstatic.com/firebasejs/${FB_VER}/firebase-database-compat.js`);}
    const app=firebase.apps.length?firebase.app():firebase.initializeApp(conf);
    db=firebase.database(app);
    db.ref(".info/serverTimeOffset").on("value",s=>{offset=s.val()||0});
    db.ref(".info/connected").on("value",s=>{connected=!!s.val();connCbs.forEach(f=>f(connected))});
   })();
   await ready;db.goOnline();
  },
  close(){if(db)db.goOffline()},
  now:()=>Date.now()+offset,
  key:()=>db.ref().push().key,
  set:(p,v)=>db.ref(p).set(v),
  update:(p,v)=>db.ref(p).update(v),
  remove:p=>db.ref(p).remove(),
  watch(p,cb){const r=db.ref(p),f=s=>cb(s.val());r.on("value",f);return()=>r.off("value",f)},
  async get(p){return(await db.ref(p).once("value")).val()},
  async tx(p,fn){const r=await db.ref(p).transaction(fn);return{committed:r.committed,value:r.snapshot.val()}},
  onDisc(p,v){const o=db.ref(p).onDisconnect();return v==null?o.remove():o.set(v)},
  cancelDisc(p){return db.ref(p).onDisconnect().cancel()},
  onConn(f){connCbs.push(f);f(connected)}
 };
}

/* ---------------- démo locale ---------------- */
function makeLocal(){
 const KEY="av27_livedb";let mem={},watchers=[],disc=[];
 const bc=("BroadcastChannel" in window)?new BroadcastChannel("av27_live"):null;
 const read=()=>{try{const v=localStorage.getItem(KEY);return v?JSON.parse(v):mem}catch(e){return mem}};
 const parts=p=>p.split("/").filter(Boolean);
 const getAt=(t,p)=>{let o=t;for(const k of parts(p)){if(o==null||typeof o!=="object")return null;o=o[k]}return o===undefined?null:o};
 function setAt(t,p,v){const ks=parts(p);let o=t;
  for(let i=0;i<ks.length-1;i++){if(o[ks[i]]==null||typeof o[ks[i]]!=="object")o[ks[i]]={};o=o[ks[i]]}
  const k=ks[ks.length-1];if(v==null)delete o[k];else o[k]=v;return t}
 function notify(){const t=read();watchers.forEach(w=>{const v=getAt(t,w.p),s=JSON.stringify(v);if(s!==w.last){w.last=s;try{w.cb(v==null?null:JSON.parse(s))}catch(e){console.error(e)}}})}
 function write(t){mem=t;try{localStorage.setItem(KEY,JSON.stringify(t))}catch(e){}notify();if(bc)bc.postMessage(1)}
 const apply=(p,v)=>write(setAt(read(),p,v==null?null:JSON.parse(JSON.stringify(v))));
 if(bc)bc.onmessage=notify;
 addEventListener("storage",e=>{if(e.key===KEY)notify()});
 const flush=()=>{const ops=disc;disc=[];ops.forEach(([p,v])=>apply(p,v))};
 addEventListener("pagehide",flush);
 return{kind:"local",
  open:async()=>{},close:flush,now:()=>Date.now(),
  key:()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7),
  set:async(p,v)=>apply(p,v),
  update:async(p,o)=>{let t=read();for(const k in o)t=setAt(t,p+"/"+k,o[k]==null?null:JSON.parse(JSON.stringify(o[k])));write(t)},
  remove:async p=>apply(p,null),
  get:async p=>getAt(read(),p),
  watch(p,cb){const w={p,cb,last:undefined};watchers.push(w);
   setTimeout(()=>{if(!watchers.includes(w))return;const v=getAt(read(),p);w.last=JSON.stringify(v);cb(v)},0);
   return()=>{watchers=watchers.filter(x=>x!==w)}},
  async tx(p,fn){const t=read(),cur=getAt(t,p),nv=fn(cur==null?null:JSON.parse(JSON.stringify(cur)));
   if(nv===undefined)return{committed:false,value:cur};write(setAt(t,p,nv));return{committed:true,value:nv}},
  onDisc(p,v){disc=disc.filter(d=>d[0]!==p);disc.push([p,v])},
  cancelDisc(p){disc=disc.filter(d=>d[0]!==p)},
  onConn(f){f(true)}
 };
}

/* ---------------- accès commun ---------------- */
let raw=null,opening=null,holds=0,closeT=null;
const Live={did,dev,S,
 test:()=>!!S.get("liveTest",false),
 setTest(v){S.set("liveTest",!!v)},
 root:()=>Live.test()?"test":"live",
 kind:()=>raw?raw.kind:(cfg().firebase&&cfg().firebase.databaseURL?"firebase":"local"),
 async connect(){
  if(!opening)opening=(async()=>{
   const conf=cfg().firebase;
   if(conf&&conf.databaseURL){try{const fb=makeFirebase(conf);await Promise.race([fb.open(),new Promise((_,ko)=>setTimeout(()=>ko(new Error("timeout")),9000))]);raw=fb}catch(e){console.warn("Firebase indisponible, démo locale",e);raw=makeLocal();Live.fallback=true}}
   else raw=makeLocal();
  })();
  await opening;await raw.open();return Live.db;
 },
 disconnect(){if(raw)raw.close()},
 /* connexion partagée : on se connecte tant que quelqu'un en a besoin, puis on libère la place */
 async hold(){holds++;clearTimeout(closeT);return Live.connect()},
 release(){holds=Math.max(0,holds-1);if(!holds){clearTimeout(closeT);closeT=setTimeout(()=>{if(!holds&&raw)raw.close()},4000)}},
 db:null
};
const R=p=>Live.root()+"/"+p;
Live.db={
 now:()=>raw.now(),key:()=>raw.key(),
 set:(p,v)=>raw.set(R(p),v),update:(p,v)=>raw.update(R(p),v),remove:p=>raw.remove(R(p)),get:p=>raw.get(R(p)),
 watch:(p,cb)=>raw.watch(R(p),cb),tx:(p,f)=>raw.tx(R(p),f),
 onDisc:(p,v)=>raw.onDisc(R(p),v),cancelDisc:p=>raw.cancelDisc(R(p)),onConn:f=>raw.onConn(f)
};

/* ---------------- visuels partagés ---------------- */
Live.HEADS={agathe:new Image(),valentin:new Image()};
Live.HEADS.agathe.src="img/head-agathe.png";Live.HEADS.valentin.src="img/head-valentin.png";
Live.TEAM={agathe:"Agathe",valentin:"Valentin"};
Live.C={sky1:"#f7d9a8",sky2:"#fbefdc",wall:"#faf6ee",ochre:"#e2a13c",red:"#9b2a22",deep:"#5a1712",ink:"#2a1d18",sand:"#e8b765",sand2:"#d99a3f",cal:"#faf6ee"};
Live.esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
Live.identity=()=>({n:S.get("nick",""),team:S.get("team",null)});
Live.setIdentity=(n,team)=>{S.set("nick",n);S.set("team",team)};
/* générateur pseudo-aléatoire déterministe (même tirage sur les deux téléphones) */
Live.rng=seed=>{let s=(seed>>>0)||1;return()=>{s^=s<<13;s>>>=0;s^=s>>17;s^=s<<5;s>>>=0;return s/4294967296}};

/* ---------------- textes ---------------- */
Live.T={
fr:{demo:"démo",test:"Mode test",testOff:"Quitter le mode test",testNote:"Mode test : ces parties sont séparées de celles du jour J.",
local:"Démo locale : ça marche entre deux onglets de ce navigateur. Ajoutez la configuration Firebase pour jouer à plusieurs téléphones.",
back:"Jeux",lockedTitle:"Pas encore…",locked:t=>`Ce jeu ouvre le ${t}.`,
who:"Pour jouer ce soir",nameQ:"Votre prénom",namePh:"Prénom ou surnom",nameLock:"Ce nom vous suivra tout le week-end.",pickTeam:"Votre camp",ok:"C'est parti",
bigTitle:"Le grand écran",bigSub:h=>`Regardez l'écran et dirigez ${h} tous ensemble. La majorité décide.`,
lead:(l,tr,g)=>`Team ${l} mène de ${g} points à la Carrera. Aidez ${tr} à se rattraper !`,tie:h=>`Égalité à la Carrera ! ${h} ouvre le bal.`,
credit:(s,m,c,tm)=>`${s} × ${m} = ${c} points pour Team ${tm}`,creditNote:"Seule la meilleure partie de chaque équipe compte.",
L:"Gauche",J:"Saut",R:"Droite",jumpHint:"↑ Saut : pour passer par-dessus les potelets",jumpNow:"↑ SAUTEZ !",
bigLobby:"Attendez le lancement sur l'écran…",bigCount:"Préparez-vous !",bigRun:"À vous ! Votez sans arrêt.",bigOver:"Partie terminée",
crowd:"La foule a choisi",inSync:n=>`En accord avec la foule : ${n} fois`,players:n=>`${n} téléphone${n>1?"s":""}`,score:"Score",lives:"Vies",
mvp:"Les plus synchro",joinAt:"Rejoignez la partie",pressStart:"Espace pour lancer",pressAgain:"Espace pour rejouer",bestNight:"Record de la soirée",
noScreen:"L'écran n'est pas encore allumé.",you:"vous",ouch:"Aïe !",start:"Lancer",tourBtn:"Tournoi",scrBtn:"Carte",phBtn:"Photos",phTitle:"Le mur photo",phSend:"Envoyez vos photos depuis le site",phCount:"photos partagées",phNone:"Pas encore de photo : à vous de jouer !",phNew:"Nouvelle photo",scrTitle:"La carte à gratter",scrCount:n=>`${n} carte${n>1?"s":""} grattée${n>1?"s":""}`,scrRule:"Une seule carte gagne : celle grattée au plus près de l'heure secrète.",scrRevealIn:s=>`Révélation dans ${s}`,scrRevealKey:"V pour révéler maintenant",scrSecretT:"L'heure secrète",scrWinnerT:"La carte gagnante",scrAt:(t,d)=>`grattée à ${t}, à ${d} près`,scrNext:"Juste derrière",scrNone:"Personne n'a gratté sa carte.",bigBtn:"Grand écran",
tourTitle:"Le tournoi des duels",tourSub:"Une défaite et c'est fini. Gagnez, et vous affrontez un autre gagnant… jusqu'à la grande finale. Chaque duel dure quelques secondes.",
join:"Je participe",unjoin:"Me désinscrire",joined:"Inscrit·e ! Le tournoi démarre sur l'écran.",regCount:n=>`${n} inscrit${n>1?"s":""}`,regOpen:"Inscriptions ouvertes",
closed:"Le tournoi a déjà commencé : suivez-le sur l'écran.",roundOf:(r,n)=>`Tour ${r} sur ${n}`,final:"Finale",
ready:"Je suis prêt·e",waitReady:"En attente de votre adversaire…",getReady:"C'est votre tour !",
qualified:r=>`Qualifié·e ! Rendez-vous au tour ${r}.`,bye:"Pas d'adversaire ce tour-ci : vous passez directement.",
out:r=>`Éliminé·e au tour ${r}. Merci d'avoir joué !`,pocket:"Vous pouvez ranger votre téléphone : il vibrera quand ce sera à vous.",
champ:"Champion·ne de la soirée !",photoQ:"Votre prix : une photo avec les mariés, qui deviendra le fond d'écran du site. Ne bougez pas, ils arrivent !",
photoBtn:"Prendre la photo",photoSent:"C'est en ligne : votre photo est en fond d'écran du site.",photoSending:"Envoi…",heroChamp:n=>`${n}, champion·ne des duels`,
startTour:"Espace pour lancer le tournoi",needTwo:"Il faut au moins 2 inscrits.",nextIn:s=>`Tour suivant dans ${s} s`,
duelsDone:(a,b)=>`${a} / ${b} duels terminés`,left:n=>`${n} encore en lice`,inProgress:"en cours",waitingP:"en attente",forfeitW:"forfait",
winsBy:(a,v)=>`Victoires · Team Agathe ${a} · Team Valentin ${v}`,resetQ:"R encore une fois pour effacer le tournoi",
vs:"contre",youPlay:s=>`Vous jouez ${s}`,round:i=>`Tour ${i}`,
g_altar:"Course à l'autel",g_cava:"Bataille de cava",g_ole:"¡Olé !",g_bouquet:"Le bouquet",g_chrono:"Pile à l'heure",g_bride:"Trouvez la mariée",g_final:"La grande finale",
h_altar:"Tapotez le plus vite possible pour arriver le premier à l'autel.",h_cava:"Maintenez pour verser. Relâchez au plus près du trait doré : la mousse monte encore un peu.",
h_ole:"Attendez le signal, puis touchez l'écran. Trop tôt, c'est perdu.",h_bouquet:"Le bouquet file de gauche à droite : touchez pour l'arrêter pile au centre.",
h_chrono:"Le chrono disparaît au bout de 2 secondes. Touchez à exactement 5,00 s.",h_bride:"Agathe se cache parmi les Valentin : touchez-la le plus vite possible. Erreur = +1,5 s.",
h_final:"Course à l'autel, version longue. Tapotez comme jamais : toute la salle regarde.",
tap:"Tapez !",hold:"Maintenez pour verser",wait:"Attendez…",ole:"¡OLÉ!",early:"Trop tôt !",tooSlow:"Trop lent…",overflow:"Ça déborde !",stop:"Stop !",
gap:d=>`à ${d} % du trait`,center:d=>`à ${d} % du centre`,off:ms=>`écart ${ms} ms`,react:ms=>`${ms} ms`,time:s=>`${s} s`,waitOther:"En attente de l'adversaire…",
roundWin:"Gagné !",roundLose:"Perdu"},
es:{demo:"demo",test:"Modo prueba",testOff:"Salir del modo prueba",testNote:"Modo prueba: estas partidas no cuentan para el gran día.",
local:"Demo local: funciona entre dos pestañas de este navegador. Añadid la configuración de Firebase para jugar con varios móviles.",
back:"Juegos",lockedTitle:"Todavía no…",locked:t=>`Este juego abre el ${t}.`,
who:"Para jugar esta noche",nameQ:"Tu nombre",namePh:"Nombre o mote",nameLock:"Este nombre te acompañará todo el fin de semana.",pickTeam:"Tu bando",ok:"¡Vamos!",
bigTitle:"La pantalla gigante",bigSub:h=>`Mirad la pantalla y dirigid a ${h} todos juntos. Decide la mayoría.`,
lead:(l,tr,g)=>`El Team ${l} gana por ${g} puntos en la Carrera. ¡Ayudad a ${tr} a remontar!`,tie:h=>`¡Empate en la Carrera! ${h} abre el baile.`,
credit:(s,m,c,tm)=>`${s} × ${m} = ${c} puntos para el Team ${tm}`,creditNote:"Solo cuenta la mejor partida de cada equipo.",
L:"Izquierda",J:"Salto",R:"Derecha",jumpHint:"↑ Salto: para pasar por encima de los bolardos",jumpNow:"↑ ¡SALTAD!",
bigLobby:"Esperad a que empiece en la pantalla…",bigCount:"¡Preparaos!",bigRun:"¡Ahora! Votad sin parar.",bigOver:"Fin de la partida",
crowd:"El público ha elegido",inSync:n=>`De acuerdo con el público: ${n} veces`,players:n=>`${n} móvil${n>1?"es":""}`,score:"Puntos",lives:"Vidas",
mvp:"Los más sincronizados",joinAt:"Uníos a la partida",pressStart:"Espacio para empezar",pressAgain:"Espacio para repetir",bestNight:"Récord de la noche",
noScreen:"La pantalla aún no está encendida.",you:"tú",ouch:"¡Ay!",start:"Empezar",tourBtn:"Torneo",scrBtn:"Rasca",phBtn:"Fotos",phTitle:"El muro de fotos",phSend:"Enviad vuestras fotos desde la web",phCount:"fotos compartidas",phNone:"Aún no hay fotos: ¡os toca!",phNew:"Foto nueva",scrTitle:"El rasca y gana",scrCount:n=>`${n} carta${n>1?"s":""} rascada${n>1?"s":""}`,scrRule:"Solo gana una carta: la que se rasque más cerca de la hora secreta.",scrRevealIn:s=>`Revelación en ${s}`,scrRevealKey:"V para revelar ahora",scrSecretT:"La hora secreta",scrWinnerT:"La carta ganadora",scrAt:(t,d)=>`rascada a las ${t}, a ${d}`,scrNext:"Justo detrás",scrNone:"Nadie ha rascado su carta.",bigBtn:"Pantalla",
tourTitle:"El torneo de duelos",tourSub:"Una derrota y se acabó. Si ganas, te enfrentas a otro ganador… hasta la gran final. Cada duelo dura unos segundos.",
join:"Participo",unjoin:"Darme de baja",joined:"¡Inscrito/a! El torneo empieza en la pantalla.",regCount:n=>`${n} inscrito${n>1?"s":""}`,regOpen:"Inscripciones abiertas",
closed:"El torneo ya ha empezado: seguidlo en la pantalla.",roundOf:(r,n)=>`Ronda ${r} de ${n}`,final:"Final",
ready:"Estoy listo/a",waitReady:"Esperando a tu rival…",getReady:"¡Te toca!",
qualified:r=>`¡Clasificado/a! Nos vemos en la ronda ${r}.`,bye:"Sin rival en esta ronda: pasas directamente.",
out:r=>`Eliminado/a en la ronda ${r}. ¡Gracias por jugar!`,pocket:"Puedes guardar el móvil: vibrará cuando te toque.",
champ:"¡Campeón/a de la noche!",photoQ:"Tu premio: una foto con los novios que será el fondo de la web. ¡No te muevas, ya vienen!",
photoBtn:"Hacer la foto",photoSent:"¡Hecho! Tu foto ya es el fondo de la web.",photoSending:"Enviando…",heroChamp:n=>`${n}, campeón/a de los duelos`,
startTour:"Espacio para empezar el torneo",needTwo:"Hacen falta al menos 2 inscritos.",nextIn:s=>`Siguiente ronda en ${s} s`,
duelsDone:(a,b)=>`${a} / ${b} duelos terminados`,left:n=>`${n} siguen en juego`,inProgress:"en juego",waitingP:"esperando",forfeitW:"abandono",
winsBy:(a,v)=>`Victorias · Team Agathe ${a} · Team Valentin ${v}`,resetQ:"R otra vez para borrar el torneo",
vs:"contra",youPlay:s=>`Juegas con ${s}`,round:i=>`Ronda ${i}`,
g_altar:"Carrera al altar",g_cava:"Batalla de cava",g_ole:"¡Olé!",g_bouquet:"El ramo",g_chrono:"Justo a tiempo",g_bride:"Encuentra a la novia",g_final:"La gran final",
h_altar:"Toca lo más rápido posible para llegar primero al altar.",h_cava:"Mantén para servir. Suelta lo más cerca posible de la línea dorada: la espuma aún sube un poco.",
h_ole:"Espera la señal y toca la pantalla. Si te adelantas, pierdes.",h_bouquet:"El ramo va de un lado a otro: toca para pararlo justo en el centro.",
h_chrono:"El cronómetro desaparece a los 2 segundos. Toca exactamente a los 5,00 s.",h_bride:"Agathe se esconde entre los Valentin: tócala lo antes posible. Fallo = +1,5 s.",
h_final:"Carrera al altar, versión larga. Toca como nunca: toda la sala mira.",
tap:"¡Toca!",hold:"Mantén para servir",wait:"Espera…",ole:"¡OLÉ!",early:"¡Demasiado pronto!",tooSlow:"Demasiado lento…",overflow:"¡Se desborda!",stop:"¡Para!",
gap:d=>`a ${d} % de la línea`,center:d=>`a ${d} % del centro`,off:ms=>`desfase ${ms} ms`,react:ms=>`${ms} ms`,time:s=>`${s} s`,waitOther:"Esperando al rival…",
roundWin:"¡Ganado!",roundLose:"Perdido"},
en:{demo:"demo",test:"Test mode",testOff:"Leave test mode",testNote:"Test mode: these games are kept apart from the big day.",
local:"Local demo: works between two tabs of this browser. Add the Firebase configuration to play across several phones.",
back:"Games",lockedTitle:"Not yet…",locked:t=>`This game opens on ${t}.`,
who:"To play tonight",nameQ:"Your name",namePh:"Name or nickname",nameLock:"This name stays with you all weekend.",pickTeam:"Your side",ok:"Let's go",
bigTitle:"The big screen",bigSub:h=>`Watch the screen and steer ${h} all together. The majority decides.`,
lead:(l,tr,g)=>`Team ${l} leads the Race by ${g} points. Help ${tr} catch up!`,tie:h=>`It's a tie in the Race! ${h} goes first.`,
credit:(s,m,c,tm)=>`${s} × ${m} = ${c} points for Team ${tm}`,creditNote:"Only each team's best game counts.",
L:"Left",J:"Jump",R:"Right",jumpHint:"↑ Jump: to clear the bollards",jumpNow:"↑ JUMP!",
bigLobby:"Waiting for the screen to start…",bigCount:"Get ready!",bigRun:"Go! Keep voting.",bigOver:"Game over",
crowd:"The crowd chose",inSync:n=>`In sync with the crowd: ${n} time${n>1?"s":""}`,players:n=>`${n} phone${n>1?"s":""}`,score:"Score",lives:"Lives",
mvp:"Most in sync",joinAt:"Join the game",pressStart:"Space to start",pressAgain:"Space to play again",bestNight:"Tonight's record",
noScreen:"The screen isn't on yet.",you:"you",ouch:"Ouch!",start:"Start",tourBtn:"Tournament",scrBtn:"Scratch",phBtn:"Photos",phTitle:"The photo wall",phSend:"Send your photos from the website",phCount:"photos shared",phNone:"No photos yet: your turn!",phNew:"New photo",scrTitle:"The scratch card",scrCount:n=>`${n} card${n>1?"s":""} scratched`,scrRule:"Only one card wins: the one scratched closest to the secret time.",scrRevealIn:s=>`Reveal in ${s}`,scrRevealKey:"V to reveal now",scrSecretT:"The secret time",scrWinnerT:"The winning card",scrAt:(t,d)=>`scratched at ${t}, ${d} away`,scrNext:"Close behind",scrNone:"Nobody scratched their card.",bigBtn:"Big screen",
tourTitle:"The duel tournament",tourSub:"Lose once and you're out. Win, and you face another winner… all the way to the grand final. Each duel lasts a few seconds.",
join:"I'm in",unjoin:"Withdraw",joined:"You're in! The tournament starts on the big screen.",regCount:n=>`${n} player${n>1?"s":""}`,regOpen:"Sign-up open",
closed:"The tournament has started: follow it on the big screen.",roundOf:(r,n)=>`Round ${r} of ${n}`,final:"Final",
ready:"I'm ready",waitReady:"Waiting for your opponent…",getReady:"You're up!",
qualified:r=>`Through! See you in round ${r}.`,bye:"No opponent this round: you go straight through.",
out:r=>`Knocked out in round ${r}. Thanks for playing!`,pocket:"You can put your phone away: it will buzz when it's your turn.",
champ:"Tonight's champion!",photoQ:"Your prize: a photo with the newlyweds that will become the site's background. Stay put, they're coming!",
photoBtn:"Take the photo",photoSent:"Done: your photo is now the site's background.",photoSending:"Sending…",heroChamp:n=>`${n}, duel champion`,
startTour:"Space to start the tournament",needTwo:"At least 2 players needed.",nextIn:s=>`Next round in ${s}s`,
duelsDone:(a,b)=>`${a} / ${b} duels done`,left:n=>`${n} still in`,inProgress:"playing",waitingP:"waiting",forfeitW:"forfeit",
winsBy:(a,v)=>`Wins · Team Agathe ${a} · Team Valentin ${v}`,resetQ:"Press R again to erase the tournament",
vs:"vs",youPlay:s=>`You're playing ${s}`,round:i=>`Round ${i}`,
g_altar:"Race to the altar",g_cava:"Cava battle",g_ole:"¡Olé!",g_bouquet:"The bouquet",g_chrono:"Right on time",g_bride:"Find the bride",g_final:"The grand final",
h_altar:"Tap as fast as you can to reach the altar first.",h_cava:"Hold to pour. Let go as close to the gold line as you can: the foam keeps rising a little.",
h_ole:"Wait for the signal, then tap the screen. Too early and you lose.",h_bouquet:"The bouquet swings left and right: tap to stop it dead centre.",
h_chrono:"The stopwatch disappears after 2 seconds. Tap at exactly 5.00 s.",h_bride:"Agathe is hiding among the Valentins: tap her as fast as you can. Wrong tap = +1.5 s.",
h_final:"Race to the altar, long version. Tap like never before: the whole room is watching.",
tap:"Tap!",hold:"Hold to pour",wait:"Wait…",ole:"¡OLÉ!",early:"Too early!",tooSlow:"Too slow…",overflow:"It's overflowing!",stop:"Stop!",
gap:d=>`${d}% off the line`,center:d=>`${d}% off centre`,off:ms=>`${ms} ms off`,react:ms=>`${ms} ms`,time:s=>`${s} s`,waitOther:"Waiting for your opponent…",
roundWin:"You win!",roundLose:"You lose"}
};
Live.lang=()=>{let l=null;try{l=typeof lang!=="undefined"?lang:null}catch(e){}return l||S.get("lang","fr")};
Live.t=k=>{const L=Live.T[Live.lang()]||Live.T.fr;return L[k]??Live.T.fr[k]};

/* tournoi : un jeu par tour, la finale quand il ne reste que deux joueurs */
Live.TOUR_GAMES=["altar","cava","ole","bouquet","chrono","bride"];
Live.gameFor=(r,alive)=>alive===2?"final":Live.TOUR_GAMES[Math.min(r,Live.TOUR_GAMES.length-1)];
/* carte à gratter : gagnant = carte grattée au plus près de l'heure secrète (égalité : la plus tôt) */
Live.scratchResult=d=>{
 const all=Object.entries((d&&d.s)||{}).map(([dev,x])=>({dev,n:x.n,t:x.t})).filter(x=>x.t);
 if(!d||!d.golden||!all.length)return{n:all.length,top:[]};
 const g=d.golden;all.sort((a,b)=>Math.abs(a.t-g)-Math.abs(b.t-g)||a.t-b.t);
 return{n:all.length,golden:g,winner:all[0],top:all.slice(0,3)};
};
Live.scratchRevealed=(d,nowMs,revealAt)=>!!(d&&d.golden&&nowMs>d.golden&&(d.reveal||nowMs>=revealAt));
window.Live=Live;
})();
