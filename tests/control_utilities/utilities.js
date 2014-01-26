var helpers    = require(process.cwd() + '/lib/helpers')
  , controller = require(process.cwd() + '/lib/controller')
  , logger     = require(process.cwd() + '/lib/logger')
  , tests      = require(process.cwd() + '/tests')()
  , utils      = require(process.cwd() + '/lib/testUtilities')

var testClass = 'util';

////// exports //////  

module.exports = {
  testSet        : [],
  ignoreSettings : ignoreSettings,
  applySettings  : applySettings,
  useRandom      : useRandom,
  useFirst       : useFirst,
}

//
// sets the following tests to ignore/apply config settings
//
function ignoreSettings () {
  return {
    name : testClass + '.setIgnoreSettings',
    exec : function  (error, response, body, callback) {
      controller.ignoreSettings = true;
      return callback(null, error, response, body)
    }
  }
}
function applySettings () {
  return {
    name : testClass + '.setIgnoreSettings',
    exec : function  (error, response, body, callback) {
      controller.ignoreSettings = true;
      return callback(null, error, response, body)
    }
  }
}

//
// sets the following tests to use/not use randomly parsed elements
//
function useRandom () {
  return {
    name : 'useRandom',
    exec : function  (error, response, body, callback) {
      controller.random = true;
      return callback(null, error, response, body)
    }
  }
}
function useFirst () {
  return {
    name : 'useFirst',
    exec : function  (error, response, body, callback) {
      controller.random = false;
      return callback(null, error, response, body)
    }
  }
}