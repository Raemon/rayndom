export const entry = {
  year: 2022,
  name: "Flash Attention",
  diag: "flash",
  oneLiner: "Same math, 4x faster via smarter memory access",
  problem: `Self-attention computes a score between every pair of tokens, producing an N×N matrix. In a standard implementation, this entire matrix is created in HBM (the GPU's main memory, which is large but slow). For 4,096 tokens, that's ~16 million entries. Doubling sequence length quadruples memory — a hardware constraint, not an algorithmic one.

FlashAttention exploited the GPU's memory hierarchy: GPUs have a small but very fast on-chip memory called SRAM, roughly 100x faster than HBM. Instead of materializing the full N×N matrix, FlashAttention computes attention in tiles — small blocks that fit in SRAM — and fuses multiple operations (the matrix multiply, softmax, and value weighting) into a single GPU kernel. Memory usage drops from O(N²) to O(N), and the operation runs 2–4x faster despite doing the exact same math. This is pure systems engineering — no change to the model or its outputs, just a dramatically more efficient implementation.`,
  whyNotSooner: `Most ML researchers think in FLOPS, not memory bandwidth. Dao et al. bridged systems engineering and ML research — typically separate communities.`,
  examples: "Mistral 7B,Claude 3.5 Sonnet",
};
