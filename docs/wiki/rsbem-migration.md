# rsBEM Migration Durumu — Sadrazam

Sadrazam'da uygulanan rsBEM v2 migration'larinin ozeti ve mevcut durum.

---

## Tamamlanan Migrationlar

### Faz 1: Sadrazam-Only Class Rename
- `.combobox` → silindi
- `.no-select` → `.sel-none`
- `.full-width` → `.w-full`
- `.input-error` → `.input--error`
- `.label-text-input-type-one` → `.form-field--top-label`
- `.label-checkbox-input-type-one` → `.form-field--checkbox`
- `.initialism`, `.circle`, `.sequential-box-15` → silindi
- `.modal__close-button.absolute` → `.modal__close-button--absolute`
- `.flow-space` → `.margin-flow`
- `.px-zero-sm` → `.padding-x-0--sm`
- `.fade` → `.anim-fade`

### Faz 2: Utility Prefix Migration
- Display: `ds-b` → `d-block`, `ds-none` → `d-none`, `ds-flex` → `d-flex`
- Flex: `ds-flex--*` → `d-flex` + `flex-*` (ayrisma)
- Grid: `ds-grid--*` → `d-grid` + `grid-*`
- Width/Height/Position/Z-index/Overflow → `w-`/`h-`/`pos-`/`z-`/`ovf-`
- Visibility responsive: `ds-none--*` → `d-none--*`
- Spacing axis: `lr` → `x`, `tb` → `y`
- Spacing t-shirt → numeric: `margin-t-sm` → `margin-t-2`, `padding-md` → `padding-y-5 padding-x-6`, vb. (tum scale 0-18)

### Faz 3: Sadrazam + Dukkan (1-5 dosya)
- `.pointer` + `.c-pointer` → `.cursor-pointer`
- `.form-toggle-password-visibility` → `.form-field__password-toggle`
- `.label-text-input-type-two` → `.form-field--text`
- `.danger-dialog-box` → `.dialog-box--danger` (+ warning/caution/notice/safe)
- `.d-table` component → `.data-table` + BEM elements
- `.fl-l`, `.fl-r` → `_positioning.scss`'e taşındı; `.clear` silindi (tüketiciler flexbox'a migrate edildi)

### Faz 4: Sadrazam + Dukkan (5-21 dosya)
- `.form-divider` → `.form__divider`
- `.image-inline` → `.img-inline` / `.img-inline--2x`
- `.helper-text` → aynen kaldi
- `.color-link-blue-dark` → `.tc-link-blue-dark` (theme migration ile)

### Faz 5: Sadrazam + Dukkan (21+ dosya)
- `a.underline` → `a.text-underline-hover`
- `.form-standart-style` → `.form-standard-style` (typo fix)

### Faz 6: Mimari Degisiklikler
- State convention: `is-*` / `has-*` (dinamik durumlar)
- Bildirim tipleri: `.error` → `--error` (BEM modifier)
- Layout legacy: `.panel-heading` → `.panel__heading` (BEM element)
- `.well-lg` → `.well--lg` (BEM modifier)

### Faz 7: BEM Yapisal Migration (Bilesen Alt-Elemanlari)
Bilesen alt-elemanlarinda tek tire (`-`) ile ayrilan isimlerin BEM cift alt cizgi (`__`) kuralina
tasinmasi ve varyant siniflarinin BEM modifier (`--`) formatina gecirilmesi.

**Alt-eleman rename'leri (hyphen → `__`):**
- `.tooltip-arrow` → `.tooltip__arrow`
- `.popover-arrow/title/content` → `.popover__arrow/__title/__content`
- `.hovermenu-arrow-up/down/title/content` → `.hovermenu__arrow-up/__arrow-down/__title/__content`
- `.slide-menu-inner/header/content/close-button/option-container/option-item` → `.slide-menu__*`
- `.autocomplete-suggestion(s)-container` → `.autocomplete__suggestion(s)-container`
- Tab bilesenleri: `tab__*` → `tab-classic__*`, `tabv2__*` → `tab-card__*`, `tabv3__*` → `tab-scroll__*`, `tabv4__*` → `tab-capsule__*`

**Varyant rename'leri (hyphen → `--`):**
- `.spinner-main/helper/block/inline` → `.spinner--main/--helper/--block/--inline`

Etki alani: 15 kaynak dosya (8 SCSS + 7 JS)

### Theme Layer (Renk Prefix Yenileme)
- `scss/base/_colors-*.scss` → `scss/theme/_colors-*.scss` (dosya tasima)
- `_colors-theme.scss` → `_colors-pri.scss` / `_colors-sec.scss` / `_colors-ter.scss` (bolme)
- `$color-theme-1-*` → `$color-pri-*` (SCSS degisken)
- `--color-theme-1-*` → `--color-pri-*` (CSS custom property)
- `.color-*` → `.tc-*` (text color utility)
- `.bg-*` → `.tbc-*` (background color utility)

---

## Mevcut SCSS Klasor Yapisi

```
src/scss/
├── base/          → normalize, reset, fonts, variables, typography
├── components/    → button, form, link, switch, mail, data-table,
│                    dialog-box, breadcrumb
├── layout/        → grid, box (well, panel, account, content-wrapper)
├── modules/       → autocomplete, backdrop, hovermenu, snackbar, modal,
│                    toast, popover, progress-bar, slide-menu,
│                    spinner, tabs, tooltip
├── theme/         → colors-main, colors-pri/sec/ter, colors-interaction,
│                    colors-grey, colors-text, colors-accent
├── utilities/     → spacing, typography, layout, visibility, interactivity,
│                    image, fade, utilities (barrel)
└── main.scss      → Theme → Base → Layout → Components → Modules → Utilities
```

---

## Bilinen Yapisal Sorunlar

### S1: `.data-table` component utilities/ icinde ✅ DUZELTILDI
`utilities/_layout.scss` → `components/_data-table.scss` olarak tasindi.

### S2: `.breadcrumb` component utilities/ icinde ✅ DUZELTILDI
`utilities/_breadcrumb.scss` → `components/_breadcrumb.scss` olarak tasindi.
Shim dosyasi (`utilities/_breadcrumb.scss`) silindi, Burtest + Bikonuvar import path'leri guncellendi.
Dukkan'da `breadcrumbs-container` → `breadcrumb` olarak rename edildi (119 tpl + 1 SCSS).

### S3: Component-like utility siniflar ✅ DUZELTILDI
`utilities/_components.scss` icerigi ayristirildi ve dosya silindi:
- `dialog-box--*` + `hint-symbol` → `components/_dialog-box.scss`
- `img-inline` + `img-inline--2x` → `utilities/_image.scss`

### S4: `_mail.scss` kapsam disi ama components/ icinde ✅ DUZELTILDI
Dosyaya kapsam disi yorum eklendi. rsBEM kurallari bu dosyaya uygulanmaz.

### S5: `.d-grid` duplicate tanim ✅ DUZELTILDI
`utilities/_layout.scss` dosyasinda `.d-grid` iki kere tanimliydi (biri `!important`, biri normal).
**Cozum:** Satir 109-111'deki ikinci tanim silindi.

---

## Yapisal Duzeltmeler (Faz 7 sonrasi)

### `.c-backdrop` → `.backdrop` ✅
Dosya adi `backdrop.scss/js`, class adi `.c-backdrop` idi — uyumsuz.
`c-` prefix'i kaldirildi, class dosya adina eslestirildi. Sonra `backcloth` → `backdrop` olarak rename edildi.
- `backdrop.scss`: `.c-backdrop` → `.backdrop`
- `backdrop.js`: `'c-backdrop'` → `'backdrop'`
- Dukkan etkisi: Yok (class JS tarafindan dinamik olusturuluyor)

### `notification__*` → `message__*` ✅
Dosya adi `message.scss/js`, class'lar `notification__*` idi — uyumsuz.
Class'lar dosya adina eslestirildi (JS API `Message` olarak kaldi).
- `message.scss`: 6 class tanimi guncellendi
- `message.js`: 6 referans guncellendi
- Dukkan: 5 dosya (4 tpl + 1 scss) guncellendi

### `.img-inline-2x` → `.img-inline--2x` ✅
BEM modifier cift tire (`--`) kuralina uygun hale getirildi.
- `utilities/_image.scss`: `&-2x` → `&--2x` (dosya tasima sonrasi)
- Dukkan etkisi: Yok (2x varyanti kullanilmiyor)

### `[data-tab-active]` → `.is-active` ✅
Tab state'i data attribute yerine is-* state class convention'a gecti.
- `tabs.scss`: 4x `&[data-tab-active]` → `&.is-active`
- `tabs.js`: setAttribute/removeAttribute → classList.add/remove
- `docs/tabs.html` + `dev/index.html`: HTML ornekleri guncellendi
- Dukkan: 6 tpl dosyasi guncellendi
- Bikonuvar: 2 tpl dosyasi guncellendi

### Faz 8: Inline Style State → is-* Class Convention ✅
JS tarafindan inline style ile yonetilen durum degisikliklerinin is-* CSS class convention'a tasinmasi.

**Gorunurluk state'leri (style.opacity/display → is-visible):**
- `popover.js/scss`: style.opacity/display → classList.add/remove('is-visible') + CSS opacity/pointer-events
- `tooltip.js/scss`: style.opacity/display → classList.add/remove('is-visible') + CSS opacity
- `hovermenu.js/scss`: style.opacity → classList.add/remove('is-visible') + CSS opacity/pointer-events/transition

**Panel state'leri (style.display → is-active):**
- `tabs.js/scss`: panel style.display → classList.add/remove('is-active') + CSS display:block

**Yukleme state'leri (style.visibility → is-loading):**
- `infinite-scroll.js` + `spinner.scss`: style.visibility → classList.add/remove('is-loading')

**Ilerleme state'leri (style.opacity → is-active):**
- `progress-bar.js/scss`: style.opacity → classList.add/remove('is-active') + CSS opacity

**Body scroll lock (BEM modifier → is-* state):**
- `modal--opened` → `is-scroll-locked` (amaci tanimlar: scroll kilidi)
- `modal.js`, `slide-menu.js`: body class guncellendi
- Dukkan: `navigation.js` guncellendi (3 referans)
- Bikonuvar: `flag.scss` guncellendi (1 referans)

---

## Dis Proje Etki Analizi

Sadrazam'daki yapisal degisiklikler su projeleri etkiler:

| Degisiklik | Dukkan | Burtest | Bikonuvar |
|-----------|--------|---------|-----------|
| data-table tasima | Etkilenmez (barrel import) | Etkilenmez | Etkilenmez |
| breadcrumb tasima | Etkilenmez (barrel import) | **ETKILENIR** (dogrudan import) | Etkilenmez |
| d-grid duplicate fix | Etkilenmez | Etkilenmez | Etkilenmez |

### Kritik Bug: Stale Import Paths
Asagidaki projelerde eski `base/colors-main` path'i hala mevcut:
- `burtest/resources/core/css/burtest.scss:9` → `@use 'sadrazam/scss/base/colors-main'`
- `bikonuvar/resources/core/css/bikonuvar.scss:9` → `@use 'sadrazam/scss/base/colors-main'`

Bu path'ler `scss/theme/colors-main` olarak guncellenmeli. Theme migration'da dosyalar tasinmis ama bu import'lar guncellenmemis.
