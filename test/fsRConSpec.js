define([
  'chai',
  'fs-rcon'
], function (chai, FSRCON) {

  var assert = chai.assert;

  describe('fs-rcon', function () {

    it('should initialize', function () {
      assert.isFunction(FSRCON);
    });

  }); // describe fs-rcon

}); // define