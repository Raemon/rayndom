# Is there a special sauce missing? How hard is it to find?

This folder is an essay-with-diagrams/widgets that is meant to help me think about:

1. Are LLMs missing some kind of "special sauce" that is loadbearing for them to reach a form of relentless, creative resourcefulness that would make them a threat to humanity? (see: [https://www.lesswrong.com/posts/8fg2mv9rj4GykfZHf/intelligence-greater-than-relentless-creative](Intelligence -> Relentless, Creative Resourcefulness))

2. Why are LLMs sometimes still often metacognitively dumb, in ways that seem like they have the skills to avoid if they just remembered to use those skills. Specifically they:

- sometimes waste lots of tokens on very simple questions
- if they don't figure something out quickly, they start trying random stuff that builds on top of their existing spaghetti code solution instead of stepping back and thinking from scratch (despite having the skill to think from scratch if they're directed to. Why isn't this reinforced during RL training?)
- they still aren't that good at openended creativity.

3. Which LLM innovations required conceptual breakthroughs.

4. How likely is it that we need another conceptual breakthrough, to get special sauce?

5. How exactly do current frontier models work, and what are the implications about what kind of thinking is difficult for them.

Note: I am somewhat confused about how to unify all this into a single web page. The topics all feel connected to me, it's not clear what the throughline should be.

# Styling: Tailwind

All React component styling in this folder MUST use Tailwind CSS classes, not inline `style={{}}` objects.

- Custom color tokens are defined in `globals.css` under `@theme inline` with prefix `te-`: `text-te-accent`, `bg-te-bg`, `text-black`, etc.
- SVG diagram files (`diagrams/*.jsx`) may still use `colors.js` for SVG `fill`/`stroke` attributes (these cannot be Tailwind classes), but the SVG element itself should use Tailwind for layout (`className` not `style`).
- `colors.js` exists only for SVG attribute values. Non-SVG components must NOT import it.
- The Tooltip component supports both `wrapperClassName` and `contentClassName` — use these instead of `wrapperStyle`.
- For values without exact Tailwind utilities, use arbitrary values: `text-[0.82em]`, `tracking-[0.08em]`, `max-w-[1600px]`, etc.

# Sub-documents

Detailed rules for specific subsystems are split into their own files:

- [claude-history.md](./claude-history.md) — rules for the transformer history timeline, research accuracy, and conciseness
- [claude-diagrams.md](./claude-diagrams.md) — rules for architecture diagrams (style, visual language, diffing against predecessors)
- [claude-glossary.md](./claude-glossary.md) — rules for glossary definitions (pedagogy, structure, accessibility)
