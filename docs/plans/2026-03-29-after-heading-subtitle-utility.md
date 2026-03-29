# After-Heading Subtitle Utility

## Problem

`_typography.scss`'te tüm heading'ler (`h1-h6`) `margin: 0.4em 0` ile tanımlanmış. Bu doğal ve gerekli bir spacing — heading'lerin çevresindeki içerikten ayrışmasını sağlıyor.

Ancak bir heading'in hemen altına açıklama/alt başlık metni eklemek gerektiğinde, heading'in `margin-bottom: 0.4em`'i açıklama metnini heading'den koparıyor. Açıklama heading'e ait görünmüyor, arada gereksiz boşluk oluşuyor.

```
┌──────────────────────────┐
│ h1: Ürün İadesi          │
│                          │  ← 0.4em margin-bottom (fazla boşluk)
│ p: Bu işlem geri alınamaz│
│                          │  ← container margin-bottom (form ile ara)
│ [form alanları...]       │
└──────────────────────────┘
```

## Neden h1'in margin'i sıfırlanmamalı

h1'in `margin: 0.4em 0` değeri global typography kuralı — her yerde kullanılıyor. Bunu sıfırlamak:
- Tüm heading kullanımlarını etkiler
- Her heading'i bir container'a (`div.h1-like`) almayı gerektirir
- Mevcut sayfaların spacing'ini bozar

## Çözüm: Negatif marginli subtitle utility

Heading'in margin-bottom'unu dengeleyip açıklama metnini heading'e yaklaştıran bir utility class:

```scss
// Heading'in hemen altındaki açıklama metni — heading'in margin-bottom'unu
// negatif margin-top ile dengeleyerek metni başlığa yaklaştırır.
// Heading'in doğal margin'ine dokunmadan sadece bu bağlamda etkili olur.
.after-heading {
    margin-top: -0.25em; // 0.4em'in büyük kısmını dengele, minimal boşluk kalsın
}
```

### Kullanım

```html
<header class="standalone-form__header">
    <h1>Ürün İadesi</h1>
    <p class="after-heading fsi-15 tc-danger-500">Bu işlem geri alınamaz.</p>
</header>
```

### Beklenen sonuç

```
┌──────────────────────────┐
│ h1: Ürün İadesi          │
│ p: Bu işlem geri alınamaz│  ← heading'e yakın, birlikte okunur
│                          │  ← container margin-bottom (form ile ara)
│ [form alanları...]       │
└──────────────────────────┘
```

## Kapsam

- `_typography.scss` veya yeni bir `_utilities.scss` dosyasına eklenebilir
- Sadrazam utility class'ı olarak tüm projelerde kullanılabilir
- Sadece heading'lerden sonra kullanılmak üzere tasarlanmış — genel amaçlı negatif margin değil

## Kullanılacak yerler (bilinen)

- Standalone form header'larında açıklama metni (Dükkan: iade, iptal, validate)
- İleride heading + subtitle pattern'i gereken her yer
