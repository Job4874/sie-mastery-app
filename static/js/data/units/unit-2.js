/* Unit 2 - Equity Securities. Strict JSON inside registerUnit (see tools/content_lib.py). */
SIE.registerUnit(
{
  "id": 2,
  "slug": "equity-securities",
  "title": "Equity Securities",
  "section": 2,
  "summary": "Common and preferred stock, rights, warrants, ADRs, dividend dates, stock splits, and Rule 144 resales.",
  "lessons": [
    {
      "title": "Common vs. preferred stock",
      "minutes": 4,
      "screens": [
        {
          "kind": "concept",
          "title": "Common stock: you own a slice",
          "body": "<p>Why it matters: stock is the most basic product on the exam. Every other equity gets compared to it.</p><p><b>Common stock</b> is ownership. Common shareholders:</p><ul><li><b>vote</b>, for example to elect the board of directors</li><li>get dividends only if the board declares them</li><li>are the <b>residual claimants</b>: they get what is left after everyone else is paid</li></ul><p>That makes common stock the riskiest equity, with the most upside.</p>"
        },
        {
          "kind": "concept",
          "title": "Preferred stock: the hybrid",
          "body": "<p><b>Preferred stock</b> is equity that behaves a lot like a bond.</p><ul><li><b>Paid first</b>: preferred dividends come before any common dividend.</li><li><b>Fixed dividend</b>: a stated amount, such as $5 per share per year.</li><li><b>Ahead of common</b> in a liquidation.</li><li>Usually <b>no voting rights</b>.</li></ul><p>The trade-off: more safety and steady income, less upside.</p><p>Trap: preferred is still equity, not debt.</p>"
        },
        {
          "kind": "check",
          "title": "Preferred vs. common",
          "prompt": "Compared with common stock, preferred stock generally:",
          "choices": ["Votes for directors and has unlimited dividend upside", "Is a debt security with a maturity date", "Has priority for dividends and liquidation, a fixed dividend, and usually no vote", "Ranks behind common stock in a liquidation"],
          "answer": 2,
          "explain": "Preferred is paid before common, pays a stated dividend, and usually has no vote. It is equity, not debt. Voting and unlimited upside describe common stock, and common, not preferred, is last in line."
        },
        {
          "kind": "example",
          "title": "Who gets paid first in a liquidation",
          "body": "<p>When a company is liquidated, the money goes out in strict order:</p><ol><li><b>Secured creditors</b> (lenders backed by specific assets)</li><li><b>Unsecured creditors</b>, including general bondholders</li><li><b>Preferred</b> shareholders</li><li><b>Common</b> shareholders, last</li></ol><p>Example: a company has $100 million left. Creditors are owed $90 million, and preferred holders are owed $15 million.</p><ul><li>Creditors: paid in full, $90 million.</li><li>Preferred: gets the last $10 million.</li><li>Common: gets nothing.</li></ul>"
        },
        {
          "kind": "check",
          "title": "Next to last in line",
          "prompt": "In a liquidation, who is paid immediately before common shareholders?",
          "choices": ["Secured creditors", "Preferred shareholders", "Unsecured bondholders", "Nobody; common shareholders are paid first"],
          "answer": 1,
          "explain": "The order is secured creditors, unsecured creditors (including bondholders), preferred shareholders, then common. Preferred is the only group between bondholders and common. Common is always last."
        },
        {
          "kind": "recap",
          "title": "Lock it in",
          "points": ["Common stock means ownership, voting, and a residual claim.", "Preferred gets a fixed dividend paid before common, and usually no vote.", "Preferred is equity, not debt.", "Liquidation order: secured creditors, unsecured creditors, preferred, common."]
        }
      ]
    },
    {
      "title": "Cumulative and convertible preferred",
      "minutes": 4,
      "screens": [
        {
          "kind": "concept",
          "title": "Cumulative vs. non-cumulative",
          "body": "<p>Preferred dividends are not guaranteed. A struggling company can skip them.</p><p>What happens to a skipped dividend depends on the type:</p><ul><li><b>Cumulative</b> preferred: missed dividends pile up 'in arrears'. All of them must be paid before common gets a cent.</li><li><b>Non-cumulative</b> preferred: a missed dividend is gone for good.</li></ul><p>Cumulative is the investor-friendly version.</p>"
        },
        {
          "kind": "example",
          "title": "Arrears math",
          "body": "<p>A company's cumulative preferred pays <b>$6 per share per year</b>. It skipped the dividend for <b>2 years</b>. Now it wants to pay a common dividend.</p><ul><li>Arrears: 2 missed years of $6 each = $12</li><li>This year's dividend: $6</li><li>Owed per preferred share first: <b>$18</b></li></ul><p>Only after $18 per preferred share is paid can common get anything.</p><p>If the same stock were non-cumulative, the company would owe only this year's <b>$6</b>.</p>"
        },
        {
          "kind": "check",
          "title": "Dividends in arrears",
          "prompt": "XYZ has $4 cumulative preferred stock. It skipped the last three annual dividends. Before paying a common dividend this year, how much must XYZ pay per preferred share?",
          "choices": ["$4", "$12", "Nothing; preferred dividends are never required", "$16"],
          "answer": 3,
          "explain": "Three missed years of $4 is $12 in arrears, plus this year's $4, for $16. The $12 trap forgets the current dividend. $4 would be right only for non-cumulative preferred."
        },
        {
          "kind": "example",
          "title": "Convertible preferred",
          "body": "<p><b>Convertible preferred</b> can be exchanged for a fixed number of common shares.</p><p>Example: each share converts into <b>4 common shares</b>. If the common trades at $30, the conversion value is 4 times $30 = <b>$120</b>.</p><p>If the common rises, the convertible rises with it. If the common falls, you still collect the preferred dividend.</p><p>The trade-off: the conversion feature is valuable, so convertible preferred usually pays a lower dividend than straight preferred.</p>"
        },
        {
          "kind": "recap",
          "title": "Lock it in",
          "points": ["Cumulative preferred: missed dividends pile up and must be paid before common.", "Non-cumulative preferred: missed dividends are lost.", "Amount owed first = arrears plus the current year's dividend.", "Convertible preferred can be swapped for a fixed number of common shares."]
        }
      ]
    },
    {
      "title": "Rights, warrants, and ADRs",
      "minutes": 4,
      "screens": [
        {
          "kind": "concept",
          "title": "Rights: protection from dilution",
          "body": "<p>Why it matters: when a company issues new shares, each existing owner's slice shrinks. That is <b>dilution</b>.</p><p>A <b>right</b> lets existing shareholders buy new shares in proportion to what they own, usually <b>below the market price</b>.</p><ul><li>Short-term: usually lasts a few <b>weeks</b>.</li><li>Example: you own 1% of the company. Your rights let you buy 1% of the new shares, so you stay at 1%.</li><li>Don't want to buy? Rights can usually be sold.</li></ul>"
        },
        {
          "kind": "concept",
          "title": "Warrants: the long-term version",
          "body": "<p>A <b>warrant</b> also lets the holder buy stock at a set price, but it is <b>long-term</b>: typically years.</p><ul><li>It is often attached to a bond or preferred stock as a sweetener, to make the deal more attractive.</li><li>Its exercise price is usually set <b>above</b> the market price when the warrant is issued.</li></ul><p>Memory hook: rights are short and priced below market. Warrants are long and start above market.</p>"
        },
        {
          "kind": "check",
          "title": "Right or warrant?",
          "prompt": "A company sells bonds with an attached certificate that lets the holder buy common stock at $40 any time in the next 5 years. The stock now trades at $32. What is the certificate?",
          "choices": ["A right", "A convertible preferred share", "An ADR", "A warrant"],
          "answer": 3,
          "explain": "A long life, attached to a bond, with an exercise price above the market: that is a warrant. A right lasts only weeks and lets existing shareholders buy new shares below the market price."
        },
        {
          "kind": "concept",
          "title": "ADRs: foreign stock in U.S. dollars",
          "body": "<p>An <b>ADR</b> (American Depositary Receipt) is a certificate issued by a U.S. bank that represents shares of a <b>foreign</b> company.</p><ul><li>It trades in the U.S., in <b>dollars</b>.</li><li>Dividends are converted into dollars before you receive them.</li></ul><p>The catch is <b>currency risk</b>. Example: the shares are flat in euros, but the euro falls 10% against the dollar. Your ADR falls about 10%.</p>"
        },
        {
          "kind": "check",
          "title": "ADRs and the yen",
          "prompt": "A U.S. investor owns ADRs of a Japanese company. The stock is unchanged in Tokyo, but the yen weakens against the dollar. What happens to the ADR?",
          "choices": ["It falls in value, because of currency risk", "It rises in value, because the dollar is stronger", "It is unchanged, because ADRs trade in dollars", "It automatically converts into the underlying Japanese shares"],
          "answer": 0,
          "explain": "The yen-priced shares are now worth fewer dollars, so the ADR price drops. Trading in dollars does not remove currency risk. It only builds that risk into the dollar price."
        },
        {
          "kind": "recap",
          "title": "Lock it in",
          "points": ["Rights let existing holders buy new shares below market, for a few weeks, to avoid dilution.", "Warrants last years, often come attached to bonds or preferred, and start above market.", "ADRs are U.S.-traded receipts for foreign shares, priced in dollars.", "ADRs carry currency risk on top of stock risk."]
        }
      ]
    },
    {
      "title": "Dividends and stock splits",
      "minutes": 5,
      "screens": [
        {
          "kind": "concept",
          "title": "The dividend timeline",
          "say": "The dividend timeline. On the declaration date, the board announces the dividend. The ex-date is the first day the stock trades without the dividend. Under T plus one settlement, the ex-date is the same day as the record date. Owners on the company's books on the record date get paid. On the payable date, the money is paid. The rule: buy before the ex-date and you get the dividend. Buy on or after the ex-date and the seller keeps it.",
          "body": "<table class='facts'><thead><tr><th>Date</th><th>What happens</th></tr></thead><tbody><tr><td><b>Declaration</b></td><td>The board announces the dividend</td></tr><tr><td><b>Ex-date</b></td><td>First day the stock trades without the dividend. Under T+1, the same day as the record date.</td></tr><tr><td><b>Record</b></td><td>Owners on the company's books get paid</td></tr><tr><td><b>Payable</b></td><td>The money is paid</td></tr></tbody></table><p>Rule: buy <b>before</b> the ex-date and you get the dividend. Buy <b>on or after</b> it and the seller keeps it.</p>"
        },
        {
          "kind": "example",
          "title": "Who gets the dividend?",
          "body": "<p>A dividend has a record date of <b>Wednesday</b>. Under T+1, the ex-date is also <b>Wednesday</b>.</p><ul><li>Buy on <b>Tuesday</b>: the trade settles Wednesday. You are on the books by the record date. <b>You get the dividend.</b></li><li>Buy on <b>Wednesday</b>: the trade settles Thursday, too late. <b>The seller keeps it.</b></li></ul><p>On the ex-date, the stock price usually drops by about the dividend amount. That is why buying the day before is not free money.</p>"
        },
        {
          "kind": "check",
          "title": "Buying on the ex-date",
          "prompt": "Under T+1 settlement, an investor buys a stock on its ex-dividend date. What happens to the dividend?",
          "choices": ["The investor receives it", "The seller keeps it", "The buyer and seller split it", "The investor receives it only if the trade settles the same day"],
          "answer": 1,
          "explain": "The ex-date is the first day the stock trades without the dividend. A trade on the ex-date settles the next business day, after the record date, so the seller is still the owner of record. Under the old T+2 rule the ex-date came one business day before the record date; under T+1 they are the same day."
        },
        {
          "kind": "example",
          "title": "Stock splits: more slices, same pizza",
          "body": "<p>A <b>forward split</b> multiplies your shares and divides the price by the same factor.</p><p>Example: you own <b>200 shares at $90</b>, worth $18,000. The company does a <b>3-for-1 split</b>.</p><ul><li>Shares: 200 times 3 = <b>600</b></li><li>Price: $90 divided by 3 = <b>$30</b></li><li>Value: 600 times $30 = <b>$18,000</b>, unchanged</li></ul><p>Your ownership percentage does not change, and a split is <b>not taxable</b>.</p>"
        },
        {
          "kind": "example",
          "title": "Reverse splits",
          "body": "<p>A <b>reverse split</b> does the opposite: fewer shares at a higher price.</p><p>Example: you own <b>1,000 shares at $2</b>, worth $2,000. The company does a <b>1-for-5 reverse split</b>.</p><ul><li>Shares: 1,000 divided by 5 = <b>200</b></li><li>Price: $2 times 5 = <b>$10</b></li><li>Value: still <b>$2,000</b></li></ul><p>Companies often reverse split to lift a low share price. Value and ownership stay the same.</p>"
        },
        {
          "kind": "check",
          "title": "Do the split",
          "prompt": "A customer owns 150 shares at $60. The stock splits 2-for-1. What does the customer own afterward?",
          "choices": ["150 shares at $30", "300 shares at $60", "300 shares at $30", "75 shares at $120"],
          "answer": 2,
          "explain": "Shares double to 300 and the price halves to $30. Value stays $9,000 before and after. The trap of 300 shares at $60 doubles the shares but forgets to cut the price. 75 shares at $120 is what a reverse split would do."
        },
        {
          "kind": "recap",
          "title": "Lock it in",
          "points": ["Dividend order: declaration, ex-date and record date (same day under T+1), payable.", "Buy before the ex-date to get the dividend; buy on or after and the seller keeps it.", "A forward split multiplies shares and divides price; total value is unchanged.", "A reverse split does the opposite.", "Splits are not taxable and do not change your ownership percentage."]
        }
      ]
    },
    {
      "title": "Rule 144: selling restricted and control stock",
      "minutes": 5,
      "screens": [
        {
          "kind": "concept",
          "title": "Restricted vs. control stock",
          "body": "<p>Why it matters: some stock cannot simply be sold on the open market. <b>Rule 144</b> is the safe harbor that says how it can be resold.</p><ul><li><b>Restricted stock</b>: unregistered shares, for example bought in a private placement.</li><li><b>Control stock</b>: shares owned by an <b>affiliate</b>, meaning an officer, director, or large shareholder (the exam usually uses 10% or more).</li></ul><p>Rule 144 sets three things: a holding period, volume limits, and when to file Form 144.</p>"
        },
        {
          "kind": "concept",
          "title": "The holding period",
          "body": "<p>Restricted stock must be held for a while before it can be resold:</p><ul><li><b>6 months</b> if the issuer is an SEC reporting company</li><li><b>1 year</b> if it is not</li></ul><p>That is why you will see it described as a holding period of 6 to 12 months.</p><p>Control stock bought in the open market has no holding period, because it was already registered. But affiliates still face <b>volume limits</b> on every sale.</p>"
        },
        {
          "kind": "example",
          "title": "The volume limit, worked out",
          "body": "<p>In any <b>3-month</b> period, an affiliate may sell the <b>greater</b> of:</p><ul><li><b>1%</b> of the shares outstanding, or</li><li>the <b>average weekly trading volume</b> over the prior 4 weeks</li></ul><p>Example: 20,000,000 shares are outstanding, so 1% is <b>200,000</b>. The 4-week average weekly volume is <b>250,000</b>.</p><p>The limit is the greater number: <b>250,000 shares</b> in 3 months.</p><p>Trap: picking the smaller number, or adding the two together.</p>"
        },
        {
          "kind": "concept",
          "title": "Filing Form 144",
          "body": "<p>An affiliate who plans to sell more than <b>5,000 shares</b> or more than <b>$50,000</b> worth in any 3-month period must file <b>Form 144</b> with the SEC.</p><p>Smaller sales skip the filing. The holding period and volume limits still apply.</p>"
        },
        {
          "kind": "check",
          "title": "Apply the volume limit",
          "prompt": "An affiliate wants to sell control stock. The company has 8,000,000 shares outstanding, and the average weekly volume over the past 4 weeks was 60,000 shares. What is the most the affiliate can sell in a 3-month period under Rule 144?",
          "choices": ["80,000 shares", "60,000 shares", "140,000 shares", "No limit, because control stock has no holding period"],
          "answer": 0,
          "explain": "Take the greater of 1% of outstanding shares (80,000) or the 4-week average weekly volume (60,000): 80,000 shares. The traps are picking the smaller figure or adding them for 140,000. Having no holding period does not mean having no volume limit."
        }, 
        {
          "kind": "recap",
          "title": "Lock it in",
          "points": ["Rule 144 is the safe harbor for reselling restricted and control stock.", "Restricted stock holding period: 6 months for SEC reporting issuers, 1 year otherwise.", "Affiliate volume limit: the greater of 1% of outstanding shares or 4-week average weekly volume, per 3 months.", "Form 144 is required for sales over 5,000 shares or $50,000 in 3 months."]
        }
      ]
    }
  ]
}
);
