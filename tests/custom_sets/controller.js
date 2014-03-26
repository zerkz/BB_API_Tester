var helpers    = require(process.cwd() + '/lib/helpers')
  , controller = require(process.cwd() + '/controller')
  , logger     = require(process.cwd() + '/logger/logger')
  , utils      = require(process.cwd() + '/lib/testUtilities');
  
  
//account giftcards

exports.accountGiftcards = function () {
  var tests = require(process.cwd() + '/tests')()
  return [
    tests.giftcard.accntShow,
    tests.giftcard.accntApply,
    tests.session.login,
    tests.giftcard.accntShow,
    tests.giftcard.accntApply,
  ]
}   


exports.makeDefault = function () {
  var tests = require(process.cwd() + '/tests')()
  return [
    tests.session.login,
    tests.addresses.makeDefault,
  ];
}

exports.giftcardCheckout = function () {
  var tests = require(process.cwd() + '/tests')()
  return [
    test.checkout.submit
  ];
}

exports.updateShipWCard = function () {
  var tests = require(process.cwd() + '/tests')()
  return [
    tests.checkout.submit,
    tests.giftcard.apply,
    tests.shipping_methods.apply,
    tests.checkout.review,
    tests.shipping_methods.apply,
    tests.checkout.review,
    tests.shipping_methods.apply,
    tests.checkout.review,
  ];
}

exports.statelessCart = function () {
  var tests = require(process.cwd() + '/tests')()
  return [
    tests.cart.add,
    tests.cart.show,
    tests.cart.add,
    tests.cart.show
  ];
}

exports.accountAddresses = function () {
  var tests = require(process.cwd() + '/tests')()
  return [
    tests.session.login,
    tests.addresses.add,
    tests.addresses.show
  ];
}


exports.brokenCheckout = function () {
  var tests = require(process.cwd() + '/tests')()
  return [
    tests.cart.add,
    tests.cart.show,
    tests.cart.add,
    tests.cart.show,
    tests.checkout.submit,
    tests.checkout.review,
    tests.checkout.confirm,
  ];
}