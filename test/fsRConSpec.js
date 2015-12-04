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


    it('should hash a value', function () {
      assert.isFunction(FSRCON.hash);
      assert.strictEqual(
        FSRCON.hash('0.1234'), 
        '56KwnzFuvBUaqvqhFkG46Psj0bUIz9LiMGy7dgZPt+DF/8wj5t/pkBPp+6FDUvZF2iOu+E2uCkgotDmtHAo6JA==',
        'should hash a string'
      );
    });


    it('should generate a random key', function () {
      assert.isFunction(FSRCON.randomKey);
      assert.isString(FSRCON.randomKey());
    });


    it('should get account key', function () {

      var accountId = FSRCON.hash('email@domain.tld'),
        //FSRCON.randomKey();
        randomKey = 'cjyYImOHtla2Di8cdt4I61LVCYl1ovKzfbwM6BzRxa5+cT9qp7HEvA7DlohjEYVpy5ynPrWXkTktIidtNkVxUg==';

      assert.isFunction(FSRCON.accountKey, 'account key fn');
      assert.strictEqual(
        FSRCON.accountKey(accountId, randomKey), 
        'TMofT9cD/zdHL/q5W04xN+2d8JGGPK0nsufJPYKZc/PEYzpu4Gc3Wqk0wQIypXyZkXoE+bJxHxb+Ti2zdWgQJw==', 
        'account key value'
      );

    });


    it('should generate a session id from keys', function () {
      assert.isFunction(FSRCON.sid);
      assert.isString(FSRCON.sid(FSRCON.randomKey(), FSRCON.randomKey()));
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
          assert.isString(rcon.clientRandomKey, 'should have clientRandomKey set');
          assert.isString(rcon.serverRandomKey, 'should have serverRandomKey set');
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

    });


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

    });


    it('should establish an authenticated connection', function (done) {

      var accountId = FSRCON.hash('email@domain.tld'),
        rcon = new FSRCON.Client({
          hostname: 'localhost',
          port: 3000,
          accountId: accountId
        });
      
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
            rcon.connect('fsrcon/connect', 'my secret s0')
              .then(test, test);
          }
        );
    });


    it('should not establish an authenticated connection', function (done) {

      var accountId = FSRCON.hash('email@domain.tld'),
        rcon = new FSRCON.Client({
          hostname: 'localhost',
          port: 3000,
          accountId: accountId
        });
      
      assert.isFunction(rcon.connect);

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
            rcon.connect('fsrcon/connect', 'not my secret s0')
              .then(
                test, 
                test
              );
          }
        );
    });

    it('should send encrypted for authenticated connection', function (done) {

      var accountId = FSRCON.hash('email@domain.tld'),
        rcon = new FSRCON.Client({
          hostname: 'localhost',
          port: 3000,
          accountId: accountId
        });

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
            rcon.connect('fsrcon/connect', 'my secret s0')
              .then(
                function () {
                  rcon.send('some content', 'restricted', test);
                },
                test
              );
          }
        );

    });
  }); // describe fs-rcon

}); // define