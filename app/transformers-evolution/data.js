// ============================================================
// INNOVATION DATA
// ============================================================
// Each entry represents one major innovation in the Transformer lineage.
//
// SCHEMA:
//   year:        number | string — year or year range
//   name:        string — display name of the innovation
//   diag:        string — key matching a diagram in diagrams.js
//   problem:     string — technical description of the problem solved
//   glossary:    Record<string, string> — term → definition pairs
//   whyNotSooner: string — why this wasn't invented earlier
//   examples:    string — comma-separated notable models (rendered as bullet list)
//
// ADDING A NEW ENTRY:
//   1. Add the object below in chronological order
//   2. Pick a unique `diag` key (lowercase, no spaces)
//   3. Create a matching diagram in diagrams.js using the same key
//   4. Keep `examples` comma-separated (each item becomes a bullet point)
// ============================================================

export const data = [
  {
    year: 1958,
    name: "The Perceptron",
    diag: "perceptron",
    problem: `Before 1958, computers could only follow rules that humans explicitly programmed. If you wanted a machine to recognize a handwritten letter, you had to write out every rule yourself. There was no way for a machine to learn patterns from examples on its own.

The perceptron introduced trainable weights — a set of numbers, one per input, that the machine adjusts automatically. The math is simple: multiply each input by its weight, sum them up, and check if the total exceeds a threshold. If the answer is wrong, nudge the weights toward the correct answer. The weights are the learned knowledge, and they update from data — no human rule-writing required.

The fatal limitation: a perceptron can only draw a straight line to separate categories (this property is called "linear separability"). If the data needs a curved boundary — or even something as simple as XOR ("true when exactly one input is on") — a single perceptron cannot learn it. This limit, proven mathematically by Minsky and Papert in 1969, froze the field for over a decade.`,
    glossary: {
      "Linearly separable": "Classes that can be divided by a straight line (or hyperplane). The perceptron's fundamental limit.",
      "Weight update rule": "If wrong, adjust weights by adding/subtracting the input vector. Provably converges for linearly separable data.",
      "Threshold function": "Output 1 if weighted sum exceeds threshold, else 0. The simplest activation.",
    },
    whyNotSooner: `Required McCulloch-Pitts' mathematical neuron model (1943) and Hebb's learning principle (1949). The idea that a machine could learn from examples — rather than being explicitly programmed — was radical. Available hardware (the Mark I Perceptron was electromechanical) barely sufficed for even single-layer experiments.`,
    examples: "Mark I Perceptron (hardware),Character recognition prototypes,Historical foundations of all neural networks",
  },
  {
    year: 1986,
    name: "Backpropagation",
    diag: "backprop",
    problem: `Multi-layer networks — stacking several layers of perceptrons — could in theory represent complex, non-linear patterns, solving XOR and far beyond. But there was no efficient way to train them. The problem: when the output is wrong, you can adjust the final layer's weights directly. But what about the hidden layers buried inside? Their contribution to the error is indirect, and no clear method existed to figure out how to nudge them.

Backpropagation solved this using the chain rule — a calculus formula for derivatives of composed functions. Applied layer by layer from output back to input, it computes exactly how much each weight in every layer contributed to the error. This gives you a gradient — a direction to adjust each weight to reduce the error. The process of repeatedly following this direction is called gradient descent. Together, backprop + gradient descent made end-to-end training of deep networks practical for the first time.`,
    glossary: {
      "Chain rule": "Calculus rule for derivatives of composed functions: d(f(g(x)))/dx = f'(g(x))·g'(x). Backprop applies this layer by layer.",
      "Hidden layer": "A layer between input and output. Cannot be trained by the perceptron rule — needs backprop.",
      "Gradient descent": "Iteratively adjust weights in the direction that reduces error. Backprop computes the direction.",
    },
    whyNotSooner: `The math (chain rule) was centuries old, and automatic differentiation was described by Linnainmaa in 1970. Werbos applied backprop to networks in his 1974 thesis. But Rumelhart, Hinton & Williams' 1986 paper demonstrated it on compelling problems and reached the right audience. The field also needed to recover from the "AI winter" triggered by Minsky & Papert's 1969 critique of perceptrons.`,
    examples: "NETtalk (text-to-speech),Handwriting recognition,Foundation for ALL deep learning that followed",
  },
  {
    year: 1986,
    name: "Recurrent Neural Networks (RNNs)",
    diag: "rnn",
    problem: `Feedforward networks (including multi-layer perceptrons) processed each input independently — they had no memory and no notion of order. Feed in the word "bank" and the network has no idea whether it appeared after "river" or "savings." For tasks like speech or language, where meaning depends on what came before, this was a fundamental limitation.

Recurrent Neural Networks added a loop: at each timestep, the network takes two inputs — the current data and its own output from the previous step. This previous output is called the hidden state — a vector of numbers acting as "working memory." The formula is: h_t = f(W·x_t + U·h_{t-1}), where h_t is the new hidden state, x_t is the current input, and W and U are learned weight matrices. This gives the network short-term memory across a sequence.

The limitation was practical: training requires "unrolling" the loop across all timesteps and running backpropagation through the full chain (called BPTT — Backpropagation Through Time). Over more than ~10–20 steps, gradients either vanish (shrink to near-zero) or explode (grow uncontrollably), making it impossible to learn long-range dependencies.`,
    glossary: {
      "Recurrence": "Feeding a network's output back as input at the next timestep, creating a loop that carries temporal state.",
      "Hidden state": "An internal vector updated at each timestep, serving as the network's 'working memory' of past inputs.",
      "BPTT": "Backpropagation Through Time — unrolling the recurrence and applying backprop across all timesteps.",
    },
    whyNotSooner: `Jordan networks (1986) introduced feedback connections, and Elman networks (1990) popularized the simple recurrent architecture. But training them required BPTT — the insight that unrolling a recurrence over time creates a very deep feedforward network — which Werbos formalized in 1988. Limited compute also constrained experimentation — training even small RNNs on meaningful sequences was slow.`,
    examples: "Early speech recognition,Time series prediction,Simple language models,Precursor to LSTMs and all sequence modeling",
  },
  {
    year: 1997,
    name: "Long Short-Term Memory (LSTM)",
    diag: "lstm",
    problem: `RNNs could theoretically handle sequences, but in practice they forgot quickly. The root cause is the vanishing gradient problem — a mathematical phenomenon. During backpropagation through time, gradients are multiplied at each timestep. If those multiplied values are consistently less than 1, the gradient shrinks exponentially — after 20 steps, 0.9²⁰ ≈ 0.12; after 100 steps, effectively zero. The network simply cannot learn that a word from 50 steps ago matters now.

The LSTM solved this by introducing a cell state — a separate memory vector that runs through time via addition rather than multiplication, acting as a "constant error carousel" that preserves gradients. Three gates — each a small neural network outputting values between 0 and 1 — control information flow: the forget gate decides what to erase from memory, the input gate decides what new information to write, and the output gate decides what to expose at each step. Because the cell state is updated by addition, gradients can flow through hundreds of timesteps without vanishing.`,
    glossary: {
      "Vanishing gradient": "Gradients shrink toward zero as they pass through many layers, halting learning.",
      "BPTT": "Backpropagation Through Time — unrolling a recurrent net across timesteps and applying chain rule.",
      "Gated cell state": "A memory vector controlled by learned sigmoid gates that regulate information flow.",
    },
    whyNotSooner: `Hochreiter's 1991 diploma thesis already identified the vanishing gradient problem, but the mathematical framework for gating was non-obvious — it required the insight that a linear self-connection (the cell state) could be modulated by multiplicative gates. Hardware limitations also meant that the LSTM's higher per-step cost relative to simple RNNs was a serious concern in 1997.`,
    examples: "Google Translate (2016–2020 era),Siri,Alexa voice models,OpenAI Sentiment Neuron (2017)",
  },
  {
    year: 2013,
    name: "Word Embeddings (Word2Vec)",
    diag: "word2vec",
    problem: `Before Word2Vec, words were fed to neural networks as one-hot vectors — a data representation where each word is a list of 50,000 numbers (one per word in the vocabulary), all zeros except a single 1 at that word's index. This means "cat" and "kitten" are exactly as far apart as "cat" and "plutonium." The representation encodes no notion of meaning or similarity.

Word2Vec learned dense embeddings — compact vectors of ~300 numbers — where semantic relationships become geometric relationships. The training method (called skip-gram) is surprisingly simple: given a word in a sentence, predict the words surrounding it. A word that consistently appears near "fur" and "purr" gets pulled close to other animal words in vector space. The result: vec("king") − vec("man") + vec("woman") ≈ vec("queen"). Meaning is encoded as direction and distance in a continuous space, and these vectors became the standard input representation for all subsequent neural NLP — including every Transformer.`,
    glossary: {
      "One-hot encoding": "A vector of all zeros except one 1 at the word's index. No similarity structure — every pair is equidistant.",
      "Embedding": "A learned dense vector (typically 100–300 dimensions) representing a word in continuous space.",
      "Skip-gram": "Training objective: given a word, predict its neighbors. Forces the model to encode meaning in the vector.",
      "Distributional hypothesis": "Words appearing in similar contexts have similar meanings (Firth, 1957). The linguistic foundation for all embedding methods.",
    },
    whyNotSooner: `Latent Semantic Analysis (Deerwester et al., 1990) and neural language models (Bengio, 2003) explored similar ideas, but were either linear or too slow. Mikolov's key contribution was a simplified architecture (no hidden layer) with negative sampling, making it feasible to train on billions of words. The specific training objectives (skip-gram, CBOW) were non-obvious simplifications that worked far better than expected.`,
    examples: "Word2Vec,GloVe (2014),FastText,Foundation for all Transformer embedding layers",
  },
  {
    year: 2014,
    name: "Neural Attention (Soft Alignment)",
    diag: "attention",
    problem: `The dominant approach to machine translation was the encoder-decoder model — an architectural pattern where one neural network (the encoder) reads the entire input sentence and compresses it into a single fixed-size vector, then another network (the decoder) generates the output from that vector alone. This is an information bottleneck: imagine summarizing a 50-word sentence into one point in space. For long inputs, critical details are inevitably lost, and the decoder has no way to "look back" at specific parts of the source.

Attention removed the bottleneck by letting the decoder look at all of the encoder's outputs at every step. At each generation step, the decoder computes a relevance score for each encoder position, producing a set of weights that sum to 1 (via softmax — a mathematical function that converts raw scores into a probability distribution). The decoder then takes a weighted sum of all encoder states, focusing on the most relevant parts. The model dynamically decides where to look based on what it's currently producing — a form of learned, differentiable addressing.`,
    glossary: {
      "Seq2seq": "Sequence-to-sequence — an encoder reads input, a decoder generates output token by token.",
      "Information bottleneck": "Forcing all input information through a fixed-dimensional vector loses detail.",
      "Weighted sum": "Each encoder state gets a learned relevance score; the context is their weighted combination.",
    },
    whyNotSooner: `The idea of "soft addressing" existed in associative memory literature, but connecting it to gradient-based end-to-end training in NLP required the seq2seq paradigm to mature first. Before neural machine translation took off (~2013–14), there was no compelling large-scale task where the bottleneck was painfully obvious enough to motivate the mechanism.`,
    examples: "Google Neural Machine Translation (GNMT),Early seq2seq chatbots",
  },
  {
    year: 2015,
    name: "Residual Networks (Skip Connections)",
    diag: "resnet",
    problem: `A natural intuition says: a deeper network should be at least as powerful as a shallower one — in the worst case, the extra layers could simply learn to pass data through unchanged. In practice, the opposite happened. Adding more layers made networks perform worse, even on training data. This wasn't overfitting (memorizing training data) — it was an optimization failure. Gradient descent simply couldn't find good solutions in deeper networks. This was called the degradation problem.

He et al.'s solution was the skip connection — an architectural pattern where, instead of each layer learning the full desired output H(x), it only learns the residual F(x) = H(x) − x, and the layer's output is F(x) + x. The "+ x" is a direct wire from input to output, bypassing the layer entirely. If the optimal behavior for a layer is "do nothing," it just needs to learn F(x) = 0, which is far easier than learning H(x) = x. This simple change made training 100+ layer networks feasible, and is now a structural component of every Transformer block.`,
    glossary: {
      "Skip connection": "Routing the input of a layer directly to its output, bypassing the layer's computation. Also called a shortcut connection.",
      "Residual learning": "Instead of learning full output H(x), learn the difference F(x) = H(x) − x. Easier to optimize because the default (F=0) is identity.",
      "Degradation problem": "Deeper networks have HIGHER training error than shallower ones — not overfitting but optimization failure.",
    },
    whyNotSooner: `Highway Networks (2015, Schmidhuber) introduced gated skip connections months earlier, but required learned gating parameters. He et al.'s insight was that parameter-free identity shortcuts worked better — simpler was superior. The idea that adding layers could HURT optimization was counterintuitive and took careful empirical work to diagnose.`,
    examples: "ResNet-50/101/152,Every Transformer (uses skip connections in every block),DenseNet,U-Net",
  },
  {
    year: 2017,
    name: "The Transformer",
    diag: "transformer",
    problem: `RNNs and LSTMs processed tokens one at a time in sequence — each step's computation depended on the previous step's result. This sequential dependency is as much a hardware constraint as an architectural one: modern GPUs excel at parallel computation (doing thousands of operations simultaneously), but sequential processing leaves most of the GPU idle. Training on long sequences was extremely slow, and even with LSTMs, information from distant tokens was diluted.

The Transformer ("Attention Is All You Need," Vaswani et al.) replaced sequential recurrence entirely with self-attention — a computation pattern where every token directly computes a relationship score with every other token, all at once. Each token is projected into three vectors: a query ("what am I looking for?"), a key ("what do I contain?"), and a value ("what information do I carry?"). Attention scores are computed as dot products between queries and keys, scaled and passed through softmax to get weights, then used to produce a weighted sum of values. This runs in parallel across all positions.

The original architecture was an encoder-decoder model designed for machine translation. Subsequent work split it: GPT used only the decoder (for generation), BERT used only the encoder (for understanding). To compensate for removing sequential processing (which inherently encodes word order), the Transformer adds positional encodings — fixed signals injected into the input that tell the model where each token sits. Each Transformer block also uses residual connections (the skip connections from ResNet) and layer normalization (a numerical stabilization technique) to keep training stable.`,
    glossary: {
      "Self-attention": "Each token attends to every other token via queries, keys, and values.",
      "Multi-head": "Running several attention functions in parallel, each learning different patterns.",
      "Positional encoding": "Injected signals that tell the model where each token sits.",
      "Residual connection": "Adding the input of a sublayer to its output, easing gradient flow.",
    },
    whyNotSooner: `The core math (scaled dot-product attention) was simple. The breakthrough was architectural boldness — entirely removing recurrence felt risky when LSTMs were state-of-the-art. It required sufficient GPU memory for the O(n²) attention matrix. Cultural inertia of the RNN paradigm delayed the leap.`,
    examples: "Every modern LLM — GPT-4,Claude,Gemini,Llama,Mistral,DeepSeek all descend from this",
  },
  {
    year: 2018,
    name: "GPT-1 (Generative Pre-Training)",
    diag: "gpt1",
    problem: `Before GPT, every NLP task — sentiment analysis, question answering, translation — required training its own model from scratch on task-specific labeled data. Labeled data is expensive: humans must manually annotate thousands of examples for each task. Meanwhile, vast amounts of unlabeled text (books, websites, articles) sat unused because there was no clear way to extract general linguistic knowledge from raw text.

GPT introduced a two-phase approach. First, pre-training (a training technique): take a Transformer decoder and train it on a simple objective — predict the next word, given all preceding words. This is autoregressive language modeling, and it requires no labels, just raw text. Through billions of next-word predictions, the model absorbs grammar, facts, and reasoning patterns. Second, fine-tuning (an adaptation technique): take the pre-trained model and train it further on a small labeled dataset for your specific task. The linguistic knowledge transfers, so you need far less labeled data than training from scratch.`,
    glossary: {
      "Autoregressive": "Generating one token at a time, each conditioned on all previous tokens.",
      "Pre-training": "Training on a large unsupervised corpus before task-specific fine-tuning.",
      "Fine-tuning": "Adapting a pre-trained model to a specific task with a small labeled dataset.",
    },
    whyNotSooner: `Word2Vec and ELMo showed pre-trained representations helped, but were shallow or feature-based. Pre-training an entire deep generative model end-to-end required confidence that Transformers were expressive enough and enough unlabeled text existed.`,
    examples: "GPT-1 itself; paradigm lives on in all modern LLMs",
  },
  {
    year: 2018,
    name: "BERT (Bidirectional Encoder)",
    diag: "bert",
    problem: `GPT's pre-training was unidirectional — it only looked at previous tokens when making predictions, because it was trained to predict the next word left-to-right. This means when encoding the word "bank" in "I went to the river bank to fish," GPT can use "river" but not "fish." For understanding tasks (classification, question answering), you often need both directions of context to grasp meaning.

BERT solved this with masked language modeling (a training technique): randomly hide 15% of the tokens in a sentence (replacing them with a [MASK] token), then train the model to predict the hidden words from the full surrounding context — both left and right simultaneously. BERT uses a Transformer encoder (which allows attention in all directions), producing deeply bidirectional representations. The trade-off: BERT excels at understanding text but cannot generate it token-by-token like GPT, because it was trained to fill in blanks, not to produce text sequentially.`,
    glossary: {
      "Masked language modeling": "Hiding random tokens and training the model to reconstruct them from surrounding context.",
      "Bidirectional context": "Attending to both left and right context simultaneously.",
    },
    whyNotSooner: `Bidirectional models like ELMo existed but used shallow concatenation of forward and backward LSTMs. The insight that masking + Transformer encoder could produce deeply bidirectional representations required the Transformer to exist first.`,
    examples: "Google Search (2019–present),RoBERTa,DeBERTa,Most NLU/classification systems",
  },
  {
    year: 2019,
    name: "GPT-2 / Scaling Laws Emerge",
    diag: "gpt2",
    problem: `After GPT-1 proved that pre-training followed by fine-tuning worked, a natural question arose: does making the model bigger just give proportionally better results, or does something qualitatively different happen? The prevailing assumption was that bigger models would be incrementally better at the same tasks, still requiring the same fine-tuning process.

GPT-2, with 1.5 billion parameters (10x larger than GPT-1), revealed something unexpected: the model could perform tasks it was never fine-tuned for. Given a prompt like "Translate English to French:" followed by an English sentence, it produced reasonable translations — with zero task-specific training. This zero-shot transfer — the ability to perform tasks with no task-specific examples — suggested that raw scale might substitute for task-specific engineering. The model was trained on the exact same objective (predict the next word), just with more parameters and more data.`,
    glossary: {
      "Zero-shot": "Performing a task without any task-specific examples.",
      "Zero-shot transfer": "Performing a task the model was never explicitly trained on, using only knowledge from pre-training.",
    },
    whyNotSooner: `Compute was the binding constraint. Training GPT-2 required hundreds of GPU-days, feasible only for well-funded labs. The intellectual leap — that raw scale could substitute for task-specific engineering — contradicted prevailing wisdom.`,
    examples: "GPT-2 itself; proved the scaling hypothesis leading to GPT-3/4",
  },
  {
    year: 2020,
    name: "GPT-3 / Few-Shot In-Context Learning",
    diag: "gpt3",
    problem: `Even with GPT-2's surprising zero-shot abilities, practical tasks still typically required fine-tuning — collecting labeled data and running additional training. This was a significant barrier: fine-tuning requires ML expertise, compute resources, and a fresh dataset for every new task.

GPT-3 (175B parameters, over 100x GPT-2) demonstrated in-context learning: you place a few examples of the desired task directly in the prompt — say, three pairs of "English: ... French: ..." translations — and the model continues the pattern correctly for new inputs. No weight updates occur; the model "learns" the task purely from the examples provided in a single forward pass. This is called few-shot prompting. The mechanism is still not fully understood — the model appears to implicitly run a learning algorithm during inference. This capability scales with model size; smaller models cannot do it reliably.`,
    glossary: {
      "In-context learning": "The model adapts based on examples in the prompt, without gradient updates.",
      "Few-shot": "Providing a small number of examples in the prompt.",
      "Prompt": "The text input given to the model.",
    },
    whyNotSooner: `In-context learning is an emergent property of scale — smaller models can't do it. The $4.6M training cost was inaccessible to most. The idea that a forward pass could implicitly implement a learning algorithm was not anticipated.`,
    examples: "GPT-3 via API; foundation for ChatGPT,Copilot,The entire LLM application ecosystem",
  },
  {
    year: 2020,
    name: "Vision Transformer (ViT)",
    diag: "vit",
    problem: `Computer vision had been dominated for nearly a decade by Convolutional Neural Networks (CNNs). CNNs have strong built-in assumptions about images — called inductive biases: their filters are local (looking at small patches), translation-invariant (the same filter works everywhere), and hierarchically structured (early layers detect edges, later layers detect objects). These assumptions are correct and helpful, but they also mean the architecture is specialized for spatial data and can't easily transfer to other domains.

The Vision Transformer (ViT) asked: what if you just treat an image like a sentence? It splits an image into a grid of patches (e.g., 16x16 pixel squares), flattens each patch into a vector, and feeds the sequence of patch vectors into a standard Transformer — the same architecture used for text. With no built-in spatial knowledge, ViT needs large datasets to learn spatial relationships from scratch. But given enough data, it matched or exceeded CNNs, proving the Transformer is a general-purpose sequence processor, not just a language model.`,
    glossary: {
      "CNN": "Convolutional Neural Network — uses learned spatial filters.",
      "Inductive bias": "Built-in assumptions about data structure.",
      "Image patches": "Splitting an image into tiles (e.g., 16×16 pixels), each treated as a token.",
    },
    whyNotSooner: `CNNs were extremely well-optimized and entrenched. ViT required large-scale datasets (JFT-300M) to overcome the lack of spatial inductive bias. The leap of "just flatten patches into a sequence" seemed too simplistic.`,
    examples: "CLIP,DALL·E,Stable Diffusion,Segment Anything (SAM),DINOv2",
  },
  {
    year: 2020,
    name: "Mixture of Experts (MoE)",
    diag: "moe",
    problem: `In a standard ("dense") Transformer, every parameter is used for every input token. If a model has 70 billion parameters, all 70 billion are involved in processing the word "the." The computational cost (measured in FLOPS — floating-point operations) scales directly with total parameter count. To make a model smarter, you need proportionally more compute per token — an expensive trade-off.

Mixture of Experts breaks this link between total parameters and per-token cost. Instead of one large feed-forward network in each Transformer layer, MoE uses several smaller "expert" sub-networks. A gating function (a small learned router) examines each token and sends it to just 1–2 of the available experts. A model can have, say, 8x7B = 56B total parameters but only activate 7B per token — the same cost as a regular 7B model, but with access to far more specialized knowledge. The engineering challenge is load-balancing: making sure all experts get used roughly equally, so no expert is wasted and no expert is overloaded.`,
    glossary: {
      "Dense model": "All parameters used for every input.",
      "Expert": "A sub-network that specializes in certain tokens.",
      "Gating function": "A small network deciding which experts each token routes to.",
    },
    whyNotSooner: `MoE was proposed in 1991 (Jacobs et al.). Shazeer et al. (2017) demonstrated it at scale with LSTMs, but the engineering challenges — load-balancing on distributed hardware, preventing expert collapse, and communication overhead — delayed widespread adoption. It took Switch Transformer (2021) and modern infrastructure with auxiliary losses to make it reliable in production Transformers.`,
    examples: "Mixtral 8x7B,GPT-4 (rumored MoE),DeepSeek-V3,Grok-1,Gemini 1.5",
  },
  {
    year: 2021,
    name: "Rotary Position Embeddings (RoPE)",
    diag: "rope",
    problem: `The original Transformer added absolute positional encodings — a fixed vector for each position index (position 1, position 2, etc.) added directly to the token embedding. The problem: a model trained on sequences up to 2,048 tokens has never seen position 2,049. Its positional encoding is undefined, and the model breaks on longer sequences. This is the length generalization problem — a model limitation baked into the position representation.

RoPE encodes position through rotation rather than addition. Instead of adding a position vector, RoPE rotates the query and key vectors in 2D subspaces by an angle proportional to their position. The mathematical insight: when you compute the dot product of a rotated query at position m and a rotated key at position n, the rotation angles partially cancel, and the result depends only on the relative distance (m − n), not the absolute positions. This uses Euler's formula (e^{iθ} = cosθ + i·sinθ) to encode positions as rotations. The model naturally generalizes to longer sequences because it only needs to understand relative distances, not memorize specific position indices.`,
    glossary: {
      "Absolute position encoding": "A fixed vector for each position index, added to the embedding.",
      "Relative position": "Encoding distance between tokens rather than absolute indices.",
      "Length extrapolation": "Handling sequences longer than seen during training.",
    },
    whyNotSooner: `Relative position encodings existed but required complex attention modifications. RoPE's insight — rotation matrices via Euler's formula — was mathematically elegant but non-obvious.`,
    examples: "Llama 1/2/3,Mistral,Qwen,DeepSeek,Gemma — nearly all open-weight models",
  },
  {
    year: "2021–22",
    name: "Instruction Tuning (SFT)",
    diag: "sft",
    problem: `A pre-trained language model has absorbed enormous knowledge from its training data, but it was trained to predict the next word — not to be helpful. Ask it "What is the capital of France?" and it will likely continue with more trivia questions rather than answering "Paris." The model treats every input as text to continue, not as an instruction to follow. The knowledge is there, but there's no reliable way to access it.

Instruction tuning (also called Supervised Fine-Tuning, or SFT) solves this by training the model on thousands of (instruction, ideal response) pairs across diverse task types — question answering, summarization, translation, coding, creative writing. The training uses standard supervised learning (the same loss function used in pre-training), but the data explicitly demonstrates what "following an instruction" looks like. The key insight: training on a diverse set of tasks teaches the model the general pattern of instruction-following, so it generalizes to new instruction types it has never seen. This was also shown to be the essential first step before RLHF — without SFT, reinforcement-learning-based alignment largely fails.`,
    glossary: {
      "SFT": "Supervised Fine-Tuning — training on curated (prompt, ideal response) pairs with standard cross-entropy loss.",
      "Instruction following": "The ability to treat the input as a directive rather than text to continue.",
      "Task diversity": "Training on many different task formats (QA, summarization, translation, code) so the model generalizes to new instruction types.",
    },
    whyNotSooner: `Required large enough base models that had latent capabilities worth unlocking. Earlier fine-tuning was task-specific (one model per task). The insight that diverse multi-task instruction data could produce a general-purpose assistant was not obvious — it contradicted the "specialist beats generalist" intuition.`,
    examples: "FLAN (Google 2021),InstructGPT SFT stage,Alpaca,Vicuna,Every chat model's first training stage",
  },
  {
    year: 2022,
    name: "RLHF",
    diag: "rlhf",
    problem: `Even after instruction tuning, a model optimized for next-token prediction can produce outputs that are fluent but unhelpful, evasive, or harmful. The core issue: "predict the most likely next word" is not the same objective as "be helpful and harmless." The training loss function doesn't encode human values — it encodes statistical patterns of text. A model might give a technically plausible but misleading answer, or generate toxic content that appeared in its training data.

RLHF aligns the model in two stages. First, train a reward model (a separate neural network): show human raters two different model responses to the same prompt, and they pick the better one. The reward model learns to predict which response humans would prefer. Second, use reinforcement learning — specifically PPO (Proximal Policy Optimization, a stable RL algorithm) — to adjust the language model's weights to maximize the reward model's score, with a KL penalty (a mathematical constraint) that prevents the model from drifting too far from its pre-trained behavior. Later work, notably DPO (2023), showed this could be simplified to a single supervised-learning step on preference pairs, eliminating the RL loop entirely.`,
    glossary: {
      "Reward model": "Predicts which of two outputs a human would prefer.",
      "PPO": "Proximal Policy Optimization — stable RL policy updates.",
      "KL penalty": "Prevents straying too far from the pre-trained distribution.",
      "Alignment": "Making model behavior match human values.",
    },
    whyNotSooner: `Components existed separately. RL training of large LMs is unstable, reward models need expensive human annotation, and KL-constrained optimization needs careful tuning. The human data pipeline was the bottleneck. Later simplified by DPO (2023), which derived a closed-form solution eliminating the RL loop entirely.`,
    examples: "ChatGPT,Claude,Gemini — standard alignment for all frontier models,DPO (2023) simplified this to supervised learning on preference pairs",
  },
  {
    year: 2022,
    name: "Chain-of-Thought Prompting",
    diag: "cot",
    problem: `When given a math problem like "If a train travels 60 mph for 2.5 hours, how far does it go?", LLMs trained to produce answers directly often get it wrong. The reason is architectural: a Transformer allocates a fixed amount of computation per output token. For a hard problem, the model must "think" in one step — the same amount of compute it uses to answer "What color is the sky?" There is no mechanism for working through intermediate steps.

Chain-of-thought prompting showed that simply asking the model to "think step by step" — or providing examples that include intermediate reasoning — dramatically improved accuracy on math, logic, and multi-step problems. By producing intermediate tokens ("60 x 2.5 = 150, so the answer is 150 miles"), the model effectively gets more serial compute: each token generation step becomes a "thinking" step that decomposes the problem. This required no architectural change and no retraining — just a different prompt. It revealed that LLMs can reason more accurately when given the "space" to work through problems sequentially, token by token.`,
    glossary: {
      "Multi-step reasoning": "Problems requiring sequential logical steps.",
      "Serial compute": "Using multiple sequential tokens to solve harder problems.",
    },
    whyNotSooner: `Embarrassingly simple in hindsight. Researchers treated LLMs as Q&A systems rather than reasoning systems that could benefit from "thinking out loud." The prompting paradigm itself was new.`,
    examples: "All frontier model prompting; formalized in o1/o3,Claude reasoning mode",
  },
  {
    year: 2022,
    name: "Compute-Optimal Scaling (Chinchilla)",
    diag: "chinchilla",
    problem: `By 2022, the prevailing strategy for building better language models was to make them as large as possible: GPT-3 had 175 billion parameters, and labs were racing to build even bigger ones. The assumption was that more parameters = better performance. Data was treated as relatively cheap and abundant. GPT-3 was trained on 300 billion tokens — roughly 1.7 tokens per parameter.

Hoffmann et al. at DeepMind discovered this was drastically wrong. By training over 400 models at different sizes and data amounts, they mapped out a scaling law — a mathematical relationship showing that for any fixed compute budget, there is an optimal balance between model size and training data. The formula says roughly 20 tokens per parameter is optimal, meaning GPT-3 was undertrained by more than 10x. Their 70B-parameter "Chinchilla" model, trained on 1.4 trillion tokens, outperformed a 280B-parameter model (Gopher) using the same total compute. This reshaped the field: subsequent open models like Llama followed Chinchilla's ratio, prioritizing data quantity over model size.`,
    glossary: {
      "Compute-optimal": "The model size and data amount that jointly maximize performance for a fixed FLOP budget.",
      "Scaling law": "Power-law relationship between compute/data/parameters and model performance.",
      "Tokens-to-parameters ratio": "Chinchilla's finding: ~20 tokens per parameter is optimal. GPT-3 had ~1.7.",
    },
    whyNotSooner: `Required training dozens of models at multiple scales and fitting precise scaling curves — experiments costing millions of dollars that only DeepMind could run. The result contradicted the "bigger model = better" intuition that drove GPT-3. Also required careful statistical methodology to disentangle model size from data size effects.`,
    examples: "Chinchilla (70B),Llama 1 (65B on 1.4T tokens),Llama 2/3,Reshaped all open-source model training",
  },
  {
    year: 2022,
    name: "Flash Attention",
    diag: "flash",
    problem: `Self-attention computes a score between every pair of tokens, producing an N×N matrix (where N is the sequence length). In a standard implementation, this entire matrix is created in HBM (High Bandwidth Memory — the GPU's main memory, which is large but relatively slow to access). For a sequence of 4,096 tokens, that's ~16 million entries. The memory cost is O(N²): doubling the sequence length quadruples memory usage. This is a hardware constraint, not an algorithmic one — the math of attention doesn't actually require the full matrix to exist at once.

FlashAttention exploited the GPU's memory hierarchy: GPUs have a small but very fast on-chip memory called SRAM, roughly 100x faster than HBM. Instead of materializing the full N×N matrix, FlashAttention computes attention in tiles — small blocks that fit in SRAM — and fuses multiple operations (the matrix multiply, softmax, and value weighting) into a single GPU kernel. Memory usage drops from O(N²) to O(N), and the operation runs 2–4x faster despite doing the exact same math. This is pure systems engineering — no change to the model or its outputs, just a dramatically more efficient implementation.`,
    glossary: {
      "HBM": "High Bandwidth Memory — large but relatively slow GPU memory.",
      "SRAM": "Static RAM — small but very fast on-chip memory.",
      "Tiling": "Breaking large operations into blocks that fit in fast memory.",
      "Kernel fusion": "Combining GPU operations to reduce memory reads/writes.",
    },
    whyNotSooner: `Required deep GPU memory hierarchy knowledge — most ML researchers think in FLOPS, not bandwidth. Dao et al. bridged systems engineering and ML research, typically separate communities.`,
    examples: "Every modern Transformer stack (PyTorch,JAX,vLLM,TensorRT-LLM)",
  },
  {
    year: 2023,
    name: "GPT-4 / Multimodal Models",
    diag: "gpt4",
    problem: `Through 2022, frontier language models processed only text. The world, however, is multimodal — people communicate with images, diagrams, charts, and screenshots alongside words. A text-only model cannot read a photograph, interpret a graph, or understand a meme. This limited LLMs to tasks where all relevant information could be expressed as text.

GPT-4 and its contemporaries added vision by connecting a visual encoder (typically a Vision Transformer that converts an image into a sequence of embedding vectors) to the language model. The image embeddings are projected into the same vector space as text token embeddings, and from the Transformer's perspective, an image is just another sequence of tokens interleaved with text. This enables cross-modal reasoning: the model can answer questions about an image, describe a chart, or follow instructions that reference visual content.`,
    glossary: {
      "Multimodal": "Processing multiple modalities (text, images, audio).",
      "Visual encoder": "A ViT-based model converting pixels into embeddings.",
      "Embedding space": "Vector space where text and image representations live.",
    },
    whyNotSooner: `Individual pieces existed. Challenges: training stability when mixing modalities at scale, curating balanced datasets, and enormous compute. CLIP (2021) was a prerequisite for vision-language alignment.`,
    examples: "GPT-4o,Claude (vision),Gemini 1.5 Pro,Llama 3.2 Vision",
  },
  {
    year: "2023–24",
    name: "Long Context (100K+ Tokens)",
    diag: "longctx",
    problem: `Standard Transformers were trained with context windows of 2,048 to 4,096 tokens — roughly 3–6 pages of text. Anything beyond that was cut off. This limited the model's ability to work with long documents, codebases, or extended conversations. The constraint came from multiple sources: the O(N²) cost of attention (a computational constraint), position encodings that don't generalize beyond training lengths (a model limitation), and training data that predominantly consisted of short documents.

Extending to 100K+ tokens required solving several sub-problems simultaneously. RoPE with NTK-aware scaling (a mathematical adjustment to rotation frequencies) allowed position encodings to extrapolate to unseen lengths. FlashAttention-2 made the O(N²) computation feasible for long sequences. Ring attention (a distributed computing technique) split the sequence across multiple GPUs along the sequence dimension. And progressive training — starting with short contexts and gradually lengthening them — taught models to actually use the additional context rather than ignoring distant tokens. No single technique was sufficient; the breakthrough was combining all of them.`,
    glossary: {
      "Context window": "Maximum tokens processed in one pass.",
      "NTK-aware scaling": "Adjusting RoPE frequencies for extrapolation.",
      "Ring attention": "Distributing attention across GPUs along the sequence dimension.",
    },
    whyNotSooner: `Each sub-problem was a separate research area. The combination required solving all simultaneously. Models trained on short documents couldn't utilize long contexts even when the architecture supported it.`,
    examples: "Claude (200K),Gemini 1.5 (1M+),GPT-4 Turbo (128K),Llama 3.1 (128K)",
  },
  {
    year: "2024–25",
    name: "Test-Time Compute / Thinking Models",
    diag: "ttc",
    problem: `A standard LLM uses exactly the same amount of computation for every query — the same number of matrix multiplications whether you ask "What's 2+2?" or "Prove this theorem." This is because a Transformer's compute per token is fixed by its architecture: each layer does the same operations regardless of difficulty. The model cannot "think harder" about hard problems.

Test-time compute scaling lets models allocate additional computation to harder problems during inference (not during training — hence "test-time"). The model generates extended reasoning chains — long sequences of intermediate thoughts, self-verification steps ("let me check that..."), and backtracking ("that approach doesn't work, let me try..."). This is trained using reinforcement learning with process reward models — neural networks that evaluate the quality of each intermediate reasoning step, not just the final answer. The result: models can spend 10x more compute on a difficult math proof than on a simple factual question, dynamically matching effort to difficulty.`,
    glossary: {
      "Test-time compute": "Additional computation during inference.",
      "Self-verification": "The model checking its own intermediate steps.",
      "Backtracking": "Revising a reasoning path and trying an alternative.",
    },
    whyNotSooner: `Training models to reliably use extra compute required new RL-based regimes and process reward models evaluating intermediate steps. The training signal for "how to think well" is much harder to obtain.`,
    examples: "OpenAI o1/o3,Claude with extended thinking,DeepSeek-R1,Gemini 2.0 Flash Thinking",
  },
  {
    year: "2023–26",
    name: "SSM Hybrids (Mamba, RWKV, Jamba)",
    diag: "ssm",
    problem: `Even with FlashAttention, the Transformer's attention mechanism has a fundamental O(N²) cost: every token must attend to every other token. Double the sequence length and you quadruple the computation. For very long sequences (100K+ tokens), this becomes a hardware bottleneck — the actual math is the limiting factor, not just memory management.

State-space models (SSMs) offer an alternative rooted in control theory — a branch of mathematics dealing with dynamical systems. Instead of computing all pairwise interactions, an SSM processes each token in sequence, updating a fixed-size hidden state — similar to an RNN, but with structured state transitions derived from continuous-time differential equations, discretized for sequential data. This gives O(N) time complexity — linear in sequence length. The catch: pure SSMs struggle to match attention's ability to retrieve specific information from earlier in the sequence.

Hybrid architectures get the best of both by interleaving SSM layers (for efficient long-range processing) with sparse attention layers (for precise information retrieval). Models like Mamba introduced selective gating, which lets the SSM dynamically decide what to store in its state based on input content, closing much of the quality gap with full attention.`,
    glossary: {
      "State-space model": "Sequence model based on discretized dynamical systems.",
      "Linear attention": "Replacing softmax attention with kernel-based linear recurrences.",
      "Hybrid": "Combining attention + SSM layers in one model.",
    },
    whyNotSooner: `SSMs existed in control theory for decades. Making them competitive on language required selective gating (Mamba) and hardware-aware implementations. Full attention is a strong baseline with a persistent quality gap.`,
    examples: "Mamba-2,RWKV-6,Jamba (AI21),Zamba,Various on-device/edge models",
  },
  {
    year: "2025–26",
    name: "Agentic Tool Use & Planning",
    diag: "agentic",
    problem: `No matter how capable, a language model fundamentally just produces text. It can write code but not run it. It can describe a web search but not perform one. It can recommend a file edit but not execute it. The boundary is clear: the model generates a string of characters, and any actual effect on the world requires a human to take action.

Agentic frameworks break this boundary by giving the model a loop: generate a tool call (a structured request, typically JSON, specifying which function to invoke and with what arguments), observe the result, and decide what to do next. The model might write code, execute it in a sandboxed environment (an isolated runtime that prevents unsafe operations), observe the output or error, and revise its approach. This is re-planning — adapting strategy based on observed outcomes, not just generating a fixed response.

The reason this only became practical in 2024–25 is reliability: agentic tasks chain multiple steps, and errors compound. If each step has 95% accuracy, a 10-step task succeeds only 60% of the time. Instruction following, structured output generation, and long context — all prerequisites — only reached sufficient quality in 2023–24.`,
    glossary: {
      "Function calling": "Structured JSON specifying which function to invoke.",
      "Sandboxed execution": "Running tools in an isolated environment.",
      "Re-planning": "Adjusting the plan based on observed outcomes.",
    },
    whyNotSooner: `Model capability (instruction following, structured output, long context) only reached sufficient quality in 2023–24. Reliable tool use requires ~99% per-step accuracy — 95% compounds to 60% over 10 steps. Safety infrastructure also needed to mature.`,
    examples: "Claude with tool use,ChatGPT Actions,Devin,Claude Code,Cursor,OpenAI Codex agent",
  },
];
