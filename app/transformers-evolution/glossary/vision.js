// Vision and multimodal concepts.
// See ../claude-glossary.md for writing guidelines.
export const entries = [
  {
    term: "CNN",
    altTerms: ["CNNs"],
    definition: "A Convolutional Neural Network processes images by sliding small learned filters across the pixel grid, detecting local patterns like edges, textures, and shapes. Each layer builds on the last: early filters find edges, middle layers combine them into eyes or wheels, deep layers recognize whole objects. CNNs dominated computer vision from 2012 until Vision Transformers began replacing them around 2020.",
  },
  {
    term: "Inductive bias",
    altTerms: ["Inductive biases"],
    definition: "An inductive bias is a built-in assumption an architecture makes about the structure of its data. CNNs assume nearby pixels matter more than distant ones (spatial locality), which helps them learn efficiently from images but makes them poorly suited for text. Choosing the right inductive bias can dramatically reduce how much training data a model needs.",
  },
  {
    term: "Image patches",
    definition: "Transformers process sequences of tokens, not grids of pixels — so to use a Transformer on images, you first chop the image into a grid of fixed-size tiles (e.g., 16×16 pixels). Each patch is flattened into a vector and treated as a 'token,' letting the Transformer apply the same attention mechanism it uses for words.",
  },
  {
    term: "ViT",
    definition: "Vision Transformer (ViT) applies a standard Transformer to images by splitting them into patches and treating each patch like a word token. Unlike CNNs, which are hard-wired to look at local neighborhoods, ViT can learn to relate any patch to any other patch from the start — trading built-in spatial assumptions for raw flexibility and scale.",
  },
  {
    term: "CLIP",
    definition: "CLIP (Contrastive Language-Image Pre-training) learns to place images and text descriptions into the same embedding space, so 'a photo of a dog' and an actual dog photo end up as nearby vectors. Trained on 400 million image-text pairs from the internet, CLIP can recognize categories it was never explicitly trained on by comparing image embeddings to text descriptions.",
  },
  {
    term: "Cross-modal reasoning",
    definition: "Cross-modal reasoning is the ability to combine understanding across different input types — like answering 'What breed is this dog?' by analyzing an image with language understanding. The model connects visual features (floppy ears, spotted coat) to textual knowledge (Dalmatian).",
  },
  {
    term: "Visual encoder",
    altTerms: ["Visual encoders"],
    definition: "A visual encoder is a model (typically a Vision Transformer) that converts raw pixel data into the vector format a language model understands. It acts as a translator: the language model can't process pixels directly, so the visual encoder converts an image into a sequence of embedding vectors the model can reason about alongside text.",
  },
  {
    term: "Multimodal",
    definition: "A multimodal model can process and relate multiple types of input — text, images, audio, video — within a single system. GPT-4V can look at a photo of a fridge and suggest recipes based on the visible ingredients, combining visual understanding with culinary knowledge.",
  },
  {
    term: "Embedding space",
    definition: "An embedding space is a coordinate system where concepts are represented as points (vectors), positioned so that similar meanings are near each other. In multimodal models, images and text share the same embedding space — a photo of a sunset and the phrase 'a beautiful sunset' end up as nearby points, enabling the model to compare and relate them.",
  },
];
