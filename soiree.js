/* =====================================================================
   SOIRÉE · écrans de l'appli pour les jeux du soir
   - Le grand écran : la manette (← SAUT →), votes envoyés à ecran.html
   - Le tournoi des duels : inscription, duels éclair, élimination directe
     (l'écran ecran.html fait l'arbitre et tire les duels au sort)
   Dépend de : Live (live.js), CONFIG, now, hm, go, toast, confetti, pick, $
   ===================================================================== */
(function(){
const t=k=>Live.t(k),S=Live.S,me=Live.did,esc=Live.esc;
const box=()=>document.getElementById("sv");
let game=S.get("svGame","big"),entered=null,db=null,active=false,unsubs=[],timers=[];
const later=(f,ms)=>{const id=setTimeout(f,ms);timers.push(id);return id};
const every=(f,ms)=>{const id=setInterval(f,ms);timers.push(id);return id};
function clean(){unsubs.forEach(f=>{try{f()}catch(e){}});unsubs=[];timers.forEach(id=>{clearTimeout(id);clearInterval(id)});timers=[]}
const gameCfg=id=>CONFIG.EVENING_GAMES.find(g=>g.id===id)||{};
const unlocked=id=>Live.test()||!gameCfg(id).at||now()>=Date.parse(gameCfg(id).at);
const vib=p=>{try{navigator.vibrate&&navigator.vibrate(p)}catch(e){}};
const head=s=>`img/head-${s==="agathe"?"agathe":"valentin"}.png`;
const num=(v,d)=>v.toLocaleString(lang,{minimumFractionDigits:d,maximumFractionDigits:d});

/* ---------------- cadre commun ---------------- */
function frame(inner){
 const badges=[Live.test()?`<span class="sv-badge">${t("test")}</span><button type="button" class="x" data-sv="testoff">${t("testOff")}</button>`:"",
  Live.kind()==="local"?`<span class="sv-badge ghost">${t("demo")}</span>`:""].join(" ");
 return `<div class="sv-top"><a href="#course" class="sv-back">← ${t("back")}</a><span class="sv-badges">${badges}</span></div>${inner}
  ${Live.kind()==="local"&&db?`<p class="demo-note">${t("local")}</p>`:""}${Live.test()?`<p class="hint" style="margin-top:12px">${t("testNote")}</p>`:""}`;
}
function render(inner){const b=box();if(b)b.innerHTML=frame(inner)}
function lockedView(){
 const g=gameCfg(game);
 render(`<div class="sv-head"><span class="eyebrow">${esc(pick(g.title))}</span></div>${lockBox(t("locked")(gameWhen(g.at)),"")}`);
}
/* nom et camp : demandés une seule fois, puis figés (partagés avec la Carrera) */
function identityView(){
 const id=Live.identity(),lockedName=!!id.n,guess=id.n||(typeof R!=="undefined"&&R.people&&R.people[0]&&R.people[0].name)||"";
 let team=id.team;
 const draw=v=>{render(`<div class="sv-head"><span class="eyebrow">${esc(pick(gameCfg(game).title))}</span><h2 class="sv-title">${t("who")}</h2></div>
  <div class="field"><label for="svNick">${t("nameQ")}</label><input id="svNick" maxlength="20" value="${esc(v)}" placeholder="${t("namePh")}" autocomplete="nickname"${lockedName?" readonly":""}><span class="hint">${t("nameLock")}</span></div>
  ${id.team?"":`<span class="lbl">${t("pickTeam")}</span>
  <div class="pick" style="margin:8px 0 16px">${["agathe","valentin"].map(s=>`<button type="button" data-team="${s}" aria-pressed="${team===s}"><img src="${head(s)}" alt=""><b>Team ${Live.TEAM[s]}</b></button>`).join("")}</div>`}
  <button type="button" class="btn btn-gold" data-sv="idok">${t("ok")}</button><div class="err" id="svErr"></div>`)};
 draw(guess);
 box().onclick=e=>{const b=e.target.closest("button");if(!b)return;
  if(b.dataset.team){team=b.dataset.team;draw($("#svNick").value);return}
  if(b.dataset.sv==="idok"){const n=$("#svNick").value.trim();if(!n){$("#svNick").focus();return}if(!team){$("#svErr").textContent=t("pickTeam");return}
   Live.setIdentity(lockedName?id.n:n.slice(0,20),team);box().onclick=null;Soiree.enter(true)}};
}

/* =====================================================================
   LE GRAND ÉCRAN · manette
   ===================================================================== */
const ARROW={L:"←",J:"↑",R:"→"};
const Big={
 seq:Date.now(),last:0,press:null,sync:0,st:null,actN:-1,
 start(){
  const id=Live.identity();this.sync=S.get("bigSync",0);
  db.set("big/players/"+me,{n:id.n,team:id.team,t:db.now()});db.onDisc("big/players/"+me,null);
  this.view();
  unsubs.push(db.watch("big/state",st=>this.onState(st)));
  every(()=>this.onState(this.st),4000);
 },
 stop(){if(db)db.remove("big/players/"+me)},
 view(){
  render(`<div class="sv-head"><span class="eyebrow">${t("bigTitle")}</span><h2 class="sv-title" id="bgTitle">…</h2><p class="muted" id="bgSub"></p></div>
   <div class="sv-stats"><div><small>${t("score")}</small><b id="bgScore">0</b></div><div><small>${t("lives")}</small><b id="bgLives">♥♥♥</b></div><div><small>&nbsp;</small><b id="bgPl">0</b></div></div>
   <div class="sv-tally" id="bgTally"></div>
   <div class="pad" id="pad">${["L","J","R"].map(a=>`<button type="button" data-a="${a}"><b>${ARROW[a]}</b><span>${t(a)}</span></button>`).join("")}</div>
   <p class="hint" style="text-align:center;margin:10px 0 0">${t("jumpHint")}</p>
   <p class="sv-sync" id="bgSync"></p><div id="bgOver"></div>`);
  const pad=$("#pad");
  pad.addEventListener("pointerdown",e=>{const b=e.target.closest("[data-a]");if(!b)return;e.preventDefault();this.vote(b.dataset.a,b)});
  pad.addEventListener("contextmenu",e=>e.preventDefault());
  this.onState(this.st);
 },
 vote(a,btn){
  const n=performance.now();if(n-this.last<140)return;this.last=n;
  this.press={a,t:n};vib(12);
  if(btn){btn.classList.add("hit");setTimeout(()=>btn.classList.remove("hit"),140)}
  db.set("big/votes/"+me,{a,s:++this.seq,t:db.now()});
 },
 onState(st){
  this.st=st;if(!$("#bgTitle"))return;
  const off=!st||st.ph==="off"||(db&&db.now()-(st.t||0)>20000),ph=off?"off":st.ph,h=Live.TEAM[(st&&st.hero)||"valentin"];
  $("#bgTitle").textContent=off?t("noScreen"):ph==="lobby"?t("bigLobby"):ph==="count"?t("bigCount"):ph==="run"?t("bigRun"):t("bigOver");
  $("#bgSub").innerHTML=st&&st.lead?`<b>${esc(st.lead)}</b><br>${t("bigSub")(h)}`:t("bigSub")(h);
  $("#pad").classList.toggle("dim",ph!=="run");
  if(!st)return;
  $("#bgScore").textContent=(st.score||0).toLocaleString(lang);
  $("#bgLives").textContent="♥".repeat(Math.max(0,st.lives||0))+"♡".repeat(Math.max(0,3-(st.lives||0)));
  $("#bgPl").textContent=t("players")(st.players||0);
  const c=st.tally||{L:0,J:0,R:0},tot=Math.max(1,(c.L||0)+(c.J||0)+(c.R||0));
  $("#bgTally").innerHTML=["L","J","R"].map(k=>`<div class="trow${st.act===k?" win":""}"><span>${ARROW[k]}</span><div class="bar"><i style="width:${((c[k]||0)/tot*100).toFixed(0)}%"></i></div><b class="tabnum">${c[k]||0}</b></div>`).join("");
  if(st.actN!==this.actN){
   const fresh=this.actN>=0;this.actN=st.actN;
   if(fresh&&ph==="run"&&st.act&&this.press&&performance.now()-this.press.t<1300&&this.press.a===st.act){this.sync++;S.set("bigSync",this.sync);
    const b=$(`#pad [data-a="${st.act}"]`);if(b){b.classList.add("ok");setTimeout(()=>b.classList.remove("ok"),300)}}
  }
  $("#bgSync").textContent=st.act&&ph==="run"?`${t("crowd")} : ${ARROW[st.act]} ${t(st.act)} · ${t("inSync")(this.sync)}`:(this.sync?t("inSync")(this.sync):"");
  const ov=$("#bgOver");
  if(ph==="over"){const myName=Live.identity().n,cr=st.credit;
   ov.innerHTML=(cr?`<p class="already" style="text-align:center">${t("credit")(cr.s.toLocaleString(lang),Math.round(cr.c/Math.max(1,cr.s)),cr.c.toLocaleString(lang),Live.TEAM[cr.team])}<br><small>${t("creditNote")}</small></p>`:"")+
    (st.mvp&&st.mvp.length?`<div class="topline">${t("mvp")}</div><ol class="lb">${st.mvp.map((m,i)=>`<li class="${m.team||""}"><span class="rk">${i+1}</span><span class="nm">${esc(m.n)}${m.n===myName?` <small>(${t("you")})</small>`:""}<small>Team ${Live.TEAM[m.team]||"?"}</small></span><b class="tabnum">${m.h}</b></li>`).join("")}</ol>`:"");
   if(!this.cel&&st.mvp&&st.mvp.some(m=>m.n===myName)){this.cel=1;confetti()}
  }else{ov.innerHTML="";this.cel=0}
 }
};
addEventListener("keydown",e=>{if(!active||game!=="big"||!db)return;const a={ArrowLeft:"L",ArrowUp:"J",ArrowRight:"R"}[e.key];if(a&&!e.repeat){e.preventDefault();Big.vote(a,$(`#pad [data-a="${a}"]`))}});

/* =====================================================================
   LE TOURNOI DES DUELS · côté invité
   ===================================================================== */
const LIMIT={altar:15000,final:25000,cava:500,ole:5000,bouquet:100,chrono:9999,bride:12000};
function fmtVal(g,v){
 if(v==null)return"";
 if(g==="altar"||g==="final")return v>=LIMIT[g]?t("tooSlow"):t("time")(num(v/1000,2));
 if(g==="cava")return v>=500?t("overflow"):t("gap")(num(v,1));
 if(g==="ole")return v>=9000?t("early"):v>=5000?t("tooSlow"):t("react")(Math.round(v));
 if(g==="bouquet")return t("center")(Math.round(v));
 if(g==="chrono")return v>=9999?t("tooSlow"):t("off")(Math.round(v));
 return v>=12000?t("tooSlow"):t("time")(num(v/1000,2));
}
const Tour={
 st:null,mine:null,mid:null,m:null,offM:null,busy:false,started:{},seen:{},play:null,
 start(){
  this.busy=false;this.play=null;this.mid=null;this.m=null;
  render(`<p class="muted" style="text-align:center;margin-top:40px">…</p>`);
  unsubs.push(db.watch("tour/state",v=>{this.st=v;this.render()}));
  unsubs.push(db.watch("tour/p/"+me,v=>{this.mine=v;this.render()}));
  unsubs.push(db.watch("tour/me/"+me,id=>{
   if(id===this.mid)return;this.mid=id;this.m=null;if(this.offM)this.offM();this.offM=null;
   if(id){this.offM=db.watch("tour/m/"+id,m=>this.onM(m));unsubs.push(this.offM)}
   this.render()}));
 },
 role(){return this.m&&this.m.a&&this.m.a.did===me?"a":"b"},
 cur(){const m=this.m,st=this.st;return m&&st&&st.ph==="run"&&m.r===st.round?m:null},
 onM(m){
  this.m=m;const c=this.cur();if(!c)return this.render();
  const me_=this.role(),op=me_==="a"?"b":"a";
  if(this.play&&this.play.onOpp)this.play.onOpp(c["p"+op]);
  if(c.go&&c["v"+me_]==null&&!c.w&&!this.started[this.mid]){this.started[this.mid]=1;this.countdown(c);return}
  this.render();
 },
 header(c){
  const r=this.role(),mine=c[r],them=c[r==="a"?"b":"a"],st=this.st;
  const p=(x,isMe)=>`<div class="dh-p${isMe?" me":""}"><img src="${head(x.side)}" alt=""><b>${esc(x.n)}</b><small>Team ${Live.TEAM[x.side]}</small></div>`;
  return `<div class="sv-head" style="margin-bottom:10px"><span class="eyebrow">${c.g==="final"?t("final"):t("roundOf")(st.round+1,st.total)} · ${t("g_"+c.g)}</span></div>
   <div class="dh">${p(mine,true)}<span class="amp">${t("vs")}</span>${p(them,false)}</div>`;
 },
 render(){
  if(this.busy||!active||game!=="duel")return;
  const st=this.st||{ph:"reg"},mine=this.mine,c=this.cur();
  const intro=`<div class="sv-head"><span class="eyebrow">${t("tourTitle")}</span>`;
  if(st.ph==="reg"){
   if(mine)return render(`${intro}<h2 class="sv-title">${t("joined")}</h2><p class="muted">${t("pocket")}</p></div>
    <div class="sv-wait"><img src="${head("agathe")}" alt=""><span class="amp">&amp;</span><img src="${head("valentin")}" alt=""></div>
    <button type="button" class="btn btn-ghost sv-wide" data-sv="unjoin">${t("unjoin")}</button>`);
   return render(`${intro}<h2 class="sv-title">Agathe <span class="amp">&amp;</span> Valentin</h2><p class="muted">${t("tourSub")}</p></div>
    <button type="button" class="btn btn-gold sv-wide" data-sv="join">${t("join")}</button>`);
  }
  if(st.ph==="done"){
   if(st.champ===me)return this.champView();
   return render(`${intro}<h2 class="sv-title">${t("champ")}</h2></div><div class="dend won"><img src="${head(st.champTeam)}" alt=""><h2 class="sv-title">${esc(st.champN||"?")}</h2>
    ${mine&&mine.out?`<p class="muted">${t("out")(mine.out)}</p>`:""}</div>`);
  }
  if(!mine)return render(`${intro}<h2 class="sv-title">${t("closed")}</h2></div>`);
  if(c){
   const r=this.role(),op=r==="a"?"b":"a";
   if(!this.seen[this.mid]){this.seen[this.mid]=1;vib([220,120,220]);toast(t("getReady"))}
   let body;
   if(c.w){const won=c.w===r;
    body=`<div class="dres ${won?"won":"lost"}"><h3>${won?t("roundWin"):t("roundLose")}</h3>
     <div class="dvals"><div><small>${esc(c[r].n)}</small><b>${c["v"+r]!=null?fmtVal(c.g,c["v"+r]):"–"}</b></div><div><small>${esc(c[op].n)}</small><b>${c["v"+op]!=null?fmtVal(c.g,c["v"+op]):t("forfeitW")}</b></div></div>
     <p class="muted" style="margin:0">${won?(c.g==="final"?t("champ"):t("qualified")(st.round+2)+" "+t("pocket")):t("out")(st.round+1)}</p></div>`;
    if(won&&!this.seen["w"+this.mid]){this.seen["w"+this.mid]=1;confetti()}}
   else if(c["v"+r]!=null)body=`<div class="dintro"><h3>${fmtVal(c.g,c["v"+r])}</h3><p class="muted">${t("waitOther")}</p></div>`;
   else if(!c["r"+r])body=`<div class="dintro"><h3>${t("g_"+c.g)}</h3><p class="muted">${t("h_"+c.g)}</p><button type="button" class="btn btn-gold" data-sv="ready">${t("ready")}</button></div>`;
   else body=`<div class="dintro"><h3>${t("g_"+c.g)}</h3><p class="muted">${t("h_"+c.g)}</p><p class="eyebrow">${t("waitReady")}</p></div>`;
   return render(this.header(c)+`<div class="dstage" id="dStage">${body}</div>`);
  }
  if(mine.out)return render(`${intro}<h2 class="sv-title">${t("out")(mine.out)}</h2></div><div class="sv-wait"><img src="${head(Live.identity().team)}" alt=""></div>`);
  if(mine.bye===st.round)return render(`${intro}<h2 class="sv-title">${t("qualified")(st.round+2)}</h2><p class="muted">${t("bye")} ${t("pocket")}</p></div>`);
  render(`${intro}<h2 class="sv-title">${t("roundOf")(st.round+1,st.total)}</h2><p class="muted">${t("pocket")}</p></div>`);
 },
 async join(){const id=Live.identity();await db.set("tour/p/"+me,{n:id.n,team:id.team,lvl:0})},
 async unjoin(){if(this.st&&this.st.ph==="run")return;await db.remove("tour/p/"+me)},
 async ready(){
  const r=this.role(),mid=this.mid;vib(15);
  await db.tx("tour/m/"+mid,m=>{if(!m)return m;m["r"+r]=true;if(m.ra&&m.rb&&!m.go)m.go=db.now()+3500;return m});
 },
 countdown(c){
  this.busy=true;const goAt=c.go,mid=this.mid;
  render(this.header(c)+`<div class="dstage" id="dStage"><div class="dintro"><h3>${t("g_"+c.g)}</h3><p class="muted">${t("h_"+c.g)}</p><div class="dcount tabnum" id="dCount"></div></div></div>`);
  const tick=()=>{if(!active||this.mid!==mid)return;const s=Math.ceil((goAt-db.now())/1000);
   if(s>0){const el=$("#dCount");if(el)el.textContent=s;later(tick,100)}else this.playRound(c)};
  tick();
 },
 submit(v){
  const r=this.role();db.set(`tour/m/${this.mid}/v${r}`,Math.round(v*10)/10);
  this.play=null;this.busy=false;this.render();
 },
 /* ---------- mini-jeux (valeur la plus basse = victoire) ---------- */
 playRound(c){
  const st=$("#dStage");if(!st)return;
  const mid=this.mid;let sent=false;
  const done=v=>{if(sent||this.mid!==mid)return;sent=true;if(this.play&&this.play.stop)this.play.stop();this.submit(v)};
  this.play={};
  const rng=Live.rng(([...mid].reduce((a,ch)=>a*31+ch.charCodeAt(0)>>>0,7))||1);
  const G={altar:()=>this.altar(st,done,3.4,15000),final:()=>this.altar(st,done,2,25000),cava:()=>this.cava(st,done,rng),ole:()=>this.ole(st,done,rng),
   bouquet:()=>this.bouquet(st,done),chrono:()=>this.chrono(st,done),bride:()=>this.bride(st,done,rng)};
  (G[c.g]||G.altar)();
 },
 altar(st,done,step,limit){
  const c=this.cur(),r=this.role(),mine=c[r],them=c[r==="a"?"b":"a"];let prog=0,sentT=0;const t0=performance.now();
  st.innerHTML=`<div class="aisle"><div class="arch">✦</div>
   <div class="lane"><img id="aOpp" src="${head(them.side)}" alt=""><small>${esc(them.n)}</small></div>
   <div class="lane"><img id="aMe" src="${head(mine.side)}" alt=""><small>${esc(mine.n)}</small></div></div>
   <button type="button" class="tapzone" id="aTap">${t("tap")}</button>`;
  const place=(el,p)=>{if(el)el.style.bottom=`calc(${Math.min(100,p)*0.8}% + 4px)`};
  $("#aTap").addEventListener("pointerdown",e=>{e.preventDefault();if(prog>=100)return;prog=Math.min(100,prog+step);place($("#aMe"),prog);vib(5);
   const n=performance.now();if(n-sentT>150||prog>=100){sentT=n;db.set(`tour/m/${this.mid}/p${r}`,Math.round(prog))}
   if(prog>=100)done(n-t0)});
  this.play.onOpp=p=>place($("#aOpp"),p||0);
  later(()=>done(limit+(100-prog)*100),limit);
 },
 cava(st,done,rng){
  const target=Math.round(62+rng()*22);let level=0,holding=false,hold=0,rate=0,finished=false,raf=null,last=0;
  st.innerHTML=`<div class="cavaw"><div class="glass"><div class="line" style="bottom:${target}%"><span>${target}</span></div><div class="fill" id="cFill"></div><div class="foam" id="cFoam"></div></div></div>
   <button type="button" class="tapzone" id="cTap">${t("hold")}</button>`;
  const fill=$("#cFill"),foam=$("#cFoam"),btn=$("#cTap");
  const show=v=>{fill.style.height=Math.min(100,v)+"%";foam.style.bottom=Math.min(100,v)+"%";btn.classList.toggle("over",v>100)};
  const frame=n=>{const dt=Math.min(.05,(n-last)/1000||0);last=n;if(holding&&!finished){hold+=dt;rate=12+hold*10;level+=rate*dt;show(level);if(level>112)release()}raf=requestAnimationFrame(frame)};
  raf=requestAnimationFrame(frame);
  const release=()=>{if(!holding||finished)return;holding=false;finished=true;const settle=level+rate*0.22,start=level,t0=performance.now();
   const anim=n=>{const k=Math.min(1,(n-t0)/600);level=start+(settle-start)*(1-Math.pow(1-k,3));show(level);if(k<1)requestAnimationFrame(anim);else done(settle>100?500+settle:Math.abs(settle-target))};requestAnimationFrame(anim)};
  btn.addEventListener("pointerdown",e=>{e.preventDefault();if(finished)return;holding=true;try{btn.setPointerCapture(e.pointerId)}catch(err){}vib(10)});
  btn.addEventListener("pointerup",release);btn.addEventListener("pointercancel",release);btn.addEventListener("contextmenu",e=>e.preventDefault());
  this.play.stop=()=>cancelAnimationFrame(raf);
  later(()=>{if(!finished){if(holding)release();else{finished=true;done(400)}}},10000);
 },
 ole(st,done,rng){
  const delay=1600+rng()*2600;let shownAt=0;
  st.innerHTML=`<button type="button" class="olezone" id="oZone"><span id="oTxt">${t("wait")}</span></button>`;
  const z=$("#oZone");
  later(()=>{if(!z.isConnected)return;shownAt=performance.now();z.classList.add("go");$("#oTxt").textContent=t("ole");vib(40)},delay);
  z.addEventListener("pointerdown",e=>{e.preventDefault();
   if(!shownAt){z.classList.add("early");$("#oTxt").textContent=t("early");done(9000)}else done(performance.now()-shownAt)});
  later(()=>done(5000),delay+2500);
 },
 bouquet(st,done){
  st.innerHTML=`<div class="bq"><div class="bq-track"><i class="bq-c"></i><span class="bq-m" id="bqM">💐</span></div></div>
   <button type="button" class="tapzone" id="bqTap">${t("stop")}</button>`;
  const m=$("#bqM"),t0=performance.now(),per=1100;let pos=0,raf;
  const f=n=>{const ph=((n-t0)%per)/per;pos=ph<.5?ph*2:2-ph*2;m.style.left=(pos*100)+"%";raf=requestAnimationFrame(f)};raf=requestAnimationFrame(f);
  this.play.stop=()=>cancelAnimationFrame(raf);
  $("#bqTap").addEventListener("pointerdown",e=>{e.preventDefault();cancelAnimationFrame(raf);vib(20);done(Math.abs(pos-0.5)*200)});
  later(()=>done(100),7000);
 },
 chrono(st,done){
  st.innerHTML=`<div class="chr"><div class="chr-t tabnum" id="chT">${num(0,2)}</div><div class="eyebrow">→ ${num(5,2)} s</div></div>
   <button type="button" class="tapzone" id="chTap">${t("stop")}</button>`;
  const el=$("#chT"),t0=performance.now();let raf;
  const f=n=>{const s=(n-t0)/1000;el.textContent=s<2?num(s,2):"?";el.classList.toggle("hide",s>=2);raf=requestAnimationFrame(f)};raf=requestAnimationFrame(f);
  this.play.stop=()=>cancelAnimationFrame(raf);
  $("#chTap").addEventListener("pointerdown",e=>{e.preventDefault();const s=(performance.now()-t0)/1000;cancelAnimationFrame(raf);el.classList.remove("hide");el.textContent=num(s,2);vib(20);done(Math.abs(s-5)*1000)});
  later(()=>done(9999),9000);
 },
 bride(st,done,rng){
  const N=25,hit=Math.floor(rng()*N);let pen=0;const t0=performance.now();
  st.innerHTML=`<div class="bride">${Array.from({length:N},(_,i)=>`<button type="button" data-i="${i}" style="transform:rotate(${Math.round((rng()-.5)*50)}deg)"><img src="${head(i===hit?"agathe":"valentin")}" alt=""></button>`).join("")}</div><p class="hint" id="brP" style="text-align:center"></p>`;
  st.querySelector(".bride").addEventListener("pointerdown",e=>{const b=e.target.closest("[data-i]");if(!b)return;e.preventDefault();
   if(+b.dataset.i===hit){vib(30);b.classList.add("ok");done(performance.now()-t0+pen)}
   else{pen+=1500;vib([60,40,60]);b.classList.add("no");$("#brP").textContent="+"+num(pen/1000,1)+" s"}});
  later(()=>done(12000+pen),12000);
 },
 /* ---------- le prix : photo avec les mariés ---------- */
 champView(){
  const ph=S.get("champPhotoSent",false);
  render(`<div class="dend won"><img src="${head(Live.identity().team)}" alt=""><h2 class="sv-title">${t("champ")}</h2>
   <p class="muted">${ph?t("photoSent"):t("photoQ")}</p>
   <label class="btn btn-gold filebtn">${t("photoBtn")}<input type="file" accept="image/*" id="chPh" hidden></label><p class="hint" id="chMsg"></p></div>`);
  if(!this.cel){this.cel=1;confetti()}
  $("#chPh").addEventListener("change",async e=>{const f=e.target.files&&e.target.files[0];if(!f)return;$("#chMsg").textContent=t("photoSending");
   try{const img=await shrink(f,1400,.8);const cn=(this.st&&this.st.champN)||Live.identity().n;await db.set("tour/photo",{img,n:cn,t:db.now()});S.set("champPhotoSent",true);applyHero({img,n:cn});$("#chMsg").textContent=t("photoSent");confetti()}
   catch(err){$("#chMsg").textContent="⚠︎ "+(err&&err.message||err)}});
 }
};
function shrink(file,max,q){return new Promise((ok,ko)=>{const u=URL.createObjectURL(file),im=new Image();
 im.onload=()=>{const k=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement("canvas");c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);
  c.getContext("2d").drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);ok(c.toDataURL("image/jpeg",q))};im.onerror=()=>ko(new Error("image"));im.src=u})}
/* photo du champion en fond d'écran de l'accueil */
function applyHero(ph){
 if(!ph||!ph.img)return;const im=document.querySelector(".hero-img img"),cap=$("#heroChamp");
 if(im){im.src=ph.img;im.style.objectPosition="50% 35%"}if(cap){cap.textContent=t("heroChamp")(ph.n||"");cap.hidden=false}
}
async function heroChamp(){
 const g=gameCfg("duel");if(!Live.test()&&(!g.at||now()<Date.parse(g.at)))return;
 try{await Live.hold();applyHero(await Live.db.get("tour/photo"))}catch(e){}finally{Live.release()}
}

/* =====================================================================
   NAVIGATION
   ===================================================================== */
const Soiree={
 pick(g){if(g==="big"||g==="duel"){game=g;S.set("svGame",g)}},
 open(g){this.pick(g);const h=g==="big"?"manette":"duels";try{history.pushState(null,"","#"+h)}catch(e){}go("soiree")},
 async enter(force){
  if(active&&!force&&entered===game)return;
  if(active&&entered!==game)this.leave();
  active=true;entered=game;
  document.body.classList.add("immersive");clean();
  if(!unlocked(game))return lockedView();
  const id=Live.identity();if(!id.n||!id.team)return identityView();
  render(`<p class="muted" style="text-align:center;margin-top:40px">…</p>`);
  if(!this.held){this.held=true;db=await Live.hold()}
  if(!active)return;
  if(game==="big")Big.start();else Tour.start();
 },
 leave(){
  if(!active)return;active=false;document.body.classList.remove("immersive");
  if(db)Big.stop();
  Tour.busy=false;Tour.play=null;Tour.mid=null;clean();
  if(this.held){this.held=false;Live.release()}
 },
 refresh(){if(active){this.leave();this.enter()}},
 heroChamp
};
document.addEventListener("click",e=>{
 const b=e.target.closest("[data-evening],[data-sv]");if(!b)return;
 if(b.dataset.evening){e.preventDefault();Soiree.open(b.dataset.evening);return}
 const k=b.dataset.sv;
 if(k==="join")Tour.join();
 else if(k==="unjoin")Tour.unjoin();
 else if(k==="ready")Tour.ready();
 else if(k==="testoff"){Soiree.leave();Live.setTest(false);if(window.renderSim)renderSim();if(window.Carrera)Carrera.refresh();Soiree.enter()}
});
window.Soiree=Soiree;

/* arrivée directe sur #manette / #duels */
const h=location.hash.slice(1);
if(/^(manette|duels)(-test)?$/.test(h)){if(h.endsWith("-test"))Live.setTest(true);Soiree.pick(h.startsWith("manette")?"big":"duel");go("soiree")}
else if(document.querySelector("#soiree.on"))Soiree.enter();
heroChamp();
})();
