/**
 * Created by fritx on 5/5/14.
 */

var assert = require('assert');

module.exports = function () {

  // upward emitting
  this.emit('log', '[ example : assert ]');

  // downward capturing
  this.capture('title', function (title) {
    this.set('title', title);
  });
  this.capture('end', function () {
    this.emit('log', this.get('title') + ' : ✔');
  });

  // task loading
  this.add(function () {
    this.emit('title', '1 + 1');
    var sum = 1 + 1;
    assert(sum, 1);
  });
  this.add(function (done) {
    this.emit('title', 'delayed callback');
    load(function (what) {
      assert(typeof what === 'string');
      done();
    });
    function load(cb) {
      setTimeout(function () {
        cb('good');
      }, 500);
    }
  });
  this.add(function () {
    this.emit('title', 'array length');
    var arr = [1, 2, 3];
    assert(arr.length, 3);
  });

};
