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
  fullTest        : fullTest,
  shipping        : shipping,
  billing         : billing,
  accountShipping : accountShipping,

  editSavedAddress : editSavedAddress,
  
  // individual
  init               : init,
  register           : register,
  submitShipping     : submitShipping,
  editShipping       : editShipping,
  newShippingAddress : newShippingAddress,
  editSavedAddress   : editSavedAddress,
  submitBilling      : submitBilling,
  editBilling        : editBilling,
  submitConfirm      : submitConfirm
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
    submitShipping,
    submitBilling,
    editBilling
  ]; 
}

function accountShipping () {
  return [
    init,
    register,
    getShippingAddress,
    editSavedAddress,
    newShippingAddress
  ]
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
        , uri     = '/core/checkout/init_user/';
        
      // if login is set, use th ecreds from the config file
      if (controller.login) {
        options.form = forms.register.login;
        uri += 'submitSignIn';

      // otherwise continue as guest
      } else {
        options.form = forms.register.guest;
        uri += 'submitGuest';
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

      if (controller.login) {
        options.form.address.shipping.saved_name = new Date();
      }

      return controller.reqAndLog(this.name, '/core/checkout/shipping/submit', options, checkoutMiddleman('billing_payment_confirm', callback));
    }
  }
}


// Handle edit shipping step
function editShipping () {
  return {
    name : testClass + '.editShipping',
    exec : function(error, response, body, callback) {
      var options = applyForms({ form : {} }, body);                

      return controller.reqAndLog(this.name, '/core/checkout/shipping/edit', options, checkoutMiddleman('shipping', callback));
    }
  }
}


// Handle submit shipping step
function newShippingAddress () {
  return {
    name : testClass + '.newShippingAddress',
    exec : function(error, response, body, callback) {
      var date = new Date();
      var form = _.clone(forms.save_new_shipping, true);
      form.saved_name = date; 
      var options = applyForms({ 
        form : {
          address: {
            address_id : date,
            shipping   : form
          }
        } 
      }, body);

      return controller.reqAndLog(this.name, '/core/checkout/shipping/submit', options, checkoutMiddleman('billing_payment_confirm', callback));
    }
  }
}


// Handle submit shipping step
function setShippingAddress () {
  return {
    name : testClass + '.setShippingAddress',
    exec : function(error, response, body, callback) {
     var address = (utils.getSubProp(body, ['body', 'saved_addresses']) || [])[1] || {};
      var options = applyForms({ 
        form : {
          address_id : address.address_id
        } 
      }, body);

      return controller.reqAndLog(this.name, '/core/checkout/shipping/setSavedAddress', options, checkoutMiddleman('shipping', callback));
    }
  }
}

// Handle submit shipping step
function getShippingAddress () {
  return {
    name : testClass + '.getShippingAddress',
    exec : function(error, response, body, callback) {
      var address = (utils.getSubProp(body, ['body', 'saved_addresses']) || [])[0] || {};
      var options = applyForms({ 
        form : {
          address_id : address.address_id
        } 
      }, body);

      return controller.reqAndLog(this.name, '/core/checkout/shipping/getSavedAddress', options, function (error, error, response, newBody) {

        logger.printNotification('Piping form to next request');
        newBody = utils.parseJson(newBody);
        newBody.forms = options.form.forms;
        return callback(error, response, JSON.stringify(newBody));
      });
    }
  }
}


// Handle submit shipping step
function editSavedAddress () {
  return {
    name : testClass + '.editSavedAddress',
    exec : function(response, body, callback) {
      var date = new Date();
      body = utils.parseJson(body);
      body.address.shipping.city = 'test' || date.getHours() + ':' + date.getMinutes()+ ':' + date.getSeconds();
      body.forms = body.forms;
      body = {
        form : body
      };
      
      return controller.reqAndLog(this.name, '/core/checkout/shipping/editSavedAddress', body, checkoutMiddleman('shipping', callback));
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

      return controller.reqAndLog(this.name, '/core/checkout/billing_payment_confirm/submit', options, checkoutMiddleman('review', callback));
    }
  }
}

// Handle edit billing step
function editBilling () {
  return {
    name : testClass + '.editPayment',
    exec : function(error, response, body, callback) {
      var options = applyForms({ form : forms.billing }, body);
        
      return controller.reqAndLog(this.name, '/core/checkout/billing_payment_confirm/edit', options, checkoutMiddleman('review', callback));
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
