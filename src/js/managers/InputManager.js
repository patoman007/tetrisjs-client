const KEY_EVENTS = [
  'keydown',
  'keyup'
];

export default class InputManager {

  constructor(element) {
    this.handlers = {
      keyup: new Map(),
      keydown: new Map()
    };

    if (element != null) {
      this.listenTo(element);
    }
  }

  _handleEvent(event) {
    const handler = this.handlers[event.type].get(event.code);
    if (handler == null) { return; }

    handler.call();
  }

  defineHandler(code, handler, type = 'keydown') {
    this.handlers[type].set(code, handler);
  }

  listenTo(element) {
    if (element.addEventListener == null) {
      console.warn(`Cannot attach a listener to ${element}`);
      return;
    }

    KEY_EVENTS.forEach((eventName) => {
      element.addEventListener(eventName, (event) => this._handleEvent(event));
    });
  }

}
