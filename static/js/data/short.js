/* short.js - short-response prompts graded by rubric (concept groups, bound pairs,
   numeric tolerance, negation guards). Full = all groups, Partial = 50%+, else a miss. */
const SHORT=[
{topic:"SIPC separate capacity",unit:7,prompt:"In your own words: at one failed broker-dealer, a couple has a joint account with $600,000 in securities and one spouse's IRA with $400,000. How much total SIPC coverage do they have, and why?",groups:[{k:"joint = one capacity",any:["separate capacity","separate capacities","one capacity","single capacity","not per person","per capacity","different capacity"]},{k:"$500k cap on the joint account",any:["500k","500,000","500000","500 thousand","five hundred","five hundred thousand"]}],num:900000,model:"$900,000. The joint account is ONE separate capacity, capped at $500,000 (not $500k per person). The IRA is a different capacity, covered in full at $400,000. $500k + $400k = $900k.",rule:"SIPC: $500k per separate capacity."},
{topic:"CMO tranches",unit:3,prompt:"Interest rates fall sharply. Explain what happens to a CMO support tranche's average life, and why.",groups:[{k:"contraction / shorter life",any:["contract","contracts","contracted","contracting","contraction","shorten","shortens","shortened","shortening","shorter","paid early","paid off early","returned early"]},{k:"prepayments rise as borrowers refinance",any:["prepay","prepays","prepaid","prepaying","prepayment","prepayments","refinance","refinances","refinanced","refinancing","refi"]}],model:"It contracts — average life shortens. Falling rates make homeowners refinance, prepayments surge, and the support tranche absorbs the excess prepayments first to protect the PAC's schedule, so its principal comes back early.",rule:"Rates down = contraction (support absorbs prepayments)."},
{topic:"Freeriding",unit:6,prompt:"Define freeriding in a cash account and state the account consequence under Regulation T.",groups:[{k:"buy and sell before paying / without funds",any:["before pay","unsettled","before paying","prior to paying","not yet paid","sell before","sells before","selling before","sold before","without funds","without paying","cannot sell before paying"]},{k:"90-day settled-funds restriction",any:["90"]}],model:"Freeriding is buying a security in a cash account without funds to cover and selling it before paying for it in full (a Regulation T violation). Under Reg T, a freeriding violation restricts the account to settled funds only for 90 calendar days unless full payment arrives by settlement.",rule:"Freeriding: sell before paying = Reg T violation, 90-day freeze."},
{topic:"Wash sale",unit:6,prompt:"An investor sells at a loss and rebuys the same stock 10 days later. What happens to the loss, and what is the full window the rule covers?",groups:[{k:"loss disallowed/deferred now",any:["disallow","disallowed","disallows","disallowing","defer","deferred","defers","deferral","not allowed","not deductible","cannot deduct","can't deduct","cannot claim","can't claim","postpone","postponed"]},{k:"added to cost basis of new shares",any:["basis","cost basis","added to the cost","new shares","replacement shares"]},{k:"30 days either side / 61-day window",any:["61","61-day","30 days before","thirty days before","before and after","either side"]}],model:"The loss is disallowed for now (deferred, not destroyed): it is added to the cost basis of the replacement shares and the holding period tacks on. The wash sale window is 30 days before and after the sale — 61 days total.",rule:"Wash sale: 61-day window, loss goes into new basis."},
{topic:"Reg T margin",unit:7,prompt:"Two numbers, two regulators: state the initial margin requirement and who sets it, and the long maintenance requirement and who sets that.",groups:[{k:"initial 50% — set by the Federal Reserve",bind:{a:["50"],b:["federal reserve","the fed","fed","frb"],notB:["finra"],role:["initial","reg t","regulation t"],otherRole:["maintenance"]}},{k:"maintenance 25% — set by FINRA",bind:{a:["25"],b:["finra"],notB:["federal reserve","the fed","fed","frb"],role:["maintenance"],otherRole:["initial","reg t","regulation t"]}}],model:"Regulation T initial margin is 50%, set by the Federal Reserve. FINRA's minimum maintenance for long positions is 25%. Swapping the two regulators or the two numbers is the classic trap.",rule:"Reg T 50% = Fed. Maintenance 25% = FINRA."},
{topic:"Bond risk",unit:3,prompt:"Bond A: 30-year, zero coupon. Bond B: 30-year, 8% coupon. Bond C: 5-year, zero coupon. Which bond's price moves most when yields change, and what concept explains it?",groups:[{k:"Bond A / the 30-year zero",any:["bond a","30-year zero","30 year zero","thirty-year zero","the zero"]},{k:"duration",any:["duration"]},{k:"long maturity + no coupon = highest sensitivity",any:["longest","long maturity","no coupon","zero coupon","zero-coupon","0% coupon","highest duration","most sensitive"]}],model:"Bond A. Duration — price sensitivity to yield changes — rises with maturity and falls with coupon size. The 30-year zero-coupon bond has the highest duration, so its price moves the most for a given yield change.",rule:"Duration: up with maturity, down with coupon."},
{topic:"Communications",unit:7,prompt:"A firm emails a sales piece to 40 retail investors this month. What is this called under FINRA rules, what approval does it need, and what are the two threshold numbers?",groups:[{k:"retail communication",any:["retail communication","retail communications"]},{k:"principal approval before use",all:[["principal"],["before","prior","pre-approval","preapproval"]]},{k:"more than 25 investors",any:["25","twenty-five","twenty five"]},{k:"within 30 days",any:["30","thirty","30-calendar-day","30-day"]}],model:"It is a retail communication: written material distributed to more than 25 retail investors within any 30-calendar-day period. A principal must approve it before use. 25 or fewer would be correspondence, under a different standard.",rule:"Retail communication: >25 retail investors / 30 days, principal pre-approval."},
{topic:"Callable bonds / yield to worst",unit:3,prompt:"You buy a callable bond at a premium. Which yield governs your expected return and why?",groups:[{k:"yield to call",any:["yield to call","yield-to-call","ytc","to call"]},{k:"issuer will call it / lower of YTC and YTM",any:["issuer will call","likely to call","called away","called early","first call","lower","worst"]}],model:"Yield to call governs. At a premium, the issuer is likely to call the bond at the first call date, cutting the return short, so YTC is lower than YTM — and the lower figure (yield to worst) is the honest one to quote and expect.",rule:"Premium bond: YTC (yield to worst) governs."},
{topic:"Stop orders",unit:6,prompt:"A buy stop is triggered during a fast, gapping market. What does the order become, and what is NOT guaranteed?",groups:[{k:"becomes a market order",any:["market order"]},{k:"price / execution price not guaranteed",any:["not guaranteed","no guarantee","no price guarantee","isn't guaranteed","doesn't guarantee","does not guarantee","never guaranteed","cannot guarantee","can't guarantee"]}],model:"The stop order becomes a market order once triggered. Execution is effectively certain, but the price is not guaranteed — in a gap, the fill can be far from the stop price. A stop-limit adds price protection but risks never executing.",rule:"Stop triggers into a market order: execution yes, price no."},
{topic:"Selling away",unit:8,prompt:"A rep wants to sell private notes from his own side company to clients. What must happen first, under which concept?",groups:[{k:"selling away / private securities transaction",any:["selling away","private securities"]},{k:"prior written notice/approval from the firm",all:[["written","prior","before","advance"],["firm","employer","broker-dealer","broker dealer","member firm","bd"]]}],model:"This is selling away — a private securities transaction. The rep must give the firm prior written notice, and the firm must approve in writing (and supervise and record the transactions) before any selling happens. Doing it first and mentioning it later is the violation.",rule:"Selling away: prior written firm approval or it doesn't happen."},
{topic:"Settlement T+1",unit:6,prompt:"A stock trade executes Monday. When does it settle regular-way, and on what date does a buyer stop being entitled to an upcoming dividend?",groups:[{k:"T+1 / Tuesday settlement",any:["t+1","t + 1","next business day","one business day","tuesday"]},{k:"ex-dividend date (buy on/after it, no dividend)",any:["ex-dividend","ex dividend","ex date","ex-date"]}],model:"Regular-way settlement is T+1 — Tuesday for a Monday trade. Dividend entitlement turns on the ex-dividend date (which under T+1 is the record date): buy before it and you receive the dividend; buy on or after it and the seller keeps it.",rule:"Equities settle T+1; ex-date controls the dividend."},
{topic:"Prohibited activities",unit:8,prompt:"Name the three elements FINRA must show to prove churning, in your own words.",groups:[{k:"control of the account",any:["control","controls","controlled","discretion","discretionary"]},{k:"excessive trading (in light of the customer's profile)",any:["excessive","excessively","too much trading","excessiveness","frequent turnover","high turnover","overtrading","turnover"]},{k:"scienter / intent to defraud or reckless disregard",any:["scienter","intent","intentional","reckless","recklessness","defraud","fraud","commission motive","bad faith","bad-faith","commissions"]}],model:"Churning requires (1) the rep's control over the account, (2) trading that is excessive in light of the customer's objectives and financial situation, and (3) scienter — intent to defraud or reckless disregard of the customer's interests, typically shown by trading done to generate commissions.",rule:"Churning = control + excessiveness + scienter."}
];
function prepareShort(s){ return {type:"short",sec:0,topic:s.topic,unit:s.unit,diff:3,text:s.prompt,groups:s.groups,num:s.num||null,model:s.model,rule:s.rule,explain:s.model} }
function normNums(t){
 t=String(t||"").toLowerCase().replace(/[$,]/g,"")
  .replace(/(\d+(?:\.\d+)?)\s*k\b/g,(m,n)=>String(parseFloat(n)*1000))
  .replace(/(\d+(?:\.\d+)?)\s*m(?:illion)?\b/g,(m,n)=>String(parseFloat(n)*1000000));
 return (t.match(/\d+(?:\.\d+)?/g)||[]).map(Number);
}
function gradeShort(q,text){
 const t=" "+String(text||"").toLowerCase()+" "; const hits=[],missed=[];
 const escRe=s=>s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
 const tokRe=term=>{
  const s=term.trim().toLowerCase();
  const pre=/^[a-z0-9]/.test(s)?"(?:^|[^a-z0-9])":"";
  const post=/[a-z0-9]$/.test(s)?"(?=$|[^a-z0-9])":"";
  return new RegExp(pre+escRe(s)+post,"g");
 };
 const posIn=(str,arr)=>arr.flatMap(x=>{
  const out=[]; const re=tokRe(x); let m;
  while((m=re.exec(str))!==null){ out.push(m.index+(/^[^a-z0-9]/.test(m[0])?1:0)); if(!m[0].length) re.lastIndex++; }
  return out;
 });
 const negNear=(str,idx)=>/\b(?:not|no|never|without|isn't|aren't|doesn't|don't|cannot|can't)\s+(?:\w+\s+){0,2}$/.test(str.slice(Math.max(0,idx-22),idx));
 const posAllow=(str,arr)=>posIn(str,arr).filter(idx=>!negNear(str,idx));
 const dIn=(A,B)=>{ let m=1e9; A.forEach(a=>B.forEach(b=>{ m=Math.min(m,Math.abs(a-b)) })); return m };
 q.groups.forEach(g=>{ let hit=false;
   if(g.bind){
    const clauses=t.split(/[.!?;]+|\b(?:and|while|whereas|but)\b/);
    hit=clauses.some(s=>{
     const A=posAllow(s,g.bind.a); if(!A.length) return false;
     const B=posAllow(s,g.bind.b); if(!B.length) return false;
     const NB=posIn(s,g.bind.notB||[]);
     const Rpos=g.bind.role?posAllow(s,g.bind.role):[0];
     if(g.bind.role&&!Rpos.length) return false;
     const ORpos=g.bind.otherRole?posIn(s,g.bind.otherRole):[];
     return A.some(a=>{
      const db=dIn([a],B), dn=NB.length?dIn([a],NB):1e9;
      if(db>=dn) return false;
      if(!g.bind.role) return true;
      const dr=dIn([a],Rpos), dOther=ORpos.length?dIn([a],ORpos):1e9;
      return dr<dOther;
     });
    });
   } else if(g.all){
    hit=g.all.every(arr=>posAllow(t,arr).length>0);
   } else {
    hit=posAllow(t,g.any).length>0;
   }
   (hit?hits:missed).push(g.k);
 });
 let total=q.groups.length, got=hits.length;
 if(q.num){
  total++;
  const clauses=t.split(/[.!?;]+|\b(?:and|while|whereas|but)\b/);
  const okNum=clauses.some(c=>{
   const ns=normNums(c);
   if(!ns.some(n=>Math.abs(n-q.num)<=1)) return false;
   return !/\b(?:not|never|no|instead of)\s+(?:the\s+)?\$?(?:900(?:\s*k|,000)?|0\.9\s*m)/.test(c);
  });
  if(okNum){got++;hits.push("correct number: $"+q.num.toLocaleString())}
  else missed.push("the number ($"+q.num.toLocaleString()+")");
 }
 const ratio=total?got/total:0;
 return {ratio, hits, missed, verdict: ratio>=0.99?"full":ratio>=0.5?"partial":"wrong"};
}
