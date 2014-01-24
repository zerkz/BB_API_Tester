var helpers     = require(process.cwd() + '/lib/helpers')
  , controller  = require(process.cwd() + '/lib/controller')
  , logger      = require(process.cwd() + '/lib/logger')

////// request setup //////

var testClass = 'session';
  
// load config values
var config = helpers.loadJson(__dirname)
  , urls   = config.urls
  , forms  = config.requiredForms

////// exports //////

module.exports = {
  fullTest : fullTest,
  
  // individual
  login    : login,
  logout   : logout,
  status   : status
}

////// full test set //////

var fullTest = [
  status,
  login,
  status,
  logout,
  status
]

////// individual tests //////

var login = {
  name : testClass + '.login',
  exec : function(error, response, body, callback) {
    logger.printTitle(login.name);
    
    controller.reqAndLog(login.name, {
      uri    : '/session/new',
      method : 'POST',
      form   : forms.login
    }, callback);
  }
}
 
var logout = {
  name     : testClass + '.logout',
  reqLogin : true,
  exec     : function(error, response, body, callback) {    
    controller.reqAndLog(logout.name, {
      uri    : '/session/destroy',
      method : 'DELETE',
    }, callback);
  } 
}
 
var status = {
  name : testClass + '.status',
  exec : function(error, response, body, callback) {
    controller.reqAndLog(status.name, {
      uri    : '/session/status',
      method : 'GET'
    }, callback);
  }
}