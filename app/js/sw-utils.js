'use strict';

function debug(str) {
  console.log('MainPage: ' + str);
  if ('dump' in window) {
    dump('MainPage: ' + str + '\n');
  }
}

function doSoftReload() {
  // XXX It seems to be some cache issues on both chrome and Firefox.
  // But reloading the url this way makes it works as expected.
  setTimeout(function() { location = location; });
}

function importScripts(script) {
  if (document.querySelector('script[src="' + script + '"]')) {
    return;
  }

  var element = document.createElement('script');
  element.setAttribute('src', script);
  element.async = false;
  element.defer = false;
  document.head.appendChild(element);
}

importScripts('/sms-cloud/app/js/string-polyfill.js');
