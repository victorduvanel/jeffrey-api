(function() {
  function vendorModule() {
    'use strict';

    return {
      'default': window.libphonenumber,
      AsYouType: window.libphonenumber.asYouType,
      parse: window.libphonenumber.parse,
      format: window.libphonenumber.format,
      __esModule: true,
    };
  }

  define('libphonenumber-js', [], vendorModule);
})();
