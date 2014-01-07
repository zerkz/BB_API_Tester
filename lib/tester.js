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


exports.host           = 'localhost:4000'
exports.useElement     = 0;
exports.ignoreSettings = false;
exports.parse          = false;

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
  //
  // perform initial logging
  //
  var form = req.form ? '\n' + JSON.stringify(req.form, null, '  ') : 'None'
  
  logger.headingBlock({
    test  : title.toUpperCase(),
    route : req.method + ' ' + req.uri
  });
  
  logger.requestBlock({
    form : form,
    query: req.qs
  });
  
  //
  // construct url
  //
  var protocol = 'http' + (secure ? 's' : '') + '://'
  req.uri = protocol + this.host + req.uri
  
  //
  //make the request and log the result
  //
  request(req, function (error, response, body) {
    if (error) return logger.error(error, callback);
    if(response.statusCode == 404) return logger.error('ERROR: 404 on page: ' + req.uri, callback);
      
    //
    // log the result
    //
    logger.responseBlock({
      body   : body,
      status : response.statusCode 
    });
    
    return callback(null, error, response, body);
  });
}

//
// sets the following tests to ignore/apply config settings
//
exports.setIgnoreSettings = function () {
  this.ignoreSettings = true;
}
exports.applySettings = function () {
  this.ignoreSettings = false;
}

//
// sets the following tests to use/not use randomly parsed elements
//
exports.useRandom = function () {
  this.useElement = -1;
}
exports.useFixedElement = function (elementNum) {
  this.useElement = elementNum || 0;
}

