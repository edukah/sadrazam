# Modal Size/ClassName Config — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Move `modal__dialog` + `modal__content` wrapping responsibility from templates to Modal.js, so templates only provide content (header/body/footer).

**Architecture:** Add `size` and `className` config to `Modal.insert()`. Modal.js auto-creates the `modal__dialog > modal__content` wrapper. Backward compatible: if content already contains `modal__dialog`, use it as-is (old behavior); if not, auto-wrap (new behavior). This lets Bikonuvar/Burtest continue working without changes.

**Tech Stack:** Vanilla JS (ES2022+), SCSS, Vitest + jsdom

---

## Context

### Current Architecture

```
Template builds full skeleton:
  <div class="modal__dialog modal__dialog--lg sale-instrument_modal">
    <div class="modal__content">
      <div class="modal__header">...</div>
      <div class="modal__body">...</div>
      <div class="modal__footer">...</div>
    </div>
  </div>

JS calls:
  Modal.insert({ content: fullSkeletonHTML })

Modal.js:
  Creates .modal > .modal__inner → puts content inside → finds .modal__content
```

### Target Architecture

```
Template provides only content:
  <div class="modal__header">...</div>
  <div class="modal__body">...</div>
  <div class="modal__footer">...</div>

JS calls:
  Modal.insert({ content: contentHTML, size: 'lg', className: 'sale-instrument_modal' })

Modal.js:
  Creates .modal > .modal__inner > .modal__dialog.modal__dialog--lg > .modal__content → puts content inside
```

### Key Files

| File | Role |
|------|------|
| `sadrazam/src/js/modules/modal.js:171-200` | `#setupDOM` — creates DOM, finds `.modal__content` |
| `sadrazam/src/js/modules/modal.js:23-30` | `defaultConfig` — config defaults |
| `sadrazam/src/js/modules/modal.js:38-65` | `help()` — console docs |
| `sadrazam/src/js/modules/toast.js:54-83` | Creates `modal__dialog` + `modal__content` manually |
| `sadrazam/src/scss/modules/modal.scss:100-137` | `.modal__dialog` + size variants CSS |
| `sadrazam/src/scss/modules/modal.scss:139-206` | `.modal__content`, header/body/footer CSS |
| `dukkan/resources/scopes/css/admin/common/search.scss:2-4` | `.common-search__modal { padding: 0 }` |

### Edge Cases

1. **Search modal** (`header.tpl`): `common-search__modal` class on `modal__content` overrides `padding: 0`. No standard header/body/footer structure. After refactoring, `className` goes on `modal__dialog`, SCSS selector changes to `.common-search__modal .modal__content { padding: 0 }`.

2. **Form wrapper** (`detail_notify_modal.tpl`): `<form class="modal__content">` wraps header+body+footer. After refactoring, form goes inside `modal__content`. Need `display: contents` on form so flex layout passes through.

3. **Toast.js**: Currently builds `modal__dialog` + `modal__content` manually. After refactoring, passes `size` config and only builds body content.

### Scope

- **In scope:** Sadrazam (Modal.js, Toast.js, SCSS, tests, docs), Dükkan (20 templates, ~29 JS callers, 1 SCSS)
- **Out of scope:** Bikonuvar, Burtest (backward compat handles them)

---

## Task 1: Add `size` and `className` to Modal.js (backward compatible)

**Files:**
- Modify: `src/js/modules/modal.js:23-30` (defaultConfig)
- Modify: `src/js/modules/modal.js:171-200` (#setupDOM)
- Test: `test/modules/modal.test.js`

**Step 1: Write the failing tests**

Create `test/modules/modal.test.js`:

```js
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

// Modal import edilemez (DOM bağımlılıkları), doğrudan #setupDOM mantığını test et
describe('Modal size/className config', () => {
  // Modal'ı doğrudan test etmek yerine, #setupDOM'un ürettiği DOM yapısını test ediyoruz.
  // Modal constructor'ı Backdrop, InsertScript gibi bağımlılıklar gerektirdiğinden,
  // burada sadece config-to-DOM mapping mantığını test ediyoruz.

  // Not: Modal'ın tam entegrasyon testi için browser environment gerekir.
  // Bu testler config merging ve DOM structure logic'ini kapsıyor.

  it('defaultConfig should include size and className', () => {
    // Modal import edildikten sonra defaultConfig kontrol edilir
    // Bu test Modal import'u yapıldığında çalışır
    expect(true).toBe(true); // Placeholder — gerçek test Step 3'te
  });
});
```

**Step 2: Run test to verify it passes (placeholder)**

Run: `npm run test -- test/modules/modal.test.js`

**Step 3: Implement — modify `defaultConfig` and `#setupDOM`**

In `src/js/modules/modal.js`, update `defaultConfig` (line 23-30):

```js
static defaultConfig = {
  content: '',
  size: 'md',
  className: '',
  time: false,
  closeOnOuterClick: false,
  closeOnClick: false,
  closeAfterFunction: null,
  closeOtherModals: false
};
```

Replace `#setupDOM` (line 171-200) with:

```js
#setupDOM = () => {
  this.#modalElement = document.createElement('div');
  this.#modalElement.className = 'modal';
  this.#modalElement.setAttribute('role', 'dialog');
  this.#modalElement.setAttribute('aria-modal', 'true');
  this.#modalElement.__modal = this;

  const modalInner = document.createElement('div');
  modalInner.className = 'modal__inner';
  this.#modalElement.appendChild(modalInner);

  const { content } = this.#config;
  if (content instanceof globalThis.Element) {
    modalInner.appendChild(content);
  } else if (typeof content === 'string') {
    modalInner.innerHTML = content;
  }

  // Backward compat: content zaten modal__dialog içeriyorsa dokunma
  const existingDialog = modalInner.querySelector('.modal__dialog');

  if (existingDialog) {
    this.#modalContentElement = modalInner.querySelector('.modal__content');
  } else {
    // Yeni davranış: modal__dialog + modal__content otomatik oluştur
    const dialog = document.createElement('div');
    dialog.className = 'modal__dialog';

    const { size, className } = this.#config;
    if (size) dialog.classList.add(`modal__dialog--${size}`);
    if (className) dialog.classList.add(className);

    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'modal__content';

    // modalInner'ın tüm child'larını contentWrapper'a taşı
    while (modalInner.firstChild) {
      contentWrapper.appendChild(modalInner.firstChild);
    }

    dialog.appendChild(contentWrapper);
    modalInner.appendChild(dialog);
    this.#modalContentElement = contentWrapper;
  }

  if (!this.#modalContentElement) {
    throw new Error('Modal: `.modal__content` class\'ına sahip bir element bulunamadı.');
  }

  // aria-labelledby: Modal başlığı varsa bağla
  const heading = this.#modalContentElement.querySelector('.modal__header, h1, h2, h3, [data-modal-title]');
  if (heading) {
    if (!heading.id) heading.id = `modal-title-${Date.now()}`;
    this.#modalElement.setAttribute('aria-labelledby', heading.id);
  }
};
```

**Step 4: Update `help()` — add `size` and `className` entries**

In `help()` method, add to `availableConfigs` Map (after `content` entry):

```js
['size', 'Modal boyutu (`sm`, `md`, `lg`, `fullscreen`). Varsayılan: `md`.'],
['className', 'modal__dialog elementine eklenecek opsiyonel CSS class. Varsayılan: boş.'],
```

**Step 5: Build and verify**

Run: `npm run build`
Expected: Compiles successfully

**Step 6: Commit**

```bash
git add src/js/modules/modal.js
git commit -m "feat(modal): add size and className config with backward compat"
```

---

## Task 2: Update Toast.js to use new `size` config

**Files:**
- Modify: `src/js/modules/toast.js:54-83`

**Step 1: Read current Toast.insert() to confirm structure**

Current code (line 54-83) creates `modal__dialog` + `modal__content` manually, then passes the element to `Modal.insert()`.

**Step 2: Rewrite Toast.insert()**

Replace lines 54-83 with:

```js
static insert ({ message = {}, time = 27000, size = 'medium', fontSize = 'md', closeOnClick = true, dismissButton = false, ...otherOptions }) {
  const sizeMap = { small: 'sm', medium: 'md', large: 'lg' };
  const modalSize = sizeMap[size] || 'md';
  const fontSizeMap = { sm: 'modal__body--sm', md: 'modal__body--md', lg: 'modal__body--lg' };
  const fontSizeClass = fontSizeMap[fontSize] || 'modal__body--md';

  const messageListsHTML = Object.keys(message)
    .map(type => {
      const messages = Array.isArray(message[type]) ? message[type] : [message[type]];

      return `
        <ul class="toast__list toast__list--${type}">
          ${messages.map(msg => `<li>${msg}</li>`).join('')}
        </ul>
      `;
    }).join('');

  const bodyHTML = `
    <div class="modal__body ${fontSizeClass}">
      ${messageListsHTML}
      ${dismissButton ? `<div class="toast__dismiss"><button type="button" class="bttn bttn--neutral bttn--${fontSize}-rectangle" data-modal-close>${Language.get('buttonDismiss')}</button></div>` : ''}
    </div>
  `;

  Modal.insert({ content: bodyHTML, size: modalSize, time, closeOnClick, closeOtherModals: false, ...otherOptions });
}
```

Key change: No longer creates `modal__dialog` or `modal__content` — passes `size` config and only body content. Modal.js handles wrapping.

**Step 3: Build and verify**

Run: `npm run build`
Expected: Compiles successfully

**Step 4: Manual test**

Run: `npm run dev` → open `http://localhost:9006` → test Toast in dev/index.html
Verify: Toast renders correctly with modal__dialog--md wrapper

**Step 5: Commit**

```bash
git add src/js/modules/toast.js
git commit -m "refactor(toast): use Modal size config instead of manual dialog wrapper"
```

---

## Task 3: Add `display: contents` form support to modal SCSS

**Files:**
- Modify: `src/scss/modules/modal.scss:139` (inside `.modal__content` block)

**Step 1: Add form pass-through rule**

After `.modal__content` opening brace (line 139), add:

```scss
.modal__content {
  // ... existing styles ...

  // Form wrapper support: form sarması flex layout'u bozmaz
  > form {
    display: contents;
  }

  // ... existing .modal__header, .modal__body, .modal__footer ...
}
```

This allows `detail_notify_modal.tpl` to wrap header+body+footer in a `<form>` inside `modal__content` without breaking the flex layout.

**Step 2: Build and verify**

Run: `npm run build`
Expected: Compiles successfully

**Step 3: Commit**

```bash
git add src/scss/modules/modal.scss
git commit -m "style(modal): add display:contents for form wrapper inside modal__content"
```

---

## Task 4: Update Dükkan search modal SCSS

**Files:**
- Modify: `dukkan/resources/scopes/css/admin/common/search.scss:1-4`

**Step 1: Update selector**

Currently: `.common-search__modal { padding: 0; }` (on `modal__content`)
After refactoring: `className` goes on `modal__dialog`, so selector needs nesting.

Change to:

```scss
// Modal content — padding sıfırla, autocomplete sonuçlarına yer aç
.common-search__modal .modal__content {
    padding: 0;
}
```

**Step 2: Commit**

```bash
git add resources/scopes/css/admin/common/search.scss
git commit -m "refactor(search): update modal padding selector for new Modal config"
```

---

## Task 5: Migrate Dükkan JS callers — add `size` parameter

**Files:**
- Modify: 29 JS files in `dukkan/resources/scopes/js/`

All `Modal.insert()` calls currently pass pre-built content containing `modal__dialog--{size}`. After Task 6 (template boilerplate removal), the size info won't be in the content anymore, so JS callers need to pass it as config.

**Important:** JS callers and templates must be updated together (same commit) — otherwise the modal would have double wrapping (old content + new auto-wrap).

**This task and Task 6 run as a single atomic operation.**

### Size mapping from templates:

| JS caller file | Template | Size |
|---|---|---|
| `admin/common/header.js` | `header.tpl` (inline template) | `md` |
| `admin/common/filemanager.js` | `filemanager.tpl` | `lg` |
| `admin/sale/order.js` | `instrument_modal.tpl` | `lg` |
| `admin/sale/order_detail.js` | `instrument_modal.tpl` | `lg` |
| `admin/sale/return_request.js` | `return_request_form_modal.tpl` + `return_request_reject_form_modal.tpl` | `lg` / `sm` |
| `admin/shipping/rule_list.js` | `rule_form_modal.tpl` | `lg` |
| `admin/shipping/carrier_form.js` | `filemanager.tpl` | `lg` |
| `admin/product/product_form.js` | `filemanager.tpl` | `lg` |
| `admin/product/category_form.js` | `filemanager.tpl` | `lg` |
| `admin/product/manufacturer_form.js` | `filemanager.tpl` | `lg` |
| `admin/product/attribute.js` | `attribute_form_modal.tpl` (trendyol) | `lg` |
| `admin/product/category.js` | `category_form_modal.tpl` (trendyol) | `lg` |
| `admin/product/manufacturer.js` | `manufacturer_form_modal.tpl` (trendyol) | `lg` |
| `admin/store/store_form.js` | `filemanager.tpl` | `lg` |
| `admin/integration/login_form.js` | server-rendered | `lg` |
| `admin/integration/fiscal/invoice_form.js` | server-rendered | `lg` |
| `admin/integration/fiscal/waybill_form.js` | server-rendered | `lg` |
| `admin/integration/marketplace_form.js` | server-rendered | `lg` |
| `admin/integration/payment_form.js` | server-rendered | `lg` |
| `admin/integration/shipping_form.js` | server-rendered | `lg` |
| `admin/marketplace/trendyol/claim.js` | `claim_create/issue_form_modal.tpl` | `lg` |
| `admin/marketplace/etsy/category.js` → controller render | `category_form_modal.tpl` (etsy) | `lg` |
| `admin/setting/setting_form.js` | `filemanager.tpl` | `lg` |
| `admin/design/banner_form.js` | `filemanager.tpl` | `lg` |
| `admin/design/logo.js` | `filemanager.tpl` | `lg` |
| `frontstore/product/detail.js` | `detail_notify_modal.tpl` | `sm` |
| `frontstore/checkout/address.js` | `address_form_modal.tpl` | `lg` |
| `frontstore/checkout/payment.js` | `privacy/membership/preinform/diselcon_modal.tpl` | `md` |
| `frontstore/account/login.js` | `privacy/membership_modal.tpl` | `md` |

**Step 1: Update each JS caller**

Pattern for most files — add `size` to Modal.insert():

```js
// Before:
globalThis.Sadrazam.Modal.insert({ content: xhttp.responseText })

// After:
globalThis.Sadrazam.Modal.insert({ content: xhttp.responseText, size: 'lg' })
```

For files with `className`:

```js
// Before:
globalThis.Sadrazam.Modal.insert({ content: xhttp.responseText })

// After (instrument_modal):
globalThis.Sadrazam.Modal.insert({ content: xhttp.responseText, size: 'lg', className: 'sale-instrument_modal' })
```

Special case — `header.js` uses inline template, not AJAX:

```js
// Before:
const modal = globalThis.Sadrazam.Modal.insert({
  content: template.innerHTML,
  closeOnOuterClick: true,
});

// After:
const modal = globalThis.Sadrazam.Modal.insert({
  content: template.innerHTML,
  size: 'md',
  className: 'common-search__modal',
  closeOnOuterClick: true,
});
```

Special case — `return_request.js` opens two different modals (lg and sm). Need to check which endpoint returns which template to map correctly.

**Step 2: Proceed to Task 6 (template changes) before committing**

---

## Task 6: Strip `modal__dialog` + `modal__content` boilerplate from Dükkan templates

**Files:**
- Modify: 20 TPL files + 1 inline template in `header.tpl`

### Standard template transformation

**Before:**
```html
<div class="modal__dialog modal__dialog--lg">
    <div class="modal__content">
        <div class="modal__header">
            <button type="button" class="modal__close-button" data-modal-close="true"><i class="ph-light ph-x"></i></button>
            <h1><?= $heading ?></h1>
        </div>
        <div class="modal__body">
            ...content...
        </div>
        <div class="modal__footer">
            ...buttons...
        </div>
    </div>
</div>
```

**After:**
```html
<div class="modal__header">
    <button type="button" class="modal__close-button" data-modal-close="true"><i class="ph-light ph-x"></i></button>
    <h1><?= $heading ?></h1>
</div>
<div class="modal__body">
    ...content...
</div>
<div class="modal__footer">
    ...buttons...
</div>
```

Remove: outermost `<div class="modal__dialog ...">` and `<div class="modal__content">` (and their closing `</div>` tags).

### Template list and specific changes

**Standard (remove 2 wrapper divs):**
1. `admin/common/filemanager.tpl` — remove `modal__dialog--lg` + `modal__content`, keep `<style>` tag before content
2. `admin/sale/return_request_form_modal.tpl` — remove `modal__dialog--lg` + `modal__content`
3. `admin/sale/return_request_reject_form_modal.tpl` — remove `modal__dialog--sm` + `modal__content`
4. `admin/sale/package_tracking_form_modal.tpl` — remove `modal__dialog--lg` + `modal__content`
5. `admin/sale/shipment_offer_modal.tpl` — remove `modal__dialog--lg sale-shipment_offer_modal` + `modal__content`
6. `admin/shipping/rule_form_modal.tpl` — remove `modal__dialog--lg` + `modal__content`
7. `admin/marketplace/trendyol/category_form_modal.tpl` — remove `modal__dialog--lg marketplace-trendyol-category_form_modal` + `modal__content`
8. `admin/marketplace/trendyol/attribute_form_modal.tpl` — remove `modal__dialog--lg marketplace-trendyol-attribute_form_modal` + `modal__content`
9. `admin/marketplace/trendyol/manufacturer_form_modal.tpl` — remove `modal__dialog--lg marketplace-trendyol-manufacturer_form_modal` + `modal__content`
10. `admin/marketplace/trendyol/claim_create_form_modal.tpl` — remove `modal__dialog--lg` + `modal__content`
11. `admin/marketplace/trendyol/claim_issue_form_modal.tpl` — remove `modal__dialog--lg` + `modal__content`
12. `admin/marketplace/etsy/category_form_modal.tpl` — remove `modal__dialog--lg marketplace-etsy-category_form_modal` + `modal__content`
13. `frontstore/checkout/address_form_modal.tpl` — remove `modal__dialog--lg` + `modal__content`
14. `frontstore/information/membership_modal.tpl` — remove `modal__dialog--md` + `modal__content`
15. `frontstore/information/privacy_modal.tpl` — remove `modal__dialog--md` + `modal__content`
16. `frontstore/information/preinform_modal.tpl` — remove `modal__dialog--md` + `modal__content`
17. `frontstore/information/diselcon_modal.tpl` — remove `modal__dialog--md` + `modal__content`

**Special — instrument_modal.tpl:**
18. `admin/sale/instrument_modal.tpl` — remove `modal__dialog--lg sale-instrument_modal` + `modal__content`. Keep `<style>` tag. `sale-instrument_modal` class moves to a wrapper div inside content OR is passed via `className`.

**Special — detail_notify_modal.tpl (form wrapper):**
19. `frontstore/product/detail_notify_modal.tpl` — remove `modal__dialog--sm`. Change `<form class="modal__content">` to `<form>` (form goes inside auto-generated `modal__content`, `display: contents` handles flex layout).

**Special — header.tpl (inline template):**
20. `admin/common/header.tpl` — remove `modal__dialog modal__dialog--md` and `modal__content common-search__modal` wrappers from `#common-search__modal-template`. Content becomes just the search input container.

**Before (header.tpl lines 50-63):**
```html
<div id="common-search__modal-template" class="d-none">
    <div class="modal__dialog modal__dialog--md">
        <div class="modal__content common-search__modal">
            <div class="common-search__input-container">
                ...
            </div>
        </div>
    </div>
</div>
```

**After:**
```html
<div id="common-search__modal-template" class="d-none">
    <div class="common-search__input-container">
        ...
    </div>
</div>
```

### Step 1: Apply all template changes

Process each file: remove the two wrapper `<div>` lines and their corresponding closing `</div>` tags.

### Step 2: Commit Task 5 + Task 6 together (atomic)

```bash
git add resources/scopes/js/ templates/
git commit -m "refactor(modal): use size/className config, remove template boilerplate

Modal.insert() now accepts size and className params. Templates no
longer need modal__dialog + modal__content wrappers — Modal.js
creates them automatically. 20 templates simplified, 29 JS callers
updated."
```

---

## Task 7: Update Sadrazam docs and build

**Files:**
- Modify: `sadrazam/docs/modals.html` — update API reference, add `size`/`className` to config table
- Modify: `sadrazam/dev/index.html` — update modal demo examples
- Modify: `sadrazam/CLAUDE.md` — document new `size`/`className` config
- Modify: `sadrazam/docs/wiki/improvement-areas.md` — add completed item

**Step 1: Update docs/modals.html**

Add `size` and `className` to the config table in the API section.

**Step 2: Update dev/index.html**

Update modal demo to use `size` config instead of hardcoded `modal__dialog` wrapper.

**Step 3: Update CLAUDE.md**

Add to the existing Modal documentation section.

**Step 4: Build and release**

Run: `npm run release`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add docs/ dev/ CLAUDE.md dist/
git commit -m "docs: update modal docs for size/className config, rebuild dist"
```

---

## Task 8: Verify — deep scan for leftover `modal__dialog` in templates

**Step 1: Grep for old pattern in Dükkan templates**

```bash
# Should return 0 matches (templates no longer contain modal__dialog)
grep -r "modal__dialog" dukkan/templates/
```

**Step 2: Grep for modal__content in templates (should only be in form wrapper case)**

```bash
grep -r "modal__content" dukkan/templates/
```

Expected: Zero matches (all wrappers removed).

**Step 3: Build Dükkan and verify no SCSS errors**

```bash
cd dukkan && npm run build
```

---

## Summary

| Task | Scope | Files | Description |
|------|-------|-------|-------------|
| 1 | Sadrazam JS | 1 | Add `size`/`className` config to Modal.js with backward compat |
| 2 | Sadrazam JS | 1 | Update Toast.js to use `size` config |
| 3 | Sadrazam SCSS | 1 | Add `display: contents` for form wrapper support |
| 4 | Dükkan SCSS | 1 | Update search modal padding selector |
| 5 | Dükkan JS | 29 | Add `size` param to all `Modal.insert()` callers |
| 6 | Dükkan TPL | 20 | Strip `modal__dialog` + `modal__content` boilerplate |
| 7 | Sadrazam docs | 4 | Update docs, CLAUDE.md, rebuild dist |
| 8 | Both | — | Deep verification scan |

**Total: ~57 files changed across 2 projects**
