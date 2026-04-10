// Long context concepts.
// See ../claude-glossary.md for writing guidelines.
export const entries = [
  {
    term: "Context window",
    definition: "The maximum number of tokens a model can process in a single forward pass.",
  },
  {
    term: "NTK-aware scaling",
    definition: "Adjusting RoPE rotation frequencies using Neural Tangent Kernel theory for length extrapolation.",
  },
  {
    term: "Ring attention",
    definition: "Distributing the attention computation across GPUs along the sequence dimension for very long inputs.",
  },
  {
    term: "Sequence parallelism",
    definition: "Distributing computation along the sequence dimension across multiple GPUs to handle long contexts.",
  },
  {
    term: "Long context",
    definition: "The ability to process very long inputs (100K+ tokens), requiring architectural and systems innovations.",
  },
];
