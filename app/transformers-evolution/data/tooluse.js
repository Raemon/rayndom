export const entry = {
  year: "2023–24",
  name: "Function Calling & Tool Use",
  diag: "tooluse",
  oneLiner: "Models that call APIs and run code, not just talk",
  problem: `No matter how capable, a language model fundamentally just produces text. It can write code but not run it. It can describe a web search but not perform one. It can recommend a file edit but not execute it. The boundary between "thinking" and "acting" required a human to bridge.

Function calling gave models a structured way to request actions: output a JSON object specifying which tool to invoke and with what arguments, then receive the result as new context. Combined with a ReAct-style loop — reason about what to do, act via a tool call, observe the result, repeat — this turned LLMs from text generators into agents that can interact with the world.

The key enablers were reliable structured output and instruction following. Without near-perfect JSON formatting, tool calls fail silently — a malformed function call doesn't produce a helpful error, it just does the wrong thing. The difference between 95% and 99.5% reliability in structured output is the difference between an unusable system and a practical one, because agentic tasks chain multiple steps and errors compound: 95% per step over 10 steps gives only 60% end-to-end success.`,
  whyNotSooner: `Required models good enough at structured output and instruction following that tool calls succeed reliably. Earlier models produced malformed JSON too often. Also required the conceptual shift from treating LLMs as text generators to treating them as action-taking agents.`,
  examples: "ChatGPT plugins (2023),GPT-4 function calling,Claude tool use,Gorilla",
};
