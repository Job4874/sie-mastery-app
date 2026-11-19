/* router.js - tiny hash router. Routes are real, linkable URLs (#/learn/unit/3/lesson/2/1)
   and the browser Back button works. Views live in js/ui/views.js. */
const Router={routes:[],current:null,
 add(pattern,view,nav){ const keys=[]; const re=new RegExp("^"+pattern.replace(/:([a-z]+)/g,(m,k)=>{keys.push(k);return "([^/]+)"})+"/?$"); this.routes.push({re,keys,view,nav,pattern}); },
 parse(hash){ const path=(hash||"").replace(/^#/,"")||"/learn";
  for(const r of this.routes){ const m=path.match(r.re); if(m){ const params={}; r.keys.forEach((k,i)=>{ try{params[k]=decodeURIComponent(m[i+1])}catch(e){params[k]=m[i+1]} }); return {route:r,params,path}; } }
  return null; },
 go(hash,force){ if(location.hash!==hash){ location.hash=hash; return; } if(force) this.render(); },
 replace(hash){ if(history.replaceState) history.replaceState(null,"",hash); else location.replace(hash); },
 render(){
  const found=this.parse(location.hash);
  if(!found){ this.replace("#/learn"); return this.render(); }
  const leavingQuiz=this.current&&this.current.route.pattern==="/quiz"&&found.route.pattern!=="/quiz";
  if(leavingQuiz){ haltSession(); session=null; }
  else if(!(found.route.pattern==="/quiz"&&this.current&&this.current.route.pattern==="/quiz")) stopAudio();
  this.current=found;
  document.querySelectorAll("[data-nav]").forEach(a=>{ const on=a.getAttribute("data-nav")===found.route.nav; a.classList[on?"add":"remove"]("active"); if(on) a.setAttribute("aria-current","page"); else a.removeAttribute("aria-current"); });
  const app=$("app"); document.body.setAttribute("data-route",found.route.nav||"other");
  const title=found.route.view(app,found.params)||"SIE Mastery";
  document.title=title+" \u00b7 SIE Mastery";
  window.scrollTo(0,0);
  const h=app.querySelector("h1"); if(h){ h.setAttribute("tabindex","-1"); try{h.focus({preventScroll:true})}catch(e){} }
 }
};
window.addEventListener("hashchange",()=>Router.render());
