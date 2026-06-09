# Saint Paul AI-Tutor Study — Findings & Publication-Venue Analysis

*Status: internal research memo (2026-06-09). Analysis is reproducible from the
out-of-repo data export (see §6). All statistics are aggregate; this document
contains no student PII.*

**One line:** In a single secondary school, an AI study-tutor did **not** improve
learning over quizzing alone (a precise-ish null), but is **associated with worse
metacognitive calibration** — students are more confident on the questions they get
wrong in their AI-taught subjects. The calibration effect is directionally robust
but its *significance is fragile* to correct clustering, and several validity gaps
must be closed before it can carry a causal claim.

---

## 1. Study overview

- **Setting:** one Hong Kong secondary school, senior secondary (F4/F5), four subjects
  (physics, chemistry, geography, history), Traditional Chinese.
- **Conditions:** `quiz-only` (傳統) vs `quiz + LLM AI-tutor` (AI). Assignment is at the
  **class × subject** level (**not randomized**). Because students take multiple subjects,
  the same student appears in both conditions across subjects → **within-student** design.
- **Instruments:** short MCQ quizzes (6 gradeable pre, 8 post) + per-item **3-point**
  confidence (1 = guess, 2 = somewhat, 3 = very); **immediate** post-test only.
- **Sample (after keeping only 7-digit student IDs):** ~1,150 valid sessions; **323
  distinct students**; ~1,050 pre / ~920 post scored quizzes; 2,751 student→tutor chat
  messages; ~253k interaction events.

## 2. Findings

### 2.1 Learning efficacy — null

- Within-student AI − traditional accuracy gain = **+0.9 pts (95% CI −3.8 … +5.6)**.
- Both arms improve a lot pre→post (≈ +16–17 pts). The raw AI post-test advantage
  (AI higher in 7/8 cells) is a **baseline artifact**: AI classes started ≈ **+4.6 pts**
  higher (non-equivalent groups); the same-item *gain* is a 4-of-8 tie.
- ⚠️ "Precise null" is slightly overstated — the CI still contains an
  educationally meaningful ~0.25 SD benefit.

### 2.2 Calibration — "confidently wrong" (the headline, with caveats)

Within the same student, on POST-test questions answered **incorrectly**, confidence is
higher in AI-taught subjects than traditionally-taught ones:

| Design | Estimate (AI − TR) | Stat | Note |
|---|--:|---|---|
| Within-student paired (POST) | **+0.157** | t=2.63, p=0.010; Wilcoxon p=0.005; n=110 | assumption-light |
| Pre-test placebo (before teaching) | +0.029 | p=0.51; n=140 | null (good) |
| Within-student difference-in-differences | +0.137 | p=0.046; n=103 | borderline |
| Mixed model (subject+grade, **student-clustered**) | β=+0.179 | p<0.0001; n=1,659 | ⚠ see §3 |
| Single-item fixed effects (same item) | β=+0.163 | p<0.0001 | ⚠ student-clustered |
| Calibration interaction (`mode×correct`) | mode[AI] +0.142; interaction −0.095 | p=0.003 | resolution ↓ |

Descriptively, the gap between confidence-when-right and confidence-when-wrong shrinks
under AI (TR 2.26/1.69 = +0.58; AI 2.32/1.95 = +0.36). The effect is robust to
leave-one-subject-out (β stays +0.17–0.20).

### 2.3 Mechanism — null (demand side)

All 2,751 student messages were classified by intent (answer-seeking / explanation-seeking
/ self-reasoning / other). Within the AI arm, **neither chat volume nor answer-seeking
ratio predicts overconfidence** (all specs ρ≈0, p>0.1). Even AI-arm students who barely
chatted are overconfident → looks like a property of the AI *condition*, not an individual
"offloading dose." The **supply side** (what the tutor *said*) is untested and is the most
promising remaining mechanism.

## 3. Threats to validity (what an adversarial reviewer will hit)

These materially lower confidence in the headline and gate any submission:

1. **Clustering at the wrong level (most serious).** Treatment is assigned at class×subject
   (≈ 8 subject×grade cells, fewer real classes), but the decisive models cluster only by
   student. Re-clustering at subject×grade inflates the wrong-confidence SE **0.037 → 0.129**
   and collapses **p<0.0001 → ≈0.043**; with only ~8 clusters even that is unreliable. The
   honest assumption-light numbers are p=0.01 / p=0.046. **No class/teacher ID was recorded**,
   so the correct random-effects / wild-cluster-bootstrap analysis is *impossible without the
   school roster*.
2. **Collider / selection on outcome.** "Confidence-when-wrong" conditions on correctness,
   which differs across arms (wrong-rate 19.6% AI vs 26% TR) → the "wrong" item sets are
   non-comparable. Also, AI raises confidence on **correct** answers too (+0.05), more on
   wrong (+0.14) — i.e. partly *general confidence inflation*, not purely error-specific.
   Fix: a calibration metric defined over **all** items (Brier / AUC / over-confidence index).
3. **Data-integrity / design leak.** 323 distinct 7-digit students (not the ~455 implied by
   session counts); **40 student×subject pairs appear in BOTH modes**, contradicting the clean
   class×subject assignment (ID reuse or assignment leak — needs roster to resolve).
4. **Mode × subject collinearity.** A student's within-person "AI vs traditional" contrast is
   also a "physics/chem vs geography/history" contrast; additive subject FE only partly absorbs it.
5. **Coarse/immediate instruments.** 3-point confidence (ceiling effects), same items pre/post,
   immediate-only (no retention/transfer), not pre-registered, modest ~0.2 SD effect.

**Bottom line:** the effect is *real-looking and direction-stable*, but **not yet cleanly
established**. It needs the roster + assignment-level clustering and a non-collider calibration
metric before any causal "AI worsens calibration" claim.

## 4. Publication-venue analysis

### 4.1 Where it fits in the Nature portfolio

| Venue | Topic fit | Clears its bar? | Accept prob. | Note |
|---|---|---|--:|---|
| **Scientific Reports** (IF≈3.9) | strong | yes (soundness-only) | moderate | most realistic Nature home |
| **npj Science of Learning** (IF≈3.0) + its GenAI collection (deadline **2026-10-13**) | partial (metacognition is on-theme) | borderline | low | on-theme reach; needs a real lift |
| Communications Psychology | partial | no | 8–12% | likely desk-reject on scope |
| Nature Human Behaviour (IF≈16) | partial | no | 2–4% | needs preregistered multi-site RCT |
| flagship *Nature* | — | no | ~0 | out of reach |

Non-Nature comparators (often a **stronger field signal** for AI-in-education / HCI):
**CHI** (CORE A*, ~25% accept) and **Computers & Education** (IF≈12).

### 4.2 Scientific Reports vs npj Science of Learning

| | Scientific Reports | npj Science of Learning |
|---|---|---|
| Type | Nature **mega-journal**, all fields | Nature **partner journal**, learning science only |
| Reviews for | **technical soundness only** (importance explicitly *not* judged) | soundness **+ advance/importance in field** |
| Acceptance | ~50% (very broad) | clearly more selective |
| IF / volume | ≈3.9 / ~20–30k papers/yr | ≈3.0 (CiteScore ~6) / dozens/yr |
| **Prestige signal** | "sound, importance not claimed"; diluted by volume | **higher in-field prestige**; targeted credential for your peers |
| Lift for this paper | small (rescope causal→associational, ethics + data statements, fix clustering) | large (the §5 roadmap) |

**Takeaway:** similar IF, **different currency**. Sci Rep = easier/faster/lower signal;
npj Science of Learning = harder but **worth more to the education / learning-science
community**. Don't choose on IF.

### 4.3 Recommendation

- **Realistic, fast:** Scientific Reports — after rescoping every causal claim to
  *associational*, adding IRB/consent + data-availability statements, and fixing the
  clustering (§3.1).
- **Higher-prestige, on-theme target:** npj Science of Learning's GenAI collection
  (deadline 2026-10-13) — requires the §5 lift.
- **Worth considering for field reputation:** CHI or Computers & Education may carry a
  stronger signal in this area than Scientific Reports.

## 5. What to add to reach npj Science of Learning

**Tier 0 — validity gates (without these it is dead on arrival):**
- **Recover the class/teacher roster** → cluster/model at the true assignment level
  (class/teacher random effects or wild-cluster bootstrap). *Single most important item; needs the school.*
- **Replace the collider metric** with a calibration score over all items (Brier / AUC /
  over-confidence index); separate "general confidence inflation" from "error-specific". *Doable now.*
- **Reconcile the sample** (323 vs 455; investigate the 40 dual-mode student×subject pairs);
  CONSORT/TREND flow + differential-attrition test.
- **Soften all causal language** to associational.

**Tier 1 — mechanism (turns a phenomenon into an insight; npj wants the *why*):**
- **Supply-side analysis** of the 4,583 assistant messages + events: does the tutor hand over
  answers / over-affirm / under-probe / expose errors, and do those behaviours predict the
  calibration outcome? *Doable now.*
- Control for time-on-task.

**Tier 2 — design (what actually lifts it to npj level; needs new data):**
- **Delayed retention / transfer test** — does the miscalibration persist / predict worse later
  performance?
- **Second cohort / pre-registered confirmatory replication** (ideally a Registered Report).
- **Continuous confidence elicitation** (0–100%) instead of the 3-point scale.
- Break the mode×subject confound (same subject taught in different modes across classes).

**The real npj gate = roster (Tier 0) + a delayed/second measurement (Tier 2).** If those are
unobtainable, target Scientific Reports / Computers & Education instead.

## 6. Reproducibility

Data + scripts live **outside this repo** (≈ 800 MB, contains sensitive student session
content — keep out of git) at `~/glowingstar-saintpaul-export/<timestamp>/`:
DynamoDB JSONL backup, S3 image assets, `answer_key/all_quizzes.json`,
`analyze_saintpaul.py`, `analyze_calibration_within_student.py`, `analyze_dose_response.py`,
`out_*.csv`, and a longer `FINDINGS.md`. Keep only 7-digit student IDs. Re-export via
`backend/scripts/export_dynamodb_backup.py` (`AWS_PROFILE=glowingstar`, region `us-east-2`).
