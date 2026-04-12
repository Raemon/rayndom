// Long context concepts.
// See ../claude-glossary.md for writing guidelines.
export const entries = [
  {
    term: "Context window",
    definition: "The context window is the longest contiguous span of tokens a model can attend to in one forward pass — the fixed \"short-term memory\" width for that stack.\n\nEarly Transformer setups often capped near 512 tokens (a couple of pages of text); frontier systems advertise 100k–1M+ tokens, but widening the window forces harder attention, memory, and position-encoding tradeoffs.\n\nIf the window is 8,192 tokens, a 50,000-token legal brief must be chunked or compressed; anything past the cutoff is invisible until the model is redesigned or the text is shortened.",
  },
  {
    term: "NTK-aware scaling",
    definition: "NTK-aware scaling is a recipe for adjusting RoPE-style rotation frequencies when you extend context beyond training length so attention geometry stays stable.\n\nModels trained on short texts often degrade when positions go far past what RoPE saw; naive stretching can make nearby tokens look wrongly distant in angle space.\n\nA model trained on 2,048-token articles can be tuned with NTK-aware rules before serving 8,192-token threads so perplexity does not spike from broken positional phase relationships.",
  },
  {
    term: "Ring attention",
    definition: "Ring attention is a distributed algorithm that splits a long sequence across GPUs arranged in a ring so no single device holds the full N×N attention state at once.\n\nWhen one GPU cannot fit both the activations and the full pairwise attention map for very long inputs, the ring passes partial attention statistics around until every chunk has seen what it needs.\n\nTraining on a 1-million-token synthetic sequence might assign each GPU a contiguous slice; GPUs pass messages to neighbors in rounds until each slice has accumulated the correct attention output for its tokens.",
  },
  {
    term: "Sequence parallelism",
    definition: "Sequence parallelism splits the token dimension across devices so each GPU owns a contiguous segment of the input sequence for that layer.\n\nUnlike tensor parallelism (splitting weight matrices) or pipeline parallelism (splitting depth), this partitions along \"how long the sentence is\" to fit extreme lengths.\n\nA 256k-token run might give GPU 0 tokens 1–64k and GPU 1 tokens 64k–128k, with communication between segments whenever attention or convolutions cross chunk boundaries.",
  },
  {
    term: "Long context",
    definition: "Long context means reliably using inputs far longer than classic 512-token setups — often tens or hundreds of thousands of tokens in one pass.\n\nThe obstacles are quadratic attention cost, limited GPU memory for caches and activations, and position encodings that extrapolate poorly past training length.\n\nDropping a full 200-page PDF into a chat and asking for a citation-backed summary only works if the stack combines methods like sparse or blocked attention, scaled RoPE, ring or sequence parallelism, and careful KV-cache engineering.",
  },
];
