// Pre-training and transfer learning concepts.
// See ../claude-glossary.md for writing guidelines.
export const entries = [
  {
    term: "Autoregressive",
    definition: "A method of generating text one word at a time, where each word is chosen based on all the words before it — like writing a sentence left-to-right without skipping ahead. Given 'The cat sat on the,' the model picks 'mat' by considering those five words, then uses all six to pick the next.",
  },
  {
    term: "Pre-training",
    definition: "The first phase of training, where a model reads massive amounts of text — books, websites, code — to learn general patterns of language before being specialized for any particular task. Like a medical student's broad education before choosing a specialty.",
  },
  {
    term: "Fine-tuning",
    definition: "After pre-training gives a model broad language knowledge, fine-tuning adapts it to a specific task using a smaller, curated dataset. The broad foundation remains, but performance on the target task improves dramatically — like a generalist doing specialized on-the-job training.",
  },
  {
    term: "Masked language modeling",
    definition: "A training method that hides random words in a sentence and asks the model to fill in the blanks using surrounding context. Given 'The ___ sat on the mat,' the model learns to predict 'cat' by reading words on both sides — unlike autoregressive training, which only reads left-to-right.",
  },
  {
    term: "Bidirectional context",
    definition: "Using words both before and after a position to understand it. Autoregressive models read left-to-right like writing a sentence; bidirectional models see the full sentence at once, like a human re-reading a paragraph to understand a tricky word.",
  },
  {
    term: "SFT",
    altTerms: ["Supervised fine-tuning"],
    definition: "Supervised Fine-Tuning — a pre-trained model can generate text but doesn't know how to be a helpful assistant. SFT teaches it by training on curated (question, ideal answer) pairs so the model learns to respond in the desired format and style.",
  },
  {
    term: "Instruction following",
    definition: "A model's ability to do what you ask in plain language. A base model might respond to 'Summarize this article' by continuing the text as though writing a document; an instruction-following model recognizes it as a command and produces a summary.",
  },
  {
    term: "Task diversity",
    definition: "Training on a wide variety of task types — question-answering, summarization, translation, coding — so the model generalizes to new instructions it hasn't seen. Without task diversity, a model fine-tuned only on Q&A might fail when asked to write a poem.",
  },
];
