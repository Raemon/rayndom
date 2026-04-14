---
name: animated-lineage-diagram-authoring
description: Create or extend staged diagrams in app/transformers-evolution/AnimatedLineageDiagram.jsx. Use when adding a new diagram stage, a new innovation in the lineage, or reworking how one stage builds from the previous stage. Think through the actual ML architecture first, sanity check the explanation with targeted web research, keep each stage mentally small, preserve anchors from the previous stage, and work alongside the diagram-transition-animation skill when motion changes are needed.
---

# Animated Lineage Diagram Authoring

## Goal

Add new stages to `app/transformers-evolution/AnimatedLineageDiagram.jsx` so each stage feels like the previous one plus one new idea.

Default rules:
- Preserve at least one anchor from the previous stage.
- Introduce only 1-4 meaningful visual elements in the new stage.
- If the idea needs more than 4 elements, split it into multiple stages.

Quality bar:
- Aim for Chris Olah caliber explanatory diagrams: technically correct, visually economical, and explicit about what changed in the architecture.
- Do not draw first and rationalize later. Understand the mechanism before choosing the stage design.

## When To Use

Use this skill when:
- adding a new stage to `AnimatedLineageDiagram.jsx`
- simplifying or re-sequencing an existing stage
- showing a later innovation as an extension of an earlier one

If the change also needs smoother motion between stages, read and apply `.cursor/skills/diagram-transition-animation/SKILL.md` before editing the transition behavior.

## Mental Model

Each stage should do one of two things:
1. Add something to the previous diagram.
2. Slide the existing diagram aside to make room for one new thing to compare against.

The stage should answer one comparison question:
- What survived from the previous idea?
- What exactly is new here?
- Why did this extra structure matter?

## Concept Validation

Before editing the diagram, think through the architecture of the ML concept itself.

Work through these questions:
- What are the actual computational parts of the mechanism?
- Which parts are essential for understanding the innovation, and which are implementation detail?
- What part of the previous stage survives into this one?
- What is the minimum visual story that stays technically honest?

If you cannot clearly explain the mechanism in plain language first, do not draw it yet.

## Research Workflow

Before finalizing a new stage:
1. Sanity check your understanding with targeted web research.
2. Prefer primary or high-quality technical sources: original papers, author writeups, model documentation, or strong educational references.
3. Verify that the diagram is not implying a false architecture, missing a crucial component, or overstating what changed.
4. If sources disagree, surface the ambiguity instead of hiding it in the drawing.

Research should answer questions like:
- Is this mechanism actually a new architectural component or mostly a training procedure?
- Is the new thing best shown as a node, a pathway, a repeated block, or an annotation?
- Did the historical innovation change model structure, information flow, optimization, or all three?

## Source Hierarchy

Prefer sources in this order:
1. Original papers.
Use for historical accuracy and for what changed architecturally.
2. Author or lab writeups.
Use for intended intuition, framing, and simplifications from the inventors.
3. High-quality technical explainers.
Use for abstraction choices and for clarifying what to visualize.
4. Framework or model documentation.
Use for modern implementation conventions and terminology.
5. Reference implementations.
Use when the diagram depends on actual information flow or module boundaries.
6. Survey papers or textbooks.
Use for broader context and terminology normalization.

## Minimum Source Standard

For each new architectural stage, try to use:
- at least one primary source
- at least one explanatory source
- at least one implementation-oriented source if the diagram shows internal wiring or module structure

Treat the sources as serving different roles:
- historical truth: original papers
- mechanistic intuition: strong explainers
- implementation sanity check: docs or code

If you cannot find a primary source, say so explicitly instead of implying certainty.

## Weak Sources

Do not rely primarily on:
- random blog posts with no citations
- SEO tutorial sites
- LLM-generated summaries
- unattributed slides
- copied secondary diagrams that were not checked against a stronger source

## Authoring Workflow

1. Explain the mechanism in words.
Write a short plain-language summary of the innovation before choosing the visual form.
2. Sanity check with research.
Use targeted web search to confirm the architectural story is accurate enough to visualize.
3. Identify the previous-stage anchor.
Use an element that already exists in the previous stage: a node, box, repeated cell, or state path.
4. Choose the stage shape.
Use either "add in place" or "slide aside and compare."
5. Budget working-memory load.
Keep the scene to 1-4 meaningful elements. Count conceptual chunks, not decorative lines.
6. Choose the abstraction level.
Show the smallest set of components that tells the truth about the innovation.
7. Update stage metadata.
Edit `stageDefinitions` and `stageIndexesByType` so the label and explanation match the new scene.
8. Reuse shared helpers.
Drive visibility and motion with `getVisibilityStyle()` and `getMotionStyle()` instead of replacing the whole scene.
9. Draw with continuity.
Prefer extending an existing group or component over creating a disconnected new scene.
10. Verify readability.
Make sure a reader can infer the new idea without parsing many labels.

## Layout Rules

Prefer "add in place" when:
- the new idea is a direct refinement of the old one
- the anchor can stay near the center
- only 1-2 new peers or overlays are needed

Prefer "slide aside and compare" when:
- the old diagram needs to remain visible as context
- the new idea is a neighboring block, mechanism, or alternative
- the comparison is easier when old and new coexist briefly

## File-Specific Guidance

In `AnimatedLineageDiagram.jsx`:
- Keep stage text concise. `detailLines` should usually be one or two short lines.
- Prefer extending the existing scene components before creating a totally separate subtree.
- Keep active-stage logic separate from drawing details, following the existing `stageIndex` pattern.
- Preserve shared anchor elements across adjacent stages so the transition skill has something stable to animate.
- Do not crowd a single stage with a full system diagram. Introduce the system in slices.

## Current Pattern Examples

Good additions:
- A single node becomes one node inside a slightly larger network.
- One recurrent cell stays visible while peer cells fade in around it.
- A centered cell shifts left so one new mechanism can appear beside it.

Avoid:
- replacing the whole scene with a totally different layout
- introducing many labels, arrows, and subparts in one stage
- using one stage to explain two new ideas at once
- presenting a training trick as if it were a new model architecture
- drawing details that you have not sanity checked against a reliable source

## Deliverable Checklist

Before finishing:
- [ ] Explained the ML mechanism in plain language first
- [ ] Sanity checked the architectural story with targeted research
- [ ] Used source types strong enough for the architectural claim being drawn
- [ ] Named the preserved anchor from the previous stage
- [ ] Kept the new stage to 1-4 meaningful elements
- [ ] Chose either add-in-place or slide-aside
- [ ] Chose an abstraction level that is technically honest
- [ ] Updated stage text to explain one new idea
- [ ] Applied the transition skill too if motion behavior changed
- [ ] Re-read the file and checked lints

## Response Style

When using this skill in a user task, briefly state:
- the plain-language architectural summary
- what research or source-checking was used
- any uncertainty or source disagreement that affected the abstraction
- the preserved anchor
- whether the stage adds in place or slides aside
- the one-sentence explanation of the new idea
- whether the transition skill was also used
