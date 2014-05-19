var helpers    = require(process.cwd() + '/lib/helpers')
  , controller = require(process.cwd() + '/controller')
  , logger     = require(process.cwd() + '/logger/logger')
  , tests      = require(process.cwd() + '/tests')()
  , utils      = require(process.cwd() + '/lib/testUtilities')

////// request setup //////

var testClass = 'promo';
  
// load config values
var config = utils.loadJson(__dirname)
  , forms  = config.forms
  
////// exports //////  

module.exports = {
  fullTest : fullTest,
  
  //individual
  apply   : apply
}

////// full test set //////
  
function fullTest () {
  return [
    tests.cart.add,
    apply
  ];
}

////// individual tests //////

function apply () {
  return {
    name          : testClass + '.apply',
    cartDependant : true,
    exec          : function(error, response, body, callback) {

     var form = { 
            orderId  : utils.getSubProp(body, ['_bb_orderId']),
            fromCart : forms.promo.from_cart,
            promo    : forms.promo.promo_code 
          }

      if (!form.orderId) {
        return controller.testFailed(apply.name, 'Failed to parse an orderId for promo submission', callback);
      }
      
      controller.reqAndLog(apply.name, {
        uri    : '/checkout/promo',
        method : 'POST',
        form   : form
      }, callback);
    }
  }
}
