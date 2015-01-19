(function SMSProvider(exports) {
  var SMSProvider = {
    mozMobileMessage: navigator.mozMobileMessage,
    requests: []
  };

  SMSProvider.send = function(request, number, text, options) {
    this.requests.push(request);
    var req = this.mozMobileMessage.send(number, text, options);
    req.onsuccess = function(evt) {
      // Update database values with current response
      DBManager.updateMessage(request.localMessage._id,
         evt.target.result).then(function() {
           if (typeof request.onsuccess === 'function') {
             request.onsuccess(evt);
           }
         }
      );
    };

    req.onerror = function(evt) {
      // Update database values with current response
      DBManager.updateMessage(request.localMessage.id,
        evt.target.result).then(function() {
          if (typeof request.onerror === 'function') {
            request.onerror(evt);
          }
        }
      );
    };
  };

  var events = ['received', 'sending', 'sent',
   'failed', 'readsuccess',
   'deliverysuccess', 'deleted'];

  // Listen to all API events and broadcast them to anyone listening to the
  // EventManager
  if (SMSProvider.mozMobileMessage) {
    events.forEach(function(eventName) {
      SMSProvider.mozMobileMessage.addEventListener(eventName, function(evt) {
        EventManager.trigger(eventName, evt);
      });
    });
  }

  exports.SMSProvider = SMSProvider;
})(window);

(function ProviderManager(exports) {
  var ProviderManager = {
    provider: null
  };

  ProviderManager.start = function(name) {
    if (name && exports[name]) {
      this.provider = exports[name];
    } else if (navigator.mozMobileConnections) {
      this.provider = SMSProvider;
    }
  }

  ProviderManager.send = function(request, number, text, options) {
    if (this.provider && this.provider.send) {
      this.provider.send(request, number, text, options);
    }
  }

  exports.ProviderManager = ProviderManager;
})(window);
