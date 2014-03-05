var helpers    = require(process.cwd() + '/lib/helpers')
  , controller = require(process.cwd() + '/controller')
  , logger     = require(process.cwd() + '/logger/logger')
  , utils      = require(process.cwd() + '/lib/testUtilities')
  
////// request setup //////

var testClass = 'cart';

// load config values
var config = utils.loadJson(__dirname)
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
      controller.reqAndLog(show.name, {
        uri    : '/checkout/cart',
        method : 'GET'
      }, callback);
    }
  };
}
    

//
// adds an item to the cart
//   dependencies:
//
function add () {
  var tests = require(process.cwd() + '/tests')()
  return {
    name       : testClass + '.add',
    dependency : tests.products.variation || tests.products.pdp, //if the variation route exits, use it
    exec       : function (error, response, body, callback) {
      // set up request according to settings
      if(utils.applyConfig(forms.add)) { 
        var form = forms.add
      } else {
        form = utils.propFromBody(body, ['variations'], ['availability', 'online', 'forms', 'add_to_cart'], controller.random)
        
        if (!form) {
          form = utils.getSubPropFromBody(body, ['availability', 'online', 'forms', 'add_to_cart'])
        } 
      }
      
      // validate request setup
      if (!(form && form.action && form.method && form.inputs)) {
        controller.testFailed(add.name, 'Failed to parse a cart add form', callback);
      }
      
      form.inputs.qty = 4
      
      controller.reqAndLog(add.name, {
        uri    : form.action,
        method : form.method,
        form   : form.inputs
      }, callback);
    } 
  }
}

function update () {
  return {
    name          : testClass + '.update',
    dependency    : show,
    cartDependant : true,
    exec          : function(error, response, body, callback) {    
      // set up request according to settings
      if(utils.applyConfig(forms.add)) { 
        var form = forms.add
      } else {
        var product = utils.propFromBody(body, ['products'], [], controller.random)
        
        if(product)  {
          // get the current quantity
          var qty = utils.getSubProp(product, ['quantity']);
          qty = qty ? qty + 1 : Math.floor(Math.random() * (5));
        
          // add the updated quantity to the form
          form = utils.getSubProp(product, ['forms', 'update_quantity']);
          if(form) {
            var inputs = utils.getSubProp(form, ['inputs'])
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
      // set up request according to settings
      if(utils.applyConfig(forms.add)) { 
        var form = forms.add
      } else {
        form = utils.propFromBody(body, ['products'], ['forms', 'remove_from_cart'], controller.random)
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
}