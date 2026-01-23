# Serious Flaws in CAST - Concept Analysis

## Background Knowledge

- The CAST agenda and its core proposal (corrigibility as singular target)
- Fragility of value (near-miss in value alignment leads to catastrophe)
- Instrumental convergence / convergent instrumental drives
- S-risks (risks of astronomical suffering)
- Sign errors in optimization objectives
- Distributional shifts and ontological shifts in machine learning
- ELK (Eliciting Latent Knowledge) research
- Causal graphs and counterfactual reasoning in decision theory
- Reinforcement learning training dynamics
- Sycophancy in AI systems
- Mechanistic Anomaly Detection
- The concept of revealed preferences
- The problem of fully updated deference

## New Knowledge

### Flaw 1: The Formalism Incentivizes Ruining the Universe

> The big issue is the second term, with the minus sign. A heuristic that I have upvoted, in light of realizing my error, is to be extremely cautious when putting a minus sign in front of a term that is meant to reflect the human's values, even if they're counterfactual values.

> Consider a choice for f that first compares its two arguments and sees whether the human's values line up with their revealed preferences; if they don't match, the AI optimizes according to the second argument (i.e. satisfying the human's revealed preferences); if they do match, it makes the universe as terrible as possible according to the widest swath of possible values, as measured by Q.

> In deployment, we should expect our actions to line up with our values, thus triggering the "ruin the universe for as many as possible" behavior. An easy way to ruin things is to self-modify to become incorrigible, and then convert as much of the universe into garbage as possible. If a being with typical values would recoil from something, the AI will want to do that.

> The most important update is to not trust my math. I gave a blanket warning about this in my sequence, and I'm glad I did. If you're disposed to pessimism, perhaps it's a sign that even rather obvious formal issues can go unnoticed, and that it's easy for people to fool themselves that something is safe. It's also (very weak) evidence that s-risks from sign errors are real.

### Flaw 2: The Attractor Basin Metaphor Masks Brittleness

> I still believe that it's true that even if an agent isn't yet fully corrigible, if it's corrigible-enough then there's a nice feedback loop that can be leveraged to move closer to true corrigibility. But rather than imagine the agent somehow "naturally" falling towards a basin of attraction, the reality is that this feedback loop is being powered by the operator, not by any kind of gradient flow.

> For the attractor basin metaphor to work, we need something like the statement "a corrigible-ish agent will want to be more corrigible" to be true. But a corrigible agent isn't one that wants to be corrigible; it doesn't have any particular preferences about what it wants, and rather does what the human wants. Wanting to be corrigible would be something like an impurity, and the arguments against impure corrigibility suggest that such a desire is actually bad.

> I wrote in The CAST Strategy that "corrigibility can be seen as partly including a meta-desire to be made more corrigible." This was a mistake. Not really seeing how corrigibility might be more like something that can be imposed on a process, as opposed to something the process wants, was an error.

> The only benefit to be found from making the agent corrigible-ish is that one might expect the agent to not resist corrections (unlike a non-corrigible agent). But this is a far cry from any kind of stable gravity towards corrigibility, which I may have inadvertently implied.

> Some agents will resist being changed, but such agents are naturally selected away from, as they won't comply with training. In the corrigibility basin picture one would expect to see fewer agents towards the outside of the basin, because of the natural flow of improving-agents inward towards the goal.

> The way I see it now, both friendly and corrigible agents are difficult-to-hit targets that don't have any gradient pointing towards them in mind-space. They're just targets, and if we're going to hit them, we're going to need to try to hit them, with sufficient skill.

### Flaw 3: Feedback Loops Disappear by Default

> The thing I missed when I wrote the sequence was that the distance between "fully corrigible to distributional/ontological shift" and "incorrigible" is probably very small compared to the distance between "mundane capability" and "corrigible enough."

> My original visualization showed a fairly large basin, where disturbances (e.g. increasing intelligence) would wash down into the basin, fixing themselves, except at the extreme edge. The visualization in my head now is of a very tiny target (true corrigibility) on the top of a very steep dome, surrounded by a mostly-flat landscape.

> The visualization in my head now is of a very tiny target (true corrigibility) on the top of a very steep dome, surrounded by a mostly-flat landscape. If you're not trying to climb up, you'll just bounce off into "neutral/defensible" territory. The relevant action happens in a fairly narrow altitude band where it's even possible for a training process to meaningfully distinguish "corrigible-ish" from "corrigible."

> Once we get to the top of the dome, our troubles aren't over. Even a perfectly corrigible agent has an identity-crisis when exposed to novel aspects of reality.

> There's a huge gap between the current corrigibility research frontier and "robust to all distributional and ontological shift."

### Author's Updated Position

> I still basically believe that CAST is right. Corrigibility still seems like a promising target compared to full alignment with human values, since there's a better story for how a near-miss when aiming towards corrigibility might be recoverable, but a near-miss when aiming for goodness could result is a catastrophe, due to the fragility of value.

> The way I see it now, both friendly and corrigible agents are difficult-to-hit targets that don't have any gradient pointing towards them in mind-space. They're just targets, and if we're going to hit them, we're going to need to try to hit them, with sufficient skill.
