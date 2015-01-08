(function ProviderManager(exports) {
  var ProviderManager = {
    provider: null
  };

  ProviderManager.start = function(name) {
    if (name && exports[name]) {
      this.provider = exports[name];
    } else if (navigator.mozMobileMessage){
      this.provider = navigator.mozMobileMessage;
    }
  }

  exports.ProviderManager = ProviderManager;
})(window);
