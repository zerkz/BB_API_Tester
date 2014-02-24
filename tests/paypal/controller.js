var helpers    = require(process.cwd() + '/lib/helpers')
  , controller = require(process.cwd() + '/controller')
  , logger     = require(process.cwd() + '/logger/logger')
  , prompt     = require('prompt')
  , utils      = require(process.cwd() + '/lib/testUtilities');
  
////// request setup //////

var testClass = 'paypal';

// load config values
var config        = utils.loadJson(__dirname)
  , requiredForms = config.requiredForms
  , forms         = config.forms

////// exports //////

module.exports = {
  fullTest : fullTest,
  
  // individual
    out  : out,
    back : back,
}

////// full test set //////

function fullTest () {
  return [
    out,
 // /   back
  ];
}
  
////// individual tests //////
 
function out () {
  return {
    name          : testClass + '.out',
    cartDependant : true,
    exec          : function(error, response, body, callback) {
      
      form = requiredForms.paypalCreds
           
      // validate request setup
      if (!(form)) {
        return controller.testFailed(out.name, 'Failed to parse a checkout submit form', callback);
      }
      
      controller.reqAndLog(out.name, {
        uri    : '/checkout/paypal',
        method : 'POST',
        form   : form
      }, callback);
    }
  }
}

function back () {
  return {
    name : testClass + '.confirm',
    exec : function(error, response, body, callback) {
      // set up request according to settings
      if(utils.applyConfig(forms.confirm)) { 
        var form = forms.confirm
      } else {
        form = utils.getSubPropFromBody(body, ['forms', 'confirm_order'])
      }
      
      // validate request setup
      if (!(form && form.action && form.method && form.inputs)) {
        return controller.testFailed(confirm.name, 'Failed to parse a confirm form', callback);
      }
      
      var request = {
            uri    : form.action,
            method : form.method,
            form   : form.inputs
          }
      
      // if real creds are being used, prompt for verification
      if (controller.realCreds) {
        var confirm = false;
        prompt.start();
        
        prompt.get(['confirm checkout with real credentials? [y/n]'], function (err, result) {
          if (err) return;
          if(result.toUpperCase() === 'Y') confirm = true;
        });
        
        if(confirm) {
          return controller.reqAndLog(confirm.name, request, callback);
        } else {
          return controller.testFailed(confirm.name, 'The order was canceled by the user', callback);
        }
      // if face creds were used, make the reust without prompting
      } else {
        return controller.reqAndLog(confirm.name, request, callback);
      }
    }
  }
}
