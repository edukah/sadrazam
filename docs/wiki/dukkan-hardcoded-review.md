# Dükkan — Hardcoded Değer → Variable Dönüşümü

> **Durum:** Beklemede — kapsamlı tarama ve dönüşüm yapılacak

## Yapılanlar

- Vendor prefix temizliği tamamlandı (5 dosya)
- Belirli renk düzeltmeleri yapıldı (3 dosya: `password_rule_module`, `_marketplace`, `_image`)
- Spacing token rename tamamlandı (70 dosya: `space-N` → `space-M`)

## Yapılacaklar

Sadrazam'daki gibi kapsamlı bir hardcoded değer taraması henüz yapılmadı. Aşağıdaki adımlar gerekiyor:

### 1. Spacing (px/rem → --space-*)
- Tüm SCSS dosyalarında hardcoded `px`, `rem` padding/margin/gap değerleri taranacak
- En yakın spacing token'a yuvarlanacak (Sadrazam'daki gibi)

### 2. Renkler (hex/named → --color-*)
- Kalan hardcoded hex (`#333`, `#ccc`, `#f5f5f5` vb.) ve named color taranacak
- Uygun semantic token'a dönüştürülecek

### 3. Font (px/rem → --fsi-*, --fwe-*)
- Hardcoded font-size ve font-weight değerleri taranacak

### 4. Border-radius (px → --radius-*)
- Hardcoded border-radius değerleri taranacak

## Kurallar
- Sadrazam'da yapılan dönüşüm referans alınacak
- `normalize`/`reset` tarzı dosyalarda variable kullanılmayacak (convention)
- Browser-forced değerler (autofill, scrollbar pseudo-element) hardcoded kalabilir
- `color-mix` yerine mümkünse mevcut token kullanılacak
