import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Izgara öğesi YAPIDAN tanınır, sınıftan değil (denetim F-2, 2026-10-17).
 *
 * `.gr-row`'un yerleşim tabanı her doğrudan çocuğu kapsıyordu (`:where(.gr-row > *)`), ama
 * genişlik ve öğenin son panelinin alt boşluğu öğeyi `[class*="col-"]` ile SINIFTAN tanıyordu.
 * Belge `col-xs-12`'ye gerek olmadığını söyleyince col sınıfsız çocuk meşru hâle geldi ve o
 * çocuğa iki kural uygulanmıyordu (Chrome, 358 px kap): panelden sonraki boşluk 18,7 yerine
 * 41 px, doğrudan çocuk `<img>` satır genişliği yerine 40 px. Aynı seçici satır DIŞINDA adında
 * `col-` geçen BEM sınıflarına da sızıyordu (Dükkan'da `…__col-title` gibi 39 öğe).
 *
 * Tüketiciler (Dükkan, Bikonuvar, Burtest) bu kuralları KAYNAKTAN derliyor; dist'i belge sitesi
 * ve paketin `style` girişi okuyor — ikisi de sınanır.
 */
// Yol düz metinle kurulur: jsdom ortamında global `URL` jsdom'unki, `fs` onu dosya adresi saymıyor.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (relative) => readFileSync(path.join(root, relative), 'utf8');

// Yorum satırları atılmış kaynak — yorumlar eski seçiciyi tarihçe olarak anabilir.
const withoutComments = (source) => source.split('\n').filter((line) => !line.trimStart().startsWith('//')).join('\n');

// Seçicinin kural gövdesi — yalnız en dış düzeydeyse (hiçbir `@media`/blok içinde değilse); yoksa null.
// Derinlik, kuraldan önceki süslü parantez farkı: 0 = her genişlikte geçerli.
const topLevelBlock = (source, selector) => {
  const code = withoutComments(source);
  const start = code.indexOf(`${selector} {`);
  const before = code.slice(0, start);
  const depth = before.split('{').length - before.split('}').length;

  return start === -1 || depth !== 0 ? null : code.slice(start, code.indexOf('}', start));
};

describe('Izgara öğesi tanımı', () => {
  const grid = read('src/scss/layout/_grid_responsive.scss');
  const box = read('src/scss/layout/_box.scss');

  it('genişlik kuralı satırın her doğrudan çocuğuna uygulanıyor', () => {
    expect(topLevelBlock(grid, '.gr-row > *')).toContain('width: 100%;');
  });

  it('öğenin son paneli, col sınıfı olsun olmasın, alt boşluğunu bırakıyor', () => {
    expect(topLevelBlock(box, '.gr-row > * > .panel:last-child')).toContain('margin-bottom: 0;');
  });

  it('layout katmanı öğeyi sınıf alt dizgisinden tanımıyor', () => {
    expect(withoutComments(grid) + withoutComments(box)).not.toContain('[class*="col-"]');
  });

  it('dist kaynakla aynı kuralları taşıyor (npm run release yapılmış)', () => {
    const dist = read('dist/sadrazam.min.css');

    expect(dist).toContain('.gr-row>*{width:100%}');
    expect(dist).toContain('.gr-row>*>.panel:last-child{margin-bottom:0}');
    expect(dist).not.toContain('[class*=col-]{width:100%}');
  });
});
