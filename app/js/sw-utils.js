'use strict';

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

// The cache API doesn't take into account the query parameters, so we
// need to create a different url including the query parameters
// information in the path.
function normalizeUrl(url) {
  if (url.indexOf('?') == -1) {
    return url;
  }

  return url.replace("?","/").replace("=", "/");
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
