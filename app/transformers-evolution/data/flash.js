export const entry = {
  year: 2022,
  name: "Flash Attention",
  diag: "flash",
  oneLiner: "Same math, 4x faster via smarter memory access",
  problem: `Self-attention computes a score between every pair of tokens, producing an N×N matrix (where N is the sequence length). In a standard implementation, this entire matrix is created in HBM (High Bandwidth Memory — the GPU's main memory, which is large but relatively slow to access). For a sequence of 4,096 tokens, that's ~16 million entries. The memory cost is O(N²): doubling the sequence length quadruples memory usage. This is a hardware constraint, not an algorithmic one — the math of attention doesn't actually require the full matrix to exist at once.

FlashAttention exploited the GPU's memory hierarchy: GPUs have a small but very fast on-chip memory called SRAM, roughly 100x faster than HBM. Instead of materializing the full N×N matrix, FlashAttention computes attention in tiles — small blocks that fit in SRAM — and fuses multiple operations (the matrix multiply, softmax, and value weighting) into a single GPU kernel. Memory usage drops from O(N²) to O(N), and the operation runs 2–4x faster despite doing the exact same math. This is pure systems engineering — no change to the model or its outputs, just a dramatically more efficient implementation.`,
  whyNotSooner: `Required deep GPU memory hierarchy knowledge — most ML researchers think in FLOPS, not bandwidth. Dao et al. bridged systems engineering and ML research, typically separate communities.`,
  examples: "Every modern Transformer stack (PyTorch,JAX,vLLM,TensorRT-LLM)",
};
