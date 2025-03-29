/**
 * Base Class for all services.
 * @abstract
 * @class Service
 */
export default class Service {
  _initialized = false;

  constructor() {
    if (this.constructor === Service) {
      throw new Error(
        'Service is an abstract class and cannot be instantiated directly.'
      );
    }
  }

  /**
   * Initializes the service.
   */
  init() {
    throw new Error(
      "Method 'init()' must be implemented in the derived class."
    );
  }
}
