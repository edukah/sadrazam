# Button System

## Architecture

Buton sistemi `--button-color` CSS custom property uzerine kurulu.
Her renk varyanti bu variable'i set eder, kademeler (soft/outline) bu variable'i okur.

### `:is()` Base Selector

Base stiller (display, cursor, border-radius, padding, transition...) `:is()` ile tum renk modifier'larina otomatik uygulanir:

```scss
:is(.bttn, .bttn--pri, .bttn--sec, ..., .bttn--ghost) { /* base styles */ }
```

- `.bttn` base class **opsiyonel** — `bttn--pri` tek basina yeterli
- Default boyut **md** (`--space-5`) — sadece farkli boyut icin `bttn--sm`/`bttn--lg` eklenir
- Backward compatible — eski `bttn bttn--pri bttn--md` pattern hala calisir

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

## Hover

All hovers wrapped in `@media (hover: hover) and (pointer: fine)` (no touch device hover).

| Tier | Hover |
|------|-------|
| Filled | `color-mix(--button-color, black 10%)` — bg darkens, text unaffected |
| Soft | 12% → 20% tint — bg intensifies |
| Outline | transparent → 8% tint — bg appears |
| Neutral (all tiers) | `grey-50` bg |

## Neutral Overrides

Neutral has custom compound overrides because it has no strong color.
All neutral tiers use transparent bg.

| Tier | bg | text | border | hover |
|------|-----|------|--------|-------|
| Filled | transparent | dark-2 | grey-300 | grey-50 bg |
| Soft | transparent | grey-400 | grey-400 | grey-50 bg |
| Outline | transparent | grey-600 | grey-600 | grey-50 bg |

## Focus

All interactive elements use the same pattern:

```
:focus { outline: 0; }           — mouse click: clean
:focus-visible { outline: 2px solid pri-300; offset: 1px; } — Tab: visible ring
```

Sadrazam covers globally: `a`, `button`, `.bttn--*`, `input`, `textarea`, `select`, `checkbox`, `radio`.

## Standalone

| Class | Purpose |
|-------|---------|
| `--ghost` | No bg, no border, muted text. Independent. |

## Custom Colors

Inline `--button-color` ile herhangi bir renk kullanilabilir:

```html
<button class="bttn--md-rectangle" style="--button-color: #e91e63;">Custom</button>
```

Soft ve outline otomatik calisir.

## Action Hierarchy

```
Primary:   bttn--pri (filled)
Secondary: bttn--pri bttn--soft / bttn--neutral bttn--outline
Tertiary:  bttn--ghost
```

## States

- `--disabled`: grey-100 bg, grey-150 border, grey-400 text, cursor: not-allowed, !important override
- `--loading`: grey-400 bg/border, grey-zero text, shimmer animation, !important override
- `--block`: full width
