/* extreme.js - Extremely Hard trap-hardened generators for every normally-easy (diff 1) SIE topic.
   In Extremely Hard mode, even foundational exam topics become multi-condition scenarios with
   tight exam-grade distractors so zero softballs appear in lessons, drills, or 75-Q exams. */
const EXTREME_GEN={
 "Reg T margin":()=>{
  const cash=R(1,2)*1000, stock=R(6,12)*2000, tot=stock;
  const req=Math.round(tot*0.5), due=req-cash, maint=Math.round(tot*0.25);
  return Q(3,"Reg T margin",
   `${pick(NAMES)} opens a new margin account with ${money(cash)} cash and immediately buys ${money(tot)} of marginable listed equity (not a day trade). Under Regulation T and FINRA Rule 4210, how much ADDITIONAL cash must arrive to meet the initial call?`,
   [money(due), money(req), money(maint), money(tot-cash)],0,
   `Federal Reserve Regulation T requires 50% initial equity (${money(req)} on ${money(tot)}), which already exceeds FINRA's $2,000 minimum equity rule. Existing cash of ${money(cash)} counts toward the deposit, leaving ${money(due)} due.`,
   "Reg T 50% (Fed) minus existing cash; FINRA $2,000 min equity / 25% long maintenance.");
 },
 "Pattern day trader":()=>{
  const eq=R(18,24)*1000, shortf=25000-eq;
  return Q(3,"Pattern day trader",
   `A margin customer executes 4 intraday round-trip stock trades in 5 business days (representing 12% of total trades) and finishes the day with ${money(eq)} in account equity. Under the classic FINRA Rule 4210 PDT standard (prior to the 2026 risk-based intraday margin transition), what is TRUE?`,
   [`The account is flagged as a PDT and faces a ${money(shortf)} minimum-equity call (or 90-day close-only/cash-only restriction until $25,000 is restored)`,
    "No PDT flag applies because equity is above the $2,000 initial margin minimum",
    "The customer can bypass the $25,000 rule by executing the 5th day trade in a cash account",
    "FINRA waives the equity minimum unless day trades exceed 25% of total activity"],0,
   `Classic PDT triggers at 4+ day trades in 5 business days exceeding 6% of total trades in a margin account, requiring $25,000 minimum equity (a ${money(shortf)} shortfall here). Note: FINRA approved transitioning to risk-based intraday margin in 2026.`,
   "Classic PDT: 4+ day trades in 5 business days (>6%) in margin = $25,000 equity (2026 transition).");
 },
 "Prohibited activities":()=>{
  return Q(3,"Prohibited activities",
   `A rep with informal control over a retired client's account trades actively to earn commissions; the account actually finishes the year UP 6% while paying heavy commissions inconsistent with the client's conservative income goal. Which statement is TRUE?`,
   ["FINRA can still prove churning because profitability does not excuse control + excessiveness + scienter",
    "No churning occurred because the client had a net gain for the year",
    "Churning only applies when the rep holds formal written discretionary authority",
    "This is front running rather than churning because the rep benefited from commissions"],0,
   `Profitability is NOT a defense to churning, and de facto control counts even without written discretion. FINRA requires control, excessiveness relative to the customer's profile, and scienter.`,
   "Churning = control (formal or de facto) + excessiveness + scienter; gains do not excuse it.");
 },
 "Treasury / Fed":()=>{
  const disc=R(4,7);
  return Q(1,"Treasury / Fed",
   `A 26-week U.S. Treasury bill is issued at a discount and matures at par. Which statement about its taxation and market mechanics is TRUE?`,
   ["Interest is taxable federally and exempt from state/local tax; it pays no periodic coupon and settles T+1",
    "Interest is exempt from federal income tax like a municipal bond and pays semiannual coupons",
    "Interest is taxable at both federal and state levels because maturity is under one year",
    "T-bills are issued by the Federal Reserve rather than the U.S. Treasury and settle T+2"],0,
   `The U.S. Treasury (not the Fed) issues T-bills (maturity <=1 year) at a discount with no coupon. Treasury interest is federally taxable, exempt from state and local tax, and settles T+1.`,
   "Treasuries: issued by Treasury, federal-taxable / state-exempt; T-bills = discount, <=1 yr.");
 },
 "Primary vs secondary":()=>{
  const sh=R(2,6)*1000000;
  return Q(1,"Primary vs secondary",
   `A publicly listed issuer sells ${sh.toLocaleString()} newly authorized shares through an underwriting syndicate while its existing stock simultaneously trades on the NYSE. Where do the proceeds of the new shares go, and which market is that tranche?`,
   ["Primary market follow-on offering; net proceeds go to the issuing corporation",
    "Secondary market because the company is already publicly listed on the NYSE",
    "Third market because underwriters negotiate listed shares away from the exchange",
    "Primary market IPO because newly authorized shares always constitute an IPO"],0,
   `Any time the issuer sells new shares and receives the proceeds, it is a primary market transaction. Because the company is already public, it is a follow-on (APO) primary offering, not an IPO.`,
   "Issuer gets proceeds = primary market (IPO first time; follow-on if already public).");
 },
 "Systematic risk":()=>{
  const n=R(30,60);
  return Q(2,"Systematic risk",
   `An investor holds ${n} U.S. equities spread evenly across all 11 S&P sectors, zero leverage, and rebalances quarterly. Which risk STILL remains largely unreduced by this diversification?`,
   ["Systematic market and inflation/purchasing-power risk",
    "Unsystematic company-specific business risk",
    "Single-issuer bankruptcy and credit default risk",
    "Concentrated single-stock liquidity risk"],0,
   `Broad sector diversification slashes unsystematic (business, single-issuer default, single-stock) risk, but cannot diversify away systematic market-wide, interest-rate, or inflation risk.`,
   "Diversification reduces unsystematic risk, never systematic (market/rate/inflation) risk.");
 },
 "Fed tools":()=>{
  return Q(1,"Fed tools",
   `Inflation accelerates and the FOMC wants to tighten monetary policy immediately. Which action drains bank reserves and puts upward pressure on the federal funds rate?`,
   ["Selling U.S. Treasury securities in open market operations (and/or raising the discount rate and reserve requirements)",
    "Buying U.S. Treasury securities in open market operations to inject reserves into primary dealers",
    "Cutting federal income tax rates and increasing federal infrastructure spending",
    "Lowering the discount rate while lowering the target federal funds range"],0,
   `Selling Treasuries pulls cash/reserves out of the banking system (tightening). Buying Treasuries eases; taxing and spending are fiscal policy set by Congress and the President, not the Fed.`,
   "Fed tightening = sell Treasuries in OMO, raise discount rate / target fed funds range.");
 },
 "Preferred vs common":()=>{
  return Q(2,"Preferred vs common",
   `A company enters Chapter 7 bankruptcy liquidation and also missed two years of dividends on its non-cumulative preferred stock. Which claim order and dividend rule is CORRECT?`,
   ["Secured creditors, unsecured creditors, preferred stockholders, then common stockholders; missed non-cumulative preferred dividends are permanently lost",
    "Preferred stockholders are paid ahead of unsecured bondholders and always collect all missed dividends",
    "Common stockholders share voting power with preferred holders to collect missed non-cumulative dividends first",
    "Unsecured bondholders are paid after preferred stock because preferred stock pays a fixed dividend"],0,
   `Liquidation priority is secured debt -> unsecured debt -> preferred -> common. Only CUMULATIVE preferred catches up missed dividends; non-cumulative missed dividends are gone forever.`,
   "Liquidation: secured -> unsecured -> preferred -> common. Only cumulative preferred catches up.");
 },
 "Stock splits":()=>{
  const f=pick([2,3,4]), sh=f*R(40,90), pr=f*R(10,18);
  const newSh=sh/f, newPr=pr*f;
  return Q(2,"Stock splits",
   `An investor owns ${sh} shares bought at $${pr} (cost basis ${money(sh*pr)}). The issuer executes a 1-for-${f} REVERSE split. What is the post-split position and immediate tax impact?`,
   [`${newSh} shares at $${newPr}; total value and cost basis unchanged, not a taxable event`,
    `${sh*f} shares at $${pr/f}; capital gain realized on the share count change`,
    `${newSh} shares at $${pr}; investor recognizes a capital loss immediately`,
    `${newSh} shares at $${newPr}; taxable as ordinary dividend income on the payable date`],0,
   `A 1-for-${f} reverse split divides shares by ${f} (${sh} -> ${newSh}) and multiplies price by ${f} ($${pr} -> $${newPr}). Total value (${money(sh*pr)}) and cost basis are unchanged, and splits are not taxable.`,
   "Reverse split: shares / factor, price * factor; total value & basis unchanged, non-taxable.");
 },
 "Long call breakeven":()=>{
  const k=R(40,90), p=R(3,8), mkt=k+p-1;
  return Q(2,"Long call breakeven",
   `A trader buys 1 ABC ${k} call for a $${p} premium. At expiration, ABC closes at $${mkt}. What is the trader's breakeven, and what is the net dollar P&L on 1 contract (100 shares)?`,
   [`Breakeven $${k+p}; net loss of $${(k+p-mkt)*100} (intrinsic value $${(mkt-k)*100} minus $${p*100} premium)`,
    `Breakeven $${k+p}; net loss of $${p*100} because the option expires completely worthless`,
    `Breakeven $${k-p}; net profit of $${(mkt-(k-p))*100}`,
    `Breakeven $${k}; net profit of $${(mkt-k)*100} because the call is in-the-money`],0,
   `Long call breakeven = strike + premium ($${k+p}). At $${mkt}, the call IS in-the-money by $${mkt-k} ($${(mkt-k)*100} intrinsic), recovering part of the $${p*100} premium for a net loss of $${(k+p-mkt)*100}.`,
   "Long call: BE = strike + premium; in-the-money below BE still loses money, just less than full premium.");
 },
 "Long put breakeven":()=>{
  const k=R(50,100), p=R(4,9), mkt=k-p+2;
  return Q(2,"Long put breakeven",
   `An investor buys 1 XYZ ${k} put for a $${p} premium. At expiration, XYZ trades at $${mkt}. What is the breakeven price and the investor's net dollar result on 1 contract?`,
   [`Breakeven $${k-p}; net loss of $${(mkt-(k-p))*100} (recovers $${(k-mkt)*100} intrinsic against $${p*100} cost)`,
    `Breakeven $${k+p}; net loss of $${p*100} because the put expires out-of-the-money`,
    `Breakeven $${k-p}; max loss is unlimited if XYZ rallies sharply`,
    `Breakeven $${k}; net profit of $${(k-mkt)*100} because the put is in-the-money`],0,
   `Long put breakeven = strike - premium ($${k-p}). At $${mkt}, the put has $${k-mkt} intrinsic value ($${(k-mkt)*100}), offsetting part of the $${p*100} premium for a net loss of $${(mkt-(k-p))*100}. Max loss for any option buyer is capped at the premium paid.`,
   "Long put: BE = strike - premium; max loss = premium paid; ITM above BE still nets a partial loss.");
 },
 "ETFs vs mutual funds":()=>{
  return Q(2,"ETFs vs mutual funds",
   `A trader wants to enter a stop-limit order at 11:15 a.m. and sell shares short on margin if a sector drops. Which comparison between an equity ETF and an open-end mutual fund is ACCURATE?`,
   ["Only the ETF supports intraday stop-limit orders and short selling, and its market price can trade at a premium or discount to NAV",
    "Both ETFs and open-end mutual funds can be sold short intraday at exchange bid/ask quotes",
    "An open-end mutual fund executes immediately at the prior day's closing NAV when an order enters at 11:15 a.m.",
    "ETFs are priced once daily at 4:00 p.m. forward NAV under Rule 22c-1 while mutual funds trade intraday"],0,
   `ETFs trade intraday on exchanges (supporting limit/stop orders, margin, and shorting, with market prices that can diverge from NAV). Open-end mutual funds forward-price once daily at the next calculated NAV (Rule 22c-1) and cannot be shorted.`,
   "ETF = intraday exchange trading (margin/short/premium-discount). Mutual fund = once-daily forward NAV.");
 },
 "ADR / currency risk":()=>{
  return Q(2,"ADR / currency risk",
   `A U.S. investor buys a sponsored ADR of a European automaker in USD on the NYSE. Over the next year, the automaker's home share price in euros is FLAT, while the euro weakens 12% against the U.S. dollar. What happens to the ADR?`,
   ["The ADR loses value in USD because ADR holders remain exposed to foreign currency risk even though the ADR trades and pays dividends in USD",
    "The ADR is unaffected because ADRs are denominated and settled in U.S. dollars on the NYSE",
    "The ADR gains 12% because a weaker euro boosts the dollar value of European dividends",
    "Currency risk is eliminated by the depositary bank's SIPC guarantee"],0,
   `ADRs trade and pay dividends in USD for convenience, but the underlying shares are foreign. When the foreign currency weakens against the dollar, USD returns fall (currency risk).`,
   "ADRs trade in USD, but still carry full foreign currency risk (weaker foreign currency = lower USD value).");
 },
 "Settlement T+1":()=>{
  return Q(3,"Settlement T+1",
   `A client buys 200 shares of a listed equity regular-way on Friday morning, and the following Monday is a federal bank/market holiday (Presidents' Day). When does the trade settle, and if a cash dividend has a Tuesday record date, who gets the dividend?`,
   ["Settles Tuesday (next business day, T+1); the buyer receives the dividend because buying Friday is before the Tuesday ex-date (= record date under T+1)",
    "Settles Wednesday (T+2); the seller receives the dividend because settlement occurs after record date",
    "Settles Monday even though banks are closed; neither party receives the dividend",
    "Settles Tuesday (T+1); the seller keeps the dividend because ex-date is always two business days before record date"],0,
   `Regular-way U.S. equities settle T+1 (next business day: Friday -> Tuesday when Monday is a holiday). Under T+1, ex-date equals record date (Tuesday), so buying Friday (before ex-date) entitles the buyer to the dividend.`,
   "T+1 skips holidays; under T+1, ex-date = record date (buy before ex-date = get dividend).");
 },
 "Blue-sky laws":()=>{
  return Q(1,"Blue-sky laws",
   `A broker-dealer already registered with the SEC and FINRA wants to solicit retail clients in a state where it has no physical office, selling securities that are NOT federal-covered. What applies?`,
   ["State blue-sky registration applies to both the firm/rep and the non-exempt securities in each state where offers are directed",
    "SEC and FINRA registration automatically preempts all state blue-sky filings for every security",
    "Blue-sky registration is only required in states where the firm maintains a physical branch office",
    "MSRB enforces state blue-sky registration through the Uniform Securities Act"],0,
   `State securities regulators (coordinated via NASAA) enforce blue-sky laws. Unless an exemption or federal-covered preemption applies, firms, reps, and securities must register in each state where business is conducted.`,
   "Blue-sky laws = state registration (NASAA); federal registration does not automatically waive state requirements.");
 },
 "Market participants":()=>{
  return Q(1,"Market participants",
   `An order executes inside a broker-dealer where the firm fills a customer's buy order directly from its own inventory at a markup rather than routing it to an exchange for a commission. Which capacity is the firm acting in?`,
   ["Principal (dealer) capacity, bearing inventory risk and charging a markup",
    "Agency (broker) capacity, matching buyer and seller for a commission",
    "Transfer agent capacity, cancelling old certificates and issuing new shares",
    "Clearing agency capacity, acting as DTCC custodian"],0,
   `A dealer (principal) trades from its own inventory at risk for a markup/markdown. A broker (agent) matches customer orders with others for a commission.`,
   "Dealer/Principal = own inventory + markup/markdown. Broker/Agent = matches others + commission.");
 },
 "Third & fourth markets":()=>{
  return Q(1,"Third & fourth markets",
   `Two mutual fund complexes execute a 250,000-share block of an NYSE-listed equity directly with each other over an Electronic Communication Network (ECN) without a broker-dealer intermediary, while a market maker separately trades another NYSE-listed stock OTC with a client. Which markets are these, in order?`,
   ["Fourth market (institution-to-institution direct/ECN block), then third market (exchange-listed stock traded OTC)",
    "Third market (direct institution-to-institution), then fourth market (listed stock traded OTC)",
    "Second market (unlisted OTC), then primary market (institutional block)",
    "First market (exchange floor), then second market (Nasdaq unlisted)"],0,
   `Third market = exchange-listed securities traded over-the-counter (away from the exchange). Fourth market = large institutional investors trading directly with each other (often via ECNs/dark pools) without a retail broker-dealer.`,
   "Third market = listed stock traded OTC. Fourth market = institution-to-institution direct / ECN.");
 },
 "Money market instruments":()=>{
  return Q(2,"Money market instruments",
   `A corporate treasurer needs a liquid instrument with <=270 days maturity that is exempt from 1933 Act registration, carries corporate credit risk, and trades at a discount. Which instrument fits?`,
   ["Commercial paper (unsecured short-term corporate promissory note, <=270 days)",
    "Negotiable jumbo CD (always backed by the full faith and credit of the U.S. Treasury)",
    "10-year Treasury note held inside a money market mutual fund",
    "Banker's acceptance backed solely by municipal general obligation taxes"],0,
   `Commercial paper is unsecured corporate short-term debt issued at a discount with maturity up to 270 days (exempt from 1933 Act registration). Money market instruments mature in 1 year or less.`,
   "Money market <=1 yr: commercial paper = unsecured corporate discount note, <=270 days.");
 },
 "529 & ABLE":()=>{
  return Q(2,"529 & ABLE",
   `Which statement accurately contrasts a 529 education savings plan and an ABLE account as of 2026?`,
   ["Both are municipal fund securities with tax-free qualified withdrawals; ABLE disability onset age expanded to before age 46 effective Jan 1, 2026 under SECURE 2.0",
    "Contributions to both 529 and ABLE accounts are federally tax-deductible with no state limits",
    "ABLE accounts require disability onset before age 26 permanently and cannot accept rollovers from 529 plans",
    "Non-qualified 529 withdrawals trigger a 10% penalty and ordinary income tax on the ENTIRE withdrawal including principal"],0,
   `Both 529 and ABLE plans are municipal fund securities (contributions are after-tax federally; earnings grow tax-deferred and come out tax-free for qualified expenses; non-qualified penalty/tax hits EARNINGS only). SECURE 2.0 raised ABLE onset age from 26 to before 46 effective Jan 1, 2026.`,
   "529 & ABLE = muni fund securities; non-qualified tax/10% penalty on earnings only; ABLE onset <46 (2026).");
 },
 "Basis points & cost basis":()=>{
  const bps=pick([35,45,65,85,125]), par=1000;
  const pct=(bps/100).toFixed(2), dlrs=(par*bps/10000).toFixed(2);
  return Q(3,"Basis points & cost basis",
   `A corporate bond's yield rises by ${bps} basis points, and an investor separately reinvests $400 of taxed mutual fund dividends into new shares. What is ${bps} bps as a percentage (and per $1,000 par), and what happens to the fund's cost basis?`,
   [`${pct}% ($${dlrs} per $1,000 par), and reinvested dividends ADD $400 to cost basis so they are not taxed twice on sale`,
    `${(bps/10).toFixed(1)}% ($${(par*bps/1000).toFixed(2)} per $1,000 par), and reinvested dividends do not affect cost basis`,
    `${pct}% ($${dlrs} per $1,000 par), and reinvested dividends reduce cost basis like a return of capital`,
    `${(bps/1000).toFixed(3)}% ($${(par*bps/100000).toFixed(2)} per $1,000 par), and reinvested dividends are tax-free`],0,
   `1 basis point = 0.01% ($0.10 per $1,000 par), so ${bps} bps = ${pct}% ($${dlrs}/$1,000). Reinvested mutual fund dividends are taxable in the year received and INCREASE cost basis by the reinvested amount.`,
   "1 bp = 0.01% ($0.10/$1,000); reinvested dividends are taxable now and increase cost basis.");
 },
 "Do-not-call":()=>{
  return Q(3,"Do-not-call",
   `A prospect whose phone number is on the National Do-Not-Call Registry inquired about a firm's services 2 months ago and has NOT asked to be placed on the firm's internal do-not-call list. When may a rep place a telemarketing call?`,
   ["Between 8:00 a.m. and 9:00 p.m. in the CALLED party's local time zone, because an inquiry creates a 3-month exemption (unless the person asks to be on the firm's internal list)",
    "Between 8:00 a.m. and 9:00 p.m. in the REP'S local time zone for up to 18 months after any inquiry",
    "Never — any number on the National Registry blocks calls even after an inquiry or recent transaction",
    "At any hour of the day as long as the rep discloses the firm's name first"],0,
   `Telemarketing calls are restricted to 8 a.m.-9 p.m. in the CALLED party's local time. Established business relationship exemptions run 18 months from a transaction and 3 months from an inquiry — unless the person requests placement on the firm's internal DNC list, which overrides all exemptions.`,
   "DNC: 8am-9pm called party's time; 18 mo transaction / 3 mo inquiry exemption; firm-specific DNC overrides.");
 },
 "UTMA accounts":()=>{
  return Q(3,"UTMA accounts",
   `An aunt gifts $12,000 of stock into an UTMA account for her 10-year-old nephew, naming herself custodian. Two years later she wants to take the shares back or trade naked calls in the account. What is TRUE?`,
   ["Gifts are irrevocable (minor is beneficial owner and pays tax on income under minor's SSN), only one custodian/one minor per account, and speculative margin/naked options are prohibited",
    "The aunt may revoke the gift anytime before the minor turns 18 because she funded the account",
    "The aunt may add a second niece as joint minor beneficiary and trade on margin with principal approval",
    "Taxes on UTMA dividends are always reported under the custodian's Social Security number"],0,
   `UTMA/UGMA gifts are irrevocable: 1 minor + 1 custodian per account, assets belong to the minor (taxed under minor's SSN), no margin/speculative shorting or naked options, and control transfers at age of majority.`,
   "UTMA: irrevocable gift, 1 minor / 1 custodian, minor's SSN for tax, no margin/naked options.");
 },
 "IRA & RMDs":()=>{
  return Q(3,"IRA & RMDs",
   `A 55-year-old investor with a Traditional IRA takes a $10,000 distribution (not qualifying for an exception) and asks when Required Minimum Distributions begin for both her Traditional IRA and her Roth IRA. What is CORRECT?`,
   ["The $10,000 Traditional IRA withdrawal owes ordinary income tax PLUS a 10% early-withdrawal penalty (before 59 1/2); RMDs start at age 73 for Traditional IRAs, and Roth IRAs have NO lifetime owner RMDs",
    "The withdrawal owes capital gains tax only; RMDs start at age 70 1/2 for both Traditional and Roth IRAs",
    "The 10% penalty stops at age 55 for all IRAs, and Traditional RMDs begin at age 65",
    "Both Traditional and Roth IRAs require RMDs starting at age 73 to avoid the 25% excise penalty"],0,
   `Non-exempt Traditional IRA withdrawals before age 59 1/2 face ordinary income tax + 10% penalty (the age-55 separation rule applies to employer 401(k) plans, NOT IRAs!). Traditional IRA RMDs start at age 73; Roth IRA owners have no lifetime RMDs.`,
   "Traditional IRA: <59 1/2 = tax + 10% penalty, RMDs at 73; Roth IRA = no lifetime owner RMDs.");
 },
 "Signatures of convenience":()=>{
  return Q(3,"Signatures of convenience",
   `A hospitalized client emails written permission asking her rep to sign her name on a routine address-change and transfer form so her account stays current. Under FINRA rules, what is the ONLY compliant response?`,
   ["Refuse to sign the client's name — signatures of convenience are strictly prohibited even with written client permission or no financial harm",
    "Sign the client's name and attach the client's email to the compliance file",
    "Sign the form only if a branch principal co-signs as witness",
    "Use a pre-signed blank form the client left on file for emergencies"],0,
   `Signing a client's name or keeping signed blank forms (signatures of convenience) is strictly prohibited under FINRA rules regardless of verbal/written consent, urgency, or lack of harm.`,
   "Signatures of convenience and signed blank forms are strictly prohibited even with client consent.");
 },
 "IPO purchase restrictions":()=>{
  return Q(3,"IPO purchase restrictions",
   `Under FINRA Rule 5130, which party is PERMITTED to purchase shares of a hot equity IPO at the public offering price from an underwriting syndicate?`,
   ["An unrelated retail customer of the firm (even if they may later flip shares, though flipping can jeopardize future IPO allocations)",
    "A registered representative's personal brokerage account at a different broker-dealer",
    "The spouse or dependent parent living with a registered representative",
    "A broker-dealer buying for its own proprietary trading account"],0,
   `FINRA Rule 5130 bars restricted persons — broker-dealers, reps, and their immediate family supported by/living with them — from buying equity IPOs. Unrelated public retail clients are permitted.`,
   "Rule 5130 bars BDs, reps, and covered immediate family from buying equity IPOs.");
 },
 "Forms U4 & U5":()=>{
  return Q(4,"Forms U4 & U5",
   `A registered rep resigns on May 1 after a dispute over an undisclosed outside business activity, and wants to move to a new broker-dealer. Which filing rule is CORRECT?`,
   ["The departing firm must file Form U5 within 30 days (with an accurate reason for termination), and the rep's new firm files a new Form U4; FINRA retains jurisdiction over the rep for 2 years after termination",
    "The rep files Form U5 personally within 10 days, and FINRA loses all disciplinary jurisdiction immediately upon resignation",
    "The departing firm may omit the compliance dispute on Form U5 if the rep agrees to resign voluntarily",
    "Form U4 transfers automatically between firms without any new filing as long as the move occurs within 90 days"],0,
   `The departing firm files Form U5 accurately within 30 days (never misleading or hiding misconduct), the hiring firm files Form U4, and FINRA keeps jurisdiction for 2 years after Form U5 termination.`,
   "Form U5 by firm within 30 days; Form U4 for registration/updates; 2-year FINRA jurisdiction post-U5.");
 },
 "Background checks":()=>{
  return Q(4,"Background checks",
   `Before filing Form U4 for a new registered rep who will handle customer orders and securities records, what MUST the hiring broker-dealer complete?`,
   ["Verify the applicant's prior 3 years of employment/background, obtain fingerprints under SEC Rule 17f-2 (submitted to the Attorney General/FBI via FINRA), and review the prior firm's Form U5",
    "Check only the past 1 year of employment and skip fingerprinting because the rep is not a branch principal",
    "Rely solely on the applicant's signed Form U4 attestation without contacting prior employers",
    "Wait 60 days after registration approval before taking fingerprints under Rule 17f-2"],0,
   `Firms must investigate the prior 3 years of employment, review Form U5 from prior member firms, and fingerprint covered personnel under SEC Rule 17f-2.`,
   "Hiring check: 3-year employment history + Form U5 review + SEC Rule 17f-2 fingerprinting.");
 },
 "Statutory disqualification":()=>{
  return Q(4,"Statutory disqualification",
   `Which event triggers statutory disqualification under the Securities Exchange Act of 1934, barring standard registration with a FINRA member firm?`,
   ["A felony conviction (of ANY kind) or a securities/financial-related misdemeanor conviction within the past 10 years, or a securities-related court injunction/SRO expulsion",
    "Any traffic misdemeanor or civil speeding ticket within the past 5 years",
    "Filing personal Chapter 7 bankruptcy 4 years ago with no fraud or criminal charges",
    "A written customer complaint alleging $6,000 in damages that has not been adjudicated"],0,
   `Any felony conviction or investment/financial-related misdemeanor within 10 years (or SRO bar/expulsion or securities injunction) triggers statutory disqualification. Personal bankruptcy and unadjudicated complaints are reportable on Form U4, NOT automatic statutory disqualification.`,
   "Statutory disqualification = any felony or securities-related misdemeanor (<10 yrs), SRO bar, or injunction.");
 },
 "Continuing education":()=>{
  return Q(4,"Continuing education",
   `A registered rep completes the firm's internal annual product training in October, but forgets to complete FINRA's Regulatory Element by December 31. What happens on January 1?`,
   ["The rep becomes CE inactive and CANNOT perform any duties requiring registration or receive securities commissions until completing the Regulatory Element",
    "Nothing happens because completing the Firm Element automatically satisfies the Regulatory Element for that year",
    "The rep gets an automatic 120-day grace period to keep taking customer orders and earning commissions",
    "The rep's registration is permanently revoked with statutory disqualification"],0,
   `Both the Regulatory Element (FINRA, due annually by Dec 31) and Firm Element (broker-dealer, annual) are mandatory. Missing the Regulatory Element makes the rep CE inactive immediately — no securities business or commissions until completed.`,
   "CE: Regulatory Element (FINRA) & Firm Element (firm) are BOTH annual; missing Reg Element = CE inactive.");
 },
 "Outside business activities":()=>{
  return Q(4,"Outside business activities",
   `A registered rep plans to earn weekend pay as an independent rideshare driver and separately plans to sell private promissory notes for a friend's startup for a 3% finder's fee. Which rules govern each activity?`,
   ["Rideshare driving is an OBA (FINRA Rule 3270: prior written notice); selling private notes for pay is selling away / PST (FINRA Rule 3280: prior written notice AND prior written firm approval, supervision, and recording)",
    "Both activities require only verbal disclosure to a branch manager at the next annual compliance meeting",
    "Neither requires disclosure because both occur on weekends outside firm hours",
    "Both are governed identically by Rule 3270 and never require firm approval"],0,
   `Non-securities paid outside work = OBA (Rule 3270, prior written notice). Private securities transactions away from the firm = selling away (Rule 3280, prior written notice + prior written firm approval, supervision, and book recording if compensated).`,
   "OBA (Rule 3270) = non-securities outside work (prior written notice); Selling away (Rule 3280) = private securities.");
 },
 "Political contributions & gifts":()=>{
  return Q(4,"Political contributions & gifts",
   `In April 2026, a rep buys a $350 watch for a client (without attending an event) and a municipal finance professional donates $300 to a state treasurer candidate they CAN vote for. What violations occurred?`,
   ["Both violated rules: the $350 watch exceeds FINRA Rule 3220's $300/yr gift cap (effective March 30, 2026 under Notice 26-05), AND the $300 contribution exceeds MSRB Rule G-37's $250 de minimis limit (triggering a 2-year negotiated muni ban)",
    "Only the watch violated a rule; MSRB Rule G-37 allows up to $500 if the MFP can vote for the candidate",
    "Only the contribution violated a rule; FINRA Rule 3220 raised the gift limit to $500 in 2026",
    "Neither violated a rule because $350 is ordinary entertainment and $300 is allowed for voters"],0,
   `FINRA Notice 26-05 raised Rule 3220's gift cap from $100 to $300/person/year effective March 30, 2026, so $350 still exceeds it. MSRB Rule G-37 caps eligible-voter MFP contributions at $250 (over $250 triggers a 2-year negotiated muni underwriting ban).`,
   "Rule 3220 = $300/yr gifts (2026 Notice 26-05); MSRB G-37 = $250 voter limit -> 2-yr negotiated muni ban.");
 },
 "Customer complaints":()=>{
  return Q(4,"Customer complaints",
   `A client emails a written complaint alleging unauthorized options trading with $6,500 in damages. Separately, another client makes an oral phone complaint alleging $20,000 in losses. Which must be reported on Form U4?`,
   ["The written email complaint ($5,000+ alleged damages) must be reported on Form U4 within 30 days; pure oral complaints are not U4-reportable unless reduced to writing or settled for $15,000+",
    "Both must be reported on Form U4 within 10 days because both exceed $5,000",
    "Neither must be reported unless the client wins an arbitration award over $25,000",
    "Only the oral complaint is reportable because $20,000 exceeds the $15,000 settlement threshold"],0,
   `Form U4 requires reporting written customer complaints alleging sales-practice violations with $5,000+ in compensatory damages, or settlements of $15,000+, within 30 days. Oral-only complaints do not trigger Form U4 unless written or settled at $15,000+.`,
   "Form U4 complaints: written + $5,000+ alleged damages, or $15,000+ settlement (30 days).");
 },
 "Felonies/liens/bankruptcy":()=>{
  return Q(4,"Felonies/liens/bankruptcy",
   `A registered rep receives an unsatisfied federal tax lien and must update Form U4, while another rep is convicted of a felony triggering statutory disqualification. What are the EXACT Form U4 amendment deadlines?`,
   ["30 days for the unsatisfied tax lien (general U4 updates: liens, judgments, bankruptcies, complaints), and 10 days for an event causing statutory disqualification",
    "10 days for all financial liens and 30 days for felony convictions",
    "90 days for tax liens and 30 days for statutory disqualification",
    "Only felony convictions require Form U4 updates; personal tax liens and bankruptcies are private"],0,
   `Form U4 must be amended within 30 days for general reportable events (unsatisfied liens/judgments, bankruptcies within 10 years, written complaints) and within 10 days for statutory disqualification events.`,
   "Form U4 updates: 30 days standard (liens/bankruptcy/complaints); 10 days for statutory disqualification.");
 }
};

function hardenQuestion(q){
 if(!q) return q;
 const fn=EXTREME_GEN[q.topic];
 if(fn){
  const h=fn();
  return {...h, sec:q.sec||h.sec, diff:3, extremeTrap:true};
 }
 return {...q, diff:3, extremeTrap:true};
}
