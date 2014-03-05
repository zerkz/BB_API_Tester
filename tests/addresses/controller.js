var helpers    = require(process.cwd() + '/lib/helpers')
  , controller = require(process.cwd() + '/controller')
  , logger     = require(process.cwd() + '/logger/logger')
  , tests      = require(process.cwd() + '/tests')()
  , utils      = require(process.cwd() + '/lib/testUtilities')

////// request setup //////

var testClass = 'addresses';

// load config values
var config = utils.loadJson(__dirname)
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
  remove   : remove,
  
  //custom
  makeDefault : makeDefault
}
  
////// full test set //////

function fullTest () {
  return [
    tests.session.login,
    show,
    remove,
    add,
    update,
    makeDefault,
    remove
  ];
}

////// individual tests //////

function show () {
  return {
    name : testClass + '.show',
    exec : function (error, response, body, callback) {
      controller.reqAndLog(show.name, {
        uri    : url,
        method : 'GET'
      }, callback);
    }
  }
}

function add () {
  return {
    name : testClass + '.add',
    exec : function (error, response, body, callback) {
      controller.reqAndLog(add.name, {
        uri    : url,
        method : 'POST',
        form   : forms.add
      }, callback);
    }
  }
}

function update () {
  return {
    name       : testClass + '.update',
    dependency : show,
    exec       : function (error, response, body, callback) {
      
      // set up request according to settings
      var form = utils.propFromBody(body, ['addresses'], ['forms', 'update'], controller.random)
      
      form.inputs = helpers.mergeObj(form.inputs, forms.update);
      
      if (!(form && form.action && form.method && form.inputs)) {
        controller.testFailed(add.name, 'Failed to parse an address update form', callback);
      }
      
      controller.reqAndLog(update.name, {
        uri    : form.action,
        method : form.method,
        form   : form.inputs
      }, callback);
    }
  }
}

function makeDefault () {
  return {
    name       : testClass + '.makeDefault',
    dependency : show,
    exec       : function (error, response, body, callback) {
      
      // set up request according to settings
      var form = utils.propFromBody(body, ['addresses'], ['forms', 'update'], controller.random)
      
      form.inputs = helpers.mergeObj(form.inputs, forms.update);
      
      if (!(form && form.action && form.method && form.inputs)) {
        controller.testFailed(add.name, 'Failed to parse an address update form', callback);
      }
      
      form.inputs.is_default = true;
      
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
    name : testClass + '.remove',
    exec : function (error, response, body, callback) {
      controller.reqAndLog(remove.name, {
        uri    : url,
        method : 'DELETE',
        form   : forms.remove
      }, callback);
    }
  }
}