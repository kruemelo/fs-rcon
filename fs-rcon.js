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


  FSRCON.url = function (instance, pathname) {
    var url = '';

    // protocol
    url += instance.protocol;
    url += '://';

    // hostname
    url += instance.hostname;

    // port
    url += instance.port ? ':' + instance.port : '';

    // pathname
    url += '/' + pathname;

    return url;
  };  // url


  /**
  * connect - server side only
  *
  **/
  FSRCON.prototype.connect = function (options, callback) {

    if (!options.clientRandomKey) {
      callback(new Error('EINVALIDCRK'));
    } 

    this.clientRandomKey = options.clientRandomKey;
    this.serverRandomKey =  FSRCON.hash(String(Math.random()) + String(Math.random()));
    this.SID = FSRCON.hash(this.clientRandomKey + this.serverRandomKey);

    callback(null);

    return this;
  };  // connect


  FSRCON.prototype.send = function (data, urlPathname, callback) {

    var xhr,
      url = FSRCON.url(this, urlPathname);

    xhr = new XMLHttpRequest();

    // The last parameter must be set to true to make an asynchronous request
    xhr.open('POST', url, true);

    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.setRequestHeader('Accept', 'application/json');
    
    xhr.onload = function () {
      var parsed;

      try {
        parsed = JSON.parse(this.response);
      }
      catch (err) {}

      if (undefined !== parsed && this.status >= 200 && this.status < 300) {
        callback(null, parsed);
      } 
      else {
        callback(new Error(this.response));
      }      
    };

    xhr.send(JSON.stringify({
      SID: this.SID,
      data: data
    }));

    return xhr;
  };


  /**
  * init connection - client side only
  **/
  FSRCON.prototype.init = function (options, callback) {

    var self = this,
      urlPathname = 'init',
      url = '',
      xhr,
      data = {};

    this.protocol = options.protocol || 'http';
    this.hostname = options.hostname || 'localhost';
    this.port = options.port || '';
    
    url = FSRCON.url(this, urlPathname);

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
  };  // init

  return FSRCON;

}));
