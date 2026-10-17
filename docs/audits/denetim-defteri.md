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
| 2026-10-17 | Bekleyen (tek satır — ızgara tabanı, `/denetle` yedi madde) | `e1af100..c8c1fcc` | 5 | 2 → 2 (ORTA 2: F-1 düzeltme Bikonuvar/Burtest'e ulaşmıyor — ikisi bugünkü Sadrazam'a karşı derlenmiyor; F-2 ızgara öğesi iki ayrı yoldan tanınıyor) | [rapor](2026-10-17-grid-full-row-default-audit.md) |

## Bekleyen — denetlenmeden merge edilenler

Dal başına denetim atlanıp merge edildiyse buraya yazılır; denetim bitince satır üst tabloya rapor
bağlantısıyla taşınır, buradan silinir.

| İşaretlendi | Kapsam | Commit aralığı (first-parent) | Merge | Neden ertelendi |
|---|---|---|---|---|
