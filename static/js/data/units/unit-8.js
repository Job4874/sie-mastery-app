/* Unit 8 - Prohibited Activities and Regulatory Framework. Strict JSON inside registerUnit (see tools/content_lib.py). */
SIE.registerUnit(
{
  "id": 8,
  "slug": "prohibited-activities-and-regulatory-framework",
  "title": "Prohibited Activities and Regulatory Framework",
  "section": 4,
  "summary": "Market manipulation, insider trading, prohibited rep conduct, registration rules, reportable events, gifts, and the four federal securities acts.",
  "lessons": [
    {
      "title": "Market manipulation and trading abuses",
      "minutes": 5,
      "screens": [
        {
          "kind": "concept",
          "title": "Match the motive to the label",
          "body": "<p>FINRA tests prohibited trading by giving you a short fact pattern and asking for the exact label. Read for the rep's motive first.</p><ul><li><b>Front running:</b> trading in your own or the firm's account ahead of a large customer order that will move the price.</li><li><b>Painting the tape:</b> creating fake trading activity so a stock looks busier than it is (often with <b>matched orders</b> between two people).</li><li><b>Marking the close or open:</b> placing trades right before the bell to artificially push the closing or opening price.</li></ul>"
        },
        {
          "kind": "concept",
          "title": "Churning and backing away",
          "body": "<p><b>Churning</b> is excessive trading in a customer's account just to generate commissions. To prove it, FINRA must show three elements:</p><ol><li><b>Control</b> over the account (formal discretion or de facto control).</li><li><b>Excessiveness</b> in light of the customer's objectives and profile.</li><li><b>Scienter:</b> intent to defraud or reckless disregard of the customer's interests.</li></ol><p><b>Backing away</b> (FINRA Rule 5220) is a market maker failing to honor its own displayed firm quote.</p>"
        },
        {
          "kind": "example",
          "title": "Spotting the pattern",
          "body": "<p>A pension fund calls a trading desk to buy 500,000 shares of Acme Corp. Before entering the client's order, a trader buys 5,000 shares for her personal account and sells them minutes later after the client's order pushes the price up.</p><p>That is <b>front running</b>, not insider trading. The nonpublic information came from an upcoming customer block order, and she traded ahead of it.</p>"
        },
        {
          "kind": "check",
          "title": "Three elements of churning",
          "prompt": "Which three elements must FINRA show to prove churning in a customer account?",
          "choices": ["Control, excessiveness, and scienter", "Discretion, losses, and a written complaint", "Margin leverage, high commissions, and no prospectus", "Control, realized losses, and unregistered securities"],
          "answer": 0,
          "explain": "Churning requires control over the account, trading excessive for the customer's profile, and scienter (intent to defraud or reckless disregard). Even an account that makes money can still be churned."
        },
        {
          "kind": "check",
          "title": "Backing away",
          "prompt": "A market maker displays a firm quote to sell 500 shares at $24.10, then refuses to fill an incoming order at that price. Which violation occurred?",
          "choices": ["Front running", "Painting the tape", "Backing away", "Freeriding"],
          "answer": 2,
          "explain": "Backing away (FINRA Rule 5220) is failing to honor a displayed firm quote. Front running trades ahead of a customer order, painting the tape fakes volume, and freeriding sells before paying in a cash account."
        },
        {
          "kind": "recap",
          "title": "Lock it in",
          "points": ["Front running means trading ahead of a market-moving customer order.", "Painting the tape and matched orders create fake volume; marking the close rigs the closing price.", "Churning requires control, excessiveness, and scienter.", "Backing away (FINRA Rule 5220) is refusing to honor a firm quote."]
        }
      ]
    },
    {
      "title": "Insider trading, customer boundaries, and seniors",
      "minutes": 5,
      "screens": [
        {
          "kind": "concept",
          "title": "Insider trading under Rule 10b-5",
          "body": "<p><b>Insider trading</b> is buying or selling a security while aware of <b>material nonpublic information</b> in breach of a duty of trust.</p><ul><li>The <b>tipper</b> (who discloses the secret for a personal benefit) and the <b>knowing tippee</b> (who trades on it) are both liable.</li><li>Under the <b>misappropriation theory</b>, even an outsider who steals confidential information from an employer or source is liable under Rule 10b-5.</li></ul>"
        },
        {
          "kind": "concept",
          "title": "Never allowed with customers",
          "body": "<p>Several shortcuts are banned outright, even if the customer asks for them:</p><ul><li><b>Guaranteeing against loss:</b> a rep may never promise to cover losses or guarantee investment returns.</li><li><b>Signatures of convenience:</b> signing a client's name or keeping signed blank forms is strictly prohibited, even with client permission.</li><li><b>Borrowing or lending</b> (FINRA Rule 3240) and <b>sharing in account profits or losses</b> (FINRA Rule 2150(c)) are strictly restricted and require specific firm rules and written approvals.</li></ul>"
        },
        {
          "kind": "concept",
          "title": "IPO restrictions and senior protection",
          "body": "<p><b>IPO purchase restrictions:</b> FINRA Rule 5130 bars broker-dealers and registered reps (restricted persons) from buying equity IPOs. <b>Flipping</b> (buying an IPO and selling immediately) is not illegal for retail clients, but underwriters can penalize firms and cut future IPO access.</p><p><b>Senior exploitation:</b> under FINRA Rules 4512 and 2165, firms ask for a <b>trusted contact</b> and may place temporary holds on suspicious disbursements or transactions for specified adults (age 65+, or 18+ with diminished capacity).</p>"
        },
        {
          "kind": "check",
          "title": "Signatures of convenience",
          "prompt": "A longtime client is traveling and tells her rep by phone to sign an account transfer form on her behalf so it does not miss a deadline. May the rep sign it?",
          "choices": ["Yes, if the rep documents the verbal consent", "Yes, if a branch principal signs next to it", "No, signatures of convenience are strictly prohibited even with client consent", "Yes, as long as no securities are bought or sold"],
          "answer": 2,
          "explain": "Signing a customer's name or using signed blank forms (signatures of convenience) is strictly prohibited under FINRA rules, even when the client explicitly asks for it."
        },
        {
          "kind": "check",
          "title": "Tipper and tippee liability",
          "prompt": "An executive tells his brother-in-law about an unannounced merger so he can make quick money. The brother-in-law buys calls and profits. Who is liable for insider trading?",
          "choices": ["Only the brother-in-law, because only he traded", "Only the executive, because he owed the fiduciary duty", "Neither, because options are excluded from Rule 10b-5", "Both the executive (tipper) and the brother-in-law (knowing tippee)"],
          "answer": 3,
          "explain": "Under SEC Rule 10b-5, both the tipper who breaches a duty for personal benefit (including gifting confidential info to family) and the knowing tippee who trades on it are liable."
        },
        {
          "kind": "recap",
          "title": "Lock it in",
          "points": ["Rule 10b-5 insider trading hits tippers, knowing tippees, and outsiders who misappropriate confidential info.", "Guaranteeing against loss and signatures of convenience are never allowed, even with consent.", "FINRA Rule 3240 restricts borrowing/lending with customers; Rule 2150(c) restricts sharing in profits or losses.", "Rules 4512 and 2165 cover trusted contacts and temporary holds to protect specified adults from exploitation."]
        }
      ]
    },
    {
      "title": "Registration, Form U4/U5, and continuing education",
      "minutes": 5,
      "screens": [
        {
          "kind": "concept",
          "title": "Registered vs. non-registered roles",
          "body": "<p>Anyone who solicits business, takes orders, advises customers on securities, or supervises reps must register with FINRA on <b>Form U4</b> and register in required states (blue-sky registration).</p><p>Unregistered employees may handle clerical work, send out firm-approved literature, or schedule appointments, but they cannot discuss products, accept orders, or earn transaction-based commissions.</p><p>When a rep leaves a firm, the firm files <b>Form U5</b> within <b>30 days</b> stating the reason for termination.</p>"
        },
        {
          "kind": "concept",
          "title": "Background checks and statutory disqualification",
          "body": "<p>Firms must investigate a candidate's last three years of employment, verify their Form U4, and take fingerprints under <b>SEC Rule 17f-2</b> (for personnel who handle securities, funds, or books and records).</p><p><b>Statutory disqualification</b> bars a person from registration after events such as any <b>felony</b> conviction or securities-related <b>misdemeanor</b> within the past <b>10 years</b>, expulsion from an SRO, or a securities-related court injunction.</p>"
        },
        {
          "kind": "concept",
          "title": "Continuing education (CE)",
          "body": "<p>Keeping a license active requires two annual continuing-education tracks:</p><table class='facts'><thead><tr><th>Track</th><th>Run by</th><th>Schedule and focus</th></tr></thead><tbody><tr><td><b>Regulatory Element</b></td><td>FINRA</td><td>Annual (due Dec 31); rules, compliance, and ethics</td></tr><tr><td><b>Firm Element</b></td><td>Your broker-dealer</td><td>Annual; tailored to the firm's products and risks</td></tr></tbody></table><p>Missing the Regulatory Element puts a registration into CE inactive status: no securities business or commissions until completed.</p>",
          "say": "Keeping a license active requires two annual continuing education tracks. The Regulatory Element is run by FINRA every year by December 31 and covers rules, compliance, and ethics. The Firm Element is run by your broker-dealer every year and focuses on the firm's own products and risks. Missing the Regulatory Element makes your license CE inactive, so you cannot conduct securities business or earn commissions until you finish it."
        },
        {
          "kind": "check",
          "title": "Form U4 vs. Form U5",
          "prompt": "A registered rep resigns to join another broker-dealer. Which form must the departing firm file within 30 days?",
          "choices": ["Form U4", "Form U5", "Form BD", "Form 144"],
          "answer": 1,
          "explain": "Form U5 is the Uniform Termination Notice filed by the departing firm within 30 days. Form U4 is used for initial registration and updates; Form BD registers a broker-dealer; Form 144 is for restricted stock sales."
        },
        {
          "kind": "check",
          "title": "Continuing education frequency",
          "prompt": "How often must a registered representative complete FINRA's Regulatory Element of Continuing Education?",
          "choices": ["Once every three years", "Within 120 days of every third anniversary", "Annually, by December 31 each year", "Only after a customer complaint"],
          "answer": 2,
          "explain": "FINRA transitioned the Regulatory Element to an annual requirement due each December 31 (the old 2-year / every-3-year cycle is an outdated trap). The Firm Element is also annual."
        },
        {
          "kind": "recap",
          "title": "Lock it in",
          "points": ["Form U4 registers a rep (and updates disclosures); Form U5 is filed within 30 days of termination.", "SEC Rule 17f-2 requires fingerprinting; felonies or investment misdemeanors within 10 years trigger statutory disqualification.", "Unregistered staff may do clerical tasks only, never solicit orders or earn commissions.", "Both the Regulatory Element (FINRA) and Firm Element (broker-dealer) are annual."]
        }
      ]
    },
    {
      "title": "Employee conduct, OBA, gifts, and reportable events",
      "minutes": 5,
      "screens": [
        {
          "kind": "concept",
          "title": "OBA vs. selling away",
          "body": "<p>Two rules look alike on the exam. Separate them by one question: <b>is a security involved?</b></p><table class='facts'><thead><tr><th>Rule</th><th>Activity</th><th>What the rep must do first</th></tr></thead><tbody><tr><td><b>OBA (FINRA Rule 3270)</b></td><td>Paid work outside the firm (no securities), like real estate or coaching</td><td>Give <b>prior written notice</b> to the firm</td></tr><tr><td><b>Selling away (FINRA Rule 3280)</b></td><td>Private securities transaction away from the firm</td><td>Give <b>prior written notice</b>; if compensated, must get <b>prior written firm approval</b>, supervision, and recording</td></tr></tbody></table>",
          "say": "Outside business activities and selling away look alike on the exam. Separate them by asking if a security is involved. An outside business activity under FINRA Rule 3270 is paid work outside the firm that does not involve securities, like real estate or coaching, and it requires prior written notice to the firm. Selling away under FINRA Rule 3280 is a private securities transaction away from the firm. It requires prior written notice, and if the rep receives selling compensation, the firm must approve it in writing, supervise it, and record it on its books."
        },
        {
          "kind": "concept",
          "title": "Gifts, business entertainment, and pay-to-play",
          "body": "<p><b>Gifts (FINRA Rule 3220):</b> effective March 30, 2026 (Regulatory Notice 26-05), FINRA raised the annual gift limit from $100 to <b>$300 per person per year</b> for business-related gifts. Ordinary, reasonable <b>business entertainment</b> attended by the rep (such as dinner or a ballgame together) is not a gift.</p><p><b>Political contributions (MSRB Rule G-37):</b> a municipal finance professional who donates more than <b>$250</b> to an official they can vote for (or any amount if they cannot vote for that official) triggers a <b>2-year ban</b> on negotiated municipal underwriting with that issuer.</p>"
        },
        {
          "kind": "concept",
          "title": "Customer complaints and reportable events",
          "body": "<p>Updates to <b>Form U4</b> must be filed promptly (generally within <b>30 days</b>; <b>10 days</b> if a statutory disqualification occurs). Reportable events include:</p><ul><li><b>Written customer complaints</b> alleging sales-practice violations with <b>$5,000 or more</b> in compensatory damages, or settlements of <b>$15,000 or more</b>.</li><li><b>Felony</b> charges or convictions, investment-related <b>misdemeanors</b>, unsatisfied <b>liens or judgments</b>, and personal <b>bankruptcies</b> (within the past 10 years).</li></ul><p>Misleading or omitted Form U4 filings are themselves serious violations.</p>"
        },
        {
          "kind": "check",
          "title": "Gifts vs. business entertainment",
          "prompt": "A rep gives a client two concert tickets worth $400 and does NOT attend the concert. Under FINRA Rule 3220 (as updated in March 2026), how is this treated?",
          "choices": ["Permitted business entertainment because concerts are social", "A gift exceeding the $300 annual limit per person", "Permitted if the rep gives prior written notice under Rule 3270", "Permitted only for institutional customers"],
          "answer": 1,
          "explain": "Because the rep does not attend, the tickets are a gift, not business entertainment. FINRA Rule 3220 caps gifts at $300 per person per year (raised from $100 effective March 30, 2026 under Notice 26-05), so $400 violates the rule."
        },
        {
          "kind": "check",
          "title": "Reportable complaints on Form U4",
          "prompt": "A client sends a written complaint alleging unauthorized trading and $7,500 in damages. What must the firm do?",
          "choices": ["Ignore it unless the client files for arbitration", "Report it on Form U4 because alleged damages are $5,000 or more", "Report it only if settled for $15,000 or more", "Wait until the rep's next annual CE review"],
          "answer": 1,
          "explain": "Written customer complaints alleging sales-practice misconduct with $5,000+ in alleged damages (or settlements of $15,000+) must be reported on Form U4 within 30 days."
        },
        {
          "kind": "recap",
          "title": "Lock it in",
          "points": ["OBA (Rule 3270) = non-securities outside work needing prior written notice; selling away (Rule 3280) = private securities transactions needing prior written notice and approval if compensated.", "FINRA Rule 3220 caps business gifts at $300/person/year (as of March 30, 2026); attended business entertainment is exempt.", "MSRB Rule G-37: over $250 to an official you can vote for (or $1+ if you cannot) triggers a 2-year negotiated muni ban.", "Reportable on Form U4: felonies, financial misdemeanors, liens, bankruptcies, and written complaints of $5,000+ alleged damages or $15,000+ settlements."]
        }
      ]
    },
    {
      "title": "The four foundational securities acts",
      "minutes": 4,
      "screens": [
        {
          "kind": "concept",
          "title": "Why regulation exists",
          "body": "<p>Every rule in this course grew out of a real market collapse or abuse. When you meet an unfamiliar question on exam day, tie it back to which of the four federal acts owns that piece of the market.</p><p>The crash of 1929 exposed two separate problems: companies selling new stock with deceptive promises, and ongoing stock exchanges with no referee. Congress split those into the 1933 Act and the 1934 Act.</p>"
        },
        {
          "kind": "concept",
          "title": "The four acts side by side",
          "body": "<table class='facts'><thead><tr><th>Act</th><th>What it governs</th></tr></thead><tbody><tr><td><b>Securities Act of 1933</b></td><td><b>Primary market:</b> new-issue registration, prospectus disclosure, liability for misleading offering documents</td></tr><tr><td><b>Securities Exchange Act of 1934</b></td><td><b>Secondary market:</b> created the SEC, regulates exchanges and broker-dealers, Rule 10b-5 anti-fraud, Reg T margin</td></tr><tr><td><b>Investment Company Act of 1940</b></td><td><b>Pooled funds:</b> mutual funds, closed-end funds, ETFs, and UITs</td></tr><tr><td><b>Investment Advisers Act of 1940</b></td><td><b>Advisers:</b> people paid for investment advice (fiduciary duty)</td></tr></tbody></table>",
          "say": "Here are the four foundational securities acts side by side. The Securities Act of 1933 governs the primary market: new-issue registration, prospectus disclosure, and liability for misleading offering documents. The Securities Exchange Act of 1934 governs ongoing secondary markets: it created the SEC, regulates exchanges and broker-dealers, and houses Rule 10b-5 anti-fraud and Regulation T margin. The Investment Company Act of 1940 regulates pooled funds like mutual funds, closed-end funds, ETFs, and UITs. The Investment Advisers Act of 1940 regulates investment advisers who are paid for advice."
        },
        {
          "kind": "example",
          "title": "Using the four-act frame on an unfamiliar question",
          "body": "<p>Suppose a question asks which law requires a newly listed company to file ongoing quarterly Form 10-Q and annual Form 10-K reports with the SEC.</p><p>Ask: is this about issuing new shares once (1933), or ongoing public-market reporting after shares trade (1934)? Ongoing markets and the SEC belong to the <b>Securities Exchange Act of 1934</b>.</p>"
        },
        {
          "kind": "check",
          "title": "Matching the act to the job",
          "prompt": "Which federal statute created the SEC and houses the Rule 10b-5 anti-fraud prohibition for secondary market trading?",
          "choices": ["Securities Act of 1933", "Securities Exchange Act of 1934", "Investment Company Act of 1940", "Investment Advisers Act of 1940"],
          "answer": 1,
          "explain": "The Securities Exchange Act of 1934 created the SEC and regulates ongoing secondary markets, exchanges, broker-dealers, and anti-fraud Rule 10b-5. The 1933 Act covers primary-market new-issue disclosure."
        },
        {
          "kind": "recap",
          "title": "Lock it in",
          "points": ["1933 Act = primary market disclosure and prospectuses for new issues.", "1934 Act = secondary market trading, created the SEC, broker-dealers, and Rule 10b-5 anti-fraud.", "Investment Company Act of 1940 = mutual funds, closed-end funds, ETFs, and UITs.", "Investment Advisers Act of 1940 = paid investment advisers and fiduciary standards."]
        }
      ]
    }
  ]
}
);
