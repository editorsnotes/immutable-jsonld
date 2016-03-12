'use strict'

import test from 'tape'
import Immutable from 'immutable'
import {JSONLDNode, fromExpandedJSONLD} from '../ImmutableJSONLD'

import person from '../../test/data/person-expanded.json'
import event from '../../test/data/event-expanded.json'
import place from '../../test/data/place-expanded.json'
import product from '../../test/data/product-expanded.json'
import recipe from '../../test/data/recipe-expanded.json'
import library from '../../test/data/library-expanded.json'
import activity from '../../test/data/activity-expanded.json'
import stupid from '../../test/data/stupid-expanded.json'

test('test fromExpandedJSONLD()', t => {
  const nodes = fromExpandedJSONLD()
  t.plan(3)
  t.ok(nodes instanceof Immutable.List, 'is Immutable.List')
  t.ok(nodes.isEmpty(), 'is empty')
  t.equal(nodes.size, 0, 'size is 0')
})

test('test fromExpandedJSONLD(null)', t => {
  const nodes = fromExpandedJSONLD(null)
  t.plan(3)
  t.ok(nodes instanceof Immutable.List, 'is Immutable.List')
  t.ok(nodes.isEmpty(), 'is empty')
  t.equal(nodes.size, 0, 'size is 0')
})

test('test fromExpandedJSONLD([])', t => {
  const nodes = fromExpandedJSONLD([])
  t.plan(3)
  t.ok(nodes instanceof Immutable.List, 'is Immutable.List')
  t.ok(nodes.isEmpty(), 'is empty')
  t.equal(nodes.size, 0, 'size is 0')
})

test('test fromExpandedJSONLD({})', t => {
  const nodes = fromExpandedJSONLD({})
  t.plan(4)
  t.ok(nodes instanceof Immutable.List, 'is Immutable.List')
  t.equal(nodes.size, 1, 'size is 1')
  t.ok(nodes.first() instanceof JSONLDNode, 'contains a JSONLDNode')
  t.ok(nodes.first().isEmpty(), 'contains an empty JSONLDNode')
})

test('test fromExpandedJSONLD(person)', t => {
  const nodes = fromExpandedJSONLD(person)
  t.plan(5)
  t.ok(nodes instanceof Immutable.List, 'is Immutable.List')
  t.equal(nodes.size, 1, 'size is 1')
  t.deepEqual(nodes.toJS(), person, 'round-trips OK')

  let node = nodes.first()
  t.ok(node instanceof JSONLDNode, 'contains a JSONLDNode')
  t.equal(node.size, 5, 'with 5 entries')
})

test('test fromExpandedJSONLD(event)', t => {
  const nodes = fromExpandedJSONLD(event)
  t.plan(5)
  t.ok(nodes instanceof Immutable.List, 'is Immutable.List')
  t.equal(nodes.size, 1, 'size is 1')
  t.deepEqual(nodes.toJS(), event, 'round-trips OK')

  let node = nodes.first()
  t.ok(node instanceof JSONLDNode, 'contains a JSONLDNode')
  t.equal(node.size, 3, 'with 3 entries')
})

test('test fromExpandedJSONLD(place)', t => {
  const nodes = fromExpandedJSONLD(place)
  t.plan(5)
  t.ok(nodes instanceof Immutable.List, 'is Immutable.List')
  t.equal(nodes.size, 1, 'size is 1')
  t.deepEqual(nodes.toJS(), place, 'round-trips OK')

  let node = nodes.first()
  t.ok(node instanceof JSONLDNode, 'contains a JSONLDNode')
  t.equal(node.size, 4, 'with 4 entries')
})

test('test fromExpandedJSONLD(product)', t => {
  const nodes = fromExpandedJSONLD(product)
  t.plan(5)
  t.ok(nodes instanceof Immutable.List, 'is Immutable.List')
  t.equal(nodes.size, 1, 'size is 1')
  t.deepEqual(nodes.toJS(), product, 'round-trips OK')

  let node = nodes.first()
  t.ok(node instanceof JSONLDNode, 'contains a JSONLDNode')
  t.equal(node.size, 4, 'with 4 entries')
})

test('test fromExpandedJSONLD(recipe)', t => {
  const nodes = fromExpandedJSONLD(recipe)
  t.plan(5)
  t.ok(nodes instanceof Immutable.List, 'is Immutable.List')
  t.equal(nodes.size, 1, 'size is 1')
  t.deepEqual(nodes.toJS(), recipe, 'round-trips OK')

  let node = nodes.first()
  t.ok(node instanceof JSONLDNode, 'contains a JSONLDNode')
  t.equal(node.size, 4, 'with 4 entries')
})

test('test fromExpandedJSONLD(library)', t => {
  const nodes = fromExpandedJSONLD(library)
  t.plan(4)
  t.ok(nodes instanceof Immutable.List, 'is Immutable.List')
  t.equal(nodes.size, 3, 'size is 3')
  t.deepEqual(nodes.toJS(), library, 'round-trips OK')

  let node = nodes.first()
  t.ok(node instanceof JSONLDNode, 'contains a JSONLDNode')
})

test('test fromExpandedJSONLD(activity)', t => {
  const nodes = fromExpandedJSONLD(activity)
  t.plan(5)
  t.ok(nodes instanceof Immutable.List, 'is Immutable.List')
  t.equal(nodes.size, 1, 'size is 1')
  t.deepEqual(nodes.toJS(), activity, 'round-trips OK')

  let node = nodes.first()
  t.ok(node instanceof JSONLDNode, 'contains a JSONLDNode')
  t.equal(node.size, 4, 'with 4 entries')
})

test('test fromExpandedJSONLD(stupid)', t => {
  const nodes = fromExpandedJSONLD(stupid)
  t.plan(5)
  t.ok(nodes instanceof Immutable.List, 'is Immutable.List')
  t.equal(nodes.size, 1, 'size is 1')
  t.deepEqual(nodes.toJS(), stupid, 'round-trips OK')

  let node = nodes.first()
  t.ok(node instanceof JSONLDNode, 'contains a JSONLDNode')
  t.equal(node.size, 2, 'with 2 entries')
})
