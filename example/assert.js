/**
 * Created by fritx on 5/5/14.
 */

var assert = require('assert');

module.exports = function () {

  // upward emitting
  this.emit('log', '[ example : assert ]');

  // downward capturing
  this.capture('group', function (title) {
    this.emit('log', title + ' :');
  });
  this.capture('test', function (actual, expected, msg) {
    assert(actual, expected, msg);
    this.emit('log', msg + ' : ✔');
  });

  // task loading
  this.add(function () {
    var sum = 1 + 1;
    this.emit('test', sum, 2, '1 + 1');
  });
  this.add(function (done) {
    var that = this;
    load(function (what) {
      that.emit('test', what, 'good', 'delayed callback');
      done();
    });
    function load(cb) {
      setTimeout(function () {
        cb('good');
      }, 300);
    }
  });
  this.add(function () {
    this.emit('group', 'a group');
    this.add(function () {
      var arr = [1, 2, 3];
      this.emit('test', arr.length, 3, 'array length');
    });
    this.add(function () {
      var str = 'hey';
      this.emit('test', typeof str, 'string', 'string type');
    });
  });

};
