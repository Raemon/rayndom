// Efficiency, systems, and hardware concepts.
// See ../claude-glossary.md for writing guidelines.
export const entries = [
  {
    term: "HBM",
    definition: "HBM (High Bandwidth Memory) is the large, off-chip-style memory pool on a GPU that holds model weights and big activation tensors.\n\nIt offers plenty of gigabytes but each read and write is slow compared to compute on the processor, so algorithms that shuttle huge matrices through HBM repeatedly become memory-bound.\n\nComputing full attention on a long document may stream an N×N attention-related workspace through this memory many times — often the dominant cost even when the arithmetic units sit idle.",
  },
  {
    term: "SRAM",
    definition: "SRAM is fast on-chip memory that sits next to the execution units but only holds a small working set at once.\n\nGPUs pair a large but slower pool (HBM) with a tiny but fast scratchpad (SRAM): you cannot fit whole models in SRAM, so efficient kernels shuttle small tiles into SRAM, finish the math there, and avoid extra trips to HBM.\n\nA fused kernel keeps intermediate tiles in SRAM while multiplying small blocks, instead of writing every intermediate back to HBM between steps.",
  },
  {
    term: "Tiling",
    definition: "Tiling is blocking a large matrix operation into sub-blocks each small enough to live in fast on-chip memory while they are processed.\n\nWhen a full attention matrix for thousands of tokens cannot fit in SRAM, naive code spills to slow memory repeatedly; tiling reorders work so each block is loaded once, used heavily, then discarded.\n\nMultiplying two 8192×8192 matrices might proceed in 128×128 tiles: the chip finishes one tile's worth of multiply-adds before fetching the next slab from HBM.",
  },
  {
    term: "Kernel fusion",
    definition: "Kernel fusion is implementing several GPU operations as one compiled kernel so intermediate tensors are not written to HBM between steps.\n\nChaining separate kernels means each step reads inputs from slow memory and writes outputs back — round trips that dominate runtime for memory-bound workloads.\n\nFusing softmax with the preceding matmul lets the chip keep rows of scores in registers or SRAM through normalization instead of materializing a full score tensor in HBM.",
  },
  {
    term: "FlashAttention",
    definition: "FlashAttention is an attention implementation that avoids materializing the full N×N attention matrix in HBM by computing attention in SRAM-sized blocks with fused kernels.\n\nStandard attention for length N creates a huge score table and pays multiple HBM passes; the goal is the same mathematical output with far fewer bytes moved.\n\nOn a 2,048-token batch, FlashAttention-style blocking recomputes or streams chunks so peak HBM traffic drops sharply versus storing every pairwise score explicitly — often yielding several-fold wall-clock speedups at long lengths.",
  },
  {
    term: "Quadratic attention",
    definition: "Quadratic attention means standard dense attention whose work and memory for pairwise interactions scale like N squared in sequence length N.\n\nEach token compares to every other token, so doubling length multiplies comparisons by four — the core reason long documents are expensive.\n\n1,000 tokens imply on the order of a million token pairs; 10,000 tokens imply on the order of a hundred million — ten times the length, one hundred times the pairwise work.",
  },
  {
    term: "Sparse attention",
    definition: "Sparse attention is any pattern where each token only attends to a chosen subset of positions instead of all N, cutting cost below quadratic.\n\nWhen full attention is unaffordable for long inputs, the model trades complete pairwise access for a structured neighborhood — nearby tokens, strided hops, or learned patterns.\n\nA document model might let each word attend to the previous 128 tokens plus one summary token per paragraph, slashing pairs from N×N to roughly N×129 for large N.",
  },
  {
    term: "KV cache",
    definition: "The KV cache stores the key and value vectors already computed for past tokens so autoregressive generation does not recompute them each step.\n\nWithout it, generating token 500 would rerun attention prep for tokens 1–499 again; caching turns that into one append per new token.\n\nAfter the model emits \"The\", \"cat\", \"sat\", each new word only computes query-key-value for the fresh token while reusing stored keys and values for the prefix — saving huge redundant work across long replies.",
  },
  {
    term: "Query/key/value heads",
    definition: "Query, key, and value heads are the per-head linear projections that turn hidden states into the three vector types attention mixes.\n\nEach head learns its own Q/K/V views so multiple mixing patterns can run in parallel under multi-head attention.\n\nHead 2 might route pronouns to antecedents while head 5 tracks verb-argument structure, even though both read the same underlying token embeddings.",
  },
  {
    term: "GQA",
    altTerms: ["Grouped-Query Attention"],
    definition: "GQA (Grouped-Query Attention) is a layout where several query heads share one key head and one value head, shrinking the KV cache compared with full multi-head attention.\n\nInference memory grows with how many distinct K/V vectors you store per layer; the problem is paying full storage for every head when quality often allows sharing.\n\nEight query heads might pair with two shared KV pairs: each query still asks its own question, but only two K/V copies are kept for the prefix when generating the next token.",
  },
  {
    term: "Multi-Query Attention",
    definition: "Multi-Query Attention is the extreme case of grouping where every query head shares a single key head and single value head.\n\nIt minimizes KV-cache footprint and memory bandwidth for decoding at the cost of giving all heads identical key-value context.\n\nA 32-head decoder might emit 32 different queries each step but maintain one shared K and one shared V across the whole prefix — fastest and leanest, sometimes with a small quality hit versus many independent KV heads.",
  },
  {
    term: "Ablations",
    definition: "An ablation study removes or disables a component and measures the impact, to show what that piece actually contributes.\n\nDespite the surgical name, it is an engineering experiment: you isolate causality by comparing full model versus model-minus-feature on the same data.\n\nTo test residual connections, train the same Transformer with skips removed and report accuracy drop — the gap credits the skipped pathway for that gain.",
  },
];
