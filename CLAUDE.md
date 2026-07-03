# Sadrazam – Project Guide

## Overview
Sadrazam is a UI component library (JS + SCSS) built with webpack. It provides reusable components, modules, helpers, and services for web applications.

## Project Structure
```
sadrazam/
├── src/                    # Source code
│   ├── js/                 # JavaScript modules
│   │   ├── index.js        # Main entry – exports Sadrazam object
│   │   ├── core/           # Event system, polyfills
│   │   ├── modules/        # UI modules (modal, tabs, tooltip, etc.)
│   │   ├── helpers/        # Utility helpers (form validation, autosize, etc.)
│   │   ├── services/       # Ajax, log-relay
│   │   └── language/       # i18n (en, tr)
│   └── scss/               # Stylesheets
│       ├── main.scss       # Master import file
│       ├── base/           # Variables, colors, typography, reset
│       ├── layout/         # Grid, box model
│       ├── components/     # Button, form, link, switch
│       ├── modules/        # Styles paired with JS modules
│       └── utilities/      # Spacing, visibility, layout helpers
├── dist/                   # Production build output
├── dev/                    # Development sandbox (hot reload)
│   └── index.html          # Single sandbox page using _hot/ assets
├── docs/                   # Static showcase (GitHub Pages)
│   ├── index.html          # Landing page with component catalog
│   ├── assets/             # Static assets
│   │   ├── css/            # Docs-specific styles
│   │   ├── js/             # Docs-specific scripts
│   │   ├── sadrazam.min.js # Built library (via npm run release)
│   │   └── sadrazam.min.css
│   └── *.html              # 25 component demo pages
├── webpack.common.js       # Shared webpack config
├── webpack.dev.js          # Dev server (port 9006, hot reload)
├── webpack.prod.js         # Production build (minified)
├── babel.config.js
├── eslint.config.js
└── package.json
```

## Commands
- `npm run dev` – Start webpack dev server with hot reload (port 9006)
- `npm run build` – Production build to `dist/`
- `npm run release` – Build + copy dist files to `docs/assets/`

## Architecture
- **Build outputs**: ESM in production (`dist/sadrazam.esm.js`, `library: { type: 'module' }` in webpack.prod.js), UMD in dev for hot-reload sandbox compatibility (exposed as `Sadrazam` global)
- **SCSS**: Uses `@use` imports (modern Sass API), layered architecture (base → layout → components → modules → utilities)
- **JS**: ES6+ modules, transpiled via Babel. Main entry in `src/js/index.js` aggregates all sub-modules
- **Dev server**: Serves from `dev/` and `docs/`, assets available at `/_hot/`
- **Docs**: Static HTML pages referencing `assets/sadrazam.min.*`, deployable to GitHub Pages

## Conventions
- BEM-like CSS naming: `.bttn--pri`, `.bttn--pri.bttn--soft`, `.bttn--neutral.bttn--outline`, `.modal__header`, `.tab-heading`
- **Button `:is()` pattern**: Base stiller `:is(.bttn, .bttn--pri, ..., .bttn--ghost)` ile tüm renk modifier'larına otomatik uygulanır. `.bttn` base class **opsiyonel** — `bttn--pri` tek başına yeterli. Default shape **rectangle** (asymmetric padding: `--_bttn-py` / `--_bttn-px`), `bttn--square` modifier icon-only butonlar için. Default boyut **md** — `bttn--md` explicit class olarak da mevcut, `bttn--sm`/`bttn--lg`/`bttn--xs` farklı boyutlar için.
- **Button tier system**: Colors set `--button-color` CSS variable, tiers (filled/soft/outline) read it. See `docs/wiki/button-system.md`
- **İkon+metin gap**: `.bttn` base'inde `gap: var(--space-2)` → ikon+metin butonlarda (`<i></i> Metin`) ikon↔metin boşluğu OTOMATİK. Flex, iki flex-item arasındaki collapsible literal space'i kırptığı için `&nbsp;` / ikon-`margin` ile boşluk VERME (base gap'le çift-boşluk olur). Yalnız-ikon (`--square`, tek çocuk) + yalnız-metin (tek text-run) etkilenmez; `.bttn--loading::after` `position:absolute` (flex-item değil, gap'e girmez).
- **State convention**: JS-toggled dynamic states use `is-*` / `has-*` prefix, scoped inside component SCSS blocks:
  - `is-entering`, `is-leaving` (slide-menu animation states)
  - `is-visible` (backdrop, anim-fade)
  - `is-selected` (autocomplete)
  - `is-loading` (generic loading utility)
  - `is-locked` (body scroll lock — modal, toast, slide-menu açıkken)
  - Static variants stay as BEM modifiers: `tooltip--top`, `bttn--loading` (has spinner)
- **Media queries inside selectors**: `@media` sorguları (hover, breakpoint vb.) ilgili selector'ın **içine** yazılır, dışına değil. Bu, her class'ın responsive/interaction davranışını kendi tanımında tutar. Bkz. `docs/wiki/hover-media-query.md`
- **`is-open`**: autocomplete dropdown visibility, slide-menu open state
- Component SCSS files prefixed with `_` (partials)
- JS modules export classes with static `help()` method for console docs
- **Console logging convention**:
  - `console.info` — only for `help()` methods (styled API docs in browser console)
  - `console.warn` / `console.error` — namespaced: `[Sadrazam|ClassName] Message.` (e.g. `[Sadrazam|Autocomplete] Target element not found.`)
  - `console.log` / `console.debug` — stripped by Terser `pure_funcs` in production builds
- Demo pages in `docs/` follow consistent structure: same head, inline CSS, section cards
- English language for all code and docs

## Color System

8 dosya (`src/scss/theme/`), flat import yapısı:

```
main.scss ─┬── _colors-pri
            ├── _colors-sec
            ├── _colors-ter
            ├── _colors-accent
            ├── _colors-main ──── @use/_forward pri, sec, ter, accent
            ├── _colors-text ──── @use colors-main
            ├── _colors-grey ──── @use colors-main
            └── _colors-interaction ── @use colors-main

_variables ─┬── @forward colors-main
             ├── @forward colors-text
             ├── @forward colors-grey
             └── @forward colors-interaction
```

| Dosya | İçerik |
|-------|--------|
| `_colors-pri.scss` | Primary renk — 5 ton (100/300/500/700/900) |
| `_colors-sec.scss` | Secondary renk — 5 ton (100/300/500/700/900) |
| `_colors-ter.scss` | Tertiary renk — 5 ton (100/300/500/700/900) |
| `_colors-accent.scss` | 12 dekoratif renk × 5 ton. Compat alias: `-light` → 300, `-dark` → 700 |
| `_colors-main.scss` | Ortak: white, black, backdrop, action, logo. @use/_forward pri, sec, ter, accent |
| `_colors-text.scss` | Text (`1`–`4`) + link renkleri. Bağımlılık: `@use 'colors-main'` |
| `_colors-grey.scss` | Grey scale (13-unit intervals, 20 steps + zero; son iki adım 910/950 13-unit pattern'ı kırar). Bkz. `docs/wiki/grey-scale.md` |
| `_colors-interaction.scss` | safe (green), notice (blue), caution (amber), warning (orange), danger (red). Bağımlılık: `@use 'colors-main'` |

**`--f` suffix convention:** Sabit (fixed) renkler `--color-*--f` suffix'i alır, dark mode'da değişmez.

**Utility class pattern:**
- Text: `.tc-text-dark-1`, `.tc-text-light-1--f`
- Background: `.tbc-grey-100`, `.tbc-safe-500`
- Interaction text: `.tc-safe-500`, `.tc-danger-500`
- Link: `.tc-link-blue-dark`

**Eski isimler (kaldırıldı):** `--palette-*`, `--color-constant-*`, `color-text-dark-primary/secondary/hint/divider`, `color-text-link-*`

## Spacing System

19-step numeric scale (`--space-0` through `--space-18`), utility classes generated via `@each` loop:

**Pattern:** `.{property}-{direction}-{step}` where step = 0–18

| Direction | Shorthand | Example |
|-----------|-----------|---------|
| top | `t` | `.margin-t-5` |
| bottom | `b` | `.padding-b-8` |
| left | `l` | `.margin-l-3` |
| right | `r` | `.padding-r-6` |
| x-axis | `x` | `.padding-x-6` (left + right) |
| y-axis | `y` | `.margin-y-5` (top + bottom) |
| all sides | — | `.padding-8` (symmetric) |

**Extras:** `.margin-flow > * + *` (sibling spacing, space-3), `.padding-x-0--sm` (responsive reset)

**Gap:** `.gap-1` (space-1), `.gap-2` (space-2), `.gap-4` (space-4), `.gap-6` (space-6), `.gap-8` (space-8) — flex ve grid'de kullanılır

**After-heading:** `.after-h1`, `.after-h2`, `.after-h3`, `.after-h4` — heading'in `margin-bottom`'unu negatif `margin-top` ile sıfırlar, aynı değeri kendi `margin-bottom`'u olarak uygular. Heading altına subtitle/açıklama metni yerleştirmek için.

## __instance DOM Property + getInstance() Pattern

Tüm JS modülleri DOM element'lerine instance referansı atar ve `getInstance()` static metodu sağlar:

| Modül | Property | getInstance() |
|-------|----------|---------------|
| Modal | `element.__modal` | `Modal.getInstance(childElement)` |
| Tooltip | `element.__tooltip` | `Tooltip.getInstance(element)` |
| Popover | `element.__popover` | `Popover.getInstance(element)` |
| Tabs | `element.__tabs` | `Tabs.getInstance(element)` |
| SlideMenu | `element.__slideMenu` | `SlideMenu.getInstance(childElement)` |
| Hovermenu | `element.__hovermenu` | `Hovermenu.getInstance(childElement)` |
| Autocomplete | `element.__autocomplete` | `Autocomplete.getInstance(element)` |
| InfiniteScroll | `listElement.__infiniteScroll` | — |

**Tercih edilen erişim:** `Module.getInstance(element)` — child element'ten instance'a erişim sağlar.
**Low-level erişim:** `element.__property` — doğrudan DOM property erişimi (korunuyor).

**`Modal.insert()` instance döndürür:** `const modal = Modal.insert({ content }); modal.close();`

**`Modal.insert()` size + position + className config:** `content` artık `modal__dialog` + `modal__content` sarmalama gerektirmez — otomatik oluşturulur. `size` (`'sm'` | `'md'` | `'lg'` | `'fullscreen'`, default: `'md'`) dialog genişliğini, `position` (`'top'` | `'center'` | `'bottom'`, default: `'center'`) dikey konumu, `className` ise `modal__dialog`'a ek CSS class ekler. Eski format (content içinde `modal__dialog` varsa) backward-compatible çalışır.

## Notification Modules: Snackbar & Toast

İki bildirim modülü, yemek metaforu ile ayrışır:

- **Snackbar** — Yatay, renkli, ister hemen ye ister kenara koy. Inline (statik, sayfa içi) + popup (fixed, auto-dismiss) kullanım. Singleton, DOM-based. API: `Sadrazam.Snackbar.insert(message, time?)`
- **SnackbarRelay** — Cross-page snackbar iletimi. Redirect öncesi mesajı sessionStorage'a yazar, sonraki sayfa yüklendiğinde snackbar olarak gösterir ve siler. API: `SnackbarRelay.set(message)` (kaydet), `SnackbarRelay.show()` (göster+sil)
- **Toast** — Tost makinasından fırlar gibi: açılır, mesajı iletir, kapanır. Modal-based, timed, dismiss butonu var. API: `Sadrazam.Toast.insert({ message, time, size, position, dismissButton, closeOnClick })`

## destroy() Konvansiyonu

Tüm instance-bazlı modüller `destroy()` metodu sağlar (sektör standardı: jQuery UI, Tippy.js, Chart.js):
- **Popover, Tooltip, Tabs, Autocomplete, InfiniteScroll**: `instance.destroy()` — listener'ları kaldırır, DOM temizler, referansı sıfırlar
- **Modal**: `instance.destroy()` — `close()` alias'ı (close zaten tam cleanup yapar)
- **Hovermenu, SlideMenu**: `instance.destroy()` + `Module.destroy(element)` — static `remove()` (sadece close) backwards compat için korunuyor (Bikonuvar TPL'lerinde ~60+ yerde onclick ile kullanılıyor)

**Breaking change:** Popover'da eski `remove()` metodu kaldırıldı, yerine `destroy()` geldi. Dükkan/Bikonuvar'da Popover instance'ı doğrudan kullanılmadığı için etki yok.

## Keyboard Accessibility (Focus & ARIA)

### Focus/Focus-Visible Pattern
Mouse click'te outline yok, Tab ile gezinirken görünür:
```
:focus { outline: 0; }
:focus-visible { outline: 2px solid var(--color-pri-300); outline-offset: 1px; }
```

**Sadrazam global olarak kapsar:** `a`, `button`, `:is(.bttn, .bttn--*)`, `input[type="checkbox"]`, `input[type="radio"]`, `[role="button"]`, `*[data-toggle="toast"]`
**Form input'ları:** `:focus` ile `border-color` + `box-shadow` (focus-visible değil — her zaman aktif alanı göster)

### Non-Native Interactive Element Pattern
`<div>`/`<span>` yerine **her zaman `<button>`** kullan. Native `<button>` Tab, Enter, Space, focus-visible, screen reader desteği bedavaya gelir. `<div onclick>` kullanma.

Eğer `<button>` kullanılamıyorsa (modül trigger'ları gibi), modül JS'inde otomatik eklenir:
- `role="button"` + `tabindex="0"` + Enter/Space keydown handler
- `destroy()` çağrıldığında temizlenir

### ARIA Attributes
| Modül | Trigger ARIA | Container ARIA |
|-------|-------------|----------------|
| Modal | — (programmatic) | `role="dialog"`, `aria-modal`, `aria-labelledby` |
| SlideMenu | `aria-haspopup="dialog"`, `aria-expanded` | — |
| Hovermenu | `aria-haspopup="true"`, `aria-expanded` | — |
| Popover | `aria-haspopup="true"`, `aria-expanded` | — |
| Tabs | — | `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`, `aria-controls` |
| Autocomplete | — | `role="combobox"`, `aria-expanded`, `aria-autocomplete`, `role="option"` |
| Tooltip | — | `aria-describedby` |
| Toast | — | `role="alert"`, `aria-live="polite"` |

### Switch Accessibility
Input `display: none` yerine **visually hidden** (`position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none`). Tab ile erişilebilir, `input:focus-visible + .switch__slider` ile slider'a outline uygulanır.

