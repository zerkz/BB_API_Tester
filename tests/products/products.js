var helpers     = require(process.cwd() + '/lib/helpers')
  , controller  = require(process.cwd() + '/lib/controller')
  , logger      = require(process.cwd() + '/lib/logger')
  , tests       = require(process.cwd() + '/tests')()
  
var testClass = 'products';

// load config values
var config   = helpers.loadJson(__dirname)
  , urls     = config.urls
  , indexUrl = config.indexUrl
  , pdpUrl   = config.pdpUrl
  

//
// test a standard suite of requests
//
exports.fullTest = function () {
  //base test set
  var testSet = [
        this.index,
        this.pdp,
      ]
  //
  // only navigate to cats if the user chose to ignore config settings
  // or the config speficied not to use the config index url
  //
  if (!indexUrl.apply || controller.ignoreSettings) {
    testSet.unshift(tests.categories.subcats)
    testSet.unshift(tests.categories.cats)
  }  
  
  controller.execSet(testSet);
}
 
//
// individual requests to be used in both custom and standard test suites
//

//
// show product index page
//   
exports.index = {
  dependencies: [
                  tests.categories.cats, 
                  tests.categories.subcats
                ], 
                
  exec : function(error, response, body, callback) {
    var test = testClass + '.index';
    console.log(' :: ' + test +' ::');
    
    // set up request according to settings
    if (helpers.applyConfig(indexUrl)) {
      var url  = indexUrl.url;
    } else {
      url = helpers.propFromBody(body, ['categories'], ['href'], controller.random)
    }
    
    // validate request setup
    if (!url) {
      logger.testFailed(test, 'Failed to parse a product index page for navigation');
      return callback(null, null, null, null);    
    }
    
    //make request
    controller.reqAndLog(test, {
      uri    : url,
      method : 'GET'
    }, callback);
  }
}

//
// shows a product index page
//
exports.pdp = {
  dependencies: [
                  tests.categories.cats, 
                  tests.categories.subcats, 
                  this.index
                ],
  
  exec : function(error, response, body, callback) {
    var test = testClass + '.pdp';
    console.log(' :: ' + test +' ::');
    
    // set up request according to settings
    if (helpers.applyConfig(pdpUrl)) {
      var url  = pdpUrl.url;    
    } else {
      url = helpers.propFromBody(body, ['products'], ['href'], controller.random)
    }
    
    // validate request setup
    if (!url) {
      logger.testFailed(test, 'Failed to parse a pdp for navigation');
      return callback(null, null, null, null);    
    }
    
    //make request
    controller.reqAndLog(test, {
      uri    : url,
      method : 'GET',
    }, callback);
  }
}