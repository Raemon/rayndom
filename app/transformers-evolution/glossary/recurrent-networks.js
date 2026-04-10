// Recurrent network concepts (RNNs, LSTMs).
// See ../claude-glossary.md for writing guidelines.
export const entries = [
  {
    term: "Recurrence",
    definition: "Feeding a network's output back as input at the next timestep, creating a loop that carries state across time.",
  },
  {
    term: "RNN",
    altTerms: ["RNNs", "Recurrent neural network", "Recurrent neural networks", "Recurrent net"],
    definition: "Recurrent Neural Network — processes sequences by maintaining a hidden state that feeds back at each timestep.",
  },
  {
    term: "BPTT",
    altTerms: ["Backpropagation through time"],
    definition: "Backpropagation Through Time — unrolling a recurrent net across timesteps and applying the chain rule.",
  },
  {
    term: "Vanishing gradient",
    definition: "Gradients shrink toward zero as they pass through many layers or timesteps, halting learning in deep networks.",
  },
  {
    term: "Constant error carousel",
    definition: "The LSTM's cell state pathway that allows gradients to flow unchanged across many timesteps, preventing vanishing gradients.",
  },
  {
    term: "LSTM",
    altTerms: ["LSTMs"],
    definition: "Long Short-Term Memory — a gated recurrent network with a cell state that captures long-range dependencies.",
  },
  {
    term: "Gated cell state",
    definition: "A memory vector controlled by learned sigmoid gates that regulate what information to store, forget, or output.",
  },
];
