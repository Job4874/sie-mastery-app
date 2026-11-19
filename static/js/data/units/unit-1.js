/* Unit 1 - Regulators and Capital Markets. Strict JSON inside registerUnit (see tools/content_lib.py). */
SIE.registerUnit(
{
  "id": 1,
  "slug": "regulators-capital-markets",
  "title": "Regulators and Capital Markets",
  "section": 1,
  "summary": "Who makes the rules, where securities trade, how new issues come to market, and how the Fed and the economy move prices.",
  "lessons": [
    {
      "title": "Who makes and enforces the rules",
      "minutes": 5,
      "screens": [
        {
          "kind": "concept",
          "title": "The referees: the SEC and FINRA",
          "body": "<p>Every rule on this exam exists because someone once got hurt. Regulators are the referees.</p><p><b>SEC</b> (Securities and Exchange Commission): the federal government agency. It enforces the federal securities laws and oversees the whole industry, including FINRA.</p><p><b>FINRA</b>: a self-regulatory organization (SRO). It writes and enforces conduct rules for broker-dealers and their registered reps. It examines firms and can fine, suspend, or bar people.</p><p>Exam trap: FINRA is not a government agency.</p>"
        },
        {
          "kind": "concept",
          "title": "The MSRB writes rules but does not enforce them",
          "body": "<p>The <b>MSRB</b> (Municipal Securities Rulemaking Board) writes rules for firms that deal in municipal bonds.</p><p>It does <b>not</b> enforce them. FINRA, the SEC, and bank regulators do the enforcing.</p><p>It also does <b>not</b> regulate the cities and states that issue munis. The <b>Tower Amendment</b> bars the SEC and the MSRB from making muni issuers file disclosure before they sell bonds.</p><p>Memory hook: the MSRB writes, others enforce, and issuers are off-limits.</p>"
        },
        {
          "kind": "check",
          "title": "The MSRB",
          "prompt": "Which statement about the MSRB is true?",
          "choices": ["It examines muni dealers and fines them directly", "It approves each new municipal bond issue before it is sold", "It writes rules for muni dealers, while FINRA, the SEC, and bank regulators enforce them", "It regulates municipal issuers under the Tower Amendment"],
          "answer": 2,
          "explain": "The MSRB is a rule-writing body only. FINRA, the SEC, and bank regulators enforce its rules. The Tower Amendment does the opposite of the last choice: it keeps the SEC and the MSRB from regulating muni issuers' disclosure before a sale."
        },
        {
          "kind": "concept",
          "title": "The rest of the cast",
          "say": "The rest of the cast. State regulators enforce state securities laws, called blue-sky laws, and coordinate through NASAA, the North American Securities Administrators Association. The CBOE is an options exchange that writes rules for options trading on its markets. The Federal Reserve runs monetary policy and sets Regulation T initial margin at 50 percent. The Treasury issues federal debt, and the IRS collects taxes. The DTCC, the Depository Trust and Clearing Corporation, holds securities in book-entry form and clears and settles trades. The OCC, the Options Clearing Corporation, clears and guarantees listed options.",
          "body": "<table class='facts'><thead><tr><th>Who</th><th>Job</th></tr></thead><tbody><tr><td><b>State regulators</b></td><td>Enforce state blue-sky laws; coordinate through NASAA</td></tr><tr><td><b>CBOE</b></td><td>Options exchange; writes rules for options trading on its markets</td></tr><tr><td><b>Federal Reserve</b></td><td>Runs monetary policy; sets Reg T initial margin at 50%</td></tr><tr><td><b>Treasury and IRS</b></td><td>Treasury issues federal debt; the IRS collects taxes</td></tr><tr><td><b>DTCC</b></td><td>Holds securities in book-entry form; clears and settles trades</td></tr><tr><td><b>OCC</b></td><td>Clears and guarantees listed options</td></tr></tbody></table>"
        },
        {
          "kind": "concept",
          "title": "SIPC vs. FDIC",
          "body": "<p><b>SIPC</b> (created in 1970) steps in when a <b>broker-dealer fails</b> and customer assets are missing. It never covers market losses.</p><p>Limit: <b>$500,000 per separate capacity</b>, of which up to <b>$250,000 can be cash</b>.</p><ul><li>Individual account with $300,000 of stock and $50,000 cash: fully covered.</li><li>Joint account with a spouse holding $700,000 of stock: covered to $500,000. A joint account is <b>one</b> capacity, not two.</li><li>An IRA is a separate capacity with its own $500,000.</li></ul><p><b>FDIC</b> is different. It insures <b>bank deposits</b>, not securities.</p>"
        },
        {
          "kind": "check",
          "title": "SIPC limits",
          "prompt": "Maria's individual account at a failed broker-dealer holds $200,000 of stock and $350,000 of cash. How much does SIPC cover?",
          "choices": ["$500,000", "$550,000", "$250,000", "$450,000"],
          "answer": 3,
          "explain": "Cash coverage stops at $250,000, so $100,000 of her cash is unprotected. The $200,000 of stock is covered. Total: $450,000. The trap is $500,000: the overall cap is never reached, because the cash sub-limit bites first."
        },
        {
          "kind": "recap",
          "title": "Lock it in",
          "points": ["The SEC is the federal agency; FINRA is an SRO that polices broker-dealers and reps.", "The MSRB writes muni-dealer rules but does not enforce them or regulate issuers.", "States enforce blue-sky laws and coordinate through NASAA.", "DTCC clears and settles securities trades; OCC clears listed options.", "SIPC covers a failed broker-dealer: $500,000 per capacity, $250,000 cash, never market losses.", "FDIC insures bank deposits, not securities."]
        }
      ]
    },
    {
      "title": "Where securities trade",
      "minutes": 4,
      "screens": [
        {
          "kind": "concept",
          "title": "Primary vs. secondary market",
          "body": "<p>Why it matters: the exam keeps asking one question. Who gets the money?</p><p>The <b>primary market</b> is where new securities are sold for the first time. The <b>issuer gets the proceeds</b>.</p><ul><li><b>IPO</b>: a company sells shares to the public for the first time.</li><li><b>Follow-on offering</b>: an already-public company sells <b>new</b> shares.</li></ul><p>The <b>secondary market</b> is investors trading with each other: on exchanges like the NYSE and Nasdaq, over the counter (OTC), on a physical floor or electronic networks. The issuer gets <b>nothing</b>.</p><p>Trap: a <b>secondary offering</b> sells existing shares held by insiders or early investors. No new shares, so no money to the company.</p>"
        },
        {
          "kind": "concept",
          "title": "Four market labels",
          "say": "Four market labels to know. The primary market sells new issues, and the issuer gets the money. The secondary market is investors trading existing securities with each other. The third market is exchange-listed stock traded over the counter, between dealers. The fourth market is large institutions trading directly with each other, with no broker in the middle, often on electronic networks. Memory hook: third means listed stock off the exchange. Fourth means institutions dealing face to face.",
          "body": "<table class='facts'><thead><tr><th>Market</th><th>What happens there</th></tr></thead><tbody><tr><td><b>Primary</b></td><td>New issues; the issuer gets the money</td></tr><tr><td><b>Secondary</b></td><td>Investors trade existing securities with each other</td></tr><tr><td><b>Third</b></td><td>Exchange-listed stock traded OTC between dealers</td></tr><tr><td><b>Fourth</b></td><td>Large institutions trade directly with each other, no broker in the middle (often on ECNs or ATSs)</td></tr></tbody></table><p>Memory hook: third = listed stock off the exchange. Fourth = institutions face to face.</p>"
        },
        {
          "kind": "check",
          "title": "Third or fourth?",
          "prompt": "A pension fund buys 200,000 shares of an NYSE-listed stock from a dealer in an over-the-counter trade. This trade takes place in the:",
          "choices": ["Fourth market", "Third market", "Primary market", "Secondary offering"],
          "answer": 1,
          "explain": "Exchange-listed stock traded OTC through a dealer is the third market. The trap is the fourth market, which means institutions trading directly with each other, with no dealer or broker in between."
        },
        {
          "kind": "concept",
          "title": "The two founding laws: 1933 and 1934",
          "body": "<p>After the 1929 crash, Congress passed two laws you must keep straight.</p><p><b>Securities Act of 1933</b>: governs the <b>primary market</b>. New public offerings must be registered with the SEC and come with a <b>prospectus</b>, unless an exemption applies. Issuers are liable for lies in it.</p><p><b>Securities Exchange Act of 1934</b>: governs the <b>secondary market</b>. It created the SEC, regulates exchanges and broker-dealers, requires ongoing issuer reporting, and contains the anti-fraud Rule 10b-5.</p><p>Memory hook: 1933 is the new issue. 1934 is everything after.</p>"
        },
        {
          "kind": "check",
          "title": "New shares from a public company",
          "prompt": "A company listed on Nasdaq for five years sells 2 million newly created shares to the public. Which statement is true?",
          "choices": ["It is a follow-on primary offering, covered by the Securities Act of 1933", "It is a secondary-market trade, so the company receives nothing", "It is an IPO, because new shares are being sold", "It is a secondary offering, because the company is already public"],
          "answer": 0,
          "explain": "New shares from an already-public issuer make a follow-on offering in the primary market. The issuer gets the money and the 1933 Act applies. It is not an IPO, which is the first public sale. A secondary offering sells existing shares, not new ones."
        },
        {
          "kind": "recap",
          "title": "Lock it in",
          "points": ["Primary market: new issues, and the issuer gets the money.", "IPO is the first public sale; a follow-on is new shares from a public company.", "Secondary market: investors trade with each other, and the issuer gets nothing.", "Third market is listed stock traded OTC; fourth market is institutions trading directly.", "The 1933 Act covers new issues; the 1934 Act covers trading, exchanges, and broker-dealers."]
        }
      ]
    },
    {
      "title": "Bringing a new issue to market",
      "minutes": 5,
      "screens": [
        {
          "kind": "concept",
          "title": "Investment bankers and the two kinds of deal",
          "body": "<p>Why it matters: a company that needs money hires an <b>investment banker</b> to plan and sell the offering. For big deals, several firms form a <b>syndicate</b> to share the work and the risk.</p><p>The underwriting is one of two kinds:</p><ul><li><b>Firm commitment</b>: the underwriter <b>buys the whole issue</b> and resells it. Unsold shares are the underwriter's problem.</li><li><b>Best efforts</b>: the underwriter acts as an <b>agent</b>. It sells what it can and has no duty to buy the rest.</li></ul><p>Ask yourself: who holds the risk of unsold shares?</p>"
        },
        {
          "kind": "check",
          "title": "Best efforts",
          "prompt": "In a best efforts underwriting, what happens to shares the syndicate cannot sell?",
          "choices": ["The underwriters must buy them at the public offering price", "The SEC cancels the offering", "They stay unsold; the underwriter has no duty to buy them", "The issuer must buy them back from investors"],
          "answer": 2,
          "explain": "Best efforts means the underwriter is only an agent. Unsold shares are simply not sold, and the issuer bears that risk. Buying the whole issue and holding any unsold shares describes a firm commitment."
        },
        {
          "kind": "concept",
          "title": "The registration timeline",
          "say": "The registration timeline. First, the issuer files a registration statement with the SEC. Next comes the cooling-off period, 20 days unless the SEC speeds it up. No sales are allowed yet, but a preliminary prospectus, called a red herring, can be handed out and indications of interest can be taken. On the effective date, sales can begin and the final prospectus is delivered. In the aftermarket, dealers keep delivering the prospectus for 25 days for an exchange-listed IPO, 40 days for certain follow-on offerings, or 90 days for an IPO that will not be exchange-listed. One more trap: the SEC does not approve any offering. It only reviews the disclosure.",
          "body": "<table class='facts'><thead><tr><th>Step</th><th>What happens</th></tr></thead><tbody><tr><td><b>Filing</b></td><td>Issuer files a registration statement with the SEC</td></tr><tr><td><b>Cooling-off</b></td><td>20 days unless the SEC speeds it up. No sales. A preliminary prospectus (red herring) may go out; indications of interest only.</td></tr><tr><td><b>Effective date</b></td><td>Sales begin; final prospectus delivered</td></tr><tr><td><b>Aftermarket</b></td><td>Prospectus delivery: 25 days (listed IPO), 40 days (certain follow-ons), 90 days (unlisted IPO)</td></tr></tbody></table><p>Trap: the SEC never approves an offering. It only reviews the disclosure.</p>"
        },
        {
          "kind": "concept",
          "title": "Shelf registration and the official statement",
          "body": "<p><b>Shelf registration (Rule 415)</b>: the issuer registers once, then sells pieces whenever it needs money, over up to <b>3 years</b>. Each sale is called a takedown. A prospectus is still delivered.</p><p>Example: a company registers $900 million of stock today, sells $300 million now, and sells the rest over the next two years without filing again.</p><p>Municipal bonds are exempt from 1933 Act registration. Instead of a prospectus, a muni issue usually comes with an <b>official statement</b>: the muni version of the disclosure document.</p>"
        },
        {
          "kind": "concept",
          "title": "Public vs. private: exemptions and blue-sky laws",
          "say": "Public versus private. A public offering is registered with the SEC. A private offering uses an exemption instead. Regulation D covers private placements, sold mainly to accredited investors. Rule 144 covers resales of restricted and control stock, which you will meet in Unit 2. Rule 144A covers resales of restricted securities to large institutions, called qualified institutional buyers. Rule 145 covers securities issued in mergers and reclassifications. Rule 147 covers intrastate offerings, where an in-state issuer sells to in-state buyers. Rule 164 covers free writing prospectuses. On top of the SEC, states add their own layer. Blue-sky laws require state registration of offerings, broker-dealers, and agents.",
          "body": "<p>A <b>public offering</b> is registered with the SEC. A <b>private offering</b> uses an exemption instead.</p><table class='facts'><tbody><tr><td><b>Regulation D</b></td><td>Private placements, sold mainly to accredited investors</td></tr><tr><td><b>Rule 144</b></td><td>Resale of restricted and control stock (Unit 2)</td></tr><tr><td><b>Rule 144A</b></td><td>Resale of restricted securities to qualified institutional buyers</td></tr><tr><td><b>Rule 145</b></td><td>Securities issued in mergers and reclassifications</td></tr><tr><td><b>Rule 147</b></td><td>Intrastate offerings: in-state issuer, in-state buyers</td></tr><tr><td><b>Rule 164</b></td><td>Free writing prospectuses</td></tr></tbody></table><p>States add a layer: <b>blue-sky laws</b> require state registration of offerings, broker-dealers, and agents.</p>"
        },
        {
          "kind": "check",
          "title": "Prospectus delivery",
          "prompt": "A company's IPO becomes effective, and its shares will list on the NYSE. For how long after the effective date must dealers deliver the final prospectus?",
          "choices": ["20 days", "90 days", "40 days", "25 days"],
          "answer": 3,
          "explain": "A listed IPO has a 25-day prospectus delivery period. 90 days applies to an IPO that will not be exchange-listed, and 40 days to certain follow-ons. The trap is 20 days: that is the cooling-off period before the effective date."
        },
        {
          "kind": "recap",
          "title": "Lock it in",
          "points": ["Firm commitment: the underwriter buys the whole issue and bears the risk.", "Best efforts: the underwriter is an agent and has no duty to buy unsold shares.", "Cooling-off is 20 days; prospectus delivery is 25, 40, or 90 days.", "The SEC reviews disclosure but never approves an offering.", "Shelf registration (Rule 415): register once, sell over up to 3 years.", "Private offerings use exemptions like Reg D; blue-sky laws add state registration."]
        }
      ]
    },
    {
      "title": "The Fed, the government, and money",
      "minutes": 5,
      "screens": [
        {
          "kind": "concept",
          "title": "Monetary vs. fiscal policy",
          "body": "<p>Why it matters: interest rates move the price of almost everything on this exam.</p><p><b>Monetary policy</b>: the <b>Federal Reserve</b> manages the money supply and interest rates.</p><p><b>Fiscal policy</b>: <b>Congress and the President</b> decide on taxes and government spending.</p><p>Two schools of thought:</p><ul><li><b>Keynesian</b>: the government should actively steer demand with spending and taxes (fiscal policy).</li><li><b>Monetarist</b>: the money supply drives the economy, so the Fed is the key lever.</li></ul>"
        },
        {
          "kind": "concept",
          "title": "The Fed's toolbox",
          "body": "<ul><li><b>Open market operations</b>: the Fed buys or sells Treasury securities. This is its <b>most used</b> tool, directed by the <b>FOMC</b> (Federal Open Market Committee).</li><li><b>Federal funds rate</b>: the overnight rate banks charge each other. The FOMC sets a <b>target range</b>.</li><li><b>Discount rate</b>: what the Fed charges banks that borrow from it directly.</li><li><b>Reserve requirements</b>: rarely changed.</li></ul><p>When the Fed <b>buys</b> Treasuries, money flows into banks and rates tend to fall (easing). When it <b>sells</b>, money drains out and rates tend to rise (tightening).</p>"
        },
        {
          "kind": "check",
          "title": "The Fed's main tool",
          "prompt": "Which tool does the Federal Reserve use most often to carry out monetary policy?",
          "choices": ["Changing reserve requirements", "Open market operations: buying and selling Treasury securities", "Setting Regulation T initial margin at 50%", "Raising or lowering income tax rates"],
          "answer": 1,
          "explain": "Open market operations, directed by the FOMC, are the Fed's main everyday tool. Reserve requirements rarely change. Reg T is a Fed rule, but it is not a tool for steering the economy. Tax rates are fiscal policy, set by Congress and the President."
        },
        {
          "kind": "concept",
          "title": "Treasury securities: bills, notes, and bonds",
          "say": "Treasury securities come in three main types. Treasury bills mature in 4 to 52 weeks. They pay no coupon. You buy them at a discount and get full face value at maturity. For example, pay 980 dollars for a 1,000 dollar bill, and the 20 dollar difference is your interest. Treasury notes mature in 2, 3, 5, 7, or 10 years and pay interest every six months. Treasury bonds mature in 20 or 30 years and also pay interest every six months. All are backed by the full faith and credit of the U.S. government, and they are the securities the Fed buys and sells in open market operations.",
          "body": "<table class='facts'><thead><tr><th>Type</th><th>Maturity</th><th>How you earn</th></tr></thead><tbody><tr><td><b>Bills</b></td><td>4 to 52 weeks</td><td>Bought at a discount; no coupon</td></tr><tr><td><b>Notes</b></td><td>2, 3, 5, 7, or 10 years</td><td>Interest every six months</td></tr><tr><td><b>Bonds</b></td><td>20 or 30 years</td><td>Interest every six months</td></tr></tbody></table><p>Example: pay $980 for a $1,000 T-bill. The $20 difference is your interest.</p><p>All are backed by the full faith and credit of the U.S. government.</p>"
        },
        {
          "kind": "concept",
          "title": "The dollar and the world",
          "body": "<p><b>Balance of payments</b>: a country's record of all money flowing in from, and out to, the rest of the world. If more flows out than in, it runs a deficit.</p><p><b>Exchange rates</b> set what one currency buys in another:</p><ul><li><b>Weaker dollar</b>: U.S. exports get cheaper abroad, so exporters benefit. Imports cost more.</li><li><b>Stronger dollar</b>: imports get cheaper. U.S. exporters struggle.</li></ul><p>Currency moves also change what U.S. investors earn on foreign holdings.</p>"
        },
        {
          "kind": "check",
          "title": "Name that Treasury",
          "prompt": "An investor pays $9,850 for a 26-week Treasury security with a $10,000 face value and no coupon. What is it?",
          "choices": ["A Treasury bill; the $150 discount is its interest", "A Treasury note; it pays $150 every six months", "A Treasury bond; it matures in 26 years", "A municipal note; it is exempt from federal tax"],
          "answer": 0,
          "explain": "Under a year, sold at a discount, no coupon: that is a T-bill. The investor earns the $150 difference at maturity. Notes (2 to 10 years) and bonds (20 or 30 years) pay interest every six months."
        },
        {
          "kind": "recap",
          "title": "Lock it in",
          "points": ["Monetary policy is the Fed; fiscal policy is Congress and the President.", "Keynesians favor fiscal policy; Monetarists focus on the money supply.", "Open market operations are the Fed's most used tool; buying Treasuries eases, selling tightens.", "The FOMC sets a target range for the federal funds rate.", "T-bills: 4 to 52 weeks at a discount. Notes: 2 to 10 years. Bonds: 20 or 30 years.", "A weaker dollar helps U.S. exporters; a stronger dollar makes imports cheaper."]
        }
      ]
    },
    {
      "title": "Reading the economy",
      "minutes": 5,
      "screens": [
        {
          "kind": "concept",
          "title": "The business cycle",
          "body": "<p>Why it matters: the economy moves in waves, and different investments win in different phases.</p><p>Output is measured by <b>GDP</b> (gross domestic product): everything produced <b>inside</b> the U.S. <b>GNP</b> (gross national product) counts what U.S. residents and companies produce <b>anywhere</b> in the world.</p><p>The four phases:</p><ol><li><b>Expansion</b>: output, jobs, and income rise.</li><li><b>Peak</b>: the top.</li><li><b>Contraction</b>: activity falls.</li><li><b>Trough</b>: the bottom, before the next expansion.</li></ol>"
        },
        {
          "kind": "concept",
          "title": "Leading, coincident, and lagging indicators",
          "body": "<ul><li><b>Leading</b> indicators change <b>before</b> the economy turns: building permits, new orders, stock prices, consumer confidence.</li><li><b>Coincident</b> indicators move <b>with</b> the economy: GDP, industrial production, personal income.</li><li><b>Lagging</b> indicators change <b>after</b>: how long people stay unemployed, consumer price changes (CPI), the prime rate.</li></ul><p>Memory hook: permits come before houses get built. Unemployment and inflation numbers confirm what already happened.</p>"
        },
        {
          "kind": "check",
          "title": "Spot the leader",
          "prompt": "Which of these is a leading economic indicator?",
          "choices": ["Last quarter's GDP", "The unemployment rate", "The consumer price index (CPI)", "New building permits"],
          "answer": 3,
          "explain": "Building permits change before construction and hiring pick up, so they lead the economy. GDP moves with the economy (coincident). Unemployment and CPI confirm turns after they happen."
        },
        {
          "kind": "concept",
          "title": "Stocks and the cycle",
          "body": "<ul><li><b>Cyclical</b> stocks rise and fall with the economy: autos, steel, housing, luxury goods. Strong in expansions, weak in contractions.</li><li><b>Defensive</b> stocks hold up in downturns, because people buy their products anyway: food, utilities, health care, household staples.</li><li><b>Growth</b> stocks belong to companies whose earnings grow faster than the economy. They usually reinvest profits and pay little or no dividend.</li></ul>"
        },
        {
          "kind": "concept",
          "title": "Reading a company: two statements",
          "body": "<p><b>Balance sheet</b>: a snapshot on one date of what the company owns and owes. Assets equal liabilities plus shareholders' equity.</p><p>Example: $10 million of assets and $6 million of liabilities leaves $4 million of shareholders' equity.</p><p><b>Income statement</b>: results over a period, like a quarter or a year. Revenue minus expenses equals net income.</p><p>Memory hook: the balance sheet is a photo. The income statement is a video.</p>"
        },
        {
          "kind": "check",
          "title": "Riding out a downturn",
          "prompt": "The economy is entering a contraction. Which stock is most likely to hold its value best?",
          "choices": ["An automaker", "A luxury hotel chain", "An electric utility", "A steel producer"],
          "answer": 2,
          "explain": "Utilities are defensive: people keep paying for power in a downturn. Autos, luxury travel, and steel are cyclical, so they tend to fall with the economy."
        },
        {
          "kind": "recap",
          "title": "Lock it in",
          "points": ["GDP counts output inside the U.S.; GNP counts output by U.S. residents anywhere.", "The cycle runs expansion, peak, contraction, trough.", "Leading indicators turn first: building permits, new orders, stock prices.", "GDP is coincident; unemployment duration and CPI lag.", "Cyclical stocks follow the economy; defensive stocks hold up in downturns.", "Balance sheet is a snapshot; the income statement covers a period."]
        }
      ]
    }
  ]
}
);
