// State-space model and hybrid architecture concepts.
// See ../claude-glossary.md for writing guidelines.
export const entries = [
  {
    term: "State-space model",
    altTerms: ["State-space models", "SSM"],
    definition: "A sequence model based on discretized linear dynamical systems, offering O(N) complexity.",
  },
  {
    term: "Linear attention",
    definition: "Replacing softmax attention with kernel-based linear recurrences for O(N) instead of O(N²) complexity.",
  },
  {
    term: "Hybrid",
    definition: "An architecture interleaving attention layers with SSM or other efficient layers.",
  },
  {
    term: "Selective gating",
    definition: "Mamba's key innovation: making SSM parameters input-dependent so the model can selectively remember or forget.",
  },
];
