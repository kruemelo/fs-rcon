define([
  'chai',
  'es6-promise-polyfill',
  'fs-rcon'
], function (chai, Promise, FSRCON) {

  var assert = chai.assert;

  describe('fs-rcon module', function () {
    

    it('should have loaded', function () {
      assert.isObject(FSRCON);
    });


    it('should hash values', function () {
      assert.isFunction(FSRCON.hash);
      assert.strictEqual(
        FSRCON.hash(undefined, null),
        'Enn0fxSLFQurA36JXEx9qnQ2qrkDe4ifTxa9uE3ZMkZpSePSUfj0aituvofqGMet6b63AVwACbOOu2I1l6w',
        'should hash undefined and null'
      );
      assert.strictEqual(
        FSRCON.hash('0.1234'), 
        '56KwnzFuvBUaqvqhFkG46Psj0bUIz9LiMGy7dgZPtDF8wj5tpkBPp6FDUvZF2iOuE2uCkgotDmtHAo6JA',
        'should hash a string'
      );
      // console.log(FSRCON.hash('0.1234'));
    });


    it('should generate a random key', function () {
      assert.isFunction(FSRCON.nonce);
      assert.isString(FSRCON.nonce());
      assert.notEqual(FSRCON.nonce(), FSRCON.nonce(), 'not equal nonces');
      // console.log(FSRCON.nonce());
    });


    it('should get account key', function () {

      var accountId = FSRCON.hash('email@domain.tld'),
        //FSRCON.nonce();
        nonce = 'MrTwwsXGFe55xA81GBQBLqvW1ozQuFNgduQrPzTpphisosjglcsurc0KymNOqpVXGKqvzyHTxHAhnfOPOCew';

      assert.isFunction(FSRCON.accountKey, 'account key fn');
      assert.strictEqual(
        FSRCON.accountKey(accountId, nonce), 
        'MtK61V4PXD3QMFPrrg8xqkCYR0bZpMJY0APrMfJqyiLiyQiLvT9xpsTY82JE9QBd2sw3HO0GIh3oW2VukhUg', 
        'account key value'
      );

    });


    it('should generate a session id from clent and server nonce', function () {
      assert.isFunction(FSRCON.sid);
      assert.isString(FSRCON.sid(FSRCON.nonce(), FSRCON.nonce()));
    });


    it('should encrypt/decrypt a value', function () {

      var message = 'my message',
        secret = 'my secret s0',
        encrypted = FSRCON.encrypt(message, secret),
        decrypted = FSRCON.decrypt(encrypted, secret);
      assert.strictEqual(decrypted, message);
    });


    it('should initialize a session', function (done) {
      
      var rcon = new FSRCON.Client({
          hostname: 'localhost',
          port: 3000
        });

      assert.isFunction(rcon.init);

      function test (err) {
        try {
          assert(!err, 'should not have an error');      
          assert.isString(rcon.protocol, 'should have protocol set');
          assert.isString(rcon.hostname, 'should have hostname set');
          assert.isNumber(rcon.port, 'should have port set');
          assert.isString(rcon.clientNonce, 'should have clientNonce set');
          assert.isString(rcon.serverNonce, 'should have serverNonce set');
          assert.isString(rcon.SID, 'should have SID set');
          done();  
        }
        catch(e) { done(e); }
      }

      rcon.init('fsrcon/init')
        .then(
          // resolved
          test,
          test
        );
    }); // initialize a session


    it('should send a request', function (done) {

      var rcon = new FSRCON.Client({
          hostname: 'localhost',
          port: 3000
        }),
        data;
      
      assert.isFunction(rcon.send);

      data = (function(){var s = ''; for (var i=0; i < 1000000; ++i) {s += i;} return s;}());

      function test (err, result) {
        try {
          assert(!err, 'should not have an error');  
          assert.isString(result, 'result data type');
          assert.equal(JSON.parse(result).foo.data, data);
          done();  
        }
        catch(e) { done(e); }
      }

      rcon.init('fsrcon/init')
        .then(
          function () {
            rcon.send(data, 'public', test);
          },
          test
        );
    }); // should send a request


    it('should establish an authenticated connection', function (done) {

      var accountId = FSRCON.hash('email@domain.tld'),
        rcon = new FSRCON.Client({
          hostname: 'localhost',
          port: 3000,
          accountId: accountId
        }),
        passwordS1 = FSRCON.hash('my secret s0', accountId);
      
      assert.isFunction(rcon.connect);

      function test (err) {
        try {
          assert(!err, 'should not have an error');      
          done();  
        }
        catch(e) { done(e); }
      }      
      
      rcon.init('fsrcon/init')
        .then(
          function () {
            rcon.connect('fsrcon/connect', passwordS1)
              .then(test, test);
          }
        );
    }); // should establish an authenticated connection


    it('should fail authenticated connection', function (done) {

      var accountId = FSRCON.hash('email@domain.tld'),
        rcon = new FSRCON.Client({
          hostname: 'localhost',
          port: 3000,
          accountId: accountId
        }),
        passwordS1 = FSRCON.hash('not my secret s0', accountId);

      function test (err) {
        try {
          assert.instanceOf(err, Error);
          assert.strictEqual(err.message, 'ECLIENTAUTH');
          done();
        }
        catch(e) { done(e); }
      }

      rcon.init('fsrcon/init')
        .then(
          function () {
            rcon.connect('fsrcon/connect', passwordS1)
              .then(
                test, 
                test
              );
          }
        );
    }); // should fail authenticated connection


    it('should send encrypted for authenticated connection', function (done) {

      var accountId = FSRCON.hash('email@domain.tld'),
        rcon = new FSRCON.Client({
          hostname: 'localhost',
          port: 3000,
          accountId: accountId
        }),
        passwordS1 = FSRCON.hash('my secret s0', accountId);

      function test (err, result) {
        try {
          assert(!err, 'should not have an error');      
          assert.strictEqual(result, 'some content', 'result');
          done();  
        }
        catch(e) { done(e); }
      }

      rcon.init('fsrcon/init')
        .then(
          function () {
            rcon.connect('fsrcon/connect', passwordS1)
              .then(
                function () {
                  rcon.send('some content', 'restricted', test);
                },
                test
              );
          }
        );
    }); // should send encrypted


  }); // describe fs-rcon

}); // define