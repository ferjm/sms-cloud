(function DBManager(exports) {
  var DBManager = {};

  var dbPool = {};

  var messagesDB;
  var threadsDB;

  var messagesDBName;
  var threadsDBName;

  function ensureDB() {
    var user;
    if (Accounts.profile && Accounts.profile.user) {
      user = Accounts.profile.user;
    }
    DBManager.start(user);
  };

  DBManager.start = function(user) {
    if (!user) {
      user = '';
    } else {
      user = '_' + user;
    }

    messagesDBName = 'messages' + user;
    threadsDBName = 'threads' + user;

    if (!dbPool[user]) {
      debug('Starting DBMANAGER for user ' + user);
      dbPool[user] = {
        messages: new PouchDB(messagesDBName),
        threads: new PouchDB(threadsDBName)
      };
    }

    messagesDB = dbPool[user].messages;
    threadsDB = dbPool[user].threads;
  };

  DBManager.new = function(number, text) {
    ensureDB();
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
    ensureDB();
    return getMaxFromField(threadsDB, 'api_id').then(function(max) {
      if (max === -Infinity) {
        return 1;
      }
      return max + 1;
    });
  };

  DBManager.getThread = function(number) {
    ensureDB();
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
    ensureDB();
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
    ensureDB();
    return threadsDB.put(thread).then(function() {
      return thread;
    });
  };

  DBManager.getNextMessageId = function() {
    ensureDB();
    return getMaxFromField(messagesDB, 'api_id').then(function(max) {
      if (max === -Infinity) {
        return 1;
      }
      return max + 1;
    });
  };

  DBManager.createMessage = function(threadId, number, text) {
    ensureDB();
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
    ensureDB();
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
    ensureDB();
    return messagesDB.get(messageId).then(function(doc) {
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
    ensureDB();
    messagesDB.destroy();
    threadsDB.destroy();
  };

  DBManager.getAllMessages = function() {
    ensureDB();
    return getAllDocs(messagesDB);
  };

  DBManager.getAllThreads = function() {
    ensureDB();
    return getAllDocs(threadsDB);
  };

  DBManager.getMessageById = function(id) {
    ensureDB();
    return getDocByApiId(messagesDB, id);
  };

  DBManager.getThreadById = function(id) {
    ensureDB();
    return getDocByApiId(threadsDB, id);
  };

  DBManager.emptyMessagesDB = function() {
    ensureDB();
    return emptyDB(messagesDB);
  };

  DBManager.emptyThreadsDB = function() {
    ensureDB();
    return emptyDB(threadsDB);
  };

  DBManager.emptyDB = function(db) {
    ensureDB();
    return emptyDB(db);
  };

  DBManager.sync = function() {
    ensureDB();
    var EXTERNAL_DB_HOST = 'https://sms-cloud.iriscouch.com/';

    debug('Syncing with ' + EXTERNAL_DB_HOST + threadsDBName);

    var promises = [];
    var threadsSync = new Promise(function(resolve, reject) {
      PouchDB.sync(threadsDBName, EXTERNAL_DB_HOST + threadsDBName).
      on('complete', function(result) {
        if (result.pull.docs_read || result.pull.docs_written) {
          EventManager.onThreadsSync();
        }
        resolve();
      }).
      on('error',reject);
    });
    var messagesSync = new Promise(function(resolve, reject) {
      PouchDB.sync(messagesDBName, EXTERNAL_DB_HOST + messagesDBName).
      on('complete', function(result) {
        if (result.pull.docs_read || result.pull.docs_written) {
          EventManager.onMessagesSync();
        }
        resolve();
      }).
      on('error',reject);
    });

    promises.push(threadsSync);
    promises.push(messagesSync);

    return Promise.all(promises);
  };

  DBManager.getPendingMessages = function() {
    ensureDB();
    return messagesDB.query(function(doc, emit) {
      if (doc.deliveryStatus === 'pending') {
        emit(doc);
      }
    }).then(function(result) {
      return result.rows.map(function(entry) {
        return entry.key;
      });
    });
  };

  function emptyDB(db) {
    return db.allDocs().then(function(docs) {
      var rows = docs.rows;
      var ops = [];
      rows.forEach(function(doc) {
        ops.push(db.remove(doc.id, doc.value.rev));
      });
      return Promise.all(ops);
    });
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

  Accounts.addEventListener('login', function(profile) {
    debug('ONLOGIN');
    DBManager.sync();
  });

  Accounts.addEventListener('logout', function() {
    DBManager.start();
  });

})(window);
