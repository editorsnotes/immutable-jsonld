'use strict'

import test from 'tape'
import Immutable from 'immutable'
import {JSONLDValue} from '../ImmutableJSONLD'

test('test JSONLDValue construction via factory method', t => {
  const value = JSONLDValue()
  t.plan(9)
  t.ok(value instanceof JSONLDValue,
    'is a JSONLDValue')
  t.ok(value instanceof Immutable.Map,
    'is an Immutable.Map')
  t.ok(value instanceof Immutable.Collection.Keyed,
    'is an Immutable.Collection.Keyed')
  t.ok(value instanceof Immutable.Collection,
    'is an Immutable.Collection')
  t.ok(value instanceof Immutable.Iterable,
    'is an Immutable.Iterable')
  t.ok(JSONLDValue.isJSONLDValue(value), 'isJSONLDValue()')
  t.ok(Immutable.Map.isMap(value), 'isMap()')
  t.ok(Immutable.Iterable.isIterable(value), 'isIterable()')
  t.ok(Immutable.Iterable.isKeyed(value), 'isKeyed()')
})

test('test JSONLDValue @value is always set', t => {
  const empty = JSONLDValue()
      , string = JSONLDValue('hello')
      , number = JSONLDValue(69)
      , truth = JSONLDValue(true)
      , falsity = JSONLDValue(false)
      , nullity = JSONLDValue(null)
  t.plan(9)
  t.equal(empty.get('@value'), '')
  t.equal(string.get('@value'), 'hello')
  t.equal(number.get('@value'), 69)
  t.equal(truth.get('@value'), true)
  t.equal(falsity.get('@value'), false)
  t.equal(nullity, empty)
  try {JSONLDValue({})} catch (e) {
    t.ok(e, 'obj without @value throws exception')
  }
  try {JSONLDValue([])} catch (e) {
    t.ok(e, 'array throws exception')
  }
  try {JSONLDValue(x => x)} catch (e) {
    t.ok(e, 'function throws exception')
  }
})

test('test JSONLDValue.toString()', t => {
  const empty = JSONLDValue()
      , value = JSONLDValue({"@value": "Moby Dick"})
  t.plan(2)
  t.equals(empty.toString(), 'JSONLDValue { "@value": "" }',
    'works for empty value')
  t.equals(value.toString(), 'JSONLDValue { "@value": "Moby Dick" }',
    'works for non-empty value')
})

test('test JSONLDValue.language', t => {
  const val1 = JSONLDValue({'@value': 'Moby Dick'})
      , val2 = JSONLDValue({'@value': 'Moby Dick', '@language': 'en'})
  t.plan(6)
  t.equals(val1.language, undefined)
  t.equals(val2.language, 'en')
  t.equals(val1.set('@language', 'ja').language, 'ja')
  t.equals(val2.set('@language', 'ja').language, 'ja')
  try {val1.language = 'en'} catch (e) {
    t.ok(e instanceof TypeError, 'set throws TypeError')
    t.ok(/^Cannot set property language/.test(e.message), 'with message')
  }
})

test('test JSONLDValue.type', t => {
  const val1 = JSONLDValue({'@value': 'Moby Dick'})
      , val2 = JSONLDValue(
          { '@value': 'Moby Dick'
          , '@type': 'http://www.w3.org/2001/XMLSchema#string'})
  t.plan(6)
  t.equals(val1.type, undefined)
  t.equals(val2.type, 'http://www.w3.org/2001/XMLSchema#string')
  t.equals(val1.set('@type', 'http://schema.org/Text').type,
    'http://schema.org/Text')
  t.equals(val2.set('@type', 'http://schema.org/Text').type,
    'http://schema.org/Text')
  try {val1.type = 'http://schema.org/Text'} catch (e) {
    t.ok(e instanceof TypeError, 'set throws TypeError')
    t.ok(/^Cannot set property type/.test(e.message), 'with message')
  }
})

test('test JSONLDValue.value', t => {
  const val1 = JSONLDValue({'@value': 'Moby Dick'})
  t.plan(4)
  t.equals(val1.value, 'Moby Dick')
  t.equals(val1.set('@value', 'foo').value, 'foo')
  try {val1.value = ''} catch (e) {
    t.ok(e instanceof TypeError, 'set throws TypeError')
    t.ok(/^Cannot set property value/.test(e.message), 'with message')
  }
})

test('test JSONLDValue.delete()', t => {
  const value = JSONLDValue({'@value': 'x'})
      , expected = JSONLDValue({'@value': ''})
  t.plan(1)
  t.ok(value.delete('@value').equals(expected), 'returns expected value')
})

test('test JSONLDValue.remove()', t => {
  const value = JSONLDValue({'@value': 'x'})
      , expected = JSONLDValue({'@value': ''})
  t.plan(1)
  t.ok(value.remove('@value').equals(expected), 'returns expected value')
})
