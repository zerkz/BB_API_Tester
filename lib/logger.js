var fs     = require('fs')
  , moment = require('moment')
  , hljs   = require('highlight.js')
  , colors = require('colors');
  
// ------------------------------------
// Logger
//
// functions for logging results.
// -------------------------------------

exports.logDir  = process.cwd() + '/logs/';

var jsonLog = exports.logDir + 'log.json'
  , htmlLog = exports.logDir + 'log.html'

//
//
//
exports.pushTest = function (test) {
  var json = JSON.parse(fs.readFileSync(jsonLog));
  try {
    json.tests.push(test);
    save(json);
  } catch (e) {
    console.log('could not save test [' + test.name + '] due to error: \n' + e);
  }
}

exports.printError = function (error) {
  console.log(('\nERROR: ' + error + '\n').red);
}

//
// sets up the test logs, and internal representation
//
exports.initTestSet = function (title, host, port) {
  //write the test info to the log
  save({
    title : title.toUpperCase(),
    time  : moment().format(),
    host  : host,
    port  : port,
    tests : []
  });
  
  // reset the html log
  fs.writeFileSync(htmlLog, fs.readFileSync(__dirname + '/baseLog.html'));
}

function save (data) {
  fs.writeFileSync(jsonLog, JSON.stringify(data, null, '\t'));
}

exports.printTitle = function (title) {
  console.log(('  :: ' + title + '  ::  ').green)
}

}