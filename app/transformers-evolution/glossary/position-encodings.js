// Position encoding concepts.
// See ../claude-glossary.md for writing guidelines.
export const entries = [
  {
    term: "Absolute position encoding",
    definition: "Absolute position encoding is a scheme that attaches a fixed vector (or table lookup) to each index in the sequence — first token, second token, and so on — and adds it to the token embedding.\n\nTransformers mix all positions in parallel, so without such tags the model cannot tell word order; absolute encoding restores a simple \"slot number\" for each position.\n\nThe fifth word always gets the same encoding pattern for \"fifth\", which works well in training but breaks when inference runs longer than the longest sequence the table was built for.",
  },
  {
    term: "Relative position",
    definition: "Relative position encoding describes how far apart two tokens are — two steps left, five steps right — instead of labeling each token with a global index alone.\n\nThe problem with only global positions is that patterns like \"adjective next to its noun\" should look the same at the start or end of a long document; relative features emphasize spacing, not absolute coordinates.\n\nWhether \"very\" sits two tokens before \"fast\" in a short tweet or in the middle of a ten-page essay, the model can reuse the same \"distance 2\" relationship feature.",
  },
  {
    term: "Length extrapolation",
    definition: "Length extrapolation is a model's ability to run on sequences longer than any example it saw during training without the representation falling apart.\n\nMany position schemes implicitly assume \"position 8000 behaves like training\"; if the model never saw indices that large, attention and embeddings can misbehave at deployment.\n\nA system trained only on 4,096-token documents that still answers coherently on a 32,000-token brief exhibits good extrapolation; one that garbles or repeats past the training cap does not.",
  },
  {
    term: "RoPE",
    altTerms: ["Rotary Position Embedding", "Rotary Position Embeddings"],
    definition: "RoPE (Rotary Position Embedding) is a position method that rotates query and key vectors by an angle tied to their index so that attention scores depend on relative offset in a smooth way.\n\nInstead of bolting a separate position vector only onto embeddings, the rotation couples position directly into how queries and keys line up, which often generalizes better when sequences grow longer than in training.\n\nIf token A is three positions before token B, the angle difference between their rotations is the same anywhere in the text, so the model can reuse \"three apart\" patterns learned on short contexts when reading a much longer file.",
  },
];
