import Component from './base/Component.js';

export default class Note extends Component {
  /** @param {Element} container - The DOM element where this component will be mounted */
  constructor(container) {
    super(container);
  }

  _render() {
    const title = this._state.title || 'Unknown';

    return `
        <div class="notes">
          <h2>${title.replace('%20', ' ')} - Note</h2>
        </div>
      `;
  }
}
