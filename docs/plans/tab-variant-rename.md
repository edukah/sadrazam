# Tab Varyant Rename Plani ✅ TAMAMLANDI

Tab bileseninin versiyon numarali block isimleri (`tabv2`, `tabv3`, `tabv4`) anlamli BEM block isimlerine tasindi.
Her varyant kendi block'u olur — ic ice kullanimda scope cakismasi olmaz.

---

## Isimlendirme Haritasi

| Eski Block | Yeni Block | Aciklama |
|------------|------------|----------|
| `tab__*` | `tab-classic__*` | v1: Klasik, ust border |
| `tabv2__*` | `tab-card__*` | Kart gorunumlu, kucuk ekranda wrap |
| `tabv3__*` | `tab-scroll__*` | Kart gorunumlu, kucuk ekranda yatay scroll |
| `tabv4__*` | `tab-capsule__*` | Yuvarlak koseli, dolgulu arka planli aktif tab |

## Class Donusum Tablosu

### tab → tab-classic

| Eski | Yeni |
|------|------|
| `tab__container` | `tab-classic__container` |
| `tab__heading` | `tab-classic__heading` |
| `tab__head` | `tab-classic__head` |
| `tab__body` | `tab-classic__body` |
| `tab__panel` | `tab-classic__panel` |

### tabv2 → tab-card

| Eski | Yeni |
|------|------|
| `tabv2__container` | `tab-card__container` |
| `tabv2__heading` | `tab-card__heading` |
| `tabv2__head` | `tab-card__head` |
| `tabv2__body` | `tab-card__body` |
| `tabv2__panel` | `tab-card__panel` |

### tabv3 → tab-scroll

| Eski | Yeni |
|------|------|
| `tabv3__container` | `tab-scroll__container` |
| `tabv3__heading` | `tab-scroll__heading` |
| `tabv3__head` | `tab-scroll__head` |
| `tabv3__body` | `tab-scroll__body` |
| `tabv3__panel` | `tab-scroll__panel` |

### tabv4 → tab-capsule

| Eski | Yeni |
|------|------|
| `tabv4__container` | `tab-capsule__container` |
| `tabv4__heading` | `tab-capsule__heading` |
| `tabv4__head` | `tab-capsule__head` |
| `tabv4__body` | `tab-capsule__body` |
| `tabv4__panel` | `tab-capsule__panel` |
| `tabv4__panel--neutral` | `tab-capsule__panel--neutral` |
| `tabv4__panel--inner` | `tab-capsule__panel--inner` |

---

## Etkilenen Dosyalar

### Sadrazam (kaynak)

| Dosya | Icerik |
|-------|--------|
| `src/scss/modules/tabs.scss` | Tum varyant tanimlari |
| `src/js/modules/tabs.js` | querySelector (satir 38) |
| `docs/tabs.html` | HTML ornekleri |
| `dev/index.html` | Gelistirme sayfasi |

### Dukkan (tuketici)

| Dosya | Varyant | Islem |
|-------|---------|-------|
| `templates/admin/product/product_form.tpl` | tabv3 + tabv2 (ic ice) | Rename |
| `templates/admin/product/category_form.tpl` | tabv3 + tabv2 (ic ice) | Rename |
| `templates/frontstore/product/detail.tpl` | tabv4 | Rename |
| `resources/scopes/css/frontstore/product/detail.scss` | `.tab__container` override (satir 230) | `.tab-capsule__container` olacak |
| `resources/scopes/css/frontstore/product/review.scss` | Yorum: `tabv4__panel` referansi | Yorum guncelle |

### Dukkan v1 tab dosyalari (`tab__*` → `tab-classic__*`)

| Dosya | Islem |
|-------|-------|
| `templates/admin/setting/setting_form.tpl` | Rename |
| `templates/admin/customer/info.tpl` | Rename |
| `templates/admin/store/store_form.tpl` | Rename |
| `templates/admin/customer/customer_form.tpl` | Rename |

### Etkilenmeyen dosyalar (dogrulama icin)

| Dosya | Neden |
|-------|-------|
| Bikonuvar `icon-tab__*` | Farkli bilesen, Sadrazam tab'iyla ilgisiz |
| Dukkan `checkout-summarytab__*` | Layer 1 template class, tab bileseninden bagimsiz |
| Burtest | Tab kullanmiyor |

---

## JS Degisikligi

`tabs.js` satir 38'deki querySelector guncellenmeli:

```js
// Eski
document.querySelectorAll(
  'div[class*="tabv4__heading"], div[class*="tabv3__heading"], div[class*="tabv2__heading"], div[class*="tab__heading"]'
);

// Yeni
document.querySelectorAll(
  '.tab-capsule__heading, .tab-scroll__heading, .tab-card__heading, .tab-classic__heading'
);
```

---

## Uygulama Adimlari

### Adim 1: Sadrazam SCSS (tabs.scss)
1. `tab__*` → `tab-classic__*` rename
2. `tabv2__*` → `tab-card__*` rename
3. `tabv3__*` → `tab-scroll__*` rename
4. `tabv4__*` → `tab-capsule__*` rename
5. `npm run build` ile dogrula

### Adim 2: Sadrazam JS (tabs.js)
1. querySelector'i guncelle
2. `npm run build` ile dogrula

### Adim 3: Sadrazam Docs
1. `docs/tabs.html` orneklerini guncelle
2. `dev/index.html` orneklerini guncelle

### Adim 4: Dukkan TPL + SCSS
1. v1 tab dosyalari: `tab__*` → `tab-classic__*` (setting_form, info, store_form, customer_form)
2. `product_form.tpl`: `tabv3__*` → `tab-scroll__*`, `tabv2__*` → `tab-card__*`
3. `category_form.tpl`: `tabv3__*` → `tab-scroll__*`, `tabv2__*` → `tab-card__*`
4. `detail.tpl`: `tabv4__*` → `tab-capsule__*`
5. `detail.scss`: `.tab__container` → `.tab-capsule__container`
6. `review.scss`: yorum guncelle

### Adim 5: Dogrulama
1. Sadrazam: `npm run build`
2. Dukkan: `npm run build`
3. Dukkan admin: product_form, category_form tab'lari gorsel kontrol
4. Dukkan frontstore: detail sayfasi tab'lari gorsel kontrol

### Adim 6: Commit
```
refactor(tabs): rename tab blocks to semantic BEM names

tab__*   → tab-classic__*
tabv2__* → tab-card__*
tabv3__* → tab-scroll__*
tabv4__* → tab-capsule__*
```

---

## Neden Modifier Degil Ayri Block?

Dukkan'da `product_form.tpl` ve `category_form.tpl`'de tabv3 icinde tabv2 ic ice kullaniliyor.
Eger varyantlar modifier olsaydi (`tab__container--card-wrap` icinde `tab__container--card-scroll`),
dis tab'in SCSS descendant selector'lari ic tab'in element'lerini de yakalardi (scope leak).
Ayri block isimleri (`tab-card__head` vs `tab-scroll__head`) bu sorunu tamamen ortadan kaldirir.
