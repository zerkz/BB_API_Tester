var _           = require('lodash')
  , fs          = require('fs')
  , controller  = require(process.cwd() + '/controller')
  , lintJson    = require('json-lint')
  , logger      = require(process.cwd() + '/logger/logger')


//////////////////////////////////////////////////////////////////
//
//  MODULE EXPORTS
//
//////////////////////////////////////////////////////////////////


module.exports = {
  
  //
  // test initialization utilities
  //
  applyConfig         : applyConfig,
  parseJson           : parseJson,
  loadConfig          : loadConfig,
  testList            : testList,
  randomSelect        : randomSelect,
  getPrePostProp      : getPrePostProp,
  getPropertyFromList : getPropertyFromList,
  getSubProp          : getSubProp,
  randomInt           : randomInt
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
  if (typeof body !== 'string') { return body; }
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
  return (confVal.apply || controller.singleTest);
}

//
// loads the specified file as json, parses config.json by default
// returns error object if file cannot be parsed, up to calling functions check for it
//
function loadConfig (dir, file) {
  var file     = file ? file : 'config.json'
    , contents = fs.readFileSync(dir + '/' + file)
    , json

  try {
    json = JSON.parse(contents)
  } catch (e) {
    logger.printWarning('Error encountered when parsing ' + dir.replace(/.*\/test/, '/test') + '/' + file + '\n\t\t' + e);

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
//  OBJECY MANIPULATION UTILITIES
//
//////////////////////////////////////////////////////////////////

//
// tests if the object fits the condition passed in
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


//////////////////////////////////////////////////////////////////
//
//  UTILITIES
//
//////////////////////////////////////////////////////////////////


//
// wrapper for encapsulating random selection logic
//
function randomInt (upperLimit) {
  return Math.floor(Math.random() * (upperLimit));
}
function randomSelect (array) {
 return array [randomInt(array.length)];
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
function getPrePostProp (obj, preChain, postChain, random, index) {
  if(!(obj && preChain && preChain.length)) return false;

  if (typeof obj === 'string') { 
    obj = this.parseJson(obj);  
  }

  // if we reached the end of the chain, return the object
  if (!obj) { return false; }  

  var list = getSubProp(obj, preChain);
  return this.getPropertyFromList(list, postChain, random, index);
}

//
// description:
//    returns and element in the json from the array, at the property specified by chain
// params:
//    list   - list of properties being selected from
//    chain  - chain of properties from the array up to the property being returned 
//    random - if true, a random array element will be selected, otherwise, return the first
//
function getPropertyFromList (list, propChain, random, condition) {
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

// get the property at the end of the property chain
function getSubProp (obj, chain) {
  // parse the object if its a string
  if (typeof obj === 'string') {
    var original = obj;
    obj = module.exports.parseJson(obj); 
    if(obj.error) {
      return original;
    } 
  }
  // if we reached the end of the chain, return the object
  if (!(chain && chain.length)) { return obj; }  

  chainClone  = _.clone(chain, true)
  currentProp = chainClone.shift();
  
  // if the object has the next par of the chain, continue
  if (obj.hasOwnProperty(currentProp)) {
    return getSubProp(obj[currentProp], chainClone)
  }
  
  // otherwise, return false
  return false
}
