export const entry = {
  year: 2022,
  name: "Chain-of-Thought Prompting",
  diag: "cot",
  oneLiner: "Ask the model to think step by step",
  problem: `When given a math problem like "60 mph for 2.5 hours," LLMs trained to produce answers directly often fail. A Transformer allocates the same amount of computation per output token regardless of difficulty — no mechanism for working through intermediate steps.

Chain-of-thought prompting showed that simply asking the model to "think step by step" — or providing examples that include intermediate reasoning — dramatically improved accuracy on math, logic, and multi-step problems. By producing intermediate tokens ("60 x 2.5 = 150, so the answer is 150 miles"), the model effectively gets more serial compute: each token generation step becomes a "thinking" step that decomposes the problem. This required no architectural change and no retraining — just a different prompt. It revealed that LLMs can reason more accurately when given the "space" to work through problems sequentially, token by token.`,
  whyNotSooner: `Researchers treated LLMs as Q&A systems rather than reasoning systems that could benefit from "thinking out loud." The prompting paradigm itself was new.`,
  examples: "All frontier model prompting; formalized in o1/o3,Claude reasoning mode",
};
