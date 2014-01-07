var helpers = require(process.cwd() + '/lib/helpers')
  , tester  = require(process.cwd() + '/lib/tester')
  , logger  = require(process.cwd() + '/lib/logger')
  , tests   = require(process.cwd() + '/tests')()

// load config values
var config    = helpers.loadJson(__dirname)
  , subcatUrl = config.subcatUrl

//
// test a standard suite of requests
//
exports.fullTest = function () {
  tester.execSet([
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
exports.cats = function(error, response, body, callback) {
  tester.reqAndLog('categories: categories', {
    uri    : '',
    method : 'GET'
  }, callback);
}

//
// adds an item to the cart
//   dependencies:
//     -preceeded by showCats if the user chose the option to parse the subcategory
//     -there must be a valid url in the config if the user set useSubcat to true in config
//
exports.subcats = function(error, response, body, callback) {
  //
  // set up request according to settings
  //
  if (subcatUrl.apply && !tester.ignoreSettings) {
    var url  = subcatUrl.url;
    
  } else {
    var json = JSON.parse(body);
    
    //only attempt a selection if the categories array is populated
    if (json.categories && json.categories.length >= 0) {
      if (tester.random) {
        var element = helpers.randomSelect(json.categories);
      
      } else {
        element = json.categories[0];
      }
      
      url = element.href;
    }
  }
  
  //
  // validate request setup
  //
  if (!url) {
    logger.error('\n\nERROR: Failed to parse a subcategory for navigation\n');
    return callback(null, null, null, null);    
  }
  
  //
  //make request
  //
  tester.reqAndLog('categories: subcategories', {
    uri    : url,
    method : 'GET',
  }, callback);
}