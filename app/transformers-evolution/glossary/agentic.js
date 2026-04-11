// Agentic tool use concepts.
// See ../claude-glossary.md for writing guidelines.
export const entries = [
  {
    term: "Function calling",
    definition: "Function calling is a capability where the model outputs a structured request — like {tool: 'web_search', query: 'weather in Tokyo'} — that external code can execute on its behalf. This lets the model take real-world actions: searching the web, running code, querying databases, or calling APIs.",
  },
  {
    term: "Sandboxed execution",
    definition: "When an AI agent runs code or calls external tools, errors or malicious outputs could damage the host system. Sandboxed execution runs these actions in an isolated environment — like a quarantine room — so a buggy script can't delete files or access sensitive data outside its container.",
  },
  {
    term: "Re-planning",
    definition: "Re-planning is when an agent revises its strategy based on what actually happened in previous steps. If an agent's web search returns no results, it might reformulate the query or switch to reading local documentation instead of retrying the same approach.",
  },
  {
    term: "Structured output",
    definition: "Structured output is model-generated text in a machine-readable format (like JSON or XML) rather than free-form prose. Downstream tools need to parse the model's response reliably — a function call like {tool: 'calculator', expression: '2+2'} is usable by code; 'try adding two and two' is not.",
  },
  {
    term: "Context-reset loop",
    definition: "LLM context windows are finite, so long-running agents eventually run out of room. A context-reset loop solves this by starting fresh sessions periodically, persisting important state to files (like notes or git commits) rather than relying on conversation history to carry everything forward.",
  },
  {
    term: "Agent scaffolding",
    definition: "A raw language model can generate text but can't browse the web, remember past sessions, or manage multi-step plans on its own. Agent scaffolding is the engineering infrastructure — prompt templates, tool permissions, memory systems, planning loops — built around a model to turn it into a reliable autonomous agent.",
  },
  {
    term: "ReAct",
    definition: "ReAct (Reasoning + Acting) is a pattern where the model alternates between thinking through a problem and taking actions in the world. For example: think 'I need the current stock price' → call a search API → think 'the price is $150, now I can calculate the portfolio value' → call a calculator.",
  },
  {
    term: "Persistent memory",
    definition: "An agent's conversation context disappears when the session ends, so anything learned is lost. Persistent memory solves this by writing important information to files (like MEMORY.md) that survive across sessions, letting the agent recall past decisions without re-learning them.",
  },
];
