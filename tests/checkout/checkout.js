var helpers    = require(process.cwd() + '/lib/helpers')
  , controller = require(process.cwd() + '/lib/controller')
  , logger     = require(process.cwd() + '/lib/logger')
  , tests      = require(process.cwd() + '/tests')()

var testClass = 'checkout';
  
//
// load config values
//
var config         = helpers.loadJson(__dirname)
  , requiredForms  = config.requiredForms

//
// test a standard suite of requests
//
exports.fullTest = function () {
  var testSet = [
    this.submit,
    //this.review,
    this.confirm,
    //this.receipt
  ];
  
  // make sure an item is in the cart
  controller.getBodyFromReq(tests.cart.show, function (body){
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
    console.log(' :: ' + test +' ::');
    
    // set up request according to settings
    if (controller.realCreds) {
      var form = helpers.loadJson(__dirname, 'local.json').realCreds
    } else {
      form = requiredForms.fakeCreds
    }
    
    // validate request setup
    if (!(form)) {
      logger.testFailed(test, 'Failed to parse a checkout submit form');
      return callback(null, null, null, null);    
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
    console.log(' :: ' + test +' ::');
    
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
    console.log(' :: ' + test +' ::');
    
    controller.reqAndLog(test, {
      uri    : '/checkout/confirm',
      method : 'GET',
    }, callback);
  }
}

exports.receipt = {
  dependencies: [],
  
  exec : function(error, response, body, callback) {
    var test = testClass + '.receipt';
    console.log(' :: ' + test +' ::');
    
    controller.reqAndLog(test, {
      uri    : '/checkout/confirm',
      method : 'GET'
    }, callback);
  }
}