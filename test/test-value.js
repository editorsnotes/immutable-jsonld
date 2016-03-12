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

test('test JSONLDValue.toString()', t => {
  const empty = new JSONLDValue()
      , value = new JSONLDValue({"@value": "Moby Dick"})
  t.plan(2)
  t.equals(empty.toString(), 'JSONLDValue {}',
    'works for empty value')
  t.equals(value.toString(), 'JSONLDValue { "@value": "Moby Dick" }',
    'works for non-empty value')
})

