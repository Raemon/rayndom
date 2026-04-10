// Agentic tool use concepts.
// See ../claude-glossary.md for writing guidelines.
export const entries = [
  {
    term: "Function calling",
    definition: "Structured output (usually JSON) specifying which external tool or API to invoke with what arguments.",
  },
  {
    term: "Sandboxed execution",
    definition: "Running code or external tools in an isolated environment to prevent unintended side effects.",
  },
  {
    term: "Re-planning",
    definition: "Adjusting the action plan based on observed outcomes from previous tool-use steps.",
  },
  {
    term: "Structured output",
    definition: "Model output in a defined, parseable format (JSON, XML, function calls) rather than free-form text.",
  },
  {
    term: "Context-reset loop",
    definition: "Running an agent in repeated fresh sessions, persisting state through files/git rather than conversation context. Core pattern of RALPH.",
  },
  {
    term: "Agent scaffolding",
    definition: "Engineering infrastructure (prompt assembly, permissions, memory, planning) built around a model to create reliable autonomous agents.",
  },
  {
    term: "ReAct",
    definition: "Reasoning + Acting pattern: the model alternates between thinking steps and tool-use actions in a loop.",
  },
  {
    term: "Persistent memory",
    definition: "File-based state (SOUL.md, MEMORY.md) that survives across agent sessions, enabling cross-session learning.",
  },
];
