'use strict';

importScripts('/sms-cloud/app/js/sw-utils.js');
importScripts('/sms-cloud/app/js/protocols/protocol_helper.js');

var URL_OVERRIDE_STORE = 'sms-cloud-url-override-store-v0';

function UrlOverrideWorker() {
  this.protocol = new IPDLProtocol('urloverride');
  this.protocol.recvOverride = this.override;
  this.protocol.recvRecover = this.recover;
};

UrlOverrideWorker.prototype.override = function(resolve, reject, args) {
  var url = args.url;

  debug('Got override for ' + url);

  if (!url || !args.content || !args.contentType) {
    debug('Invalid request');
    reject();
    return;
  }

  var normalizedUrl = normalizeUrl(url);

  debug('Normalized URL ' + normalizedUrl);

  caches.open(URL_OVERRIDE_STORE).then(function(cache) {
    return cache.put(normalizedUrl, new Response(args.content, {
      headers: {
        'Content-Type': args.contentType
      }
    }));
  }).then(resolve).catch(function(error) {
    debug('Could not override url ' + normalizedUrl + ' ' + error);
    reject();
  });
};

UrlOverrideWorker.prototype.recover = function(resolve, reject, args) {
  var url = args.url;

  debug('Got recover for ' + url);

  if (!url) {
    debug('Invalid request');
    reject();
    return;
  }

  var normalizedUrl = normalizeUrl(url);

  caches.open(URL_OVERRIDE_STORE).then(function(cache) {
    return cache.delete(normalizedUrl);
  }).then(resolve).catch(function(error) {
    debug('Could not remove override for ' + url);
    reject();
  });
};

UrlOverrideWorker.prototype.match = function(url) { 
  url = normalizeUrl(url);
  return caches.open(URL_OVERRIDE_STORE).then(function(cache) {
    return cache.match(url).then(function(response) {
      if (!response) {
        return Promise.reject();
      }
      return response;
    });
  });
}
