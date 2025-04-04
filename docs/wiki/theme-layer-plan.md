# Theme Layer Migration Plani

Renk prefix yenilemesi (Renk Prefix Yenileme).
Layer 4 olarak onerildikten sonra ayri katman fikri reddedildi — Layer 3 (Utility)
icinde prefix degisikligi olarak uygulandi. Dosyalar `base/` → `theme/` klasorune
tasindi ancak bu bir SCSS organizasyonu, ayri bir rsBEM katmani degil.

---

## Karar Ozeti

| Karar | Sonuc |
|-------|-------|
| Katman | Layer 3 icinde prefix yenileme (ayri katman reddedildi) |
| Text color prefix | `tc-` (theme color) |
| Background prefix | `tbc-` (theme background color) |
| Marka renkleri | `theme-1/2/3` → `pri/sec/ter` |
| `--f` suffix | Aynen kalacak (fixed, dark mode'da degismez) |
| Dosya konumu | `base/_colors-*.scss` → `theme/*.scss` |
| SCSS degisken | `$color-theme-1-*` → `$color-pri-*` (`color-` prefix korunur) |
| CSS custom property | `--color-theme-1-*` → `--color-pri-*` (`color-` prefix korunur) |
| Dosya isimleri | `colors-` prefix korunur |

---

## Prefix Donusum Tablosu

### Class Prefix Degisiklikleri

| Eski | Yeni | Ornek |
|------|------|-------|
| `.color-theme-1-*` | `.tc-pri-*` | `color-theme-1-500` → `tc-pri-500` |
| `.color-theme-2-*` | `.tc-sec-*` | `color-theme-2-300` → `tc-sec-300` |
| `.color-theme-3-*` | `.tc-ter-*` | `color-theme-3-700` → `tc-ter-700` |
| `.bg-theme-1-*` | `.tbc-pri-*` | `bg-theme-1-500` → `tbc-pri-500` |
| `.bg-theme-2-*` | `.tbc-sec-*` | `bg-theme-2-100` → `tbc-sec-100` |
| `.bg-theme-3-*` | `.tbc-ter-*` | `bg-theme-3-900` → `tbc-ter-900` |
| `.color-danger-*` | `.tc-danger-*` | `color-danger-500` → `tc-danger-500` |
| `.color-warning-*` | `.tc-warning-*` | `color-warning-500` → `tc-warning-500` |
| `.color-safe-*` | `.tc-safe-*` | `color-safe-500` → `tc-safe-500` |
| `.color-notice-*` | `.tc-notice-*` | `color-notice-500` → `tc-notice-500` |
| `.color-caution-*` | `.tc-caution-*` | `color-caution-500` → `tc-caution-500` |
| `.bg-danger-*` | `.tbc-danger-*` | `bg-danger-500` → `tbc-danger-500` |
| `.bg-warning-*` | `.tbc-warning-*` | benzer |
| `.bg-safe-*` | `.tbc-safe-*` | benzer |
| `.bg-notice-*` | `.tbc-notice-*` | benzer |
| `.bg-caution-*` | `.tbc-caution-*` | benzer |
| `.color-grey-*` | `.tc-grey-*` | `color-grey-500` → `tc-grey-500` |
| `.bg-grey-*` | `.tbc-grey-*` | `bg-grey-100` → `tbc-grey-100` |
| `.bg-transparent` | `.tbc-transparent` | |
| `.color-text-dark-*` | `.tc-text-dark-*` | `color-text-dark-1` → `tc-text-dark-1` |
| `.color-text-light-*` | `.tc-text-light-*` | `color-text-light-1` → `tc-text-light-1` |
| `.color-text-white` | `.tc-text-white` | |
| `.color-text-black` | `.tc-text-black` | |
| `.color-link-blue-dark` | `.tc-link-blue-dark` | |
| `.color-blue-*` | `.tc-blue-*` | `color-blue-500` → `tc-blue-500` |
| `.bg-blue-*` | `.tbc-blue-*` | `bg-blue-500` → `tbc-blue-500` |
| (ayni pattern: sky, teal, emerald, amber, orange, rose, pink, purple, violet, slate, gray) |||
| `--f` suffix | aynen | `tc-pri-500--f`, `tbc-grey-100--f` |
| backward compat alias | aynen | `tc-blue-light`, `tbc-blue-dark` |

### Degisen Seyler (tema renkleri icin)
- SCSS degiskenleri: `$color-theme-1-500` → `$color-pri-500`
- CSS custom property: `--color-theme-1-500` → `--color-pri-500`
- Component SCSS'lerindeki `var(--color-theme-1-*)` → `var(--color-pri-*)`
- `color-` prefix her yerde korunur, sadece `theme-1/2/3` → `pri/sec/ter` kisaltmasi

### Degismeyen Seyler
- `color-` prefix (degisken, property, dosya isimlerinde)
- Interaction/grey/text/accent renk isimleri (danger, grey, text-dark, blue vb.)

---

## Dosya Yapisi Degisikligi

### Sadrazam — Onceki
```
scss/base/
  _colors-main.scss       → white, black, action, logo, backdrop
  _colors-theme.scss      → pri/sec/ter + utility class'lar
  _colors-interaction.scss → danger/warning/safe/notice/caution + utility class'lar
  _colors-grey.scss       → grey scale + utility class'lar
  _colors-text.scss       → text + link renkleri + utility class'lar
  _colors-accent.scss     → 12 accent palette + utility class'lar
```

### Sadrazam — Sonraki
```
scss/theme/
  _colors-main.scss          → white, black, action, logo, backdrop
  _colors-pri.scss           → primary palette (eski theme-1)
  _colors-sec.scss           → secondary palette (eski theme-2)
  _colors-ter.scss           → tertiary palette (eski theme-3)
  _colors-interaction.scss   → danger, warning, safe, notice, caution
  _colors-grey.scss          → grey scale
  _colors-text.scss          → text + link renkleri
  _colors-accent.scss        → 12 accent palette (blue, sky, teal, ...)
```

> NOT: `main.scss` master import dosyasinda `@use` siralama guncellenmeli.

---

## Migration Fazlari

### Faz 0: Hazirlik (Sadrazam-only, risk yok)
- [x] `scss/theme/` klasorunu olustur
- [x] Dosyalari `base/` → `theme/` tasi (`colors-` prefix korunur)
- [x] `_colors-theme.scss` → 3 dosyaya bol: `_colors-pri.scss`, `_colors-sec.scss`, `_colors-ter.scss`
- [x] `theme-1/2/3` → `pri/sec/ter` isim degisikligi: SCSS degisken + CSS variable + dark mode swap
- [x] `main.scss` import siralamasini guncelle
- [x] Build test (webpack dev)

### Faz 1: Sadrazam Class Rename (Sadrazam-only)
- [x] Theme dosyalarindaki utility class'lari yeniden adlandir:
  - `color-*` → `tc-*`
  - `bg-*` → `tbc-*`
  - `theme-1/2/3` → `pri/sec/ter`
- [x] `dev/index.html` referanslarini guncelle
- [x] Build test + gorusel kontrol

### Faz 2: Sadrazam Component Referanslari
- [x] Component SCSS'lerinde `var(--color-theme-1-*)` → `var(--color-pri-*)` guncelle
- [x] Ayni sekilde `theme-2` → `sec`, `theme-3` → `ter`
- [x] Eger component SCSS'lerinde utility class referansi varsa guncelle
- [x] Build test

### Faz 3: Dukkan Template Migration (Yuksek hacim)
- [x] Tum `.tpl` dosyalarinda class rename:
  - `color-theme-1-*` → `tc-pri-*`
  - `bg-theme-1-*` → `tbc-pri-*`
  - (tum kategoriler icin)
- [x] Tahmini etki: 200+ dosya

### Faz 4: Dukkan SCSS/JS Migration
- [x] Dukkan scope SCSS dosyalarinda class referanslari
- [x] Dukkan JS dosyalarinda classList referanslari
- [x] Build test

### Faz 5: Dokumantasyon
- [x] rsBEM README.md — `tc-`/`tbc-` prefix'lerini prefix tablosuna ekle (Layer 4 bolumu eklenmedi, karar degisti)
- [x] rsBEM decisions.md — theme layer karari
- [x] rsBEM prefix-table.md — `color-`/`bg-` cikar, `tc-`/`tbc-` ekle
- [x] Sadrazam CLAUDE.md guncelle
- [x] Dukkan CLAUDE.md + coding-standards.md guncelle

---

## Etki Analizi (Tahmini)

| Alan | Dosya sayisi | Not |
|------|-------------|-----|
| Sadrazam theme SCSS | 6 dosya | Dosya tasi + class rename |
| Sadrazam component SCSS | ~5 dosya | Sadece utility class referanslari varsa |
| Sadrazam dev/index.html | 1 dosya | Demo sayfasi |
| Dukkan TPL | ~200+ dosya | `color-*` / `bg-*` class kullanimi |
| Dukkan scope SCSS | ~30+ dosya | Icerideki class referanslari |
| Dukkan scope JS | ~5-10 dosya | classList ile renk toggle eden yerler |
| Dokumantasyon | ~8 dosya | Spec + proje docs |

---

## Onemli Notlar

1. **CSS custom property'ler tema renkleri icin degisiyor** — `var(--color-theme-1-500)` → `var(--color-pri-500)`. Diger renk gruplari (interaction, grey, text, accent) icin property isimleri aynen kalir.
2. **Backward compat alias'lar** (accent `light/dark`) prefix degisikligine dahil: `color-blue-light` → `tc-blue-light`
3. **`--f` suffix** tum yeni isimlerde korunur: `tc-pri-500--f`, `tbc-grey-100--f`
4. **`bg-transparent`** → `tbc-transparent`
5. **Faz 3 en riskli** — Dukkan TPL'lerinde yuzlerce dosya etkilenir, dikkatli sed/replace gerekir
