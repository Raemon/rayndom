// Scaling and emergent behavior concepts.
// See ../claude-glossary.md for writing guidelines.
export const entries = [
  {
    term: "LLM",
    altTerms: ["LLMs"],
    definition: "Large Language Model — a Transformer with billions of parameters trained on massive text corpora.",
  },
  {
    term: "LM",
    altTerms: ["LMs"],
    definition: "Language Model — a model trained to predict or generate sequences of tokens.",
  },
  {
    term: "Parameters",
    definition: "The learned numerical weights in a neural network; more parameters generally means more capacity.",
  },
  {
    term: "Zero-shot",
    definition: "Performing a task without any task-specific training examples — relying purely on pre-trained knowledge.",
  },
  {
    term: "Zero-shot transfer",
    definition: "Performing a task the model was never explicitly trained on, using only knowledge from pre-training.",
  },
  {
    term: "Emergent capabilities",
    definition: "Abilities that appear at larger model scales but are absent at smaller scales.",
  },
  {
    term: "In-context learning",
    definition: "The model adapts to a task based on examples in the prompt, without any gradient updates.",
  },
  {
    term: "Few-shot",
    definition: "Providing a small number of examples in the prompt to demonstrate a task.",
  },
  {
    term: "Prompt",
    definition: "The text input given to the model that conditions its generation.",
  },
  {
    term: "Scaling hypothesis",
    definition: "The idea that simply making models larger yields qualitatively better, more general capabilities.",
  },
  {
    term: "Scaling law",
    altTerms: ["Scaling laws"],
    definition: "Empirical power-law relationships between model size, data, compute, and resulting performance.",
  },
  {
    term: "Compute-optimal",
    definition: "The model size and data amount that jointly maximize performance for a fixed FLOP budget.",
  },
  {
    term: "Tokens-to-parameters ratio",
    definition: "Chinchilla's finding: ~20 tokens per parameter is optimal. GPT-3 had ~1.7.",
  },
  {
    term: "Forward pass",
    definition: "One pass through the network from input to output, producing predictions without updating weights.",
  },
  {
    term: "Weight updates",
    definition: "Adjusting model parameters using computed gradients — how the model learns from data.",
  },
  {
    term: "GPU",
    definition: "Graphics Processing Unit — massively parallel processor used to accelerate neural network training and inference.",
  },
  {
    term: "GPU-days",
    definition: "A unit of compute cost: one GPU running for one day. Training frontier models requires thousands of GPU-days.",
  },
  {
    term: "FLOPS",
    definition: "Floating Point Operations Per Second — a measure of computational throughput.",
  },
  {
    term: "Inference",
    definition: "Using a trained model to generate predictions or outputs, as opposed to training it.",
  },
  {
    term: "Power law",
    definition: "A mathematical relationship where one quantity varies as a power of another (y = ax^b). Neural scaling follows power laws.",
  },
  {
    term: "Compute budget",
    definition: "Total FLOPs allocated for a training run, determining the feasible combinations of model size and data amount.",
  },
];
