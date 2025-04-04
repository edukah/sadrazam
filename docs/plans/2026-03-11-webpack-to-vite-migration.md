# Webpack → Vite Migration Plan

**Goal:** Tum workbench projelerini Webpack'ten Vite'a gecirmek. Daha hizli build, daha az config, daha az dependency.

**Strateji:** Kucukten buyuge — once library'ler (basit), sonra Dukkan (karmasik).

---

## Neden?

| | Webpack | Vite |
|---|---|---|
| Config | 3 dosya, ~150 satir | 1 dosya, ~30 satir |
| CSS extract | MiniCssExtractPlugin + `.junk` trick + CleanWebpackPlugin | Built-in |
| SCSS | sass-loader + css-loader | Built-in (`npm i sass`) |
| Transpile | babel-loader + @babel/preset-env | esbuild (20-100x hizli) |
| Dev server | webpack-dev-server, livereload | Built-in HMR, anlik |
| Library build | Manuel UMD/ESM config, multi-compiler sorunlari | `build.lib` tek config |

**Kaldirilacak dependency'ler (proje basina ~10 paket):**
- `webpack`, `webpack-cli`, `webpack-dev-server`, `webpack-merge`
- `babel-loader`, `@babel/cli`, `@babel/core`, `@babel/preset-env`
- `css-loader`, `style-loader`, `sass-loader`
- `mini-css-extract-plugin`, `clean-webpack-plugin`
- `eslint-webpack-plugin`

---

## Sira

1. **Sadrazam** — En basit library, UMD + ESM build, dev server
2. **Kaysa** — Kucuk library, Sadrazam ile ayni yapi
3. **Minyatur** — Kucuk library, Sadrazam ile ayni yapi
4. **Yazman** — Library, Sadrazam'a dependency'si var
5. **Dukkan** — En karmasik: glob mirror pattern, multi-entry, scope'lar

---

## Faz 1: Sadrazam

### Mevcut Webpack Yapisi

```
webpack.common.js  — Loader'lar, plugin'ler, alias'lar
webpack.dev.js     — Dev server (port 9001, SSL, livereload)
webpack.prod.js    — UMD + ESM build, TerserPlugin
```

### Hedef Vite Yapisi

```
vite.config.js     — Tek dosya, hersey burada
```

### Ornek `vite.config.js`

```js
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/js/index.js'),
      name: 'Sadrazam',
      formats: ['es', 'umd'],
      fileName: (format) => format === 'es' ? 'sadrazam.esm.js' : 'sadrazam.min.js'
    },
    cssFileName: 'sadrazam.min',
    outDir: 'dist',
    rollupOptions: {
      output: {
        assetFileNames: '[name].[ext]'
      }
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern',
        loadPaths: [resolve(__dirname, '..')]
      }
    }
  },
  server: {
    port: 9001,
    open: true
  }
});
```

### Adimlar

1. `npm install vite --save-dev`
2. `vite.config.js` olustur
3. `package.json` script'lerini guncelle (`vite` / `vite build`)
4. Build test: `npm run build` — dist/ ciktisini karsilastir
5. Dev test: `npm run dev` — dev server calistigini dogrula
6. Eski webpack config dosyalarini sil
7. Kullanilmayan dependency'leri kaldir
8. Dukkan'da `import Sadrazam from "sadrazam"` hala calistigini dogrula

---

## Faz 2: Kaysa + Minyatur

Sadrazam ile ayni yapi. Sadrazam basarili olduktan sonra ayni pattern'i uygula.

---

## Faz 3: Yazman

Sadrazam'a dependency'si var. Sadrazam Vite'a gecmis olmali. `resolve.alias` ile workspace symlink'leri cozumle.

---

## Faz 4: Dukkan (En Karmasik)

### Zorluklar

1. **Glob mirror pattern**: `resources/**/*.{js,scss}` taranip `public/dist/`'e mirror ediliyor
2. **Multi-entry**: Sayfa basina ayri JS + CSS dosyasi (tek bundle degil)
3. **Component exclusion**: `components/` ve `_` partial'lar haric
4. **UMD output**: Her scope dosyasi UMD olarak export ediliyor
5. **Alias'lar**: `@components`, `@core`, `@scopes`
6. **SSL dev server**: `dukkan.dev` domain'i, mkcert sertifikalari

### Vite Karsiligi

| Webpack | Vite |
|---|---|
| `glob.sync` ile entry bulma | `import.meta.glob` veya Rollup `input` objesi |
| MiniCssExtractPlugin + junk | Built-in CSS extraction |
| `resolve.alias` | `resolve.alias` (ayni) |
| babel-loader | esbuild (otomatik) |
| webpack-dev-server + SSL | `server.https` |
| CleanWebpackPlugin | Vite `emptyOutDir: true` (varsayilan) |

### Ornek Yaklasim

```js
import { defineConfig } from 'vite';
import { resolve } from 'path';
import { globSync } from 'glob';

// Glob ile entry'leri bul (webpack'teki mirror pattern)
const jsEntries = globSync('resources/**/!(_)*.js', {
  ignore: ['resources/components/**']
});
const scssEntries = globSync('resources/**/!(_)*.scss', {
  ignore: ['resources/components/**']
});

// Rollup input objesi olustur
const input = {};
for (const file of [...jsEntries, ...scssEntries]) {
  const key = file.replace('resources/', '');
  input[key] = resolve(__dirname, file);
}

export default defineConfig({
  build: {
    rollupOptions: {
      input,
      output: {
        entryFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    },
    outDir: 'public/dist'
  },
  resolve: {
    alias: {
      '@components': resolve(__dirname, 'resources/components'),
      '@core': resolve(__dirname, 'resources/core'),
      '@scopes': resolve(__dirname, 'resources/scopes')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern',
        loadPaths: [resolve(__dirname, '..')]
      }
    }
  },
  server: {
    port: 9000,
    https: {
      cert: '/etc/ssl/localcerts/dukkan.dev.pem',
      key: '/etc/ssl/localcerts/dukkan.dev-key.pem'
    }
  }
});
```

### Adimlar

1. Sadrazam/Kaysa/Minyatur/Yazman gecisleri tamamlanmis olmali
2. `vite.config.js` olustur (glob mirror + alias + SSL)
3. Build test: cikti dosyalarini webpack ciktisiyla karsilastir
4. Dev test: dev server + livereload
5. PHP template'lerin asset yollarini dogrula (`/dist/` vs `/_hot/dist/`)
6. Eski webpack dosyalarini ve dependency'leri temizle

---

## Riskler

| Risk | Azaltma |
|---|---|
| UMD output farki | Rollup UMD output'unu webpack ile karsilastir |
| Dev server davranisi | HMR vs livereload farki test edilmeli |
| SCSS resolution | `loadPaths` ayni sekilde calistigini dogrula |
| Glob pattern farki | Cikti dosya listelerini karsilastir |
| Eski tarayici desteği | `build.target` ayari ile kontrol et |

---

## Notlar

- Her faz bagimsiz commit'lenir
- Bir faz basarisiz olursa geri alinabilir (webpack config'ler commit'te duruyor)
- Vite 6+ kullanilmali (en guncel, stabil)
