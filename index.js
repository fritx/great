/**
 * Created by fritx on 5/2/14.
 */

var Emitter = require('events').EventEmitter;
var util = require('util');

var api = module.exports = new Emitter();
api.unit = {};

function Unit(body) {
  this.body = body || null;
  this.parent = null;
  this.children = [];
  this.remaining = [];
  this.running = 0;
  this.data = {};

  var self = this;
  this.constructor.bindings.forEach(function(binding){
    self[binding[0]].apply(self, binding[1]);
  });
}
util.inherits(Unit, Emitter);

Unit.bindings = [];
['on', 'once', 'off'].forEach(function (key) {
  api.unit[key] = function () {
    Unit.bindings.push([key].concat(arguments));
  };
});

Unit.prototype.start = function () {
  var self = this;
  this.emit('start');
  this.emit('body-start');
  this.on('body-end', onBodyEnd);
  if (this.body) {
    this.body(bodyEnd);
    if (this.body.length <= 0) {
      bodyEnd();
    }
  } else {
    bodyEnd();
  }
  function onBodyEnd() {
    self.emit('children-start');
    self.on('children-end', function () {
      self.emit('end');
    });
    self.walk();
  }

  function bodyEnd() {
    self.emit('body-end');
  }
};

Unit.prototype.get = function(key) {
  return this.data[key];
};
Unit.prototype.set = function(key, value) {
  this.data[key] = value;
};

Unit.prototype.add = function (bodies) {
  if (!Array.isArray(bodies)) {
    bodies = [bodies];
  }
  var bundle = bodies.map(function (body) {
    return new Unit(body);
  });
  var self = this;
  bundle.forEach(function (child) {
    child.parent = self;
  });
  this.children.push(bundle);
  this.remaining.push(bundle);
};

Unit.prototype.walk = function () {
  var self = this;
  var bundle = this.remaining.shift();
  if (!bundle) {
    self.emit('children-end');
    return;
  }
  this.emit('bundle-start', bundle);
  this.running += bundle.length;
  bundle.forEach(function (child) {
    child.on('end', onChildEnd);
    self.emit('child-start', child);
    child.start();
  });
  function onChildEnd() {
    self.emit('child-end', this);
    self.running -= 1;
    if (self.running <= 0) {
      self.emit('bundle-end', bundle);
      self.walk();
    }
  }
};

Unit.prototype.getLevel = function () {
  var level = 0;
  var parent = this.parent;
  while (parent !== null) {
    level += 1;
    parent = parent.parent;
  }
  return level;
};

api.run = function (body) {
  this.emit('start');
  var top = new Unit(body);
  top.on('end', function(){
    api.emit('end');
  });
  top.start();
};
