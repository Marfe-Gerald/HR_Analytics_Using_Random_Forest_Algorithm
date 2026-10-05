// Edit names/icons here. Every screen except Home is shown as "Under Construction".
const SCREENS = [
  {id:"home", name:"Dashboard", icon:"🏠"},
  {id:"s1", name:"Data Collection Screen", icon:"🗂️", uc:true},
  {id:"s2", name:"Result Screen", icon:"🎯", uc:true},
  {id:"s3", name:"History Screen", icon:"🕘", uc:true},
  {id:"s4", name:"Data-Collection Screen", icon:"🗂️", uc:true}
];
const nav = document.getElementById("nav"), host = document.getElementById("screens");
SCREENS.forEach(s=>{
  if(s.uc){
    const d=document.createElement("div"); d.className="screen"; d.id=s.id;
    d.innerHTML=`<section class="card under"><div class="big">🚧</div><h2>${s.name}</h2><span class="uc">Under Construction</span><p class="muted">This screen is coming soon.</p><div class="bar"><i></i></div></section>`;
    host.appendChild(d);
  }
  const b=document.createElement("button"); b.dataset.id=s.id;
  b.innerHTML=`<span>${s.icon}</span>${s.name}${s.uc?'<span class="dot">🚧</span>':''}`;
  b.onclick=()=>show(s.id); nav.appendChild(b);
});
function show(id){
  document.querySelectorAll(".screen").forEach(e=>e.classList.toggle("show",e.id===id));
  nav.querySelectorAll("button").forEach(b=>b.classList.toggle("active",b.dataset.id===id));
  window.scrollTo({top:0});
  document.querySelectorAll("#"+id+" .card").forEach((el,i)=>{
    el.classList.remove("in","settled");
    el.style.transitionDelay=(i*90)+"ms";
    void el.offsetWidth;
    requestAnimationFrame(()=>el.classList.add("in"));
    setTimeout(()=>{el.style.transitionDelay="0ms";el.classList.add("settled")},700+i*90);
  });
}
show("home");
