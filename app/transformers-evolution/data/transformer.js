export const entry = {
  year: 2017,
  name: "The Transformer",
  diag: "transformer",
  oneLiner: "Process all words at once, not one by one",
  problem: `RNNs and LSTMs processed tokens one at a time — each step's computation depended on the previous step's result. Modern GPUs excel at parallel computation, but sequential processing leaves most of the GPU idle. Training on long sequences was extremely slow, and even with LSTMs, information from distant tokens was diluted.

The Transformer ("Attention Is All You Need," Vaswani et al.) replaced sequential recurrence entirely with self-attention — a pattern where every token directly computes a relationship score with every other token, all at once. Each token is projected into three vectors: a query ("what am I looking for?"), a key ("what do I contain?"), and a value ("what information do I carry?"). Attention scores are computed as dot products between queries and keys, scaled and passed through softmax to get weights, then used to produce a weighted sum of values. This runs in parallel across all positions.

The original architecture was an encoder-decoder model designed for machine translation. Subsequent work split it: GPT used only the decoder (for generation), BERT used only the encoder (for understanding). To compensate for removing sequential processing (which inherently encodes word order), the Transformer adds positional encodings — fixed signals injected into the input that tell the model where each token sits. Each Transformer block also uses residual connections (the skip connections from ResNet) and layer normalization (a numerical stabilization technique) to keep training stable.`,
  whyNotSooner: `The core math (scaled dot-product attention) was simple. The breakthrough was architectural boldness — entirely removing recurrence when LSTMs were state-of-the-art. It also required sufficient GPU memory for the O(n²) attention matrix, and cultural inertia of the RNN paradigm delayed the leap.`,
  howInvented: `The Transformer was invented inside Google's translation work by asking what happens if attention stops being an add-on and becomes the whole sequence model; the answer was self-attention plus residuals and positional encodings, with recurrence removed entirely. Independent convergence: 1 paper was clearly first, but about 2 broader groups were drifting toward attention-heavy sequence models at the same time.`,
  examples: "GPT-1,GPT-4",
};
