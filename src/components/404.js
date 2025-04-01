import Component from './base/Component.js';

export default class NotFound extends Component {
  _render() {
    return `
      <section>
        <h1>404: Page Not Found</h1>
      </section>
    `;
  }
}
