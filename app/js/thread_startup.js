/* -*- Mode: js; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*global ThreadUI, MessageManager */

'use strict';

var loaded = function() {
  debug('THREAD STARTUP LOADED');
  MessageManager.init();
  var id = document.location.search.replace('?id=', '');
  if (id) {
    loadThread(id);
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
    loadThread(message.data);
  });
} catch (e) {
  console.log('BroadcastChannel not available', e);
}


function loadThread(id) {
  var thread;
  ThreadUI.init();
  var iframe = document.getElementById('thread_content');
  var addonApplied = localStorage.getItem('addonApplied');
  var url = 'thread_content';
  url += addonApplied ? '_addon.html' : '.html';
  iframe.src = url + '?id=' + id;
  var options = {
    each: function(record) {
      if (record.id == id) {
        thread = record;
      }
    },
    done: function() {
      ThreadUI.updateHeaderData(thread);
    }
  };
  MessageManager.getThreads(options);
}

window.addEventListener('load', loaded);
