var request    = require('request').defaults({ jar: true, followAllRedirects: true })
  , _          = require('lodash')
  , tests      = require(__dirname + '/tests')()
  , program    = require('commander')
  , helpers    = require(__dirname + '/lib/helpers')
  , logger     = require(__dirname + '/lib/logger')
  , controller = require(__dirname + '/lib/controller')
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
  .option('-r, --random',        'Make nav selections/submissions by parsing a random selection when possible')
  .option('-i, --ignore',        'Ignore the config settings (config settings overwrite command line settings')
  .option('-s  --single [name]',        'Run the single test identified using the config values')
  .option('-o  --port',          'make requests to the specified port')
  .option('-h  --host',          'make requests to the specified host')
  .option('-u  --useReal',       'use real credential in checkout (you will be prompted before confirm)')
  .option('-p  --product [pid]', 'Specify a product for add to cart. overrides other add to cart/pdp settings')
  .parse(process.argv);
  
program.on('--help', function () {
  exitWMsg('usage: node tests [test name] [optional:test set; default: fullTest]\n' + testList(), 0)
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

var singleTest = program.single
if(singleTest) {
  if (!tests[testName][singleTest]) {
    exitWMsg('The individial test ' + singleTest + ' was not found in the test object' + testName + '\n', 1);
  }
  title = testName + '.' + singleTest
}

//
// parse and store test configuration variables
//
var config = utils.loadJson(__dirname)

controller.host           = program.host || config.host || 'localhost'
controller.port           = program.port || config.port || '4000'
controller.random         = program.random
controller.ignoreSettings = program.ignore
controller.realCreds      = program.useReal
controller.addProduct     = program.product

logger.initTestSet(testName, controller.host,controller.port)

//
// execute the test
//
if (singleTest) {
  var testSet = [tests[testName][singleTest]()];  
} else {
  var testSet = tests[testName].fullTest();
}

controller.execSet(testSet)
