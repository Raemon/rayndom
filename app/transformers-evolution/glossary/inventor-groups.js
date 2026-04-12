// Research-group labels used in the "Who Invented / Parallel Groups" column.
// See ../claude-glossary.md for writing guidelines.
export const entries = [
  {
    term: "Rosenblatt",
    altTerms: ["Rosenblatt perceptron group"],
    definition: "Frank Rosenblatt's Cornell Aeronautical Laboratory circle built the perceptron as a concrete trainable machine, not just a mathematical sketch, and backed it with hardware demos like the Mark I Perceptron.\n\nWhat distinguished them was making learning from examples feel like an engineering program with public demonstrations, rather than a loose cybernetics analogy.",
  },
  {
    term: "cybernetics neuron learners",
    definition: "This label covers the broader postwar cybernetics community that explored neuron-like units, Hebbian learning, and adaptive control before the perceptron was packaged into one iconic system.\n\nWhat distinguished them was breadth: many related ideas were circulating, but no single team turned them into Rosenblatt's clean trainable classifier plus public hardware story.",
  },
  {
    term: "Werbos autodiff",
    altTerms: ["Werbos autodiff line"],
    definition: "Paul Werbos described the key idea early by connecting chain-rule differentiation, control theory, and multilayer networks in work from the 1970s.\n\nWhat distinguished this line was seeing backprop first as a general gradient-computation method, before it became famous as a neural-net training breakthrough.",
  },
  {
    term: "Rumelhart, Hinton, Williams",
    altTerms: ["PDP backprop group"],
    definition: "The Rumelhart-Hinton-Williams connectionist group turned backprop into the decisive practical neural-network result in the mid-1980s, especially through the Parallel Distributed Processing program.\n\nWhat distinguished them was the clean empirical demonstration that multilayer nets could finally be trained well enough to matter.",
  },
  {
    term: "feedback network theorists",
    definition: "This label covers earlier recurrent and feedback-network researchers who kept revisiting the idea that a model should feed its internal state back into itself over time.\n\nWhat distinguished them was the architectural intuition: sequence memory should come from recurrence, even before training methods were mature.",
  },
  {
    term: "Elman, Jordan",
    altTerms: ["Elman Jordan sequence group"],
    definition: "Jeff Elman and Michael Jordan's line of work supplied the canonical simple recurrent architectures that made sequence modeling legible to the wider field.\n\nWhat distinguished them was turning recurrence into practical language-style models with explicit hidden-state dynamics instead of abstract feedback diagrams.",
  },
  {
    term: "Werbos BPTT",
    altTerms: ["BPTT training group"],
    definition: "This line of researchers made backpropagation through time the standard way to train recurrent nets by unrolling them across sequence steps and assigning credit backward.\n\nWhat distinguished them was solving the training recipe, not just proposing recurrent structure.",
  },
  {
    term: "Hochreiter, Schmidhuber",
    altTerms: ["Hochreiter Schmidhuber memory group"],
    definition: "Sepp Hochreiter and Jürgen Schmidhuber designed LSTM directly around the vanishing-gradient problem, with a persistent memory path and gates controlling when information is written, kept, or read.\n\nWhat distinguished them was starting from optimization failure and engineering the architecture specifically to preserve long-range gradients.",
  },
  {
    term: "Mikolov, Chen",
    altTerms: ["Google embedding team"],
    definition: "Mikolov and collaborators at Google simplified neural language modeling into a fast representation-learning recipe built around skip-gram, CBOW, and negative sampling.\n\nWhat distinguished them was ruthless simplification and scale: they optimized for practical large-corpus embedding learning more than for fancy language-model architecture.",
  },
  {
    term: "Stanford matrix factorization team",
    definition: "The Stanford GloVe line approached the same destination from global co-occurrence statistics and matrix-factorization style reasoning.\n\nWhat distinguished them was using corpus-wide count structure rather than the predictive local-context objective popularized by Word2Vec.",
  },
  {
    term: "Bahdanau, Cho, Bengio",
    altTerms: ["Montreal NMT team"],
    definition: "Bahdanau, Cho, and Bengio's Montreal group introduced neural attention in machine translation to let the decoder look back at relevant encoder states instead of squeezing everything into one fixed vector.\n\nWhat distinguished them was the translation framing: attention emerged as a practical fix for seq2seq bottlenecks.",
  },
  {
    term: "differentiable memory group",
    definition: "This label covers the Graves-style neural memory and soft-attention tradition that was exploring learnable read-write access over internal memory structures around the same time.\n\nWhat distinguished that line was a broader memory-systems perspective rather than translation-specific alignment.",
  },
  {
    term: "Srivastava, Greff, Schmidhuber",
    altTerms: ["Highway Network group"],
    definition: "The Highway Networks line attacked depth problems with learned gates that decide how much transformed signal versus carried-through signal to keep.\n\nWhat distinguished it was using gating as the depth-management mechanism, a little closer to LSTM intuitions than the later residual shortcut style.",
  },
  {
    term: "He, Zhang, Ren, Sun",
    altTerms: ["Microsoft ResNet team"],
    definition: "Kaiming He and collaborators at Microsoft Research reframed very deep vision nets as learning residual corrections on top of identity shortcuts.\n\nWhat distinguished them was the stripped-down elegance of the identity skip: no gates, just learn the delta and let optimization stay easy.",
  },
  {
    term: "Sennrich, Haddow, Birch",
    altTerms: ["subword NMT group"],
    definition: "Sennrich, Haddow, and Birch repurposed byte-pair encoding from compression into a neural-machine-translation tokenizer that could split rare words into reusable parts.\n\nWhat distinguished them was making open-vocabulary handling practical inside mainstream neural translation pipelines.",
  },
  {
    term: "character aware NLP group",
    definition: "This label covers teams exploring character-level and character-aware language models as another route around the fixed-word-vocabulary problem.\n\nWhat distinguished them was pushing closer to raw text, accepting longer sequences in exchange for never needing a hard word list.",
  },
  {
    term: "byte level tokenizer line",
    definition: "This line covers later work that treated bytes or near-byte units as the stable base representation, reducing special handling for unknown characters and scripts.\n\nWhat distinguished it was universality and robustness rather than linguistically neat subwords.",
  },
  {
    term: "Vaswani, Shazeer, Parmar, Uszkoreit",
    altTerms: ["Google Brain translation team"],
    definition: "The original Transformer came from Google's translation effort, where researchers asked whether attention could replace recurrence instead of merely assisting it.\n\nWhat distinguished them was the architectural leap: they were willing to throw out the dominant RNN assumption entirely.",
  },
  {
    term: "attention heavy sequence modelers",
    definition: "This label covers nearby groups already moving toward more attention-centric sequence architectures before the full Transformer snapped the idea into its clean final form.\n\nWhat distinguished them was gradual drift toward attention, not the all-at-once \"attention is the whole model\" jump.",
  },
  {
    term: "Radford, Narasimhan, Salimans, Sutskever",
    altTerms: ["OpenAI GPT team"],
    definition: "The original GPT line at OpenAI married the Transformer decoder to the pretrain-then-fine-tune transfer-learning story for NLP tasks.\n\nWhat distinguished them was betting that one generative pretraining objective on internet text could seed many downstream tasks with minimal architecture changes.",
  },
  {
    term: "Howard, Ruder",
    altTerms: ["ULMFiT team"],
    definition: "Jeremy Howard and Sebastian Ruder's ULMFiT line showed that language-model pretraining plus careful fine-tuning could transfer surprisingly well across NLP tasks.\n\nWhat distinguished them was doing transfer learning in a lighter-weight AWD-LSTM world rather than with the new Transformer stack.",
  },
  {
    term: "contextual pretraining teams",
    definition: "This label covers the broader wave of groups building contextual word representations and task-transfer pipelines, including work like ELMo and the run-up to BERT.\n\nWhat distinguished them was focusing on richer representations as the reusable asset, even when the final architectures differed.",
  },
  {
    term: "Devlin, Chang, Lee, Toutanova",
    altTerms: ["Google BERT team"],
    definition: "The BERT team at Google combined Transformer encoders with masked language modeling and next-sentence style pretraining to create a new standard for bidirectional text understanding.\n\nWhat distinguished them was crystallizing the encoder-only, bidirectional pretraining recipe into a very reusable package.",
  },
  {
    term: "Peters, Neumann, Iyyer, Gardner",
    altTerms: ["ELMo representation team"],
    definition: "The ELMo line at AllenNLP and collaborators pushed contextual token representations that changed with sentence context rather than staying as one fixed embedding per word.\n\nWhat distinguished them was showing the value of deep bidirectional contextual representations before Transformers fully took over that territory.",
  },
  {
    term: "Radford, Wu, Child",
    altTerms: ["OpenAI zero shot scaling team"],
    definition: "This is the GPT-2 group that mostly asked what happens if you scale the generative-pretraining recipe harder and then test capabilities without task-specific fine-tuning.\n\nWhat distinguished them was turning zero-shot transfer itself into the headline result, not just better benchmark numbers after adaptation.",
  },
  {
    term: "Raffel, Shazeer, Roberts",
    altTerms: ["Google text to text team"],
    definition: "This label points to the Google/T5 style line that was converging on large-scale text pretraining with a unified promptable interface for many tasks.\n\nWhat distinguished it was the explicit \"everything is text-to-text\" unification rather than the pure GPT-style decoder story.",
  },
  {
    term: "large LM scaling labs",
    definition: "This label covers the big labs that were broadly converging on the idea that many new capabilities would come from simply training much larger language models on much more data.\n\nWhat distinguished them was scale as the main variable, even if they did not produce the exact GPT-2-style zero-shot reveal first.",
  },
  {
    term: "deep learning scaling researchers",
    definition: "This label covers earlier researchers studying power-law-like behavior in deep learning performance as model size, data, or compute increased across domains.\n\nWhat distinguished them was the general question of scaling regularities, before OpenAI made the language-model version especially famous.",
  },
  {
    term: "Kaplan, McCandlish, Henighan",
    altTerms: ["OpenAI scaling laws team"],
    definition: "OpenAI's scaling-laws group ran unusually systematic grids over model size, data size, and compute and then fit simple power laws to the results.\n\nWhat distinguished them was methodological discipline: they treated scaling as an empirical science of curves and tradeoffs rather than a pile of anecdotes.",
  },
  {
    term: "Brown, Mann, Ryder",
    altTerms: ["OpenAI few shot scaling team"],
    definition: "This is the GPT-3 team that pushed autoregressive scaling far enough that prompting itself started behaving like a lightweight programming interface.\n\nWhat distinguished them was the combination of huge scale and evaluation framing around in-context few-shot behavior.",
  },
  {
    term: "prompt based transfer groups",
    definition: "This label covers groups that were converging on prompt-based task transfer as a powerful interface even if they were not first to show the GPT-3-style scale jump.\n\nWhat distinguished them was treating prompt design as capability elicitation rather than just surface phrasing.",
  },
  {
    term: "Dosovitskiy, Beyer, Kolesnikov",
    altTerms: ["Google ViT team"],
    definition: "The Vision Transformer group at Google asked whether an image could simply be chopped into patches and fed into a mostly unchanged text Transformer.\n\nWhat distinguished them was the deliberately minimal cross-domain transfer: reuse the sequence model instead of designing a CNN-specific visual trick.",
  },
  {
    term: "sequence vision groups",
    definition: "This label covers adjacent projects like iGPT and DETR-era work that were independently recasting images and detection problems into sequence-style formulations.\n\nWhat distinguished them was the broader \"images as sequences or tokens\" worldview rather than the exact ViT patch recipe.",
  },
  {
    term: "Shazeer, Lepikhin, Fedus",
    altTerms: ["Google sparse expert team"],
    definition: "This is the Shazeer-to-GShard-to-Switch line at Google that revived mixture-of-experts by routing each token through only a few sub-networks instead of the whole model.\n\nWhat distinguished them was making sparsity a scaling strategy for giant Transformers, not just an ensemble curiosity.",
  },
  {
    term: "sparse routing groups",
    definition: "This label covers other teams exploring token routing, conditional computation, and sparse activation as a way to grow model capacity without paying dense-compute costs everywhere.\n\nWhat distinguished them was the systems-and-routing viewpoint rather than the single Google MoE lineage.",
  },
  {
    term: "Su, Lu, Pan",
    altTerms: ["RoFormer team"],
    definition: "The RoFormer authors introduced rotary position embeddings by encoding position as a rotation in query-key geometry so relative offsets fall out naturally in the dot product.\n\nWhat distinguished them was the elegant geometric formulation, which made relative distance feel native to attention math instead of bolted on as a bias table.",
  },
  {
    term: "relative position groups",
    definition: "This label covers the researchers building relative-bias and other distance-aware positional schemes before or alongside RoPE.\n\nWhat distinguished them was the goal of extrapolating beyond training lengths by encoding distance relationships more directly than fixed absolute embeddings.",
  },
  {
    term: "linear bias position groups",
    definition: "This label covers ALiBi-style lines that favored simple linear position biases over heavier learned or rotational schemes.\n\nWhat distinguished them was extreme simplicity: inject distance preferences cheaply and let the model generalize from there.",
  },
  {
    term: "Wei, Bosma, Zhao, Guu",
    altTerms: ["Google FLAN team"],
    definition: "Google's FLAN line treated instruction tuning as a multitask mixture problem: collect many tasks in a shared instruction-response format and train one model to imitate the blend.\n\nWhat distinguished them was breadth of task mixture and explicit framing around instructions as a universal interface.",
  },
  {
    term: "Ouyang, Wu, Jiang, Almeida",
    altTerms: ["OpenAI alignment team"],
    definition: "This label covers the OpenAI teams that operationalized instruction following, supervised fine-tuning, and later RLHF into a mainstream assistant-training pipeline.\n\nWhat distinguished them was end-to-end productization: not just a paper recipe, but a coherent alignment stack for chat assistants.",
  },
  {
    term: "Christiano, Leike, Brown",
    altTerms: ["Christiano preference learning team"],
    definition: "The Christiano preference-learning line showed how to learn a reward signal from pairwise human judgments rather than hand-specifying the reward directly.\n\nWhat distinguished them was importing preference-based reinforcement-learning ideas from the broader RL world before LLMs made the recipe famous.",
  },
  {
    term: "Wei, Wang, Zhou",
    altTerms: ["CoT prompting team"],
    definition: "The original chain-of-thought prompting paper made the now-famous discovery that giving large models exemplars with intermediate reasoning traces could unlock much better problem solving.\n\nWhat distinguished them was the sharp empirical reveal that prompting format alone could expose a new capability regime.",
  },
  {
    term: "prompt engineering groups",
    definition: "This label covers the many researchers and practitioners who were independently discovering that wording, decomposition, and exemplars could materially change model capability.\n\nWhat distinguished them was a pragmatic experimentation culture rather than a single canonical paper.",
  },
  {
    term: "Hoffmann, Borgeaud, Mensch, Sifre",
    altTerms: ["DeepMind compute optimal team"],
    definition: "DeepMind's Chinchilla line reran the scaling-laws story with a broader compute-optimal framing and showed that GPT-3-style practice had overbuilt model size relative to data.\n\nWhat distinguished them was the corrective result: smaller models trained on much more data were often better for a fixed compute budget.",
  },
  {
    term: "Dao, Fu, Ermon, Rudra, Re",
    altTerms: ["Tri Dao flash team"],
    definition: "Tri Dao and collaborators reframed attention as an IO problem and built FlashAttention around tiling and memory movement rather than changing the exact attention output.\n\nWhat distinguished them was hardware realism: optimize the kernel for modern accelerators first, then reap algorithm-level speedups from that.",
  },
  {
    term: "IO aware kernel groups",
    definition: "This label covers systems researchers broadly chasing fused kernels, memory-locality improvements, and accelerator-friendly implementations for large-model workloads.\n\nWhat distinguished them was focusing on bandwidth and data movement bottlenecks rather than on new model semantics.",
  },
  {
    term: "OpenAI multimodal team",
    definition: "This label covers the OpenAI line that coupled strong language models with vision components to build image-capable general assistants.\n\nWhat distinguished them was the assistant framing: multimodality was valuable because it plugged into the same chat-and-tools interface as text.",
  },
  {
    term: "Gemini multimodal team",
    altTerms: ["Google multimodal assistant team"],
    definition: "This label covers the Google and DeepMind efforts to combine frontier language models with vision understanding in Gemini-style systems.\n\nWhat distinguished them was close integration of multimodal pretraining with a broad platform push across search, assistant, and foundation-model work.",
  },
  {
    term: "Anthropic multimodal group",
    definition: "This label covers the Anthropic-era competitors that rapidly added image understanding to safety-tuned assistant models.\n\nWhat distinguished them was carrying the constitutional-assistant style into the multimodal setting rather than treating vision as a separate product line.",
  },
  {
    term: "Anthropic long-context team",
    altTerms: ["Anthropic long context team"],
    definition: "This label covers the Anthropic line that turned very long context windows into a major product differentiator for Claude.\n\nWhat distinguished them was emphasizing document-scale and repo-scale usage where context length itself was the user-visible capability.",
  },
  {
    term: "Gemini long-context team",
    altTerms: ["Google Gemini long context team"],
    definition: "This label covers the Google and DeepMind teams pushing Gemini toward very long multimodal context windows.\n\nWhat distinguished them was treating long context as part of a broader multimodal systems package rather than as a single-model curiosity.",
  },
  {
    term: "OpenAI long-context team",
    altTerms: ["OpenAI long context team"],
    definition: "This label covers the OpenAI work extending GPT-family systems with much longer usable context windows for tools, coding, and document work.\n\nWhat distinguished them was connecting long context tightly to product workflows like coding agents and document analysis.",
  },
  {
    term: "open weight long context builders",
    definition: "This label covers open-weight and infrastructure-first groups that kept extending context windows with new positional tricks, kernels, and curriculum choices outside the biggest labs.\n\nWhat distinguished them was rapid public iteration and recipe-sharing across the open model ecosystem.",
  },
  {
    term: "OpenAI reasoning team",
    definition: "This label covers the OpenAI line behind o1/o3-style reasoning models that spend more tokens on intermediate deliberate computation before committing to an answer.\n\nWhat distinguished them was making extra test-time reasoning itself into a flagship product behavior.",
  },
  {
    term: "DeepSeek reasoning team",
    definition: "This label covers the DeepSeek-R1-style line that used reasoning traces and reinforcement learning to train models that visibly think longer before answering.\n\nWhat distinguished them was showing a strong open-ish competitive path to reasoning-focused models outside the usual frontier-lab duopoly.",
  },
  {
    term: "Peng",
    altTerms: ["RWKV hybrid group"],
    definition: "The RWKV line explored recurrent-transformer hybrids that preserve some sequential state-machine flavor while staying friendly to modern training.\n\nWhat distinguished them was trying to get long-sequence efficiency without giving up language-model practicality.",
  },
  {
    term: "Gu, Dao",
    altTerms: ["Mamba SSM group"],
    definition: "The Mamba line revived state-space models with selective gating and hardware-aware kernels so they could compete seriously on language tasks.\n\nWhat distinguished them was the combination of classical SSM math with modern deep-learning systems engineering.",
  },
  {
    term: "Lieber, Lenz",
    altTerms: ["Jamba hybrid group"],
    definition: "The Jamba-style hybrid line explicitly mixed SSM blocks with attention blocks instead of trying to pick one winner.\n\nWhat distinguished them was architectural pluralism: use attention where it helps and cheaper sequence machinery where that is enough.",
  },
  {
    term: "Yao, Zhao, Yu, Du",
    altTerms: ["ReAct prompting group"],
    definition: "The ReAct paper line made the observe-think-act loop explicit by alternating short reasoning steps with tool-like actions.\n\nWhat distinguished them was turning tool use into an interpretable prompting pattern rather than a hidden API contract.",
  },
  {
    term: "API tool use platforms",
    definition: "This label covers the product teams that introduced plugin, function-calling, and tool schemas so models could request external actions in a reliable structured format.\n\nWhat distinguished them was platform design: the key move was standardizing the interface between model and tool runtime.",
  },
  {
    term: "open source agent framework groups",
    definition: "This label covers the LangChain, AutoGPT, and similar open-source communities that kept rebuilding the same observe-think-act loop in public.\n\nWhat distinguished them was fast ecosystem experimentation and composable tooling rather than a single polished API.",
  },
  {
    term: "RALPH loop builders",
    definition: "This label covers the RALPH-style practitioners who solved long-horizon agent failure by restarting the model in fresh contexts while keeping state on disk and in git.\n\nWhat distinguished them was a very practical insight: files and commits can be the real memory, not the chat transcript.",
  },
  {
    term: "Claude Code orchestration team",
    definition: "This label covers the Claude Code style of agent scaffolding with dynamic prompt assembly, explicit modes, compaction, and layered tool-permission rules.\n\nWhat distinguished them was prompt orchestration as a first-class systems problem rather than a single static system prompt.",
  },
  {
    term: "OpenClaw memory team",
    definition: "This label covers the OpenClaw-style line that made persistent file-based memory a named product feature with artifacts like `SOUL.md` and `MEMORY.md`.\n\nWhat distinguished them was treating long-term agent identity and memory as runtime infrastructure, not as something to cram into a single session.",
  },
  {
    term: "open source agent harness builders",
    definition: "This label covers the broader open-source communities assembling planner/executor loops, sandboxes, permission layers, and durable state into reusable agent harnesses.\n\nWhat distinguished them was iterative reliability engineering in public rather than a single canonical architecture.",
  },
];
