(function(exports) {

  // Github redirect.
  const FXA_CLIENT_ID = 'cdaad4e82a31b539';
  const FXA_REDIRECT_URI = 'https://ferjm.github.io/sms-cloud/app/list.html';
  const FXA_NOT_A_SECRET = 'a410e44e5bd8e122cd9d01fcd93af8c5478328f3b1fd1a7fb52fc1ccf79da925';

  /*
  // Localhost redirect.
  const FXA_CLIENT_ID = '59df2748ee18c38f';
  const FXA_REDIRECT_URI = 'http://localhost:8000/sms-cloud/app/list.html';
  const FXA_NOT_A_SECRET = '79efce744db495ac0372297d32a600ee1599ccae0fb822e501dec205accff397';*/

  const FXA_OAUTH_HOST = 'https://oauth-stable.dev.lcip.org/v1';
  const FXA_PROFILE_HOST = 'https://stable.dev.lcip.org/profile/v1';

  const TIMEOUT = 15000;

  var _profile;
  var _client;
  var _listeners = {};

  function _request(options) {
    return new Promise(function(resolve, reject) {
      var req = new XMLHttpRequest({mozSystem: true});
      req.open(options.method, options.url, true);
      req.setRequestHeader('Content-Type', 'application/json');
      req.responseType = 'json';
      req.timeout = TIMEOUT;

      var authorization = '';
      if (options.credentials) {
        switch (options.credentials.type) {
          case 'Bearer':
            authorization =
              options.credentials.type + ' ' + options.credentials.value;
            break;
        }
        req.setRequestHeader('authorization', authorization);
      }

      req.onload = function() {
        if (req.status !== 200) {
          reject(req.statusText);
          return;
        }
        resolve(req.response);
      };

      req.onerror = req.ontimeout = function(event) {
        reject(event.target.status);
      };

      var body;
      if (options.body) {
        body = JSON.stringify(options.body);
      }

      req.send(body);
    });
  }

  function _setProfile() {
    var code = Utils.getQueryParameter('code');
    if (!code && !code.length) {
      return Promise.reject();
    }

    // XXX: fxaRelierClient.token.tradeCode doesn't work :(
    //      so we need to do the requests manually.
    return _request({
      method: 'POST',
      url: FXA_OAUTH_HOST + '/token',
      body: {
        client_id: FXA_CLIENT_ID,
        client_secret: FXA_NOT_A_SECRET,
        code: code
      }
    }).then(function(response) {
      if (!response) {
        return Promise.reject();
      }

      if (!response.access_token) {
        return Promise.reject();
      }

      return _request({
        method: 'GET',
        url: FXA_PROFILE_HOST + '/profile',
        credentials: {
          type: 'Bearer',
          value: response.access_token
        }
      })
    }).then(function(profile) {
      console.log('PROFILE ' + JSON.stringify(profile));
      profile.user = profile.email.split('@')[0];
      _profile = profile;
      return profile;
    });
  }

  function _triggerEvent(name, value) {
    var handlers = _listeners[name] || [];

    handlers.forEach(function(handler) {
      handler.call(null, value);
    });
  }

  var Accounts = {
    get client() {
      if (!_client) {
        _client = new FxaRelierClient(FXA_CLIENT_ID, {
          oauthHost: FXA_OAUTH_HOST,
          profileHost: FXA_PROFILE_HOST,
          clientSecret: FXA_NOT_A_SECRET
        });
      }
      return _client;
    },

    get profile() {
      return _profile;
    },

    init: function() {
      try {
        _profile = localStorage.getItem('account');
        _profile = JSON.parse(_profile);
      } catch(e) {
        console.log('CRAP ' + e);
      }

      if (_profile) {
        _triggerEvent('login', _profile);
        return;
      }

      _setProfile().then(function(profile) {
        debug('FXA - Logged as ' + JSON.stringify(profile));
        _triggerEvent('login', profile);
        localStorage.setItem('account', JSON.stringify(profile));
      });
    },

    signIn: function() {
      Accounts.client.auth.signIn({
        state: Date.now(),
        scope: 'profile',
        redirectUri: FXA_REDIRECT_URI
      });
    },

    signOut: function() {
      _profile = null;
      _triggerEvent('logout', {});
      localStorage.setItem('account', null);
    },

    addEventListener: function(eventName, callback) {
      var eventListeners = _listeners[eventName] || [];
      eventListeners.push(callback);
      _listeners[eventName] = eventListeners;
    }
  };

  exports.Accounts = Accounts;
})(window);

window.addEventListener('load', function() {
  Accounts.init();
});
