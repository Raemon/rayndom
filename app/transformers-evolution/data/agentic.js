export const entry = {
  year: "2025",
  name: "Agentic Tool Use & Planning",
  diag: "agentic",
  oneLiner: "Models that act in loops: try, observe, adapt",
  problemOneLiner: `Models generated text but couldn't act, so agent loops let them call tools, observe results, and re-plan.`,
  problem: `No matter how capable, a language model fundamentally just produces a string of characters — any actual effect on the world requires a human to take action.

Agentic frameworks break this boundary by giving the model a loop: generate a tool call (a structured request, typically JSON, specifying which function to invoke and with what arguments), observe the result, and decide what to do next. The model might write code, execute it in a sandboxed environment (an isolated runtime that prevents unsafe operations), observe the output or error, and revise its approach. This is re-planning — adapting strategy based on observed outcomes, not just generating a fixed response.

The reason this only became practical in 2024 is reliability: agentic tasks chain multiple steps, and errors compound. If each step has 95% accuracy, a 10-step task succeeds only 60% of the time. Instruction following, structured output generation, and long context — all prerequisites — only reached sufficient quality in 2023.`,
  whyNotSoonerOneLiner: `Chained tool use needed near-perfect structured output, long context, and instruction following before loops were reliable.`,
  whyNotSooner: `Model capability — instruction following, structured output, long context — only reached sufficient quality in 2023. Reliable tool use requires ~99% per-step accuracy — 95% compounds to 60% over 10 steps. Safety infrastructure also needed to mature.`,
  examples: "Claude with tool use,ChatGPT Actions,Devin,Claude Code,Cursor,OpenAI Codex agent",
};
