export const entry = {
  year: "2023–26",
  name: "SSM Hybrids (Mamba, RWKV, Jamba)",
  diag: "ssm",
  oneLiner: "Linear-cost alternatives to quadratic attention",
  problem: `Quadratic attention made very long sequences costly, so SSM hybrids used linear state updates plus sparse retrieval.

Even with FlashAttention, every token must attend to every other token. Doubling sequence length quadruples computation. For very long sequences (100K+ tokens), this is a fundamental hardware bottleneck.

State-space models (SSMs) offer an alternative rooted in control theory — a branch of mathematics dealing with dynamical systems. Instead of computing all pairwise interactions, an SSM processes each token in sequence, updating a fixed-size hidden state — similar to an RNN, but with structured state transitions derived from continuous-time differential equations, discretized for sequential data. This gives O(N) time complexity — linear in sequence length. The catch: pure SSMs struggle to match attention's ability to retrieve specific information from earlier in the sequence.

Hybrid architectures get the best of both by interleaving SSM layers (for efficient long-range processing) with sparse attention layers (for precise information retrieval). Models like Mamba introduced selective gating, which lets the SSM dynamically decide what to store in its state based on input content, closing much of the quality gap with full attention.`,
  whyNotSooner: `Pure SSMs lagged in quality until selective gating and hardware-aware implementations narrowed attention's advantage.

SSMs existed in control theory for decades. Making them competitive on language required selective gating (Mamba) and hardware-aware implementations. Full attention remains a strong baseline with a persistent quality gap.`,
  examples: "Mamba-2,RWKV-6,Jamba (AI21),Zamba,Various on-device/edge models",
};
