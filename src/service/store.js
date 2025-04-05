import Service from './base/service.js';

/** @typedef {number | string | object | Array<any>} StateValue */
/** @typedef {{[key: string]: StateValue | undefined}} State  */
/** @typedef {function(State): void} SubscriberCallback */

class Store extends Service {
  /** @type {State}} */
  _state = {};
  _storageKey = 'store';

  /** @type {SubscriberCallback[]} */
  _subscribers = [];

  constructor() {
    super();
  }

  /**
   * Initializes the store service.
   * @param {Object} [initialState] - The initial state for the store.
   * @param {string} [storageKey] - The key used to store/retrieve data from storage.
   * @returns {void}
   */
  init(initialState = {}, storageKey = 'store') {
    if (this._initialized) {
      return;
    }

    this._storageKey = storageKey;
    this._initialized = true;

    const { data: storedData } = this._fetchData(this._storageKey);

    this._state =
      storedData && typeof storedData === 'object'
        ? { ...storedData }
        : { ...initialState };

    window.addEventListener('storage', this._handleStoreChange.bind(this));
  }

  /**
   *  Gets data from state
   * @param {string} prop - State property name that you want to get
   * @return {StateValue | null} - State data
   */
  getState(prop) {
    try {
      const data = this._state[prop];
      if (typeof data === 'undefined') {
        throw new Error(`Requested data for: ${prop} does not exist`);
      }

      return data;
    } catch (error) {
      console.error('Invalid request', error);
      return null;
    }
  }

  /**
   * Update / Adds new data to state
   * @param {string} prop - property name that that you want to change
   * @param {StateValue} data
   * @return {boolean} - success status
   */
  setState(prop, data) {
    try {
      if (!prop || typeof prop !== 'string') {
        throw new Error('Property name must be a non-empty string');
      }

      if (!this._isValidData(data)) {
        throw new Error(`data ${data} is not valid value for state.`);
      }

      this._state[prop] = data;
      const isSaved = this._saveData(this._storageKey, this._state);

      if (isSaved) {
        this._notify();
        return true;
      }
    } catch (error) {
      console.error(`Failed to set { ${prop}: ${data} } on State`, error);
      return false;
    }

    return false;
  }

  /**
   * Subscribes a callback function to state changes
   * @param {SubscriberCallback} callback - The callback function to be called with the current state
   */
  subscribe(callback) {
    if (!callback || typeof callback !== 'function') {
      throw new Error('Subscriber callback must be a function');
    }

    this._subscribers.push(callback);

    // returns unsubscribe method
    return () => {
      this._subscribers = this._subscribers.filter(cb => cb !== callback);
    };
  }

  isInitialized() {
    return this._initialized;
  }

  /**
   * notify all subscribers of state change
   * @private
   */
  _notify() {
    this._subscribers.forEach(callback => {
      try {
        callback(this._state);
      } catch (error) {
        console.error('Error in subscriber callback', error);
      }
    });
  }

  /**
   * Retrieves data from localStorage by key
   * @param {string} key - The key to fetch data from localStorage
   * @returns {{data: StateValue | null}} The parsed data or null if not found/invalid
   * @private
   */
  _fetchData(key) {
    try {
      const store = localStorage.getItem(key);

      return {
        data: store ? JSON.parse(store) : null
      };
    } catch (error) {
      console.error('Failed to load state from localStorage', error);
      return { data: null };
    }
  }

  /** Saves data to localStorage
   * @param {string} key
   * @param {StateValue} data
   * @returns {boolean} success status
   * @private
   */
  _saveData(key, data) {
    try {
      if (!this._isValidData(data)) {
        throw new Error(`Type ${data} is not a valid type`);
      }

      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Failed to save state to localStorage', error);
      return false;
    }
  }

  /**
   * Handles storage events when localStorage is modified
   * @param {StorageEvent} event - storage event
   * @private
   */
  _handleStoreChange(event) {
    if (event.key === this._storageKey) {
      try {
        const newState = event.newValue ? JSON.parse(event.newValue) : {};
        this._state = { ...newState };
        this._notify();
      } catch (error) {
        console.error('Error processing storage change', error);
      }
    }
  }

  /**
   * @template T
   * @param {T} data
   * @returns {data is Exclude<T, null | undefined>}
   * @private
   */
  _isValidData(data) {
    return (
      data !== undefined &&
      data !== null &&
      !(typeof data === 'number' && isNaN(data))
    );
  }
}

export default new Store();
