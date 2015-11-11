//Optional router that can be specified if your tests require back-end interaction.

module.exports = function(server){

  var bodyParser = require('body-parser'),
    FSRCON = require('../fs-rcon.js'),
    connections = {};

  server.use(bodyParser.json({limit: '6mb'})); // for parsing application/json

  server.post('/test', function (req, res) {

    var reqSID = req.body && req.body.SID ? req.body.SID : undefined,
      rcon = connections[reqSID];

    if (!rcon) {
      res.status(500).end('ECON');
      return;
    }

    res.json({some: 42, foo: req.body});

  });

  server.post('/init', function (req, res){

    var clientRandomKey = req.body && req.body.CRK ? req.body.CRK : undefined,
      rcon = new FSRCON();

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
};