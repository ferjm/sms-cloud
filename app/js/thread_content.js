/* -*- Mode: js; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*global ThreadUI, MessageManager */

'use strict';

var loaded = function() {
  debug("THREAD CONTENT LOADED - MESSAGES CONTAINER\n" +
        document.getElementById('messages-container').innerHTML);
  MessageManager.init();
  ThreadUI.init();
  if (localStorage.mockMode === '1') {
    var self = this;
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
      var container = document.getElementById('messages-container');
      var children = this.responseXML.body.childNodes;
      for(var i = 0; i < children.length; i++) {
        container.appendChild(children[i]);
      }
      onMessagesRendered();
    };
    xhr.open("GET", "static/x_large_thread_view.html");
    xhr.responseType = "document";
    xhr.send();
  } else {
    var id = document.location.search.replace('?id=', '');
    if (id) {
      debug('LOADING ', id);
      window.setTimeout(function() {
        ThreadUI.renderMessages(parseInt(id));
      }, 100);
    }
  }
  window.removeEventListener('load', loaded);
};

window.addEventListener('load', loaded);
