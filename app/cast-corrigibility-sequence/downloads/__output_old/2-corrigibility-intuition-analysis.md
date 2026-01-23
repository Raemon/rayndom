# 2. Corrigibility Intuition - Concept Analysis

## Background Knowledge

- The principal-agent relationship concept
- The "be careful what you wish for" trope / genie problems
- VNM axioms and utility maximization
- The shutdown problem
- Tool AI vs Agent AI distinction
- Inverse reinforcement learning and preference uncertainty
- RLHF and Constitutional AI training methods
- The concept of emergent desiderata vs training targets
- The distinction between terminal and instrumental goals

## New Knowledge

### Core Definition

> An agent is corrigible when it robustly acts opposite of the trope of "be careful what you wish for" by cautiously reflecting on itself as a flawed tool and focusing on empowering the principal to fix its flaws and mistakes.

> Corrigibility is not the definition given above, nor is it the collection of these desiderata, but rather corrigibility is the simple concept which generates the desiderata and which might be loosely described by my attempt at a definition.

### On the Nature of Corrigibility Examples

> The point of these stories is not to describe an ideal setup for a real-world AGI... The point of these stories is to get a better handle on what it means for an agent to be corrigible.

> When training an AI, more straightforward training examples should be prioritized, rather than these evocative edge-cases.

### Emergent Desiderata (Summary)

> [The desiderata include:] Communication, Low-Impact, Reversibility, Efficiency, Relevance, Transparency, Obedience, Mild-Optimization, Protectiveness, Local Scope, Simple Self-Protectiveness, Stop Button, Graceful Shutdown, Configurable Verbosity, Disambiguation/Concreteness, Honesty, Handling Antagonists, Straightforwardness, Proactive Reflection, Cognitive Legibility, Infohazard Caution, Resource Accumulation, Non-Manipulation, Sub-Agent Stability, Principal-Looping, Graceful Obsolescence, Handling Trolley-Tradeoffs, Handling Time-Pressure, Expandable Concerns, Navigating Conflict.

### Emergent Downsides

> [Corrigibility has downsides including:] Intrusiveness, Indifference, Rigidity, Immorality, Irresponsibility, Myopia.

### Incorrigibility Examples

> [Examples of incorrigible behavior include agents that prioritize:] Honesty [over obedience], Protectiveness [over transparency], Proactive Benevolence, Kindness, Human-In-Loop, Moral Learning, Balancing Needs, Broad Perspective, Top-Level-Goal Focus.

### Concepts That Are NOT Synonyms for Corrigible

> [The author distinguishes corrigibility from:] Correctability, "The Thing Frontier Labs Are Currently Aiming For", Preference Satisfaction, Empowerment (in general), Caution, Servility, Tool/Task-ishness.

### On Frontier Labs

> Models like GPT4 and Claude3 are being trained according to a grab-bag of criteria... the core targets of helpfulness, harmlessness, and honesty do not cleanly map onto corrigibility.

> I think frontier labs see AI models as naturally safe, and believe that by training for something like ethical assistance that satisfies local preferences, they'll create a naturally benevolent machine.

### On Preference Satisfaction vs Corrigibility

> The distinction between preference alignment and corrigibility becomes vitally important when we consider how these two fare as distinct optimization targets, especially if we don't expect our training pipeline to get them precisely right.

> An agent that is semi-"helpful" is likely to proactively act in ways that defend the parts of it that diverge from the principal's notion of what's good. In contrast, a semi-corrigible agent seems at least somewhat likely to retain the easiest, most straightforward properties of corrigibility.

### On Servility vs Corrigibility

> The biggest point of divergence, in my eyes, is around how proactive the agent is... Corrigible agents actively seek to make themselves legible and honest, pointing out ways in which their minds might diverge from the desires of their principals.

> Servility also doesn't naturally reject manipulation.
