var helpers    = require(process.cwd() + '/lib/helpers')
  , controller = require(process.cwd() + '/controller')
  , logger     = require(process.cwd() + '/logger/logger')
  , tests      = require(process.cwd() + '/tests')()
  , utils      = require(process.cwd() + '/lib/testUtilities')

////// request setup //////

var testClass = 'giftcard';
  
// load config values
var config = utils.loadJson(__dirname)
  , forms  = config.requiredForms
  
////// exports //////  

module.exports = {
  fullTest : fullTest,
  
  //individual
  apply      : apply,
  accntApply : accntApply,
  accntShow  : accntShow
}

////// full test set //////
  
function fullTest () {
  return [
    show,
    apply
  ];
}

////// individual tests //////

function show () {
  return {
    name             : testClass + '.show',
    sessionDependant : true,
    exec             : function(error, response, body, callback) {
      controller.reqAndLog(apply.name, {
        uri : '/giftcards',
        method : 'GET'
      }, callback);
    }
  }
}

function apply () {
  return {
    name             : testClass + '.apply',
    sessionDependant : true,
    exec             : function(error, response, body, callback) {
      if (!(forms && forms.giftcard)) {
        return controller.testFailed(apply.name, 'Failed to parse a giftcard form', callback);
      }
      
      controller.reqAndLog(apply.name, {
        uri    : '/checkout/giftcard',
        method : 'POST',
        form   : forms.number
      }, callback);
    }
  }
}

function accntShow () {
  return {
    name             : testClass + '.accntShow',
    exec             : function(error, response, body, callback) {
      controller.reqAndLog(accntShow.name, {
        uri : '/account/giftcards',
        method : 'GET'
      }, callback);
    }
  }
}

function accntApply () {
  return {
    name             : testClass + '.accntApply',
    exec             : function(error, response, body, callback) {
      if (!(forms && forms.accountGiftcard)) {
        return controller.testFailed(accntApply.name, 'Failed to parse a giftcard form', callback);
      }
      
      controller.reqAndLog(accntApply.name, {
        uri    : '/account/giftcards',
        method : 'POST',
        form   : forms.accountGiftcard
      }, callback);
    }
  }
}