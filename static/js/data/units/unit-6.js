/* Unit 6 - Trading, Settlement and Corporate Actions. Strict JSON inside registerUnit (see tools/content_lib.py). */
SIE.registerUnit(
{
  "id": 6,
  "slug": "trading-settlement",
  "title": "Trading, Settlement and Corporate Actions",
  "section": 3,
  "summary": "Order types, who takes the other side, T+1 settlement, cash-account traps, dividends and yields, and the corporate actions that change your shares.",
  "lessons": [
    {
      "title": "Order types and where they sit",
      "minutes": 5,
      "screens": [
        {
          "kind": "concept",
          "title": "Market vs. limit: speed or price",
          "body": "<p>Every order trades off <b>speed</b> against <b>price</b>. Pick the wrong one and you either miss the trade or overpay.</p><ul><li>A <b>market order</b> executes right away at the best available price. Execution is certain. The price is not.</li><li>A <b>limit order</b> names your price or better. The price is certain. Execution is not.</li></ul><p>A <b>buy limit</b> sits <b>below</b> the market: you want it cheaper. A <b>sell limit</b> sits <b>above</b> the market: you want more.</p>"
        },
        {
          "kind": "concept",
          "title": "Stop orders and stop-limits",
          "body": "<p>A <b>stop order</b> waits until a trigger price trades. Then it becomes a <b>market order</b>.</p><ul><li>A <b>sell stop</b> sits <b>below</b> the market. It protects a long position or locks in gains.</li><li>A <b>buy stop</b> sits <b>above</b> the market. It limits losses on a short position.</li></ul><p>A <b>stop-limit</b> becomes a <b>limit order</b> at the trigger. It controls the price, but it may never fill.</p>"
        },
        {
          "kind": "example",
          "title": "When the stock gaps",
          "body": "<p>You own a stock at $50 and place a <b>sell stop at $45</b>.</p><p>Bad news hits overnight. The stock opens at <b>$40</b>.</p><ul><li>Your stop triggers, becomes a market order, and sells near <b>$40</b>, not $45.</li><li>With a <b>sell stop-limit at $45</b> instead, it triggers, but nobody will pay $45. It might <b>not fill at all</b>.</li></ul><p>Stops guarantee execution, never price. Gaps blow right through them.</p>"
        },
        {
          "kind": "concept",
          "title": "How long an order lasts",
          "body": "<p><b>Time in force</b> tells an order when to quit.</p><ul><li><b>Day order</b>: expires at the end of the trading day if it has not filled. Unless you say otherwise, an order is a day order.</li><li><b>GTC (good-till-cancelled)</b>: stays open until it fills or you cancel it.</li></ul><p>Example: a GTC limit order to buy at $30 could sit for weeks, waiting for the price to drop.</p>"
        },
        {
          "kind": "check",
          "title": "Protecting a short",
          "prompt": "An investor is short 100 shares at $60 and wants to limit losses if the stock rises. Which order fits?",
          "choices": ["Sell stop at $65", "Buy limit at $55", "Buy stop at $65", "Sell limit at $65"],
          "answer": 2,
          "explain": "A short seller loses when the price rises, so the protection is a buy stop placed above the market. At $65 it becomes a market order to buy back the shares. A sell stop protects a long position, which is the trap. A buy limit at $55 only fills if the price falls."
        },
        {
          "kind": "recap",
          "title": "Lock it in",
          "points": ["Market order: execution certain, price not. Limit order: price certain, execution not.", "Buy limits and sell stops sit below the market. Sell limits and buy stops sit above it.", "A triggered stop becomes a market order. A stop-limit becomes a limit order.", "Gaps can blow through a stop. A stop-limit may never fill.", "Day orders expire at the close. GTC orders stay open until filled or cancelled."]
        }
      ]
    },
    {
      "title": "Who is on the other side",
      "minutes": 6,
      "screens": [
        {
          "kind": "concept",
          "title": "Principal vs. agency",
          "body": "<p>When a firm fills your order, it plays one of two roles.</p><ul><li><b>Agency</b> (broker): the firm finds the other side for you and charges a <b>commission</b>. It takes no inventory risk.</li><li><b>Principal</b> (dealer): the firm trades from <b>its own account</b>, buying from you or selling to you. It earns a <b>markup or markdown</b> and takes the risk.</li></ul><p>Memory hook: an agent is a middleman. A principal is the counterparty.</p>"
        },
        {
          "kind": "example",
          "title": "Long vs. short",
          "body": "<p><b>Long</b>: you buy shares, hoping the price rises. The most you can lose is what you paid.</p><p><b>Short</b>: you borrow shares and sell them, hoping to buy them back cheaper.</p><p>Example: short 100 shares at $50. Buy back at $40, and you make $1,000. But if the price climbs to $90, you lose $4,000. There is no ceiling on how high a price can go, so a short seller's loss is <b>theoretically unlimited</b>.</p>"
        },
        {
          "kind": "concept",
          "title": "Reg SHO: locate first",
          "body": "<p>Before a broker-dealer accepts a short sale, <b>Regulation SHO</b> requires a <b>locate</b>. The firm must have borrowed the shares, arranged to borrow them, or have reasonable grounds to believe they can be borrowed for delivery.</p><p>Shorting without a locate is <b>naked shorting</b>, and it is prohibited.</p><p>If delivery still fails, <b>Rule 204</b> forces a close-out:</p><ul><li>Short-sale fails: by settlement date plus one (T+2).</li><li>Long sales and bona fide market making: by settlement date plus three.</li></ul>"
        },
        {
          "kind": "check",
          "title": "The locate",
          "prompt": "Under Regulation SHO, what must happen before a broker-dealer accepts a customer's short sale order?",
          "choices": ["The customer must deposit 150% of the sale value in cash", "The firm must locate shares that can be borrowed for delivery", "FINRA must pre-approve the order", "The stock must have risen on its previous trade"],
          "answer": 1,
          "explain": "Reg SHO's locate requirement comes first: the firm must have borrowed, arranged to borrow, or reasonably believe it can borrow the shares. There is no FINRA pre-approval for each order, and a cash deposit does not replace the locate."
        },
        {
          "kind": "concept",
          "title": "Backing away and marking the close",
          "body": "<p>Two manipulation labels belong to trading:</p><ul><li><b>Backing away</b>: a market maker posts a quote, then refuses to trade at it. FINRA <b>Rule 5220</b> requires firms to honor their displayed quotes.</li><li><b>Marking the close</b> (or the open): placing trades near the close to push the final price up or down, for example to make a portfolio's month-end value look better.</li></ul><p>Both distort the prices other investors rely on.</p>"
        },
        {
          "kind": "check",
          "title": "Name the violation",
          "prompt": "A market maker displays a bid of $20.10 for 500 shares. A broker sends a sell order for 500 shares at $20.10, and the market maker refuses to buy. This is:",
          "choices": ["Marking the close", "Front running", "Painting the tape", "Backing away"],
          "answer": 3,
          "explain": "Failing to honor a displayed quote is backing away, prohibited by FINRA Rule 5220. Marking the close manipulates the closing price, front running trades ahead of a customer, and painting the tape fakes trading activity."
        },
        {
          "kind": "recap",
          "title": "Lock it in",
          "points": ["Agency: the firm is a broker and charges a commission. Principal: the firm is a dealer and charges a markup or markdown.", "A long position can lose only what was paid. A short's loss is theoretically unlimited.", "Reg SHO requires a locate before a short sale. Naked shorting is prohibited.", "Rule 204: close out short-sale fails by settlement plus one, long and market-maker fails by settlement plus three.", "Backing away breaks Rule 5220. Marking the close manipulates the final price."]
        }
      ]
    },
    {
      "title": "Settlement and cash-account traps",
      "minutes": 6,
      "screens": [
        {
          "kind": "concept",
          "title": "T+1 settlement",
          "body": "<p>Regular-way trades in stocks and in corporate and municipal bonds settle <b>T+1</b>: one business day after the trade. This has been the rule since May 2024.</p><ul><li>Trade Monday, settle Tuesday.</li><li>Trade Friday, settle the next Monday. Weekends do not count.</li></ul><p>U.S. Treasuries and listed options also settle the next business day. A <b>cash settlement</b> trade settles the same day.</p><p>Exam trap: T+2 is the old rule.</p>"
        },
        {
          "kind": "concept",
          "title": "Freeriding vs. good-faith violations",
          "body": "<p>In a <b>cash account</b>, you must pay for what you buy.</p><ul><li><b>Freeriding</b>: you buy without the money to pay, then sell before paying. One violation restricts the account to settled funds for <b>90 days</b>, unless you pay in full by settlement.</li><li><b>Good-faith violation</b>: you buy with unsettled sale proceeds, then sell the new shares before those proceeds settle. <b>Three in 12 months</b> trigger the same 90-day restriction.</li></ul><p>Freeriding breaks Regulation T, written by the Federal Reserve.</p>"
        },
        {
          "kind": "check",
          "title": "Spot the violation",
          "prompt": "Dana has no settled cash in her cash account. On Monday she buys 200 shares without depositing funds. On Tuesday she sells them before paying. What happened?",
          "choices": ["A good-faith violation, with two more allowed before any penalty", "A wash sale", "Freeriding, so the account can be restricted to settled funds for 90 days", "A legal day trade, since she sold at a profit"],
          "answer": 2,
          "explain": "Buying without funds and selling before paying is freeriding under Reg T. One violation brings the 90-day settled-funds restriction. A good-faith violation, the trap, involves buying with unsettled sale proceeds, not with no money at all."
        },
        {
          "kind": "concept",
          "title": "The wash sale rule",
          "body": "<p>You cannot sell at a loss for the tax deduction and immediately buy the same thing back.</p><p>Buy a <b>substantially identical</b> security within <b>30 days before or after</b> a loss sale, and it is a <b>wash sale</b>. That is a <b>61-day window</b>: 30 days, the sale day, and 30 days.</p><p>The loss is not destroyed. It is <b>disallowed for now</b> and added to the cost basis of the new shares. The holding period carries over too.</p>"
        },
        {
          "kind": "example",
          "title": "Wash sale with numbers",
          "say": "Wash sale with numbers. You buy 100 shares at 50 dollars, for 5,000 dollars. You sell them at 40 dollars, for 4,000 dollars, a 1,000 dollar loss. Ten days later, you buy 100 shares back at 42 dollars. Ten days is inside the window, so the 1,000 dollar loss is disallowed today. Your new cost basis is 42 dollars plus 10 dollars of deferred loss, which is 52 dollars per share, or 5,200 dollars. If you later sell at 55 dollars, your gain is only 3 dollars per share. The loss came back to you as a smaller gain.",
          "body": "<p>You buy 100 shares at <b>$50</b> ($5,000). You sell them at <b>$40</b> ($4,000), a $1,000 loss.</p><p>Ten days later, you buy 100 shares back at <b>$42</b>.</p><ul><li>Ten days is inside the window, so the $1,000 loss is disallowed today.</li><li>New cost basis: $42 plus $10 of deferred loss = <b>$52 per share</b> ($5,200).</li></ul><p>Sell later at $55, and your gain is only $3 per share. The loss came back to you as a smaller gain.</p>"
        },
        {
          "kind": "check",
          "title": "Wash sale",
          "prompt": "An investor sells a stock at a loss and buys the same stock back 20 days later. What happens to the loss?",
          "choices": ["It is disallowed now and added to the new shares' cost basis", "It is permanently lost", "It is allowed, because the repurchase came more than 10 days later", "It must be reported as a gain instead"],
          "answer": 0,
          "explain": "Twenty days is inside the 30-day window, so the loss is disallowed for now. It is deferred into the new shares' cost basis, not destroyed. Thinking the loss is gone forever is the classic trap."
        },
        {
          "kind": "recap",
          "title": "Lock it in",
          "points": ["Regular-way stock and bond trades settle T+1. T+2 is the old rule.", "Freeriding: buy with no money, sell before paying. One violation means a 90-day freeze.", "Good-faith violations: three in 12 months trigger the same freeze.", "Wash sale window: 30 days before and after a loss sale, 61 days in total.", "A wash sale loss is deferred into the new cost basis, not lost forever."]
        }
      ]
    },
    {
      "title": "Dividends, yields, and basis points",
      "minutes": 6,
      "screens": [
        {
          "kind": "example",
          "title": "Dividend dates under T+1",
          "body": "<p>Dividends come in <b>cash</b>, <b>stock</b>, or occasionally <b>property</b>. Four dates matter:</p><ul><li><b>Declaration</b>: the board announces the dividend.</li><li><b>Ex-date</b>: from this day on, buyers do not get it.</li><li><b>Record</b>: whoever is on the books gets paid. Under T+1, the ex-date <b>equals</b> the record date.</li><li><b>Payable</b>: the money arrives.</li></ul><p>Record date Thursday means the ex-date is Thursday. Buy by <b>Wednesday</b> to get the dividend. Buy on Thursday, and the seller keeps it.</p>"
        },
        {
          "kind": "check",
          "title": "Last day to buy",
          "prompt": "A company sets a record date of Friday, June 12. Under T+1 settlement, what is the last day to buy the stock and still receive the dividend?",
          "choices": ["Wednesday, June 10", "Thursday, June 11", "Friday, June 12", "Monday, June 15"],
          "answer": 1,
          "explain": "Under T+1 the ex-date equals the record date, so the ex-date is Friday, June 12. A buyer must purchase the business day before, Thursday, June 11. Wednesday is the old T+2 answer, which is the trap."
        },
        {
          "kind": "example",
          "title": "Nominal yield vs. current yield",
          "say": "Nominal yield versus current yield. A bond has a 1,000 dollar par value and a 5 percent coupon, so it pays 50 dollars a year no matter what. The nominal yield is the coupon, 5 percent. The current yield is the annual interest divided by the market price. If the bond trades at 800 dollars, 50 divided by 800 is 6.25 percent. If it trades at 1,250 dollars, 50 divided by 1,250 is 4 percent. Price down, yield up. Price up, yield down. Always opposite.",
          "body": "<p>A bond has a <b>$1,000 par</b> and a <b>5% coupon</b>. It pays $50 a year, no matter what.</p><ul><li><b>Nominal yield</b> = the coupon: 5%.</li><li><b>Current yield</b> = annual interest divided by market price.</li></ul><p>At a price of <b>$800</b>: $50 / $800 = <b>6.25%</b>.</p><p>At a price of <b>$1,250</b>: $50 / $1,250 = <b>4%</b>.</p><p>Price down, yield up. Price up, yield down. Always opposite.</p>"
        },
        {
          "kind": "concept",
          "title": "Yield order and yield to worst",
          "body": "<p>Three yields line up in a fixed order.</p><ul><li><b>Discount bond</b> (below par): nominal yield is lowest, then current yield, then yield to maturity (YTM) is highest.</li><li><b>Premium bond</b> (above par): the order flips. YTM is lowest, then current yield, then nominal yield is highest.</li></ul><p>A premium bond that can be called early usually has an even lower <b>yield to call</b>. Firms quote the <b>yield to worst</b>, the lower of YTM and yield to call, so investors see the worst case.</p>"
        },
        {
          "kind": "example",
          "title": "Basis points and cost basis",
          "say": "Basis points and cost basis. A basis point is one hundredth of a percent, so 100 basis points equal 1 percent. If a yield rises from 4.25 percent to 4.50 percent, that is a 25 basis point move. Cost basis is what you paid for an investment, including commissions. Your taxable gain or loss is the sale proceeds minus the cost basis. Buy 100 shares at 30 dollars plus a 20 dollar commission, and your basis is 3,020 dollars. Sell for 3,500 dollars, and your gain is 480 dollars.",
          "body": "<p>A <b>basis point</b> is one hundredth of a percent: <b>0.01%</b>. So 100 basis points = 1%.</p><p>A yield that rises from 4.25% to 4.50% moved <b>25 basis points</b>.</p><p><b>Cost basis</b> is what you paid for an investment, including commissions. Your taxable gain or loss is sale proceeds minus cost basis.</p><p>Buy 100 shares at $30 plus a $20 commission: basis $3,020. Sell for $3,500: gain $480.</p>"
        },
        {
          "kind": "check",
          "title": "Count the basis points",
          "prompt": "A bond's yield falls from 5.10% to 4.85%. How many basis points did it move?",
          "choices": ["2.5 basis points", "0.25 basis points", "250 basis points", "25 basis points"],
          "answer": 3,
          "explain": "The change is 0.25 percentage points. Each basis point is 0.01%, so 0.25% equals 25 basis points. The 2.5 and 250 choices are decimal-slip traps."
        },
        {
          "kind": "recap",
          "title": "Lock it in",
          "points": ["Under T+1, the ex-date equals the record date. Buy the business day before to get the dividend.", "Current yield is annual interest divided by market price.", "Discount bond: nominal, then current, then YTM. Premium bond: the order flips.", "Yield to worst is the lower of yield to maturity and yield to call.", "One basis point is 0.01%. Cost basis is what you paid, including commissions."]
        }
      ]
    },
    {
      "title": "Corporate actions",
      "minutes": 5,
      "screens": [
        {
          "kind": "example",
          "title": "Stock splits and reverse splits",
          "body": "<p>Companies change your shares without asking. Know what changes and what does not.</p><p>A <b>2-for-1 split</b> doubles your shares and halves the price. Your total value and ownership percentage stay the same. It is <b>not taxable</b>.</p><p>Example: 100 shares at $60 ($6,000) become 200 shares at $30 ($6,000). Your cost basis per share is halved too.</p><p>A <b>reverse split</b> does the opposite. In a 1-for-5 reverse split, 500 shares at $2 become 100 shares at $10. Still $1,000.</p>"
        },
        {
          "kind": "concept",
          "title": "Buybacks and tender offers",
          "body": "<p>A <b>buyback</b> (repurchase): the company buys its <b>own</b> shares, often on the open market. Fewer shares remain outstanding, so each one owns a bigger slice of earnings.</p><p>A <b>tender offer</b>: a public offer to buy shares <b>directly from shareholders</b>, usually at a <b>premium</b> to the market price, for a limited time. The buyer can be the company itself or an outside acquirer seeking control.</p><p>Trap: an open-market buyback is not a tender offer.</p>"
        },
        {
          "kind": "concept",
          "title": "Rights offerings, proxies, and mergers",
          "body": "<p>A <b>rights offering</b> lets existing shareholders buy new shares <b>in proportion to what they own</b>, usually <b>below</b> market price. It raises capital and lets holders avoid dilution. Rights are short-term, and holders can use them or sell them.</p><p>A <b>proxy</b> is an absentee ballot. Shareholders use it to vote on directors and other corporate matters without attending the meeting.</p><p>In a <b>merger or acquisition</b>, the target's shareholders may receive cash, the buyer's stock, or both.</p>"
        },
        {
          "kind": "check",
          "title": "Split math",
          "prompt": "An investor owns 300 shares at $90. The company does a 3-for-1 split. What does the investor own afterward?",
          "choices": ["300 shares at $30", "900 shares at $90", "900 shares at $30", "100 shares at $270"],
          "answer": 2,
          "explain": "A 3-for-1 split triples the shares and divides the price by 3: 900 shares at $30. Total value stays $27,000 before and after. 100 shares at $270 would be a 1-for-3 reverse split, the opposite."
        },
        {
          "kind": "check",
          "title": "Name the action",
          "prompt": "XYZ, trading at $50, publicly offers to buy up to 10% of its shares directly from shareholders at $55 for the next 20 business days. This is:",
          "choices": ["A tender offer", "A rights offering", "An open-market buyback", "A proxy solicitation"],
          "answer": 0,
          "explain": "A public offer to buy shares directly from holders, at a premium, for a limited time is a tender offer. An open-market buyback happens quietly at market prices. A rights offering sells new shares to holders rather than buying them back."
        },
        {
          "kind": "recap",
          "title": "Lock it in",
          "points": ["Splits change shares and price, not total value or ownership. They are not taxable.", "A reverse split cuts the share count and raises the price by the same factor.", "Buyback: the company repurchases its own shares. Tender offer: a public offer to holders, usually at a premium.", "Rights offering: existing holders buy new shares pro rata, usually below market.", "A proxy lets shareholders vote without attending the meeting."]
        }
      ]
    }
  ]
}
);
