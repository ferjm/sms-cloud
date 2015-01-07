'use strict';

importScripts('/sms-cloud/app/js/string-polyfill.js');
importScripts('/sms-cloud/app/js/cache-polyfill.js');

// XXX Firefox compat with latest spec
if ('getServiced' in clients) {
  clients.getAll = clients.getServiced;
}

function debug(str) {
  console.log('ServiceWorker: ' + str);

  if ('dump' in self) {
    dump('ServiceWorker: ' + str + '\n');
  }
}

function getContentType(filename) {
  if (filename.endsWith('.css')) {
    return 'text/css';
  } else if (filename.endsWith('.json')) {
    return 'application/json';
  } else if (filename.endsWith('.js')) {
    return 'application/javascript';
  } else if (filename.endsWith('.png')) {
    return 'image/png';
  } else if (filename.endsWith('.html')) {
    return 'text/html';
  } else if (filename.endsWith('.png')) {
    return 'image/png';
  }

  return 'text/plain';
};

function ServiceWorker() {
  // lifecycle events
  addEventListener('activate', this);
  addEventListener('install', this);
  addEventListener('beforeevicted', this);
  addEventListener('evicted', this);

  // network events
  addEventListener('fetch', this);

  // misc events
  addEventListener('message', this);
};

ServiceWorker.prototype.handleEvent = function(e) {
  if (!this['on' + e.type]) {
    return;
  }

  this['on' + e.type].call(this, e);
};

