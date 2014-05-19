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
var config        = utils.loadJson(__dirname)
  , requiredForms = config.requiredForms
  , forms         = config.forms

////// exports //////

module.exports = {
  fullTest     : fullTest,
  addressTest  : addressTest,
  giftwrapTest : giftwrapTest,
  
  // individual
  submit   : submit,
  review   : review,
  confirm  : confirm,
  receipt  : receipt,

  // custom
  billing         : billing,
  get_addressbook : get_addressbook,
  edit_billing    : edit_billing,
  get_giftwrap    : get_giftwrap,
  set_giftwrap    : set_giftwrap,
  credit_card     : credit_card,
  specialEvent    : specialEvent
}

////// full test set //////

function fullTest () {
  var testSet = [
        billing,
        review,
        confirm
      ];

  // depending on the state of the site, multiple requests may be needed to force a false order through
  // if (!controller.realCreds){
  //   testSet.push(review);
  //   testSet.push(confirm);
  //   testSet.push(review);
  //   testSet.push(confirm);
  // }

  return testSet;
}

function addressTest () {
  return [
    billing,
    review,
    get_addressbook,
    edit_billing,
    review
  ];
}

function giftwrapTest () {
  return [
    tests.cart.toggleGift,
    billing,
    review,
    get_giftwrap,
    set_giftwrap,
    get_giftwrap
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
        var form = utils.loadJson(__dirname, 'local.json').realCreds
      } else {
        form = requiredForms.fakeCreds
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
        , cc   = requiredForms.credit_card;
      
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

function billing () {
  return {
    name          : testClass + '.billing',
    cartDependant : true,
    exec          : function (error, response, body, callback) {
      // set up request according to settings
      var form = requiredForms.billing;

      // validate request setup
      if (!(form)) {
        return controller.testFailed(this.name, 'Failed to parse a checkout billing form', callback);
      }

      var orderId = utils.getSubProp(body, ['forms', 'checkout', 'cc', 'inputs', 'orderId']);
      form.orderId = orderId;

      controller.reqAndLog(this.name, {
        uri    : '/checkout/billing',
        method : 'POST',
        form   : form
      }, callback);
    }
  }
}

function get_addressbook () {
  return {
    name          : testClass + '.get_addressbook',
    exec          : function (error, response, body, callback) {
      controller.reqAndLog(this.name, {
        uri    : '/checkout/get_addressbook',
        method : 'GET'
      }, function(err, e, r, b) {
        // chain saved data along from previous response
        r.saved_data = response.saved_data || {};
        return callback(err, e, r, b);
      });
    }
  }
}

function edit_billing () {
  return {
    name          : testClass + '.edit_billing',
    exec          : function (error, response, body, callback) {
      // get the edit form and a random address from the address book
      var form    = requiredForms.edit_billing
        , address = utils.getPrePostProp(body, ['addresses'], [], controller.random);

      // validate request setup
      if (!(form && address)) {
        return controller.testFailed(this.name, 'Failed to parse a checkout billing form', callback);
      }

      form.addrId = address.addressId;
      form.orderId = response.saved_data && response.saved_data.orderId;
      form.primary = address.primary;
      form.addressType = address.addressType;

      controller.reqAndLog(this.name, {
        uri    : '/checkout/edit_billing',
        method : 'POST',
        form   : form
      }, function(err, e, r, b) {
        // chain saved data along from previous response
        r.saved_data = response.saved_data || {};
        return callback(err, e, r, b);
      });
    }
  }
}

function get_giftwrap () {
  return {
    name          : testClass + '.get_giftwrap',
    exec          : function (error, response, body, callback) {
      var orderId = response.saved_data && response.saved_data.orderId;
      controller.reqAndLog(this.name, {
        uri    : '/checkout/get_giftwrap',
        qs     : { orderId : orderId },
        method : 'GET'
      }, function(err, e, r, b) {
        // chain saved data along from previous response
        r.saved_data = response.saved_data || {};
        return callback(err, e, r, b);
      });
    }
  }
}

function set_giftwrap () {
  return {
    name : testClass + '.set_giftwrap',
    exec : function (error, response, body, callback) {
      var form = {};

      form.orderId = utils.getSubProp(body, ['orderId']);
      form.gift = {};

      var addrId = utils.getPrePostProp(body, ['destinations'], ['addrId'])
        , item   = utils.getPrePostProp(body, ['destinations'], ['items']) || [{}];
      item = item.shift();

      form.gift['#' + addrId] = {
        option        : 2,
        remove_prices : true,
        item          : {},
        box           : {
          '#1' : {
            id    : item.id,
            msg   : 'gift test gift test gift test',
            style : utils.getPrePostProp(body, ['boxoptions'], ['value'], controller.random)
          }
        }
      };

      form.gift['#' + addrId].item['#' + item.pieceId] = 1;

      controller.reqAndLog(this.name, {
        uri    : '/checkout/set_giftwrap',
        method : 'POST',
        form   : form
      }, function(err, e, r, b) {
        // chain saved data along from previous response
        r.saved_data = response.saved_data || {};
        return callback(err, e, r, b);
      });
    }
  }
}

// credit card submits the order
function credit_card () {
  return {
    name          : testClass + '.credit_card',
    exec          : function (error, response, body, callback) {
      var form = requiredForms.credit_card;

      // validate request setup
      if (!(form)) {
        return controller.testFailed(this.name, 'Failed to parse a checkout billing form', callback);
      }

      controller.reqAndLog(this.name, {
        uri    : '/checkout/credit_card',
        method : 'POST',
        form   : form
      }, callback);
    }
  }
}

// adds a special event to the order to order submission
function specialEvent () {
  return {
    name          : testClass + '.specialEvent',
    dependency    : billing,
    cartDependant : true,
    exec          : function (error, response, body, callback) {
      var ccForm    = requiredForms.credit_card
        , eventForm = requiredForms.specialEvent
        , form      = _.assign(ccForm, eventForm);

      // validate request setup
      if (!(form)) {
        return controller.testFailed(this.name, 'Failed to parse a checkout checkout cc/special event form', callback);
      }

      controller.reqAndLog(this.name, {
        uri    : '/checkout/credit_card',
        method : 'POST',
        form   : form
      }, callback);
    }
  }
}
