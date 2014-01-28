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
  , utils   = require(process.cwd() + '/lib/testUtilities')
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
  port              : port,
  ignoreSettings    : ignoreSettings,
  parse             : parse,
  single            : single,
  realCreds         : realCreds,
  addProduct        : addProduct,
  random            : random,
  
  //
  // flow control
  //
  execSet            : execSet,
  onComplete         : onComplete,
  exitWMsg           : exitWMsg,
  testFailed         : testFailed,
  verifyCartContent  : verifyCartContent,
  fillInDependencies : fillInDependencies,
  
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

var host           = 'localhost'
  , port           = '4000'
  , ignoreSettings = false
  , parse          = false
  , single         = false
  , realCreds      = false
  , addProduct     = false
  , random         = false


//////////////////////////////////////////////////////////////////
//
//  FLOW CONTROL
//
//////////////////////////////////////////////////////////////////

//
// execute a list of tests using async
//
function execSet (tests, callback) { 
  var req = {
    uri    : 'http://' + host + ':' + port,
    method : 'GET'
  }
  logger.printTitle('pinging server');
  logger.printDetails(req);
  
  request(req, function (error, response, body) {
    if (error || (body && body.error && body.error.code == 'ECONNREFUSED')) {
      errorOut('the request returned an error, verify that it\'s active');
    }
    
    // remove tests that don't fit the schema
    var primedSet = _.map(tests, function (test, index) {
      testObj = test();
      
      if(testObj.hasOwnProperty('exec') && testObj.hasOwnProperty('name')) {
        return test;
      } else {
        logger.printWarning('Test (' + testObj + ') does not fit the schema, and was removed\n');
      }
    })
    
    primedSet = fillInDependencies(primedSet);
    
    var sessionMet      = false
      , sessionRequired = false
      , cartMet         = false
      , cartRequired    = false;
      
    // add cart and session dependencies if needed
    _.each(primedSet, function (test, index) {
      testObj = test();
      
      if (/session.login/i.test(testObj.name)) sessionMet = true;
      if (/cart.add/i.test(testObj.name)) cartMet = true;
      
      if (testObj.cartDependant) cartRequired = true;
      if (testObj.sessionDependant) sessionRequired = true;
    });
    if (sessionRequired && !sessionMet) tests.unshift(tests.session.login());    
    if (cartRequired && !cartMet) {
      verifyCartContent(tests, finalize);
    } else {
      finalize(tests)
    }
    
    
    function finalize (primedSet) {
      //wrap the tests
      primedSet = _.map(primedSet, testWrapper);
      
      //add a primer function to allow all tests to expect the same params
      primedSet.unshift(function (cb) {
        return cb(null, null, null, null);
      });
      
      // only push the callback if it's valid
      if (callback) {
        primedSet.push(callback);
      }        
      
      async.waterfall(primedSet, onComplete)
    }
  })
}

//
// performs actions before and after teach test
//
function testWrapper (test) {
  var testObj = test();
  console.log('wrapped test: ' + testObj.name)
  
  return function (error, response, body, callback) {
    logger.printTitle(testObj.name);
    
    return testObj.exec(error, response, body, callback);
  }
}

//
// executes on test completion
//
function onComplete (error, prevErr, response, body) {
  logger.setComplete();
  process.kill();
}

//
// prints error and exits
//
function errorOut (message) {
  logger.printError(message);
  onComplete();
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
  var test = newTest();
  
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
  var tests   = require(process.cwd() + '/tests')()
    , fullAdd = false
  
  if (addProduct) {
    testSet.unshift(tests.cart.add());
    testSet.unshift(tests.products.pdp());
    return callback(testSet);
  }
  
  logger.printTitle('checking for cart content')
  // make sure an item is in the cart
  getBodyFromReq(tests.cart.show(), function (error, body){
    if (error) return;
        
    var result = null
    
    if (body && body.length) {
      var products = utils.getProperty(body, ['products'], random);
      
      // if there isn't an item in the cart, add it
      if ((products && !products.length) || !products) {
        fullAdd = true;
      }
    } else {
      fullAdd = true;
    }
    
    if (fullAdd) {
      logger.printNotification('No items in the cart. Cart add will be executed')
      testSet = addWithDependencies(function(){return {}}, tests.cart.add, []).concat(testSet);
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
  req.uri = protocol + '://' + host + ':' + port + req.uri
  
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
      
      var json = utils.parseJson(body)
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
function fillInDependencies (set) { 
  var newSet = [];
  
  _.each(set, function (test, index) {
    var preceding = index > 0 ? set[index-1] : function(){return {}};
    newSet = addWithDependencies(preceding, test, newSet);
  })
  return newSet;
}

function addWithDependencies (preceding, current, set) {
  var dependencies = getDependencySet(preceding, current)
  
  set = set.concat(dependencies)
  set.push(current);
  return set
}

//
// adds dependencies, unless the dependency is met by the preceding test
//
function getDependencySet (preceding, current, testCluster) {
  if (!testCluster) testCluster = [];
  
  var preTest = preceding();
  var curTest = current();
    
  // return if there aren't dependencies, or the dependency is equal to the preceding
  if (!curTest.dependency || curTest.dependency === preTest) {
    return testCluster;
  
  // otherwise, add the dependency to the set
  } else{
    testCluster.unshift(curTest.dependency);
    return getDependencySet(current, curTest.dependency, testCluster);
  }
}