// Test-time compute concepts.
// See ../claude-glossary.md for writing guidelines.
export const entries = [
  {
    term: "Test-time compute",
    definition: "Test-time compute is deliberate extra processing at inference—after training is done—to raise answer quality, used when a single greedy forward pass is too brittle for hard or high-stakes tasks.\n\nTraining fixes weights; test-time methods spend more FLOPs or wall-clock on one user query: sampling several drafts, checking them, or searching over partial solutions. Unlike wider models, this cost hits only when the question is hard.\n\nExample: on a competition math problem, the system might generate five independent solution outlines, run a cheap verifier on each, and return the one whose intermediate algebra checks out—burning more GPU seconds than a one-shot answer.",
  },
  {
    term: "Self-verification",
    definition: "Self-verification is when the model evaluates its own intermediate claims before continuing—used to catch slip-ups that a single forward pass would bake into the final line.\n\nIt is not human grading; the same model (or a paired checker head) asks whether a sub-result is consistent with prior steps or with a quick recomputation.\n\nExample: after writing \"17 × 23 = 391\" inside a budget story, the model multiplies 391 ÷ 23 and checks it lands near 17 before using 391 in downstream totals—if the check fails, it revises the multiply step.",
  },
  {
    term: "Backtracking",
    definition: "In search and reasoning—not the everyday sense of walking backward—backtracking means abandoning a partial solution when a contradiction or dead end appears, then trying another branch.\n\nSequential text generation often commits token by token; backtracking-style inference explicitly unwinds bad prefixes instead of persisting with a flawed chain.\n\nExample: a proof attempt assumes x is even and derives a parity clash on line five; the controller discards that branch and retries assuming x is odd, rather than forcing the rest of the proof from the broken state.",
  },
];
