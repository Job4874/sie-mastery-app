/* Unit 7 - Customer Accounts & Compliance. Strict JSON inside registerUnit (see tools/content_lib.py). */
SIE.registerUnit(
{
  "id": 7,
  "slug": "customer-accounts",
  "title": "Customer Accounts & Compliance",
  "section": 3,
  "summary": "Opening accounts, registrations and SIPC, margin and day trading, retirement accounts, and the AML, privacy, and outreach rules that protect customers.",
  "lessons": [
    {
      "title": "Opening the account: know your customer",
      "minutes": 5,
      "screens": [
        {
          "kind": "concept",
          "title": "Who is this person?",
          "body": "<p>Every account starts with two questions: <b>Who is this person?</b> and <b>What do they need?</b></p><p>The first question fights fraud and money laundering. The second protects the customer from bad advice.</p><p>Step one is the <b>Customer Identification Program (CIP)</b>. Before opening the account, the firm collects four items:</p><ul><li>name</li><li>date of birth</li><li>address</li><li>ID number (a taxpayer ID for U.S. persons)</li></ul><p>Then the firm verifies them, for example with a driver's license.</p>"
        },
        {
          "kind": "concept",
          "title": "KYC, suitability, and Reg BI",
          "say": "KYC, suitability, and Reg BI. Know your customer means building a profile before recommending anything: income, net worth, objectives, risk tolerance, experience, and time horizon. Then every recommendation must fit that profile. Regulation Best Interest, which is SEC Rule fifteen L one, says that when a broker-dealer recommends something to a retail customer, it must act in that customer's best interest and not put its own interest first. FINRA Rule 2111, the suitability rule, covers recommendations that Reg BI does not, such as those to institutional customers. Neither rule ever means guaranteeing a profit.",
          "body": "<p><b>Know your customer (KYC)</b> means building a profile <b>before</b> recommending anything: income, net worth, objectives, risk tolerance, experience, and time horizon.</p><p>Then every recommendation must fit that profile.</p><ul><li><b>Regulation Best Interest (Reg BI)</b>, SEC Rule 15l-1: when recommending to a <b>retail</b> customer, a broker-dealer must act in that customer's best interest and not put its own interest first.</li><li><b>FINRA Rule 2111 (suitability)</b> covers recommendations Reg BI does not, such as those to institutional customers.</li></ul><p>Neither rule ever means guaranteeing a profit.</p>"
        },
        {
          "kind": "check",
          "title": "CIP or KYC?",
          "prompt": "Under the Customer Identification Program, a broker-dealer must collect all of the following to open an account EXCEPT:",
          "choices": ["Date of birth", "Residential address", "Investment objective", "Taxpayer identification number"],
          "answer": 2,
          "explain": "CIP collects four identity items: name, date of birth, address, and an ID number. Investment objective matters a lot, but it belongs to KYC and suitability, not identity. EXCEPT questions test the category, not how important the item is."
        },
        {
          "kind": "concept",
          "title": "The account type is a recommendation too",
          "body": "<p>Choosing the kind of account is part of the advice.</p><ul><li><b>Commission account:</b> the customer pays per trade. Often better for someone who rarely trades.</li><li><b>Fee-based account:</b> the customer pays a yearly percentage of assets, such as 1%. Often better for someone who trades a lot or wants ongoing advice.</li></ul><p>Putting a buy-and-hold customer who makes two trades a year into a fee-based account can cost more for nothing. That is called <b>reverse churning</b>.</p><p><b>Options accounts</b> need extra steps: a principal approves the account, and the customer gets the Options Disclosure Document by the time it is approved.</p>"
        },
        {
          "kind": "concept",
          "title": "Seniors and trusted contacts",
          "body": "<p>Older customers are frequent targets of financial exploitation. Two FINRA rules help.</p><ul><li><b>Rule 4512:</b> the firm must make a reasonable effort to get the name and contact info of a <b>trusted contact person</b>, age 18 or older. The customer may decline, and the account can still be opened.</li><li><b>Rule 2165:</b> the firm may place a <b>temporary hold</b> on disbursements or securities transactions for a <b>specified adult</b> when it suspects exploitation.</li></ul><p>A specified adult is anyone <b>65 or older</b>, or anyone <b>18 or older</b> the firm reasonably believes has an impairment that leaves them unable to protect their own interests.</p>"
        },
        {
          "kind": "check",
          "title": "Who is a specified adult?",
          "prompt": "A firm suspects a customer is being financially exploited and wants to place a temporary hold on a disbursement. Which customer automatically counts as a specified adult under FINRA Rule 2165?",
          "choices": ["A 58-year-old with a joint account", "A 66-year-old with no signs of impairment", "Any customer who has named a trusted contact", "A 40-year-old who recently changed addresses"],
          "answer": 1,
          "explain": "Anyone 65 or older is a specified adult, with no impairment needed. A younger adult qualifies only if the firm reasonably believes an impairment leaves them unable to protect their own interests. Naming a trusted contact does not make someone a specified adult."
        },
        {
          "kind": "recap",
          "title": "Lock it in",
          "points": ["CIP collects four items: name, date of birth, address, and ID number.", "KYC builds the customer profile before any recommendation.", "Reg BI means best interest for retail customers; FINRA Rule 2111 suitability covers the rest.", "A buy-and-hold customer in a fee-based account is a reverse churning red flag.", "Specified adult: 65 or older, or 18 or older with an impairment.", "A trusted contact must be 18 or older, and the customer may decline to name one."]
        }
      ]
    },
    {
      "title": "Registrations and SIPC",
      "minutes": 5,
      "screens": [
        {
          "kind": "concept",
          "title": "Whose account is it?",
          "body": "<p>The <b>registration</b> says who owns the account and what happens when an owner dies.</p><ul><li><b>Individual:</b> one owner.</li><li><b>Joint tenants with right of survivorship (JTWROS):</b> if one owner dies, the survivor gets the whole account.</li><li><b>Tenants in common (TIC):</b> each owner has a share. A deceased owner's share goes to their <b>estate</b>, not to the other owner.</li><li><b>Trust:</b> a trustee manages assets for beneficiaries. A <b>revocable</b> trust can be changed by its creator. An <b>irrevocable</b> trust generally cannot.</li><li><b>Partnership:</b> the firm keeps the partnership agreement showing who may trade.</li></ul>"
        },
        {
          "kind": "concept",
          "title": "UTMA and UGMA accounts",
          "body": "<p>A <b>custodial account</b> under UTMA or UGMA lets an adult hold assets for a minor.</p><ul><li>One custodian and one minor per account.</li><li>The account uses the minor's Social Security number. The minor owns the assets.</li><li>The gift is <b>irrevocable</b>. A parent cannot take it back.</li><li>The custodian manages the account until the minor reaches the age set by state law. Then the assets belong to the young adult outright.</li></ul><p>Trap: the custodian controls the account but does not own it.</p>"
        },
        {
          "kind": "check",
          "title": "Custodial accounts",
          "prompt": "A father opens a UTMA account for his 10-year-old daughter and deposits $15,000 of stock. Two years later he wants the stock back for his own use. Which is true?",
          "choices": ["He may take it back because he is the custodian", "He may take it back only with his daughter's written consent", "He may take it back once she turns 18", "He cannot; the gift is irrevocable and the assets belong to the minor"],
          "answer": 3,
          "explain": "A UTMA gift is irrevocable. The custodian manages the assets for the minor but does not own them. Being the custodian is the trap: control is not ownership."
        },
        {
          "kind": "concept",
          "title": "SIPC protects capacities, not people",
          "body": "<p>If a broker-dealer <b>fails</b>, SIPC steps in to return customer property. It never covers market losses.</p><ul><li>Limit: <b>$500,000 per separate capacity</b>, including up to <b>$250,000 in cash</b>.</li><li>Individual, joint, IRA, trust, and custodial accounts are each a separate capacity.</li><li>A joint account is <b>one</b> capacity shared by both owners. It is not $500,000 each.</li><li>Two individual accounts for the same person at the same firm are still <b>one</b> capacity.</li></ul>"
        },
        {
          "kind": "example",
          "title": "SIPC worked example",
          "say": "SIPC worked example. The Lees' broker-dealer fails. Their joint account holds 700 thousand dollars of stock. That is one capacity, so SIPC covers 500 thousand. Mr. Lee's IRA holds 300 thousand dollars of stock. It is a separate capacity, so all 300 thousand is covered. Mrs. Lee's individual account holds 100 thousand of stock plus 350 thousand in cash. The stock is covered, but cash is capped at 250 thousand, so that account gets 350 thousand. Total covered: 1 million, 150 thousand dollars. The joint account is capped once, and cash is capped at 250 thousand.",
          "body": "<p>The Lees' broker-dealer fails. They hold:</p><table class='facts'><thead><tr><th>Account</th><th>Holdings</th><th>SIPC covers</th></tr></thead><tbody><tr><td>Joint</td><td>$700,000 stock</td><td>$500,000</td></tr><tr><td>Mr. Lee's IRA</td><td>$300,000 stock</td><td>$300,000</td></tr><tr><td>Mrs. Lee, individual</td><td>$100,000 stock and $350,000 cash</td><td>$100,000 + $250,000 = $350,000</td></tr></tbody></table><p>Total covered: <b>$1,150,000</b>. The joint account is capped once, and the cash is capped at $250,000.</p>"
        },
        {
          "kind": "check",
          "title": "SIPC capacities",
          "prompt": "A married couple has a joint account with $650,000 of securities. The husband also has an individual account holding $200,000 in cash. Their broker-dealer fails. How much does SIPC cover in total?",
          "choices": ["$850,000", "$1,200,000", "$700,000", "$450,000"],
          "answer": 2,
          "explain": "The joint account is one capacity, capped at $500,000. The individual account is a separate capacity, and its $200,000 cash is under the $250,000 cash limit, so it is fully covered. Total: $700,000. Treating the joint account as $500,000 per spouse gives the $1,200,000 trap."
        },
        {
          "kind": "recap",
          "title": "Lock it in",
          "points": ["JTWROS passes to the surviving owner; tenants in common passes to the estate.", "UTMA gifts are irrevocable; the custodian controls but does not own.", "SIPC covers a failed broker-dealer, never market losses.", "SIPC limit: $500,000 per separate capacity, including $250,000 cash.", "A joint account is one capacity, not $500,000 per person."]
        }
      ]
    },
    {
      "title": "Discretion, margin, and day trading",
      "minutes": 6,
      "screens": [
        {
          "kind": "concept",
          "title": "Discretion needs two writings",
          "body": "<p>A <b>discretionary</b> account lets the rep choose trades without asking first. Discretion means choosing any of the three A's:</p><ul><li><b>Asset:</b> which security</li><li><b>Amount:</b> how many shares</li><li><b>Action:</b> buy or sell</li></ul><p>It requires <b>both</b> the customer's prior written authorization <b>and</b> the firm's written acceptance of the account.</p><p>Trap: <b>time and price</b> alone is not discretion. If the customer picks the stock, the amount, and the action, and the rep only picks when and at what price, no written grant is needed. That authority generally ends at the close of that business day.</p>"
        },
        {
          "kind": "check",
          "title": "Is this discretion?",
          "prompt": "A customer tells her rep: 'Buy 300 shares of XYZ today, whenever you think the price is best.' The account has no written discretionary authority. Which is true?",
          "choices": ["The rep may proceed; this is time-and-price authority, not discretion", "The rep needs the customer's written authorization first", "The rep needs a principal's written approval of the order first", "The rep must refuse, because only limit orders are allowed"],
          "answer": 0,
          "explain": "The customer chose the asset, the amount, and the action. The rep only chooses timing and price, which is not discretion, so no written grant is needed for that day. If the rep chose the stock or the share count, it would be discretion and would need written authority."
        },
        {
          "kind": "concept",
          "title": "Cash vs. margin accounts",
          "body": "<p>In a <b>cash account</b>, the customer pays in full. Buying without the money and selling before paying is <b>freeriding</b>: the account is limited to fully paid trades for 90 days. Three <b>good-faith violations</b> in 12 months bring the same restriction.</p><p>In a <b>margin account</b>, the firm lends part of the price. Know three numbers:</p><ul><li><b>50%</b> Regulation T initial margin, set by the <b>Federal Reserve</b></li><li><b>25%</b> minimum maintenance on long positions, set by <b>FINRA</b></li><li><b>$2,000</b> minimum equity to open a margin position (or full payment if the purchase is smaller)</li></ul>"
        },
        {
          "kind": "example",
          "title": "Margin by the numbers",
          "body": "<p>Maya buys <b>$20,000</b> of stock on margin. Reg T is 50%, so she deposits <b>$10,000</b> and borrows $10,000.</p><p>The stock falls to <b>$12,000</b>.</p><ul><li>Her loan is still $10,000, so her equity is $12,000 minus $10,000, or <b>$2,000</b>.</li><li>FINRA's 25% minimum is 25% of $12,000, or <b>$3,000</b>.</li><li>She is $1,000 short, so she gets a <b>maintenance call for $1,000</b>.</li></ul><p>Small purchase: if Maya buys only $3,000 of stock, 50% would be $1,500. The $2,000 minimum applies instead, so she deposits $2,000.</p>"
        },
        {
          "kind": "concept",
          "title": "Pattern day traders",
          "body": "<p>A <b>day trade</b> is buying and selling the same security on the same day in a margin account.</p><p>Under FINRA's classic rule, a customer is a <b>pattern day trader</b> after <b>4 or more day trades in 5 business days</b>, if those trades are more than 6% of the account's trades in that period.</p><p>A pattern day trader must keep at least <b>$25,000</b> of equity in the account.</p><p>Trap: do not mix up $25,000 (pattern day trader) with $2,000 (basic margin minimum).</p><p>In 2026, FINRA approved moving to risk-based intraday margin, with a transition period. Practice questions here use the classic numbers.</p>"
        },
        {
          "kind": "check",
          "title": "Margin numbers",
          "prompt": "A new margin customer buys $40,000 of marginable stock. Under Regulation T, how much must the customer deposit?",
          "choices": ["$10,000", "$40,000", "$2,000", "$20,000"],
          "answer": 3,
          "explain": "Reg T initial margin is 50%, set by the Federal Reserve, and 50% of $40,000 is $20,000. The $10,000 trap uses FINRA's 25% maintenance figure, which applies after the purchase, not at the start. $2,000 is only the minimum equity floor."
        },
        {
          "kind": "recap",
          "title": "Lock it in",
          "points": ["Discretion over asset, amount, or action needs the customer's written grant and the firm's written acceptance.", "Time and price alone is not discretion.", "Reg T initial margin is 50% (Federal Reserve); maintenance is 25% (FINRA).", "Opening a margin position takes at least $2,000 of equity.", "Classic pattern day trader: 4 or more day trades in 5 business days, $25,000 minimum equity."]
        }
      ]
    },
    {
      "title": "Retirement accounts",
      "minutes": 6,
      "screens": [
        {
          "kind": "concept",
          "title": "IRAs need earned income",
          "body": "<p>Retirement accounts trade tax breaks for rules about when money goes in and comes out. The exam loves those rules.</p><p>Rule one: IRA contributions require <b>earned income</b>.</p><ul><li><b>Counts:</b> wages, salary, tips, commissions, self-employment income.</li><li><b>Does not count:</b> Social Security, pensions, dividends, interest.</li></ul><p>Example: a retiree lives on Social Security and dividends. She <b>cannot</b> contribute to a Traditional or a Roth IRA.</p><p>One exception: a <b>spousal IRA</b> lets a non-working spouse contribute based on the working spouse's income when they file jointly.</p>"
        },
        {
          "kind": "concept",
          "title": "Traditional vs. Roth",
          "say": "Traditional versus Roth. Traditional IRA contributions are often tax-deductible, so they go in before tax. The money grows tax-deferred, and withdrawals are taxed as ordinary income. Withdrawals before age 59 and a half generally add a 10 percent penalty, and required minimum distributions start at 73. Roth IRA contributions are made after tax and are not deductible. Growth is tax-free if the withdrawal is qualified. You can take out your contributions any time, tax-free and penalty-free. And a Roth has no required minimum distributions during the original owner's lifetime.",
          "body": "<table class='facts'><thead><tr><th></th><th>Traditional IRA</th><th>Roth IRA</th></tr></thead><tbody><tr><td>Contributions</td><td>Often tax-deductible (pre-tax)</td><td>After-tax, not deductible</td></tr><tr><td>Growth</td><td>Tax-deferred</td><td>Tax-free if qualified</td></tr><tr><td>Withdrawals</td><td>Taxed as ordinary income; before 59½ generally a 10% penalty</td><td>Contributions come out tax-free any time; qualified earnings tax-free</td></tr><tr><td>RMDs</td><td>Start at 73</td><td>None during the owner's lifetime</td></tr></tbody></table>"
        },
        {
          "kind": "example",
          "title": "The Roth five-year clock",
          "say": "The Roth five-year clock. Roth earnings come out tax-free only in a qualified distribution, and that needs both of two things. First, 5 years since the first Roth IRA contribution. Second, a qualifying event: age 59 and a half, death, disability, or a first-time home purchase of up to 10 thousand dollars. Example: Raj, age 64, opened his first Roth IRA 3 years ago. He put in 18 thousand dollars, and it grew to 21 thousand. His 18 thousand of contributions comes out tax-free and penalty-free. But the 3 thousand of earnings is not a qualified distribution yet. He is past 59 and a half, but the 5-year clock is not done.",
          "body": "<p>Roth <b>earnings</b> come out tax-free only in a <b>qualified distribution</b>. That needs <b>both</b>:</p><ol><li>5 years since the first Roth IRA contribution, and</li><li>a qualifying event: age 59½, death, disability, or a first-time home purchase (up to $10,000).</li></ol><p>Example: Raj, age 64, opened his first Roth IRA 3 years ago. He put in $18,000, and it grew to $21,000.</p><ul><li>His $18,000 of contributions comes out tax-free and penalty-free.</li><li>The $3,000 of earnings is <b>not</b> a qualified distribution yet. He is past 59½, but the 5-year clock is not done.</li></ul>"
        },
        {
          "kind": "check",
          "title": "The Roth trap",
          "prompt": "An investor age 62 opened her first Roth IRA two years ago. Today she withdraws her contributions and her earnings. Which is true?",
          "choices": ["Everything is tax-free because she is over 59 and a half", "The earnings are not a qualified distribution because the 5-year clock is not met", "Her contributions are taxed as ordinary income", "She must begin required minimum distributions this year"],
          "answer": 1,
          "explain": "A qualified Roth distribution needs both 5 years and a qualifying event such as age 59 and a half. She has the age but only 2 years. Her contributions were made after tax, so they come out tax-free. Thinking age alone is enough is the classic trap."
        },
        {
          "kind": "concept",
          "title": "RMDs and ERISA",
          "body": "<p><b>Required minimum distributions (RMDs):</b> Traditional IRA owners must start taking money out at <b>age 73</b>. Roth IRAs have <b>no RMDs</b> during the original owner's lifetime.</p><p><b>ERISA</b> (the Employee Retirement Income Security Act) sets fiduciary, vesting, reporting, and funding standards for <b>private-sector employer plans</b>, such as a company 401(k), pension, or profit-sharing plan.</p><p>Trap: <b>government plans</b>, such as a city's 457 plan or a state pension, are <b>not</b> covered by ERISA.</p>"
        },
        {
          "kind": "check",
          "title": "Who does ERISA cover?",
          "prompt": "Which retirement plan is governed by ERISA?",
          "choices": ["A 457 plan for city employees", "A state teachers' pension plan", "A 401(k) plan at a private manufacturing company", "A Roth IRA an individual opens at a brokerage"],
          "answer": 2,
          "explain": "ERISA governs private-sector employer plans, like a corporate 401(k). Government plans, including municipal 457 plans and state pensions, are exempt. An IRA an individual opens on their own is not an employer plan."
        },
        {
          "kind": "recap",
          "title": "Lock it in",
          "points": ["IRA contributions need earned income; Social Security and dividends do not count.", "Traditional: often deductible now, taxed on withdrawal. Roth: taxed now, qualified withdrawals tax-free.", "Qualified Roth earnings need 5 years plus a trigger such as age 59 and a half.", "Traditional IRA RMDs start at 73; Roth IRAs have none for the original owner.", "ERISA covers private-sector employer plans, not government plans like a municipal 457."]
        }
      ]
    },
    {
      "title": "AML, privacy, and reaching out",
      "minutes": 6,
      "screens": [
        {
          "kind": "concept",
          "title": "How money laundering works",
          "body": "<p>Criminals need dirty money to look clean. Broker-dealers are on the front line, so anti-money laundering (AML) rules apply to them.</p><p>Laundering has three stages:</p><ol><li><b>Placement:</b> getting cash into the financial system.</li><li><b>Layering:</b> moving it through many transactions to hide where it came from.</li><li><b>Integration:</b> the money comes back out looking legitimate.</li></ol><p><b>Structuring</b> means splitting cash into smaller amounts to dodge the $10,000 reporting threshold. Example: depositing $9,500 on Monday and $9,000 on Tuesday. Structuring is a crime on its own, even if the money is clean.</p>"
        },
        {
          "kind": "concept",
          "title": "SAR vs. CTR, FinCEN and OFAC",
          "say": "SAR versus CTR, FinCEN and OFAC. A Currency Transaction Report, or CTR, is triggered by cash over 10 thousand dollars in one business day, whether in one transaction or several added together. It is about the amount, not suspicion. A Suspicious Activity Report, or SAR, is required for broker-dealers when suspicious activity involves 5 thousand dollars or more. Never tell the customer a SAR was filed. Both reports go to FinCEN, a bureau of the Treasury. OFAC, also part of the Treasury, keeps the Specially Designated Nationals list of terrorists, drug traffickers, and other sanctioned persons and entities. U.S. persons generally may not do business with anyone on it.",
          "body": "<table class='facts'><thead><tr><th>Report</th><th>Trigger</th><th>Key point</th></tr></thead><tbody><tr><td><b>CTR</b> (Currency Transaction Report)</td><td>Cash over $10,000 in one business day, single or combined</td><td>Based on amount, not suspicion</td></tr><tr><td><b>SAR</b> (Suspicious Activity Report)</td><td>Suspicious activity of $5,000 or more (required for broker-dealers)</td><td>Never tell the customer a SAR was filed</td></tr></tbody></table><p>Both reports go to <b>FinCEN</b>, part of the Treasury. <b>OFAC</b>, also part of the Treasury, keeps the <b>Specially Designated Nationals (SDN)</b> list of sanctioned persons and entities. U.S. persons generally may not do business with anyone on it.</p>"
        },
        {
          "kind": "check",
          "title": "CTR or SAR?",
          "prompt": "A customer deposits $6,000 in cash in the morning and another $5,500 in cash that afternoon. What must the broker-dealer file?",
          "choices": ["Nothing, because each deposit is under $10,000", "A Suspicious Activity Report only, since no single deposit tops $10,000", "A Currency Transaction Report, because same-day cash is combined and totals $11,500", "A report to OFAC"],
          "answer": 2,
          "explain": "Cash transactions in one business day are added together. $6,000 plus $5,500 is $11,500, which is over $10,000, so a CTR is required. Looking at each deposit separately is the trap. A SAR depends on suspicion, not just the amount."
        },
        {
          "kind": "concept",
          "title": "Regulation S-P: customer privacy",
          "body": "<p><b>Regulation S-P</b> is the SEC's privacy rule. A broker-dealer must:</p><ul><li><b>Safeguard</b> customer records and information.</li><li>Give customers a <b>privacy notice</b> explaining what it collects and shares.</li><li>Let customers <b>opt out</b> of having their information shared with <b>nonaffiliated third parties</b>.</li></ul><p>Trap: Reg S-P is about privacy. It does not guarantee returns, and it is not the best-interest rule. That is Reg BI.</p>"
        },
        {
          "kind": "concept",
          "title": "Communications and cold calls",
          "body": "<p><b>FINRA Rule 2210</b> sorts written communications by audience:</p><ul><li><b>Retail communication:</b> sent to <b>more than 25</b> retail investors within any <b>30-day</b> period. A principal generally must approve it <b>before</b> use.</li><li><b>Correspondence:</b> sent to <b>25 or fewer</b> retail investors in 30 days. No pre-approval needed, but it is supervised and reviewed.</li></ul><p><b>Do-not-call:</b> firms may not make telemarketing calls to numbers on the national Do-Not-Call Registry or the firm's own do-not-call list. Exceptions include an existing business relationship and the person's written consent. Calls may only be made between 8 a.m. and 9 p.m., the customer's local time.</p>"
        },
        {
          "kind": "check",
          "title": "Retail or correspondence?",
          "prompt": "A rep emails the same market commentary to 40 retail investors over three weeks. Under FINRA Rule 2210, what is it, and what does it need?",
          "choices": ["A retail communication; principal approval before use", "Correspondence; no approval or review needed", "An institutional communication; SEC filing", "A retail communication; SEC approval before use"],
          "answer": 0,
          "explain": "More than 25 retail investors within 30 days makes it a retail communication, which needs a principal's approval before use. Correspondence is 25 or fewer, and even correspondence is supervised. The SEC does not pre-approve sales material."
        },
        {
          "kind": "recap",
          "title": "Lock it in",
          "points": ["Money laundering moves through placement, layering, and integration.", "Structuring, splitting cash to dodge $10,000 reporting, is a crime on its own.", "CTR: cash over $10,000 in one business day. SAR: suspicious activity of $5,000 or more.", "OFAC keeps the SDN list; FinCEN receives SARs and CTRs.", "Reg S-P protects privacy and lets customers opt out of sharing with nonaffiliated third parties.", "More than 25 retail investors in 30 days is a retail communication that needs principal approval first."]
        }
      ]
    }
  ]
}
);
