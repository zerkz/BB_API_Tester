var helpers    = require(process.cwd() + '/lib/helpers')
  , controller = require(process.cwd() + '/controller')
  , logger     = require(process.cwd() + '/logger/logger')
  , utils      = require(process.cwd() + '/lib/testUtilities')
  , _          = require('lodash');
  
////// setup //////

var testClass = 'products'
  , config  = utils.loadConfig(__dirname)
  , paths   = config.paths

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
  
//
// get a product index page
//
function index () {
  var tests = require(process.cwd() + '/tests')();
  return {
    name       : testClass + '.index',
    dependency : tests.categories.subcategories, 
    exec       : function(error, response, body, callback) {
      var path = null;

      // if apply is true, use the config url
      if (utils.applyConfig(paths.index)) {
        path = paths.index.value;
        
      // otherwise, parse the url from the body
      } else {
        path = utils.getPrePostProp(body, ['categories'], ['href'], controller.random);
      }
      
      // validate and make request
      if (!path) {
        return controller.testFailed(this.name, 'Failed to parse a product index page for navigation', callback);
      } else {      
        return controller.reqAndLog(this.name, path, null, callback);
      }
    }
  }
}

//
// get a pdp
//
function pdp () {
  return {
    name       : testClass + '.pdp',
    dependency : controller.addProduct ? null : index, // the index dependency is only needed if a PID was not specified
    exec       : function(error, response, body, callback) {
      var path = null;

      // if apply is true, and no PID was specified, use the config url
      if (utils.applyConfig(paths.pdp) && !controller.addProduct) {
        path  = paths.pdp.value;
      
      // if a PID was specified, use it in the url
      } else if (controller.addProduct) {
        path = '/products/' + controller.addProduct
      
      // otherwise, parse the path from the body
      } else {
        path = utils.getPrePostProp(body, ['products'], ['href'], controller.random);
      }
      
      // validate and make request
      if (!path) {
        return controller.testFailed(pdp.name, 'Failed to parse a pdp for navigation', callback);
      } else {      
        return controller.reqAndLog(pdp.name, path, null, callback);
      }
    }
  }
}

//
// get a variation page
//
function variation () {
  return {
    name       : testClass + '.variation',
    dependency : pdp,
    exec       : function(error, response, body, callback) {
      var path = null;

      // if apply is true, use the config url
      if (utils.applyConfig(paths.variation)) {
        path = paths.variation.value;    
      
      // otherwise, parse the url from the body
      } else {
        path = utils.getPrePostProp(body, ['variations'], ['_bb_variation', 'href'], controller.random);
      }
      
      // validate and make request
      if (!path) {
        return controller.testFailed(pdp.name, 'Failed to parse a variation for navigation', callback);
      } else {
        controller.reqAndLog(variation.name, path, null, callback);
      }
    }
  }
}
