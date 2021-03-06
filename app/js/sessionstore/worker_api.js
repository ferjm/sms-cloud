'use strict';

importScripts('/sms-cloud/app/js/sw-utils.js');
importScripts('/sms-cloud/app/js/protocols/protocol_helper.js');

var SESSION_STORE = 'sms-cloud-session-store-v0';

function SessionStoreWorker() {
  this.protocol = new IPDLProtocol('session');
  this.protocol.recvSaveSession = this.saveSession.bind(this);
  this.protocol.recvRemoveSession = this.removeSession;
};

SessionStoreWorker.prototype.saveSession = function(resolve, reject, args) {
  var url = args.url;

  debug('Got saveSession with ' + url);

  if (!url || !args.markup) {
    debug('Invalid session');
    reject();
    return;
  }

  var normalizedUrl = normalizeUrl(url);

  debug('Normalized URL ' + normalizedUrl);

  var self = this;

  caches.open(SESSION_STORE).then(function(cache) {
    return cache.put(normalizedUrl, new Response(args.markup, {
      headers: {
        'Content-Type': 'text/html'
      }
    }))
  }).then(function() {
    self.protocol.sendSessionSaved(url);
    resolve();
  }).catch(function(error) {
    debug('Could not save session for ' + normalizedUrl + ' ' + error);
    reject();
  });
};

SessionStoreWorker.prototype.removeSession = function(resolve, reject, args) {
  debug('Got removeSession for ' + args.url);
  resolve();
};

SessionStoreWorker.prototype.match = function(url) {
  url = normalizeUrl(url);
  // debug('Looking for ' + url + ' in session store');
  return caches.open(SESSION_STORE).then(function(cache) {
    return cache.match(url);
  });
}
