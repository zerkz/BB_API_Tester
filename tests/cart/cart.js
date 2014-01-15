var helpers    = require(process.cwd() + '/lib/helpers')
  , controller = require(process.cwd() + '/lib/controller')
  , logger     = require(process.cwd() + '/lib/logger')
  , tests      = require(process.cwd() + '/tests')()
  
var testClass = 'cart';

// load config values
var config         = helpers.loadJson(__dirname)
  , url            = config.urls
  , forms          = config.forms
  
//
// test a standard suite of requests
//
exports.fullTest = function () {
  //base test set
  var testSet = [
        this.add,
        this.show,
        this.update,
        this.show,
        this.remove,
      ];
      
  //
  // only navigate to cats and pdp if no custom form is being used,
  // or the user chose ot ignore config settings
  //
  if (!forms.add.apply || controller.ignoreSettings) {
    testSet.unshift(tests.products.pdp)
    testSet.unshift(tests.products.index)
    //testSet.unshift(tests.categories.subcats)
    testSet.unshift(tests.categories.cats)
  }
  testSet.unshift(this.show)
  
  controller.execSet(testSet);
}
   
//
// individual requests to be used in both custom and standard test suites
//

//
// shows the contents of a cart
//   dependencies:
//     none
//
exports.show = {
  dependencies : [],
  
  exec :function(error, response, body, callback) {
    var test = testClass + '.show';
    logger.printTitle(test);
    
    controller.reqAndLog(test, {
      uri    : '/checkout/cart',
      method : 'GET'
    }, callback);
  }
}
    

//
// adds an item to the cart
//   dependencies:
//     -there must be a valid form in the config if the user set useCustomForm to true in config
//
exports.add = {
  dependencies: [ 
                  tests.categories.cats, 
                  tests.categories.subcats, 
                  tests.products.index,
                  tests.products.pdp
                ],
                
  exec : function(error, response, body, callback) {
    var test = testClass + '.add';
    logger.printTitle(test);
    
    // set up request according to settings
    if(helpers.applyConfig(forms.add)) { 
      var form = forms.add
    } else {
      form = helpers.propFromBody(body, ['variations'], ['availability', 'online', 'forms', 'add_to_cart'], controller.random)
    }
    
    // validate request setup
    if (!(form && form.action && form.method && form.inputs)) {
      controller.testFailed(test, 'Failed to parse a cart add form', callback);
    }
    
    controller.reqAndLog(test, {
      uri    : form.action,
      method : form.method,
      form   : form.inputs
    }, callback);
  } 
}

//
// updates an item to the cart
//   dependencies:
//     -there must be a valid form in the config if the user set useCustomForm to true in config
//
exports.update = {
  dependencies : [this.show],
  
  exec : function(error, response, body, callback) {
    var test = testClass + '.update';
    logger.printTitle(test);
    
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
      return controller.testFailed(test, 'Failed to parse a cart update form', callback);
    }
    
    controller.reqAndLog(test, {
      uri    : form.action,
      method : form.method,
      form   : form.inputs
    }, callback);
  }
}

//
// updates an item to the cart
//     -there must be a valid form in the config if the user set useCustomForm to true in config
//
exports.remove = {
  dependencies : [this.show],
  
  exec : function(error, response, body, callback) {
    var test = testClass + '.remove';
    logger.printTitle(test);
    
    // set up request according to settings
    if(helpers.applyConfig(forms.add)) { 
      var form = forms.add
    } else {
      form = helpers.propFromBody(body, ['products'], ['forms', 'remove_from_cart'], controller.random)
    }
    
    // validate request setup
    if (!(form && form.action && form.method && form.inputs)) {
      controller.testFailed(test, 'Failed to parse a cart remove form', callback);
    }
    
    controller.reqAndLog(test, {
      uri    : form.action,
      method : form.method,
      form   : form.inputs
    }, callback);
  }
}