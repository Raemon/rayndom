export const entry = {
  year: 2020,
  name: "Vision Transformer (ViT)",
  diag: "vit",
  oneLiner: "Treat images as sequences of patches",
  problem: `Computer vision had been dominated for nearly a decade by Convolutional Neural Networks (CNNs). CNNs have strong built-in assumptions about images — called inductive biases: their filters are local (looking at small patches), translation-invariant (the same filter works everywhere), and hierarchically structured (early layers detect edges, later layers detect objects). These assumptions are correct and helpful, but they also mean the architecture is specialized for spatial data and can't easily transfer to other domains.

The Vision Transformer (ViT) asked: what if you just treat an image like a sentence? It splits an image into a grid of patches (e.g., 16x16 pixel squares), flattens each patch into a vector, and feeds the sequence of patch vectors into a standard Transformer — the same architecture used for text. With no built-in spatial knowledge, ViT needs large datasets to learn spatial relationships from scratch. But given enough data, it matched or exceeded CNNs, proving the Transformer is a general-purpose sequence processor, not just a language model.`,
  whyNotSooner: `CNNs were extremely well-optimized and entrenched. ViT required large-scale datasets (JFT-300M) to overcome the lack of spatial inductive bias. The leap of "just flatten patches into a sequence" seemed too simplistic.`,
  examples: "CLIP,DALL·E,Stable Diffusion,Segment Anything (SAM),DINOv2",
};
