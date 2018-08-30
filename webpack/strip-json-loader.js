var stripJsonComments = require('strip-json-comments');

module.exports = function(source) {

  this.cacheable && this.cacheable();

  try {
    var Hjson = require('hjson');

//    var parsedSource = Hjson.parse(source.replace(/\s*;\s*$/,""));
    let str = JSON.stringify(source);
    return `module.exports = ${str}`;

  } catch (err) {
    console.log("EEEERRR", err);
    this.emitError('strip-json-loader: ' + err);
    return source;
  }

}
