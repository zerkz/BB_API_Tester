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
  name : testClass + '.index',
  dependencies: [
                  tests.categories.cats, 
                  tests.categories.subcats
                ], 
                
  exec : function(error, response, body, callback) {
    logger.printTitle(exports.index.name);
    
    // set up request according to settings
    if (helpers.applyConfig(indexUrl)) {
      var url  = indexUrl.url;
    } else {
      url = helpers.propFromBody(body, ['categories'], ['href'], controller.random)
    }
    
    // validate request setup
    if (!url) {
      return controller.testFailed(exports.index.name, 'Failed to parse a product index page for navigation', callback);
    }
    
    //make request
    controller.reqAndLog(exports.index.name, {
      uri    : url,
      method : 'GET'
    }, callback);
  }
}

//
// shows a product index page
//
exports.pdp = {
  name : testClass + '.pdp',
  dependencies: [
                  tests.categories.cats, 
                  tests.categories.subcats, 
                  this.index
                ],
  
  exec : function(error, response, body, callback) {
    logger.printTitle(exports.pdp.name);
    
    // set up request according to settings
    if (helpers.applyConfig(pdpUrl)) {
      var url  = pdpUrl.url;    
    } else {
      url = helpers.propFromBody(body, ['products'], ['href'], controller.random)
    }
    
    // validate request setup
    if (!url) {
      return controller.testFailed(exports.pdp.name, 'Failed to parse a pdp for navigation', callback);
    }
    
    //make request
    controller.reqAndLog(exports.pdp.name, {
      uri    : url,
      method : 'GET',
    }, callback);
  }
}