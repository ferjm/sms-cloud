'use strict';

importScripts('/sms-cloud/app/js/sw-utils.js');
importScripts('/sms-cloud/app/js/protocols/protocol_helper.js');

var SESSION_STORE = 'sms-cloud-session-store-v0';

function SessionStoreWorker() {
  this.protocol = new IPDLProtocol('session');
  this.protocol.recvSaveSession = this.saveSession;
  this.protocol.recvRemoveSession = this.removeSession;
};

SessionStoreWorker.prototype.saveSession = function(resolve, reject, args) {
  debug('Got saveSession with ' + args.url);

  if (!args.url || !args.markup) {
    debug('Invalid session');
    reject();
    return;
  }

  caches.open(SESSION_STORE).then(function(cache) {
    return cache.put(args.url, new Response(args.markup, {
      headers: {
        'Content-Type': 'text/html'
      }
    }))
  }).then(function() {
    debug('Session saved for ' + args.url);
    resolve();
  }).catch(function(error) {
    debug('Could not save session for ' + args.url + ' ' + error);
    reject();
  });
};


SessionStoreWorker.prototype.removeSession = function(resolve, reject, args) {
  debug('Got removeSession for ' + args.url);
  resolve();
};
