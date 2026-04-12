export const entry = {
  year: 2016,
  name: "Subword Tokenization (BPE)",
  diag: "tokenization",
  oneLiner: "Split text into reusable pieces, not fixed words",
  problem: `Early neural NLP systems usually worked with a fixed word vocabulary. That created a brutal trade-off: if the vocabulary was small, rare words became [UNK] ("unknown") and information was lost; if the vocabulary was huge, the embedding table and output softmax became expensive and brittle. Names, misspellings, code, and morphologically rich languages all broke this setup.

Subword tokenization solved the problem by representing text as reusable pieces rather than whole words. Byte Pair Encoding (BPE), adapted to neural machine translation by Sennrich et al. in 2016, starts from small units and repeatedly merges the most frequent adjacent pair until it reaches a target vocabulary size. Common words stay whole, while rare words decompose into familiar chunks like "token" + "ization". This gives models an open-ended vocabulary without exploding the number of symbols they must memorize.`,
  whyNotSooner: `Earlier NLP pipelines often relied on hand-built word vocabularies because they were simpler to reason about, and pre-neural systems could tolerate unknown-word heuristics. The payoff from subword units only became obvious once large neural language models and translation systems made the vocabulary bottleneck painfully expensive. It also required accepting a new trade-off: longer sequences in exchange for dramatically better coverage.`,
  whoInvented: `Sennrich, Haddow, Birch (3)
2015 - 2016, 1 year.

character aware NLP group (12)
2014 - 2016, 2 years.

byte level tokenizer line (10)
2018 - 2020, 2 years.

Roughly 25 people across these groups were redesigning open-vocabulary text units; about 22 worked on character-aware, subword, or byte-level tokenization in overlapping ways.`,
  examples: "Sennrich et al. BPE for NMT,GPT-2's byte-level BPE",
};
