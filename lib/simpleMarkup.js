var cheerio = require('cheerio')

  , code = '<pre><code></code></pre>'

exports.headers = function () {
  return '<link rel="stylesheet" href="log.css">' + 
          '<script src="highlight.pack.js"></script>' +
          '<script>hljs.initHighlightingOnLoad();</script>'
}

exports.divider = function () {
  return '<div class="divider"> </div>'  
}

exports.code = function (data) {
  return '<pre><code>' + data + '</pre></code>';
}

exports.error = function (data) {
  return this.genDiv(data, ['error']);
}

exports.header = function (data) {
  return this.genDiv(data, ['header', 'main']);
}

exports.subHeader = function (data) {
  return this.genDiv(data, ['header']);
}

exports.marker = function (data) {
  return this.genDiv(data, ['marker']);
}

exports.genDiv = function (data, classes){
  var html = '<div'
  
  if(classes.length) {
    html += ' class="'
    for (index in classes) {
      html += classes[index] + ' ';
    }
    html += '"';
  }
  html += '>' + data + '</div>';
  return html;
}