export const entry = {
  year: 2019,
  name: "GPT-2 / Zero-Shot Transfer",
  diag: "gpt2",
  oneLiner: "Scale up and tasks emerge without training",
  problem: `After GPT-1 proved that pre-training followed by fine-tuning worked, a natural question arose: does making the model bigger just give proportionally better results, or does something qualitatively different happen?

GPT-2, with 1.5 billion parameters (10x larger than GPT-1), revealed something unexpected: the model could perform tasks it was never fine-tuned for. Given a prompt like "Translate English to French:" followed by an English sentence, it produced reasonable translations — with zero task-specific training. This zero-shot transfer suggested that raw scale might substitute for task-specific engineering. The model was trained on the exact same objective (predict the next word), just with more parameters and more data.`,
  whyNotSooner: `The compute was feasible only for well-funded labs. The intellectual leap — that raw scale could substitute for task-specific engineering — also contradicted prevailing wisdom.`,
  whoInvented: `Radford, Wu, Child (6)
2018 - 2019, 1 year.

Raffel, Shazeer, Roberts (9)
2018 - 2020, 2 years.

large LM scaling labs (20)
2018 - 2020, 2 years.

Roughly 35 people across these groups were scaling generative LMs; about 29 worked on large-LM or unified-text-to-text lines alongside GPT-2-scale efforts.`,
  examples: "GPT-2,AI Dungeon",
};
