var helpers    = require(process.cwd() + '/lib/helpers')
  , controller = require(process.cwd() + '/controller')
  , logger     = require(process.cwd() + '/logger/logger')
  , tests      = require(process.cwd() + '/tests')()
  , utils      = require(process.cwd() + '/lib/testUtilities')

////// request setup //////

var testClass = 'session';
  
// load config values
var config = utils.loadConfig(__dirname)
  , forms  = config.forms
  
////// exports //////  

module.exports = {
  fullTest : fullTest,
  
  //individual
  login  : login,
  logout : logout,
  status : status
}

////// full test set //////
  
function fullTest () {
  return [
    status,
    login,
    status,
    logout,
    status
  ];
}

////// individual tests //////

function login () {
  return {
    name : testClass + '.login',
    exec : function (error, response, body, callback) {
      var options = {
            form : forms.login
          }

      // validate and make request
      if (!options.form) {
        return controller.testFailed(this.name, 'Failed to parse a login form', callback);
      } else {      
        controller.reqAndLog(this.name, '/session', options, callback);
      }
    }
  }
}

function logout () {
  return {
    name : testClass + '.logout',
    exec : function (error, response, body, callback) {
      controller.reqAndLog(this.name, '/session', { method : 'DELETE'}, callback);
    }
  }
}

function status () {
  return {
    name : testClass + '.status',
    exec : function (error, response, body, callback) {
      controller.reqAndLog(this.name, '/session', null, callback);
    }
  }
}
