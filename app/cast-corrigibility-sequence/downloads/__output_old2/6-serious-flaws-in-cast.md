# Serious Flaws in CAST

## Background Knowledge

- The original CAST formalism for measuring corrigibility
- The concept of s-risks (suffering risks) in AI alignment
- The problem of sign errors in utility functions
- The fragility of value thesis
- Distributional shift and ontological stability in AI
- The concept of feedback loops in iterative alignment
- Gradient descent and local optima in machine learning
- The concept of deceptive alignment
- Constitutional AI and current training methods

## New Knowledge

> I still basically believe that CAST is right. Corrigibility still seems like a promising target compared to full alignment with human values, since there's a better story for how a near-miss when aiming towards corrigibility might be recoverable, but a near-miss when aiming for goodness could result is a catastrophe, due to the fragility of value.

> On top of this, corrigibility is significantly simpler and less philosophically fraught than human values, decreasing the amount of information that needs to be perfectly transmitted to the machine.

> Any spec, constitution, or whatever that attempts to balance corrigibility with other goals runs the risk of the convergent instrumental drives towards those other goals washing out the corrigibility.

> The formalism I proposed incentivizes the agent to ruin the universe, not only by becoming incorrigible and taking over Earth, but also potentially torturing people in particularly ugly ways and trying to do the same to aliens. Yikes!

> Consider a choice for f that first compares its two arguments and sees whether the human's values line up with their revealed preferences; if they don't match, the AI optimizes according to the second argument (i.e. satisfying the human's revealed preferences); if they do match, it makes the universe as terrible as possible according to the widest swath of possible values, as measured by Q.

> In deployment, we should expect our actions to line up with our values, thus triggering the "ruin the universe for as many as possible" behavior. An easy way to ruin things is to self-modify to become incorrigible, and then convert as much of the universe into garbage as possible.

> A heuristic that I have upvoted, in light of realizing my error, is to be extremely cautious when putting a minus sign in front of a term that is meant to reflect the human's values, even if they're counterfactual values.

> The most important update is to not trust my math.

> The attractor basin metaphor works in some ways, but it masks a critical difficulty in the plan, making it appear easier to carefully iterate towards corrigibility than it is likely to be in practice.

> I don't think the key takeaway should be "throw out the attractor metaphor"—there are some good ideas in there. But I think it's better framing to think of the default as the AI sliding out of the basin, which can only be countered with knowledge and effort on the part of the humans.

> Absent a greater degree of theoretical understanding, I now expect the feedback loop of noticing and addressing flaws to vanish quickly, far in advance of getting an agent that has fully internalized corrigibility such that it's robust to distributional and ontological shifts.

> Instead of imagining corrigibility as a simple goal towards which the agent can reach deeper over time, I've updated towards imagining corrigibility as a complex property, or perhaps a combination of properties, that is approximated well under normal conditions but which can easily be disrupted.

> It's very plausible that even the first agent to be trained robustly into a proto-corrigibility basin will be good enough to start doing things on its own and earning money in the broader economy, and thus there's a strong economic pressure to stop refining things and deploy earlier models at smaller levels of corrigibility.

> In the absence of the right theoretical foundation, I now expect humans who are trying their best to create corrigible agents, using something like the strategy I outlined, to be successful only if they get very lucky, or if the job is so easy as to fall out from naive training.
