//////////////////////////////////////////////////////////////////
//
//  REQUEST HANDLER
//
//     utilities to fascilitate requests to the server
//
//////////////////////////////////////////////////////////////////

var logger  = require(process.cwd() + '/logger/logger')
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
  host    : host,
  port    : port,
  
  //
  // request functions
  //
  verifyServerStatus : verifyServerStatus,
  getBodyFromReq     : getBodyFromReq,

  // core request function
  reqAndLog          : reqAndLog
}

//////////////////////////////////////////////////////////////////
//
//  MODULE GLOBALS
//
//////////////////////////////////////////////////////////////////

var port = '4000'
  , host = 'localhost'


//////////////////////////////////////////////////////////////////
//
//  CORE FUNCTIONS
//
//////////////////////////////////////////////////////////////////

//
// ping the server
//
function verifyServerStatus (callback) {  
  request({
        uri    : 'http://' + host + ':' + port,
        method : 'GET'
      }, function (error, response, body) {
    if (error || (body && body.error && body.error.code == 'ECONNREFUSED')) {
      errorOut('the request returned an error, verify that the server is active');
      return callback(true);
    }
    return callback();
  })    
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



// submits a simplified request and logs the result to log.txt
function reqAndLog (title, path, options, callback, secure) {  
  var core = require(__dirname + '/core');
  options = options || {};

  // if no method is determined, make a GET request, unless there is a form. then use a POST
  if (!options.method) {
    options.method = options.form ? 'POST' : 'GET';
  } 

  //
  // set up the test for logging
  //
  var protocol = 'http' + (secure ? 's' : '')
    , test     = {
        name     : title.toUpperCase(),
        method   : options.method,
        route    : path,
        request  : {
          protocol : protocol,
          form     : options.form || {},
          query    : options.qs   || {}
        },
        response : {
          body: {},
          error: {}
        },
        error : {}
      };
      
  if (!(path) || (options.form && typeof options.form !== 'object') || (options.qs && typeof options.qs !== 'object')) {
    test.error.message = 'There was an issue in the request form, verify that it is being parsed correcty ("STUB" will throw this error)'
    logger.pushTest(test);
    logger.printError(test.error.message);
    return callback(test.error, {}, {}, {});
  }
  
  //
  // construct url
  //
  options.uri = protocol + '://' + host + ':' + port + path
  
  logger.printDetails(options);
  
  //
  // make the request and log the result
  //
  request(options, function (error, response, body) {
    if (error) {
      test.response.error = error;
      logger.printWarning(error, true);
      
    } else {
      test.response.status = response.statusCode;
      
      var json = utils.parseJson(body)
      test.response.body = json.error && json.json ? {result:json.json} : json;
      
      if (response.statusCode !== 200 || test.response.body.error) {
        test.response.error = test.response.body
      }
    }
    
    if(core.shouldLog(test)) {
      logger.pushTest(test);
    }
    
    return callback(error, error, response, body);
  });
}

function errorOut (message) {
  logger.printError(message);
  logger.setComplete();
  process.kill();
}
