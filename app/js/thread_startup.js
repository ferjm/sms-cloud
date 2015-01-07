/* -*- Mode: js; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*global ThreadUI, MessageManager */

'use strict';

var loaded = function() {
  MessageManager.init();
  ThreadUI.init();
  window.removeEventListener('load', loaded);
};

window.addEventListener('message', function(message) {
  ThreadUI.renderMessages(parseInt(message.data));
});

window.addEventListener('load', loaded);
