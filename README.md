A connection to remote fs

github: https://github.com/kruemelo/fs-rcon.git
npm: https://www.npmjs.com/package/fs-rcon

API
---

### Instance methods

#### FSRPC.Client

create a client instance

```
var rcon = new FSRPC.Client()
```

#### Client.init(options, callback)

initialize a connection to remote server

```
var rcon = new FSRPC.Client(),
  options = {
    protocol: 'http',
    hostname: 'localhost',
    port: 3000
  };

rcon.init(options, function (err){
  ..
});
```

#### Client.send(data, urlPathname, callback)

send data to remote server. init() must be called before send().

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

#### FSRCON.Server()

create a server instance

```
 var rcon = FSRCON.Server();
```

#### Server.connect(clientRandomKey)

connect to a client when `Client.init()` was received.

```
var connections = {};

server.post('/init', function (req, res){

  var clientRandomKey = req.body && req.body.CRK ? req.body.CRK : undefined,
    rcon = FSRCON.Server();

  rcon.connect({
    clientRandomKey: clientRandomKey
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

#### Server instance fields

* clientRandomKey
* serverRandomKey
* SID

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
FSRCON.encrypt(
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
  var connection = window.FSRCON.Client();
  ..
</script>
```

Server:

```
var FSRCON = require('fs-rcon'),
  connection = FSRCON.Server();
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
