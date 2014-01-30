var helpers    = require(process.cwd() + '/lib/helpers')
  , controller = require(process.cwd() + '/controller')
  , logger     = require(process.cwd() + '/logger/logger')
  , tests      = require(process.cwd() + '/tests')()
  , utils      = require(process.cwd() + '/lib/testUtilities');
  
////// request setup //////

var testClass = 'session';

// load config values
var config    = utils.loadJson(__dirname)
  , urls      = config.urls
  , forms     = config.requiredForms
  , orderId   = config.orderId
  , acntOrder = config.accntOrderId
  
/////// exports //////

module.exports = {
  fullTest      : fullTest,
  
  // individual
  singleOrder   : singleOrder,
  accountOrders : accountOrders,
  accountOrder  : accountOrder
}
  
////// full test set //////

function fullTest () { 
  return [
    singleOrder,
    tests.session.login,
    accountOrders,
    accountOrder
  ];
}

////// individual tests //////

function singleOrder () {
  return {
    name : testClass + '.singleOrder',
    exec : function(error, response, body, callback) {
      if (!orderId) {
        return controller.testFailed(exports.singleOrder.name, 'Failed to parse an order ID from the config', callback);
      }
      
      url = '/orders/' + orderId;    
      
      controller.reqAndLog(exports.singleOrder.name, {
        uri    : uri,
        method : 'GET'
      }, callback);
    }
  }
}
 
function accountOrders () {
  return {
    name             : testClass + '.accountOrders',
    sessionDependant : true,
    exec             : function(error, response, body, callback) {
      controller.reqAndLog(exports.accountOrders.name, {
        uri    : '/account/orders',
        method : 'GET',
      }, callback);
    } 
  }
}
 
function accountOrder () {
  return {
    name             : testClass + '.accountOrder',
    dependency       : accountOrders,
    sessionDependant : true,
    exec             : function(error, response, body, callback) {
      // set up request according to settings
      if(utils.applyConfig(acntOrder)) { 
        var url = '/account/orders' + acntOrder.id
      } else {
        url = utils.propFromBody(body, ['orders'], ['href'], controller.random)
      }
      
      // validate request setup
      if (!url) {
        controller.testFailed(exports.add.name, 'Failed to parse an order id', callback);
      }
      
      controller.reqAndLog(exports.accountOrder.name, {
        uri    :  url,
        method : 'GET'
      }, callback);
    }
  }
}