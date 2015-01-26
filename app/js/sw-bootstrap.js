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
  var mock = localStorage.getItem('mockMode');
  if (mock === '1') {
    debug('MOCK mode - no service worker');
    return;
  }

  var kWorkerUrl = '/sms-cloud/app/service_worker.js';
  var kWorkerOptions = {
    'scope': [ '/sms-cloud/app/' ]
  };

  debug('Registering service worker');
  navigator.serviceWorker.register(kWorkerUrl, kWorkerOptions).then(
    (function onSuccess(worker) {

      var theWorker = worker.installing || worker.waiting ||
                      worker.active;
      if (navigator.serviceWorker.controller) {
        window.sessionStoreAPI = new SessionStoreAPI(theWorker);
        try {
          window.urlOverrideAPI = new UrlOverrideAPI(theWorker);
        } catch(e) {
          debug('CRAP ' + document.location.href + e);
        }
        //window.updateAPI = new UpdateAPI();
      } else {
        //debug('Need to reload');
        //doSoftReload();
      }

      debug('Registered');
    }).bind(this),

    function onError(e) {
      debug('Not registered: ' + e);
    }
  );
});
