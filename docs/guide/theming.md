---
outline: deep
---

# Theming

Every Agala color token stores raw HSL channels. Components add `hsl()` at the usage site, which also allows alpha values without duplicating tokens.

```css
:root {
  --agala-primary: 200 90% 50%;
  --agala-background: 0 0% 100%;
  --agala-card: 0 0% 100%;
  --agala-foreground: 240 10% 3.9%;
  --agala-border: 240 5.9% 90%;
  --agala-radius: 0.5rem;
}

.custom-surface {
  color: hsl(var(--agala-primary));
  background: hsl(var(--agala-primary) / 0.1);
}
```

<ThemeControls />

## Semantic token groups

| Group | Tokens |
| --- | --- |
| Surfaces | `background`, `foreground`, `card`, `popover` and matching foreground tokens |
| Actions | `primary`, `secondary`, `accent` and matching foreground tokens |
| Status | `success`, `warning`, `danger` and matching foreground tokens |
| Structure | `border`, `input`, `ring`, `overlay` |
| Shape and depth | `radius*`, `shadow-*` |
| Typography | `font-*`, `font-size-*`, `line-height-*`, `letter-spacing-*` |
| Layout | control heights, navbar/sidebar dimensions, z-index, and breakpoint tokens |

## Dark mode

The default theme responds to `prefers-color-scheme: dark`. Consumers do not need to toggle a class for automatic OS-level dark mode.

## Named themes

Named product themes ship as optional CSS entry points. Import the palette you need after the library, then apply its HTML data attribute:

```ts
import '@agala-labs/ui/themes/main.css'

document.documentElement.setAttribute('data-theme', 'main')
```

| Theme | Import | Selector | Character |
| --- | --- | --- | --- |
| Main | `@agala-labs/ui/themes/main.css` | `main` | Agala Labs navy and electric blue |
| Smaltt | `@agala-labs/ui/themes/smaltt.css` | `smaltt` or `esmaltt` | Warm clinical canvas and teal |
| Kervo | `@agala-labs/ui/themes/kervo.css` | `kervo` | Operational navy and bright blue |

For example, the Kervo theme can be selected with:

```ts
document.documentElement.setAttribute('data-theme', 'kervo')
```

Remove the attribute to return to the default theme and its automatic OS-level dark mode. Main, Smaltt, and Kervo are fixed light themes. Load any fonts required by a named theme separately because theme stylesheets do not perform network requests.

## Component-level customization

Prefer semantic global tokens for product-wide decisions and component custom properties for local, supported customization. Use a component's `class` prop only when the public component already exposes it.
