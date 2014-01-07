var helpers = require(process.cwd() + '/lib/helpers')
  , tester  = require(process.cwd() + '/lib/tester')
  , tests   = require(process.cwd() + '/tests')()

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
    tests.session.login,
    this.show,
    this.remove,
    this.add,
    this.update,
    this.remove
  ]);
}
 
//
// individual requests to be used in both custom and standard test suites
//
exports.show = function(error, response, body, callback) {
  tester.reqAndLog('show addresses', {
    uri    : url,
    method : 'GET'
  }, callback);
}
exports.add = function(error, response, body, callback) {
  tester.reqAndLog('add addresses', {
    uri    : url,
    method : 'POST',
    form   : forms.add
  }, callback);
}
exports.update = function(error, response, body, callback) {
  tester.reqAndLog('update addresses', {
    uri    : url,
    method : 'PUT',
    form   : forms.update
  }, callback);
}
exports.remove = function(error, response, body, callback) {
  tester.reqAndLog('delete addresses', {
    uri    : url,
    method : 'DELETE',
    form   : forms.remove
  }, callback);
}