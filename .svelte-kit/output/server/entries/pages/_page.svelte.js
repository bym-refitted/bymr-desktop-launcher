import { b as set_current_component, r as run_all, d as current_component, o as onDestroy, f as get_store_value, h as createEventDispatcher, c as create_ssr_component, i as compute_rest_props, j as spread, k as escape_attribute_value, l as escape_object, n as add_attribute, s as setContext, g as getContext, a as subscribe, e as escape, v as validate_component, p as each, q as identity } from "../../chunks/ssr.js";
import { dequal } from "dequal";
import { d as derived, w as writable, r as readable, a as readonly } from "../../chunks/index.js";
import { o as onMount } from "../../chunks/ssr2.js";
import { clsx } from "clsx";
import { tv } from "tailwind-variants";
import { nanoid } from "nanoid/non-secure";
import { flip, offset, shift, arrow, size, autoUpdate, computePosition } from "@floating-ui/dom";
import { createFocusTrap as createFocusTrap$1 } from "focus-trap";
import { twMerge } from "tailwind-merge";
import "@tauri-apps/api/process";
import { listen } from "@tauri-apps/api/event";
import "@tauri-apps/api/tauri";
const dirty_components = [];
const binding_callbacks = [];
let render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = /* @__PURE__ */ Promise.resolve();
let update_scheduled = false;
function schedule_update() {
  if (!update_scheduled) {
    update_scheduled = true;
    resolved_promise.then(flush);
  }
}
function tick() {
  schedule_update();
  return resolved_promise;
}
function add_render_callback(fn) {
  render_callbacks.push(fn);
}
const seen_callbacks = /* @__PURE__ */ new Set();
let flushidx = 0;
function flush() {
  if (flushidx !== 0) {
    return;
  }
  const saved_component = current_component;
  do {
    try {
      while (flushidx < dirty_components.length) {
        const component = dirty_components[flushidx];
        flushidx++;
        set_current_component(component);
        update(component.$$);
      }
    } catch (e) {
      dirty_components.length = 0;
      flushidx = 0;
      throw e;
    }
    set_current_component(null);
    dirty_components.length = 0;
    flushidx = 0;
    while (binding_callbacks.length)
      binding_callbacks.pop()();
    for (let i = 0; i < render_callbacks.length; i += 1) {
      const callback = render_callbacks[i];
      if (!seen_callbacks.has(callback)) {
        seen_callbacks.add(callback);
        callback();
      }
    }
    render_callbacks.length = 0;
  } while (dirty_components.length);
  while (flush_callbacks.length) {
    flush_callbacks.pop()();
  }
  update_scheduled = false;
  seen_callbacks.clear();
  set_current_component(saved_component);
}
function update($$) {
  if ($$.fragment !== null) {
    $$.update();
    run_all($$.before_update);
    const dirty = $$.dirty;
    $$.dirty = [-1];
    $$.fragment && $$.fragment.p($$.ctx, dirty);
    $$.after_update.forEach(add_render_callback);
  }
}
const void_element_names = /^(?:area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)$/;
function is_void(name2) {
  return void_element_names.test(name2) || name2.toLowerCase() === "!doctype";
}
function arraysAreEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return false;
  }
  return arr1.every((value, index) => value === arr2[index]);
}
function back(array, index, increment, loop = true) {
  const previousIndex = index - increment;
  if (previousIndex <= 0) {
    return loop ? array[array.length - 1] : array[0];
  }
  return array[previousIndex];
}
function forward(array, index, increment, loop = true) {
  const nextIndex = index + increment;
  if (nextIndex > array.length - 1) {
    return loop ? array[0] : array[array.length - 1];
  }
  return array[nextIndex];
}
function next(array, index, loop = true) {
  if (index === array.length - 1) {
    return loop ? array[0] : array[index];
  }
  return array[index + 1];
}
function prev(array, currentIndex, loop = true) {
  if (currentIndex <= 0) {
    return loop ? array[array.length - 1] : array[0];
  }
  return array[currentIndex - 1];
}
function last(array) {
  return array[array.length - 1];
}
function wrapArray(array, startIndex) {
  return array.map((_, index) => array[(startIndex + index) % array.length]);
}
function toggle(item, array, compare = dequal) {
  const itemIdx = array.findIndex((innerItem) => compare(innerItem, item));
  if (itemIdx !== -1) {
    array.splice(itemIdx, 1);
  } else {
    array.push(item);
  }
  return array;
}
function styleToString(style) {
  return Object.keys(style).reduce((str, key) => {
    if (style[key] === void 0)
      return str;
    return str + `${key}:${style[key]};`;
  }, "");
}
function disabledAttr(disabled) {
  return disabled ? true : void 0;
}
const hiddenInputAttrs = {
  type: "hidden",
  "aria-hidden": true,
  hidden: true,
  tabIndex: -1,
  style: styleToString({
    position: "absolute",
    opacity: 0,
    "pointer-events": "none",
    margin: 0,
    transform: "translateX(-100%)"
  })
};
function lightable(value) {
  function subscribe2(run) {
    run(value);
    return () => {
    };
  }
  return { subscribe: subscribe2 };
}
function getElementByMeltId(id) {
  if (!isBrowser)
    return null;
  const el = document.querySelector(`[data-melt-id="${id}"]`);
  return isHTMLElement(el) ? el : null;
}
const hiddenAction = (obj) => {
  return new Proxy(obj, {
    get(target, prop, receiver) {
      return Reflect.get(target, prop, receiver);
    },
    ownKeys(target) {
      return Reflect.ownKeys(target).filter((key) => key !== "action");
    }
  });
};
const isFunctionWithParams = (fn) => {
  return typeof fn === "function";
};
function builder(name2, args) {
  const { stores, action, returned } = args ?? {};
  const derivedStore = (() => {
    if (stores && returned) {
      return derived(stores, (values) => {
        const result = returned(values);
        if (isFunctionWithParams(result)) {
          const fn = (...args2) => {
            return hiddenAction({
              ...result(...args2),
              [`data-melt-${name2}`]: "",
              action: action ?? noop
            });
          };
          fn.action = action ?? noop;
          return fn;
        }
        return hiddenAction({
          ...result,
          [`data-melt-${name2}`]: "",
          action: action ?? noop
        });
      });
    } else {
      const returnedFn = returned;
      const result = returnedFn?.();
      if (isFunctionWithParams(result)) {
        const resultFn = (...args2) => {
          return hiddenAction({
            ...result(...args2),
            [`data-melt-${name2}`]: "",
            action: action ?? noop
          });
        };
        resultFn.action = action ?? noop;
        return lightable(resultFn);
      }
      return lightable(hiddenAction({
        ...result,
        [`data-melt-${name2}`]: "",
        action: action ?? noop
      }));
    }
  })();
  const actionFn = action ?? (() => {
  });
  actionFn.subscribe = derivedStore.subscribe;
  return actionFn;
}
function createElHelpers(prefix) {
  const name2 = (part) => part ? `${prefix}-${part}` : prefix;
  const attribute = (part) => `data-melt-${prefix}${part ? `-${part}` : ""}`;
  const selector = (part) => `[data-melt-${prefix}${part ? `-${part}` : ""}]`;
  const getEl = (part) => document.querySelector(selector(part));
  return {
    name: name2,
    attribute,
    selector,
    getEl
  };
}
const isBrowser = typeof document !== "undefined";
const isFunction = (v) => typeof v === "function";
function isElement(element) {
  return element instanceof Element;
}
function isHTMLElement(element) {
  return element instanceof HTMLElement;
}
function isHTMLInputElement(element) {
  return element instanceof HTMLInputElement;
}
function isHTMLLabelElement(element) {
  return element instanceof HTMLLabelElement;
}
function isHTMLButtonElement(element) {
  return element instanceof HTMLButtonElement;
}
function isElementDisabled(element) {
  const ariaDisabled = element.getAttribute("aria-disabled");
  const disabled = element.getAttribute("disabled");
  const dataDisabled = element.hasAttribute("data-disabled");
  if (ariaDisabled === "true" || disabled !== null || dataDisabled) {
    return true;
  }
  return false;
}
function isObject(value) {
  return value !== null && typeof value === "object";
}
function isReadable(value) {
  return isObject(value) && "subscribe" in value;
}
function executeCallbacks(...callbacks) {
  return (...args) => {
    for (const callback of callbacks) {
      if (typeof callback === "function") {
        callback(...args);
      }
    }
  };
}
function noop() {
}
function addEventListener(target, event, handler, options) {
  const events = Array.isArray(event) ? event : [event];
  events.forEach((_event) => target.addEventListener(_event, handler, options));
  return () => {
    events.forEach((_event) => target.removeEventListener(_event, handler, options));
  };
}
function addMeltEventListener(target, event, handler, options) {
  const events = Array.isArray(event) ? event : [event];
  if (typeof handler === "function") {
    const handlerWithMelt = withMelt((_event) => handler(_event));
    events.forEach((_event) => target.addEventListener(_event, handlerWithMelt, options));
    return () => {
      events.forEach((_event) => target.removeEventListener(_event, handlerWithMelt, options));
    };
  }
  return () => noop();
}
function dispatchMeltEvent(originalEvent) {
  const node = originalEvent.currentTarget;
  if (!isHTMLElement(node))
    return null;
  const customMeltEvent = new CustomEvent(`m-${originalEvent.type}`, {
    detail: {
      originalEvent
    },
    cancelable: true
  });
  node.dispatchEvent(customMeltEvent);
  return customMeltEvent;
}
function withMelt(handler) {
  return (event) => {
    const customEvent = dispatchMeltEvent(event);
    if (customEvent?.defaultPrevented)
      return;
    return handler(event);
  };
}
function addHighlight(element) {
  element.setAttribute("data-highlighted", "");
}
function removeHighlight(element) {
  element.removeAttribute("data-highlighted");
}
function getOptions(el) {
  return Array.from(el.querySelectorAll('[role="option"]:not([data-disabled])')).filter((el2) => isHTMLElement(el2));
}
function omit(obj, ...keys) {
  const result = {};
  for (const key of Object.keys(obj)) {
    if (!keys.includes(key)) {
      result[key] = obj[key];
    }
  }
  return result;
}
function stripValues(inputObject, toStrip, recursive) {
  return Object.fromEntries(Object.entries(inputObject).filter(([_, value]) => !dequal(value, toStrip)));
}
const overridable = (store, onChange) => {
  const update2 = (updater, sideEffect) => {
    store.update((curr) => {
      const next2 = updater(curr);
      let res = next2;
      if (onChange) {
        res = onChange({ curr, next: next2 });
      }
      sideEffect?.(res);
      return res;
    });
  };
  const set = (curr) => {
    update2(() => curr);
  };
  return {
    ...store,
    update: update2,
    set
  };
};
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function generateId$1() {
  return nanoid(10);
}
function generateIds(args) {
  return args.reduce((acc, curr) => {
    acc[curr] = generateId$1();
    return acc;
  }, {});
}
const kbd = {
  ALT: "Alt",
  ARROW_DOWN: "ArrowDown",
  ARROW_LEFT: "ArrowLeft",
  ARROW_RIGHT: "ArrowRight",
  ARROW_UP: "ArrowUp",
  BACKSPACE: "Backspace",
  CAPS_LOCK: "CapsLock",
  CONTROL: "Control",
  DELETE: "Delete",
  END: "End",
  ENTER: "Enter",
  ESCAPE: "Escape",
  F1: "F1",
  F10: "F10",
  F11: "F11",
  F12: "F12",
  F2: "F2",
  F3: "F3",
  F4: "F4",
  F5: "F5",
  F6: "F6",
  F7: "F7",
  F8: "F8",
  F9: "F9",
  HOME: "Home",
  META: "Meta",
  PAGE_DOWN: "PageDown",
  PAGE_UP: "PageUp",
  SHIFT: "Shift",
  SPACE: " ",
  TAB: "Tab",
  CTRL: "Control",
  ASTERISK: "*",
  A: "a",
  P: "p"
};
const FIRST_KEYS = [kbd.ARROW_DOWN, kbd.PAGE_UP, kbd.HOME];
const LAST_KEYS = [kbd.ARROW_UP, kbd.PAGE_DOWN, kbd.END];
const FIRST_LAST_KEYS = [...FIRST_KEYS, ...LAST_KEYS];
function debounce(fn, wait = 500) {
  let timeout = null;
  return function(...args) {
    const later = () => {
      timeout = null;
      fn(...args);
    };
    timeout && clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
const isDom = () => typeof window !== "undefined";
function getPlatform() {
  const agent = navigator.userAgentData;
  return agent?.platform ?? navigator.platform;
}
const pt = (v) => isDom() && v.test(getPlatform().toLowerCase());
const isTouchDevice = () => isDom() && !!navigator.maxTouchPoints;
const isMac = () => pt(/^mac/) && !isTouchDevice();
const isApple = () => pt(/mac|iphone|ipad|ipod/i);
const isIos = () => isApple() && !isMac();
const LOCK_CLASSNAME = "data-melt-scroll-lock";
function assignStyle(el, style) {
  if (!el)
    return;
  const previousStyle = el.style.cssText;
  Object.assign(el.style, style);
  return () => {
    el.style.cssText = previousStyle;
  };
}
function setCSSProperty(el, property, value) {
  if (!el)
    return;
  const previousValue = el.style.getPropertyValue(property);
  el.style.setProperty(property, value);
  return () => {
    if (previousValue) {
      el.style.setProperty(property, previousValue);
    } else {
      el.style.removeProperty(property);
    }
  };
}
function getPaddingProperty(documentElement) {
  const documentLeft = documentElement.getBoundingClientRect().left;
  const scrollbarX = Math.round(documentLeft) + documentElement.scrollLeft;
  return scrollbarX ? "paddingLeft" : "paddingRight";
}
function removeScroll(_document) {
  const doc = document;
  const win = doc.defaultView ?? window;
  const { documentElement, body } = doc;
  const locked = body.hasAttribute(LOCK_CLASSNAME);
  if (locked)
    return noop;
  body.setAttribute(LOCK_CLASSNAME, "");
  const scrollbarWidth = win.innerWidth - documentElement.clientWidth;
  const setScrollbarWidthProperty = () => setCSSProperty(documentElement, "--scrollbar-width", `${scrollbarWidth}px`);
  const paddingProperty = getPaddingProperty(documentElement);
  const scrollbarSidePadding = win.getComputedStyle(body)[paddingProperty];
  const setStyle = () => assignStyle(body, {
    overflow: "hidden",
    [paddingProperty]: `calc(${scrollbarSidePadding} + ${scrollbarWidth}px)`
  });
  const setIOSStyle = () => {
    const { scrollX, scrollY, visualViewport } = win;
    const offsetLeft = visualViewport?.offsetLeft ?? 0;
    const offsetTop = visualViewport?.offsetTop ?? 0;
    const restoreStyle = assignStyle(body, {
      position: "fixed",
      overflow: "hidden",
      top: `${-(scrollY - Math.floor(offsetTop))}px`,
      left: `${-(scrollX - Math.floor(offsetLeft))}px`,
      right: "0",
      [paddingProperty]: `calc(${scrollbarSidePadding} + ${scrollbarWidth}px)`
    });
    return () => {
      restoreStyle?.();
      win.scrollTo(scrollX, scrollY);
    };
  };
  const cleanups = [setScrollbarWidthProperty(), isIos() ? setIOSStyle() : setStyle()];
  return () => {
    cleanups.forEach((fn) => fn?.());
    body.removeAttribute(LOCK_CLASSNAME);
  };
}
function derivedVisible(obj) {
  const { open, forceVisible, activeTrigger } = obj;
  return derived([open, forceVisible, activeTrigger], ([$open, $forceVisible, $activeTrigger]) => ($open || $forceVisible) && $activeTrigger !== null);
}
const safeOnMount = (fn) => {
  try {
    onMount(fn);
  } catch {
    return fn();
  }
};
const safeOnDestroy = (fn) => {
  try {
    onDestroy(fn);
  } catch {
    return fn();
  }
};
function derivedWithUnsubscribe(stores, fn) {
  let unsubscribers = [];
  const onUnsubscribe = (cb) => {
    unsubscribers.push(cb);
  };
  const unsubscribe = () => {
    unsubscribers.forEach((fn2) => fn2());
    unsubscribers = [];
  };
  const derivedStore = derived(stores, ($storeValues) => {
    unsubscribe();
    return fn($storeValues, onUnsubscribe);
  });
  safeOnDestroy(unsubscribe);
  const subscribe2 = (...args) => {
    const unsub = derivedStore.subscribe(...args);
    return () => {
      unsub();
      unsubscribe();
    };
  };
  return {
    ...derivedStore,
    subscribe: subscribe2
  };
}
function effect(stores, fn) {
  const unsub = derivedWithUnsubscribe(stores, (stores2, onUnsubscribe) => {
    return {
      stores: stores2,
      onUnsubscribe
    };
  }).subscribe(({ stores: stores2, onUnsubscribe }) => {
    const returned = fn(stores2);
    if (returned) {
      onUnsubscribe(returned);
    }
  });
  safeOnDestroy(unsub);
  return unsub;
}
function toWritableStores(properties) {
  const result = {};
  Object.keys(properties).forEach((key) => {
    const propertyKey = key;
    const value = properties[propertyKey];
    result[propertyKey] = writable(value);
  });
  return result;
}
function handleRovingFocus(nextElement) {
  if (!isBrowser)
    return;
  sleep(1).then(() => {
    const currentFocusedElement = document.activeElement;
    if (!isHTMLElement(currentFocusedElement) || currentFocusedElement === nextElement)
      return;
    currentFocusedElement.tabIndex = -1;
    if (nextElement) {
      nextElement.tabIndex = 0;
      nextElement.focus();
    }
  });
}
const ignoredKeys = /* @__PURE__ */ new Set(["Shift", "Control", "Alt", "Meta", "CapsLock", "NumLock"]);
const defaults$2 = {
  onMatch: handleRovingFocus,
  getCurrentItem: () => document.activeElement
};
function createTypeaheadSearch(args = {}) {
  const withDefaults = { ...defaults$2, ...args };
  const typed = writable([]);
  const resetTyped = debounce(() => {
    typed.update(() => []);
  });
  const handleTypeaheadSearch = (key, items) => {
    if (ignoredKeys.has(key))
      return;
    const currentItem = withDefaults.getCurrentItem();
    const $typed = get_store_value(typed);
    if (!Array.isArray($typed)) {
      return;
    }
    $typed.push(key.toLowerCase());
    typed.set($typed);
    const candidateItems = items.filter((item) => {
      if (item.getAttribute("disabled") === "true" || item.getAttribute("aria-disabled") === "true" || item.hasAttribute("data-disabled")) {
        return false;
      }
      return true;
    });
    const isRepeated = $typed.length > 1 && $typed.every((char) => char === $typed[0]);
    const normalizeSearch = isRepeated ? $typed[0] : $typed.join("");
    const currentItemIndex = isHTMLElement(currentItem) ? candidateItems.indexOf(currentItem) : -1;
    let wrappedItems = wrapArray(candidateItems, Math.max(currentItemIndex, 0));
    const excludeCurrentItem = normalizeSearch.length === 1;
    if (excludeCurrentItem) {
      wrappedItems = wrappedItems.filter((v) => v !== currentItem);
    }
    const nextItem = wrappedItems.find((item) => item?.innerText && item.innerText.toLowerCase().startsWith(normalizeSearch.toLowerCase()));
    if (isHTMLElement(nextItem) && nextItem !== currentItem) {
      withDefaults.onMatch(nextItem);
    }
    resetTyped();
  };
  return {
    typed,
    resetTyped,
    handleTypeaheadSearch
  };
}
function getPortalParent(node) {
  let parent = node.parentElement;
  while (isHTMLElement(parent) && !parent.hasAttribute("data-portal")) {
    parent = parent.parentElement;
  }
  return parent || "body";
}
function getPortalDestination(node, portalProp) {
  const portalParent = getPortalParent(node);
  if (portalProp !== void 0)
    return portalProp;
  if (portalParent === "body")
    return document.body;
  return null;
}
function createClickOutsideIgnore(meltId) {
  return (e) => {
    const target = e.target;
    const triggerEl = getElementByMeltId(meltId);
    if (!triggerEl || !isElement(target))
      return false;
    const id = triggerEl.id;
    if (isHTMLLabelElement(target) && id === target.htmlFor) {
      return true;
    }
    if (target.closest(`label[for="${id}"]`)) {
      return true;
    }
    return false;
  };
}
async function handleFocus(args) {
  const { prop, defaultEl } = args;
  await Promise.all([sleep(1), tick]);
  if (prop === void 0) {
    defaultEl?.focus();
    return;
  }
  const returned = isFunction(prop) ? prop(defaultEl) : prop;
  if (typeof returned === "string") {
    const el = document.querySelector(returned);
    if (!isHTMLElement(el))
      return;
    el.focus();
  } else if (isHTMLElement(returned)) {
    returned.focus();
  }
}
const documentClickStore = readable(void 0, (set) => {
  function clicked(event) {
    set(event);
    set(void 0);
  }
  const unsubscribe = addEventListener(document, "pointerup", clicked, {
    passive: false,
    capture: true
  });
  return unsubscribe;
});
const useClickOutside = (node, config = {}) => {
  let options = { enabled: true, ...config };
  function isEnabled() {
    return typeof options.enabled === "boolean" ? options.enabled : get_store_value(options.enabled);
  }
  const unsubscribe = documentClickStore.subscribe((e) => {
    if (!isEnabled() || !e || e.target === node) {
      return;
    }
    const composedPath = e.composedPath();
    if (composedPath.includes(node))
      return;
    if (options.ignore) {
      if (isFunction(options.ignore)) {
        if (options.ignore(e))
          return;
      } else if (Array.isArray(options.ignore)) {
        if (options.ignore.length > 0 && options.ignore.some((ignoreEl) => {
          return ignoreEl && (e.target === ignoreEl || composedPath.includes(ignoreEl));
        }))
          return;
      }
    }
    options.handler?.(e);
  });
  return {
    update(params) {
      options = { ...options, ...params };
    },
    destroy() {
      unsubscribe();
    }
  };
};
const documentEscapeKeyStore = readable(void 0, (set) => {
  function keydown(event) {
    if (event && event.key === kbd.ESCAPE) {
      set(event);
    }
    set(void 0);
  }
  const unsubscribe = addEventListener(document, "keydown", keydown, {
    passive: false
  });
  return unsubscribe;
});
const useEscapeKeydown = (node, config = {}) => {
  let unsub = noop;
  function update2(config2 = {}) {
    unsub();
    const options = { enabled: true, ...config2 };
    const enabled = isReadable(options.enabled) ? options.enabled : readable(options.enabled);
    unsub = executeCallbacks(
      // Handle escape keydowns
      documentEscapeKeyStore.subscribe((e) => {
        if (!e || !get_store_value(enabled))
          return;
        const target = e.target;
        if (!isHTMLElement(target) || target.closest("[data-escapee]") !== node) {
          return;
        }
        e.preventDefault();
        if (options.ignore) {
          if (isFunction(options.ignore)) {
            if (options.ignore(e))
              return;
          } else if (Array.isArray(options.ignore)) {
            if (options.ignore.length > 0 && options.ignore.some((ignoreEl) => {
              return ignoreEl && target === ignoreEl;
            }))
              return;
          }
        }
        options.handler?.(e);
      }),
      effect(enabled, ($enabled) => {
        if ($enabled) {
          node.dataset.escapee = "";
        } else {
          delete node.dataset.escapee;
        }
      })
    );
  }
  update2(config);
  return {
    update: update2,
    destroy() {
      node.removeAttribute("data-escapee");
      unsub();
    }
  };
};
const defaultConfig$1 = {
  strategy: "absolute",
  placement: "top",
  gutter: 5,
  flip: true,
  sameWidth: false,
  overflowPadding: 8
};
const ARROW_TRANSFORM = {
  bottom: "rotate(45deg)",
  left: "rotate(135deg)",
  top: "rotate(225deg)",
  right: "rotate(315deg)"
};
function useFloating(reference, floating, opts = {}) {
  if (!floating || !reference || opts === null)
    return {
      destroy: noop
    };
  const options = { ...defaultConfig$1, ...opts };
  const arrowEl = floating.querySelector("[data-arrow=true]");
  const middleware = [];
  if (options.flip) {
    middleware.push(flip({
      boundary: options.boundary,
      padding: options.overflowPadding
    }));
  }
  const arrowOffset = isHTMLElement(arrowEl) ? arrowEl.offsetHeight / 2 : 0;
  if (options.gutter || options.offset) {
    const data = options.gutter ? { mainAxis: options.gutter } : options.offset;
    if (data?.mainAxis != null) {
      data.mainAxis += arrowOffset;
    }
    middleware.push(offset(data));
  }
  middleware.push(shift({
    boundary: options.boundary,
    crossAxis: options.overlap,
    padding: options.overflowPadding
  }));
  if (arrowEl) {
    middleware.push(arrow({ element: arrowEl, padding: 8 }));
  }
  middleware.push(size({
    padding: options.overflowPadding,
    apply({ rects, availableHeight, availableWidth }) {
      if (options.sameWidth) {
        Object.assign(floating.style, {
          width: `${Math.round(rects.reference.width)}px`,
          minWidth: "unset"
        });
      }
      if (options.fitViewport) {
        Object.assign(floating.style, {
          maxWidth: `${availableWidth}px`,
          maxHeight: `${availableHeight}px`
        });
      }
    }
  }));
  function compute() {
    if (!reference || !floating)
      return;
    const { placement, strategy } = options;
    computePosition(reference, floating, {
      placement,
      middleware,
      strategy
    }).then((data) => {
      const x = Math.round(data.x);
      const y = Math.round(data.y);
      Object.assign(floating.style, {
        position: options.strategy,
        top: `${y}px`,
        left: `${x}px`
      });
      if (isHTMLElement(arrowEl) && data.middlewareData.arrow) {
        const { x: x2, y: y2 } = data.middlewareData.arrow;
        const dir = data.placement.split("-")[0];
        Object.assign(arrowEl.style, {
          position: "absolute",
          left: x2 != null ? `${x2}px` : "",
          top: y2 != null ? `${y2}px` : "",
          [dir]: `calc(100% - ${arrowOffset}px)`,
          transform: ARROW_TRANSFORM[dir],
          backgroundColor: "inherit",
          zIndex: "inherit"
        });
      }
      return data;
    });
  }
  Object.assign(floating.style, {
    position: options.strategy
  });
  return {
    destroy: autoUpdate(reference, floating, compute)
  };
}
function createFocusTrap(config = {}) {
  let trap;
  const { immediate, ...focusTrapOptions } = config;
  const hasFocus = writable(false);
  const isPaused = writable(false);
  const activate = (opts) => trap?.activate(opts);
  const deactivate = (opts) => {
    trap?.deactivate(opts);
  };
  const pause = () => {
    if (trap) {
      trap.pause();
      isPaused.set(true);
    }
  };
  const unpause = () => {
    if (trap) {
      trap.unpause();
      isPaused.set(false);
    }
  };
  const useFocusTrap = (node) => {
    trap = createFocusTrap$1(node, {
      ...focusTrapOptions,
      onActivate() {
        hasFocus.set(true);
        config.onActivate?.();
      },
      onDeactivate() {
        hasFocus.set(false);
        config.onDeactivate?.();
      }
    });
    if (immediate) {
      activate();
    }
    return {
      destroy() {
        deactivate();
        trap = void 0;
      }
    };
  };
  return {
    useFocusTrap,
    hasFocus: readonly(hasFocus),
    isPaused: readonly(isPaused),
    activate,
    deactivate,
    pause,
    unpause
  };
}
const defaultConfig = {
  floating: {},
  focusTrap: {},
  clickOutside: {},
  escapeKeydown: {},
  portal: "body"
};
const usePopper = (popperElement, args) => {
  popperElement.dataset.escapee = "";
  const { anchorElement, open, options } = args;
  if (!anchorElement || !open || !options) {
    return { destroy: noop };
  }
  const opts = { ...defaultConfig, ...options };
  const callbacks = [];
  if (opts.portal !== null) {
    const portal = usePortal(popperElement, opts.portal);
    if (portal?.destroy) {
      callbacks.push(portal.destroy);
    }
  }
  callbacks.push(useFloating(anchorElement, popperElement, opts.floating).destroy);
  if (opts.focusTrap !== null) {
    const { useFocusTrap } = createFocusTrap({
      immediate: true,
      escapeDeactivates: false,
      allowOutsideClick: true,
      returnFocusOnDeactivate: false,
      fallbackFocus: popperElement,
      ...opts.focusTrap
    });
    const usedFocusTrap = useFocusTrap(popperElement);
    if (usedFocusTrap?.destroy) {
      callbacks.push(usedFocusTrap.destroy);
    }
  }
  if (opts.clickOutside !== null) {
    callbacks.push(useClickOutside(popperElement, {
      enabled: open,
      handler: (e) => {
        if (e.defaultPrevented)
          return;
        if (isHTMLElement(anchorElement) && !anchorElement.contains(e.target)) {
          open.set(false);
          anchorElement.focus();
        }
      },
      ...opts.clickOutside
    }).destroy);
  }
  if (opts.escapeKeydown !== null) {
    callbacks.push(useEscapeKeydown(popperElement, {
      enabled: open,
      handler: () => {
        open.set(false);
      },
      ...opts.escapeKeydown
    }).destroy);
  }
  const unsubscribe = executeCallbacks(...callbacks);
  return {
    destroy() {
      unsubscribe();
    }
  };
};
const usePortal = (el, target = "body") => {
  let targetEl;
  if (!isHTMLElement(target) && typeof target !== "string") {
    return {
      destroy: noop
    };
  }
  async function update2(newTarget) {
    target = newTarget;
    if (typeof target === "string") {
      targetEl = document.querySelector(target);
      if (targetEl === null) {
        await tick();
        targetEl = document.querySelector(target);
      }
      if (targetEl === null) {
        throw new Error(`No element found matching css selector: "${target}"`);
      }
    } else if (target instanceof HTMLElement) {
      targetEl = target;
    } else {
      throw new TypeError(`Unknown portal target type: ${target === null ? "null" : typeof target}. Allowed types: string (CSS selector) or HTMLElement.`);
    }
    el.dataset.portal = "";
    targetEl.appendChild(el);
    el.hidden = false;
  }
  function destroy() {
    el.remove();
  }
  update2(target);
  return {
    update: update2,
    destroy
  };
};
function createLabel() {
  const root = builder("label", {
    action: (node) => {
      const mouseDown = addMeltEventListener(node, "mousedown", (e) => {
        if (!e.defaultPrevented && e.detail > 1) {
          e.preventDefault();
        }
      });
      return {
        destroy: mouseDown
      };
    }
  });
  return {
    elements: {
      root
    }
  };
}
const INTERACTION_KEYS = [kbd.ARROW_LEFT, kbd.ESCAPE, kbd.ARROW_RIGHT, kbd.SHIFT, kbd.CAPS_LOCK, kbd.CONTROL, kbd.ALT, kbd.META, kbd.ENTER, kbd.F1, kbd.F2, kbd.F3, kbd.F4, kbd.F5, kbd.F6, kbd.F7, kbd.F8, kbd.F9, kbd.F10, kbd.F11, kbd.F12];
const defaults$1 = {
  positioning: {
    placement: "bottom",
    sameWidth: true
  },
  scrollAlignment: "nearest",
  loop: true,
  defaultOpen: false,
  closeOnOutsideClick: true,
  preventScroll: true,
  closeOnEscape: true,
  forceVisible: false,
  portal: void 0,
  builder: "listbox",
  disabled: false,
  required: false,
  name: void 0,
  typeahead: true,
  highlightOnHover: true,
  onOutsideClick: void 0
};
const listboxIdParts = ["trigger", "menu", "label"];
function createListbox(props) {
  const withDefaults = { ...defaults$1, ...props };
  const activeTrigger = writable(null);
  const highlightedItem = writable(null);
  const selectedWritable = withDefaults.selected ?? writable(withDefaults.defaultSelected);
  const selected = overridable(selectedWritable, withDefaults?.onSelectedChange);
  const highlighted = derived(highlightedItem, ($highlightedItem) => $highlightedItem ? getOptionProps($highlightedItem) : void 0);
  const openWritable = withDefaults.open ?? writable(withDefaults.defaultOpen);
  const open = overridable(openWritable, withDefaults?.onOpenChange);
  const options = toWritableStores({
    ...omit(withDefaults, "open", "defaultOpen", "builder", "ids"),
    multiple: withDefaults.multiple ?? false
  });
  const { scrollAlignment, loop, closeOnOutsideClick, closeOnEscape, preventScroll, portal, forceVisible, positioning, multiple, arrowSize, disabled, required, typeahead, name: nameProp, highlightOnHover, onOutsideClick } = options;
  const { name: name2, selector } = createElHelpers(withDefaults.builder);
  const ids = toWritableStores({ ...generateIds(listboxIdParts), ...withDefaults.ids });
  const { handleTypeaheadSearch } = createTypeaheadSearch({
    onMatch: (element) => {
      highlightedItem.set(element);
      element.scrollIntoView({ block: get_store_value(scrollAlignment) });
    },
    getCurrentItem() {
      return get_store_value(highlightedItem);
    }
  });
  function getOptionProps(el) {
    const value = el.getAttribute("data-value");
    const label2 = el.getAttribute("data-label");
    const disabled2 = el.hasAttribute("data-disabled");
    return {
      value: value ? JSON.parse(value) : value,
      label: label2 ?? el.textContent ?? void 0,
      disabled: disabled2 ? true : false
    };
  }
  const setOption = (newOption) => {
    selected.update(($option) => {
      const $multiple = get_store_value(multiple);
      if ($multiple) {
        const optionArr = Array.isArray($option) ? $option : [];
        return toggle(newOption, optionArr, (itemA, itemB) => dequal(itemA.value, itemB.value));
      }
      return newOption;
    });
  };
  function selectItem(item) {
    const props2 = getOptionProps(item);
    setOption(props2);
  }
  async function openMenu() {
    open.set(true);
    const triggerEl = document.getElementById(get_store_value(ids.trigger));
    if (!triggerEl)
      return;
    activeTrigger.set(triggerEl);
    await tick();
    const menuElement = document.getElementById(get_store_value(ids.menu));
    if (!isHTMLElement(menuElement))
      return;
    const selectedItem = menuElement.querySelector("[aria-selected=true]");
    if (!isHTMLElement(selectedItem))
      return;
    highlightedItem.set(selectedItem);
  }
  function closeMenu() {
    open.set(false);
    highlightedItem.set(null);
  }
  const isVisible = derivedVisible({ open, forceVisible, activeTrigger });
  const isSelected = derived([selected], ([$selected]) => {
    return (value) => {
      if (Array.isArray($selected)) {
        return $selected.some((o) => dequal(o.value, value));
      }
      if (isObject(value)) {
        return dequal($selected?.value, stripValues(value, void 0));
      }
      return dequal($selected?.value, value);
    };
  });
  const isHighlighted = derived([highlighted], ([$value]) => {
    return (item) => {
      return dequal($value?.value, item);
    };
  });
  const trigger = builder(name2("trigger"), {
    stores: [open, highlightedItem, disabled, ids.menu, ids.trigger, ids.label],
    returned: ([$open, $highlightedItem, $disabled, $menuId, $triggerId, $labelId]) => {
      return {
        "aria-activedescendant": $highlightedItem?.id,
        "aria-autocomplete": "list",
        "aria-controls": $menuId,
        "aria-expanded": $open,
        "aria-labelledby": $labelId,
        // autocomplete: 'off',
        id: $triggerId,
        role: "combobox",
        disabled: disabledAttr($disabled)
      };
    },
    action: (node) => {
      const isInput = isHTMLInputElement(node);
      const unsubscribe = executeCallbacks(
        addMeltEventListener(node, "click", () => {
          node.focus();
          const $open = get_store_value(open);
          if ($open) {
            closeMenu();
          } else {
            openMenu();
          }
        }),
        // Handle all input key events including typing, meta, and navigation.
        addMeltEventListener(node, "keydown", (e) => {
          const $open = get_store_value(open);
          if (!$open) {
            if (INTERACTION_KEYS.includes(e.key)) {
              return;
            }
            if (e.key === kbd.TAB) {
              return;
            }
            if (e.key === kbd.BACKSPACE && isInput && node.value === "") {
              return;
            }
            if (e.key === kbd.SPACE && isHTMLButtonElement(node)) {
              return;
            }
            openMenu();
            tick().then(() => {
              const $selectedItem = get_store_value(selected);
              if ($selectedItem)
                return;
              const menuEl = document.getElementById(get_store_value(ids.menu));
              if (!isHTMLElement(menuEl))
                return;
              const enabledItems = Array.from(menuEl.querySelectorAll(`${selector("item")}:not([data-disabled]):not([data-hidden])`)).filter((item) => isHTMLElement(item));
              if (!enabledItems.length)
                return;
              if (e.key === kbd.ARROW_DOWN) {
                highlightedItem.set(enabledItems[0]);
                enabledItems[0].scrollIntoView({ block: get_store_value(scrollAlignment) });
              } else if (e.key === kbd.ARROW_UP) {
                highlightedItem.set(last(enabledItems));
                last(enabledItems).scrollIntoView({ block: get_store_value(scrollAlignment) });
              }
            });
          }
          if (e.key === kbd.TAB) {
            closeMenu();
            return;
          }
          if (e.key === kbd.ENTER || e.key === kbd.SPACE && isHTMLButtonElement(node)) {
            e.preventDefault();
            const $highlightedItem = get_store_value(highlightedItem);
            if ($highlightedItem) {
              selectItem($highlightedItem);
            }
            if (!get_store_value(multiple)) {
              closeMenu();
            }
          }
          if (e.key === kbd.ARROW_UP && e.altKey) {
            closeMenu();
          }
          if (FIRST_LAST_KEYS.includes(e.key)) {
            e.preventDefault();
            const menuElement = document.getElementById(get_store_value(ids.menu));
            if (!isHTMLElement(menuElement))
              return;
            const itemElements = getOptions(menuElement);
            if (!itemElements.length)
              return;
            const candidateNodes = itemElements.filter((opt) => !isElementDisabled(opt) && opt.dataset.hidden === void 0);
            const $currentItem = get_store_value(highlightedItem);
            const currentIndex = $currentItem ? candidateNodes.indexOf($currentItem) : -1;
            const $loop = get_store_value(loop);
            const $scrollAlignment = get_store_value(scrollAlignment);
            let nextItem;
            switch (e.key) {
              case kbd.ARROW_DOWN:
                nextItem = next(candidateNodes, currentIndex, $loop);
                break;
              case kbd.ARROW_UP:
                nextItem = prev(candidateNodes, currentIndex, $loop);
                break;
              case kbd.PAGE_DOWN:
                nextItem = forward(candidateNodes, currentIndex, 10, $loop);
                break;
              case kbd.PAGE_UP:
                nextItem = back(candidateNodes, currentIndex, 10, $loop);
                break;
              case kbd.HOME:
                nextItem = candidateNodes[0];
                break;
              case kbd.END:
                nextItem = last(candidateNodes);
                break;
              default:
                return;
            }
            highlightedItem.set(nextItem);
            nextItem?.scrollIntoView({ block: $scrollAlignment });
          } else if (get_store_value(typeahead)) {
            const menuEl = document.getElementById(get_store_value(ids.menu));
            if (!isHTMLElement(menuEl))
              return;
            handleTypeaheadSearch(e.key, getOptions(menuEl));
          }
        })
      );
      let unsubEscapeKeydown = noop;
      const escape2 = useEscapeKeydown(node, {
        handler: closeMenu,
        enabled: derived([open, closeOnEscape], ([$open, $closeOnEscape]) => {
          return $open && $closeOnEscape;
        })
      });
      if (escape2 && escape2.destroy) {
        unsubEscapeKeydown = escape2.destroy;
      }
      return {
        destroy() {
          unsubscribe();
          unsubEscapeKeydown();
        }
      };
    }
  });
  const menu = builder(name2("menu"), {
    stores: [isVisible, ids.menu],
    returned: ([$isVisible, $menuId]) => {
      return {
        hidden: $isVisible ? void 0 : true,
        id: $menuId,
        role: "listbox",
        style: styleToString({ display: $isVisible ? void 0 : "none" })
      };
    },
    action: (node) => {
      let unsubPopper = noop;
      const unsubscribe = executeCallbacks(
        // Bind the popper portal to the input element.
        effect([isVisible, portal, closeOnOutsideClick, positioning, activeTrigger], ([$isVisible, $portal, $closeOnOutsideClick, $positioning, $activeTrigger]) => {
          unsubPopper();
          if (!$isVisible || !$activeTrigger)
            return;
          const ignoreHandler = createClickOutsideIgnore(get_store_value(ids.trigger));
          const popper = usePopper(node, {
            anchorElement: $activeTrigger,
            open,
            options: {
              floating: $positioning,
              focusTrap: null,
              clickOutside: $closeOnOutsideClick ? {
                handler: (e) => {
                  get_store_value(onOutsideClick)?.(e);
                  if (e.defaultPrevented)
                    return;
                  const target = e.target;
                  if (!isElement(target))
                    return;
                  if (target === $activeTrigger || $activeTrigger.contains(target)) {
                    return;
                  }
                  closeMenu();
                },
                ignore: ignoreHandler
              } : null,
              escapeKeydown: null,
              portal: getPortalDestination(node, $portal)
            }
          });
          if (popper && popper.destroy) {
            unsubPopper = popper.destroy;
          }
        })
      );
      return {
        destroy: () => {
          unsubscribe();
          unsubPopper();
        }
      };
    }
  });
  const { elements: { root: labelBuilder } } = createLabel();
  const { action: labelAction } = get_store_value(labelBuilder);
  const label = builder(name2("label"), {
    stores: [ids.label, ids.trigger],
    returned: ([$labelId, $triggerId]) => {
      return {
        id: $labelId,
        for: $triggerId
      };
    },
    action: labelAction
  });
  const option = builder(name2("option"), {
    stores: [isSelected],
    returned: ([$isSelected]) => (props2) => {
      const selected2 = $isSelected(props2.value);
      return {
        "data-value": JSON.stringify(props2.value),
        "data-label": props2.label,
        "data-disabled": disabledAttr(props2.disabled),
        "aria-disabled": props2.disabled ? true : void 0,
        "aria-selected": selected2,
        "data-selected": selected2 ? "" : void 0,
        id: generateId$1(),
        role: "option"
      };
    },
    action: (node) => {
      const unsubscribe = executeCallbacks(addMeltEventListener(node, "click", (e) => {
        if (isElementDisabled(node)) {
          e.preventDefault();
          return;
        }
        selectItem(node);
        if (!get_store_value(multiple)) {
          closeMenu();
        }
      }), effect(highlightOnHover, ($highlightOnHover) => {
        if (!$highlightOnHover)
          return;
        const unsub = executeCallbacks(addMeltEventListener(node, "mouseover", () => {
          highlightedItem.set(node);
        }), addMeltEventListener(node, "mouseleave", () => {
          highlightedItem.set(null);
        }));
        return unsub;
      }));
      return { destroy: unsubscribe };
    }
  });
  const hiddenInput = builder(name2("hidden-input"), {
    stores: [selected, required, nameProp],
    returned: ([$selected, $required, $name]) => {
      const value = Array.isArray($selected) ? $selected.map((o) => o.value) : $selected?.value;
      return {
        ...hiddenInputAttrs,
        required: $required ? true : void 0,
        value,
        name: $name
      };
    }
  });
  const arrow2 = builder(name2("arrow"), {
    stores: arrowSize,
    returned: ($arrowSize) => ({
      "data-arrow": true,
      style: styleToString({
        position: "absolute",
        width: `var(--arrow-size, ${$arrowSize}px)`,
        height: `var(--arrow-size, ${$arrowSize}px)`
      })
    })
  });
  safeOnMount(() => {
    if (!isBrowser)
      return;
    const menuEl = document.getElementById(get_store_value(ids.menu));
    if (!menuEl)
      return;
    const triggerEl = document.getElementById(get_store_value(ids.trigger));
    if (triggerEl) {
      activeTrigger.set(triggerEl);
    }
    const selectedEl = menuEl.querySelector("[data-selected]");
    if (!isHTMLElement(selectedEl))
      return;
  });
  effect([highlightedItem], ([$highlightedItem]) => {
    if (!isBrowser)
      return;
    const menuElement = document.getElementById(get_store_value(ids.menu));
    if (!isHTMLElement(menuElement))
      return;
    getOptions(menuElement).forEach((node) => {
      if (node === $highlightedItem) {
        addHighlight(node);
      } else {
        removeHighlight(node);
      }
    });
  });
  effect([open], ([$open]) => {
    if (!isBrowser)
      return;
    let unsubScroll = noop;
    if (get_store_value(preventScroll) && $open) {
      unsubScroll = removeScroll();
    }
    return () => {
      unsubScroll();
    };
  });
  return {
    ids,
    elements: {
      trigger,
      option,
      menu,
      label,
      hiddenInput,
      arrow: arrow2
    },
    states: {
      open,
      selected,
      highlighted,
      highlightedItem
    },
    helpers: {
      isSelected,
      isHighlighted,
      closeMenu
    },
    options
  };
}
const { name: name$1 } = createElHelpers("dialog");
const defaults = {
  preventScroll: true,
  closeOnEscape: true,
  closeOnOutsideClick: true,
  role: "dialog",
  defaultOpen: false,
  portal: "body",
  forceVisible: false,
  openFocus: void 0,
  closeFocus: void 0,
  onOutsideClick: void 0
};
const openDialogIds = writable([]);
const dialogIdParts = ["content", "title", "description"];
function createDialog(props) {
  const withDefaults = { ...defaults, ...props };
  const options = toWritableStores(omit(withDefaults, "ids"));
  const { preventScroll, closeOnEscape, closeOnOutsideClick, role, portal, forceVisible, openFocus, closeFocus, onOutsideClick } = options;
  const activeTrigger = writable(null);
  const ids = toWritableStores({
    ...generateIds(dialogIdParts),
    ...withDefaults.ids
  });
  const openWritable = withDefaults.open ?? writable(withDefaults.defaultOpen);
  const open = overridable(openWritable, withDefaults?.onOpenChange);
  const isVisible = derived([open, forceVisible], ([$open, $forceVisible]) => {
    return $open || $forceVisible;
  });
  let unsubScroll = noop;
  function handleOpen(e) {
    const el = e.currentTarget;
    const triggerEl = e.currentTarget;
    if (!isHTMLElement(el) || !isHTMLElement(triggerEl))
      return;
    open.set(true);
    activeTrigger.set(triggerEl);
  }
  function handleClose() {
    open.set(false);
    handleFocus({
      prop: get_store_value(closeFocus),
      defaultEl: get_store_value(activeTrigger)
    });
  }
  effect([open], ([$open]) => {
    sleep(100).then(() => {
      if ($open) {
        openDialogIds.update((prev2) => {
          prev2.push(get_store_value(ids.content));
          return prev2;
        });
      } else {
        openDialogIds.update((prev2) => prev2.filter((id) => id !== get_store_value(ids.content)));
      }
    });
  });
  const trigger = builder(name$1("trigger"), {
    stores: [open],
    returned: ([$open]) => {
      return {
        "aria-haspopup": "dialog",
        "aria-expanded": $open,
        type: "button"
      };
    },
    action: (node) => {
      const unsub = executeCallbacks(addMeltEventListener(node, "click", (e) => {
        handleOpen(e);
      }), addMeltEventListener(node, "keydown", (e) => {
        if (e.key !== kbd.ENTER && e.key !== kbd.SPACE)
          return;
        e.preventDefault();
        handleOpen(e);
      }));
      return {
        destroy: unsub
      };
    }
  });
  const overlay = builder(name$1("overlay"), {
    stores: [isVisible],
    returned: ([$isVisible]) => {
      return {
        hidden: $isVisible ? void 0 : true,
        tabindex: -1,
        style: styleToString({
          display: $isVisible ? void 0 : "none"
        }),
        "aria-hidden": true,
        "data-state": $isVisible ? "open" : "closed"
      };
    },
    action: (node) => {
      let unsubEscapeKeydown = noop;
      if (get_store_value(closeOnEscape)) {
        const escapeKeydown = useEscapeKeydown(node, {
          handler: () => {
            handleClose();
          }
        });
        if (escapeKeydown && escapeKeydown.destroy) {
          unsubEscapeKeydown = escapeKeydown.destroy;
        }
      }
      return {
        destroy() {
          unsubEscapeKeydown();
        }
      };
    }
  });
  const content = builder(name$1("content"), {
    stores: [isVisible, ids.content, ids.description, ids.title],
    returned: ([$isVisible, $contentId, $descriptionId, $titleId]) => {
      return {
        id: $contentId,
        role: get_store_value(role),
        "aria-describedby": $descriptionId,
        "aria-labelledby": $titleId,
        "aria-modal": $isVisible ? "true" : void 0,
        "data-state": $isVisible ? "open" : "closed",
        tabindex: -1,
        hidden: $isVisible ? void 0 : true,
        style: styleToString({
          display: $isVisible ? void 0 : "none"
        })
      };
    },
    action: (node) => {
      let activate = noop;
      let deactivate = noop;
      const destroy = executeCallbacks(effect([open], ([$open]) => {
        if (!$open)
          return;
        const focusTrap = createFocusTrap({
          immediate: false,
          escapeDeactivates: true,
          clickOutsideDeactivates: true,
          returnFocusOnDeactivate: false,
          fallbackFocus: node
        });
        activate = focusTrap.activate;
        deactivate = focusTrap.deactivate;
        const ac = focusTrap.useFocusTrap(node);
        if (ac && ac.destroy) {
          return ac.destroy;
        } else {
          return focusTrap.deactivate;
        }
      }), effect([closeOnOutsideClick, open], ([$closeOnOutsideClick, $open]) => {
        return useClickOutside(node, {
          enabled: $open,
          handler: (e) => {
            get_store_value(onOutsideClick)?.(e);
            if (e.defaultPrevented)
              return;
            const $openDialogIds = get_store_value(openDialogIds);
            const isLast = last($openDialogIds) === get_store_value(ids.content);
            if ($closeOnOutsideClick && isLast) {
              handleClose();
            }
          }
        }).destroy;
      }), effect([closeOnEscape], ([$closeOnEscape]) => {
        if (!$closeOnEscape)
          return noop;
        const escapeKeydown = useEscapeKeydown(node, {
          handler: () => {
            handleClose();
          }
        });
        if (escapeKeydown && escapeKeydown.destroy) {
          return escapeKeydown.destroy;
        }
        return noop;
      }), effect([isVisible], ([$isVisible]) => {
        tick().then(() => {
          if (!$isVisible) {
            deactivate();
          } else {
            activate();
          }
        });
      }));
      return {
        destroy: () => {
          unsubScroll();
          destroy();
        }
      };
    }
  });
  const portalled = builder(name$1("portalled"), {
    stores: portal,
    returned: ($portal) => ({
      "data-portal": $portal ? "" : void 0
    }),
    action: (node) => {
      const unsubPortal = effect([portal], ([$portal]) => {
        if (!$portal)
          return noop;
        const portalDestination = getPortalDestination(node, $portal);
        if (portalDestination === null)
          return noop;
        const portalAction = usePortal(node, portalDestination);
        if (portalAction && portalAction.destroy) {
          return portalAction.destroy;
        } else {
          return noop;
        }
      });
      return {
        destroy() {
          unsubPortal();
        }
      };
    }
  });
  const title = builder(name$1("title"), {
    stores: [ids.title],
    returned: ([$titleId]) => ({
      id: $titleId
    })
  });
  const description = builder(name$1("description"), {
    stores: [ids.description],
    returned: ([$descriptionId]) => ({
      id: $descriptionId
    })
  });
  const close = builder(name$1("close"), {
    returned: () => ({
      type: "button"
    }),
    action: (node) => {
      const unsub = executeCallbacks(addMeltEventListener(node, "click", () => {
        handleClose();
      }), addMeltEventListener(node, "keydown", (e) => {
        if (e.key !== kbd.SPACE && e.key !== kbd.ENTER)
          return;
        e.preventDefault();
        handleClose();
      }));
      return {
        destroy: unsub
      };
    }
  });
  effect([open, preventScroll], ([$open, $preventScroll]) => {
    if (!isBrowser)
      return;
    if ($preventScroll && $open)
      unsubScroll = removeScroll();
    if ($open) {
      const contentEl = document.getElementById(get_store_value(ids.content));
      handleFocus({ prop: get_store_value(openFocus), defaultEl: contentEl });
    }
    return () => {
      if (!get_store_value(forceVisible)) {
        unsubScroll();
      }
    };
  });
  return {
    ids,
    elements: {
      content,
      trigger,
      title,
      description,
      overlay,
      close,
      portalled
    },
    states: {
      open
    },
    options
  };
}
const { name } = createElHelpers("select");
function createSelect(props) {
  const listbox = createListbox({ ...props, builder: "select" });
  const group = builder(name("group"), {
    returned: () => {
      return (groupId) => ({
        role: "group",
        "aria-labelledby": groupId
      });
    }
  });
  const groupLabel = builder(name("group-label"), {
    returned: () => {
      return (groupId) => ({
        id: groupId
      });
    }
  });
  const selectedLabel = derived(listbox.states.selected, ($selected) => {
    if (Array.isArray($selected)) {
      return $selected.map((o) => o.label).join(", ");
    }
    return $selected?.label ?? "";
  });
  return {
    ...listbox,
    elements: {
      ...listbox.elements,
      group,
      groupLabel
    },
    states: {
      ...listbox.states,
      selectedLabel
    }
  };
}
function createBitAttrs(bit, parts) {
  const attrs = {};
  parts.forEach((part) => {
    attrs[part] = {
      [`data-${bit}-${part}`]: ""
    };
  });
  return (part) => attrs[part];
}
function createDispatcher() {
  const dispatch = createEventDispatcher();
  return (e) => {
    const { originalEvent } = e.detail;
    const { cancelable } = e;
    const type = originalEvent.type;
    const shouldContinue = dispatch(type, { originalEvent, currentTarget: originalEvent.currentTarget }, { cancelable });
    if (!shouldContinue) {
      e.preventDefault();
    }
  };
}
function generateId() {
  return nanoid(10);
}
function removeUndefined(obj) {
  const result = {};
  for (const key in obj) {
    const value = obj[key];
    if (value !== void 0) {
      result[key] = value;
    }
  }
  return result;
}
function getOptionUpdater(options) {
  return function(key, value) {
    if (value === void 0)
      return;
    const store = options[key];
    if (store) {
      store.set(value);
    }
  };
}
function getAttrs(builders) {
  const attrs = {};
  builders.forEach((builder2) => {
    Object.keys(builder2).forEach((key) => {
      if (key !== "action") {
        attrs[key] = builder2[key];
      }
    });
  });
  return attrs;
}
const Button$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["href", "type", "builders", "el"]);
  let { href = void 0 } = $$props;
  let { type = void 0 } = $$props;
  let { builders = [] } = $$props;
  let { el = void 0 } = $$props;
  const attrs = { "data-button-root": "" };
  if ($$props.href === void 0 && $$bindings.href && href !== void 0)
    $$bindings.href(href);
  if ($$props.type === void 0 && $$bindings.type && type !== void 0)
    $$bindings.type(type);
  if ($$props.builders === void 0 && $$bindings.builders && builders !== void 0)
    $$bindings.builders(builders);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0)
    $$bindings.el(el);
  return `${builders && builders.length ? ` ${((tag) => {
    return tag ? `<${href ? "a" : "button"}${spread(
      [
        {
          type: escape_attribute_value(href ? void 0 : type)
        },
        { href: escape_attribute_value(href) },
        { tabindex: "0" },
        escape_object(getAttrs(builders)),
        escape_object($$restProps),
        escape_object(attrs)
      ],
      {}
    )}${add_attribute("this", el, 0)}>${is_void(tag) ? "" : `${slots.default ? slots.default({}) : ``}`}${is_void(tag) ? "" : `</${tag}>`}` : "";
  })(href ? "a" : "button")}` : ` ${((tag) => {
    return tag ? `<${href ? "a" : "button"}${spread(
      [
        {
          type: escape_attribute_value(href ? void 0 : type)
        },
        { href: escape_attribute_value(href) },
        { tabindex: "0" },
        escape_object($$restProps),
        escape_object(attrs)
      ],
      {}
    )}>${is_void(tag) ? "" : `${slots.default ? slots.default({}) : ``}`}${is_void(tag) ? "" : `</${tag}>`}` : "";
  })(href ? "a" : "button")}`}`;
});
function getPositioningUpdater(store) {
  return (props = {}) => {
    return updatePositioning$1(store, props);
  };
}
function updatePositioning$1(store, props) {
  const defaultPositioningProps = {
    side: "bottom",
    align: "center",
    sideOffset: 0,
    alignOffset: 0,
    sameWidth: false,
    avoidCollisions: true,
    collisionPadding: 8,
    fitViewport: false,
    strategy: "absolute",
    overlap: false
  };
  const withDefaults = { ...defaultPositioningProps, ...props };
  store.update((prev2) => {
    return {
      ...prev2,
      placement: joinPlacement(withDefaults.side, withDefaults.align),
      offset: {
        ...prev2.offset,
        mainAxis: withDefaults.sideOffset,
        crossAxis: withDefaults.alignOffset
      },
      gutter: 0,
      sameWidth: withDefaults.sameWidth,
      flip: withDefaults.avoidCollisions,
      overflowPadding: withDefaults.collisionPadding,
      boundary: withDefaults.collisionBoundary,
      fitViewport: withDefaults.fitViewport,
      strategy: withDefaults.strategy,
      overlap: withDefaults.overlap
    };
  });
}
function joinPlacement(side, align) {
  if (align === "center")
    return side;
  return `${side}-${align}`;
}
function getDialogData() {
  const NAME = "dialog";
  const PARTS = [
    "close",
    "content",
    "description",
    "overlay",
    "portal",
    "title",
    "trigger"
  ];
  return {
    NAME,
    PARTS
  };
}
function setCtx$1(props) {
  const { NAME, PARTS } = getDialogData();
  const getAttrs2 = createBitAttrs(NAME, PARTS);
  const dialog = {
    ...createDialog({ ...removeUndefined(props), role: "dialog", forceVisible: true }),
    getAttrs: getAttrs2
  };
  setContext(NAME, dialog);
  return {
    ...dialog,
    updateOption: getOptionUpdater(dialog.options)
  };
}
function getCtx$1() {
  const { NAME } = getDialogData();
  return getContext(NAME);
}
const Dialog = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $idValues, $$unsubscribe_idValues;
  let { preventScroll = void 0 } = $$props;
  let { closeOnEscape = void 0 } = $$props;
  let { closeOnOutsideClick = void 0 } = $$props;
  let { portal = void 0 } = $$props;
  let { open = void 0 } = $$props;
  let { onOpenChange = void 0 } = $$props;
  let { openFocus = void 0 } = $$props;
  let { closeFocus = void 0 } = $$props;
  let { onOutsideClick = void 0 } = $$props;
  const { states: { open: localOpen }, updateOption, ids } = setCtx$1({
    closeOnEscape,
    preventScroll,
    closeOnOutsideClick,
    portal,
    forceVisible: true,
    defaultOpen: open,
    openFocus,
    closeFocus,
    onOutsideClick,
    onOpenChange: ({ next: next2 }) => {
      if (open !== next2) {
        onOpenChange?.(next2);
        open = next2;
      }
      return next2;
    }
  });
  const idValues = derived([ids.content, ids.description, ids.title], ([$contentId, $descriptionId, $titleId]) => ({
    content: $contentId,
    description: $descriptionId,
    title: $titleId
  }));
  $$unsubscribe_idValues = subscribe(idValues, (value) => $idValues = value);
  if ($$props.preventScroll === void 0 && $$bindings.preventScroll && preventScroll !== void 0)
    $$bindings.preventScroll(preventScroll);
  if ($$props.closeOnEscape === void 0 && $$bindings.closeOnEscape && closeOnEscape !== void 0)
    $$bindings.closeOnEscape(closeOnEscape);
  if ($$props.closeOnOutsideClick === void 0 && $$bindings.closeOnOutsideClick && closeOnOutsideClick !== void 0)
    $$bindings.closeOnOutsideClick(closeOnOutsideClick);
  if ($$props.portal === void 0 && $$bindings.portal && portal !== void 0)
    $$bindings.portal(portal);
  if ($$props.open === void 0 && $$bindings.open && open !== void 0)
    $$bindings.open(open);
  if ($$props.onOpenChange === void 0 && $$bindings.onOpenChange && onOpenChange !== void 0)
    $$bindings.onOpenChange(onOpenChange);
  if ($$props.openFocus === void 0 && $$bindings.openFocus && openFocus !== void 0)
    $$bindings.openFocus(openFocus);
  if ($$props.closeFocus === void 0 && $$bindings.closeFocus && closeFocus !== void 0)
    $$bindings.closeFocus(closeFocus);
  if ($$props.onOutsideClick === void 0 && $$bindings.onOutsideClick && onOutsideClick !== void 0)
    $$bindings.onOutsideClick(onOutsideClick);
  open !== void 0 && localOpen.set(open);
  {
    updateOption("preventScroll", preventScroll);
  }
  {
    updateOption("closeOnEscape", closeOnEscape);
  }
  {
    updateOption("closeOnOutsideClick", closeOnOutsideClick);
  }
  {
    updateOption("portal", portal);
  }
  {
    updateOption("openFocus", openFocus);
  }
  {
    updateOption("closeFocus", closeFocus);
  }
  {
    updateOption("onOutsideClick", onOutsideClick);
  }
  $$unsubscribe_idValues();
  return `${slots.default ? slots.default({ ids: $idValues }) : ``}`;
});
const Dialog_title$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let builder2;
  let $$restProps = compute_rest_props($$props, ["level", "asChild", "id", "el"]);
  let $title, $$unsubscribe_title;
  let { level = "h2" } = $$props;
  let { asChild = false } = $$props;
  let { id = void 0 } = $$props;
  let { el = void 0 } = $$props;
  const { elements: { title }, ids, getAttrs: getAttrs2 } = getCtx$1();
  $$unsubscribe_title = subscribe(title, (value) => $title = value);
  const attrs = getAttrs2("title");
  if ($$props.level === void 0 && $$bindings.level && level !== void 0)
    $$bindings.level(level);
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0)
    $$bindings.asChild(asChild);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0)
    $$bindings.el(el);
  {
    if (id) {
      ids.title.set(id);
    }
  }
  builder2 = $title;
  {
    Object.assign(builder2, attrs);
  }
  $$unsubscribe_title();
  return `${asChild ? `${slots.default ? slots.default({ builder: builder2 }) : ``}` : `${((tag) => {
    return tag ? `<${level}${spread([escape_object(builder2), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${is_void(tag) ? "" : `${slots.default ? slots.default({ builder: builder2 }) : ``}`}${is_void(tag) ? "" : `</${tag}>`}` : "";
  })(level)}`}`;
});
const Dialog_close = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let builder2;
  let $$restProps = compute_rest_props($$props, ["asChild", "el"]);
  let $close, $$unsubscribe_close;
  let { asChild = false } = $$props;
  let { el = void 0 } = $$props;
  const { elements: { close }, getAttrs: getAttrs2 } = getCtx$1();
  $$unsubscribe_close = subscribe(close, (value) => $close = value);
  createDispatcher();
  const attrs = getAttrs2("close");
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0)
    $$bindings.asChild(asChild);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0)
    $$bindings.el(el);
  builder2 = $close;
  {
    Object.assign(builder2, attrs);
  }
  $$unsubscribe_close();
  return `${asChild ? `${slots.default ? slots.default({ builder: builder2 }) : ``}` : `<button${spread([escape_object(builder2), { type: "button" }, escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder: builder2 }) : ``}</button>`}`;
});
const Dialog_portal$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let builder2;
  let $$restProps = compute_rest_props($$props, ["asChild", "el"]);
  let $portalled, $$unsubscribe_portalled;
  let { asChild = false } = $$props;
  let { el = void 0 } = $$props;
  const { elements: { portalled }, getAttrs: getAttrs2 } = getCtx$1();
  $$unsubscribe_portalled = subscribe(portalled, (value) => $portalled = value);
  const attrs = getAttrs2("portal");
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0)
    $$bindings.asChild(asChild);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0)
    $$bindings.el(el);
  builder2 = $portalled;
  {
    Object.assign(builder2, attrs);
  }
  $$unsubscribe_portalled();
  return `${asChild ? `${slots.default ? slots.default({ builder: builder2 }) : ``}` : `<div${spread([escape_object(builder2), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder: builder2 }) : ``}</div>`}`;
});
const Dialog_content$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let builder2;
  let $$restProps = compute_rest_props($$props, [
    "transition",
    "transitionConfig",
    "inTransition",
    "inTransitionConfig",
    "outTransition",
    "outTransitionConfig",
    "asChild",
    "id",
    "el"
  ]);
  let $content, $$unsubscribe_content;
  let $open, $$unsubscribe_open;
  let { transition = void 0 } = $$props;
  let { transitionConfig = void 0 } = $$props;
  let { inTransition = void 0 } = $$props;
  let { inTransitionConfig = void 0 } = $$props;
  let { outTransition = void 0 } = $$props;
  let { outTransitionConfig = void 0 } = $$props;
  let { asChild = false } = $$props;
  let { id = void 0 } = $$props;
  let { el = void 0 } = $$props;
  const { elements: { content }, states: { open }, ids, getAttrs: getAttrs2 } = getCtx$1();
  $$unsubscribe_content = subscribe(content, (value) => $content = value);
  $$unsubscribe_open = subscribe(open, (value) => $open = value);
  const attrs = getAttrs2("content");
  if ($$props.transition === void 0 && $$bindings.transition && transition !== void 0)
    $$bindings.transition(transition);
  if ($$props.transitionConfig === void 0 && $$bindings.transitionConfig && transitionConfig !== void 0)
    $$bindings.transitionConfig(transitionConfig);
  if ($$props.inTransition === void 0 && $$bindings.inTransition && inTransition !== void 0)
    $$bindings.inTransition(inTransition);
  if ($$props.inTransitionConfig === void 0 && $$bindings.inTransitionConfig && inTransitionConfig !== void 0)
    $$bindings.inTransitionConfig(inTransitionConfig);
  if ($$props.outTransition === void 0 && $$bindings.outTransition && outTransition !== void 0)
    $$bindings.outTransition(outTransition);
  if ($$props.outTransitionConfig === void 0 && $$bindings.outTransitionConfig && outTransitionConfig !== void 0)
    $$bindings.outTransitionConfig(outTransitionConfig);
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0)
    $$bindings.asChild(asChild);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0)
    $$bindings.el(el);
  {
    if (id) {
      ids.content.set(id);
    }
  }
  builder2 = $content;
  {
    Object.assign(builder2, attrs);
  }
  $$unsubscribe_content();
  $$unsubscribe_open();
  return `${asChild && $open ? `${slots.default ? slots.default({ builder: builder2 }) : ``}` : `${transition && $open ? `<div${spread([escape_object(builder2), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder: builder2 }) : ``}</div>` : `${inTransition && outTransition && $open ? `<div${spread([escape_object(builder2), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder: builder2 }) : ``}</div>` : `${inTransition && $open ? `<div${spread([escape_object(builder2), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder: builder2 }) : ``}</div>` : `${outTransition && $open ? `<div${spread([escape_object(builder2), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder: builder2 }) : ``}</div>` : `${$open ? `<div${spread([escape_object(builder2), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder: builder2 }) : ``}</div>` : ``}`}`}`}`}`}`;
});
const Dialog_overlay$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let builder2;
  let $$restProps = compute_rest_props($$props, [
    "transition",
    "transitionConfig",
    "inTransition",
    "inTransitionConfig",
    "outTransition",
    "outTransitionConfig",
    "asChild",
    "el"
  ]);
  let $overlay, $$unsubscribe_overlay;
  let $open, $$unsubscribe_open;
  let { transition = void 0 } = $$props;
  let { transitionConfig = void 0 } = $$props;
  let { inTransition = void 0 } = $$props;
  let { inTransitionConfig = void 0 } = $$props;
  let { outTransition = void 0 } = $$props;
  let { outTransitionConfig = void 0 } = $$props;
  let { asChild = false } = $$props;
  let { el = void 0 } = $$props;
  const { elements: { overlay }, states: { open }, getAttrs: getAttrs2 } = getCtx$1();
  $$unsubscribe_overlay = subscribe(overlay, (value) => $overlay = value);
  $$unsubscribe_open = subscribe(open, (value) => $open = value);
  const attrs = getAttrs2("overlay");
  if ($$props.transition === void 0 && $$bindings.transition && transition !== void 0)
    $$bindings.transition(transition);
  if ($$props.transitionConfig === void 0 && $$bindings.transitionConfig && transitionConfig !== void 0)
    $$bindings.transitionConfig(transitionConfig);
  if ($$props.inTransition === void 0 && $$bindings.inTransition && inTransition !== void 0)
    $$bindings.inTransition(inTransition);
  if ($$props.inTransitionConfig === void 0 && $$bindings.inTransitionConfig && inTransitionConfig !== void 0)
    $$bindings.inTransitionConfig(inTransitionConfig);
  if ($$props.outTransition === void 0 && $$bindings.outTransition && outTransition !== void 0)
    $$bindings.outTransition(outTransition);
  if ($$props.outTransitionConfig === void 0 && $$bindings.outTransitionConfig && outTransitionConfig !== void 0)
    $$bindings.outTransitionConfig(outTransitionConfig);
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0)
    $$bindings.asChild(asChild);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0)
    $$bindings.el(el);
  builder2 = $overlay;
  {
    Object.assign(builder2, attrs);
  }
  $$unsubscribe_overlay();
  $$unsubscribe_open();
  return `${asChild && $open ? `${slots.default ? slots.default({ builder: builder2 }) : ``}` : `${transition && $open ? ` <div${spread([escape_object(builder2), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}></div>` : `${inTransition && outTransition && $open ? ` <div${spread([escape_object(builder2), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}></div>` : `${inTransition && $open ? ` <div${spread([escape_object(builder2), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}></div>` : `${outTransition && $open ? ` <div${spread([escape_object(builder2), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}></div>` : `${$open ? ` <div${spread([escape_object(builder2), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}></div>` : ``}`}`}`}`}`}`;
});
const Dialog_description$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let builder2;
  let $$restProps = compute_rest_props($$props, ["asChild", "id", "el"]);
  let $description, $$unsubscribe_description;
  let { asChild = false } = $$props;
  let { id = void 0 } = $$props;
  let { el = void 0 } = $$props;
  const { elements: { description }, ids, getAttrs: getAttrs2 } = getCtx$1();
  $$unsubscribe_description = subscribe(description, (value) => $description = value);
  const attrs = getAttrs2("description");
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0)
    $$bindings.asChild(asChild);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0)
    $$bindings.el(el);
  {
    if (id) {
      ids.description.set(id);
    }
  }
  builder2 = $description;
  {
    Object.assign(builder2, attrs);
  }
  $$unsubscribe_description();
  return `${asChild ? `${slots.default ? slots.default({ builder: builder2 }) : ``}` : `<div${spread([escape_object(builder2), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder: builder2 }) : ``}</div>`}`;
});
function getSelectData() {
  const NAME = "select";
  const GROUP_NAME = "select-group";
  const ITEM_NAME = "select-item";
  const PARTS = [
    "arrow",
    "content",
    "group",
    "item",
    "indicator",
    "input",
    "label",
    "trigger",
    "value"
  ];
  return {
    NAME,
    GROUP_NAME,
    ITEM_NAME,
    PARTS
  };
}
function getCtx() {
  const { NAME } = getSelectData();
  return getContext(NAME);
}
function setCtx(props) {
  const { NAME, PARTS } = getSelectData();
  const getAttrs2 = createBitAttrs(NAME, PARTS);
  const select = {
    ...createSelect({ ...removeUndefined(props), forceVisible: true }),
    getAttrs: getAttrs2
  };
  setContext(NAME, select);
  return {
    ...select,
    updateOption: getOptionUpdater(select.options)
  };
}
function setGroupCtx() {
  const { GROUP_NAME } = getSelectData();
  const id = generateId();
  setContext(GROUP_NAME, id);
  const { elements: { group }, getAttrs: getAttrs2 } = getCtx();
  return { group, id, getAttrs: getAttrs2 };
}
function setItemCtx(value) {
  const { ITEM_NAME } = getSelectData();
  const select = getCtx();
  setContext(ITEM_NAME, value);
  return select;
}
function getItemIndicator() {
  const { ITEM_NAME } = getSelectData();
  const { helpers: { isSelected }, getAttrs: getAttrs2 } = getCtx();
  const value = getContext(ITEM_NAME);
  return {
    value,
    isSelected,
    getAttrs: getAttrs2
  };
}
function updatePositioning(props) {
  const defaultPlacement = {
    side: "bottom",
    align: "center",
    sameWidth: true
  };
  const withDefaults = { ...defaultPlacement, ...props };
  const { options: { positioning } } = getCtx();
  const updater = getPositioningUpdater(positioning);
  updater(withDefaults);
}
const Select = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $idValues, $$unsubscribe_idValues;
  let { required = void 0 } = $$props;
  let { disabled = void 0 } = $$props;
  let { preventScroll = void 0 } = $$props;
  let { loop = void 0 } = $$props;
  let { closeOnEscape = void 0 } = $$props;
  let { closeOnOutsideClick = void 0 } = $$props;
  let { portal = void 0 } = $$props;
  let { name: name2 = void 0 } = $$props;
  let { multiple = false } = $$props;
  let { selected = void 0 } = $$props;
  let { onSelectedChange = void 0 } = $$props;
  let { open = void 0 } = $$props;
  let { onOpenChange = void 0 } = $$props;
  let { items = [] } = $$props;
  let { onOutsideClick = void 0 } = $$props;
  const { states: { open: localOpen, selected: localSelected }, updateOption, ids } = setCtx({
    required,
    disabled,
    preventScroll,
    loop,
    closeOnEscape,
    closeOnOutsideClick,
    portal,
    name: name2,
    onOutsideClick,
    multiple,
    forceVisible: true,
    defaultSelected: Array.isArray(selected) ? [...selected] : (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      selected
    ),
    defaultOpen: open,
    onSelectedChange: ({ next: next2 }) => {
      if (Array.isArray(next2)) {
        if (!Array.isArray(selected) || !arraysAreEqual(selected, next2)) {
          onSelectedChange?.(next2);
          selected = next2;
          return next2;
        }
        return next2;
      }
      if (selected !== next2) {
        onSelectedChange?.(next2);
        selected = next2;
      }
      return next2;
    },
    onOpenChange: ({ next: next2 }) => {
      if (open !== next2) {
        onOpenChange?.(next2);
        open = next2;
      }
      return next2;
    },
    items
  });
  const idValues = derived([ids.menu, ids.trigger, ids.label], ([$menuId, $triggerId, $labelId]) => ({
    menu: $menuId,
    trigger: $triggerId,
    label: $labelId
  }));
  $$unsubscribe_idValues = subscribe(idValues, (value) => $idValues = value);
  if ($$props.required === void 0 && $$bindings.required && required !== void 0)
    $$bindings.required(required);
  if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0)
    $$bindings.disabled(disabled);
  if ($$props.preventScroll === void 0 && $$bindings.preventScroll && preventScroll !== void 0)
    $$bindings.preventScroll(preventScroll);
  if ($$props.loop === void 0 && $$bindings.loop && loop !== void 0)
    $$bindings.loop(loop);
  if ($$props.closeOnEscape === void 0 && $$bindings.closeOnEscape && closeOnEscape !== void 0)
    $$bindings.closeOnEscape(closeOnEscape);
  if ($$props.closeOnOutsideClick === void 0 && $$bindings.closeOnOutsideClick && closeOnOutsideClick !== void 0)
    $$bindings.closeOnOutsideClick(closeOnOutsideClick);
  if ($$props.portal === void 0 && $$bindings.portal && portal !== void 0)
    $$bindings.portal(portal);
  if ($$props.name === void 0 && $$bindings.name && name2 !== void 0)
    $$bindings.name(name2);
  if ($$props.multiple === void 0 && $$bindings.multiple && multiple !== void 0)
    $$bindings.multiple(multiple);
  if ($$props.selected === void 0 && $$bindings.selected && selected !== void 0)
    $$bindings.selected(selected);
  if ($$props.onSelectedChange === void 0 && $$bindings.onSelectedChange && onSelectedChange !== void 0)
    $$bindings.onSelectedChange(onSelectedChange);
  if ($$props.open === void 0 && $$bindings.open && open !== void 0)
    $$bindings.open(open);
  if ($$props.onOpenChange === void 0 && $$bindings.onOpenChange && onOpenChange !== void 0)
    $$bindings.onOpenChange(onOpenChange);
  if ($$props.items === void 0 && $$bindings.items && items !== void 0)
    $$bindings.items(items);
  if ($$props.onOutsideClick === void 0 && $$bindings.onOutsideClick && onOutsideClick !== void 0)
    $$bindings.onOutsideClick(onOutsideClick);
  open !== void 0 && localOpen.set(open);
  selected !== void 0 && localSelected.set(Array.isArray(selected) ? [...selected] : (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    selected
  ));
  {
    updateOption("required", required);
  }
  {
    updateOption("disabled", disabled);
  }
  {
    updateOption("preventScroll", preventScroll);
  }
  {
    updateOption("loop", loop);
  }
  {
    updateOption("closeOnEscape", closeOnEscape);
  }
  {
    updateOption("closeOnOutsideClick", closeOnOutsideClick);
  }
  {
    updateOption("portal", portal);
  }
  {
    updateOption("name", name2);
  }
  {
    updateOption("multiple", multiple);
  }
  {
    updateOption("onOutsideClick", onOutsideClick);
  }
  $$unsubscribe_idValues();
  return `${slots.default ? slots.default({ ids: $idValues }) : ``}`;
});
const Select_content$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let builder2;
  let $$restProps = compute_rest_props($$props, [
    "transition",
    "transitionConfig",
    "inTransition",
    "inTransitionConfig",
    "outTransition",
    "outTransitionConfig",
    "asChild",
    "id",
    "side",
    "align",
    "sideOffset",
    "alignOffset",
    "collisionPadding",
    "avoidCollisions",
    "collisionBoundary",
    "sameWidth",
    "fitViewport",
    "strategy",
    "overlap",
    "el"
  ]);
  let $open, $$unsubscribe_open;
  let $menu, $$unsubscribe_menu;
  let { transition = void 0 } = $$props;
  let { transitionConfig = void 0 } = $$props;
  let { inTransition = void 0 } = $$props;
  let { inTransitionConfig = void 0 } = $$props;
  let { outTransition = void 0 } = $$props;
  let { outTransitionConfig = void 0 } = $$props;
  let { asChild = false } = $$props;
  let { id = void 0 } = $$props;
  let { side = "bottom" } = $$props;
  let { align = "center" } = $$props;
  let { sideOffset = 0 } = $$props;
  let { alignOffset = 0 } = $$props;
  let { collisionPadding = 8 } = $$props;
  let { avoidCollisions = true } = $$props;
  let { collisionBoundary = void 0 } = $$props;
  let { sameWidth = true } = $$props;
  let { fitViewport = false } = $$props;
  let { strategy = "absolute" } = $$props;
  let { overlap = false } = $$props;
  let { el = void 0 } = $$props;
  const { elements: { menu }, states: { open }, ids, getAttrs: getAttrs2 } = getCtx();
  $$unsubscribe_menu = subscribe(menu, (value) => $menu = value);
  $$unsubscribe_open = subscribe(open, (value) => $open = value);
  createDispatcher();
  const attrs = getAttrs2("content");
  if ($$props.transition === void 0 && $$bindings.transition && transition !== void 0)
    $$bindings.transition(transition);
  if ($$props.transitionConfig === void 0 && $$bindings.transitionConfig && transitionConfig !== void 0)
    $$bindings.transitionConfig(transitionConfig);
  if ($$props.inTransition === void 0 && $$bindings.inTransition && inTransition !== void 0)
    $$bindings.inTransition(inTransition);
  if ($$props.inTransitionConfig === void 0 && $$bindings.inTransitionConfig && inTransitionConfig !== void 0)
    $$bindings.inTransitionConfig(inTransitionConfig);
  if ($$props.outTransition === void 0 && $$bindings.outTransition && outTransition !== void 0)
    $$bindings.outTransition(outTransition);
  if ($$props.outTransitionConfig === void 0 && $$bindings.outTransitionConfig && outTransitionConfig !== void 0)
    $$bindings.outTransitionConfig(outTransitionConfig);
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0)
    $$bindings.asChild(asChild);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.side === void 0 && $$bindings.side && side !== void 0)
    $$bindings.side(side);
  if ($$props.align === void 0 && $$bindings.align && align !== void 0)
    $$bindings.align(align);
  if ($$props.sideOffset === void 0 && $$bindings.sideOffset && sideOffset !== void 0)
    $$bindings.sideOffset(sideOffset);
  if ($$props.alignOffset === void 0 && $$bindings.alignOffset && alignOffset !== void 0)
    $$bindings.alignOffset(alignOffset);
  if ($$props.collisionPadding === void 0 && $$bindings.collisionPadding && collisionPadding !== void 0)
    $$bindings.collisionPadding(collisionPadding);
  if ($$props.avoidCollisions === void 0 && $$bindings.avoidCollisions && avoidCollisions !== void 0)
    $$bindings.avoidCollisions(avoidCollisions);
  if ($$props.collisionBoundary === void 0 && $$bindings.collisionBoundary && collisionBoundary !== void 0)
    $$bindings.collisionBoundary(collisionBoundary);
  if ($$props.sameWidth === void 0 && $$bindings.sameWidth && sameWidth !== void 0)
    $$bindings.sameWidth(sameWidth);
  if ($$props.fitViewport === void 0 && $$bindings.fitViewport && fitViewport !== void 0)
    $$bindings.fitViewport(fitViewport);
  if ($$props.strategy === void 0 && $$bindings.strategy && strategy !== void 0)
    $$bindings.strategy(strategy);
  if ($$props.overlap === void 0 && $$bindings.overlap && overlap !== void 0)
    $$bindings.overlap(overlap);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0)
    $$bindings.el(el);
  {
    if (id) {
      ids.menu.set(id);
    }
  }
  builder2 = $menu;
  {
    Object.assign(builder2, attrs);
  }
  {
    if ($open) {
      updatePositioning({
        side,
        align,
        sideOffset,
        alignOffset,
        collisionPadding,
        avoidCollisions,
        collisionBoundary,
        sameWidth,
        fitViewport,
        strategy,
        overlap
      });
    }
  }
  $$unsubscribe_open();
  $$unsubscribe_menu();
  return ` ${asChild && $open ? `${slots.default ? slots.default({ builder: builder2 }) : ``}` : `${transition && $open ? `<div${spread([escape_object(builder2), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder: builder2 }) : ``}</div>` : `${inTransition && outTransition && $open ? `<div${spread([escape_object(builder2), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder: builder2 }) : ``}</div>` : `${inTransition && $open ? `<div${spread([escape_object(builder2), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder: builder2 }) : ``}</div>` : `${outTransition && $open ? `<div${spread([escape_object(builder2), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder: builder2 }) : ``}</div>` : `${$open ? `<div${spread([escape_object(builder2), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder: builder2 }) : ``}</div>` : ``}`}`}`}`}`}`;
});
const Select_group = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let builder2;
  let $$restProps = compute_rest_props($$props, ["asChild", "el"]);
  let $group, $$unsubscribe_group;
  let { asChild = false } = $$props;
  let { el = void 0 } = $$props;
  const { group, id, getAttrs: getAttrs2 } = setGroupCtx();
  $$unsubscribe_group = subscribe(group, (value) => $group = value);
  const attrs = getAttrs2("group");
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0)
    $$bindings.asChild(asChild);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0)
    $$bindings.el(el);
  builder2 = $group(id);
  {
    Object.assign(builder2, attrs);
  }
  $$unsubscribe_group();
  return `${asChild ? `${slots.default ? slots.default({ builder: builder2 }) : ``}` : `<div${spread([escape_object(builder2), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder: builder2 }) : ``}</div>`}`;
});
const Select_input = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let attrs;
  let builder2;
  let $$restProps = compute_rest_props($$props, ["asChild", "el"]);
  let $hiddenInput, $$unsubscribe_hiddenInput;
  let $disabled, $$unsubscribe_disabled;
  let { asChild = false } = $$props;
  let { el = void 0 } = $$props;
  const { elements: { hiddenInput }, options: { disabled }, getAttrs: getAttrs2 } = getCtx();
  $$unsubscribe_hiddenInput = subscribe(hiddenInput, (value) => $hiddenInput = value);
  $$unsubscribe_disabled = subscribe(disabled, (value) => $disabled = value);
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0)
    $$bindings.asChild(asChild);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0)
    $$bindings.el(el);
  attrs = {
    ...getAttrs2("input"),
    disabled: $disabled ? true : void 0
  };
  builder2 = $hiddenInput;
  {
    Object.assign(builder2, attrs);
  }
  $$unsubscribe_hiddenInput();
  $$unsubscribe_disabled();
  return `${asChild ? `${slots.default ? slots.default({ builder: builder2 }) : ``}` : `<input${spread([escape_object(builder2), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>`}`;
});
const Select_item$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let builder2;
  let isSelected;
  let $$restProps = compute_rest_props($$props, ["value", "disabled", "label", "asChild", "el"]);
  let $isSelectedStore, $$unsubscribe_isSelectedStore;
  let $item, $$unsubscribe_item;
  let { value } = $$props;
  let { disabled = void 0 } = $$props;
  let { label = void 0 } = $$props;
  let { asChild = false } = $$props;
  let { el = void 0 } = $$props;
  const { elements: { option: item }, helpers: { isSelected: isSelectedStore }, getAttrs: getAttrs2 } = setItemCtx(value);
  $$unsubscribe_item = subscribe(item, (value2) => $item = value2);
  $$unsubscribe_isSelectedStore = subscribe(isSelectedStore, (value2) => $isSelectedStore = value2);
  createDispatcher();
  const attrs = getAttrs2("item");
  if ($$props.value === void 0 && $$bindings.value && value !== void 0)
    $$bindings.value(value);
  if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0)
    $$bindings.disabled(disabled);
  if ($$props.label === void 0 && $$bindings.label && label !== void 0)
    $$bindings.label(label);
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0)
    $$bindings.asChild(asChild);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0)
    $$bindings.el(el);
  builder2 = $item({ value, disabled, label });
  {
    Object.assign(builder2, attrs);
  }
  isSelected = $isSelectedStore(value);
  $$unsubscribe_isSelectedStore();
  $$unsubscribe_item();
  return ` ${asChild ? `${slots.default ? slots.default({ builder: builder2, isSelected }) : ``}` : `<div${spread([escape_object(builder2), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder: builder2, isSelected }) : ` ${escape(label ? label : value)} `}</div>`}`;
});
const Select_item_indicator = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["asChild", "el"]);
  let $isSelected, $$unsubscribe_isSelected;
  let { asChild = false } = $$props;
  let { el = void 0 } = $$props;
  const { isSelected, value, getAttrs: getAttrs2 } = getItemIndicator();
  $$unsubscribe_isSelected = subscribe(isSelected, (value2) => $isSelected = value2);
  const attrs = getAttrs2("indicator");
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0)
    $$bindings.asChild(asChild);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0)
    $$bindings.el(el);
  $$unsubscribe_isSelected();
  return `${asChild ? `${slots.default ? slots.default({ attrs, isSelected: $isSelected(value) }) : ``}` : `<div${spread([escape_object($$restProps), escape_object(attrs)], {})}${add_attribute("this", el, 0)}>${$isSelected(value) ? `${slots.default ? slots.default({ attrs, isSelected: $isSelected(value) }) : ``}` : ``}</div>`}`;
});
const Select_trigger$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let builder2;
  let $$restProps = compute_rest_props($$props, ["asChild", "id", "el"]);
  let $trigger, $$unsubscribe_trigger;
  let { asChild = false } = $$props;
  let { id = void 0 } = $$props;
  let { el = void 0 } = $$props;
  const { elements: { trigger }, ids, getAttrs: getAttrs2 } = getCtx();
  $$unsubscribe_trigger = subscribe(trigger, (value) => $trigger = value);
  createDispatcher();
  const attrs = getAttrs2("trigger");
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0)
    $$bindings.asChild(asChild);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0)
    $$bindings.el(el);
  {
    if (id) {
      ids.trigger.set(id);
    }
  }
  builder2 = $trigger;
  {
    Object.assign(builder2, attrs);
  }
  $$unsubscribe_trigger();
  return `${asChild ? `${slots.default ? slots.default({ builder: builder2 }) : ``}` : `<button${spread([escape_object(builder2), { type: "button" }, escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder: builder2 }) : ``}</button>`}`;
});
const Select_value = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let label;
  let $$restProps = compute_rest_props($$props, ["placeholder", "asChild", "el"]);
  let $selectedLabel, $$unsubscribe_selectedLabel;
  let { placeholder = "" } = $$props;
  let { asChild = false } = $$props;
  let { el = void 0 } = $$props;
  const { states: { selectedLabel }, getAttrs: getAttrs2 } = getCtx();
  $$unsubscribe_selectedLabel = subscribe(selectedLabel, (value) => $selectedLabel = value);
  const attrs = getAttrs2("value");
  if ($$props.placeholder === void 0 && $$bindings.placeholder && placeholder !== void 0)
    $$bindings.placeholder(placeholder);
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0)
    $$bindings.asChild(asChild);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0)
    $$bindings.el(el);
  label = $selectedLabel;
  $$unsubscribe_selectedLabel();
  return `${asChild ? `${slots.default ? slots.default({ label, attrs }) : ``}` : `<span${spread(
    [
      escape_object($$restProps),
      escape_object(attrs),
      {
        "data-placeholder": escape_attribute_value(!label ? "" : void 0)
      }
    ],
    {}
  )}${add_attribute("this", el, 0)}>${escape(label ? label : placeholder)}</span>`}`;
});
function cubicOut(t) {
  const f = t - 1;
  return f * f * f + 1;
}
const cn = (...inputs) => {
  return twMerge(clsx(inputs));
};
const flyAndScale = (node, params = { y: -8, x: 0, start: 0.95, duration: 150 }) => {
  const style = getComputedStyle(node);
  const transform = style.transform === "none" ? "" : style.transform;
  const scaleConversion = (valueA, scaleA, scaleB) => {
    const [minA, maxA] = scaleA;
    const [minB, maxB] = scaleB;
    const percentage = (valueA - minA) / (maxA - minA);
    const valueB = percentage * (maxB - minB) + minB;
    return valueB;
  };
  const styleToString2 = (style2) => {
    return Object.keys(style2).reduce((str, key) => {
      if (style2[key] === void 0)
        return str;
      return str + `${key}:${style2[key]};`;
    }, "");
  };
  return {
    duration: params.duration ?? 200,
    delay: 0,
    css: (t) => {
      const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0]);
      const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0]);
      const scale2 = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1]);
      return styleToString2({
        transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale2})`,
        opacity: t
      });
    },
    easing: cubicOut
  };
};
const Button = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class", "variant", "size", "builders"]);
  let { class: className = void 0 } = $$props;
  let { variant = "default" } = $$props;
  let { size: size2 = "default" } = $$props;
  let { builders = [] } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.variant === void 0 && $$bindings.variant && variant !== void 0)
    $$bindings.variant(variant);
  if ($$props.size === void 0 && $$bindings.size && size2 !== void 0)
    $$bindings.size(size2);
  if ($$props.builders === void 0 && $$bindings.builders && builders !== void 0)
    $$bindings.builders(builders);
  return `${validate_component(Button$1, "ButtonPrimitive.Root").$$render(
    $$result,
    Object.assign(
      {},
      { builders },
      {
        class: cn(buttonVariants({ variant, size: size2, className }))
      },
      { type: "button" },
      $$restProps
    ),
    {},
    {
      default: () => {
        return `${slots.default ? slots.default({}) : ``}`;
      }
    }
  )}`;
});
const buttonVariants = tv({
  base: "inline-flex items-center justify-center rounded-md text-sm font-medium whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  variants: {
    variant: {
      default: "bg-button text-white hover:bg-transparent hover:border hover:border-white",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      link: "text-primary underline-offset-4 hover:underline"
    },
    size: {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10"
    }
  },
  defaultVariants: {
    variant: "default",
    size: "default"
  }
});
/**
 * @license lucide-svelte v0.321.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const defaultAttributes = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": 2,
  "stroke-linecap": "round",
  "stroke-linejoin": "round"
};
const Icon = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["name", "color", "size", "strokeWidth", "absoluteStrokeWidth", "iconNode"]);
  let { name: name2 } = $$props;
  let { color = "currentColor" } = $$props;
  let { size: size2 = 24 } = $$props;
  let { strokeWidth = 2 } = $$props;
  let { absoluteStrokeWidth = false } = $$props;
  let { iconNode } = $$props;
  if ($$props.name === void 0 && $$bindings.name && name2 !== void 0)
    $$bindings.name(name2);
  if ($$props.color === void 0 && $$bindings.color && color !== void 0)
    $$bindings.color(color);
  if ($$props.size === void 0 && $$bindings.size && size2 !== void 0)
    $$bindings.size(size2);
  if ($$props.strokeWidth === void 0 && $$bindings.strokeWidth && strokeWidth !== void 0)
    $$bindings.strokeWidth(strokeWidth);
  if ($$props.absoluteStrokeWidth === void 0 && $$bindings.absoluteStrokeWidth && absoluteStrokeWidth !== void 0)
    $$bindings.absoluteStrokeWidth(absoluteStrokeWidth);
  if ($$props.iconNode === void 0 && $$bindings.iconNode && iconNode !== void 0)
    $$bindings.iconNode(iconNode);
  return `<svg${spread(
    [
      escape_object(defaultAttributes),
      escape_object($$restProps),
      { width: escape_attribute_value(size2) },
      { height: escape_attribute_value(size2) },
      { stroke: escape_attribute_value(color) },
      {
        "stroke-width": escape_attribute_value(absoluteStrokeWidth ? Number(strokeWidth) * 24 / Number(size2) : strokeWidth)
      },
      {
        class: escape_attribute_value(`lucide-icon lucide lucide-${name2} ${$$props.class ?? ""}`)
      }
    ],
    {}
  )}>${each(iconNode, ([tag, attrs]) => {
    return `${((tag$1) => {
      return tag$1 ? `<${tag}${spread([escape_object(attrs)], {})}>${is_void(tag$1) ? "" : ``}${is_void(tag$1) ? "" : `</${tag$1}>`}` : "";
    })(tag)}`;
  })}${slots.default ? slots.default({}) : ``}</svg>`;
});
const Check = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  const iconNode = [["path", { "d": "M20 6 9 17l-5-5" }]];
  return `${validate_component(Icon, "Icon").$$render($$result, Object.assign({}, { name: "check" }, $$props, { iconNode }), {}, {
    default: () => {
      return `${slots.default ? slots.default({}) : ``}`;
    }
  })}`;
});
const Chevron_down = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  const iconNode = [["path", { "d": "m6 9 6 6 6-6" }]];
  return `${validate_component(Icon, "Icon").$$render($$result, Object.assign({}, { name: "chevron-down" }, $$props, { iconNode }), {}, {
    default: () => {
      return `${slots.default ? slots.default({}) : ``}`;
    }
  })}`;
});
const Loader_2 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  const iconNode = [["path", { "d": "M21 12a9 9 0 1 1-6.219-8.56" }]];
  return `${validate_component(Icon, "Icon").$$render($$result, Object.assign({}, { name: "loader-2" }, $$props, { iconNode }), {}, {
    default: () => {
      return `${slots.default ? slots.default({}) : ``}`;
    }
  })}`;
});
const X = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  const iconNode = [["path", { "d": "M18 6 6 18" }], ["path", { "d": "m6 6 12 12" }]];
  return `${validate_component(Icon, "Icon").$$render($$result, Object.assign({}, { name: "x" }, $$props, { iconNode }), {}, {
    default: () => {
      return `${slots.default ? slots.default({}) : ``}`;
    }
  })}`;
});
const Select_item = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class", "value", "label", "disabled"]);
  let { class: className = void 0 } = $$props;
  let { value } = $$props;
  let { label = void 0 } = $$props;
  let { disabled = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.value === void 0 && $$bindings.value && value !== void 0)
    $$bindings.value(value);
  if ($$props.label === void 0 && $$bindings.label && label !== void 0)
    $$bindings.label(label);
  if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0)
    $$bindings.disabled(disabled);
  return `${validate_component(Select_item$1, "SelectPrimitive.Item").$$render(
    $$result,
    Object.assign(
      {},
      { value },
      { disabled },
      { label },
      {
        class: cn("relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className)
      },
      $$restProps
    ),
    {},
    {
      default: () => {
        return `<span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">${validate_component(Select_item_indicator, "SelectPrimitive.ItemIndicator").$$render($$result, {}, {}, {
          default: () => {
            return `${validate_component(Check, "Check").$$render($$result, { class: "h-4 w-4" }, {}, {})}`;
          }
        })}</span> ${slots.default ? slots.default({}) : ``}`;
      }
    }
  )}`;
});
function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
  const o = +getComputedStyle(node).opacity;
  return {
    delay,
    duration,
    easing,
    css: (t) => `opacity: ${t * o}`
  };
}
function scale(node, { delay = 0, duration = 400, easing = cubicOut, start = 0, opacity = 0 } = {}) {
  const style = getComputedStyle(node);
  const target_opacity = +style.opacity;
  const transform = style.transform === "none" ? "" : style.transform;
  const sd = 1 - start;
  const od = target_opacity * (1 - opacity);
  return {
    delay,
    duration,
    easing,
    css: (_t, u) => `
			transform: ${transform} scale(${1 - sd * u});
			opacity: ${target_opacity - od * u}
		`
  };
}
const Select_content = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, [
    "sideOffset",
    "inTransition",
    "inTransitionConfig",
    "outTransition",
    "outTransitionConfig",
    "class"
  ]);
  let { sideOffset = 4 } = $$props;
  let { inTransition = flyAndScale } = $$props;
  let { inTransitionConfig = void 0 } = $$props;
  let { outTransition = scale } = $$props;
  let { outTransitionConfig = { start: 0.95, opacity: 0, duration: 50 } } = $$props;
  let { class: className = void 0 } = $$props;
  if ($$props.sideOffset === void 0 && $$bindings.sideOffset && sideOffset !== void 0)
    $$bindings.sideOffset(sideOffset);
  if ($$props.inTransition === void 0 && $$bindings.inTransition && inTransition !== void 0)
    $$bindings.inTransition(inTransition);
  if ($$props.inTransitionConfig === void 0 && $$bindings.inTransitionConfig && inTransitionConfig !== void 0)
    $$bindings.inTransitionConfig(inTransitionConfig);
  if ($$props.outTransition === void 0 && $$bindings.outTransition && outTransition !== void 0)
    $$bindings.outTransition(outTransition);
  if ($$props.outTransitionConfig === void 0 && $$bindings.outTransitionConfig && outTransitionConfig !== void 0)
    $$bindings.outTransitionConfig(outTransitionConfig);
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  return `${validate_component(Select_content$1, "SelectPrimitive.Content").$$render(
    $$result,
    Object.assign(
      {},
      { inTransition },
      { inTransitionConfig },
      { outTransition },
      { outTransitionConfig },
      { sideOffset },
      {
        class: cn("relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md outline-none", className)
      },
      $$restProps
    ),
    {},
    {
      default: () => {
        return `<div class="w-full p-1">${slots.default ? slots.default({}) : ``}</div>`;
      }
    }
  )}`;
});
const Select_trigger = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class"]);
  let { class: className = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  return `${validate_component(Select_trigger$1, "SelectPrimitive.Trigger").$$render(
    $$result,
    Object.assign(
      {},
      {
        class: cn("flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1", className)
      },
      $$restProps
    ),
    {},
    {
      default: ({ builder: builder2 }) => {
        return `${slots.default ? slots.default({ builder: builder2 }) : ``} <div>${validate_component(Chevron_down, "ChevronDown").$$render($$result, { class: "h-4 w-4 opacity-50" }, {}, {})}</div>`;
      }
    }
  )}`;
});
const Root$1 = Select;
const Group = Select_group;
const Input = Select_input;
const Value = Select_value;
const Dialog_title = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class"]);
  let { class: className = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  return `${validate_component(Dialog_title$1, "DialogPrimitive.Title").$$render(
    $$result,
    Object.assign(
      {},
      {
        class: cn("text-lg font-semibold leading-none tracking-tight", className)
      },
      $$restProps
    ),
    {},
    {
      default: () => {
        return `${slots.default ? slots.default({}) : ``}`;
      }
    }
  )}`;
});
const Dialog_portal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, []);
  return `${validate_component(Dialog_portal$1, "DialogPrimitive.Portal").$$render($$result, Object.assign({}, $$restProps), {}, {
    default: () => {
      return `${slots.default ? slots.default({}) : ``}`;
    }
  })}`;
});
const Dialog_footer = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class"]);
  let { class: className = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  return `<div${spread(
    [
      {
        class: escape_attribute_value(cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className))
      },
      escape_object($$restProps)
    ],
    {}
  )}>${slots.default ? slots.default({}) : ``}</div>`;
});
const Dialog_header = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class"]);
  let { class: className = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  return `<div${spread(
    [
      {
        class: escape_attribute_value(cn("flex flex-col space-y-1.5 text-center sm:text-left", className))
      },
      escape_object($$restProps)
    ],
    {}
  )}>${slots.default ? slots.default({}) : ``}</div>`;
});
const Dialog_overlay = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class", "transition", "transitionConfig"]);
  let { class: className = void 0 } = $$props;
  let { transition = fade } = $$props;
  let { transitionConfig = { duration: 150 } } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.transition === void 0 && $$bindings.transition && transition !== void 0)
    $$bindings.transition(transition);
  if ($$props.transitionConfig === void 0 && $$bindings.transitionConfig && transitionConfig !== void 0)
    $$bindings.transitionConfig(transitionConfig);
  return `${validate_component(Dialog_overlay$1, "DialogPrimitive.Overlay").$$render(
    $$result,
    Object.assign(
      {},
      { transition },
      { transitionConfig },
      {
        class: cn("fixed inset-0 z-50 bg-background/80 backdrop-blur-sm", className)
      },
      $$restProps
    ),
    {},
    {}
  )}`;
});
const Dialog_content = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class", "transition", "transitionConfig"]);
  let { class: className = void 0 } = $$props;
  let { transition = flyAndScale } = $$props;
  let { transitionConfig = { duration: 200 } } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.transition === void 0 && $$bindings.transition && transition !== void 0)
    $$bindings.transition(transition);
  if ($$props.transitionConfig === void 0 && $$bindings.transitionConfig && transitionConfig !== void 0)
    $$bindings.transitionConfig(transitionConfig);
  return `${validate_component(Dialog_portal, "Dialog.Portal").$$render($$result, {}, {}, {
    default: () => {
      return `${validate_component(Dialog_overlay, "Dialog.Overlay").$$render($$result, {}, {}, {})} ${validate_component(Dialog_content$1, "DialogPrimitive.Content").$$render(
        $$result,
        Object.assign(
          {},
          { transition },
          { transitionConfig },
          {
            class: cn("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg md:w-full", className)
          },
          $$restProps
        ),
        {},
        {
          default: () => {
            return `${slots.default ? slots.default({}) : ``} ${validate_component(Dialog_close, "DialogPrimitive.Close").$$render(
              $$result,
              {
                class: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
              },
              {},
              {
                default: () => {
                  return `${validate_component(X, "X").$$render($$result, { class: "h-4 w-4" }, {}, {})} <span class="sr-only" data-svelte-h="svelte-1pewzs3">Close</span>`;
                }
              }
            )}`;
          }
        }
      )}`;
    }
  })}`;
});
const Dialog_description = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class"]);
  let { class: className = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  return `${validate_component(Dialog_description$1, "DialogPrimitive.Description").$$render(
    $$result,
    Object.assign(
      {},
      {
        class: cn("text-sm text-muted-foreground", className)
      },
      $$restProps
    ),
    {},
    {
      default: () => {
        return `${slots.default ? slots.default({}) : ``}`;
      }
    }
  )}`;
});
const Root = Dialog;
const AlertDialog = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { open = false } = $$props;
  let { error = "" } = $$props;
  if ($$props.open === void 0 && $$bindings.open && open !== void 0)
    $$bindings.open(open);
  if ($$props.error === void 0 && $$bindings.error && error !== void 0)
    $$bindings.error(error);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    $$rendered = `${validate_component(Root, "Dialog").$$render(
      $$result,
      { open },
      {
        open: ($$value) => {
          open = $$value;
          $$settled = false;
        }
      },
      {
        default: () => {
          return `${validate_component(Dialog_content, "DialogContent").$$render(
            $$result,
            {
              class: "text-left bg-background text-foreground"
            },
            {},
            {
              default: () => {
                return `${validate_component(Dialog_header, "DialogHeader").$$render($$result, { class: "text-left" }, {}, {
                  default: () => {
                    return `${validate_component(Dialog_title, "DialogTitle").$$render(
                      $$result,
                      {
                        class: "font-display text-2xl select-none"
                      },
                      {},
                      {
                        default: () => {
                          return `Oops! Something broke...`;
                        }
                      }
                    )} ${validate_component(Dialog_description, "DialogDescription").$$render($$result, {}, {}, {
                      default: () => {
                        return `<p class="text-secondary-foreground mt-4 mb-4">Launcher caught an error: <b class="font-bold capitalize">${escape(error)}</b></p>`;
                      }
                    })}`;
                  }
                })} ${validate_component(Dialog_footer, "DialogFooter").$$render($$result, {}, {}, {
                  default: () => {
                    return `<div class="flex justify-end gap-2">${validate_component(Button, "Button").$$render(
                      $$result,
                      {
                        class: "p-4 rounded",
                        variant: "default",
                        type: "button"
                      },
                      {},
                      {
                        default: () => {
                          return `Continue`;
                        }
                      }
                    )}  ${validate_component(Button, "Button").$$render($$result, { class: "p-4 rounded", type: "button" }, {}, {
                      default: () => {
                        return `Quit`;
                      }
                    })}</div>`;
                  }
                })}`;
              }
            }
          )}`;
        }
      }
    )}`;
  } while (!$$settled);
  return $$rendered;
});
const Discord = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<svg class="w-8 h-8" viewBox="0 0 192 192" xmlns="http://www.w3.org/2000/svg" fill="none"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path stroke="#00CDB8" stroke-linecap="round" stroke-linejoin="round" stroke-width="12" d="m68 138-8 16c-10.19-4.246-20.742-8.492-31.96-15.8-3.912-2.549-6.284-6.88-6.378-11.548-.488-23.964 5.134-48.056 19.369-73.528 1.863-3.334 4.967-5.778 8.567-7.056C58.186 43.02 64.016 40.664 74 39l6 11s6-2 16-2 16 2 16 2l6-11c9.984 1.664 15.814 4.02 24.402 7.068 3.6 1.278 6.704 3.722 8.567 7.056 14.235 25.472 19.857 49.564 19.37 73.528-.095 4.668-2.467 8.999-6.379 11.548-11.218 7.308-21.769 11.554-31.96 15.8l-8-16m-68-8s20 10 40 10 40-10 40-10"></path><ellipse cx="71" cy="101" fill="#17A8B3" rx="13" ry="15"></ellipse><ellipse cx="121" cy="101" fill="#00CDB8" rx="13" ry="15"></ellipse></g></svg>`;
});
const Github = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<svg class="w-7 h-7" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#17A8B3"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><title>github [#17A8B3]</title><desc>Created with Sketch.</desc><defs></defs><g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g id="Dribbble-Light-Preview" transform="translate(-140.000000, -7559.000000)" fill="#00CDB8"><g id="icons" transform="translate(56.000000, 160.000000)"><path d="M94,7399 C99.523,7399 104,7403.59 104,7409.253 C104,7413.782 101.138,7417.624 97.167,7418.981 C96.66,7419.082 96.48,7418.762 96.48,7418.489 C96.48,7418.151 96.492,7417.047 96.492,7415.675 C96.492,7414.719 96.172,7414.095 95.813,7413.777 C98.04,7413.523 100.38,7412.656 100.38,7408.718 C100.38,7407.598 99.992,7406.684 99.35,7405.966 C99.454,7405.707 99.797,7404.664 99.252,7403.252 C99.252,7403.252 98.414,7402.977 96.505,7404.303 C95.706,7404.076 94.85,7403.962 94,7403.958 C93.15,7403.962 92.295,7404.076 91.497,7404.303 C89.586,7402.977 88.746,7403.252 88.746,7403.252 C88.203,7404.664 88.546,7405.707 88.649,7405.966 C88.01,7406.684 87.619,7407.598 87.619,7408.718 C87.619,7412.646 89.954,7413.526 92.175,7413.785 C91.889,7414.041 91.63,7414.493 91.54,7415.156 C90.97,7415.418 89.522,7415.871 88.63,7414.304 C88.63,7414.304 88.101,7413.319 87.097,7413.247 C87.097,7413.247 86.122,7413.234 87.029,7413.87 C87.029,7413.87 87.684,7414.185 88.139,7415.37 C88.139,7415.37 88.726,7417.2 91.508,7416.58 C91.513,7417.437 91.522,7418.245 91.522,7418.489 C91.522,7418.76 91.338,7419.077 90.839,7418.982 C86.865,7417.627 84,7413.783 84,7409.253 C84,7403.59 88.478,7399 94,7399" id="github-[#17A8B3]"></path></g></g></g></g></svg>`;
});
const Navbar = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<div class="flex justify-between items-center my-2"><h1 class="text-foreground font-bold font-title text-3xl" data-svelte-h="svelte-tu3l2a">Backyard Monsters <span class="text-header">Refitted</span></h1> <div class="flex items-center space-x-4"><a href="https://discord.gg/ajZAccxNMA" target="_blank" rel="noopener noreferrer" class="text-accent hover:underline mt-1">${validate_component(Discord, "Discord").$$render($$result, {}, {}, {})}</a> <a href="https://github.com/bym-refitted" target="_blank" rel="noopener noreferrer" class="text-accent hover:underline">${validate_component(Github, "Github").$$render($$result, {}, {}, {})}</a></div></div>`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let builds = [];
  let build;
  let runtime;
  let runtimes = [];
  let current_game_version = "";
  let disabled = true;
  let showError = false;
  let errorCode = "";
  let debugLogs = [];
  listen("infoLog", (event) => {
    debugLogs = [...debugLogs, event.payload.message];
  });
  listen("initialLoad", (event) => {
    const manifest = event.payload.manifest;
    const platform = event.payload.platform;
    builds = Object.keys(manifest.builds).map((buildName) => ({
      value: buildName,
      label: buildName.charAt(0).toUpperCase() + buildName.slice(1)
    }));
    build = builds[0];
    runtimes = [
      {
        value: manifest.flashRuntimes[platform],
        label: `Flash Player (${platform.charAt(0).toUpperCase() + platform.slice(1)})`
      }
    ];
    runtime = runtimes[0];
    current_game_version = manifest.currentGameVersion;
    debugLogs = [
      ...debugLogs,
      `Latest SWF version: ${current_game_version}`,
      `Latest Launcher version: ${manifest.currentLauncherVersion}`
    ];
  });
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    $$rendered = `<main class="h-screen bg-background text-foreground flex flex-col gap-4 p-4 antialiased select-none font-sans">${validate_component(Navbar, "Navbar").$$render($$result, {}, {}, {})} <div class="grow rounded bg-secondary font-mono p-3">${each(debugLogs, (log) => {
      return `<p><small>${escape(log)}</small></p>`;
    })}</div>  <div class="mt-auto w-full flex justify-between"><label class="font-display" data-svelte-h="svelte-1liwykz">SWF Build</label> ${validate_component(Root$1, "Select.Root").$$render(
      $$result,
      { portal: null, selected: build },
      {
        selected: ($$value) => {
          build = $$value;
          $$settled = false;
        }
      },
      {
        default: () => {
          return `${validate_component(Select_trigger, "Select.Trigger").$$render($$result, { class: "w-[180px] rounded" }, {}, {
            default: () => {
              return `${validate_component(Value, "Select.Value").$$render($$result, { class: "text-left" }, {}, {})}`;
            }
          })} ${validate_component(Select_content, "Select.Content").$$render($$result, {}, {}, {
            default: () => {
              return `${validate_component(Group, "Select.Group").$$render($$result, {}, {}, {
                default: () => {
                  return `${each(builds, (build2) => {
                    return `${validate_component(Select_item, "Select.Item").$$render($$result, { value: build2.value, label: build2.label }, {}, {
                      default: () => {
                        return `${escape(build2.label)}`;
                      }
                    })}`;
                  })}`;
                }
              })}`;
            }
          })} ${validate_component(Input, "Select.Input").$$render($$result, { name: "build" }, {}, {})}`;
        }
      }
    )}</div> <div class="mt-auto w-full flex justify-between"><label class="font-display" data-svelte-h="svelte-v3lqu5">Flash Runtime</label> ${validate_component(Root$1, "Select.Root").$$render(
      $$result,
      { portal: null, selected: runtime },
      {
        selected: ($$value) => {
          runtime = $$value;
          $$settled = false;
        }
      },
      {
        default: () => {
          return `${validate_component(Select_trigger, "Select.Trigger").$$render($$result, { class: "w-[180px] rounded" }, {}, {
            default: () => {
              return `${validate_component(Value, "Select.Value").$$render($$result, { class: "text-left" }, {}, {})}`;
            }
          })} ${validate_component(Select_content, "Select.Content").$$render($$result, {}, {}, {
            default: () => {
              return `${validate_component(Group, "Select.Group").$$render($$result, {}, {}, {
                default: () => {
                  return `${each(runtimes, (runtime2) => {
                    return `${validate_component(Select_item, "Select.Item").$$render(
                      $$result,
                      {
                        value: runtime2.value,
                        label: runtime2.label
                      },
                      {},
                      {
                        default: () => {
                          return `${escape(runtime2.label)}`;
                        }
                      }
                    )}`;
                  })}`;
                }
              })}`;
            }
          })} ${validate_component(Input, "Select.Input").$$render($$result, { name: "runtime" }, {}, {})}`;
        }
      }
    )}</div> <div class="mt-auto w-full flex justify-between">${validate_component(Button, "Button").$$render(
      $$result,
      {
        variant: "default",
        class: "p-4 rounded w-32",
        disabled
      },
      {},
      {
        default: () => {
          return `${`${validate_component(Loader_2, "Loader2").$$render($$result, {}, {}, {})}`}`;
        }
      }
    )}</div>  ${validate_component(AlertDialog, "AlertDialog").$$render(
      $$result,
      { error: errorCode, open: showError },
      {
        open: ($$value) => {
          showError = $$value;
          $$settled = false;
        }
      },
      {}
    )}</main>`;
  } while (!$$settled);
  return $$rendered;
});
export {
  Page as default
};
