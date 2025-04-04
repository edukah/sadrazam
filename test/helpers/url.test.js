import { describe, it, expect } from 'vitest';
import Url from '../../src/js/helpers/url.js';

describe('Url', () => {
  describe('get()', () => {
    it('URL\'den parametre değerini döndürür', () => {
      expect(Url.get('route', 'https://example.com?route=catalog/product')).toBe('catalog/product');
    });

    it('birden fazla parametreden doğru olanı seçer', () => {
      expect(Url.get('page', 'https://example.com?route=test&page=5&limit=20')).toBe('5');
    });

    it('olmayan parametre için null döndürür', () => {
      expect(Url.get('missing', 'https://example.com?route=test')).toBeNull();
    });

    it('parametresiz URL için null döndürür', () => {
      expect(Url.get('key', 'https://example.com')).toBeNull();
    });

    it('geçersiz URL için null döndürür ve hata fırlatmaz', () => {
      expect(Url.get('key', ':::invalid')).toBeNull();
    });

    it('göreceli URL ile çalışır', () => {
      expect(Url.get('id', '/products?id=42')).toBe('42');
    });

    it('encoded parametre değerlerini decode eder', () => {
      expect(Url.get('q', 'https://example.com?q=%C3%B6zel%20karakter')).toBe('özel karakter');
    });
  });

  describe('has()', () => {
    it('var olan parametre için true döndürür', () => {
      expect(Url.has('route', 'https://example.com?route=test')).toBe(true);
    });

    it('olmayan parametre için false döndürür', () => {
      expect(Url.has('missing', 'https://example.com?route=test')).toBe(false);
    });

    it('değeri boş olan parametre için true döndürür', () => {
      expect(Url.has('empty', 'https://example.com?empty=')).toBe(true);
    });

    it('geçersiz URL için false döndürür', () => {
      expect(Url.has('key', ':::invalid')).toBe(false);
    });
  });

  describe('set()', () => {
    it('yeni parametre ekler', () => {
      const result = Url.set('page', '2', 'https://example.com?route=test');
      expect(result).toContain('page=2');
      expect(result).toContain('route=test');
    });

    it('mevcut parametreyi günceller', () => {
      const result = Url.set('page', '3', 'https://example.com?page=1');
      expect(result).toContain('page=3');
      expect(result).not.toContain('page=1');
    });

    it('parametresiz URL\'e ilk parametreyi ekler', () => {
      const result = Url.set('key', 'value', 'https://example.com');
      expect(result).toContain('key=value');
    });

    it('göreceli path bile olsa parametre ekler', () => {
      const result = Url.set('key', 'val', '/page');
      expect(result).toContain('key=val');
    });
  });

  describe('delete()', () => {
    it('parametreyi siler', () => {
      const result = Url.delete('page', 'https://example.com?route=test&page=2');
      expect(result).not.toContain('page=');
      expect(result).toContain('route=test');
    });

    it('tek parametreyi silince soru işareti de kalkar', () => {
      const result = Url.delete('key', 'https://example.com?key=value');
      expect(result).toBe('https://example.com/');
    });

    it('olmayan parametreyi silmeye çalışınca URL değişmez', () => {
      const result = Url.delete('missing', 'https://example.com?route=test');
      expect(result).toContain('route=test');
    });

    it('parametresi olmayan URL\'den silme yapılınca URL korunur', () => {
      const result = Url.delete('key', '/page');
      expect(result).toContain('/page');
    });
  });

  describe('getAll()', () => {
    it('tüm parametreleri obje olarak döndürür', () => {
      const result = Url.getAll('https://example.com?route=test&page=2&limit=20');
      expect(result).toEqual({ route: 'test', page: '2', limit: '20' });
    });

    it('parametresiz URL için boş obje döndürür', () => {
      expect(Url.getAll('https://example.com')).toEqual({});
    });

    it('geçersiz URL için boş obje döndürür', () => {
      expect(Url.getAll(':::invalid')).toEqual({});
    });
  });

  describe('fixUrlRoute()', () => {
    it('route parametresindeki %2F\'leri slash\'a çevirir', () => {
      expect(Url.fixUrlRoute('index.php?route=catalog%2Fproduct')).toBe('index.php?route=catalog/product');
    });

    it('birden fazla %2F içeren route\'u düzeltir', () => {
      expect(Url.fixUrlRoute('index.php?route=account%2Forder%2Finfo')).toBe('index.php?route=account/order/info');
    });

    it('route dışındaki parametreleri etkilemez', () => {
      const input = 'index.php?route=catalog%2Fproduct&path=a%2Fb';
      const result = Url.fixUrlRoute(input);
      expect(result).toContain('route=catalog/product');
      expect(result).toContain('path=a%2Fb');
    });

    it('%2F içermeyen URL\'i olduğu gibi bırakır', () => {
      expect(Url.fixUrlRoute('index.php?page=1')).toBe('index.php?page=1');
    });
  });
});
