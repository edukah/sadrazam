# Bug + Refactor: Modal.insert() dönüş değeri + getInstance()

## Bug

```
Cannot read properties of undefined (reading 'close')
```

- **Sayfa:** `https://dukkan.dev/teslimat-bilgileri`
- **Route:** `account/address/edit?customer_address_id=140`
- **Konum:** `resources/scopes/js/frontstore/checkout/address_form_modal.js`

`address_form_modal.js`'de `addressFormModal.__modal.close()` çağrılıyor ama `Modal.insert()` instance döndürüyordu, `__modal` property'si instance'ta değil DOM element'te.

## Geçici Düzeltme (yapıldı)

`Modal.insert()` şu an DOM element döndürüyor (`instance.#modalElement`). Bu sayede `element.__modal.close()` çalışıyor. Ama bu geçici — aşağıdaki refactor yapılmalı.

## Planlanan Refactor

### 1. insert() instance dönsün

`Modal.insert()` **instance** döndürmeli. İki erişim yolu açık olacak:

- **Instance üzerinden** → `modal.close()`, `modal.querySelector()`
- **DOM element üzerinden** → `element.__modal.close()` (DOM traversal)

```js
static insert (options = {}) {
  return new this(options);  // instance döner
}
```

### 2. getInstance() eklensin

Herhangi bir child element'ten modal instance'ına erişim sağlar. `closest()` ile parent'a çıkar, `__modal` ile instance'ı döndürür.

```js
static getInstance (element) {
  return element?.closest('.modal')?.__modal;
}
```

### 3. closeClosest() kaldırılsın

`getInstance()` ile gereksiz hale gelir:

```js
// Eski — sadece close yapabiliyordu
Modal.closeClosest(button);

// Yeni — instance'a tam erişim
Modal.getInstance(button)?.close();
```

Dükkan'da `closeClosest` kullanılan yerler `getInstance()?.close()` olarak güncellenir.

### Kullanım senaryoları:

```js
// 1. insert() ile instance al, direkt kullan
const modal = Modal.insert({ content: html });
modal.close();
modal.querySelector('.btn');

// 2. Herhangi bir child'dan instance'a eriş
Modal.getInstance(submitButton)?.close();

// 3. DOM traversal ile __modal (low-level, mevcut pattern korunuyor)
element.closest('.modal').__modal.close();
```

### Dükkan'da güncellenecek dosyalar:

**insert() dönüş değeri:**

| Dosya | Şu an | Refactor sonrası |
|-------|-------|-----------------|
| `checkout/address_form_modal.js:6` | `addressFormModal.__modal.close()` | `addressFormModal.close()` |
| `checkout/address_form_modal.js:22` | `addressFormModal.__modal.close()` | `addressFormModal.close()` |
| `sale/order.js:68` | `modalInstance.querySelector(...)` | Değişiklik yok |

**closeClosest() → getInstance():**

Dükkan'da `Modal.closeClosest` kullanan yerler aranıp `Modal.getInstance(el)?.close()` olarak güncellenecek.

### __instance pattern (Sadrazam geneli)

Tüm modüller DOM element'lerine instance referansı atıyor — bu pattern korunacak:

| Modül | Property |
|-------|----------|
| Modal | `element.__modal` |
| Tooltip | `element.__tooltip` |
| Popover | `element.__popover` |
| Tabs | `element.__tabs` |
| SlideMenu | `element.__slideMenu` |
| Hovermenu | `element.__hovermenu` |
| Autocomplete | `element.__autocomplete` |

Diğer modüllere de `getInstance()` eklenebilir (opsiyonel, ihtiyaç oldukça).

## Sektörel Analiz — Instance vs DOM Element Dönüşü

8 kriter × 10 puan = **80 maksimum puan**. İki yaklaşım karşılaştırıldı:

### Approach A: `insert()` instance döndürür + `getInstance()` (66/80 — %82.5)

| Kriter | Puan | Açıklama |
|--------|------|----------|
| API Tutarlılığı | 9 | `modal.close()` — doğrudan, ara katman yok |
| Keşfedilebilirlik | 9 | IDE autocomplete çalışır, metodlar görünür |
| Kapsülleme | 8 | DOM detayı gizli, public API temiz |
| Hata Riski | 8 | `undefined` hatası düşük — instance doğrudan erişim |
| Sektör Uyumu | 9 | Bootstrap 5, Tippy.js, SweetAlert2 hepsi instance döndürür |
| Geriye Uyumluluk | 7 | `__modal` pattern'i korunuyor, iki erişim yolu açık |
| Esneklik | 8 | `getInstance(child)` ile herhangi bir child'dan erişim |
| Öğrenme Eğrisi | 8 | Standart OOP pattern, tanıdık |

### Approach B: `insert()` DOM element döndürür + `element.__modal` (49/80 — %61.3)

| Kriter | Puan | Açıklama |
|--------|------|----------|
| API Tutarlılığı | 5 | Her erişimde `.__modal` yazmak gerekiyor |
| Keşfedilebilirlik | 4 | Dynamic property, IDE desteği yok |
| Kapsülleme | 5 | DOM element doğrudan expose ediliyor |
| Hata Riski | 6 | `.__modal` unutulursa `undefined` hatası |
| Sektör Uyumu | 4 | Bu pattern'i kullanan büyük kütüphane yok |
| Geriye Uyumluluk | 9 | Mevcut durum, değişiklik gerektirmiyor |
| Esneklik | 8 | DOM API'si doğrudan kullanılabilir |
| Öğrenme Eğrisi | 8 | DOM bilgisi yeterli |

### Karar

**Approach A** seçildi. 80 üzerinden daha yüksek puan mümkün değil — A zaten en yüksek puanı alan yaklaşım. Sektör standardı (Bootstrap 5, Tippy.js, SweetAlert2) bu yönde.

## Kapsam — Tüm Sadrazam Modülleri

Bu refactor sadece Modal ile sınırlı değil. Aynı pattern tüm Sadrazam modüllerine ve bunları kullanan Dükkan JS dosyalarına uygulanacak:

1. **Her modülün factory metodu instance döndürecek** (Modal.insert, Tooltip.init, vb.)
2. **Her modüle `getInstance(element)` eklenecek** — child element'ten instance'a erişim
3. **`__instance` DOM property pattern'i korunacak** — low-level erişim yolu açık kalacak

| Modül | Factory Metod | `getInstance()` | DOM Property |
|-------|--------------|-----------------|--------------|
| Modal | `insert()` | eklenecek | `__modal` |
| Tooltip | `init()` | eklenecek | `__tooltip` |
| Popover | `init()` | eklenecek | `__popover` |
| Tabs | `init()` | eklenecek | `__tabs` |
| SlideMenu | `init()` | eklenecek | `__slideMenu` |
| Hovermenu | `init()` | eklenecek | `__hovermenu` |
| Autocomplete | `init()` | eklenecek | `__autocomplete` |

### Diğer Kütüphaneler

| Proje | `__instance` Pattern | Property | `getInstance()` |
|-------|---------------------|----------|-----------------|
| Minyatur | Var | `element.__minyatur` | eklenecek |
| Yazman | Var | `container.__yazman`, `domNode.__detail` | editor seviyesinde eklenecek (`__yazman`) |
| Kaysa | Yok — eklenecek | `element.__kaysa` | eklenecek |

Kaysa'da `__instance` pattern'i hiç kullanılmamış — constructor'da `this.#container.__kaysa = this;` eklenerek diğer modüllerle aynı seviyeye getirilecek.

Dükkan (ve diğer projeler: Bikonuvar, Burtest) tarafında bu modülleri kullanan JS dosyaları da güncellenecek.

## Durum

**Tamamlandı (2026-03-09)**

Yapılan değişiklikler:
- Sadrazam: 7 modüle `getInstance()` eklendi, `Modal.insert()` instance döndürüyor, `closeClosest()` kaldırıldı
- Kaysa: `__kaysa` DOM property + `getInstance()` eklendi
- Minyatur: `getInstance()` eklendi
- Yazman: `getInstance()` eklendi
- Dükkan: Tüm consumer dosyaları güncellendi (8 dosya, `closeClosest` → `getInstance`, `.__modal` → direkt `.close()`)

**Ek Standardizasyon (2026-03-10):**
- Instance storage: `__tabsInstance` → `__tabs`, `.infiniteScroll` → `.__infiniteScroll`
- `destroy()` metodu tüm instance-bazlı modüllere eklendi (sektör konvansiyonu)
- Popover: `remove()` → `destroy()`, resize fix, `#isVisible` state tracking
