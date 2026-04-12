// Pre-training and transfer learning concepts.
// See ../claude-glossary.md for writing guidelines.
export const entries = [
  {
    term: "Autoregressive",
    definition: "Autoregressive generation means each new token is chosen conditioned on all prior tokens in order, like strict left-to-right writing where the model never conditions on future text.\n\nTraining matches deployment: the objective is next-token prediction along real prefixes.\n\nExample: after \"The cat sat on the\" the model scores \"mat\" high; after emitting \"mat,\" it conditions on the full six-token prefix to pick the following word.",
  },
  {
    term: "Pre-training",
    definition: "Pre-training is the large-scale first phase where a model learns broad language (or code) statistics from huge unlabeled text before any task-specific adaptation.\n\nIt answers the cold-start problem: random weights know nothing about grammar or facts until they have read internet-scale data.\n\nExample: train for weeks on hundreds of billions of tokens scraped from books and the web with a next-token loss; accuracy on random trivia later partly reflects what repeated in that corpus.",
  },
  {
    term: "Fine-tuning",
    definition: "Fine-tuning continues training a pre-trained model on a smaller, task-shaped dataset so weights shift toward the target behavior while retaining general language competence.\n\nContrast training from scratch on the small set alone, which often overfits or underfits.\n\nExample: start from a web-trained LM, then train a few epochs on 50k (question, short answer) pairs so replies become concise and on-topic for a support bot.",
  },
  {
    term: "Masked language modeling",
    definition: "Masked language modeling hides a random subset of tokens in a sequence and trains the model to predict those hidden tokens from the visible ones on both sides.\n\nUnlike autoregressive training, every position can attend to future context in the encoder stack — useful for learning deep bidirectional representations.\n\nExample: input \"The [MASK] sat on the mat\" with label \"cat\"; the model must use left and right words jointly to raise \"cat\" above \"dog\" or \"robot.\"",
  },
  {
    term: "Bidirectional context",
    definition: "Bidirectional context means the representation at a position may depend on tokens both before and after it in the sequence, as in BERT-style encoders that see the full sentence at once.\n\nAutoregressive decoders used for generation are constrained to past-only context so they never condition on tokens that have not been generated yet.\n\nExample: in \"She sat on the river bank,\" the encoder can move information from \"river\" backward into the vector for \"bank\" in one pass, favoring shoreline over finance.",
  },
  {
    term: "SFT",
    altTerms: ["Supervised fine-tuning"],
    definition: "Supervised fine-tuning (SFT) is training on curated input-output demonstrations — chats, instructions with ideal replies — so a base LM that only continued text learns to follow prompts in a helpful format.\n\nIt shapes style and obedience more than raw world knowledge.\n\nExample: thousands of rows like user: \"Summarize in three bullets:\" assistant: \"- ...\\n- ...\" teach the model to emit bullets instead of rambling prose.",
  },
  {
    term: "Instruction following",
    definition: "Instruction following is the behavior where the model treats natural-language requests as commands to perform a task (summarize, translate, list steps) rather than as text to imitate or extend.\n\nBase LMs often continue the pattern of the prompt; instruction-tuned models answer it.\n\nExample: prompt \"Translate to French: Hello\" should yield \"Bonjour\" or a short French sentence, not \"Translate to French: Hello how are you today\" as if co-writing a worksheet.",
  },
  {
    term: "Task diversity",
    definition: "Task diversity is the practice of mixing many kinds of supervised examples during alignment — QA, rewriting, coding, classification as text — so the model generalizes to novel instructions instead of overfitting one format.\n\nA narrow mix yields brittle assistants.\n\nExample: a fine-tune set with math word problems, email drafting, and JSON extraction produces a model that still obeys when asked for a haiku about databases; a set with only trivia QA may collapse when asked to format output as a table.",
  },
];
