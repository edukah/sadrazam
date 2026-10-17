# Denetim — ızgara tabanı (`:where(.gr-row > *)`, merge `c8c1fcc`)

**Tarih:** 2026-10-17 · **Komut:** `/denetle` — yedi hata tipinin tamamı, merge edilmiş işe uygulandı; rapor ve defter `/denetle_gecmis` kuralıyla.
**Pencere:** defterin **Bekleyen** bölümündeki tek satır (kullanıcı isteği: "Sadrazam'ın 1'ini denetler misin?").
**Commit aralığı:** `e1af100..c8c1fcc` — 1 merge (`fix/grid-full-row-default`), dal commit'i `29ca6c7`, 5 dosya, +38 / −26: `src/scss/layout/_grid_responsive.scss`, `docs/grid.html`, `CLAUDE.md`, `dist/sadrazam.min.css`, `docs/assets/sadrazam.min.css`.
**Tüketiciler de ölçüldü:** Dükkan (çekirdek SCSS kaynaktan derleniyor), Bikonuvar, Burtest. Dükkan'daki `col-xs-12` temizliği (`81b6c5b74`) bu denetimin kapsamı dışında — tüketiciler bugünkü hâlleriyle değerlendirildi.

**İddia → doğrulanan: 2 → 2.** Çürüyen yok; çürütücü F-1'deki bir ölçümü düzeltti (12,7 px sentetik içeriğin artığı; gerçek sayfalama kutusu 280,4 px). **YÜKSEK 0 · ORTA 2 · DÜŞÜK 0** — ikisi de bugün açık.

> ⚠ Bu rapor **hiçbir kod dosyasını değiştirmedi.** Merge edilmiş kodda düzeltme ayrı bir karar.

## Yöntem

Tek denetçi + bağımsız çürütücü (Dükkan'la aynı koşum, workflow `wf_ab74819f-8f7`, grup F). Önce envanter (ızgara yerleşim bildirimleri, `[class*="col-"]` seçicileri, `:where(` emsalleri, JS'in ürettiği `gr-row` işaretlemesi, tüketici derleme hattı), sonra diff. Şablon envanteri öz-sınanmış bir ayrıştırıcıyla (Dükkan 107 `.gr-row` / 181 doğrudan çocuk, Bikonuvar 39 / 70, Burtest 8 / 26, belge 29 / 84). Gerçek tarayıcı ölçümü headless Chrome ile (pencere 500 + 358 px kap telefon; 600 / 800 / 1200). Dist, scratch çalışma ağacında yeniden derlenip commit'lenmiş olanla `cmp` ile kıyaslandı (eşit). Dört depo iş bitince main'de ve temiz.

## Bulgu listesi

| ID | Madde | Önem | Bulgu | Bugün main'de |
|---|---|---|---|---|
| F-1 | 4 KAPSAM | ORTA | Düzeltme Bikonuvar ve Burtest'e hiç ulaşmıyor: ikisi de bugünkü Sadrazam'a karşı derlenemiyor (`sadrazam/scss/layout/grid` 2026-08-01'den beri yok); merge mesajı, CLAUDE.md ve defter 'Bikonuvar'da 8 yer'i bu kuralın kapsamında anıyor, oysa o 8 kutu telefonda hâlâ dar (gerçek sayfalamada 280,4 px; tam satır 358 px olmalı — denetçinin 12,7 px'i sentetik içeriğin artığıydı). | açık |
| F-2 | 5 KOŞUL KAYMASI | ORTA | Izgara öğesi artık iki farklı yoldan tanınıyor: yeni taban yapıdan (`.gr-row > *`), panel boşluğu ve genişlik kuralları sınıftan (`[class*="col-"]`). Belge 'col-xs-12 hiç gerekmez' dediği için col sınıfsız tam-satır çocuk meşru hâle geldi, ama böyle bir çocukta son panelin boşluğu 18,7px yerine 41,0px oluyor, doğrudan çocuk `<img>` ise 358px yerine 40px kalıyor. | açık |

---

## F-1 — Düzeltme Bikonuvar ve Burtest'e hiç ulaşmıyor: ikisi de bugünkü Sadrazam'a karşı derlenemiyor (`sadrazam/scss/layout/grid` 2026-08-01'den beri yok); merge mesajı, CLAUDE.md ve defter 'Bikonuvar'da 8 yer'i bu kuralın kapsamında anıyor, oysa o 8 kutu telefonda hâlâ dar (gerçek sayfalamada 280,4 px; tam satır 358 px olmalı — denetçinin 12,7 px'i sentetik içeriğin artığıydı).

**Madde:** 4 KAPSAM · **Önem:** ORTA · **Hüküm:** doğrulandı

**Nerede:** Sadrazam CLAUDE.md:67 (merge anında ve main'de aynı satır), docs/audits/denetim-defteri.md:28 (6884767), merge mesajı c8c1fcc; tüketici tarafı: bikonuvar/resources/core/css/bikonuvar.scss:25, burtest/resources/core/css/burtest.scss:23

**Yazılan:**

```text
Sadrazam CLAUDE.md:67: "…`col-sm-12 col-md-6` yazılıp taban atlanınca 576px altında kutu satırın 1/12'sine sıkışıyordu (Dükkan admininde 76, Bikonuvar'da 8 yer)." — merge başlığı: "…satırın 1/12'sine sıkışıyordu (Dükkan admin 76 + Bikonuvar 8 yer)". Tüketicide: bikonuvar.scss:25 `@use 'sadrazam/scss/layout/grid';` · burtest.scss:23 `@use 'sadrazam/scss/layout/grid';`
```

**Kanıt (denetçi):** 1) Hedef dosya yok: `git -C sadrazam ls-tree -r --name-only c8c1fcc -- src/scss/layout` → yalnız `_box.scss`, `_flex_responsive.scss`, `_grid_responsive.scss`; yeniden adlandırma `8f62fc2 (Sat Aug 1 2026) R062 src/scss/layout/_grid.scss → _grid_responsive.scss`.
2) Gerçek derleme (tüketicinin kendi webpack.common.js'indeki resolve + scss kuralı, çıktı scratch'e): Bikonuvar → `Can't find stylesheet to import. ╷ 25 │ @use 'sadrazam/scss/layout/grid';`; Burtest → aynı hata, satır 23. İki projenin webpack.prod.js'i `resources/**/*.scss`'i giriş alıyor, yani sunulan `public/dist/core/css/*.css` tam bu girişten üretiliyor.
3) Sunulan CSS: Bikonuvar admin + site head.tpl `dist/core/css/bikonuvar.css` yüklüyor; dosya git dışı, tarihi `2026-05-05 14:18:57`, `grep -c ':where(.gr-row>*)'` → 0. Burtest `burtest.css` `2026-05-05 16:43:23`, → 0.
4) Chrome (pencere 500, kap 358), user_list.tpl:72-76 yapısı `.gr-row > .col-sm-12.text-right`: sunulan CSS → `çocuk w=12.7 h=156.6 metin ≈7 satır gc=auto/auto`; scratch worktree'de YALNIZ bikonuvar.scss:25'i `layout/grid_responsive` yapınca derleme `OK`, CSS'te `:where(.gr-row>*){grid-column:1/-1}` var → `çocuk w=358.0 h=22.4 ≈1 satır gc=1/-1`.
5) Envanter: Bikonuvar'daki xs'siz 8 çocuk, merge'ün andığı 8 yerle birebir: admin/administrator/administrator_group_list.tpl:42, administrator_list.tpl:54, notification.tpl:39, content/user_report_list.tpl:60, user/block.tpl:53, user/note.tpl:39, user/user_group_list.tpl:54, user/user_list.tpl:73 (hepsi `col-sm-12 text-right`, sayfalama satırı). Burtest'te xs'siz çocuk 0. İki projede `flx-row` kullanımı 0, yani tek satırlık içe aktarma düzeltmesi yetiyor.

**Çürütücü:** Ana iddia kendi ölçümümle tutuyor: Bikonuvar ve Burtest bugünkü Sadrazam'a karşı derlenemiyor. Sebep `@use 'sadrazam/scss/layout/grid'` satırı: dosya 2026-08-01'de (8f62fc2) `_grid_responsive.scss` adını aldı. İki projenin sunduğu çekirdek CSS 2026-05-05 tarihli, git dışı ve yeni kuralı taşımıyor. Dev modunda da sonuç aynı: webpack.dev.js aynı webpack.common.js'i kullanıyor, derleme aynı satırda kırılıyor. Yani c8c1fcc'nin tabanı bu iki tüketiciye hiçbir yoldan ulaşmıyor.

Buna rağmen merge mesajı, Sadrazam CLAUDE.md:67 ve defter:28 'Bikonuvar 8 yer'i bu düzeltmenin kapsamında sayıyor. Nöbetçi (Dükkan tests/test_grid_full_row_default.php A3) yalnız Dükkan'ın iki paketini sınıyor. Bu, rubrikteki 'yanlış yönlendiren doküman' ve 'kapsam dışı kalmış örnek' tanımına uyuyor, yani ORTA. Kırılmanın kökü bu merge'den önce (8f62fc2); bu merge'e yazılan bulgu kapsam ve belge iddiası. Para, belge, veri ya da güvenlik etkisi yok, YÜKSEK değil.

DÜZELTME: başlıktaki '12,7px' bir ölçüm artığı. O sayı yalnız çok kısa sentetik içerikle çıkıyor ('1 2 3 4 5 6 7' → w=12.7 h=156.6). Bikonuvar'ın gerçek sayfalama işaretlemesi ve kendi rota CSS'iyle kutu 280.4px çıkıyor (izler: '280.406px 0px ×11'); kural gelince 358px oluyor. Sonuç: sayfalama telefonda ~39px sola kaymış duruyor. Etki gerçek ama hafif. Envanter birebir doğru: Bikonuvar'da 70 doğrudan çocuğun 8'i xs'siz, Burtest'te 26'nın 0'ı.

**Çürütücünün kanıtı:** Dosya yolları ve kaynak:
- `git -C sadrazam ls-tree -r --name-only c8c1fcc -- src/scss/layout` → _box.scss, _flex_responsive.scss, _grid_responsive.scss
- `git log --follow -M -- src/scss/layout/_grid_responsive.scss` → `8f62fc2 2026-08-01 17:27:58 R062 src/scss/layout/_grid.scss → _grid_responsive.scss`
- sadrazam/package.json exports: `"./scss/*": "./src/scss/*"`; `Workspace/node_modules/sadrazam -> ../workbench/sadrazam`
- `git show main:resources/core/css/bikonuvar.scss` :25 `@use 'sadrazam/scss/layout/grid';` · burtest.scss :23 aynı

Derleme:
- Tüketicinin kendi webpack.common.js'iyle, çıktı scratch'e (refute-F/build/wp-*.mjs):
  - bikonuvar → `ERROR … Can't find stylesheet to import. 25 │ @use 'sadrazam/scss/layout/grid';`
  - burtest → aynı hata, `23 │`
- Yalnız o satır `layout/grid_responsive` yapılınca iki proje de `compiled successfully`; çıktıda `:where(.gr-row>*){grid-column:1/-1}` var.

Sunulan CSS:
- `public/dist/core/css/bikonuvar.css` 2026-05-05 14:18:57 (`.gitignore:93:dist`) → `grep -c ':where(.gr-row'` = 0
- burtest.css 2026-05-05 16:43:23 (`.gitignore:90:dist`) → 0
- Yükleyen yerler: bikonuvar templates/admin/common/head.tpl:25 ve templates/site/common/head.tpl:24, burtest templates/site/common/head.tpl:24

Envanter (PHP'yi ayıklayan html.parser betiği):
- Bikonuvar: 70 doğrudan çocuk; xs'siz 8, hepsi `col-sm-12 text-right` (administrator_group_list:42, administrator_list:54, notification:39, user_report_list:60, block:53, note:39, user_group_list:54, user_list:73)
- Burtest: 26 çocuk, xs'siz 0
- flx-row: 0 / 0
- JS'in ürettiği gr-row işaretlemesi: 4 depoda 0

Chrome (pencere 500, kap 358):
- Gerçek sayfalama işaretlemesi + derlenmiş `resources/scopes/css/admin/common/pagination.scss`:
  - sunulan CSS → `kid w=280.4 gc=auto/auto tracks=280.406px 0px 0px …` (sayfalamanın sağ kenarı 267.4)
  - yeniden derlenmiş CSS → `kid w=358.0 gc=1/-1` (sağ kenar 306.2)
- Sentetik içerik '1 2 3 4 5 6 7' + sunulan CSS → `w=12.7 h=156.6` (denetçinin sayısı buradan geliyor)

**Bugün main'de:** hâlâ geçerli — Sadrazam'da c8c1fcc..main yalnız 6884767 (defter), ilgili dosyalara commit yok; bikonuvar main resources/core/css/bikonuvar.scss:25 ve burtest main resources/core/css/burtest.scss:23 hâlâ `@use 'sadrazam/scss/layout/grid';` (son değişiklikler abc1c20 2026-04-02, b55f931 2026-03-10).

**Öneri:** Bikonuvar ve Burtest'te `@use 'sadrazam/scss/layout/grid'` → `@use 'sadrazam/scss/layout/grid_responsive'` yapılıp yeniden derlensin (scratch'te ölçüldü: tek satırla derleniyor ve kural geliyor). O yapılana dek Sadrazam CLAUDE.md:67 ve defterdeki 'Bikonuvar'da 8 yer' ifadesinin yanına 'Bikonuvar derlenmediği için kural oraya henüz ulaşmadı' yazılsın. Kütüphane değişikliklerinde üç tüketicinin çekirdek CSS'ini derleyen bir nöbetçi (ya da en azından içe aktarma yollarının varlığını sınayan bir kontrol) bu tür sessiz kopmayı yakalar.

---

## F-2 — Izgara öğesi artık iki farklı yoldan tanınıyor: yeni taban yapıdan (`.gr-row > *`), panel boşluğu ve genişlik kuralları sınıftan (`[class*="col-"]`). Belge 'col-xs-12 hiç gerekmez' dediği için col sınıfsız tam-satır çocuk meşru hâle geldi, ama böyle bir çocukta son panelin boşluğu 18,7px yerine 41,0px oluyor, doğrudan çocuk `<img>` ise 358px yerine 40px kalıyor.

**Madde:** 5 KOŞUL KAYMASI · **Önem:** ORTA · **Hüküm:** doğrulandı

**Nerede:** src/scss/layout/_grid_responsive.scss:22-30 (yeni taban + yorum) ↔ src/scss/layout/_box.scss:44 ve src/scss/layout/_grid_responsive.scss:33; belge: docs/grid.html:263, CLAUDE.md:67 (main'de aynı satırlar)

**Yazılan:**

```text
_grid_responsive.scss:25-30: "Bu yüzden `col-xs-12` // yazmak GEREKMEZ — yalnız telefonda farklı bir pay isteniyorsa yazılır (ör. `col-xs-6`)." + `:where(.gr-row > *) { grid-column: 1 / -1; }` · docs/grid.html:263: "Default: every direct child of .gr-row spans the full row until one of its .col-*-N classes applies — so .col-xs-12 is never needed." · CLAUDE.md:67: "`col-xs-12` YAZILMAZ — yalnız telefonda farklı pay isteniyorsa `col-xs-N`."
```

**Karşılığı:** sadrazam/src/scss/layout/_box.scss:44 `.gr-row [class*="col-"] > .panel:last-child { margin-bottom: 0; }` (yorumu: "Grid kolonu (col-*) içindeki panelin dikey boşluğunu gr-row `gap` verir … dar ekranda gap ile ÇİFT boşluk yapar") · sadrazam/src/scss/layout/_grid_responsive.scss:33 `[class*="col-"] { width: 100%; }` · burtest/resources/components/css/site/services.scss:4 `.gr-row > [class*="col-"] > a { display: block; height: 100%; }`

**Kanıt (denetçi):** Chrome (pencere 500, kap 358), aynı `.gr-row` içinde col sınıfsız çocuk ↔ `col-xs-12`'li çocuk:
- Sadrazam dist c8c1fcc: `div-panel:none panelAralik=41.0` / `div-panel:xs12 panelAralik=18.7`; `img:none w=40.0` / `img:xs12 w=358.0`; input, select, button, table ikisinde de 358.
- Dükkan admin çekirdek CSS'i (bugünkü kaynaktan scratch derlemesi): birebir aynı sayılar (41.0/18.7, 40/358).
Sebep: `_box.scss:44 .gr-row [class*="col-"] > .panel:last-child { margin-bottom: 0 }` ve `_grid_responsive.scss:33 [class*="col-"] { width: 100% }` yalnız col sınıflı öğeye uyuyor; yeni taban ise her doğrudan çocuğa. `[class*="col-"]` envanteri (`git grep -E "\[class[*^$]?=['\"]?col-"`): Sadrazam 3 (`_box.scss:44`, `_grid_responsive.scss:33`, `_tabs.scss:49` — `.row` için, ilgisiz), Burtest 1 (`services.scss:4 .gr-row > [class*="col-"] > a`), Dükkan 0, Bikonuvar 0.
Bugün tetiklenmiyor (gizli): col sınıfsız `.gr-row` çocuğu Dükkan 0/181, Bikonuvar 0/70, Burtest 0/26, Sadrazam belge 0/84; son çocuğu `.panel` olan 45 Dükkan çocuğunun hepsi col sınıflı (`col-xl-3` 22, `col-xl-9` 21, `col-md-6` 2). Ama Dükkan nöbetçisi B1 `col-xs-12`'yi yasakladığı için her genişlikte tam satır bir panel kabı ya sınıfsız (→ 41px çift boşluk) ya da anlamsız bir `col-sm-12` ile yazılabiliyor.

**Çürütücü:** Izgara öğesi artık iki farklı yoldan tanınıyor:
- Yerleşimi yeni taban yapıdan veriyor (`:where(.gr-row > *)`).
- `width: 100%` (_grid_responsive.scss:33) ve panelin alt boşluğunu sıfırlayan kural (_box.scss:44) sınıftan tanıyor (`[class*="col-"]`).

Belge `col-xs-12`'yi gereksiz ilan ediyor: kaynak yorumu :25-26, docs/grid.html:263 'never needed', CLAUDE.md:67 'YAZILMAZ'. Dükkan nöbetçisi B1 de `col-xs-12`'yi tüm şablonlarda yasaklıyor. Bu yüzden her genişlikte tam satır olacak bir kutu, sınıfsız yazılmaya doğru itiliyor. Sınıfsız çocukta iki kural devreye girmiyor. Ölçümü iki ayrı CSS ile tekrarladım (Sadrazam dist c8c1fcc ve bugünkü kaynaktan derlenen Dükkan admin çekirdek CSS'i). Sayılar birebir aynı:
- panel sonrası boşluk 41.0 ↔ 18.7
- doğrudan çocuk `<img>` 40 ↔ 358
- input, select, button, table, span, a, textarea, label iki durumda da 358

Bugün tetiklenmiyor: hiçbir tüketicide sınıfsız `.gr-row` çocuğu yok. Dükkan temizliği sildiği 75 `col-xs-12`'nin hepsinde başka bir col sınıfı bırakmış. Ama madde 5 'şu an aynı' demeyi yeterli saymıyor. Ayrıca Dükkan'ın `_listing.scss:55-58` yorumu panel boşluğunu bu sınıfa bağlı kurala emanet ediyor. Rubrikteki 'ayrışabilecek iki kaynak' ve 'yanlış yönlendiren doküman' tanımına uyuyor, ORTA. Not: merge mevcut hiçbir öğeyi kötüleştirmiyor (sınıfsız çocuk önceden zaten tek kanala düşüyordu); ayrışma yalnız yeni rehbere uyan yeni ya da düzenlenen işaretlemede ortaya çıkar.

**Çürütücünün kanıtı:** Kaynak satırları:
- `git show c8c1fcc:src/scss/layout/_grid_responsive.scss`:
  - :25-26 "Bu yüzden `col-xs-12` // yazmak GEREKMEZ"
  - :28 `:where(.gr-row > *) {` :29 `grid-column: 1 / -1;`
  - :33 `[class*="col-"] {` :34 `width: 100%;`
- `git show c8c1fcc:src/scss/layout/_box.scss`:44 `.gr-row [class*="col-"] > .panel:last-child {` :45 `margin-bottom: 0;`
- docs/grid.html:263 "…so .col-xs-12 is never needed."

Chrome (pencere 500, kap 358; aynı harness iki CSS ile: refute-F/chrome/f2-sadrazam.html + f2-dukkan.html; Dükkan CSS'i kendi webpack.common.js'iyle scratch'e derlendi):
```
p_none panelBottom->next=41.0 w=358.0
p_xs panelBottom->next=18.7 w=358.0
p_sm panelBottom->next=18.7 w=358.0
img:none w=40.0 / img:xs12 w=358.0
in/se/bt/tb/sp/a/ta/lb:none w=358.0 / :xs12 w=358.0
```

`[class*="col-"]` envanteri (`git grep -nE "\[class[*^$|~]?="` + col süzgeci):
- Sadrazam 3: _box.scss:44, _grid_responsive.scss:33, _tabs.scss:49 (`.row>*[class*="col-"]`, ilgisiz)
- Burtest 1: services.scss:4 `.gr-row > [class*="col-"] > a`
- Dükkan 0, Bikonuvar 0

Sınıfsız `.gr-row` doğrudan çocuğu (html.parser):
- Dükkan 0/181, Bikonuvar 0/70, Burtest 0/26, Sadrazam docs 0/84
- JS'in ürettiği gr-row işaretlemesi 0
- Son çocuğu `.panel` olan Dükkan çocuğu 45: col-xl-3 22, col-xl-9 21, col-md-6 2, sınıfsız 0

Dükkan temizliği: `git diff 81b6c5b74^1 81b6c5b74 -- templates/ | grep '^-.*col-xs-12'` → 75 satır, başka col sınıfı taşımayan 0.

Dükkan main tests/test_grid_full_row_default.php B1: `str_contains($kaynak, 'col-xs-12')` tüm .tpl'lerde yasak.

**Bugün main'de:** hâlâ geçerli — Sadrazam main src/scss/layout/_grid_responsive.scss:28 ve :33, src/scss/layout/_box.scss:44, docs/grid.html:263, CLAUDE.md:67; `git log c8c1fcc..main -- <bu dosyalar>` boş.

**Öneri:** Izgara öğesini tek tanıma bağlayın: `_box.scss:44` yapıya göre yazılsın (ör. `.gr-row > * > .panel:last-child`); `width: 100%`'ün sınıfsız çocuklara da uygulanıp uygulanmayacağına karar verilip gerekiyorsa taban kuralına taşınsın. Bunu istemiyorsanız belge daraltılsın: 'col-xs-12, öğe başka bir col-* sınıfı taşıyorsa gereksizdir; hiç col sınıfı olmayan öğe tam satır alır, ama panel alt boşluğunun sıfırlanması ve width:100% ona uygulanmaz.' Dükkan nöbetçisine 'sınıfsız çocuk + panel' ölçümü eklenebilir.

---

## Temiz çıkan maddeler

- **1 REFERANS:** Kaynaklardaki tanımlar açılıp doğrulandı. `variables.$breakpoint-*` abstracts/_breakpoints.scss:3-9'da (sm 576px). Belgedeki "gap: 1.25rem" ile base/_variables.scss:34 `--space-10: 1.25rem` tutuyor; "576px" ile `$breakpoint-sm` tutuyor. `.col-xs-1…12` ile `.col-4k-*` arası @for döngülerinden üretiliyor (dist'te var). CLAUDE.md:67'nin andığı nöbetçi `dukkan/tests/test_grid_full_row_default.php` var (42eac3859) ve koşuldu: PASS 5 / FAIL 0. docs/grid.html'in değişen 5 örneği belgelendiği gibi çiziliyor. Pencere 500'de: Responsive 4-up 4×371px (y 0/61/121/182), Sidebar 2×371, Holy Grail 3×371, Card Grid 4×371, Dashboard 2×371. Pencere 800'de: 211×3+211, 211+440, 153+326+153, 326×2 (iki satır), 440+211. docs/grid.html:351-354'te kalan `col-xs-12` eşit sütun gösterimindeki "12" örneği (commit'te bilinçli). Yeni paragraf, komşu satır 262 ile aynı `class-ref` sınıfını kullanıyor. 'never needed' cümlesinin col sınıfsız öğede tutmadığı F-2'de.
- **2 YENİDEN İCAT:** Varsayılan tam satırın projede bir karşılığı yoktu. grid-column bildirimleri: Sadrazam'da yalnız col döngüleri ve _modal.scss:71,146 (modalın iç ızgarası); Dükkan'da 2 yer (account/review.scss:26, shared/navigation.scss:81 — ikisi de `.gr-row` dışında); Bikonuvar ve Burtest'te 0. `[class*="col-"] { width:100% }` yerleşimi değiştirmiyor: eski CSS'te width:100%'e rağmen `col-sm-12` çocuk telefonda 12,7px ölçüldü. `flx-row` ve `grid-auto` ayrı sistemler. Kırılım koşulu çoğaltılmadı: yeni kural medya sorgusu içermiyor; '576px' yalnız düz yazıda geçiyor (yorum, docs, CLAUDE.md) ve `$breakpoint-sm` ile aynı. `[class*="col-"]` ile oluşan ikilik F-2'de.
- **3 BENZERLİK:** Emsallere bakıldı. `:where` için Sadrazam base/_variables.scss:13 `:where(:root)` (tüm tema token'ları) var. `grid-column: 1 / -1` için _modal.scss:71,146 ve Dükkan'da 2 yer var. Kural, bölüm 1'in (`.gr-row`, `.gr-row + .gr-row`) hemen ardında ve `[class*="col-"]`'den önce duruyor; derlenmiş sırada da `.gr-row+.gr-row` → `:where` → `[class*=col-]` → `.col-xs-1…` (Dükkan iki paketinde 978-993. kurallar). Yorum Türkçe (komşular da Türkçe). docs paragrafı, sayfanın geri kalanı gibi İngilizce. CLAUDE.md maddesi, öteki maddelerle aynı biçimde (kalın başlık + tarih + nöbetçi). Tek küçük sapma: yeni blok numarasız (komşular `// 1.`…`// 4.`); bulgu sayılmadı.
- **6 ÖLÇ:** (a) Dist: commit'lenmiş eski→yeni fark (`tr '}' '\n'` + diff) yalnız `:where(.gr-row>*){grid-column:1/-1` (35 bayt). c8c1fcc'den scratch worktree'de yapılan `webpack --config webpack.prod.js` derlemesinin `dist/sadrazam.min.css`'i, commit'lenmiş dist ve docs/assets ile `cmp` eşit. dist ile docs/assets'teki üç dosya blob düzeyinde aynı. esm.js farkı yalnız yol tabanlı modül kimlikleri (`./en.js:576↔98`); son JS dist commit'i 1e29982'den bu yana src/js değişmemiş. (b) Chrome eski↔yeni, kap 358: `col-sm-12 col-md-6` 12,7→358 (alt alta); `col-sm-12` 12,7→358; `col-xs-6` 169,7'de sabit; `grid-area` yazan çocuk sabit. 800 ve 1200'de col sınıflı öğelerde fark yok; 600'de yalnız `col-md-6`'lı öğe 31,2→580 (md altı, beklenen düzeltme). (c) Uzun yazım yan etkileri ölçüldü: yalnız `grid-column-end: span 3` yazan çocuk alt satıra indi (x 188,3→0, y 0→41); yalnız `grid-column-start: 3` 46,6→295,2px; yalnız `grid-row: 1` tam satıra yayıldı; konumlandırılmış ve dolgulu satırda mutlak konumlu çocuk x 328→308. Ama tetikleyici yok: tüketicilerde uzun yazım bildirimi 0 (SCSS/CSS/şablon/JS ayrı ayrı); konumlandırılmış tek `.gr-row` (`product-review__container-box`) çocukları akış içi `div`; mutlak konumlu `.gr-row` çocuğu 0. (d) Merge anındaki Dükkan'da xs'siz 76 çocuğun hepsi sm sınıflı (md/lg/xl'den başlayan 0); '600/800/1200'de değişmedi' iddiası o bağlamda doğru. (e) `:where` yeni bir tarayıcı şartı getirmiyor: token'lar zaten `:where(:root)` içinde, Dükkan admin CSS'i 13 `:has(` kullanıyor, browserslist tanımı yok.
- **7 ENVANTER:** Her kılıf ayrı sayıldı. Şablonlarda (`<template>` içleri dahil; `:` ve süslü PHP yazımının ikisi de; öz-sınamalı ayrıştırıcı, ham sayımla eşit): Dükkan 181 çocuk → xs'siz 151 (132 admin + 19 vitrin), xs'li 30, col sınıfsız 0, dinamik `<?= ?>` 0. Bikonuvar 70 → 8 xs'siz, 62 xs'li, 0 sınıfsız. Burtest 26 → 26 xs'li. Sadrazam belge 84 → 18 xs'siz, 66 xs'li. Diğer kılıflar: PHP'de üretilen `gr-row` 0; JS'te `gr-row` 0; `@extend` 0; JS'in id'li 2 kaba ve 9 ek sınıfa yazdığı yer 0. Kardeş ekleyen 6 çağrı tek tek açıldı: order.js:486,602'deki kart bir `.gr-row` çocuğu değil; bikonuvar draft.js:81 yorum bloğunda; geo_zone_form ve claim_issue_form_modal şablonlarında `gr-row` 0; `.draft/` taslak. Sadrazam Form hata kutusu: `.gr-row` içeren şablonlarda `data-form-validate-scope` 0, doğrudan çocuk input 0. Mail ve yazdırma şablonlarında `gr-row` 0. Şüpheli olarak açılanlar: product-filter__flex-wrapper (akış içi aside), product-review__container-box, admin listeleme filtre/sonuç, order_detail. Sonuç: col sınıfsız çocuk olmadığı için 'eskiden 1 kanal, şimdi tam satır' durumuna düşen kasıtlı bir yerleşim yok. Dükkan'daki 151 xs'siz çocuk kuralın hedeflediği yer: merge anındaki 76 + temizlikte `col-xs-12`'si silinen 75 (`git diff 81b6c5b74^1 81b6c5b74 -- templates` → 75 silme). Merge'ün sayıları (Dükkan admin 76, Bikonuvar 8, Burtest temiz) envanterle tutuyor.

## Kapsam dışı bırakılanlar

- Dükkan'daki col-xs-12 temizliği (81b6c5b74), onunla gelen tests/test_grid_full_row_default.php ve Dükkan CLAUDE.md'deki ızgara maddesi — Görev gereği kapsam dışı; tüketici yalnız bugünkü hâliyle değerlendirildi. Dükkan grubu için iki gözlem: nöbetçinin B2 düzenli ifadesi `col-(sm|md|lg|xl|xxl|4k)` xxxl'i atlıyor; Dükkan CLAUDE.md'nin 'payı söylenmeyen genişlikte kutu satırın tamamını kaplar' ifadesi F-2'deki ikiliği Dükkan tarafında da önerir hâle getiriyor.
- Bikonuvar ve Burtest'teki `sadrazam/scss/layout/grid` içe aktarma kırığının kendisi — Kırık 8f62fc2'den (2026-08-01, `_grid.scss` bölünmesi) geliyor, bu merge'ün işi değil. F-1 yalnız bu merge'ün kapsam iddiasını ve fiilî etkisini kayda geçiriyor. Aynı kör nokta, ayrı bir commit olan 01a1a58'de de var (2026-09-19, Sadrazam CLAUDE.md:98-101: 'Bikonuvar ve Burtest'te tek satır değişiklik gerekmedi'). O tarihte de iki projenin çekirdek CSS'i derlenmiyordu; ayrı denetimde bakılmalı.
- Dükkan `.draft/` dizini (checkout.js, style.css) — Taslak/üretim dışı dosyalar; kardeş ekleme ve grid-column taramasında çıktı, değerlendirmeye alınmadı.

- F-1'in düzeltmesi (Bikonuvar `bikonuvar.scss:25` ve Burtest `burtest.scss:23` içe aktarma satırı) bu deponun değil tüketici depoların işi — öneri olarak yazıldı, dokunulmadı.
