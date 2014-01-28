var helpers    = require(process.cwd() + '/lib/helpers')
  , controller = require(process.cwd() + '/lib/controller')
  , logger     = require(process.cwd() + '/lib/logger')
  , tests      = require(process.cwd() + '/tests')()
  , utils      = require(process.cwd() + '/lib/testUtilities');
  
////// request setup //////
  
var testClass = 'custom';
  
//
// load config values
var config      = utils.loadJson(__dirname)
  , exampleUrl  = config.exampleUrl

////// exports //////

module.exports = {
  fullTest : fullTest,
  
  //individual
  example  : example
}

////// full test set //////

// test a standard suite of requests to test this class of operations
function fullTest () {
  return [example];
}
  
////// individual tests //////


//
// example of a test object
//
function example () {
  return {
    
    // (optional) if valid, the dependency is added, recursively until all dependencies are met
    //              - a dependency is generally used if a form or link must be parsed before execution
    dependency : tests.products.index,
    
    // (optional) if true, the cart is checked for value. if the cart is empty, tests will be added to create content
    cartDependant : true,
    
    // (optional) adds a login submission to the beginning of the testset
    reqLogin : true,
    
    // (required) the name used for logging
    name : testClass + 'example',
    
    // (required) the actual test executed
    exec : function (error, response, body, callback) {
      // set up request according to settings
      if (utils.applyConfig(exampleUrl)) {
        var url  = exampleUrl.url;    
      } else {
        url = utils.propFromBody(body, ['arrayProp'], ['linkProp'], controller.random)
      }
      
      // validate request setup
      if (!url) {
        controller.testFailed(example.name, 'Failed to parse an example url for navigation', callback);
      }
      
      //make request
      controller.reqAndLog(example.name, {
        uri    : url,
        method : 'GET',
      }, callback);
    }
  }
}
