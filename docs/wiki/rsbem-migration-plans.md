# Arafta Kalan Sınıflar — Düzeltme Planı (v2)

Sadrazam ve Dükkan projelerinde 3 katmana net girmeyen sınıfların düzeltme planı.
En kolaydan zora doğru sıralı. Her fazda blast radius artar.

> **Kural:** Sadrazam'da SCSS değişikliği + Dükkan'da tüm tpl/scss/js referansları
> aynı anda güncellenmelidir. Aksi halde sınıf tanımsız kalır.

---

## Referans: Utility Prefix Tablosu

| Kategori | Prefix | Örnekler | Sadrazam (Mevcut) |
|----------|--------|----------|-------------------|
| Display | `d-` | d-flex, d-grid, d-table | migrated (ds-flex, ds-b → d-flex, d-block) |
| Flex | `flex-` | flex-center, flex-col | migrated (ds-flex--vcentered → d-flex flex-center) |
| Grid | `grid-` | grid-cols-2, grid-cols-3 | migrated (ds-grid--cols-2 → d-grid grid-cols-2) |
| Padding | `padding-` | padding-2, padding-x-4, padding-t-2 | migrated (lr→x, tb→y) |
| Margin | `margin-` | margin-2, margin-x-auto, margin-y-4 | migrated (lr→x, tb→y) |
| Text | `text-` | text-center, text-upper | aynı |
| Font Size | `fsi-` | fsi-12, fsi-14 | aynı |
| Font Weight | `fwe-` | fwe-regular, fwe-semibold | aynı |
| Font Family | `ffa-` | ffa-sans, ffa-mono | aynı |
| Width | `w-` | w-full, w-auto, w-fit | migrated (full-width → w-full) |
| Height | `h-` | h-full, h-auto, h-screen | migrated (ds-h-full → h-full) |
| Image | `img-` | img-responsive, img-circle | aynı |
| Theme Color | `tc-` | tc-pri-500, tc-text-dark-1 | color-theme-1-500 → migrated |
| Theme BG | `tbc-` | tbc-pri-100, tbc-grey-300 | bg-theme-1-100 → migrated |
| Position | `pos-` | pos-relative, pos-absolute | migrated (ds-relative → pos-relative) |
| Z-index | `z-` | z-10, z-50, z-max | migrated (ds-z-50 → z-50) |
| Overflow | `ovf-` | ovf-hidden, ovf-auto | migrated (ds-overflow-hidden → ovf-hidden) |
| Cursor | `cursor-` | cursor-pointer | migrated (pointer, c-pointer → cursor-pointer) |
| User-select | `sel-` | sel-none, sel-all | migrated (no-select → sel-none) |
| Visibility | `vis-` | vis-hidden--md-up | migrated (ds-none--md-up → d-none--md-up) |
| Animation | `anim-` | anim-fade, anim-fade.is-visible | migrated (.fade → anim-fade) |

### Spacing Axis Convention
- Eksen: `x` (left+right), `y` (top+bottom)
- Tek yön: `t/b/l/r`
- Scale: numeric (0-18)

---

## Faz 1: Sadrazam-Only ✅ TAMAMLANDI

- [x] `.combobox` → **SİLİNDİ**
- [x] `.no-select` → `.sel-none`
- [x] `.full-width` → `.w-full`
- [x] `.input-error` → `.input--error`
- [x] `.label-text-input-type-one` → `.form-field--top-label`
- [x] `.label-checkbox-input-type-one` → `.form-field--checkbox`
- [x] `.initialism` → **SİLİNDİ**
- [x] `.circle` → **SİLİNDİ**
- [x] `.sequential-box-15` → **SİLİNDİ**
- [x] `.modal__close-button.absolute` → `.modal__close-button--absolute`

### 1.x Bekleyen Kararlar ✅ KARARA BAĞLANDI
- [x] `.sr-only` → **AYNEN KALACAK** (web standardı, ekran okuyucu yazılımlar bu ismi arar)
- [x] `.flow-space` → `.margin-flow` (margin grubuna dahil, `> * + *` pattern'i özünde margin-top)
- [x] `.px-zero-sm` → `.padding-x-0--sm` (padding grubuna dahil, `x` = left+right, `0` = zero, `--sm` = responsive)
- [x] `.fade` → `.anim-fade` (yeni `anim-` prefix'i. State: `.anim-fade.is-visible` — Faz 6'da uygulandı)

### 1.x Element-Scoped Modifiers — OLDUĞU GİBİ KALACAK
Aşağıdaki sınıflar HTML element'e bağlı compound selector'lar. BEM'e dönüştürülmeyecek:
- `textarea.autoexpand` — kalıyor
- `input[type="number"].with-spinner` — kalıyor
- `legend.styled` — kalıyor
- `input[type="radio"].block` — kalıyor

---

## Faz 2: Sadrazam Utility Prefix Migration ✅ TAMAMLANDI

Tüm `ds-*` prefix'leri yeni standartlara dönüştürüldü.
Dükkan'da kullanılan sınıflar da eşzamanlı güncellendi.

- [x] Display: `ds-b` → `d-block`, `ds-none` → `d-none`
- [x] Flex: `ds-flex--*` → `d-flex` + `flex-*` (ayrışma)
- [x] Grid: `ds-grid--*` → `d-grid` + `grid-*`
- [x] Width/Height/Position/Z-index/Overflow → `w-`/`h-`/`pos-`/`z-`/`ovf-`
- [x] Visibility responsive: `ds-none--*` → `d-none--*`, `ds-show--*` → `d-show--*`
- [x] Spacing axis: `lr` → `x`, `tb` → `y`
- [x] Faz 1.x kararları: `.flow-space` → `.margin-flow`, `.px-zero-sm` → `.padding-x-0--sm`, `.fade` → `.anim-fade`

Dükkan etki alanı: ~200+ dosya (tpl + js + scss)

---

## Faz 3: Sadrazam + Dükkan (1-5 dosya etkilenir) ✅ TAMAMLANDI

- [x] `.pointer` + `.c-pointer` → `.cursor-pointer` (Dükkan: 8 dosya)
- [x] `.form-toggle-password-visibility` → `.form-field__password-toggle` (Dükkan: 5 dosya)
- [x] `.label-text-input-type-two` → `.form-field--text` (Dükkan: 1 dosya)
- [x] `.label-checkbox-input-type-two` → **SİLİNDİ** (`.form-field--checkbox` ile birebir aynı)
- [x] `.danger-dialog-box` → `.dialog-box--danger` (+ warning/caution/notice/safe)
- [x] `.is-loading` → `.--loading` (BEM modifier)
- [x] `.d-table` component → `.data-table` + BEM elements (`data-table__row`, `data-table__cell`, vb.)
- [x] `.fl-l`, `.fl-r` → `_positioning.scss`'e taşındı; `.clear` silindi (tüketiciler flexbox'a migrate edildi)

---

## Faz 4: Sadrazam + Dükkan (5-21 dosya etkilenir) ✅ TAMAMLANDI

- [x] `.form-divider` → `.form__divider` (Dükkan: 9 dosya)
- [x] `.image-inline` / `.image-inline-2x` → `.img-inline` / `.img-inline--2x` (Dükkan: 16 dosya)
- [x] `.helper-text` → **AYNEN KALACAK** (29 dosya, yeterince açık isim)
- [x] `.color-link-blue-dark` → **AYNEN KALACAK** ~~(zaten `color-` prefix'i ile uyumlu)~~ → Theme Layer migration'da `.tc-link-blue-dark` olarak güncellendi

---

## Faz 5: Sadrazam + Dükkan (21+ dosya — yüksek risk) ✅ TAMAMLANDI

- [x] `a.underline` → `a.text-underline-hover` (Dükkan: 39 dosya, mevcut utility ile birleştirildi)
- [x] `.form-standart-style` → `.form-standard-style` (Dükkan: 64 dosya, typo fix)

---

## Faz 6: Mimari Kararlar ✅ TAMAMLANDI

### 6.1 State Sınıfları ✅
Statik varyantlar → BEM modifier, dinamik durumlar → `is-*` state convention.

**Statik varyantlar (BEM modifier olarak kaldı):**
- [x] Tooltip: `.top/.right/.bottom/.left` → `--top/--right/--bottom/--left` (JS + SCSS)
- [x] Popover: aynı pattern
- [x] Bildirim tipleri: `.error/.warning` vb. → `--error/--warning` vb. (aşağıda 6.2)

**Dinamik durumlar (is-* state convention'a geçirildi):**
- [x] Slide Menu: `.in/.out` → `is-entering/is-leaving` (JS + SCSS)
- [x] Backdrop: `.is-visible` → `is-visible` (JS + SCSS, prefix korundu)
- [x] Fade: `.anim-fade.in` → `.anim-fade.is-visible` (SCSS)
- [x] Autocomplete: `.selected` → `is-selected` (JS + SCSS)
- [x] Loading utility: `.--loading` → `is-loading` (SCSS + Dükkan JS)
- [x] Filter: `.is-open` → `is-open` (Dükkan SCSS + JS, prefix korundu)
- [x] Filemanager: `.is-selected` → `is-selected` (Dükkan SCSS + TPL, prefix korundu)

### 6.2 Bildirim Tipi Sınıfları ✅
- [x] `.error/.warning/.notice/.success/.hint` → BEM modifier `--error/--warning/--notice/--success/--hint`
  - `message.scss` + `message.js`
  - `modal-message.scss` + `modal-message.js`
  - Dükkan: 4 tpl dosyası

### 6.3 Layout Legacy (Bootstrap-kökenli) ✅
- [x] `.well-lg/.well-sm` → `.well--lg/.well--sm` (Dükkan: 1 dosya)
- [x] `.panel-heading/.panel-body/.panel-toolbar/.panel-footer` → `.panel__heading/__body/__toolbar/__footer` (Dükkan: 87 dosya + 8 SCSS)
- [x] `.panel-default` → `.panel--default`
- [x] `.account-*` → `.account/__*` (BEM elements, 0 tüketici)
- [x] `.content-wrapper/.content-container` → **AYNEN KALACAK** (zaten bağımsız BEM blokları, `--md`/`--padding-zero` modifier'ları mevcut)

### 6.4 Grid Sistemi — DEĞİŞİKLİK GEREKMİYOR ✅
- [x] `.gr-row`, `.col-*` → **AYNEN KALACAK** (zaten CSS Grid tabanlı, 100+ dosyada kullanılıyor, gereksiz risk)

---

## Faz 7: BEM Yapısal Migration (Bileşen Alt-Elemanları) ✅ TAMAMLANDI

Bileşen alt-elemanlarında tek tire (`-`) ile ayrılan isimlerin BEM çift alt çizgi (`__`) kuralına
taşınması ve varyant sınıflarının BEM modifier (`--`) formatına geçirilmesi.

### 7.1 Sadrazam Bileşenleri (SCSS + JS) ✅
Alt-eleman rename'leri (hyphen → `__`):
- [x] `.tooltip-arrow` → `.tooltip__arrow`
- [x] `.popover-arrow/title/content` → `.popover__arrow/__title/__content`
- [x] `.hovermenu-arrow-up/down/title/content` → `.hovermenu__arrow-up/__arrow-down/__title/__content`
- [x] `.slide-menu-inner/header/content/close-button/option-container/option-item` → `.slide-menu__*`
- [x] `.autocomplete-suggestion(s)-container` → `.autocomplete__suggestion(s)-container`
- [x] Tab bileşenleri (tab/tabv2/tabv3/tabv4) × 5 element (heading/head/container/body/panel) → `__*`

Varyant rename'leri (hyphen → `--`):
- [x] `.spinner-main/helper/block/inline` → `.spinner--main/--helper/--block/--inline`

Sadrazam etki alanı: 15 source dosya (8 SCSS + 7 JS)

### 7.2 Dükkan Bileşen Sync (TPL + SCSS) ✅
Sadrazam bileşen rename'lerinin Dükkan tpl/scss referanslarına yansıtılması:
- [x] Autocomplete: 12 tpl + 1 SCSS
- [x] Slide Menu: 1 tpl
- [x] Tabs: 7 tpl + 2 SCSS
- [x] Status: 20 tpl + 1 SCSS (`status-heading/body` → `status__heading/__body`, nested element flatten)
- [x] Spinner: 2 tpl

### 7.3 Dükkan-Only Düzeltmeler ✅
- [x] `admin-listing_list-container` → `admin-listing__list-container` (tek `_` → çift `__`, 31 tpl + 3 SCSS)
- [x] `admin-listing_search-form__buttons` → `admin-listing__search-form-buttons` (çift `__` flatten, 24 tpl + 1 SCSS)
- [x] `form_admin_multilanform-row` → `multilan-row` (block ismi sadeleştirme, 9 tpl + 1 SCSS)
- [x] Marketplace Logo: block reorder + element + state convention (4 tpl + 1 SCSS)
  - `marketplace-list-logo` → `marketplace-logo-list`
  - `marketplace-logo-container` → `marketplace-logo-list__item`
  - `marketplace-logo` → `marketplace-logo-list__image`
  - `.pending/.success/.error/.disabled` → `is-pending/is-success/is-error/is-disabled`

Dükkan etki alanı: 100 dosya (tpl + scss)

---

## Kapsam Dışı (Değişiklik gerekmez)

### Mail Template Sınıfları
`.main-container`, `.body-h1`, `.body-text-medium`, `.button`, `.col425` vb.
- Email CSS kısıtlamaları nedeniyle flat naming **kabul edilebilir**
- CSS custom property, nesting, BEM desteklenmez
- **DOKUNMA**

### Print Document Sınıfları (Dükkan)
`label.scss`, `proforma.scss`, `packing_slip.scss`, `label_international.scss`
- Standalone sayfa render'ları, webpack build dışında
- ~120 flat class, kendi izole kapsamlarında
- **DOKUNMA** (istenirse ileride BEM'e geçirilebilir)

### Dark Mode Toggle
`.dark-mode` — body-level class, konvansiyon standardı
- **KALSIN**

---

## Phantom Class ✅ DÜZELTİLDİ
- [x] `.color-text-red` → `.tc-danger-500` (Sadrazam `form.js`'de tanımsız sınıf, mevcut danger utility ile değiştirildi. Theme Layer migration'da `tc-` prefix'ine geçti)

---

## Yapısal Düzeltmeler (Faz 7 sonrası) ✅ TAMAMLANDI

Dosya-class isim uyumsuzlukları, duplicate tanımlar ve BEM modifier ihlalleri:

- [x] `.d-grid` duplicate → ikinci tanım silindi (`utilities/_display.scss`)
- [x] `.c-backdrop` → `.backcloth` (class adı dosya adıyla eşleştirildi, `c-` prefix kaldırıldı)
- [x] `notification__*` → `message__*` (class prefix dosya adıyla eşleştirildi, Dükkan: 5 dosya sync)
- [x] `.img-inline-2x` → `.img-inline--2x` (BEM modifier çift tire düzeltmesi)
- [x] Çöp yorum temizliği (`message.scss`)
- [x] `.data-table` → `components/_data-table.scss` (utilities/ → components/ katman taşıması)
- [x] `.dialog-box--*` + `.hint-symbol` → `components/_dialog-box.scss` (utilities/ → components/)
- [x] `.breadcrumb` → `components/_breadcrumb.scss` (utilities/ → components/, Burtest @forward compat)
- [x] `utilities/_components.scss` silindi (içerik dialog-box + image'e dağıtıldı)
- [x] Dükkan `breadcrumbs-container` → `breadcrumb` (119 tpl + _heading.scss selector düzeltmesi)
- [x] `[data-tab-active]` → `.is-active` (tab state: SCSS + JS + docs + Dükkan 6 tpl + Bikonuvar 2 tpl)
- [x] `_mail.scss` kapsam dışı yorum eklendi
- [x] Breadcrumb shim silindi, Burtest + Bikonuvar import path güncellendi
- [x] `Backcloth` → `Backdrop` (modül rename: class, CSS, config key, dosya adları — Sadrazam + Dükkan + Bikonuvar + Burtest)
- [x] `Message` → `Snackbar`, `ModalMessage` → `Toast` (modül rename: class, dosya adları — Sadrazam + Dükkan)

---

## Gelecek İyileştirmeler

### ~~Tooltip Mobil Desteği~~ ✅ TAMAMLANDI
- `touchstart` ile toggle desteği eklendi
- Emülasyon mouseover baskılama (`#touchHandled` flag)
- Dışarı dokunulursa otomatik kapanma
- Pozisyonlama düzeltmeleri: `display: none` ölçüm bug'ı, top/bottom flip, her gösterimde yeniden hesaplama
- SCSS: `max-width: 50vw` → `320px`, arrow `transform` düzeltmesi, `pointer-events: none`

### ~~Popover Resize Sorunu~~ ✅ TAMAMLANDI
Popover açıkken sayfa boyutu değiştiğinde (resize) pozisyon kayıyor.
Çözüm: `window.resize` event'inde açık popover'ları kapat/sil.
- `#resizeHandler` eklendi (`show()` → addEventListener, `hide()`/`destroy()` → removeEventListener)
- `#isVisible` state flag, arrow reset, observer race condition fix
- SCSS: `transform: translateX/Y(-50%)` ile arrow konumlandırma, `transition: opacity 0.15s`

### ~~Modül Lifecycle Standardizasyonu~~ ✅ TAMAMLANDI
Tüm Sadrazam modüllerinde `destroy()` metodu, instance storage tutarlılığı ve listener cleanup.
- `destroy()` tüm instance-bazlı modüllere eklendi (sektör konvansiyonu)
- `__tabsInstance` → `__tabs`, `.infiniteScroll` → `.__infiniteScroll`
- Popover `remove()` → `destroy()`, Tooltip'e public `destroy()` eklendi
- Hovermenu, SlideMenu, Tabs, Modal'a `destroy()` eklendi

---

## Faz 8: State Class Standardizasyonu (is-* tutarlılığı)

Tüm Sadrazam modüllerinde visibility/state yönetimini `is-*` CSS class convention'ına geçirme.
Şu anda bazı modüller inline style (`style.opacity`, `style.display`), bazıları `is-*` class kullanıyor.

**Hedef:** Tek convention — `is-*` class + CSS transition. Inline style state yönetimi kaldırılacak.

### 8.1 Zaten Doğru Olanlar (değişmeyecek)
- [x] Backdrop: `is-visible` ✅
- [x] SlideMenu: `is-entering` / `is-leaving` ✅
- [x] Tabs head: `is-active` ✅
- [x] Autocomplete: `is-open` / `is-selected` ✅

### 8.2 Inline Style → is-* Class Dönüşümü
- [x] **Popover**: `style.opacity/display` → `is-visible` class + CSS transition
- [x] **Tooltip**: `style.opacity/display` → `is-visible` class + CSS transition
- [x] **Hovermenu**: `style.opacity` → `is-visible` class + CSS transition
- [x] **Tabs panel**: `style.display` → `is-active` class (head zaten `is-active` kullanıyor)
- [x] **InfiniteScroll spinner**: `style.visibility` → `is-loading` class
- [x] **ProgressBar**: `style.opacity` → `is-active` class

### 8.3 BEM Modifier → is-* Rename
- [x] **Body class**: `modal--opened` → `is-scroll-locked` (amacı tanımlar: scroll kilidi, kaynak değil)
  - Hem Modal hem SlideMenu aynı class'ı kullanıyor
  - Dükkan navigation.js + Bikonuvar flag.scss güncellendi

### 8.4 SCSS Güncellemeleri
Her modülün SCSS dosyasına `is-*` state selector + transition tanımı eklendi.

### 8.5 SlideMenu `style.display` → `is-open`
- [x] **SlideMenu JS**: `style.display = 'block'/'none'` → `classList.add/remove('is-open')`
- [x] **SlideMenu SCSS**: `display: none` base + `&.is-open { display: block }`

### 8.6 Dükkan `.active` → `.is-active`
- [x] 16 dosya (SCSS + TPL + JS): pagination, account, faq, review, header, navigation
- [x] navigation.js `ul.active` selektör düzeltmesi (querySelectorAll'da kaçırılmıştı)

### 8.7 `bttn--loading` Manual Management Temizliği
- [x] **Ajax.js reference counting**: Nested request'lerde buton loading state yönetimi (`#lockButton`/`#unlockButton`)
- [x] **sale/order.js**: 3 metottan `uniqueClassId` + manuel classList kaldırıldı → Ajax `button` shorthand
- [x] **marketplace/product_form.js**: `sync()` async/await'e dönüştürüldü, `saveResponse.result` kontrolü eklendi

### 8.8 Dükkan Navigation State Class Standardizasyonu
- [x] `visible` → `is-visible` (SCSS + JS)
- [x] `fadeIn` → `is-entering` (SCSS + JS)
- [x] `fadeOut` → `is-leaving` (SCSS + JS)
- [x] `on-hover` → `is-hovering` (SCSS + JS)

### 8.9 Dükkan BEM Modifier → is-* (JS-toggled state'ler)
- [x] **review.js**: `upvoted` → `is-upvoted` (JS + SCSS)
- [x] **header.tpl**: `common-header__announcements-item--active` → `is-active` (SCSS + TPL inline JS)
- [x] **Favori butonları**: `product-card__favorite-button--active`, `product-detail__favorite-button--active` → `is-active` (SCSS + JS + TPL)
- [x] **Notify butonu**: `product-detail__notify-button--active` → `is-active` (SCSS + JS + TPL)
- [x] **cart.js**: `cart--loading` → `is-loading` (Sadrazam utility class'ını kullanır)

### 8.10 Inline Style → CSS Class
- [x] **product_form.js/tpl**: `style="display:none"` → `d-none`, `style.display` → `classList.toggle('d-none')`
- [x] **filemanager.js**: `style.display` filtre → `classList.toggle('d-none')`
- [~] **order.js**: `style.visibility = 'hidden'` — DOM swap animasyonu, geçici teknik state, dokunulmadı
- [~] **filemanager.js**: `fileForm.style.display = 'none'` — dinamik DOM oluşturma, dokunulmadı

**Etki alanı:**
- Sadrazam: 7 JS modül + 7 SCSS modül + Ajax service
- Dükkan: navigation.js, order.js, product_form.js, review.js, 16 SCSS/TPL dosya
- Bikonuvar: 1 SCSS dosya (flag.scss — `is-scroll-locked`)

**Yaklaşım:** Sektör analizi yapıldı (Bootstrap, Radix UI, Tippy.js, SMACSS).
`is-*` class convention seçildi — Sadrazam'da zaten kısmen mevcut, sektörde en yaygın,
`data-state` attribute (Radix seviyesi) over-engineering olur.

---

## İstatistikler

| Faz | Sınıf sayısı | Etki alanı | Durum |
|-----|-------------|------------|-------|
| 1   | ~10         | Sadece Sadrazam | ✅ Tamamlandı |
| 2   | ~45         | Sadrazam + Dükkan (~200+ dosya) | ✅ Tamamlandı |
| 3   | ~11         | Sadrazam + Dükkan (1-5 dosya) | ✅ Tamamlandı |
| 4   | ~5          | Sadrazam + Dükkan (5-21 dosya) | ✅ Tamamlandı |
| 5   | ~2          | Sadrazam + Dükkan (21-64 dosya) | ✅ Tamamlandı |
| 6   | ~20+        | Mimari değişiklik (JS + SCSS + TPL) | ✅ Tamamlandı |
| 7   | ~30+        | BEM yapısal migration (115 dosya) | ✅ Tamamlandı |
| 8   | ~30+        | State class standardizasyonu (is-*) | ✅ Tamamlandı |
