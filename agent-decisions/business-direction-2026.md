# Business direction memo: AI consulting vs. AI education (June 2026)

*Prepared June 10, 2026 to ground the landing-page repositioning. Market claims below were
researched online and adversarially fact-checked against independent sources (funding rounds,
dates, and valuations verified against press releases, TechCrunch, CNBC, Bloomberg, PitchBook,
and company announcements).*

## The question

Should GlowingStar position as **AI in consulting/professional services** — the thesis VCs are
funding most aggressively in 2026 — or **AI in education**, where the company has actually built
and deployed product? And how should the choice be framed in the language VCs are excited about?

## What VCs fund in 2026

**Macro.** 2025 was a record AI funding year (~50–61% of all global VC). Q1 2026 was the largest
venture quarter ever (~$300B, with AI taking ~80%), driven by foundation-model mega-rounds
(OpenAI's $122B round at $852B post; Anthropic's $30B Series G at $380B).

**The defining application-layer thesis is "service-as-software": sell the completed work, not
the tool.** Sequoia's "Services: The New Software" (Julien Bek, March 2026) — "for every dollar
spent on software, six are spent on services"; "a copilot sells the tool, an autopilot sells the
work." Foundation Capital sizes the opportunity at $4.6T. The evidence:

- **Legal** (hottest professional-services vertical): Harvey — $200M at **$11B** (March 2026,
  GIC + Sequoia), $300M ARR; Legora — $550M Series D at **$5.55B** (March 2026, Accel), $100M+
  ARR; Crosby, an actual AI-native law firm, raised a $60M Series B (Lux + Index, March 2026);
  Eudia Counsel operates as an Arizona ABS-licensed AI-augmented law firm.
- **Customer operations**: Sierra — $950M at **$15.8B** (May 2026), outcome-based pricing,
  serves 40%+ of the Fortune 50; Decagon — $250M at $4.5B (Jan 2026).
- **Finance**: Rogo went from $350M (April 2025) to a reported **$2B** (April 2026, Kleiner
  Perkins) in twelve months as "Wall Street's first AI analyst."
- **AI rollups of services firms** (PE-style): General Catalyst's $1.5B Creation strategy;
  Long Lake's **$6.3B take-private of Amex GBT** (May 2026); Thrive Holdings ($1B+, OpenAI
  equity stake); Crete Professionals Alliance buying CPA firms with a $500M+ (now ~$1B) warchest.
- **AI-native consulting**: Distyl AI — $175M Series B at $1.8B (Sept 2025, Khosla + Lightspeed).

**Education is in a funding winter — but with precise hot veins.** Global edtech VC collapsed
from a $16.7B peak (2021) to ~$2.4B (2024) and ~$2.8–3B (2025); Byju's and Chegg (-99%) are the
cautionary corpses, and free pedagogy modes from the labs (OpenAI Study Mode, Google Guided
Learning, Anthropic Learning Mode) have commoditized the generic AI tutor. Yet 60%+ of remaining
deals are AI-flavored, and what raises is specific:

- **Teacher copilots with freemium→district GTM**: MagicSchool — $45M Series B (Feb 2025),
  6M educators; SchoolAI — $25M Series A; Brisk — $15M Series A.
- **Consumer AI learning with real engagement**: Speak — $78M Series C at **$1B** (Dec 2024,
  Accel + OpenAI Startup Fund); Gizmo — $22M Series A (April 2026), 13M users.
- **Institutional higher-ed**: EdSights — $80M (Sept 2025); Campus — $46M (General Catalyst,
  Sam Altman).
- **Workforce L&D exits**: Sana acquired by Workday for ~$1.1B (Sept 2025).
- **Efficacy evidence as ammunition**: the Harvard/Nigeria/Stanford Tutor CoPilot RCTs power
  pitch decks, while the Wharton/PNAS "guardrails" finding (students using raw GPT-4 felt they
  learned while doing worse unassisted) is the canonical buyer fear behind every serious
  procurement conversation.

## What GlowingStar has actually built

Every credible asset is education:

- **Tutor Mode Studio** — five-agent orchestration (manager + curriculum strategist, modality
  researcher, assessment architect, progress coach) generating structured tutoring plans, with
  in-chat visual explanations and practice quizzes.
- **Saint Paul deployment** — a real Hong Kong secondary-school deployment (F4/F5, four subjects,
  Traditional Chinese): teacher-controlled session links, pre/post assessment with per-item
  3-point confidence ratings, full event logging to DynamoDB/S3. Scale: **323 students, ~1,150
  valid sessions, 2,751 student→tutor messages, ~253k interaction events**.
- **First-party study findings** (`saintpaul-ai-tutor-research-findings.md`): learning-efficacy
  null (within-student AI − traditional = +0.9 pts, 95% CI −3.8…+5.6; both arms +16–17 pts) and
  a directionally robust within-student "confidently wrong" calibration effect (+0.157 confidence
  units on incorrect post-test answers, p=0.010; placebo null). Known limitations: single school,
  non-randomized class×subject assignment, clustering fragility — do **not** claim causality
  publicly.
- **USF Defense** — five-round oral reasoning-defense workflow for university students; plus
  realtime voice, emotion analysis, research dashboards.

Consulting assets: none — no product, no clients, no artifacts. A consulting pivot would be
narrative without proof and would fail any diligence. It would also jeopardize the Google for
Startups Cloud Program application: GFSCP explicitly excludes dev shops, consultancies, and
agencies, and the old landing copy ("work with each team one-on-one") already read as one.

## Recommendation

**AI in education, framed through the 2026 service-as-software thesis: sell verified learning
outcomes delivered as instrumented programs — not an AI tutor tool.**

The reasoning:

1. **The generic AI tutor is commoditized** (free lab study modes; Chegg's collapse). Competing
   there is a price war against free.
2. **The scarce layer is proof.** As every school system and university ships an AI learning
   surface, the question shifts from "can AI tutor?" to "did students learn?" GlowingStar is one
   of very few teams globally that has deployed in a real school, run a controlled within-student
   comparison, and measured both efficacy and the calibration failure mode (the "confidently
   wrong" effect) that the Wharton/PNAS result made every buyer fear. Our honest null is a
   credibility moat, not a liability: it is exactly what differentiates us from vendors waving
   unverified "2x learning gains."
3. **This imports the hot thesis into the vertical.** "Outcomes, not seats" is what AI-services
   investors pay for (Sierra's outcome-based pricing, Crescendo's per-resolution pricing). The
   education version: instrumented deployments that double as studies, generating proprietary
   interaction + calibration data that compounds with each partner institution.
4. **Defensibility lives in deployment rails** — multilingual curriculum alignment, teacher
   workflows, compliance-grade event logging, and the evaluation methodology — not in the chat
   layer, which models will keep absorbing.

## Risks and mitigations

1. **Education checks are small** (median pure-play AI-edu round ~$8M). Plan for seed-scale
   capital; position the measurement layer as extensible to any organization deploying AI
   learning — including labs, school operators, and corporate L&D, where exits are real.
2. **The study is fragile** (single site, non-randomized, clustering-sensitive significance).
   Never overclaim. Frame as "we built the instrumentation that catches this"; replicate with
   randomized assignment in the next deployments.
3. **The honest-null optics.** Present as rigor: both arms improved ~16–17 points; the AI arm
   matched (didn't beat) quiz practice on scores while shifting calibration. That is a reason
   institutions need measurement — i.e., a reason they need us.

## Landing-page implications (applied June 2026)

- Position: "AI learning programs with the evidence built in" — product company, not consultancy.
- Describe the business plainly (GFSCP: no "coming soon", no agency-sounding copy).
- Showcase product pillars grounded in shipped surfaces; show deployment stats honestly.
- Name the founder (Charlie Chenyu Zhang) and team affiliations; keep the mission quote.
- Contact: support@glowingstar.ai (domain-matching email is a hard GFSCP rule).
- Add privacy + terms pages; keep the site live at glowingstar.ai (verified live, CloudFront).
