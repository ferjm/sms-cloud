'use strict';

(function(exports) {

  // localStorage.setItem('mockMode', '1');

  var enabled = localStorage.mockMode === '1';

  var accountContent = {
    'fernando@mozilla.com': 'static/x_large_threads_list_fernando.html',
    'francisco@mozilla.com': 'static/x_large_threads_list_francisco.html',
    'apastor@mozilla.com': 'static/x_large_threads_list_apastor.html'
  };

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
    if (Accounts.profile && accountContent[Accounts.profile.email]) {
      var content = accountContent[Accounts.profile.email];
      applyMockContentToNode(content,
       'threads-container').then(() => {
         renderingOptions.end && renderingOptions.end(true);
         renderingOptions.done && renderingOptions.done();
       });
    } else {
      renderingOptions.end && renderingOptions.end(false);
      renderingOptions.done && renderingOptions.done();
    }
  }

  function mockGetThread(cb) {
    applyMockContentToNode('static/x_large_thread_view.html',
     'messages-container').then(() => cb);
  }

  function applyMockContentToNode(url, id) {
    return getContent(url).then(function(body) {
      var container = document.getElementById(id);
      container.innerHTML = '';
      var children = body.getElementsByTagName('li');
      for(var i = 0; i < children.length; i++) {
        window.setTimeout(function(i) {
          container.appendChild(children[i]);
        }(i));
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
