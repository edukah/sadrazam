# Button Tier System Implementation Plan

> **Durum: TAMAMLANDI** — SCSS refactoring, dev/index.html, docs/buttons.html, wiki tamamlandı. Renksiz bttn--outline kullanımları düzeltildi.

**Goal:** Buton sistemini `--button-color` CSS variable altyapısına geçirerek filled/soft/outline kademelerini her renk varyantıyla kombine edilebilir hale getirmek.

**Architecture:** Her renk varyantı (`--pri`, `--sec`, `--neutral` vs.) sadece `--button-color` variable'ını set eder. Kademe modifier'ları (`--soft`, `--outline`) bu variable'ı okuyarak bg/border/color hesaplar. Ghost bağımsız kalır. Inline `--button-color` ile custom renk desteği bedavaya gelir.

**Tech Stack:** SCSS (Dart Sass 1.86+, `color-mix()` desteği var), Webpack 5

**Scope:** Sadece Sadrazam (Phase 1). Dükkan geçişi ayrı planlanacak.

---

### Task 1: Renk varyantlarını `--button-color` altyapısına geçir

**Files:**
- Modify: `src/scss/components/_button.scss`

**Step 1: Renk varyantlarını `--button-color` set eden tek satırlara dönüştür**

Mevcut her renk varyantını kaldır ve yerine `--button-color` tabanlı sistemi yaz. `.bttn` base class'ına filled default davranışı ekle.

```scss
/* =========================================================================
   Button (.bttn) Sistemi
   Boyut, renk, sınır ve durum varyantları ile özel buton bileşeni.
   HTML <button> element stili _form.scss'te kalır, bu dosya sadece
   .bttn class sistemi içindir.

   Boyutlar:    --lg, --md, --sm, --xs (+ rectangle varyantları)
   Renkler:     --pri, --sec, --ter, --neutral,
                --safe, --notice, --caution, --warning, --danger
   Kademeler:   filled (default), --soft, --outline
   Bağımsız:    --ghost
   Durumlar:    --disabled, --loading
   Yerleşim:    --block (tam genişlik)
   ========================================================================= */

.bttn {
  position: relative;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  cursor: pointer;
  width: auto;
  margin: 0;
  border: var(--border-width-sm) solid transparent;
  border-radius: var(--radius-md);
  appearance: none;
  white-space: nowrap;
  line-height: 1;
  text-shadow: 0 0 0 var(--color-grey-400);
  box-shadow: 0 0 0 var(--color-grey-400);
  transition: filter 0.2s, background-color 0.2s;
  outline: none;

  // Filled default: renk varyantı varsa --button-color'dan hesapla
  background-color: var(--button-color, transparent);
  color: var(--color-text-white--f);
  border-color: var(--button-color, transparent);

  &>* {
    line-height: 1;
  }

  &:hover {
    filter: opacity(85%);
  }

  &:hover,
  &:active,
  &:focus {
    outline: none;
  }

  // ---- Boyutlar (kare padding) ----
  &--lg { padding: 14px; }
  &--md { padding: 10px; }
  &--sm { padding: 7px; }
  &--xs { padding: 5px; }

  // ---- Rectangle varyantları ----
  &--lg-rectangle { padding: 14px 25px; }
  &--md-rectangle { padding: 10px 16px; }
  &--sm-rectangle { padding: 7px 12px; }
  &--xs-rectangle { padding: 5px 9px; }

  // ---- Block buton ----
  &--block {
    display: block;
    width: 100%;

    &+& {
      margin-top: 5px;
    }
  }

  // ---- Renk varyantları (sadece --button-color set eder) ----
  &--pri { --button-color: var(--color-pri-500); }
  &--sec { --button-color: var(--color-sec-500); }
  &--ter { --button-color: var(--color-ter-500); }
  &--safe { --button-color: var(--color-safe-500); }
  &--notice { --button-color: var(--color-notice-500); }
  &--caution { --button-color: var(--color-caution-500); }
  &--warning { --button-color: var(--color-warning-500); }
  &--danger { --button-color: var(--color-danger-500); }

  // ---- Neutral (kendi renk sistemi) ----
  &--neutral {
    --button-color: var(--color-grey-400);
    background-color: var(--color-grey-zero);
    color: var(--color-text-dark-2);
    border-color: var(--color-grey-400);

    &:hover {
      background-color: var(--color-grey-100);
    }
  }

  // ---- Kademe: Soft ----
  &--soft {
    background-color: color-mix(in srgb, var(--button-color) 12%, transparent);
    color: var(--button-color);
    border-color: transparent;

    &:hover {
      background-color: color-mix(in srgb, var(--button-color) 20%, transparent);
    }
  }

  // ---- Kademe: Outline ----
  &--outline {
    background-color: transparent;
    color: var(--button-color);
    border-color: var(--button-color);

    &:hover {
      background-color: color-mix(in srgb, var(--button-color) 8%, transparent);
    }

    &:focus {
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--button-color) 15%, transparent);
    }
  }

  // ---- Neutral + Soft kombinasyonu ----
  &--neutral#{&}--soft {
    background-color: var(--color-grey-100);
    color: var(--color-text-dark-3);
    border-color: transparent;

    &:hover {
      background-color: var(--color-grey-200);
    }
  }

  // ---- Neutral + Outline kombinasyonu ----
  &--neutral#{&}--outline {
    background-color: transparent;
    color: var(--color-text-dark-2);
    border-color: var(--color-grey-400);

    &:hover {
      background-color: var(--color-grey-50);
    }

    &:focus {
      border-color: var(--color-pri-300);
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-pri-500) 15%, transparent);
    }
  }

  // ---- Bağımsız: Ghost ----
  &--ghost {
    --button-color: none;
    background-color: transparent;
    color: var(--color-text-dark-3);
    border: none;
    box-shadow: none;
    text-shadow: none;
  }

  // ---- Disabled durumu ----
  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  // ---- Loading durumu ----
  &--loading {
    position: relative;
    cursor: wait;
    pointer-events: none;
    background-color: var(--color-grey-500) !important;
    border-color: var(--color-grey-500) !important;
    color: var(--color-grey-zero) !important;
    filter: opacity(0.7);

    &:hover {
      filter: none;
    }

    &::after {
      content: "";
      position: absolute;
      inset: calc(var(--border-width-sm) * -1);
      border-radius: inherit;
      background: linear-gradient(105deg,
          transparent 35%,
          rgba(255, 255, 255, 0.5) 45%,
          rgba(255, 255, 255, 0.8) 50%,
          rgba(255, 255, 255, 0.5) 55%,
          transparent 65%);
      background-size: 250% 100%;
      animation: bttn-shimmer 1.5s ease-in-out infinite alternate;
    }

    @keyframes bttn-shimmer {
      from {
        background-position: 200% 0;
      }

      to {
        background-position: -200% 0;
      }
    }
  }
}
```

**Step 2: Webpack dev server'da görsel kontrol**

Run: `npm run dev`
- Tüm renkli filled butonlar aynı görünmeli (pri, sec, ter, danger vs.)
- Neutral beyaz bg + koyu text + gri border olmalı
- Ghost değişmemiş olmalı

**Step 3: Commit**

```bash
git add src/scss/components/_button.scss
git commit -m "refactor(button): migrate to --button-color variable system"
```

---

### Task 2: `--border` modifier'ını kaldır

**Files:**
- Modify: `src/scss/components/_button.scss`

**Step 1: `--border` tanımını sil**

`--border` artık gereksiz. `--outline` aynı işi yapıyor (transparent bg + border). Eğer sadece border eklemek isteyen varsa `--outline` kullanır.

Sadece bu bloğu kaldır:
```scss
// ---- Sınır stilleri ----
&--border {
  border: var(--border-width-sm) solid currentColor;
}
```

**Step 2: Tüm projede `bttn--border` kullanımı tara**

Run: `grep -r "bttn--border" /home/hllktlhndd/Workspace/workbench/sadrazam/ --include="*.html" --include="*.js" -l`

Bulunan dosyalarda `bttn--border`'ı kaldır veya `bttn--outline` ile değiştir.

**Step 3: Commit**

```bash
git add -A
git commit -m "refactor(button): remove --border modifier, --outline covers this"
```

---

### Task 3: `dev/index.html` sandbox'ı yeni sisteme güncelle

**Files:**
- Modify: `dev/index.html`

**Step 1: Buttons bölümünü yeniden yaz**

Mevcut buton bölümünü kaldır, yerine yeni tier sistemini gösteren kapsamlı demo ekle:

```html
<!-- ================================================================
     BUTTONS
     ================================================================ -->
<div class="section" id="sec-buttons">
    <div class="section-title">Buttons <code>.bttn</code></div>

    <!-- Sizes -->
    <div class="sub-title">Sizes</div>
    <div class="row">
        <span class="label">--lg</span>
        <button class="bttn bttn--lg bttn--pri">LG</button>
        <button class="bttn bttn--lg-rectangle bttn--pri">LG Rectangle</button>
    </div>
    <div class="row">
        <span class="label">--md</span>
        <button class="bttn bttn--md bttn--pri">MD</button>
        <button class="bttn bttn--md-rectangle bttn--pri">MD Rectangle</button>
    </div>
    <div class="row">
        <span class="label">--sm</span>
        <button class="bttn bttn--sm bttn--pri">SM</button>
        <button class="bttn bttn--sm-rectangle bttn--pri">SM Rectangle</button>
    </div>
    <div class="row">
        <span class="label">--xs</span>
        <button class="bttn bttn--xs bttn--pri">XS</button>
        <button class="bttn bttn--xs-rectangle bttn--pri">XS Rectangle</button>
    </div>

    <hr class="dev-sep">

    <!-- Tier System: Filled / Soft / Outline -->
    <div class="sub-title">Tier System — Filled (default) / Soft / Outline</div>

    <!-- Pri -->
    <div class="row">
        <span class="label">pri</span>
        <button class="bttn bttn--md-rectangle bttn--pri">Filled</button>
        <button class="bttn bttn--md-rectangle bttn--pri bttn--soft">Soft</button>
        <button class="bttn bttn--md-rectangle bttn--pri bttn--outline">Outline</button>
    </div>

    <!-- Sec -->
    <div class="row">
        <span class="label">sec</span>
        <button class="bttn bttn--md-rectangle bttn--sec">Filled</button>
        <button class="bttn bttn--md-rectangle bttn--sec bttn--soft">Soft</button>
        <button class="bttn bttn--md-rectangle bttn--sec bttn--outline">Outline</button>
    </div>

    <!-- Ter -->
    <div class="row">
        <span class="label">ter</span>
        <button class="bttn bttn--md-rectangle bttn--ter">Filled</button>
        <button class="bttn bttn--md-rectangle bttn--ter bttn--soft">Soft</button>
        <button class="bttn bttn--md-rectangle bttn--ter bttn--outline">Outline</button>
    </div>

    <!-- Neutral -->
    <div class="row">
        <span class="label">neutral</span>
        <button class="bttn bttn--md-rectangle bttn--neutral">Filled</button>
        <button class="bttn bttn--md-rectangle bttn--neutral bttn--soft">Soft</button>
        <button class="bttn bttn--md-rectangle bttn--neutral bttn--outline">Outline</button>
    </div>

    <hr class="dev-sep">

    <!-- Semantic Colors -->
    <div class="sub-title">Semantic Colors — Filled / Soft / Outline</div>

    <div class="row">
        <span class="label">danger</span>
        <button class="bttn bttn--md-rectangle bttn--danger">Filled</button>
        <button class="bttn bttn--md-rectangle bttn--danger bttn--soft">Soft</button>
        <button class="bttn bttn--md-rectangle bttn--danger bttn--outline">Outline</button>
    </div>

    <div class="row">
        <span class="label">safe</span>
        <button class="bttn bttn--md-rectangle bttn--safe">Filled</button>
        <button class="bttn bttn--md-rectangle bttn--safe bttn--soft">Soft</button>
        <button class="bttn bttn--md-rectangle bttn--safe bttn--outline">Outline</button>
    </div>

    <div class="row">
        <span class="label">warning</span>
        <button class="bttn bttn--md-rectangle bttn--warning">Filled</button>
        <button class="bttn bttn--md-rectangle bttn--warning bttn--soft">Soft</button>
        <button class="bttn bttn--md-rectangle bttn--warning bttn--outline">Outline</button>
    </div>

    <div class="row">
        <span class="label">notice</span>
        <button class="bttn bttn--md-rectangle bttn--notice">Filled</button>
        <button class="bttn bttn--md-rectangle bttn--notice bttn--soft">Soft</button>
        <button class="bttn bttn--md-rectangle bttn--notice bttn--outline">Outline</button>
    </div>

    <div class="row">
        <span class="label">caution</span>
        <button class="bttn bttn--md-rectangle bttn--caution">Filled</button>
        <button class="bttn bttn--md-rectangle bttn--caution bttn--soft">Soft</button>
        <button class="bttn bttn--md-rectangle bttn--caution bttn--outline">Outline</button>
    </div>

    <hr class="dev-sep">

    <!-- Ghost (standalone) -->
    <div class="sub-title">Ghost (standalone)</div>
    <div class="row">
        <button class="bttn bttn--md-rectangle bttn--ghost"><i class="ph-bold ph-x"></i>&nbsp; Cancel</button>
        <button class="bttn bttn--md bttn--ghost"><i class="ph-bold ph-dots-three"></i></button>
    </div>

    <hr class="dev-sep">

    <!-- Custom Color -->
    <div class="sub-title">Custom Color <code>style="--button-color: ..."</code></div>
    <div class="row">
        <button class="bttn bttn--md-rectangle" style="--button-color: #e91e63;">Custom Filled</button>
        <button class="bttn bttn--md-rectangle bttn--soft" style="--button-color: #e91e63;">Custom Soft</button>
        <button class="bttn bttn--md-rectangle bttn--outline" style="--button-color: #e91e63;">Custom Outline</button>
    </div>
    <div class="row">
        <button class="bttn bttn--md-rectangle" style="--button-color: #00bcd4;">Teal Filled</button>
        <button class="bttn bttn--md-rectangle bttn--soft" style="--button-color: #00bcd4;">Teal Soft</button>
        <button class="bttn bttn--md-rectangle bttn--outline" style="--button-color: #00bcd4;">Teal Outline</button>
    </div>

    <hr class="dev-sep">

    <!-- With Icons -->
    <div class="sub-title">With Icons</div>
    <div class="row">
        <button class="bttn bttn--md-rectangle bttn--pri"><i class="ph-bold ph-plus"></i>&nbsp; Add</button>
        <button class="bttn bttn--md-rectangle bttn--danger bttn--soft"><i class="ph-bold ph-trash"></i>&nbsp; Delete</button>
        <button class="bttn bttn--md-rectangle bttn--neutral bttn--outline"><i class="ph-bold ph-gear"></i>&nbsp; Settings</button>
        <button class="bttn bttn--md bttn--pri bttn--outline"><i class="ph-bold ph-heart"></i></button>
        <button class="bttn bttn--md bttn--ghost"><i class="ph-bold ph-x"></i></button>
    </div>

    <hr class="dev-sep">

    <!-- Action Hierarchy Examples -->
    <div class="sub-title">Action Hierarchy Examples</div>
    <div class="row">
        <span class="label">Modal footer</span>
        <button class="bttn bttn--md-rectangle bttn--pri">Save</button>
        <button class="bttn bttn--md-rectangle bttn--neutral bttn--outline">Cancel</button>
    </div>
    <div class="row">
        <span class="label">Delete confirm</span>
        <button class="bttn bttn--md-rectangle bttn--danger">Delete</button>
        <button class="bttn bttn--md-rectangle bttn--danger bttn--soft">Keep</button>
        <button class="bttn bttn--md-rectangle bttn--ghost">Cancel</button>
    </div>
    <div class="row">
        <span class="label">Form actions</span>
        <button class="bttn bttn--md-rectangle bttn--pri">Submit</button>
        <button class="bttn bttn--md-rectangle bttn--pri bttn--soft">Save Draft</button>
        <button class="bttn bttn--md-rectangle bttn--ghost">Discard</button>
    </div>

    <hr class="dev-sep">

    <!-- Loading & Disabled -->
    <div class="sub-title">Loading &amp; Disabled States</div>
    <p style="font-size:0.75rem; color:var(--color-text-dark-3); margin-bottom:10px;">Click to toggle loading (2s auto-reset)</p>
    <div class="row">
        <button class="bttn bttn--md-rectangle bttn--pri" onclick="toggleLoading(this, 2000)"><i class="ph-bold ph-paper-plane-tilt"></i>&nbsp; Send</button>
        <button class="bttn bttn--md-rectangle bttn--danger" onclick="toggleLoading(this, 2000)"><i class="ph-bold ph-trash"></i>&nbsp; Delete</button>
        <button class="bttn bttn--md-rectangle bttn--neutral" onclick="toggleLoading(this, 2000)"><i class="ph-bold ph-gear"></i>&nbsp; Process</button>
    </div>
    <div class="row">
        <span class="label">Static loading</span>
        <button class="bttn bttn--md-rectangle bttn--pri bttn--loading">Loading</button>
        <button class="bttn bttn--md-rectangle bttn--danger bttn--loading">Loading</button>
    </div>
    <div class="row">
        <span class="label">Disabled</span>
        <button class="bttn bttn--md-rectangle bttn--pri bttn--disabled">Disabled</button>
        <button class="bttn bttn--md-rectangle bttn--pri bttn--soft bttn--disabled">Disabled Soft</button>
        <button class="bttn bttn--md-rectangle bttn--pri bttn--outline bttn--disabled">Disabled Outline</button>
    </div>

    <hr class="dev-sep">

    <!-- Block Button -->
    <div class="sub-title">Block Button <code>.bttn--block</code></div>
    <div style="max-width:400px;">
        <button class="bttn bttn--md-rectangle bttn--pri bttn--block"><i class="ph-bold ph-sign-in"></i>&nbsp; Sign In</button>
        <button class="bttn bttn--md-rectangle bttn--neutral bttn--outline bttn--block">Register</button>
    </div>
</div>
```

**Step 2: Görsel kontrol**

Run: `npm run dev`
- Tier System tablosu: her renk 3 kademede doğru görünmeli
- Neutral filled/soft/outline ayrı çalışmalı
- Custom color inline style ile çalışmalı
- Action hierarchy örnekleri mantıklı görünmeli

**Step 3: Commit**

```bash
git add dev/index.html
git commit -m "docs(dev): update sandbox with button tier system demos"
```

---

### Task 4: `docs/buttons.html` showcase sayfasını güncelle

**Files:**
- Modify: `docs/buttons.html`

**Step 1: Mevcut renk ve outline bölümlerini tier sistemiyle değiştir**

Eski standalone `--outline` örneklerini kaldır. Tier system tablosunu ekle. Custom color demo ekle. Mevcut size, loading, block bölümleri kalabilir.

**Step 2: Diğer docs HTML dosyalarında eski class kullanımlarını güncelle**

Run: `grep -r "bttn--outline\|bttn--border" /home/hllktlhndd/Workspace/workbench/sadrazam/docs/ --include="*.html" -l`

Bulunan dosyalarda standalone `bttn--outline` kullanımlarını `bttn--neutral bttn--outline` ile değiştir.

**Step 3: Commit**

```bash
git add docs/
git commit -m "docs: update button showcase with tier system"
```

---

### Task 5: CLAUDE.md ve wiki'yi güncelle

**Files:**
- Modify: `CLAUDE.md` (Sadrazam root)
- Create: `docs/wiki/button-system.md`

**Step 1: CLAUDE.md'deki buton referanslarını güncelle**

BEM-like CSS naming örneğini güncelle: `.bttn--pri`, `.bttn--pri.bttn--soft`, `.bttn--neutral.bttn--outline`

**Step 2: Wiki'ye buton sistemi dokümanı yaz**

```markdown
# Button System

## Architecture

Buton sistemi `--button-color` CSS custom property üzerine kurulu.
Her renk varyantı bu variable'ı set eder, kademeler (soft/outline) bu variable'ı okur.

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

## Standalone

| Class | Purpose |
|-------|---------|
| `--ghost` | No bg, no border, muted text. Independent. |

## Custom Colors

Inline `--button-color` ile herhangi bir renk kullanılabilir:

    <button class="bttn bttn--md-rectangle" style="--button-color: #e91e63;">Custom</button>

Soft ve outline otomatik çalışır.

## Action Hierarchy

    Primary:   bttn--pri (filled)
    Secondary: bttn--pri bttn--soft / bttn--neutral bttn--outline
    Tertiary:  bttn--ghost

## States

- `--disabled`: opacity 0.5, cursor not-allowed, pointer-events none
- `--loading`: grey bg, shimmer animation, pointer-events none
- `--block`: full width
```

**Step 3: Commit**

```bash
git add CLAUDE.md docs/wiki/button-system.md
git commit -m "docs: add button tier system documentation to wiki and CLAUDE.md"
```

---

### Task 6: Build ve son kontrol

**Step 1: Production build**

Run: `npm run build`
Expected: dist/ dosyaları hatasız oluşmalı

**Step 2: Release (docs assets güncelle)**

Run: `npm run release`
Expected: `docs/assets/sadrazam.min.css` ve `sadrazam.min.js` güncellenmeli

**Step 3: Son commit**

```bash
git add dist/ docs/assets/
git commit -m "build: rebuild dist for button tier system"
```
