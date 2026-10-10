# Aceternity UI integration

Selected free Aceternity components have been adapted for this application's React/Vite stack. No Pro templates or additional UI runtime packages are used.

| Source | Local component | Used by |
| --- | --- | --- |
| [Card Hover Effect](https://ui.aceternity.com/components/card-hover-effect) | `client/src/components/ui/HoverGrid.jsx` | Dashboard topic cards, company directory, sheet library |
| [Bento Grid](https://ui.aceternity.com/components/bento-grid) | `client/src/components/ui/BentoGrid.jsx` | Landing-page feature grid |
| [Tabs](https://ui.aceternity.com/components/tabs) | `client/src/components/ui/AnimatedTabs.jsx` | Landing-page topic/sheet preview |

Sources were read from Aceternity's public component registry on 2026-10-10. Shared-layout selection also informs the main navigation and settings appearance selector. The local code adapts the source patterns to React Router, existing Framer Motion, JavaScript, and the application's theme tokens rather than fixed dark-mode classes.

## Interaction rules

- Hover treatments also respond to keyboard focus and never cover links or controls.
- Layout IDs are scoped per component instance.
- Tabs support ArrowLeft, ArrowRight, Home, and End, with linked tab/panel semantics and a single tab stop. Hidden panels cannot receive focus.
- Both the system reduced-motion preference and the in-app preference disable decorative movement.
- Topic progress, catalog totals, and sheet previews come from existing API responses. Decorative feature illustrations contain no fabricated user statistics.
- New styles live in `client/src/components/ui/aceternity.css` and use the shared light/dark color tokens.
- List pagination, filters, saved position, authentication, and API behaviour remain covered by the browser suite.

Public source URLs: `https://ui.aceternity.com/registry/card-hover-effect.json`, `https://ui.aceternity.com/registry/bento-grid.json`, `https://ui.aceternity.com/registry/tabs.json`.
