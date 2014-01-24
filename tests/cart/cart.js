var helpers    = require(process.cwd() + '/lib/helpers')
  , controller = require(process.cwd() + '/lib/controller')
  , logger     = require(process.cwd() + '/lib/logger')
  , tests      = require(process.cwd() + '/tests')()
  
////// request setup //////

var testClass = 'cart';

// load config values
var config = helpers.loadJson(__dirname)
  , url    = config.urls
  , forms  = config.forms
  
////// exports //////

module.exports = {
  fullTest : fullTest,
  
  // individual
  show     : show,
  add      : add,
  update   : update,
  remove   : remove
}

////// full test set //////
  
var fullTest = [
  add,
  update,
  remove,
];
  
////// individual tests //////

//
// shows the contents of a cart
//
var show = {
  name : testClass + '.show',
  exec : function(error, response, body, callback) {
    controller.reqAndLog(show.name, {
      uri    : '/checkout/cart',
      method : 'GET'
    }, callback);
  }
}
    

//
// adds an item to the cart
//   dependencies:
//
var add = {
  name       : testClass + '.add',
  dependency : tests.products.pdp,
  exec       : function (error, response, body, callback) {
    // set up request according to settings
    if(helpers.applyConfig(forms.add)) { 
      var form = forms.add
    } else {
      form = helpers.propFromBody(body, ['variations'], ['availability', 'online', 'forms', 'add_to_cart'], controller.random)
    }
    
    // validate request setup
    if (!(form && form.action && form.method && form.inputs)) {
      controller.testFailed(add.name, 'Failed to parse a cart add form', callback);
    }
    
    controller.reqAndLog(add.name, {
      uri    : form.action,
      method : form.method,
      form   : form.inputs
    }, callback);
  } 
}

var update = {
  name          : testClass + '.update',
  dependency    : show,
  cartDependant : true,
  exec          : function(error, response, body, callback) {    
    // set up request according to settings
    if(helpers.applyConfig(forms.add)) { 
      var form = forms.add
    } else {
      var product = helpers.propFromBody(body, ['products'], [], controller.random)
      
      if(product)  {
        // get the current quantity
        var qty = helpers.getSubProp(product, ['quantity']);
        qty = qty ? qty + 1 : Math.floor(Math.random() * (10));
      
        // add the updated quantity to the form
        form = helpers.getSubProp(product, ['forms', 'update_quantity']);
        if(form) {
          var inputs = helpers.getSubProp(form, ['inputs'])
          form.inputs = inputs ? inputs : {};
          form.inputs.qty = qty
        }
     }
    }
    
    // validate request setup
    if (!(form && form.action && form.method && form.inputs)) {
      return controller.testFailed(update.name, 'Failed to parse a cart update form', callback);
    }
    
    controller.reqAndLog(update.name, {
      uri    : form.action,
      method : form.method,
      form   : form.inputs
    }, callback);
  }
}

//
// updates an item to the cart
//
var remove = {
  name          : testClass + '.remove',
  dependency    : show,
  cartDependant : true,
  exec          : function(error, response, body, callback) {    
    // set up request according to settings
    if(helpers.applyConfig(forms.add)) { 
      var form = forms.add
    } else {
      form = helpers.propFromBody(body, ['products'], ['forms', 'remove_from_cart'], controller.random)
    }
    
    // validate request setup
    if (!(form && form.action && form.method && form.inputs)) {
      controller.testFailed(remove.name, 'Failed to parse a cart remove form', callback);
    }
    
    controller.reqAndLog(remove.name, {
      uri    : form.action,
      method : form.method,
      form   : form.inputs
    }, callback);
  }
}