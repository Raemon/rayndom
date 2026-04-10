// Attention and Transformer architecture concepts.
// See ../claude-glossary.md for writing guidelines.
export const entries = [
  {
    term: "Attention",
    definition: "Mechanism by which a model dynamically weights different input positions when producing each output element.",
  },
  {
    term: "Self-attention",
    definition: "Each token attends to every other token in the same sequence via queries, keys, and values.",
  },
  {
    term: "Multi-head",
    definition: "Running several attention functions in parallel, each learning to focus on different relationship patterns.",
  },
  {
    term: "Attention matrix",
    definition: "The N×N matrix of pairwise attention scores between all tokens in a sequence.",
  },
  {
    term: "Scaled dot-product attention",
    definition: "Core attention: softmax(QK^T / sqrt(d)) · V, where the scaling factor prevents vanishing gradients in softmax.",
  },
  {
    term: "Softmax",
    definition: "Function that converts a vector of raw scores (logits) into a probability distribution summing to 1.",
  },
  {
    term: "Dot product",
    definition: "Sum of element-wise products of two vectors; measures similarity between query and key vectors in attention.",
  },
  {
    term: "Encoder",
    definition: "Component that reads input and produces a sequence of hidden representations.",
  },
  {
    term: "Decoder",
    definition: "Component that generates output tokens one at a time, often attending to encoder representations.",
  },
  {
    term: "Encoder-decoder",
    definition: "Architecture pairing an encoder (reads input) with a decoder (generates output), connected via cross-attention.",
  },
  {
    term: "Transformer encoder",
    definition: "An encoder-only Transformer with no causal mask, attending bidirectionally — used in BERT.",
  },
  {
    term: "Transformer decoder",
    definition: "A decoder-only Transformer with causal masking for autoregressive generation — used in GPT.",
  },
  {
    term: "Layer normalization",
    definition: "Normalizing activations across features within each layer to stabilize training and improve convergence.",
  },
  {
    term: "Positional encoding",
    altTerms: ["Positional encodings"],
    definition: "Injected signals that tell the model where each token sits in the sequence.",
  },
  {
    term: "Residual connection",
    altTerms: ["Residual connections"],
    definition: "Adding the input of a sublayer to its output, creating a shortcut that eases gradient flow.",
  },
  {
    term: "Skip connection",
    definition: "Routing the input of a layer directly to its output, bypassing the layer's computation. Also called a shortcut connection.",
  },
  {
    term: "Residual learning",
    definition: "Instead of learning full output H(x), learn the difference F(x) = H(x) − x. Easier to optimize because the default (F=0) is identity.",
  },
  {
    term: "Degradation problem",
    definition: "Deeper networks have HIGHER training error than shallower ones — not overfitting but optimization failure.",
  },
];
