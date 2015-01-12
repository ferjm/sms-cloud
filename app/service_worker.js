'use strict';

importScripts('/sms-cloud/app/js/sw-utils.js');

var worker = new ServiceWorker();

worker.oninstall = function(e) {
  debug('oninstall');
  importScripts('/sms-cloud/app/service_worker_files.js');

  e.waitUntil(
    caches.open('sms-cloud-cache-v0').then(function(cache) {
      return cache.addAll(kCacheFiles);
    })
  );
};

worker.onfetch = function(e) {
  debug(e.type + ': ' + e.request.url);

  e.respondWith(
    caches.match(e.request.url).then(function(response) {
      if (!response) {
        debug('going do to a fetch for for ' + e.request.url + ', might go bad\n');
      }
      return response || fetch(e.request);
    }, function(error) {
      debug('Fetching ' + e.request.url + ' error. ' + error);
      return fetch(e.request);
    })
  )
};
