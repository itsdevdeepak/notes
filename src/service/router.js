import Service from './base/service.js';
import NotFound from '../components/404.js';

/**
 * @typedef {Object} Route
 * @property {string} path - The URL path for the route (e.g., '/users/:id')
 * @property {Component} component - The component to render for this route
 */

/**
 * @typedef {Object} Component
 * @property {function(Params): void} mount - Mounts the component with route parameters
 * @property {function(): void} unmount - Unmounts the component and cleans up resources
 */

/**
 * @typedef {Object.<string, string>} Params
 * @description An object mapping parameter names to their values extracted from the URL
 */

/**
 * Router service for handling client-side navigation.
 * @class Router
 * @extends Service
 */
class Router extends Service {
  constructor() {
    super();

    this._appContainer = document.querySelector('.app');
    if (!this._appContainer)
      throw new Error('Application mount point not found.');

    /** @type {Route[]} */
    this._routes = [];
    this._notFound = new NotFound(this._appContainer);
  }

  /**
   * Initializes the Router with the specified routes
   * @param {Route[]} [routes] - Array of route objects
   */
  init(routes = []) {
    if (this._initialized) {
      return;
    }

    /** @type {Route[]} */
    this._routes = routes;
    this._initialized = true;
    this._bindEvents();

    this.navigate(this.currentPath(), false);
  }

  /**
   * Navigates to a specified URL path and updates the application view
   * @param {string} path - The URL path to navigate to
   * @param {boolean} addToHistory - Whether to add this navigation to browser history.
   * When true, it allows browser to navigation back and forward with the route.
   */
  navigate(path, addToHistory = true) {
    if (addToHistory) history.pushState({ path }, '', path);

    if (this._currentComponent) {
      this._currentComponent.unmount();
      this._currentComponent = null;
    }

    const { route, params } = this._findMatchingRoute(path);

    if (!route) {
      this._notFound.mount();
      return;
    }

    route.component.mount(params);
    this._currentComponent = route.component;
  }

  /**
   * Gets the current URL path
   * @returns {string} The current URL path
   */
  currentPath() {
    return location.pathname;
  }

  /**
   * Finds a matching route from the registered routes
   * @param {string} path - The URL path to match against
   * @returns {{route: Route | null, params: Params}} An object containing the matched route and parameters
   * @private
   */
  _findMatchingRoute(path) {
    const exactMatch = this._routes.find(route => route.path === path);
    if (exactMatch) return { route: exactMatch, params: {} };

    for (const route of this._routes) {
      /** @type {Params} */
      const params = {};
      const routeParts = route.path.split('/');
      const pathParts = path.split('/');

      if (routeParts.length !== pathParts.length) continue;

      let isMatch = true;

      for (let i = 0; i < routeParts.length; i++) {
        const routePart = routeParts[i];
        const pathPart = pathParts[i];

        if (routePart.startsWith(':')) {
          const paramName = routePart.slice(1);
          params[paramName] = pathPart;
        } else if (routePart !== pathPart) {
          isMatch = false;
          break;
        }
      }

      if (isMatch) return { route, params };
    }

    return { route: null, params: {} };
  }

  /**
   * Adds event listeners to handle application navigation.
   * @private
   */
  _bindEvents() {
    this._appContainer.addEventListener(
      'click',
      this._handleNavClick.bind(this)
    );

    window.addEventListener('popstate', event => {
      const path = event.state?.path || this.currentPath();
      this.navigate(path, false);
    });
  }

  /**
   * Handles application link clicks
   * @param {Event} event
   * @private
   */
  _handleNavClick(event) {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const navElement = target.closest('.app-nav');
    if (!navElement) return;

    event.preventDefault();
    const path = navElement.getAttribute('href');

    if (path && path !== location.pathname) {
      this.navigate(path);
    }
  }
}

export default new Router();
