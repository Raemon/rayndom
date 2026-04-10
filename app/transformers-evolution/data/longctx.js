export const entry = {
  year: "2023–24",
  name: "Long Context (100K+ Tokens)",
  diag: "longctx",
  oneLiner: "Read entire books, not just a few pages",
  problem: `Standard Transformers were trained with context windows of 2,048 to 4,096 tokens — roughly 3–6 pages of text. Anything beyond that was cut off. This limited the model's ability to work with long documents, codebases, or extended conversations. The constraint came from multiple sources: the O(N²) cost of attention (a computational constraint), position encodings that don't generalize beyond training lengths (a model limitation), and training data that predominantly consisted of short documents.

Extending to 100K+ tokens required solving several sub-problems simultaneously. RoPE with NTK-aware scaling (a mathematical adjustment to rotation frequencies) allowed position encodings to extrapolate to unseen lengths. FlashAttention-2 made the O(N²) computation feasible for long sequences. Ring attention (a distributed computing technique) split the sequence across multiple GPUs along the sequence dimension. And progressive training — starting with short contexts and gradually lengthening them — taught models to actually use the additional context rather than ignoring distant tokens. No single technique was sufficient; the breakthrough was combining all of them.`,
  whyNotSooner: `Each sub-problem was a separate research area. The combination required solving all simultaneously. Models trained on short documents couldn't utilize long contexts even when the architecture supported it.`,
  examples: "Claude (200K),Gemini 1.5 (1M+),GPT-4 Turbo (128K),Llama 3.1 (128K)",
};
