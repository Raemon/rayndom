# Post 4: Existing Writing on Corrigibility - Knowledge Analysis

## Background Knowledge
This post is primarily a literature review, so most content is analyzing prior work. Key sources discussed:

### MIRI / Yudkowsky Lineage
- **Corrigibility (2015)** - Soares, Fallenstein, Yudkowsky, Armstrong
- **Arbital pages** - Corrigibility, Hard problem of corrigibility
- **Project Lawful (glowfic)** - Yudkowsky's fictional treatment
- **"Let's See You Write That Corrigibility Tag"** - Comments and responses
- **Challenges to Christiano's capability amplification proposal**
- **Paul's research agenda FAQ** comments

### Paul Christiano's Work
- **Corrigibility (2017 Medium/AI Alignment Forum)**
- **Benign AI** concept
- **Act-based agents** concept
- **Approval-directed agents**
- **Worst-case guarantees / training robust corrigibility**
- **Iterated amplification** and recursive approaches

### Alex Turner's Corrigibility Sequence
- **Corrigibility as outside view**
- **Non-Obstruction: A Simple Concept Motivating Corrigibility**
- **Optimal Policies Tend to Seek Power** (with coauthors)
- **Attainable Utility Preservation**
- **A Certain Formalization of Corrigibility Is VNM-Incoherent**
- **Formalizing Policy-Modification Corrigibility**

### Shutdown Problem Literature
- **Elliot Thornley** - Incomplete preferences, shutdown problem theorems
- **Sami Petersen** - Invulnerable incomplete preferences
- **John Wentworth & David Lorell** - Shutdown problem proposal
- **Simon Goldstein** - Shutdown-seeking AI

### Other Corrigibility Writers
- **Steve Byrnes** - Thoughts on implementing corrigible robust alignment
- **Seth Herd** - Instruction-following AGI, DWIM (Do What I Mean)
- **Stuart Armstrong** - Limits of corrigibility, Petrov corrigibility
- **Wei Dai** - Can corrigibility be learned safely
- **Koen Holtman** - Corrigibility with utility preservation
- **Evan Hubinger** - Mechanistic understanding of corrigibility

### Technical Concepts Referenced
- GOFAI (Good Old-Fashioned AI) architecture
- CIRL (Cooperative Inverse Reinforcement Learning)
- Approval-directed agents
- Behaviorism in AI design
- The "shoggoth" metaphor for LLMs
- Waluigi effect

## New Knowledge (Author's Novel Contributions)

### Critique of MIRI 2015 Paper
- The slide from "incentives" to "methods of reasoning" is problematic
- GOFAI frame (explicit utility functions) is outdated
- The toy problem framing was a "misstep" that confused the field
- Utility indifference is a dead-end

### Critique of Arbital Pages
- "Reasoning as if flawed" epistemic framing is unhelpful
- Passivity-oriented corrigibility is a dead-end
- "Behaviorism" (not modeling minds) contradicts other desiderata
- The word "reasoning" is overused; should focus on values/goals

### Critique of Christiano's Corrigibility
**Major disagreement**: Christiano expects corrigibility to emerge from preference satisfaction; author argues corrigibility must be a terminal goal, not instrumental.

Key critiques:
- Act-based agents still have Omohundro Drive pressures
- Preference proxies can be gamed
- Instrumental corrigibility is fragile (Christiano agrees!)
- "Very easy to implement in 2017" is overconfident

### Analysis of Yudkowsky-Christiano Disagreement
The author maps the core disagreement:
- Christiano: corrigibility as emergent from preference learning
- Yudkowsky: corrigibility as anti-natural, requiring special attention
- Author: closer to Yudkowsky on anti-naturality, but more optimistic about trainability

### Critique of Turner's Power Formalism
- Turner's "power" is about average control across goals, not relationship with principal
- Attainable Utility Preservation doesn't capture corrigibility
- Policy-modification corrigibility is closer but still missing key elements

### Analysis of Incomplete Preferences Approach
- Thornley/Wentworth shutdown proposals are interesting but incomplete
- Incomplete preferences may not compose well
- Missing manipulation concerns

### Novel Synthesis
The author's key original framing:
- Corrigibility is about a **relationship** between agent and principal
- It's not about world-states but about **historical facts** of interaction
- The "hard problem" is actually **simpler** than Yudkowsky suggests
- Behavioral training on examples may work better than formal measures
