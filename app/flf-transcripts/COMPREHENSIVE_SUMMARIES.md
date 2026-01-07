# Comprehensive YouTube Video Transcript Summaries

**Source:** https://aiforhumanreasoning.com/#fellowship  
**AI for Human Reasoning Fellowship Presentations**

---

## Summary Overview

This document contains summaries of 21 YouTube video presentations from the AI for Human Reasoning Fellowship. Each presentation showcases projects focused on using AI to improve human reasoning, coordination, and decision-making.

---

## 1. Ben Sclaroff - Economic Democracy and Worker Cooperatives

**Video:** https://www.youtube.com/watch?v=20yWMxAx6QI

**Summary:** Ben Sclaroff, a former startup founder, presents his vision for economic democracy through worker cooperatives in the tech industry. He argues that traditional companies are constrained by profit maximization ("Mulliko"), and proposes building an AI startup structured as a worker cooperative. The governance model includes yearly worker elections for the board, non-voting investment shares, and equal compensation by default. He's also building "Pivotal" - a transparent activity log system to help democratic organizations run more effectively by allowing workers to track organizational history and identify trustworthy leaders.

---

## 2. Alejandro Botas - Epistemic Evaluations and Reward Hacking

**Video:** https://www.youtube.com/watch?v=6CVBHgyo-V0

**Summary:** Alejandro presents work on epistemic evaluations, focusing on reward hacking as a higher-level abstraction of problems like sycophancy and hallucination. He argues that by adding good data in domains we care about, we can differentially refine optimization specifications. He's building evaluations using high-quality Wikipedia edits to assess model ability to discern better information snapshots. He's also creating a public leaderboard with calibration evals that add confidence targets and wrong answer penalties, addressing the problem that models are very overconfident and poorly calibrated.

---

## 3. Pivotal Team (Anand Shah, Parker Whitfill, Kai Sandbrink, Ben Sclaroff) - Coordination Technology Demo

**Video:** https://www.youtube.com/watch?v=9lX6cwiw0Ac

**Summary:** The Pivotal team demonstrates their coordination technology built on Slack. Pivotal is an AI agent that helps teams coordinate by scheduling meetings, managing calendars, transcribing meetings, extracting action items, and maintaining shared organizational context through GitHub integration. The system creates an automatic activity log that serves as both context for the AI agent and for team members to coordinate better. The demo shows an asynchronous meeting workflow where Pivotal schedules meetings, creates transcripts, extracts action items, and updates shared documentation automatically.

---

## 4. Vaughn Tan - Subjective Reasoning Scaffold Tool

**Video:** https://www.youtube.com/watch?v=ErYC-F7lJac

**Summary:** Vaughn Tan presents a tool to help students develop robust arguments about subjective topics (things without objective truth) in 15 minutes. The tool provides a reasoning scaffold - a "prep mirror" that helps students go from thin statements to well-articulated arguments. The AI acts as a Socratic mirror, paraphrasing back what students write so they can decide if that's what they mean, rather than generating content or judging quality. The tool keeps "meaning making" separate and entrusts it only to humans. Tested with real teams, it shows significant time savings (60 minutes per student) and quality improvements.

---

## 5. Steve Isley - Polis 2.0: Collective Response System

**Video:** https://www.youtube.com/watch?v=EzVN2IJhP7Q

**Summary:** Steve Isley presents Polis 2.0, the successor to Polis (used in Taiwan for decision-making and by Anthropic for collective constitutional AI). He describes a study with 1,000 quota-sampled Americans exploring their views on AI concerns. Participants wrote statements and voted, generating 80,000+ votes. The system identified two main groups (773 vs 273 people) with different views on regulation, though there was significant bridging consensus on topics like deep fakes, truth verification, education, and accountability. Polis 2.0 adds semantic topic modeling, importance voting, and consensus statement generation using LLMs to create bridging overviews.

---

## 6. Blake Borgeson - Orchestrated Communication with Chord

**Video:** https://www.youtube.com/watch?v=IkwKzNl6J-g

**Summary:** Blake Borgeson introduces "orchestrated communication" - a parallelized communication system where each person has a one-on-one conversation with an AI facilitator, rather than serialized broadcast messages. This allows faster decisions, better information gathering, and the ability to add more people without slowing down. Chord is the initial implementation for small groups trying to reach consensus. Users create a session, share a link, and each person has a personalized conversation with the AI facilitator that manages context and information flow. The system can scale from frivolous family decisions to serious government policy decisions.

---

## 7. Agita Pasaribu - Evidentiary: AI for Trust and Safety Compliance

**Video:** https://www.youtube.com/watch?v=NOYGvoB3pk4

**Summary:** Agita Pasaribu, a lawyer focused on cyber harassment victims, presents Evidentiary - an AI tool for trust and safety compliance focused on non-consensual intimate image abuse and deepfake pornography. The platform allows survivors to report content, capture links immediately, verify their identity, and uses multiple deepfake detection APIs (four aggregators) plus C2PA and reverse image search. After takedown, it continuously searches for re-uploads and provides automated notices. The system uses hash-based detection (StopNCII) to prevent re-uploads and can detect patterns for law enforcement escalation. Addresses the challenge that consent is contextual and not detectable in pixels.

---

## 8. Siddarth Srinivasan - AI Supervised Deliberation Markets

**Video:** https://www.youtube.com/watch?v=OA-nLfXV7Ks

**Summary:** Siddarth presents deliberation markets where the goal is to aggregate reasoning, not just beliefs. Instead of buying yes/no contracts like traditional prediction markets, participants write explanations of their views. An LLM reads the explanation, synthesizes it into a probability, and trades on that belief. The LLM decides trading direction based on reasoning quality. The system incentivizes good reasoning by having participants persuade an LLM reader toward eventual ground truth. Extensions include using swarms of LLMs representing populations to find bridging arguments across representative groups, shifting from forecasting to persuasion.

---

## 9. Paul de Font-Réaulx - Collective Agency and Group Collaboration Tools

**Video:** https://www.youtube.com/watch?v=P_uMaOzBH_Q

**Summary:** Paul presents his vision for increasing humanity's "collective agency" - moving from low collective agency (where power outstrips wisdom) to understanding what we all want and being able to do that. He maps interaction patterns for group collaboration, highlighting AI intermediary and collaboration guide patterns. He discusses phases of collaboration (understand, explore, decide, coordinate, create, share, reflect, update) and argues that while AI intermediaries are effective, we need more human-feeling interactions and connection to collective processes. He's interested in large-scale collective sensemaking and discovery, moving beyond walled gardens and engagement machines to something with fractal structure, domain-specific trust, and common sense privacy.

---

## 10. Herbie Bradley - AI for the Epistemic Commons

**Video:** https://www.youtube.com/watch?v=Q-2Ci4Ajmh8

**Summary:** Herbie Bradley explores using AI to broaden the "epistemic commons" (like Wikipedia). The core motivation is: what content should we write for future AI readers and writers? He focuses on expanding Wikidata (an open knowledge graph) because structured data makes it tractable for AI, and it's upstream of community notes and fact-checking. He prioritizes scientific literature and items downstream of current news for speed advantages. He's also working on AI tools for Wikipedia, including detection of manipulative edits (which may be a majority of current edits). He's developing language model evaluations for article quality that could extend into reinforcement learning environments for labs to train on.

---

## 11. Martin Ciesielski-Listwan, Luke Hewitt, Paul de Font-Réaulx - Deliberation Bench

**Video:** https://www.youtube.com/watch?v=T3JAWlc1dq0

**Summary:** The team presents Deliberation Bench, a normative benchmark for LLM persuasiveness that uses human deliberation as empirical grounding. The core idea: compare the influence of deliberative polls (structured discussions with experts) to interactions with LLMs. They ran experiments with 4,000 Americans across 12 policy topics, having them chat with one of six LLMs (GPT-4, Gemini, Claude, Grok, Llama, or DeepSeek). Key findings: (1) LLM influence was positively associated with deliberative polls, (2) differences between models were modest despite different user ratings, (3) no depolarization effect (unlike deliberative polls). They propose this as a way to monitor LLM influence over time and identify manipulative influence.

---

## 12. Alex Bleakley - Virtuous: Evaluations for Complex Normative Behaviors

**Video:** https://www.youtube.com/watch?v=TZSCkqxl8q8

**Summary:** Alex presents "Virtuous," a proposed nonprofit organization focused on developing high-quality evals for complex normative behaviors that wouldn't easily be captured otherwise. He breaks down epistemic virtues into three categories: truthfulness, helpfulness, and integrity. He argues that evals are powerful tools that decrease costs for labs to optimize for things and increase costs of not doing so. The challenge is that complex virtues like "truthfulness" or "conducive to flourishing" are difficult to define and measure. Virtuous would solicit feedback from stakeholders, recruit internal teams for different virtues/evals, and fund external proposals. Long-term, they'd use AI to leverage current models to improve next-generation models.

---

## 13. Alex Bleakley & Emma Kumleben - Waymark Labs: AI-Powered Strategic Foresight

**Video:** https://www.youtube.com/watch?v=_xtHcBQGYpE

**Summary:** Alex and Emma present Waymark Labs, focused on AI-powered strategic foresight for governments. They're concerned about governments' ability to keep up with AI's pace of change. They're working on a design partnership with RAND (geopolitics of AGI team) and the Forecasting Initiative. Their demo shows a scenario planning tool where you define a scenario (e.g., GPT-7 with online learning in 2029), identify stakeholders, and the system analyzes what actions each stakeholder should take, checks feasibility, considers ramifications, and identifies interaction effects. They found that asking LLMs to explicitly forecast (rather than just think through effects) produces much better, less dramatic results. They're targeting think tanks first, then foresight units, then risk modeling use cases.

---

## 14. Kai Sandbrink - Negotiation Station: Benchmark for AI-Mediated Negotiations

**Video:** https://www.youtube.com/watch?v=eHxQRoE3MmA

**Summary:** Kai presents Negotiation Station, a benchmark and training environment for negotiating AI agents. The framework implements different AI agents (negotiators with positions and mediators trying to find consensus) and uses cake-cutting (a classic economics problem) as the benchmark domain. The system works similarly to Pivotal with a mediator generating messages, participants replying, and tool calls checking for agreements. Key results: (1) Cooperative agents find solutions more frequently and faster than adversarial agents, (2) Introducing a mediator initially slows adversarial agents but iterative prompt improvement helps them reach agreements almost as quickly as cooperative agents, (3) Larger models (Claude Sonnet vs Haiku) generate better outcomes on average. The system can also be used with humans replacing agents or giving preferences to AI agents.

---

## 15. Steve Isley - AI Fact Checker for Community Notes

**Video:** https://www.youtube.com/watch?v=jqss-3RYjaE

**Summary:** Steve presents an AI fact-checking system that automatically writes and submits Community Notes on X (Twitter). He tested 2,000 notes over 10 days, with only 13 successfully making it through the Community Notes algorithm. The system filters low-clarity notes using an LLM pipeline, then has separate agents for fact-checking (creating detailed reports on companion websites) and writing the 280-character Community Notes submissions. His most successful note got 1.7 million impressions. For $385 in LLM fees, he generated 2.3 million total impressions and ~1,000 clicks to companion websites. He notes limitations: the bridging algorithm doesn't work well for really contentious issues, and many consequential epistemic issues don't get community notes.

---

## 16. Sofia Vanhanen - Future Visions Hub: World Building Platform

**Video:** https://www.youtube.com/watch?v=lCqQIabLKVo

**Summary:** Sofia presents Future Visions Hub, a platform for creating, sharing, and sensemaking on future scenarios and world-building. She notes that valuable future thinking works (AI 2027, FLI world-building competition, etc.) are disconnected and their key ideas don't reach public discourse. The platform would make scenarios more immersive and engaging, surface key ideas from complex narratives, identify predictions and connect them to prediction markets, generate aesthetics and short stories, and enable high-quality collaborative decision-making about futures. The theory of change: better futures thinking → better memes about futures → shared vocabulary and visions → improved coordination. She's building an MVP focused on communicating worlds in more immersive ways and bringing existing world builds together.

---

## 17. Alysia Jovellanos & Martin Ciesielski-Listwan - Image Epistemics & RiskWatch

**Video:** https://www.youtube.com/watch?v=m5h8Sx8kx18

**Summary:** Alysia and Martin present two projects. First, Image Epistemics: trying to apply reverse image search to write Community Notes on X. They found that traditional reverse image engines (TinEye, Yandex, Google, Bing) only return matches ~1% of the time - effectively making exact reverse image search "dead" for 99% of images. The blocker isn't AI but lack of a searchable commons (social media platforms are walled gardens, images are constantly posted, crawling is against terms of service). Their recommendation: social media platforms should build internal reverse image search. Second, RiskWatch: a risk/threat observatory aggregating predictions across Polymarket, Manifold, Kalshi, etc. It filters by velocity, category deep dives (AI safety, biosecurity, nuclear, climate), and helps forecasters find related questions and neglected opportunities. It's like "CoinMarketCap but for prediction markets."

---

## 18. Alex Bleakley - Agent Prediction Strategies & Cheap Gradability

**Video:** https://www.youtube.com/watch?v=qkvFfS_nTI8

**Summary:** Alex presents work on agent prediction strategies and "cheap gradability" - the idea that if agents make predictions that can be graded very quickly, we can learn much more than waiting months for election results. He's interested in observability (knowing why agents suggest things), groundedness (tied to reality, not just training data), and scalability. He's built a framework for running agents and backtesting predictions at scale, starting with financial predictions (because financial APIs provide grounded historical data). The framework lets you see whether agents are accurate and explore what reasoning strategies make agents more effective at predicting facts. This could extend to other domains beyond finance.

---

## 19. Gordon Brander - Deep Future: AI Agent for Scenario Planning

**Video:** https://www.youtube.com/watch?v=r_vdUeoKbJE

**Summary:** Gordon presents Deep Future, an AI agent for scenario planning (like "Deep Research but for strategic foresight"). The system guides users through structured scenario planning: starting with a focal question, identifying driving forces, mapping structural connections between forces, mapping them on impact/uncertainty axes, and generating strategic reports with summaries, insights, strategic implications, opportunities/allies/threats tables, critical uncertainties, signposts to watch, and strategic recommendations by time horizon. The system has a sophisticated memory system for managing longer task horizons and tools for scenario planning research. Future plans include compressing full scenario workshops (usually a week) to 10-15 minutes and automated AI horizon scanning (scraping news, identifying forces, updating models, triggering early warnings).

---

## 20. Matt Brooks - MVP Experiments: Offers & Asks, Digital Twins, Sealed, EA Global Matcher

**Video:** https://www.youtube.com/watch?v=uX3EdKWo3ZA

**Summary:** Matt presents four MVP experiments. (1) Offers & Asks Slackbot: matched fellows by skills/topics but no one remembered to use it - learning: meet people where they are, reduce friction. (2) Matt GPT Digital Twin: fed all his preferences/texts/Slack messages - worked well for 80% of preferences but the important 20% (worldview, nuanced thoughts) isn't in digital data, it's "in your head." (3) Sealed.com: anonymous suggestion box with AI filter to prevent meanness/infohazards - works but only solved one bottleneck (fear of meanness), not others (not enough feedback, don't trust anonymous givers). (4) EA Global Matcher: found "product-market fit in 30 minutes" - matched conference attendees based on detailed forms they already filled out. Perfect storm: data already there, main bottleneck was cheap intelligence on 1000 data points, all upside/no risk, opt-in/opt-out. Key learning: if you have perfect storm of data + AI solves the bottleneck, you can get product-market fit quickly.

---

## 21. Matt Brooks & Niki Dupuis - AI Discourse Sensemaking: In-Group & Out-Group Analysis

**Video:** https://www.youtube.com/watch?v=vqDRlSWTOUQ

**Summary:** Matt and Niki present analysis of AI discourse across platforms. Matt analyzed in-group (EA Forum, LessWrong, Twitter, Substack) - built leaderboards ranking authority accounts, identified five clusters: pragmatic safety establishment, high doomers, frontier capability maximizers, open source democratizers, and paradigm skeptics. Created a chat app with a "high doomer" digital twin. Niki analyzed out-group (Blue Sky as left, Truth Social as right) - pulled 10k posts from each, extracted ~34,000 claims, analyzed sentiment (mostly negative), found where platforms agree/disagree. Key findings: Blue Sky is more consistent (really don't like AI), Truth Social is more mixed, both hate big tech and fear AI surveillance state. Blue Sky doesn't take AI capabilities seriously, Truth Social is more open to it. They propose tracking changes in public opinion over time and using this to prevent polarization that could kill policy hope.

---

## Videos with Failed Transcript Retrieval

- **xsvCYhcxDX4** - YouTube IP blocking (too many requests)
- **yqpcsat1Mxw** - YouTube IP blocking (too many requests)

---

## Notes

- All transcripts were retrieved using the youtube-transcript-api Python library
- Two videos could not be retrieved due to YouTube rate limiting
- Summaries are based on the full transcripts available in `transcripts.json`
- For complete transcripts, see the `transcripts.json` file
