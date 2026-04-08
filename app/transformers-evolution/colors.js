// Consistent color system used across all diagrams and UI
// RULE: Same color always means the same thing across every diagram.
export const C = {
  token: '#8B7355',      // input tokens, embeddings, data
  attn: '#C4A972',       // attention mechanisms (shared across all diagrams)
  ffn: '#6B8E6B',        // feed-forward networks, computation, outputs
  gate: '#9B7CB4',       // gates, control flow, conditioning
  novel: '#C07040',      // THE NEW THING in each innovation (highlighted)
  cellState: '#5B8FA8',  // LSTM-specific: cell state line
  dim: '#999',           // arrows, secondary elements, borders
  bg: '#e8e7cf',         // page background
  rowEven: '#f7f6f4',    // table row alternating bg
  rowOdd: '#eeedeb',     // table row alternating bg
  textPrimary: '#1a1a1a',// main text
  textAccent: '#8a6d3b', // year numbers, glossary terms, model names
  textSecondary: '#333',
  headerText: '#777',
};
