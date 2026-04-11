export const entry = {
  year: 2021,
  name: "Rotary Position Embeddings (RoPE)",
  diag: "rope",
  oneLiner: "Encode position via rotation, not memorization",
  problem: `Absolute positions failed beyond training length, so rotary embeddings encoded distance through learned rotations.

The original Transformer added absolute positional encodings — a fixed vector for each position index added to the token embedding. A model trained on sequences up to 2,048 tokens has never seen position 2,049 — its positional encoding is undefined, and the model breaks. This is the length generalization problem.

RoPE encodes position through rotation rather than addition. Instead of adding a position vector, RoPE rotates the query and key vectors in 2D subspaces by an angle proportional to their position. The mathematical insight: when you compute the dot product of a rotated query at position m and a rotated key at position n, the rotation angles partially cancel, and the result depends only on the relative distance (m − n), not the absolute positions. This uses Euler's formula (e^{iθ} = cosθ + i·sinθ) to encode positions as rotations. The model naturally generalizes to longer sequences because it only needs to understand relative distances, not memorize specific position indices.`,
  whyNotSooner: `The key mathematical leap was realizing rotations could encode relative position cleanly without redesigning attention.

Relative position encodings existed but required complex attention modifications. RoPE's use of Euler's formula to encode positions as rotations was mathematically elegant but non-obvious.`,
  examples: "Llama 1/2/3,Mistral,Qwen,DeepSeek,Gemma — nearly all open-weight models",
};
