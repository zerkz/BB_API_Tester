# BB API Tester

This repo is a self contained tester for the Branding Brand API. It provides both individual navigations and sets of pre-set test suites. Custom test suites can be created as well. The logger will print the name of the suite executed as well as each (core) individual test executed as they are performed. log.txt will contain the full test result (response body)

test suite example: 
```javascript
  [
    tests.session.login,
    show,
    remove,
    add,
    update,
    remove
  ]
```

## Quick Start

Fork, clone, and npm install. Config files in each tests directory can be changed for a merchant. Simpy change `apply:false` to `apply:true` in a config file to use that form or url. Look at the options for more thorough testing instructions


sample test `node test cart -r`

## Options

**Usage:** `node test [testName]`
    where `[testName]` is `/test/[testName]/[testName].js`

**comman line options:** 

* `-r`, `--random`              Make nav selections/submissions by parsing a random selection when possible
* `-i`, `--ignore`              Ignore the config settings (config settings overwrite command line settings
* `-s`, `--single`              Run a single test. Dependencies will be added to the testset if the config is not used
* `--port`                      make requests to the specified port
* `-h`, `--host`                make requests to the specified host
* `-u`, `--useReal`             use real credential in checkout (you will be prompted before confirm)
* `-p [pid]`, `--product [pid]` use the product at the specified PDP for cart additions
* `-a`, `--all`                 Log all tests executed (only core tests are logged by default)
* `-c`, `--consoleLog`          Log out relevant tests to the console (only core tests are logged by default)


**Helpful functions**

The following helpers are in place to prevent the tests from erroring out if the json returned is abnormal. None of the folloing functions will throw errors if the object being parsed doesnt exist. Each function check for existence before executing selection

  * `utils.getSubProp(obj, chain)`
    * attempts to get the object at the end of the property chain (chain) for the objects (obj)

  * `utils.getProperty(list, propChain, random, condition)`
    * selects an element from that array, the first by default, and random if random is true
    * returns the object ad the end of the property chain
    * checks that the (optional) condition is met
      ```
      condition = {
        key   : 'propertyName',
        value : 'ValueTestedAgainst'
        equal : true/false
      }
      ```
    
    
  * `utils.propFromBody(body, preChain, postChain, random, index)`
    * parses the json body for an array at the end of the property chain (preChain)
    * selects an element from that array, the first by default, and random if random is true
    * selects a specific index if index has a value (overrides random)
    * finds the object at the end property chain (postChain), for the index selected
    
example from products.js: `url = utils.propFromBody(body, ['categories'], ['href'], controller.random)`

## TODO

* see the [issues page](https://github.com/johnhof/BB_API_Tester/issues?state=open) for the current improvement queue
