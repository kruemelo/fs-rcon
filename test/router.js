var bodyParser = require('body-parser'),
  FSRCON = require('../fs-rcon.js'),
  connections = {},
  accounts = {};

function addAccountsTo (accounts) {
  var accountId = FSRCON.hash('email@domain.tld');
  accounts[accountId] = {
    password: FSRCON.hash('my secret s0', accountId)
  };
}

addAccountsTo(accounts);

module.exports = function(server){

  server.use(bodyParser.json({limit: '6mb'})); // for parsing application/json

  server.use(function (req, res, next) {
    console.log('express server', req.url);
    next();
  });

  server.post('/fsrcon/init', function (req, res){

    var clientNonce = req.body && req.body.CN ? req.body.CN : undefined,
      clientAccountKey =  req.body && req.body.CAK ? req.body.CAK : undefined,
      rcon = new FSRCON.Server();

    rcon.init({
      clientNonce: clientNonce,
      clientAccountKey: clientAccountKey
    }, function (err) {

      if (err) {
        res.status(500).end(err.message);
        return;        
      }

      connections[rcon.SID] = rcon;

      res.end(JSON.stringify({
        SN: rcon.serverNonce
      }));
      
    });

  });


  server.use(function (req, res, next) {

    var reqSID = req.body && req.body.SID ? req.body.SID : undefined,
      rcon = connections[reqSID];

    if (!rcon) {
      res.status(500).end('ECON');
      return;
    }

    req.fsrcon = rcon;

    next();

  });


  server.post('/fsrcon/connect', function (req, res) {

    var rcon = req.fsrcon;

    if (!rcon || !req.body) {
      res.status(500).end('ECON');
      return;      
    }

    rcon.connect(
      {
        accounts: accounts,
        clientHashedPassword: req.body.CHP,
        clientVerificationKey: req.body.CVK,
        options: req.body.options
      }, 
      function (err) {     
        if (err) {
          res.status(403).end();
          return;
        }
        res.json({STR: rcon.serverVerification});
      }
    );
  });

      
  server.post('/restricted', function (req, res) {
    
    var rcon = req.fsrcon,
      decrypted;

    if (!rcon || !rcon.clientOK) {
      res.status(403).end();
      return;
    }

    decrypted = FSRCON.decrypt(req.body.data, rcon.serverHashedPassword);

    res.end(FSRCON.encrypt(
      decrypted,  
      rcon.serverHashedPassword
    ));

  });

  server.use(function (req, res) {
    if (!res.headersSent) {
      res.json({some: 42, foo: req.body});        
    }
  });

};