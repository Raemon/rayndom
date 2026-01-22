# CAST: Corrigibility As Singular Target (notes)

Source sequence: https://www.lesswrong.com/s/KfCjeconYRdFbMxsy

For each post: **Background knowledge** is a short list of prerequisites; **New knowledge** is represented only via short direct quotes (rendered as blockquotes). Each quote is linked by the post URL in the section heading.

## 0. CAST: Corrigibility as Singular Target

Post: https://www.lesswrong.com/posts/NQK8KHSrZRF5erTba/0-cast-corrigibility-as-singular-target-1

Background knowledge
- What “corrigibility” is usually gesturing at in AI alignment discussions
- The idea that agency + optimization can create failure modes (power-seeking, deception, etc.)
- The difference between “prosaic” ML training and “theoretical”/nonstandard alignment approaches

New knowledge (quotes)
> I now think that **corrigibility is a single, intuitive property**, which people can learn to emulate without too much work and which is deeply compatible with agency.

> Explain why designing AGI with corrigibility as the sole target (CAST) is more attractive than other potential goals, such as full alignment, or local preference satisfaction.

## 1. The CAST Strategy

Post: https://www.lesswrong.com/posts/3HMh7ES4ACpeDKtsW/1-the-cast-strategy

Background knowledge
- Principal–agent framing (a “principal” directing a powerful “agent”)
- Why distribution shift matters for ML systems
- Basic “red teaming” and why adversarial exposure can change a model’s behavior

New knowledge (quotes)
> I propose trying to build an agent that robustly and cautiously reflects on itself as a flawed tool and focusing on empowering the principal to fix its flaws and mistakes.

> One detail that I think is particularly vital, is to keep early-stage corrigible AGIs in a controlled setting ... for *as long as is feasible*.

> While it’s important to have a Red Team which is responsible for finding incorrigibility, at no point do I think it’s wise to expose the model to the internet or to real antagonists.

## 2. Corrigibility Intuition

Post: https://www.lesswrong.com/posts/QzC7kdMQ5bbLoFddz/2-corrigibility-intuition

Background knowledge
- Using contrasts/nearby concepts to clarify a definition
- “Empowerment” as a concept that often appears near corrigibility discussions

New knowledge (quotes)
> I often find it useful when learning a concept to identify the nearest (useful) concepts that are meaningfully distinct.

> Furthermore, corrigibility should not be seen as depending on context, principal, or other situational factors.

> I loosely think of “empowering the principal” when I think about corrigibility, but I want to be clear that an agent with that goal, simpliciter, is not going to be corrigible.

## 3a. Towards Formal Corrigibility

Post: https://www.lesswrong.com/posts/WDHREAnbfuwT88rqe/3a-towards-formal-corrigibility

Background knowledge
- The gap between informal definitions and formal objectives/metrics
- Why manipulation and “freedom to correct” are central to corrigibility concerns

New knowledge (quotes)
> an agent is corrigible when it robustly acts opposite of the trope of "be careful what you wish for" by cautiously reflecting on itself as a flawed tool and focusing on empowering the principal to fix its flaws and mistakes.

> an agent is corrigible when it robustly acts to empower the principal to freely fix flaws in the agent’s structure, thoughts, and actions (including their consequences), particularly in ways that avoid creating problems for the principal that they didn’t foresee.

> The word “freely” is intended to flag that if the agent is secretly (or overtly) controlling the principal, it is not corrigible.

## 3b. Formal (Faux) Corrigibility

Post: https://www.lesswrong.com/posts/t8nXfPLBCxsqhbipp/3b-formal-faux-corrigibility

Background knowledge
- Toy formalisms for agents/policies and “expected value” reasoning
- “Empowerment” as something that can be defined operationally in small environments

New knowledge (quotes)
> define “empowerment” as the degree to which a policy influences the Environment to increase expected power compared to the null policy, \\(\pi_0\\).

> There’s also a somewhat worrying observation that empowerment, by this definition, can be accomplished through pessimizing how good each simple value function believes worlds optimized according to other simple value functions are.

> my proposed measures and definitions should not be taken very seriously

## 4. Existing Writing on Corrigibility

Post: https://www.lesswrong.com/posts/d7jSrBaLzFLvKgy32/4-existing-writing-on-corrigibility

Background knowledge
- Familiarity with the existing corrigibility / shutdownability literature
- Awareness that “utility indifference” is a known proposed approach for shutdownability

New knowledge (quotes)
> even Yudkowsky seems to have an intuition that there’s a simple, learnable idea behind corrigibility which, at the intuitive level, seems accessible!

> I do want to note that there’s a potential confusion between what I think of as steepness vs size.

## 5. Open Corrigibility Questions

Post: https://www.lesswrong.com/posts/wZjGLYp5WQwF8Y8Kk/5-open-corrigibility-questions

Background knowledge
- What it means for a research agenda to end with “open questions”
- The difference between definitional/theoretical questions and empirical/experimental questions

New knowledge (quotes)
> Much work remains on the topic of corrigibility and the CAST strategy in particular.

> Does “empowerment” really capture the gist of corrigibility?

> I think one of the most useful next-steps is distillation and attempting to communicate these ideas in a more accessible way.

## Serious Flaws in CAST

Post: https://www.lesswrong.com/posts/qgBFJ72tahLo5hzqy/serious-flaws-in-cast

Background knowledge
- The “basin of attraction” / iterative refinement intuition for alignment strategies
- Why distributional/ontological shifts can break alignment properties even after tests

New knowledge (quotes)
> Overall I think it's most appropriate to halt, melt, and catch fire, discarding my proposed formalism except to use as a cautionary tale.

> it *might* be true that we can do something like gradient descent on corrigibility ... But that seems like a significant additional assumption, and is not something that I feel confident is at all true.

> I think there's very little hope that those trying to build a corrigible AI will know what to look for, and will only be able to effectively optimize for something that *looks* increasingly safe, without actually *being* safe.
