// NLP and sequence modeling concepts.
// See ../claude-glossary.md for writing guidelines.
export const entries = [
  {
    term: "NLP",
    definition: "Natural Language Processing (NLP) is the field of building systems that read, label, retrieve, or generate human language with computers.\n\nIt spans narrow tools (spam filters, spell check) and broad models that draft email or translate.\n\nExample: given the sentence \"Refund my order,\" an NLP classifier routes it to the billing queue; a generator might draft a polite reply asking for an order number.",
  },
  {
    term: "Token",
    altTerms: ["Tokens"],
    definition: "In ML, a token is one chunk of text the model treats as a single symbol in its vocabulary — often a common word, but rare words are split into subword pieces so nothing is out-of-vocabulary.\n\nEveryday \"token\" means a stand-in object; here it means an atomic unit in the model's input stream.\n\nExample: GPT-style tokenizers might map \"Chatbot\" to two tokens such as \"Chat\" and \"bot,\" while \"the\" stays one token.",
  },
  {
    term: "Corpus",
    definition: "A corpus is the collected text (or speech transcripts) used to train or evaluate a language system — from a few thousand labeled tweets to billions of pages scraped from the web.\n\nScale matters: a model sees grammar, facts, and biases present in that body of text.\n\nExample: a 50 GB snapshot of Wikipedia plus books might be on the order of tens of billions of word tokens; the model's factual quirks often mirror what appears often there.",
  },
  {
    term: "Language modeling",
    definition: "Language modeling is the training objective of predicting the next token (or a masked token) from surrounding context, repeated across huge text.\n\nThat narrow game forces the system to internalize syntax, some facts, and discourse patterns because only accurate context use drives the score down.\n\nExample: on \"The capital of France is ,\" the trained model assigns high probability to \"Paris\" because the training corpus rewarded that continuation thousands of times.",
  },
  {
    term: "Language model",
    altTerms: ["Language models"],
    definition: "A language model is a system trained on text to assign probabilities to upcoming tokens (or to sample coherent continuations), produced by optimizing next-token prediction (or a close variant) on large corpora.\n\nDownstream assistants add alignment on top of this core capability.\n\nExample: the same base LM can autocomplete code, finish a poem, or score how surprising a headline is, all from the shared next-token machinery.",
  },
  {
    term: "Next-token prediction",
    definition: "Next-token prediction is the training game where the model sees a prefix of text and must assign probability to the true next piece; cross-entropy loss pushes mass onto the correct token.\n\nIt is the workhorse objective behind GPT-style models.\n\nExample: for input \"The cat sat on the \" the label token might be \"mat\"; the model is penalized if it puts low probability on \"mat\" and high probability on unrelated words.",
  },
  {
    term: "Downstream task",
    definition: "A downstream task is the specific job you care about after (or on top of) general training — sentiment tagging, translation, SQL generation — where metrics match a product need.\n\n\"Downstream\" signals it comes after a broad upstream training phase.\n\nExample: a model pre-trained on the web is fine-tuned on 10k customer tickets labeled \"urgent\" or \"routine\" so the deployment task is ticket triage.",
  },
  {
    term: "Labeled dataset",
    altTerms: ["Labeled datasets"],
    definition: "A labeled dataset pairs each example with a human-chosen or human-verified target — class name, span tags, rating — so supervised training can minimize prediction error against that target.\n\nLabels cost time and money, so sets are often smaller than raw text piles.\n\nExample: 20k emails each marked \"spam\" or \"not spam\" trains a classifier; the model never sees the engineer's rules, only the examples and tags.",
  },
  {
    term: "Embedding",
    altTerms: ["Embeddings"],
    definition: "In ML, an embedding is a fixed-length list of numbers representing a discrete item (word, token, user) such that useful similarity in the task lines up with distance in that vector space.\n\nEveryday \"embed\" means to place inside something; here it means map into coordinates for computation.\n\nExample: after training, vectors for \"king\" and \"queen\" lie nearer each other than either does to \"banana,\" so nearest-neighbor search retrieves related words.",
  },
  {
    term: "Neural machine translation",
    definition: "Neural machine translation is machine translation where a neural network maps a source sentence to a target sentence, usually with an encoder-decoder stack and (in modern systems) attention so long inputs are not crushed into one tiny vector.\n\nThe field's struggle with long sentences helped motivate attention mechanisms.\n\nExample: English \"The committee approved the budget\" becomes French \"Le comité a approuvé le budget\" with the model attending back to \"committee\" when emitting \"comité.\"",
  },
  {
    term: "Word2Vec",
    definition: "Word2Vec is a family of shallow neural methods (circa 2013) that learn word embeddings by predicting context words from a center word (skip-gram) or the center from context (CBOW), so co-occurrence structure becomes geometry.\n\nEach word maps to one vector regardless of sentence context.\n\nExample: vector arithmetic on trained embeddings famously yields king − man + woman ≈ queen in the nearest-neighbor sense.",
  },
  {
    term: "ELMo",
    definition: "ELMo (Embeddings from Language Models) is a way to represent a word with a vector that depends on the whole sentence, built from the internal states of a deep bidirectional language model run left-to-right and right-to-left.\n\nIt fixes the Word2Vec limitation where \"bank\" always shares one vector for \"river bank\" and \"bank account.\"\n\nExample: in \"She sat on the river bank,\" the ELMo vector for \"bank\" moves toward shoreline semantics; in \"She deposited cash at the bank,\" it moves toward finance semantics.",
  },
  {
    term: "Unidirectional",
    definition: "Unidirectional modeling reads the sequence in one time order (typically left-to-right) so the representation at position t may use tokens ≤ t but not tokens > t.\n\nThat matches text generation, where future tokens do not exist yet, unlike bidirectional encoders that may see the whole sentence at once.\n\nExample: when predicting the next word after \"The doctor told the patient that\" the model must not peek at words after the blank.",
  },
  {
    term: "Seq2seq",
    definition: "Seq2seq (sequence-to-sequence) is an encoder-decoder setup: the encoder reads the source sequence into a representation, the decoder generates the target sequence one token at a time conditioned on that representation.\n\nIt replaced many pipeline MT systems with one trainable stack.\n\nExample: encoder ingests English tokens for \"Where is the station?\"; decoder emits French tokens \"Où est la gare ?\" step by step.",
  },
  {
    term: "Information bottleneck",
    definition: "An information bottleneck is the failure mode where a model must squeeze a long, rich input through a single small summary vector before producing output, so details needed later are already discarded.\n\nAttention was introduced partly so decoders could pull specific source words instead of relying on one compressed bag.\n\nExample: translating a 80-word legal sentence through one 500-dimensional vector may lose whether the obligation is on the buyer or the seller; the wrong \"who must pay\" appears in the translation.",
  },
  {
    term: "Weighted sum",
    definition: "A weighted sum multiplies each item by a nonnegative (or signed) weight and adds the results, producing one number that tilts toward the heavily weighted items.\n\nAttention uses normalized weights so the sum is a soft blend of value vectors.\n\nExample: vectors for \"cat,\" \"sat,\" and \"mat\" with weights 0.6, 0.3, 0.1 yield a context vector mostly shaped like \"cat\" but with some \"sat\" mixed in.",
  },
  {
    term: "One-hot encoding",
    definition: "One-hot encoding represents a categorical item as a vector of zeros with a single 1 in the slot for that category's index.\n\nIt gives no learned notion that nearby categories are similar — every word is equally far from every other in cosine distance.\n\nExample: in a 10k-word vocabulary, \"cat\" might be index 537, so the vector has 1 at position 537 and 0 elsewhere; \"kitten\" at index 812 is orthogonal, not close.",
  },
  {
    term: "Skip-gram",
    definition: "Skip-gram is a Word2Vec training objective: given a center word in a sentence, predict the words that appear within a window around it, training embeddings so predictive context is possible.\n\nWords that share neighbors end up with similar vectors.\n\nExample: for \"physician treated the patient\" with center \"physician,\" the model might predict \"treated,\" \"patient,\" and nearby tokens; after training, \"physician\" and \"doctor\" sit near each other because their contexts overlap.",
  },
  {
    term: "Distributional hypothesis",
    definition: "The distributional hypothesis is the linguistic idea that words appearing in similar contexts tend to have similar meanings — \"you shall know a word by the company it keeps\" (Firth, 1957).\n\nModern static and contextual embeddings operationalize this with statistics over huge corpora.\n\nExample: \"physician\" and \"doctor\" both neighbor \"patient,\" \"hospital,\" \"diagnosed,\" so embedding methods pull their vectors together without a synonym list.",
  },
  {
    term: "BPE",
    altTerms: ["Byte Pair Encoding"],
    definition: "BPE (byte pair encoding) is a subword tokenizer: start from characters or bytes, repeatedly merge the most frequent adjacent pair in the training text, and stop at a chosen vocabulary size.\n\nRare words decompose into known pieces instead of an unknown-token bucket.\n\nExample: many merges might yield pieces \"un,\" \"happi,\" \"ness\" so \"unhappiness\" tokenizes without a dedicated whole-word id.",
  },
  {
    term: "Subword tokenization",
    definition: "Subword tokenization splits text into pieces between whole words and single characters so the vocabulary covers open-ended text with a finite symbol table.\n\nUnlike pure word tokenization, it handles typos, rare compounds, and morphology by reuse of fragments.\n\nExample: \"tokenization\" might become \"token\" + \"ization\" in one scheme, letting the model share structure with \"visualization\" and \"civilization.\"",
  },
];
