var helpers = require(process.cwd() + '/lib/helpers')
  , tester  = require(process.cwd() + '/lib/tester')
  
//
// load config values
//
var config = helpers.loadJson(__dirname)
  , urls   = config.urls
  , forms  = config.forms

//
// test a standard quite of requests
//
exports.fullTest = function () {
  tester.execSet([
    this.status,
    this.login,
    this.status,
    this.logout,
    this.status
  ]);
}
 
//
// individual requests to be used in both custom and standard test suites
//
exports.login = function(error, response, body, callback) {
  tester.reqAndLog('session: login', {
    uri    : urls.login,
    method : 'POST',
    form   : forms.login
  }, callback);
}
 
exports.logout = function(error, response, body, callback) {
  tester.reqAndLog('session: logout', {
    uri    : urls.logout,
    method : 'DELETE',
  }, callback);
} 
 
exports.status = function(error, response, body, callback) {
  tester.reqAndLog('session: status', {
    uri    : urls.status,
    method : 'GET'
  }, callback);
}