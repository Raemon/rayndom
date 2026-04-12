export const entry = {
  year: 2019,
  name: "GPT-2 / Zero-Shot Transfer",
  diag: "gpt2",
  oneLiner: "Scale up and tasks emerge without training",
  problem: `After GPT-1 proved that pre-training followed by fine-tuning worked, a natural question arose: does making the model bigger just give proportionally better results, or does something qualitatively different happen?

GPT-2, with 1.5 billion parameters (10x larger than GPT-1), revealed something unexpected: the model could perform tasks it was never fine-tuned for. Given a prompt like "Translate English to French:" followed by an English sentence, it produced reasonable translations — with zero task-specific training. This zero-shot transfer suggested that raw scale might substitute for task-specific engineering. The model was trained on the exact same objective (predict the next word), just with more parameters and more data.`,
  whyNotSooner: `The compute was feasible only for well-funded labs. The intellectual leap — that raw scale could substitute for task-specific engineering — also contradicted prevailing wisdom.`,
  howInvented: `GPT-2 was invented mostly by scaling the GPT recipe much harder, then carefully testing whether new behaviors appeared without fine-tuning; zero-shot transfer turned out to be the surprise. Independent convergence: only 1 group clearly demonstrated this exact jump first, though roughly 3 big labs were broadly converging on "just scale the language model" around the same time.`,
  examples: "GPT-2,AI Dungeon",
};
