import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Form from '../../src/js/helpers/form.js';

// Form, Snackbar + Language import ediyor — DOM testinde deterministik olsun diye mock'la.
vi.mock('../../src/js/modules/snackbar.js', () => ({
  default: { insert: vi.fn() }
}));
vi.mock('../../src/js/language/core/language.js', () => ({
  default: { get: (key) => key }
}));

/**
 * Form.clearInputMessage(input) — gösterilen validasyon hatasını (is-error + mesaj) programatik temizler.
 * Kullanım: alan disabled yapılmadan gizlenince observer-tabanlı otomatik temizlik tetiklenmez.
 */
describe('Form.clearInputMessage', () => {
  let form;
  let input;

  beforeEach(() => {
    form = document.createElement('form');
    input = document.createElement('input');
    input.name = 'password';
    input.setAttribute('data-form-validate', 'required');
    form.appendChild(input);
    document.body.appendChild(form);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('gösterilen hatayı temizler (is-error + mesaj span + message-id attribute)', () => {
    // Boş required input'u doğrula → hata göster
    Form.validate(input);
    expect(input.classList.contains('is-error')).toBe(true);
    const msgId = input.getAttribute('data-form-validate-message-id');
    expect(msgId).toBeTruthy();
    expect(document.getElementById(msgId)).not.toBeNull();

    // Temizle → hepsi gitmeli
    Form.clearInputMessage(input);
    expect(input.classList.contains('is-error')).toBe(false);
    expect(input.getAttribute('data-form-validate-message-id')).toBeNull();
    expect(document.getElementById(msgId)).toBeNull();
  });

  it('hatası olmayan input için no-op (throw etmez)', () => {
    expect(() => Form.clearInputMessage(input)).not.toThrow();
    expect(input.classList.contains('is-error')).toBe(false);
  });

  it('null/undefined için güvenli (throw etmez)', () => {
    expect(() => Form.clearInputMessage(null)).not.toThrow();
    expect(() => Form.clearInputMessage(undefined)).not.toThrow();
  });
});
