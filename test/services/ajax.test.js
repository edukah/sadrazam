import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Bağımlılıkları mock'la
vi.mock('../../src/js/modules/spinner.js', () => ({
  default: { show: vi.fn(), hide: vi.fn() }
}));
vi.mock('../../src/js/modules/snackbar.js', () => ({
  default: { insert: vi.fn() }
}));
vi.mock('../../src/js/language/core/language.js', () => ({
  default: { get: vi.fn((key) => `[${key}]`) }
}));
vi.mock('../../src/js/services/log-relay.js', () => ({
  default: { capture: vi.fn() }
}));

import Ajax from '../../src/js/services/ajax.js';
import Spinner from '../../src/js/modules/spinner.js';
import Snackbar from '../../src/js/modules/snackbar.js';

describe('Ajax', () => {
  let fetchMock;

  beforeEach(() => {
    fetchMock = vi.fn();
    globalThis.fetch = fetchMock;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // --- Yardımcı: Başarılı fetch response oluştur ---
  const mockResponse = (body, { status = 200, contentType = 'application/json' } = {}) => {
    return Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      headers: new Headers({ 'Content-Type': contentType }),
      text: () => Promise.resolve(typeof body === 'string' ? body : JSON.stringify(body))
    });
  };

  // --- request() ---
  describe('request()', () => {
    it('başarılı JSON isteği: parsed data döndürür', async () => {
      const responseBody = { success: true, items: [1, 2, 3] };
      fetchMock.mockReturnValue(mockResponse(responseBody));

      const result = await Ajax.request({ route: 'catalog/product' });
      expect(result).toEqual(responseBody);
    });

    it('route prefix: route otomatik olarak index.php?route= ile sarılır', async () => {
      fetchMock.mockReturnValue(mockResponse({ ok: true }));

      await Ajax.request({ route: 'catalog/product' });
      expect(fetchMock).toHaveBeenCalledWith(
        'index.php?route=catalog/product',
        expect.any(Object)
      );
    });

    it('http ile başlayan route olduğu gibi kullanılır', async () => {
      fetchMock.mockReturnValue(mockResponse({ ok: true }));

      await Ajax.request({ route: 'https://api.example.com/data' });
      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.example.com/data',
        expect.any(Object)
      );
    });

    it('GET isteği: data parametreleri URL\'e eklenir', async () => {
      fetchMock.mockReturnValue(mockResponse({ ok: true }));

      await Ajax.request({ route: 'search', type: 'get', data: { q: 'test', page: '1' } });
      const calledUrl = fetchMock.mock.calls[0][0];
      expect(calledUrl).toContain('q=test');
      expect(calledUrl).toContain('page=1');
    });

    it('POST isteği: data body\'de gönderilir (URLSearchParams)', async () => {
      fetchMock.mockReturnValue(mockResponse({ ok: true }));

      await Ajax.request({ route: 'form/submit', type: 'post', data: { name: 'test' } });
      const fetchOptions = fetchMock.mock.calls[0][1];
      expect(fetchOptions.method).toBe('POST');
      expect(fetchOptions.body).toContain('name=test');
      expect(fetchOptions.headers['Content-Type']).toContain('application/x-www-form-urlencoded');
    });

    it('POST FormData: Content-Type header eklenmez (browser set eder)', async () => {
      fetchMock.mockReturnValue(mockResponse({ ok: true }));
      const formData = new FormData();
      formData.append('file', 'data');

      await Ajax.request({ route: 'upload', data: formData });
      const fetchOptions = fetchMock.mock.calls[0][1];
      expect(fetchOptions.headers['Content-Type']).toBeUndefined();
      expect(fetchOptions.body).toBe(formData);
    });

    it('X-Requested-With header her zaman gönderilir', async () => {
      fetchMock.mockReturnValue(mockResponse({ ok: true }));

      await Ajax.request({ route: 'test' });
      const fetchOptions = fetchMock.mock.calls[0][1];
      expect(fetchOptions.headers['X-Requested-With']).toBe('XMLHttpRequest');
    });

    it('non-JSON response: raw text döndürür', async () => {
      fetchMock.mockReturnValue(mockResponse('<html>OK</html>', { contentType: 'text/html' }));

      const result = await Ajax.request({ route: 'page' });
      expect(result).toBe('<html>OK</html>');
    });
  });

  // --- Callbacks ---
  describe('callbacks', () => {
    it('success callback çağrılır', async () => {
      fetchMock.mockReturnValue(mockResponse({ ok: true }));
      const successFn = vi.fn();

      await Ajax.request({ route: 'test', success: successFn });
      expect(successFn).toHaveBeenCalledTimes(1);
      expect(successFn.mock.calls[0][0]).toHaveProperty('status', 200);
    });

    it('beforeStart ve afterEnd callback\'leri çağrılır', async () => {
      fetchMock.mockReturnValue(mockResponse({ ok: true }));
      const callOrder = [];
      const beforeStart = vi.fn(() => callOrder.push('before'));
      const afterEnd = vi.fn(() => callOrder.push('after'));

      await Ajax.request({ route: 'test', beforeStart, afterEnd });
      expect(callOrder).toEqual(['before', 'after']);
    });

    it('complete callback her zaman çağrılır', async () => {
      fetchMock.mockReturnValue(mockResponse({ ok: true }));
      const complete = vi.fn();

      await Ajax.request({ route: 'test', complete });
      expect(complete).toHaveBeenCalledTimes(1);
    });
  });

  // --- Error handling ---
  describe('error handling', () => {
    it('HTTP 404 hatası: error callback çağrılır ve throw eder', async () => {
      fetchMock.mockReturnValue(mockResponse(
        { message: { error: ['Not Found'] } },
        { status: 404 }
      ));
      const errorFn = vi.fn();

      await expect(Ajax.request({ route: 'missing', error: errorFn })).rejects.toThrow();
      expect(errorFn).toHaveBeenCalledTimes(1);
      expect(Snackbar.insert).toHaveBeenCalled();
    });

    it('HTTP 500 hatası: Snackbar ile hata gösterilir', async () => {
      fetchMock.mockReturnValue(mockResponse(
        { message: { error: ['Server Error'] } },
        { status: 500 }
      ));

      await expect(Ajax.request({ route: 'crash' })).rejects.toThrow();
      expect(Snackbar.insert).toHaveBeenCalledWith({ error: ['Server Error'] });
    });

    it('network hatası: TypeError fırlatır', async () => {
      fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

      await expect(Ajax.request({ route: 'offline' })).rejects.toThrow(TypeError);
      expect(Snackbar.insert).toHaveBeenCalled();
    });

    it('hata durumunda afterEnd yine çağrılır (finally)', async () => {
      fetchMock.mockRejectedValue(new TypeError('Network error'));
      const afterEnd = vi.fn();

      await expect(Ajax.request({ route: 'test', afterEnd })).rejects.toThrow();
      expect(afterEnd).toHaveBeenCalledTimes(1);
    });
  });

  // --- Spinner ---
  describe('spinner', () => {
    it('spinner: true ise gösterilir ve gizlenir', async () => {
      fetchMock.mockReturnValue(mockResponse({ ok: true }));

      await Ajax.request({ route: 'test', spinner: 'main' });
      expect(Spinner.show).toHaveBeenCalledWith({ type: 'main' });
      expect(Spinner.hide).toHaveBeenCalled();
    });

    it('spinner: false ise gösterilmez', async () => {
      fetchMock.mockReturnValue(mockResponse({ ok: true }));

      await Ajax.request({ route: 'test', spinner: false });
      expect(Spinner.show).not.toHaveBeenCalled();
    });
  });

  // --- Button lock/unlock ---
  describe('button lock/unlock', () => {
    it('istek sırasında buton kilitlenir, bitince açılır', async () => {
      fetchMock.mockReturnValue(mockResponse({ ok: true }));
      const button = document.createElement('button');

      await Ajax.request({ route: 'test', button });
      expect(button.classList.contains('bttn--loading')).toBe(false);
      expect(button.disabled).toBe(false);
    });

    it('iç içe isteklerde refCount doğru çalışır', async () => {
      fetchMock.mockReturnValue(mockResponse({ ok: true }));
      const button = document.createElement('button');

      // İlk istek
      const p1 = Ajax.request({ route: 'outer', button });
      // Buton kilitli olmalı (istek devam ediyor)
      expect(button.classList.contains('bttn--loading')).toBe(true);
      expect(button.disabled).toBe(true);

      await p1;
      // İstek bitti, kilit açılmalı
      expect(button.classList.contains('bttn--loading')).toBe(false);
      expect(button.disabled).toBe(false);
    });
  });

  // --- send() ---
  describe('send()', () => {
    it('fire-and-forget: hata fırlatmaz', async () => {
      fetchMock.mockRejectedValue(new TypeError('Network'));

      expect(() => Ajax.send({ route: 'test' })).not.toThrow();
      // send() asenkron, promise'in settle olmasını bekle
      await vi.waitFor(() => {
        expect(fetchMock).toHaveBeenCalled();
      });
    });
  });
});
