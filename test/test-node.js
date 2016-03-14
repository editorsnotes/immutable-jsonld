'use strict'

import test from 'tape'
import Immutable from 'immutable'
import Cursor from 'immutable/contrib/cursor'
import { JSONLDNode, JSONLDValue, fromExpandedJSONLD} from '../ImmutableJSONLD'

import event from '../../test/data/event-expanded.json'
import product from '../../test/data/product-expanded.json'
import stupid from '../../test/data/stupid-expanded.json'

test('test JSONLDNode construction via factory method', t => {
  const node = JSONLDNode()
  t.plan(9)
  t.ok(node instanceof JSONLDNode,
    'is a JSONLDNode')
  t.ok(node instanceof Immutable.Map,
    'is an Immutable.Map')
  t.ok(node instanceof Immutable.Collection.Keyed,
    'is an Immutable.Collection.Keyed')
  t.ok(node instanceof Immutable.Collection,
    'is an Immutable.Collection')
  t.ok(node instanceof Immutable.Iterable,
    'is an Immutable.Iterable')
  t.ok(JSONLDNode.isJSONLDNode(node), 'isJSONLDNode()')
  t.ok(Immutable.Map.isMap(node), 'isMap()')
  t.ok(Immutable.Iterable.isIterable(node), 'isIterable()')
  t.ok(Immutable.Iterable.isKeyed(node), 'isKeyed()')
})

test('test JSONLDNode.toString()', t => {
  const empty = new JSONLDNode()
      , node = fromExpandedJSONLD(
          {"http://purl.org/dc/terms/title": [{"@value": "Moby Dick"}]}
        ).first()
  t.plan(2)
  t.equals(empty.toString(), 'JSONLDNode {}',
    'works for empty node')
  t.equals(node.toString(),
    'JSONLDNode { "http://purl.org/dc/terms/title": '
    + 'List [ JSONLDValue { "@value": "Moby Dick" } ] }',
    'works for non-empty node')
})

test('test JSONLDNode.getIn([])', t => {
  const node = fromExpandedJSONLD(event).first()
  let value = node.getIn([])
  t.plan(2)
  t.ok(value instanceof JSONLDNode, 'that is a JSONLDNode')
  t.deepEqual(value.toJS(), event[0], 'round-trips OK')
})

test('test JSONLDNode.getIn([predicate])', t => {
  const pred = 'http://www.w3.org/2002/12/cal/ical#dtstart'
      , node = fromExpandedJSONLD(event).first()
  let values = node.getIn([pred])
  t.plan(4)
  t.ok(values instanceof Immutable.List, 'returns an Immutable.List')
  t.equal(values.size, 1, 'with one value')
  t.ok(values.first() instanceof JSONLDValue, 'that is a JSONLDValue')
  t.deepEqual(values.first().toJS(), event[0][pred][0], 'round-trips OK')
})

test('test JSONLDNode.getIn([predicate, 0])', t => {
  const pred = 'http://www.w3.org/2002/12/cal/ical#dtstart'
      , node = fromExpandedJSONLD(event).first()
  let value = node.getIn([pred, 0])
  t.plan(2)
  t.ok(value instanceof JSONLDValue, 'that is a JSONLDValue')
  t.deepEqual(value.toJS(), event[0][pred][0], 'round-trips OK')
})

test('test JSONLDNode.getAt([])', t => {
  const node = fromExpandedJSONLD(event).first()
  let values = node.getAt([])
  t.plan(4)
  t.ok(values instanceof Immutable.Set, 'returns an Immutable.Set')
  t.equal(values.size, 1, 'with one value')
  t.ok(values.first() instanceof JSONLDNode, 'that is a JSONLDNode')
  t.deepEqual(values.first().toJS(), event[0], 'round-trips OK')
})

test('test JSONLDNode.getAt([predicate])', t => {
  const pred = 'http://www.w3.org/2002/12/cal/ical#dtstart'
      , node = fromExpandedJSONLD(event).first()
  let values = node.getAt([pred])
  t.plan(4)
  t.ok(values instanceof Immutable.Set, 'returns an Immutable.Set')
  t.equal(values.size, 1, 'with one value')
  t.ok(values.first() instanceof JSONLDValue, 'that is a JSONLDValue')
  t.deepEqual(values.first().toJS(), event[0][pred][0], 'round-trips OK')
})

test('test JSONLDNode.getAt([predicate, predicate])', t => {
  const path = ['http://stupid.com/wheels', 'http://stupid.com/hubcap']
      , node = fromExpandedJSONLD(stupid).first()
  let values = node.getAt(path)
  t.plan(6)
  t.ok(values instanceof Immutable.Set, 'returns an Immutable.Set')
  t.equal(values.size, 2, 'with two values')
  t.ok(values.first() instanceof JSONLDNode, 'first is a JSONLDNode')
  t.deepEqual(values.first().toJS(), stupid[0][path[0]][0][path[1]][0],
    'first round-trips OK')
  t.ok(values.last() instanceof JSONLDNode, 'last is a JSONLDNode')
  t.deepEqual(values.last().toJS(), stupid[0][path[0]][1][path[1]][0],
    'last round-trips OK')
})

test('test JSONLDNode.getAt([predicate, predicate, predicate])', t => {
  const path =
    [ 'http://stupid.com/wheels'
    , 'http://stupid.com/hubcap'
    , 'http://stupid.com/color'
    ]
      , node = fromExpandedJSONLD(stupid).first()
  let values = node.getAt(path)
  t.plan(6)
  t.ok(values instanceof Immutable.Set, 'returns an Immutable.Set')
  t.equal(values.size, 2, 'with two values')
  t.ok(values.first() instanceof JSONLDValue, 'first is a JSONLDValue')
  t.deepEqual(values.first().toJS(),
    stupid[0][path[0]][0][path[1]][0][path[2]][0],
    'first round-trips OK')
  t.ok(values.last() instanceof JSONLDValue, 'last is a JSONLDValue')
  t.deepEqual(values.last().toJS(),
    stupid[0][path[0]][1][path[1]][0][path[2]][0],
    'last round-trips OK')
})

test('test cursor from list of JSONLDNodes', t => {
  const nodes = fromExpandedJSONLD(stupid)
  let path = [ 0
    , 'http://stupid.com/wheels', 1
    , 'http://stupid.com/hubcap', 0
    , 'http://stupid.com/color', 0
  ]
  let cursor = Cursor.from(nodes, path, newData => {
      t.equal(newData.getIn(path.concat(['@value'])), 'pink')
      t.end()
    }
  )
  cursor.update('@value', () => 'pink')
})

test('test JSONLDNode.types', t => {
  t.plan(7)
  t.ok(JSONLDNode().types instanceof Immutable.Set, 'types is a set')
  t.ok(JSONLDNode().types.equals(Immutable.Set()), 'no types')
  t.ok(JSONLDNode(
    {'@type': Immutable.Set()}).types.equals(Immutable.Set()),
    'no types explicit')
  t.ok(JSONLDNode(
    {'@type': Immutable.Set.of('http://schema.org/Person')}).types.equals(
    Immutable.Set.of('http://schema.org/Person')), 'one type')
  try {JSONLDNode().types = null} catch (e) {
    t.ok(e instanceof TypeError, 'set throws TypeError')
    t.ok(/^Cannot set property types/.test(e.message), 'with message')
  }
  t.ok(fromExpandedJSONLD(stupid).first().types.equals(
     Immutable.Set.of('http://stupid.com/Car')), 'this works too')
})

test('test JSONLDNode.id', t => {
  t.plan(4)
  t.equal(JSONLDNode().id, undefined, 'undefined by default')
  try {JSONLDNode().id = 1} catch (e) {
    t.ok(e instanceof TypeError, 'set throws TypeError')
    t.ok(/^Cannot set property id/.test(e.message), 'with message')
  }
  t.equal(fromExpandedJSONLD(product).first().id,
    'http://example.org/cars/for-sale#tesla')
})

test('test JSONLDNode.propertySeq()', t => {
  const allkeywords = JSONLDNode(
    { '@context': {}
    , '@id': null
    , '@graph': []
    , '@type': []
    , '@reverse': null
    , '@index': null
      })
  t.plan(2)
  t.ok(allkeywords.propertySeq().equals(Immutable.Seq()),
    'keywords are skipped')
  t.ok(fromExpandedJSONLD(event).first().propertySeq().equals(Immutable.Seq.of(
    'http://www.w3.org/2002/12/cal/ical#dtstart',
    'http://www.w3.org/2002/12/cal/ical#location',
    'http://www.w3.org/2002/12/cal/ical#summary'
  )), 'others terms are not')
})
