'use strict';

importScripts('/sms-cloud/app/js/protocols/protocol_helper.js');

function SessionStoreAPI() {
  this.protocol = new IPDLProtocol('session');
  this.protocol.recvSessionSaved = this.onSessionSaved;
};

SessionStoreAPI.prototype.saveSession = function(url, markup) {
  debug('Sending saveSession for ' + url);
  return this.protocol.sendSaveSession(url, markup);
};

SessionStoreAPI.prototype.removeSession = function(url) {
  debug('Sending removeSession');
  return this.protocol.sendRemoveSession(url);
};

SessionStoreAPI.prototype.onSessionSaved = function(resolve, reject, args) {
  debug('Session saved for ' + args.url);
  // This is an awful hack to avoid rendering the sms threads if we already
  // have the DOM ready because we are consuming a stored session.
  localStorage.setItem('session', args.url);
};
