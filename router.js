/**
 * This is a very simple routing class that listens to location hash changes and
 * clicks on links to registered routes.
 *
 * You have to explicitly define the routes that you wish to use, so we don't
 * clash (too much) with deep-linking to named anchors on your page. And also
 * because it enables you to handle different routes with different functions.
 *
 * The biggest benefit of using this router is that you can navigate your single
 * page app and still have a proper history. So forward and back buttons work,
 * you can refresh and deep-link to a specific page, those kinds of things.
 *
 * Create and install a router object:
 *
 * ```javascript
 * import Router from './router.js';
 * const router = new Router().install();
 * ```
 *
 * Then, add routes. Either individually, maybe programmatically:
 *
 * ```javascript
 * router.addRoute('welcome', navigationFunc);
 * ```
 *
 * Or multiple routes at once, configuration style:
 *
 * ```javascript
 * router.addRoutes({
 *   router:   navigationFunc,
 *   activate: navigationFunc
 * });
 * ```
 *
 * If, like in these examples, all routes lead to the same function, you can
 * declare them in one go:
 *
 * ```javascript
 * router.addRoutes([ 'click',
 *                    'dragdrop' ], navigationFunc);
 * ```
 *
 * You then have to implement your own navigation or rendering functions. Maybe
 * each page has a different function. In our case, we use this quick and dirty
 * navigation solution: hide the active `.page` and show the one we requested.
 *
 * ```javascript
 * function navigationFunc(route) {
 *   document.querySelector('.page.active').classList.remove('active');
 *   document.getElementById(route).classList.add('active');
 *   window.scrollTo(0,0);
 * };
 * ```
 *
 * If you like, you can pass any parameters that you would use with `addRoutes`
 * to the constructor too:
 *
 * ```javascript
 * new Router(
 *   [
 *     'welcome',
 *     'router',
 *     'energize',
 *     'click',
 *     'dragdrop'
 *   ],
 *   route => {
 *     document.querySelector('.page.active').classList.remove('active');
 *     document.querySelector(`#${route}`).classList.add('active');
 *     window.scrollTo(0,0);
 *   }
 * ).install();
 * ```
 *
 * This is equivalent to:
 *
 * ```javascript
 * new Router()
 *   .install()
 *   .addRoutes(
 *     [
 *       'welcome',
 *       'router',
 *       'energize',
 *       'click',
 *       'dragdrop'
 *     ],
 *     route => {
 *       document.querySelector('.page.active').classList.remove('active');
 *       document.querySelector(`#${route}`).classList.add('active');
 *       window.scrollTo(0,0);
 *     }
 *   );
 * ```
 *
 * Now all that's left to do is add some links with routing-power:
 *
 * ```html
 * <nav>
 *   <ul>
 *     <li><a href="#welcome">Welcome!</a></li>
 *     <li><a href="#router">Router</a></li>
 *     <li><a href="#energize">Energize</a></li>
 *     <li><a href="#click">Click</a></li>
 *     <li><a href="#dragdrop">Drag & Drop</a></li>
 *   </ul>
 * </nav>
 * ```
 *
 * ## Advanced use
 *
 * ### Regular expressions
 *
 * If your routing needs are more complicated than string → function you can use
 * regular expressions instead of strings. The navigation function gets called
 * with three parameters: the matched route (either the string or the regular
 * expression), the regular expression matches if any, and the original event
 * that triggered the call to the navigation function:
 *
 * ```javascript
 * router.addRoute(/admin\/users\/(\d+)/, (route, matches, e) => {
 *   console.log('This function was called because the location hash matched', route);
 *   console.log('We\'re interested in user number', matches[1]);
 *   console.log('This was the original navigation event:', e);
 * });
 * ```
 *
 * ### Nested routers
 *
 * For readability or for nested components, you can nest router instances. This
 * can be done in two ways: either by registering a route that leads to a router
 * instance:
 *
 * ```javascript
 * new Router()
 *   .install()
 *   .addRoutes({
 *     public: new Router({
 *       login:  loginFunc,
 *       logout: logoutFunc
 *     })
 *   });
 * ```
 *
 * ```html
 * <a href="#public/login">Click here to log in</a>
 * ```
 *
 * ...or by calling `route` on the nested router:
 *
 * ```javascript
 * const privateRouter = new Router({
 *   dashboard: dashboardFunc,
 *   users:     usersFunc
 * });
 *
 * new Router()
 *   .install()
 *   .addRoute(/private\/(.*)/, (route, matches, evnt) => {
 *     if (!loggedIn) {
 *       window.location.hash = 'public/login';
 *       return;
 *     }
 *
 *     privateRouter.route(matches[1], evnt);
 *   });
 * ```
 *
 * ```html
 * <a href="#private/dashboard">Go to your dashboard</a>
 * ```
 *
 * Please note that the router that you call the `install` function on is the
 * one that will be the root router. This router binds itself to the right
 * events.
 */

export default class Router {
  constructor(routes = false, handler = null) {
    this._routes = [];
    if (routes) this.addRoutes(routes, handler);
  }

  install() {
    Click.instance().register("a[href]", (e) => this._handleClick(e));
    window.addEventListener("hashchange", (e) =>
      this._handleNavigationEvent(e)
    );
    window.addEventListener("load", (e) => this._handleNavigationEvent(e));
    return this;
  }

  addRoute(route, handler) {
    this._routes.push([route, handler]);
    return this;
  }

  addRoutes(routes, handler = null) {
    if (Array.isArray(routes))
      routes.forEach((route) => this.addRoute(route, handler));
    else
      Object.keys(routes).forEach((route) =>
        this.addRoute(route, routes[route])
      );
    return this;
  }

  route(route, evnt) {
    const match = this._matchingRoute(route);
    if (match && match.router) return match.router.route(match.subpath, evnt);
    if (match && match.handler)
      return match.handler(match.route, match.matches, evnt);
  }

  _handleClick(evnt) {
    let link = evnt.target.getAttribute("href");
    if (!link.startsWith("#")) return; // Only handle hash links
    link = link.substr(1);
    if (!this._matchingRoute(link)) return; // Only handle registered routes
    window.location.hash = link;
    evnt.preventDefault(); // Prevent from jumping to anchor
  }

  _handleNavigationEvent(evnt) {
    let hash = window.location.hash;
    if (hash.startsWith("#")) hash = hash.substr(1);
    this.route(hash, evnt);
  }

  _matchingRoute(route) {
    return (
      route &&
      (this._subRouterMatch(route) ||
        this._stringMatch(route) ||
        this._regExpMatch(route))
    );
  }

  _subRouterMatch(route) {
    const match = this._routes
      .filter((r) => r[1] instanceof Router)
      .find((r) => route.startsWith(r[0] + "/") || route == r[0]);

    return (
      match && {
        router: match[1],
        subpath: route.substr(match[0].length + 1),
      }
    );
  }

  _stringMatch(route) {
    const match = this._routes.find((r) => route == r[0]);

    return (
      match && {
        route: match[0],
        handler: match[1],
      }
    );
  }

  _regExpMatch(route) {
    const match = this._routes
      .filter((r) => r[0] instanceof RegExp)
      .find((r) => route.match(r[0]));

    return (
      match && {
        route: match[0],
        handler: match[1],
        matches: route.match(match[0]),
      }
    );
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
