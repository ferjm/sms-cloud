'use strict';

importScripts('/sms-cloud/app/js/service/utils.js');

debug("service_worker");
var worker = new ServiceWorker();

// lifecycle events
worker.oninstall = function(e) {
  debug('oninstall');
  importScripts('/sms-cloud/app/service_worker_files.js');

  e.waitUntil(
    caches.open('sms-cloud-cloud-cache-v0').then(function(cache) {
      return cache.addAll(kCacheFiles);
    })
  );
};


// network events
worker.onfetch = function(e) {
  debug(e.type + ': ' + e.request.url);

  e.respondWith(
    caches.match(e.request.url).then(function(response) {
      if (!response) {
        debug('going do to a fetch for for ' + e.request.url + ', might go bad\n');
      }
      return response || fetch(e.request);
    })
  )
};
