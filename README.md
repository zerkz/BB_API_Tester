# BB API Tester

This repo is a self contained tester for the Branding Brand API. It provides both individual navigations and sets of pre-set test suites. Custom test suites can be created as well. The logger will print the name of the suite executed as well as each individual test executed as they are performed. log.txt will contain the full test result (response body)

test suite example from addresses.js: 
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

# Current State 
(* indicates not verified after refactoring)
- [x] Categories *
  - [x] categories *
  - [x] subcategories *
- [ ] Products *
  - [x] index *
  - [x] pdp *
  - [] search *
- [x] Cart *
  - [x] show *
  - [x] add *
  - [x] update *
  - [x] remove *
- [x] Checkout *
  - [x] submit *
  - [x] review *
  - [x] confirm *
  - [x] receipt *
- [x] Session *
  - [x] status *
  - [x] login *
  - [x] logout *
  - [x] signup *
- [x] orders *
  - [x] orders *
  - [x] single order *
- [x] promo *
- [ ] giftcard *
- [x] addresses *
  - [x] add *
  - [x] update *
  - [x] remove *


## Quick Start

Fork, clone, and npm install. Config files in each tests directory can be changed for a merchant. Simpy change `apply:false` to `apply:true` in a config file to use that form or url. Look at teh options for more thorough testing instructions

sample test `node test cart -r`

## Options

**Usage:** `node test [testName]`
    where `[testName]` is `/test/[testName]/[testName].js` and the index is stored in `/tests/index.js`

**comman line options:** 
  
* `-r`, `--random`  Make nav selections/submissions by parsing a random selection when possible
* `-i`, `--ignore`  Ignore the config settings (config settings overwrite command line settings
* `-s`, `--single`  Run a single test. Dependencies will be added to the testset if the config is not used
* `-p`, `--product` use the product at the specified PDP for cart additions
* `-o`, `--port`    make requests to the specified port
* `-h`, `--host`    make requests to the specified host'
  
## Adding Tests
  
Reference [this file](https://github.com/johnhof/BB_API_Tester/blob/master/tests/custom/custom.js) and its [config](https://github.com/johnhof/BB_API_Tester/blob/master/tests/custom/config.json) for an example on how tests should be layed out

**Important notes**
* sensitive information (such as real CC info) should be stored and parsed in local.json in the test directory. any file by this name will be ignored on commit

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
