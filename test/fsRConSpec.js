define([
  'chai',
  'fs-rcon'
], function (chai, FSRCON) {

  var assert = chai.assert;

  describe('fs-rcon module', function () {
    

    it('should have loaded', function () {
      assert.isObject(FSRCON);
    });


    it('should hash a value', function () {
      assert.isFunction(FSRCON.hash);
      assert.strictEqual(
        FSRCON.hash('0.1234'), 
        '56KwnzFuvBUaqvqhFkG46Psj0bUIz9LiMGy7dgZPt+DF/8wj5t/pkBPp+6FDUvZF2iOu+E2uCkgotDmtHAo6JA==',
        'should hash a string'
      );
    });


    it('should encrypt/decrypt a value', function () {

      var message = 'my message',
        secret = 'my secret',
        encrypted = FSRCON.encrypt(message, secret),
        decrypted = FSRCON.decrypt(encrypted, secret);

      assert.strictEqual(decrypted, message);
    });


    it('should initialize a connection', function (done) {
      
      var rcon = FSRCON.Client(),
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

      var rcon = FSRCON.Client(),
        options;
      
      assert.isFunction(rcon.send);

      options = {
        hostname: 'localhost',
        port: 3000
      };

      rcon.init(options, function () {

        var data = (function(){var s = ''; for (var i=0; i < 1000000; ++i) {s += i;} return s;}()),
          xhr;

        xhr = rcon.send(data, 'test', function (err, result) {
          
          assert.isNull(err, 'should not have an error');

          assert.equal(result.foo.data, data);
          
          done();
        });

        xhr.upload.onprogress = function(e) {
          assert.isNull(e);
          if (e.lengthComputable) {
            console.log('progress: ', (e.loaded / e.total) * 100);
          }
        };

      });

    });

  }); // describe fs-rcon

}); // define