export const entry = {
  year: 2016,
  name: "Subword Tokenization (BPE)",
  diag: "tokenization",
  oneLiner: "Split text into reusable pieces, not fixed words",
  problem: `Early neural NLP systems usually worked with a fixed word vocabulary. That created a brutal trade-off: if the vocabulary was small, rare words became [UNK] ("unknown") and information was lost; if the vocabulary was huge, the embedding table and output softmax became expensive and brittle. Names, misspellings, code, and morphologically rich languages all broke this setup.

Subword tokenization solved the problem by representing text as reusable pieces rather than whole words. Byte Pair Encoding (BPE), adapted to neural machine translation by Sennrich et al. in 2016, starts from small units and repeatedly merges the most frequent adjacent pair until it reaches a target vocabulary size. Common words stay whole, while rare words decompose into familiar chunks like "token" + "ization". This gives models an open-ended vocabulary without exploding the number of symbols they must memorize.`,
  whyNotSooner: `Earlier NLP pipelines often relied on hand-built word vocabularies because they were simpler to reason about, and pre-neural systems could tolerate unknown-word heuristics. The payoff from subword units only became obvious once large neural language models and translation systems made the vocabulary bottleneck painfully expensive. It also required accepting a new trade-off: longer sequences in exchange for dramatically better coverage.`,
  howInvented: `Sennrich, Haddow, and Birch invented the neural-era version by borrowing BPE from compression and repurposing it as a learnable open-vocabulary tokenizer for translation. Independent convergence: roughly 2-3 groups were moving toward the same answer — subword NMT tokenization, character-aware models, and later byte-level tokenizer work.`,
  examples: "Sennrich et al. BPE for NMT,GPT-2's byte-level BPE",
};
