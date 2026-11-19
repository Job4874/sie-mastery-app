/* Unit 4 - Options and Packaged Products. Strict JSON inside registerUnit (see tools/content_lib.py). */
SIE.registerUnit(
{
  "id": 4,
  "slug": "options-packaged-products",
  "title": "Options and Packaged Products",
  "section": 2,
  "summary": "Calls, puts, breakevens, and covered calls, then mutual funds, closed-end funds, ETFs, UITs, share classes, and variable annuities.",
  "lessons": [
    {
      "title": "Options vocabulary",
      "minutes": 5,
      "screens": [
        {
          "kind": "concept",
          "title": "What an option is",
          "body": "<p>Why it matters: options questions are pure logic once the words click. This lesson is the words.</p><p>An <b>option</b> is a contract that gives its buyer a <b>right</b>, but not an obligation.</p><ul><li>A <b>call</b> is the right to <b>buy</b> stock at a set price.</li><li>A <b>put</b> is the right to <b>sell</b> stock at a set price.</li></ul><p>That set price is the <b>strike price</b>. The buyer pays a <b>premium</b> for the right, which lasts until the <b>expiration date</b>. One standard equity option contract covers <b>100 shares</b>.</p>"
        },
        {
          "kind": "concept",
          "title": "Buyers and writers",
          "body": "<p>Every option has two sides.</p><ul><li>The <b>buyer</b> (holder, or long) pays the premium and gets the right. The most a buyer can lose is the premium.</li><li>The <b>writer</b> (seller, or short) collects the premium and takes on the <b>obligation</b> to buy or sell if the buyer exercises.</li></ul><p>When a buyer <b>exercises</b>, a writer is <b>assigned</b> and must perform.</p><p>A call writer who owns the stock is <b>covered</b>. One who does not is <b>uncovered</b>, or naked. A naked call has unlimited risk, because a stock price has no ceiling.</p>"
        },
        {
          "kind": "concept",
          "title": "In, at, or out of the money",
          "say": "In, at, or out of the money. Moneyness asks one thing: would exercising right now be worth anything? Take a 50 dollar strike. With the stock at 55, the call is in the money, because you could buy at 50 a stock worth 55. The put is out of the money. With the stock at 50, both are at the money. With the stock at 45, the call is out of the money and the put is in the money, because you could sell at 50 a stock worth only 45. Calls are in the money when the stock is above the strike. Puts are in the money when it is below.",
          "body": "<p>Moneyness asks one thing: would exercising right now be worth anything? Take a <b>$50 strike</b>.</p><table class='facts'><thead><tr><th>Stock price</th><th>$50 call</th><th>$50 put</th></tr></thead><tbody><tr><td>$55</td><td>In the money</td><td>Out of the money</td></tr><tr><td>$50</td><td>At the money</td><td>At the money</td></tr><tr><td>$45</td><td>Out of the money</td><td>In the money</td></tr></tbody></table><p>Calls are in the money when the stock is <b>above</b> the strike. Puts are in the money when it is <b>below</b>.</p>"
        },
        {
          "kind": "concept",
          "title": "Styles, paperwork, and the clearinghouse",
          "body": "<ul><li><b>American style</b>: exercise any time up to expiration.</li><li><b>European style</b>: exercise only at expiration.</li><li><b>Equity options</b> are on a single stock. <b>Index options</b> are on a market index.</li><li>The <b>Options Disclosure Document (ODD)</b> explains the risks of options. A customer must receive it at or before approval for options trading.</li><li>The <b>Options Clearing Corporation (OCC)</b> clears listed options and guarantees that each contract is honored.</li></ul><p>Trap: American and European describe <b>when</b> you can exercise, not where the option trades.</p>"
        },
        {
          "kind": "check",
          "title": "Is this put in the money?",
          "prompt": "An investor owns a $40 put. The stock is trading at $36. The put is:",
          "choices": [
            "Out of the money, because the stock is below the strike",
            "At the money, because it has not expired yet",
            "In the money, because the holder can sell at $40 a stock worth $36",
            "Worthless, because puts only gain when the stock rises"
          ],
          "answer": 2,
          "explain": "A put is the right to sell at the strike. Selling at $40 a stock worth $36 is worth $4, so the put is in the money. Calling it out of the money is the trap: below the strike is out of the money for a call, not a put."
        },
        {
          "kind": "recap",
          "title": "Lock it in",
          "points": [
            "A call is the right to buy. A put is the right to sell.",
            "Buyers pay the premium and can lose only the premium.",
            "Writers take on the obligation. Naked call writers face unlimited risk.",
            "Calls are in the money above the strike. Puts are in the money below it.",
            "American style exercises any time. European style only at expiration.",
            "Customers get the ODD. The OCC clears listed options."
          ]
        }
      ]
    },
    {
      "title": "Long calls and long puts",
      "minutes": 5,
      "screens": [
        {
          "kind": "concept",
          "title": "The breakeven idea",
          "body": "<p>Why it matters: breakeven questions are free points once you know two formulas.</p><p>The premium is a cost. The stock has to move far enough to pay it back before you profit.</p><ul><li><b>Long call breakeven</b> = strike <b>plus</b> premium. Calls profit when the stock goes up, so you add.</li><li><b>Long put breakeven</b> = strike <b>minus</b> premium. Puts profit when the stock goes down, so you subtract.</li></ul><p>Memory hook: <b>call up, put down.</b></p>"
        },
        {
          "kind": "example",
          "title": "Worked example: a long call",
          "say": "Worked example: a long call. You buy one 50 dollar call for a 3 dollar premium. Cost: 3 dollars times 100 shares, or 300 dollars. Breakeven is 50 plus 3, which is 53 dollars. Max loss is the 300 dollar premium, if the stock stays at or below 50. Max gain is unlimited, because a stock has no price ceiling. Stock at 60 at expiration? The call is worth 10 dollars. Minus the 3 you paid, you net 7 dollars a share, or 700 dollars.",
          "body": "<p>You buy one <b>$50 call</b> for a <b>$3</b> premium. Cost: $3 times 100 shares, or <b>$300</b>.</p><ul><li><b>Breakeven</b>: $50 + $3 = <b>$53</b>.</li><li><b>Max loss</b>: the $300 premium, if the stock stays at or below $50.</li><li><b>Max gain</b>: unlimited. A stock has no price ceiling.</li></ul><p>Stock at $60 at expiration? The call is worth $10. Minus the $3 you paid, you net $7 a share, or $700.</p>"
        },
        {
          "kind": "check",
          "title": "Long call numbers",
          "prompt": "An investor buys a $65 call for $4. What are the breakeven and the maximum loss?",
          "choices": [
            "Breakeven $61; max loss $400",
            "Breakeven $69; max loss unlimited",
            "Breakeven $65; max loss $4",
            "Breakeven $69; max loss $400"
          ],
          "answer": 3,
          "explain": "Long call breakeven is strike plus premium: 65 plus 4 is $69. A buyer can lose only the premium: $4 times 100 shares is $400. The $61 breakeven is the trap: subtracting the premium is the put formula."
        },
        {
          "kind": "example",
          "title": "Worked example: a long put",
          "body": "<p>You buy one <b>$60 put</b> for a <b>$4</b> premium. Cost: <b>$400</b>.</p><ul><li><b>Breakeven</b>: $60 minus $4 = <b>$56</b>.</li><li><b>Max loss</b>: the $400 premium, if the stock stays at or above $60.</li><li><b>Max gain</b>: if the stock falls to $0, you can still sell at $60. After the premium, that is $56 a share, or <b>$5,600</b>.</li></ul><p>A put's gain is big but capped, because a stock cannot fall below zero.</p>"
        },
        {
          "kind": "check",
          "title": "Long put numbers",
          "prompt": "An investor buys a $45 put for $5. What are the breakeven and the maximum gain per share?",
          "choices": [
            "Breakeven $50; max gain unlimited",
            "Breakeven $40; max gain $40 per share",
            "Breakeven $40; max gain $45 per share",
            "Breakeven $45; max gain $5 per share"
          ],
          "answer": 1,
          "explain": "Long put breakeven is strike minus premium: 45 minus 5 is $40. If the stock goes to zero, the investor sells at $45 but paid $5, so the max gain is $40 a share. The $45 choice forgets to subtract the premium. Unlimited gain belongs to a long call, not a put."
        },
        {
          "kind": "recap",
          "title": "Lock it in",
          "points": [
            "Long call breakeven is strike plus premium.",
            "Long put breakeven is strike minus premium.",
            "A buyer's maximum loss is the premium paid.",
            "A long call's maximum gain is unlimited.",
            "A long put's maximum gain is strike minus premium per share, reached if the stock falls to zero."
          ]
        }
      ]
    },
    {
      "title": "Covered calls and naked risk",
      "minutes": 4,
      "screens": [
        {
          "kind": "concept",
          "title": "Why write a covered call",
          "body": "<p>Why it matters: the covered call is the most common options strategy, and the exam loves its math.</p><p>In a <b>covered call</b>, you own 100 shares and sell (write) one call on them.</p><ul><li>You collect the premium as <b>extra income</b>.</li><li>In return, you give up gains above the strike. If the stock jumps, your shares get called away at the strike price.</li></ul><p>The premium also cushions a drop in the stock, but only by the amount of the premium.</p>"
        },
        {
          "kind": "example",
          "title": "Worked example: buy at $40, sell the $40 call",
          "body": "<p>You buy 100 shares at <b>$40</b> and sell a <b>$40 call</b> for <b>$3</b>.</p><ul><li><b>Max gain</b>: $3 a share, or $300. If the stock rises, you sell at $40 what you bought at $40. You keep only the premium.</li><li><b>Breakeven</b>: $40 minus $3 = <b>$37</b>.</li><li><b>Max loss</b>: $37 a share, or $3,700, if the stock goes to zero. The premium softens the fall by $3.</li></ul><p>Short version: breakeven and max loss both equal the stock price minus the premium.</p>"
        },
        {
          "kind": "check",
          "title": "Covered call max gain",
          "prompt": "An investor buys stock at $70 and sells a $70 call for $6. If the stock is called away, what is the maximum gain per share?",
          "choices": [
            "$76",
            "Unlimited",
            "$64",
            "$6"
          ],
          "answer": 3,
          "explain": "Called away at $70 means no gain on the stock bought at $70, so the investor keeps just the $6 premium. $76 is the trap: strike plus premium is the long call breakeven, a different position. $64 is this position's breakeven and max loss."
        },
        {
          "kind": "example",
          "title": "Covered vs. naked",
          "body": "<p>Two writers each sell a $40 call for $3. Then the stock rockets to <b>$100</b>.</p><ul><li><b>Covered writer</b>: already owns the shares. Delivers them at $40 and keeps the $3. Misses the upside, but has no out-of-pocket loss.</li><li><b>Naked writer</b>: must buy shares at $100 to deliver at $40. Loss: $60 minus the $3 premium, or <b>$57 a share</b>. That is $5,700, and the stock could keep climbing.</li></ul><p>That is why uncovered calls carry unlimited risk, while option buyers risk only the premium.</p>"
        },
        {
          "kind": "check",
          "title": "Unlimited risk",
          "prompt": "Which position has unlimited loss potential?",
          "choices": [
            "Writing an uncovered call",
            "Buying a call",
            "Buying a put",
            "Writing a covered call"
          ],
          "answer": 0,
          "explain": "An uncovered call writer must deliver shares they do not own, and a stock price has no ceiling. Buying a call is the trap: the buyer's loss is capped at the premium. A covered writer already owns the shares to deliver."
        },
        {
          "kind": "recap",
          "title": "Lock it in",
          "points": [
            "A covered call means owning the stock and writing a call on it.",
            "If you bought the stock at the strike, max gain is the premium.",
            "Covered call breakeven and max loss equal the stock price minus the premium.",
            "Naked call writers face unlimited risk.",
            "Option buyers can lose only the premium they paid."
          ]
        }
      ]
    },
    {
      "title": "Mutual funds, closed-end funds, ETFs, and UITs",
      "minutes": 6,
      "screens": [
        {
          "kind": "concept",
          "title": "Open-end mutual funds and NAV",
          "body": "<p>Why it matters: packaged products are how most people actually invest, and each type trades in its own way.</p><p>An <b>open-end mutual fund</b> pools investors' money into a managed portfolio. It continuously issues new shares and redeems old ones, directly with investors.</p><p>Its price is the <b>net asset value (NAV)</b>: the fund's assets minus its liabilities, divided by shares outstanding. NAV is calculated <b>once a day</b>, usually at the 4:00 p.m. Eastern market close.</p>"
        },
        {
          "kind": "example",
          "title": "Forward pricing",
          "body": "<p>Mutual funds use <b>forward pricing</b> (SEC Rule 22c-1). You get the <b>next NAV calculated after</b> your order arrives.</p><ul><li>Order in at <b>3:55 p.m.</b>: you get <b>today's</b> 4:00 p.m. NAV.</li><li>Order in at <b>4:05 p.m.</b>: you get <b>tomorrow's</b> NAV.</li></ul><p>So you never know your exact price when you place the order.</p><p>Trap: the prior day's NAV, or the price at the moment you ordered. Both are wrong.</p>"
        },
        {
          "kind": "check",
          "title": "After the close",
          "prompt": "A mutual fund order reaches the fund at 4:10 p.m. Eastern, after the 4:00 p.m. close. What price does it receive?",
          "choices": [
            "Today's 4:00 p.m. NAV",
            "The NAV at the moment the order was placed",
            "The next NAV, calculated at tomorrow's close",
            "The prior day's NAV"
          ],
          "answer": 2,
          "explain": "Forward pricing means the next NAV calculated after the order is received. Today's NAV was already struck at 4:00 p.m., so this order waits for tomorrow's. Today's NAV is the trap: it applies only to orders received before the close."
        },
        {
          "kind": "concept",
          "title": "Closed-end funds and ETFs",
          "body": "<p><b>Closed-end fund</b>: issues a fixed number of shares in an IPO. After that, shares trade between investors on an exchange, all day, at a market price. Supply and demand can push that price to a <b>premium or discount</b> to NAV.</p><p><b>Exchange-traded fund (ETF)</b>: also trades on an exchange all day at market prices. Its price usually stays close to NAV but can drift to a small premium or discount.</p><p>The key contrast: open-end mutual funds deal <b>directly with the fund, once a day, at NAV</b>. Closed-end funds and ETFs trade <b>intraday at market prices</b>.</p>"
        },
        {
          "kind": "concept",
          "title": "Unit investment trusts and the big picture",
          "say": "Unit investment trusts and the big picture. A unit investment trust, or U I T, holds a fixed portfolio. It is not actively managed, and it ends on a set termination date. Now compare all four. A mutual fund trades with the fund, once a day, at the next NAV, and it is managed. A closed-end fund trades on an exchange during the day, and it is managed. An ETF also trades on an exchange during the day, and it often tracks an index. A UIT has a fixed portfolio that is not managed, and its units are redeemed with the trust.",
          "body": "<p>A <b>unit investment trust (UIT)</b> holds a <b>fixed portfolio</b>. It is not actively managed, and it ends on a set termination date.</p><table class='facts'><thead><tr><th>Product</th><th>How it trades</th><th>Portfolio</th></tr></thead><tbody><tr><td>Mutual fund</td><td>With the fund, once a day, at the next NAV</td><td>Managed</td></tr><tr><td>Closed-end fund</td><td>On an exchange, intraday</td><td>Managed</td></tr><tr><td>ETF</td><td>On an exchange, intraday</td><td>Often tracks an index</td></tr><tr><td>UIT</td><td>Units redeemed with the trust</td><td>Fixed, not managed</td></tr></tbody></table>"
        },
        {
          "kind": "check",
          "title": "Closed-end funds",
          "prompt": "Which statement correctly describes a closed-end fund?",
          "choices": [
            "It continuously issues and redeems shares at the next calculated NAV",
            "It issues a fixed number of shares and trades on an exchange, possibly at a premium or discount to NAV",
            "It holds a fixed, unmanaged portfolio that ends on a set termination date",
            "It trades only once a day, at the 4:00 p.m. NAV"
          ],
          "answer": 1,
          "explain": "A closed-end fund sells a fixed number of shares in an IPO, then trades intraday on an exchange, where supply and demand can set a premium or discount to NAV. Continuous issuing and redeeming at NAV describes an open-end mutual fund, the classic mix-up. A fixed, unmanaged portfolio is a UIT."
        },
        {
          "kind": "recap",
          "title": "Lock it in",
          "points": [
            "Open-end mutual funds issue and redeem shares directly, once a day, at NAV.",
            "Forward pricing: you get the next NAV calculated after your order arrives.",
            "Closed-end funds have fixed shares that trade on an exchange at a premium or discount to NAV.",
            "ETFs trade intraday at market prices that can drift from NAV.",
            "UITs hold a fixed, unmanaged portfolio and end on a set date."
          ]
        }
      ]
    },
    {
      "title": "Share classes, breakpoints, and variable annuities",
      "minutes": 5,
      "screens": [
        {
          "kind": "concept",
          "title": "Share classes: when you pay the sales charge",
          "say": "Share classes: when you pay the sales charge. Why it matters: the same fund can cost very different amounts depending on the share class. Matching the class to the customer is a suitability question. Class A shares charge up front, with a front-end load. Watch for breakpoint discounts on larger purchases. Class B shares charge when you sell, with a back-end load called a contingent deferred sales charge. That charge declines the longer you hold. Class C shares charge every year, with a level load. Those ongoing charges can cost more over long holding periods.",
          "body": "<p>Why it matters: the same fund can cost very different amounts depending on the share class. Matching the class to the customer is a suitability question.</p><table class='facts'><thead><tr><th>Class</th><th>When you pay</th><th>Watch for</th></tr></thead><tbody><tr><td><b>A</b></td><td>Up front: a front-end load</td><td>Breakpoint discounts on larger purchases</td></tr><tr><td><b>B</b></td><td>When you sell: a back-end load, or CDSC</td><td>The charge declines the longer you hold</td></tr><tr><td><b>C</b></td><td>Every year: a level load</td><td>Ongoing charges can cost more over long holds</td></tr></tbody></table>"
        },
        {
          "kind": "concept",
          "title": "Breakpoints, rights of accumulation, letters of intent",
          "body": "<p>A <b>breakpoint</b> is a dollar level where the Class A sales charge drops. Hypothetical fund: 5% under $50,000, 4% at $50,000 or more.</p><ul><li><b>Rights of accumulation</b>: shares you already own count toward the next breakpoint. Own $40,000, add $15,000, and the new $15,000 gets the 4% rate.</li><li><b>Letter of intent</b>: you promise to invest enough to reach a breakpoint over a set period, usually 13 months, and get the lower rate now.</li></ul><p>Trap: steering a customer to invest just below a breakpoint, so the rep earns a bigger commission, is a prohibited practice called <b>breakpoint selling</b>.</p>"
        },
        {
          "kind": "check",
          "title": "Class A shares",
          "prompt": "Class A mutual fund shares typically charge:",
          "choices": [
            "A level annual charge with no front-end load",
            "A back-end charge that never declines",
            "A front-end sales charge, with breakpoint discounts for larger purchases",
            "No sales charges of any kind"
          ],
          "answer": 2,
          "explain": "Class A shares carry a front-end load paid at purchase, and bigger purchases can reach breakpoint discounts. A level annual charge describes Class C. Class B has a back-end charge, but it declines over time, so 'never declines' is the trap."
        },
        {
          "kind": "check",
          "title": "Reaching the breakpoint",
          "prompt": "A customer already owns $40,000 of a fund whose breakpoint is $50,000. She invests $12,000 more today. What lets the new purchase get the reduced sales charge?",
          "choices": [
            "Forward pricing",
            "Rights of accumulation",
            "A switch to Class C shares",
            "A surrender charge waiver"
          ],
          "answer": 1,
          "explain": "Rights of accumulation count the $40,000 she already owns, so $40,000 plus $12,000 crosses the $50,000 breakpoint. A letter of intent covers future purchases; here, existing holdings do the work. Forward pricing only sets the NAV she receives."
        },
        {
          "kind": "concept",
          "title": "Variable annuities",
          "body": "<p>A <b>variable annuity</b> is an insurance contract whose value <b>varies</b> with the investments inside it. Your money goes into subaccounts that work much like mutual funds.</p><ul><li><b>Fixed annuity</b>: the insurer guarantees the payout, so the insurer carries the investment risk.</li><li><b>Variable annuity</b>: the payout depends on how the subaccounts perform. <b>You</b> carry the investment risk, which is why it is also a security.</li></ul><p>Withdraw money during the surrender period and you may owe a <b>surrender charge</b>. Annuities are built for the long haul.</p>"
        },
        {
          "kind": "check",
          "title": "Variable vs. fixed",
          "prompt": "Which best describes a variable annuity?",
          "choices": [
            "An insurance contract whose value depends on the performance of its subaccounts",
            "A bank certificate of deposit that pays a fixed rate",
            "An insurance contract whose payout is guaranteed by the insurer",
            "A tax-exempt municipal bond"
          ],
          "answer": 0,
          "explain": "A variable annuity's value rises and falls with its subaccounts, so the investor carries the investment risk. A payout guaranteed by the insurer is the trap: that describes a fixed annuity."
        },
        {
          "kind": "recap",
          "title": "Lock it in",
          "points": [
            "Class A: front-end load with breakpoint discounts.",
            "Class B: back-end load (CDSC) that declines over time. Class C: level annual load.",
            "Rights of accumulation count shares you already own toward a breakpoint.",
            "A letter of intent gets the lower rate now for a promise to invest more, usually within 13 months.",
            "A variable annuity's value varies with its subaccounts, and the investor bears the risk.",
            "Early annuity withdrawals can trigger surrender charges."
          ]
        }
      ]
    }
  ]
}
);
