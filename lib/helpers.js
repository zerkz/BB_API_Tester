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
  mergeObj           : mergeObj
}


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
