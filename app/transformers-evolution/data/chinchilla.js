export const entry = {
  year: 2022,
  name: "Compute-Optimal Scaling (Chinchilla)",
  diag: "chinchilla",
  oneLiner: "More data beats bigger models per compute dollar",
  problem: `The Kaplan scaling laws showed that performance improves with scale — but prescribed investing almost entirely in model size. GPT-3 had 175B parameters trained on just 300B tokens (roughly 1.7 tokens per parameter). Data was treated as cheap; parameters were the scarce resource.

Hoffmann et al. at DeepMind discovered this ratio was drastically wrong. By training over 400 models at different sizes and data amounts, they found that for any fixed compute budget, the optimal balance is roughly 20 tokens per parameter — meaning GPT-3 was undertrained by more than 10x. Their 70B-parameter "Chinchilla" model, trained on 1.4 trillion tokens, outperformed a 280B-parameter model (Gopher) using the same total compute. This reshaped the field: subsequent open models like Llama followed Chinchilla's ratio, prioritizing data quantity over model size.`,
  whyNotSooner: `Training dozens of models at multiple scales and fitting precise scaling curves cost millions of dollars — experiments only DeepMind could run. Careful statistical methodology was needed to disentangle model size from data size effects.`,
  whoInvented: `Hoffmann, Borgeaud, Mensch, Sifre (22)
2021 - 2022, 1 year.

Kaplan, McCandlish, Henighan (10)
2019 - 2020, 1 year.

Roughly 32 people across these groups were studying language-model scaling; about 10 were on Kaplan-style scaling laws directly adjacent to the compute–data question.`,
  examples: "Chinchilla (70B),Llama 1 (65B on 1.4T tokens)",
};
