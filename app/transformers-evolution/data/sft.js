export const entry = {
  year: "2021–22",
  name: "Instruction Tuning (SFT)",
  diag: "sft",
  oneLiner: "Teach the model to follow instructions",
  problem: `A pre-trained language model has absorbed enormous knowledge from its training data, but it was trained to predict the next word — not to be helpful. Ask it "What is the capital of France?" and it will likely continue with more trivia questions rather than answering "Paris." The model treats every input as text to continue, not as an instruction to follow. The knowledge is there, but there's no reliable way to access it.

Instruction tuning (also called Supervised Fine-Tuning, or SFT) solves this by training the model on thousands of (instruction, ideal response) pairs across diverse task types — question answering, summarization, translation, coding, creative writing. The training uses standard supervised learning (the same loss function used in pre-training), but the data explicitly demonstrates what "following an instruction" looks like. The key insight: training on a diverse set of tasks teaches the model the general pattern of instruction-following, so it generalizes to new instruction types it has never seen. This was also shown to be the essential first step before RLHF — without SFT, reinforcement-learning-based alignment largely fails.`,
  whyNotSooner: `Required large enough base models that had latent capabilities worth unlocking. Earlier fine-tuning was task-specific (one model per task). The insight that diverse multi-task instruction data could produce a general-purpose assistant was not obvious — it contradicted the "specialist beats generalist" intuition.`,
  examples: "FLAN (Google 2021),InstructGPT SFT stage,Alpaca,Vicuna,Every chat model's first training stage",
};
