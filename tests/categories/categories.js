var helpers = require(process.cwd() + '/lib/helpers')
  , controller  = require(process.cwd() + '/lib/controller')
  , logger  = require(process.cwd() + '/lib/logger')
  , tests   = require(process.cwd() + '/tests')()

////// request setup //////

var testClass = 'categories';

// load config values
var config    = helpers.loadJson(__dirname)
  , subcatUrl = config.subcatUrl
  
////// exports //////

module.exports = {
  fullTest      : fullTest,
  
  // individual
  categories    : categories,
  subcategories : subcategories
}

////// full test set //////

var fullTest = [this.subcategories];
  
////// individual tests //////

var categories = {
  name       : testClass + '.categories',
  exec       : function(error, response, body, callback) {
    controller.reqAndLog(categories.name, {
      uri    : '/categories/',
      method : 'GET'
    }, callback);
  }
}

var subcategories = {
  name       : testClass + '.subcategories',
  dependency : this.categories,
  exec       : function(error, response, body, callback) {    
    // set up request according to settings
    if (helpers.applyConfig(subcatUrl)) {
      var url  = subcatUrl.url;
    } else {
      url = helpers.propFromBody(body, ['categories'], ['href'], controller.random)
    }
    
    // validate request setup
    if (!url) {
      return controller.testFailed(subcategories.name, 'Failed to parse a subcategory for navigation', callback);
    }
    
    //make request
    controller.reqAndLog(subcategories.name, {
      uri    : url,
      method : 'GET',
    }, callback);
  }
}