/* Unit 5 - Other Products and Investment Risks. Strict JSON inside registerUnit (see tools/content_lib.py). */
SIE.registerUnit(
{
  "id": 5,
  "slug": "other-products-risks",
  "title": "Other Products and Investment Risks",
  "section": 2,
  "summary": "529 and ABLE accounts, DPPs, REITs, hedge funds, ETNs, and the risks every investment carries - plus which ones diversification can actually fix.",
  "lessons": [
    {
      "title": "529, ABLE, and other municipal fund securities",
      "minutes": 4,
      "screens": [
        {
          "kind": "concept",
          "title": "Accounts built for one goal",
          "body": "<p>Some accounts exist to help with one big goal. The tax break is the reward for using the money the right way.</p><p>Three show up on the SIE. All three are <b>municipal fund securities</b>, offered through states or local governments:</p><ul><li><b>529 plan</b>: saving for education</li><li><b>ABLE account</b>: disability-related expenses</li><li><b>LGIP</b>: short-term cash for government entities</li></ul><p>Match each name to its purpose, and most questions answer themselves.</p>"
        },
        {
          "kind": "example",
          "title": "529 plans: education savings",
          "body": "<p>A <b>529 plan</b> is a tax-advantaged account for education.</p><ul><li>You contribute after-tax money. There is no federal deduction.</li><li>The money grows tax-deferred.</li><li>Withdrawals are tax-free when spent on qualified education expenses.</li></ul><p>Example: a parent puts in $10,000. It grows to $16,000. If all $16,000 pays tuition, the $6,000 of growth is never taxed.</p><p>Spend it on something else, and the earnings are taxed plus a 10% penalty.</p>"
        },
        {
          "kind": "concept",
          "title": "ABLE accounts: disability expenses",
          "body": "<p>An <b>ABLE account</b> is a tax-advantaged account for a person with a qualifying disability. The money pays for disability-related expenses.</p><p>The key number: the disability must have started <b>before age 46</b>. That limit was raised from 26, effective January 1, 2026, under SECURE 2.0.</p><p>Exam trap: age 26 is the old rule. If a question offers 26, it is testing whether you know the update.</p>"
        },
        {
          "kind": "concept",
          "title": "LGIPs: cash pools for governments",
          "body": "<p>A <b>local government investment pool</b> (LGIP) is where a town, county, or school district parks short-term cash.</p><p>Think of it as a money-market-style pool for government entities, not for individual investors.</p><p>Quick sort:</p><ul><li>Saving for college? <b>529</b>.</li><li>Disability expenses? <b>ABLE</b>.</li><li>A city's spare cash? <b>LGIP</b>.</li></ul>"
        },
        {
          "kind": "check",
          "title": "ABLE eligibility",
          "prompt": "A client's son became disabled at age 35. In 2026, the client asks if the son can open an ABLE account. What is the best answer?",
          "choices": ["No, because the disability began after age 26", "Yes, because the disability began before age 46", "No, because ABLE accounts are only for education expenses", "Yes, but only if the son is under age 26 today"],
          "answer": 1,
          "explain": "Since January 1, 2026, SECURE 2.0 allows ABLE accounts when the disability began before age 46. Onset at 35 qualifies. Age 26 was the old cutoff, which is the trap. Education savings is the job of a 529 plan, not an ABLE account."
        },
        {
          "kind": "recap",
          "title": "Lock it in",
          "points": ["529 plans, ABLE accounts, and LGIPs are all municipal fund securities.", "529 plan: education savings, tax-free when spent on qualified education costs.", "ABLE account: disability expenses, with onset before age 46 as of 2026.", "Age 26 is the old ABLE limit and a trap answer.", "LGIP: a short-term cash pool for government entities."]
        }
      ]
    },
    {
      "title": "DPPs, REITs, and hedge funds",
      "minutes": 5,
      "screens": [
        {
          "kind": "concept",
          "title": "Direct participation programs",
          "body": "<p>Some investments pass their results straight through to you. That is a <b>direct participation program</b> (DPP), usually a <b>limited partnership</b>.</p><ul><li>Common types: oil and gas, real estate, equipment leasing.</li><li>Income, losses, and tax benefits <b>flow through</b> to the partners. The partnership itself is not taxed.</li><li>Limited partners have <b>limited liability</b>. Their risk is generally limited to what they invested.</li><li>DPPs are <b>illiquid</b>. There is usually no easy market to sell your interest.</li></ul>"
        },
        {
          "kind": "concept",
          "title": "REITs: real estate in a share",
          "body": "<p>A <b>real estate investment trust</b> (REIT) owns or finances income-producing real estate, like offices, apartments, and warehouses.</p><p>To keep its special tax treatment, a REIT must pay out most of its income: at least 90% of its taxable income goes to shareholders.</p><p>Three kinds, from most to least liquid:</p><ul><li><b>Listed</b>: trades on an exchange like a stock.</li><li><b>Non-listed</b>: public, but not exchange-traded. Hard to sell.</li><li><b>Private</b>: not registered, offered to a limited group of investors.</li></ul>"
        },
        {
          "kind": "concept",
          "title": "The DPP vs. REIT trap",
          "body": "<p>Both can hold real estate. The difference is how results reach you.</p><ul><li><b>DPP</b>: a partnership. Losses <b>can</b> flow through to your tax return. Illiquid.</li><li><b>REIT</b>: a trust or corporation. Losses <b>do not</b> flow through. Listed REITs trade every day.</li></ul><p>Exam trap: an investor wants real estate losses to pass through to their own tax return. That points to a DPP, not a REIT.</p>"
        },
        {
          "kind": "concept",
          "title": "Hedge funds",
          "body": "<p>A <b>hedge fund</b> is a private pooled fund.</p><ul><li>It is less regulated than a mutual fund.</li><li>It is generally limited to <b>accredited investors</b>: wealthy or sophisticated buyers.</li><li>It uses complex strategies, such as leverage, short selling, and derivatives.</li><li>It is often hard to exit. Money can be locked up for a period.</li></ul><p>Compare a mutual fund: open to anyone, heavily regulated, and redeemable every business day.</p>"
        },
        {
          "kind": "check",
          "title": "Pick the product",
          "prompt": "An investor wants exposure to oil and gas drilling. She also wants the program's tax deductions to flow through to her own return. Which product fits best?",
          "choices": ["A listed REIT", "An exchange-traded note", "A direct participation program", "A 529 plan"],
          "answer": 2,
          "explain": "A DPP, usually a limited partnership, passes income, losses, and tax benefits directly to its partners. Oil and gas programs are a classic DPP. A REIT does not pass losses through, an ETN is bank debt, and a 529 plan is for education."
        },
        {
          "kind": "recap",
          "title": "Lock it in",
          "points": ["A DPP is usually a limited partnership: oil and gas, real estate, or equipment leasing.", "DPP income, losses, and tax benefits flow through to partners. Limited liability, but illiquid.", "A REIT owns income-producing real estate and must distribute at least 90% of taxable income.", "REIT losses do not flow through to investors. DPP losses can.", "Hedge funds are private, less regulated, and generally for accredited investors."]
        }
      ]
    },
    {
      "title": "Systematic vs. unsystematic risk",
      "minutes": 5,
      "screens": [
        {
          "kind": "concept",
          "title": "Two buckets of risk",
          "body": "<p>Every risk on the SIE fits in one of two buckets. The test is simple: <b>does diversification help?</b></p><ul><li><b>Systematic risk</b> hits the whole market. Owning more stocks does not help. Examples: market risk, interest-rate risk, and inflation (purchasing-power) risk.</li><li><b>Unsystematic risk</b> hits one company or one position. Diversification reduces it. Examples: business risk, one issuer's credit risk, and the liquidity of one holding.</li></ul>"
        },
        {
          "kind": "example",
          "title": "Sorting the risks",
          "say": "Sorting the risks. Market risk, interest-rate risk, and inflation risk are systematic. They hit almost everything at once, so diversification cannot remove them. Business risk, the credit risk of a single issuer, and the liquidity of one holding are unsystematic. Spreading your money across many issuers reduces them. For example, a recession drags down nearly every stock. That is systematic. One company's factory burns down. That is unsystematic.",
          "body": "<table class='facts'><thead><tr><th>Risk</th><th>Bucket</th></tr></thead><tbody><tr><td>Market risk</td><td>Systematic</td></tr><tr><td>Interest-rate risk</td><td>Systematic</td></tr><tr><td>Inflation risk</td><td>Systematic</td></tr><tr><td>Business risk</td><td>Unsystematic</td></tr><tr><td>Single-issuer credit risk</td><td>Unsystematic</td></tr><tr><td>Liquidity of one holding</td><td>Unsystematic</td></tr></tbody></table><p>A recession drags down nearly every stock: systematic. One company's factory burns down: unsystematic.</p>"
        },
        {
          "kind": "check",
          "title": "What diversification cannot fix",
          "prompt": "An investor holds 50 stocks across many industries. Which risk does this diversification NOT reduce?",
          "choices": ["Business risk", "Single-issuer credit risk", "Inflation (purchasing-power) risk", "The liquidity risk of one thinly traded holding"],
          "answer": 2,
          "explain": "Inflation risk is systematic. Rising prices erode the purchasing power of every holding, no matter how many you own. Business risk, single-issuer credit risk, and the liquidity of one position are unsystematic, so diversification does reduce them."
        },
        {
          "kind": "concept",
          "title": "Three tools to manage risk",
          "body": "<ul><li><b>Diversification</b>: spread money across many issuers and asset types. It cuts unsystematic risk.</li><li><b>Rebalancing</b>: periodically restore your target mix. Sell what grew, buy what lagged.</li><li><b>Hedging</b>: take an offsetting position. For example, buy a put to protect a stock you own.</li></ul><p>None of these makes systematic risk disappear. Hedging can offset it, but at a cost.</p>"
        },
        {
          "kind": "example",
          "title": "Rebalancing with real numbers",
          "say": "Rebalancing with real numbers. The target is 60 percent stocks and 40 percent bonds on 100 thousand dollars, so 60 thousand in stocks and 40 thousand in bonds. After a strong year, stocks are worth 80 thousand and bonds are still 40 thousand. The total is 120 thousand, and stocks are now about 67 percent. Sixty percent of 120 thousand is 72 thousand, so you sell 8 thousand dollars of stocks and buy 8 thousand dollars of bonds. That is rebalancing: sell winners, buy laggards, restore the mix. It is the opposite of chasing performance.",
          "body": "<p>Target: <b>60% stocks, 40% bonds</b> on $100,000. That is $60,000 and $40,000.</p><p>After a strong year, stocks are worth $80,000 and bonds are still $40,000. Total: $120,000. Stocks are now about 67%.</p><p>The stock target is 60% of $120,000 = $72,000. So you <b>sell $8,000 of stocks</b> and <b>buy $8,000 of bonds</b>.</p><p>That is rebalancing: sell winners, buy laggards, restore the mix. It is the opposite of chasing performance.</p>"
        },
        {
          "kind": "check",
          "title": "Rebalancing",
          "prompt": "A portfolio's target is 70% stocks and 30% bonds. After a bond rally, it sits at 60% stocks and 40% bonds. Rebalancing means:",
          "choices": ["Buying more bonds because they are performing well", "Selling some bonds and buying stocks to restore 70/30", "Moving everything to cash until markets calm down", "Changing the target to 60/40 to match the portfolio"],
          "answer": 1,
          "explain": "Rebalancing restores the target mix by selling what grew (bonds) and buying what lagged (stocks). Buying more of the winner is chasing performance, which is the trap. Changing the target just accepts the drift."
        },
        {
          "kind": "recap",
          "title": "Lock it in",
          "points": ["Ask one question: does diversification help?", "Systematic risk hits the whole market: market, interest-rate, and inflation risk.", "Unsystematic risk hits one issuer: business risk, single-issuer credit risk, one holding's liquidity.", "Diversification reduces unsystematic risk only.", "Rebalancing means selling winners and buying laggards to restore the target mix."]
        }
      ]
    },
    {
      "title": "Interest rates: price, reinvestment, and prepayment risk",
      "minutes": 5,
      "screens": [
        {
          "kind": "concept",
          "title": "Why rates drive so many risks",
          "body": "<p>Bond prices and interest rates move in <b>opposite directions</b>. That one fact creates three different risks, and each lives in a specific rate move.</p><ul><li><b>Interest-rate (price) risk</b>: lives in <b>rising</b> rates.</li><li><b>Reinvestment risk</b>: lives in <b>falling</b> rates.</li><li><b>Prepayment risk</b>: lives in <b>falling</b> rates.</li></ul><p>Learn which direction hurts, and these questions get easy.</p>"
        },
        {
          "kind": "example",
          "title": "Interest-rate risk: rates rise",
          "body": "<p>You own a bond paying 4%. Rates rise, and new bonds now pay 6%.</p><p>Nobody will pay full price for your 4% bond when 6% is available. So its <b>price falls</b>.</p><p>Longer maturities and lower coupons swing the most. A <b>zero-coupon</b> bond has the <b>most price risk</b> of all.</p>"
        },
        {
          "kind": "example",
          "title": "Reinvestment risk: rates fall",
          "body": "<p>Now flip it. A retiree lives on coupons from a 6% bond. Rates fall to 3%.</p><ul><li>Each coupon she reinvests now earns only about 3%.</li><li>Worse, the issuer may <b>call</b> the bond and refinance cheaper. Her principal comes back exactly when rates are low.</li></ul><p>A <b>zero-coupon</b> bond has <b>no reinvestment risk</b>, because it pays no coupons to reinvest. It trades that for maximum price risk.</p>"
        },
        {
          "kind": "concept",
          "title": "Prepayment risk: homeowners refinance",
          "body": "<p>Mortgage-backed securities pass homeowners' payments through to investors.</p><p>When rates <b>fall</b>, homeowners refinance. Principal comes back early, and investors must reinvest it at lower rates. That is <b>prepayment risk</b>. Callable bonds carry the same risk.</p><p>When rates <b>rise</b>, refinancing stops and payments stretch out longer than expected. That is <b>extension risk</b>, the opposite case.</p>"
        },
        {
          "kind": "check",
          "title": "Reinvestment risk",
          "prompt": "A retiree holds long-term callable bonds for income. Which situation creates the greatest reinvestment risk?",
          "choices": ["Rates rise and bond prices fall", "Rates stay flat for ten years", "She switches to zero-coupon bonds", "Rates fall and her bonds are called"],
          "answer": 3,
          "explain": "Reinvestment risk lives in falling rates: coupons and called principal must be reinvested at lower yields. Rising rates and falling prices describe interest-rate (price) risk, the trap. Zero-coupon bonds have no reinvestment risk at all."
        },
        {
          "kind": "check",
          "title": "Prepayment risk",
          "prompt": "Prepayment risk on a mortgage-backed security is greatest when:",
          "choices": ["Interest rates fall and homeowners refinance", "Interest rates rise and refinancing slows", "The stock market is volatile", "The security trades at a discount"],
          "answer": 0,
          "explain": "Falling rates trigger refinancing, so principal comes back early and must be reinvested at lower rates. Rising rates slow refinancing and cause extension risk, the opposite. Stock market swings are not the driver."
        },
        {
          "kind": "recap",
          "title": "Lock it in",
          "points": ["Bond prices and interest rates always move in opposite directions.", "Interest-rate (price) risk lives in rising rates.", "Reinvestment risk and prepayment risk live in falling rates.", "Zero-coupon bonds: no reinvestment risk, maximum price risk.", "Rising rates on mortgage-backed securities mean extension risk."]
        }
      ]
    },
    {
      "title": "Credit, liquidity, currency, and political risk",
      "minutes": 5,
      "screens": [
        {
          "kind": "concept",
          "title": "Risks beyond rates",
          "body": "<p>Rates are not the only thing that can hurt you. Four more risks to know:</p><ul><li><b>Credit risk</b>: the issuer may default and not pay you back.</li><li><b>Liquidity risk</b>: you cannot sell quickly without cutting your price. A thinly traded bond may need a big discount to sell today.</li><li><b>Political risk</b>: a change in government, law, or policy hurts a country or sector.</li><li><b>Capital risk</b>: you lose some or all of your principal.</li></ul>"
        },
        {
          "kind": "concept",
          "title": "ETFs vs. ETNs: credit risk in disguise",
          "body": "<p>They sound alike, and both trade on exchanges. They are built very differently.</p><ul><li>An <b>ETF</b> is a <b>fund</b>. It holds the underlying stocks or bonds.</li><li>An <b>ETN</b> is an <b>unsecured debt note</b> issued by a bank. It promises to pay an index's return. It holds nothing on your behalf.</li></ul><p>So an ETN adds <b>issuer credit risk</b>. If the bank fails, the note can be worth little even if the index did fine.</p>"
        },
        {
          "kind": "check",
          "title": "ETN surprise",
          "prompt": "An investor's ETN tracks an index that rose 8% this year, yet the note's value dropped sharply. What most likely happened?",
          "choices": ["The issuing bank's credit quality deteriorated", "The fund sold its underlying stocks", "The fund's NAV was recalculated at the close", "The ETN was converted into an ETF"],
          "answer": 0,
          "explain": "An ETN is an unsecured bank debt note, so its value depends on the issuer's credit as well as the index. The other choices treat the ETN like a fund that holds assets. That describes an ETF, which is the trap."
        },
        {
          "kind": "example",
          "title": "ADRs: stock risk plus currency risk",
          "say": "ADRs: stock risk plus currency risk. An American Depositary Receipt is a U.S.-traded receipt for shares of a foreign company. Its dollar price reflects two things: the stock and the exchange rate. Say one ADR equals one share priced at 50 euros. With the euro at 1 dollar 20 cents, the ADR is worth about 60 dollars. The stock stays flat, but the euro falls to 1 dollar 10 cents. Now the ADR is worth about 55 dollars. The company did nothing wrong, yet a weaker foreign currency cost you 5 dollars. That is currency risk.",
          "body": "<p>An <b>ADR</b> (American Depositary Receipt) is a U.S.-traded receipt for shares of a foreign company. Its dollar price reflects two things: the stock and the exchange rate.</p><p>Say one ADR equals one share priced at 50 euros.</p><ul><li>Euro at $1.20: the ADR is worth about <b>$60</b>.</li><li>The stock stays flat, but the euro falls to $1.10: now about <b>$55</b>.</li></ul><p>The company did nothing wrong. A weaker foreign currency still cost you $5. That is <b>currency risk</b>.</p>"
        },
        {
          "kind": "check",
          "title": "ADR and a stronger currency",
          "prompt": "A U.S. investor owns an ADR. The foreign stock is unchanged in its home market, but the foreign currency strengthens against the dollar. The ADR's dollar value most likely:",
          "choices": ["Falls, due to currency risk", "Stays the same, since ADRs track only the stock", "Rises, because each unit of foreign currency is worth more dollars", "Converts automatically into the foreign shares"],
          "answer": 2,
          "explain": "An ADR's dollar price reflects the stock and the exchange rate. A stronger foreign currency converts into more dollars, so the ADR rises even with a flat stock. Falling is what happens when the foreign currency weakens. Saying ADRs ignore currency is the trap."
        },
        {
          "kind": "recap",
          "title": "Lock it in",
          "points": ["Credit risk: the issuer may default.", "Liquidity risk: you cannot sell quickly without a price cut.", "Political risk comes from changes in government, law, or policy.", "An ETF is a fund. An ETN is unsecured bank debt with issuer credit risk.", "ADRs carry stock risk plus currency risk. A weaker foreign currency lowers the ADR's dollar value."]
        }
      ]
    }
  ]
}
);
