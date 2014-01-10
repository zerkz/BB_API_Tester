var fs     = require('fs')
  , moment = require('moment')
  , hljs   = require('highlight.js')
  , markup = require(__dirname + '/simpleMarkup.js');
  
// ------------------------------------
// Logger
//
// functions for logging results.
// -------------------------------------

exports.verbose = false
exports.logDir  = process.cwd() + '/logs/';

//
// wipes away the old log results
//
exports.reset = function () {
  write('');
}

//
// encapsulate chunks into divs for simple viewing
//
exports.headingBlock = function (heading) {
  var html   = markup.subHeader(heading.test)
    , string = heading.test
    
  html   += markup.marker( heading.route)
  string += heading.route
     
  append(string, markup.genDiv(html, ['headingBlock']));
}

exports.requestBlock = function (request) {  
  var html   = markup.marker(':: Request Form ::<br>' + request.form)
    , string = '::Request Form ::\n' + request.form
    
  html   += markup.marker(':: Request Query ::<br>' + request.query) 
  string += ':: Request Query ::\n' + request.query
     
  append(string, markup.genDiv(html, ['requestBlock']));
  append('', markup.divider());
}

exports.responseBlock = function (response) {
  var html   = markup.marker(':: Response Status ::<br>' + response.status)
    , string = '::Response Status ::\n' + response.status
    
  html   += markup.marker(':: Response Status ::') + '<br>' + markup.code(hljs.highlightAuto(response.body).value);
  string += ':: Response Body ::\n' + response.status
     
  append(string, markup.genDiv(html, ['responseBlock']));
  append('', markup.divider());
}

//
// appends to the log file
// if all is true, log to the terminal as well
//
exports.log = function (data, all) {
  append(data);
  if (all) console.log(data);
}
exports.logHeader = function (data, all) {
  append(data, markup.header(data));
  console.log(data);
}
exports.logSubHeader = function (data, all) {
  append(data, markup.subHeader(data));
  console.log(data);
}

//
// only writes to the file if the logger is set to verbose logging
//
exports.optionalLog = function (data, all) {
  if (this.verbose) this.log(data, all)
}

//
// appends and prints the error messages
//
exports.error = function (error, callback) {
  append(error, markup.error(error));
  console.log(error);

  callback(error);
}

function write (data) {
  fs.writeFileSync(exports.logDir + 'log.txt', '');
  fs.writeFileSync(exports.logDir + 'log.html', markup.headers());
}

function append (data, html) {
  fs.appendFile(exports.logDir + 'log.txt', data);
  
  if (html) {
    fs.appendFile(exports.logDir + 'log.html', html);
  } else {
    fs.appendFile(exports.logDir + 'log.html', data.replace('\n', '<br>'));
  }
}
