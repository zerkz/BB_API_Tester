# BB API Tester

This repo is a self contained tester for the Branding Brand API. It provides both individual navigations and sets of pre-set test suites. Custom test suites can be created as well. The logger will print the name of the suite executed as well as each individual test executed as they are performed. log.txt will contain the full test result (response body)

test suite example from addresses.js: 
```javascript

  controller.execSet([
    tests.session.login,
    this.show,
    this.remove,
    this.add,
    this.update,
    this.remove
  ]);
```

** Current State: **  Complete through cart

## Quick Start

Fork, clone, and npm install. If a branch exists for your merchant, you may be able to run tests to immediately. If youre merchant does not have a branch, the config files in each test directory will need to be updated for custom submissions for the merchants API. If you update a merchant's branch, be sure to commit so that others dont have to go make the same changes. Idealy, the person testing the PR should be able to pull the branch run the desired test set without any changes

## Options

**Usage:** `node test [testName]`
    where `[testName]` is `/test/[testName]/[testName].js` and the index is stored in `/tests/index.js`

**comman line options:** 

  .option('-s  --single',  'Run the single test identified using the config values')
  .option('-o  --port',       'make requests to the specified port')
  .option('-h  --host',    'make requests to the specified host')
  
* `-r`, `--random`  Make nav selections/submissions by parsing a random selection when possible
* `-i`, `--ignore`  Ignore the config settings (config settings overwrite command line settings
* `-s`, `--ignore`  Ignore the config settings (config settings overwrite command line settings
* `-o`, `--port`    make requests to the specified port
* `-h`, `--host`    make requests to the specified host'
  
## Adding Tests
  
Reference [this file](https://github.com/johnhof/BB_API_Tester/blob/master/tests/custom/custom.js) and its [config](https://github.com/johnhof/BB_API_Tester/blob/master/tests/custom/config.json) for an example on how tests should be layed out

**Helpful functions**

The following helpers are in place to prevent the tests from erroring out if the json returned is abnormal. None of the folloing functions will throw errors if the object being parsed doesnt exist. Each function check for existence before executing selection

  * `helpers.getSubProp(obj, chain)`
    * attempts to get the object at the end of the property chain (chain) for the objects (obj)

  * `helpers.getPropterty(list, propChain, random, index)`
    * selects an element from that array, the first by default, and random if random is true
    * selects a specific index if index has a value (overrides random)
    * finds the object at the end property chain (propChain), for the index selected
    
  * `helpers.propFromBody(body, preChain, postChain, random, index)`
    * parses the json body for an array at the end of the property chain (preChain)
    * selects an element from that array, the first by default, and random if random is true
    * selects a specific index if index has a value (overrides random)
    * finds the object at the end property chain (postChain), for the index selected
    
example from products.js: `url = helpers.propFromBody(body, ['categories'], ['href'], controller.random)`

## TODO

* add support for remianing core API

* add more options

* let individual tests be specified as a diff from the previous result (useful for things like address & cart additions/update/removal)

* add parser to format json log as a well formatted html file for easier viewing
