// Alignment and RLHF concepts.
// See ../claude-glossary.md for writing guidelines.
export const entries = [
  {
    term: "RLHF",
    definition: "Reinforcement Learning from Human Feedback — training a reward model on human preferences, then optimizing the LM against it.",
  },
  {
    term: "Reinforcement learning",
    altTerms: ["RL"],
    definition: "Training paradigm where a model learns from scalar reward signals rather than labeled examples.",
  },
  {
    term: "Reward model",
    definition: "A model trained to predict which of two outputs a human would prefer.",
  },
  {
    term: "PPO",
    definition: "Proximal Policy Optimization — a stable reinforcement learning algorithm that constrains policy update size.",
  },
  {
    term: "KL penalty",
    definition: "A regularization term preventing the model from straying too far from the pre-trained distribution.",
  },
  {
    term: "Alignment",
    definition: "Making model behavior match human values, intentions, and safety requirements.",
  },
  {
    term: "Policy",
    definition: "In RL, the learned strategy mapping inputs to actions; for LLMs, the model's text generation distribution.",
  },
  {
    term: "Critic",
    definition: "In RL, a model that estimates the expected value of states or actions to help stabilize policy training.",
  },
  {
    term: "Base model",
    definition: "The pre-trained model before any alignment, fine-tuning, or RLHF has been applied.",
  },
  {
    term: "Human annotation",
    definition: "Human-generated labels, rankings, or feedback used to train reward models or create labeled datasets.",
  },
  {
    term: "Process reward model",
    altTerms: ["Process reward models"],
    definition: "A reward model that evaluates intermediate reasoning steps, not just final answers.",
  },
  {
    term: "Preference pairs",
    definition: "Two model outputs for the same prompt, one ranked as preferred by a human evaluator.",
  },
  {
    term: "Binary cross-entropy",
    definition: "Standard binary classification loss, applied in DPO to preference ranking over output pairs.",
  },
  {
    term: "Closed-form",
    definition: "An exact mathematical solution derived analytically, as opposed to iterative numerical optimization.",
  },
];
