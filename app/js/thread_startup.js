/* -*- Mode: js; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*global ThreadUI, MessageManager */

'use strict';

var loaded = function() {
  var id = document.location.search.replace('?id=', '');
  if (id) {
    MessageManager.init();
    ThreadUI.init();
    window.setTimeout(function() {
      ThreadUI.renderMessages(parseInt(id));
    }, 100);
  }
  window.removeEventListener('load', loaded);
};

window.addEventListener('load', loaded);
