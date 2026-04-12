// Agentic tool use concepts.
// See ../claude-glossary.md for writing guidelines.
export const entries = [
  {
    term: "Function calling",
    definition: "Function calling is a contract where the model emits a structured request—function name and JSON arguments—that host code runs and feeds back, used so language models can trigger real tools instead of only describing them in prose.\n\n\"Call\" here is the programming sense (invoke a subroutine), not a phone call. The runtime parses the blob, executes `web_search` or `run_sql`, and returns strings the model reads on the next turn.\n\nExample: the user asks for live weather; the model outputs `{ \"name\": \"weather_api\", \"arguments\": { \"city\": \"Tokyo\" } }`; your server calls the API and appends \"22°C, light rain\" to the conversation for the model to summarize.",
  },
  {
    term: "Sandboxed execution",
    definition: "Sandboxed execution is running agent-chosen code or shell commands inside an isolated environment, used so mistakes, exploits, or experimental scripts cannot read private keys or wipe the developer laptop.\n\nThe sandbox might be a container, VM, or WASM runtime with no network, read-only filesystem, or strict egress rules—different from running `python` directly on the host.\n\nExample: the agent writes a data-cleaning script on uploaded CSVs; it runs inside Docker with no mount to `/home/user/Documents`, so a bug in `rm -rf` destroys only the temp workspace.",
  },
  {
    term: "Re-planning",
    definition: "Re-planning is revising the remaining steps after new observations, used when the first plan assumed facts that tool outputs proved false.\n\nStatic plans treat the world as frozen; agents that browse APIs or files must loop: act, read result, update the todo list.\n\nExample: the plan was \"search docs site → extract API key format\"; the search returns 404; the agent drops that branch, opens the local `README.md` via a file tool, and continues from the discovered endpoint list.",
  },
  {
    term: "Structured output",
    definition: "Structured output is model text constrained to machine-parseable shapes like JSON or XML, used so orchestrators and tools can route actions without regex-guessing free-form chat.\n\nProse like \"I'll use the calculator now\" is ambiguous; a schema-valid blob `{ \"tool\": \"calc\", \"expr\": \"2+2\" }` lets code dispatch reliably.\n\nExample: a booking bot must return `{ \"intent\": \"reserve\", \"date\": \"2026-04-12\", \"party_size\": 2 }`; the UI reads fields directly instead of NLP-extracting from \"Sounds good for Tuesday for two!\"",
  },
  {
    term: "Context-reset loop",
    definition: "A context-reset loop is a pattern where an agent periodically starts a fresh chat window while persisting state outside the model, used because context windows are finite and long traces drown early instructions.\n\nImportant artifacts—summaries, open files, git commits—live on disk or in a database; each new session loads a compact brief instead of the full megatoken history.\n\nExample: after fifty tool calls researching a repo, the harness writes `NOTES.md` with decisions, opens a new session with only that file plus the task header, and continues implementation without re-sending every prior stack trace.",
  },
  {
    term: "Agent scaffolding",
    definition: "Agent scaffolding is the non-model software around an LLM—prompts, tool registries, permission checks, planners, memory stores—that turns chat completion into a dependable autonomous workflow.\n\nThe raw transformer predicts tokens; scaffolding decides when to stop, which JSON schema to emit, and how to retry failures.\n\nExample: a coding agent wraps the model with a fixed system prompt listing allowed shell commands, a loop that applies patches with `git apply`, and a rule that re-runs tests after each edit—those pieces are scaffolding, not weights inside the network.",
  },
  {
    term: "ReAct",
    definition: "ReAct is an interleaved pattern of short natural-language reasoning steps and concrete tool actions—Reasoning + Acting—used so the model explains intent, calls an API, reads the result, then reasons again.\n\nIt contrasts with silent tool use where the trace is opaque blobs only.\n\nExample: trace reads \"Need 2024 revenue; search EDGAR\" → `search_filings(AAPL)` → \"Found 10-K; extract net sales\" → `read_pdf_page(37)` → \"Answer: $394B\"—each Thought line is reasoning, each Action line is a tool call.",
  },
  {
    term: "Persistent memory",
    definition: "Persistent memory is durable storage outside the chat transcript—files, vector DBs, key-value stores—used so an agent remembers facts across sessions after the GPU context is cleared.\n\nEveryday \"memory\" can mean human recall; here it is whatever survives reboots: append-only logs, embedding indexes, or hand-authored note files the agent is instructed to update.\n\nExample: session one ends after choosing Postgres over SQLite; the agent writes `DECISIONS.md`; session two loads only that file and skips re-debating the database because the constraint is now on disk.",
  },
];
