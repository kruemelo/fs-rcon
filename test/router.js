//Optional router that can be specified if your tests require back-end interaction.

module.exports = function(server){

  var bodyParser = require('body-parser'),
    requirejs = require('requirejs'),
    CryptoJS = requirejs('libs/CryptoJS.js'),
    connections = {};

  server.use(bodyParser.json()); // for parsing application/json

  server.post('/init', function (req, res){

    var connection = {};

    connection.clientRandomKey = req.body && req.body.CRK ? req.body.CRK : undefined;

    if (!connection.clientRandomKey) {
      res.status(500).end('EINVALIDCRK');
      return;
    } 

    connection.serverRandomKey =  CryptoJS.SHA512(String(Math.random()) + String(Math.random()))
      .toString(CryptoJS.enc.Base64);

    connection.SID = CryptoJS.SHA512(connection.clientRandomKey + connection.serverRandomKey)
      .toString(CryptoJS.enc.Base64);

    connections[connection.SID] = connection;

    res.end(JSON.stringify({
      SRK: connection.serverRandomKey
    }));

  });
};