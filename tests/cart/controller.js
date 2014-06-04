var helpers    = require(process.cwd() + '/lib/helpers')
  , controller = require(process.cwd() + '/controller')
  , logger     = require(process.cwd() + '/logger/logger')
  , utils      = require(process.cwd() + '/lib/testUtilities')
  
////// request setup //////

var testClass = 'cart'
  , config    = utils.loadConfig(__dirname)
  , forms     = config.forms
  
////// exports //////

module.exports = {
  fullTest : fullTest,
  
  // individual
  show       : show,
  add        : add,
  update     : update,
  remove     : remove,
}

////// full test set //////
  
function fullTest () {
  return [
    add,
    update,
    remove,
  ];
}

  
////// individual tests //////

//
// shows the contents of a cart
//
function show () {
 return {
    name : testClass + '.show',
    exec : function(error, response, body, callback) {
      return controller.reqAndLog(this.name, '/checkout/cart', null, callback);
    }
  };
}

//
// adds an item to the cart
//
function add () {
  var tests = require(process.cwd() + '/tests')()
  return {
    name       : testClass + '.add',
    dependency : tests.products.pdp, //if the variation route exits, use it
    exec       : function (error, response, body, callback) {
      var options = {};

      // if apply is true, use the config form
      if(utils.applyConfig(forms.add)) { 
        options.form = forms.add.value;

      // otherwise, parse the form from the body
      } else {
        options.form = utils.getPrePostProp(body, ['variations'], ['availability', 'online', 'forms', 'add_to_cart', 'inputs'], controller.random)
      }
      
      // validate and make request
      if (!options.form) {
        return controller.testFailed(this.name, 'Failed to parse a cart add form', callback);
      } else {      
        return controller.reqAndLog(this.name, '/checkout/cart', options, callback);
      }
    } 
  }
}

//
// updates a cart item
//
function update () {
  return {
    name          : testClass + '.update',
    dependency    : show,
    cartDependant : true,
    exec          : function(error, response, body, callback) {    
      var options = { method : 'PUT' };

      // set up request according to settings
      if(utils.applyConfig(forms.update)) { 
        options.form = forms.update.value
      } else {
        var product = utils.getPrePostProp(body, ['products'], [], controller.random)
        
        if(product)  {
          // get the current quantity
          var qty = utils.getSubProp(product, ['quantity']);
          qty = qty ? qty + 1 : Math.floor(Math.random() * (5));
        
          // add the updated quantity to the form
          options.form = utils.getSubProp(product, ['forms', 'update_quantity', 'inputs']);
          if(options.form) {
            options.form.qty = qty
          }
        }
      }
      
      // validate and make request
      if (!options.form) {
        return controller.testFailed(update.name, 'Failed to parse a cart update form', callback);
      } else {
        return controller.reqAndLog(update.name, '/checkout/cart', options, callback);
      }
    }
  }
}

//
// updates an item to the cart
//
function remove () {
  return {
    name          : testClass + '.remove',
    dependency    : show,
    cartDependant : true,
    exec          : function(error, response, body, callback) {  
      var options = { method : 'DELETE'};

      // if apply is true, use the config form
      if(utils.applyConfig(forms.add)) { 
        options.form = forms.add.value;

      // otherwise, parse the form from the body
      } else {
        options.form = utils.getPrePostProp(body, ['products'], ['forms', 'remove_from_cart', 'inputs'], controller.random)
      }
      
      // validate and make request
      if (!options.form) {
        return controller.testFailed(remove.name, 'Failed to parse a cart remove form', callback);
      } else {      
        return controller.reqAndLog(remove.name, '/checkout/cart', options, callback);
      }
    }
  }
}