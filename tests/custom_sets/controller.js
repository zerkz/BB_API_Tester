var helpers    = require(process.cwd() + '/lib/helpers')
  , controller = require(process.cwd() + '/controller')
  , logger     = require(process.cwd() + '/logger/logger')
  , tests      = require(process.cwd() + '/tests')()
  , utils      = require(process.cwd() + '/lib/testUtilities');
  

exports.toggleGift = function  () {
  return [
    tests.cart.add,
    tests.cart.toggleGift,
    tests.cart.toggleGift,
    tests.cart.toggleGift
  ]
}
