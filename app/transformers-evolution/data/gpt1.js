export const entry = {
  year: 2018,
  name: "GPT-1 (Generative Pre-Training)",
  diag: "gpt1",
  oneLiner: "Pre-train on raw text, then adapt to any task",
  problem: `Sentiment analysis, question answering, translation — each required training a model from scratch on task-specific labeled data. Labeled data is expensive: humans must manually annotate thousands of examples per task. Meanwhile, vast amounts of unlabeled text (books, websites, articles) sat unused because there was no clear way to extract general linguistic knowledge from raw text.

GPT introduced a two-phase approach. First, pre-training (a training technique): take a Transformer decoder and train it on a simple objective — predict the next word, given all preceding words. This is autoregressive language modeling, and it requires no labels, just raw text. Through billions of next-word predictions, the model absorbs grammar, facts, and reasoning patterns. Second, fine-tuning (an adaptation technique): take the pre-trained model and train it further on a small labeled dataset for your specific task. The linguistic knowledge transfers, so you need far less labeled data than training from scratch.`,
  whyNotSooner: `Word2Vec and ELMo showed pre-trained representations helped, but were shallow or feature-based. Pre-training an entire deep generative model end-to-end required confidence that Transformers were expressive enough and that enough unlabeled text existed.`,
  examples: "GPT-1 itself; paradigm lives on in all modern LLMs",
};
