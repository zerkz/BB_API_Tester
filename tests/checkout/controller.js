var helpers    = require(process.cwd() + '/lib/helpers')
  , controller = require(process.cwd() + '/controller')
  , logger     = require(process.cwd() + '/logger/logger')
  , prompt     = require('prompt')
  , tests      = require(process.cwd() + '/tests')()
  , utils      = require(process.cwd() + '/lib/testUtilities')
  , _          = require('lodash');
  
////// request setup //////

var testClass = 'checkout';

// load config values
var config = utils.loadConfig(__dirname)
  , forms  = config.forms

////// exports //////

module.exports = {
  fullTest  : fullTest,
  
  // individual
  submit   : submit,
  review   : review,
  confirm  : confirm,
  receipt  : receipt,
}

////// full test set //////

function fullTest () {
  return [
    billing,
    review,
    confirm
  ];
}

////// individual tests //////
 
function submit () {
  return {
    name             : testClass + '.submit',
    cartDependant    : true,
    exec             : function(error, response, body, callback) {
      // set up request according to settings
      if (controller.realCreds) {
        var form = utils.loadConfig(__dirname, 'local.json').realCreds
      } else {
        form = forms.fakeCreds
      }
      
      // validate request setup
      if (!(form)) {
        return controller.testFailed(this.name, 'Failed to parse a checkout submit form', callback);
      }

      var orderId = utils.getSubProp(body, ['forms', 'checkout', 'cc', 'inputs', 'orderId']);
      form.orderId = orderId;

      controller.reqAndLog(this.name, {
        uri    : '/checkout/cc',
        method : 'POST',
        form   : form
      }, callback);
    }
  }
}

function review () {
  return {
    name : testClass + '.review',
    exec : function(error, response, body, callback) {
      controller.reqAndLog(this.name, {
        uri    : '/checkout/confirm',
        method : 'GET'
      }, function(err, e, r, b) {
        // orderId is used throughout checkout, we need to save it
        var json    = utils.parseJson(b)
          , orderId = json._bb_order_id;

        // chain saved data along from previous response
        r.saved_data = response.saved_data || {};
        r.saved_data.orderId = orderId;

        return callback(err, e, r, b);
      });
    }
  }
}

function confirm () {
  return {
    name : testClass + '.confirm',
    exec : function(error, response, body, callback) {
      // set up request according to settings
      var form = utils.getSubProp(body, ['forms', 'confirm_order'])
        , cc   = forms.credit_card;
      
      // validate request setup
      if (!(form && form.action && form.method && form.inputs && cc)) {
        return controller.testFailed(this.name, 'Failed to parse a confirm form', callback);
      }
      
      var request = {
            uri    : form.action,
            method : form.method,
            form   : _.defaults(cc, form.inputs)
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
          return controller.reqAndLog(this.name, request, callback);
        } else {
          return controller.testFailed(this.name, 'The order was canceled by the user', callback);
        }
      // if face creds were used, make the reust without prompting
      } else {
        return controller.reqAndLog(this.name, request, callback);
      }
    }
  }
}

function receipt () {
  return {
    name : testClass + '.receipt',
    exec : function(error, response, body, callback) {
      controller.reqAndLog(this.name, {
        uri    : '/checkout/receipt',
        method : 'GET',
      }, callback);
    }
  }
}

////// custom tests //////
