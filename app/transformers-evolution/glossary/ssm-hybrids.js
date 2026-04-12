// State-space model and hybrid architecture concepts.
// See ../claude-glossary.md for writing guidelines.
export const entries = [
  {
    term: "State-space model",
    altTerms: ["State-space models", "SSM"],
    definition: "A state-space model (SSM) is a sequence architecture that updates a compact hidden state as each new token arrives, instead of comparing every token to every other token.\n\nTransformers pay roughly N² cost for length N because each position attends to all positions; SSMs aim for roughly linear cost by summarizing the past into a fixed-size state that rolls forward.\n\nReading a 100,000-token log file: a Transformer-style layer might budget hundreds of billions of pairwise touches; an SSM-style layer walks the file once while carrying a state vector whose size does not grow with how far you have read.",
  },
  {
    term: "Linear attention",
    definition: "Linear attention is a reformulation of attention-like mixing whose cost scales linearly with sequence length rather than quadratically.\n\nStandard attention materializes all pairwise scores between N tokens; linear variants reassociate the mathematics so the same output can be built by accumulating sufficient statistics in one pass.\n\nProcessing 20,000 tokens might remain tractable where dense attention would require ~400 million score cells per layer; the tradeoff is often weaker exact pairwise matching than full softmax attention.",
  },
  {
    term: "Hybrid",
    definition: "A hybrid model interleaves cheap long-range mixers (often SSM- or conv-style blocks) with a smaller number of full attention layers.\n\nAttention is strong at arbitrary token-to-token lookup but expensive at scale; SSM-style blocks stream efficiently but can miss precise long-distance retrieval unless paired with attention.\n\nA stack might let SSM layers carry narrative state across a whole chapter, then use attention layers at the end of each section so the model can pull an exact date or name from hundreds of paragraphs back.",
  },
  {
    term: "Selective gating",
    definition: "Selective gating lets a state-space block change how much of the incoming token enters the recurrent state and how much of the old state persists, based on the token content itself.\n\nA fixed update rule treats noise and keywords the same; the problem is preserving rare facts (a PIN, a name) while discarding boilerplate without growing state size.\n\nDuring a transcript full of \"um\" and \"like\", the gate can shrink updates on filler syllables yet open wide when a speaker states a nine-digit account number worth remembering in the hidden state.",
  },
];
