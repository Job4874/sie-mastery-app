/* Unit 3 - Debt Instruments. Strict JSON inside registerUnit (see tools/content_lib.py). */
SIE.registerUnit(
{
  "id": 3,
  "slug": "debt-instruments",
  "title": "Debt Instruments",
  "section": 2,
  "summary": "Bonds from the ground up: price and yield, the yield ladder, calls and convertibles, Treasuries and CMOs, munis, money markets, and ratings.",
  "lessons": [
    {
      "title": "Bond basics: price, yield, and duration",
      "minutes": 4,
      "screens": [
        {
          "kind": "concept",
          "title": "A bond is a loan",
          "body": "<p>Why it matters: bonds are a big slice of the Products section, and almost every bond question rests on the ideas in this lesson.</p><p>A <b>bond</b> is a loan to an issuer. You lend the money. The issuer pays you interest and returns your money at <b>maturity</b>.</p><ul><li><b>Par</b> (face value): what you get back at maturity, usually $1,000.</li><li><b>Coupon</b>: the fixed interest rate, set when the bond is issued.</li><li><b>Yield</b>: the return you actually earn, based on the price you paid.</li></ul><p>A 5% coupon on $1,000 par pays $50 a year, usually as two $25 payments.</p>"
        },
        {
          "kind": "example",
          "title": "The seesaw: price and yield",
          "body": "<p>You own a 5% bond paying $50 a year. Then new bonds start paying <b>6%</b>.</p><p>Nobody will pay a full $1,000 for your $50 when a new bond pays $60. So your bond's price <b>falls</b> below par, to a <b>discount</b>, until its yield matches the market.</p><p>If new bonds paid only 4%, your $50 would look great. Its price would <b>rise</b> above par, to a <b>premium</b>.</p><p>The rule: <b>price and yield move in opposite directions. Always.</b> The coupon never changes. The price does.</p>"
        },
        {
          "kind": "concept",
          "title": "Duration: who swings the most",
          "body": "<p><b>Duration</b> measures how much a bond's price moves when interest rates change. Higher duration means bigger price swings.</p><ul><li><b>Longer maturity</b> means higher duration.</li><li><b>Lower coupon</b> means higher duration.</li></ul><p>So the most rate-sensitive bond is a long <b>zero-coupon</b> bond. It pays no interest along the way. All of its value sits at maturity, far in the future.</p><p>A short bond with a high coupon swings the least, because your cash comes back sooner.</p>"
        },
        {
          "kind": "check",
          "title": "Most rate-sensitive",
          "prompt": "Which bond's price will move the most if interest rates rise by 1%?",
          "choices": [
            "A 2-year bond with an 8% coupon",
            "A 5-year zero-coupon bond",
            "A 30-year bond with an 8% coupon",
            "A 30-year zero-coupon bond"
          ],
          "answer": 3,
          "explain": "Duration rises with maturity and falls with coupon. The 30-year zero has the longest maturity and no coupon, so it has the highest duration. The 30-year 8% bond is the trap: same maturity, but its coupons return cash sooner and cushion the swing."
        },
        {
          "kind": "recap",
          "title": "Lock it in",
          "points": [
            "A bond is a loan: par is usually $1,000 and the coupon is fixed.",
            "Price and yield move in opposite directions, always.",
            "Rates up means bond prices down. Rates down means bond prices up.",
            "Longer maturity and lower coupon mean higher duration and bigger swings.",
            "A long zero-coupon bond is the most rate-sensitive bond."
          ]
        }
      ]
    },
    {
      "title": "The yield ladder",
      "minutes": 5,
      "screens": [
        {
          "kind": "concept",
          "title": "Three ways to measure yield",
          "body": "<p>Why it matters: the exam loves asking you to rank yields. Learn three yields, and one picture does the rest.</p><ul><li><b>Nominal yield</b> (the coupon rate): the fixed rate printed on the bond. It never changes.</li><li><b>Current yield</b>: annual interest divided by today's price.</li><li><b>Yield to maturity (YTM)</b>: your total return if you hold to maturity. It counts the interest plus any gain or loss as the price moves back to par.</li></ul>"
        },
        {
          "kind": "example",
          "title": "Worked example: a discount bond",
          "say": "Worked example: a discount bond. A 5 percent bond pays 50 dollars a year. You buy it at a discount for 900 dollars. Nominal yield is 5 percent, and it is fixed. Current yield is 50 dollars divided by 900, about 5.6 percent. Yield to maturity is higher still. You collect 50 dollars every year, plus a 100 dollar gain when the bond pays back 1,000 dollars at maturity. So for a discount bond, lowest to highest: nominal, then current, then yield to maturity.",
          "body": "<p>A 5% bond pays $50 a year. You buy it at a discount for <b>$900</b>.</p><ul><li>Nominal yield: <b>5%</b>. Fixed.</li><li>Current yield: $50 divided by $900, about <b>5.6%</b>.</li><li>Yield to maturity: <b>higher still</b>. You collect $50 every year, plus a $100 gain when the bond pays back $1,000 at maturity.</li></ul><p>So for a discount bond, lowest to highest: <b>nominal, then current, then YTM</b>.</p>"
        },
        {
          "kind": "concept",
          "title": "Premium bonds flip the ladder",
          "say": "Premium bonds flip the ladder. Now buy that same 5 percent bond at a premium, for 1,100 dollars. Current yield is 50 dollars divided by 1,100, about 4.5 percent. At maturity you get back only 1,000 dollars, a 100 dollar loss, so yield to maturity is lower still. Here is the whole picture. At a discount, lowest to highest is nominal, then current, then yield to maturity. At par, all three are equal. At a premium, the order flips: yield to maturity, then current, then nominal.",
          "body": "<p>Now buy that same 5% bond at a premium, for <b>$1,100</b>. Current yield is $50 divided by $1,100, about 4.5%. At maturity you get back only $1,000, a $100 loss, so YTM is lower still.</p><table class='facts'><thead><tr><th>Bond price</th><th>Yields, lowest to highest</th></tr></thead><tbody><tr><td>Discount</td><td>Nominal, current, YTM</td></tr><tr><td>Par</td><td>All three are equal</td></tr><tr><td>Premium</td><td>YTM, current, nominal</td></tr></tbody></table>"
        },
        {
          "kind": "check",
          "title": "Rank the yields",
          "prompt": "A bond is trading at a discount. Which ranks its yields from lowest to highest?",
          "choices": [
            "Yield to maturity, current yield, nominal yield",
            "Nominal yield, current yield, yield to maturity",
            "Current yield, nominal yield, yield to maturity",
            "All three yields are equal"
          ],
          "answer": 1,
          "explain": "At a discount, the coupon is the lowest. Current yield is higher because you paid less than par. YTM is highest because it adds the gain back to par. The first choice is the premium-bond order, the classic flip trap. All three are equal only at par."
        },
        {
          "kind": "recap",
          "title": "Lock it in",
          "points": [
            "Nominal yield is the fixed coupon rate.",
            "Current yield is annual interest divided by price.",
            "Yield to maturity adds the gain or loss back to par.",
            "Discount bond, lowest to highest: nominal, then current, then YTM.",
            "Premium bond: the order flips. At par, all three are equal."
          ]
        }
      ]
    },
    {
      "title": "Calls and convertibles",
      "minutes": 5,
      "screens": [
        {
          "kind": "concept",
          "title": "Callable bonds",
          "body": "<p>Why it matters: a call feature changes which yield you can count on.</p><p>A <b>callable bond</b> lets the issuer pay it off early, at a set call price, before maturity.</p><p>When do issuers call? When <b>rates fall</b>. Like a homeowner refinancing, the issuer retires the expensive old bond and borrows again more cheaply.</p><p>That hurts the investor twice. The high coupon stops, and the money comes back just when new bonds pay less. That is <b>reinvestment risk</b>, and it lives in falling rates.</p>"
        },
        {
          "kind": "concept",
          "title": "Yield to call and yield to worst",
          "body": "<p><b>Yield to call (YTC)</b> is your return if the bond is called at the first chance.</p><p>A <b>premium</b> bond is the one most likely to be called, because its coupon is above market rates. A call also cuts short the time you have to earn back the premium you paid. So YTC is lower than YTM, and <b>YTC governs</b>.</p><p>For a <b>discount</b> bond, YTM is the lower figure, so <b>YTM governs</b>.</p><p>Firms quote <b>yield to worst</b>: the lower of YTC and YTM. Always plan on the worst case.</p>"
        },
        {
          "kind": "check",
          "title": "Premium and callable",
          "prompt": "An investor buys a callable bond at a premium. Which yield best represents the likely return and should be quoted?",
          "choices": [
            "Nominal yield",
            "Current yield",
            "Yield to maturity, always",
            "Yield to worst, which here is the yield to call"
          ],
          "answer": 3,
          "explain": "A premium bond is likely to be called early, so its yield to call is lower than its YTM. The lower figure, yield to worst, governs and is quoted. Yield to maturity 'always' is the trap: YTM governs only for discount bonds."
        },
        {
          "kind": "example",
          "title": "Convertible bonds",
          "body": "<p>A <b>convertible bond</b> can be swapped for a set number of the issuer's common shares.</p><p>Example: a $1,000 bond convertible at <b>$40</b> a share converts into 1,000 divided by 40, or <b>25 shares</b>.</p><ul><li>Stock at <b>$60</b>: 25 shares are worth $1,500. The bond is deep in the money and <b>trades like the stock</b>.</li><li>Stock at <b>$20</b>: 25 shares are worth $500. Converting makes no sense, so the bond <b>trades like a bond</b>, on its yield and credit quality.</li></ul><p>Investors usually accept a lower coupon in exchange for that upside.</p>"
        },
        {
          "kind": "check",
          "title": "When a convertible acts like stock",
          "prompt": "A convertible bond will trade mainly on its value as stock when:",
          "choices": [
            "Interest rates rise sharply",
            "The issuer's credit rating falls",
            "The stock price is well above the conversion price",
            "The bond is close to maturity"
          ],
          "answer": 2,
          "explain": "When the stock is far above the conversion price, the shares the bond converts into are worth more than the bond itself, so the bond tracks the stock. Interest rates and credit ratings drive the price in the opposite case, when the stock is far below the conversion price and the bond trades on its bond value."
        },
        {
          "kind": "recap",
          "title": "Lock it in",
          "points": [
            "Issuers call bonds when rates fall, which creates reinvestment risk.",
            "Premium bonds are likely to be called, so yield to call governs.",
            "Discount bonds are governed by yield to maturity.",
            "Quote yield to worst: the lower of YTC and YTM.",
            "Convertibles trade like stock when deep in the money and like bonds when far out of the money."
          ]
        }
      ]
    },
    {
      "title": "Treasuries, agencies, and CMOs",
      "minutes": 5,
      "screens": [
        {
          "kind": "concept",
          "title": "Treasury bills, notes, and bonds",
          "say": "Treasury bills, notes, and bonds. Why it matters: U.S. Treasuries are the benchmark for every other bond. They are backed by the full faith and credit of the U.S. government. Bills mature in 1 year or less. They are sold at a discount and pay no coupon. Notes mature in 2 to 10 years and pay interest every six months. Bonds mature in 20 or 30 years and also pay interest every six months. A T-bill bought for 990 dollars that matures at 1,000 dollars earns its return from that 10 dollar discount.",
          "body": "<p>Why it matters: U.S. Treasuries are the benchmark for every other bond. They are backed by the full faith and credit of the U.S. government.</p><table class='facts'><thead><tr><th>Type</th><th>Maturity</th><th>How it pays</th></tr></thead><tbody><tr><td><b>Bills</b></td><td>1 year or less</td><td>Sold at a discount, no coupon</td></tr><tr><td><b>Notes</b></td><td>2 to 10 years</td><td>Interest every six months</td></tr><tr><td><b>Bonds</b></td><td>20 or 30 years</td><td>Interest every six months</td></tr></tbody></table><p>A T-bill bought for $990 that matures at $1,000 earns its return from that $10 discount.</p>"
        },
        {
          "kind": "concept",
          "title": "Agency pass-throughs",
          "body": "<p>A <b>mortgage-backed security (MBS)</b> pools thousands of home mortgages. Each month, homeowners' payments of principal and interest <b>pass through</b> to investors, minus fees.</p><ul><li><b>Ginnie Mae</b>: backed by the U.S. government.</li><li><b>Fannie Mae</b> and <b>Freddie Mac</b>: government-sponsored enterprises (GSEs). They are not direct government obligations.</li></ul><p>The catch: homeowners can pay off early. When rates fall, they refinance, and your principal comes back sooner than planned. That is <b>prepayment risk</b>.</p>"
        },
        {
          "kind": "concept",
          "title": "CMOs: slicing the pool into tranches",
          "body": "<p>A <b>collateralized mortgage obligation (CMO)</b> splits mortgage cash flows into slices called <b>tranches</b>.</p><ul><li><b>PAC tranche</b> (planned amortization class): follows a planned payment schedule, so it is more predictable.</li><li><b>Support tranche</b> (also called companion): absorbs the prepayment surprises so the PAC can stay on schedule.</li></ul><p>The PAC gets stability. The support tranche takes the shock, so it carries the most prepayment risk.</p>"
        },
        {
          "kind": "example",
          "title": "Contraction vs. extension",
          "body": "<p>Ask one question: <b>who takes the shock?</b> The support tranche.</p><p><b>Rates fall.</b> Homeowners refinance and prepayments surge. The support tranche gets the extra principal early. Its average life shortens: <b>contraction</b>.</p><p><b>Rates rise.</b> Refinancing stops and prepayments dry up. The support tranche waits longer to be paid. Its average life stretches: <b>extension</b>.</p><p>Memory hook: rates fall, life shrinks. Rates rise, life stretches.</p>"
        },
        {
          "kind": "check",
          "title": "Who takes the shock",
          "prompt": "Interest rates rise sharply and mortgage prepayments collapse. What will a support tranche backing a PAC tranche most likely experience?",
          "choices": [
            "Extension: principal comes back later than expected",
            "Contraction: principal comes back early",
            "No change: PAC protection removes all prepayment risk",
            "The PAC tranche absorbs the slowdown first"
          ],
          "answer": 0,
          "explain": "Rising rates stop refinancing, so prepayments slow. The support tranche gets paid more slowly to keep the PAC on schedule, so its life extends. Contraction is the falling-rate case. And the PAC never absorbs shocks for the support tranche; it is the other way around."
        },
        {
          "kind": "recap",
          "title": "Lock it in",
          "points": [
            "T-bills: 1 year or less, sold at a discount. Notes: 2 to 10 years. Bonds: 20 or 30 years.",
            "Mortgage-backed securities pass principal and interest through to investors.",
            "Ginnie Mae is government-backed. Fannie Mae and Freddie Mac are GSEs.",
            "In a CMO, the support tranche absorbs prepayment shocks to protect the PAC.",
            "Rates fall means contraction. Rates rise means extension."
          ]
        }
      ]
    },
    {
      "title": "Ratings, munis, and money markets",
      "minutes": 5,
      "screens": [
        {
          "kind": "concept",
          "title": "Corporate bonds and credit ratings",
          "say": "Corporate bonds and credit ratings. Why it matters: with corporate and municipal bonds, the big question is simple. Will I get paid? Rating agencies grade that default risk. The key line: investment grade is Baa3 from Moody's, or triple B minus from S and P, and above. Speculative grade, also called high yield or junk, is anything lower, starting at Ba1 or double B plus. A lower rating means more credit risk, so investors demand a higher yield. The trap: a rating measures default risk, not how much the price swings when rates move.",
          "body": "<p>Why it matters: with corporate and municipal bonds, the big question is simple. <b>Will I get paid?</b></p><p>Rating agencies grade that default risk. The key line:</p><ul><li><b>Investment grade</b>: Baa3 (Moody's) or BBB- (S&amp;P) and above.</li><li><b>Speculative grade</b> (high yield, or junk): anything lower, starting at Ba1 or BB+.</li></ul><p>A lower rating means more credit risk, so investors demand a higher yield.</p><p>Trap: a rating measures <b>default risk</b>, not how much the price swings when rates move.</p>"
        },
        {
          "kind": "check",
          "title": "The investment-grade line",
          "prompt": "What is the lowest rating that still counts as investment grade?",
          "choices": [
            "Baa3 from Moody's, BBB- from S&amp;P",
            "Ba1 from Moody's, BB+ from S&amp;P",
            "A from Moody's, A from S&amp;P",
            "Caa from Moody's, CCC from S&amp;P"
          ],
          "answer": 0,
          "explain": "Baa3 and BBB- are the bottom rung of investment grade. Ba1 and BB+ are the trap: just one notch lower, they are the top of speculative grade, or junk."
        },
        {
          "kind": "concept",
          "title": "Municipal bonds: GO vs. revenue",
          "body": "<p><b>Municipal bonds</b> are issued by states, cities, and other local governments.</p><ul><li><b>General obligation (GO)</b>: backed by the issuer's <b>full faith and credit</b>, meaning its power to tax.</li><li><b>Revenue bond</b>: backed only by money from a specific project, like tolls from a bridge or fees from an airport.</li></ul><p>GO bonds are generally seen as safer, because taxes back them. If a toll road gets few drivers, revenue bondholders feel it.</p><p>Also in muni land: <b>municipal fund securities</b>, such as 529 plans, ABLE accounts, and local government investment pools (LGIPs).</p>"
        },
        {
          "kind": "check",
          "title": "What backs a GO bond",
          "prompt": "A general obligation municipal bond is backed by:",
          "choices": [
            "Revenue from a specific project, such as tolls",
            "The issuer's full faith and credit, including its taxing power",
            "A pool of residential mortgages",
            "Treasury securities held in escrow"
          ],
          "answer": 1,
          "explain": "A GO bond is backed by the issuer's full faith and credit, which means its power to tax. Project revenue, like tolls or fees, is what backs a revenue bond. That swap is the classic trap."
        },
        {
          "kind": "concept",
          "title": "Money market instruments",
          "body": "<p>The <b>money market</b> is short-term debt with a maturity of <b>1 year or less</b>. Think safe, liquid, and close to cash.</p><ul><li><b>Treasury bills</b></li><li><b>Commercial paper</b>: short-term, unsecured corporate debt</li><li><b>Banker's acceptances</b>: used to finance trade</li><li><b>Certificates of deposit (CDs)</b></li><li><b>Repurchase agreements (repos)</b></li></ul><p>Trap: stocks, preferred stock, REITs, and long-term bonds are never money market instruments, no matter how safe they feel.</p>"
        },
        {
          "kind": "check",
          "title": "Spot the money market instrument",
          "prompt": "Which of these is a money market instrument?",
          "choices": [
            "Preferred stock",
            "A 30-year Treasury bond",
            "REIT shares",
            "Commercial paper"
          ],
          "answer": 3,
          "explain": "Commercial paper is short-term corporate debt that matures in 1 year or less. The 30-year Treasury is the trap: it is just as safe from default, but its maturity is far too long. Preferred stock and REITs are equity, not short-term debt."
        },
        {
          "kind": "recap",
          "title": "Lock it in",
          "points": [
            "Investment grade is Baa3 or BBB- and above. Below that is junk.",
            "Ratings measure default risk, not price swings.",
            "GO bonds are backed by taxing power. Revenue bonds are backed by project revenue.",
            "Municipal fund securities include 529 plans, ABLE accounts, and LGIPs.",
            "Money market instruments mature in 1 year or less: T-bills, commercial paper, banker's acceptances, CDs, and repos."
          ]
        }
      ]
    }
  ]
}
);
