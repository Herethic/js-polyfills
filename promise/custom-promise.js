(function() {
  var CustomPromise = function(cb) {
    this.resolved = [];
    this.rejected = [];
    this.isCancelled = false;
    this.isReady = false;

    cb(this.resolve.bind(this), this.reject.bind(this));
  }

  CustomPromise.prototype.resolve = function(arg) {
    var result;
    var flag = false;
    while (this.resolved.length && !flag) {
      result = this.resolved.shift()(arg);
      flag = result && typeof result.then === 'function';
    }

    if (flag && this.resolved) {
      this.resolved.forEach(function(cb) {
        result.then(cb);
      });
    }
  }

  CustomPromise.prototype.reject = function(arg) {
    var result;
    var flag = false;
    while (this.rejected.length && !flag) {
      result = this.rejected.shift()(arg);
      flag = result && typeof result.then === 'function';
    }

    if (flag && this.resolved) {
      this.resolved.forEach(function(cb) {
        result.then(null, cb);
      });
    }
  }


  CustomPromise.prototype.then = function(success, fail) {
    if (typeof success === 'function') {
      this.resolved.push(success);
    }

    if (typeof fail === 'function') {
      this.rejected.push(fail);
    }

    return this;
  }

  CustomPromise.prototype.catch = function(cb) {
    this.rejected.push(cb);

    return this;
  }

  return CustomPromise;
})
