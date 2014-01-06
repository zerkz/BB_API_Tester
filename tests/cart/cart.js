var helpers = require(process.cwd() + '/lib/helpers')
  , tester  = require(process.cwd() + '/lib/tester')

  // load config values
  var config = helpers.loadJson(__dirname)
    , type   = config.type
    , url    = config.urls[type]
    , forms  = config.forms
  
  //
  // test a standard suite of requests
  //
exports.fullTest = function () {
  tester.execSet([
    this.show,
    this.add,
    this.update,
    this.remove,
  ]);
}
   
//
// individual requests to be used in both custom and standard test suites
//
exports.show = function(error, response, body, callback) {
  tester.reqAndLog('cart: show', {
    uri    : url,
    method : 'GET'
  }, callback);
}
    
exports.add = function(error, response, body, callback) {
  tester.reqAndLog('cart: add', {
    uri    : url,
    method : 'POST',
    form   : addAddress
  }, callback);
}
    
exports.update = function(error, response, body, callback) {
  tester.reqAndLog('cart: update', {
    uri    : url,
    method : 'PUT',
    form   : updateAddress
  }, callback);
}
    
exports.remove = function(error, response, body, callback) {
  tester.reqAndLog('cart: delete', {
    uri    : url,
    method : 'DELETE',
    form   : deleteAddress
  }, callback);
}