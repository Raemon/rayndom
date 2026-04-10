export const entry = {
  year: 2019,
  name: "GPT-2 / Scaling Laws Emerge",
  diag: "gpt2",
  problem: `After GPT-1 proved that pre-training followed by fine-tuning worked, a natural question arose: does making the model bigger just give proportionally better results, or does something qualitatively different happen? The prevailing assumption was that bigger models would be incrementally better at the same tasks, still requiring the same fine-tuning process.

GPT-2, with 1.5 billion parameters (10x larger than GPT-1), revealed something unexpected: the model could perform tasks it was never fine-tuned for. Given a prompt like "Translate English to French:" followed by an English sentence, it produced reasonable translations — with zero task-specific training. This zero-shot transfer — the ability to perform tasks with no task-specific examples — suggested that raw scale might substitute for task-specific engineering. The model was trained on the exact same objective (predict the next word), just with more parameters and more data.`,
  whyNotSooner: `Compute was the binding constraint. Training GPT-2 required hundreds of GPU-days, feasible only for well-funded labs. The intellectual leap — that raw scale could substitute for task-specific engineering — contradicted prevailing wisdom.`,
  examples: "GPT-2 itself; proved the scaling hypothesis leading to GPT-3/4",
};
