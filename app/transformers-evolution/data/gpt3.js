export const entry = {
  year: 2020,
  name: "GPT-3 / Few-Shot In-Context Learning",
  diag: "gpt3",
  oneLiner: "Show a few examples in the prompt; no retraining",
  problem: `Even with GPT-2's surprising zero-shot abilities, practical tasks still typically required fine-tuning — collecting labeled data and running additional training. This was a significant barrier: fine-tuning requires ML expertise, compute resources, and a fresh dataset for every new task.

GPT-3 (175B parameters, over 100x GPT-2) demonstrated in-context learning: you place a few examples of the desired task directly in the prompt — say, three pairs of "English: ... French: ..." translations — and the model continues the pattern correctly for new inputs. No weight updates occur; the model "learns" the task purely from the examples provided in a single forward pass. This is called few-shot prompting. The mechanism is still not fully understood — the model appears to implicitly run a learning algorithm during inference. This capability scales with model size; smaller models cannot do it reliably.`,
  whyNotSooner: `In-context learning is an emergent property of scale — smaller models can't do it. The $4.6M training cost was inaccessible to most. The idea that a forward pass could implicitly implement a learning algorithm was not anticipated.`,
  examples: "GPT-3 via API; foundation for ChatGPT,Copilot,The entire LLM application ecosystem",
};
