'use strict';

(function(exports) {

  var enabled = localStorage.mockMode === '1';

  function getContent(url) {
    return new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.onload = function() {
        resolve(this.responseXML.body);
      };
      xhr.open("GET", url);
      xhr.responseType = "document";
      xhr.send();
    });
  }

  function mockGetThreads(renderingOptions) {
    applyMockContentToNode('static/x_large_threads_list.html',
     'threads-container').then(() => {
       renderingOptions.end();
       renderingOptions.done();
     });
  }

  function mockGetThread(cb) {
    applyMockContentToNode('static/x_large_thread_view.html',
     'messages-container').then(() => cb);
  }

  function applyMockContentToNode(url, id) {
    return getContent(url).then(function(body) {
      var container = document.getElementById(id);
      var children = body.childNodes;
      for(var i = 0; i < children.length; i++) {
        container.appendChild(children[i]);
      }
    });
  }


  exports.MockContent = {
    get enabled() {
      return enabled;
    },
    getThreads: mockGetThreads,
    getThread: mockGetThread
  }

})(window);
