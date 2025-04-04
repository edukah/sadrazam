import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Token from '../../src/js/helpers/token.js';

describe('Token', () => {
  let tokenInput;

  beforeEach(() => {
    tokenInput = document.createElement('input');
    tokenInput.name = 'token_common';
    tokenInput.value = 'abc123def456';
    document.body.appendChild(tokenInput);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('get()', () => {
    it('sayfadaki token değerini döndürür', () => {
      expect(Token.get()).toBe('abc123def456');
    });

    it('token input yoksa null döndürür', () => {
      document.body.innerHTML = '';
      expect(Token.get()).toBeNull();
    });

    it('token değeri boşsa null döndürür', () => {
      tokenInput.value = '';
      expect(Token.get()).toBeNull();
    });
  });

  describe('update()', () => {
    it('token değerini günceller', () => {
      Token.update('new_token_789');
      expect(tokenInput.value).toBe('new_token_789');
    });

    it('token input yoksa hata fırlatmaz', () => {
      document.body.innerHTML = '';
      expect(() => Token.update('test')).not.toThrow();
    });
  });
});
