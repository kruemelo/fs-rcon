define([
  'chai',
  'fs-rcon'
], function (chai, FSRCON) {

  var assert = chai.assert;

  describe('fs-rcon', function () {
    

    it('should have loaded', function () {
      assert.isFunction(FSRCON);
    });


    it('should hash a value', function () {
      assert.isFunction(FSRCON.hash);
      assert.strictEqual(
        FSRCON.hash('0.1234'), 
        '56KwnzFuvBUaqvqhFkG46Psj0bUIz9LiMGy7dgZPt+DF/8wj5t/pkBPp+6FDUvZF2iOu+E2uCkgotDmtHAo6JA==',
        'should hash a string'
      );
    });


    it('should initialize a connection', function (done) {
      
      var rcon = new FSRCON(),
        options;

      assert.isFunction(rcon.init);

      options = {
        hostname: 'localhost',
        port: 3000
      };

      rcon.init(options, function (err) {
        assert.isNull(err, 'should not have an error');
        assert.isString(rcon.protocol, 'should have protocol set');
        assert.isString(rcon.hostname, 'should have hostname set');
        assert.isNumber(rcon.port, 'should have port set');
        assert.isString(rcon.clientRandomKey, 'should have clientRandomKey set');
        assert.isString(rcon.serverRandomKey, 'should have serverRandomKey set');
        assert.isString(rcon.SID, 'should have SID set');
        done();      
      });

    });


    it('should send a request', function (done) {
      var rcon = new FSRCON();
      assert.isFunction(rcon.send);
      done();
    });

  }); // describe fs-rcon

}); // define