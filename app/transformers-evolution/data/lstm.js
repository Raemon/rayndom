export const entry = {
  year: 1997,
  name: "Long Short-Term Memory (LSTM)",
  diag: "lstm",
  oneLiner: "Networks that remember across long sequences",
  problem: `RNNs had the vanishing gradient problem — during backpropagation through time, gradients are multiplied at each timestep. If those values are consistently less than 1, the gradient shrinks exponentially — after 20 steps, 0.9²⁰ ≈ 0.12; after 100 steps, effectively zero. The network simply cannot learn that a word from 50 steps ago matters now.

The LSTM solved this by introducing a cell state — a separate memory vector that runs through time via addition rather than multiplication, acting as a "constant error carousel" that preserves gradients. Three gates — each a small neural network outputting values between 0 and 1 — control information flow: the forget gate decides what to erase from memory, the input gate decides what new information to write, and the output gate decides what to expose at each step. Because the cell state is updated by addition, gradients can flow through hundreds of timesteps without vanishing.`,
  whyNotSooner: `Hochreiter's 1991 diploma thesis identified the vanishing gradient problem, but the solution required the insight that a linear self-connection (the cell state) could be modulated by multiplicative gates. Hardware limitations also meant that the LSTM's higher per-step cost relative to simple RNNs was a serious concern in 1997.`,
  howInvented: `Hochreiter and Schmidhuber invented LSTM by explicitly designing around the vanishing-gradient failure: preserve a linear memory path, then regulate it with gates. Independent convergence: essentially 1 main group produced the key idea, with later variants refining it rather than discovering it separately.`,
  examples: "Siri,Google Translate (2016)",
};
