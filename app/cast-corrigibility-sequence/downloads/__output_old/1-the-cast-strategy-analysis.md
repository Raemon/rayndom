# 1. The CAST Strategy - Concept Analysis

## Background Knowledge

- AI risk from misuse (malicious actors using AI for harm) vs mistake (building AI with subtly wrong goals)
- The principal-agent problem in economics and AI alignment
- Omohundro Drives / instrumentally convergent subgoals (survival, resource accumulation, self-preservation, goal stability)
- The concept of superintelligent AGI and recursive self-improvement
- Distributional shift in machine learning (models behaving differently out-of-distribution)
- Simulators and simulacra in language models
- The concept of a "pivotal act" to end the acute risk period
- Paul Christiano's work on corrigibility, act-based agents, and benign agents
- Yudkowsky's "List of Lethalities" and the anti-naturality argument
- VNM (von Neumann-Morgenstern) axioms for rational agents
- Diamond maximizer as a canonical alignment thought experiment
- RLHF (Reinforcement Learning from Human Feedback) and Constitutional AI
- ELK (Eliciting Latent Knowledge) research direction
- Mechanistic interpretability research
- Sycophancy in language models
- The "Waluigi Effect" and shoggoth metaphor for underlying model behavior
- Control methods: air-gapping, sandboxing, kill-switches, honeypots
- CEV (Coherent Extrapolated Volition)
- The challenge of value specification in AI systems

## New Knowledge

### The Core CAST Proposal

> I propose trying to build an agent that robustly and cautiously reflects on itself as a flawed tool and focusing on empowering the principal to fix its flaws and mistakes.

> I believe this proposal is significantly easier than building a truly friendly AI.

> I believe a corrigible agent doesn't need to be given much a-priori knowledge about human values or ethical behavior. Instead, it pushes the responsibility for sane and ethical behavior largely onto the shoulders of the principal.

### The Sleepy-Bot Illustration

> While almost every other AGI would seek the instrumentally convergent subgoal of ensuring that it was active rather than deactivated, Sleepy-Bot's top-level goal stands in opposition to that subgoal, and thus the AI would seek to avoid world domination.

> The point is that instrumentally convergent subgoals such as world-domination can be avoided by agents whose top-level goals are incompatible with things like world-domination.

### The Simplicity and Attractor Basin Argument

> The key to what makes corrigibility potentially a far easier goal to instill than others (such as morality or harmlessness) comes from two sources:
>
> 1. Corrigibility is, at its heart, a relatively simple concept compared to good alternatives.
>
> 2. A corrigible agent will, if the principal wants its values to change, seek to be modified to reflect those new values.

> Corrigibility can be seen as partly including a meta-desire to be made more corrigible. If the agent's principal wants to fix that agent towards being more corrigible, we can expect that correction to succeed (assuming the principal and/or agent are sufficiently intelligent/competent).

> In this way we can see partial-corrigibility (along with a principal who is invested in increasing corrigibility) as forming an attractor basin around true corrigibility.

### Pure vs Impure Corrigibility

> In most cases, when I talk about a corrigible agent, I am referring to an agent which has been designed to be corrigible as its **only** goal.

> When aiming to be precise, I'll call such an agent "purely corrigible" in contrast with an agent which was built to be corrigible as well as have other top-level goals, which I'll call "impurely corrigible."

> For reasons that I'll touch on later, I believe impure corrigibility is a mistake, and that pure corrigibility is much more predictable and can still get us a relatively safe agent.

### The Principal-User Distinction

> I want to take a moment to clarify that insofar as the AI is deployed in the world, it probably shouldn't be the case that ordinary people interacting with the AI are seen as part of the principal.

> A corrigible AI that's been instructed to be a helpful, harmless, and honest (HHH) assistant might do things like refuse to design bioweapons or violate copyright laws when a user asks, but would still comply when the principal asks.

> By preserving a distinction between principal and user we both preserve that instrumentality and provide a clear route towards resolving edge cases: consulting the principal.

### Against Emergent Corrigibility

> Emergent corrigibility is also extremely suspect (even more than impure corrigibility!) because it's not at all obvious that corrigibility is generally the best instrumental strategy towards whatever the AI actually values.

> An agent which is designed for some other goal, such as to follow human preferences, may be emergently corrigible in contexts where humans prefer corrigibility, but this corrigibility won't be robust.

### Against Desiderata Lists

> While I'm all for desiderata, I think it's important for these properties to emerge from the central core, rather than being trained in parallel with training for the central, simple concept of corrigibility.

> An AI which prioritizes (e.g.) local action on the same level as corrigibility, rather than in the service of corrigibility, has some risk of making tradeoffs that make it less corrigible (e.g. by being manipulative/deceptive) in return for being able to act more locally.

### On Anti-Naturality

> The anti-naturality of corrigibility stems from the way that, like with Sleepy-Bot, the goal of corrigibility is counter to some Omohundro Drives.

> The anti-naturality argument, I believe, is about the general observation that properties that stand in opposition to the Omohundro Drives are, in a very real sense, standing in opposition to trends in learning to be competent.

> It seems an open question, to me, whether agents can, in practice, learn to carve-out their relationship with their principal in a way that protects it from incorrect generalization stemming from learning how to be generally competent.

> Given that all other object-level desires that we might realistically give to an AI seem obviously dangerous, I continue to believe that CAST is worth investigating, even absent a breakthrough in architecture or paradigm.

### On Corrigibility and Consequentialism

> Corrigibility involves maintaining a certain kind of relationship between the agent and the principal, and the maintenance (or violation) of this relationship is a historical fact—invisible when limiting ourselves to only paying attention to physical properties of "the end state."

> I think this is somewhere between a non-issue and a big upside to corrigibility. While measuring (and/or optimizing for) corrigibility does indeed involve tracking the historical fact of how the agent was relating to its principal, it does not involve very much attention to the specific actions taken per se.

### On Scaling Concerns

> A preschooler can't really vet my plans, even if I genuinely want to let the preschooler be able to fix my mistakes.

> A truly corrigible agent will be flagging possible errors and flaws (using its superior intellect) and slowing itself down to the level where the principal can operate with genuine power over the agent. If the principal demands that the agent operate at speeds and complexities that are unverifiable, even with the agent's assistance, then in some sense that's the principal's fault.

### Author's Retraction Note

> EDIT: I no longer stand by the attractor basin metaphor! See my essay "Serious Flaws in CAST" for why.
