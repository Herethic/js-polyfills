var CustomPromise = require('../src').Promise;

describe('Custom Promise', () => {
  var cb;

  beforeEach(function(){
    cb = jasmine.createSpy('cb');
  });

  it('should handle then', (done) => {
    new CustomPromise(asyncFunc)
      .then(function() {
        cb('then');
      })
      .then(function() {
        expect(cb.calls.argsFor(0).shift()).toBe('created');
        expect(cb.calls.argsFor(1).shift()).toBe('then');
        done();
      })
      .catch(function() {
        done.fail('catch has benn called');
      })

    function asyncFunc(resolve, reject) {
      setTimeout(function() {
        cb('created');
        resolve();
      }, 0);
    }
  });

  it('should handle then with sync func', (done) => {
    new CustomPromise(syncFunc)
      .then(function() {
        expect(cb.calls.argsFor(0).shift()).toBe('created');

        done();
      })
      .catch(function() {
        done.fail('catch has benn called');
      })

    function syncFunc(resolve, reject) {
      cb('created');
      resolve('foo');
    }
  });

  it('should handle catch with sync func', (done) => {
    new CustomPromise(syncFunc)
      .then(function() {
        done.fail('Success has been called');
      })
      .catch(function() {
        done();
      })

    function syncFunc(resolve, reject) {
      reject();
    }
  });

  it('should handle catch', (done) => {
    new CustomPromise(asyncFunc)
      .then(function() {
        done.fail('Success has been called');
      })
      .catch(function() {
        done();
      })

    function asyncFunc(resolve, reject) {
      setTimeout(function() {
        cb('created');
        reject();
      }, 0);
    }
  });

  it('should be chained', (done) => {
    var then = jasmine.createSpy('then');
    var FakePromise = function() {};
    FakePromise.then = then;

    new CustomPromise(asyncFunc)
      .then(function() {
        cb('then');

        return FakePromise;
      })
      .then(function() {});

    function asyncFunc(resolve, reject) {
      setTimeout(function() {
        cb('created');
        resolve();
        setTimeout(check, 0);
      }, 0);

      function check() {
          expect(then).toHaveBeenCalled();
          expect(cb.calls.allArgs()).toEqual([['created'], ['then']]);

          done();
      }
    }
  });

  xit('should handle js error', (done) => {
    new CustomPromise(asyncFunc)
      .then(function() {
        done.fail('success should not be called');
      })
      .catch(function() {
        done();
      })

    function asyncFunc(resolve, reject) {
      setTimeout(function() {
        null();
      }, 0);
    }
  });
});

describe('CustomPromise.all', () => {
  it('should be resolved', (done) => {
    var p1 = new CustomPromise(function(resolve, reject) {
      setTimeout(resolve, 0, 'foo');
    });
    var p2 = 1337;
    var p3 = new CustomPromise(function (resolve, reject) {
      resolve(null);
    });

    CustomPromise.all([p1, p2, p3]).then(values => {
      expect(values).toEqual(['foo', 1337, null]);

      done();
    });
  });

  it('should be rejected', (done) => {
    var p1 = new CustomPromise(function(resolve, reject) { 
      setTimeout(resolve, 0, 'one'); 
    }); 
    var p2 = new CustomPromise(function(resolve, reject) { 
      setTimeout(resolve, 0,  'two'); 
    });
    var p3 = new CustomPromise(function(resolve, reject) {
      setTimeout(resolve, 0, 'three');
    });
    var p4 = new CustomPromise(function(resolve, reject) {
      setTimeout(resolve, 0, 'four');
    });
    var p5 = new CustomPromise(function(resolve, reject) {
      reject('reject');
    });

    CustomPromise.all([p1, p2, p3, p4, p5]).then(function(values) {
      done.fail('Promise must not fulfilled');
    }, function(reason) {
      expect(reason).toBe('reject');

      done();
    });
  });
});

describe('CustomPromise.race', () => {
  it('should handle async promises', (done) => {
    var p1 = new CustomPromise(function(resolve, reject) { 
      setTimeout(resolve, 50, 1); 
    });
    var p2 = new CustomPromise(function(resolve, reject) { 
      setTimeout(resolve, 10, 2); 
    });

    CustomPromise.race([p1, p2]).then(function(value) {
      expect(value).toBe(2);

      done();
    }, done.fail);
  });

  it('should handle async promise callback and sync callback', (done) => {
    var p1 = new CustomPromise(function(resolve, reject) { 
      setTimeout(resolve, 50, 'not'); 
    });
    var p2 = new CustomPromise(function(resolve, reject) { 
      resolve('called');
    });

    CustomPromise.race([p1, p2]).then(function(value) {
      expect(value).toBe('called');

      done();
    }, done.fail);
  });

  it('should handle promises with sync callbacks', (done) => {
    var p1 = new CustomPromise(function(resolve, reject) { 
      resolve('called');
    });
    var p2 = new CustomPromise(function(resolve, reject) { 
      resolve('not called');
    });

    CustomPromise.race([p1, p2]).then(function(value) {
      expect(value).toBe('called');

      done();
    }, done.fail);
  });

  it('should handle promise and simple value', (done) => {
    var p1 = new CustomPromise(function(resolve, reject) { 
      setTimeout(resolve, 50, 'not'); 
    });
    var p2 = 'called';

    CustomPromise.race([p1, p2]).then(function(value) {
      expect(value).toBe('called');

      done();
    }, done.fail);
  });

  it('should handle promise and simple value', (done) => {
    var p1 = 'called';
    var p2 = new CustomPromise(function(resolve, reject) { 
      resolve('not called');
    });

    CustomPromise.race([p1, p2]).then(function(value) {
      expect(value).toBe('called');

      done();
    }, done.fail);
  });

  it('should handle promise and simple value', (done) => {
    var p1 = new CustomPromise(function(resolve, reject) { 
      resolve('called');
    });
    var p2 = 'not called';

    CustomPromise.race([p1, p2]).then(function(value) {
      expect(value).toBe('called');

      done();
    }, done.fail);
  });
});
