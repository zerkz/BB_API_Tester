var _           = require('lodash')
  , fs          = require('fs')
  , controller  = require(process.cwd() + '/lib/controller')
  , lintJson    = require('json-lint')


//////////////////////////////////////////////////////////////////
//
//  MODULE EXPORTS
//
//////////////////////////////////////////////////////////////////


module.exports = {
  
  //
  // test initialization utilities
  //
  applyConfig        : applyConfig,
  parseJson          : parseJson,
  loadJson           : loadJson,
  testList           : testList,
  
  //
  // test execution utilities
  //
  randomSelect       : randomSelect,
  propFromBody       : propFromBody,
  getProperty        : getProperty,
  getSubPropFromBody : getSubPropFromBody,
  getSubProp         : getSubProp,
  
  //
  // object manipulation utilities
  //
  mergeObj           : mergeObj
}

//////////////////////////////////////////////////////////////////
//
//  TEST INITIALIZATION UTILITIES
//
//////////////////////////////////////////////////////////////////

//
// attempts to parse json
//
function parseJson (body) {
  var lint = lintJson(body);
  
  if (lint.error) {
    return lint;
  } else {
    return JSON.parse(body);
  }
}

//
// returns whether or not to apply the config value
//
function applyConfig (confVal) {
  return ((confVal.apply && !controller.ignoreSettings) || controller.singleTest);
}

//
// loads the specified file as json, parses config.json by default
// returns error object if file cannot be parsed, up to calling functions check for it
//
function loadJson (dir, file) {
  var file     = file ? file : 'config.json'
    , contents = fs.readFileSync(dir + '/' + file)
    , json

  try {
    json = JSON.parse(contents)
  } catch (e) {
    return {
      failure: true,
      error: e
    };
  }
    
  return json;
}

//
// lists the supported tests
//
function testList () { 
  var string = '\n  The following test are supported'
  _.each(require(process.cwd() + '/tests')(), function (value, key) {
    string += '\n    ' + key;
  })
  return string;
}

//////////////////////////////////////////////////////////////////
//
//  TEST EXECUTION UTILITIES
//
//////////////////////////////////////////////////////////////////


//
// wrapper for encapsulating random selection logic
//
function randomSelect (array) {
 return array [Math.floor(Math.random() * (array.length))]
}

//
// description:
//    returns and element in the json from the array specified by the preChain,  at the property specified by postChain
// params:
//    body      - json to parse
//    preChain  - chain of properties up to array being selected from
//    postChain - chain of properties from the array up to the property being returned 
//    random    - if true, a random array element will be selected, otherwise, return the first
//    index     - return the array element at the index, overrites the random param
//
function propFromBody (body, preChain, postChain, random, index) {
  if(!(body && preChain && preChain.length)) return false;
  
  var list = getSubProp(this.parseJson(body), preChain);
  
  return this.getProperty(list, postChain, random, index);
}

//
// description:
//    returns and element in the json from the array, at the property specified by chain
// params:
//    list   - list of properties being selected from
//    chain  - chain of properties from the array up to the property being returned 
//    random - if true, a random array element will be selected, otherwise, return the first
//
function getProperty (list, propChain, random, condition) {
  if(!(list && list.length)) return false

  // compile a list of valid selections
  var result = false
    , array  = _.compact(_.map(list, function (obj, index) {
        var prop = getSubProp(obj, propChain);
        if (prop && fitsCondition(prop, condition)) return prop;
      }))
    
  //make sure there was a valid result
  if(array.length){
    if (random ) {
      result = this.randomSelect(array);
    } else {
      result = array[0];
    }
  }
  
  return result;
}

//
// gets the subproperty at the end of the chain
//
function getSubPropFromBody (body, chain) {
  var json = this.parseJson(body);
  
  if (!json) return false;
  
  return getSubProp(json, chain)
}
function getSubProp (obj, chain) {
  // if we reached the end of the chain, return the object
  if (!chain.length) {
    return obj;
  }  
  
  chainClone  = _.clone(chain, true)
  currentProp = chainClone.shift();
  
  // if the object has the next par of the chain, continue
  if (obj.hasOwnProperty(currentProp)) {
    return getSubProp(obj[currentProp], chainClone)
  }
  
  // otherwise, return false
  return false
}

//////////////////////////////////////////////////////////////////
//
//  OBJECY MANIPULATION UTILITIES
//
//////////////////////////////////////////////////////////////////

function mergeObj (obj1, obj2) {
  var obj3 = {};
  
  for (var attrname in obj1) { 
    obj3[attrname] = obj1[attrname]; 
  }
  
  for (var attrname in obj2) { 
    obj3[attrname] = obj2[attrname]; 
  }
  
  return obj3;
}


//
// tests if the object fits the condigion passed in
// condition = {
//   key   : name,
//   value : value,
//   equal : false/true  
// }
//
function fitsCondition (obj, condition) {
  if(condition && condition.hasOwnProperty('key') && condition.hasOwnProperty('value') && condition.hasOwnProperty('equal')) {
    var key   = condition.key
      , value = condition.value
      , equal = condition.equal
  } else return true;
  
  if (obj.hasOwnProperty(key)) {
    if ((obj[key] == value) != equal) {
      return false;
    }
  }
  return true;
}


//
// returns whether or not to apply the config value
//
function applyConfig (confVal) {
  return ((confVal.apply && !controller.ignoreSettings) || controller.singleTest);
}