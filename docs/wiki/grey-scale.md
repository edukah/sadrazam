# Grey Scale

Sadrazam's grey scale uses **equal 13-unit RGB intervals** from white (255) down to near-black (16). This produces 20 named steps plus `zero` (pure white).

## Scale

| Token | RGB | Hex | Dark Mode Swap |
|-------|-----|-----|----------------|
| `grey-zero` | 255 | `#ffffff` | ↔ `grey-900` |
| `grey-50` | 250 | `#fafafa` | ↔ `grey-850` |
| `grey-100` | 237 | `#ededed` | ↔ `grey-800` |
| `grey-150` | 224 | `#e0e0e0` | ↔ `grey-750` |
| `grey-200` | 211 | `#d3d3d3` | ↔ `grey-700` |
| `grey-250` | 198 | `#c6c6c6` | ↔ `grey-650` |
| `grey-300` | 185 | `#b9b9b9` | ↔ `grey-600` |
| `grey-350` | 172 | `#acacac` | ↔ `grey-550` |
| `grey-400` | 159 | `#9f9f9f` | ↔ `grey-500` |
| `grey-450` | 146 | `#929292` | midpoint (same) |
| `grey-500` | 133 | `#858585` | ↔ `grey-400` |
| `grey-550` | 120 | `#787878` | ↔ `grey-350` |
| `grey-600` | 107 | `#6b6b6b` | ↔ `grey-300` |
| `grey-650` | 94 | `#5e5e5e` | ↔ `grey-250` |
| `grey-700` | 81 | `#515151` | ↔ `grey-200` |
| `grey-750` | 68 | `#444444` | ↔ `grey-150` |
| `grey-800` | 55 | `#373737` | ↔ `grey-100` |
| `grey-850` | 42 | `#2a2a2a` | ↔ `grey-50` |
| `grey-900` | 29 | `#1d1d1d` | ↔ `grey-zero` |
| `grey-910` | 23 | `#171717` | no swap |
| `grey-950` | 16 | `#101010` | no swap |

## Dark Mode Swap Rule

Formula: `N ↔ (900 - N + 50)` — e.g., `50 ↔ 850`, `100 ↔ 800`, `150 ↔ 750`.

**Midpoint:** `grey-450` (146) stays the same in both modes.

**Exceptions:** `grey-910` and `grey-950` are not swapped. They exist for text color mapping (`text-dark-1 = grey-910`) and natural scale continuation. Text colors use their own dark mode swap mechanism via `_colors-text.scss`.

## Text Color Alignment

Light theme text colors are linked to grey steps:

| Variable | Grey Token | RGB |
|----------|-----------|-----|
| `text-dark-1` | `grey-910` | 23 |
| `text-dark-2` | `grey-700` | 81 |
| `text-dark-3` | `grey-500` | 133 |
| `text-dark-4` | `grey-300` | 185 |

Dark theme text colors (`text-light-1` through `text-light-4`) are **not** pure greys (R≠G≠B), so they remain independent.

## CSS Custom Properties

Each grey step has two CSS custom property variants:

- **Adaptive** `var(--color-grey-N)` — swaps in dark mode
- **Fixed** `var(--color-grey-N--f)` — same value in both modes

## Utility Classes

Background classes follow the same pattern:

- `.tbc-grey-N` — adaptive background
- `.tbc-grey-N--f` — fixed background

## Source File

`src/scss/theme/_colors-grey.scss`

## Migration Reference

When migrating from the old scale, use this mapping:

| Old Token (RGB) | New Token (RGB) |
|-----------------|-----------------|
| `grey-50` (250) | `grey-50` (250) — no change |
| `grey-100` (245) | `grey-100` (237) — or `grey-50` for lighter |
| `grey-200` (235) | `grey-100` (237) |
| `grey-300` (224) | `grey-150` (224) — exact match |
| `grey-400` (204) | `grey-250` (198) |
| `grey-500` (160) | `grey-400` (159) |
| `grey-600` (125) | `grey-550` (120) |
| `grey-700` (90) | `grey-650` (94) |
| `grey-750` (75) | `grey-750` (68) |
| `grey-800` (55) | `grey-800` (55) — no change |
| `grey-850` (46) | `grey-850` (42) |
| `grey-870` (42) | `grey-850` (42) — deleted |
| `grey-900` (35) | `grey-900` (29) |
