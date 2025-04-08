import Component from './base/Component.js';
import Store from '../service/store.js';

export default class Notes extends Component {
  /** @param {Element} container - The DOM element where this component will be mounted */
  constructor(container) {
    super(container);
    Store.subscribe(state => console.log('state change receive:', state));
  }

  _afterMount() {
    const createBtn = document.getElementById('create-note-button');
    if (createBtn) {
      this._registerEventListener(createBtn, 'click', () =>
        Store.setState('notes', ['New Note', 'Cant be'])
      );
    }
  }

  _render() {
    /** @type {string[]} */
    let notes = [];
    const data = Store.getState('notes');
    if (
      data &&
      Array.isArray(data) &&
      data.every(note => typeof note === 'string')
    ) {
      notes = data;
    }

    return `
      <div class="notes">
        <h2>Notes</h2>
        <a href="/archives" class="app-nav">Archives -></a>
        <a href="/not_register" class="app-nav">Not Register -></a>
        <ul>
          <li><a href="/note/Workout%20Optimization" class="app-nav">Workout Optimization -></a></li>
          <li><a href="/note/Nutrition%20Tracking" class="app-nav">Nutrition Tracking -></a></li>
          <li><a href="/note/Japanese%20Cooking" class="app-nav">Japanese Cooking -></a></li>
          ${notes.map(n => '<li><a href="/note/Japanese%20Cooking" class="app-nav">' + n.trim() + ' -></a></li> ')}
        </ul>
        <button id="create-note-button">Add Notes</button>
      </div>
      `;
  }
}
