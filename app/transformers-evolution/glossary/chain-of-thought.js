// Chain-of-thought and reasoning concepts.
// See ../claude-glossary.md for writing guidelines.
export const entries = [
  {
    term: "Multi-step reasoning",
    definition: "Multi-step reasoning is problem-solving that chains several inferences or lookups before the answer, used when no single pattern match from training text yields the correct conclusion.\n\nA one-shot model tries to jump from question to answer in a single forward pass; multi-step tasks need memory of intermediate facts (who is taller than whom, which equation was derived) so later steps stay consistent.\n\nExample: \"A train leaves at 3pm at 60 mph; another leaves at 4pm at 90 mph from the same station—when does the second catch the first?\" requires time-distance setup, then algebra; skipping straight to a number often fails.",
  },
  {
    term: "Serial compute",
    definition: "Serial compute is extra depth-first processing achieved by generating additional tokens before the final answer—used so hard questions get more internal work than easy ones without widening the neural network.\n\nStandard autoregressive models spend roughly one block of computation per output token; inserting explicit \"thinking\" tokens lengthens the chain and effectively buys more passes of the same weights.\n\nExample: for a logic puzzle, the model might emit lines like \"Case 1: assume Alice is the liar…\" across dozens of tokens before stating who tells the truth—those intermediate lines are serial compute, not user-visible answer text.",
  },
  {
    term: "Reasoning chain",
    altTerms: ["Reasoning chains"],
    definition: "A reasoning chain is the visible scratch work a model writes between reading the question and stating the conclusion, used to make intermediate steps checkable and to spread error correction across many small updates.\n\nIt is the model analog of showing steps on a worksheet rather than circling a guessed letter.\n\nExample: asked \"What is 17 × 23?\", the chain might read \"17 × 20 = 340; 17 × 3 = 51; 340 + 51 = 391\" before the final line \"391\"—each arithmetic line is one link in the chain.",
  },
];
