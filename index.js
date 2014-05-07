/**
 * Created by fritx on 5/2/14.
 */

var _slice = Array.prototype.slice;
var _prefix = '::';

function _isBubble(event) {
  return new RegExp('^' + _prefix).test(event);
}
function _toBubble(event) {
  return _isBubble(event) ? event : _prefix + event;
}

function Unit(body) {
  this.body = body || null;
  this.parent = null;
  this.children = [];
  this.remaining = [];
  this.running = 0;
  this.data = {};
  this.listeners = {};
}

Unit.prototype.get = function (key) {
  return this.data[key];
};
Unit.prototype.set = function (key, value) {
  this.data[key] = value;
};

Unit.prototype.on = function (event, listener) {
  if (this.listeners[event]) {
    this.listeners[event].push(listener);
  } else {
    this.listeners[event] = [listener];
  }
};
Unit.prototype.off = function (event, listener) {
  if (this.listeners[event]) {
    var index = this.listeners[event].indexOf(listener);
    this.listeners.splice(index, 1);
  }
};

Unit.prototype.capture = function (event, listener) {
  this.on(_toBubble(event), listener);
};
Unit.prototype.uncapture = function (event, listener) {
  this.off(_toBubble(event), listener);
};

Unit.prototype.emit = function (event) {
  var data = _slice.call(arguments, 1);
  this.bubble(event, data);
  this.react(event, data);
};

Unit.prototype.bubble = function (event, data) {

  // not bubble on if already listening
  if (_isBubble(event) &&
    this.listeners[event] &&
    this.listeners[event].length >= 1) return;

  if (this.parent) {
    var args;
    if (_isBubble(event)) {
      args = [event].concat(data);
    } else {
      args = [_toBubble(event), this].concat(data);
    }
    this.parent.emit.apply(this.parent, args);
  }
};

Unit.prototype.react = function (event, data) {
  var that = this;
  if (this.listeners[event]) {
    var iterator = _isBubble(event) ? function (listener) {
      listener.apply(data[0], data.slice(1));
    } : function (listener) {
      listener.apply(that, data);
    };
    this.listeners[event].forEach(iterator);
  }
};

Unit.prototype.start = function () {
  var that = this;
  this.emit('start');
  if (!this.body) {
    bodyEnd();
  } else {
    this.body(bodyEnd);
    if (this.body.length <= 0) {
      bodyEnd();
    }
  }
  function bodyEnd() {
    that.emit('children-start');
    that.on('children-end', function () {
      that.emit('end');
    });
    that.walk();
  }
};

Unit.prototype.add = function (bodies) {
  var that = this;
  if (!Array.isArray(bodies)) {
    bodies = [bodies];
  }
  var bundle = bodies.map(function (body) {
    return new Unit(body);
  });
  bundle.forEach(function (child) {
    child.parent = that;
  });
  this.children.push(bundle);
  this.remaining.push(bundle);
};

Unit.prototype.walk = function () {
  var that = this;
  if (this.remaining.length <= 0) {
    this.emit('children-end');
    return;
  }
  var bundle = this.remaining.shift();
  this.emit('bundle-start', bundle);
  this.running += bundle.length;
  bundle.forEach(function (child) {
    child.on('end', onChildEnd);
    that.emit('child-start', child);
    child.start();
  });
  function onChildEnd() {
    that.emit('child-end', this);
    that.running -= 1;
    if (that.running <= 0) {
      that.emit('bundle-end', bundle);
      that.walk();
    }
  }
};

Unit.prototype.__defineGetter__('depth', function () {
  var counter = 0;
  var pointer = this.parent;
  while (pointer !== null) {
    counter += 1;
    pointer = pointer.parent;
  }
  return counter;
});

function api(body) {
  new Unit(body).start();
}

if (typeof window === 'object' && window.document) {
  window.great = api;
} else {
  module.exports = api;
}
