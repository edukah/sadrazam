class Event {
  static add (element, eventName, handler) {
    if (element.attachEvent) element.attachEvent(eventName, handler);
    else element.addEventListener(eventName, handler);
  }

  static remove (element, eventName, handler) {
    if (element.detachEvent) element.detachEvent(eventName, handler);
    else element.removeEventListener(eventName, handler);
  }

  static getTarget (event) {
    event = event || globalThis.event;
    
    return event.target || event.srcElement;
  }

  static supported (element, eventName) {
    eventName = 'on' + eventName;
    let isSupported = (eventName in element);

    if (!isSupported) {
      element.setAttribute(eventName, 'return;');

      isSupported = typeof element[eventName] === 'function';
    }

    return isSupported;
  }
}

export default Event;
