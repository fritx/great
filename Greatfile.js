/**
 * Created by fritx on 5/3/14.
 */

var great = require('./');
var args = process.argv.slice(2);

great(function () {

  var that = this;

  // downward capturing
  this.capture('log', function (msg) {
    log(msg, this.depth - that.depth);
  });

  // task picking
  if (args[0] === 'example') {
    this.add(require('./example/' + args[1]));
  }

  function log(msg, offset) {
    var indent = '';
    for (var i = 0; i < offset - 1; i++) {
      indent += '    ';
    }
    console.log(indent + msg);
  }

});
