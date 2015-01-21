
MockUpdates = {
  applyUpdate: function() {
    localStorage.setItem('isUpdated', true);
    window.location.reload();
  },
  applyAddon: function() {
    localStorage.setItem('addonApplied', true);
  },
  searchAddons: function() {
    var params = {
      header: 'Addons found',
      items: [{
        name: 'New super cool thread view',
        method: MockUpdates.applyAddon
      },{
        name: 'Addon 2',
        method: MockUpdates.applyAddon
      },{
        name: 'Addon 3',
        method: MockUpdates.applyAddon
      },{ // Last item is the Cancel button
        l10nId: 'cancel',
        incomplete: true
      }]
    };

    new OptionMenu(params).show();
  },
  searchUpdates: function() {
    var options = {
      title: { raw: 'New update found' },
      body: {
        raw: 'Do you want to apply it?'
      },
      options: {
        // Cancel is a mandatory option. You need to define at least the text.
        cancel: {
          text: 'cancel'
        },
        confirm: {
          text: 'apply',
          method: MockUpdates.applyUpdate
        }
      }
    };
    new Dialog(options).show();
  }
};


window.addEventListener('DOMContentLoaded', function() {
  var isUpdated = localStorage.getItem('isUpdated');
  if (isUpdated) {
    document.getElementsByTagName('header')[0].classList.add('updated');
  }
});
