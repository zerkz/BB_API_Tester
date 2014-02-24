var helpers    = require(process.cwd() + '/lib/helpers')
  , controller = require(process.cwd() + '/controller')
  , logger     = require(process.cwd() + '/logger/logger')
  , utils      = require(process.cwd() + '/lib/testUtilities')
  
////// request setup //////

var testClass = 'products';

// load config values
var config       = utils.loadJson(__dirname)
  , urls         = config.urls
  , indexUrl     = config.indexUrl
  , pdpUrl       = config.pdpUrl
  , variationUrl = config.variationUrl

////// exports //////

module.exports = {
  fullTest  : fullTest,
  
  //individual
  index     : index,
  pdp       : pdp,
  variation : variation
}

////// full test set //////

function fullTest () {
  return [
    index,
    pdp,
    variation
  ]
}

////// individual tests //////
  
function index () {
  var tests = require(process.cwd() + '/tests')()
  return {
    name       : testClass + '.index',
    dependency : tests.categories.subcategories, 
    exec       : function(error, response, body, callback) {
      // set up request according to settings
      if (utils.applyConfig(indexUrl)) {
        var url  = indexUrl.url;
        
      } else {
        url = utils.propFromBody(body, ['categories'], ['href'], controller.random)
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
}

function pdp () {
  // PDP is a special case where the dependency is only needed if a PID was not specified
  var dependency = controller.addProduct ? null : index;
  return {
    name       : testClass + '.pdp',
    dependency : dependency,
    exec       : function(error, response, body, callback) {
      // set up request according to settings
      if (utils.applyConfig(pdpUrl) && !controller.addProduct) {
        var url  = pdpUrl.url;    
      
      } else if (controller.addProduct) {
        url = '/products/' + controller.addProduct
      
      } else {
        url = utils.propFromBody(body, ['products'], ['href'], controller.random)
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
}

function variation () {
  return {
    name       : testClass + '.variation',
    dependency : pdp,
    exec       : function(error, response, body, callback) {
      // set up request according to settings
      if (utils.applyConfig(variationUrl)) {
        var url  = variationUrl.url;    
      
      } else {
        url = utils.propFromBody(body, ['variations'], ['_bb_variation', 'href'], controller.random)
      }
      
      // validate request setup
      if (!url) {
        return controller.testFailed(pdp.name, 'Failed to parse a variation for navigation', callback);
      }
      
      //make request
      controller.reqAndLog(variation.name, {
        uri    : url,
        method : 'GET',
      }, callback);
    }
  }
}