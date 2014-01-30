var helpers    = require(process.cwd() + '/lib/helpers')
  , controller = require(process.cwd() + '/controller')
  , logger     = require(process.cwd() + '/logger/logger')
  , tests      = require(process.cwd() + '/tests')()
  , utils      = require(process.cwd() + '/lib/testUtilities')

////// request setup //////

var testClass = 'promo';
  
// load config values
var config = utils.loadJson(__dirname)
  , forms  = config.requiredForms
  
////// exports //////  

module.exports = {
  fullTest : fullTest,
  
  //individual
  apply   : apply
}

////// full test set //////
  
function fullTest () {
  return [
    apply,
    tests.cart.show
  ];
}

////// individual tests //////

function apply () {
  return {
    name          : testClass + '.apply',
    cartDependant : true,
    exec          : function(error, response, body, callback) {
      if (!(forms && forms.promo)) {
        return controller.testFailed(apply.name, 'Failed to parse a promo form', callback);
      }
      
      controller.reqAndLog(apply.name, {
        uri    : '/checkout/promo',
        method : 'POST',
        form   : forms.promo
      }, callback);
    }
  }
}