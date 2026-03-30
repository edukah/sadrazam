import Snackbar from './snackbar.js';

/**
 * Cross-page snackbar relay.
 *
 * Redirect öncesi mesajı sessionStorage'a yazar,
 * sonraki sayfa yüklendiğinde snackbar olarak gösterir ve siler.
 *
 * @example
 * // Kaydet (redirect öncesi)
 * Sadrazam.SnackbarRelay.set({ success: ['Kaydedildi.'] });
 * location.href = '/list';
 *
 * // Göster (sayfa yüklendiğinde — DOMContentLoaded sonrası)
 * Sadrazam.SnackbarRelay.show();
 */

const STORAGE_KEY = 'sdrzm_snackbar_relay';

class SnackbarRelay {

  /**
   * Mesajı sessionStorage'a kaydet — redirect öncesi çağrılır.
   * @param {string|object} message - Snackbar.insert() formatında mesaj.
   */
  static set (message) {
    globalThis.sessionStorage.setItem(STORAGE_KEY, globalThis.JSON.stringify(message));
  }

  /**
   * Kayıtlı mesaj varsa snackbar göster ve sil. Sayfa yüklendiğinde çağrılır.
   */
  static show () {
    const raw = globalThis.sessionStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return;
    }

    globalThis.sessionStorage.removeItem(STORAGE_KEY);

    try {
      Snackbar.insert(globalThis.JSON.parse(raw));
    } catch {
      // Bozuk veri — sessizce geç
    }
  }
}

export default SnackbarRelay;
