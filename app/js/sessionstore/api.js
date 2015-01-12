'use strict';

importScripts('/sms-cloud/app/js/protocols/protocol_helper.js');

function SessionStoreAPI() {
  this.protocol = new IPDLProtocol('session');
};

ServiceAPI.prototype.saveSession = function(session) {
  return this.protocol.sendSaveSession(session);
};
