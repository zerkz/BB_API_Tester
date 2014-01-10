var helpers = require(process.cwd() + '/lib/helpers')
  , controller  = require(process.cwd() + '/lib/controller')

var testClass = 'checkout';
  
//
// load config values
//
var config         = helpers.loadJson(__dirname)
  , requiredForms  = config.forms

//
// test a standard quite of requests
//
exports.fullTest = function () {
  controller.execSet([
    this.submit,
    this.review,
    this.confirm,
    this.receipt
  ]);
}
 
//
// individual requests to be used in both custom and standard test suites
//
exports.submit = {
  dependencies: [],
  
  exec : function(error, response, body, callback) {
    var test = testClass + 'submit';
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
      uri    : 'checkout/cc',
      method : 'POST',
      form   : form
    }, callback);
  }
}

exports.review = {
  dependencies: [],
  
  exec : function(error, response, body, callback) {
    var test = testClass + 'review';
    console.log(' :: ' + test +' ::');
    
    controller.reqAndLog(test, {
      uri    : 'checkout/confirm',
      method : 'GET'
    }, callback);
  }
}

exports.confirm = {
  dependencies: [],
  
  exec : function(error, response, body, callback) {
    var test = testClass + 'confirm';
    console.log(' :: ' + test +' ::');
    
    controller.reqAndLog(test, {
      uri    : 'checkout/confirm',
      method : 'POST',
      form   : form
    }, callback);
  }
}

exports.receipt = {
  dependencies: [],
  
  exec : function(error, response, body, callback) {
    var test = testClass + 'receipt';
    console.log(' :: ' + test +' ::');
    
    controller.reqAndLog(test, {
      uri    : 'checkout/confirm',
      method : 'GET'
    }, callback);
  }
}