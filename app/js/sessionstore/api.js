'use strict';

importScripts('/sms-cloud/app/js/protocols/protocol_helper.js');

function SessionStoreAPI() {
  this.protocol = new IPDLProtocol('session');
};

SessionStoreAPI.prototype.saveSession = function(url, markup) {
  debug('Sending saveSession for ' + url);
  return this.protocol.sendSaveSession(JSON.stringify({
    url: url,
    markup: markup
  }));
};

SessionStoreAPI.prototype.removeSession = function(session) {
  debug('Sending removeSession');
  return this.protocol.sendRemoveSession(session);
};
