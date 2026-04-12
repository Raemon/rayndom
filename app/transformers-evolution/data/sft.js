export const entry = {
  year: "2021",
  name: "Instruction Tuning (SFT)",
  diag: "sft",
  oneLiner: "Teach the model to follow instructions",
  problem: `A pre-trained language model was trained to predict the next word — not to be helpful. Ask "What is the capital of France?" and it will likely continue with more trivia questions rather than answering "Paris." The knowledge is there, but there's no reliable way to access it.

Instruction tuning (also called Supervised Fine-Tuning, or SFT) solves this by training the model on thousands of (instruction, ideal response) pairs across diverse task types — question answering, summarization, translation, coding, creative writing. The training uses standard supervised learning (the same loss function used in pre-training), but the data explicitly demonstrates what "following an instruction" looks like. The key insight: training on a diverse set of tasks teaches the model the general pattern of instruction-following, so it generalizes to new instruction types it has never seen. This was also shown to be the essential first step before RLHF — without SFT, reinforcement-learning-based alignment largely fails.`,
  whyNotSooner: `Earlier fine-tuning was task-specific (one model per task), and required large enough base models with latent capabilities worth unlocking. The insight that diverse multi-task instruction data could produce a general-purpose assistant contradicted the "specialist beats generalist" intuition.`,
  howInvented: `Instruction tuning was invented by reframing fine-tuning itself: instead of one dataset per task, collect many tasks in a shared instruction-response format and train one model to imitate the whole mixture. Independent convergence: about 2 major groups landed on the same idea early — Google's FLAN line and OpenAI's InstructGPT/SFT pipeline, with many follow-on replications quickly confirming it.`,
  examples: "FLAN (Google 2021),InstructGPT SFT stage",
};
