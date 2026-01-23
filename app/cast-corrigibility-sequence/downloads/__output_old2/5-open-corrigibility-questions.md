# 5. Open Corrigibility Questions

## Background Knowledge

- Constitutional AI training methods
- The concept of "attainable utility preservation" (Alex Turner)
- Adversarial training and robustness testing
- Interpretability methods in machine learning
- Gridworld environments for AI safety research
- The concept of situational awareness in AI systems
- Fine-tuning open-source language models
- The concept of ontological stability and distributional shift
- Amazon Mechanical Turk and human subject research
- The concept of lower-bound optimization

## New Knowledge

> Does "empowerment" really capture the gist of corrigibility?

> Does it actually matter whether we restrict the empowerment goal to the domains of the agent's structure, thoughts, actions, and the consequences of their actions? Or do we still get good outcomes if we ask for more general empowerment?

> It seems compelling to model nearly everything in the AI's lightcone as a consequence of its actions, given that there's a counterfactual way the AI could have behaved such that those facts would change. If we ask to be able to correct the AI's actions, are we not, in practice, then asking to be generally empowered?

> Corrigible agents should, I think, still (ultimately) obey commands that predictably disempower the principal or change the agent to be less corrigible.

> Can we prove that, in my formalism, any pressure on the principal's actions that stems from outside their values is disempowering?

> Sometimes it's good to change values, such as if one has a meta-value (i.e. "I want to want to stop gambling"). How can we formally reflect the desiderata of having a corrigible agent support this kind of growth, or at least not try to block the principal from growing.

> If the agent allows the principal to change values, how can we clearly distinguish the positive and natural kind of growth from unwanted value drift or manipulation?

> Is there actually a clean line between learning facts and changing values? If not, does "corrigibility" risk having an agent who wants to prevent the principal from learning things?

> Does the agent want to protect the principal in general, or simply to protect the principal from the actions of the agent?

> If the agent strongly expects the principal to give a command in the future, does that expected-command carry any weight? If so, can it take priority over the principal of the past/present?

> Can a multiple-human team actually be a principal? What's the right way to ground that out, ontologically?

> How should a corrigible agent behave when its principal seems self-contradictory? (Either because the principal is a team, or simply because the single-human principal is inconsistent.)

> How brittle, in practice, is the ontological link to the principal? In other words, how much should we worry about the agent getting the wrong idea for who the principal is?

> How brittle, in practice, is leaning on the ontology of values and actions? What happens if the AI decides that there's no natural way to distinguish deliberate actions from things like body language? Similarly for values/beliefs?

> Part of the key to robust action is to be recursively skeptical of all models, and try to take actions which are consistently good even when one "pops up/out" to an outside view. What the heck does this even mean, formally?

> How strong is anti-naturality, in practice?

> How wide is the corrigibility attractor basin?

> How sharp is the distributional shift from putting a newly-trained AGI into an environment where it's capable of extended periods of thinking to itself?

> Is there a "ravine" in goal-space that leads from the corrigibility attractor basin to human values?

> If pure corrigibility turns out to not be exactly right, what story can be told about how to balance multiple goals without catastrophe?

> In the process of scaling up an agent to increasing levels of intelligence, how can we judge whether additional work is needed in solidifying corrigibility vs it being fine to continue scaling?

> One of the most promising avenues for research on corrigibility is to attempt to train a CAST LLM or another such AI model that is reachable with currently available levels of compute.

> If we had a current-generation "corrigible" AI, I would be very excited to test whether it could reconstruct desiderata that had been carefully excluded from its training data.

> My notion that corrigibility is a simple concept seems testable here, in that if relatively stupid models are able to pick up on the heart of the idea, it seems like strong evidence that more intelligent models will also be able to identify the property and optimize for it.

> Do random humans understand corrigibility? What are the biggest sources of confusion? If it's straightforward to teach humans about corrigibility, this is evidence that it's a simple/natural/coherent concept.

> If multiple judges (perhaps including LLM judges?) are asked to independently score people's answers for how to respond corrigibly in a given situation, do high-scoring answers tend to agree, or are there multiple different responses that we might see as corrigible? Agreement implies coherence, whereas disagreement would be a strong blow against CAST, implying that the idea of corrigibility is probably less real than it seems.

> **I think one of the most useful next-steps is distillation and attempting to communicate these ideas in a more accessible way.**
