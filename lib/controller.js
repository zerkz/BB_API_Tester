//////////////////////////////////////////////////////////////////
//
//  CONTROLLER
//
//     Handles test execution flow, request making, and parameter
//     set execution variables
//
//////////////////////////////////////////////////////////////////

var moment  = require('moment')
  , async   = require('async')
  , _       = require('lodash')
  , logger  = require(__dirname + '/logger')
  , helpers = require(process.cwd() + '/lib/helpers')
  // , tests   = require(process.cwd() + '/tests')()
  , request = require('request').defaults({ 
      jar : true, 
      followAllRedirects : true, 
      headers : {
        "Accept": "application/json"
      }
    })


//////////////////////////////////////////////////////////////////
//
//  MODULE GLOBALS
//
//////////////////////////////////////////////////////////////////


exports.host           = null
exports.useElement     = 0;
exports.ignoreSettings = false;
exports.parse          = false;
exports.single         = false;
exports.realCreds      = false;



//////////////////////////////////////////////////////////////////
//
//  FLOW CONTROL
//
//////////////////////////////////////////////////////////////////

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
        return logger.printWarning('Test (' + test + ') was removed, no exec function was found\n');
      }
      return test['exec'];
    }));
    
    //add a primer function to allow all tests to expect the same params
    tests.unshift(function (cb) {
      return cb(null, null, null, null);
    });
    
    // only push the callback if it's valid
    if (callback) {
      tests.push(callback);
    }        
    async.waterfall(tests, onComplete);
  })
}

//
// executes on test completion
//
function onComplete (error, prevErr, response, body) {
  logger.setComplete();
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
// checks if items are in the cart. if they aren't the add to cart testset is added
//
exports.verifyCartContent = function (testSet, callback) {
  var tests = require(process.cwd() + '/tests')()
  
  // make sure an item is in the cart
  exports.getBodyFromReq(tests.cart.show, function (error, body){
    if (error) return;
        
    var result = null
    
    if (body && body.length) {
      var products = helpers.getPropterty(body, ['products'], exports.random);
      
      // if there isn't an item in the cart, add it
      if ((products && !products.length) || !products) {
        testSet = exports.addWithDependencies('cart', 'add', testSet);
      }
    } else {
      testSet = exports.addWithDependencies('cart', 'add', testSet);
    }
    
    return callback(testSet);
  });
}

//////////////////////////////////////////////////////////////////
//
//  REQUEST FUNCTIONS
//
//////////////////////////////////////////////////////////////////

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
        error : {}
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
  
  logger.printDetails(req);
  
  //
  // make the request and log the result
  //
  request(req, function (error, response, body) {
    if (error) {
      test.response.error = error;
      logger.printWarning(error, true);
      
    } else {
      test.response.status = response.statusCode;
      
      var json = helpers.parseJson(body)
      test.response.body = json.error ? {result:json.json} : json;
      
      if (response.statusCode !== 200) {
        test.response.error = test.response.body
      }
    }
    
    
    logger.pushTest(test);
    
    return callback(error, error, response, body);
  });
}

//
// makes a single request, returning the body
//
exports.getBodyFromReq = function (test, callback) {
  test.exec(null, null, null, function (error, resError, response, resBody) {
    error = error || resError || null;
    return callback(error, resBody);
  });
}



//////////////////////////////////////////////////////////////////
//
//  MID TEST CONTROL FUNCTIONS
//
//////////////////////////////////////////////////////////////////


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



//////////////////////////////////////////////////////////////////
//
//  UTILITIES
//
//////////////////////////////////////////////////////////////////

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
// prepends the dependencies for the test
//
exports.addWithDependencies = function addWithDependencies (testClass, test, testSet) {  
  var tests = require(process.cwd() + '/tests')();
  
  if(tests[testClass][test].hasOwnProperty('dependencies')) {
    testSet.unshift(tests[testClass][test])
    testSet = (tests[testClass][test].dependencies).concat(testSet);
    
    return testSet
  }
}