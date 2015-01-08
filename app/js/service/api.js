'use strict';

importScripts('/sms-cloud/app/js/protocols/protocol_helper.js');

function ServiceAPI(callback) {
  var kWorkerUrl = '/sms-cloud/app/service_worker.js';
  var kWorkerOptions = {
    'scope': [ '/sms-cloud/app/' ]
  };
  navigator.serviceWorker.register(kWorkerUrl, kWorkerOptions).then(
    (function onSuccess(worker) {
      // XXX This should be done automagically by the platform.
      //     in the meantime let's emulate it.
      if (!navigator.serviceWorker.current) {
        navigator.serviceWorker.current = worker;
      }

      if (navigator.serviceWorker.controller) {
        //this.protocol = new IPDLProtocol('service');
      }

      callback && callback();
      debug('Registered');
    }).bind(this),

    (function onError(e) {
      debug('Not registered: ' + e);
    }).bind(this)
  );
};

ServiceAPI.prototype.applyUpdate = function(updatedFiles) {
  return this.protocol.sendApplyUpdate(updatedFiles);
};

