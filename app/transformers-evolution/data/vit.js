export const entry = {
  year: 2020,
  name: "Vision Transformer (ViT)",
  diag: "vit",
  oneLiner: "Treat images as sequences of patches",
  problem: `Vision was tied to CNN priors, so ViT turned images into patch sequences for a standard Transformer.

Computer vision had been dominated for nearly a decade by Convolutional Neural Networks. CNNs have strong built-in assumptions about images — local filters, translation-invariance, hierarchical structure. These assumptions are correct and helpful, but mean the architecture is specialized for spatial data and can't easily transfer to other domains.

The Vision Transformer (ViT) asked: what if you just treat an image like a sentence? It splits an image into a grid of patches (e.g., 16x16 pixel squares), flattens each patch into a vector, and feeds the sequence of patch vectors into a standard Transformer — the same architecture used for text. With no built-in spatial knowledge, ViT needs large datasets to learn spatial relationships from scratch. But given enough data, it matched or exceeded CNNs, proving the Transformer is a general-purpose sequence processor, not just a language model.`,
  whyNotSooner: `Researchers had to believe huge datasets could replace CNN inductive bias before a patch-sequence model looked viable.

ViT required large-scale datasets (JFT-300M) to overcome the lack of spatial inductive bias. The leap of "just flatten patches into a sequence" seemed too simplistic to researchers.`,
  examples: "CLIP,DALL·E,Stable Diffusion,Segment Anything (SAM),DINOv2",
};
