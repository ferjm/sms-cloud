'use strict';

importScripts('/sms-cloud/app/js/sw-utils.js');

var worker = new ServiceWorker();
var sessionStore = {
  match: function(url) {
    // debug('Looking in FAKE sessionStore. Resolve empty by default');
    return Promise.resolve(undefined);
  }
};

worker.oninstall = function(e) {
  debug('oninstall');
  importScripts('/sms-cloud/app/service_worker_files.js');

  // "Works" in Maple but doesn't work in Chrome...
  e.waitUntil(
    caches.open('sms-cloud-cache-v0').then(function(cache) {
      return cache.addAll(kCacheFiles).then(function() {
        debug('Add all files to cache SUCCESS');
        return Promise.resolve();
      }).catch(function(error) {
        debug('ERROR caching resources ' + error);
      });
    })
  );

  /*
  // Works in Chrome but doesn't work in Maple...
  e.waitUntil(
    caches.open('sms-cloud-cache-v0').then(function(cache) {
      kCacheFiles.forEach(function(file) {
        fetch(file).then(function (resp) {
          debug('Caching ' + file);
          cache.put(file, resp).then(function(e) {
            debug('Cached ' + file);
          }, function(e) {
            debug('Could not cache ' + file + ' ' + e);
          });
        })
      });
    })
  );
  */
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
      if (response) {
        debug('Yay! ' + url + ' is in the session store ' + response);
        /*var cloned = response.clone();
        cloned.text().then(function(e) {
          debug(' RESPONSE from session store' + e);
        });*/
        return response;
      }

      if (url.indexOf('?') != -1) {
        url = url.split('?')[0];
      }
      //debug(e.request.url + ' is not in the session store. Trying cache.');

      return caches.open('sms-cloud-cache-v0').then(function(cache) {
        return cache.match(url);
      }).then(function(response) {
        if (!response) {
          debug(e.request.url + ' is not even in the cache. Trying network');
          // fetch(e.request) never resolve.
          // e.default() crashes the browser
          // me -> :_(
          return;
        }
        debug('CACHED response for ' + e.request.url);
        return response;
      }).catch(function(error) {
        debug('Error for ' + e.request.url + ' ' + error);
      });
    })
  )
};
