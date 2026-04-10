// NLP and sequence modeling concepts.
// See ../claude-glossary.md for writing guidelines.
export const entries = [
  {
    term: "NLP",
    definition: "Natural Language Processing — the field of AI focused on understanding and generating human language.",
  },
  {
    term: "Token",
    altTerms: ["Tokens"],
    definition: "The basic unit of text (word, subword, or character) that a language model processes.",
  },
  {
    term: "Corpus",
    definition: "A large collection of text used for training language models.",
  },
  {
    term: "Language modeling",
    definition: "The task of predicting the next token in a sequence — the core training objective for most LLMs.",
  },
  {
    term: "Language model",
    altTerms: ["Language models"],
    definition: "A model trained to predict or generate text, typically by predicting the next token in a sequence.",
  },
  {
    term: "Next-token prediction",
    definition: "Training objective where the model learns to predict each successive token given all preceding tokens.",
  },
  {
    term: "Downstream task",
    definition: "A specific application (classification, QA, translation) that a pre-trained model is adapted to.",
  },
  {
    term: "Labeled dataset",
    altTerms: ["Labeled datasets"],
    definition: "Training data where each example has a human-provided correct answer or annotation.",
  },
  {
    term: "Embedding",
    altTerms: ["Embeddings"],
    definition: "A dense vector representation of a discrete input (word, token, image patch) in continuous space.",
  },
  {
    term: "Neural machine translation",
    definition: "Using neural networks to translate text between languages — the task that motivated attention mechanisms.",
  },
  {
    term: "Word2Vec",
    definition: "An early method (2013) for learning word embeddings by predicting context words — a precursor to modern pre-training.",
  },
  {
    term: "ELMo",
    definition: "Embeddings from Language Models (2018) — contextual word representations via bidirectional LSTMs, a precursor to BERT.",
  },
  {
    term: "Unidirectional",
    definition: "Attending only to past tokens (left context), not future ones — the constraint of autoregressive models like GPT.",
  },
  {
    term: "Seq2seq",
    definition: "Sequence-to-sequence — an encoder reads input, a decoder generates output token by token.",
  },
  {
    term: "Information bottleneck",
    definition: "Forcing all input information through a fixed-dimensional vector, which loses detail on long inputs.",
  },
  {
    term: "Weighted sum",
    definition: "Each element gets a learned relevance score; the output is their score-weighted combination.",
  },
  {
    term: "One-hot encoding",
    definition: "A vector of all zeros except one 1 at the word's index. No similarity structure — every pair is equidistant.",
  },
  {
    term: "Skip-gram",
    definition: "Training objective: given a word, predict its neighbors. Forces the model to encode meaning in the vector.",
  },
  {
    term: "Distributional hypothesis",
    definition: "Words appearing in similar contexts have similar meanings (Firth, 1957). The linguistic foundation for all embedding methods.",
  },
  {
    term: "BPE",
    altTerms: ["Byte Pair Encoding"],
    definition: "Subword tokenization algorithm that iteratively merges the most frequent byte/character pairs into larger units. Used by GPT, Llama, and most LLMs.",
  },
  {
    term: "Subword tokenization",
    definition: "Splitting text into data-learned units between whole words and individual characters (e.g., 'unhappiness' → 'un' + 'happi' + 'ness').",
  },
];
