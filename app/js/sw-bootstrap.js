'use strict';

// On app load we register the service worker that will put the cache machinery in
// place.
//
// Once the service worker is properly registered we initialize the session
// store, updates and URL overloading APIs.
//
// The session store will allow us to cache and manage the views built from the
// data handled per each session so we can quickly render them when needed.
//
addEventListener('load', function onLoad(e) {
  var kWorkerUrl = '/sms-cloud/app/service_worker.js';
  var kWorkerOptions = {
    'scope': [ '/sms-cloud/app/' ]
  };

  debug('Registering service worker');
  navigator.serviceWorker.register(kWorkerUrl, kWorkerOptions).then(
    (function onSuccess(worker) {
      // XXX This should be done automagically by the platform.
      //     in the meantime let's emulate it.
      if (!navigator.serviceWorker.current) {
        navigator.serviceWorker.current = worker;
      }

      if (navigator.serviceWorker.controller) {
        importScripts('/sms-cloud/app/js/sessionstore/api.js');
        window.sessionStoreAPI = new SessionStoreAPI();
        //window.updateAPI = new UpdateAPI();
        //window.urlOverladingAPI = new UrlOverloadingAPI();
      }

      debug('Registered');
    }).bind(this),

    function onError(e) {
      debug('Not registered: ' + e);
    }
  );
});
