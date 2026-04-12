---
name: diagram-transition-animation
description: Smoothly animate one diagram into the next in React or SVG-based UI diagrams. Use when the user wants a diagram to morph, transition, or animate between states instead of abruptly swapping, especially in scroll-driven explainers, lineage diagrams, or staged visual narratives.
---

# Diagram Transition Animation

## Goal

Turn abrupt diagram swaps into smooth state-to-state motion.

Prefer continuity over replacement:
- Keep anchor elements alive across stages.
- Move existing elements into their next positions.
- Fade or grow new supporting structure around the preserved anchors.
- Add explanatory overlays only after the base structure is stable.

## Quick Workflow

1. Read the current diagram component and identify how stage changes are triggered.
2. Check whether the scene is being remounted on stage change.
3. Identify the anchor shapes that should persist between the two stages.
4. Rewrite the transition so those anchors stay mounted and interpolate position, scale, and opacity.
5. Fade in new nodes, edges, labels, or arrows as separate groups instead of replacing the old scene wholesale.
6. Verify the edited file for lints after the change.

## First Checks

Before changing the drawing logic:

- Look for keyed wrappers like `key={stage}` or `key={type-stage}` around the scene. Removing a keyed remount is often required for transitions to actually interpolate.
- Look for stage-specific conditionals that fully replace one subtree with another. If possible, keep one shared scene mounted and drive styles from stage state instead.
- Check whether the stage change is stepped over time. If the component already moves through intermediate stages, preserve that structure.

## Preferred Pattern

Use one shared scene with style-driven groups:

```jsx
<g>
  <g style={getMotionStyle({ x: anchorOffsetX, scale: anchorScale })}>
    <Node cx={hiddenX} cy={210} />
  </g>
  <g style={getVisibilityStyle({ isVisible: showExpandedNetwork, opacity: 1 })}>
    {extraNodes}
    {extraEdges}
  </g>
</g>
```

Default approach:
- A persistent anchor group for elements that exist in both stages.
- A visibility group for new structure that fades in.
- A late overlay group for annotations like backward arrows, gate labels, or callouts.

## Transition Rules

### Preserve anchors

If one concept continues into the next diagram, keep the same SVG element alive.

Examples:
- Single perceptron becomes the center hidden unit in a multilayer network.
- One recurrent cell becomes the repeated cell shown across timesteps.
- A compact block becomes one panel inside a more detailed explainer.

### Separate motion from reveal

Do not make one group handle everything if that causes awkward scaling or fading.

Prefer:
- one group for the moving anchor
- one group for newly revealed peers
- one group for newly revealed connections
- one group for explanatory overlays

### Keep layout mentally traceable

When expanding a diagram:
- slide existing structure toward its new role
- fade in sibling nodes near it
- fade in new edges after node positions are readable
- add labels or arrows last

### Avoid abrupt replacement

Do not switch from:
- "single node scene"
- directly to "fully different network scene"

Instead, build the second scene out of the first scene's surviving parts.

## Implementation Notes

- Prefer shared helper styles such as `getVisibilityStyle()` and `getMotionStyle()`.
- Use transitions on `opacity` and `transform`.
- Keep transforms simple: `translate(...) scale(...)` is usually enough.
- If an element should remain present but de-emphasized, reduce opacity instead of removing it.
- For SVG diagrams, `transformBox: 'fill-box'` and `transformOrigin: 'center center'` help motion feel stable.

## Scroll-Driven Diagram Guidance

For diagrams driven by scroll position:
- Keep the active stage logic separate from the drawing logic.
- Let the drawing component accept a stage index or type and derive visibility from that.
- If the UI advances through multiple intermediary stages, animate through them instead of jumping directly to the destination.

## Example Mapping

For `perceptron -> multilayer -> backprop`:
- Keep the perceptron node mounted.
- Slide it into the hidden-layer position.
- Fade in the other hidden units.
- Fade in the output layer and dense connections.
- Only then fade in the backprop arrows and explanation text.

## Verification

After editing:

1. Re-read the updated diagram file.
2. Run lints on the edited file.
3. If a transition still snaps, look again for a remount or for conditionals that replace the anchor element instead of preserving it.

## Deliverable Style

When using this skill in a user task:
- Briefly name the continuity strategy being used.
- Mention the preserved anchor element(s).
- Call out if a keyed remount was removed.
- Summarize what now moves versus what fades in.
