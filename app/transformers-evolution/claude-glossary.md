# Glossary Rules

The glossary should be a world class UI/pedagogical tool, which allows laymen to rapidly get the gist of a concept, in a way that meets them at their current level but onboards them into knowing the technical jargon.

Explanations in jargon definitions should help bridge the conceptual gap between someone who doesn't know the field at all.

## Managing entries

- When creating a glossary entry, check if there are similar entries, and update the single entry with "alt terms" list that includes variant terms that should trigger the same glossary item.

- When glossary definitions are created, if those definitions also have new jargon, create glossary definitions for that as well.

## Definition structure

Each jargon definition should have:

- **Lead sentence** — explains what the word means, conveying the core technical concept in a way that will make sense to someone who doesn't know the field.

- **Detail paragraph** — goes into more detail, if necessary.

- **Worked example** — a concrete scenario showing what it'd mean to see this term implemented in the world.

## Pedagogical rules

- **State the problem before the solution.** Many terms are solutions to problems (FlashAttention, LSTM, residual connections). Lead with *why this exists* — the reader who doesn't know the problem can't appreciate the solution.

- **Ground-floor terms must be jargon-free.** Since JargonText nests only 2 levels deep, there must be a base tier of definitions a complete layperson can understand without hovering on anything. Identify which terms are at the bottom of the dependency graph and write those using only everyday language.

- **Lead with analogy or metaphor, then sharpen with precision.** Give the reader a mental scaffold first ("Attention is like highlighting the most relevant words in a textbook when answering a question"), then follow with the technical sentence.

- **Contrast with the predecessor or the naive alternative.** Many concepts only make sense relative to what came before. "Unlike RNNs, which process words one-at-a-time, Transformers process all words simultaneously." This leverages the reader's existing (possibly just-acquired) knowledge.

- **Use functional framing: what does it DO, not just what IS it.** "Softmax converts raw scores into a probability distribution" is better than "Softmax is a normalization function." Readers need to know what happens when this runs, not its taxonomic category.

- **Anchor abstract quantities with concrete examples.** Instead of "large corpus" say "billions of words scraped from the internet — roughly all of Wikipedia, thousands of books, and millions of web pages." Scale is meaningless without reference points.

- **Avoid hedge words that create false familiarity.** Words like "just," "simply," and "basically" signal to novices that something should be obvious, producing shame rather than understanding.

- **One concept per definition.** If a definition requires explaining two distinct ideas, the second one should be its own glossary entry that gets jargon-linked. This keeps each tooltip scannable (they render in small 300px-wide popovers).

- **Use consistent sentence structure for the lead sentence.** A pattern like "[Term] is a [category] that [function/purpose], used to [practical motivation]" helps readers build pattern recognition and rapidly parse new definitions.

- **Worked examples should be concrete enough to visualize.** Avoid "imagine a model does X" — instead use a specific scenario: "If the input is 'The cat sat on the ___', the model assigns high attention to 'cat' and 'sat' when predicting the blank."

- **Flag when a term has a different everyday meaning.** Terms like "attention," "token," "policy," "embedding," and "loss" all have common English meanings that can mislead. Briefly acknowledge the collision: "In ML, 'loss' doesn't mean something is lost — it's a score measuring how wrong the model's prediction was."
