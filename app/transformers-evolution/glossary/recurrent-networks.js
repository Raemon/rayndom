// Recurrent network concepts (RNNs, LSTMs).
// See ../claude-glossary.md for writing guidelines.
export const entries = [
  {
    term: "Recurrence",
    definition: "Recurrence is a wiring pattern where a model passes an updated internal summary from one timestep to the next while reading an ordered sequence, so the same parameters process every position but carry memory forward.\n\nIt solves the problem of variable-length input: you do not need a separate network size for each sentence length.\n\nExample: at word 5 in a sentence, the state vector bundles what words 1–4 suggested about subject and tense; that vector feeds into the computation at word 5 along with the embedding of word 5.",
  },
  {
    term: "RNN",
    altTerms: ["RNNs", "Recurrent neural network", "Recurrent neural networks", "Recurrent net"],
    definition: "An RNN is a neural architecture that consumes sequences one element at a time (token, audio frame, time-step) and updates a hidden state after each step, reusing the same weights at every position.\n\nUnlike a feedforward net that ingests a fixed-size vector in one shot, an RNN threads length through time via that state.\n\nExample: for the character stream \"h-e-l-l-o\", the hidden state after \"hell\" influences how the model predicts the next character \"o\".",
  },
  {
    term: "BPTT",
    altTerms: ["Backpropagation through time"],
    definition: "Backpropagation through time (BPTT) is how an RNN is trained: the loop over timesteps is unrolled into a long chain of layers, and ordinary backprop runs backward along that chain so each timestep's error shapes weights shared across time.\n\nWithout unrolling, there would be no path from a late mistake back to early timesteps.\n\nExample: the model mis-predicts the verb at the end of a 40-word clause; BPTT sends gradients back through all 40 unfolded steps so early words that set subject number can move their representations.",
  },
  {
    term: "Vanishing gradient",
    definition: "The vanishing gradient problem is what happens when error signals shrink exponentially as they travel backward through many layers or timesteps, so early parameters barely move even when they caused the mistake.\n\nLong chains of multiplications (especially with squashing activations) damp small factors repeatedly — like a message whispered down a long line.\n\nExample: in a 100-step unrolled RNN, gradients to timestep 5 may be orders of magnitude smaller than gradients to timestep 95, so the model learns short habits and forgets how to use information from the sentence start.",
  },
  {
    term: "Constant error carousel",
    definition: "The constant error carousel is an LSTM design element: a memory lane where information can ride forward across timesteps with additive updates and without being crushed by repeated multiplications, so gradients have a highway backward too.\n\nIt targets the vanishing gradient failure mode of plain RNNs.\n\nExample: a carry line holds a running total; gates add or remove pieces each step, but the pathway itself does not force every signal through a long chain of shrinking factors.",
  },
  {
    term: "LSTM",
    altTerms: ["LSTMs"],
    definition: "An LSTM is a recurrent cell that adds a protected memory vector and gating (forget, input, output) so the network can store, overwrite, or expose information across many timesteps instead of overwriting its state every step.\n\nPlain RNNs tend to wash out context after tens of steps; LSTMs were built to keep stable paths for information and gradients over hundreds.\n\nExample: in a 200-word dependency (\"The writer, who ... , published\"), an LSTM can retain number or gender cues from the subject until the verb appears much later.",
  },
  {
    term: "Gated cell state",
    definition: "The gated cell state is the LSTM's main memory vector: at each timestep, learned gates decide what fraction of the old cell to erase, what new candidate information to write in, and what filtered version becomes visible to the rest of the network.\n\nFunctionally it is a vector notebook where the model learns when to turn the page, when to annotate, and when to show a line to the output.\n\nExample: when a new clause starts, the forget gate can clear obsolete slot fillers while the input gate writes in the new entity name, all without destroying unrelated digits stored for a date mentioned earlier.",
  },
];
