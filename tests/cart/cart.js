var helpers = require(process.cwd() + '/lib/helpers')
  , tester  = require(process.cwd() + '/lib/tester')
  , tests   = require(process.cwd() + '/tests')()

  // load config values
  var config         = helpers.loadJson(__dirname)
    , useCustomForm  = config.useCustomForm
    , url            = config.urls
    , forms          = config.forms
  
  //
  // test a standard suite of requests
  //
exports.fullTest = function () {
  //base test set
  var testSet = [
        this.add,
        this.update,
        this.remove,
      ];
      
  //
  // only navigate to cats and pdp if no custom form is being used,
  // or the user chose ot ignore config settings
  //
  if (!useCustomForm || !tester.ignoreSettings) {
    testSet.unshift(tests.products.pdp)
    testSet.unshift(tests.products.index)
    testSet.unshift(tests.categories.subcats)
    testSet.unshift(tests.categories.cats)
  }
  testSet.unshift(this.show)
  
  tester.execSet(testSet);
}
   
//
// individual requests to be used in both custom and standard test suites
//

//
// shows the contents of a cart
//   dependencies:
//     none
//
exports.show = function(error, response, body, callback) {
  tester.reqAndLog('cart: show', {
    uri    : urls.cart,
    method : 'GET'
  }, callback);
}
    

//
// adds an item to the cart
//   dependencies:
//     -preceeded by tests.produts.showPdp if the user chose the option to parse the form for submission
//     -there must be a valid form in the config if the user set useCustomForm to true in config
//
exports.add = function(error, response, body, callback) {
  tester.reqAndLog('cart: add', {
    uri    : urls.cart,
    method : 'POST',
    form   : form
  }, callback);
}

//
// updates an item to the cart
//   dependencies:
//     -preceeded by any cart test if the user chose the option to parse the form for submission
//     -there must be a valid form in the config if the user set useCustomForm to true in config
//
exports.update = function(error, response, body, callback) {
  tester.reqAndLog('cart: update', {
    uri    : urls.cart,
    method : 'PUT',
    form   : form
  }, callback);
}

//
// updates an item to the cart
//   dependencies:
//     -preceeded by any cart test if the user chose the option to parse the form for submission
//     -there must be a valid form in the config if the user set useCustomForm to true in config
//
exports.remove = function(error, response, body, callback) {
  tester.reqAndLog('cart: delete', {
    uri    : urls.cart,
    method : 'DELETE',
    form   : form
  }, callback);
}