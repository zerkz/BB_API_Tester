var helpers    = require(process.cwd() + '/lib/helpers')
  , controller = require(process.cwd() + '/lib/controller')
  , logger     = require(process.cwd() + '/lib/logger')
  , tests      = require(process.cwd() + '/tests')()

////// request setup //////

var testClass = 'addressed';

// load config values
var config = helpers.loadJson(__dirname)
  , type   = config.type
  , url    = config.urls[type]
  , forms  = config.requiredForms

////// exports //////

module.exports = {
  fullTest : fullTest,
  
  //individual tests
  show     : show,
  add      : add,
  update   : update,
  remove   : remove
}

////// full test set //////

var fullTest = [
  tests.session.login,
  show,
  remove,
  add,
  update,
  remove
]

////// individual tests //////

var show = {
  name : testClass + '.show',
  exec : function (error, response, body, callback) {
    controller.reqAndLog(show.name, {
      uri    : url,
      method : 'GET'
    }, callback);
  }
}

var add = {
  name : testClass + '.add',
  exec : function (error, response, body, callback) {
    controller.reqAndLog(add.name, {
      uri    : url,
      method : 'POST',
      form   : forms.add
    }, callback);
  }
}

var update = {
  name       : testClass + '.update',
  dependency : show,
  exec       : function (error, response, body, callback) {
    
    // set up request according to settings
    var form = helpers.propFromBody(body, ['addresses'], ['forms', 'update_address'], controller.random)
    
    form.inputs = helpers.mergeObj(form.inputs, forms.update);
    
    if (!(form && form.action && form.method && form.inputs)) {
      controller.testFailed(add.name, 'Failed to parse a cart add form', callback);
    }
    
    controller.reqAndLog(update.name, {
      uri    : form.action,
      method : form.method,
      form   : form.inputs
    }, callback);
  }
}

var remove = {
  name : testClass + '.remove',
  exec : function (error, response, body, callback) {
    controller.reqAndLog(remove.name, {
      uri    : url,
      method : 'DELETE',
      form   : forms.remove
    }, callback);
  }
}