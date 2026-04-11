// State-space model and hybrid architecture concepts.
// See ../claude-glossary.md for writing guidelines.
export const entries = [
  {
    term: "State-space model",
    altTerms: ["State-space models", "SSM"],
    definition: "Transformers compare every token to every other token, which gets quadratically more expensive as input length grows. A state-space model (SSM) is an alternative architecture that processes sequences by maintaining a compressed running summary, achieving linear cost — doubling the input length only doubles (rather than quadruples) the computation.",
  },
  {
    term: "Linear attention",
    definition: "Standard attention compares every token to every other token, costing O(N²) — processing 10× more tokens costs 100× more compute. Linear attention reformulates the attention operation using mathematical tricks (kernel approximations) to achieve O(N) cost, but often sacrifices some of the precise token-to-token matching that makes standard attention powerful.",
  },
  {
    term: "Hybrid",
    definition: "Attention layers excel at precise long-range lookups but are expensive; SSM layers handle sequential flow cheaply but are weaker at exact retrieval. A hybrid architecture interleaves both types, using SSM layers for most processing and inserting attention layers where precise recall matters — combining efficiency with accuracy.",
  },
  {
    term: "Selective gating",
    definition: "Standard SSMs apply the same compression rules to every token, which means they can't distinguish important information from noise. Selective gating — Mamba's key innovation — makes the SSM's compression parameters depend on the input, letting the model decide on the fly what to remember and what to discard. Like a note-taker who writes down key facts but skips filler words.",
  },
];
