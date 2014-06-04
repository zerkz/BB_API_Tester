var helpers    = require(process.cwd() + '/lib/helpers')
  , controller = require(process.cwd() + '/controller')
  , logger     = require(process.cwd() + '/logger/logger')
  , utils      = require(process.cwd() + '/lib/testUtilities')


////// setup //////

var testClass = 'categories'
  , config    = utils.loadConfig(__dirname)
  , paths     = config.paths
  
////// exports //////

module.exports = {
  fullTest      : fullTest,
  
  // individual
  categories    : categories,
  subcategories : subcategories
}

////// full test set //////

function fullTest () {
  return [this.subcategories];
}
  
////// individual tests //////

//
// get the root categories
//
function categories () {
  return {
    name : testClass + '.categories',
    exec : function(error, response, body, callback) {
      return controller.reqAndLog(this.name, '/categories', null, callback);
    }
  }
}

//
// get a subcategory page
//
function subcategories () {
  return {
    name       : testClass + '.subcategories',
    dependency : categories,
    exec       : function(error, response, body, callback) {
      var path = null;

      // if apply is set, use the config values
      if (utils.applyConfig(paths.subcat)) {
        path = paths.subcat.value;

      // otherwise parse from the preceding body
      } else {
        path = utils.getPrePostProp(body, ['categories'], ['href'], controller.random);
      }
      
      // validate and make request
      if (!path) {
        return controller.testFailed(this.name, 'Failed to parse a subcategory for navigation', callback);
      } else {      
        return controller.reqAndLog(this.name, path, null, callback);
      }
    }
  }
}
