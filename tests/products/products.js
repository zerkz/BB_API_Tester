var helpers     = require(process.cwd() + '/lib/helpers')
  , controller  = require(process.cwd() + '/lib/controller')
  , logger      = require(process.cwd() + '/lib/logger')
  , tests       = require(process.cwd() + '/tests')()
  
////// request setup //////

var testClass = 'products';

// load config values
var config   = helpers.loadJson(__dirname)
  , urls     = config.urls
  , indexUrl = config.indexUrl
  , pdpUrl   = config.pdpUrl

////// exports //////

module.exports = {
  fullTest : fullTest,
  
  //individual
  index    : index,
  pdp      : pdp
}

////// full test set //////

var fullTest = [
  index,
  pdp,
]

////// individual tests //////
  
var index = {
  name       : testClass + '.index',
  dependency : tests.categories.subcategories, 
  exec       : function(error, response, body, callback) {
    // set up request according to settings
    if (helpers.applyConfig(indexUrl)) {
      var url  = indexUrl.url;
      
    } else {
      url = helpers.propFromBody(body, ['categories'], ['href'], controller.random)
    }
    
    // validate request setup
    if (!url) {
      return controller.testFailed(index.name, 'Failed to parse a product index page for navigation', callback);
    }
    
    //make request
    controller.reqAndLog(index.name, {
      uri    : url,
      method : 'GET'
    }, callback);
  }
}

var pdp = {
  name       : testClass + '.pdp',
  dependency : this.index
  exec       : function(error, response, body, callback) {
    // set up request according to settings
    if (helpers.applyConfig(pdpUrl) && !controller.addProduct) {
      var url  = pdpUrl.url;    
    
    } else if (controller.addProduct) {
      url = '/products/' + controller.addProduct
    
    } else {
      url = helpers.propFromBody(body, ['products'], ['href'], controller.random)
    }
    
    // validate request setup
    if (!url) {
      return controller.testFailed(pdp.name, 'Failed to parse a pdp for navigation', callback);
    }
    
    //make request
    controller.reqAndLog(pdp.name, {
      uri    : url,
      method : 'GET',
    }, callback);
  }
}