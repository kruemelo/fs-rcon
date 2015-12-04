A connection to remote fs

API
---

### Instance methods

#### FSRCON.Client

create a client instance

```
var rcon = new FSRCON.Client({
    protocol: 'http',
    hostname: 'localhost',
    port: 3000,
    // optional: account id
    accountId: 'xyz'  
})
```

#### Client.init(urlPathname)

initialize a connection to remote server. Returns a promise.

```
rcon.init('fsrcon/init')
  .then(
    // resolved
    function () {
      ..
    },  
    // rejected
    function (err) {
      ..
    }
  );
```

#### Client.connect(urlPathname, secret)

start authenticated connection. Returns a promise.

```
var rcon = new FSRCON.Client({
    protocol: 'http',
    hostname: 'localhost',
    port: 3000,
    // required: account id
    accountId: 'xyz'
  });

rcon.init('fsrcon/init')
  .then(
    // resolved
    function () {
      rcon.connect('fsrcon/connect', 'my secret')
        .then(
          function () {
            // authenticated
            ..
          },
          function (err) {
            // authentication failed
            ..
          }
        );
    },  
    // rejected
    function (err) {
      ..
    }
  );
```

#### Client.send(data, urlPathname, callback)

send data to remote server. init() must be called before send().

For authenticated connections data will be sent encrypted.

Returns xhr.

* data: string of data to be sent
* urlPathname: string url path 

```
var xhr = rcon.send(data, 'test', function (err, result) {
  // JSON.parse(result).foo.data
});

xhr.upload.onprogress = function(e) {
  if (e.lengthComputable) {
    console.log('progress: ', (e.loaded / e.total) * 100);
  }
};
```

data will be sent as stringified JSON via POST:

```
{
  SID: <string>,
  data: <string|object>
}
```

#### Client instance fields

* protocol
* hostname
* port
* clientRandomKey
* serverRandomKey
* SID 
* serverOK

#### FSRCON.Server()

create a server instance

```
 var rcon = new FSRCON.Server();
```

#### Server.init(clientRandomKey)

initializes a connection to a client when `Client.init()` was received.

```
var connections = {};

server.post('/init', function (req, res){

  var rcon = FSRCON.Server();

  rcon.init({
    clientRandomKey: req.body && req.body.CRK,
    clientAccountKey: eq.body && req.body.CAK
  }, function (err) {

    if (err) {
      res.status(500).end(err.message);
      return;        
    }

    connections[rcon.SID] = rcon;

    res.end(JSON.stringify({
      SRK: rcon.serverRandomKey
    }));
    
  });

});
```

#### Server.connect(options)

authenticate connection.

```
rcon.connect(
  {
    accounts: accounts,
    clientHashedPassword: req.body.CHP,
    clientVerificationKey: req.body.CVK
  }, 
  function (err, accountId) {     
    if (err) {
      res.status(503).end();
    }
    else {
      res.json({STR: rcon.serverVerification});
    }
  }
);
```


#### Server instance fields

* clientRandomKey
* serverRandomKey
* SID
* clientOK

### Static Methods

#### FSRCON.hash(strVal)

get a base64-encoded SHA-512 fingerprint

```
FSRCON.hash('0.1234')
-> '56KwnzFuvBUaqvqhFkG46Psj0bUIz9LiMGy7dgZPt+DF/8wj5t/pkBPp+6FDUvZF2iOu+E2uCkgotDmtHAo6JA=='
```

#### FSRCON.encrypt(message, secret)

get the AES-encrypted string for message 

```
FSRCON.encrypt('my message', 'my secret')
-> '{"ct":"yX4XfECTghy/Cf8LYwzmOQ==","iv":"01472720a2455c96b297dc9ba68e3cbe","s":"34c58f289265cbfc"}'
```

#### FSRCON.decrypt(encrypted, secret)

get the decrypted string for the AES-encryped message 

```
FSRCON.decrypt(
  '{"ct":"yX4XfECTghy/Cf8LYwzmOQ==","iv":"01472720a2455c96b297dc9ba68e3cbe","s":"34c58f289265cbfc"}', 
  'my secret'
)
-> 'my message'
```

### load

to Browser-DOM (or CommonJS or AMD)

Client:

```
<script src="fs-rcon.js">
<script>
  // DOM
  var connection = new window.FSRCON.Client();
  ..
</script>
```

Server:

```
var FSRCON = require('fs-rcon'),
  connection = new FSRCON.Server();
..
```


Test
----

```
$ grunt test
```

License
-------
MIT
