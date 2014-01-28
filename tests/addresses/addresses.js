var helpers    = require(process.cwd() + '/lib/helpers')
  , controller = require(process.cwd() + '/lib/controller')
  , logger     = require(process.cwd() + '/lib/logger')
  , tests      = require(process.cwd() + '/tests')()

var testClass = 'addressed';

// load config values
var config = helpers.loadJson(__dirname)
  , type   = config.type
  , url    = config.urls[type]
  , forms  = config.requiredForms

//
// test a standard suite of requests
//
exports.fullTest = function () {
  controller.execSet([
    tests.session.login,
    this.show,
    // this.remove,
    // this.add,
    this.update,
    // this.remove
  ]);
}
 
//
// individual requests to be used in both custom and standard test suites
//
exports.show = {
  name         : testClass + '.show',
  dependencies : [],
  exec         : function(error, response, body, callback) {
    logger.printTitle(exports.show.name);
    
    controller.reqAndLog(exports.show.name, {
      uri    : url,
      method : 'GET'
    }, callback);
  }
}

exports.add = {
  name         : testClass + '.add',
  dependencies : [],
  exec         : function(error, response, body, callback) {
    logger.printTitle(exports.add.name);
    
    controller.reqAndLog(exports.add.name, {
      uri    : url,
      method : 'POST',
      form   : forms.add
    }, callback);
  }
}

exports.update = {
  name         : testClass + '.update',
  dependencies : [this.show],
  exec         : function(error, response, body, callback) {
    logger.printTitle(exports.update.name);
    
    // set up request according to settings
    var form = helpers.propFromBody(body, ['addresses'], ['forms', 'update_address'], controller.random)
    
    form.inputs = helpers.mergeObj(form.inputs, forms.update);
    
    // validate request setup
    if (!(form && form.action && form.method && form.inputs)) {
      controller.testFailed(exports.add.name, 'Failed to parse a cart add form', callback);
    }
    
    controller.reqAndLog(exports.update.name, {
      uri    : form.action,
      method : form.method,
      form   : form.inputs
    }, callback);
  }
}

exports.remove = {
  name         : testClass + '.remove',
  dependencies : [],
  exec         : function(error, response, body, callback) {
    logger.printTitle(exports.remove.name);
    
    controller.reqAndLog(exports.remove.name, {
      uri    : url,
      method : 'DELETE',
      form   : forms.remove
    }, callback);
  }
}