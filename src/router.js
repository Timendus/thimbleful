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

  constructor() {
    this._routes = [];

    Click.instance().register('a[href]',  (e) => this._handleClick(e));
    window.addEventListener('hashchange', (e) => this._handleNavigationEvent(e));
    window.addEventListener('load',       (e) => this._handleNavigationEvent(e));
  }

  addRoute(route, handler) {
    this._routes.push([route, handler]);
  }

  addRoutes(routes, handler = null) {
    if (Array.isArray(routes))
      routes.forEach((route) => this.addRoute(route, handler));
    else
      Object.keys(routes).forEach(route => this.addRoute(route, routes[route]));
  }

  _handleClick(evnt) {
    let link = evnt.target.getAttribute('href');
    if (!this._matchingLink(link)) return;
    window.location.hash = link;
    evnt.preventDefault();
  }

  _handleNavigationEvent(evnt) {
    let link = window.location.hash;
    if (!(link = this._matchingLink(link))) return;
    let handler = link.route[1]
    if (handler) handler(link.route[0], link.matches, evnt);
  }

  _matchingLink(hash) {
    if (!hash) return false;
    if (!hash.substr(0,1) == "#") return false;
    for (const route of this._routes) {
      if (route[0] instanceof RegExp) {
        const matches = hash.substr(1).match(route[0]);
        if (matches) return {route, matches};
      } else {
        if (route[0] == hash.substr(1)) return {route, matches: null}
      }
    }
    return false;
  }

}
