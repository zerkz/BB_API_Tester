//////////////////////////////////////////////////////////////////
//
//  LOGGER
//
//     Logs test results to logger.js. Sends the same results to
//     The socket opened by baseLog.html for clean display
//
//////////////////////////////////////////////////////////////////

var fs        = require('fs')
  , moment    = require('moment')
  , hljs      = require('highlight.js')
  , colors    = require('colors')
  , app       = require('express')()
  , http      = require('http')
  , server    = http.createServer(app)
  , io        = require('socket.io').listen(server);


//////////////////////////////////////////////////////////////////
//
//  MODULE GLOBALS
//
//////////////////////////////////////////////////////////////////

exports.logDir  = process.cwd() + '/logs/';

var jsonLog    = exports.logDir + 'log.json'
  , htmlLog    = exports.logDir + 'log.html'
  , liveServer = null


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
  
  initServer(6000)
}

function save (data) {
  fs.writeFileSync(jsonLog, JSON.stringify(data, null, '\t'));
}

//////////////////////////////////////////////////////////////////
//
//  LOG HTML HELPERS
//
//////////////////////////////////////////////////////////////////

function initServer(port) {
  liveServer = app.listen(port);
  
  // reset the html log
  fs.writeFileSync(htmlLog, fs.readFileSync(process.cwd() + '/log_utils/baseLog.html'));

    console.log(process.cwd() + '/logs/baseLog.html')
  app.get('/', function (req, res) {
    console.log(process.cwd() + '/logs/baseLog.html')
    res.sendfile(process.cwd() + '/logs/baseLog.html');
  });

  io.sockets.on('connection', function (socket) {
    socket.emit('news', { hello: 'world' });
    socket.on('my other event', function (data) {
      console.log(data);
    });
  });
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
  console.log('HTML: ' + 'http://localhost:'+ liveServer.address().port);
  console.log('JSON: ' + 'file://' + process.cwd() + '/logs/log.json\n');
  
  liveServer.close();
}

//
// print titles in blue
//
exports.printTitle = function (title) {
  console.log((':::: ' + title + '  ::::::::::::::::  ').blue)
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