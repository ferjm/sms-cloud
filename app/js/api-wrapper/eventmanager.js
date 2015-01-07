(function EventManager(exports) {

  var EventManager = {};
  var _listeners = {};

  EventManager.addEventListener = function(eventName, callback) {
    var eventListeners = _listeners[eventName] || [];
    eventListeners.push(callback);
  };

  EventManager.handleEvent = function(evt) {

  };

  EventManager.trigger = function(name, value) {
    var handlers = _listeners[name] || [];

    handlers.forEach(function(handler) {
      handler.call(null, value);
    });
  };

  EventManager.reset = function() {
    _listeners = {};
  };

  exports.EventManager = EventManager;
})(window);
