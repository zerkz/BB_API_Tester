var helpers    = require(process.cwd() + '/lib/helpers')
  , controller = require(process.cwd() + '/controller')
  , logger     = require(process.cwd() + '/logger/logger')
  , prompt     = require('prompt')
  , utils      = require(process.cwd() + '/lib/testUtilities')
  , _          = require('lodash');
  
////// request setup //////

var testClass = 'checkout'
  , config    = utils.loadConfig(__dirname)
  , forms     = config.forms;

////// exports //////

module.exports = {
  fullTest : fullTest,
  shipping : shipping,
  billing  : billing,
  
  // individual
  init            : init,
  register        : register,
  submitShipping  : submitShipping,
  editShipping    : editShipping,
  submitBilling   : submitBilling,
  editBilling     : editBilling,
  submitConfirm   : submitConfirm
}

////// full test set //////

function fullTest () {
  return [
    init,
    register,
    submitShipping,
    // submitBilling,
    // submitConfirm,
  ];
}

function shipping () {
 return [
    init,
    register,
    submitShipping,
    editShipping
  ]; 
}

function billing () {
 return [
    init,
    register,
    submitBilling,
    editBilling
  ]; 
}

////// Utilities //////


//
// verify the step between checkout calls
//
function checkoutMiddleman (expectStep, callback) {
  var expectedStep = expectStep.toUpperCase();
  return function (error, error, response, body) {
    var parsedStep   = (utils.getSubProp(body, ['step']) || '').toUpperCase();

    if (expectedStep !== parsedStep) {
      return controller.setFailed('Checkout Step Handler', 'Expected step ' + expectedStep + ', but found step ' + parsedStep);      
    }

    logger.printNotification('Now on step: ' + expectedStep);

    return callback(error, error, response, body);
 }
}

//
// parse and apply the forms to the passed in form
//
function applyForms (options, body) {

  if (!options) {
    return controller.setFailed('Checkout Step Handler', 'no form found for submission');      
  }

  options.form.forms = utils.getSubProp(body, ['forms']);

  if (!options.form.forms) {
    return controller.setFailed('Checkout Step Handler', 'Failed to parse forms');      
  } else {
    return options;
  }
}



////// Individual tests //////
 

// Initialize Checkout
function init () {
  return {
    name          : testClass + '.init',
    cartDependant : true,
    exec          : function(error, response, body, callback) {
      return controller.reqAndLog(this.name, '/core/checkout/init', { method : 'POST' }, callback);
    }
  }
}


//
// Register step
//


// Handle Register Step
function register () {
  return {
    name : testClass + '.register',
    exec : function(error, response, body, callback) {
      var options =  {}
        , uri     = '/core/checkout/register/';
        
      // if login is set, use th ecreds from the config file
      if (controller.login) {
        options.form = forms.register.login;
        uri += 'login';

      // otherwise continue as guest
      } else {
        options.form = forms.register.guest;
        uri += 'guest';
      }

      return controller.reqAndLog(this.name, uri, applyForms(options, body), checkoutMiddleman('shipping', callback));
    }
  }
}


//
// Shipping step
//


// Handle submit shipping step
function submitShipping () {
  return {
    name : testClass + '.submitShipping',
    exec : function(error, response, body, callback) {
      var options = applyForms({ form : forms.shipping }, body);

      return controller.reqAndLog(this.name, '/core/checkout/shipping_address/submit', options, checkoutMiddleman('billing', callback));
    }
  }
}


// Handle edit shipping step
function editShipping () {
  return {
    name : testClass + '.editShipping',
    exec : function(error, response, body, callback) {
      var options = applyForms({ form : forms.shipping }, body);                

      return controller.reqAndLog(this.name, '/core/checkout/shipping_address/edit', options, checkoutMiddleman('shipping', callback));
    }
  }
}


//
// Payment step
//


// Handle submit payment (CC) step
function submitBilling () {
  return {
    name : testClass + '.submitBilling',
    exec : function(error, response, body, callback) {
      var options = applyForms({ form : forms.billing }, body); 

      return controller.reqAndLog(this.name, '/core/checkout/payment/cc', options, checkoutMiddleman('review', callback));
    }
  }
}

// Handle edit billing step
function editBilling () {
  return {
    name : testClass + '.editPayment',
    exec : function(error, response, body, callback) {
      var options = applyForms({ form : forms.billing }, body);
        
      return controller.reqAndLog(this.name, '/core/checkout/payment/edit', options, checkoutMiddleman('review', callback));
    }
  }
}


//
// Confirmation step
//


// Submit order confirmation
function submitConfirm () {
  return {
    name : testClass + '.submitConfirm',
    exec : function(error, response, body, callback) {
      var options = applyForms({ form : forms.confirm }, body);
        
      return controller.reqAndLog(this.name, '/core/checkout/review/submit', options, checkoutMiddleman('receipt', callback));
    }
  }
}
