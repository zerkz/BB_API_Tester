var helpers = require(process.cwd() + '/lib/helpers')
  , controller  = require(process.cwd() + '/lib/controller')
  , logger  = require(process.cwd() + '/lib/logger')
  , tests   = require(process.cwd() + '/tests')()


var testClass = 'categories';

// load config values
var config    = helpers.loadJson(__dirname)
  , subcatUrl = config.subcatUrl

//
// test a standard suite of requests
//
exports.fullTest = function () {
  controller.execSet([
    this.cats,
    this.subcats,
  ]);
}
 
//
// individual requests to be used in both custom and standard test suites
//

//
// show categories
//   dependencies:
//     none
//
exports.cats = {
  dependencies : [],
  exec         : function(error, response, body, callback) {
    var test = testClass + '.categories';
    logger.printTitle(test);
    
    controller.reqAndLog(test, {
      uri    : '/categories/',
      method : 'GET'
    }, callback);
  }
}

//
// adds an item to the cart
//
exports.subcats = {
  dependencies : [this.cats],
  exec         : function(error, response, body, callback) {
    return callback(null, error, response, body)
    var test = testClass + '.subcategories';
    logger.printTitle(test);
    
    // set up request according to settings
    if (helpers.applyConfig(subcatUrl)) {
      var url  = subcatUrl.url;
    } else {
      url = helpers.propFromBody(body, ['categories'], ['href'], controller.random)
    }
    
    // validate request setup
    if (!url) {
      return controller.testFailed(test, 'Failed to parse a subcategory for navigation', callback);
    }
    
    //make request
    controller.reqAndLog(test, {
      uri    : url,
      method : 'GET',
    }, callback);
  }
}