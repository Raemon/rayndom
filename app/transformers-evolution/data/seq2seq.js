export const entry = {
  year: 2014,
  name: "Seq2Seq (Encoder-Decoder)",
  diag: "seq2seq",
  oneLiner: "Turn one variable-length sequence into another",
  problem: `Classic neural sequence models were good at tagging or predicting the next item, but tasks like translation, summarization, and dialogue require mapping one variable-length sequence into a different variable-length sequence. Earlier systems handled this with brittle pipelines: separate alignment models, phrase tables, language models, and hand-engineered decoding logic. There was no single end-to-end neural model for "read a sentence in one language, then generate the sentence in another."

Seq2Seq reframed the task as two RNNs (usually LSTMs): an encoder reads the input sequence into a final hidden state, and a decoder generates the output sequence token by token conditioned on that state. This made neural machine translation end-to-end trainable with one objective: maximize the probability of the target sentence given the source sentence. The catch was the fixed bottleneck vector — all source information had to be compressed into one state — so performance degraded on longer inputs. That bottleneck directly set up the need for attention.`,
  whyNotSooner: `The ingredients had to arrive first: backpropagation through time, recurrent sequence models, and then LSTMs that were stable enough to carry useful information across dozens of steps. It also required large parallel text corpora and enough GPU compute to train encoder-decoder models at meaningful scale. The conceptual leap was realizing that variable-length transduction could be treated as one differentiable supervised learning problem instead of a pipeline of separately designed modules.`,
  whoInvented: `Sutskever, Vinyals, Le (3)
2013 - 2014, 1 year.

Cho, Bahdanau, Bengio encoder-decoder group (4)
2014 - 2014, <1 year.

Roughly 7 people across these groups were building neural encoder–decoders; about 4 worked on the same end-to-end NMT architecture family in parallel.`,
  examples: "Sequence to Sequence Learning (2014),Early neural machine translation",
};
