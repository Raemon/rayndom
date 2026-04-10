// Efficiency, systems, and hardware concepts.
// See ../claude-glossary.md for writing guidelines.
export const entries = [
  {
    term: "HBM",
    definition: "High Bandwidth Memory — large but relatively slow GPU memory where the attention matrix is typically stored.",
  },
  {
    term: "SRAM",
    definition: "Static RAM — small but very fast on-chip memory used for tiled computation in FlashAttention.",
  },
  {
    term: "Tiling",
    definition: "Breaking large matrix operations into blocks that fit in fast on-chip SRAM to reduce slow HBM accesses.",
  },
  {
    term: "Kernel fusion",
    definition: "Combining multiple GPU operations into a single kernel to reduce memory reads/writes between operations.",
  },
  {
    term: "FlashAttention",
    definition: "An IO-aware attention algorithm that uses tiling and kernel fusion to avoid materializing the full N×N attention matrix.",
  },
  {
    term: "Quadratic attention",
    definition: "Standard attention's O(N²) cost in time and memory from computing all pairwise token interactions.",
  },
  {
    term: "Sparse attention",
    definition: "Attending to only a subset of token pairs rather than all N², reducing cost for long sequences.",
  },
  {
    term: "KV cache",
    definition: "Stored key/value matrices reused during autoregressive inference to avoid redundant recomputation.",
  },
  {
    term: "Query/key/value heads",
    definition: "Parallel attention projections that produce Q, K, V vectors in separate learned subspaces.",
  },
  {
    term: "GQA",
    definition: "Grouped-Query Attention — multiple query heads share one key-value head, reducing KV cache size.",
  },
  {
    term: "Multi-Query Attention",
    definition: "An extreme form of GQA using a single KV head for all query heads — fast but lower quality than GQA.",
  },
  {
    term: "Ablations",
    definition: "Systematic experiments where components are removed or varied to measure their individual contribution.",
  },
];
