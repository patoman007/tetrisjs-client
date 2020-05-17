export default class EventsManager {

  constructor() {
    this.handlers = [];
  }

  subscribe(eventName, eventHandler) {
    const event = { name: eventName, handler: eventHandler };
    this.handlers.push(event);
  }

  emit(eventName, ...args) {
    this.handlers.forEach(({ name, handler }) => {
      if (eventName !== name) { return; }
      handler.call(handler, ...args);
    });
  }

}
