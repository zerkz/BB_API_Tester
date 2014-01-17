var helpers     = require(process.cwd() + '/lib/helpers')
  , controller  = require(process.cwd() + '/lib/controller')
  , logger      = require(process.cwd() + '/lib/logger')

var testClass = 'session';
  
//
// load config values
//
var config = helpers.loadJson(__dirname)
  , urls   = config.urls
  , forms  = config.requiredForms

//
// test a standard suite of requests
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
exports.login = {
  dependencies : [],
  
  exec : function(error, response, body, callback) {
    var test = testClass + '.login';
    logger.printTitle(test);
    
    controller.reqAndLog(test, {
      uri    : '/session/new',
      method : 'POST',
      form   : forms.login
    }, callback);
  }
}
 
exports.logout = {
  dependencies : [],
  
  exec : function(error, response, body, callback) {
    var test = testClass + '.logout';
    logger.printTitle(test);
    
    controller.reqAndLog(test, {
      uri    : '/session/destroy',
      method : 'DELETE',
    }, callback);
  } 
}
 
exports.status = {
  dependencies : [],
  
  exec : function(error, response, body, callback) {
    var test = testClass + '.status';
    logger.printTitle(test);
    
    controller.reqAndLog(test, {
      uri    : '/session/status',
      method : 'GET'
    }, callback);
  }
}