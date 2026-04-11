// Attention and Transformer architecture concepts.
// See ../claude-glossary.md for writing guidelines.
export const entries = [
  {
    term: "Attention",
    definition: "In ML, 'attention' isn't a general state of focus — it's a mechanism that lets a model selectively weight which parts of the input matter most for each output. Like highlighting the most relevant sentences in a textbook when answering a specific question, rather than re-reading every word equally.",
  },
  {
    term: "Self-attention",
    definition: "A form of attention where each word in a sequence looks at every other word in the same sequence to determine context. For 'The cat sat on the mat because it was tired,' self-attention helps 'it' figure out that it refers to 'cat' by comparing every word against every other word.",
  },
  {
    term: "Multi-head",
    definition: "A single attention function can only capture one type of relationship at a time. Multi-head attention runs several in parallel — one head might learn grammar, another might track what 'it' refers to, another might capture meaning similarity.",
  },
  {
    term: "Attention matrix",
    definition: "The N×N grid of scores showing how strongly each token attends to every other token. For a 10-word sentence, this is a 10×10 table where each cell says 'how relevant is word j when processing word i.'",
  },
  {
    term: "Scaled dot-product attention",
    definition: "The core attention formula: softmax(QK^T / √d) · V. Each token's query is compared against all keys via dot product to get relevance scores, which are scaled down to prevent extreme values, then used to take a weighted average of values.",
  },
  {
    term: "Softmax",
    definition: "A function that converts a list of raw scores into probabilities that sum to 1, with larger scores getting proportionally more weight. For example, scores [2, 5, 1] become roughly [0.05, 0.93, 0.02] — the highest score dominates.",
  },
  {
    term: "Dot product",
    definition: "A way to measure how similar two lists of numbers are: multiply matching pairs and add the results. In attention, a high dot product between a query and key means 'these vectors point in a similar direction,' signaling relevance.",
  },
  {
    term: "Encoder",
    definition: "The half of a model that reads input and compresses it into a rich internal representation. Like a translator who first reads and fully understands a French paragraph before starting to write the English version.",
  },
  {
    term: "Decoder",
    definition: "The half of a model that generates output one piece at a time, often consulting the encoder's representation. Like the translator now writing the English paragraph word-by-word, frequently referring back to their understanding of the French original.",
  },
  {
    term: "Encoder-decoder",
    definition: "An architecture that pairs an encoder (reads and understands input) with a decoder (generates output), connected so the decoder can refer back to the encoder's representation. Used for tasks like translation: the encoder processes the source language, the decoder produces the target.",
  },
  {
    term: "Transformer encoder",
    definition: "A Transformer using only the encoder half, reading input bidirectionally — each token can attend to tokens both before and after it. Used in BERT for tasks like classification and fill-in-the-blank, where the full input is available upfront.",
  },
  {
    term: "Transformer decoder",
    definition: "A Transformer using only the decoder half, reading left-to-right — each token can only attend to earlier tokens, never future ones. Used in GPT for text generation, where the model predicts one token at a time.",
  },
  {
    term: "Layer normalization",
    definition: "Without normalization, activations in deep networks can drift to extreme values during training, causing instability. Layer normalization rescales each layer's outputs to a consistent range, like recalibrating instruments between measurements to keep readings comparable.",
  },
  {
    term: "Positional encoding",
    altTerms: ["Positional encodings"],
    definition: "Unlike RNNs, which process words in order, Transformers see all words simultaneously and have no built-in sense of sequence. Positional encodings are signals added to each token to tell the model 'this is the 1st word, this is the 5th word,' restoring word-order information.",
  },
  {
    term: "Residual connection",
    altTerms: ["Residual connections"],
    definition: "Deep networks often get worse as you add layers because error signals degrade passing through many transformations. A residual connection bypasses a layer by adding its input directly to its output, creating a shortcut that lets gradients flow straight through.",
  },
  {
    term: "Skip connection",
    definition: "A pathway that routes a layer's input directly to its output, bypassing the layer's computation. This gives the network a 'free pass' — if a layer isn't helping, the signal can skip past it unchanged. Also called a shortcut connection.",
  },
  {
    term: "Residual learning",
    definition: "Instead of asking a layer to learn the full desired output H(x), ask it to learn only the difference F(x) = H(x) − x. This is easier to optimize because the default (F=0) does nothing rather than something random, letting the network start from a sensible baseline.",
  },
  {
    term: "Degradation problem",
    definition: "The surprising finding that stacking more layers on a network can make it perform worse — not from overfitting, but because optimization breaks down. A 56-layer network had higher training error than a 20-layer one, which motivated the invention of residual connections.",
  },
];
