var helpers = require(process.cwd() + '/lib/helpers')
  , tester  = require(process.cwd() + '/lib/tester')
  , logger  = require(process.cwd() + '/lib/logger')
  , tests   = require(process.cwd() + '/tests')()

// load config values
var config   = helpers.loadJson(__dirname)
  , urls     = config.urls
  , indexUrl = config.indexUrl
  , pdpUrl   = config.pdpUrl
  

//
// test a standard suite of requests
//
exports.fullTest = function () {
  //base test set
  var testSet = [
        this.index,
        this.pdp,
      ]     
  //
  // only navigate to cats if the user chose to ignore config settings
  // or the config speficies not to use th custom index page
  //
  if (!indexUrl.apply || tester.ignoreSettings) {
    testSet.unshift(tests.categories.subcats)
    testSet.unshift(tests.categories.cats)
  }  
  
  tester.execSet(testSet);
}
 
//
// individual requests to be used in both custom and standard test suites
//

//
// show categories
//   dependencies:
//     none
//
exports.index = function(error, response, body, callback) {
  //
  // set up request according to settings
  //
  if (indexUrl.apply && !tester.ignoreSettings) {
    var url  = indexUrl.url;
    
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
    logger.error('\n\nERROR: Failed to parse an product index page for navigation\n');
    return callback(null, null, null, null);    
  }
  
  tester.reqAndLog('products: index', {
    uri    : url,
    method : 'GET'
  }, callback);
}

//
// adds an item to the cart
//   dependencies:
//     -preceeded by showCats if the user chose the option to parse the subcategory
//     -there must be a valid url in the config if the user set useSubcat to true in config
//
exports.pdp = function(error, response, body, callback) {
  //
  // set up request according to settings
  //
  if (pdpUrl.apply && !tester.ignoreSettings) {
    var url  = pdpUrl.url;
    
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
    return logger.error('\n\nERROR: Failed to parse a pdp for navigation\n', callback);
  }
  
  //
  //make request
  //
  tester.reqAndLog('products: pdp', {
    uri    : url,
    method : 'GET',
  }, callback);
}