# Denetim Defteri

Kuralın tamamı kök `Workspace/CLAUDE.md` → "Git Workflow › Denetim işareti" (her depo için aynı). Özet:

- Denetlenen dalın `--no-ff` merge mesajına `Denetim:` satırı yazılır (yalnız OLUMLU işaret);
  satırsız merge = denetlenmemiş.
- Merge SONRASI yapılan denetim buraya tek satır olarak girer; bulgular tarihli raporda
  (`docs/audits/YYYY-MM-DD-<kapsam>-audit.md`) durur. Penceresiz tarama Bekleyen'den başlar,
  taban çizgisinin öncesine inmez (açık aralık verilirse tarar).
- Taban çizgisi ve öncesi denetlenmiş SAYILIR — beyan, ölçüm değil; amaç "denetlenmemiş"
  kümesinin küçük ve adlı kalması.

**Taban çizgisi (kullanıcı kararı, 2026-10-05):** `01a1a58` (tag `denetim-tabani-2026-10-05`) ve öncesi.
Denetlenmemişler = Bekleyen satırları + `git log --first-parent --merges --invert-grep --grep='^Denetim:'
denetim-tabani-2026-10-05..main`.

| Tarih | Pencere | Commit aralığı | Dosya | İddia → Doğrulanan | Rapor |
|---|---|---|---|---|---|
| 2026-10-05 | taban çizgisi | repo başı..`01a1a58` (dahil) | — | — (denetlenmiş SAYILIR — beyan) | — |

## Bekleyen — denetlenmeden merge edilenler

Dal başına denetim atlanıp merge edildiyse buraya yazılır; denetim bitince satır üst tabloya rapor
bağlantısıyla taşınır, buradan silinir.

| İşaretlendi | Kapsam | Commit aralığı (first-parent) | Merge | Neden ertelendi |
|---|---|---|---|---|
| 2026-10-17 | ızgara tabanı — `:where(.gr-row > *) { grid-column: 1 / -1 }` (telefonda varsayılan tam satır; `col-xs-12` yazılmayınca kutu 576px altında 1/12'ye sıkışıyordu — Dükkan admin 76 + Bikonuvar 8 yer), dist + docs/assets yenilendi (fark yalnız bu kural), `docs/grid.html` taban notu + duyarlı örneklerden `col-xs-12` çıktı, CLAUDE.md ızgara maddesi; nöbetçi Dükkan `tests/test_grid_full_row_default.php` (5, 5 mutasyon); gerçek CSS'le 358 / 600 / 800 / 1200px ölçüldü | `e1af100..c8c1fcc` | `c8c1fcc` | kullanıcı kararı: denetim toplu, sonra |
