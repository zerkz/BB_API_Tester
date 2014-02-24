var helpers    = require(process.cwd() + '/lib/helpers')
  , controller = require(process.cwd() + '/controller')
  , logger     = require(process.cwd() + '/logger/logger')
  , tests      = require(process.cwd() + '/tests')()
  , utils      = require(process.cwd() + '/lib/testUtilities')

////// request setup //////

var testClass = 'account';

// load config values
var config = utils.loadJson(__dirname)
  , forms  = config.requiredForms

////// exports //////

module.exports = {
  fullTest : fullTest,
  
  //individual tests
  show     : show,
  create   : create
}
  
////// full test set //////

function fullTest () {
  return [
    create,
    show
  ];
}

////// individual tests //////

function show () {
  return {
    name : testClass + '.show',
    exec : function (error, response, body, callback) {
      controller.reqAndLog(this.name, {
        uri    : '/account',
        method : 'GET'
      }, callback);
    }
  }
}

function create () {
  return {
    name : testClass + '.create',
    exec : function (error, response, body, callback) {
      controller.reqAndLog(this.name, {
        uri    : '/account/new',
        method : 'POST',
        form   : forms.create
      }, callback);
    }
  }
}