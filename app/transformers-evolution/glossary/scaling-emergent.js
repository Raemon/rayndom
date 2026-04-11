// Scaling and emergent behavior concepts.
// See ../claude-glossary.md for writing guidelines.
export const entries = [
  {
    term: "LLM",
    altTerms: ["LLMs"],
    definition: "Large Language Model — a neural network with billions of tunable parameters (GPT-3 has 175 billion) trained on vast amounts of text. LLMs are large enough to exhibit capabilities — like summarization and reasoning — that smaller models lack.",
  },
  {
    term: "LM",
    altTerms: ["LMs"],
    definition: "Language Model — a program trained to predict what word comes next in a sequence. Given 'The cat sat on the,' a language model assigns probabilities to possible next words like 'mat' or 'floor.' All modern AI chatbots are language models at their core.",
  },
  {
    term: "Parameters",
    definition: "The individual numerical values a neural network adjusts during training — like knobs on a mixing board. A small model might have millions; GPT-3 has 175 billion. More parameters let a model represent more complex patterns.",
  },
  {
    term: "Zero-shot",
    definition: "Performing a task with no examples provided — the model relies entirely on knowledge from pre-training. Ask 'Translate hello to French' without any translation examples, and the model produces 'bonjour' from patterns it absorbed during training.",
  },
  {
    term: "Zero-shot transfer",
    definition: "Performing a task the model was never explicitly trained on, using only knowledge absorbed during pre-training. A model trained on general text can answer medical questions, write poetry, or debug code — even though no one labeled training data for those tasks.",
  },
  {
    term: "Emergent capabilities",
    definition: "Abilities that appear when models reach a certain scale but are absent in smaller ones. A 1-billion-parameter model might fail at multi-step arithmetic, while a 100-billion-parameter model handles it — without any change in training method. The capability 'emerges' from scale alone.",
  },
  {
    term: "In-context learning",
    definition: "The model learns a task on-the-fly from examples placed in the prompt, without any retraining. Show it three French-to-English translations, then give a fourth French sentence — it translates it. The model's parameters don't change; it picks up the pattern from context alone.",
  },
  {
    term: "Few-shot",
    definition: "Giving the model a handful of worked examples in the prompt to demonstrate what you want, rather than retraining it. Show three 'sentiment: positive/negative' classifications, then present a new sentence — the model follows the pattern. Contrast with zero-shot, which provides no examples.",
  },
  {
    term: "Prompt",
    definition: "The text you type into a language model to tell it what to do. Everything the model reads before generating a response — questions, instructions, examples, or any combination — is the prompt. The model's output is shaped entirely by the prompt it receives.",
  },
  {
    term: "Scaling hypothesis",
    definition: "The idea that making models larger — more parameters, more training data, more compute — produces qualitatively new capabilities, not merely incremental improvements. This hypothesis drove the jump from millions to billions of parameters and motivated training runs costing tens of millions of dollars.",
  },
  {
    term: "Scaling law",
    altTerms: ["Scaling laws"],
    definition: "A predictable mathematical relationship between how much you invest (model size, data, compute) and how well the model performs. Improvements follow power laws: doubling compute doesn't double performance, but gains are smooth and forecastable — letting researchers predict capability before training.",
  },
  {
    term: "Compute-optimal",
    definition: "Given a fixed budget of computing power, the best split between model size and training data. Chinchilla showed that many models (like GPT-3) were too large for their data — a smaller model trained on more text would have performed better for the same cost.",
  },
  {
    term: "Tokens-to-parameters ratio",
    definition: "The ratio of training data size to model size. Chinchilla found ~20 tokens of training data per parameter is optimal. GPT-3, with 175B parameters but only 300B tokens (~1.7 per parameter), was significantly undertrained relative to its size.",
  },
  {
    term: "Forward pass",
    definition: "Sending an input through the network from start to finish to get an output — like dropping a ball through a pinball machine. Each layer transforms the data, and a prediction comes out at the end. During a forward pass, the model doesn't learn; it only makes a prediction.",
  },
  {
    term: "Weight updates",
    definition: "After the model makes a prediction, weight updates adjust its internal numbers to reduce errors — this is how the model learns. Each update nudges thousands of parameters slightly, like tuning a guitar string by string until the whole instrument sounds right.",
  },
  {
    term: "GPU",
    definition: "Graphics Processing Unit — a chip originally designed for video game graphics, but ideal for AI because it can perform thousands of math operations at once. Training modern AI models requires hundreds or thousands of GPUs running in parallel.",
  },
  {
    term: "GPU-days",
    definition: "A measure of computing cost: one GPU running for 24 hours. Training GPT-3 required roughly 3,640 GPU-days. Researchers use this unit to compare training costs the way builders compare projects in labor-hours.",
  },
  {
    term: "FLOPS",
    definition: "Floating-Point Operations Per Second — a measure of how fast a computer can do math. One modern GPU performs hundreds of trillions of FLOPS. Researchers use total FLOP counts to quantify training cost independent of what hardware was used.",
  },
  {
    term: "Inference",
    definition: "Using a trained model to produce outputs — answering questions, translating text, generating code. Training teaches the model; inference is the model doing its job. Every time you chat with an AI, each response is an inference step.",
  },
  {
    term: "Power law",
    definition: "A mathematical relationship where doubling one quantity doesn't double the other — returns diminish smoothly but never stop. Neural network performance follows power laws with scale: each 10× increase in compute yields a consistent but smaller improvement, forming a straight line on a log-log plot.",
  },
  {
    term: "Compute budget",
    definition: "The total computation (measured in FLOPs) allocated for a training run. A fixed compute budget forces a trade-off: train a large model for fewer steps, or a smaller model for more steps. Scaling laws help find the optimal split.",
  },
];
