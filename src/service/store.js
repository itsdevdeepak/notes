import Service from './base/service.js';

/** @typedef {string | number | object | (string | number | object)[]} StoreData */
/** @typedef {{ [key: string]: StoreData} } State */
/** @typedef {(function(State): void)} SubscriberCallback */

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
   * @return {StoreData | null} - State data
   */
  getState(prop) {
    return this._state[prop] || null;
  }

  /**
   * Update / Adds new data to state
   * @param {string} prop - property name that that you want to change
   * @param {StoreData} data
   * @return {boolean} - success status
   */
  setState(prop, data) {
    if (!prop || typeof prop !== 'string') {
      console.error('Property name must be a non-empty string');
      return false;
    }

    if (
      data === undefined ||
      data === null ||
      (typeof data === 'number' && isNaN(data))
    ) {
      console.error('Data cannot be null, undefined or NaN');
      return false;
    }

    this._state[prop] = data;
    const isSaved = this._saveData(this._storageKey, this._state);

    if (isSaved) {
      this._notify();
      return true;
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
   * @returns {{data: StoreData | null}} The parsed data or null if not found/invalid
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
   * @param {StoreData} data
   * @returns {boolean} success status
   * @private
   */
  _saveData(key, data) {
    try {
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
}

export default new Store();
