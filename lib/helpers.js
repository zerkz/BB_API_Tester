var _        = require('lodash')
  , fs       = require('fs')
  , controller  = require(process.cwd() + '/lib/controller')
  , lintJson = require('json-lint')


//
// loads the specified file as json, parses config.json by default
// returns error object if file cannot be parsed, up to calling functions check for it
//
exports.loadJson = function (dir, file) {
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
// prints the message and exits with the status
//
exports.exitWMsg = function (string, status) {
  console.log(string);
  process.exit(status);
}

//
// lists the supported tests
//
exports.testList = function () { 
  var string = '\n  The following test are supported'
  _.each(require(process.cwd() + '/tests')(), function (value, key) {
    string += '\n    ' + key;
  })
  return string;
}

//
// parses the specified form from the body. takes the first form unless stated otherwise
// formNum == -1 requests a random form to be selected
//
exports.parseForm = function (body, specifier, formNum) {
  var regEx     = new RegExp(specifier, 'g')
    , formCount = body.test(regEx)
    , result    = {
        success  : false
      };
    
  // make sure the form is in the body
  if (!formCount) {
    result.message = 'the form specifier was not found in the body';
    
  // make sure the form number requested is present
  } else if(formCount < formNum) {
    result.message = 'the form specifier was found, but the requested form index(' + formNum + ') was out of bounds(' + formCount + ')';
  
  // if the previous checks passed, attempt to parse out the form
  } else {
  
    // if they requested a random form, generate a number in the bounds
    if (formNum === -1) {
      formNum = Math.floor(Math.random() * (formCount + 1))
    }
    
    // attempt to find and parse the requested form
    var formsFound = getNestedObjs(JSON.parse(body), specifier)
      , form       = formsFound[foromNum];
    
    // store the form and mark success if it was parsed
    if (form) {
      result.success = true;
      result.form    = form;
    
    // identify an unknown error if the form paring failed
    } else {
      result.message = 'the form specifier was identified as present, but not parsed in the body';
    } 
  }
  
  return result;
}

//
// returns the objects of the specified name in the nested object
//
exports.getNestedObjs = function (obj, specifier) {
  var array;
  objSearch(obj, specifier, array);
  return array;
}

//
// recursive function to execute the functionality of getNextedObj
//
exports.objSearch = function (obj, specifier, array) {
  //if this object has no value, return
  if (!obj) return;
  
  for (key in obj) {
    
    // if this is the object we want, add it and return 
    if (key == specifier) {
      array.push(obj[key]);
      continue;
      
    // if the object has values, and is not our target object, recurse
    } else if (obj[key]) {
      objSearch(obj[key], specifier, array);
      
    }
  }
  
  return;
}


//
// wrapper for encapsulating random selection logic
//
exports.randomSelect = function (array) {
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
exports.propFromBody = function (body, preChain, postChain, random, index) {
  if(!(body && preChain && preChain.length)) return false;
  
  var list = exports.getSubProp(this.parseJson(body), preChain);
  
  return this.getPropterty(list, postChain, random, index);
}

//
// description:
//    returns and element in the json from the array, at the property specified by chain
// params:
//    list   - list of properties being selected from
//    chain  - chain of properties from the array up to the property being returned 
//    random - if true, a random array element will be selected, otherwise, return the first
//    index  - return the array element at the index, overrites the random param
//
exports.getPropterty = function (list, propChain, random, index) {
  if(!(list && list.length)) return false

  // compile a list of valid selections
  var result = false
    , array  = _.compact(_.map(list, function (obj, index) {
    var prop = exports.getSubProp(obj, propChain);
    if(prop) return prop;
  }))
    
  //make sure there was a valid result
  if(array.length){
    if (random && !index) {
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
exports.getSubProp = function(obj, chain) {
  // if we reached the end of the chain, return the object
  if (!chain.length) {
    return obj;
  }  
  
  chainClone  = _.clone(chain, true)
  currentProp = chainClone.shift();
  
  // if the object has the next par of the chain, continue
  if (obj.hasOwnProperty(currentProp)) {
    return exports.getSubProp(obj[currentProp], chainClone)
  }
  
  // otherwise, return false
  return false
}

//
// attempts to parse json
//
exports.parseJson = function (body) {
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
exports.applyConfig = function (confVal) {
  return ((confVal.apply && !controller.ignoreSettings) || controller.singleTest);
}
