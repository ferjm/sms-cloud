/* -*- Mode: js; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*global ThreadUI, MessageManager */

'use strict';

var loaded = function() {
  var id = document.location.search.replace('?id=', '');
  if (id) {
    var thread = JSON.parse('{"id":1,"participants":["1977"],"lastMessageType":"sms","body":"Alo, how are you today, my friend? :)","timestamp":1420562306348,"unreadCount":0}');
    loadThread(thread);
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
    var thread = JSON.parse(message.data);
    loadThread(thread);
  });
} catch (e) {
  console.log('BroadcastChannel not available', e);
}


function loadThread(thread) {
  var iframe = document.getElementById('thread_content');
  iframe.src = 'thread_content.html?id=' + thread.id;
  ThreadUI.init();
  ThreadUI.updateHeaderData(thread);
}

window.addEventListener('load', loaded);
