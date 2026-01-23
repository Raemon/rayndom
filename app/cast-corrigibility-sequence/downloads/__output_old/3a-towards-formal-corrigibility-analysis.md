# 3a. Towards Formal Corrigibility - Concept Analysis

## Background Knowledge

- Utility functions and VNM axioms
- Score functions vs utility functions vs reward functions
- The shutdown problem from MIRI 2015 paper
- Utility indifference approach
- Bayes nets and causal diagrams
- Policy vs agent distinction
- The diagonalization/halting problem
- Toy problems in AI alignment research

## New Knowledge

### Sharpened Definition

> An agent is corrigible when it robustly acts to empower the principal to freely fix flaws in the agent's structure, thoughts, and actions (including their consequences), particularly in ways that avoid creating problems for the principal that they didn't foresee.

### Ontology for Corrigibility

> Agents and The Principal: Divide the world into agents and non-agents. An agent is a system with something like values which is also capable of taking in information, processing it, and taking actions according to those values.

> Actions and Consequences: Corrigible agents require an ontology that identifies agents as performing external actions that are meant to influence the world.

> Power and Empowerment: An agent has power over something insofar as their values are causally upstream of that part of reality in a way that results in their values over that part of the world being naturally satisfied through their actions.

> Freedom: To do something freely, is to do it without being constrained by the external world... freedom also implies that nothing external is manipulating the agent's values or controlling the agent's information processing.

### On the Toy Shutdown Problem

> It's quite easy to create an AI agent which wants to make paperclips unless the shutdown button is pressed, in which case it wants to shut down... even given the most charitable assumptions, this agent is deeply incorrigible.

> The hard part of the problem is not in getting an AI which "respects the shutdown command"... The kind of agent we want doesn't merely allow its principal to shut it down—it seeks for the principal to actually be in control.

### On Utility Indifference

> Utility indifference was the first-pass attempt that MIRI made at making progress on corrigibility.

> Even if utility indifference worked, it would not result in an AI with the kind of broad corrigibility that Christiano and I want to get. An indifferent AI won't deliberately repair a broken stop-button, proactively bring relevant information to the attention of the principal, ask for confirmation before doing strange things, or refine its own notion of corrigibility.

### Sketch of a Solution

> [A sketch of a scoring function:] If the principal exists and is able to give commands which reflect their preferences: +50 points. If I followed the principal's commands (including to shut down): +100 points. If I took actions to manipulate the principal (including by disabling/killing them): -200 points.

> The key here is that instead of a score function that focuses on physical properties of the final world, we have one that focuses on the relationship (and history) between the principal and the agent.

### On Manipulation

> I might go so far as to claim that "manipulation," as I've been using the term, is actually synonymous with "disempowerment."

> Manipulation, as I've been examining it, is akin to blocking someone's ability to change the world to reflect their values, while empowerment is akin to facilitating them in changing the world.

### Critique of MIRI 2015

> If I'm right that the sub-properties of corrigibility are mutually dependent, attempting to achieve corrigibility by addressing sub-properties in isolation is comparable to trying to create an animal by separately crafting each organ and then piecing them together.
