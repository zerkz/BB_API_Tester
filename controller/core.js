//////////////////////////////////////////////////////////////////
//
//  CONTROLLER
//
//     Handles test execution flow, request making, and parameter
//     set execution variables
//
//////////////////////////////////////////////////////////////////

var moment            = require('moment')
  , async             = require('async')
  , _                 = require('lodash')
  , logger            = require(process.cwd() + '/logger/logger')
  , dependencyHandler = require(__dirname + '/dependency_handler')
  , requestHandler    = require(__dirname + '/request_handler')

//////////////////////////////////////////////////////////////////
//
//  MODULE EXPORTS
//
//////////////////////////////////////////////////////////////////


module.exports = {
  execSet    : execSet,
  
  //
  // module globals
  //ignoreSettings = false
  parse      : parse,
  single     : single,
  realCreds  : realCreds,
  addProduct : addProduct,
  random     : random,
  excluded   : excluded,    
  logAll     : logAll,
  coreTests  : coreTests,
  
  
  //
  // manipulation functions
  //
  setPort     : setPort,
  setHost     : setHost,
  
  //
  // early termination functions
  //
  exitWMsg   : exitWMsg,
  testFailed : testFailed,
  
  //
  // helpers
  //
  newTest       : newTest,
  inCoreTestSet : inCoreTestSet,
  shouldLog     : shouldLog, 
  
  //
  // non-core exports
  //
  reqAndLog : requestHandler.reqAndLog
}

//////////////////////////////////////////////////////////////////
//
//  MODULE GLOBALS
//
//////////////////////////////////////////////////////////////////

var ignoreSettings = false
  , parse          = false
  , single         = false
  , realCreds      = false
  , addProduct     = false
  , random         = false
  , logAll         = false
  , coreTests      = []
  , excluded       = []


//////////////////////////////////////////////////////////////////
//
//  MANIPULATION FUNCTIONS
//
//////////////////////////////////////////////////////////////////

function setPort (port) {
  requestHandler.port = port;
}

function setHost (host) {
  requestHandler.host = host;
}

//////////////////////////////////////////////////////////////////
//
//  FLOW CONTROL
//
//////////////////////////////////////////////////////////////////

function execSet (tests, callback) {
  // cache the core test set for logging
  coreTests = _.clone(tests);
  
  async.waterfall([     
      requestHandler.verifyServerStatus,
      initializeTestSet,
      dependencyHandler.session,
      dependencyHandler.cart,
      dependencyHandler.parsing
    ], finalize)
  
  function initializeTestSet (callback) {
    // remove tests that don't fit the schema
    var primedSet = _.map(tests, function (test, index) {
          testObj = test();
          
          if(testObj.hasOwnProperty('exec') && testObj.hasOwnProperty('name')) {
            return test;
          } else {
            logger.printWarning('Test (' + testObj + ') does not fit the schema, and was removed\n');
          }
        })
    
    // set up the dependency handler
    return dependencyHandler.init(tests, callback);
  } 
  
  function finalize (error, primedSet) {
    if (error) return onComplete();

    // wrap the tests
    primedSet = _.map(primedSet, testWrapper);
    
    // add a primer function to allow all tests to expect the same params
    primedSet.unshift(function (cb) {
      return cb(null, null, {}, '');
    });
    
    // only push the callback if it's valid
    if (callback) {
      primedSet.push(callback);
    }        
    
    //execute the tests
    async.waterfall(primedSet, onComplete)
  }  
}


//
// performs actions before and after teach test
//
function testWrapper (test) {
  var testObj = test();
  
  return function (error, response, body, callback) {
    logger.printTitle(testObj.name);
    
    return testObj.exec(error, response, body, callback);
  }
}

//
// executes on test completion
//
function onComplete (error, prevErr, response, body) {
  if (error) { logger.printError(error); }
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

//////////////////////////////////////////////////////////////////
//
//  HELPERS
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

function inCoreTestSet (test) {
  var result = false;

  _.each(coreTests, function (coreTest) {
    if (coreTest().name.toLowerCase().indexOf(test.name.toLowerCase()) >= 0) {
      result = true;
    }
  })
  
  return result;
}

function shouldLog (testName) {
  return (this.logAll || inCoreTestSet(testName));
}
