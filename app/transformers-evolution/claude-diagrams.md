# Diagram Rules

World class diagrams for each architecture, both from a "accurately represent the core innovation" stance, and a "great UI that is clear and easy to interact with."

Tooltips for diagrams should use the same infrastructure as the jargon tooltips.

Where possible, diagrams should be similarly structured to whatever architecture predated that diagram's architecture (within a given lineage). So, a person looking at the two diagrams can see the diff.

## Design principles (inspired by Chris Olah's visual style)

- Show what happens to the DATA, not just what the components are called. When feasible, visually depict the actual tensor operation (matrices multiplying, vectors splitting, element-wise gating) rather than only labeling a box with the operation's name.

- Use a small, consistent shape vocabulary across all diagrams: rectangles for learned transforms, circles or small symbols for pointwise operations (σ, tanh, +, ×), and lines for data/vector flow. Same shape should always mean the same kind of thing.

- Where a mechanism involves a change in tensor shape (e.g. splitting into heads, projecting to a higher dimension, compressing), show that visually through the width/height of the flow lines or blocks so the reader gets physical intuition.

- Annotate key arrows/lines with what's flowing (e.g. "h_{t-1}", "concat", "copy"), especially at branches and merges. Don't rely solely on tooltips for understanding flow.

- When showing a novel mechanism, consider including a ghosted/dimmed version of the predecessor's structure within the same diagram, with the new parts in full color, so the innovation is visually obvious as a diff.

- Keep visual chrome minimal: no unnecessary borders, shadows, or 3D effects. Every visual element should encode information.

- Do not give a top-level title to the diagram. Instead, put a caption at the bottom that explains the core concept the diagram is trying to convey (in one line)

– except for variable names, all labels should be 11px. Variables should be 9px.

– make sure all box/shapes are large enough you can fix their text label on top of them.

## Helper vocabulary (helpers.jsx)

- `box(x,y,w,h,fill,label,detail,fs=11)` — rectangle for learned transforms
- `op(x,y,symbol,detail,{r,color,fill})` — circle for pointwise ops (σ, tanh, +, ×)
- `ghostBox(x,y,w,h,label,detail,fs=9)` — dimmed dashed predecessor element for visual diffing
- `lbl(x,y,text,fs=11,color)` — annotation text (11px labels, 9px for variable names)
- `arr(x1,y1,x2,y2)` — arrow line for data flow
- `DiagramTip` — wraps SVG groups with hover tooltips