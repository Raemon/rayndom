// NLP and sequence modeling concepts.
// See ../claude-glossary.md for writing guidelines.
export const entries = [
  {
    term: "NLP",
    definition: "Natural Language Processing — the branch of AI focused on getting computers to understand, interpret, and generate human language. Applications range from spam filters and autocomplete to chatbots and translation.",
  },
  {
    term: "Token",
    altTerms: ["Tokens"],
    definition: "In everyday English, a 'token' is a small piece representing something larger. In AI, it's the smallest unit of text a model reads — roughly a word, but uncommon words get split into pieces. 'Chatbot' might become two tokens: 'Chat' + 'bot.'",
  },
  {
    term: "Corpus",
    definition: "A large body of text collected for training AI — ranging from thousands of documents to billions of web pages. The word comes from Latin for 'body' (as in 'body of work'). A model's abilities are shaped by what's in its training corpus.",
  },
  {
    term: "Language modeling",
    definition: "The task of predicting what word comes next in a sentence. This deceptively simple objective — guess the next word, over and over, across billions of sentences — turns out to teach a model grammar, facts, and reasoning patterns. It is the core training method behind most modern AI language systems.",
  },
  {
    term: "Language model",
    altTerms: ["Language models"],
    definition: "An AI system trained on large amounts of text to predict and generate language. It learns by reading billions of sentences and practicing 'guess the next word.' The resulting model can write essays, answer questions, and translate languages — all emerging from that one training task.",
  },
  {
    term: "Next-token prediction",
    definition: "The training method where a model reads text one piece at a time and tries to guess what comes next. For 'The cat sat on the ___', it should predict 'mat' or similar. By practicing this across billions of sentences, the model absorbs patterns of grammar, facts, and reasoning.",
  },
  {
    term: "Downstream task",
    definition: "A specific real-world application — like classifying emails as spam, answering questions, or translating languages — that a pre-trained model is adapted to handle. 'Downstream' because it comes after the general training: first learn language broadly, then specialize.",
  },
  {
    term: "Labeled dataset",
    altTerms: ["Labeled datasets"],
    definition: "Training data where a human has marked the correct answer for each example — e.g., tagging 1,000 emails as 'spam' or 'not spam.' These are expensive to create because they require human judgment, but they teach the model what 'right' looks like for a specific task.",
  },
  {
    term: "Embedding",
    altTerms: ["Embeddings"],
    definition: "In everyday English, 'embedding' means placing something within something else. In AI, it means converting a word or other item into a list of numbers that captures its meaning. Similar words get similar numbers — 'king' and 'queen' end up close together, while 'king' and 'banana' are far apart.",
  },
  {
    term: "Neural machine translation",
    definition: "Using neural networks to translate text between languages. This task drove major AI breakthroughs — early systems struggled with long sentences because they had to compress the entire input into a fixed-size summary before translating. The need to let the translator look back at specific input words motivated the invention of 'attention.'",
  },
  {
    term: "Word2Vec",
    definition: "A method (2013) that learns to represent words as lists of numbers by training on a simple task: predict a word's neighbors in a sentence. Words with similar meanings end up near each other in this number space. Its famous demo: king − man + woman ≈ queen.",
  },
  {
    term: "ELMo",
    definition: "Embeddings from Language Models (2018) — a system that gives each word a different numerical representation depending on context. Unlike Word2Vec, where 'bank' always gets the same numbers, ELMo produces different representations for 'river bank' vs. 'bank account.' A key stepping stone toward modern AI language models.",
  },
  {
    term: "Unidirectional",
    definition: "Processing text in one direction only — left to right — so the model can see previous words but not future ones. Like reading with a card covering everything to the right. This is the natural constraint for text generation: you can't peek at words you haven't written yet.",
  },
  {
    term: "Seq2seq",
    definition: "Sequence-to-sequence — a two-part architecture for transforming one sequence into another (e.g., English to French). The first part (encoder) reads and compresses the input; the second part (decoder) generates the output one piece at a time.",
  },
  {
    term: "Information bottleneck",
    definition: "The problem that arises when a network must compress an entire input into a single fixed-size summary before producing output. Short inputs compress fine, but long ones lose crucial details — like summarizing a novel into one sentence. This limitation motivated the invention of attention.",
  },
  {
    term: "Weighted sum",
    definition: "A calculation where each item gets an importance score, and the result is the sum of each item multiplied by its score. If three words have scores 0.7, 0.2, and 0.1, the output is mostly influenced by the first word. This is the core math behind how AI models decide what to focus on.",
  },
  {
    term: "One-hot encoding",
    definition: "Representing a word as a list of numbers that's all zeros except for a single 1 at that word's position. In a 10,000-word vocabulary, 'cat' might be a list with a 1 only at position 537 and zeros everywhere else. The problem: this gives the model no clue that 'cat' and 'kitten' are related.",
  },
  {
    term: "Skip-gram",
    definition: "A training method for learning word meanings: given a word in a sentence, try to predict the words surrounding it. By practicing this millions of times, the model is forced to encode what words mean into their number representations — words that appear near similar neighbors end up with similar numbers.",
  },
  {
    term: "Distributional hypothesis",
    definition: "The idea that a word's meaning is defined by the company it keeps — words appearing in similar contexts have similar meanings. 'Doctor' and 'physician' appear near the same words ('patient,' 'hospital,' 'diagnosed'), so they must mean similar things. This principle (Firth, 1957) is the foundation of all modern methods for teaching AI word meanings.",
  },
  {
    term: "BPE",
    altTerms: ["Byte Pair Encoding"],
    definition: "Byte Pair Encoding — an algorithm for splitting text into pieces between whole words and individual characters. It starts with single characters and repeatedly merges the most common pairs: 'l'+'o'→'lo', 'lo'+'w'→'low.' The result is a vocabulary of common subword pieces, used by GPT, Llama, and most modern AI systems.",
  },
  {
    term: "Subword tokenization",
    definition: "Splitting text into learned pieces between whole words and individual characters. 'Unhappiness' might become 'un' + 'happi' + 'ness.' This lets the model handle rare or invented words by combining familiar pieces, while keeping common words like 'the' as single units.",
  },
];
