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
exports.realCreds      = false;

//
// execute a list of tests using async
//
exports.execSet = function (tests, callback) {
  request({
    uri: 'http://' + this.host + ':' + this.port
  }, function (error, response, body) {
    if (error) return logger.printError('the server returned an error, verify that it\'s active');
    
    if (body && body.error && body.error.code == 'ECONNREFUSED') { 
      return logger.printError('No Response from ' + this.host);
    }
    
    tests = _.compact(_.map(tests, function (test, index) {
      if(!test.hasOwnProperty('exec')) {
        return console.log('\nWARNING: Test' + test + ' was removed, no exec function was found\n');
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
// logs the error and moves on to the next test
//
exports.testFailed = function (name, error, callback) {
  var test = this.newTest();
  
  if (typeof error === 'string') {
    error = {
      message: error
    }
  }
  
  test.name  = name.toUpperCase();
  test.error = error; 
  
  logger.pushTest(test);
  
  if (callback) return callback(null, null, null, null);
}

//
// returns an empty test (avoids pointer issues)
//
exports.newTest = function () {
  return {
    name     : null,
    method   : null,
    route    : null,
    request  : {
      protocol : null,
      form     : {},
      query    : {}
    },
    response : {
      status : null,
      body   : {},
      error  : {}
    },
    error : {
      message: null
    }
  };
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
      
  if (!(req && req.uri) || (req.form && typeof req.form !== 'object') || (req.qs && typeof req.qs !== 'object')) {
    test.error.message = 'There was an issue in the request form, verify that it is being parsed correcty ("STUB" will throw this error)'
    logger.pushTest(test);
    logger.printError(test.error.message);
    return callback(test.error, {}, {}, {});
  }
  
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

exports.getBodyFromReq = function (test, callback) {
  test.exec(null, null, null, function (error, resError, response, resBody) {
    error = error || resError || null;
    if(error) {
      console.log(error)
    }
    return callback(error, resBody);
  });
}

//
// prepends the dependencies for the test
//
exports.addWithDependencies = function (testClass, test, testSet) {  
  var tests = require(process.cwd() + '/tests')();
  
  if(tests[testClass][test].hasOwnProperty('dependencies')) {
    testSet.unshift(tests[testClass][test])
    return (tests[testClass][test].dependencies).concat(testSet);
  }
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