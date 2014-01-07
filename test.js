var request = require('request')
  , _       = require('lodash')
  , tests   = require(__dirname + '/tests')()
  , program = require('commander')
  , moment  = require('moment')
  , helpers = require(__dirname + '/lib/helpers')
  , logger  = require(__dirname + '/lib/logger')
  , tester  = require(__dirname + '/lib/tester')
  
//
// simplify helper function calls
//
var testList = helpers.testList
  , exitWMsg = helpers.exitWMsg

//
// set up command line compatibility
//
program.version('0.0.1')
  .usage('[test name]\n' + testList())
  .option('-a, --append',  'Set the logger to append, instead of overwrite')
  .option('-v, --verbose', 'Set the logger to log request information as well as results')
  .option('-p, --parse',   'Parse form inputs form the previous result, when possible')
  .option('-r, --random',  'Make nav selections/submissions by parsing a random selection when possible')
  .option('-i, --ignore',  'Ignore the config settings (config settings overwrite command line settings')
  .parse(process.argv);
  
program.on('--help', function () {
  exitWMsg('usage: node tests [test name]\n' + testList(), 0)
});

//
// validate the test request
//
if (process.argv.length < 3){
  exitWMsg('A test must be specified' + testList(), 1);
}

var testName = process.argv[2];
if (!tests.hasOwnProperty(testName)) {
  exitWMsg('The test ' + program.test + 
              ' was not found in the set of supported tests\n' + 
              testList(), 1);
}

//
// parse and store test configuration variables
//
var config = helpers.loadJson(__dirname)

tester.host           = config.host
tester.parse          = program.parse
tester.random         = program.random
tester.ignoreSettings = program.ignore
console.log('-' + tester.ignoreSettings)

//
// set up the logger based on command line params
//
if(!program.append) logger.reset();

logger.verbose = program.verbose;
  
logger.logHeader('\nTest set: ' + testName.toUpperCase());
logger.logSubHeader('\nStart time ' + moment().format());


//
// execute the test
//
tests[testName].fullTest();