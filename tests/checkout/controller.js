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
  minBmlTest     : minBmlTest,
  minTest        : minTest,
  
  // individual
  init           : init,
  login          : login,
  getShipMethods : getShipMethods,
  setShipMethod  : setShipMethod,
  cont           : cont,
}

////// full test set //////

function fullTest () {
  var set = [
    init,
    getShipMethods,
    setShipMethod,
  ];

  if (controller.login){
    set.push(login);
  }

  set.push(cont);

  return set;
}

function loginTest () {
 return [
    init,
    login
  ]; 
}


function minTest () {
 var set = [
    init,
  ]; 

  if (controller.login){
    set.push(login);
  }

  set.push(cont);

  return set;
}

function minBmlTest () {
  var set = [init]; 

  if (controller.login){
    set.push(login);
  }

  set.push(cont);
  set.push(cont);

  return set
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
  return function (error, error, response, body) {
    var parsedStep = (utils.getSubProp(body, ['step']) || '').toUpperCase();
    var validStep  = (expectStep instanceof RegExp) ? expectStep.test(parsedStep) : expectStep.toUpperCase() === parsedStep;

    if (!validStep) {
      return controller.setFailed('Checkout Step Handler', 'Expected step ' + expectStep + ', but found step ' + parsedStep);      
    }

    var errors = utils.getSubProp(body, ['body', 'errors']);
    if (errors && errors.length) {
      logger.printWarning(errors);
    }

    logger.printNotification('Now on step: ' + parsedStep);

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


// Handle continue shipping step
function cont () {
  return {
    name : testClass + '.continue',
    exec : function(error, response, body, callback) {
      var preAuthMsg   = (utils.getSubProp(body, ['body', 'errors']) || [])[0] || '';
      var preAuthError = /pre-authorization denied/.test(preAuthMsg)
      var options = applyForms({ 
        form : { 
          shipping : forms.shipping,
          billing  : forms.billing,
          cc       : forms.cc
        }
      }, body);

      if (controller.sameAsShip) {
        options.form.billing.address = undefined;
        options.form.shipping.address.use_for_billing = true;
      }

      if (controller.realCreds) {
        if (preAuthError){
          console.log('\n' + preAuthMsg);

          prompt.start();
          prompt.get(['birthDay', 'birthMonth', 'birthYear', 'lastFourSsn'], function (err, result) {
            options.form.bml = {
              birth : {
                name   : result.birthDay,
                cvv    : result.birthMonth,
                type   : result.birthYear,
              },
              ssn : result.lastFourSsn,
            }

            return promptCCSubmit();
          });

        } else {
          return promptCCSubmit();
        }

        function promptCCSubmit () {
          console.log('\norder total: ' + utils.getSubProp(body, ['body', 'summary', 'total']));
          console.log('Please enter CC values:');

          prompt.start();
          prompt.get(['name', 'cvv', 'type', 'number', 'expMonth', 'expYear'], function (err, result) {
            options.form.cc = {
              name   : result.name,
              cvv    : result.cvv,
              type   : result.type,
              number : result.number,
              expire : {
                month : result.expMonth,
                year  : result.expYear
              }
            }
            return controller.reqAndLog(testClass + '.continue', '/core/checkout/submit/continue', options, checkoutMiddleman(/(receipt|submit)/i, callback));
          });
        }

      } else {
        return controller.reqAndLog(this.name, '/core/checkout/submit/continue', options, checkoutMiddleman(/(receipt|submit)/i, callback));
      }
    }
  }
}
