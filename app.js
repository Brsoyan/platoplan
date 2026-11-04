/* ===== Ads config: paste your Google AdSense IDs here to switch ads on ===== */
const ADS = {
  client: "",                      // e.g. "ca-pub-1234567890123456"
  slots:  { 1: "", 2: "", 3: "" }  // ad unit IDs from AdSense → Ads → By ad unit
};

const COLORS={veg:"var(--huerta)",protein:"var(--naranja)",carbs:"var(--saffron)",oil:"var(--oil)"};
const CAT_COLORS=["var(--naranja)","var(--primary)","var(--saffron)","var(--huerta)","var(--naranja)","var(--muted)"];
const WEEKS=[
  {l:["l1","l2","l3","l4","l5","l6","l7"],d:["d1","d2","d3","d4","d5","d6","d7"]},
  {l:["l8","l9","l10","l11","l12","l13","l14"],d:["d8","d9","d10","d11","d12","d13","d14"]},
  {l:["l15","l16","l17","l18","l19","l20","l21"],d:["d15","d16","d17","d18","d19","d20","d21"]}
];
const SHOP_IMG=[
  [["p_chicken","p_pork","p_turkey","p_eggs","p_tuna","p_hake","p_salmon","p_sepia","p_prawns","l7"],["p_skyr","m1"],["p_rice","p_potato","p_lentils","p_chickpeas","p_oats","p_bread"],["p_salad","p_tomato","p_pepper","p_broccoli","p_spinach","p_mushroom","p_frozenveg","d4"],["p_orange"],["p_oil","p_nuts","p_spices"]],
  [["l8","p_chicken","l14","d10","p_eggs","p_tuna","p_dorada","p_prawns","p_seafood","p_jamon"],["p_skyr","m1","p_quesofresco"],["p_rice","p_pasta","p_pasta","p_potato","p_lentils","p_oats","p_bread"],["d8","p_tomato","p_pepper","p_onion","p_courgette","p_asparagus","p_mushroom","p_salad","p_frozenveg","p_tomsauce","d4"],["p_orange"],["p_oil","p_nuts","p_spices","p_soy","d19"]],
  [["p_chicken","p_pork","p_beef","p_mackerel","p_hake","p_mussels","p_prawns","p_seafood","p_eggs","p_tuna"],["p_skyr","m1","p_quesofresco"],["p_rice","p_couscous","p_pasta","p_wrap","p_potato","p_oats","p_bread"],["p_spinach","p_broccoli","p_tomato","p_pepper","p_onion","p_carrot","p_leek","p_courgette","p_salad","p_lemon","p_garlic","p_tomsauce","d16"],["p_orange"],["p_oil","p_nuts","p_spices","d19"]]
];
const LOCALE={en:"en-GB",es:"es-ES",ru:"ru-RU",hy:"hy-AM"};

const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
const $=s=>document.querySelector(s);
const el=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e};
const img=(id,cls,alt)=>{const i=el("img",cls);i.src=`img/${id}.webp`;i.alt=alt||"";i.loading="lazy";i.decoding="async";return i};
const todayIdx=(new Date().getDay()+6)%7;
const fmt=n=>Math.round(n).toLocaleString(LOCALE[lang]||"en-GB");

/* Plate rim: tile-style petals */
(function(){let h="";for(let i=0;i<24;i++){const a=i*15;
  h+=`<ellipse cx="160" cy="23" rx="5" ry="10" fill="var(--primary)" transform="rotate(${a} 160 160)"/>`;
  h+=`<circle cx="160" cy="26" r="2.4" fill="var(--naranja)" transform="rotate(${a+7.5} 160 160)"/>`;}
  $("#rim").innerHTML=h})();

let lang="en";
let week=Math.min(2,Math.max(0,parseInt(new URLSearchParams(location.search).get("w")||store.get("week")||"1",10)-1))||0;
let checked=loadChecked();
function loadChecked(){return new Set(JSON.parse(store.get("shop"+week)||"[]"))}

/* A clickable dish card that opens its recipe */
function dishCard(id,label,tag){
  const t=T[lang],r=RECIPES[id];const b=el("button","dish");b.type="button";b.dataset.recipe=id;
  const ph=el("div","ph");ph.append(img(id,null,r[lang][0]));if(tag)ph.append(el("span","tag",tag));
  const tx=el("div","tx");tx.append(el("b",null,label||r[lang][0]),el("span","cook",t.cook));
  b.append(ph,tx);return b;
}

function render(l){
  lang=T[l]?l:"en";const t=T[lang];
  document.documentElement.lang=lang;document.title=t.title;
  document.querySelectorAll("[data-t]").forEach(n=>{if(t[n.dataset.t]!=null)n.textContent=t[n.dataset.t]});
  document.querySelectorAll(".langs button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.lang===lang));
  $("#langsel").value=lang;
  $("#h1").innerHTML=t.h1;
  $("#lnkPrivacy").href="privacy.html?lang="+lang;$("#lnkCredits").href="credits.html?lang="+lang;
  $("#rClose").setAttribute("aria-label",t.close);

  const f=$("#facts");f.innerHTML="";
  t.facts.forEach(([v,l])=>{const d=el("div","fact");d.append(el("b",null,v),el("span",null,l));f.append(d)});

  const lg=$("#legend");lg.innerHTML="";
  ["veg","protein","carbs","oil"].forEach(k=>{
    const li=el("li");li.dataset.part=k;const i=el("i");i.style.background=COLORS[k];
    const s=el("span");s.append(el("strong",null,t.plate[k][0]),document.createTextNode(t.plate[k][1]));
    li.append(i,s);lg.append(li);
  });
  $("#plateDesc").textContent=t.plateTitle+": "+["veg","protein","carbs","oil"].map(k=>t.plate[k].join(" — ")).join("; ");

  renderWeek();
  renderKcal();

  const tl=$("#tipList");tl.innerHTML="";
  t.tips.forEach(([b,r])=>{const li=el("li");li.append(el("strong",null,b),document.createTextNode(" "+r));tl.append(li)});

  if(dlg.open&&current)fillRecipe(current);
}

/* Everything that depends on the chosen week */
function renderWeek(){
  const t=T[lang],W=WEEKS[week];
  document.querySelectorAll(".weeks button").forEach((b,i)=>{b.textContent=t.weeks[i];b.setAttribute("aria-pressed",i===week)});

  /* Your day */
  const m=$("#meals");m.innerHTML="";
  t.meals.forEach((x,i)=>{
    const c=el("article","meal"+(i===1?" main":""));
    const h=el("div");h.append(el("div","es",x.es),el("div","what",x.what));c.append(h);
    if(i===0){c.append(dishCard("b1"),el("span","or",t.or),dishCard("b2"))}
    else{
      c.append(el("p","rule",x.rule));
      const id=i===1?W.l[todayIdx]:i===3?W.d[todayIdx]:"m1";
      c.append(dishCard(id,i===2?null:t.menus[week][todayIdx][i===1?0:1],i===2?null:t.today));
    }
    m.append(c);
  });

  /* Menu */
  const w=$("#week");w.innerHTML="";
  t.menus[week].forEach(([lu,di],i)=>{
    const r=el("div","row"+(i===todayIdx?" today":"")+(i>4?" weekend":""));
    const d=el("div","d",t.days[i]);if(i===todayIdx)d.append(el("span","badge",t.today));
    r.append(d);
    [[W.l[i],t.lunch,lu],[W.d[i],t.dinner,di]].forEach(([id,lab,txt])=>{
      const b=el("button","cell");b.type="button";b.dataset.recipe=id;
      const th=el("div","th");th.append(img(id,null,""));
      const s=el("div");s.append(el("small",null,lab),el("div",null,txt),el("span","cook",t.cook));
      b.append(th,s);r.append(b);
    });
    w.append(r);
  });

  /* Shopping list */
  const s=$("#shopList");s.innerHTML="";
  t.shops[week].forEach(([name,items],ci)=>{
    const c=el("div","cat");const h=el("h3");const ic=el("i");ic.style.background=CAT_COLORS[ci];h.append(ic,document.createTextNode(name));
    const ul=el("ul");
    items.forEach((it,ii)=>{const id=ci+"-"+ii;const li=el("li");const lb=el("label");const cb=el("input");cb.type="checkbox";cb.checked=checked.has(id);
      cb.addEventListener("change",()=>{cb.checked?checked.add(id):checked.delete(id);store.set("shop"+week,JSON.stringify([...checked]));progress()});
      lb.append(cb,img((SHOP_IMG[week][ci]||[])[ii]||"p_spices","pic",""),el("span",null,it));li.append(lb);ul.append(li)});
    c.append(h,ul);s.append(c);
  });
  progress();
}
function progress(){
  const total=document.querySelectorAll("#shopList input").length,n=document.querySelectorAll("#shopList input:checked").length;
  $("#progressText").textContent=T[lang].progress(n,total);$("#barFill").style.width=(total?n/total*100:0)+"%";
}
function setWeek(i){week=i;checked=loadChecked();store.set("week",String(i+1));
  const u=new URL(location);u.searchParams.set("w",i+1);history.replaceState(null,"",u);renderWeek()}
document.querySelectorAll(".weeks button").forEach((b,i)=>b.addEventListener("click",()=>setWeek(i)));

/* ===== Calories: calculator, plate builder, hands, drinks ===== */
const calc=Object.assign({sex:"m",age:35,h:175,w:85,act:1},JSON.parse(store.get("calc")||"{}"));
const ACT=[1.2,1.375,1.55,1.725];
let plate={};
function renderKcal(){
  const t=T[lang];
  const sel=$("#cAct");sel.innerHTML="";t.acts.forEach((a,i)=>{const o=el("option",null,a);o.value=i;sel.append(o)});
  sel.value=calc.act;$("#cAge").value=calc.age;$("#cH").value=calc.h;$("#cW").value=calc.w;
  document.querySelectorAll("#sexSeg button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.v===calc.sex));
  const how=$("#howList");how.innerHTML="";t.how.forEach(x=>how.append(el("li",null,x)));
  runCalc();

  const fc=$("#foodChips");fc.innerHTML="";
  t.foods.forEach(([name,k,p],i)=>{
    const d=el("div","fchip"+(plate[i]?" on":""));d.dataset.i=i;
    const add=el("button","add");add.type="button";add.append(el("span","n",name),el("small",null,`${k} ${t.kcalUnit} · ${p} ${t.gUnit}`));
    const cnt=el("span","cnt",plate[i]?"×"+plate[i]:"");
    const minus=el("button","minus","−");minus.type="button";minus.setAttribute("aria-label","−");
    add.addEventListener("click",()=>{plate[i]=(plate[i]||0)+1;cnt.textContent="×"+plate[i];d.classList.add("on");plateTotal()});
    minus.addEventListener("click",()=>{plate[i]=Math.max(0,(plate[i]||0)-1);cnt.textContent=plate[i]?"×"+plate[i]:"";d.classList.toggle("on",!!plate[i]);plateTotal()});
    d.append(add,cnt,minus);fc.append(d);
  });
  plateTotal();

  const hl=$("#handList");hl.innerHTML="";
  t.hands.forEach(([h,d],i)=>{const li=el("li");li.append(el("b",null,h),el("span",null,d));hl.append(li)});

  const tb=$("#drinkTable tbody");tb.innerHTML="";
  t.drinks.forEach(([name,k,s,tier])=>{
    const tr=el("tr","t"+tier);
    const td1=el("td");td1.append(el("i","dot"),document.createTextNode(name),el("small",null,t.tiers[tier]));
    const walk=k>=10?Math.max(5,Math.round(k/5/5)*5):0;
    const sug=el("td",null,s?`${s} ${t.gUnit}`:"0");if(s>=4)sug.append(el("small",null,`≈ ${Math.round(s/4)} ${t.sugarCubes}`));
    tr.append(td1,el("td","num",fmt(k)),sug,el("td","num",walk?`${walk} ${t.min}`:"—"));tb.append(tr);
  });
}
function runCalc(){
  const t=T[lang],{sex,age,h,w,act}=calc;
  const bmr=10*w+6.25*h-5*age+(sex==="m"?5:-161);
  const tdee=bmr*ACT[act];const floor=sex==="m"?1500:1200;
  const target=Math.max(tdee-500,floor);
  $("#rMaintain").textContent=`${fmt(tdee)} ${t.kcalUnit}`;
  $("#rTarget").textContent=`${fmt(target)} ${t.kcalUnit}`;
  $("#rProtein").textContent=`${fmt(w*1.8)} ${t.gUnit}`;
  $("#rFloor").textContent=`${fmt(floor)} ${t.kcalUnit}`;
}
function plateTotal(){
  const t=T[lang];let k=0,p=0;
  Object.entries(plate).forEach(([i,n])=>{k+=t.foods[i][1]*n;p+=t.foods[i][2]*n});
  $("#tKcal").textContent=fmt(k);$("#tProt").textContent=fmt(p);
}
["cAge","cH","cW"].forEach(id=>$("#"+id).addEventListener("input",e=>{const v=parseFloat(e.target.value);if(!isNaN(v)&&v>0){calc[{cAge:"age",cH:"h",cW:"w"}[id]]=v;store.set("calc",JSON.stringify(calc));runCalc()}}));
$("#cAct").addEventListener("change",e=>{calc.act=+e.target.value;store.set("calc",JSON.stringify(calc));runCalc()});
document.querySelectorAll("#sexSeg button").forEach(b=>b.addEventListener("click",()=>{calc.sex=b.dataset.v;store.set("calc",JSON.stringify(calc));
  document.querySelectorAll("#sexSeg button").forEach(x=>x.setAttribute("aria-pressed",x===b));runCalc()}));
$("#tClear").addEventListener("click",()=>{plate={};document.querySelectorAll(".fchip").forEach(d=>{d.classList.remove("on");d.querySelector(".cnt").textContent=""});plateTotal()});

/* ===== Recipe dialog ===== */
const dlg=$("#recipe");let current=null;
function fillRecipe(id){
  const r=RECIPES[id],t=T[lang],[name,ing,steps]=r[lang];const guide=r.kind==="guide";
  $("#rImg").src=`img/${id}.webp`;$("#rImg").alt=name;
  const c=window.CREDITS&&CREDITS[id];const cap=$("#rCredit");cap.innerHTML="";
  if(c){const a=el("a",null,`${t.photo}: ${c.artist} · ${c.license}`);a.href=c.page;a.target="_blank";a.rel="noopener";cap.append(a)}
  $("#rTitle").textContent=name;
  const ch=$("#rChips");ch.innerHTML="";
  if(r.min)ch.append(el("span","chip o",`⏱ ${r.min} ${t.min}`));
  WEEKS.forEach((W,wi)=>{W.l.forEach((x,i)=>{if(x===id)ch.append(el("span","chip",`${t.weeks[wi]} · ${t.days[i]} · ${t.lunch}`))});
    W.d.forEach((x,i)=>{if(x===id)ch.append(el("span","chip",`${t.weeks[wi]} · ${t.days[i]} · ${t.dinner}`))})});
  $("#rIngH").textContent=guide?t.guideIng:t.ingredients;$("#rStepsH").textContent=guide?t.guideSteps:t.steps;
  const ul=$("#rIng");ul.innerHTML="";ing.forEach(x=>ul.append(el("li",/^—|:$/.test(x)?"sep":null,x)));
  const ol=$("#rSteps");ol.innerHTML="";steps.forEach(x=>ol.append(el("li",null,x)));
}
function openRecipe(id,push=true){
  if(!RECIPES[id])return;current=id;fillRecipe(id);
  if(!dlg.open)dlg.showModal();dlg.scrollTop=0;
  if(push)history.replaceState(null,"",location.pathname+location.search+"#r-"+id);
}
function closeRecipe(){if(dlg.open)dlg.close()}
dlg.addEventListener("close",()=>{current=null;if(location.hash.startsWith("#r-"))history.replaceState(null,"",location.pathname+location.search)});
dlg.addEventListener("click",e=>{if(e.target===dlg)closeRecipe()});
$("#rClose").addEventListener("click",closeRecipe);
document.addEventListener("click",e=>{const b=e.target.closest("[data-recipe]");if(b)openRecipe(b.dataset.recipe)});

/* ===== Language, theme, mobile helpers ===== */
function setLang(l){render(l);store.set("lang",lang);const u=new URL(location);u.searchParams.set("lang",lang);history.replaceState(null,"",u)}
document.querySelectorAll(".langs button").forEach(b=>b.addEventListener("click",()=>setLang(b.dataset.lang)));
$("#langsel").addEventListener("change",e=>setLang(e.target.value));
$("#reset").addEventListener("click",()=>{checked.clear();store.set("shop"+week,"[]");document.querySelectorAll("#shopList input").forEach(i=>i.checked=false);progress()});
$("#print").addEventListener("click",()=>window.print());

$("#themeBtn").addEventListener("click",()=>{
  const dark=document.documentElement.dataset.theme!=="dark";
  if(dark)document.documentElement.dataset.theme="dark";else delete document.documentElement.dataset.theme;
  store.set("theme",dark?"dark":"light");
  document.querySelector('meta[name="theme-color"]').content=dark?"#0E1613":"#0F6E5A";
});
$("#meals").addEventListener("scroll",()=>{
  const m=$("#meals"),cards=m.children;if(!cards.length)return;
  const i=Math.round(m.scrollLeft/(cards[0].offsetWidth+12));
  document.querySelectorAll("#dots i").forEach((d,j)=>d.classList.toggle("on",j===Math.min(i,3)));
},{passive:true});
const navLinks=document.querySelectorAll('.tabbar a,.sections a');
const io=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting)navLinks.forEach(a=>a.classList.toggle("on",a.getAttribute("href")==="#"+e.target.id))})},{rootMargin:"-45% 0px -50% 0px"});
["day","menu","shop","kcal","tips"].forEach(id=>io.observe(document.getElementById(id)));

const plate_=$("#plate");
$("#legend").addEventListener("mouseover",e=>{const li=e.target.closest("li");if(!li)return;plate_.classList.add("dim");plate_.querySelectorAll("[data-part]").forEach(p=>p.classList.toggle("on",p.dataset.part===li.dataset.part))});
$("#legend").addEventListener("mouseleave",()=>plate_.classList.remove("dim"));

/* ===== Ads (only when ADS.client is set) ===== */
if(ADS.client){
  const sc=document.createElement("script");sc.async=true;sc.crossOrigin="anonymous";
  sc.src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client="+ADS.client;document.head.append(sc);
  document.querySelectorAll(".ad").forEach(box=>{const slot=ADS.slots[box.dataset.ad];if(!slot)return;
    const ins=document.createElement("ins");ins.className="adsbygoogle";ins.style.display="block";
    ins.dataset.adClient=ADS.client;ins.dataset.adSlot=slot;ins.dataset.adFormat="auto";ins.dataset.fullWidthResponsive="true";
    box.querySelector(".slot").append(ins);box.classList.add("on");(window.adsbygoogle=window.adsbygoogle||[]).push({});});
}

const q=new URLSearchParams(location.search).get("lang");
const nav=(navigator.language||"en").slice(0,2);
render(q||store.get("lang")||(T[nav]?nav:"en"));
if(location.hash.startsWith("#r-"))openRecipe(location.hash.slice(3),false);
