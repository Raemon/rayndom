export const entry = {
  year: 2014,
  name: "Neural Attention (Soft Alignment)",
  diag: "attention",
  oneLiner: "Let the model look back at relevant inputs",
  problem: `Encoders crushed whole sentences into one vector, so attention let decoders score and revisit all source states.

The dominant approach to machine translation used an encoder-decoder model — one network reads the entire input sentence and compresses it into a single fixed-size vector, then another generates the output from that vector alone. This is an information bottleneck: imagine summarizing a 50-word sentence into one point in space. For long inputs, critical details are inevitably lost.

Attention removed the bottleneck by letting the decoder look at all of the encoder's outputs at every step. At each generation step, the decoder computes a relevance score for each encoder position, producing a set of weights that sum to 1 (via softmax — a mathematical function that converts raw scores into a probability distribution). The decoder then takes a weighted sum of all encoder states, focusing on the most relevant parts. The model dynamically decides where to look based on what it's currently producing — a form of learned, differentiable addressing.`,
  whyNotSooner: `Seq2seq had to expose the bottleneck first, and learned soft alignment only made sense once that framing existed.

The idea of "soft addressing" existed in associative memory literature, but connecting it to gradient-based end-to-end training in NLP required the seq2seq paradigm to mature. Before neural machine translation took off (~2013–14), there was no compelling large-scale task where the bottleneck was painfully obvious enough to motivate the mechanism.`,
  examples: "Google Neural Machine Translation (GNMT),Early seq2seq chatbots",
};
