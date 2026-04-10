// Pre-training and transfer learning concepts.
// See ../claude-glossary.md for writing guidelines.
export const entries = [
  {
    term: "Autoregressive",
    definition: "Generating one token at a time, each conditioned on all previous tokens.",
  },
  {
    term: "Pre-training",
    definition: "Training on a large unsupervised corpus before task-specific fine-tuning.",
  },
  {
    term: "Fine-tuning",
    definition: "Adapting a pre-trained model to a specific task with a small labeled dataset.",
  },
  {
    term: "Masked language modeling",
    definition: "Hiding random tokens and training the model to reconstruct them from surrounding context.",
  },
  {
    term: "Bidirectional context",
    definition: "Attending to both left and right context simultaneously, unlike autoregressive (left-only) models.",
  },
  {
    term: "SFT",
    altTerms: ["Supervised fine-tuning"],
    definition: "Supervised Fine-Tuning — training on curated (prompt, ideal response) pairs with standard cross-entropy loss.",
  },
  {
    term: "Instruction following",
    definition: "A model's ability to accurately understand and execute natural language instructions.",
  },
  {
    term: "Task diversity",
    definition: "Training on many different task formats (QA, summarization, translation, code) so the model generalizes to new instruction types.",
  },
];
