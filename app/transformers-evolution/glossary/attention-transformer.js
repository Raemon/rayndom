// Attention and Transformer architecture concepts.
// See ../claude-glossary.md for writing guidelines.
export const entries = [
  {
    term: "Attention",
    definition: "In machine learning, 'attention' is not everyday focus — it is a mechanism that assigns a weight to each piece of input so the model can emphasize what matters for the current output.\n\nLike highlighting only the sentences that answer your question instead of rereading the whole chapter, attention turns raw scores into a weighted blend of input fragments the next layer consumes.\n\nFor the prompt \"Which city is the capital of France?\", strong weights on tokens such as \"France\" and \"Paris\" (and weak weights on glue words) steer the model toward the right answer.",
  },
  {
    term: "Self-attention",
    definition: "Self-attention is attention where every token in one sequence compares itself to every other token in that same sequence to build contextualized representations.\n\nUnlike a strict left-to-right pass that only sees the past, each position can pull information from all positions, which is how models resolve pronouns and long-range dependencies.\n\nIn \"The cat sat on the mat because it was tired\", the representation for \"it\" ends up leaning on \"cat\" rather than \"mat\" because those pairwise comparisons favor the subject as the referent.",
  },
  {
    term: "Multi-head",
    definition: "Multi-head attention is several attention mechanisms run in parallel on the same layer, each with its own learned parameters, whose outputs are concatenated and mixed.\n\nOne head alone can only implement one mixing pattern at a time; multiple heads let the model specialize — one head might track syntax, another coreference, another semantic similarity — without forcing a single compromise.\n\nIn \"The small red car sped past the large blue truck\", different heads can separately link adjectives to nouns and keep the two vehicles distinct in the updated embeddings.",
  },
  {
    term: "Attention matrix",
    definition: "An attention matrix is the square grid of scores (or post-softmax weights) where row i describes how strongly token i attends to every token j.\n\nIt is the bookkeeping behind \"who looks at whom\": each row is turned into nonnegative weights that sum to 1 and scale how much value from each column gets mixed in.\n\nFor a 10-word sentence, you get a 10×10 table; the row for word 7 shows which of the ten words most influenced the update at position 7.",
  },
  {
    term: "Scaled dot-product attention",
    definition: "Scaled dot-product attention is the standard Transformer attention block: it compares each query vector to all key vectors, scales those comparison scores, applies softmax, and uses the result to average value vectors.\n\nThe problem it solves is \"pick a weighted mix of stored facts\"; dot products measure alignment between a query and each key, and dividing by the square root of the key dimension keeps softmax from saturating when vectors are long.\n\nIf one key aligns much more strongly with the query than the others, softmax concentrates almost all weight on that column, so the output closely resembles that key's associated value content at the current position.",
  },
  {
    term: "Softmax",
    definition: "Softmax is a function that maps a list of raw scores to nonnegative weights that add to 1, so they behave like a probability distribution over a fixed set of choices.\n\nIt turns \"how much each option argued for itself\" into \"what fraction of the vote each option gets\", with larger scores receiving disproportionately more mass.\n\nScores [2, 5, 1] become roughly [0.05, 0.93, 0.02], so a downstream step can treat the middle option as almost certainly the one to follow.",
  },
  {
    term: "Dot product",
    definition: "The dot product is the sum of elementwise products of two same-length vectors, used here as a quick similarity score between a query and a key.\n\nGeometrically, it grows when vectors point in similar directions and shrink when they oppose; in attention, a larger dot product means \"this key is a better match for this query.\"\n\nIf query and key both emphasize dimensions tied to \"location\" and \"France\", their dot product is larger than for a key tied to unrelated content, nudging attention toward the relevant token.",
  },
  {
    term: "Encoder",
    definition: "An encoder is the part of a model that reads the full input and emits an internal representation other components consume — often a sequence of vectors, one per token.\n\nIt answers \"what does the input say?\" before any word-by-word generation; like a translator reading the whole paragraph before speaking, it is built to ingest context in bulk.\n\nIn machine translation, the encoder reads the entire source sentence once so the decoder can repeatedly consult that representation while producing the target language.",
  },
  {
    term: "Decoder",
    definition: "A decoder is the part of a model that produces output incrementally — typically the next token given prior tokens — and often attends to an encoder's summary when both are present.\n\nCausal decoders mask future positions so the model cannot peek at tokens it is supposed to predict, matching left-to-right generation.\n\nAutocomplete is the familiar case: given \"The weather in Paris is\", the decoder only sees that prefix and proposes \"sunny\", \"rainy\", etc., without seeing the true next character in advance.",
  },
  {
    term: "Encoder-decoder",
    definition: "Encoder-decoder is an architecture that pairs a whole-input encoder with a stepwise decoder so one sequence can be transformed into another.\n\nThe encoder compresses the source into vectors; the decoder generates the target while attending back to those vectors — a split between \"understand all at once\" and \"emit one piece at a time.\"\n\nEnglish-to-French translation: encoder ingests the English sentence; decoder writes French one subword at a time, checking the encoder on every step.",
  },
  {
    term: "Transformer encoder",
    definition: "A Transformer encoder is a stack of layers using bidirectional self-attention, meaning each token may attend to tokens before and after it in the sequence.\n\nUnlike a GPT-style decoder stack, nothing in a pure encoder forbids seeing the whole sentence at once, which suits understanding tasks where the full text is given up front.\n\nFill-in-the-blank on \"The ___ went to the store\" uses an encoder: both sides of the blank are visible, so the model can use later words to disambiguate the missing early noun.",
  },
  {
    term: "Transformer decoder",
    definition: "A Transformer decoder is a stack of layers using causal (masked) self-attention: position i may attend only to positions ≤ i, never to the future.\n\nThat constraint matches autoregressive generation, where each new token must be predicted from earlier tokens alone.\n\nWhen GPT generates token 200, its layer sees tokens 1–199 when forming the distribution for token 200 — it cannot attend to token 201 that does not exist yet.",
  },
  {
    term: "Layer normalization",
    definition: "Layer normalization is a per-layer rescaling that recenters and rescales activations so they stay in a stable numeric range as depth grows.\n\nWithout normalization, repeated matrix multiplies and nonlinearities can let values explode or vanish, which makes optimization fragile; normalization is a thermostat on each layer's outputs.\n\nAfter a sublayer outputs a vector for each token, normalization adjusts those numbers before the next sublayer — analogous to taring a scale between measurements so readings stay comparable.",
  },
  {
    term: "Positional encoding",
    altTerms: ["Positional encodings"],
    definition: "Positional encoding is extra information added to token embeddings so the model knows order even though self-attention treats all positions in parallel.\n\nThe problem is permutation blindness: swap two words and pure attention sees the same pairwise relationships; encodings tag each slot (first, second, …) so \"dog bites man\" differs from \"man bites dog.\"\n\nTwo identical tokens \"the\" at positions 3 and 40 receive different position signals, so the network can tell early-paragraph context from late-paragraph context.",
  },
  {
    term: "Residual connection",
    altTerms: ["Residual connections"],
    definition: "A residual connection adds a block's input to its output elementwise, creating a shortcut that carries the original signal alongside the block's transform.\n\nVery deep stacks are hard to train because signals and gradients attenuate through long chains of layers; the skip path gives both a direct route.\n\nIf a block's nonlinear part is near zero early in training, the output is still approximately the input, so the block can learn a small correction instead of reconstructing the entire representation from scratch.",
  },
  {
    term: "Skip connection",
    definition: "A skip connection is a pathway that feeds a tensor around a subgraph and combines it with the subgraph's output — the same shortcut idea as a residual add.\n\nIt exists so the network can pass information forward even when the intervening transform is weak or slow to learn.\n\nWhen a six-layer chunk would otherwise blur fine details, the additive skip preserves a copy of the pre-chunk activations for the next stage to use.",
  },
  {
    term: "Residual learning",
    definition: "Residual learning trains a block to predict a residual F(x) that is added to the input x, instead of asking the block to output the full target H(x) directly.\n\nStarting from F ≈ 0 means the block begins near the identity map, which is an easier optimization baseline than mapping randomly to the full desired output.\n\nThe network can grow depth gradually: early training behaves like a shallower net with identity shortcuts, and F grows only where nonlinearity truly helps.",
  },
  {
    term: "Degradation problem",
    definition: "The degradation problem is the phenomenon where adding many layers makes training error worse — deeper networks can underfit the training set compared to shallower ones.\n\nIt is not the usual story of memorizing noise; the deeper model fails to fit even the data it is trained on, pointing to optimization difficulty.\n\nClassic ResNet motivation: a 56-layer plain network achieved higher training error than a 20-layer plain network on the same vision task, which residual wiring was designed to alleviate.",
  },
];
