'use strict';

importScripts('/sms-cloud/app/js/protocols/protocol_helper.js');

function UrlOverrideAPI(worker) {
  this.protocol = new IPDLProtocol('urloverride', worker);
};

UrlOverrideAPI.prototype.override = function(url, content, contentType) {
  debug('Sending override for ' + url);
  return this.protocol.sendOverride(url, content, contentType);
};

UrlOverrideAPI.prototype.recover = function(url) {
  debug('Sending recover for ' + url);
  return this.protocol.sendRecover(url);
};
