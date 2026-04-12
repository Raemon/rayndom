// Alignment and RLHF concepts.
// See ../claude-glossary.md for writing guidelines.
export const entries = [
  {
    term: "RLHF",
    definition: "RLHF is a training method that steers a pre-trained language model toward outputs people find helpful, honest, and safe, used when fluent text alone is not enough because the model might still mislead or refuse instructions.\n\nPeople rank or compare model answers; a separate reward model learns those tastes, then the language model is updated to earn higher scores—without someone writing thousands of hand-crafted rules.\n\nExample: for \"Explain how to invest $500,\" the base model might ramble or push risky tips; after RLHF, the same model tends to give balanced, caveat-heavy advice because that pattern scored better with human judges.",
  },
  {
    term: "Reinforcement learning",
    altTerms: ["RL"],
    definition: "Reinforcement learning is a training paradigm where a system improves by acting, seeing a numeric reward, and adjusting—used when there is no single correct label for every situation, only feedback about whether an outcome was good or bad.\n\nUnlike supervised learning, where each training example has a fixed right answer, the learner explores: try an action, get a score, update. The reward might come from a game, a robot reaching a goal, or—in alignment—a model that predicts human preferences.\n\nExample: a model drafts two email replies to \"Can you refund my order?\"; humans rate which is politer and clearer. The system nudges the model toward the style that earned the higher reward.",
  },
  {
    term: "Reward model",
    definition: "A reward model is a small classifier or neural net that scores how good a candidate answer looks to humans, trained so alignment pipelines can grade millions of responses without a person in the loop each time.\n\nAnnotators supply preference data (\"A is better than B\" for the same prompt); the reward model fits those judgments. During training, the language model is then pushed toward answers the reward model rates highly.\n\nExample: given the prompt \"Summarize this 10-page lease,\" the reward model might assign a higher score to a short bullet list that mentions rent and notice periods than to a vague paragraph—matching what annotators rewarded in similar cases.",
  },
  {
    term: "PPO",
    definition: "PPO (Proximal Policy Optimization) is an on-policy reinforcement-learning algorithm that updates a policy in small, bounded steps, used to keep language-model fine-tuning stable when optimizing against a learned reward.\n\nLarge, greedy updates can make the model collapse into repetitive text or exploit quirks in the reward model. PPO limits how far each update moves the model from its recent behavior so learning stays incremental.\n\nExample: after a batch of answers to coding questions, PPO might shift the model slightly toward solutions that passed unit tests—without letting one lucky batch rewrite the entire vocabulary distribution overnight.",
  },
  {
    term: "KL penalty",
    definition: "A KL penalty is an extra cost term that punishes the tuned model for drifting too far from a reference model (often the pre-trained weights), used so reward optimization does not erase fluency or encourage bizarre hacks that fool the reward model.\n\nWithout it, the policy might collapse to high-reward but unnatural phrases. The penalty measures distributional distance between \"what the reference would say next\" and \"what the tuned model says next\" token by token.\n\nExample: if the reward model loves exclamation marks, an unconstrained optimizer might spam them; a KL penalty keeps next-token probabilities close enough to the base model that answers still read like normal English.",
  },
  {
    term: "Alignment",
    definition: "Alignment is the goal of building AI systems whose behavior matches human intent and safety norms—not only getting factually correct text, but refusing harmful requests, following scope, and behaving helpfully when instructions are vague.\n\nThe difficulty is that \"do what I mean\" is underspecified; training on internet text does not, by itself, encode politeness, refusals, or epistemic humility. Alignment work adds objectives (SFT, RLHF, red-teaming) on top of raw capability.\n\nExample: a user asks for medical dosing for a child; an aligned assistant declines and suggests a clinician, even though a raw completion model might fabricate numbers from similar-looking training snippets.",
  },
  {
    term: "Policy",
    definition: "In reinforcement learning—not organizational \"policy\"—a policy is the rule the agent uses to pick the next action (or next word) from what it has seen so far.\n\nFor autoregressive language models, the policy is the full stack that outputs a probability over the next token. RLHF adjusts those probabilities so high-reward continuations become more likely.\n\nExample: after the partial prompt \"The capital of France is,\" the policy assigns most mass to \"Paris\"; after preference training on concise answers, it may assign less mass to long historical digressions that humans downvoted.",
  },
  {
    term: "Critic",
    definition: "A critic is a helper network that estimates how valuable a state or action will turn out to be, used to reduce variance and speed up policy learning when rewards arrive late or sparsely.\n\nWhere the policy chooses actions, the critic predicts expected future reward from the current situation—like a coach estimating whether a mid-game position is winning.\n\nExample: in a long document-question task, the final reward might depend only on the last sentence; the critic assigns partial credit to intermediate steps that kept facts consistent, so earlier tokens still receive a learning signal.",
  },
  {
    term: "Base model",
    definition: "A base model is the checkpoint produced by large-scale pre-training before chat tuning or alignment, used as the raw capability layer that knows grammar and facts but is not yet shaped as an assistant.\n\nIt typically continues prompts in whatever style the data suggested—story mode, forum dumps—rather than defaulting to Q&A. SFT and RLHF build the assistant behavior on top.\n\nExample: you prompt \"How do I reset my router?\" and the base model continues with forum-style thread noise; the aligned derivative answers in steps and asks for the router model if needed.",
  },
  {
    term: "Human annotation",
    definition: "Human annotation is the step where people label data—tags, spans, ratings, or rankings—that supervised or preference-based training then fits.\n\nFor alignment, the costly part is often pairwise judgments: which of two answers is better for the same user message. Those labels become supervision for reward models or direct-preference methods.\n\nExample: ten annotators each compare two summaries of the same news article; majority vote yields a gold preference pair that enters the training set for the reward model.",
  },
  {
    term: "Process reward model",
    altTerms: ["Process reward models"],
    definition: "A process reward model is a scorer trained to judge intermediate reasoning steps—not only the final line—used to reward faithful multi-step work and penalize lucky wrong reasoning that reaches a right-looking answer.\n\nOutcome-only rewards can encourage guessing; step-wise feedback mirrors how a teacher marks each line of a proof.\n\nExample: on a multi-digit subtraction chain, the model writes a wrong carry but lands on the correct total; a process reward model downscores the mistaken intermediate row even if the boxed answer matches the key.",
  },
  {
    term: "Preference pairs",
    definition: "Preference pairs are two candidate outputs for the same input with a human label of which is better, forming the atomic training unit for reward modeling and methods like DPO.\n\nThe model never sees an absolute score—only relative order. Thousands of such pairs define a partial ranking of styles and safety behaviors.\n\nExample: for \"Draft a subject line for a late invoice reminder,\" response A is curt and response B is firm-but-polite; the annotator marks B preferred, and that pair teaches the system which tone to promote.",
  },
  {
    term: "Binary cross-entropy",
    definition: "Binary cross-entropy is a loss function that measures how well predicted probabilities match yes/no labels, used when training models to classify which of two items humans preferred or whether a statement is acceptable.\n\nHere \"entropy\" is not disorder in the everyday sense—it is an information-theoretic cost between predicted odds and the true 0/1 outcome. Lower loss means the model assigns high probability to the side humans chose; some direct-preference objectives like DPO also use this shape to update the language model without a separate RL loop.\n\nExample: the reward model sees prompt P and responses A vs. B; the label is \"A wins.\" Cross-entropy penalizes the model if it assigns B a higher win probability than A.",
  },
  {
    term: "Closed-form",
    definition: "Closed-form refers to an update rule you can compute in one shot from known quantities, contrasted with iterative loops that repeatedly sample and adjust—relevant because some preference-training objectives avoid the outer RL loop of classical RLHF.\n\nThink closed-form like solving x with a formula versus guessing and checking. DPO-style losses reweight the model using algebra on preference probabilities instead of alternating policy and value updates.\n\nExample: instead of running PPO for thousands of steps with a separate reward model forward pass each time, a closed-form objective might compute the exact gradient direction from a batch of (chosen, rejected) pairs in one backward pass.",
  },
];
