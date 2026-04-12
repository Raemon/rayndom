// Mixture of Experts (MoE) concepts.
// See ../claude-glossary.md for writing guidelines.
export const entries = [
  {
    term: "Dense model",
    definition: "A dense model is one where every weight in the main layers participates in the forward pass for every token — there is no routing that turns subsets off per example.\n\nAt trillion-parameter scale, full denseness is often impractical for latency and energy: you would touch every parameter on each query. Sparse or mixture-of-experts designs keep a large total parameter count on disk but activate only a slice per token.\n\nA 1.8T-parameter dense transformer would use all 1.8T active parameters to complete \"Hello\"; an MoE cousin might touch only tens of billions per token while others stay idle for that forward pass.",
  },
  {
    term: "Expert",
    definition: "In mixture-of-experts models, an expert is a sub-network (often a feed-forward MLP block) that the model may invoke for some tokens but not others — not a human specialist.\n\nMany experts live in parallel; a router sends each token to one or a few experts, so different tokens can use different internal \"specialists.\" Total parameters sum across experts, but per-token cost stays closer to the size of the activated subset.\n\nDuring one sentence, tokens in a code block might route mostly to experts that learned bracket-heavy patterns, while tokens in a poem route elsewhere, even though the user sees one unified stream of text.",
  },
  {
    term: "Gating function",
    definition: "The gating function scores each expert for the current token and picks the top one or few, deciding who processes that activation.\n\nIt is a learned dispatcher: small networks or linear layers output logits, softmax or top-k chooses experts, and only those experts run their heavy matrices. Training shapes gates so useful experts win for the right patterns.\n\nOn the token \"def\" inside a Python file, the gate might assign high weight to expert 7 and low weight to expert 22; only expert 7's MLP runs for that position, saving compute versus running all experts.",
  },
  {
    term: "Expert collapse",
    definition: "Expert collapse is a failure mode where the router sends almost all tokens to the same one or two experts, so the rest never learn and you pay memory for unused capacity.\n\nIt can happen if gradients reinforce a rich-get-richer gate or if auxiliary balancing signals are too weak. The system degenerates toward a dense sub-network plus dead parameters.\n\nAfter a few thousand steps you might see 95% of tokens hit expert 0 while experts 1–63 log near-zero utilization — throughput looks like a small dense model but checkpoint size still lists dozens of experts.",
  },
  {
    term: "Load balancing",
    definition: "Load balancing in MoE training means encouraging the router to spread tokens across experts so compute, memory bandwidth, and learned capacity are used evenly.\n\nHardware is sized for a per-layer expert budget; if one expert hoards tokens, that path becomes a bottleneck and others waste SRAM or HBM reserved for their weights. Training objectives often add terms or tricks so each expert sees a fair share over a batch.\n\nA batch of 1M tokens might target ~1M/64 tokens per expert on average; imbalance penalties push the gate away from sending 800k tokens to expert 0 and sprinkling the remainder.",
  },
  {
    term: "Auxiliary loss",
    altTerms: ["Auxiliary losses"],
    definition: "In machine learning, loss is a number the optimizer tries to lower to measure wrongness; an auxiliary loss is an extra term added to the main objective to enforce a side constraint.\n\nMoE training often adds a small auxiliary loss on router statistics so experts receive similar token counts, fighting collapse without removing the primary next-token loss. The hyperparameter weight trades task quality against balance.\n\nThe model might minimize cross-entropy on the next word plus 0.01 times a penalty when expert usage variance is high, so the gate learns both good predictions and even load.",
  },
];
