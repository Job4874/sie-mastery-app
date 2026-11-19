/* util.js - shared helpers. Loaded first; everything else depends on these globals. */
const R=(a,b)=>Math.floor(Math.random()*(b-a+1))+a, pick=a=>a[R(0,a.length-1)];
const money=n=>"$"+n.toLocaleString();
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=R(0,i);[a[i],a[j]]=[a[j],a[i]]}return a};
const NAMES=["Maya","Jordan","Priya","Carlos","Elena","Tom","Nadia","Chris"];
function Q(sec,topic,text,choices,answer,explain,rule){return{sec,topic,text,choices,answer,explain,rule}}
const isPlainObj=v=>Boolean(v&&typeof v==="object"&&!Array.isArray(v));
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const $=id=>document.getElementById(id);
function plainText(s){return String(s).replace(/<[\/!]?[a-zA-Z][^>]*>/g," ").replace(/&nbsp;/gi," ").replace(/&amp;/gi,"&").replace(/&lt;/gi,"<").replace(/&gt;/gi,">").replace(/&quot;/gi,'"').replace(/&#39;/gi,"'").replace(/\s+/g," ").trim()}
const SSN_RE=/(^|[^\d])\d{3}[-\s]\d{2}[-\s]\d{4}(?=$|[^\d])/g;
function redactSSN(text){return String(text||"").replace(SSN_RE,(m,p)=>p+"[REDACTED-SSN]")}
