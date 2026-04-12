export const entry = {
  year: 1997,
  name: "Long Short-Term Memory (LSTM)",
  diag: "lstm",
  oneLiner: "Networks that remember across long sequences",
  problemOneLiner: `RNN gradients vanished over long spans, so gated cell-state memory preserved signal across many timesteps.`,
  problem: `The root cause is the vanishing gradient problem — during backpropagation through time, gradients are multiplied at each timestep. If those values are consistently less than 1, the gradient shrinks exponentially — after 20 steps, 0.9²⁰ ≈ 0.12; after 100 steps, effectively zero. The network simply cannot learn that a word from 50 steps ago matters now.

The LSTM solved this by introducing a cell state — a separate memory vector that runs through time via addition rather than multiplication, acting as a "constant error carousel" that preserves gradients. Three gates — each a small neural network outputting values between 0 and 1 — control information flow: the forget gate decides what to erase from memory, the input gate decides what new information to write, and the output gate decides what to expose at each step. Because the cell state is updated by addition, gradients can flow through hundreds of timesteps without vanishing.`,
  whyNotSoonerOneLiner: `The fix required the non-obvious idea of a linear memory path controlled by multiplicative gates.`,
  whyNotSooner: `Hochreiter's 1991 diploma thesis identified the vanishing gradient problem, but the solution required the insight that a linear self-connection (the cell state) could be modulated by multiplicative gates. Hardware limitations also meant that the LSTM's higher per-step cost relative to simple RNNs was a serious concern in 1997.`,
  examples: "Google Translate (2016),Siri,Alexa voice models,OpenAI Sentiment Neuron (2017)",
};
