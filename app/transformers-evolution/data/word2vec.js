export const entry = {
  year: 2013,
  name: "Word Embeddings (Word2Vec)",
  diag: "word2vec",
  oneLiner: "Words as numbers where meaning = proximity",
  problem: `Before Word2Vec, words were fed to neural networks as one-hot vectors — a data representation where each word is a list of 50,000 numbers (one per word in the vocabulary), all zeros except a single 1 at that word's index. This means "cat" and "kitten" are exactly as far apart as "cat" and "plutonium." The representation encodes no notion of meaning or similarity.

Word2Vec learned dense embeddings — compact vectors of ~300 numbers — where semantic relationships become geometric relationships. The training method (called skip-gram) is surprisingly simple: given a word in a sentence, predict the words surrounding it. A word that consistently appears near "fur" and "purr" gets pulled close to other animal words in vector space. The result: vec("king") − vec("man") + vec("woman") ≈ vec("queen"). Meaning is encoded as direction and distance in a continuous space, and these vectors became the standard input representation for all subsequent neural NLP — including every Transformer.`,
  whyNotSooner: `Latent Semantic Analysis (Deerwester et al., 1990) and neural language models (Bengio, 2003) explored similar ideas, but were either linear or too slow. Mikolov's key contribution was a simplified architecture (no hidden layer) with negative sampling, making it feasible to train on billions of words. The specific training objectives (skip-gram, CBOW) were non-obvious simplifications that worked far better than expected.`,
  examples: "Word2Vec,GloVe (2014),FastText,Foundation for all Transformer embedding layers",
};
