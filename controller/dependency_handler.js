//////////////////////////////////////////////////////////////////
//
//  SETUP UTILITIES
//
//     utilities to facilitate test execution setup. Primarily
//     resolving around test dependencies
//
//////////////////////////////////////////////////////////////////

var logger = require(process.cwd() + '/logger/logger')
  , _      = require('lodash')


//////////////////////////////////////////////////////////////////
//
//  MODULE EXPORTS
//
//////////////////////////////////////////////////////////////////

module.exports = {
  //
  // module globals
  //
  cartReq    : cartReq,
  sessionReq : sessionReq,
  
  //
  // functions
  //
  init    : init,
  cart    : cart,
  session : session,
  parsing : parsing
}

//////////////////////////////////////////////////////////////////
//
//  MODULE GLOBALS
//
//////////////////////////////////////////////////////////////////

// assume no dependencies are required 
var cartReq    = false
  , sessionReq = false


//////////////////////////////////////////////////////////////////
//
//  CORE FUNCTIONS
//
//////////////////////////////////////////////////////////////////

//
// checks and caches dependencies of the test set
//
function init (testSet, callback) {
  var sessionMet = false
    , cartMet    = false;
     
  _.each(testSet, function (test, index) {
    testObj = test();
    
    if (/session.login/i.test(testObj.name)) sessionMet = true;
    if (/cart.add/i.test(testObj.name)) cartMet = true;
    
    if (testObj.cartDependant) cartReq = true;
    if (testObj.sessionDependant) sessionReq = true;
  });
  
  cartReq    = (cartReq && !cartMet);
  sessionReq = (sessionReq && !sessionMet);
  
  callback(null, testSet);
}

//
// if cart value is required, it is added
//
function cart (testSet, callback) {
  if (!cartReq) return callback(null, testSet);
  
  
  
  return callback(null, testSet);
}

//
// if a session is required, it is added
//
function session (testSet, callback) {
  if (!sessionReq) return callback(null, testSet);
  
  var tests = require(process.cwd() + '/tests')();
  testSet.unshift(tests.session.login());  
    
  return callback(null, testSet); 
}

//
// recursively fill dependencies required in each test
//
function parsing (testSet, callback) {
  testSet = fillInDependencies(testSet);
  
  return callback(null, testSet);
}


//////////////////////////////////////////////////////////////////
//
//   HELPERS
//
//////////////////////////////////////////////////////////////////


//
// checks if items are in the cart. if they aren't the add to cart testset is added
//
function verifyCartContent (testSet, callback) {  
  var tests   = require(process.cwd() + '/tests')()
    , fullAdd = false
  
  if (addProduct) {
    testSet.unshift(tests.cart.add());
    testSet.unshift(tests.products.pdp());
    return callback(testSet);
  }
  
  logger.printTitle('checking for cart content')
  // make sure an item is in the cart
  getBodyFromReq(tests.cart.show(), function (error, body){
    if (error) return;
        
    var result = null
    
    if (body && body.length) {
      var products = utils.getProperty(body, ['products'], random);
      
      // if there isn't an item in the cart, add it
      if ((products && !products.length) || !products) {
        fullAdd = true;
      }
    } else {
      fullAdd = true;
    }
    
    if (fullAdd) {
      logger.printNotification('No items in the cart. Cart add will be executed')
      testSet = addWithDependencies(function(){return {}}, tests.cart.add, []).concat(testSet);
    }    
    
    return callback(testSet);
  });
}

//
// iterates through and adds the dependencies missing from the testset
//
function fillInDependencies (set) { 
  var newSet = [];
  
  _.each(set, function (test, index) {
    var preceding = index > 0 ? set[index-1] : function(){return {}};
    newSet = addWithDependencies(preceding, test, newSet);
  })
  return newSet;
}

function addWithDependencies (preceding, current, set) {
  var dependencies = getDependencySet(preceding, current)
  
  set = set.concat(dependencies)
  set.push(current);
  return set
}

//
// adds dependencies, unless the dependency is met by the preceding test
//
function getDependencySet (preceding, current, testCluster) {
  if (!testCluster) testCluster = [];
  
  var preTest = preceding();
  var curTest = current();
    
  // return if there aren't dependencies, or the dependency is equal to the preceding
  if (!curTest.dependency || curTest.dependency === preTest) {
    return testCluster;
  
  // otherwise, add the dependency to the set
  } else{
    testCluster.unshift(curTest.dependency);
    return getDependencySet(current, curTest.dependency, testCluster);
  }
}