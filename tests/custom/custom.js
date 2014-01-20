var helpers = require(process.cwd() + '/lib/helpers')
  , controller  = require(process.cwd() + '/lib/controller')
  , logger  = require(process.cwd() + '/lib/logger')
  , tests   = require(process.cwd() + '/tests')()
  
var testClass = 'custom';
  
//
// load config values
//
var config      = helpers.loadJson(__dirname)
  , exampleUrl  = config.exampleUrl

//
// test a standard suite of requests to test this class of operations
//
exports.fullTest = function () {
  var testSet = []
  //
  // the following are only added if the test is not set to use the config
  //
  if (!exampleUrl.apply || controller.ignoreSettings) {
    testSet(controller.addWithDependencies(testSet, this.example))
  } else {
    testSet.push(this.example);
  }
  
  controller.execSet(testSet)
}

//
// example of a test object
//
exports.example = {
  //
  // the name is used for loggin and debugging
  //
  name : testClass + '.example',
  
  // Dependencies identify the tests which must be run before this one, if parsing is used
  // Dependencies are used if the command line arg's identify this individual test should be run
  // with the tester set to parse as opposed to using the config. If the config is used, dependencies
  // are ignored
  //
  dependencies: [
                  tests.categories.cats, 
                  tests.categories.subcats, 
                  tests.products.index
                ],
  //
  // The following is the function executed when it is found in the testSet
  // This function MUST exist with this name
  //
  exec : function (error, response, body, callback) {
    logger.printTitle(exports.example.name);
    
    // set up request according to settings
    if (helpers.applyConfig(exampleUrl)) {
      var url  = exampleUrl.url;    
    } else {
      url = helpers.propFromBody(body, ['arrayProp'], ['linkProp'], controller.random)
    }
    
    // validate request setup
    if (!url) {
      controller.testFailed(exports.example.name, 'Failed to parse an example url for navigation', callback);
    }
    
    //make request
    controller.reqAndLog(exports.example.name, {
      uri    : url,
      method : 'GET',
    }, callback);
  }
}
