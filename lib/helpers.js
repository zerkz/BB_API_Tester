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
  _.each(require(process.cwd() + '/tests'), function (value, key) {
    string += '\n    ' + key;
  })
  return string;
}