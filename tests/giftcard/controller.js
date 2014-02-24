var helpers    = require(process.cwd() + '/lib/helpers')
  , controller = require(process.cwd() + '/controller')
  , logger     = require(process.cwd() + '/logger/logger')
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
  var tests = require(process.cwd() + '/tests')()
  return [
    show,
    apply
  ];
}

////// individual tests //////

function show () {
  return {
    name : testClass + '.show',
    exec : function(error, response, body, callback) {
      
      if (!(forms && forms.giftcard)) {
        return controller.testFailed(apply.name, 'Failed to parse a giftcard form', callback);
      }
      
      controller.reqAndLog(apply.name, {
        uri    : '/giftcards',
        method : 'GET',
        qs     : forms.giftcard
      }, callback);
    }
  }
}

function apply () {
  return {
    name          : testClass + '.apply',
    cartDependant : true,
    exec          : function(error, response, body, callback) {
      if (!(forms && forms.giftcard)) {
        return controller.testFailed(apply.name, 'Failed to parse a giftcard form', callback);
      }
      
      form = forms.giftcard;
      
      form ['code'] = form.number
      
      controller.reqAndLog(apply.name, {
        uri    : '/checkout/giftcard',
        method : 'POST',
        form   : form
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