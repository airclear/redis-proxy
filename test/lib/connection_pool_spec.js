var _ = require('underscore');
var Pool = require('../../lib/connection_pool');

describe('ConnectionPool', function() {

  it('raises exception when no rediss available', function() {
    (function(){
      new Pool({});
    }).should.throw();
  });
  
  it('should open connections immediately', function(done) {
    var count = 0;
    new Pool({maxSize: 3
      , delayCreation: false
      , create: function(){
        count++;
        if(count == 3){
          done();
        }
      }
    });
  });
  
  it('should not open connections immediately when delayCreation', function(done) {
    new Pool({maxSize: 3
      , delayCreation: true
      , create: function(){
        done(false);
      }
    });
    setTimeout(done, 1000);
  });
  
  it('should create when used on delayCreation', function(done) {
    var pool = new Pool({maxSize: 3
      , delayCreation: true
      , create: function(cb){
        cb(null, 'xx');
      }
    });
    pool.freepool.length.should.equal(0);
    
    pool.take('1', function(err, val){
      val.should.equal('xx');    
      pool.inUsePool['1'].should.equal('xx');
      done();
    });
  });
  
  it('should use same item that was created for the id', function(done) {
    var whatToReturn = ['xx', 'yyy', 'zzzz'];
    var pool = new Pool({maxSize: 3
      , delayCreation: true
      , create: function(cb){
        cb(null, whatToReturn.shift());
      }
    });
    pool.take('1', function(err, conn){
      conn.should.equal('xx');
      pool.take('1', function(err, conn){
        conn.should.equal('xx');
        pool.freepool.length.should.equal(2);
        done();
      });
      
    });
  });

  it('should create new connection for another id', function(done) {
    var whatToReturn = ['xx', 'yyy', 'zzzz'];
    var pool = new Pool({maxSize: 3
      , delayCreation: true
      , create: function(cb){
        cb(null, whatToReturn.shift());
      }
    });
    pool.take('1', function(err, conn){
      conn.should.equal('xx');
      pool.take('2', function(err, conn){
        conn.should.equal('yyy');
        pool.freepool.length.should.equal(1);
        done();
      });
    });
  });

  it('should release on close', function(done) {
    var whatToReturn = ['xx', 'yyy', 'zzzz'];
    var pool = new Pool({maxSize: 3
      , delayCreation: true
      , create: function(cb){
        cb(null, whatToReturn.shift());
      }
    });
  
    pool.take('1', function(err, conn){
      conn.should.equal('xx');
      pool.take('2', function(err, conn){
        conn.should.equal('yyy');
        pool.close('2');
        pool.freepool.length.should.equal(2);
        done();
      });
    });
  }); 
  
  it('should release on close', function(done) {
    var whatToReturn = ['xx', 'yyy'];
    var pool = new Pool({maxSize: 2
      , delayCreation: true
      , create: function(cb){
        cb(null, whatToReturn.shift());
      }
    });
    pool.take('1', function(err, conn){
      conn.should.equal('xx');
      pool.take('2', function(err, conn){
        conn.should.equal('yyy');
        pool.close('2');
        pool.freepool.length.should.equal(1);
        pool.take('3', function(err, co){
          co.should.equal('yyy');
          done();
        });
      });
    });
  });
  
  it('should release on close', function(done) {
    var whatToReturn = ['xx', 'yyy', 'zzzz'];
    var pool = new Pool({maxSize: 3
      , delayCreation: true
      , create: function(cb){
        cb(null, whatToReturn.shift());
      }
    });
    pool.take('1', function(err, conn){
      conn.should.equal('xx');
      pool.take('2', function(err, conn){
        conn.should.equal('yyy');
        pool.close('2');
        done();
      });
    });
  });

  it('should close connections release when close exists', function() {
    var whatToReturn = ['xx', 'yyy', 'zzzz'];
    var pool = new Pool({maxSize: 3
      , delayCreation: true
      , create: function(cb){
        cb(null, whatToReturn.shift());
      }
    });
    pool.take('1', function(err, conn){
      conn.should.equal('xx');
      pool.take('2', function(err, conn){
        conn.should.equal('yyy');
        pool.close('2');
      });
    });
  });
   
});