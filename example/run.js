/**
 * Created by fritx on 5/3/14.
 */

function createBody(title) {
  return function body() {
    this.emit('title', title);
  }
}

function createAsyncBody(title) {
  return function asyncBody(done) {
    this.emit('title', title);
    var delay = 1000 * Math.random();
    setTimeout(done, delay);
  }
}

module.exports = function () {

  // upward emitting
  this.emit('log', '[ example : run ]');

  // downward capturing
  this.capture('title', function (title) {
    this.emit('log', 'titled : ' + title);
    this.set('title', title);
  });
  this.capture('end', function () {
    this.emit('log', 'ended : ' + this.get('title'));
  });

  // task loading
  this.add(function () {
    this.emit('title', 'series');
    this.add(createBody('a-1'));
    this.add(createBody('a-2'));
    this.add(createBody('a-3'));
  });
  this.add(function () {
    this.emit('title', 'parallel');
    this.add([
      createAsyncBody('b-1'),
      createAsyncBody('b-2'),
      createAsyncBody('b-3'),
      createAsyncBody('b-4'),
      createAsyncBody('b-5'),
      createAsyncBody('b-6')
    ]);
  });

};
