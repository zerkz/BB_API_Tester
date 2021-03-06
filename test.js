var request    = require('request').defaults({ jar: true, followAllRedirects: true })
  , _          = require('lodash')
  , tests      = require(__dirname + '/tests')()
  , program    = require('commander')
  , helpers    = require(__dirname + '/lib/helpers')
  , logger     = require(__dirname + '/logger/logger')
  , controller = require(__dirname + '/controller')
  , utils      = require(process.cwd() + '/lib/testUtilities');
  
//
// simplify helper function calls
//
var testList = helpers.testList
  , exitWMsg = controller.exitWMsg

//
// set up command line compatibility
//
program.version('0.0.1')
  .usage('[test name]\n' + utils.testList())
  .option('-r  --random',        'Make nav selections/submissions by parsing a random selection when possible')
  .option('-i  --ignore',        'Ignore the config settings (config settings overwrite command line settings')
  .option('-s  --single [name]', 'Run the single test identified using the config values')
  .option('    --port',          'Make requests to the specified port')
  .option('-h  --host',          'Make requests to the specified host')
  .option('-u  --useReal',       'Use real credential in checkout (you will be prompted before confirm)')
  .option('-p  --product [pid]', 'Specify a product for add to cart. overrides other add to cart/pdp settings')
  .option('-a  --all',           'Log all tests executed')
  .option('-c  --consoleLog',    'Log out relevant tests to the console')  
  .option('-l  --login',    'Login when prompted')  
  .parse(process.argv);
  
program.on('--help', function () {
  exitWMsg('usage: node tests [test name] [optional:test set; default: fullTest]\n' + utils.testList(), 0)
});

//
// validate the test request
//
if (process.argv.length < 3){
  exitWMsg('A test must be specified' + utils.testList(), 1);
}

var testName = process.argv[2];
if (!tests.hasOwnProperty(testName)) {
  exitWMsg('The test ' + program.test + 
              ' was not found in the set of supported tests\n' + 
              utils.testList(), 1);
}

var singleTest = program.single
if(singleTest) {
  if (!tests[testName][singleTest]) {
    exitWMsg('The individial test ' + singleTest + ' was not found in the test object ' + testName + '\n', 1);
  }
  title = testName + '.' + singleTest
}

//
// parse and store test configuration variables
//
var config = utils.loadConfig(__dirname)

controller.setHost(program.host || config.host || 'localhost')
controller.setPort(program.port || config.port || '4000')

controller.random         = program.random
controller.realCreds      = program.useReal
controller.addProduct     = program.product
controller.logAll         = program.all
controller.login         = program.login
controller.excluded       = config.excluded


// logger configuration
logger.consoleLog = program.consoleLog
logger.initTestSet(testName, config.host,config.port)

//
// execute the test
//
if (singleTest) {
  // if its truly a single test, it should have an exec function.
  if (tests[testName][singleTest]().exec) {
    // wrap it in an array
    var testSet = [tests[testName][singleTest]];  
    
  } else {
    //otherwise, execute it  
    var testSet = tests[testName][singleTest]();  
  }
  
} else {
  var testSet = tests[testName].fullTest();
}
controller.execSet(testSet)
