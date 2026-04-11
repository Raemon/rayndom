// Long context concepts.
// See ../claude-glossary.md for writing guidelines.
export const entries = [
  {
    term: "Context window",
    definition: "The maximum amount of text a model can 'see' at once, measured in tokens. Early transformers handled about 512 tokens (~one page). Modern models handle 100K+ tokens (~a 300-page book), but expanding this window requires major efficiency and position-encoding breakthroughs.",
  },
  {
    term: "NTK-aware scaling",
    definition: "Models trained on short sequences often break when given longer inputs because their position encodings weren't designed for the new lengths. NTK-aware scaling adjusts the internal rotation frequencies used in RoPE so the model can handle longer sequences without retraining from scratch.",
  },
  {
    term: "Ring attention",
    definition: "Very long sequences can exceed the memory of a single GPU. Ring attention solves this by splitting the sequence across multiple GPUs arranged in a ring, where each GPU computes attention for its chunk and passes partial results to its neighbor until the full computation is complete.",
  },
  {
    term: "Sequence parallelism",
    definition: "When a sequence is too long for one GPU's memory, sequence parallelism splits it across multiple GPUs — each processes a segment of the input. Unlike other parallelism strategies that split by model layers or parameters, this divides the work along the length of the text itself.",
  },
  {
    term: "Long context",
    definition: "The ability to process very long inputs — 100K tokens or more, equivalent to a 300-page book. Achieving this requires overcoming quadratic attention costs, position encoding limits, and memory constraints through techniques like sparse attention, RoPE scaling, and ring attention.",
  },
];
