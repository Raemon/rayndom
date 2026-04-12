export const entry = {
  year: 2020,
  name: "Scaling Laws (Kaplan et al.)",
  diag: "scalinglaws",
  oneLiner: "Predictable math links size to performance",
  problem: `Before 2020, training a large language model was largely guesswork: researchers chose a model size, gathered data, and trained until results looked good. There was no principled way to predict how a model would perform before spending millions of dollars. The relationship between model size, dataset size, compute budget, and final performance was unknown.

Kaplan et al. at OpenAI discovered that language model performance follows smooth power laws — simple mathematical relationships where loss decreases as a predictable function of the number of parameters, the amount of training data, and the total compute spent. On a log-log plot, these relationships are straight lines, meaning you can extrapolate: if training a 1B model gives you X loss, you can estimate what a 10B model will achieve before building it.

This transformed model development from an empirical art into something closer to engineering. Labs could now plan training runs rationally: given a fixed compute budget, the scaling laws prescribed an optimal model size. This predictability justified the hundred-million-dollar investments behind GPT-3 and its successors. However, the paper's specific recommendations about how to allocate compute between model size and data turned out to be significantly wrong — a correction Chinchilla would later provide.`,
  whyNotSooner: `Training dozens of models at multiple scales and fitting precise curves was an experiment few labs could run. The idea that a simple power-law formula could predict performance of a system as complex as a language model was not obvious a priori.`,
  examples: "Kaplan et al. 'Scaling Laws for Neural Language Models' (2020),GPT-3",
};
