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
  name         : testClass + '.login',
  dependencies : [],
  exec         : function(error, response, body, callback) {
    logger.printTitle(exports.login.name);
    
    controller.reqAndLog(exports.login.name, {
      uri    : '/session/new',
      method : 'POST',
      form   : forms.login
    }, callback);
  }
}
 
exports.logout = {
  name         : testClass + '.logout',
  dependencies : [],  
  exec         : function(error, response, body, callback) {
    logger.printTitle(exports.logout.name);
    
    controller.reqAndLog(exports.logout.name, {
      uri    : '/session/destroy',
      method : 'DELETE',
    }, callback);
  } 
}
 
exports.status = {
  name         : testClass + '.status',
  dependencies : [],
  exec         : function(error, response, body, callback) {
    logger.printTitle(exports.status.name);
    
    controller.reqAndLog(exports.status.name, {
      uri    : '/session/status',
      method : 'GET'
    }, callback);
  }
}