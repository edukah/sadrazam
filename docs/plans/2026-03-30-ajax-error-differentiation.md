# Ajax: JS Hatası ile Network Hatasını Ayırt Et

> **Durum:** ✅ Tamamlandı (2026-03-30)

## Sorun

Tüm request mantığı tek bir try/catch içindeydi. Callback'te fırlayan `TypeError` dış catch'e düşüyor ve `error.name === 'TypeError'` kontrolü onu network hatası sanıyordu → kullanıcıya yanıltıcı "İnternet bağlantınızı kontrol edin" mesajı gösteriliyordu.

## Çözüm

Dış try/catch kaldırıldı. Sadece `fetch()` çağrısı kendi try/catch'inde — network/timeout hataları yalnızca oradan gelir. Tüm callback'ler (`beforeStart`, `complete`, `error`, `success`, `afterEnd`) ayrı try/catch'lerle sarmalandı — JS hataları `console.error` + `LogRelay.capture` ile loglanır, kullanıcıya yanıltıcı mesaj gösterilmez.

Cleanup mantığı (`clearTimeout`, `afterEnd`, `Spinner.hide`, button unlock) `#cleanup()` helper'ına çıkarıldı — 3 çıkış noktasında (network error, HTTP error, success) çağrılır.

## Dosya

`src/js/services/ajax.js`
