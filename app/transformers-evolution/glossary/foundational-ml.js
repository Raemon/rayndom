// Foundational ML concepts — bottom of the dependency graph.
// See ../claude-glossary.md for writing guidelines.
export const entries = [
  {
    term: "Perceptron",
    definition: "The first trainable neural model (1958) — a single layer of weights that can classify linearly separable patterns.",
  },
  {
    term: "Backpropagation",
    altTerms: ["Backprop"],
    definition: "Algorithm that computes gradients of the loss w.r.t. every weight by applying the chain rule layer by layer.",
  },
  {
    term: "Chain rule",
    definition: "Calculus rule for derivatives of composed functions: d(f(g(x)))/dx = f'(g(x))·g'(x). The mathematical foundation of backprop.",
  },
  {
    term: "Gradient",
    altTerms: ["Gradients"],
    definition: "The derivative of the loss function with respect to a weight; indicates the direction and magnitude to adjust it.",
  },
  {
    term: "Gradient descent",
    definition: "Optimization algorithm that iteratively adjusts weights in the direction that reduces the loss function.",
  },
  {
    term: "Loss function",
    definition: "A mathematical function measuring how wrong the model's predictions are; training minimizes this.",
  },
  {
    term: "Hidden layer",
    altTerms: ["Hidden layers"],
    definition: "A neural network layer between input and output whose learned representations are not directly observed.",
  },
  {
    term: "Hidden state",
    altTerms: ["Hidden states"],
    definition: "An internal vector updated at each timestep, serving as the network's working memory of past inputs.",
  },
  {
    term: "Feedforward",
    definition: "A neural network architecture where data flows in one direction (input to output) with no recurrent connections.",
  },
  {
    term: "Activation function",
    definition: "A non-linear function (ReLU, sigmoid, etc.) applied after each layer, enabling the network to learn non-linear patterns.",
  },
  {
    term: "Sigmoid",
    definition: "S-shaped activation function squashing values to (0, 1), used in LSTM gates and binary classification.",
  },
  {
    term: "Linearly separable",
    definition: "Data that can be perfectly divided by a hyperplane — the fundamental limit of single-layer networks like the perceptron.",
  },
  {
    term: "XOR",
    definition: "Exclusive OR — a classic logic function that is not linearly separable, proving perceptrons have fundamental limits.",
  },
  {
    term: "End-to-end training",
    definition: "Training the entire model jointly from raw input to final output, rather than optimizing components separately.",
  },
  {
    term: "AI winter",
    definition: "Periods (1970s, late 1980s–90s) of reduced funding and interest in AI, triggered by unmet hype and theoretical critiques.",
  },
  {
    term: "Weight update rule",
    definition: "If wrong, adjust weights by adding/subtracting the input vector. Provably converges for linearly separable data.",
  },
  {
    term: "Threshold function",
    definition: "Output 1 if weighted sum exceeds threshold, else 0. The simplest activation.",
  },
];
