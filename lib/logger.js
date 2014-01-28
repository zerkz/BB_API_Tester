//////////////////////////////////////////////////////////////////
//
//  LOGGER
//
//     Logs test results to logger.js. Sends the same results to
//     The socket opened by baseLog.html for clean display
//
//////////////////////////////////////////////////////////////////

var fs     = require('fs')
  , moment = require('moment')
  , hljs   = require('highlight.js')
  , colors = require('colors')
  , server = require(__dirname + '/simpleServer')
  , _      = require('lodash');


//////////////////////////////////////////////////////////////////
//
//  MODULE GLOBALS
//
//////////////////////////////////////////////////////////////////

exports.logDir  = process.cwd() + '/logs/';

var jsonLog    = exports.logDir + 'log.json'
  , htmlLog    = exports.logDir + 'log.html'


//////////////////////////////////////////////////////////////////
//
//  LOG FILE HELPERS
//
//////////////////////////////////////////////////////////////////

//
// logs a pushes a test onto the log array, saves it, and updates the log files
//
exports.pushTest = function (test) {
  
  if(Object.keys(test.response.error).length) {
    exports.printWarning('(' + test.response.status + ')\n' + JSON.stringify(test.response.error, null, '  '), true);
    
  } else if(Object.keys(test.error).length) {
    exports.printWarning('(' + test.response.status + ')\n' + JSON.stringify(test.error, null, '  '));
  }
  
  var json = JSON.parse(fs.readFileSync(jsonLog));
  try {
    json.tests.push(test);
    save(json);
    
    //
    // TODO: socket IO
    //
    
  } catch (e) {
    console.log('could not save test [' + test.name + '] due to error: \n' + e);
  }
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
  
  server.init(6000, process.cwd() + '/logs/log/json');
}

function save (data) {
  fs.writeFileSync(jsonLog, JSON.stringify(data, null, '\t'));
}



//////////////////////////////////////////////////////////////////
//
//  CONSOLE LOG HELPERS
//
//////////////////////////////////////////////////////////////////

//
// prints that the tests have completed
//
exports.setComplete = function () {
  console.log('\nTest set complete');
  console.log('HTML: ' + server.getLink());
  console.log('JSON: ' + 'file://' + process.cwd() + '/logs/log.json\n');
  
  server.close();
}

//
// print the names of the tests being executed
//
exports.printSetNames = function (set) {
  console.log('Tests in the set: ')
  _.each(set, function (test, index) {
    console.log('  + '+test.name);
  });
}

//
// print details in green
//
exports.printDetails = function (req) {
  console.log(('\n  ' + req.method + ' ' + req.uri).green);
}

//
// print titles in blue
//
exports.printTitle = function (title) {
  console.log(('\n:::: ' + title + '  ::::::::::::::::  ').blue)
}

//
// print errors in red
//
exports.printError = function (error, response) {
  if (response) {
    error = 'The server returned - ' + error;
  }
  console.log(('\nERROR: ' + error + '\n').red);
}

//
// print warnings in yellow
//
exports.printWarning = function (warning, response) {
  if (response) {
    warning = 'The server returned - ' + warning;
  }
  console.log(('\nWARNING: ' + warning + '\n').yellow);
}