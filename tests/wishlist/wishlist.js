var helpers    = require(process.cwd() + '/lib/helpers')
  , controller = require(process.cwd() + '/lib/controller')
  , logger     = require(process.cwd() + '/lib/logger')
  , tests      = require(process.cwd() + '/tests')()
  , utils      = require(process.cwd() + '/lib/testUtilities')

////// request setup //////
  
var testClass = 'wishlist';

// load config values
  var config = utils.loadJson(__dirname)
    , url    = config.urls
    , forms  = config.forms

////// exports //////

module.exports = {
  fullTest : fullTest,
  
  //individual
  add      : add,
  update   : update,
  remove   : remove
}

////// full test set //////

function fullTest() {
  return [
    tests.session.login,
    add,
    update,
    remove,
  ];
}

////// individual tests //////

function show () {
  return {
    name       : testClass + '.show',
    dependency : tests.session.login,
    exec       : function (error, response, body, callback) {
      controller.reqAndLog(show.name, {
        uri    : '/account/wishlist',
        method : 'GET'
      }, callback);
    }
  }
}
    
function add () {
  return {
    name       : testClass + '.add',
    dependency : tests.products.pdp,
    exec       : function(error, response, body, callback) {
      // set up request according to settings
      if(utils.applyConfig(forms.add)) { 
        var form = forms.add
      } else {
        form = utils.propFromBody(body, ['variations'], ['availability', 'online', 'forms', 'add_to_cart'], controller.random)
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
}

function update () {
  return {
    name       : testClass + '.update',
    dependency : show,
    exec       : function(error, response, body, callback) {
      // set up request according to settings
      if(utils.applyConfig(forms.add)) { 
        var form = forms.add
      } else {
        var product = utils.propFromBody(body, ['products'], [], controller.random)
        
        if(product)  {
          // get the current quantity
          var qty = utils.getSubProp(product, ['quantity']);
          qty = qty ? qty + 1 : Math.floor(Math.random() * (10));
        
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

function remove () {
  return {
    name       : testClass + '.remove',
    dependency : show,
    exec       : function(error, response, body, callback) {
      logger.printTitle(remove.name);
      
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
