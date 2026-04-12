export const entry = {
  year: "2024",
  name: "Test-Time Compute / Thinking Models",
  diag: "ttc",
  oneLiner: "Let models think harder on harder problems",
  problem: `A standard LLM uses exactly the same amount of computation for every query — the same number of matrix multiplications whether you ask "What's 2+2?" or "Prove this theorem." The model cannot "think harder" about hard problems.

Test-time compute scaling lets models allocate additional computation to harder problems during inference (not during training — hence "test-time"). The model generates extended reasoning chains — long sequences of intermediate thoughts, self-verification steps ("let me check that..."), and backtracking ("that approach doesn't work, let me try..."). This is trained using reinforcement learning with process reward models — neural networks that evaluate the quality of each intermediate reasoning step, not just the final answer. The result: models can spend 10x more compute on a difficult math proof than on a simple factual question, dynamically matching effort to difficulty.`,
  whyNotSooner: `Training models to reliably use extra compute required new RL-based regimes and process reward models evaluating intermediate steps. The training signal for good reasoning is much harder to obtain than for simple next-word prediction.`,
  examples: "OpenAI o1/o3,DeepSeek-R1",
};
