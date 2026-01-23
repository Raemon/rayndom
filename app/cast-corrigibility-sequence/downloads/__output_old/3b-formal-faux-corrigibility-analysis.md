# 3b. Formal (Faux) Corrigibility - Concept Analysis

## Background Knowledge

- Bayes nets and causal diagrams
- Expected utility maximization
- Probability distributions and sampling
- Kullback-Leibler divergence
- Simplicity-weighted priors (Solomonoff-style)
- Counterfactual reasoning in decision theory
- The problem of fully updated deference
- Bounded vs unbounded utility functions

## New Knowledge

### Critical Warning

> EDIT: WARNING: This formalism is critically flawed! It should mainly be taken as a way to get a handle on where my mind was at when I was writing, as an additional handle on corrigibility. See my follow-up essay "Serious Flaws in CAST" for more explanation.

### Definition of Power

> Power, as I touched on in the ontology... is (intuitively) the property of having one's values/goals be causally upstream of the state of some part of the world, such that the agent's preferences get expressed through their actions changing reality.

> localPower(x,v) := E[v(d) - v(d')] where we compare the expected value when actions are drawn according to the principal's actual values vs counterfactual values.

### The Simplicity-Weighting Choice

> I want Q(V|x) to ignore x and simply be the simplicity-weighted distribution over possible Value functions.

> As long as the distribution in our metric is mathematically pre-specified, optimizing for that metric will not automatically pressure the actual distribution over Values in either direction.

### Proposed Corrigibility Measure

> corrigibility(π) := empowerment(π) × sim(P(V|π), P(V|π₀))

> I'd like to emphasize that this formalism is assuredly wrong.

### Problems with the Formalism

> Most obviously, sim is overly restrictive in how it blocks the AI from trying to help humans make progress on developing better values, and might even lead the AI to brainwashing the principal to unlearn any value-updates that are downstream of the AI's actions.

> It also fails to capture anything like the aspect of corrigibility that's about robustness; there's no guarantee that this agent behaves anything like safely when its world-model (or whatever) is flawed.

### On Time and Multi-Timestep Problems

> [With naive averaging across timesteps:] no quantity of future commands to the effect of "yes, I know that I said I wanted paperclips, but I changed my mind" will erase the past.

> More ideal than a timeless average would be somehow choosing a policy that puts much more weight on "the present" and discounts the past and future.

### On Being Present

> The real machine doesn't innately know what time it is, and must vary its actions based on clock observations, memories, etc., rather than some magical awareness of "where it is in the causal graph."

> In the limit, it will only act to satisfy the principal's present values according to their present actions.

### Formal Measures Should Be Taken Lightly

> My proposed measures and definitions should not be taken very seriously... I have far more trust in human intuition being able to spot subtle incorrigibility in a concrete setting than I have faith in developing an equation which, when approximated, gives good outcomes.

> In attempting to fit behavior to match a set of well-chosen examples, I believe there's some chance of the AI catching the gist of corrigibility, even if it's only ever implicit in the data.
