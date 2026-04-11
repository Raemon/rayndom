// Position encoding concepts.
// See ../claude-glossary.md for writing guidelines.
export const entries = [
  {
    term: "Absolute position encoding",
    definition: "Transformers process all tokens simultaneously, so they have no built-in sense of word order. Absolute position encoding solves this by assigning a fixed vector to each position (1st word, 2nd word, etc.) and adding it to the token's representation. The downside: it can't handle sequences longer than it was trained on.",
  },
  {
    term: "Relative position",
    definition: "Instead of labeling each token with a fixed position number (1st, 2nd, 3rd...), relative position encoding captures the distance between tokens. This means the model learns patterns like 'adjectives tend to appear near their nouns' regardless of where in the sentence they occur, and can generalize to new sequence lengths.",
  },
  {
    term: "Length extrapolation",
    definition: "A model's ability to handle sequences longer than anything it saw during training. If a model trained on 4K-token texts can process a 32K-token document without breaking down, it extrapolates well. Most position encoding schemes struggle here because the model has never learned what higher positions mean.",
  },
  {
    term: "RoPE",
    definition: "Rotary Position Embeddings — a method that encodes position by rotating query and key vectors by an angle proportional to their position. Because attention depends on the angle between query and key, only the relative rotation (distance between tokens) matters — letting the model generalize to longer sequences than it trained on.",
  },
];
