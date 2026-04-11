// Alignment and RLHF concepts.
// See ../claude-glossary.md for writing guidelines.
export const entries = [
  {
    term: "RLHF",
    definition: "Reinforcement Learning from Human Feedback — a pre-trained model can generate fluent text but may be unhelpful, dishonest, or harmful. RLHF fixes this by training a reward model on human preferences, then optimizing the model to produce outputs humans rate highly — steering behavior without hand-writing rules.",
  },
  {
    term: "Reinforcement learning",
    altTerms: ["RL"],
    definition: "A training approach where a model learns by trial and error, receiving a numerical reward score after each attempt rather than being shown the right answer. Like training a dog with treats — the model doesn't know the correct action in advance, but learns which actions earn higher rewards.",
  },
  {
    term: "Reward model",
    definition: "A model trained to act as an automated judge — given two responses to the same question, it predicts which one a human would prefer. Humans label thousands of preference pairs; the reward model learns their patterns and can then score millions of responses without human involvement.",
  },
  {
    term: "PPO",
    definition: "Proximal Policy Optimization — when optimizing a model against a reward signal, large updates can destabilize training (the model may 'hack' the reward or forget what it learned). PPO prevents this by limiting how much the model can change in each step, producing stable, incremental improvements.",
  },
  {
    term: "KL penalty",
    definition: "When optimizing for a reward signal, the model might drift so far from its pre-trained behavior that it produces fluent-sounding nonsense that games the reward. A KL penalty acts as a leash, penalizing the model for straying too far from its original language patterns.",
  },
  {
    term: "Alignment",
    definition: "The challenge of making an AI system behave in ways that match human intentions, values, and safety expectations. An 'aligned' model doesn't only give correct answers — it avoids harmful outputs, follows instructions faithfully, and asks for clarification when requests are ambiguous.",
  },
  {
    term: "Policy",
    definition: "Not 'policy' as in rules or regulations — in reinforcement learning, a policy is the model's learned strategy for choosing what to do next. For a language model, the policy determines which word to generate next. RLHF reshapes the policy so the model produces more helpful, less harmful outputs.",
  },
  {
    term: "Critic",
    definition: "A companion model that estimates how good a situation is, helping the main model learn more efficiently. Like a coach watching practice swings and saying 'that one looked promising' — the critic evaluates actions so the policy can learn from the feedback without waiting for a final outcome.",
  },
  {
    term: "Base model",
    definition: "The raw model produced by pre-training, before any alignment tuning. A base model generates fluent text but tends to ramble, continue prompts rather than answer them, and may produce harmful content. It's the starting point that SFT and RLHF refine into a usable assistant.",
  },
  {
    term: "Human annotation",
    definition: "The process of humans labeling, ranking, or evaluating data to create training signals. For RLHF, annotators compare pairs of model responses and mark which is better — these judgments become the raw material for training the reward model.",
  },
  {
    term: "Process reward model",
    altTerms: ["Process reward models"],
    definition: "A reward model that evaluates each intermediate step in a chain of reasoning, not only the final answer. A standard reward model might score 'correct' for a lucky guess with flawed logic; a process reward model catches bad reasoning along the way, encouraging more reliable problem-solving.",
  },
  {
    term: "Preference pairs",
    definition: "Two model responses to the same prompt, where a human has marked one as better. These pairs are the training data for reward models — by learning from thousands of 'A is better than B' judgments, the system learns to distinguish high-quality outputs from poor ones.",
  },
  {
    term: "Binary cross-entropy",
    definition: "A mathematical formula for measuring how well a model distinguishes between two options (like 'preferred' vs. 'not preferred'). In alignment training, it serves as the loss function used to train the reward model or, in DPO, to optimize the language model directly on human preference pairs.",
  },
  {
    term: "Closed-form",
    definition: "A solution you can compute directly with a formula, rather than iterating toward an answer through trial and error. Like calculating a tip with multiplication vs. adjusting up and down until the total looks right. DPO uses a closed-form solution, avoiding the iterative RL loop that RLHF requires.",
  },
];
