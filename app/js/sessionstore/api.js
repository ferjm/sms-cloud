'use strict';

importScripts('/sms-cloud/app/js/protocols/protocol_helper.js');

function SessionStoreAPI() {
  this.protocol = new IPDLProtocol('session');
};

SessionStoreAPI.prototype.saveSession = function(session) {
  debug('Sending saveSession');
  return this.protocol.sendSaveSession(session);
};

SessionStoreAPI.prototype.removeSession = function(session) {
  debug('Sending removeSession');
  return this.protocol.sendRemoveSession(session);
};
