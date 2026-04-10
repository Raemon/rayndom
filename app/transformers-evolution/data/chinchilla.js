export const entry = {
  year: 2022,
  name: "Compute-Optimal Scaling (Chinchilla)",
  diag: "chinchilla",
  oneLiner: "More data beats bigger models per compute dollar",
  problem: `The Kaplan scaling laws showed that performance improves predictably with scale — but their prescription was to invest almost entirely in model size. Labs followed this advice: GPT-3 had 175 billion parameters trained on just 300 billion tokens (roughly 1.7 tokens per parameter), and the race was on to build even bigger models. Data was treated as cheap and abundant; parameters were the scarce resource worth maximizing.

Hoffmann et al. at DeepMind discovered this ratio was drastically wrong. By training over 400 models at different sizes and data amounts, they found that for any fixed compute budget, the optimal balance is roughly 20 tokens per parameter — meaning GPT-3 was undertrained by more than 10x. Their 70B-parameter "Chinchilla" model, trained on 1.4 trillion tokens, outperformed a 280B-parameter model (Gopher) using the same total compute. This reshaped the field: subsequent open models like Llama followed Chinchilla's ratio, prioritizing data quantity over model size.`,
  whyNotSooner: `Required training dozens of models at multiple scales and fitting precise scaling curves — experiments costing millions of dollars that only DeepMind could run. The result contradicted the "bigger model = better" intuition that drove GPT-3. Also required careful statistical methodology to disentangle model size from data size effects.`,
  examples: "Chinchilla (70B),Llama 1 (65B on 1.4T tokens),Llama 2/3,Reshaped all open-source model training",
};
