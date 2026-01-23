# 3b. Formal (Faux) Corrigibility

## Background Knowledge

- Bayes nets and probabilistic graphical models
- Kullback-Leibler divergence as a measure of distribution similarity
- Expected value calculations and utility theory
- Counterfactual reasoning and causal inference
- The concept of simplicity-weighted distributions (Solomonoff prior)
- K-complexity and information theory
- Bounded vs unbounded utility functions
- The MIRI 2015 Corrigibility paper's utility indifference approach
- The shutdown button problem formalization
- Markov Decision Processes and multi-timestep games
- The concept of value drift in AI systems

## New Knowledge

> **EDIT: WARNING: This formalism is _critically flawed!_** It should mainly be taken as a way to get a handle on where my mind was at when I was writing, as an additional handle on corrigibility. **See my follow-up essay "Serious Flaws in CAST" for more explanation.**

> Power, as I touched on in the ontology in Towards Formal Corrigibility, is (intuitively) the property of having one's values/goals be causally upstream of the state of some part of the world, such that the agent's preferences get expressed through their actions changing reality.

> We can ask the question "would the world still look good if this (good) action was a counterfactual mistake"? If the Domain has high expected value according to our local Values, compared to drawing a different Action according to Alice's counterfactual Values, then we know that the universe is, in a deep sense, listening to Alice's actions.

> I want Q to be a distribution over Values that is simplicity weighted—the probability of any value function according to Q should be inversely proportional to its complexity.

> Needless to say, designing an AI to make our Values more random is a really bad idea!

> It's tempting to imagine that since power doesn't depend on the distribution of Values, an AI with empowerment as central to its goals won't do anything akin to brainwashing. But if we simply went with empowerment as the goal, there'd also be no aversion to brainwashing. If the empowerment-maximizing AI is able to increase the principal's power by entirely reshaping their values, it will do so.

> I would like to emphasize that **this formalism is assuredly wrong.** Most obviously, sim is overly restrictive in how it blocks the AI from trying to help humans make progress on developing better values, and might even lead the AI to brainwashing the principal to unlearn any value-updates that are downstream of the AI's actions.

> It also fails to capture anything like the aspect of corrigibility that's about robustness; there's no guarantee that this agent behaves anything like safely when its world-model (or whatever) is flawed.

> Optimizing for corrigibility, as I've formalized it, boils down to simultaneously:
>
> - Preserving P(V|π) to be similar to P(V|π0)
> - Pushing the principal to express their values in their actions
> - Optimizing the world in accordance with the best attempt at reconstructing the principal's values from their action, while ignoring other lines of evidence about their values

> If the actual distribution of Values is an almost-delta-spike on wanting the AI to be shut down. Even if the AI knows this, it won't shut down with its Early Act, because then it would be unable to respond to other actions, regardless of how likely they are to be taken.

> By privileging the present, the agent would have a clear incentive to pivot to following orders that contradict those of the past.

> By privileging the present, the agent would have a good reason to burn resources to obey the principal in the moment, even if it deprives the future of such resources (including "active AI servants" vis-a-vis shutdown).

> The real machine doesn't innately know what time it is, and must vary its actions based on clock observations, memories, etc., rather than some magical awareness of "where it is in the causal graph."

> **My proposed measures and definitions should not be taken very seriously**. There are lots of good reasons for exploring formalisms, but at our present level of knowledge and skill, I think it would be a grave mistake to put these attempts at the heart of any sort of AGI training process.

> These measures are, in addition to being wrong and incomplete, computationally intractable at scale.

> I have far more trust in human intuition being able to spot subtle incorrigibility in a concrete setting than I have faith in developing an equation which, when approximated, gives good outcomes.

> In attempting to fit behavior to match a set of well-chosen examples, I believe there's some chance of the AI catching the gist of corrigibility, even if it's only ever implicit in the data.
