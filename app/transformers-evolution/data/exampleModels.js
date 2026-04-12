export const exampleModelsByDiag = {
  perceptron: [
    { name: "Mark I Perceptron", usedFor: "An electromechanical classifier built to learn simple visual categories from sensor inputs instead of hand-written rules." },
    { name: "Character recognition prototypes", usedFor: "Early pattern-recognition systems used to distinguish letters or simple shapes from scanned or camera-like inputs." },
  ],
  backprop: [
    { name: "NETtalk", usedFor: "A classic system that learned to convert written text into phonemes for text-to-speech." },
    { name: "Handwriting recognition", usedFor: "Neural nets trained with backprop were used to read handwritten digits and characters, especially for checks and forms." },
  ],
  rnn: [
    { name: "Time-series RNNs", usedFor: "Recurrent nets were used to model sequences like stock prices, sensor readings, or weather values over time." },
    { name: "Speech-recognition RNNs", usedFor: "They were used to turn an incoming audio sequence into words by keeping short-term context from earlier sounds." },
  ],
  lstm: [
    { name: "Siri", usedFor: "LSTM-based speech and language models helped early voice assistants transcribe commands and interpret what the user wanted." },
    { name: "Google Translate (2016)", usedFor: "Google's pre-Transformer neural translation system used LSTMs to encode and decode sentences across languages." },
  ],
  word2vec: [
    { name: "Word2Vec", usedFor: "A lightweight model used to learn dense word embeddings from context windows in large text corpora." },
    { name: "GloVe", usedFor: "A widely used embedding model for turning words into semantic vectors that downstream NLP systems could reuse." },
  ],
  attention: [
    { name: "Google Neural Machine Translation", usedFor: "An encoder-decoder translation system that used attention to align output words with the relevant source words." },
    { name: "The Transformer", usedFor: "Attention became the core routing mechanism, letting every token directly mix information from every other token." },
  ],
  resnet: [
    { name: "ResNet-50", usedFor: "A deep image classifier that used skip connections to make very deep convolutional networks train reliably." },
    { name: "GPT-4", usedFor: "Like modern Transformers generally, it uses residual connections in every block to keep optimization stable at large scale." },
  ],
  tokenization: [
    { name: "Sennrich et al. BPE", usedFor: "A neural machine translation tokenizer that broke rare words into reusable subword pieces instead of emitting [UNK]." },
    { name: "GPT-2 byte-level BPE", usedFor: "The tokenizer used to split arbitrary web text into robust subword units before autoregressive language modeling." },
  ],
  transformer: [
    { name: "GPT-1", usedFor: "An early decoder-only Transformer used for generative pre-training on raw text before task-specific fine-tuning." },
    { name: "GPT-4", usedFor: "A frontier Transformer-based model used for general-purpose reasoning, writing, coding, and multimodal assistance." },
  ],
  gpt1: [
    { name: "GPT-1", usedFor: "Used to show that pre-training on unlabeled text could give a single model reusable language knowledge across many tasks." },
    { name: "ChatGPT", usedFor: "A later descendant that turned generative pre-training into a general conversational assistant for end users." },
  ],
  bert: [
    { name: "BERT", usedFor: "A bidirectional encoder pre-trained for masked-token prediction and then fine-tuned for question answering and classification." },
    { name: "Google Search", usedFor: "BERT-style understanding was used to improve query interpretation and matching between searches and webpages." },
  ],
  gpt2: [
    { name: "GPT-2", usedFor: "Used for open-ended text generation and for demonstrating that larger language models could do useful zero-shot tasks." },
    { name: "AI Dungeon", usedFor: "A famous early application that used GPT-style generation to improvise interactive text adventures." },
  ],
  scalinglaws: [
    { name: "GPT-3", usedFor: "Its 175B-parameter training run was justified in part by scaling-law forecasts about how loss should improve with size." },
    { name: "Chinchilla", usedFor: "It became the famous correction case, showing how scaling-law style analysis should balance parameters against more training data." },
  ],
  gpt3: [
    { name: "GPT-3", usedFor: "Used as a few-shot text model that could adapt to new tasks from examples placed directly in the prompt." },
    { name: "ChatGPT", usedFor: "Its product experience popularized in-context learning by turning prompt-only adaptation into a mainstream assistant workflow." },
  ],
  vit: [
    { name: "ViT", usedFor: "A patch-based image model used to classify images without convolution-specific inductive biases." },
    { name: "CLIP", usedFor: "A vision-language model that used Transformer image representations to align images with natural-language descriptions." },
  ],
  moe: [
    { name: "Mixtral 8x7B", usedFor: "An open-weight MoE model that activates only a subset of experts per token to get more capacity at dense-model cost." },
    { name: "GPT-4 (rumored MoE)", usedFor: "Widely discussed as a possible expert-routed frontier model, where different experts specialize on different token patterns." },
  ],
  rope: [
    { name: "Llama 1", usedFor: "An early major open-weight Transformer that used RoPE to encode token positions through rotations instead of fixed learned slots." },
    { name: "Llama 3", usedFor: "A very widely used open model family that continued the RoPE pattern for long-context causal language modeling." },
  ],
  sft: [
    { name: "FLAN", usedFor: "An instruction-tuned model family used to teach base language models to answer tasks phrased as natural-language requests." },
    { name: "InstructGPT", usedFor: "Its supervised fine-tuning stage taught GPT-3 style models to act more like helpful assistants before RLHF." },
  ],
  rlhf: [
    { name: "InstructGPT", usedFor: "A language model aligned with human preference data so it would give more helpful and less harmful answers." },
    { name: "ChatGPT", usedFor: "The most famous RLHF-shaped assistant, used for conversational help, drafting, coding, and question answering." },
  ],
  cot: [
    { name: "PaLM 540B", usedFor: "The model used in the original chain-of-thought prompting results, where reasoning examples improved math and logic tasks." },
    { name: "OpenAI o1", usedFor: "A reasoning-focused model designed to spend more tokens on intermediate thinking before giving an answer." },
  ],
  chinchilla: [
    { name: "Chinchilla (70B)", usedFor: "A compute-optimal language model trained on far more tokens per parameter than GPT-3." },
    { name: "Llama 1", usedFor: "A famous open-weight model whose training recipe reflected the Chinchilla-style preference for more data over sheer size." },
  ],
  flash: [
    { name: "Mistral 7B", usedFor: "An efficient open-weight Transformer that benefited from fast attention kernels for training and serving long prompts." },
    { name: "Claude 3.5 Sonnet", usedFor: "A high-throughput frontier assistant that depends on optimized attention implementations to stay practical at scale." },
  ],
  gpt4: [
    { name: "GPT-4", usedFor: "A multimodal model used to answer questions about text and images with stronger general reasoning than earlier GPT systems." },
    { name: "GPT-4o", usedFor: "A faster multimodal assistant used for near-real-time chat over text, images, audio, and video-like interactions." },
  ],
  longctx: [
    { name: "Claude (200K)", usedFor: "A long-context assistant used to read large documents, long chats, or sizable codebases in a single prompt." },
    { name: "Gemini 1.5", usedFor: "A very long-context multimodal model used on book-scale and video-scale inputs that do not fit earlier context windows." },
  ],
  ttc: [
    { name: "OpenAI o1", usedFor: "A model that spends extra inference-time compute on hard problems by generating longer internal reasoning traces." },
    { name: "DeepSeek-R1", usedFor: "A widely discussed reasoning model used for math, coding, and logic tasks where extra deliberation helps." },
  ],
  ssm: [
    { name: "RWKV", usedFor: "A recurrent-style language model family aimed at linear-time sequence processing with lower memory costs than full attention." },
    { name: "Mamba", usedFor: "A state-space model used for long-sequence language modeling with selective state updates instead of quadratic attention." },
  ],
  tooluse: [
    { name: "ChatGPT plugins", usedFor: "An early product that let the assistant call external services like browsing, travel, or shopping tools." },
    { name: "GPT-4 function calling", usedFor: "A structured API-calling interface used to let models return machine-readable arguments for tools and backends." },
  ],
  scaffold: [
    { name: "RALPH/Ralphify", usedFor: "An early agent scaffold used to reset model context between iterations while keeping state in files and git." },
    { name: "Cursor", usedFor: "A coding agent product that wraps the model with tools, context retrieval, and iterative edit-and-test loops." },
  ],
};
