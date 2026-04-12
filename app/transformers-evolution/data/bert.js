export const entry = {
  year: 2018,
  name: "BERT (Bidirectional Encoder)",
  diag: "bert",
  oneLiner: "Read left and right to understand meaning",
  problem: `Its pre-training was unidirectional — it only looked at previous tokens when making predictions. When encoding "bank" in "I went to the river bank to fish," GPT can use "river" but not "fish." For understanding tasks (classification, question answering), you often need both directions of context to grasp meaning.

BERT solved this with masked language modeling (a training technique): randomly hide 15% of the tokens in a sentence (replacing them with a [MASK] token), then train the model to predict the hidden words from the full surrounding context — both left and right simultaneously. BERT uses a Transformer encoder (which allows attention in all directions), producing deeply bidirectional representations. The trade-off: BERT excels at understanding text but cannot generate it token-by-token like GPT, because it was trained to fill in blanks, not to produce text sequentially.`,
  whyNotSooner: `Bidirectional models like ELMo existed but used shallow concatenation of forward and backward LSTMs. The insight that masking + Transformer encoder could produce deeply bidirectional representations required the Transformer architecture to exist first.`,
  howInvented: `Google invented BERT by taking the Transformer encoder and pairing it with masked language modeling so each token could learn from both left and right context at once. Independent convergence: about 2 groups were moving toward the same destination — the bidirectional-representation line from ELMo and the large-scale Transformer-pretraining line that BERT crystallized.`,
  examples: "BERT,Google Search",
};
