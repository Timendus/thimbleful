/**
 * This module installs singular event handlers on the document, and evaluates
 * which callback to call when the event fires, based on the element the event
 * originates from. This allows us to swap out and rerender whole sections of
 * the DOM without having to reinstall a bunch of event handlers each time. This
 * nicely decouples the render logic from the event management logic.
 *
 * @example
 * import ge from "./global-events.js";
 *
 * ge.addEventListener("button#click-me", "click", (event, element) => {
 *   console.log(event);   // Will give back the click event object
 *   console.log(element); // Will give back the button#click-me element that was clicked
 * });
 *
 * @module
 */

const VALID_EVENTS = ["click", "change", "keyup"];

/**
 * Handle a global event
 * @callback eventListener
 * @param {Event} event - The event that triggered the eventListener
 * @param {HTMLElement} element - The element that matched the selector
 */

if (!window.eventHandlers) {
  for (const eventType of VALID_EVENTS)
    document.addEventListener(eventType, (e) => eventHandler(eventType, e));
  window.eventHandlers = {};
}

function eventHandler(eventType, event) {
  for (const selector in window.eventHandlers) {
    const element = event.target.closest(selector);
    if (element) {
      const handlers = window.eventHandlers[selector].map((h) => h[eventType]);
      for (const handler of handlers) {
        if (typeof handler == "function" && !event.defaultPrevented)
          handler(event, element);
      }
    }
  }
}

/**
 * Add a global event listener
 * @param {string} selector - CSS selector of the element(s) to trigger on
 * @param {string} event - What event to trigger on
 * @param {eventListener} handler - The function to call when `event` is triggered on `selector`
 */
export function addEventListener(selector, event, handler) {
  if (!VALID_EVENTS.includes(event))
    throw new Error(`Invalid event name: ${event}`);
  window.eventHandlers[selector] = window.eventHandlers[selector] || [];
  window.eventHandlers[selector].push({ [event]: handler });
}
