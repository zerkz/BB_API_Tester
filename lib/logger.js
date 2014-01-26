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

logDir  = process.cwd() + '/logs/';

var jsonLog    = logDir + 'log.json'
  , htmlLog    = logDir + 'log.html'
  
module.exports = {
  //
  // log file helpers
  //
  initTestSet       : initTestSet,
  pushTest          : pushTest,
  
  //
  // 
  //
  setComplete       : setComplete,
  printSetNames     : printSetNames,
  printDetails      : printDetails,
  printTitle        : printTitle,
  printError        : printError,
  printWarning      : printWarning,
  printNotification : printNotification,
  
  //
  // debugging helpers
  //
  printKeys         : printKeys,
  printValues       : printValues
}

//////////////////////////////////////////////////////////////////
//
//  LOG FILE HELPERS
//
//////////////////////////////////////////////////////////////////

//
// logs a pushes a test onto the log array, saves it, and updates the log files
//
function pushTest (test) {
  
  if(Object.keys(test.response.error).length) {
    printWarning('(' + test.response.status + ')\n' + JSON.stringify(test.response.error, null, '  '), true);
    
  } else if(Object.keys(test.error).length) {
    printWarning('(' + test.response.status + ')\n' + JSON.stringify(test.error, null, '  '));
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
function initTestSet (title, host, port) {
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
function setComplete () {
  console.log('\nTest set complete');
  console.log('HTML: ' + server.getLink());
  console.log('JSON: ' + 'file://' + process.cwd() + '/logs/log.json\n');
  
  server.close();
}

//
// print the names of the tests being executed
//
function printSetNames (set) {
  console.log('Tests in the set: ')
  _.each(set, function (test, index) {
    if (!(test && test())) {
      console.log('  ! undefined') 
    } else {
      console.log('  + ' + test().name);
    }
  });
}

//
// print details in green
//
function printDetails (req) {
  console.log(('\n  ' + req.method + ' ' + req.uri).green);
}

//
// print titles in blue
//
function printTitle (title) {
  console.log(('\n:::: ' + title + '  ::::::::::::::::  ').blue)
}

//
// print errors in red
//
function printError (error, response) {
  if (response) {
    error = 'The server returned - ' + error;
  }
  console.log(('\nERROR: ' + error + '\n').red);
}

//
// print warnings in yellow
//
function printWarning (warning, response) {
  if (response) {
    warning = 'The server returned - ' + warning;
  }
  console.log(('\nWARNING: ' + warning + '\n').yellow);
}

//
// prints a message in grey text
//
function printNotification (note) {
  console.log(('\n  ' + note).grey)
}

//////////////////////
//
// DEBUGGING HELPERS
//
//////////////////////


function printKeys (obj) {
  console.log('keys:');
  
  if (typeof obj === 'string') {
    console.log('string');
    return;
  }
  
  _.each(obj, function (value, key) {
    console.log('  ' + key);
  })
}

function printValues (obj) {
  console.log('values:');
  
  _.each(obj, function (value, key) {
    console.log(value);
  })
}