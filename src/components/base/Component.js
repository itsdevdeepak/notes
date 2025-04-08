/** @typedef {{[key: string]: any}} State  */

/**
 * Base class for all UI components.
 * @abstract
 */
export default class Component {
  /** @type {State} */
  _state = {};

  /** @type {Array<{element: HTMLElement, type: string, handler: EventListener}>} */
  _eventListeners = [];

  /**
   * @param {Element} container - The DOM element where this component will be mounted
   */
  constructor(container) {
    if (this.constructor === Component) {
      throw new Error(
        'Component is an abstract class and cannot be instantiated directly.'
      );
    }

    if (!container) {
      throw new Error('Container element is required.');
    }

    if (!(container instanceof HTMLElement)) {
      throw new Error('Container must be a valid HTML element.');
    }

    this.container = container;
  }

  /**
   * Mounts the component to the specified container.
   * @param {object} params - Parameters for the components
   */
  mount(params = {}) {
    try {
      if (this._beforeMount) this._beforeMount();

      this._state = params;
      this.container.innerHTML = this._render();

      if (this._afterMount) this._afterMount();
    } catch (error) {
      this._handleError(
        error,
        `Error during mounting ${this.constructor.name} component`
      );
    }
  }

  /**
   * Unmounts the components form currant container.
   */
  unmount() {
    try {
      if (this._beforeUnmount) this._beforeUnmount();
      this._removeAllEventListeners();

      this.container.innerHTML = '';

      if (this._afterUnmount) this._afterUnmount();
    } catch (error) {
      this._handleError(
        error,
        `Error during unmounting ${this.constructor.name} component`
      );
    }
  }

  /**
   * Renders the component's HTML elements.
   * @returns {string} HTML markup string to be rendered in the container.
   * @protected
   * @abstract
   */
  _render() {
    throw new Error("Method '_render()' must be implemented.");
  }

  /**
   * Registers an event listener on an element.
   * @param {HTMLElement} element - Target DOM element
   * @param {string} type - Event type (e.g., 'click', 'input')
   * @param {EventListener} handler - Event callback function
   * @param {AddEventListenerOptions|boolean} [options] - Event listener options
   * @protected
   */
  _registerEventListener(element, type, handler, options) {
    if (!(element instanceof HTMLElement)) {
      throw new Error('Event target must be a valid HTML element');
    }

    if (typeof handler !== 'function') {
      throw new Error('Event handler must be a function');
    }

    element.addEventListener(type, handler, options);
    this._eventListeners.push({ element, type, handler });
  }

  /**
   * Removes a given event listener from registered listeners.
   * @param {HTMLElement} element - Target DOM element
   * @param {string} type - Event type to remove
   * @param {EventListener} handler - Event callback to remove
   * @returns {boolean} - True if removal was successful, false otherwise
   * @private
   */
  _removeEventListener(element, type, handler) {
    if (!element || !type || !handler) return false;

    element.removeEventListener(type, handler);

    const totalListeners = this._eventListeners.length;

    this._eventListeners = this._eventListeners.filter(
      listener =>
        listener.element !== element ||
        listener.type !== type ||
        listener.handler !== handler
    );

    return totalListeners - this._eventListeners.length === 1;
  }

  /**
   * Removes all event listeners registered by this component.
   * @private
   */
  _removeAllEventListeners() {
    this._eventListeners.forEach(({ element, type, handler }) => {
      element.removeEventListener(type, handler);
    });
    this._eventListeners = [];
  }

  /**
   * Runs before element renders on page.
   * @protected
   * @abstract
   */
  _beforeMount() {}

  /**
   * Runs after element is rendered on page, use it for adding event handlers.
   * @protected
   * @abstract
   */
  _afterMount() {}

  /**
   * Runs before element is detached.
   * @protected
   * @abstract
   */
  _beforeUnmount() {}

  /**
   * Runs after element is detached.
   * @protected
   * @abstract
   */
  _afterUnmount() {}

  /**
   * Handles component Error.
   * @param {Error | unknown} error - The error that occurred
   * @param {string} msg - Error message that you want to log
   * @protected
   */
  _handleError(error, msg) {
    console.error(msg, error);
    this.container.innerHTML = `
      <div class="error-component">
        <p>An unexpected error occurs.</p>
      </div>
    `;
  }
}
