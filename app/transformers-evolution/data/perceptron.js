export const entry = {
  year: 1958,
  name: "The Perceptron",
  diag: "perceptron",
  oneLiner: "A program that learns from examples, not rules",
  problem: `Handwritten rules could not scale, so the perceptron learned weighted decision boundaries directly from examples.

Before 1958, if you wanted a machine to recognize a handwritten letter, you had to write out every rule yourself. There was no way for a machine to learn patterns from data on its own.

The perceptron introduced trainable weights — a set of numbers, one per input, that the machine adjusts automatically. The math is simple: multiply each input by its weight, sum them up, and check if the total exceeds a threshold. If the answer is wrong, nudge the weights toward the correct answer. The weights are the learned knowledge, and they update from data — no human rule-writing required.

The fatal limitation: a perceptron can only draw a straight line to separate categories (this property is called "linear separability"). If the data needs a curved boundary — or even something as simple as XOR ("true when exactly one input is on") — a single perceptron cannot learn it. This limit, proven mathematically by Minsky and Papert in 1969, froze the field for over a decade.`,
  whyNotSooner: `The needed neuron math, learning rules, and even barely adequate hardware were only just appearing.

McCulloch-Pitts' mathematical neuron model (1943) and Hebb's learning principle (1949) were prerequisites. The idea that a machine could learn from examples was radical, and available hardware (the Mark I Perceptron was electromechanical) barely sufficed for even single-layer experiments.`,
  examples: "Mark I Perceptron (hardware),Character recognition prototypes,Historical foundations of all neural networks",
};
