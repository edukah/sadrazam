# Hover Media Query Convention

## Problem

CSS `:hover` pseudo-class fires on touch devices when user taps an element.
The hover style "sticks" until the user taps elsewhere — this creates a broken UX.

Examples of sticky hover:
- Button stays highlighted after tap
- Dropdown menu stays open after tap (critical UX bug)
- Card shadow/transform persists after scroll-tap
- Color/opacity changes remain active

## Solution

Wrap hover effects in a media query that targets devices with a real pointer:

```scss
@media (hover: hover) and (pointer: fine) {
  .element:hover {
    // hover effect
  }
}
```

## Media Features

| Feature | Value | Meaning |
|---------|-------|---------|
| `hover: hover` | Device supports hover | Mouse, trackpad |
| `hover: none` | No hover support | Touchscreen |
| `pointer: fine` | Precise pointer | Mouse, trackpad |
| `pointer: coarse` | Imprecise pointer | Finger, stylus |

## When to Wrap

**WRAP** — Effect would look broken if stuck on touch:
- Background color changes
- Box-shadow / transform effects
- Color changes that indicate state (active, selected)
- Content reveal (dropdown, tooltip)
- Opacity changes
- Icon transforms

**SKIP** — Effect is harmless or already handled:
- `filter: brightness()` — resets naturally on touch release
- Elements with `pointer-events: none` — unreachable anyway
- Scrollbar pseudo-elements — not touch-relevant
- Disabled element hovers — already blocked

## Pattern

Media query her zaman selector'in **icinde** yazilir, disinda degil.
Bu kural tum `@media` sorgulari icin gecerlidir (hover, breakpoint vb.).

### Simple case
```scss
// CORRECT — media query selector icinde
.element {
  &:hover {
    @media (hover: hover) and (pointer: fine) {
      background-color: var(--color-grey-100);
    }
  }
}

// WRONG — selector media query icinde
@media (hover: hover) and (pointer: fine) {
  .element:hover {
    background-color: var(--color-grey-100);
  }
}
```

### With non-hover styles in same block
```scss
.element {
  color: var(--color-text-dark-2);

  &:hover {
    @media (hover: hover) and (pointer: fine) {
      color: var(--color-pri-500);
    }
  }
}
```

## Hybrid Devices

Devices like Surface or iPad with trackpad:
- `pointer` checks the PRIMARY input device
- Trackpad attached → `pointer: fine`, `hover: hover` → hover works
- Touch only → `pointer: coarse`, `hover: none` → hover skipped
- Browser handles switching automatically

## Alternatives Considered

| Approach | Problem |
|----------|---------|
| `any-hover: hover` | Too permissive — touchscreen laptop gets hover on touch |
| JS `touchstart` detection | Race conditions, unreliable on hybrid devices |
| `:hover` with `:active` reset | Complex, browser-inconsistent |
| Do nothing | Sticky hover on all touch devices |

## Compatibility

- Chrome 38+, Firefox 64+, Safari 9+, Edge 12+
- No IE11 support (gets no hover effects — acceptable degradation)
- All modern mobile browsers support it correctly
- No known uyum/compatibility issues with existing CSS
