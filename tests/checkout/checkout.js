var helpers    = require(process.cwd() + '/lib/helpers')
  , controller = require(process.cwd() + '/lib/controller')
  , logger     = require(process.cwd() + '/lib/logger')
  , prompt     = require('prompt');

var testClass = 'checkout';

//
// load config values
//
var config        = helpers.loadJson(__dirname)
  , requiredForms = config.requiredForms
  , forms         = config.forms

//
// test a standard suite of requests
//
exports.fullTest = function () {
  var testSet = [
    this.submit,
    this.review,
    this.confirm,
    this.receipt
  ];
  
  controller.verifyCartContent(testSet, function (testSet) {  
    controller.execSet(testSet);
  }); 
}
 
//
// individual requests to be used in both custom and standard test suites
//
exports.submit = {
  name : testClass + '.submit',
  dependencies: [],
  
  exec : function(error, response, body, callback) {
    logger.printTitle(exports.submit.name);
    
    // set up request according to settings
    if (controller.realCreds) {
      var form = helpers.loadJson(__dirname, 'local.json').realCreds
    } else {
      form = requiredForms.fakeCreds
    }
    
    // validate request setup
    if (!(form)) {
      return controller.testFailed(exports.submit.name, 'Failed to parse a checkout submit form', callback);
    }
    
    controller.reqAndLog(exports.submit.name, {
      uri    : '/checkout/cc',
      method : 'POST',
      form   : form
    }, callback);
  }
}

exports.review = {
  name : testClass + '.review',
  dependencies: [],
  
  exec : function(error, response, body, callback) {
    logger.printTitle(exports.review.name);
    
    controller.reqAndLog(exports.review.name, {
      uri    : '/checkout/confirm',
      method : 'GET'
    }, callback);
  }
}

exports.confirm = {
  name : testClass + '.confirm',
  dependencies: [],
  
  exec : function(error, response, body, callback) {
    logger.printTitle(exports.confirm.name);
    
    // set up request according to settings
    if(helpers.applyConfig(forms.confirm)) { 
      var form = forms.confirm
    } else {
      form = helpers.getSubPropFromBody(body, ['forms', 'confirm_order'])
    }
    
    // validate request setup
    if (!(form && form.action && form.method && form.inputs)) {
      return controller.testFailed(exports.confirm.name, 'Failed to parse a confirm form', callback);
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
        return controller.reqAndLog(exports.confirm.name, request, callback);
      } else {
        return controller.testFailed(exports.confirm.name, 'The order was canceled by the user', callback);
      }
    // if face creds were used, make the reust without prompting
    } else {
      return controller.reqAndLog(exports.confirm.name, request, callback);
    }
  }
}

exports.receipt = {
  name : testClass + '.receipt',
  dependencies: [],
  
  exec : function(error, response, body, callback) {
    logger.printTitle(exports.receipt.name);
    
    controller.reqAndLog(exports.receipt.name, {
      uri    : '/checkout/receipt',
      method : 'GET',
    }, callback);
  }
}
