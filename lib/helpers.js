var _ = require('lodash')
  , fs = require('fs')


//
// loads the specified file as json, parses config.json by default
//
exports.loadJson = function (dir, file) {
  var file     = file ? file : 'config.json'
    , contents = fs.readFileSync(dir + '/' + file)
    , json     = JSON.parse(contents)
    
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
 return  array[Math.floor(Math.random() * (array.length + 1))]
}