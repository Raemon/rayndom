// Recurrent network concepts (RNNs, LSTMs).
// See ../claude-glossary.md for writing guidelines.
export const entries = [
  {
    term: "Recurrence",
    definition: "A design where a network feeds its output back as input at the next step, like reading a sentence word-by-word while keeping a running mental summary. Each step updates the summary with new information, letting the network handle sequences of any length.",
  },
  {
    term: "RNN",
    altTerms: ["RNNs", "Recurrent neural network", "Recurrent neural networks", "Recurrent net"],
    definition: "Recurrent Neural Network — a network that processes ordered sequences (text, audio, time series) one element at a time, passing forward a summary of what it's seen so far. Unlike networks that take fixed-size input all at once, RNNs can handle sequences of any length by looping.",
  },
  {
    term: "BPTT",
    altTerms: ["Backpropagation through time"],
    definition: "Backpropagation Through Time — how RNNs learn from sequences. Since an RNN loops through timesteps, training requires 'unrolling' the loop into a chain and tracing how each timestep's error flows backward through the entire sequence.",
  },
  {
    term: "Vanishing gradient",
    definition: "When training deep or recurrent networks, error signals travel backward through many layers to update early weights. These signals shrink exponentially at each step — like a game of telephone, the feedback becomes too faint to drive learning long before it reaches the beginning.",
  },
  {
    term: "Constant error carousel",
    definition: "The core trick inside an LSTM: a dedicated pathway that carries information forward through time without multiplying by weights at each step. Like a conveyor belt, signals pass through unchanged, so gradients can flow back across hundreds of timesteps without vanishing.",
  },
  {
    term: "LSTM",
    altTerms: ["LSTMs"],
    definition: "Long Short-Term Memory — an RNN variant designed to fix the vanishing gradient problem. Standard RNNs forget information after ~10–20 steps; LSTMs add a gated memory cell that can preserve, update, or clear information across hundreds of timesteps.",
  },
  {
    term: "Gated cell state",
    definition: "A memory vector inside an LSTM controlled by learned gates that decide what to remember, forget, and output. Like a notebook with an eraser — at each step, the gates choose which old notes to keep, which to erase, and what new information to write down.",
  },
];
