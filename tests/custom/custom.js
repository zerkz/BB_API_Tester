var helpers = require(process.cwd() + '/lib/helpers')
  , tester  = require(process.cwd() + '/lib/tester')
  
//
// load config values
//
var config = helpers.loadJson(__dirname)
  , url    = config.urls['test']
  , forms  = config.forms

//
// test a standard quite of requests
//
exports.fullTest = function () {
  tester.execSet([
    this.test1
  ]);
}
 
//
// individual requests to be used in both custom and standard test suites
//
exports.test1 = function(error, response, body, callback) {
  tester.reqAndLog('test 1', {
    uri    : url,
    method : 'GET'
  }, callback);
}
