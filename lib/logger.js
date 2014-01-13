var fs     = require('fs')
  , moment = require('moment')
  , hljs   = require('highlight.js')
  
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

exports.testFailed = function (name, error) {
  var test = this.newTest();
  
  if (typeof error === 'string') {
    error = {
      message: error
    }
  }
  console.log('\nERROR: ' + error.message + '\n');
  
  test.name  = name.toUpperCase();
  test.error = error; 
  
  
  this.pushTest(test);
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


//
// returns an empty test (avoids pointer issues)
//
exports.newTest = function () {
  return {
    name     : null,
    method   : null,
    route    : null,
    request  : {
      protocol : null,
      form     : {},
      query    : {}
    },
    response : {
      status : null,
      body   : {},
      error  : {}
    },
    error : {
      message: null
    }
  };
}