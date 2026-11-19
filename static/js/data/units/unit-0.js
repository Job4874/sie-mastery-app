/* Unit 0 - Start here. Strict JSON inside registerUnit (see tools/content_lib.py). */
SIE.registerUnit(
{
  "id": 0,
  "slug": "start-here",
  "title": "Start Here: How a Trade Works",
  "section": 0,
  "summary": "Accounts, order types, settlement, cash vs. margin, and the map of the exam - in plain English.",
  "lessons": [
    {
      "title": "From order to settled trade",
      "minutes": 4,
      "screens": [
        {
          "kind": "concept",
          "title": "An account and an order ticket",
          "body": "<p>A <b>brokerage account</b> holds your cash and your securities. To trade, you send an <b>order ticket</b> that says five things:</p><ul><li>buy or sell</li><li>which security (the symbol)</li><li>how many shares</li><li>the order type</li><li>how long the order stays open (time in force)</li></ul><p>The broker routes the order to a market. When it fills, that is the <b>execution</b>.</p>"
        },
        {
          "kind": "concept",
          "title": "Settlement is T+1",
          "body": "<p>Execution is the handshake. <b>Settlement</b> is when cash and shares actually change hands.</p><p>U.S. stocks settle <b>T+1</b>: one business day after the trade date. A Monday trade settles Tuesday. A Friday trade settles the next Monday.</p><p>The old rule was T+2. On the exam, T+2 for regular-way stock trades is a trap answer.</p>"
        },
        {
          "kind": "concept",
          "title": "The four order types",
          "say": "The four order types. A market order guarantees execution, but the price can move. A limit order guarantees your price or better, but it may never fill. A stop order becomes a market order when the trigger price is hit, so a fast gap can blow right through the stop. A stop-limit order becomes a limit order at the trigger, so it may never fill.",
          "body": "<table class='facts'><thead><tr><th>Order</th><th>Guarantees</th><th>Risk</th></tr></thead><tbody><tr><td><b>Market</b></td><td>Execution</td><td>Price can move</td></tr><tr><td><b>Limit</b></td><td>Your price or better</td><td>May never fill</td></tr><tr><td><b>Stop</b></td><td>Becomes a market order at the trigger</td><td>Gaps blow through the stop</td></tr><tr><td><b>Stop-limit</b></td><td>Becomes a limit order at the trigger</td><td>May never fill</td></tr></tbody></table>"
        },
        {
          "kind": "example",
          "title": "Bid, ask, and the spread",
          "body": "<p>A stock is quoted <b>$50.00 bid / $50.05 ask</b>.</p><ul><li>If you <b>buy</b> with a market order, you pay the <b>ask</b>: $50.05.</li><li>If you <b>sell</b> with a market order, you get the <b>bid</b>: $50.00.</li></ul><p>The 5-cent gap is the <b>spread</b>. It is the price of trading right now instead of waiting.</p>"
        },
        {
          "kind": "check",
          "title": "Stop orders",
          "prompt": "A buy stop order is triggered in a fast market. What does it become?",
          "choices": ["A market order", "A limit order at the stop price", "A cancelled order", "A good-till-cancelled limit order"],
          "answer": 0,
          "explain": "A stop order becomes a market order once triggered. Execution is effectively certain, but the price is not guaranteed. A stop-limit is the version that becomes a limit order."
        },
        {
          "kind": "recap",
          "title": "Lock it in",
          "points": ["An order ticket says buy or sell, symbol, quantity, order type, and time in force.", "U.S. stocks settle T+1. T+2 is the old rule.", "Market orders guarantee execution, limit orders guarantee price.", "A stop becomes a market order; a stop-limit becomes a limit order.", "Buyers pay the ask, sellers get the bid."]
        }
      ]
    },
    {
      "title": "Cash, margin, and what can go wrong",
      "minutes": 5,
      "screens": [
        {
          "kind": "concept",
          "title": "Cash account vs. margin account",
          "body": "<p>In a <b>cash account</b>, you pay in full for what you buy.</p><p>In a <b>margin account</b>, the broker lends you part of the price. Two numbers, two regulators:</p><ul><li><b>Regulation T initial margin: 50%</b>, set by the <b>Federal Reserve</b>.</li><li><b>Maintenance margin: 25%</b> for long positions, set by <b>FINRA</b>.</li></ul><p>Swapping the numbers or the regulators is a classic exam trap.</p>"
        },
        {
          "kind": "concept",
          "title": "Freeriding vs. good-faith violations",
          "body": "<p><b>Freeriding:</b> you buy without the money to pay and sell before paying. One violation freezes the account for <b>90 days</b> (you can only trade with settled funds) unless you pay in full by settlement.</p><p><b>Good-faith violation:</b> you buy with unsettled sale proceeds, then sell before those funds settle. <b>Three in 12 months</b> trigger the same 90-day restriction.</p>"
        },
        {
          "kind": "check",
          "title": "Who sets what",
          "prompt": "Which pairing is correct?",
          "choices": ["Reg T initial margin 50% (Federal Reserve); maintenance 25% (FINRA)", "Reg T initial margin 25% (FINRA); maintenance 50% (Federal Reserve)", "Reg T initial margin 50% (SEC); maintenance 25% (Federal Reserve)", "Reg T initial margin 50% (FINRA); maintenance 25% (SEC)"],
          "answer": 0,
          "explain": "The Federal Reserve sets Regulation T initial margin at 50%. FINRA sets the minimum maintenance requirement for long positions at 25%."
        },
        {
          "kind": "concept",
          "title": "What can go wrong",
          "body": "<p>Every investment carries risk: <b>market</b>, <b>credit</b>, <b>liquidity</b>, <b>interest-rate</b>, and <b>inflation</b> risk, plus opportunity cost.</p><p><b>Diversification</b> reduces company-specific risk. It does not remove risk that hits the whole market.</p><p>Options, futures, and margin add <b>leverage</b>, which magnifies gains and losses.</p>"
        },
        {
          "kind": "concept",
          "title": "The map of the exam",
          "say": "The map of the exam. The SIE has 75 scored questions, and you need 70 percent to pass. Section one, Capital Markets, is 16 percent. Section two, Products and Risks, is 44 percent. Section three, Trading, Accounts and Prohibited Activities, is 31 percent. Section four, Regulatory Framework, is 9 percent. Section two is almost half the exam, and the eight units in this course follow that map.",
          "body": "<p>The SIE has 75 scored questions and you need <b>70%</b> to pass. The four sections:</p><table class='facts'><tbody><tr><td>1. Capital Markets</td><td>16%</td></tr><tr><td>2. Products and Risks</td><td>44%</td></tr><tr><td>3. Trading, Accounts and Prohibited Activities</td><td>31%</td></tr><tr><td>4. Regulatory Framework</td><td>9%</td></tr></tbody></table><p>Section 2 is almost half the exam. The 8 units in this course follow that map.</p>"
        },
        {
          "kind": "recap",
          "title": "Lock it in",
          "points": ["Reg T initial margin is 50% (Federal Reserve); maintenance is 25% (FINRA).", "Freeriding: one violation means a 90-day settled-funds freeze.", "Good-faith violations: three in 12 months trigger the same freeze.", "Diversification cuts company risk, not market risk.", "Products and Risks is 44% of the exam."]
        }
      ]
    }
  ]
}
);
