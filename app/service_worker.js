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

  var url = e.request.url;

  if (url.indexOf('?') != -1) {
    url = url.split('?')[0];
  }

  e.respondWith(
    caches.match(url).then(function(response) {
      return response;
    }, function(error) {
      debug('Fetching ' + e.request.url + ' error. ' + error);
      // XXX Ideally we should try to fetch this from the network,
      //     but unfortunately the fetch API is not working :( so
      //     we just reject the promise.
      return Promise.reject();
    })
  )
};
