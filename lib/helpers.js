var _           = require('lodash')
  , fs          = require('fs')
  , lintJson    = require('json-lint')


//////////////////////////////////////////////////////////////////
//
//  MODULE EXPORTS
//
//////////////////////////////////////////////////////////////////


module.exports = {
  mergeObj     : mergeObj,
  convertMilli : convertMilli
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

function convertMilli (duration) {
  var milliseconds = parseInt((duration%1000)/100)
      , seconds    = parseInt((duration/1000)%60)
      , minutes    = parseInt((duration/(1000*60))%60)
      , hours      = parseInt((duration/(1000*60*60))%24);

  hours   = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;

  return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
}
