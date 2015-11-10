(function(definition) {
  if (typeof module !== 'undefined') {
    // CommonJS
    module.exports = definition(require('./libs/CryptoJS.js'));
  }
  else if (typeof define === 'function' && typeof define.amd === 'object') {
    // AMD
    define(['cryptojs'], definition);
  }
  else if (typeof window === 'object') {
    // DOM
    window.FSRCON = definition(window.CryptoJS);
  }
}(function (CryptoJS) {

  'use strict';
    
  var FSRCON = function () {
    this.protocol = null;
    this.hostname = null;
    this.port = null;
    this.clientRandomKey = null;
    this.serverRandomKey = null;
    this.SID = null; 
  };

  FSRCON.hash = function (v) {
    return CryptoJS.SHA512(v).toString(CryptoJS.enc.Base64);
  };

  FSRCON.prototype.send = function () {

  };

  FSRCON.prototype.init = function (options, callback) {

    var self = this,
      pathname = 'init',
      url = '',
      xhr,
      data = {};

    this.protocol = options.protocol || 'http';
    this.hostname = options.hostname || 'localhost';
    this.port = options.port || '';
    
    // protocol
    url += this.protocol;
    url += '://';

    // hostname
    url += this.hostname;

    // port
    url += this.port ? ':' + this.port : '';

    // pathname
    url += '/' + pathname;

    xhr = new XMLHttpRequest();

    // The last parameter must be set to true to make an asynchronous request
    xhr.open('POST', url, true);

    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.setRequestHeader('Accept', 'application/json');
    
    xhr.onload = function () {

      var parsedResponse = JSON.parse(this.response);
// console.log('r: ', r);

      if (parsedResponse.SRK && this.status >= 200 && this.status < 300) {
        
        self.serverRandomKey = parsedResponse.SRK;
        self.SID = FSRCON.hash(self.clientRandomKey + self.serverRandomKey);

        callback(null);
      } 
      else {
        callback(new Error(this.response));
      }      
    };

    this.clientRandomKey = FSRCON.hash(String(Math.random()) + String(Math.random()));
    this.serverRandomKey = null;
    this.SID = null;

    data = {
      CRK: this.clientRandomKey
    };

    xhr.send(JSON.stringify(data));

    return this;
  };

  return FSRCON;

}));
