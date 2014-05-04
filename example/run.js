/**
 * Created by fritx on 5/3/14.
 */

var great = require('..');

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

// general configuration
great.on('start', function () {
  log('great started!');
});
great.on('end', function () {
  log('great ended!');
});
great.on('good', function(){
  log('----- something special -----');
});
great.unit.on('title', function (title) {
  log('titled: ' + title, this.getLevel());
  this.set('title', title);
});
great.unit.on('end', function () {
  log('ended: ' + this.get('title'), this.getLevel());
});

// run tasks
great.run(function () {
  this.emit('title', 'main');

  this.add(function () {
    this.emit('title', 'series');

    // series tasks
    this.add(createBody('a-1'));
    this.add(createBody('a-2'));
    this.add(createBody('a-3'));

    great.emit('good');
  });

  this.add(function () {
    this.emit('title', 'mix');

    // parallel tasks
    this.add([
      createAsyncBody('b-1'),
      createAsyncBody('b-2'),
      createAsyncBody('b-3'),
      createAsyncBody('b-4'),
      createAsyncBody('b-5'),
      createAsyncBody('b-6')
    ]);

    this.add(createBody('c-1'));
    this.add(createBody('c-2'));
  });
});

function log(msg, level) {
  level = level || 0;
  var indent = '';
  for (var i = 0; i < level; i++) {
    indent += '    ';
  }
  console.log(indent + msg);
}
