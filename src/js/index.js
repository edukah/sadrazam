import './core/polyfills.js';
import helpData from './docs/help.json';

// ---------------------------------------------------------------------------
// Core — Event system and polyfills
// ---------------------------------------------------------------------------
import Event from './core/event.js';

// ---------------------------------------------------------------------------
// Language — i18n singleton with async locale loading (en, tr)
// ---------------------------------------------------------------------------
import Language from './language/core/language.js';

// ---------------------------------------------------------------------------
// Services — Application-level singletons (network, error tracking)
//   Ajax       : Promise-based Fetch wrapper with button lock & ref counting
//   LogRelay   : Global JS error capture → backend relay (sendBeacon)
// ---------------------------------------------------------------------------
import Ajax from './services/ajax.js';
import LogRelay from './services/log-relay.js';

// ---------------------------------------------------------------------------
// Helpers — Stateless utilities (no DOM rendering, no lifecycle)
//   Form / Token               : Form validation (data-fvalidate) & CSRF
//   Cookie / Url               : Cookie CRUD, URL param helpers
//   Document / InsertScript     : Redirect, clipboard, UUID, script execution
//   AutosizeSelect / Textarea  : Auto-sizing form inputs
//   Browser / Device / Viewport : Environment detection (visibility, touch, dimensions)
//   ScrollHistory               : Scroll position persistence via cookie
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Modules — Interactive UI components (DOM rendering, lifecycle, destroy)
// ---------------------------------------------------------------------------

// Overlay / Dialog — Positioned layers above page content
//   Modal     : Dialog with focus trap, backdrop, auto-close
//   Toast     : Modal-based timed alert (pops up, delivers message, disappears)
//   Snackbar       : Inline/popup notification bar (colorful, horizontal)
//   SnackbarRelay  : Cross-page snackbar relay via sessionStorage
//   Tooltip        : Smart-positioned hover/touch tooltip
//   Popover   : Smart-positioned click/hover popover with content callback
import Modal from './modules/modal.js';
import Toast from './modules/toast.js';
import Snackbar from './modules/snackbar.js';
import SnackbarRelay from './modules/snackbar-relay.js';
import Tooltip from './modules/tooltip.js';
import Popover from './modules/popover.js';

// Navigation — Menus and tabbed content
//   Tabs       : Tab groups with URL hash sync, session persistence, WAI-ARIA
//   SlideMenu  : Slide-in panel with backdrop and animation
//   Hovermenu  : Dropdown menu with hover protection
import Tabs from './modules/tabs.js';
import SlideMenu from './modules/slide-menu.js';
import Hovermenu from './modules/hovermenu.js';

// Data / Input — Content loading and form enhancement
//   Autocomplete    : Search-as-you-type with caching, keyboard nav, badges
//   InfiniteScroll  : Lazy-load on scroll with AJAX pagination
import Autocomplete from './modules/autocomplete.js';
import InfiniteScroll from './modules/infinite-scroll.js';

// Visual Indicators — Singletons with reference counting
//   ProgressBar : Top loading bar with trickle animation
//   Backdrop    : Stack-based shared backdrop (multi-owner)
import ProgressBar from './modules/progress-bar.js';
import Backdrop from './modules/backdrop.js';

// DOM Utilities — Static helpers for scroll, style, and element manipulation
//   Elem : getStyle, scrollToView, disableScroll, flash, getScrollbarWidth
import Elem from './modules/elem.js';

const Sadrazam = {
  // Core
  Event,

  // Language
  Language,

  // Services
  Ajax,
  LogRelay,

  // Helpers — Stateless utilities
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

  // Modules — Overlay / Dialog
  Modal,
  Toast,
  Snackbar,
  SnackbarRelay,
  Tooltip,
  Popover,

  // Modules — Navigation
  Tabs,
  SlideMenu,
  Hovermenu,

  // Modules — Data / Input
  Autocomplete,
  InfiniteScroll,

  // Modules — Visual Indicators (singletons, ref-counted)
  ProgressBar,
  Backdrop,

  // Modules — DOM Utilities
  Elem,

  /**
   * Configures Sadrazam and initializes its services.
   * Called once on page load by the consumer application.
   *
   * @param {object}  [config]
   * @param {string}  [config.languageCode]     Language code (e.g. 'tr', 'en', 'auto'). Default: 'auto'
   * @param {string}  [config.logEndpoint]     Backend log endpoint URL
   * @param {string}  [config.tokenSelector]   CSS selector for CSRF token input. Default: "input[name*='token_common']"
   *
   * @example
   * Sadrazam.configure({
   *     languageCode: 'tr',
   *     logEndpoint: '/api/log/js-error',
   *     tokenSelector: "input[name='_token']"
   * });
   */
  configure (config = {}) {
    Language.init(config.languageCode);
    LogRelay.init({ endpoint: config.logEndpoint });
    if (config.tokenSelector) Token.setSelector(config.tokenSelector);
  },

  help () {
    const lines = helpData.map(({ text, style }) => [`%c${text}\n`, style]);
    const messages = lines.map(([text]) => text);
    const styles = lines.flatMap(([_, style]) => style || '');

    console.info(messages.join(''), ...styles);
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

  // Helpers — Stateless utilities
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

  // Modules — Overlay / Dialog
  Modal,
  Toast,
  Snackbar,
  SnackbarRelay,
  Tooltip,
  Popover,

  // Modules — Navigation
  Tabs,
  SlideMenu,
  Hovermenu,

  // Modules — Data / Input
  Autocomplete,
  InfiniteScroll,

  // Modules — Visual Indicators
  ProgressBar,
  Backdrop,

  // Modules — DOM Utilities
  Elem
};