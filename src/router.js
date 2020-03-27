/**
 * This is a very simple routing class that listens to location hash changes and
 * clicks on links to registered routes.
 *
 * You have to explicitly define the routes that you wish to use, so we don't
 * clash (too much) with deep-linking to named anchors on your page. And also
 * because it enables you to handle different routes with different functions.
 */

import Click from './click';

export default class Router {

  constructor(routes = false, handler = null) {
    this._routes = [];
    if (routes) this.addRoutes(routes, handler);
  }

  install() {
    Click.instance().register('a[href]',  (e) => this._handleClick(e));
    window.addEventListener('hashchange', (e) => this._handleNavigationEvent(e));
    window.addEventListener('load',       (e) => this._handleNavigationEvent(e));
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
      Object.keys(routes).forEach(route => this.addRoute(route, routes[route]));
    return this;
  }

  route(route, evnt) {
    const match = this._matchingRoute(route);
    if (match && match.router)  return match.router.route(match.subpath, evnt);
    if (match && match.handler) return match.handler(match.route, match.matches, evnt);
  }

  _handleClick(evnt) {
    let link = evnt.target.getAttribute('href');
    if (!link.startsWith('#')) return;       // Only handle hash links
    link = link.substr(1);
    if (!this._matchingRoute(link)) return;  // Only handle registered routes
    window.location.hash = link;
    evnt.preventDefault();                   // Prevent from jumping to anchor
  }

  _handleNavigationEvent(evnt) {
    let hash = window.location.hash
    if (hash.startsWith('#')) hash = hash.substr(1);
    this.route(hash, evnt);
  }

  _matchingRoute(route) {
    return route && ( this._subRouterMatch(route) ||
                      this._stringMatch(route)    ||
                      this._regExpMatch(route)       );
  }

  _subRouterMatch(route) {
    const match = this._routes.filter(r => r[1] instanceof Router)
                              .find(r => route.startsWith(r[0] + '/') || route == r[0]);

    return match && {
      router:  match[1],
      subpath: route.substr(match[0].length + 1)
    };
  }

  _stringMatch(route) {
    const match = this._routes.find(r => route == r[0]);

    return match && {
      route:   match[0],
      handler: match[1]
    };
  }

  _regExpMatch(route) {
    const match = this._routes.filter(r => r[0] instanceof RegExp)
                              .find(r => route.match(r[0]));

    return match && {
      route:   match[0],
      handler: match[1],
      matches: route.match(match[0])
    };
  }

}
