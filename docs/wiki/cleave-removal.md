# Cleave.js Kaldirilmasi

Sadrazam icinde bundled olarak bulunan 3. parti `cleave.js` kutuphanesi kaldirildi.

---

## Neden?

- Cleave.js Sadrazam'in kendi kodu degil, 3. parti bir kutuphane
- Kaynak dosyaya `/* eslint-disable */` ile gomulmustu
- Kutuphanenin kendisi deprecated (son guncelleme 2020)
- Her tuketici projeye gereksiz ~23KB ekstra yuk bindiriyordu

## Ne Yapildi?

### Sadrazam

- `src/js/modules/cleave.js` silindi
- `src/js/index.js`'den import, `this.Cleave` ve export kaldirildi
- `src/js/docs/help.json`'dan Cleave satiri kaldirildi
- `docs/cleave.html` silindi
- `docs/index.html`'den Cleave card'i kaldirildi
- JS bundle boyutu: 190KB -> 167KB (-23KB)

### Dukkan (tamamlandi)

- `cleave.js` npm paketi olarak yuklendi (`npm install cleave.js`)
- `resources/core/js/dukkan.js`'de import edilip `globalThis.Cleave` olarak expose edildi
- 17 dosyada `globalThis.Sadrazam.Cleave` -> `globalThis.Cleave` olarak guncellendi

## Bekleyen Isler

### Bikonuvar (4 dosya)

- `templates/admin/user/info.tpl`
- `templates/admin/user/user.tpl`
- `templates/site/account/edit.tpl`
- `public/static/javascript/bikonuvar.js`

### Burtest (1 dosya)

- `resources/scopes/js/site/information/contact.js`

Bu projelerde de ayni islem yapilmali:
1. `cleave.js` npm paketi olarak yukle
2. Entry JS'de `import Cleave from 'cleave.js'; globalThis.Cleave = Cleave;`
3. `globalThis.Sadrazam.Cleave` -> `globalThis.Cleave` olarak guncelle

## Gelecek: cleave-zen

cleave.js deprecated. Yazar `cleave-zen` adli yeni versiyonu oneriyor.
API tamamen farkli: constructor yerine pure function.

```js
// Eski (cleave.js)
new Cleave('input[name="phone"]', { numeral: true });

// Yeni (cleave-zen)
import { formatNumeral } from 'cleave-zen';
input.addEventListener('input', (e) => {
  input.value = formatNumeral(e.target.value);
});
```

Tum tuketiciler `cleave.js`'e gecirildikten sonra `cleave-zen` migrasyonu ayri bir is olarak planlanabilir.
