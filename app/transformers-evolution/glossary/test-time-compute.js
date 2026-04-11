// Test-time compute concepts.
// See ../claude-glossary.md for writing guidelines.
export const entries = [
  {
    term: "Test-time compute",
    definition: "Normally, a model answers in a single forward pass — one shot, fixed cost. Test-time compute is the strategy of spending additional computation during inference to improve quality: generating multiple reasoning chains, verifying each step, and backtracking on errors. Like a student who checks their exam answers before submitting, instead of writing each answer once and moving on.",
  },
  {
    term: "Self-verification",
    definition: "Self-verification is when a model pauses mid-reasoning to check whether its own steps make sense — like re-reading a math proof to catch sign errors before continuing. After computing '17 × 23 = 391,' the model might multiply back to verify before building on that result.",
  },
  {
    term: "Backtracking",
    definition: "Unlike the everyday sense of retracing your steps, backtracking here means the model detects a flaw in its reasoning chain and abandons that path to try a different approach. If a model attempts a proof by contradiction and reaches an invalid step, it might restart with a direct proof instead.",
  },
];
