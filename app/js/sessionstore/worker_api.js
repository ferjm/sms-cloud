'use strict';

importScripts('/sms-cloud/app/js/protocols/protocol_helper.js');

var protocol = new IPDLProtocol('session');

protocol.recvSaveSession = function(resolve, reject, args) {
  debug('Got saveSession');
  resolve();
};

protocol.recvRemoveSession = function(resolve, reject, args) {
  debug('Got removeSession');
  resolve();
};
