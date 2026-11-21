# Machine Learning to Teach an ADHD Mind — Research Report

Companion to SIE Mastery. This report is grounded in primary sources fetched during
this session (URLs below). It explains *why* the app is built the way it is, what the
evidence says about memory for ADHD learners, and where the design deliberately
follows — or departs from — the literature.

## 1. The ADHD learning problem

ADHD affects an estimated 2–8% of college students and is associated with poorer
long-term memory performance and academic outcomes (Stern & Halamish, 2023, citing
DuPaul et al., 2009; Skodzik et al., 2017). The core mechanisms that matter for a
tutor are:

- **Working memory**: weaker capacity impairs holding and manipulating information
  (ADDitude / Simply Psychology clinical summaries).
- **Mind-wandering & attention**: readers with ADHD report forgetting the top of a
  page by the time they reach the bottom (Barkley, 2006; Lanier et al., 2019).
- **Self-regulation**: difficulty sustaining effort and motivation on a long task.
- **Recall organization**: ADHD recall is measurably *less well ordered* than
  typically developing (TD) peers (Stern & Halamish, 2023, order-score analysis:
  ADHD M = 0.16 vs TD M = 0.12, p = .049).

Design consequence: **short, frequent, structured retrieval beats long unstructured
study**, and the material must be re-presented in a stable, organized order.

## 2. What the evidence says makes things stick

### 2.1 Retrieval practice (the testing effect)
The most robust finding in cognitive psychology: recalling material improves
retention more than rereading (Dunlosky et al., 2013; Agarwal et al., 2021;
Roediger & Karpicke, 2006). Crucially, **retrieval practice benefits neurodiverse
students and lower-working-memory learners at least as much as others**
(Knouse et al., 2016, 2020; Minear et al., 2023; Jonsson et al., 2021).
The app's entire quiz loop is retrieval practice — not re-reading.

### 2.2 Whole-text vs section recall — a key ADHD finding
Stern & Halamish (2023, *Frontiers in Psychology*, DOI 10.3389/fpsyg.2023.1301726)
compared whole-text free recall (WTR), section recall (SR), and restudy in students
with and without ADHD. Counter to the hypothesis that smaller chunks help ADHD:

- During practice, SR produced **more** recall (M = 0.81 vs WTR 0.54).
- On the 2-day delayed test, **WTR beat SR** (M = 0.45 vs 0.37, p = .009, d = 0.45)
  for **both** groups; no interaction with group.
- Recall was better organized after WTR than SR (d = 0.79); ADHD recall less
  organized overall.

**Interpretation for the app:** short drills sustain attention (engagement),
but the learner must also periodically retrieve across the *whole* domain to build
an organized mental model. The app does both: unit mini-quizzes (section-like,
frequent) plus the 75-question mixed exam and the "missed bank" that resurfaces
items across units (whole-text-like, integrative). The final-review stage exists
for exactly this reason.

### 2.3 Spaced retrieval
Spaced-repetition systems reintroduce material at intervals matched to the
forgetting curve; research in ADHD populations reports benefit for vocabulary
retention (PMC12094466; Reynolds & Glaser, 1964). The app's `due` counter and
missed-bank timestamps implement spacing: a missed item resurfaces after a short
interval, then at increasing intervals once cleared (`_cleared`, `ts`).

### 2.4 Desirable difficulties — with a guardrail
Bjork's "desirable difficulties" framework (Bjork, 1994; Bjork & Bjork, 2020):
harder retrieval often yields better long-term retention. But the literature is
explicit that a difficulty the learner **cannot overcome becomes undesirable**
(McDaniel & Butler, 2010; Soderstrom & Bjork, 2015), and Stern & Halamish found
free recall was too demanding for ADHD learners in earlier work (Dudukovic et al.,
2015). **Design rule:** adapt difficulty to the learner's measured mastery, never
push into failure. The app's adaptive set does this by weighting question
difficulty with BKT mastery.

## 3. The machine learning model

### 3.1 Bayesian Knowledge Tracing (BKT)
Per the Corbett & Anderson (1995) formulation and the pyBKT library
(Badrinath et al., 2021; CAHLR/pyBKT on GitHub), BKT is a two-state hidden Markov
model with four parameters: prior P(L0), learn/transition T, guess G, slip S.
After each response the posterior mastery is updated:

```
P(L|correct)   = L(1-S) / [ L(1-S) + (1-L)G ]
P(L|incorrect) = L·S    / [ L·S    + (1-L)(1-G) ]
L_next         = P(L|obs) + (1 - P(L|obs))·T
```

The app uses slip = 0.10, guess = 0.25, transition = 0.12, prior = 0.15 — all
within the literature's standard ranges (pyBKT caps slip/guess at 0.3). `tests/ml_verify.js`
proves the implementation matches a reference Corbett-Anderson update across
10 starting states, is monotonic, bounded, convergent, and slip-tolerant.

### 3.2 Why BKT suits ADHD
BKT is **interpretable** and **per-skill**: it produces a per-unit mastery number,
not an opaque score. The app surfaces this as "Mastery (model)" with a diagnosis
that distinguishes a true gap from trap-guessing (fast wrong) from knowledge
without speed (slow right). This maps directly onto the self-regulation problem:
the learner gets an honest, specific picture of what they own, so effort can be
aimed rather than diffuse.

### 3.3 Elo ability estimate
A parallel Elo rating (`theta`, 600–1600) tracks item difficulty vs responses,
grounded in standard Elo with a logistic expectation. Research on knowledge tracing
(Aleven et al., EDM; Pan & Rickard, 2018) supports modeling performance with both
skill-mastery and ability/difficulty signals.

## 4. Multimodal delivery: audio

- **Voice**: Kokoro-82M (hexgrad), an 82M-parameter open-weight TTS model with
  28 English voices; `af_heart` is the default. Described as remarkably natural and
  real-time/faster, Apache-licensed weights. The app uses the small ONNX build
  (int8 ~92 MB, fp32 ~325 MB) so it runs on CPU with no PyTorch dependency.
- **Loudness**: EBU R128 normalizes programme loudness to −23 LUFS (±1 LU) with a
  −1 dBTP true-peak ceiling; podcast/spoken-word targets are commonly −16 to −19
  LUFS. Measured clips here: integrated loudness −22.2 to −22.3 LUFS, loudness
  range 2.2–3.7 LU — consistent and close to R128, so no re-normalization needed.
  Peak levels vary (−0.0 to −5.8 dBFS) but integrated loudness is what the ear hears
  across a clip; the app also applies a browser-side fallback voice if local TTS
  is unavailable.
- **ADHD & audio**: dual-channel presentation (text + voice) supports engagement
  and reduces the working-memory load of decoding text alone; the "Read aloud"
  toggle and one-voice-at-a-time AudioManager prevent overload.

## 4b. Getting a beautiful voice (Windows/Microsoft + model docs)

Microsoft's Speech Service documentation (fetched this session,
https://learn.microsoft.com/en-us/azure/ai-services/speech-service/text-to-speech)
states the properties that make synthetic speech pleasant and intelligible:

- **Neural deep-network voices** are "nearly indistinguishable from human
  recordings", with clear articulation that **reduces listening fatigue** —
  especially relevant for long study sessions and ADHD learners.
- **Sample rate**: standard neural voices ship at **24 kHz** and high-fidelity at
  **48 kHz**. Our clips are 24 kHz PCM_16 — the standard neural rate.
- **SSML** controls pitch, pauses, pronunciation, speaking rate, and volume. Our
  composer inserts a 0.12 s inter-sentence pause and synthesizes at speed 1.0,
  the equivalent of restrained SSML pacing rather than rushed delivery.
- Standard voices vs custom voices: custom "brand voices" need 20–40 compute hours
  and gated access — out of scope for a local, free study app; we use a strong
  open standard voice instead.

Kokoro-82M (hexgrad, https://huggingface.co/hexgrad/Kokoro-82M) is an 82M-parameter
open-weight model with 28 English voices; `af_heart` is the default female voice.
Apache-licensed weights, real-time or faster on CPU via the ONNX build we ship.
The app defaults to the full fp32 ONNX model (smoothest) and falls back to int8
(smaller). Loudness measured at −22.2 to −22.3 LUFS — consistent with EBU R128's
−23 LUFS target (https://tech.ebu.ch/docs/r/r128.pdf), so clips play at an even
level without clipping.

## 5. Design translation (what the app actually does)

| Evidence | App feature |
|---|---|
| Retrieval practice > rereading | Every interaction is a quiz/short-answer, never passive re-reading |
| Whole-text recall builds organization | Mixed exam + cross-unit missed bank + Final Review |
| Spacing aids retention | `due` counter, missed-bank recency, `_cleared` intervals |
| Desirable but surmountable difficulty | Adaptive weighting by BKT; level gating Easy→Hard→Master |
| ADHD recall less organized | Stable unit order, path map, consistent diagnosis language |
| Working-memory limits | One question at a time, one voice at a time, 8-unit structure |
| Interpretable feedback | BKT mastery % + plain-English diagnosis per unit |

## 6. v6 Cognitive Upgrade — FSRS-DSR, Executive-Function Telemetry, Micro-Interleaving & W3C COGA

Building on the BKT + Elo baseline above, v6 incorporates four peer-reviewed frameworks directly targeting how ADHD minds fail and succeed on high-stakes regulatory exams:

### 6.1 FSRS-DSR Spaced-Repetition Memory Model
Standard fixed-interval review queues ignore both per-topic difficulty and the spacing effect. SIE Mastery v6 adds a per-topic **FSRS (Free Spaced Repetition Scheduler) DSR** model (`static/js/core/teacher.js`) tracking three latent variables per FINRA concept:

- **Difficulty** $D \in [1, 10]$ (mean-reverting toward neutral $5.0$ so an early lucky guess or bad day cannot lock a concept permanently extreme)
- **Stability** $S$ (in days — the exact elapsed time until recall probability falls to $90\%$)
- **Retrievability** $R(t, S)$ after $t$ elapsed days:

```
R(t, S)       = (1 + t / (9 · S))^-1      (exact identity: R(S, S) = 0.90)
I(S, R_target) = 9 · S · (1 / R_target - 1)
```

Ratings $G \in \{1\text{ (Again)}, 2\text{ (Hard)}, 3\text{ (Good)}, 4\text{ (Easy)}\}$ are inferred automatically from correctness and response latency without adding rating-button fatigue to the ADHD learner. Reviewing a topic near its forgetting threshold ($R < 0.90$) produces strictly larger stability growth (*desirable difficulty*) than immediate repetition, while a miss contracts $S$, increments `lapses`, and marks the topic immediately due.

### 6.2 Recursive ADHD Error-Pattern Recognition & Post-Error Braking
ADHD exam errors cluster into distinct executive-function failure modes rather than uniform ignorance (Barkley, 2006; Shiels & Hawk, 2010 — impaired **post-error slowing** and reduced error-related negativity [ERN]):

1. **Impulsive fast misses (`< 6s`):** premature click before parsing the complete FINRA scenario.
2. **Negative-qualifier skimming (`NOT` / `EXCEPT` / `LEAST` / `FALSE`):** skipping inversion words in stems.
3. **Post-error cascades:** submitting a second fast miss (`< 8s`) within 3 minutes of a prior error.
4. **Deep concept gaps (`>= 15s` misses):** sustained effort without a valid rule model.
5. **Speed bottlenecks (`> 25s` corrects):** accurate recall that still risks exam-day time pressure.

Rather than collapsing these into one percentage score, `recordPerf()` classifies every response, updates the **ADHD Cognitive Pattern Profile** (`#/progress`), highlights negative qualifiers visually via XSS-safe `<mark class="qual">` anchors, surfaces a calm inhibitory **Brake Cue** after any fast miss, and offers an opt-in **3-second Impulse Brake** in Settings.

### 6.3 Structured Confusion-Pair Micro-Interleaving
Random domain-wide shuffling increases ADHD task-switching tax, whereas blocked single-topic drills create false fluency on look-alike FINRA rules (e.g., *Fed Reg T 50% initial* vs. *FINRA 25% maintenance / $25k PDT*, or *SEC Rule 15l-1 Reg BI* vs. *FINRA Rule 2111 Suitability*). SIE Mastery v6 curates **12 high-yield FINRA Confusion Pairs** and delivers **6-question Contrast Drills** that strictly alternate `A-B-A-B-A-B`, keeping working-memory load low while forcing crisp rule discrimination (Rohrer, 2012; Brunmair & Richter, 2019).

### 6.4 W3C COGA Alignment & Genuine Multi-Voice Allocation
The v6 interface follows the **W3C Cognitive Accessibility (COGA) 8 Design Objectives**: predictable regions, high-contrast warm editorial typography (`>= 7:1` WCAG AAA body contrast), single calm teal accent, semantic inline icons per screen type, zero noisy gradients or ALL-CAPS transforms, Focus mode (`F`), and a calm lesson audio bar with Pause/Resume, progress bar, and genuine Kokoro voice allocation (`af_heart` pre-recorded clips everywhere, plus live local Kokoro synthesis whenever a learner selects `af_bella`, `am_michael`, or `bf_emma`). Every one of the **355 shipped voice clips** (`340` lesson MP3s + `15` WAVs, `165.3` minutes total) is verified acoustically by `tools/audit_audio.py` (`24 kHz` mono, `-22.9..-22.0 dBFS` RMS, zero corrupt/silent streams).

## 7. Limitations & honest caveats

- The app is a study aid, not a clinical ADHD intervention; no claim of treatment.
- BKT and FSRS weights use principled literature defaults rather than offline per-learner gradient optimization (which requires a large multi-student longitudinal dataset).
- The source study (Stern & Halamish, 2023) used Hebrew prose texts and a 2-day
  delay; SIE content and exam timing differ, so the transfer is principled but
  not a direct replication.

## Sources (fetched across sessions)

1. Stern, P. & Halamish, V. (2023). *Free-recall retrieval practice tasks for
   students with ADHD: whole-text versus section recall.* Frontiers in Psychology
   14. https://doi.org/10.3389/fpsyg.2023.1301726
2. Corbett, A. & Anderson, J. (1995). Knowledge tracing. In *The Psychology of
   Learning and Instruction*. (BKT formulation; via pyBKT docs).
3. Badrinath, B. et al. (2021). *pyBKT: An Accessible Python Library of BKT Models.*
   https://arxiv.org/abs/2105.00385 · https://github.com/CAHLR/pyBKT
4. Ye, J. et al. (2022–2025). *A Stochastic Shortest Path Algorithm for Optimizing
   Spaced Repetition Scheduling / FSRS (DSR Memory Model).* KDD / open-spaced-repetition.
5. W3C WAI Cognitive Accessibility Task Force. *Making Content Usable for People
   with Cognitive and Learning Disabilities (COGA).* https://www.w3.org/TR/coga-usable/
6. Shiels, K. & Hawk, L. W. (2010). *Self-regulation in ADHD: The role of error
   processing (post-error slowing & ERN).* Clinical Psychology Review.
7. Rohrer, D. (2012). *Interleaving helps students distinguish among similar concepts.*
   Educational Psychology Review.
8. Dunlosky, J. et al. (2013). Improving students' learning with effective
   techniques. *Psychological Science in the Public Interest.*
9. Agarwal, P. et al. (2021). Retrieval practice. *Psychological Science in the
   Public Interest.* (via retrievalpractice.org)
10. Roediger & Karpicke (2006). Test-enhanced learning. *Psychological Science.*
11. EBU R128 (2014). *Loudness recommendation.* https://tech.ebu.ch/docs/r/r128.pdf
12. hexgrad. *Kokoro-82M.* https://huggingface.co/hexgrad/Kokoro-82M
13. Microsoft Fluent 2 Design System — Typography & Layout:
    https://fluent2.microsoft.design/typography · https://fluent2.microsoft.design/layout
14. Stripe Documentation — computed styles inspected live at https://docs.stripe.com
