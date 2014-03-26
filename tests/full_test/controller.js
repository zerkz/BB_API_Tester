var helpers    = require(process.cwd() + '/lib/helpers')
  , controller = require(process.cwd() + '/controller')
  , logger     = require(process.cwd() + '/logger/logger')
  , tests      = require(process.cwd() + '/tests')()
  , utils      = require(process.cwd() + '/lib/testUtilities')
  , _          = require('lodash');
  

// tests a large portion of site functionality
exports.fullTest = function () {
  var testControllers = [
        // core nav/chekout functionality
        tests.cart,
        tests.checkout,
        
        // account functionality
        tests.session
      ]
    , testArray = _.map(_.flattten(testControllers), function (controller) {
      return controller.fullTest();
    })
  
  
  return testArray;
}