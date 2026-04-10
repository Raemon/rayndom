export const entry = {
  year: 2022,
  name: "Compute-Optimal Scaling (Chinchilla)",
  diag: "chinchilla",
  problem: `By 2022, the prevailing strategy for building better language models was to make them as large as possible: GPT-3 had 175 billion parameters, and labs were racing to build even bigger ones. The assumption was that more parameters = better performance. Data was treated as relatively cheap and abundant. GPT-3 was trained on 300 billion tokens — roughly 1.7 tokens per parameter.

Hoffmann et al. at DeepMind discovered this was drastically wrong. By training over 400 models at different sizes and data amounts, they mapped out a scaling law — a mathematical relationship showing that for any fixed compute budget, there is an optimal balance between model size and training data. The formula says roughly 20 tokens per parameter is optimal, meaning GPT-3 was undertrained by more than 10x. Their 70B-parameter "Chinchilla" model, trained on 1.4 trillion tokens, outperformed a 280B-parameter model (Gopher) using the same total compute. This reshaped the field: subsequent open models like Llama followed Chinchilla's ratio, prioritizing data quantity over model size.`,
  whyNotSooner: `Required training dozens of models at multiple scales and fitting precise scaling curves — experiments costing millions of dollars that only DeepMind could run. The result contradicted the "bigger model = better" intuition that drove GPT-3. Also required careful statistical methodology to disentangle model size from data size effects.`,
  examples: "Chinchilla (70B),Llama 1 (65B on 1.4T tokens),Llama 2/3,Reshaped all open-source model training",
};
