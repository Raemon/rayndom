export const entry = {
  year: 2015,
  name: "Residual Networks (Skip Connections)",
  diag: "resnet",
  oneLiner: "Shortcut wires that let networks go deeper",
  problem: `A natural intuition says a deeper network should be at least as powerful as a shallower one — in the worst case, extra layers could simply pass data through unchanged. In practice, the opposite happened: adding more layers degraded accuracy even on training data. This wasn't overfitting — it was an optimization failure called the degradation problem.

He et al.'s solution was the skip connection — an architectural pattern where, instead of each layer learning the full desired output H(x), it only learns the residual F(x) = H(x) − x, and the layer's output is F(x) + x. The "+ x" is a direct wire from input to output, bypassing the layer entirely. If the optimal behavior for a layer is "do nothing," it just needs to learn F(x) = 0, which is far easier than learning H(x) = x. This simple change made training 100+ layer networks feasible, and is now a structural component of every Transformer block.`,
  whyNotSooner: `Highway Networks (2015, Schmidhuber) introduced gated skip connections months earlier, but required learned gating parameters. He et al.'s insight was that parameter-free identity shortcuts worked better — simpler was superior. That adding layers could hurt optimization took careful empirical work to diagnose.`,
  whoInvented: `Srivastava, Greff, Schmidhuber (3), 2014 - 2015, 1 year.
He, Zhang, Ren, Sun (4), 2014 - 2015, 1 year.`,
  examples: "ResNet-50,GPT-4",
};
