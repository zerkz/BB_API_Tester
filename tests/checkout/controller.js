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
  fullTest       : fullTest,
  loginTest      : loginTest,
  shipMethodTest : shipMethodTest,
  
  // individual
  init           : init,
  login          : login,
  getShipMethods : getShipMethods,
  setShipMethod  : setShipMethod,
  submit         : submit,
}

////// full test set //////

function fullTest () {
  var set = [
    init,
    submit,
    getShipMethods,
    setShipMethod,
  ];

  if (controller.login){
    set.push(login);
  }


  return set;
}

function loginTest () {
 return [
    init,
    login
  ]; 
}

function shipMethodTest () {
 return [
    init,
    getShipMethods,
    setShipMethod
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


// Login
function login () {
  return {
    name : testClass + '.register',
    exec : function(error, response, body, callback) {
      var options =  {};
        
      options.form = forms.login;

      return controller.reqAndLog(this.name, '/core/checkout/submit/login', applyForms(options, body), checkoutMiddleman('submit', callback));
    }
  }
}


// Get shipping methods
function getShipMethods () {
  return {
    name : testClass + '.getShipMethods',
    exec : function(error, response, body, callback) {
      var options = { form :  {
        country : "CA"
        } 
      };

      return controller.reqAndLog(this.name, '/core/checkout/submit/get_shipping_methods', applyForms(options, body), function (error, error, response, newBody) {
        logger.printNotification('Piping form to next request');
        newBody = utils.parseJson(newBody);
        newBody = {
          methods : newBody,
          forms   : options.form.forms
        }

        return callback(null, error, response, JSON.stringify(newBody));
      });
    }
  }
}


// Set shipping methods
function setShipMethod () {
  return {
    name : testClass + '.setShipMethod',
    exec : function(error, response, body, callback) {
      var body = utils.parseJson(body);

      // build the baseform fron the first unselected method
      var baseForm = {}
      _.each(body.methods, function (value, key) {
        if (!this.selected) {
          baseForm = utils.getSubProp(value, ['select', 'inputs']);
        }
      })

      // reduce the form to tis actual required values
      _.each(baseForm, function (value, key) {
        var self = baseForm[key]
        if (self.required) {
          baseForm[key] = self.value;
        } else {
          delete baseForm[key];
        }
      })

      baseForm.forms = body.forms;
      var options = { form : baseForm };

      return controller.reqAndLog(this.name, '/core/checkout/submit/set_shipping_method', options, checkoutMiddleman('submit', callback));
    }
  }
}


// Handle submit shipping step
function submit () {
  return {
    name : testClass + '.submitShipping',
    exec : function(error, response, body, callback) {
      var options = applyForms({ form : forms.shipping }, body);

      if (controller.login) {
        options.form.address.shipping.saved_name = new Date();
      }

      return controller.reqAndLog(this.name, '/core/checkout/shipping/submit', options, checkoutMiddleman('receipt', callback));
    }
  }
}
