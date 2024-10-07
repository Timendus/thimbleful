/**
 * This breathes life into your DOM and unlocks a set of data attributes to
 * quickly build interfaces. Combined with some smart CSS, you can use these
 * data attributes to create tabs, toggles, popups, caroussels, fancy radio
 * buttons and almost anything you could want. I generally only use this for
 * prototyping things, but you could use it for small projects.
 *
 * # How to use
 *
 * You activate a certain scope in your DOM:
 *
 * ```javascript
 * import Energize from './energize.js';
 * new Energize('#my-app');
 * ```
 *
 * And then you can use data attributes to add and remove a class from different
 * elements in different ways:
 *
 * ```html
 * <section id="example">
 *   <a data-open="#left" class="active">Left</a>
 *   <a data-open="#center">Center</a>
 *   <a data-open="#right">Right</a>
 *
 *   <div class="tab active" id="left" data-group="tabs" data-follower="a[data-open='#left']">
 *     <p>I'm behind the leftmost link!</p>
 *     <a data-close="#left">Close me</a>
 *   </div>
 *
 *   <div class="tab" id="center" data-group="tabs" data-follower="a[data-open='#center']">
 *     <p id="colour">I'm the panel behind the center link</p>
 *     <a data-toggle="#colour">Toggle me!</a>
 *   </div>
 *
 *   <div class="tab" id="right" data-group="tabs" data-follower="a[data-open='#right']" data-timer="2000">
 *     <p>I'm the last panel, behind the rightmost link</p>
 *     <p>I disappear automatically after two seconds</p>
 *   </div>
 * </section>
 * ```
 *
 * The default class that gets put on your elements is `active`, the default data
 * attributes are:
 *
 *  - `data-open` — A selector to put the `active` class on when clicked
 *  - `data-close` — A selector to remove the `active` class from when clicked
 *  - `data-toggle` — A selector to toggle the `active` class on when clicked
 *  - `data-group` — If I get the `active` class, remove it from others in my group
 *  - `data-timer` — If I get the `active` class, remove it again after this many milliseconds
 *  - `data-follower` — A selector for another element that follows my behaviour
 *
 * If you wish, you can override the class name and the names of all the
 * attributes as options to the `Energize` constructor.
 */

export default class Energize {
  constructor(scope, options = {}) {
    this._scope = scope;
    this._options = this._normalizeOptions(options);

    Click.instance().register(
      `${scope} [${this._options.open}], ${scope} [${this._options.close}], ${scope} [${this._options.toggle}]`,
      (e) => this._handleClick(e)
    );
  }

  _normalizeOptions(options) {
    return Object.assign(
      {
        class: "active",
        open: "data-open",
        close: "data-close",
        toggle: "data-toggle",
        group: "data-group",
        timer: "data-timer",
        follower: "data-follower",
      },
      options
    );
  }

  _handleClick(evnt) {
    // Which element did we click?
    const target = evnt.target.closest(
      `[${this._options.open}], [${this._options.close}], [${this._options.toggle}]`
    );

    // What does the clicked element wish to open, close or toggle?
    const closeSelector = target.getAttribute(this._options.close);
    const openSelector = target.getAttribute(this._options.open);
    const toggleSelector = target.getAttribute(this._options.toggle);

    let closeElements = closeSelector
      ? document.querySelectorAll(`${this._scope} ${closeSelector}`)
      : [];
    let openElements = openSelector
      ? document.querySelectorAll(`${this._scope} ${openSelector}`)
      : [];

    // Add elements that need to be toggled
    closeElements = [
      ...closeElements,
      ...(toggleSelector
        ? document.querySelectorAll(
            `${this._scope} ${toggleSelector}.${this._options.class}`
          )
        : []),
    ];
    openElements = [
      ...openElements,
      ...(toggleSelector
        ? document.querySelectorAll(
            `${this._scope} ${toggleSelector}:not(.${this._options.class})`
          )
        : []),
    ];

    this._close(closeElements);
    this._open(openElements);

    // We're done with this event, don't try to evaluate it any further
    evnt.preventDefault();
    evnt.stopPropagation();
  }

  _close(elements) {
    elements.forEach((element) => {
      element.classList.remove(this._options.class);
      this._close(this._followers(element));
    });
  }

  _open(elements) {
    elements.forEach((element) => {
      this._close(this._group(element));
      element.classList.add(this._options.class);
      this._open(this._followers(element));

      // Set self-destruct timer if needed
      const delay = element.getAttribute(this._options.timer);
      if (delay) window.setTimeout(() => this._close([element]), delay);
    });
  }

  _group(element) {
    const group = element.getAttribute(this._options.group);
    if (!group) return [];
    return [
      ...document.querySelectorAll(
        `${this._scope} [${this._options.group}=${group}]`
      ),
    ];
  }

  _followers(element) {
    const selector = element.getAttribute(this._options.follower);
    if (!selector) return [];
    return [...document.querySelectorAll(`${this._scope} ${selector}`)];
  }
}

/*
 * This class installs one single click handler on the whole document, and
 * evaluates which callback to call at click time, based on the element that has
 * been clicked. This allows us to swap out and rerender whole sections of the
 * DOM without having to reinstall a bunch of click handlers each time. This
 * nicely decouples the render logic from the click event management logic.
 *
 * To make sure we really only install a single click handler, you can use the
 * singleton pattern and ask for `Click.instance()` instead of creating a new
 * object.
 */

class Click {
  constructor() {
    this._handlers = {};

    document.addEventListener("click", (e) => this._callHandler("click", e));
    document.addEventListener("mousedown", (e) =>
      this._callHandler("mousedown", e)
    );
    document.addEventListener("mouseup", (e) =>
      this._callHandler("mouseup", e)
    );
  }

  register(
    selector,
    handlers = { click: null, mousedown: null, mouseup: null }
  ) {
    if (typeof handlers == "function") handlers = { click: handlers };
    this._handlers[selector] = this._handlers[selector] || [];
    this._handlers[selector].push(handlers);
  }

  _callHandler(type, e) {
    Object.keys(this._handlers).forEach((selector) => {
      if (e.target.closest(selector) !== null) {
        const handlers = this._handlers[selector].map((h) => h[type]);
        handlers.forEach((handler) => {
          if (typeof handler == "function" && !e.defaultPrevented)
            handler(e, selector);
        });
      }
    });
  }
}

Click.instance = function () {
  if (!!Click._instance) return Click._instance;
  return (Click._instance = new Click());
};
