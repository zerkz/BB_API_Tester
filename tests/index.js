module.exports = exports = function () {
  return {
    addresses  : require(__dirname + '/addresses/addresses'),
    cart       : require(__dirname + '/cart/cart'),
    categories : require(__dirname + '/categories/categories'),
    checkout   : require(__dirname + '/checkout/checkout'),
    custom     : require(__dirname + '/custom/custom'),
    products   : require(__dirname + '/products/products'),
    session    : require(__dirname + '/session/session'),
    checkout   : require(__dirname + '/checkout/checkout'),
    
  };
}