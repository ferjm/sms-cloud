'use strict';

importScripts('/sms-cloud/app/js/sw-utils.js');

var worker = new ServiceWorker();
var sessionStore = {
  match: function(url) {
    debug('Looking in FAKE sessionStore. Reject by default');
    return Promise.reject();
  }
};

worker.oninstall = function(e) {
  debug('oninstall');
  importScripts('/sms-cloud/app/service_worker_files.js');

  e.waitUntil(
    caches.open('sms-cloud-cache-v0').then(function(cache) {
      return cache.addAll(kCacheFiles);
    })
  );
};

worker.onactivate = function(e) {
  debug('onactivate');

  try {
    importScripts('/sms-cloud/app/js/sessionstore/worker_api.js');
    sessionStore = new SessionStoreWorker();
  } catch (err) {
    debug('ERROR creating sessionStore ' + err + ' ' + err.stack);
  }
};

worker.onfetch = function(e) {
  debug (e.type + ': ' + e.request.url);

  var url = e.request.url;

  e.respondWith(
    sessionStore.match(url).then(function(response) {
      debug('Yay! ' + url + ' is in the session store ' + response);
      return response;
    }).catch(function() {
      if (url.indexOf('?') != -1) {
        url = url.split('?')[0];
      }
      debug(e.request.url + ' is not in the session store. Trying cache.');
      return caches.match(url).then(function(response) {
        return response;
      });
    }).catch(function(error) {
      debug(e.request.url + ' is not even in the cache. Trying network');
      return event.default();
    })
  )
};
