export const entry = {
  year: "2020–21",
  name: "Mixture of Experts (MoE)",
  diag: "moe",
  oneLiner: "Only activate a fraction of the network per input",
  problem: `In a standard ("dense") Transformer, every parameter is used for every input token. If a model has 70 billion parameters, all 70 billion are involved in processing the word "the." The computational cost (measured in FLOPS — floating-point operations) scales directly with total parameter count. To make a model smarter, you need proportionally more compute per token — an expensive trade-off.

Mixture of Experts breaks this link between total parameters and per-token cost. Instead of one large feed-forward network in each Transformer layer, MoE uses several smaller "expert" sub-networks. A gating function (a small learned router) examines each token and sends it to just 1–2 of the available experts. A model can have, say, 8x7B = 56B total parameters but only activate 7B per token — the same cost as a regular 7B model, but with access to far more specialized knowledge. The engineering challenge is load-balancing: making sure all experts get used roughly equally, so no expert is wasted and no expert is overloaded.`,
  whyNotSooner: `MoE was proposed in 1991 (Jacobs et al.). Shazeer et al. (2017) demonstrated it at scale with LSTMs, but the engineering challenges — load-balancing on distributed hardware, preventing expert collapse, and communication overhead — delayed widespread adoption. It took Switch Transformer (2021) and modern infrastructure with auxiliary losses to make it reliable in production Transformers.`,
  examples: "Mixtral 8x7B,GPT-4 (rumored MoE),DeepSeek-V3,Grok-1,Gemini 1.5",
};
