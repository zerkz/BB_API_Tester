var helpers    = require(process.cwd() + '/lib/helpers')
  , controller = require(process.cwd() + '/controller')
  , logger     = require(process.cwd() + '/logger/logger')
  , utils      = require(process.cwd() + '/lib/testUtilities')


////// request setup //////

var testClass = 'categories';

// load config values
var config    = utils.loadJson(__dirname)
  , subcatUrl = config.subcatUrl
  
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

function categories () {
  return {
    name       : testClass + '.categories',
    exec       : function(error, response, body, callback) {
      controller.reqAndLog(categories.name, {
        uri    : '/categories/',
        method : 'GET'
      }, callback);
    }
  }
}

function subcategories () {
  return {
    name       : testClass + '.subcategories',
    dependency : categories,
    exec       : function(error, response, body, callback) {
      //
      // filter out the categories
      //
      json = utils.parseJson(body);
      if(json.products) {
        json.products = _.compact(_.map(json.products, function (prod) {
          if (prod.href.match(/\/products/i)) return prod;
        }));
      }

      // set up request according to settings
      if (utils.applyConfig(subcatUrl)) {
        var url  = subcatUrl.url;
      } else {
        url = utils.getPrePostProp(body, ['categories'], ['href'], controller.random)
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
}
