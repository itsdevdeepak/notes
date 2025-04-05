import Service from './base/service.js';
import Store from './store.js';

/** @typedef {'dark' | 'light' | 'system'} Theme */
/** @typedef {'sans' | 'serif' | 'monospace'} Font */
/** @typedef {{theme: Theme, font: Font}} AppPreference */

/**
 * Handles Application Theme and fonts
 * @extends Service
 */
class Setting extends Service {
  /**@type {Theme[]} */
  _validTheme = ['dark', 'light', 'system'];

  /**@type {Font[]} */
  _validFont = ['sans', 'serif', 'monospace'];

  /** @type {AppPreference} */
  _state = {
    theme: 'dark',
    font: 'sans'
  };

  /** @type {Exclude<Theme, 'system'>} */
  _systemPreferTheme = 'dark';

  constructor() {
    super();
  }

  init() {
    try {
      if (this._initialized) {
        throw new Error('Theme Service is already Initialized');
      }

      if (!Store.isInitialized) {
        throw new Error(
          'Store service Must be initialized to use Theme service'
        );
      }

      /** @type {HTMLElement|null} */
      const appContainer = document.querySelector('body');

      if (!appContainer) {
        throw new Error('Application mount point not found.');
      }

      this._appContainer = appContainer;

      this._preferDarkSchemeMQ = window.matchMedia(
        '(prefers-color-scheme: dark)'
      );

      if (this._preferDarkSchemeMQ) {
        this._systemPreferTheme = this._preferDarkSchemeMQ.matches
          ? 'dark'
          : 'light';

        // Listen for system color scheme preference changes
        this._preferDarkSchemeMQ.addEventListener(
          'change',
          this._handlePreferSchemeChange.bind(this)
        );
      }

      const appPreferences = this._fetchPreferences();

      if (!appPreferences) {
        this._savePreference(this._state);
      } else {
        this._state = appPreferences;
      }

      this._applyFont(this._state.font);

      const colorScheme =
        this._state.theme === 'system'
          ? this._systemPreferTheme
          : this._state.theme;

      this._applyTheme(colorScheme);

      this._initialized = true;
    } catch (error) {
      console.error('Error while initializing Theme service', error);
    }
  }

  getCurrentTheme() {
    return this._state.theme;
  }

  getCurrentFont() {
    return this._state.font;
  }

  /**
   * Sets the application theme
   * @param {Theme} theme - The theme to set (light, dark, or system)
   * @returns {boolean} True if theme was set successfully, false otherwise
   */
  setTheme(theme) {
    try {
      if (!this._isValidTheme(theme)) {
        throw new Error(`Invalid theme: ${theme}`);
      }

      this._state.theme = theme;

      const colorScheme = theme === 'system' ? this._systemPreferTheme : theme;

      this._applyTheme(colorScheme);
      this._savePreference(this._state);

      return true;
    } catch (error) {
      console.error('Error while setting theme:', error);
      return false;
    }
  }

  /**
   *
   * @param {Font} font
   * @returns {boolean}
   */
  setFont(font) {
    try {
      if (!this._isValidFont(font)) {
        throw new Error(`Invalid Font: ${font}`);
      }

      this._state.font = font;
      this._applyFont(font);
      this._savePreference(this._state);

      return true;
    } catch (error) {
      console.error('Error while setting font:', error);
      return false;
    }
  }

  /**
   * @param {Exclude<Theme, "system">} theme
   */
  _applyTheme(theme) {
    if (!this._appContainer) return;

    this._appContainer.dataset.theme = theme;
  }

  /**
   * @param {Font} font
   */
  _applyFont(font) {
    if (!this._appContainer) return;
    this._appContainer.dataset.font = font;
  }

  /**
   * Fetches application preferences from the store
   * @returns {AppPreference | null} The preferences or null if invalid
   * @private
   */
  _fetchPreferences() {
    const data = Store.getState('setting');
    if (this._isValidPreference(data)) {
      return data;
    }

    return null;
  }

  /**
   * Saves application preferences to the store
   * @param {AppPreference} appPref - The preferences to save
   * @returns {boolean} True if saved successfully, false otherwise
   * @private
   */
  _savePreference(appPref) {
    try {
      if (!this._isValidPreference(appPref)) {
        throw new Error(
          `Invalid preference object: ${JSON.stringify(appPref)}`
        );
      }

      this._state = { theme: appPref.theme, font: appPref.font };
      return Store.setState('setting', appPref);
    } catch (error) {
      console.error('Error while saving preferences:', error);
      return false;
    }
  }

  /**
   * Validates if the provided parameter is a valid preference object
   * @param {any} param - The parameter to validate
   * @returns {param is AppPreference} True if valid preference object, false otherwise
   * @private
   */
  _isValidPreference(param) {
    if (!param || typeof param !== 'object' || Array.isArray(param)) {
      return false;
    }

    if (!('theme' in param && 'font' in param)) {
      return false;
    }

    const { theme, font } = param;
    return this._isValidTheme(theme) && this._isValidFont(font);
  }

  /**
   *
   * @param {any} theme
   * @returns {theme is Theme}
   * @private
   */
  _isValidTheme(theme) {
    if (!theme || typeof theme !== 'string') return false;
    if (!this._validTheme.includes(/** @type {Theme} */ (theme))) return false;

    return true;
  }

  /**
   *
   * @param {any} font
   * @returns {font is Font}
   * @private
   */
  _isValidFont(font) {
    if (!font || typeof font !== 'string') return false;
    if (!this._validFont.includes(/** @type {Font} */ (font))) return false;

    return true;
  }

  /**
   * Handles system color scheme preference changes
   * Updates the application theme when system preferences change
   * @private
   */
  _handlePreferSchemeChange() {
    if (!this._preferDarkSchemeMQ) return;

    const newColorScheme = this._preferDarkSchemeMQ.matches ? 'dark' : 'light';

    if (
      this._state.theme === 'system' &&
      this._systemPreferTheme !== newColorScheme
    ) {
      this._applyTheme(newColorScheme);
    }

    this._systemPreferTheme = newColorScheme;
  }
}

export default new Setting();
