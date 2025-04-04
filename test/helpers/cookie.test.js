import { describe, it, expect, beforeEach } from 'vitest';
import Cookie from '../../src/js/helpers/cookie.js';

describe('Cookie', () => {
  beforeEach(() => {
    // jsdom cookie'lerini temizle
    document.cookie.split(';').forEach(cookie => {
      const name = cookie.split('=')[0].trim();
      if (name) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      }
    });
  });

  describe('set() + get()', () => {
    it('cookie ayarlar ve okur', () => {
      Cookie.set('test_key', 'test_value');
      expect(Cookie.get('test_key')).toBe('test_value');
    });

    it('özel karakterli değeri encode/decode eder', () => {
      Cookie.set('special', 'merhaba dünya & foo=bar');
      expect(Cookie.get('special')).toBe('merhaba dünya & foo=bar');
    });

    it('boş değer ayarlayabilir', () => {
      Cookie.set('empty', '');
      // Boş string encode edilince boş kalır
      expect(Cookie.get('empty')).toBe('');
    });

    it('aynı isimle tekrar set edince günceller', () => {
      Cookie.set('key', 'value1');
      Cookie.set('key', 'value2');
      expect(Cookie.get('key')).toBe('value2');
    });
  });

  describe('get()', () => {
    it('olmayan cookie için null döndürür', () => {
      expect(Cookie.get('nonexistent')).toBeNull();
    });

    it('benzer isimli cookie\'lerden doğrusunu seçer', () => {
      Cookie.set('token', 'abc');
      Cookie.set('token_extended', 'xyz');
      expect(Cookie.get('token')).toBe('abc');
      expect(Cookie.get('token_extended')).toBe('xyz');
    });
  });

  describe('delete()', () => {
    it('cookie\'yi siler', () => {
      Cookie.set('to_delete', 'value');
      expect(Cookie.get('to_delete')).toBe('value');
      Cookie.delete('to_delete');
      expect(Cookie.get('to_delete')).toBeNull();
    });

    it('olmayan cookie\'yi silmeye çalışmak hata vermez', () => {
      expect(() => Cookie.delete('nonexistent')).not.toThrow();
    });
  });

  describe('set() options', () => {
    it('path parametresi ile cookie ayarlar', () => {
      expect(() => Cookie.set('pathtest', 'val', { path: '/admin' })).not.toThrow();
    });

    it('secure parametresi ile cookie ayarlar', () => {
      expect(() => Cookie.set('sectest', 'val', { secure: true })).not.toThrow();
    });

    it('sameSite parametresi ile cookie ayarlar', () => {
      expect(() => Cookie.set('sstest', 'val', { sameSite: 'Strict' })).not.toThrow();
    });
  });
});
