var RESOLVED_STATUS = 'Resolved';
var REJECTED_STATUS = 'Rejected';
var PENDING_STATUS = 'Pending';

var Promise = function(cb) {
  this._resolved = [];
  this._rejected = [];
  this.status = PENDING_STATUS;

  try {
    cb(this.resolve.bind(this), this.reject.bind(this));
  } catch(ex) {
    console.error(ex);
    this.reject.call(this, ex);
  }
}

Promise.prototype.resolve = function(arg) {
  this.status = RESOLVED_STATUS;

  var result;
  var flag = false;
  while (this._resolved.length && !flag) {
    result = this._resolved.shift()(arg);
    flag = result && typeof result.then === 'function';
  }

  if (flag && this._resolved) {
    this._resolved.forEach(function(cb) {
      result.then(cb);
    });
  }
}

Promise.prototype.reject = function(arg) {
  this.status = REJECTED_STATUS;

  var result;
  var flag = false;
  while (this._rejected.length && !flag) {
    result = this._rejected.shift()(arg);
    flag = result && typeof result.then === 'function';
  }

  if (flag && this._resolved) {
    this._resolved.forEach(function(cb) {
      result.then(null, cb);
    });
  }
}


Promise.prototype.then = function(success, fail) {
  if (typeof success === 'function') {
    this._resolved.push(success);
  }

  if (typeof fail === 'function') {
    this._rejected.push(fail);
  }

  return this;
}

Promise.prototype.catch = function(cb) {
  return this.then(null, cb);
}

Promise.all = function(promises) {
  var count = 0;
  var values = [];

  return new Promise(function(resolve, reject) {
    promises.forEach(function(p, index) {
      if (p && typeof p.then === 'function') {
        p.then(function(value) {
          values[index] = value;
          if (++count === promises.length) {
            resolve(values);
          }
        }, reject);
      } else {
        values[index] = p;
        if (++count === promises.length) {
          resolve(values);
        }
      }
    });
  });
}

module.exports = Promise;
