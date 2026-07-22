# Component example conventions

Component pages define examples in `docs/data/components.ts`. Each example needs a stable kebab-case `id`, a short context label, an optional one-sentence usage note, and a snippet that exactly matches the rendered fixture selected by `ComponentPreview`.

Use at least two meaningful examples per component. Simple primitives normally need a canonical example plus states or realistic composition. Stateful, overlay, navigation, and data components should add focused examples for important variants, constrained widths, and recovery states. Group minor prop permutations into one example rather than creating a tab for every prop.

Example fixtures must use public exports, semantic tokens, truthful data, valid interactive nesting, and keyboard-accessible behavior. Tests should assert semantics, behavior, bounds, and representative geometry; do not add committed screenshot baselines.
