import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import FocusTrap from '../../src/js/modules/focus-trap.js';

/**
 * Görünürlük filtresi bu testin ASIL konusu: katmanın iki görünümü de DOM'da durup
 * biri `d-none` olabiliyor (çerez rızası katmanı böyle). Filtre olmasaydı Tab görünmez
 * butonlar arasında dolaşırdı.
 *
 * jsdom'da `checkVisibility` YOK ve `offsetParent` görünür/gizli ayrımı yapmıyor
 * (layout motoru yok) — bu yüzden FocusTrap atalara bakan bir kontrol kullanıyor.
 * Buradaki testler o kontrolü doğruluyor, yani üretimde koşan kod yolunu.
 */
const HTML = `
  <style>.d-none { display: none; }</style>
  <button id="outside">dışarıdaki</button>
  <div id="layer">
    <div id="view-a">
      <button id="a1">a1</button>
      <button id="a2">a2</button>
    </div>
    <div id="view-b" class="d-none">
      <button id="b1">b1</button>
      <button id="b2">b2</button>
    </div>
  </div>
`;

const tab = (shiftKey = false) => {
  const event = new globalThis.KeyboardEvent('keydown', { key: 'Tab', shiftKey, bubbles: true, cancelable: true });
  document.dispatchEvent(event);

  return event;
};

let ownerId = null;

describe('FocusTrap', () => {
  beforeEach(() => {
    document.body.innerHTML = HTML;
    ownerId = null;
  });

  afterEach(() => {
    if (ownerId) FocusTrap.remove(ownerId);
  });

  describe('insert()', () => {
    it('odağı katmanın ilk odaklanabilir elemanına taşır', () => {
      ownerId = FocusTrap.insert(document.getElementById('layer'));

      expect(document.activeElement.id).toBe('a1');
    });

    it('ownerId döndürür', () => {
      ownerId = FocusTrap.insert(document.getElementById('layer'));

      expect(typeof ownerId).toBe('string');
    });

    it('aynı ownerId ile ikinci çağrı yığına ikinci kayıt eklemez (idempotent)', () => {
      ownerId = FocusTrap.insert(document.getElementById('layer'), 'sabit');
      const second = FocusTrap.insert(document.getElementById('layer'), 'sabit');

      expect(second).toBe('sabit');

      // Tek remove yetmeli — iki kayıt olsaydı tuzak açık kalırdı
      FocusTrap.remove('sabit');
      ownerId = null;
      document.getElementById('outside').focus();
      tab();

      expect(document.activeElement.id).toBe('outside');
    });

    it('eleman verilmezse null döner', () => {
      expect(FocusTrap.insert(null)).toBeNull();
    });
  });

  describe('Tab sarması', () => {
    beforeEach(() => {
      ownerId = FocusTrap.insert(document.getElementById('layer'));
    });

    it('son elemandan sonra başa sarar', () => {
      document.getElementById('a2').focus();
      const event = tab();

      expect(event.defaultPrevented).toBe(true);
      expect(document.activeElement.id).toBe('a1');
    });

    it('Shift+Tab ile ilk elemandan sona sarar', () => {
      document.getElementById('a1').focus();
      const event = tab(true);

      expect(event.defaultPrevented).toBe(true);
      expect(document.activeElement.id).toBe('a2');
    });

    it('ortadaki elemanda araya girmez (tarayıcı doğal sırayı sürdürür)', () => {
      document.getElementById('a1').focus();
      const event = tab();

      expect(event.defaultPrevented).toBe(false);
    });

    it('odak katman dışına düşerse geri çeker', () => {
      document.getElementById('outside').focus();
      const event = tab();

      expect(event.defaultPrevented).toBe(true);
      expect(document.activeElement.id).toBe('a1');
    });
  });

  describe('görünürlük filtresi', () => {
    it('gizli görünümdeki butonları atlar', () => {
      ownerId = FocusTrap.insert(document.getElementById('layer'));

      // view-b gizli → sarma a2'den a1'e olmalı, b1'e DEĞİL
      document.getElementById('a2').focus();
      tab();

      expect(document.activeElement.id).toBe('a1');
    });

    it('görünüm değişince yeni görünümün butonlarına sarar', () => {
      document.getElementById('view-a').classList.add('d-none');
      document.getElementById('view-b').classList.remove('d-none');

      ownerId = FocusTrap.insert(document.getElementById('layer'));

      expect(document.activeElement.id).toBe('b1');

      document.getElementById('b2').focus();
      tab();

      expect(document.activeElement.id).toBe('b1');
    });

    it('devre dışı butonu atlar', () => {
      document.getElementById('a2').disabled = true;
      ownerId = FocusTrap.insert(document.getElementById('layer'));

      // Tek görünür+etkin buton a1 kaldı → sarma kendine döner
      document.getElementById('a1').focus();
      tab();

      expect(document.activeElement.id).toBe('a1');
    });
  });

  describe('remove()', () => {
    it('tuzağı kaldırır — Tab artık engellenmez', () => {
      const id = FocusTrap.insert(document.getElementById('layer'));
      FocusTrap.remove(id);

      document.getElementById('a2').focus();
      const event = tab();

      expect(event.defaultPrevented).toBe(false);
    });

    it('odağı katman açılmadan önceki elemana geri verir', () => {
      document.getElementById('outside').focus();

      const id = FocusTrap.insert(document.getElementById('layer'));

      expect(document.activeElement.id).toBe('a1');

      FocusTrap.remove(id);

      expect(document.activeElement.id).toBe('outside');
    });

    it('sahibi olmadığı kimlikle çağrılırsa hiçbir şey yapmaz', () => {
      ownerId = FocusTrap.insert(document.getElementById('layer'));

      FocusTrap.remove('baskasinin-kimligi');

      // Tuzak hâlâ aktif olmalı
      document.getElementById('a2').focus();
      const event = tab();

      expect(event.defaultPrevented).toBe(true);
    });

    it('ownerId verilmezse hiçbir şey yapmaz', () => {
      ownerId = FocusTrap.insert(document.getElementById('layer'));

      FocusTrap.remove();

      document.getElementById('a2').focus();
      const event = tab();

      expect(event.defaultPrevented).toBe(true);
    });
  });

  describe('yığın', () => {
    it('en üstteki katman Tab\'ı yönetir', () => {
      const outer = FocusTrap.insert(document.getElementById('view-a'), 'dis');

      document.getElementById('view-b').classList.remove('d-none');
      const inner = FocusTrap.insert(document.getElementById('view-b'), 'ic');

      expect(document.activeElement.id).toBe('b1');

      // Üstteki (view-b) sarmalı — a1'e gitmemeli
      document.getElementById('b2').focus();
      tab();

      expect(document.activeElement.id).toBe('b1');

      FocusTrap.remove(inner);
      FocusTrap.remove(outer);
    });

    it('alttaki katman kapatılınca üsttekinin odağını çalmaz', () => {
      document.getElementById('outside').focus();

      const outer = FocusTrap.insert(document.getElementById('view-a'), 'dis');

      document.getElementById('view-b').classList.remove('d-none');
      const inner = FocusTrap.insert(document.getElementById('view-b'), 'ic');

      expect(document.activeElement.id).toBe('b1');

      // Alttaki sıra dışı kapanıyor, üstteki HÂLÂ açık. Odak geri verilirse
      // kullanıcı hâlâ görünen katmanın arkasına düşer.
      FocusTrap.remove(outer);

      expect(document.activeElement.id).toBe('b1');

      // Üstteki kapanınca odak restore edilir — kendi kaydına.
      FocusTrap.remove(inner);

      expect(document.activeElement.id).toBe('a1');
    });
  });
});
