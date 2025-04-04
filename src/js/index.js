import './core/polyfills.js';
import helpData from './docs/help.json';

// Core
import Event from './core/event.js';

// Language
import Language from './language/core/language.js';

// Services
import Ajax from './services/ajax.js';
import LogRelay from './services/log-relay.js';

// Helpers
import AutosizeSelect from './helpers/autosize-select.js';
import AutosizeTextarea from './helpers/autosize-textarea.js';
import Browser from './helpers/browser.js';
import Cookie from './helpers/cookie.js';
import Device from './helpers/device.js';
import Document, { InsertScript } from './helpers/document.js';
import Form from './helpers/form.js';
import ScrollHistory from './helpers/scroll-history.js';
import Token from './helpers/token.js';
import Url from './helpers/url.js';
import Viewport from './helpers/viewport.js';

// Modules
import Autocomplete from './modules/autocomplete.js';
import Backdrop from './modules/backdrop.js';
import Elem from './modules/elem.js';
import Hovermenu from './modules/hovermenu.js';
import InfiniteScroll from './modules/infinite-scroll.js';
import Modal from './modules/modal.js';
import Popover from './modules/popover.js';
import ProgressBar from './modules/progress-bar.js';
import SlideMenu from './modules/slide-menu.js';
import Snackbar from './modules/snackbar.js';
import Spinner from './modules/spinner.js';
import Tabs from './modules/tabs.js';
import Toast from './modules/toast.js';
import Tooltip from './modules/tooltip.js';

const Sadrazam = {
  // Core
  Event,

  // Language
  Language,

  // Services
  Ajax,
  LogRelay,

  // Helpers
  AutosizeSelect,
  AutosizeTextarea,
  Browser,
  Cookie,
  Device,
  Document,
  InsertScript,
  Form,
  ScrollHistory,
  Token,
  Url,
  Viewport,

  // Modules
  Autocomplete,
  Backdrop,
  Elem,
  Hovermenu,
  InfiniteScroll,
  Modal,
  Popover,
  ProgressBar,
  SlideMenu,
  Snackbar,
  Spinner,
  Tabs,
  Toast,
  Tooltip,

  /**
   * Configures Sadrazam and initializes its services.
   * Called once by Dükkan on page load.
   *
   * @param {object}  [config]
   * @param {string}  [config.languageCode]     Language code (e.g. 'tr', 'en', 'auto'). Default: 'auto'
   * @param {string}  [config.logEndpoint]     Backend log endpoint URL
   *
   * @example
   * Sadrazam.configure({
   *     languageCode: 'tr',
   *     logEndpoint: '/api/log/js-error'
   * });
   */
  configure (config = {}) {
    Language.init(config.languageCode);
    LogRelay.init({ endpoint: config.logEndpoint });
  },

  help () {
    const lines = helpData.map(({ text, style }) => [`%c${text}\n`, style]);
    const messages = lines.map(([text]) => text);
    const styles = lines.flatMap(([_, style]) => style || '');

    console.log(messages.join(''), ...styles);
  }
};

export default Sadrazam;

export {
  // Core
  Event,

  // Language
  Language,

  // Services
  Ajax,
  LogRelay,

  // Helpers
  AutosizeSelect,
  AutosizeTextarea,
  Browser,
  Cookie,
  Device,
  Document,
  InsertScript,
  Form,
  ScrollHistory,
  Token,
  Url,
  Viewport,

  // Modules
  Autocomplete,
  Backdrop,
  Elem,
  Hovermenu,
  InfiniteScroll,
  Modal,
  Popover,
  ProgressBar,
  SlideMenu,
  Snackbar,
  Spinner,
  Tabs,
  Toast,
  Tooltip
};