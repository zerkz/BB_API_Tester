//////////////////////////////////////////////////////////////////
//
//  LOGGER
//
//     Logs test results to logger.js. Sends the same results to
//     The socket opened by baseLog.html for clean display
//
//////////////////////////////////////////////////////////////////



var app       = require('express')()
  , http      = require('http')
  , server    = http.createServer(app)
  , io        = require('socket.io').listen(server)
  , fs        = require('fs');
  

//////////////////////////////////////////////////////////////////
//
//  MODULE GLOBALS
//
//////////////////////////////////////////////////////////////////


var liveServer = null
  , logPath    = null
  
  

//////////////////////////////////////////////////////////////////
//
//  MODULE GLOBALS
//
//////////////////////////////////////////////////////////////////


exports.init = function (port, path) {
  liveServer = app.listen(port);
  
  logPath = path

  app.get('/', function (req, res) {
    res.sendfile(process.cwd() + '/logs/baseLog.html');
  });

  io.sockets.on('connection', function (socket) {
    socket.emit('news', { hello: 'world' });
    socket.on('my other event', function (data) {
      console.log(data);
    });
  });
}

exports.close = function () {
  liveServer.close();
}

exports.getLink = function () {
  return 'http://localhost:'+ liveServer.address().port
}

exports.sendRefresh = function () {
  // TODO: ping the html page to refresh from the logPath
}