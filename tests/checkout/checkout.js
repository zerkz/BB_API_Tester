var helpers    = require(process.cwd() + '/lib/helpers')
  , controller = require(process.cwd() + '/lib/controller')
  , logger     = require(process.cwd() + '/lib/logger')
  , tests      = require(process.cwd() + '/tests')()
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
    // this.review,
    // this.confirm,
    // this.receipt
  ];
  
  // make sure an item is in the cart
  controller.getBodyFromReq(tests.cart.show, function (error, body){
    if (error) return;
    
    if (body && body.length) {
      var products = helpers.getPropterty(body, ['products'], controller.random);
      
      // if there isn't an item in the cart, add it
      if ((products && !products.length) || !products) {
        testSet = controller.addWithDependencies('cart', 'add', testSet);
      }
    } else {
      testSet = controller.addWithDependencies('cart', 'add', testSet);
      testSet.unshift(tests.cart.add);
    }
    
    controller.execSet(testSet);
  });
  
}
 
//
// individual requests to be used in both custom and standard test suites
//
exports.submit = {
  dependencies: [],
  
  exec : function(error, response, body, callback) {
    var test = testClass + '.submit';
    logger.printTitle(test);
    
    // set up request according to settings
    if (controller.realCreds) {
      var form = helpers.loadJson(__dirname, 'local.json').realCreds
    } else {
      form = requiredForms.fakeCreds
    }
    
    // validate request setup
    if (!(form)) {
      return controller.testFailed(test, 'Failed to parse a checkout submit form', callback);
    }
    
    controller.reqAndLog(test, {
      uri    : '/checkout/cc',
      method : 'POST',
      form   : form
    }, callback);
  }
}

exports.review = {
  dependencies: [],
  
  exec : function(error, response, body, callback) {
    var test = testClass + '.review';
    logger.printTitle(test);
    
    controller.reqAndLog(test, {
      uri    : '/checkout/confirm',
      method : 'GET'
    }, callback);
  }
}

exports.confirm = {
  dependencies: [],
  
  exec : function(error, response, body, callback) {
    var test = testClass + '.confirm';
    logger.printTitle(test);
    
    // set up request according to settings
    if(helpers.applyConfig(forms.confirm)) { 
      var form = forms.confirm
    } else {
      form = helpers.getSubPropFromBody(body, ['forms', 'confirm_order'])
    }
    
    // validate request setup
    if (!(form && form.action && form.method && form.inputs)) {
      return controller.testFailed(test, 'Failed to parse a confirm form', callback);
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
        return controller.reqAndLog(test, request, callback);
      } else {
        return controller.testFailed(test, 'The order was canceled by the user', callback);
      }
    // if face creds were used, make the reust without prompting
    } else {
      return controller.reqAndLog(test, request, callback);
    }
  }
}

exports.receipt = {
  dependencies: [],
  
  exec : function(error, response, body, callback) {
    var test = testClass + '.receipt';
    logger.printTitle(test);
    
    controller.reqAndLog(test, {
      uri    : '/checkout/receipt',
      method : 'POST',
    }, callback);
  }
}
