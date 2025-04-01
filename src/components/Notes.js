import Component from './base/Component.js';

export default class Notes extends Component {
  /** @param {Element} container - The DOM element where this component will be mounted */
  constructor(container) {
    super(container);
  }

  _afterMount() {
    const greetBtn = document.getElementById('greet');
    if (greetBtn) {
      this._registerEventListener(greetBtn, 'click', () =>
        alert('Greetings my friend')
      );
    }
  }

  _render() {
    return `
      <div class="notes">
        <h2>Notes</h2>
        <a href="/archives" class="app-nav">Archives -></a>
        <a href="/not_register" class="app-nav">Not Register -></a>
        <ul>
          <li><a href="/note/Workout%20Optimization" class="app-nav">Workout Optimization -></a></li>
          <li><a href="/note/Nutrition%20Tracking" class="app-nav">Nutrition Tracking -></a></li>
          <li><a href="/note/Japanese%20Cooking" class="app-nav">Japanese Cooking -></a></li>
        </ul>
        <button id="greet">Greet</button>
      </div>
      `;
  }
}
