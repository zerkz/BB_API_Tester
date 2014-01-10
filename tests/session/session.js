var helpers = require(process.cwd() + '/lib/helpers')
  , controller  = require(process.cwd() + '/lib/controller')

var testClass = 'session';
  
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
  controller.execSet([
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
  var test = testClass + 'login';
  console.log(' :: ' + test +' ::');
  
  controller.reqAndLog(test, {
    uri    : urls.login,
    method : 'POST',
    form   : forms.login
  }, callback);
}
 
exports.logout = function(error, response, body, callback) {
  var test = testClass + 'logout';
  console.log(' :: ' + test +' ::');
  
  controller.reqAndLog(test, {
    uri    : urls.logout,
    method : 'DELETE',
  }, callback);
} 
 
exports.status = function(error, response, body, callback) {
  var test = testClass + 'status';
  console.log(' :: ' + test +' ::');
  
  controller.reqAndLog(test, {
    uri    : urls.status,
    method : 'GET'
  }, callback);
}