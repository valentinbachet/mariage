/* =====================================================================
   PLAYLIST · sur la base temps réel (comme les jeux)
   Une personne = un identifiant (pid) :
     - venu du lien personnel des e-mails (?g=…), le même sur tous ses appareils ;
     - sinon créé sur ce téléphone, et récupérable ailleurs avec « prénom + code à 4 chiffres ».
   Données : pl/songs/{id} · pl/votes/{pid}/{id} · pl/people/{pid} · pl/codes/{prénom-code}
   ===================================================================== */
(function(){
const HEARTS=5;
const P={pid:window.Profile?Profile.key():"",songs:{},votes:{},people:{},loaded:false,busy:false};
const skey=id=>String(id).replace(/[.#$\[\]\/]/g,"_").slice(0,140);

/* l'identité vient du profil (e-mail + code) : voir profile.js */
async function needProfile(){if(Profile.id){P.pid=Profile.key();return true}const ok=await Profile.need(tr("plNeedProfile"));if(ok){P.pid=Profile.key();await load()}return ok}
async function db(fn){if(!window.Live)return null;try{await Live.hold();return await fn(Live.db)}catch(e){console.warn(e);return null}finally{Live.release()}}

const mine=()=>P.pid&&P.people[P.pid]||null;
const myVotes=()=>Object.keys(P.pid&&P.votes[P.pid]||{});
const mySong=()=>{const m=mine();return m&&m.song||null};
const heartsUsed=()=>myVotes().filter(id=>id!==mySong()).length;

function compute(){
 const count={};for(const p in P.votes)for(const id in (P.votes[p]||{}))count[id]=(count[id]||0)+1;
 songs=Object.entries(P.songs).filter(([id,s])=>s&&!s.hide).map(([id,s])=>({id,title:s.title,artist:s.artist,by:s.by||"",votes:count[id]||0}));
}
async function load(){
 if(!window.Live)return;let d=null;
 try{await Live.hold();d=await Live.db.get("pl")}catch(e){clearTimeout(load.t);load.t=setTimeout(load,4000);render();return}finally{try{Live.release()}catch(_){}}
 P.songs=(d&&d.songs)||{};P.votes=(d&&d.votes)||{};P.people=(d&&d.people)||{};P.loaded=true;
 compute();
 if(plVisible())markSeen0();else{render();dot()}
}

let plSeen=store.get("plSeen",null),plNew=new Set();
const plVisible=()=>curSub==="playlist"&&$("#jeux").classList.contains("on")&&!document.hidden;
function markSeen0(){
 if(plSeen)songs.filter(x=>!plSeen.includes(x.id)&&x.id!==mySong()).forEach(x=>plNew.add(x.id));
 plSeen=songs.map(x=>x.id);store.set("plSeen",plSeen);render();dot();
}
function dot(){const n=plSeen?songs.filter(x=>!plSeen.includes(x.id)).length:0,b=document.querySelector('#seg [data-sub="playlist"]');
 if(b)b.innerHTML=`Playlist${n?`<span class="pdot">${n}</span>`:""}`}

function renderForm(){
 const ms=mySong(),me=mine(),s=ms&&songs.find(x=>x.id===ms),cl=plClosed();
 $("#plForm").hidden=!!ms||cl;const bn=$("#plBan");if(bn)bn.hidden=cl;
 $("#plMine").hidden=!ms;
 $("#plMine").innerHTML=ms?`<span class="lbl">${tr("plMine")}</span><b>${esc(s?s.title:"…")}</b>${s?`<small>${esc(s.artist)}</small>`:""}<p class="pllock">${tr("plLocked")}</p>
`:"";
 $("#plWho").innerHTML=Profile.id?`${tr("plAs")(`<b>${esc(Profile.name||"?")}</b>`)} <button type="button" class="linkbtn inl" data-prof>${tr("plNotYou")}</button>`:`<button type="button" class="linkbtn inl" data-prof>${tr("plLogin")}</button>`;
 if(cl){$("#plBudget").innerHTML=`<b>${tr("plClosed")}</b>`;return}
 const left=HEARTS-heartsUsed();
 $("#plBudget").innerHTML=`<span class="hearts">${"♥".repeat(Math.max(0,left))}<i>${"♥".repeat(Math.max(0,HEARTS-left))}</i></span> ${tr("plLeft")(Math.max(0,left),HEARTS)} ${CONFIG.PLAYLIST_CLOSE?tr("plCloseOn")(whenLabel(CONFIG.PLAYLIST_CLOSE)):""}
  ${Profile.id?"":`<button type="button" class="linkbtn" data-prof>${tr("plRestore")}</button>`}`;
}
function render(){
 renderForm();
 const list=[...songs].sort((a,b)=>b.votes-a.votes||String(a.title).localeCompare(b.title)),mv=myVotes(),ms=mySong();
 if(!list.length){$("#songs").innerHTML=`<li class="muted" style="padding:14px 0">${P.loaded?tr("plEmpty"):tr("plLoading")}</li>`;return}
 let h=plNew.size?`<li class="plnew">${tr("plNew")(plNew.size)}</li>`:"";
 const cl=plClosed();h+=`<li class="topline">${cl?tr("plFinal"):partyMode()?tr("plLive"):tr("plTop")}</li>`;
 (cl?list.slice(0,10):list).forEach((s,i)=>{const v=mv.includes(s.id),own=s.id===ms;
  h+=`<li class="song${i<10?" top":""}${plNew.has(s.id)?" isnew":""}"><span class="rk">${i+1}</span><span><b>${esc(s.title)}${plNew.has(s.id)?`<span class="ex nw">${tr("plNewTag")}</span>`:""}${own?`<span class="ex">${tr("plYours")}</span>`:""}</b><small>${esc(s.artist)}${s.by?` · ${esc(tr("plBy")(s.by))}`:""}</small></span>
   <button type="button" class="heart" data-vote="${esc(s.id)}" aria-pressed="${v}"${own||cl?" disabled":""}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg><span class="tabnum">${s.votes}</span></button></li>`;
  if(i===9&&list.length>10&&!cl)h+=`<li class="topline" style="opacity:.5">·</li>`});
 $("#songs").innerHTML=h;
}
async function vote(id,on){
 if(plClosed())return;if(!(await needProfile()))return;const pid=P.pid,mv=myVotes();
 if(on){if(mv.includes(id))return;if(heartsUsed()>=HEARTS){toast(tr("plNoHeart"));return}
  (P.votes[pid]=P.votes[pid]||{})[id]=true;compute();render();await db(x=>x.set(`pl/votes/${pid}/${id}`,true))}
 else{if(!mv.includes(id)||id===mySong())return;delete P.votes[pid][id];compute();render();await db(x=>x.remove(`pl/votes/${pid}/${id}`))}
}
async function propose(t,a){
 const pid=P.pid,n=Profile.name||"",id=skey(norm(t)+"|"+norm(a));
 const r=await db(async x=>{
  const ex=await x.get("pl/songs/"+id);
  if(!ex)await x.set("pl/songs/"+id,{title:t,artist:a,by:n,pid,t:x.now()});
  await x.set("pl/people/"+pid,{n,song:id,t:x.now()});await x.set(`pl/votes/${pid}/${id}`,true);
  return{dup:!!ex}});
 if(!r){toast("✗");return}
 toast(r.dup?tr("plDup"):tr("plAdded"));
 plSeen=[...(plSeen||[]),id];store.set("plSeen",plSeen);await load();
}

/* événements */
["plT","plA"].forEach(i=>$("#"+i).addEventListener("input",()=>{if($("#plForm").dataset.confirm){delete $("#plForm").dataset.confirm;$("#plBtn").textContent=tr("plAdd");$("#plBtn").classList.remove("confirm")}}));
$("#songs").addEventListener("click",e=>{const b=e.target.closest("[data-vote]");if(!b||b.disabled)return;vote(b.dataset.vote,b.getAttribute("aria-pressed")!=="true")});
document.addEventListener("click",e=>{if(e.target.closest("[data-prof]"))Profile.open()});
$("#plForm").addEventListener("submit",async e=>{e.preventDefault();
 if(mySong()||P.busy||plClosed())return;
 const t=$("#plT").value.trim(),a=$("#plA").value.trim();$("#plErr").textContent="";
 if(!t||!a){$("#plErr").textContent=tr("plNeed");return}
 if(!(await needProfile()))return;if(mySong())return;
 const key=t+"|"+a+"|"+P.pid;if($("#plForm").dataset.confirm!==key){$("#plForm").dataset.confirm=key;$("#plBtn").textContent=tr("plConfirm")(t);$("#plBtn").classList.add("confirm");return}
 delete $("#plForm").dataset.confirm;$("#plBtn").classList.remove("confirm");$("#plBtn").textContent=tr("plAdd");
 P.busy=true;try{await propose(t,a);$("#plT").value="";$("#plA").value=""}finally{P.busy=false}
});

window.PL={load,render,dot,markSeen:markSeen0};
Profile.on(()=>{P.pid=Profile.key();load()});
load();setInterval(()=>{if(!document.hidden&&plVisible())load()},30000);
})();
