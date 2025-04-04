import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Form from '../../src/js/helpers/form.js';

// Snackbar mock (Form import ediyor)
vi.mock('../../src/js/modules/snackbar.js', () => ({
  default: { insert: vi.fn() }
}));

/**
 * Form.rules test suite.
 * Her kural fonksiyonu: (item, form, ruleValue) => null | string | object
 * null = geçerli, string/object = hata
 */
describe('Form.rules', () => {
  let form;

  beforeEach(() => {
    form = document.createElement('form');
    document.body.appendChild(form);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  // --- Yardımcı fonksiyon ---
  const createInput = (attrs = {}) => {
    const input = document.createElement('input');
    Object.entries(attrs).forEach(([key, value]) => {
      if (key === 'value') {
        input.value = value;
      } else {
        input.setAttribute(key, value);
      }
    });
    form.appendChild(input);

    return input;
  };

  const createSelect = (selectedValue = '') => {
    const select = document.createElement('select');
    const option = document.createElement('option');
    option.value = selectedValue;
    option.textContent = 'Option';
    select.appendChild(option);
    select.value = selectedValue;
    form.appendChild(select);

    return select;
  };

  // --- required ---
  describe('required', () => {
    it('boş input için hata döndürür', () => {
      const input = createInput({ value: '' });
      expect(Form.rules.required(input, form)).toBe('requiredDefault');
    });

    it('dolu input için null döndürür', () => {
      const input = createInput({ value: 'test' });
      expect(Form.rules.required(input, form)).toBeNull();
    });

    it('sadece boşluk içeren input için hata döndürür', () => {
      const input = createInput({ value: '   ' });
      expect(Form.rules.required(input, form)).toBe('requiredDefault');
    });

    it('boş select için requiredSelect döndürür', () => {
      const select = createSelect('');
      expect(Form.rules.required(select, form)).toBe('requiredSelect');
    });

    it('seçilmemiş radio için requiredRadio döndürür', () => {
      const radio = createInput({ type: 'radio', name: 'gender', value: 'male' });
      expect(Form.rules.required(radio, form)).toBe('requiredRadio');
    });

    it('seçili radio için null döndürür', () => {
      const radio = createInput({ type: 'radio', name: 'color', value: 'red' });
      radio.checked = true;
      expect(Form.rules.required(radio, form)).toBeNull();
    });

    it('seçilmemiş checkbox için requiredRadio döndürür', () => {
      const cb = createInput({ type: 'checkbox', name: 'terms', value: '1' });
      expect(Form.rules.required(cb, form)).toBe('requiredRadio');
    });
  });

  // --- email ---
  describe('email', () => {
    it('geçerli e-posta için null döndürür', () => {
      const input = createInput({ value: 'user@example.com' });
      expect(Form.rules.email(input)).toBeNull();
    });

    it('geçersiz e-posta için hata döndürür', () => {
      const input = createInput({ value: 'not-an-email' });
      expect(Form.rules.email(input)).toBe('emailFormat');
    });

    it('@ eksik e-posta için hata döndürür', () => {
      const input = createInput({ value: 'user.example.com' });
      expect(Form.rules.email(input)).toBe('emailFormat');
    });

    it('boş değer için null döndürür (required ile kombine edilir)', () => {
      const input = createInput({ value: '' });
      expect(Form.rules.email(input)).toBeNull();
    });
  });

  // --- matches ---
  describe('matches', () => {
    it('eşleşen değerler için null döndürür', () => {
      createInput({ name: 'password', value: 'secret123' });
      const confirm = createInput({ value: 'secret123' });
      expect(Form.rules.matches(confirm, form, 'password')).toBeNull();
    });

    it('eşleşmeyen değerler için hata döndürür', () => {
      createInput({ name: 'password', value: 'secret123' });
      const confirm = createInput({ value: 'different' });
      expect(Form.rules.matches(confirm, form, 'password')).toBe('confirmMismatch');
    });

    it('boş değer için null döndürür', () => {
      createInput({ name: 'password', value: 'secret123' });
      const confirm = createInput({ value: '' });
      expect(Form.rules.matches(confirm, form, 'password')).toBeNull();
    });
  });

  // --- not_match ---
  describe('not_match', () => {
    it('farklı değerler için null döndürür', () => {
      createInput({ name: 'current', value: 'old_pass' });
      const newPass = createInput({ value: 'new_pass' });
      expect(Form.rules.not_match(newPass, form, 'current')).toBeNull();
    });

    it('aynı değerler için hata döndürür', () => {
      createInput({ name: 'current', value: 'same_pass' });
      const newPass = createInput({ value: 'same_pass' });
      expect(Form.rules.not_match(newPass, form, 'current')).toBe('currentSame');
    });
  });

  // --- min_length / max_length ---
  describe('min_length', () => {
    it('yeterli uzunlukta değer için null döndürür', () => {
      const input = createInput({ value: 'abcdef' });
      expect(Form.rules.min_length(input, form, '3')).toBeNull();
    });

    it('kısa değer için hata döndürür', () => {
      const input = createInput({ value: 'ab' });
      const result = Form.rules.min_length(input, form, '5');
      expect(result).toEqual({ key: 'minLength', params: { value: '5' } });
    });

    it('boş değer için null döndürür', () => {
      const input = createInput({ value: '' });
      expect(Form.rules.min_length(input, form, '3')).toBeNull();
    });
  });

  describe('max_length', () => {
    it('sınır içinde değer için null döndürür', () => {
      const input = createInput({ value: 'abc' });
      expect(Form.rules.max_length(input, form, '5')).toBeNull();
    });

    it('uzun değer için hata döndürür', () => {
      const input = createInput({ value: 'abcdefghij' });
      const result = Form.rules.max_length(input, form, '5');
      expect(result).toEqual({ key: 'maxLength', params: { value: '5' } });
    });
  });

  // --- min_value / max_value ---
  describe('min_value', () => {
    it('sınırdan büyük değer için null döndürür', () => {
      const input = createInput({ value: '100' });
      expect(Form.rules.min_value(input, form, '10')).toBeNull();
    });

    it('sınırdan küçük değer için hata döndürür', () => {
      const input = createInput({ value: '5' });
      const result = Form.rules.min_value(input, form, '10');
      expect(result).toEqual({ key: 'limitMin', params: { value: '10' } });
    });

    it('sınıra eşit değer için null döndürür', () => {
      const input = createInput({ value: '10' });
      expect(Form.rules.min_value(input, form, '10')).toBeNull();
    });

    it('boş değer için null döndürür', () => {
      const input = createInput({ value: '' });
      expect(Form.rules.min_value(input, form, '10')).toBeNull();
    });

    it('virgüllü sayıyı doğru parse eder', () => {
      const input = createInput({ value: '1,500' });
      expect(Form.rules.min_value(input, form, '1000')).toBeNull();
    });
  });

  describe('max_value', () => {
    it('sınırdan küçük değer için null döndürür', () => {
      const input = createInput({ value: '5' });
      expect(Form.rules.max_value(input, form, '100')).toBeNull();
    });

    it('sınırdan büyük değer için hata döndürür', () => {
      const input = createInput({ value: '200' });
      const result = Form.rules.max_value(input, form, '100');
      expect(result).toEqual({ key: 'limitMax', params: { value: '100' } });
    });
  });

  // --- less_than / greater_than ---
  describe('less_than', () => {
    it('küçük değer için null döndürür', () => {
      createInput({ name: 'max_price', value: '100' });
      const minInput = createInput({ value: '50' });
      expect(Form.rules.less_than(minInput, form, 'max_price')).toBeNull();
    });

    it('büyük değer için hata döndürür', () => {
      createInput({ name: 'max_price', value: '100' });
      const minInput = createInput({ value: '200' });
      const result = Form.rules.less_than(minInput, form, 'max_price');
      expect(result).toEqual({ key: 'minCompare', params: { value: '100' } });
    });

    it('hedef input yoksa null döndürür', () => {
      const input = createInput({ value: '50' });
      expect(Form.rules.less_than(input, form, 'nonexistent')).toBeNull();
    });
  });

  describe('greater_than', () => {
    it('büyük değer için null döndürür', () => {
      createInput({ name: 'min_price', value: '50' });
      const maxInput = createInput({ value: '100' });
      expect(Form.rules.greater_than(maxInput, form, 'min_price')).toBeNull();
    });

    it('küçük değer için hata döndürür', () => {
      createInput({ name: 'min_price', value: '100' });
      const maxInput = createInput({ value: '50' });
      const result = Form.rules.greater_than(maxInput, form, 'min_price');
      expect(result).toEqual({ key: 'maxCompare', params: { value: '100' } });
    });
  });

  // --- regex ---
  describe('regex', () => {
    it('eşleşen pattern için null döndürür', () => {
      const input = createInput({ value: '12345' });
      expect(Form.rules.regex(input, form, '^\\d+$')).toBeNull();
    });

    it('eşleşmeyen pattern için hata döndürür', () => {
      const input = createInput({ value: 'abc' });
      expect(Form.rules.regex(input, form, '^\\d+$')).toBe('regexMismatch');
    });

    it('boş değer için null döndürür', () => {
      const input = createInput({ value: '' });
      expect(Form.rules.regex(input, form, '^\\d+$')).toBeNull();
    });

    it('geçersiz regex pattern için null döndürür (hata fırlatmaz)', () => {
      const input = createInput({ value: 'test' });
      expect(Form.rules.regex(input, form, '[invalid')).toBeNull();
    });
  });
});
