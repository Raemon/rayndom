// Chain-of-thought and reasoning concepts.
// See ../claude-glossary.md for writing guidelines.
export const entries = [
  {
    term: "Multi-step reasoning",
    definition: "Problems that require chaining several logical steps rather than a single lookup. For example, 'If Alice is taller than Bob, and Bob is taller than Carol, who is shortest?' requires combining two comparisons. Standard language models struggle here because they produce answers in a single forward pass with no intermediate scratch work.",
  },
  {
    term: "Serial compute",
    definition: "A standard model does the same amount of computation per output token regardless of difficulty. Serial compute lets the model 'think longer' on harder problems by generating intermediate reasoning tokens — each token acts as an additional step of computation, giving the model more processing time before the final answer.",
  },
  {
    term: "Reasoning chain",
    altTerms: ["Reasoning chains"],
    definition: "A sequence of intermediate steps the model writes out before giving its final answer — like showing your work on a math test. Given 'What is 17 × 23?', instead of guessing, the model might write '17 × 20 = 340, 17 × 3 = 51, 340 + 51 = 391.' Each step builds on previous results.",
  },
];
