(function(definition) {
  if (typeof module !== 'undefined') {
    // CommonJS
    module.exports = definition();
  }
  else if (typeof define === 'function' && typeof define.amd === 'object') {
    // AMD
    define(definition);
  }
  else if (typeof window === 'object') {
    // DOM
    window.FSRCON = definition(window.FSRCON);
  }
}(function () {

  'use strict';
    
  var FSRCON = function () {

  };

  return FSRCON;

}));
