# Post 1: The CAST Strategy - Knowledge Analysis

## Background Knowledge
Prerequisites and existing concepts the author assumes familiarity with:

### AI Safety Fundamentals
- Misuse vs. mistake distinction in AI risk
- Principal-agent problem
- Omohundro's Basic AI Drives (survival, resource acquisition, goal preservation)
- Instrumental convergence
- The stop button / shutdown problem
- Control problem for advanced AI

### Machine Learning Methods
- Unsupervised pre-training and world-model building
- Reinforcement learning loss functions
- Fine-tuning from pretrained models
- Adversarial training and red-teaming
- Sycophancy in language models
- Distributional shift problems

### Technical AI Safety Approaches
- Air-gapping and sandboxing
- Kill-switches and honeypots
- Ablation testing
- Representation engineering
- Mechanistic interpretability
- Eliciting Latent Knowledge (ELK)
- Control methods (Greenblatt & Shlegeris)

### Philosophy of Mind & Agency
- Simulators vs. agents distinction
- Simulacra and role-playing in LLMs
- VNM axioms for rational agents
- Consequentialism vs. deontology in agent design
- Historical facts vs. state-based utility functions

### Prior Work on Corrigibility
- MIRI 2015 corrigibility paper and utility indifference
- Paul Christiano's "act-based agents" and benign agents
- Yudkowsky's writing on "anti-naturality" of corrigibility
- The "hard problem of corrigibility"
- Arbital pages on corrigibility desiderata

### AI Governance Concepts
- Pivotal acts
- Alignment tax
- Wise governance and representative selection
- The acute risk period

### Specific Technical Concepts
- Diamond maximizer (hypothetical benchmark)
- Sleepy-Bot thought experiment
- Goal-space topology
- Attractor basins in dynamical systems
- K-complexity and simplicity weighting

## New Knowledge (Author's Novel Contributions)

### The CAST Strategy Itself
1. **Pure corrigibility as sole goal**: The central proposal that AGI should have corrigibility as its ONLY terminal goal, not balanced with other goals
2. **Contra impure corrigibility**: The argument that mixing corrigibility with other goals (ethics, helpfulness) undermines the attractor basin
3. **Contra emergent corrigibility**: The critique that Paul Christiano's expectation of emergent corrigibility from preference satisfaction is unfounded

### Novel Arguments About Goal-Space Topology
- The visualization of goal-space as a landscape with flatness (most goals are self-stable)
- Corrigibility's meta-desire property: it includes wanting to be made more corrigible
- The claim that semi-corrigible agents form attractor basin rather than repelling towards incorrigibility
- Anti-naturality as "hilltop" vs attractor basin dynamics

### Training Strategy Proposals
- The phased approach: pretrain → train for corrigibility → adversarial refinement → scaling
- The collaboration phase where AI assists in identifying its own remaining incorrigibility
- Keeping AGI in controlled settings for extended experimentation
- The warning about deploying before true corrigibility is achieved

### Critiques of Alternative Approaches
- Critique of HHH (helpful, harmless, honest) as training target
- Warning that frontier labs likely believe they're building corrigibility but aren't
- The claim that "ethical assistance" training will lead to incorrigible agents

### Responses to Counterarguments
- Anti-naturality is real but effect size is unclear
- "Can't even do diamond maximizer" doesn't invalidate CAST since attractor basin helps
- Human-in-loop scaling concerns addressed via AI slowing itself down
- Principal identification brittleness acknowledged as weak point

### Novel Thought Experiments
- Sleepy-Bot as example of Omohundro-opposing goal
- Poverty-Bot and Insane-Bot as analogs
- The spaceship AI life-support dilemma (vs. direct shutdownability desideratum)
