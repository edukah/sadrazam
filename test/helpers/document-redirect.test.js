import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Document from '../../src/js/helpers/document.js';

/**
 * `redirect` adresi ÇÖZMEDEN kullanır. Sunucu bir adresi "aynı site" diye onayladıysa tarayıcı
 * tam o dizgeye gitmeli. Eskiden `decodeURIComponent` onaydan SONRA bir katman daha çözüyordu:
 * `/%2F%2Fevil.example/` sunucuda göreli bir yoldu, çözülünce `///evil.example/` olup başka siteye
 * gidiyordu (Dükkan'da girişten sonra dış siteye yönlendirme, 2026-10-22).
 *
 * jsdom gezinemiyor ve `window.location` yeniden tanımlanamıyor. Bu yüzden `window`'un yerine
 * sahtesi konur. `href`'e yazılan dizge olduğu gibi kaydedilir. Tarayıcıdaki gibi, adres yalnız
 * aynı belge içinde parçaya (#) gidişte hemen değişir; başka belgeye gidişte eski adres kalır.
 */
const fakeWindow = (current) => {
  const location = {
    assigned: [],
    reloads: 0,
    current,
    get href () {
      return this.current;
    },
    set href (value) {
      this.assigned.push(value);
      const target = new URL(value, this.current);
      if (target.hash !== '' && target.href.split('#')[0] === this.current.split('#')[0]) {
        this.current = target.href;
      }
    },
    reload () {
      this.reloads++;
    }
  };

  return { location };
};

const redirect = (url, current = 'https://shop.example/hesabim/giris') => {
  const win = fakeWindow(current);
  vi.stubGlobal('window', win);
  Document.redirect(url, 0);
  vi.runAllTimers();

  return win.location;
};

describe('Document.redirect', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  describe('adres çözülmeden kullanılır', () => {
    it('kodlanmış çift bölü aynı sitede kalır', () => {
      const location = redirect('/%2F%2Fevil.example/');

      expect(location.assigned).toEqual(['/%2F%2Fevil.example/']);
      expect(new URL(location.assigned[0], location.current).hostname).toBe('shop.example');
    });

    it('kullanıcı bilgisindeki kodlanmış bölü sunucuyu değiştirmez', () => {
      const location = redirect('https://evil.example%2F@shop.example/');

      expect(location.assigned).toEqual(['https://evil.example%2F@shop.example/']);
      expect(new URL(location.assigned[0]).hostname).toBe('shop.example');
    });

    it('kodlanmış dönüş adresi tek parametre kalır, `%26` ikinci parametreye bölünmez', () => {
      const url = '/giris?return_url=https%3A%2F%2Fshop.example%2Furun%3Fa%3D1%26b%3D2';
      const location = redirect(url);
      const query = new URL(location.assigned[0], location.current).searchParams;

      expect(location.assigned).toEqual([url]);
      expect(query.get('return_url')).toBe('https://shop.example/urun?a=1&b=2');
      expect(query.has('b')).toBe(false);
    });

    it('geçersiz `%` dizisi gezinmeyi durdurmaz', () => {
      const location = redirect('/arama?q=100%');

      expect(location.assigned).toEqual(['/arama?q=100%']);
    });
  });

  describe('yenileme', () => {
    it.each([['refresh'], [null], ['']])('%j sayfayı yeniler, adrese dokunmaz', (url) => {
      const location = redirect(url);

      expect(location.reloads).toBe(1);
      expect(location.assigned).toEqual([]);
    });
  });

  describe('yalnız parça değişirse sayfa yenilenir', () => {
    it('aynı sayfanın parçası → yeniler', () => {
      const location = redirect('https://shop.example/urun#yorumlar', 'https://shop.example/urun');

      expect(location.reloads).toBe(1);
    });

    it('yolunda kodlanmış karakter olan sayfada da yeniler', () => {
      const page = 'https://shop.example/%C3%BCr%C3%BCn';
      const location = redirect(`${page}#yorumlar`, page);

      expect(location.reloads).toBe(1);
    });

    it('başka sayfaya giderken yenilemez', () => {
      const location = redirect('https://shop.example/b#x', 'https://shop.example/a');

      expect(location.assigned).toEqual(['https://shop.example/b#x']);
      expect(location.reloads).toBe(0);
    });
  });
});
