var helpers    = require(process.cwd() + '/lib/helpers')
  , controller = require(process.cwd() + '/controller')
  , logger     = require(process.cwd() + '/logger/logger')
  , prompt     = require('prompt')
  , tests      = require(process.cwd() + '/tests')()
  , utils      = require(process.cwd() + '/lib/testUtilities')
  , _          = require('lodash');
  
////// request setup //////

var testClass = 'miscellaneous';

// load config values
var config        = utils.loadJson(__dirname)
  , requiredForms = config.requiredForms

////// exports //////

module.exports = {
  emailSignup     : emailSignup,

  showContactUs   : showContactUs,
  submitContactUs : submitContactUs,

  showCatalog        : showCatalog,
  submitCatalog      : submitCatalog,
  submitCatalogOrder : submitCatalogOrder,
  submitCatalogAdd   : submitCatalogAdd
}

////// individual tests //////
 
//
// Email Signup
//

function emailSignup () {
  return {
    name : testClass + '.emailSignup',
    exec : function (error, response, body, callback) {

      // validate request setup
      if (!(requiredForms.emailSignup)) {
        return controller.testFailed(this.name, 'Failed to parse an email signup form', callback);
      }

      controller.reqAndLog(this.name, {
        uri    : '/email',
        method : 'POST',
        form   : requiredForms.emailSignup
      }, callback);
    }
  }
}


//
// Contact Us
//

 
function showContactUs () {
  return {
    name : testClass + '.contactUs',
    exec : function (error, response, body, callback) {
      controller.reqAndLog(this.name, {
        uri    : '/contact_us',
        method : 'GET'
      }, callback);
    }
  }
}

 
function submitContactUs () {
  return {
    name       : testClass + '.contactUs',
    dependency : showContactUs,
    exec       : function (error, response, body, callback) {
      var form = requiredForms.contactUs;

      // validate request setup
      if (!(requiredForms.emailSignup)) {
        return controller.testFailed(this.name, 'Failed to parse an contact us form', callback);
      }

      form.topic = utils.getPrePostProp(body, ['topics'], ['value'], controller.random);


      controller.reqAndLog(this.name, {
        uri    : '/contact_us',
        method : 'POST',
        form   : form
      }, callback);
    }
  }
}


//
// Catalog
//

 
function showCatalog () {
  return {
    name : testClass + '.catalog',
    exec : function (error, response, body, callback) {
      controller.reqAndLog(this.name, {
        uri    : '/catalog',
        method : 'GET'
      }, callback);
    }
  }
}

 
function submitCatalog () {
  return {
    name       : testClass + '.catalog',
    dependency : showCatalog,
    exec       : function (error, response, body, callback) {
      var form = requiredForms.catalog;

      // validate request setup
      if (!(requiredForms.emailSignup)) {
        return controller.testFailed(this.name, 'Failed to parse an catalog form', callback);
      }

      _.each(utils.getSubProp(body, ['parts']), function (part) {
        if (part) { form.parts.push(part.inputs); }
      })

      controller.reqAndLog(this.name, {
        uri    : '/catalog',
        method : 'POST',
        form   : form
      }, callback);
    }
  }
}
 
function submitCatalogOrder () {
  return {
    name       : testClass + '.catalogOrder',
    exec       : function (error, response, body, callback) {
      var form = requiredForms.submitCatalogOrder;

      // validate request setup
      if (!form) {
        return controller.testFailed(this.name, 'Failed to parse a catalog order form', callback);
      }

      controller.reqAndLog(this.name, {
        uri    : '/catalog_order',
        method : 'POST',
        form   : form
      }, callback);
    }
  }
}


function submitCatalogAdd () {
  return {
    name       : testClass + '.catalogOrder',
    dependency : submitCatalogOrder,
    exec       : function (error, response, body, callback) {
      var json     = utils.parseJson(body)
        , products = json ? json.products : []
        , form     = {}

      // map the products to the form
      form.products = _.compact(_.map(products, function (product) {
        if (product.catId) {
          return {
            id  : product.catId,
            qty :  controller.random ? utils.randomInt(5) : 1
          }
        } else { logger.printWarning('Product (' + product.id + ') missing catId');  }
      }))

      // validate request setup
      if (!form.products.length) {
        return controller.testFailed(this.name, 'Failed to parse a catalog order form', callback);
      }

      controller.reqAndLog(this.name, {
        uri    : '/catalog_order/add',
        method : 'POST',
        form   : form
      }, callback);
    }
  }
}

