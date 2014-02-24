var helpers    = require(process.cwd() + '/lib/helpers')
  , controller = require(process.cwd() + '/controller')
  , logger     = require(process.cwd() + '/logger/logger')
  , tests      = require(process.cwd() + '/tests')()
  , utils      = require(process.cwd() + '/lib/testUtilities');
  
  
//account giftcards

exports.accountGiftcards = function () {
  return [
    tests.giftcard.accntShow,
    tests.giftcard.accntApply,
    tests.session.login,
    tests.giftcard.accntShow,
    tests.giftcard.accntApply,
  ]
}   