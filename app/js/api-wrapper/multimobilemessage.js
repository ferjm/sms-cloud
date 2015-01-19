(function(exports) {

  //var oldMobileMessage = null;
  var syncInterval = null;

  var MultiMobileMessage = {};

  MultiMobileMessage.start = function() {
    if (navigator.mozMobileMessage) {
      this.legacyMobileMessage = navigator.mozMobileMessage;
    } else {
      console.info('MultiMobileMessage :: Operating in device with no SMS');
    }

    ProviderManager.start();
    EventManager.reset();
    EventManager.addEventListener('messagesSync',
     this.performStaleOperations.bind(this));

    navigator.mozMobileMessage = this;
  };

  MultiMobileMessage.stop = function() {
    navigator.mozMobileMessage = this.legacyMobileMessage;
  };

  MultiMobileMessage.addEventListener = function(eventName, callback) {
    EventManager.addEventListener(eventName, callback);
  };

  MultiMobileMessage.send = function(number, text, success, error) {
    // API supports multiple recipients, we dont ;)
    if (Array.isArray(number)) {
      number = number[0];
    }
    var request = {
      error: null
    };
    DBManager.new(number, text).then(function(msg) {
      // Replace api_id for id
      msg.id = msg.api_id;
      var sendInfo = {
        type: 'sent',
        message: msg
      };
      EventManager.trigger('sending', sendInfo);
      // Include the msg information into the request object,
      // will be used to later on update the message with data
      // coming from the real api.
      request.localMessage = msg;
      ProviderManager.send(request, number, text, success, error);
    }, error);
    return [request];
  };

  MultiMobileMessage.getThreads = function() {
    var request = {
      error: null
    };

    DBManager.getAllThreads().then(function(threads) {
      var len = threads.length;
      var idx = 0;

      var returnThread = function() {
        request.result = threads[idx];
        if (request.result) {
          request.result.id = request.result.api_id;
        }
        idx += 1;
        request.continue = continueCursor;
        if (typeof request.onsuccess === 'function') {
          request.onsuccess.call(request);
        }
      };
      continueCursor = function() {
        setTimeout(returnThread, 0);
      };

      continueCursor();
    });

    return request;
  };

  MultiMobileMessage.getMessage = function(id) {

  };

  MultiMobileMessage.getMessages = function(filter, reverse) {
    var request = {
      error: null
    };

    DBManager.getAllMessages().then(function(messages) {
      if (!reverse) {
        messages.sort(function(a, b) {
          return b.timestamp - a.timestamp;
        });
      } else {
        messages.sort(function(a, b) {
          return a.timestamp - b.timestamp;
        });
      }

      var len = messages.length;
      var idx = 0;

      var returnMessage = function() {
        request.result = messages[idx];
        if (request.result) {
          request.result.id = request.result.api_id;
        }
        request.done = !request.result;
        idx += 1;
        request.continue = continueCursor;
        if (typeof request.onsuccess === 'function') {
          request.onsuccess.call(request);
        }
      };
      continueCursor = function() {
        setTimeout(returnMessage, 0);
      };

      continueCursor();
    });

    return request;
  };

  MultiMobileMessage.delete = function(id) {

  };

  MultiMobileMessage.markMessageRead = function(id, readBool) {
    var request = {
      result: true,
      error: null
    };

    DBManager.getMessageById(id).then(function(message) {
      DBManager.getThreadById(message.id).then(function(thread) {
        if (message.deliveryStatus === 'pending') {
          return request.onsuccess.call(request);
        }
      });
    });

    return request;
  };

  MultiMobileMessage.getSegmentInfoForText = function(text) {
    var request = {
      error: null
    };

    setTimeout(function() {
      var length = text.length;
      var segmentLength = 160;
      var charsUsedInLastSegment = (length % segmentLength);
      var segments = Math.ceil(length / segmentLength);
      if (typeof request.onsuccess === 'function') {
        request.onsuccess.call(request, {
          target: {
            result: {
              segments: segments,
              charsAvailableInLastSegment: charsUsedInLastSegment ?
              segmentLength - charsUsedInLastSegment :
              0
            }
          }
        });
      }
    }, 0);

    return request;
  };

  // Not implemented
  MultiMobileMessage.sendMMS = function() {
    throw new Error('sendMMS not implemented');
  };

  MultiMobileMessage.retrieveMMS = function() {
    throw new Error('retrieveMMS not implemented');
  };

  // Sync options
  MultiMobileMessage.sync = function() {
    // Don't use live long polling sync, since sms wont trigger the events
    // needed to display
    clearInterval(syncInterval);
    syncInterval = setInterval(DBManager.sync, 30000);
    DBManager.sync();
  };

  MultiMobileMessage.stopSync = function() {
    clearInterval(syncInterval);
  };

  MultiMobileMessage.performStaleOperations = function() {
    return DBManager.getPendingMessages().then(function(messages) {
      if (!Array.isArray(messages) || messages.length === 0) {
        return Promise.resolve();
      }

      var promises = [];
      messages.forEach(function(message) {
        var request = {};
        request.localMessage = message;
        promises.push(ProviderManager.send(request,
           message.receiver[0], message.body));
      });

      Promise.all(promises).then(function() {
        // Trigger refresh everything
        EventManager.EventManager.onThreadsSync();
        EventManager.EventManager.onMessagesSync();
      });
    });
  };

  exports.MultiMobileMessage = MultiMobileMessage;
})(window);

//navigator.mozMobileMessage = MultiMobileMessage;
MultiMobileMessage.start();
MultiMobileMessage.sync();
