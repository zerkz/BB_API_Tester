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
  , request = require('request').defaults({ 
      jar : true, 
      followAllRedirects : true, 
      headers : {
        "Accept": "application/json"
      }
    })


//////////////////////////////////////////////////////////////////
//
//  MODULE EXPORTS
//
//////////////////////////////////////////////////////////////////


module.exports = {
  //
  // module globals
  //
  host              : host,
  ignoreSettings    : ignoreSettings,
  parse             : parse,
  single            : single,
  realCreds         : realCreds,
  addProduct        : addProduct,
  random            : random.
  
  //
  // flow control
  //
  execSet           : execSet,
  onComplete        : onComplete,
  exitWMsg          : exitWMsg,
  testFailed        : testFailed,
  verifyCartContent : verifyCartContent,
  
  //
  // request functions
  //
  reqAndLog         : reqAndLog,
  getBodyFromReq    : getBodyFromReq,
}

//////////////////////////////////////////////////////////////////
//
//  MODULE GLOBALS
//
//////////////////////////////////////////////////////////////////

var host           = null,
var ignoreSettings = false,
var parse          = false,
var single         = false,
var realCreds      = false,
var addProduct     = false,
var random         = false.


//////////////////////////////////////////////////////////////////
//
//  FLOW CONTROL
//
//////////////////////////////////////////////////////////////////

//
// execute a list of tests using async
//
function execSet (tests, callback) {  
  request({
    uri: 'http://' + this.host + ':' + this.port
  }, function (error, response, body) {
    if (error) {
      logger.printError('the server returned an error, verify that it\'s active');
      return onComplete()
    }
    
    if (body && body.error && body.error.code == 'ECONNREFUSED') { 
      logger.printError('No Response from ' + this.host);
      return onComplete();
    }
    
    tests = fillInDependencies(tests);
    
    tests = _.compact(_.map(tests, function (test, index) {
      if(!test.hasOwnProperty('exec')) {
        logger.printWarning('Test (' + test + ') was removed, no exec function was found\n');
        return onComplete();
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
  process.kill();
}

//
// prints the message and exits with the status
//
function exitWMsg (string, status) {
  console.log(string);
  process.exit(status);
}

//
// logs the error and moves on to the next test
//
function testFailed (name, error, callback) {
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
function verifyCartContent (testSet, callback) {  
  var tests = require(process.cwd() + '/tests')()
  
  if (addProduct) {
    testSet.unshift(tests.cart.add);
    testSet.unshift(tests.products.pdp);
    return callback(testSet);
  }
  
  // make sure an item is in the cart
  getBodyFromReq(tests.cart.show, function (error, body){
    if (error) return;
        
    var result = null
    
    if (body && body.length) {
      var products = helpers.getProperty(body, ['products'], random);
      
      // if there isn't an item in the cart, add it
      if ((products && !products.length) || !products) {
        testSet = addWithDependencies('cart', 'add', testSet);
      }
    } else {
      testSet = addWithDependencies('cart', 'add', testSet);
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
function reqAndLog (title, req, callback, secure) {  
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
function getBodyFromReq (test, callback) {
  test.exec(null, null, null, function (error, resError, response, resBody) {
    error = error || resError || null;
    return callback(error, resBody);
  });
}

//////////////////////////////////////////////////////////////////
//
//  UTILITIES
//
//////////////////////////////////////////////////////////////////

//
// returns an empty test (avoids pointer issues)
//
function newTest () {
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
// iterates through and adds the dependencies missing from the testset
//
function fillInDecpendencies (set) { 
  var newSet = [];
  
  _.each(set, function (test, index) {
    var preceding = index > 0 ? set[index-1] : null;
    addWithDependencies(preceding, test, newSet);
  })
  return newSet;
}

function addWithDependencies (preceding, current, set) {
  var dependencies = getDependencySet(preceding, current)
  
  set.concat(dependencies);
  set.push(current);
}

//
// adds dependencies, unless the dependency is met by the preceding test
//
function getDependencySet (preceding, current, testcluster) {
  if (!testCluster) testCluster = [];
    
  // return if there aren't dependencies, or the dependency is equal to the preceding
  if (!current.dependency || current.dependency === preceding) {
    return testCluster;
  
  // otherwise, add the dependency to the set
  } else{
    testCluster.push(current.dependency);
    return getDependencySet(current, current.dependency, testCluster);
  }
}