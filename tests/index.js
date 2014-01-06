module.exports = exports = function () {
  return {
    addresses : require(__dirname + '/addresses/addresses'),
    session   : require(__dirname + '/session/session'),
    cart      : require(__dirname + '/cart/cart'),
    custom    : require(__dirname + '/custom/custom'),
  };
}