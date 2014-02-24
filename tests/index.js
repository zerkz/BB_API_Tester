var _ = require('lodash');

module.exports = exports = function () {  
  var tests = {};
  
  _.each(require('fs').readdirSync(__dirname), function (name) {
    // ignore files
    if (!/\./.test(name)) {
      
      // get the controller for the test, and pass it to the callback
      tests[name] = require(__dirname + '/' + name + '/controller');
    }
  });
  
  return tests; 
}