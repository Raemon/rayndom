export const entry = {
  year: 2022,
  name: "RLHF",
  diag: "rlhf",
  oneLiner: "Train models to prefer what humans prefer",
  problem: `Even after instruction tuning, a model can produce outputs that are fluent but unhelpful, evasive, or harmful. The training loss encodes statistical patterns of text, not what humans actually want. A model might give a technically plausible but misleading answer, or generate toxic content from its training data.

The core framework — learning a reward model from human preference comparisons and optimizing a policy against it — was established by Christiano et al. (2017) for Atari and robotics. InstructGPT (2022) adapted it for language models.

RLHF aligns the model in two stages. First, train a reward model (a separate neural network): show human raters two different model responses to the same prompt, and they pick the better one. The reward model learns to predict which response humans would prefer. Second, use reinforcement learning — specifically PPO (Proximal Policy Optimization, a stable RL algorithm) — to adjust the language model's weights to maximize the reward model's score, with a KL penalty (a mathematical constraint) that prevents the model from drifting too far from its pre-trained behavior. Later work, notably DPO (2023), showed this could be simplified to a single supervised-learning step on preference pairs, eliminating the RL loop entirely.`,
  whyNotSooner: `Components existed separately — Christiano et al. (2017) established the framework for Atari and robotics. But reward models need expensive human annotation, KL-constrained optimization needs careful tuning, and the human data pipeline was the bottleneck. Later simplified by DPO (2023), which derived a closed-form solution eliminating the RL loop entirely.`,
  howInvented: `RLHF was invented by porting preference-learning ideas from reinforcement learning into language models: collect pairwise human judgments, fit a reward model, then optimize the policy against that reward. Independent convergence: roughly 2 groups mattered most — the Christiano preference-learning line and the OpenAI InstructGPT adaptation for LLMs, which turned the recipe into a mainstream alignment pipeline.`,
  examples: "InstructGPT,ChatGPT",
};
