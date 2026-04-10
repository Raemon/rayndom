// Position encoding concepts.
// See ../claude-glossary.md for writing guidelines.
export const entries = [
  {
    term: "Absolute position encoding",
    definition: "A fixed vector for each position index, added to the token embedding. Doesn't generalize to new lengths.",
  },
  {
    term: "Relative position",
    definition: "Encoding distance between tokens rather than their absolute indices — enables length generalization.",
  },
  {
    term: "Length extrapolation",
    definition: "Handling sequences longer than those seen during training without degraded performance.",
  },
  {
    term: "RoPE",
    definition: "Rotary Position Embeddings — encodes relative position by rotating query/key vectors, enabling length extrapolation.",
  },
];
