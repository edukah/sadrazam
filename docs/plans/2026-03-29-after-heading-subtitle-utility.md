# After-Heading Subtitle Utility

> **Durum:** ✅ Tamamlandı (2026-03-30)

## Çözüm

Heading'in `margin-bottom` değerini negatif `margin-top` ile sıfırlayan ve aynı değeri kendi `margin-bottom`'u olarak uygulayan utility class'ları. Heading'in altındaki içerikten ayrım korunur.

```scss
.after-h1 { margin-top: -0.9em; margin-bottom: 0.9em; }
.after-h2 { margin-top: -0.7em; margin-bottom: 0.7em; }
.after-h3 { margin-top: -0.5em; margin-bottom: 0.5em; }
.after-h4 { margin-top: -0.4em; margin-bottom: 0.4em; }
```

### Kullanım

```html
<h1>Ürün İadesi</h1>
<p class="after-h1 fsi-15 tc-danger-500">Bu işlem geri alınamaz.</p>
```

### Dosya

`src/scss/utilities/_spacing.scss`
