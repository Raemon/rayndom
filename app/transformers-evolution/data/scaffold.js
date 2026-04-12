export const entry = {
  year: "2025",
  name: "Agent Scaffolding & Context Loops",
  diag: "scaffold",
  oneLiner: "Infrastructure for agents that work for hours",
  problem: `Once models could call tools, a new category of problems emerged — not in the model itself, but in the engineering around it. Three distinct failure modes became clear:

Context degradation: as an agent works, its context window fills with tool calls, observations, and reasoning traces. Performance degrades steadily — the model loses track of its plan, repeats itself, or fixates on early context. RALPH (context-reset loops) solved this by running the agent in a bash while-loop: each iteration starts with a fresh context window. State persists through files and git commits, not conversation history. The model reads updated source code, test output, and TODO files from disk each iteration. Files are memory, not the context window.

Dynamic prompt orchestration: a production agent needs different instructions for different situations — planning vs. editing vs. debugging. Claude Code's architecture (revealed in a 2026 source leak) assembles 40+ prompt fragments dynamically based on mode (Plan/Explore/Agent), active tools, and permission level. Key patterns include ULTRAPLAN (structured plan generation before acting), auto-compaction when context exceeds 200K tokens, and tiered tool permissions where read operations are safe but write operations require approval.

Persistent memory across sessions: most agents are stateless between sessions — each conversation starts from zero. OpenClaw introduced persistent file-based memory: SOUL.md (agent identity and personality), MEMORY.md (long-term facts learned from past sessions), and guardrails.md (lessons about what to avoid). Combined with a model-agnostic runtime, this enables agents that accumulate knowledge across runs rather than starting fresh each time.`,
  whyNotSooner: `Required tool-using models to be reliable enough that scaffolding — not model capability — became the bottleneck. RALPH emerged from practitioners running agents for hours and watching context degradation firsthand.`,
  examples: "RALPH/Ralphify,Cursor",
};
