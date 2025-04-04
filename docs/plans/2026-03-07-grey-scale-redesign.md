# Grey Scale Redesign Implementation Plan

> **Durum: TAMAMLANDI** (Phase 1–4 tamamlandı. Bikonuvar/Burtest grey taraması henüz yapılmadı.)

**Goal:** Grey skalasini esit aralikli (13 birim) yeniden tasarla, text renklerini grey'e bagla, dark mode swap'i simetriklestir.

**Architecture:** Mevcut grey degerleri degisiyor, yeni ara kademeler ekleniyor. Tum projelerdeki grey referanslari esleme tablosuna gore guncelleniyor. Text renkleri grey variable'larina baglanarak tek kaynak haline getiriliyor.

**Tech Stack:** SCSS (Dart Sass), CSS Custom Properties

---

## Yeni Skala

Her adim **13 RGB birimi**. Toplam 20 kademe (+ zero).

```
Kademe   RGB    Eski RGB   Fark    Dark Mode Swap
------   ---    --------   ----    --------------
zero     255    255          0     <-> 900
  50     250    250          0     <-> 850
 100     237    245         -8     <-> 800
 150     224    (yeni)       —     <-> 750
 200     211    235        -24     <-> 700
 250     198    (yeni)       —     <-> 650
 300     185    224        -39     <-> 600
 350     172    (yeni)       —     <-> 550
 400     159    204        -45     <-> 500
 450     146    (yeni)       —     <-> 450 (midpoint)
 500     133    160        -27     <-> 400
 550     120    (yeni)       —     <-> 350
 600     107    125        -18     <-> 300
 650      94    (yeni)       —     <-> 250
 700      81    90          -9     <-> 200
 750      68    75          -7     <-> 150
 800      55    55           0     <-> 100
 850      42    46          -4     <->  50
 900      29    35          -6     <-> zero
 910      23    (yeni)       —     (text-dark-1 karsiligi, swap: yok)
 950      16    (yeni)       —     (dogal 13-birim devami, swap: yok)
```

**Dark mode swap kurali:** N <-> (900 - N + 50). Ornegin: 50<->850, 100<->800, 150<->750...
**Midpoint:** grey-450 (146) her iki modda da ayni deger.
**grey-870 silinir:** grey-850 (42) ayni degeri kapsar.
**grey-910 ve grey-950:** Text renk eslemesi ve dogal skala devami icin eklendi. Dark mode swap'a dahil degil (text renkleri kendi swap mekanizmasina sahip).

## Text Renk Hizalamasi

Text renkleri grey kademelerine baglanarak tek kaynak olacak. Grey skalasi degismiyor, text renkleri grey'e uyduruluyor:

```
Text Degiskeni    Eski RGB   Yeni RGB   Grey Karsiligi    Not
--------------    --------   --------   --------------    ---
text-dark-1          23         23      grey-910          yeni kademe eklendi (tam eslesme)
text-dark-2          80         81      grey-700          1 birim yukari (80->81, gorunmez fark)
text-dark-3         132        133      grey-500          1 birim yukari (132->133, gorunmez fark)
text-dark-4         185        185      grey-300          tam eslesme, degisiklik yok
```

**Kural:** Grey skalasi 13-birim adimlarini korur, text renkleri skalaya uyar (tersi degil).

Dark theme text renkleri saf gri degil (RGB esit degil), bu yuzden grey skalasina baglanamaz. Bagimsiz kalir.

## Esleme Tablosu (Mevcut -> Yeni)

Mevcut grey referanslarinin hangi yeni kademeye eslenecegi (en yakin RGB degerine gore):

```
Eski Kademe (RGB)   ->   Yeni Kademe (RGB)   RGB Kaymasi
-----------------        -----------------    -----------
grey-50  (250)      ->   grey-50  (250)          0
grey-100 (245)      ->   grey-100 (237)         -8  (veya grey-50 ile birlestir)
grey-200 (235)      ->   grey-100 (237)         +2  (!)
grey-300 (224)      ->   grey-150 (224)          0  (tam eslesme)
grey-400 (204)      ->   grey-250 (198)         -6
grey-500 (160)      ->   grey-400 (159)         -1
grey-600 (125)      ->   grey-550 (120)         -5
grey-700 (90)       ->   grey-650 (94)          +4
grey-750 (75)       ->   grey-750 (68)          -7
grey-800 (55)       ->   grey-800 (55)           0
grey-850 (46)       ->   grey-850 (42)          -4
grey-870 (42)       ->   grey-850 (42)           0
grey-900 (35)       ->   grey-900 (29)          -6
```

**Dikkat:** Eski grey-100 (245) ve grey-200 (235) ikisi de yeni grey-100'e (237) yakin.
Dosya dosya kontrol edilmeli — bazi grey-100'ler grey-50'ye, bazi grey-200'ler grey-100'e eslenebilir.

---

## Phase 0: Hazirlik

### Task 0.1: Mevcut grey kullanim haritasi cikar

**Amac:** Hangi dosyada hangi grey kademesi hangi amacla kullaniliyor belgele.

**Kapsam:**
- Sadrazam: 18 dosya, ~190 referans (theme dosyasi haric)
- Dukkan: 81 dosya, ~259 referans
- Bikonuvar: taranmadi (sonra)

**Cikti:** Her dosya icin esleme tablosu (eski -> yeni kademe + gorsel kontrol notu)

---

## Phase 1: Sadrazam — Skala Tanimlari

### Task 1.1: _colors-grey.scss yeniden yaz

**Files:**
- Modify: `src/scss/theme/_colors-grey.scss`

**Degisiklikler:**

1. SCSS degiskenleri guncelle (20 kademe + zero):
```scss
/** Grey Scale (esit aralikli: 13 birim, simetrik dark mode swap) **/
$color-grey-50: rgba(250, 250, 250, 1);
$color-grey-100: rgba(237, 237, 237, 1);
$color-grey-150: rgba(224, 224, 224, 1);
$color-grey-200: rgba(211, 211, 211, 1);
$color-grey-250: rgba(198, 198, 198, 1);
$color-grey-300: rgba(185, 185, 185, 1);
$color-grey-350: rgba(172, 172, 172, 1);
$color-grey-400: rgba(159, 159, 159, 1);
$color-grey-450: rgba(146, 146, 146, 1);
$color-grey-500: rgba(133, 133, 133, 1);
$color-grey-550: rgba(120, 120, 120, 1);
$color-grey-600: rgba(107, 107, 107, 1);
$color-grey-650: rgba(94, 94, 94, 1);
$color-grey-700: rgba(81, 81, 81, 1);
$color-grey-750: rgba(68, 68, 68, 1);
$color-grey-800: rgba(55, 55, 55, 1);
$color-grey-850: rgba(42, 42, 42, 1);
$color-grey-900: rgba(29, 29, 29, 1);
$color-grey-910: rgba(23, 23, 23, 1);
$color-grey-950: rgba(16, 16, 16, 1);
/** End of Grey Scale **/
```

2. CSS custom properties guncelle (adaptive + fixed)
3. Dark mode swap tablosu yeniden yaz (simetrik):
```scss
body.dark-mode {
  --color-grey-zero: #{$color-grey-900};
  --color-grey-50: #{$color-grey-850};
  --color-grey-100: #{$color-grey-800};
  --color-grey-150: #{$color-grey-750};
  --color-grey-200: #{$color-grey-700};
  --color-grey-250: #{$color-grey-650};
  --color-grey-300: #{$color-grey-600};
  --color-grey-350: #{$color-grey-550};
  --color-grey-400: #{$color-grey-500};
  // grey-450 = midpoint, degismez
  --color-grey-500: #{$color-grey-400};
  --color-grey-550: #{$color-grey-350};
  --color-grey-600: #{$color-grey-300};
  --color-grey-650: #{$color-grey-250};
  --color-grey-700: #{$color-grey-200};
  --color-grey-750: #{$color-grey-150};
  --color-grey-800: #{$color-grey-100};
  --color-grey-850: #{$color-grey-50};
  --color-grey-900: #{$color-white};
  // grey-910, grey-950: dark mode swap'a dahil degil
  // (text renkleri kendi swap mekanizmasini kullanir)
}
```

4. Utility class'lari guncelle (.tbc-grey-*, adaptive + fixed)
5. grey-870 tamamen kaldir
6. Yeni kademeler icin utility class'lari ekle (150, 250, 350, 450, 550, 650, 910, 950)

**Commit:** `refactor(colors): redesign grey scale with even 13-unit intervals`

### Task 1.2: _colors-text.scss — text renklerini grey'e bagla

**Files:**
- Modify: `src/scss/theme/_colors-text.scss`

**Degisiklikler:**

```scss
/*** Light Theme Text Colors ***/
$color-text-dark-1: $color-grey-910;   // 23 (eski: rgba(23,23,23,1) — ayni deger)
$color-text-dark-2: $color-grey-700;   // 81 (eski: rgba(80,80,80,1) — 1 birim yukari)
$color-text-dark-3: $color-grey-500;   // 133 (eski: rgba(132,132,132,1) — 1 birim yukari)
$color-text-dark-4: $color-grey-300;   // 185 (eski: rgba(185,185,185,1) — ayni deger)
/*** End of Light Theme Text Colors ***/
```

Dark theme text renkleri icin:
```scss
/*** Dark Theme Text Colors — grey'e baglanamaz (RGB esit degil, bagimsiz kalir) ***/
$color-text-light-1: rgba(235, 231, 222, 1);
$color-text-light-2: rgba(200, 195, 184, 1);
$color-text-light-3: rgba(165, 158, 165, 1);
$color-text-light-4: rgba(123, 123, 123, 1);
```

**Commit:** `refactor(colors): link text colors to grey scale variables`

---

## Phase 2: Sadrazam — Grey Referanslarini Guncelle

### Task 2.1: Esleme tablosuna gore toplu guncelleme

**Kapsam:** 17 dosya (theme haric), ~110 referans

**Esleme (mekanik find-replace):**
```
var(--color-grey-870)  ->  var(--color-grey-850)     (5 yer: tooltip)
$color-grey-870        ->  $color-grey-850            (varsa)
```

**Dikkat gerektiren eslemeler (dosya dosya gorsel kontrol):**
```
var(--color-grey-100)  ->  grey-100 (237) mi grey-50 (250) mi?
var(--color-grey-200)  ->  grey-100 (237) mi grey-150 (224) mi?
var(--color-grey-300)  ->  grey-150 (224) mi grey-200 (211) mi?
var(--color-grey-400)  ->  grey-250 (198) mi grey-300 (185) mi?
var(--color-grey-500)  ->  grey-400 (159) mi grey-350 (172) mi?
var(--color-grey-600)  ->  grey-550 (120) mi grey-500 (133) mi?
var(--color-grey-700)  ->  grey-650 (94) mi grey-700 (81) mi?
```

**Yaklasim:** Her dosyayi oku, grey kullaniminin amacini anla (bg, border, text, shadow), en uygun yeni kademeyi sec.

**Dosya listesi:**
1. `src/scss/components/_button.scss` (12 ref)
2. `src/scss/components/_form.scss` (23 ref)
3. `src/scss/components/_mail.scss` (8 ref)
4. `src/scss/components/_form-patterns.scss` (4 ref)
5. `src/scss/components/_switch.scss` (1 ref)
6. `src/scss/layout/_box.scss` (9 ref)
7. `src/scss/utilities/_image.scss` (1 ref)
8. `src/scss/base/_reset.scss` (3 ref)
9. `src/scss/modules/tabs.scss` (14 ref)
10. `src/scss/modules/hovermenu.scss` (7 ref)
11. `src/scss/modules/popover.scss` (9 ref)
12. `src/scss/modules/slide-menu.scss` (5 ref)
13. `src/scss/modules/tooltip.scss` (5 ref)
14. `src/scss/modules/spinner.scss` (4 ref)
15. `src/scss/modules/autocomplete.scss` (3 ref)
16. `src/scss/modules/message.scss` (2 ref)
17. `src/scss/modules/modal.scss` (1 ref)

**Commit:** `refactor(colors): remap grey references to new scale`

### Task 2.2: Build + gorsel kontrol

**Adimlar:**
1. `npm run dev` — dev server'da tum bilesenler kontrol
2. `dev/index.html` sandbox'ta button, form, tabs, modal, tooltip, popover incele
3. `docs/*.html` showcase sayfalari kontrol
4. Sorun varsa kademe ayarla

**Commit:** `fix(colors): adjust grey mappings after visual review`

### Task 2.3: Build + Release

```bash
npm run release
```

**Commit:** `build: rebuild dist for grey scale redesign`

---

## Phase 3: Dukkan — Grey Referanslarini Guncelle

### Task 3.1: Dukkan grey referanslarini guncelle

**Kapsam:** 81 dosya, ~259 referans

**Ayni esleme tablosu kullanilir.** Dosya dosya gorsel kontrol gerekir.

**Oncelik sirasi:**
1. Frontstore common (header, footer, navigation, pagination, home) — kullanici yuzlu
2. Frontstore product (detail, listing, review, filter) — urun sayfalari
3. Frontstore account/checkout — kullanici islemleri
4. Admin common — admin panel
5. Admin diger — admin alt sayfalar

**Commit'ler:** Klasor bazli commit'ler:
- `refactor(frontstore): remap grey references to new scale`
- `refactor(admin): remap grey references to new scale`

### Task 3.2: Dukkan gorsel kontrol

**Adimlar:**
1. Frontstore: anasayfa, urun listesi, urun detay, sepet, checkout
2. Admin: dashboard, siparis listesi, urun formu
3. Sorun varsa kademe ayarla

---

## Phase 4: Dokumantasyon

### Task 4.1: Wiki guncelle

**Files:**
- Create: `docs/wiki/grey-scale.md`
- Modify: `docs/wiki/button-system.md` (grey referanslari)

### Task 4.2: CLAUDE.md guncelle

Grey skala referansi ekle.

---

## Risk Degerlendirmesi

| Risk | Seviye | Aciklama |
|------|--------|----------|
| Gorsel kayma | **Yuksek** | grey-200-400 arasi degerler ciddi degisiyor (24-45 birim) |
| Dark mode bozulma | **Orta** | Swap tablosu tamamen yenileniyor |
| Dukkan uyumsuzluk | **Orta** | 259 referans tek tek kontrol gerektirir |
| Bikonuvar unutulma | **Dusuk** | Ayri bir phase olarak ele alinmali |

## Toplam Is Yuuku

| Faz | Dosya | Referans | Tahmini Zorluk |
|-----|-------|----------|----------------|
| Phase 1 (skala) | 2 | — | Dusuk (mekanik) |
| Phase 2 (Sadrazam) | 17 | ~110 | Orta (gorsel kontrol) |
| Phase 3 (Dukkan) | 81 | ~259 | Yuksek (cok dosya) |
| Phase 4 (docs) | 3 | — | Dusuk |
| **Toplam** | **103** | **~369** | — |
