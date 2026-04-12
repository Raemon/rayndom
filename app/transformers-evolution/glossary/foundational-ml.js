// Foundational ML concepts — bottom of the dependency graph.
// See ../claude-glossary.md for writing guidelines.
export const entries = [
  {
    term: "Perceptron",
    definition: "The perceptron is a trainable decision unit from 1958 that maps a list of numbers to yes-or-no by multiplying each input by a learned weight, summing, and comparing to a threshold — an early way to let a machine learn a rule from examples instead of programming it by hand.\n\nIt only works when the two classes can be separated by a straight line (or flat surface in higher dimensions); many real patterns violate that, which exposed limits of single-layer models.\n\nExample: classify emails as spam or not using counts of words like \"free\" and \"winner\"; if the weighted sum crosses the threshold, output spam.",
  },
  {
    term: "Backpropagation",
    altTerms: ["Backprop"],
    definition: "Backpropagation is an algorithm that computes how much each weight in a multi-layer network contributed to the final error, layer by layer from output back toward input, so training can adjust every connection.\n\nBefore efficient backprop became standard (popularized around 1986), training deep stacks of layers was impractical: there was no systematic way to assign blame for a wrong answer to thousands of internal knobs.\n\nExample: the network outputs 0.2 for \"dog\" when the label was \"cat\"; backprop propagates that mistake backward so weights that pushed toward \"dog\" get nudged down and weights that would raise \"cat\" get nudged up.",
  },
  {
    term: "Chain rule",
    definition: "The chain rule is a calculus tool that says how a small change at an early step changes a later step when steps are composed: multiply the local sensitivities along the path.\n\nNeural nets are chains of functions (layer after layer); backpropagation applies the chain rule repeatedly so each weight learns how it affected the loss.\n\nExample: final loss depends on layer 3, which depends on layer 2, which depends on weight w in layer 1; the chain rule combines ∂loss/∂layer3 × ∂layer3/∂layer2 × ∂layer2/∂w to get the update direction for w.",
  },
  {
    term: "Gradient",
    altTerms: ["Gradients"],
    definition: "A gradient is a vector of partial derivatives that reports how fast the loss changes as you nudge each weight — which direction decreases error and how steep the slope is there.\n\nPicture standing on a hillside in fog: the gradient at your feet points downhill; training uses that direction (or its negative, depending on convention) to step toward lower loss.\n\nExample: if raising weight w₁ slightly increases loss a lot but raising w₂ barely matters, the gradient has a large component for w₁ and a small one for w₂, so the optimizer moves w₁ more.",
  },
  {
    term: "Gradient descent",
    definition: "Gradient descent is a training loop that measures how wrong the model is, computes the gradient of the loss with respect to every weight, and moves each weight a small step along that direction, repeating until the loss stops improving meaningfully.\n\nIt turns \"find good weights\" into repeated local improvements rather than guessing all parameters at once.\n\nExample: start with random weights, run one batch of images through the net, get average loss 2.4, take one step using the gradient so loss on the next batch drops toward 2.1, and continue for thousands of steps.",
  },
  {
    term: "Loss function",
    definition: "In ML, \"loss\" does not mean something disappeared — it is a single number scoring how wrong the model's outputs are on an example or batch, and the loss function is the recipe that computes that number from predictions and labels.\n\nTraining minimizes this score (or its average over data) by adjusting weights.\n\nExample: for classification, if the model assigns 0.8 probability to the wrong class, the loss is high; if it assigns 0.99 to the correct class, the loss is low.",
  },
  {
    term: "Hidden layer",
    altTerms: ["Hidden layers"],
    definition: "A hidden layer is a stack of learned computations between the network's inputs and outputs — not chosen by hand feature-by-feature, but filled in by training so intermediate representations capture structure the task needs.\n\nWithout hidden layers, many problems stay impossible; with them, the network can build hierarchical features.\n\nExample: in image digits, one hidden layer might combine edges into loops and lines; the next combines those into digit parts; the output layer reads those parts into a digit label.",
  },
  {
    term: "Hidden state",
    altTerms: ["Hidden states"],
    definition: "A hidden state is a vector of numbers a recurrent model updates each time it consumes another item in a sequence, acting as a compact running summary of what it has seen so far.\n\nThe name \"hidden\" means it is internal, not a direct input or final prediction.\n\nExample: reading \"The bank by the river ...\", after \"river\" the hidden state encodes that \"bank\" likely means shoreline; that state is passed forward when the model reads the next word.",
  },
  {
    term: "Feedforward",
    definition: "A feedforward network is an architecture where activations move in one direction only — input layer to output through intermediate layers — with no cycles, so the same datum never passes through a node twice in one forward pass.\n\nContrast this with recurrent models, which feed prior outputs back in for the next timestep.\n\nExample: classify a fixed-size vector of patient vitals: layer 1 transforms vitals, layer 2 transforms those features, the output layer emits \"high risk\" or \"low risk\" with no loop.",
  },
  {
    term: "Activation function",
    definition: "An activation function is a nonlinear map applied to each neuron's summed input before it leaves a layer, so stacking layers can represent curved boundaries instead of collapsing to a single linear map.\n\nWithout nonlinear activations, ten linear layers in a row behave like one linear layer.\n\nExample: ReLU replaces negative values with zero and leaves positives unchanged, so the network can turn regions of input space on or off; sigmoid squashes a score to between 0 and 1 for a probability-like output.",
  },
  {
    term: "Sigmoid",
    definition: "Sigmoid is an S-shaped function that maps any real number to the open interval (0,1), turning an unbounded score into a bounded \"strength\" or probability-like value.\n\nIt was a standard choice before ReLU became common for inner layers.\n\nExample: the model emits raw score 3.2 for \"keep this memory\"; sigmoid turns it into about 0.96, interpreted as \"mostly keep.\"",
  },
  {
    term: "Linearly separable",
    definition: "Linearly separable data is data you can split into two classes with a single straight line in 2D, a flat plane in 3D, or the higher-dimensional analogue — one linear decision boundary.\n\nMany interesting datasets fail this test, which is why multi-layer networks matter.\n\nExample: red points in the upper-left and blue points in the lower-right of a chart are linearly separable by a diagonal line; red in two opposite corners with blue in the other two corners is not.",
  },
  {
    term: "XOR",
    definition: "XOR (exclusive OR) is the logical rule: true when exactly one of two inputs is true, false when both are true or both are false.\n\nA single-layer threshold network cannot represent XOR in 2D because no straight line separates the four corner points of the truth table; that impossibility result (often tied to Minsky and Papert, 1969) helped cool early perceptron hype.\n\nExample: inputs (0,1) and (1,0) should output 1; inputs (0,0) and (1,1) should output 0.",
  },
  {
    term: "End-to-end training",
    definition: "End-to-end training optimizes every stage from raw input to final output with one objective and one learning procedure, so intermediate representations are learned rather than hand-piped between separate modules.\n\nThe alternative is a pipeline of handcrafted steps each tuned on its own.\n\nExample: speech recognition learns filters, phoneme-like units, and word predictions jointly from waveforms to transcript, instead of fixing a hand-built phoneme detector and only training the last stage.",
  },
  {
    term: "AI winter",
    definition: "An AI winter is a stretch of years when AI research funding, hiring, and public optimism collapse after earlier hype outran what models could deliver.\n\nThe phrase borrows \"winter\" metaphorically — a cold season for the field, not weather forecasting.\n\nExample: after bold 1960s claims, limited results on real tasks and the XOR limitation narrative contributed to reduced support in the 1970s; a similar trough hit after expert-system hype in the late 1980s and early 1990s.",
  },
  {
    term: "Weight update rule",
    definition: "A weight update rule is the perceptron's learning prescription: after each mistake, nudge weights so the same input would move the summed score toward the correct side of the threshold.\n\nIt is an early, explicit error-correction scheme rather than gradient descent on a smooth loss.\n\nExample: the true label is \"yes\" but the unit said \"no\"; increase weights on inputs that were 1 and decrease the bias so the next time that pattern fires, the sum crosses the threshold.",
  },
  {
    term: "Threshold function",
    definition: "A threshold function is a decision rule: add weighted inputs (plus bias), compare the sum to a cutoff, output one value if above and another if below — the binary switch at the heart of a classical perceptron.\n\nIt turns a weighted vote into a hard yes/no.\n\nExample: if 0.7×feature_A + 0.3×feature_B − 0.5 > 0, output class 1; otherwise output class 0.",
  },
];
