var helpers    = require(process.cwd() + '/lib/helpers')
  , controller = require(process.cwd() + '/controller')
  , logger     = require(process.cwd() + '/logger/logger')
  , tests      = require(process.cwd() + '/tests')()
  , utils      = require(process.cwd() + '/lib/testUtilities')

////// request setup //////

var testClass = 'shipping_methods';
  
// load config values
var config = utils.loadConfig(__dirname)
  , forms  = config.forms

////// exports //////

module.exports = {
  fullTest : fullTest,
  
  //individual
  show  : show,
  apply : apply,
}

////// full test set //////

function fullTest () {
  return [
    show,
    apply,
    show,
  ];
}

////// individual tests //////

function show () {
  return {
    name : testClass + '.show',
    exec : function(error, response, body, callback) {
      controller.reqAndLog(show.name, {
        uri    : '/checkout/shipping_methods',
        method : 'GET'
      }, callback);
    }
  }
}

function apply () {
  return {
    name       : testClass + '.apply',
    dependency : show,
    exec       : function(error, response, body, callback) {
      // set up request according to settings
      if (utils.applyConfig(forms.method)) {
        var form  = forms.method;
        
      } else {
        var options = utils.getPrePostProp(body, ['buckets'], ['options'], controller.random)
          , condition = { //only select if ('selected' == true) == false
              key   : 'selected',
              value : true,
              equal : false  
            }
          , method  = utils.getPropertyFromList(options, [], controller.random, condition)
        
        form = utils.getSubProp(method, ['forms', 'edit_shipping'])
      }
      
      // validate request setup
      if (!(form && form.method && form.action && form.inputs)) {
        return controller.testFailed(apply.name, 'Failed to parse a shipping form', callback);
      }
      
      controller.reqAndLog(apply.name, {
        uri    : form.action,
        method : form.method,
        form   : form.inputs
      }, callback);
    }
  }
}
