# Button System

## Architecture

Buton sistemi `--button-color` CSS custom property uzerine kurulu.
Her renk varyanti bu variable'i set eder, kademeler (soft/outline) bu variable'i okur.

## Colors

| Class | Color Variable |
|-------|---------------|
| `--pri` | `--color-pri-500` |
| `--sec` | `--color-sec-500` |
| `--ter` | `--color-ter-500` |
| `--neutral` | custom (grey system) |
| `--danger` | `--color-danger-500` |
| `--safe` | `--color-safe-500` |
| `--notice` | `--color-notice-500` |
| `--caution` | `--color-caution-500` |
| `--warning` | `--color-warning-500` |

## Tiers

| Tier | Class | Behaviour |
|------|-------|-----------|
| Filled | (default) | Solid bg, white text, colored border |
| Soft | `--soft` | 12% bg tint, colored text, no border |
| Outline | `--outline` | Transparent bg, colored border + text |

## Neutral Overrides

Neutral has custom compound overrides because it has no strong color.
All neutral tiers use transparent bg (hover dahil).

| Tier | bg | text | border | hover |
|------|-----|------|--------|-------|
| Filled | transparent | dark-2 | dark-2 | brightness(0.75) |
| Soft | transparent | grey-400 | grey-400 | brightness(0.75) |
| Outline | transparent | grey-600 | grey-600 | brightness(0.75) |

Outline focus: pri-300 border + pri-500 15% box-shadow.

## Standalone

| Class | Purpose |
|-------|---------|
| `--ghost` | No bg, no border, muted text. Independent. |

## Custom Colors

Inline `--button-color` ile herhangi bir renk kullanilabilir:

```html
<button class="bttn bttn--md-rectangle" style="--button-color: #e91e63;">Custom</button>
```

Soft ve outline otomatik calisir.

## Action Hierarchy

```
Primary:   bttn--pri (filled)
Secondary: bttn--pri bttn--soft / bttn--neutral bttn--outline
Tertiary:  bttn--ghost
```

## States

- `--disabled`: grey-100 bg, grey-150 border, grey-400 text, !important override
- `--loading`: grey-400 bg/border, grey-zero text, shimmer animation, !important override
- `--block`: full width
