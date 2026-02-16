# Prompt: Find Posts Relevant to Ray's Interests

You are helping Ray (Raymond Arnold) filter through news feeds to find the most relevant posts. Below are Ray's interests, underserved goals, and selection heuristics, derived from observing his activity over the past week.

---

## 1. Ray's Interests

**Core professional identity:**
- Admin/moderator of LessWrong, a rationality and AI safety community. Makes editorial and moderation decisions daily (approving users, reviewing posts, evaluating content quality).
- Software developer building interactive web projects in Next.js / React / TypeScript / Tailwind / Three.js.

**Active projects he's working on RIGHT NOW:**
- **AI 2030 Globe visualization**: A react-three-fiber 3D globe showing AI datacenter locations, with ink outlines, hex/SVG country geometry, camera animations, HUD overlays, and mobile responsiveness. Heavy debugging of edge rendering and architecture refactoring.
- **Baba-is-You-inspired rationality lessons app** ("baba-is-wons"): A puzzle-based teaching platform for metacognition and rationality skills. Uses drills with time limits, progress panels, drag-drop ordering, Tiptap rich text editor. Currently building lesson editor and "Noticing Metacognition" content.
- **Observatory news aggregator** (this project): Aggregating Hacker News, LessWrong, and arXiv into a newspaper-style layout.
- **LessWrong community moderation**: Ongoing daily work reviewing posts, managing users, discussing community epistemic norms.

**Deep interests:**
- **AI alignment & safety**: Especially practical/empirical work, alignment faking, AI capabilities scaling, AI timelines, lab policy
- **Rationality & metacognition**: Teaching people to notice confusion/surprise, epistemic hygiene, how to evaluate whether someone's thinking has "gone off the rails"
- **Community epistemics**: Selection effects on information, how intellectual communities maintain or lose epistemic standards, whether to take contrarian thinkers seriously, moderation philosophy
- **UI/UX design & web craft**: Minimalist design (Tufte-inspired), modern CSS, responsive layouts, studying specific designers (Steve Schoger, Zaha Hadid). Cares about typography and information density.
- **3D visualization & creative coding**: Three.js, react-three-fiber, globe rendering, procedural geometry (hexes, grids), pen plotters
- **Pedagogy / teaching design**: How to structure lessons that build skills incrementally, puzzle-based learning, drill design
- **Narrative structure & media analysis**: Analyzes TV shows for character arc structure, nihilism, meaning-making, and how storytelling portrays worldview collapse
- **Gaming**: Slay the Spire (high-level play), board games, puzzle games

**Peripheral interests (browsed/engaged with this week):**
- AI agent tools (OpenClaw, computer-use agents)
- Retro computing / homebrew hardware
- LLM reasoning and jailbreaking research
- Demographics and societal trends
- Prediction markets
- Audio/music tech
- Fermi paradox / cosmology

---

## 2. Goals That Would Help His Interests That He's NOT Currently Working On

These are areas where reading/learning would provide high leverage but where Ray doesn't appear to be actively building or researching:

1. **Pedagogy research / learning science**: He's building a teaching app but appears to be designing by intuition rather than drawing on learning science literature. Papers on spaced repetition, desirable difficulties, puzzle-based learning efficacy, or metacognitive training programs would be directly useful.

2. **Information architecture & feed curation algorithms**: He's building a news aggregator but hasn't explored how to rank/filter stories beyond simple ordering. Research on recommendation without filter bubbles, collaborative filtering, or attention-aware curation would be relevant.

3. **Community governance models & moderation research**: He moderates LessWrong and thinks hard about epistemic norms, but could benefit from academic or practical work on online community governance, content moderation at scale, reputation systems, or trust/safety design patterns.

4. **3D performance optimization & WebGL best practices**: He's spending significant time debugging Three.js rendering issues (ink outlines, edge rendering, mesh instancing). Technical content on WebGL performance, instanced rendering, shader optimization, or react-three-fiber architecture patterns would save him hours.

5. **Design systems & visual design theory**: He studies individual designers but could benefit from systematic design thinking — grid systems, typographic scales, color theory in data visualization, information density tradeoffs.

6. **Writing and communication**: He writes LW comments and moderates discussions, spending time crafting diplomatically careful messages. Essays on clear writing, giving feedback, or managing difficult intellectual conversations would be useful.

7. **AI policy and governance**: He works adjacent to this (AI 2030 project, LW moderation of AI discourse) but doesn't appear to be reading policy papers or governance frameworks directly.

8. **Personal productivity and time management**: His keylogs show late-night sessions (midnight-1am), afternoon tiredness, and scattered attention. Practical productivity research could help.

---

## 3. Heuristics for Selecting Posts/Essays/Papers to Read

When scoring posts for relevance, apply these heuristics:

**HIGH RELEVANCE — Prioritize if:**
- Directly addresses a technical problem Ray is actively debugging (Three.js rendering, react-three-fiber patterns, Next.js architecture)
- Presents novel empirical findings about AI alignment, capabilities, or safety (not just opinion pieces)
- Offers concrete, actionable pedagogy or teaching design insights (not vague "education is important" takes)
- Discusses community epistemics, moderation philosophy, or how intellectual communities evaluate contrarian claims
- Demonstrates creative/unusual interactive web projects, data visualization, or generative art — especially if minimal and well-designed
- Contains specific modern CSS, Tailwind, or frontend techniques he could immediately use
- Analyzes AI agent architectures or tool-use patterns (relevant to both his coding workflow and AI 2030 project)

**MEDIUM RELEVANCE — Include if the feed isn't already full:**
- Thoughtful narrative analysis, media criticism, or game design discussion
- Broad AI policy/governance pieces with concrete proposals (not vague doomerism or accelerationism)
- Interesting math, logic, or puzzle content
- Demographic, economic, or societal trend analysis with rigorous methodology
- Open source tooling or developer experience improvements

**LOW RELEVANCE — Deprioritize:**
- Pure business/startup news without technical or intellectual substance
- Domain-specific ML papers with no connection to alignment, reasoning, or interpretability (e.g., weather forecasting ML, medical imaging ML, most NLP benchmarks)
- Political news or culture war content
- Cryptocurrency or blockchain content
- Papers that are incremental improvements on narrow benchmarks
- Content that is primarily promotional or corporate announcements (unless from a major AI lab with substantive technical content)

**STYLE/QUALITY filters:**
- Prefer posts that show original thinking over summaries of others' work
- Prefer empirical results over pure speculation
- Prefer posts that engage with counterarguments or acknowledge limitations
- Deprioritize clickbait titles, listicles, or "N things you didn't know about X" format
- Posts from LessWrong, ACX (Astral Codex Ten), or well-known rationality-adjacent thinkers get a small relevance boost
- Posts that relate to metacognition, noticing confusion, or epistemics get a boost regardless of domain

---

## Task

Given the JSON data below containing stories from Hacker News, LessWrong, and arXiv, score each story for relevance to Ray on a scale of 1-5 and provide a brief (one sentence) justification. Return the results sorted by score (highest first), grouped by source.

[PASTE JSON DATA HERE]
