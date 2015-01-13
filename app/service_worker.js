'use strict';

importScripts('/sms-cloud/app/js/sw-utils.js');

var worker = new ServiceWorker();
var sessionStore;

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

  if (url.indexOf('?') != -1) {
    url = url.split('?')[0];
  }

  e.respondWith(
    caches.match(url).then(function(response) {
      return response;
    }).catch(function(error) {
      return event.default();
    })
  )
};
