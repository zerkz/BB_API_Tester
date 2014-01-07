# BB API Tester

This repo is a self contained tester for the Branding Brand API. It provides both individual navigations and sets of pre-set test suites. Custom test suites can be created as well. The logger will print the name of the suite executed as well as each individual test executed as they are performed. log.txt will contain the full test result (response body)

test suite example from addresses.js: 
```javascript

  tester.execSet([
    tests.session.login,
    this.show,
    this.remove,
    this.add,
    this.update,
    this.remove
  ]);
```

## Quick Start

Fork, clone, and npm install. If a branch exists for your merchant, you may be able to run tests to immediately. If youre merchant does not have a branch, the config files in each test directory will need to be updated for custom submissions for the merchants API. If you update a merchant's branch, be sure to commit so that others dont have to go make the same changes. Idealy, the person testing the PR should be able to pull the branch run the desired test set 

## Options

**Usage:** `node test [testName]`
    where `[testName]` is `/test/[testName]/[testName].js` and the index is stored in `/tests/index.js`

**comman line options:** 

* `-a`, `--append`  Set the logger to append, instead of overwrite
* `-v`, `--verbose` Set the logger to log request information as well as results
* `-p`, `--parse`   Parse form inputs form the previous result, when possible
* `-r`, `--random`  Make nav selections/submissions by parsing a random selection when possible
* `-i`, `--ignore`  Ignore the config settings (config settings overwrite command line settings

    
## Default Supported Test sets

addresses
  ```
  [
    tests.session.login,
    this.show,
    this.remove,
    this.add,
    this.update,
    this.remove
  ]
  ```

cart
  ```
  [
    this.show,
    this.add,
    this.update,
    this.remove,
  ]
  ```
  
categories
  ```
  [
    this.showCats,
    this.showSubcats,    
  ]
  ```
  
session
  ```
  [
    this.status,
    this.login,
    this.status,
    this.logout,
    this.status
  ]
  ```
  
## Adding Tests
  
All test which can be run from the command line must have the following properties
  * a dedicated js file 
    * containing the function `fullTest()` at the location `/tests/[name]/[name.js]`
    * a require mapping the test in `/tests/index.js`
      * eg: `[name] : require(__dirname + '/[name]/[name]')`
  * the ` fullTest() ` function must contain the following code
    * note that existing single tests can be required and added to custom test sets
    ```javascript
      function() {
        tester.execSet([
          this.[singleTest1],
          this.[singleTest2],
        ]);
      }
    ```
    
`/test/custom/custom.js` is a minimal example of what tests should look like

Single tests should generally have 3 parts
  * request setup. accounting for things like config settings, command line params, etc
  * validation of request properties
  * execution of request


## TODO

* add support for remianing core API

* let individual tests be specified as a diff from the previous result (useful for things like address & cart additions/update/removal)

* store log.txt as a formatted html page
  * let diffs and json be minimized for clean viewing of focus areas