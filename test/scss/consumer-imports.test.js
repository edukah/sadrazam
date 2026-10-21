import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Tüketicilerin `sadrazam/scss/…` içe aktarmaları var olan bir dosyaya çıkıyor (denetim F-1, 2026-10-17).
 *
 * `layout/_grid.scss` 2026-08-01'de `_grid_responsive.scss` adını aldı; Bikonuvar ve Burtest eski adı
 * içe aktarmaya devam etti ve ikisi de 2,5 ay HİÇ derlenmedi — sunulan CSS Mayıs'ta kaldı, ızgara tabanı
 * dahil kütüphanedeki hiçbir değişiklik oraya ulaşmadı. Kırık yalnız biri o projeyi derlediğinde
 * görünüyordu; bu test onu adı DEĞİŞTİREN tarafta, burada yakalar.
 *
 * Tüketiciler partial'ları tek tek içe aktarıyor; `package.json` `exports`: "./scss/*" → "./src/scss/*".
 * Tüketiciler ANA deponun kardeş dizininde aranır (aşağı bkz.); orada da yoksa (depo tek başına
 * klonlanmışsa) o tüketicinin vakası atlanır.
 */
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
// Yalnız Dükkan: Bikonuvar ve Burtest'in içe aktarmaları bugün kırık (eski `layout/grid` adı) ve düzeltmeleri
// kendi depolarında `fix/sadrazam-import-path` dalında bekliyor — o projelerin işi ele alınınca buraya eklenir.
// Eklenmeden önce kırmızı vermesi bu kütüphanenin testini başka projenin bekleyen işine bağlardı.
const consumers = ['dukkan'];

// Kaynak bu çalışma ağacından okunur, tüketiciler ana deponun yanından. Dal işi worktree'de yapılıyor
// ve worktree başka bir dizinde açıldığı için `root/..` kardeş taşımıyor: vakalar sessizce atlanıyor,
// yani adı değiştiren iş tam da worktree'de yapılırken test boş geçiyordu (denetim lib-R5). Git'in
// ortak dizini (`…/sadrazam/.git`) worktree'den de ana depoyu gösterir; git yoksa kök kullanılır.
const mainRoot = (() => {
  try {
    const commonDir = execFileSync('git', ['rev-parse', '--path-format=absolute', '--git-common-dir'], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    });

    return path.dirname(commonDir.trim());
  } catch {
    return root;
  }
})();

// Sass `@use` çözümü: `_ad.scss` · `ad.scss` · `ad/_index.scss` · `ad/index.scss`
const resolves = (target) => {
  const base = path.join(root, 'src/scss', target);
  const name = path.basename(base);

  return [`_${name}.scss`, `${name}.scss`, `${name}/_index.scss`, `${name}/index.scss`]
    .some((candidate) => existsSync(path.join(path.dirname(base), candidate)));
};

const scssFiles = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const full = path.join(dir, entry.name);

  if (entry.isDirectory()) {
    return scssFiles(full);
  }

  return entry.name.endsWith('.scss') ? [full] : [];
});

const sadrazamImports = (resources) => scssFiles(resources).flatMap((file) => [
  ...readFileSync(file, 'utf8').matchAll(/@(?:use|forward|import)\s+['"]sadrazam\/scss\/([^'"]+)['"]/g)
].map((match) => ({ file: path.relative(resources, file), target: match[1] })));

describe('Tüketici içe aktarmaları', () => {
  for (const name of consumers) {
    const resources = path.join(mainRoot, '..', name, 'resources');

    it.skipIf(!existsSync(resources))(`${name}: her 'sadrazam/scss/…' yolu var olan bir dosyaya çıkıyor`, () => {
      const imports = sadrazamImports(resources);
      const broken = imports.filter(({ target }) => !resolves(target)).map(({ file, target }) => `${file} → ${target}`);

      expect(imports.length).toBeGreaterThan(0);
      expect(broken).toEqual([]);
    });
  }
});
