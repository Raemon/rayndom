export const entry = {
  year: 1986,
  name: "Recurrent Neural Networks (RNNs)",
  diag: "rnn",
  oneLiner: "Networks that remember what came before",
  problem: `Feedforward networks processed each input independently — they had no notion of order. Feed in the word "bank" and the network has no idea whether it appeared after "river" or "savings." For tasks like speech or language, where meaning depends on what came before, this was a fundamental limitation.

Recurrent Neural Networks added a loop: at each timestep, the network takes two inputs — the current data and its own output from the previous step. This previous output is called the hidden state — a vector of numbers acting as "working memory." The formula is: h_t = f(W·x_t + U·h_{t-1}), where h_t is the new hidden state, x_t is the current input, and W and U are learned weight matrices. This gives the network short-term memory across a sequence.

The limitation was practical: training requires "unrolling" the loop across all timesteps and running backpropagation through the full chain (called BPTT — Backpropagation Through Time). Over more than ~10–20 steps, gradients either vanish (shrink to near-zero) or explode (grow uncontrollably), making it impossible to learn long-range dependencies.`,
  whyNotSooner: `Jordan networks (1986) introduced feedback connections, and Elman networks (1990) popularized the simple recurrent architecture. But training required BPTT — the insight that unrolling a recurrence over time creates a very deep feedforward network — which Werbos formalized in 1988. Limited compute also constrained experimentation — training even small RNNs on meaningful sequences was slow.`,
  whoInvented: `feedback network theorists (12), 1982 - 1990, 8 years.
Elman, Jordan (2), 1986 - 1990, 4 years.
Werbos BPTT (1), 1988 - 1989, 1 year.`,
  examples: "Early speech recognition,Time series prediction",
};
