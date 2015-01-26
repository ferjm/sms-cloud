Addons = {
  addonMetadata: {
    'threadview': {
      url: '/sms-cloud/app/thread_content.html',
      overrideContent: '/sms-cloud/app/thread_content_addon.html',
      overrideContentType: 'text/html'
    }
  },

  applyAddon: function(addonName) {
    var addon = Addons.addonMetadata[addonName];
    if (!window.urlOverrideAPI) {
      navigator.serviceWorker.ready.then(function(registration) {
        var theWorker = registration.installing ||
                        registration.active ||
                        registration.waiting;
        debug('Creating url override for this window ' + theWorker);
        window.urlOverrideAPI = new UrlOverrideAPI(theWorker);
        window.urlOverrideAPI.override(addon.url,
                                       addon.overrideContent,
                                       addon.overrideContentType);
      });
    } else {
      window.urlOverrideAPI.override(addon.url,
                                     addon.overrideContent,
                                     addon.overrideContentType);
    }
  },

  searchAddons: function() {
    var params = {
      header: 'Addons found',
      items: [{
        name: 'New super cool thread view',
        method: Addons.applyAddon('threadview')
      }, { // Last item is the Cancel button
        l10nId: 'cancel',
        incomplete: true
      }]
    };

    new OptionMenu(params).show();
  }
};
