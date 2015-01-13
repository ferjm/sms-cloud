'use strict';

importScripts('/sms-cloud/app/js/sw-utils.js');
importScripts('/sms-cloud/app/js/protocols/protocol_helper.js');

function SessionStoreWorker() {
  this.protocol = new IPDLProtocol('session');
  this.protocol.recvSaveSession = this.saveSession;
  this.protocol.recvRemoveSession = this.removeSession;
}

SessionStoreWorker.prototype.saveSession = function(resolve, reject, args) {
  debug('Got saveSession');
  resolve();
};

SessionStoreWorker.prototype.removeSession = function(resolve, reject, args) {
  debug('Got removeSession');
  resolve();
};
