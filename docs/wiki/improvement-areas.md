# Sadrazam — Eksikler ve Iyilestirme Alanlari

Mevcut puan: 76/100. 90+'a cikarmak icin yapilmasi gerekenler.

---

## ~~Polyfills (gereksiz)~~ ✅ TAMAMLANDI

- `Element.prototype.remove`, `requestAnimFrame`, `getInnerHTML` kaldirildi
- `globalThis` polyfill'i korundu (tuketiciler kullaniyor)

## ~~Error Handling~~ ✅ TAMAMLANDI

- Zorunlu parametre eksik / yanlis tip → `throw Error` (7 modul)
- Element bulunamadi (runtime) → `console.warn` + return (sektorel standart)
- Ayni pattern Minyatur ve Yazman'a da uygulandi

## ~~rsBEM Migration (Faz 1-8)~~ ✅ TAMAMLANDI

- CSS naming convention, state class standardizasyonu, BEM yapisal migration
- Detaylar: `workbench/rsbem/docs/wiki/plans.md`

## ~~JSDoc + help() Tamamlama~~ ✅ TAMAMLANDI

- Tum 29 Sadrazam modulunde help() + JSDoc guncel
- help() metotlarina eksik API bolumleri eklendi (12 modul)
- Tum public metotlara @param/@returns JSDoc eklendi
- Yazman: help.json duzeltme (autosave.counterTiming 5000→36000) + 23 metoda JSDoc
- Minyatur: getInstance() help.json'a eklendi
- Kaysa: getInstance(), scrollbarOptions, is-scrolling eklendi

## ~~Accessibility (a11y)~~ ✅ TAMAMLANDI

- Modal: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, focus trap, Escape, focus restore
- Tabs: `role="tablist/tab/tabpanel"`, `aria-selected`, `aria-controls`, `aria-labelledby`, `tabindex`, arrow key nav
- Tooltip: `role="tooltip"`, `aria-describedby`
- Autocomplete: `role="combobox/listbox/option"`, `aria-expanded`, `aria-autocomplete`, `aria-controls`, `aria-activedescendant`

## ~~Test~~ ✅ TAMAMLANDI

- Vitest + jsdom altyapisi kuruldu
- 5 test dosyasi, 99 test: Url (26), Form rules (37), Ajax (20), Cookie (11), Token (5)
- `npm run test` ve `npm run test:watch` komutlari eklendi

## ~~Bug: Stale Import (Burtest + Bikonuvar)~~ ✅ TAMAMLANDI

- `sadrazam/scss/base/colors-main` → `theme/colors-main` olarak guncellendi
- Burtest: `resources/core/css/burtest.scss` duzeltildi
- Bikonuvar: `resources/core/css/bikonuvar.scss` duzeltildi
- NOT: Bikonuvar'da ayri bir stale import daha var (`modules/message` bulunamiyor)

## ~~Numeric Spacing Migration~~ ✅ TAMAMLANDI

- T-shirt size spacing class'lari (sm/md/lg/xl/2xl) kaldirildi
- Numerik class'lar eklendi: `.margin-t-{0-18}`, `.padding-x-{0-18}`, vb.
- `@each` loop ile 19 kademeli scale'den otomatik uretim
- Dukkan template'leri migrate edildi (60 class degisikligi, 26 dosya)
- Asimetrik padding decompose: `padding-md` → `padding-y-5 padding-x-6`

## Oncelik Sirasi

1. ~~Polyfills temizligi~~ ✅
2. ~~Error handling~~ ✅
3. ~~rsBEM migration~~ ✅
4. ~~JSDoc + help() tamamlama~~ ✅
5. ~~a11y~~ ✅
6. ~~Test~~ ✅
7. ~~Stale import fix (Burtest + Bikonuvar)~~ ✅
8. ~~Numeric spacing migration~~ ✅
