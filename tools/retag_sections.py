"""Normalize the SIE question bank to the four official FINRA SIE content sections.

- retags every GEN question by topic
- adds seven Section 2 questions so a 75-question exam can draw 33 unique Section 2 items
- repairs UNIT_BY_TOPIC / DIFF_BY_TOPIC coverage
Run: python tools/retag_sections.py
"""
import json, re, pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
P = ROOT / "static" / "index.html"
html = P.read_text(encoding="utf-8")

# Official FINRA SIE content outline, sections 1-4.
SEC = {
    # 1 - Knowledge of Capital Markets (16%)
    "SIPC separate capacity": 1, "Treasury / Fed": 1, "Primary vs secondary": 1,
    "Fed tools": 1, "MSRB": 1, "Economic indicators": 1, "Monetary vs fiscal": 1,
    "Business cycle": 1, "IPO vs follow-on": 1, "Best efforts vs firm commitment": 1,
    "Shelf registration": 1, "Blue-sky laws": 1, "Market participants": 1,
    "Third & fourth markets": 1,
    # 2 - Understanding Products and Their Risks (44%)
    "CMO tranches": 2, "Options — covered call": 2, "Bond risk": 2,
    "Mutual fund pricing": 2, "Convertibles": 2, "Systematic risk": 2,
    "Preferred vs common": 2, "Yield ordering": 2, "Callable bonds / yield to worst": 2,
    "Long call breakeven": 2, "ETFs vs mutual funds": 2, "Reinvestment risk": 2,
    "ADR / currency risk": 2, "Rights & warrants": 2, "Rule 144": 2,
    "Agency & MBS": 2, "GO vs revenue munis": 2, "Money market instruments": 2,
    "Bond ratings": 2, "UITs vs mutual funds": 2, "Variable annuities": 2,
    "Share classes & breakpoints": 2, "529 & ABLE": 2, "DPPs & REITs": 2,
    "ETFs vs ETNs": 2, "Inflation & political risk": 2,
    "Liquidity & prepayment risk": 2, "Diversification & rebalancing": 2,
    "Protective put": 2, "Short put": 2, "Muni tax-equivalent yield": 2,
    "Current yield": 2, "Closed-end funds": 2, "Long put breakeven": 2,
    "Zero-coupon bonds": 2,
    # 3 - Trading, Customer Accounts and Prohibited Activities (31%)
    "Freeriding": 3, "Wash sale": 3, "Reg T margin": 3, "Pattern day trader": 3,
    "Reg SHO": 3, "Discretionary accounts": 3, "Prohibited activities": 3,
    "Account opening / AML": 3, "Stock splits": 3, "Dividend dates": 3,
    "Settlement T+1": 3, "Stop orders": 3, "Insider trading": 3, "Selling away": 3,
    "SAR vs CTR": 3, "FinCEN & OFAC": 3, "KYC & suitability": 3,
    "Best interest (Reg BI)": 3, "Do-not-call": 3, "Reg S-P privacy": 3,
    "UTMA accounts": 3, "IRA & RMDs": 3, "Buybacks & tender offers": 3,
    "Rights offerings & proxies": 3, "Basis points & cost basis": 3,
    "Marking close & backing away": 3, "Signatures of convenience": 3,
    "IPO purchase restrictions": 3,
    # 4 - Overview of Regulatory Framework (9%)
    "Communications": 4, "Trusted contact / seniors": 4, "Registration timelines": 4,
    "Senior exploitation": 4, "Forms U4 & U5": 4, "Background checks": 4,
    "Statutory disqualification": 4, "Continuing education": 4,
    "Outside business activities": 4, "Political contributions & gifts": 4,
    "Customer complaints": 4, "Felonies/liens/bankruptcy": 4,
}
UNIT = {
    "SIPC separate capacity": 7, "CMO tranches": 3, "Freeriding": 6, "Wash sale": 6,
    "Reg T margin": 7, "Pattern day trader": 7, "Reg SHO": 6,
    "Options — covered call": 4, "Bond risk": 3, "Communications": 7,
    "Trusted contact / seniors": 7, "Discretionary accounts": 7,
    "Prohibited activities": 8, "Mutual fund pricing": 4, "Convertibles": 3,
    "Treasury / Fed": 1, "Primary vs secondary": 1, "Registration timelines": 8,
    "Systematic risk": 5, "Account opening / AML": 7, "Fed tools": 1, "MSRB": 1,
    "Preferred vs common": 2, "Stock splits": 2, "Dividend dates": 2,
    "Yield ordering": 3, "Callable bonds / yield to worst": 3,
    "Long call breakeven": 4, "ETFs vs mutual funds": 4, "Reinvestment risk": 5,
    "ADR / currency risk": 5, "Settlement T+1": 6, "Stop orders": 6,
    "Insider trading": 8, "Selling away": 8, "Economic indicators": 1,
    "Monetary vs fiscal": 1, "Business cycle": 1, "IPO vs follow-on": 1,
    "Best efforts vs firm commitment": 1, "Shelf registration": 1,
    "Blue-sky laws": 1, "Market participants": 1, "Third & fourth markets": 1,
    "Rights & warrants": 2, "Rule 144": 2, "Agency & MBS": 3,
    "GO vs revenue munis": 3, "Money market instruments": 3, "Bond ratings": 3,
    "UITs vs mutual funds": 4, "Variable annuities": 4,
    "Share classes & breakpoints": 4, "529 & ABLE": 5, "DPPs & REITs": 5,
    "ETFs vs ETNs": 5, "Inflation & political risk": 5,
    "Liquidity & prepayment risk": 5, "Diversification & rebalancing": 5,
    "Buybacks & tender offers": 6, "Rights offerings & proxies": 6,
    "Basis points & cost basis": 6, "Marking close & backing away": 6,
    "SAR vs CTR": 7, "FinCEN & OFAC": 7, "KYC & suitability": 7,
    "Best interest (Reg BI)": 7, "Do-not-call": 7, "Reg S-P privacy": 7,
    "UTMA accounts": 7, "IRA & RMDs": 7, "Signatures of convenience": 8,
    "IPO purchase restrictions": 8, "Senior exploitation": 8, "Forms U4 & U5": 8,
    "Background checks": 8, "Statutory disqualification": 8,
    "Continuing education": 8, "Outside business activities": 8,
    "Political contributions & gifts": 8, "Customer complaints": 8,
    "Felonies/liens/bankruptcy": 8,
    "Protective put": 4, "Short put": 4, "Muni tax-equivalent yield": 3,
    "Current yield": 3, "Closed-end funds": 4, "Long put breakeven": 4,
    "Zero-coupon bonds": 3,
}
DIFF = {
    "SIPC separate capacity": 3, "CMO tranches": 3, "Freeriding": 2, "Wash sale": 2,
    "Reg T margin": 1, "Pattern day trader": 1, "Reg SHO": 2,
    "Options — covered call": 2, "Bond risk": 2, "Communications": 3,
    "Trusted contact / seniors": 2, "Discretionary accounts": 2,
    "Prohibited activities": 1, "Mutual fund pricing": 2, "Convertibles": 3,
    "Treasury / Fed": 1, "Primary vs secondary": 1, "Registration timelines": 3,
    "Systematic risk": 1, "Account opening / AML": 2, "Fed tools": 1, "MSRB": 2,
    "Preferred vs common": 1, "Stock splits": 1, "Dividend dates": 3,
    "Yield ordering": 2, "Callable bonds / yield to worst": 2,
    "Long call breakeven": 1, "ETFs vs mutual funds": 1, "Reinvestment risk": 2,
    "ADR / currency risk": 1, "Settlement T+1": 1, "Stop orders": 2,
    "Insider trading": 2, "Selling away": 2, "Economic indicators": 2,
    "Monetary vs fiscal": 2, "Business cycle": 2, "IPO vs follow-on": 2,
    "Best efforts vs firm commitment": 2, "Shelf registration": 2,
    "Blue-sky laws": 1, "Market participants": 1, "Third & fourth markets": 2,
    "Rights & warrants": 2, "Rule 144": 2, "Agency & MBS": 2,
    "GO vs revenue munis": 2, "Money market instruments": 1, "Bond ratings": 2,
    "UITs vs mutual funds": 2, "Variable annuities": 2,
    "Share classes & breakpoints": 2, "529 & ABLE": 1, "DPPs & REITs": 2,
    "ETFs vs ETNs": 2, "Inflation & political risk": 2,
    "Liquidity & prepayment risk": 2, "Diversification & rebalancing": 2,
    "Buybacks & tender offers": 2, "Rights offerings & proxies": 2,
    "Basis points & cost basis": 1, "Marking close & backing away": 2,
    "SAR vs CTR": 2, "FinCEN & OFAC": 2, "KYC & suitability": 2,
    "Best interest (Reg BI)": 2, "Do-not-call": 1, "Reg S-P privacy": 2,
    "UTMA accounts": 1, "IRA & RMDs": 1, "Signatures of convenience": 1,
    "IPO purchase restrictions": 1, "Senior exploitation": 2, "Forms U4 & U5": 1,
    "Background checks": 1, "Statutory disqualification": 1,
    "Continuing education": 1, "Outside business activities": 1,
    "Political contributions & gifts": 1, "Customer complaints": 1,
    "Felonies/liens/bankruptcy": 1,
    "Protective put": 2, "Short put": 3, "Muni tax-equivalent yield": 2,
    "Current yield": 2, "Closed-end funds": 1, "Long put breakeven": 2,
    "Zero-coupon bonds": 1,
}

NEW_QUESTIONS = '''
()=>{const k=R(40,90),pr=R(2,9);return Q(2,"Protective put",`An investor owns stock bought at $${k} and buys a $${k} put for $${pr} to protect the position. The maximum loss per share is:`,
  [`$${pr}`,`$${k-pr}`,`$${k+pr}`,"$0"],0,
  `A protective put is insurance: the put floors the stock at the strike, so the worst case is losing the $${pr} premium per share if the stock falls to or below $${k}. Breakeven = stock price + premium = $${k+pr}.`,"Protective put: max loss = premium. Breakeven = stock + premium.")},
()=>{const k=R(30,80),pr=R(1,7);return Q(2,"Short put",`An investor sells a cash-secured $${k} put for $${pr}. Maximum gain and maximum loss per share are:`,
  [`Gain $${pr}; loss $${k-pr}`,`Gain $${k-pr}; loss $${pr}`,"Gain unlimited; loss $"+pr,`Gain $${pr}; loss unlimited`],0,
  `A short put collects the premium (max gain $${pr}) and is obligated to buy the stock at $${k} if assigned. Max loss = strike minus premium = $${k-pr}, realized if the stock falls to zero. Cash-secured means the cash to buy is set aside.`,"Short put: max gain = premium; max loss = strike - premium.")},
()=>{const bracket=pick([24,32,35,37]),y=R(25,45)/10;const tey=y/(1-bracket/100);return Q(2,"Muni tax-equivalent yield",`A municipal bond yields ${y.toFixed(1)}% tax-free. For an investor in the ${bracket}% federal bracket, the tax-equivalent yield on a taxable bond is closest to:`,
  [`${tey.toFixed(1)}%`,`${y.toFixed(1)}%`,`${(y*(1-bracket/100)).toFixed(1)}%`,`${(y+bracket/10).toFixed(1)}%`],0,
  `Tax-equivalent yield = tax-free yield ÷ (1 − bracket) = ${y.toFixed(1)} ÷ (1 − ${(bracket/100).toFixed(2)}) = ${tey.toFixed(1)}%. A taxable bond must beat that to leave the investor with the same after-tax income.`,"TEY = muni yield / (1 - tax bracket).")},
()=>Q(2,"Current yield",`A 6% coupon bond with a $1,000 par value is quoted at 90. Its current yield is closest to:`,
  ["6.7%","6.0%","5.4%","7.5%"],0,
  `Price = 90% of $1,000 = $900. Annual coupon = 6% × $1,000 = $60. Current yield = $60 ÷ $900 = 6.67%. At a discount, coupon (6%) < current yield (6.67%) < YTM.`,"Current yield = annual coupon / price. Discount: coupon < CY < YTM.")},
()=>Q(2,"Closed-end funds",`A closed-end fund has a NAV of $20 per share and trades on an exchange at $22. The fund is trading at:`,
  ["A 10% premium to NAV","A 10% discount to NAV","Par value","Its NAV, because closed-end funds always price at NAV"],0,
  `Premium/discount = (market price − NAV) ÷ NAV = ($22 − $20) ÷ $20 = +10%. Closed-end funds have a fixed share count and trade intraday, so price can sit above (premium) or below (discount) NAV. Open-end funds transact at NAV.`,"Closed-end fund: price vs NAV = premium/discount.")},
'''

EXTRA_QUESTIONS = '''
()=>{const k=R(40,95),pr=R(2,8);return Q(2,"Long put breakeven",`An investor buys a $${k} put for $${pr}. The maximum loss per share and the breakeven price are:`,
  [`Loss $${pr}; breakeven $${k-pr}`,`Loss $${k-pr}; breakeven $${pr}`,`Loss $${pr}; breakeven $${k+pr}`,`Loss $${k}; breakeven $${k-pr}`],0,
  `A long put can lose only the premium paid, $${pr}. It breaks even when the stock price equals the strike minus the premium: $${k} − $${pr} = $${k-pr}. Below that price the put is profitable.`,
  "Long put: max loss = premium; breakeven = strike - premium.")},
()=>Q(2,"Zero-coupon bonds",`A 10-year zero-coupon bond with a $1,000 par value is priced to yield 6%. Which statement is correct?`,
  ["It pays no periodic interest; the return comes from buying at a discount and receiving par at maturity","It pays a 6% semiannual coupon and returns par at maturity","It pays interest in additional bonds rather than cash","Its price equals par because the coupon equals the yield"],0,
  `A zero-coupon bond pays no periodic interest. It is issued at a discount and accretes to par, so the difference between the purchase price and par is the investor's return. The 6% is the yield used to price it, not a cash coupon.`,
  "Zero-coupon: no periodic interest; return = discount to par."),
'''

# 1) Insert the new questions before the closing of GEN.push( ... );
marker = "\n);\nconst UNIT_BY_TOPIC ="
if marker not in html:
    sys.exit("cannot find GEN.push closing marker")
addition = ""
if '"Protective put"' not in html:
    addition += NEW_QUESTIONS
if '"Long put breakeven"' not in html:
    addition += EXTRA_QUESTIONS
if addition:
    html = html.replace(marker, "\n" + addition + "\n);\nconst UNIT_BY_TOPIC =", 1)

# 2) Retag every Q(<sec>,"<topic>" ...)
def retag(m):
    topic = json.loads(m.group(2))
    if topic not in SEC:
        return m.group(0)
    return 'Q(%d,"%s"' % (SEC[topic], topic)

html, n = re.subn(r'Q\((\d+),("(?:[^"\\]|\\.)*")', retag, html)
print("retagged Q( calls touched:", n)

# 3) Rewrite the two mapping objects from the canonical dictionaries.
for name, data in (("UNIT_BY_TOPIC", UNIT), ("DIFF_BY_TOPIC", DIFF)):
    pat = re.compile(r"const " + name + r"\s*=\s*\{.*?\};", re.S)
    if not pat.search(html):
        sys.exit("missing " + name)
    payload = "{ " + ", ".join(json.dumps(k, ensure_ascii=False) + ":" + str(v) for k, v in data.items()) + " }"
    html = pat.sub("const " + name + " = " + payload + ";", html, count=1)

P.write_text(html, encoding="utf-8")
print("wrote", P, len(html), "bytes")
