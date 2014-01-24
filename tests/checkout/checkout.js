var helpers    = require(process.cwd() + '/lib/helpers')
  , controller = require(process.cwd() + '/lib/controller')
  , logger     = require(process.cwd() + '/lib/logger')
  , prompt     = require('prompt');
  
////// request setup //////

var testClass = 'checkout';

// load config values
var config        = helpers.loadJson(__dirname)
  , requiredForms = config.requiredForms
  , forms         = config.forms
  
////// exports //////

module.exports = {
  fullTest : fullTest,
  
  // individual
  submit   : submit,
  review   : review,
  confirm  : confirm,
  receipt  : receipt
}

////// full test set //////

var fullTest = [
  submit,
  review,
  confirm,
  receipt
];
  
////// individual tests //////
 
var submit = {
  name          : testClass + '.submit',
  cartDependant : true,
  exec          : function(error, response, body, callback) {
    // set up request according to settings
    if (controller.realCreds) {
      var form = helpers.loadJson(__dirname, 'local.json').realCreds
    } else {
      form = requiredForms.fakeCreds
    }
    
    // validate request setup
    if (!(form)) {
      return controller.testFailed(submit.name, 'Failed to parse a checkout submit form', callback);
    }
    
    controller.reqAndLog(submit.name, {
      uri    : '/checkout/cc',
      method : 'POST',
      form   : form
    }, callback);
  }
}

var review = {
  name : testClass + '.review',
  exec : function(error, response, body, callback) {
    controller.reqAndLog(review.name, {
      uri    : '/checkout/confirm',
      method : 'GET'
    }, callback);
  }
}

var confirm = {
  name : testClass + '.confirm',
  exec : function(error, response, body, callback) {
    // set up request according to settings
    if(helpers.applyConfig(forms.confirm)) { 
      var form = forms.confirm
    } else {
      form = helpers.getSubPropFromBody(body, ['forms', 'confirm_order'])
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

var receipt = {
  name : testClass + '.receipt',
  exec : function(error, response, body, callback) {
    controller.reqAndLog(receipt.name, {
      uri    : '/checkout/receipt',
      method : 'GET',
    }, callback);
  }
}
