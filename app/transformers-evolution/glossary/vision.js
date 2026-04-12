// Vision and multimodal concepts.
// See ../claude-glossary.md for writing guidelines.
export const entries = [
  {
    term: "CNN",
    altTerms: ["CNNs"],
    definition: "A CNN is a neural network architecture that scans an image with small, learned filters that reuse the same weights across locations, building up from edges and textures to parts and whole objects.\n\nBefore transformers took over many benchmarks, CNNs were the standard for vision from roughly 2012 onward because the architecture bakes in \"nearby pixels belong together\" — less data hunger than treating every pixel independently. They still appear inside pipelines where local structure and efficiency matter.\n\nOn a 224×224 photo, an early layer might fire on vertical edges anywhere in the frame; deeper layers combine those signals into wheel-like or face-like patterns before a final class label.",
  },
  {
    term: "Inductive bias",
    altTerms: ["Inductive biases"],
    definition: "An inductive bias is a built-in assumption about how the world works that an architecture encodes so the model needs less data to learn the right patterns.\n\nCNNs bias toward spatial locality and translation; sequence models bias toward order along a line; a bare fully connected layer assumes less structure and often needs far more examples. The wrong bias hurts: locality helps photos but is a poor fit for shuffled pixels or pure language unless you add different structure.\n\nTwo networks with the same parameter count may learn equally well on text, but the CNN-shaped one struggles on raw text tokens while it sample-efficiently finds cats in photos because neighbors in an image really do correlate.",
  },
  {
    term: "Image patches",
    definition: "Image patches are fixed-size tiles (for example 16×16 pixels) cut from a picture and flattened into vectors so a Transformer can treat them like a sequence of tokens.\n\nStandard text Transformers expect a list of embeddings; raw pixels as millions of separate inputs would be unwieldy. Patching trades spatial resolution inside each tile for a manageable sequence length and lets self-attention relate distant regions.\n\nA 224×224 image with 16×16 patches yields a 14×14 = 196-token grid; each token carries a summary of one square of the scene instead of one pixel.",
  },
  {
    term: "ViT",
    definition: "A Vision Transformer (ViT) is a Transformer that classifies or encodes images by turning patch tokens into embeddings, adding position information, and running the same attention-and-MLP blocks used in language models.\n\nUnlike a CNN, which starts with local receptive fields, ViT can route information between any pair of patches from early layers — it buys flexibility and scales with data and model size, at the cost of weaker built-in spatial priors than convolutions.\n\nFor a street scene, early layers might mix patch tokens from sky, road, and signage in one attention operation; the final token or pooled representation feeds a label like \"intersection.\"",
  },
  {
    term: "CLIP",
    definition: "CLIP is a training recipe that aligns images and their text captions in one shared vector space so matching pairs are pulled together and unrelated pairs are pushed apart.\n\nIt was trained on hundreds of millions of image–text pairs scraped from the web, so the model maps \"a photo of a dog\" near dog pictures without a fixed list of ImageNet classes. At use time you can score an image against hand-written phrases for open-vocabulary recognition.\n\nYou embed the picture of your pet and the strings \"a golden retriever,\" \"a toaster,\" and \"a legal contract\"; cosine similarity ranks the dog phrase highest even if \"golden retriever\" never appeared as a formal class label during scraping.",
  },
  {
    term: "Cross-modal reasoning",
    definition: "Cross-modal reasoning is answering questions or taking actions that require jointly understanding two channels — typically vision plus language — not either alone.\n\nA text-only model cannot see pixels; an image-only model may not connect \"Dalmatian\" to firehouse culture. Multimodal systems fuse encoders (or a single network) so evidence from both modalities constrains the answer.\n\nGiven a photo of a rusted bolt and the question \"What size wrench do I likely need?\", the model uses thread appearance and visual scale cues together with language about fasteners to suggest a plausible range instead of guessing from text alone.",
  },
  {
    term: "Visual encoder",
    altTerms: ["Visual encoders"],
    definition: "A visual encoder converts raw image pixels into a sequence of vectors in the same mathematical form a language model already consumes, so one stack of layers can reason over both modalities.\n\nIt acts as eyes for the text stack: patch or CNN features become tokens with positions, sometimes with a learned projection into the transformer width. Without it, a pure LM has no path from RGB values to its embedding space.\n\nIn a chat-with-your-screenshot product, the encoder might output 576 patch vectors for a 512×512 image; the LM attends over those vectors while you ask \"What error does the stack trace show?\"",
  },
  {
    term: "Multimodal",
    definition: "A multimodal system accepts more than one input kind — image, audio, video, structured tables — and reasons across them inside one model or one tightly coupled pipeline.\n\nSingle-modal stacks excel at one medium; multimodal training aligns representations so, for example, \"red circle\" in text binds to red circular pixels. User-facing products then support uploads plus typing in the same thread.\n\nYou photograph an open refrigerator; the model names visible ingredients and suggests three dinners that use them, combining object recognition with culinary text knowledge in one response.",
  },
  {
    term: "Embedding space",
    definition: "An embedding space is a high-dimensional coordinate system where inputs (words, patches, sentences, images) become vectors arranged so that useful similarity in meaning matches geometric closeness.\n\n\"Distance\" is usually cosine similarity or dot product, not ruler distance in 3D. Multimodal models often map photo and caption into one space so retrieval and contrastive training can pair them.\n\nAfter encoding, the vector for a sunset photo sits nearer to the vector for the sentence \"orange sky over water\" than to the vector for \"quarterly earnings report,\" which enables search and classification without hand-crafted rules.",
  },
];
