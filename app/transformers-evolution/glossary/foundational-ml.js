// Foundational ML concepts — bottom of the dependency graph.
// See ../claude-glossary.md for writing guidelines.
export const entries = [
  {
    term: "Perceptron",
    definition: "The first trainable AI model (1958) — a single unit that takes in numbers, multiplies each by a learned weight, and outputs a yes-or-no decision. It can only solve problems where the categories can be separated by a straight line, which turned out to be a severe limitation.",
  },
  {
    term: "Backpropagation",
    altTerms: ["Backprop"],
    definition: "The algorithm that lets neural networks learn. After the network makes a prediction, backprop works backward through each layer, calculating how much each weight contributed to the error and nudging it in the right direction. Before this technique (popularized 1986), there was no efficient way to train networks with more than one layer.",
  },
  {
    term: "Chain rule",
    definition: "A rule from calculus for computing how a change ripples through a sequence of steps. If step A feeds into step B, the chain rule tells you how a small tweak in A's input affects B's output. Backpropagation uses this to trace how each weight in a multi-layer network affects the final error.",
  },
  {
    term: "Gradient",
    altTerms: ["Gradients"],
    definition: "A value that tells you which direction to adjust a weight to reduce error, and by how much. Think of standing on a foggy hillside: the gradient tells you which way is downhill and how steep the slope is. During training, each weight gets a gradient pointing toward less error.",
  },
  {
    term: "Gradient descent",
    definition: "The core training loop for neural networks: measure how wrong the model is, compute which direction to adjust each weight to reduce the error, and take a small step in that direction. Repeating this thousands or millions of times is how models learn.",
  },
  {
    term: "Loss function",
    definition: "In ML, 'loss' doesn't mean something is missing — it's a score measuring how wrong the model's prediction was. The loss function computes this score, and the entire goal of training is to make it as small as possible. If the model predicts 80% chance of 'cat' but the answer was 'dog,' the loss is high.",
  },
  {
    term: "Hidden layer",
    altTerms: ["Hidden layers"],
    definition: "A layer of calculations between a network's input and output that the designer never directly sees or prescribes — it discovers useful patterns on its own during training. Adding hidden layers is what lets networks learn complex tasks that a single input-to-output layer cannot.",
  },
  {
    term: "Hidden state",
    altTerms: ["Hidden states"],
    definition: "A network's internal memory — a bundle of numbers that gets updated as it reads each item in a sequence. Think of it as a running summary: after processing each word, the hidden state captures what the network 'remembers' so far, carrying context forward through the sequence.",
  },
  {
    term: "Feedforward",
    definition: "A network architecture where data flows in one direction — from input, through processing layers, to output — with no loops. Like an assembly line: each stage processes the data and passes it forward, never circling back.",
  },
  {
    term: "Activation function",
    definition: "A mathematical function applied after each layer that lets the network learn complex, curved patterns instead of only straight-line relationships. Without it, stacking layers would be no better than one layer. Common ones include ReLU (keep positive values, zero out negatives) and sigmoid (squash any number to between 0 and 1).",
  },
  {
    term: "Sigmoid",
    definition: "A function that squashes any number into a value between 0 and 1, producing an S-shaped curve. Useful whenever the network needs to output a probability or a 'how much' dial — for example, deciding '73% of this memory should be kept.'",
  },
  {
    term: "Linearly separable",
    definition: "Data that can be split into categories by drawing a straight line (or flat surface in higher dimensions). If you can separate red dots from blue dots with a ruler on a page, they're linearly separable. Many real-world patterns are not, which is why we need multi-layer networks.",
  },
  {
    term: "XOR",
    definition: "Exclusive OR — a logic operation that outputs 'true' when exactly one of two inputs is true (not both, not neither). A single-layer network cannot learn XOR because the pattern can't be split with a straight line. This was proven in 1969 and helped trigger the first AI winter.",
  },
  {
    term: "End-to-end training",
    definition: "Training the entire model as one unit from raw input to final output, letting it figure out every intermediate step on its own. The alternative — hand-designing separate stages and optimizing each independently — was standard before deep learning made end-to-end approaches practical.",
  },
  {
    term: "AI winter",
    definition: "Periods in AI history (1970s, late 1980s–90s) when funding dried up and researchers left the field. Each winter followed a hype cycle: bold predictions about imminent human-level AI, then the reality that the technology wasn't ready yet.",
  },
  {
    term: "Weight update rule",
    definition: "The rule a perceptron uses to learn from mistakes: when it predicts wrong, adjust the weights to make the correct answer more likely next time. If the answer should have been 'yes,' increase the weights for the inputs that were active; if 'no,' decrease them.",
  },
  {
    term: "Threshold function",
    definition: "The simplest decision rule: add up all the weighted inputs, and if the total exceeds a set cutoff, output 1 (yes); otherwise output 0 (no). Like a vote: if enough evidence accumulates past a threshold, the answer flips to 'yes.'",
  },
];
