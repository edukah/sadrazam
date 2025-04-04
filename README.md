# Sadrazam

[![MIT License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![GitHub](https://img.shields.io/badge/View_on_GitHub-blue?logo=github)](https://github.com/edukah/sadrazam)
[![Docs](https://img.shields.io/badge/Docs-View%20Online-orange?logo=google-chrome)](https://edukah.github.io/sadrazam/)

A zero-dependency UI toolkit built from scratch. Vanilla JavaScript modules and an SCSS-based styling system — no external libraries.

I wrote this for my own project. If you're curious about building a UI toolkit from scratch with vanilla JS, keeping consistency across modules, or organizing SCSS architecture, this might give you some ideas.

## Development

```bash
npm run dev       # Dev server (hot reload)
npm run build     # Production build
npm run release   # Build + update GitHub Pages docs
npm test          # Run tests
```

Build output goes to `dist/`: `sadrazam.min.js` (UMD), `sadrazam.esm.js` (ESM), and `sadrazam.min.css`.

## Usage

### npm

```bash
npm install sadrazam
```

### Script Tag

```html
<link rel="stylesheet" href="dist/sadrazam.min.css">
<script src="dist/sadrazam.min.js"></script>

<script>
  Sadrazam.configure({
    languageCode: 'tr',
    logEndpoint: '/api/log/js-error'
  });
</script>
```

### Module Import

```js
// Full library
import Sadrazam from 'sadrazam';

// Cherry-pick — only the modules you need end up in your bundle
import Modal from 'sadrazam/js/modules/modal';
import Tooltip from 'sadrazam/js/modules/tooltip';
import Ajax from 'sadrazam/js/services/ajax';
```

```scss
// All styles
@use 'pkg:sadrazam';

// Cherry-pick
@use 'sadrazam/scss/modules/modal';
@use 'sadrazam/scss/modules/tabs';
```

> The `pkg:` protocol requires Dart Sass 1.71+ and `NodePackageImporter`. In webpack, add it to your sass-loader options:
>
> ```js
> // webpack.config.js
> {
>   loader: 'sass-loader',
>   options: {
>     sassOptions: {
>       importers: [new require('sass').NodePackageImporter()]
>     }
>   }
> }
> ```

Type `Sadrazam.help()` in the console to see all available modules.

## Structure

```
src/
├── js/
│   ├── core/           # Event system, polyfills
│   ├── helpers/        # DOM, form, cookie, URL utilities
│   ├── language/       # i18n system (tr, en)
│   ├── modules/        # UI components
│   ├── services/       # Ajax, LogRelay
│   └── index.js        # Entry point
│
└── scss/
    ├── theme/          # Color definitions
    ├── base/           # Variables, fonts, typography, reset
    ├── components/     # Form elements, buttons, links
    ├── layout/         # Grid system, box model
    ├── modules/        # UI component styles (mirrors JS modules)
    ├── utilities/      # Helper classes
    └── main.scss       # SCSS entry point
```

## Modules

### Services

| Module | Description |
|---|---|
| `Ajax` | Promise-based HTTP request manager |
| `LogRelay` | Global JS error capture and relay to backend |
| `Language` | Static i18n manager |

### UI Components

| Module | SCSS | Description |
|---|---|---|
| `Modal` | ✓ | Modal window manager |
| `Toast` | ✓ | Modal-based toast notifications |
| `Snackbar` | ✓ | Toast notifications (singleton) |
| `Spinner` | ✓ | Loading indicator (reference counting) |
| `Tabs` | ✓ | Tab navigation (4 variants) |
| `Tooltip` | ✓ | Tooltip |
| `Popover` | ✓ | Popover |
| `Hovermenu` | ✓ | Dropdown menu |
| `SlideMenu` | ✓ | Sliding side panel |
| `Backdrop` | ✓ | Backdrop overlay |
| `Autocomplete` | ✓ | Autocomplete input |
| `ProgressBar` | ✓ | Progress bar indicator |
| `InfiniteScroll` | — | Infinite scroll |

### Form & Input

| Module | Description |
|---|---|
| `Form` | Rule-based form validation (`data-fvalidate`) |
| `AutosizeTextarea` | Auto-height based on content |
| `AutosizeSelect` | Auto-width based on content |

### DOM & Helpers

| Module | Description |
|---|---|
| `Elem` | DOM element helpers |
| `Document` | Redirect, clipboard, UUID |
| `InsertScript` | Execute scripts inside AJAX-loaded HTML |
| `Url` | URL parameter management |
| `Token` | CSRF token management |
| `Cookie` | Cookie CRUD |
| `Event` | addEventListener wrapper |
| `ScrollHistory` | Scroll position memory |
| `Browser` | Browser detection |
| `Device` | Device detection |
| `Viewport` | Viewport helpers |

## SCSS Architecture

6-layer import order:

```
1. THEME       → Color definitions (primary, secondary, tertiary, grey, semantic)
2. BASE        → Variables, fonts, normalize, reset, typography
3. LAYOUT      → Grid, box model
4. COMPONENTS  → Form elements, buttons, links
5. MODULES     → UI component styles
6. UTILITIES   → Helper classes
```

All values are defined as CSS custom properties. Utility classes reference them via `var()`, making runtime theme switching possible.

## Approaches Worth Exploring

A few things that might be interesting if you dig into the source:

- **Zero dependencies** — How to build modal, tooltip, autocomplete, toast from scratch in vanilla JS
- **Reference counting** — Managing nested async calls in Spinner (`show`/`hide` with internal reference counting)
- **Singleton pattern** — Queue management with a single instance in Snackbar (toast)
- **Barrel file pattern** — SCSS `_form.scss` as a barrel aggregating button, switch, form-patterns
- **CSS custom property architecture** — Definition and utility class in the same file, 1:1 mapping
- **JS ↔ SCSS module mirroring** — Every JS UI component has a matching SCSS file with the same name
- **LogRelay** — Global `window.onerror` + `unhandledrejection` capture with backend relay and deduplication

## Security

Some modules (`Modal`, `Popover`, `Autocomplete`, `Snackbar`, `Toast`) accept HTML content via `innerHTML`. Sadrazam does **not** sanitize this input — it is your responsibility to ensure all content passed to these modules is trusted.

## Tools

Webpack 5, Babel 7, Dart Sass 1.86+, ESLint 9.

## License

MIT
