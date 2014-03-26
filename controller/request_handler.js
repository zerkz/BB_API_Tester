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
  host : host,
  port : port,
  
  //
  // request functions
  //
  verifyServerStatus : verifyServerStatus,
  getBodyFromReq     : getBodyFromReq,
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
      errorOut('the request returned an error, verify that it\'s active');
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

//
// submits a simplified request and logs the result to log.txt
//
function reqAndLog (title, req, callback, secure) {  
  var core = require(__dirname + '/core')
  
  //if its a form object from the body, translate it to be used in express
  if (req.action && req.method && req.inputs) {
    req = {
      uri    : req.action,
      method : req.method,
      form   : req.inputs
    }
  }
  
  //
  // set up the test for logging
  //
  var protocol = 'http' + (secure ? 's' : '')
  var test = core.buildTestObj({
        name     : title.toUpperCase(),
        method   : req.method,
        route    : req.uri,
        request  : {
          protocol : protocol,
          form     : req.form,
          query    : req.qs
        }
      });
      
      
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
    
    // if the params are set to min, and the test is not primary, ignore it
    if (!core.minLog || test.primaryTest) {
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