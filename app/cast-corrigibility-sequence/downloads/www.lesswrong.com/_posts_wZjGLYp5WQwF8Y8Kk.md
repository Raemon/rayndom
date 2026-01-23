This website requires javascript to properly function. Consider activating javascript to get access to all site functionality. 

## 

[LESSWRONG](/)

[LW](/)

Login

5\. Open Corrigibility Questions

8 min read

•

Remaining Confusion

•

Suggested Future Research

•

Training Corrigible Models

•

Testing Corrigibility Understanding in Humans

•

Other Experiments

[](/s/KfCjeconYRdFbMxsy/p/d7jSrBaLzFLvKgy32)

[CAST: Corrigibility As Singular Target](/s/KfCjeconYRdFbMxsy)

[](/s/KfCjeconYRdFbMxsy/p/qgBFJ72tahLo5hzqy)

[Corrigibility](/w/corrigibility-1)[AI](/w/ai)[Frontpage](/posts/5conQhfa4rgb4SaWx/site-guide-personal-blogposts-vs-frontpage-posts)

# 31

# [5\. Open Corrigibility Questions](/posts/wZjGLYp5WQwF8Y8Kk/5-open-corrigibility-questions)

by [Max Harms](/users/max-harms?from=post_header)

10th Jun 2024

[AI Alignment Forum](https://alignmentforum.org/posts/wZjGLYp5WQwF8Y8Kk/5-open-corrigibility-questions)

8 min read

0

# 31

# Ω 11

Review

(Part 5 of [the CAST sequence](/s/KfCjeconYRdFbMxsy/p/NQK8KHSrZRF5erTba))

Much work remains on the topic of corrigibility and the CAST strategy in particular. There’s theoretical work in both nailing down an even more complete picture of corrigibility and in developing better formal measures. But there’s also a great deal of empirical work that seems possible to do at this point. In this document I’ll attempt to give a summary of where I, personally, want to invest more energy.

# Remaining Confusion

  * Does “empowerment” really capture the gist of corrigibility?
    * Does it actually matter whether we restrict the empowerment goal to the domains of the agent’s structure, thoughts, actions, and the consequences of their actions? Or do we still get good outcomes if we ask for more general empowerment?
      * It seems compelling to model nearly everything in the AI’s lightcone as a consequence of its actions, given that there’s a counterfactual way the AI could have behaved such that those facts would change. If we ask to be able to correct the AI’s actions, are we not, in practice, then asking to be generally empowered?
  * Corrigible agents should, I think, still (ultimately) obey commands that predictably disempower the principal or change the agent to be less corrigible. Does my attempted formalism actually capture this?
  * Can we prove that, in my formalism, any pressure on the principal’s actions that stems from outside their values is disempowering?
    * How should we think about agent-actions which scramble the connection between values and principal-actions, but in a way that preserves the way in which actions encode information about what generated them? Is this still kosher? What if the scrambling takes place by manipulating the principal’s beliefs?
  * What’s going on with the relationship between time, policies, and decisions? Am I implicitly picking a decision theory for the agent in my formalism?
  * Are my attempts to rescue corrigibility in the presence of multiple timesteps philosophically coherent? Should we inject entropy into the AI’s distribution over what time it is when measuring its expected corrigibility? If so, how much? Are the other suggestions about managing time good? What other tricks are there to getting things to work that I haven’t thought of?
  * Sometimes it’s good to change values, such as if one has a meta-value (i.e. “I want to want to stop gambling”). How can we formally reflect the desiderata of having a corrigible agent support this kind of growth, or at least not try to block the principal from growing.
    * If the agent allows the principal to change values, how can we clearly distinguish the positive and natural kind of growth from unwanted value drift or manipulation?
    * Is there actually a clean line between learning facts and changing values? If not, does “corrigibility” risk having an agent who wants to prevent the principal from learning things?
  * Does the agent want to protect the principal in general, or simply to protect the principal from the actions of the agent?
  * Corrigibility clearly involves respecting commands given by the principal yesterday, or more generally, some arbitrary time in the past. But when the principal of today gives a contradictory command, we want the agent to respect the updated instruction. What gives priority of the present over the past?
    * If the agent strongly expects the principal to give a command in the future, does that expected-command carry any weight? If so, can it take priority over the principal of the past/present?
  * Can a multiple-human team actually be a principal?
    * What’s the right way to ground that out, ontologically?
  * How should a corrigible agent behave when its principal seems self-contradictory? (Either because the principal is a team, or simply because the single-human principal is inconsistent.)
  * How can we formalize death in a way that results in the right kind of behavior when the principal dies (i.e. leaving a message and shutting down if not in the middle of fulfilling a task)?
  * How brittle, in practice, is the ontological link to the principal? In other words, how much should we worry about the agent getting the wrong idea for who the principal is?
  * How brittle, in practice, is leaning on the ontology of values and actions? What happens if the AI decides that there’s no natural way to distinguish deliberate actions from things like body language? Similarly for values/beliefs?
  * How can the notion of robustness be formalized correctly?
    * Part of the key to robust action is to be recursively skeptical of all models, and try to take actions which are consistently good even when one “pops up/out” to an outside view. What the heck does this even mean, formally?
    * How does the mathematics of lower-bound optimization and/or model “temperature” relate to robustness?
  * Is there a way of unifying my formalisms around corrigibility with the work of Alex Turner?
    * Is Turner’s notion of “power” somehow better than [I make it out to be](/posts/d7jSrBaLzFLvKgy32/4-existing-writing-on-corrigibility)?
    * Does [attainable-utility-preservation](https://arxiv.org/abs/1902.09725) capture some part of corrigibility that my thinking doesn’t? (Perhaps regarding robustness?)
  * How strong is anti-naturality, in practice?
  * How wide is the corrigibility attractor basin?
    * How sharp is the distributional shift from putting a newly-trained AGI into an environment where it’s capable of extended periods of thinking to itself?
  * Is there a “ravine” in goal-space that leads from the corrigibility attractor basin to human values?
    * If pure corrigibility turns out to not be exactly right, what story can be told about how to balance multiple goals without catastrophe?
  * In the process of scaling up an agent to increasing levels of intelligence, how can we judge whether additional work is needed in solidifying corrigibility vs it being fine to continue scaling?



And of course there are general questions such as “What are the best interpretability methods?” or “What (competitive) architectures give the best alignment guarantees?” or “How can we get the right people to govern AI?” which are interesting avenues of research that explicitly slot into the CAST agenda, even if they’re not about corrigibility per se.

# Suggested Future Research

## Training Corrigible Models

One of the most promising avenues for research on corrigibility is to attempt to train a CAST LLM or another such AI model that is reachable with currently available levels of compute. I’ve done the lowest-hanging fruit of producing a [Corrigibility Training Context](https://docs.google.com/document/d/1zgCuRRZO4KSm53Kh5sHR-i-k4vjBfcg77PqqohSIoIc/edit) which gets ChatGPT to be able to roughly talk about what I mean by corrigibility, but this would involve attempting to produce corrigible behaviors, rather than simply being able to abstractly identify what a corrigible agent would do. If one had a suitable dataset in hand, such work could probably be done in a weekend with less than a couple thousand dollars by fine-tuning an existing open-source model. I don’t know how to evaluate the difficulty of constructing a suitable dataset; plausibly something like constitutional AI could be employed by bootstrapping from an existing model with the right context to bypass the need for hand-collected data.

If we had a current-generation “corrigible” AI, I would be very excited to test whether it could reconstruct [desiderata](/posts/QzC7kdMQ5bbLoFddz/2-corrigibility-intuition) that had been carefully excluded from its training data. It also seems promising to test how well the AI can avoid falling into behavior which is helpful, obedient, conservative, or otherwise, but not corrigible per se. In other words: what are the main distractors, in practice? How does such a model act on edge cases?

If more resources are available, I’d be interested in attempting to craft a corrigibility benchmark and seeing how the performance of fine-tuned models scales with compute, especially when compared with other metrics for intelligence. My notion that corrigibility is a simple concept seems testable here, in that if relatively stupid models are able to pick up on the heart of the idea, it seems like strong evidence that more intelligent models will also be able to identify the property and optimize for it.

It also seems worth testing how much CAST buys compared to models trained to be both corrigible and have other nice properties such as “being harmless.” How does having the singular focus affect pre-AGI models on the corrigibility benchmark? Do we see incorrigible behavior creeping in, when the two properties come into conflict? How do mixed-goal LLMs tend to respond to the prospect of having their values change?

## Testing Corrigibility Understanding in Humans

One of the more exciting prospects for testing the concept of corrigibility, from my perspective, doesn’t involve AI models at all. Instead, it seems possible to me to gather data about how natural, simple, and coherent corrigibility is, as a concept, by measuring humans in game/quiz settings. Survey participants, volunteers, students, or Amazon Mechanical Turk workers could all be enlisted to, after being given short explainers on the property of corrigibility (and a comprehension test to ensure they have the basic idea), play a game where they’re presented with a situation and asked how a purely and perfectly corrigible agent would behave. These participants might be instructed that their response will be graded solely on how corrigible it is, rather than how good/helpful/friendly/etc. it is, and if they score highly they’re eligible for a bonus prize or something.

Do random humans understand corrigibility? What are the biggest sources of confusion? If it’s straightforward to teach humans about corrigibility, this is evidence that it’s a simple/natural/coherent concept. If multiple judges (perhaps including LLM judges?) are asked to independently score people’s answers for how to respond corrigibly in a given situation, do high-scoring answers tend to agree, or are there multiple different responses that we might see as corrigible? Agreement implies coherence, whereas disagreement would be a strong blow against CAST, implying that the idea of corrigibility is probably less real than it seems.

How do humans who score highly on producing corrigible responses handle edge-cases? What are the most confusing aspects of corrigibility from this perspective (rather than from the perspective of common-misunderstandings)? This sort of data might be invaluable for testing AI agents, or refining our understanding of how to formalize corrigibility.

## Other Experiments

  * Attempt to train a variety of models for anti-natural (i.e. Omohundro-opposed) goals and for similar-complexity neutral goals like maximizing diamond. Is there any empirical evidence that anti-naturality makes a goal harder to instill?
    * Does this result (either positive or negative) persist even at the scale of agents that are capable of limited situational awareness and general planning?
  * Use my formal measure of corrigibility to build a score-maximizing agent in a simple game that demonstrates shutdownability and general obedience over indefinite timesteps.
  * Use a formal measure of corrigibility to train/evaluate a [gridworld](https://arxiv.org/abs/1711.09883) agent.
  * Do a roleplaying-game style setup where one player is the human, one player is the AI, and one player is the environment. A fourth player might also be added for “The Devil”, who gives suggestions to the AI player with the intention of causing bad outcomes. Play should probably be slow/recorded, such that it’s possible to judge after the fact how well each player is doing their job. Can the human get useful work done without catastrophe? (I expect this to be more for fun than giving good data, but it might build helpful intuitions.)
  * Get an LLM to successfully write a wide-variety of vignettes about corrigibility, especially on less obvious cases. With contextual prompting I’ve only managed to get them to give variations on the same few themes, but I wouldn’t be surprised if much more could be done here. With additional work this could easily turn into a dataset or benchmark.



If you have any ideas for experiments, please suggest them! If you have feedback, questions, or just otherwise want to talk about CAST, please leave a comment or contact me at [max@intelligence.org](mailto:max@intelligence.org). In addition to resolving confusion and doing experiments, **I think one of the most useful next-steps is distillation and attempting to communicate these ideas in a more accessible way.** That’s where I’m planning to put energy next, as well as engaging with feedback from the community. We’re all in this together, and I want our understanding and presentation of corrigibility to be as strong and clear-minded as possible, presented side-by-side with the sharpest critiques, such that we can collectively avoid disaster. 🚀

Review

[Corrigibility2](/w/corrigibility-1)[AI2](/w/ai)[Frontpage](/posts/5conQhfa4rgb4SaWx/site-guide-personal-blogposts-vs-frontpage-posts)

# 31

# Ω 11

[Previous:4\. Existing Writing on Corrigibility19 comments64 karma](/s/KfCjeconYRdFbMxsy/p/d7jSrBaLzFLvKgy32)

[Next:Serious Flaws in CAST10 comments106 karma](/s/KfCjeconYRdFbMxsy/p/qgBFJ72tahLo5hzqy)Log in to save where you left off

Mentioned in

152[0\. CAST: Corrigibility as Singular Target](/posts/NQK8KHSrZRF5erTba/0-cast-corrigibility-as-singular-target-1)

64[4\. Existing Writing on Corrigibility](/posts/d7jSrBaLzFLvKgy32/4-existing-writing-on-corrigibility)

57[1\. The CAST Strategy](/posts/3HMh7ES4ACpeDKtsW/1-the-cast-strategy)

45[Simplifying Corrigibility – Subagent Corrigibility Is Not Anti-Natural](/posts/Zyq7PfBuaZgqEL8qQ/simplifying-corrigibility-subagent-corrigibility-is-not-anti)

New Comment

  


Submit

[Moderation Log](/moderation)

More from [Max Harms](/users/max-harms)

106[Serious Flaws in CAST](/posts/qgBFJ72tahLo5hzqy/serious-flaws-in-cast)

[Ω](https://alignmentforum.org/posts/qgBFJ72tahLo5hzqy/serious-flaws-in-cast)

[Max Harms](/users/max-harms)

2mo

[Ω](https://alignmentforum.org/posts/qgBFJ72tahLo5hzqy/serious-flaws-in-cast)

10

235[Contra Collier on IABIED](/posts/JWH63Aed3TA2cTFMt/contra-collier-on-iabied)

[Max Harms](/users/max-harms)

4mo

51

46[AI Corrigibility Debate: Max Harms vs. Jeremy Gillen](/posts/CsXAg8dHSgghDAoPx/ai-corrigibility-debate-max-harms-vs-jeremy-gillen)

[](https://doomdebates.com/p/the-ai-corrigibility-debate-miri)

[Liron](/users/liron), [Max Harms](/users/max-harms), [Jeremy Gillen](/users/jeremy-gillen)

2mo

[](https://doomdebates.com/p/the-ai-corrigibility-debate-miri)

1

[View more](/users/max-harms)

Curated and popular this week

122[Why we are excited about confession!](/posts/k4FjAzJwvYjFbCTKn/why-we-are-excited-about-confession)

[](/recommendations)[](https://alignment.openai.com/confessions/)

[Boaz Barak](/users/boaz-barak), [Gabriel Wu](/users/gabriel-wu), [Manas Joglekar](/users/manas-joglekar)

5d

[](/recommendations)[](https://alignment.openai.com/confessions/)

27

184["The first two weeks are the hardest": my first digital declutter](/posts/eeFqTjmZ8kS7S5tpg/the-first-two-weeks-are-the-hardest-my-first-digital)

[](https://mingyuan.substack.com/p/the-first-two-weeks-are-the-hardest)

[mingyuan](/users/mingyuan)

5d

[](https://mingyuan.substack.com/p/the-first-two-weeks-are-the-hardest)

9

154[Claude's new constitution](/posts/mLvxxoNjDqDHBAo6K/claude-s-new-constitution)

[](https://www.anthropic.com/news/claude-new-constitution)

[Zac Hatfield-Dodds](/users/zac-hatfield-dodds), [Drake Thomas](/users/drake-thomas)

2d

[](https://www.anthropic.com/news/claude-new-constitution)

30

0Comments

0

x

5\. Open Corrigibility Questions — LessWrong

PreviousNext






