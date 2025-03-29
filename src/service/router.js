import Service from './base/service.js';
import NotFound from '../components/404.js';

// Types
/**
 * @typedef {Object} Route
 * @property {string} path - The URL path for the route
 * @property {Object} component - The component object with a mount method
 */

/**
 * Router service for handling client-side navigation.
 * @class Router
 * @extends Service
 */
class Router extends Service {
  constructor() {
    super();
    const container = document.querySelector('.app');

    if (!container) throw new Error('Application mount point not found.');

    this._notFound = new NotFound(container);
  }

  /**
   * Initializes the Router with the specified routes
   * @param {Route[]} routes - Array of route objects
   */
  init(routes = []) {
    if (this._initialized) {
      return;
    }

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
    if (addToHistory) history.pushState({ path }, null, path);

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
   * @returns {Object} return matching route and params
   * @returns {Object|null} returns.route - matched route
   * @returns {Object} returns.params - parameters extracted from path
   * @private
   */
  _findMatchingRoute(path) {
    const exactMatch = this._routes.find(route => route.path === path);
    if (exactMatch) return { route: exactMatch, params: {} };

    for (const route of this._routes) {
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
    document
      .querySelector('.app')
      .addEventListener('click', this._handleNavClick.bind(this));

    window.addEventListener('popstate', event => {
      const path = event.state?.path || this.currentPath();
      this.navigate(path, false);
    });
  }

  /**
   * Handles application link clicks
   * @param {MouseEvent} event - The click event object
   * @private
   */
  _handleNavClick(event) {
    const navElement = event.target.closest('.app-nav');
    if (!navElement) return;

    event.preventDefault();
    const path = navElement.getAttribute('href');

    if (path && path !== location.pathname) {
      this.navigate(path);
    }
  }
}

export default new Router();
