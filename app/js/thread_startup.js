/* -*- Mode: js; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*global ThreadUI, MessageManager */

'use strict';

var loaded = function() {
  var id = document.location.search.replace('?id=', '');
  if (id) {
    changeContentUrl(id);
  }

  document.querySelector('.view-header').onclick = function() {
    window.close();
  };
  window.removeEventListener('load', loaded);
};

try {
  var channel = new BroadcastChannel('sms');
  channel.addEventListener('message', function(message) {
    // console.debug('Changing url to ', document.location.href + '?id=' + message.data);
    // document.location = document.location.href + '?id=' + message.data;
    changeContentUrl(message.data);
  });
} catch (e) {
  console.log('BroadcastChannel not available', e);
}


function changeContentUrl(id) {
  var iframe = document.getElementById('thread_content');
  console.debug('CHANGING URL ', 'thread_content.html?id=' + id);
  iframe.src = 'thread_content.html?id=' + id;
}

window.addEventListener('load', loaded);
