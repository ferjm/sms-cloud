(function EventManager(exports) {

  var EventManager = {};
  var _listeners = {};

  EventManager.addEventListener = function(eventName, callback) {
    var eventListeners = _listeners[eventName] || [];
    eventListeners.push(callback);
    _listeners[eventName] = eventListeners;
  };

  EventManager.handleEvent = function(evt) {

  };

  function trigger(name, value) {
    var handlers = _listeners[name] || [];

    handlers.forEach(function(handler) {
      handler.call(null, value);
    });
  };

  EventManager.onThreadsSync = function() {
    trigger('threadsSync', {});
  };

  EventManager.onMessagesSync = function() {
    trigger('messagesSync', {});
  };

  EventManager.reset = function() {
    _listeners = {};
  };

  exports.EventManager = EventManager;
})(window);
