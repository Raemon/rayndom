// Efficiency, systems, and hardware concepts.
// See ../claude-glossary.md for writing guidelines.
export const entries = [
  {
    term: "HBM",
    definition: "High Bandwidth Memory — the main memory on a GPU. It can store large amounts of data (gigabytes), but reading from and writing to it is relatively slow. When AI models compute attention, they repeatedly shuffle large tables of numbers through this memory, making it the primary speed bottleneck.",
  },
  {
    term: "SRAM",
    definition: "Static RAM — a tiny, ultra-fast memory built directly onto the GPU chip. Like a small workbench versus a large warehouse: you can work much faster, but only a small amount of data fits at once. Efficient algorithms try to do as much math as possible here before accessing the slower main memory.",
  },
  {
    term: "Tiling",
    definition: "When a matrix is too large to fit in fast on-chip memory, it must be loaded from slow main memory — a major bottleneck. Tiling solves this by breaking the computation into small blocks that each fit in fast memory, processing one block at a time.",
  },
  {
    term: "Kernel fusion",
    definition: "Each GPU operation normally reads its inputs from slow memory and writes its results back — so chaining many operations multiplies the slowdown. Kernel fusion combines several operations into one, so intermediate results stay in fast memory instead of making round trips.",
  },
  {
    term: "FlashAttention",
    definition: "Standard attention builds an enormous table comparing every token to every other token, which fills up slow GPU memory and creates a speed bottleneck. FlashAttention avoids ever building that full table by using tiling and kernel fusion to compute attention in small, fast chunks — achieving the same result 2–4× faster.",
  },
  {
    term: "Quadratic attention",
    definition: "Standard attention compares every token to every other token, so cost grows with the square of sequence length — doubling the input quadruples the work. A 1,000-token input requires 1 million comparisons; a 10,000-token input requires 100 million.",
  },
  {
    term: "Sparse attention",
    definition: "Quadratic attention becomes prohibitively expensive for long sequences because every token attends to every other. Sparse attention reduces cost by having each token attend to only a selected subset — for example, nearby tokens plus a few distant ones — rather than all of them.",
  },
  {
    term: "KV cache",
    definition: "During text generation, the model produces one token at a time but needs the attention keys and values from all previous tokens at each step. Without caching, it would recompute them from scratch every time. The KV cache stores these values so each new token can reuse the prior work.",
  },
  {
    term: "Query/key/value heads",
    definition: "In attention, the model examines each token from multiple independent perspectives called 'heads.' Each head has its own learned query, key, and value projections — like asking several different questions about the same text simultaneously and combining the answers.",
  },
  {
    term: "GQA",
    definition: "Grouped-Query Attention — storing separate key-value pairs for every attention head uses a lot of memory during inference. GQA reduces this by having several query heads share a single set of key-value pairs, cutting memory use with minimal quality loss.",
  },
  {
    term: "Multi-Query Attention",
    definition: "An extreme version of Grouped-Query Attention where all query heads share a single key-value head. This maximizes speed and minimizes memory, but can reduce quality because every perspective must share the same key-value information.",
  },
  {
    term: "Ablations",
    definition: "Despite sounding medical, an ablation study in ML means systematically removing or disabling parts of a model to measure how much each one contributes. For example, removing residual connections from a transformer to quantify how much accuracy they provide.",
  },
];
