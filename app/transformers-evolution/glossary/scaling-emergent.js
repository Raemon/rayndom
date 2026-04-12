// Scaling and emergent behavior concepts.
// See ../claude-glossary.md for writing guidelines.
export const entries = [
  {
    term: "LLM",
    altTerms: ["LLMs"],
    definition: "An LLM is a neural network large enough to read and generate human language across many topics, trained by predicting missing words in huge text collections.\n\nIt has billions of tunable internal numbers (parameters); GPT-3, for example, has about 175 billion. That scale matters because abilities such as long-form summarization, following multi-step instructions, or coding help often appear only once the model is large and has seen enough diverse text.\n\nIf you paste a messy email and ask for a polite one-paragraph reply, an LLM can draft it in one go; a much smaller model might produce fluent words but miss tone, facts, or structure.",
  },
  {
    term: "LM",
    altTerms: ["LMs"],
    definition: "A language model is a program that scores or picks what word (or piece of word) should come next, given everything written so far.\n\nIt learns from text alone: during training it repeatedly sees real sentences and adjusts so its next-word guesses match real usage. Chatbots are built by wrapping that core next-token behavior with instructions, safety filters, and tools — but the heart is still \"what comes next?\"\n\nAfter the fragment \"The cat sat on the,\" the model assigns higher probability to \"mat\" or \"floor\" than to \"quantum\" because training data ties cats to those continuations.",
  },
  {
    term: "Parameters",
    definition: "Parameters are the learnable numbers inside a neural network that get nudged during training so the model's outputs match the data.\n\nThink of them as many tiny dials: together they store patterns (grammar, facts, style). A compact model might have tens of millions; GPT-3 has on the order of 175 billion. More parameters raise capacity, but only if training data and compute are enough to use them well.\n\nWhen the model keeps mis-predicting the next word after \"Paris is the capital of,\" training updates shift parameters so \"France\" scores higher than unrelated continuations.",
  },
  {
    term: "Zero-shot",
    definition: "Zero-shot use means you give the model instructions for a task but no worked examples in the prompt — it must rely on what it already learned during pre-training.\n\nThat differs from few-shot prompting, where you paste several input–output pairs first so the model can copy the format. Zero-shot is cheaper to write but riskier when the task is unusual or the format is strict.\n\nYou type only \"Translate to French: hello\" with no sample translations; the model outputs \"bonjour\" from general bilingual patterns it saw in training text.",
  },
  {
    term: "Zero-shot transfer",
    definition: "Zero-shot transfer is performing a task the model was never explicitly trained on as a labeled job — only broad next-word training — yet it still follows your instruction.\n\nUnlike fine-tuning (extra training on a task-specific dataset), no new gradient updates run; the behavior has to come from text the model already saw (tutorials, forums, textbooks) plus your prompt.\n\nYou ask it to classify movie reviews as positive or negative even though no one built a dedicated sentiment dataset step for that checkpoint; it infers the label format from the instruction alone.",
  },
  {
    term: "Emergent capabilities",
    definition: "Emergent capabilities are skills that show up once a model crosses a size or training threshold but are weak or absent in smaller siblings trained the same way.\n\nThe point is not magic: larger models have more capacity and have effectively \"read\" more, so harder patterns (multi-step arithmetic, certain reasoning chains) can suddenly become reliable. The same training recipe at 1B parameters may fail a chain-of-thought math item that a 100B model handles.\n\nA small model might garble \"17 × 24\"; a much larger one, same architecture family, carries partial products correctly — without anyone adding a special \"math module.\"",
  },
  {
    term: "In-context learning",
    definition: "In-context learning is when the model adapts its behavior from examples or rules placed in the current prompt, without changing its saved weights.\n\nTraining updates parameters once, offline; in-context learning is temporary — new chat, new context, and the adaptation is gone. It bridges \"no fine-tuning\" and \"task-specific behavior.\"\n\nYou show three lines like \"French: chat → English: cat\" and then \"French: chien →\"; the model continues \"English: dog\" because the pattern sits in the visible context.",
  },
  {
    term: "Few-shot",
    definition: "Few-shot prompting means you put a short list of input–output examples in the prompt so the model infers the task and format before you give the real input.\n\nCompared to zero-shot (instruction only), few-shot reduces ambiguity when labels or layout are non-obvious; compared to fine-tuning, you avoid retraining but pay in prompt length and cost.\n\nYou paste three tweets labeled \"positive\" or \"negative,\" then a fourth tweet with no label; the model completes the pattern with \"positive\" or \"negative\" for the new line.",
  },
  {
    term: "Prompt",
    definition: "In everyday English \"prompt\" can mean a nudge; in language-model systems it means the full text the model reads before it generates a reply — instructions, questions, pasted documents, and examples together.\n\nEverything in that window steers the output: wording, order, and even punctuation. Engineers often iterate prompts because small edits change reliability more than users expect.\n\nYour message might be \"Summarize the following article in three bullets:\" plus the article; the model's answer is entirely conditioned on that combined prompt, not on a separate hidden setting.",
  },
  {
    term: "Scaling hypothesis",
    definition: "The scaling hypothesis is the bet that investing more — larger models, more training tokens, more compute — will keep unlocking better performance and sometimes new behaviors, not only tiny gains.\n\nIt motivated the jump from millions to billions of parameters and multi-million-dollar training runs: empirically, many benchmarks improved smoothly with scale when recipes were held steady. It does not say scale alone solves every problem; data quality, alignment, and architecture still matter.\n\nTeams allocate a budget of tens of millions of dollars and thousands of GPUs because past curves suggested a predictable lift from the next order of magnitude in compute.",
  },
  {
    term: "Scaling law",
    altTerms: ["Scaling laws"],
    definition: "A scaling law is an empirical formula that relates model size, dataset size, and training compute to loss or benchmark scores so planners can estimate outcomes before spending the full budget.\n\nOften the relationship is close to a power law on log–log plots: each doubling of compute buys a smaller but predictable improvement. That lets researchers trade off, say, a wider model versus longer training under a fixed FLOP cap.\n\nIf doubling training FLOPs historically shaved test loss by a fixed percentage, a lab can forecast whether an 8× spend is worth the expected gain before locking a cluster for months.",
  },
  {
    term: "Compute-optimal",
    definition: "Compute-optimal training chooses model size and number of training tokens so that, for a fixed total compute budget, validation loss is as low as possible — instead of overspending parameters and starving data (or the reverse).\n\nThe Chinchilla work argued many large models were undertrained: for the same FLOPs, a smaller network trained on more tokens beat a bigger one stopped early. \"Optimal\" here is about efficiency at a given spend, not the absolute best score money can buy.\n\nWith one petaFLOP-week budget, you might pick a 70B model on 1.4T tokens rather than a 175B model on 300B tokens because the first pairing hits lower loss for the same bill.",
  },
  {
    term: "Tokens-to-parameters ratio",
    definition: "The tokens-to-parameters ratio compares how many training tokens the model saw to how many parameters it has — a shorthand for whether the network was data-limited or compute-limited at its size.\n\nChinchilla-style analyses pointed to roughly twenty training tokens per parameter as a useful ballpark for compute-optimal large runs; a much lower ratio means each parameter saw fewer examples on average.\n\nA 175B-parameter model trained on about 300B tokens sits near 1.7 tokens per parameter; another design might use 3.5B parameters on 70B tokens (~20:1), aiming for better use of the same training FLOPs.",
  },
  {
    term: "Forward pass",
    definition: "A forward pass runs input through the network layer by layer to produce a prediction (next-token logits, class scores, etc.); no learning happens inside that pass.\n\nLearning uses a separate backward pass and optimizer step that consume extra memory and time. Inference in production is mostly repeated forward passes.\n\nWhen you send \"The capital of France is\" through the model, each layer transforms the hidden representation until the last layer outputs a distribution over candidate next tokens like \"Paris.\"",
  },
  {
    term: "Weight updates",
    definition: "Weight updates are the optimizer's adjustments to parameters after comparing the model's prediction to the correct target, so errors tend to shrink on similar examples later.\n\nEach step uses gradients: tiny suggested changes for millions or billions of numbers, averaged over a batch. Many small steps across epochs are what \"training\" means in practice.\n\nIf the model assigns low probability to the true next word \"mat\" after \"The cat sat on the,\" the update nudges weights so that continuation scores higher the next time that context appears.",
  },
  {
    term: "GPU",
    definition: "A GPU is a processor built to run huge batches of simple math in parallel; AI repurposed hardware originally aimed at 3D graphics because neural network layers are the same kind of workload.\n\nCPUs excel at flexible serial logic; GPUs excel at matrix-heavy operations that dominate training and inference. Serious model training spreads work across hundreds or thousands of GPUs.\n\nOne training step might multiply giant matrices for attention and feed-forward layers across thousands of cores simultaneously instead of one-at-a-time on a CPU.",
  },
  {
    term: "GPU-days",
    definition: "GPU-days count compute as one GPU working continuously for 24 hours — a yardstick for how big a training job was, like person-days on a construction site.\n\nIf you use 64 GPUs for ten days, that is 640 GPU-days. It does not by itself say which GPU generation; newer chips do more work per day.\n\nPublic reports placed GPT-3-class training on the order of thousands of GPU-days; teams use the unit to compare proposals without naming exact clusters.",
  },
  {
    term: "FLOPS",
    definition: "FLOPS (floating-point operations per second) measures how many arithmetic operations a chip can perform each second; total \"FLOPs\" (often written with a lowercase s for the count) also summarizes an entire training run independent of which hardware ran it.\n\nHigh throughput matters because a transformer layer is mostly giant matrix multiplies and additions. Researchers compare models by estimated training FLOPs so a V100 run and an H100 run are on the same axis.\n\nA headline might say a frontier model took ~10^25 FLOPs to train, meaning that many scalar adds/multiplies in aggregate, whether spread across many GPUs or fewer faster ones.",
  },
  {
    term: "Inference",
    definition: "Inference is using an already-trained model to produce outputs — each chat turn, each generated image step, each classification — as opposed to training, which changes the weights.\n\nServing costs are dominated by inference at scale: every user query runs a forward pass (or many for long generations). Latency and memory footprint matter here more than during offline training.\n\nWhen you ask a chatbot a follow-up question, the service runs inference on your thread to sample the assistant's next tokens; your question does not retrain the base model.",
  },
  {
    term: "Power law",
    definition: "A power law relationship means that when you plot both quantities on logarithmic axes, the trend is roughly a straight line: multiplying the input by a constant factor yields a fixed multiplicative effect on the output, with diminishing returns.\n\nNeural scaling often looks this way — each 10× more compute buys a smaller but repeatable gain in loss or score. It helps with extrapolation but breaks if data, architecture, or measurement saturates.\n\nIf error drops by the same percentage for each doubling of training FLOPs across several runs, a straightedge on log–log paper forecasts the next doubling before you pay for it.",
  },
  {
    term: "Compute budget",
    definition: "A compute budget is the cap on total training FLOPs (or GPU-time) you are willing to spend on one run; it forces a real trade-off between model width, depth, and how many tokens you can afford to show the model.\n\nScaling laws and Chinchilla-style analysis exist largely to spend that budget wisely. Without a budget framing, teams might default to \"make it huge\" and stop early on data.\n\nGiven 10^24 FLOPs, you might train a 30B model for many passes over a large corpus instead of a 200B model for a thin slice of text, because the split hits lower loss under the same total compute.",
  },
];
