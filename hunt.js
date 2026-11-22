/* =====================================================================
   JEU DE PISTE · 8 lieux de Séville, une photo-défi par lieu
   Dépend de : CONFIG, api, store, did, tr, pick, esc, toast, confetti, now, gmap, $
   ===================================================================== */
(function(){
const L3=(fr,es,en)=>({fr,es,en});
const SPOTS=[
 {id:"plaza",name:"Plaza de España",map:"Plaza de España Sevilla",
  task:L3("Faites exactement la même photo que les futurs mariés sur la Plaza de España : même cadrage, même pose, mêmes sourires.","Haced exactamente la misma foto que los futuros novios en la Plaza de España: mismo encuadre, misma pose, mismas sonrisas.","Recreate the future newlyweds' photo at the Plaza de España exactly: same framing, same pose, same smiles.")},
 {id:"giralda",name:"La Giralda",map:"La Giralda Sevilla",
  task:L3("Faites tenir la Giralda dans votre main. La perspective est autorisée.","Haced que la Giralda quepa en vuestra mano. Se vale el truco de perspectiva.","Hold the Giralda in your hand. Perspective tricks allowed.")},
 {id:"alcazar",name:"Real Alcázar",map:"Real Alcázar de Sevilla",
  task:L3("Un selfie sous les arcs du palais ou dans ses jardins.","Un selfie bajo los arcos del palacio o en sus jardines.","A selfie under the palace arches or in its gardens.")},
 {id:"torre",name:"Torre del Oro",map:"Torre del Oro Sevilla",
  task:L3("Faites semblant de soulever la tour.","Fingid que levantáis la torre.","Pretend to lift the tower.")},
 {id:"setas",name:"Las Setas",map:"Metropol Parasol Sevilla",
  task:L3("Sous les champignons géants, ou tout là-haut sur la passerelle.","Bajo las setas gigantes, o arriba en la pasarela.","Under the giant mushrooms, or up on the walkway.")},
 {id:"triana",name:"Puente de Triana",map:"Puente de Triana Sevilla",
  task:L3("Le pont, le fleuve, et votre plus belle pose de carte postale.","El puente, el río y vuestra mejor pose de postal.","The bridge, the river and your best postcard pose.")},
 {id:"maestranza",name:"La Maestranza",map:"Plaza de Toros de la Maestranza Sevilla",
  task:L3("Recréez la photo des mariés. Lunettes de soleil recommandées.","Recread la foto de los novios. Gafas de sol recomendadas.","Recreate the newlyweds' photo. Sunglasses recommended.")},
 {id:"santacruz",name:"Barrio de Santa Cruz",map:"Barrio de Santa Cruz Sevilla",
  task:L3("Trouvez la ruelle la plus étroite et tenez-y à deux.","Encontrad el callejón más estrecho y meteos dos.","Find the narrowest alley and squeeze in two of you.")}
];
const T={
 fr:{intro:n=>`Huit lieux emblématiques, huit photos-défis. Vos photos sont envoyées aux mariés, et avec ${n} lieux validés vous gagnez le cocktail spécial du samedi soir.`,
  locked:"En attendant, repérez les lieux.",openT:w=>`Le jeu de piste ouvre le ${w}`,who:"Vos prénoms, pour l'album",whoPh:"Ex. Julie & Thomas",shoot:"Prendre la photo",redo:"Changer",sending:"Envoi…",sent:"Dans l'album",saved:"Photo enregistrée",fail:"L'envoi a échoué. Réessayez avec un peu de réseau.",
  left:n=>`Plus que ${n} lieu${n>1?"x":""} pour gagner le cocktail des mariés.`,count:(a,b)=>`${a}/${b} lieux`,
  winK:"Gagné",winT:"Votre cocktail vous attend",winD:"Samedi 8 mai, à l'apéritif du Mercado del Barranco : montrez cet écran au bar pour recevoir le cocktail spécial des mariés.",
  hold:"Réservé au bar : maintenir pour valider",served:"Cocktail servi. ¡Salud!",needName:"Indiquez vos prénoms avant la photo.",teaser:"Jeu de piste",teaserD:(a,b)=>`${a}/${b} photos · un cocktail à gagner`,visado:"VISADO"},
 es:{intro:n=>`Ocho lugares emblemáticos, ocho fotos-reto. Vuestras fotos les llegan a los novios, y con ${n} lugares conseguidos ganáis el cóctel especial del sábado por la noche.`,
  locked:"Mientras tanto, localizad los lugares.",openT:w=>`La gincana abre el ${w}`,who:"Vuestros nombres, para el álbum",whoPh:"Ej. Lucía y Pablo",shoot:"Hacer la foto",redo:"Cambiar",sending:"Enviando…",sent:"En el álbum",saved:"Foto guardada",fail:"No se ha podido enviar. Inténtalo con algo de cobertura.",
  left:n=>`Te falta${n>1?"n":""} ${n} lugar${n>1?"es":""} para ganar el cóctel de los novios.`,count:(a,b)=>`${a}/${b} lugares`,
  winK:"Premio",winT:"Tu cóctel te espera",winD:"Sábado 8 de mayo, en el aperitivo del Mercado del Barranco: enseña esta pantalla en la barra para recibir el cóctel especial de los novios.",
  hold:"Solo para la barra: mantener pulsado para validar",served:"Cóctel servido. ¡Salud!",needName:"Escribe vuestros nombres antes de la foto.",teaser:"Gincana",teaserD:(a,b)=>`${a}/${b} fotos · un cóctel de premio`,visado:"VISADO"},
 en:{intro:n=>`Eight landmarks, eight photo dares. Your photos go straight to the newlyweds, and with ${n} places done you win the special cocktail on Saturday night.`,
  locked:"Until then, scout the places.",openT:w=>`The photo trail opens on ${w}`,who:"Your names, for the album",whoPh:"E.g. Julia & Tom",shoot:"Take the photo",redo:"Change",sending:"Sending…",sent:"In the album",saved:"Photo saved",fail:"Upload failed. Try again with some signal.",
  left:n=>`${n} more place${n>1?"s":""} to win the newlyweds' cocktail.`,count:(a,b)=>`${a}/${b} places`,
  winK:"You won",winT:"Your cocktail is waiting",winD:"Saturday 8 May, at the Mercado del Barranco aperitif: show this screen at the bar to get the newlyweds' special cocktail.",
  hold:"Bar staff only: press and hold to validate",served:"Cocktail served. ¡Salud!",needName:"Enter your names before the photo.",teaser:"Photo trail",teaserD:(a,b)=>`${a}/${b} photos · win a cocktail`,visado:"VISADO"}
};
const t=k=>(T[lang]||T.fr)[k];
let done=store.get("hunt",{}); // id -> {thumb, sent}
let name=store.get("huntName","")||store.get("nick","");
let served=store.get("huntServed",false);
const need=()=>CONFIG.HUNT_REQUIRED||6;
const count=()=>SPOTS.filter(s=>done[s.id]).length;
const open=()=>now()>=Date.parse(CONFIG.HUNT_FROM);

function render(){
 const el=$("#piste");if(!el)return;
 const c=count(),n=need(),win=c>=n,o=open();
 let h=`<div class="gban" style="--img:url(${window.ART?ART("img/jeu-piste.svg"):"img/jeu-piste.svg"})"><p>${t("intro")(n)}</p></div>
  <div class="stamps" aria-label="${t("count")(c,SPOTS.length)}">${SPOTS.map((s,i)=>`<span class="${done[s.id]?"on":""}">${i+1}</span>`).join("")}</div>
  <div class="hunt-progress">${t("count")(c,SPOTS.length)}${win?"":` · ${t("left")(n-c)}`}</div>`;
 if(win)h+=`<div class="voucher${served?" used":""}"><div class="k">${t("winK")} · AV-${did.slice(-4).toUpperCase()}</div><div class="t">${t("winT")}</div><p>${t("winD")}</p>
  ${served?`<div class="served">${t("served")}</div>`:`<button type="button" class="holdbtn" id="holdBtn"><i></i><span>${t("hold")}</span></button>`}</div>`;
 if(!o)h+=lockBox(t("openT")(whenLabel(CONFIG.HUNT_FROM)),t("locked"));
 else h+=`<div class="field hunt-name"><label for="huntName">${t("who")}</label><input id="huntName" maxlength="40" value="${esc(name)}" placeholder="${t("whoPh")}"></div>`;
 h+=`<ol class="spots">${SPOTS.map((s,i)=>{const d=done[s.id];
  return `<li class="spot${d?" got":""}">
   <div class="spot-ph">${d&&d.thumb?`<img src="${d.thumb}" alt="">`:`<span>${i+1}</span>`}${d?`<b class="visado">${t("visado")}</b>`:""}</div>
   <div class="spot-body"><h3>${esc(s.name)}</h3><p>${esc(pick(s.task))}</p>${s.ref?`<img class="spot-ref" src="${s.ref}" alt="" loading="lazy">`:""}
    <div class="row"><a class="btn btn-ghost btn-sm" href="${gmap(s.map)}" target="_blank" rel="noopener">${tr("map")}</a>
    ${o?`<label class="btn ${d?"btn-ghost":"btn-primary"} btn-sm filebtn">${d?t("redo"):t("shoot")}<input type="file" accept="image/*" capture="environment" data-spot="${s.id}" hidden></label>`:""}
    ${d?`<span class="gsmall">${d.sent?t("sent"):(api.on()?t("sending"):t("saved"))}</span>`:""}</div></div></li>`}).join("")}</ol>`;
 el.innerHTML=h;
 renderTeaser();
}
function renderTeaser(){
 const tz=$("#huntTeaser");if(!tz)return;
 tz.innerHTML=`<a class="teaser" href="#piste"><div class="stamps mini">${SPOTS.map(s=>`<span class="${done[s.id]?"on":""}"></span>`).join("")}</div><div><b>${t("teaser")}</b><small>${t("teaserD")(count(),SPOTS.length)}</small></div><span aria-hidden="true">→</span></a>`;
}

/* ---------- photo : compression puis envoi ---------- */
async function shrink(file,max,q){
 let src;
 try{src=await createImageBitmap(file,{imageOrientation:"from-image"})}catch(e){
  src=await new Promise((res,rej)=>{const im=new Image();im.onload=()=>res(im);im.onerror=rej;im.src=URL.createObjectURL(file)})}
 const w=src.width,h=src.height,s=Math.min(1,max/Math.max(w,h));
 const c=document.createElement("canvas");c.width=Math.round(w*s);c.height=Math.round(h*s);
 c.getContext("2d").drawImage(src,0,0,c.width,c.height);
 return c.toDataURL("image/jpeg",q);
}
async function onPhoto(input){
 const id=input.dataset.spot,file=input.files&&input.files[0];if(!file)return;
 if(!name.trim()){toast(t("needName"));$("#huntName")&&$("#huntName").focus();input.value="";return}
 const before=count();
 try{
  const thumb=await shrink(file,360,0.7);
  done[id]={thumb,sent:false};
  try{store.set("hunt",done)}catch(e){done[id].thumb="";store.set("hunt",done)}
  render();
  if(count()>=need()&&before<need())confetti();else toast(t("saved"));
  if(api.on()){
   const full=await shrink(file,1600,0.82);
   await api.post({type:"photo",device:did,name:name.trim(),spot:id,spotName:SPOTS.find(s=>s.id===id).name,image:full});
   done[id].sent=true;store.set("hunt",done);render();
  }
 }catch(e){toast(t("fail"))}
 input.value="";
}

/* ---------- validation au bar (appui long) ---------- */
let holdT=null;
function holdStart(b){b.classList.add("holding");holdT=setTimeout(()=>{served=true;store.set("huntServed",true);
 if(api.on())api.post({type:"redeem",device:did,name:name.trim()||"?"}).catch(()=>{});render();toast("¡Salud!")},1500)}
function holdEnd(b){clearTimeout(holdT);b&&b.classList.remove("holding")}

const H={};
H.init=function(){
 const el=$("#piste");
 el.addEventListener("change",e=>{if(e.target.matches("input[type=file][data-spot]"))onPhoto(e.target)});
 el.addEventListener("input",e=>{if(e.target.id==="huntName"){name=e.target.value;store.set("huntName",name)}});
 el.addEventListener("pointerdown",e=>{const b=e.target.closest("#holdBtn");if(b){e.preventDefault();holdStart(b)}});
 ["pointerup","pointerleave","pointercancel"].forEach(ev=>el.addEventListener(ev,e=>{const b=e.target.closest&&e.target.closest("#holdBtn");if(b||holdT)holdEnd(b||$("#holdBtn"))}));
 el.addEventListener("contextmenu",e=>{if(e.target.closest("#holdBtn"))e.preventDefault()});
 render();
};
H.refresh=render;
window.Hunt=H;
H.init();
})();
