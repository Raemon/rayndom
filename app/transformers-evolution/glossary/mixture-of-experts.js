// Mixture of Experts (MoE) concepts.
// See ../claude-glossary.md for writing guidelines.
export const entries = [
  {
    term: "Dense model",
    definition: "In a dense model, every parameter activates for every input — like a factory where every worker clocks in regardless of the job. A 1.8-trillion-parameter dense model would use all 1.8 trillion parameters to process even a trivial query, making it impractically expensive. MoE solves this by activating only a small fraction of parameters per input.",
  },
  {
    term: "Expert",
    definition: "Unlike the everyday meaning, an 'expert' here isn't a person — it's a small sub-network within a larger model that specializes in certain kinds of inputs. In a Mixture-of-Experts model, each token gets routed to 1–2 experts out of dozens or hundreds. One expert might handle code, another math, another poetry.",
  },
  {
    term: "Gating function",
    definition: "A gating function is a small network that acts as a dispatcher: for each incoming token, it scores all available experts and routes the token to the top-scoring ones. Given the token 'derivative,' the gating function might route it to the math expert and skip the poetry expert.",
  },
  {
    term: "Expert collapse",
    definition: "Expert collapse is a training failure where the gating function learns to send all tokens to the same few experts, leaving most experts unused. This defeats the purpose of MoE — you pay the memory cost of storing many experts but get the benefit of only a few.",
  },
  {
    term: "Load balancing",
    definition: "If some experts receive most tokens while others sit idle, MoE wastes capacity and risks expert collapse. Load balancing adds incentives during training to distribute tokens evenly across all experts, so each one develops useful specializations.",
  },
  {
    term: "Auxiliary loss",
    altTerms: ["Auxiliary losses"],
    definition: "In ML, 'loss' isn't about losing something — it's a score measuring how wrong the model is. An auxiliary loss is an extra penalty added alongside the main training objective to enforce a specific behavior, like distributing tokens evenly across experts in MoE to prevent expert collapse.",
  },
];
