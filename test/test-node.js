'use strict'

import test from 'tape'
import ns from 'rdf-ns'
import { Map, Set, Seq, Iterable, List, Collection, fromJS } from 'immutable'
import Cursor from 'immutable/contrib/cursor'
import { JSONLDNode, JSONLDValue, fromExpandedJSONLD} from '../ImmutableJSONLD'

import event from '../../test/data/event-expanded.json'
import product from '../../test/data/product-expanded.json'
import stupid from '../../test/data/stupid-expanded.json'
import stupid_children from '../../test/data/stupid-expanded-children.json'
import stupid_descends from '../../test/data/stupid-expanded-descendants.json'

const rdfs = ns('http://www.w3.org/2000/01/rdf-schema#')
    , skos = ns('http://www.w3.org/2004/02/skos/core#')

test('test JSONLDNode construction via factory method', t => {
  const node = JSONLDNode()
  t.plan(9)
  t.ok(node instanceof JSONLDNode,
    'is a JSONLDNode')
  t.ok(node instanceof Map,
    'is an Map')
  t.ok(node instanceof Collection.Keyed,
    'is an Collection.Keyed')
  t.ok(node instanceof Collection,
    'is an Collection')
  t.ok(node instanceof Iterable,
    'is an Iterable')
  t.ok(JSONLDNode.isJSONLDNode(node), 'isJSONLDNode()')
  t.ok(Map.isMap(node), 'isMap()')
  t.ok(Iterable.isIterable(node), 'isIterable()')
  t.ok(Iterable.isKeyed(node), 'isKeyed()')
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
  t.ok(values instanceof List, 'returns an List')
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
  t.ok(values instanceof Set, 'returns an Set')
  t.equal(values.size, 1, 'with one value')
  t.ok(values.first() instanceof JSONLDNode, 'that is a JSONLDNode')
  t.deepEqual(values.first().toJS(), event[0], 'round-trips OK')
})

test('test JSONLDNode.getAt([predicate])', t => {
  const pred = 'http://www.w3.org/2002/12/cal/ical#dtstart'
      , node = fromExpandedJSONLD(event).first()
  let values = node.getAt([pred])
  t.plan(4)
  t.ok(values instanceof Set, 'returns an Set')
  t.equal(values.size, 1, 'with one value')
  t.ok(values.first() instanceof JSONLDValue, 'that is a JSONLDValue')
  t.deepEqual(values.first().toJS(), event[0][pred][0], 'round-trips OK')
})

test('test JSONLDNode.getAt([predicate, predicate])', t => {
  const path = ['http://stupid.com/wheels', 'http://stupid.com/hubcap']
      , node = fromExpandedJSONLD(stupid).first()
  let values = node.getAt(path)
  t.plan(6)
  t.ok(values instanceof Set, 'returns an Set')
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
  t.ok(values instanceof Set, 'returns an Set')
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
  t.ok(JSONLDNode().types instanceof Set, 'types is a set')
  t.ok(JSONLDNode().types.equals(Set()), 'no types')
  t.ok(JSONLDNode(
    {'@type': Set()}).types.equals(Set()),
    'no types explicit')
  t.ok(JSONLDNode(
    {'@type': Set.of('http://schema.org/Person')}).types.equals(
    Set.of('http://schema.org/Person')), 'one type')
  try {JSONLDNode().types = null} catch (e) {
    t.ok(e instanceof TypeError, 'set throws TypeError')
    t.ok(/^Cannot set property types/.test(e.message), 'with message')
  }
  t.ok(fromExpandedJSONLD(stupid).first().types.equals(
     Set.of('http://stupid.com/Car')), 'this works too')
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
  t.ok(allkeywords.propertySeq().equals(Seq()),
    'keywords are skipped')
  t.ok(fromExpandedJSONLD(event).first()
    .propertySeq()
    .map(([predicate, ]) => predicate)
    .equals(Seq.of(
      'http://www.w3.org/2002/12/cal/ical#dtstart',
      'http://www.w3.org/2002/12/cal/ical#location',
      'http://www.w3.org/2002/12/cal/ical#summary'
    )), 'others terms are not')
})

test('test JSONLDNode.childNodes()', t => {
  const node = fromExpandedJSONLD(stupid).first()
      , expected = fromJS(stupid_children)
  t.plan(2)
  t.ok(node.childNodes().equals(expected), 'returns expected child nodes')
  t.ok(fromExpandedJSONLD(
    {'http://stupid.com/color': [{'@value': 'black'}]}).first()
       .childNodes().equals(List()), 'returns no child nodes')
})

test('test JSONLDNode.descendantNodes()', t => {
  const node = fromExpandedJSONLD(stupid).first()
      , expected = fromJS(stupid_descends)
      , leafnode = fromExpandedJSONLD(
          {'http://stupid.com/color': [{'@value': 'black'}]}).first()
  t.plan(2)
  t.ok(node.descendantNodes().equals(expected), 'returns expected nodes')
  t.ok(leafnode.descendantNodes().equals(
    List.of(List.of(List(), leafnode))),
    'returns itself')
})

test('test JSONLDNode.delete()', t => {
  const node = JSONLDNode({'@id': 'http://stupid.com/1'})
      , expected = JSONLDNode()
  t.plan(1)
  t.ok(node.delete('@id').equals(expected), 'returns expected node')
})

test('test JSONLDNode.remove()', t => {
  const node = JSONLDNode({'@id': 'http://stupid.com/1'})
      , expected = JSONLDNode()
  t.plan(1)
  t.ok(node.remove('@id').equals(expected), 'returns expected node')
})

test('test JSONLDNode.push()', t => {
  const node = JSONLDNode()
      , predicate = 'http://stupid.com/prop'
      , value1 = JSONLDValue({'@value': 'val1'})
      , value2 = JSONLDValue({'@value': 'val2'})
      , expected1 = JSONLDNode({[predicate]: List.of(value1)})
      , expected2 = JSONLDNode({[predicate]: List.of(value1, value2)})
  t.plan(2)
  t.ok(node.push(predicate, value1).equals(expected1))
  t.ok(node.push(predicate, value1).push(predicate, value2).equals(expected2))
})

test('test JSONLDNode.push(@type)', t => {
  const node = JSONLDNode()
      , class1 = 'http://stupid.com/Fish'
      , class2 = 'http://stupid.com/Bicycle'
      , expected1 = JSONLDNode({'@type': List.of(class1)})
      , expected2 = JSONLDNode({'@type': List.of(class1, class2)})
  t.plan(2)
  t.ok(node.push('@type', class1).equals(expected1))
  t.ok(node.push('@type', class1).push('@type', class2).equals(expected2))
})

test('test JSONLDNode.preferredLabel()', t => {
  const label1 = JSONLDValue({'@value': 'foo'})
      , label2 = JSONLDValue({'@value': 'bar'})
  t.plan(4)
  t.equal(JSONLDNode().preferredLabel(), undefined)
  t.ok(JSONLDNode()
    .push(rdfs('label'), label1)
    .preferredLabel()
    .equals(label1))
  t.ok(JSONLDNode()
    .push(skos('prefLabel'), label2)
    .preferredLabel()
    .equals(label2))
  t.ok(JSONLDNode()
    .push(rdfs('label'), label1)
    .push(skos('prefLabel'), label2)
    .preferredLabel()
    .equals(label2))
})

test('test JSONLDNode.preferredLabel(language)', t => {
  const label_en = JSONLDValue({'@value': 'English', '@language': 'en'})
      , label_ja = JSONLDValue({'@value': '日本語', '@language': 'ja'})
      , label_none = JSONLDValue({'@value': 'None'})
  t.plan(6)
  t.equal(JSONLDNode().preferredLabel('ja'), undefined)
  t.equal(JSONLDNode()
    .push(rdfs('label'), label_en)
    .preferredLabel('ja'), undefined)
  t.ok(JSONLDNode()
    .push(rdfs('label'), label_en)
    .preferredLabel('en')
    .equals(label_en))
  t.ok(JSONLDNode()
    .push(rdfs('label'), label_en)
    .push(rdfs('label'), label_ja)
    .preferredLabel('en')
    .equals(label_en))
  t.ok(JSONLDNode()
    .push(rdfs('label'), label_en)
    .push(rdfs('label'), label_ja)
    .push(rdfs('label'), label_none)
    .preferredLabel()
    .equals(label_none))
  t.ok(JSONLDNode()
    .push(rdfs('label'), label_en)
    .push(rdfs('label'), label_ja)
    .push(rdfs('label'), label_none)
    .preferredLabel('')
    .equals(label_none))
})

test('test JSONLDNode.preferredLabel(labelPredicates)', t => {
  const label1 = JSONLDValue({'@value': 'foo'})
      , label2 = JSONLDValue({'@value': 'bar'})
      , fake = ns('http://fake.net/')
      , labelPredicate1 = fake('label')
      , labelPredicate2 = fake('altLabel')
  t.plan(7)
  t.equal(JSONLDNode().preferredLabel(), undefined)
  t.ok(JSONLDNode()
    .push(fake('label'), label1)
    .preferredLabel('', [labelPredicate1])
    .equals(label1))
  t.equal(JSONLDNode()
    .push(fake('label'), label1)
    .preferredLabel('', [labelPredicate2]), undefined)
  t.ok(JSONLDNode()
    .push(fake('label'), label1)
    .preferredLabel('', [labelPredicate2, labelPredicate1])
    .equals(label1))
  t.ok(JSONLDNode()
    .push(fake('altLabel'), label2)
    .preferredLabel('', [labelPredicate2])
    .equals(label2))
  t.ok(JSONLDNode()
    .push(fake('label'), label1)
    .push(fake('altLabel'), label2)
    .preferredLabel('', [labelPredicate2])
    .equals(label2))
  t.ok(JSONLDNode()
    .push(fake('label'), label1)
    .push(fake('altLabel'), label2)
    .preferredLabel('', [labelPredicate1])
    .equals(label1))
})

