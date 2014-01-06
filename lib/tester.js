var moment  = require('moment')
  , async   = require('async')
  , _       = require('lodash')
  , logger  = require(__dirname + '/logger')
  , request = require('request').defaults({ 
      jar : true, 
      followAllRedirects : true, 
      headers : {
        "Accept": "application/json"
      }
    })
  

// ------------------------------------
// Tester
//
// Holds the core functions for testing
// -------------------------------------


exports.host = 'localhost:4000'

//
// execute a list of tests using async
//
exports.execSet = function (tests, callback) {
  //add a primer function to allow all tests to expect the same params
  tests.unshift(function (cb) {
    return cb(null, null, null, null);
  });
  
  async.waterfall(tests, callback);
}


//
// submits a simplified request and logs the result to log.txt
//
exports.reqAndLog = function (title, req, callback, secure) {
  var form = req.form ? '\n' + JSON.stringify(req.form, null, '  ') : 'None'
  
  logger.log('\n\n:::::::::::::::  ' + title.toUpperCase() + '  :::::::::::::::', true)
  logger.optionalLog('\nRoute: ' + req.method + ' ' + req.uri, true);
  logger.optionalLog('\nForm: ' + form);
  logger.optionalLog('\nQuery: ' + (req.qs || 'None') + '\n');
  
  var protocol = 'http' + (secure ? 's' : '') + '://'
    
  req.uri = protocol + this.host + req.uri
  
  //make the request and log the result
  request(req, function (error, response, body) {
    if (error) return logger.error(error, callback);
    
    
    logger.log('\n :: Response status: ' + response.statusCode + ' ::\n', true);
    logger.log('\n :: Body ::\n' + body);
    
    return callback(null, error, response, body);
  });
}