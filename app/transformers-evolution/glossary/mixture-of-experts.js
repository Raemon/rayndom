// Mixture of Experts (MoE) concepts.
// See ../claude-glossary.md for writing guidelines.
export const entries = [
  {
    term: "Dense model",
    definition: "A model where all parameters are activated for every input, as opposed to sparse/MoE models.",
  },
  {
    term: "Expert",
    definition: "A sub-network within MoE that specializes in certain tokens or input patterns.",
  },
  {
    term: "Gating function",
    definition: "A small network that decides which experts each token is routed to.",
  },
  {
    term: "Expert collapse",
    definition: "A failure mode where MoE training causes all tokens to be routed to the same few experts.",
  },
  {
    term: "Load balancing",
    definition: "Ensuring tokens are distributed evenly across experts in MoE, often via auxiliary loss terms.",
  },
  {
    term: "Auxiliary loss",
    altTerms: ["Auxiliary losses"],
    definition: "An extra loss term added during training to prevent pathologies like expert collapse in MoE.",
  },
];
