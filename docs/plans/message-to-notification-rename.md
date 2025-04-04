# Message → Snackbar Rename

**Amaç:** `Message` modül/class ismini `Snackbar` olarak yeniden adlandırmak.

**Neden Snackbar?** Material Design'dan gelen, kısa ömürlü toast bildirimlerini ifade eden sektörel terim. Soyut isim olması sayesinde hem popup (toast) hem inline (statik) kullanımı kapsıyor. Görsel olarak da bileşenin ekrandan kayarak çıkma davranışına benziyor.

**Kapsam:**
- Sadrazam: JS class, CSS class'lar, dosya isimleri, docs, README
- Dükkan: ~157 JS dosyası, 6 TPL dosyası, 1 SCSS dosyası

**Değişenler:**
- `src/js/modules/message.js` → `snackbar.js`
- `src/scss/modules/snackbar.scss` (class'lar `.snackbar__*`)
- JS class: `Message` → `Snackbar`
- CSS: `.message__*` → `.snackbar__*`
- API: `Sadrazam.Message.insert()` → `Sadrazam.Snackbar.insert()`
- Z-index token: `--z-toast-notification` değişmedi
- `ModalMessage` → `Toast` (aynı session'da yapıldı, aşağıya bkz.)
- Docs: `messages.html` → `snackbar.html`, tüm nav linkler güncellendi

**Durum: Tamamlandı (2026-03-10)**

Yapılan değişiklikler:
- Sadrazam: JS modül, SCSS, index.js, ajax.js, form.js, document.js, main.scss, help.json, README.md
- Sadrazam docs: 25 HTML dosyasında nav linkler + messages.html → snackbar.html
- Sadrazam dev: dev/index.html güncellemesi
- Dükkan: 91 JS dosyasında 157 API çağrısı, 6 TPL dosyasında CSS class'ları, 1 SCSS dosyası, 3 inline JS

---

## ModalMessage → Toast Rename

**Amaç:** `ModalMessage` modül/class ismini `Toast` olarak yeniden adlandırmak.

**Neden Toast?** Tost makinasından ekmek fırlar gibi — açılır, mesajı iletir, kapanır. Modal-based, timed, dismiss butonu var. Snackbar ile net ayrım: Snackbar yatay/renkli/inline+popup, Toast modal-based popup.

**Kapsam:**
- Sadrazam: JS class, SCSS, dosya isimleri, docs, README
- Dükkan: 4 JS, 5 TPL, 1 SCSS, 3 docs

**Değişenler:**
- `src/js/modules/modal-message.js` → `toast.js`
- `src/scss/modules/modal-message.scss` → `toast.scss`
- JS class: `ModalMessage` → `Toast`
- CSS: `modal__notification-list` → `toast__list`, `modal__dismiss` → `toast__dismiss`
- API: `Sadrazam.ModalMessage.insert()` → `Sadrazam.Toast.insert()`
- Data attribute: `data-toggle="modal-message"` → `data-toggle="toast"`
- `modal__body--sm/md/lg` — değişmedi (modal element modifierleri)

**Durum: Tamamlandı (2026-03-10)**
