export const entry = {
  year: 2022,
  name: "RLHF",
  diag: "rlhf",
  problem: `Even after instruction tuning, a model optimized for next-token prediction can produce outputs that are fluent but unhelpful, evasive, or harmful. The core issue: "predict the most likely next word" is not the same objective as "be helpful and harmless." The training loss function doesn't encode human values — it encodes statistical patterns of text. A model might give a technically plausible but misleading answer, or generate toxic content that appeared in its training data.

RLHF aligns the model in two stages. First, train a reward model (a separate neural network): show human raters two different model responses to the same prompt, and they pick the better one. The reward model learns to predict which response humans would prefer. Second, use reinforcement learning — specifically PPO (Proximal Policy Optimization, a stable RL algorithm) — to adjust the language model's weights to maximize the reward model's score, with a KL penalty (a mathematical constraint) that prevents the model from drifting too far from its pre-trained behavior. Later work, notably DPO (2023), showed this could be simplified to a single supervised-learning step on preference pairs, eliminating the RL loop entirely.`,
  whyNotSooner: `Components existed separately. RL training of large LMs is unstable, reward models need expensive human annotation, and KL-constrained optimization needs careful tuning. The human data pipeline was the bottleneck. Later simplified by DPO (2023), which derived a closed-form solution eliminating the RL loop entirely.`,
  examples: "ChatGPT,Claude,Gemini — standard alignment for all frontier models,DPO (2023) simplified this to supervised learning on preference pairs",
};
