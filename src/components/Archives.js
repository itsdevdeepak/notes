import Component from './base/Component.js';

export default class Archives extends Component {
  /** @param {Element} container - The DOM element where this component will be mounted */
  constructor(container) {
    super(container);
  }

  _render() {
    return `
        <div class="archive">
          <h2>Archives</h2>
          <a href="/" class="app-nav">Notes -></a>
          <ul>
            <li>2023</li>
            <li>2022</li>
            <li>2021</li>
            <li>2020</li>
          </ul>
        </div>
      `;
  }
}
