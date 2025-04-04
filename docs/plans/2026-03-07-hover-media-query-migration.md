# Hover Media Query Migration Plan — TAMAMLANDI

> Sticky hover sorununu cozmek icin `:hover` efektlerini `@media (hover: hover) and (pointer: fine)` ile sarmala.

**Goal:** Touch cihazlarda hover efektlerinin yapismesini onlemek.

**Architecture:** Her `:hover` kullanimi denetlenip, sticky hover riski olanlari media query ile sarmalanacak. `filter: brightness()` gibi zararsiz efektler dokunulmayacak.

---

## Phase 1: Sadrazam (UI Library)

### Sarmalanmasi Gereken (6 dosya, 8 hover)

#### 1. `src/scss/modules/tabs.scss:218`
```scss
// ONCE
.tab-capsule__head:hover {
  color: var(--color-pri-500);
}

// SONRA
.tab-capsule__head {
  @media (hover: hover) and (pointer: fine) {
    &:hover {
      color: var(--color-pri-500);
    }
  }
}
```
**Risk:** Tab rengi dokunmatikta yapismaz ama hover stili takili kalir.

#### 2. `src/scss/modules/snackbar.scss:222`
```scss
// Close button opacity
.snackbar__static-close:hover, .snackbar__static-close:focus { opacity: 0.5; }
// NOT: :focus'u media query DISINDA birak — klavye erisilebilirlik icin gerekli
```

#### 3. `src/scss/modules/slide-menu.scss:146,175`
- Line 146: Close button opacity
- Line 175: Option item box-shadow

#### 4. `src/scss/modules/modal.scss:89`
- Close button color change

#### 5. `src/scss/utilities/_image.scss:62`
- `.img-grayscale--hover:hover` grayscale kaldirma

#### 6. `src/scss/components/_link.scss` / `_typography.scss`
- `.text-underline-hover:hover` text-decoration

### Dokunulmayacaklar (Sadrazam)

| Dosya | Neden |
|-------|-------|
| `_button.scss` tum hoverlar | `filter: brightness()` dokunmatikta yapismiyor |
| `_form.scss` disabled hoverlar | `pointer-events: none` zaten engelliyor |
| `_reset.scss` scrollbar hover | Dokunmatikta scrollbar thumb yok |

---

## Phase 2: Dukkan Frontstore (Kullanici-Yuzlu)

### Yuksek Oncelik

| Dosya | Satir | Efekt | Risk |
|-------|-------|-------|------|
| `common/navigation.scss` | 187 | Dropdown hover ile aciliyor | **Kritik** — mobilde menu takili kalir |
| `product/_product-card.scss` | 25 | Favori buton renk/bg | Dokunmatikta yapisan renk |
| `product/review.scss` | 119,124 | Upvote buton renk | Dokunmatikta yapisan renk |
| `product/review_form.scss` | 52-53 | Yildiz rating hover | Yanlis yildiz secimi gorunumu |

### Orta Oncelik

| Dosya | Satir | Efekt |
|-------|-------|-------|
| `product/detail.scss` | 94 | Quantity buton bg degisimi |
| `product/detail.scss` | 168,172 | Favori buton filter/renk |
| `product/listing_container.scss` | 83 | Urun kart box-shadow |
| `common/header.scss` | 417 | Ikon transform |
| `common/footer.scss` | 109 | Sosyal ikon opacity |
| `account/address.scss` | 26 | Adres item bg |
| `account/login.scss` | 98 | Sosyal giris buton bg |
| `checkout/address.scss` | 50 | Span underline |
| `common/home.scss` | 84 | Kategori link underline |
| `common/pagination.scss` | 60 | Sayfa buton stili |
| `common/navigation.scss` | 75 (shared) | Nav item background |

### Dusuk Oncelik

| Dosya | Satir | Efekt | Neden |
|-------|-------|-------|-------|
| `information/faq.scss` | 46 | FAQ item renk | Az kullanilan sayfa |
| `information/installments.scss` | 29 | Bos hover block | Zaten etkisiz |

### Zaten Tamamlanmis (Dukkan Frontstore)

| Dosya | Satir | Durum |
|-------|-------|-------|
| `product/detail.scss` | 209-210 | Notify buton — zaten sarili |
| `product/detail.scss` | 330-331 | Product card — zaten sarili |
| `account/favorite.scss` | 23 | Favori card — zaten sarili |
| `common/home.scss` | 113, 228 | Kategori/featured card — zaten sarili |

---

## Phase 3: Dukkan Admin (Dusuk Oncelik)

Admin panel masaustunden kullanildigi icin sticky hover riski dusuk.
Yine de uzun vadede sarmalanmali:

| Dosya | Satir | Efekt |
|-------|-------|-------|
| `admin/common/navigation.scss` | 47,150,191,202 | Nav item efektleri |
| `admin/common/pagination.scss` | 60 | Sayfa buton |
| `admin/common/filemanager.scss` | 111,149 | Dosya item border/transform |
| `admin/_status.scss` | 16 | Status badge shadow |
| `admin/_filter-bar.scss` | 34,39 | Filter item bg |
| `admin/_image.scss` | 113 | Thumbnail border |
| `admin/sale/shipment_offer_modal.scss` | 99,189 | Offer/link hover |
| `admin/sale/instrument_modal.scss` | 96,124 | Table row/link hover |
| `admin/statistic/report.scss` | 27 | Table row bg |

---

## Tamamlanan Fazlar

### Phase 1: Sadrazam — Tamamlandi (2026-03-08)

6 dosya, 8 hover sarmalandi. Detaylar yukaridaki listede.

### Phase 2: Dukkan Frontstore — Tamamlandi (2026-03-08)

17 dosya duzenlendi, ~27 hover sarmalandi. Ek duzeltmeler:
- `product/detail.scss:121` — `&::hover` / `&::focus` typo'su `:hover` / `:focus` olarak duzeltildi
- `information/installments.scss:29` — Ici bos hover blogu silindi
- `common/header.scss:176` — Ici bos hover blogu silindi
- `product/review_form.scss:52-53` — `:hover` selektorleri `:checked`'den ayrildi
- `product/review.scss:119-124` — `:hover` stili `.upvoted` state'inden ayrildi
- `product/detail.scss:168` — `:hover` stili `--active` modifier'indan ayrildi
- `product/detail.scss:217` — Media query sirasi duzeltildi (hover > media → media > hover)

### Phase 3: Dukkan Admin — Tamamlandi (2026-03-10)

9 dosya, 13 hover sarmalandi:
- `common/navigation.scss` — Icon glow (line 47), link hover (line 191), activeLink hover (line 202). `nav-group-header` hover atlanadi (`pointer-events: none`)
- `common/pagination.scss` — Page link hover (line 60)
- `common/filemanager.scss` — Item hover (line 111), image scale (line 149)
- `_status.scss` — Status card box-shadow (line 16)
- `_filter-bar.scss` — Filter item bg (line 34). `&--active:hover` override olarak korundu
- `_image.scss` — `a.thumbnail:hover` ayrildi: `:focus` ve `.active` disarida, `:hover` media query icinde
- `sale/shipment_offer_modal.scss` — Offer item hover (line 99), warning link hover (line 189)
- `sale/instrument_modal.scss` — Table row hover (line 96), link underline (line 124)
- `statistic/report.scss` — Data table row hover (line 27)

---

## Dogrulama Taramas Gerekliligi

**Phase 1, 2 ve 3 tamamlandi. Dogrulama taramasi yapildi (2026-03-10), sonuc: temiz.**
**Ek olarak tum hover media query'ler `selector > media` konvansiyonuna cevrildi.**
Asagidaki taramalar hem Sadrazam hem Dukkan icin ayri ayri yapilmali:

### 1. Sarmalanmamis Hover Taramasi

Her iki projede `@media (hover: hover)` icinde **olmayan** `:hover` kullanimi aranmali.

```bash
# Sadrazam SCSS
grep -rn ':hover' src/scss/ | grep -v '@media (hover' | grep -v '//' | grep -v '/\*'

# Dukkan Frontstore SCSS
grep -rn ':hover' resources/scopes/css/frontstore/ | grep -v '@media (hover' | grep -v '//' | grep -v '/\*'

# Dukkan Admin SCSS (Phase 3 hazirligi)
grep -rn ':hover' resources/scopes/css/admin/ | grep -v '@media (hover' | grep -v '//' | grep -v '/\*'
```

Her sonuc icin karar verilmeli:
- **Sarmalanmali mi?** (sticky hover riski var mi)
- **Dokunulmamali mi?** (neden: `filter: brightness`, `pointer-events: none`, scrollbar, vb.)
- **Kasitli mi biraklldi?** (zaten media query icinde ama farkli satirda oldugu icin grep yakalayamadi)

### 2. Yanlis Sirada Sarmalanmis Hover Taramasi

`:hover` disarida, `@media` icerde olan (ters siradaki) kullanmlar aranmali:

```bash
# Multiline grep: :hover { ... @media (hover iceren bloklar
grep -Pzo '&:hover\s*\{[^}]*@media' src/scss/ resources/scopes/css/frontstore/
```

Bu desen calisiyorsa da konvansiyon disindadir; `@media > &:hover` sirasina cevirilmeli.

### 3. Pseudo-Element Typo Taramasi

`::hover` veya `::focus` gibi hatali cift iki nokta kullanimlari aranmali:

```bash
grep -rn '::hover\|::focus\|::active' src/scss/ resources/scopes/css/
```

`::focus` ve `::active` sadece `::focus-visible`, `::focus-within` gibi pseudo-element formlarinda gecerli; duz `::hover` / `::focus` / `::active` her zaman hatalidir.

### 4. `:focus` / `:active` Erisebilirlik Kontrolu

Hover sarmalanirken `:focus` veya `:active`'in yanlislikla media query icine alinmadigi dogrulanmali:

```bash
grep -A2 '@media (hover: hover)' src/scss/**/*.scss resources/scopes/css/frontstore/**/*.scss | grep ':focus\|:active'
```

Eger `:focus` veya `:active` media query icindeyse, disari cikarilmali — klavye/dokunmatik erisilebilirlik icin gerekli.

### 5. Hover + State Birlesimi Kontrolu

`:hover` ile BEM modifier veya JS state class'inin ayni rule'da birlestirilip birlestirilmedigi kontrol edilmeli:

```bash
# &:hover, &--modifier veya &:hover, &.state seklindeki birlesimler
grep -B1 -A1 ':hover' src/scss/**/*.scss resources/scopes/css/frontstore/**/*.scss | grep -E '&--[a-z]|&\.[a-z]'
```

Bu birlesimler ayrilmali: `:hover` media query icine, modifier/state disarida kalmali.

### 6. Yorum Icindeki Hover Temizligi

Yorum icinde kalan `:hover` bloklari proje genelinde taranmali; gereksizse silinmeli:

```bash
grep -B2 ':hover' src/scss/**/*.scss resources/scopes/css/frontstore/**/*.scss | grep -E '^\s*/?\*|^\s*//'
```

---

## Yapilmazsa Ne Olur?

| Seviye | Sonuc |
|--------|-------|
| **Kritik** | Navigation dropdown mobilde takili kalir, kullanici baska yere tiklayamaz |
| **Yuksek** | Favori/upvote butonlari dokunduktan sonra renkli kalir — kullanici "aktif mi?" diye karistirir |
| **Orta** | Kart shadow/bg degisimi takili kalir — kirli gorunum |
| **Dusuk** | Link underline/opacity takili kalir — kozmetik |

## Uyum Sorunlari

**Yok.** Bu degisiklik tamamen guvenli:

1. **Geriye uyumlu:** Masaustunde davranis ayni kalir — sadece media query icine tasiniyor
2. **Progresif:** Eski tarayicilar media query'yi anlamazsa hover eskisi gibi calisir (IE11)
3. **Yan etkisiz:** Sadece hover blogu tasinir, baska stil etkilenmez
4. **`:focus` korunmali:** Hover sarmalanirken `:focus` disarida birakilmali (klavye erisim)
5. **Hybrid cihazlar:** Trackpad takiliysa hover calisir, dokunmatikta calismaz — dogru davranis
