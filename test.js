'use strict'

var pg = require('./index')
var assert = require('assert')
var bluebird = require('bluebird')

function testResolve (some, arg, cb) {
  return pg(function (done) {
    setTimeout(function () {
      done(null, 'yeah!')
    }, 10)
  }, cb)
}

function testResolveEmpty (some, arg, cb) {
  return pg(function (done) {
    setTimeout(function () {
      done(null)
    }, 10)
  }, cb)
}

function testResolveMultiArgs (some, arg, cb) {
  return pg(function (done) {
    setTimeout(function () {
      done(null, 'yeah!', 'alright!')
    }, 10)
  }, cb)
}

testResolve('foo', 'bar', function (err, res) {
  assert.strictEqual(err, null)
  assert.strictEqual(res, 'yeah!')
})

testResolveEmpty('foo', 'bar', function (err, res) {
  assert.strictEqual(err, null)
  assert.strictEqual(res, undefined)
})

testResolveMultiArgs('foo', 'bar', function (err, res1, res2) {
  assert.strictEqual(err, null)
  assert.strictEqual(res1, 'yeah!')
  assert.strictEqual(res2, 'alright!')
})

if (global.Promise) {
  testResolve('foo', 'bar').then(function (res) {
    assert.strictEqual(res, 'yeah!')
  })

  testResolveEmpty('foo', 'bar').then(function (res) {
    assert.strictEqual(res, undefined)
  })

  testResolveMultiArgs('foo', 'bar').then(function (res) {
    assert.deepEqual(res, ['yeah!', 'alright!'])
  })

  testResolve('foo', 'bar').catch(function () {
    assert.fail('promise should not have rejected')
  })
}

function testReject (cb) {
  return pg(function (done) {
    setTimeout(function () {
      done('error!!')
    }, 10)
  }, cb)
}

testReject(function (err, res) {
  assert.strictEqual(err, 'error!!')
  assert.strictEqual(res, undefined)
})

if (global.Promise) {
  testReject().then(function () {
    assert.fail('promise should not have fulfilled')
  }).catch(function () {})

  testReject().catch(function (err) {
    assert.strictEqual(err, 'error!!')
  })
}

function testThirdPartyPromise (cb) {
  return pg(function (done) {
    setTimeout(done, 10)
  }, cb, bluebird)
}

assert(testThirdPartyPromise() instanceof bluebird)

//
// exception handling
//
function exceptionHandling (cb) {
  return pg(function (done) {
    throw 'foo' // eslint-disable-line
  }, cb)
}

// with promise
if (global.Promise) {
  exceptionHandling().then(
    function (res) {
      assert.fail('promise should not have fulfilled')
    },
    function (err) {
      assert.equal(err, 'foo')
    }
  )
}

// with callback
assert.throws(function () {
  exceptionHandling(function () {
    assert.fail('callback should not have been called')
  })
}, /foo/)
