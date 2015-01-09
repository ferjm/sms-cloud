(function DBManager(exports) {
  var DBManager = {};

  var messagesDB = new PouchDB('messages');
  var threadsDB = new PouchDB('threads');

  DBManager.new = function(number, text) {
    return DBManager.getThread(number).then(function(thread) {
      return new Promise(function(resolve, reject) {
        if (thread) {
          buildSendInfo(thread.api_id);
        } else {
          DBManager.getNextThreadId().then(function(id) {
            DBManager.createThread(id, number).then(function(newThread) {
              buildSendInfo(id);
            }, reject);
          }, reject);
        }

        function buildSendInfo(threadId) {
          DBManager.createMessage(threadId, number, text).then(function(msg) {
            resolve(msg)
          }, reject);
        }
      });
    });
  };

  DBManager.getNextThreadId = function() {
    return getMaxFromField(threadsDB, 'api_id').then(function(max) {
      if (max === -Infinity) {
        return 1;
      }
      return max + 1;
    });
  };

  DBManager.getThread = function(number) {
    return threadsDB.query(function(doc, emit) {
      if (doc.participants &&
         doc.participants.length === 1 &&
         doc.participants[0] === number) {
        emit(doc);
      }
    }, {include_docs : true}).then(function(result) {
      return result.rows.length ? result.rows[0].doc : null;
    });
  };

  DBManager.createThread = function(threadId, participant, text) {
    var thread = {
      api_id: threadId,
      participants: [].concat(participant),
      body: text || '',
      timestamp: Date.now(),
      unreadCount: 0,
      lastMessageType: 'sms'
    };

    return threadsDB.post(thread);
  };

  DBManager.updateThread = function(thread) {
    return threadsDB.put(thread).then(function() {
      return thread;
    });
  };

  DBManager.getNextMessageId = function() {
    return getMaxFromField(messagesDB, 'api_id').then(function(max) {
      if (max === -Infinity) {
        return 1;
      }
      return max + 1;
    });
  };

  DBManager.createMessage = function(threadId, number, text) {
    return DBManager.getNextMessageId().then(function(id) {
      var message = {
          sender: null,
          receiver: [number],
          delivery: 'sending',
          deliveryStatus: 'pending',
          body: text,
          api_id: id,
          type: 'sms',
          read: true,
          timestamp: Date.now(),
          threadId: threadId
      };
      return messagesDB.post(message).then(function(result) {
        return DBManager.updateThreadBody(threadId, text).then(function() {
          return messagesDB.get(result.id);
        });
      });
    });
  };

  DBManager.updateThreadBody = function(threadId, text) {
    return threadsDB.query(function(doc, emit) {
        if (doc.api_id === threadId) {
          emit(doc);
        }
      }, {include_docs : true}).then(function(result) {
        var row = result.rows[0];
        if (!row) {
          return;
        }

        row.doc.body = text;

        return threadsDB.put(row.doc);
      });
  };

  DBManager.updateMessage = function(messageId, apiMsg) {
    return messagesDB.get(messageId).then(function(doc) {
      debugger;
      if (!doc) {
        return Promise.reject();
      }

      for(var elem in apiMsg) {
        if (elem !== 'threadId') {
          // Don't update thread, otherwise we will be missing conversations
          doc[elem] = apiMsg[elem];
        }
      }

      doc.api_id = apiMsg.id;
      delete doc.id;

      return messagesDB.put(doc);

    });
  };

  function getMaxFromField(db, field) {
    return db.query(function (doc, emit) {
      emit(doc[field]);
    }).then(function (result) {
      var ids = result.rows.map(function(entry) {
        return entry.key;
      });
      return Math.max.apply(null, ids);
    });
  }

  DBManager.destroy = function() {
    messagesDB.destroy();
    threadsDB.destroy();
  };

  DBManager.getAllMessages = function() {
    return getAllDocs(messagesDB);
  };

  DBManager.getAllThreads = function() {
    return getAllDocs(threadsDB);
  };

  DBManager.getMessageById = function(id) {
    return getDocByApiId(messagesDB, id);
  };

  DBManager.getThreadById = function(id) {
    return getDocByApiId(threadsDB, id);
  };

  DBManager.sync = function() {
    var EXTERNAL_DB_HOST = 'https://sms-cloud.iriscouch.com/';

    var promises = [];
    var threadsSync = new Promise(function(resolve, reject) {
      PouchDB.sync('threads', EXTERNAL_DB_HOST + 'threads').
      on('complete', function() {
        EventManager.onThreadsSync();
        resolve();
      }).
      on('error',reject);
    });
    var messagesSync = new Promise(function(resolve, reject) {
      PouchDB.sync('messages', EXTERNAL_DB_HOST + 'messages').
      on('complete', function() {
        EventManager.onMessagesSync();
      }).
      on('error',reject);
    });

    promises.push(threadsSync);
    promises.push(messagesSync);

    return Promise.all(promises);
  };

  function getDocByApiId(db, id) {
    return db.query(function(doc, emit) {
      if (doc.api_id === id) {
        emit(doc);
      }
    }).then(function(result) {
      var doc = result.rows[0] ? result.rows[0].key : null;
      if (doc) {
        doc.id = doc.api_id;
      }

      return doc;
    });
  }

  function getAllDocs(db) {
    return db.allDocs({include_docs:true}).then(function(result){
      return result.rows.map(function(entry) {
        return entry.doc;
      });
    });
  }

  exports.DBManager = DBManager;
})(window);
