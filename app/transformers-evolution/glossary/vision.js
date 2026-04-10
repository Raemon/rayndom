// Vision and multimodal concepts.
// See ../claude-glossary.md for writing guidelines.
export const entries = [
  {
    term: "CNN",
    altTerms: ["CNNs"],
    definition: "Convolutional Neural Network — uses learned spatial filters to detect local patterns in images.",
  },
  {
    term: "Inductive bias",
    altTerms: ["Inductive biases"],
    definition: "Built-in assumptions about data structure baked into the architecture (e.g., CNNs assume spatial locality).",
  },
  {
    term: "Image patches",
    definition: "Splitting an image into fixed-size tiles (e.g., 16×16 pixels), each treated as a token for the Transformer.",
  },
  {
    term: "ViT",
    definition: "Vision Transformer — applies a standard Transformer to sequences of image patches instead of using convolutions.",
  },
  {
    term: "CLIP",
    definition: "Contrastive Language-Image Pre-training (2021) — aligns image and text embeddings in a shared space via contrastive learning.",
  },
  {
    term: "Cross-modal reasoning",
    definition: "Reasoning that spans multiple input types (e.g., answering questions about an image using text understanding).",
  },
  {
    term: "Visual encoder",
    altTerms: ["Visual encoders"],
    definition: "A ViT-based model converting pixel data into vector embeddings that a language model can process.",
  },
  {
    term: "Multimodal",
    definition: "Processing multiple modalities (text, images, audio) within a single model.",
  },
  {
    term: "Embedding space",
    definition: "The vector space where text and image representations coexist, enabling cross-modal comparison.",
  },
];
