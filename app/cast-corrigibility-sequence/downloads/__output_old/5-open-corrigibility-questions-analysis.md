# 5. Open Corrigibility Questions - Concept Analysis

## Background Knowledge

- Empowerment as a formalization target
- Inverse reinforcement learning
- Constitutional AI
- Gridworld experiments in AI safety
- Attainable Utility Preservation (Alex Turner)
- Anti-naturality of corrigibility
- Distributional/ontological shifts
- Interpretability research

## New Knowledge

### Core Research Questions

> Does "empowerment" really capture the gist of corrigibility?

> Does it actually matter whether we restrict the empowerment goal to the domains of the agent's structure, thoughts, actions, and the consequences of their actions? Or do we still get good outcomes if we ask for more general empowerment?

> What gives priority of the present over the past?

> How strong is anti-naturality, in practice?

> How wide is the corrigibility attractor basin?

### On Principal Identification

> How can we formalize death in a way that results in the right kind of behavior when the principal dies (i.e. leaving a message and shutting down if not in the middle of fulfilling a task)?

> How brittle, in practice, is the ontological link to the principal? In other words, how much should we worry about the agent getting the wrong idea for who the principal is?

### On Value Changes and Manipulation

> Sometimes it's good to change values, such as if one has a meta-value (i.e. "I want to want to stop gambling"). How can we formally reflect the desiderata of having a corrigible agent support this kind of growth, or at least not try to block the principal from growing.

> If the agent allows the principal to change values, how can we clearly distinguish the positive and natural kind of growth from unwanted value drift or manipulation?

### On Robustness

> How can the notion of robustness be formalized correctly?

> Part of the key to robust action is to be recursively skeptical of all models, and try to take actions which are consistently good even when one "pops up/out" to an outside view. What the heck does this even mean, formally?

### Proposed Experiments: Training Corrigible Models

> One of the most promising avenues for research on corrigibility is to attempt to train a CAST LLM or another such AI model that is reachable with currently available levels of compute.

> If we had a current-generation "corrigible" AI, I would be very excited to test whether it could reconstruct desiderata that had been carefully excluded from its training data.

> It also seems worth testing how much CAST buys compared to models trained to be both corrigible and have other nice properties such as "being harmless."

### Proposed Experiments: Testing Human Understanding

> Do random humans understand corrigibility? What are the biggest sources of confusion? If it's straightforward to teach humans about corrigibility, this is evidence that it's a simple/natural/coherent concept.

> If multiple judges... are asked to independently score people's answers for how to respond corrigibly in a given situation, do high-scoring answers tend to agree, or are there multiple different responses that we might see as corrigible? Agreement implies coherence, whereas disagreement would be a strong blow against CAST.

### Conclusion

> I think one of the most useful next-steps is distillation and attempting to communicate these ideas in a more accessible way.
