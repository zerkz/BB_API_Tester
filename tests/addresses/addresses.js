var helpers = require(process.cwd() + '/lib/helpers')
  , controller  = require(process.cwd() + '/lib/controller')
  , tests   = require(process.cwd() + '/tests')()

var testClass = 'addressed';

// load config values
var config = helpers.loadJson(__dirname)
  , type   = config.type
  , url    = config.urls[type]
  , forms  = config.forms

//
// test a standard suite of requests
//
exports.fullTest = function () {
  controller.execSet([
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
  var test = testClass + 'show';
  logger.printTitle(test);
  
  controller.reqAndLog(test, {
    uri    : url,
    method : 'GET'
  }, callback);
}

exports.add = function(error, response, body, callback) {
  var test = testClass + '.add';
  logger.printTitle(test);
  
  controller.reqAndLog(test, {
    uri    : url,
    method : 'POST',
    form   : forms.add
  }, callback);
}

exports.update = function(error, response, body, callback) {
  var test = testClass + 'update';
  logger.printTitle(test);
  
  controller.reqAndLog(tset, {
    uri    : url,
    method : 'PUT',
    form   : forms.update
  }, callback);
}

exports.remove = function(error, response, body, callback) {
  var test = testClass + 'remove';
  logger.printTitle(test);
  
  controller.reqAndLog(test, {
    uri    : url,
    method : 'DELETE',
    form   : forms.remove
  }, callback);
}