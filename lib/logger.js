var fs     = require('fs')
  , moment = require('moment')
  
// ------------------------------------
// Logger
//
// functions for logging results.
// -------------------------------------

exports.verbose = false

//
// wipes away the old log results
//
exports.reset = function () {
  fs.writeFileSync('./log.txt', '');
}

//
// appends to the log file
// if all is true, log to the terminal as well
//
exports.log = function (data, all) {
  fs.appendFile('./log.txt', data);
  if (all) console.log(data);
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
  fs.appendFile('./log.txt', error);
  console.log(error);
}