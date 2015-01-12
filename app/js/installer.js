var req = navigator.mozApps.install('https://ferjm.github.io/sms-cloud/app/manifest.webapp');
req.onerror = function() {
  console.error('Could not install app ' + req.error.name);
};
