var moment  = require('moment')
  , async   = require('async')
  , _       = require('lodash')
  , logger  = require(__dirname + '/logger')
  , helpers = require(process.cwd() + '/lib/helpers')
  , request = require('request').defaults({ 
      jar : true, 
      followAllRedirects : true, 
      headers : {
        "Accept": "application/json"
      }
    })
  

// ------------------------------------
// controller
//
// Holds the core functions for testing
// -------------------------------------


exports.host           = null
exports.useElement     = 0;
exports.ignoreSettings = false;
exports.parse          = false;
exports.single         = false;

//
// execute a list of tests using async
//
exports.execSet = function (tests, callback) {
  request({
    uri: 'http://' + this.host
  }, function (error, response, body) {
    if (error && error.code == 'ECONNREFUSED') { 
      console.log('\nERROR: No Response from ' + this.host + '\n')
      return;
    }
    
    tests = _.compact(_.map(tests, function (test, index) {
      if(!test.hasOwnProperty('exec')) {
        console.log('\nWARNING: Test' + test + ' was removed, no exec function was found\n')
        return;
      }
      return test['exec'];
    }));
    
    //add a primer function to allow all tests to expect the same params
    tests.unshift(function (cb) {
      return cb(null, null, null, null);
    });
        
    async.waterfall(tests, callback);
  })
}


//
// submits a simplified request and logs the result to log.txt
//
exports.reqAndLog = function (title, req, callback, secure) {
  //
  // set up the test for logging
  //
  var protocol = 'http' + (secure ? 's' : '')
    , test     = {
        name     : title.toUpperCase(),
        method   : req.method,
        route    : req.uri,
        request  : {
          protocol : protocol,
          form     : req.form || {},
          query    : req.qs   || {}
        },
        response : {
          body: {},
          error: {}
        },
        error : {
          message: null
        }
      };
  
  //
  // construct url
  //
  req.uri = protocol + '://' + this.host + ':' + this.port + req.uri
  
  //
  //make the request and log the result
  //
  request(req, function (error, response, body) {
    if (error) {
      test.response.error = error;
      
    } else {
      test.response.status = response.statusCode;
      test.response.body = helpers.parseJson(body);
    }
    
    logger.pushTest(test);
    
    return callback(error, error, response, body);
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