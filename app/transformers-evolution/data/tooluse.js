export const entry = {
  year: "2023",
  name: "Function Calling & Tool Use",
  diag: "tooluse",
  oneLiner: "Models that call APIs and run code, not just talk",
  problem: `No matter how capable, a language model fundamentally just generates characters. It can write code but not run it, describe a web search but not perform one. The boundary between "thinking" and "acting" required a human to bridge.

Function calling gave models a structured way to request actions: output a JSON object specifying which tool to invoke and with what arguments, then receive the result as new context. Combined with a ReAct-style loop — reason about what to do, act via a tool call, observe the result, repeat — this turned LLMs from text generators into agents that can interact with the world.

The key enablers were reliable structured output and instruction following. Without near-perfect JSON formatting, tool calls fail silently — a malformed function call doesn't produce a helpful error, it just does the wrong thing. The difference between 95% and 99.5% reliability in structured output is the difference between an unusable system and a practical one, because agentic tasks chain multiple steps and errors compound: 95% per step over 10 steps gives only 60% end-to-end success.`,
  whyNotSooner: `Without near-perfect structured output formatting, tool calls fail silently. The conceptual shift from treating LLMs as text generators to action-taking agents was also required.`,
  examples: "ChatGPT plugins (2023),GPT-4 function calling,Claude tool use,Gorilla",
};
