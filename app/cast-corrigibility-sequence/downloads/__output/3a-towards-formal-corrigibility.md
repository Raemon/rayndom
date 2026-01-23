# Post 3a: Towards Formal Corrigibility - Knowledge Analysis

## Background Knowledge
Prerequisites and existing concepts the author assumes familiarity with:

### Formal Agent Theory
- Von Neumann-Morgenstern utility theorem
- Expected utility maximization
- Policies as mappings from states to actions
- The distinction between agents and policies
- Halting problem and diagonalization

### Game Theory & Decision Theory
- Toy problems and formal games
- Iterated games (prisoner's dilemma)
- Score functions vs. utility functions
- Reward functions in RL

### Machine Learning Concepts
- Reinforcement learning
- Policy gradients
- Loss functions
- Backpropagation

### MIRI 2015 Corrigibility Framework
- The stop button toy problem
- Utility indifference approach
- The four original desiderata
- Problems with naive utility function modifications

### Philosophy of Action
- Actions vs. thoughts distinction
- Deliberate vs. automatic behavior
- The null action
- Consequences and counterfactuals
- Power and empowerment concepts

### Epistemology
- Foresight and probability estimation
- Born probability / Everett branches
- Credences and probabilistic beliefs

### AI Safety Concepts
- Omohundro Drives
- Strategic deception
- Manipulation and control
- Human-in-the-loop systems

### Prior Shutdown Problem Literature
- The Off-Switch Game (Hadfield-Menell et al.)
- Computerphile's Stop Button videos
- MIRI's utility indifference proposal

## New Knowledge (Author's Novel Contributions)

### Sharpened Definition
The refined definition: "an agent is corrigible when it robustly acts to empower the principal to freely fix flaws in the agent's structure, thoughts, and actions (including their consequences), particularly in ways that avoid creating problems for the principal that they didn't foresee."

Key additions:
- **"Freely"** to flag manipulation concerns
- Explicit mention of **structure**, **thoughts**, and **actions**
- **Foresight** about unexpected problems

### Novel Ontology Sketch
A preliminary ontology for corrigibility including:
- **Agents and The Principal** - Identity persistence over time
- **Actions and Consequences** - External behavior and counterfactual dependencies
- **Structure** - Body, memory, sensors, architecture
- **Flaws/Problems and Fixing Flaws** - Reference counterfactual framing
- **Power and Empowerment** - Values causally upstream of reality
- **Foresight** - Good probability modeling
- **Freedom** - Absence of external manipulation of values
- **Robustness** - Functioning despite disruption

### Critique of Utility Indifference
The argument that utility indifference is a dead-end:
1. Requires explicit score-maximizer architecture
2. Counterfactual reasoning may cause unexpected behavior
3. No incentive to preserve indifference in successor agents
4. Still releases bioweapons, manipulates humans, etc.

### The Central Insight
"The kind of agent we want doesn't merely allow its principal to shut it down—it seeks for the principal to actually be in control."

### Novel Pseudo-Corrigibility Scoring
A sketch utility function:
- Baseline: 0 points
- If principal exists and can give commands: +50 points
- If followed principal's commands: +100 points
- If manipulated principal: -200 points

### Manipulation Analysis
Novel discussion connecting:
- Physical blocking as manipulation
- Information withholding as manipulation
- Attention redirection as manipulation
- Value modification as manipulation
- The claim that **manipulation ≈ disempowerment** and **empowerment ≈ non-manipulation**

### Critique of MIRI 2015 Approach
The argument that:
- Focusing on sub-properties (shutdownability) in isolation is like building organs separately and stitching them together
- True shutdownability requires broad corrigibility
- The desiderata are mutually dependent and emergent from a core generator
