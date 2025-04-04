// Type definitions for Sadrazam
// Zero-dependency vanilla JavaScript UI toolkit

export default Sadrazam;

declare const Sadrazam: {
  configure(config?: { languageCode?: string; logEndpoint?: string }): void;
  help(): void;

  Modal: typeof Modal;
  Tooltip: typeof Tooltip;
  Popover: typeof Popover;
  Tabs: typeof Tabs;
  Hovermenu: typeof Hovermenu;
  SlideMenu: typeof SlideMenu;
  Autocomplete: typeof Autocomplete;
  Backdrop: typeof Backdrop;
  Snackbar: typeof Snackbar;
  Toast: typeof Toast;
  Spinner: typeof Spinner;
  ProgressBar: typeof ProgressBar;
  InfiniteScroll: typeof InfiniteScroll;

  Ajax: typeof Ajax;
  LogRelay: typeof LogRelay;
  Language: typeof Language;

  Form: typeof Form;
  AutosizeTextarea: typeof AutosizeTextarea;
  AutosizeSelect: typeof AutosizeSelect;

  Elem: typeof Elem;
  Document: typeof Document;
  InsertScript: typeof InsertScript;
  Url: typeof Url;
  Token: typeof Token;
  Cookie: typeof Cookie;
  Event: typeof Event;
  ScrollHistory: typeof ScrollHistory;
  Browser: typeof Browser;
  Device: typeof Device;
  Viewport: typeof Viewport;
};

// ---------------------------------------------------------------------------
// Modules
// ---------------------------------------------------------------------------

interface ModalOptions {
  content?: string | Element;
  size?: 'sm' | 'md' | 'lg' | 'fullscreen';
  position?: 'top' | 'center' | 'bottom';
  className?: string;
  time?: number | false;
  closeOnOuterClick?: boolean;
  closeOnClick?: boolean;
  closeAfterFunction?: (() => void) | null;
  closeOtherModals?: boolean;
}

declare class Modal {
  static help(): void;
  static insert(options?: ModalOptions): Modal;
  static getInstance(element: Element): Modal | undefined;
  static login(closeAfterFunction?: () => void): void;

  close(): void;
  destroy(): void;
  querySelector(selector: string): Element | null;
  querySelectorAll(selector: string): NodeList;
}

declare class Tooltip {
  constructor(referenceElement: Element);

  static help(): void;
  static getInstance(element: Element): Tooltip | undefined;
  static listen(): void;

  toggle(): void;
  destroy(): void;
}

interface PopoverConfig {
  referenceElement?: HTMLElement | null;
  trigger?: 'click' | 'mouseover' | 'focus';
  placement?: 'top' | 'right' | 'bottom' | 'left';
  title?: string | null;
  content?: (popoverId: string) => string | HTMLElement;
}

interface PopoverListenConfig extends PopoverConfig {
  selector: string | HTMLElement;
}

declare class Popover {
  constructor(options?: PopoverConfig);

  static help(): void;
  static getInstance(element: Element): Popover | undefined;
  static listen(config: PopoverListenConfig): void;

  show(): void;
  hide(): void;
  toggle(): void;
  destroy(): void;
}

declare class Tabs {
  constructor(tabContainer: Element);

  static help(): void;
  static getInstance(element: Element): Tabs | undefined;
  static listen(): void;

  activateTab(targetTabHead: Element): void;
  destroy(): void;
}

interface HovermenuConfig {
  selector?: string | Element | null;
  trigger?: string;
  backdrop?: boolean;
  title?: string | null;
  content: (listenedElement: Element, instance: Hovermenu) => string | Element;
  openFunc?: () => void;
  closeFunc?: () => void;
}

declare class Hovermenu {
  constructor(config: HovermenuConfig);

  static help(): void;
  static getInstance(element: Element): Hovermenu | undefined;
  static remove(element: Element): void;
  static destroy(element: Element): void;

  destroy(): void;
}

interface SlideMenuConfig {
  selector?: string | Element | null;
  trigger?: string;
  backdrop?: boolean;
  content: (listenedElement: Element, instance: SlideMenu) => string | Element;
  openFunc?: () => void;
  closeFunc?: () => void;
}

declare class SlideMenu {
  constructor(config: SlideMenuConfig);

  static help(): void;
  static getInstance(element: Element): SlideMenu | undefined;
  static remove(element: Element): void;
  static destroy(element: Element): void;

  destroy(): void;
}

interface AutocompleteConfig {
  selector?: string | Element | null;
  source: string;
  delay?: number;
  cache?: boolean;
  minChars?: number;
  menuClass?: string;
  onSelect?: (event: Event, itemValue: string, item: Element) => void;
}

declare class Autocomplete {
  constructor(config: AutocompleteConfig);

  static help(): void;
  static getInstance(element: Element): Autocomplete | undefined;

  destroy(): void;
}

interface BackdropOptions {
  ownerId?: string;
  zIndexVar?: string;
  stackLevel?: number | null;
  onClick?: () => void;
}

declare class Backdrop {
  private constructor();

  static help(): void;
  static insert(options?: BackdropOptions): string;
  static remove(ownerId?: string): void;
}

declare class Snackbar {
  private constructor();

  static help(): void;
  static insert(
    message: string | Record<string, string | string[]>,
    time?: number | false
  ): void;
}

interface ToastOptions {
  message?: Record<string, string | string[]>;
  time?: number;
  size?: 'small' | 'medium' | 'large';
  position?: 'top' | 'center' | 'bottom';
  fontSize?: 'sm' | 'md' | 'lg';
  closeOnClick?: boolean;
  dismissButton?: boolean;
  [key: string]: unknown;
}

declare class Toast {
  private constructor();

  static help(): void;
  static insert(options: ToastOptions): void;
  static listen(): void;
}

declare class Spinner {
  private constructor();

  static help(): void;
  static show(options?: { type?: 'main' | 'helper' }): void;
  static hide(): void;
}

declare class ProgressBar {
  private constructor();

  static help(): void;
  static start(): void;
  static done(): void;
  static set(n: number): void;
}

interface InfiniteScrollConfig {
  scrollElement: Window | Element;
  listElement: Element;
  source: string;
  startPage?: number;
  setInnerItem?: (item: unknown) => Element | null;
}

declare class InfiniteScroll {
  constructor(config: InfiniteScrollConfig);

  static help(): void;
  static throttleTime: number;
  static launchDistance: number;

  reCalculate(): void;
  pause(): void;
  resume(): void;
  destroy(): void;
}

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------

interface AjaxResponse {
  responseText: string;
  responseData: unknown;
  status: number;
  ok: boolean;
  headers: Headers;
}

interface AjaxConfig {
  button?: HTMLElement | null;
  success?: (response: AjaxResponse) => void;
  error?: (error: Error) => void;
  beforeStart?: () => void;
  afterEnd?: () => void;
  complete?: (response: AjaxResponse) => void;
  spinner?: false | 'main' | 'helper';
  data?: Record<string, unknown> | FormData;
  route?: string;
  type?: 'get' | 'post';
  timeout?: number;
}

declare class Ajax {
  private constructor();

  static help(): void;
  static request(options?: AjaxConfig): Promise<unknown>;
  static send(options: AjaxConfig): void;
}

interface LogRelayConfig {
  endpoint?: string | null;
  dedupeWindowMs?: number;
}

declare class LogRelay {
  private constructor();

  static help(): void;
  static init(options?: LogRelayConfig): void;
  static capture(error: Error | string, context?: Record<string, unknown>): void;
}

declare class Language {
  private constructor();

  static help(): void;
  static init(langCode?: string | null): Promise<void>;
  static ready(): Promise<void>;
  static load(translations: Record<string, string>): void;
  static set(key: string, value: string): void;
  static get(key: string): string;
  static getAll(): Map<string, string>;
  static getLangCode(): string;
  static isLoaded(): boolean;
  static humanizeKey(key: string): string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type FormRuleFn = (
  item: HTMLInputElement,
  form: HTMLFormElement,
  ruleValue?: string
) => string | { key: string; params: Record<string, string> } | null;

declare class Form {
  private constructor();

  static help(): void;
  static rules: Record<string, FormRuleFn>;
  static perform(formSelector?: string): void;
  static validate(elemOrEvent: HTMLElement | Event): boolean;
  static togglePasswordVisibility(button: HTMLElement): void;
}

declare class AutosizeTextarea {
  private constructor();

  static help(): void;
  static listen(selector?: string): void;
  static update(elements: HTMLElement | NodeList): void;
  static destroy(elements: HTMLElement | NodeList): void;
}

declare class AutosizeSelect {
  private constructor();

  static help(): void;
  static listen(selector?: string): void;
  static update(elements: HTMLElement | NodeList): void;
  static destroy(elements: HTMLElement | NodeList): void;
}

declare class Elem {
  private constructor();

  static help(): void;
  static getStyle(el: HTMLElement, styleProp: string): string | null;
  static onElementHeightChange(
    element: HTMLElement,
    callback: ResizeObserverCallback
  ): ResizeObserver | null;
  static getScrollbarWidth(): number;
  static scrollToView(
    targetElement: HTMLElement,
    options?: { margin?: number }
  ): void;
}

declare class Document {
  private constructor();

  static help(): void;
  static redirect(url: string, time?: number): void;
  static copyInputText(button: HTMLElement): void;
  static uniqueId(): string;
}

declare class InsertScript {
  private constructor();

  static help(): void;
  static run(container: HTMLElement): Promise<void>;
}

declare class Url {
  private constructor();

  static help(): void;
  static get(key: string, url?: string): string | null;
  static has(key: string, url?: string): boolean;
  static set(key: string, value: string, url?: string): string;
  static delete(key: string, url?: string): string;
  static getAll(url?: string): Record<string, string>;
  static fixUrlRoute(urlString: string): string;
}

declare class Token {
  private constructor();

  static help(): void;
  static get(): string | null;
  static update(token: string): void;
}

interface CookieOptions {
  expires?: number;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: string;
}

declare class Cookie {
  private constructor();

  static help(): void;
  static get(name: string): string | null;
  static set(name: string, value: string, options?: CookieOptions): void;
  static delete(name: string, options?: { path?: string; domain?: string }): void;
}

declare class ScrollHistory {
  private constructor();

  static help(): void;
  static throttleTime: number;
  static listen(options?: { cookieTimeOut?: number }): void;
}

declare class Browser {
  private constructor();

  static help(): void;
  static isVisible(): boolean;
  static onChange(callback: (isVisible: boolean) => void): () => void;
}

declare class Device {
  private constructor();

  static help(): void;
  static isTouch(): boolean;
}

declare class Viewport {
  private constructor();

  static help(): void;
  static getDimensions(): { width: number; height: number };
  static getWidth(): number;
  static getHeight(): number;
  static aspectRatio(): number;
}

// ---------------------------------------------------------------------------
// Core
// ---------------------------------------------------------------------------

declare class Event {
  private constructor();

  static add(element: EventTarget, eventName: string, handler: EventListener): void;
  static remove(element: EventTarget, eventName: string, handler: EventListener): void;
  static getTarget(event: Event): EventTarget;
  static supported(element: Element, eventName: string): boolean;
}
