'use strict'

import test from 'tape'
import {List} from 'immutable'
import {JSONLDValue, JSONLDNode, fromExpandedJSONLD} from '../ImmutableJSONLD'
import {validateKeypath, findKeypathProblem} from '../validateKeypath'

test('test find problems with JSONLDValue paths', t => {
  t.plan(9)

  const value = JSONLDValue()
  t.equals(findKeypathProblem(value, List.of()), null)
  t.equals(findKeypathProblem(value, List.of('@value')), null)
  t.equals(findKeypathProblem(value, List.of('@type')), null)
  t.equals(findKeypathProblem(value, List.of('@language')), null)
  t.equals(findKeypathProblem(value, List.of('@index')), null)
  t.equals(findKeypathProblem(value, List.of('somethingelse')),
    'invalid value object keypath: [ somethingelse ]')
  t.equals(findKeypathProblem(value, List.of('@type', '@type')),
    'invalid value object keypath: [ @type, @type ]')

  const typedValue = JSONLDValue().set('@type', 'http://schema.org/Text')
  t.equals(findKeypathProblem(typedValue, List.of('@language')),
    'typed values cannot have an @language key')

  const languageTaggedString = JSONLDValue().set('@language', 'en')
  t.equals(findKeypathProblem(languageTaggedString, List.of('@type')),
    'language tagged strings cannot have an @type key')
})

test('test find problems with JSONLDNode paths', t => {
  t.plan(30)

  const node = JSONLDNode()

  t.equals(findKeypathProblem(node, List.of()), null)

  t.equals(findKeypathProblem(node, List.of('@value')),
    'invalid node object keypath: [ @value ]')
  t.equals(findKeypathProblem(node, List.of('@list')),
    'invalid node object keypath: [ @list ]')
  t.equals(findKeypathProblem(node, List.of('@set')),
    'invalid node object keypath: [ @set ]')

  t.equals(findKeypathProblem(node, List.of('@context')),
    'invalid expanded node object keypath: [ @context ]')
  t.equals(findKeypathProblem(node, List.of('@graph')),
    'invalid expanded node object keypath: [ @graph ]')

  t.equals(findKeypathProblem(node, List.of('@id')), null)
  t.equals(findKeypathProblem(node, List.of('@id', 3)),
    'invalid node object keypath: [ @id, 3 ]')

  t.equals(findKeypathProblem(node, List.of('@type')), null)
  t.equals(findKeypathProblem(node, List.of('@type', 3)),
    'no Immutable.List exists at keypath: [ @type ]')
  t.equals(findKeypathProblem(node, List.of('@type', 'anystring')),
    'invalid node object keypath: [ @type, anystring ]')

  t.equals(findKeypathProblem(node, List.of('@index')), null)
  t.equals(findKeypathProblem(node, List.of('@index', 3)),
    'invalid node object keypath: [ @index, 3 ]')

  t.equals(findKeypathProblem(node, List.of('@reverse')), null)
  t.equals(findKeypathProblem(node, List.of('@reverse', 'anystring')), null)
  t.equals(findKeypathProblem(node, List.of('@reverse', 3)),
    'invalid node object keypath: [ @reverse, 3 ]')

  t.equals(findKeypathProblem(node, List.of('anystring')), null)
  t.equals(findKeypathProblem(node, List.of(3)),
    'invalid node object keypath: [ 3 ]')

  t.equals(findKeypathProblem(node, List.of('anystring', 'anystring')),
    'invalid node object keypath: [ anystring, anystring ]')
  t.equals(findKeypathProblem(node, List.of('anystring', 3)),
    'no Immutable.List exists at keypath: [ anystring ]')
  t.equals(findKeypathProblem(node, List.of(3, 'anystring')),
    'invalid node object keypath: [ 3, anystring ]')

  t.equals(findKeypathProblem(node, List.of('anystring', 3, 3)),
    'invalid node object keypath: [ anystring, 3, 3 ]')
  t.equals(findKeypathProblem(node, List.of('anystring', 3, 'anystring')),
    'no JSONLDNode or JSONLDValue exists at keypath: [ anystring, 3 ]')

  const node2 = JSONLDNode().push('blah', JSONLDNode())
  t.equals(
    findKeypathProblem(node2, List.of('blah', 3, 'anystring', 'anystring')),
    'invalid node object keypath: [ blah, 3, anystring, anystring ]'
  )
  t.equals(
    findKeypathProblem(node2, List.of('blah', 3, 'anystring', 2, 'anystring')),
    'no JSONLDNode or JSONLDValue exists at keypath: [ blah, 3, anystring, 2 ]')

  const node3 = JSONLDNode().push(
    'foo', JSONLDNode().push('bar', JSONLDValue()))
  t.equals(
    findKeypathProblem(node3,
      List.of('foo', 3, 'bar', 7, 'anystring', 'anystring')),
    'invalid node object keypath: [ foo, 3, bar, 7, anystring, anystring ]'
  )
  t.equals(
    findKeypathProblem(node3,
      List.of('foo', 2, 'bar', 6, 'anystring', 0, 'anystring')),
    'no JSONLDNode or JSONLDValue exists at keypath: [ foo, 2, bar, 6, anystring, 0 ]'
  )

  const node4 = JSONLDNode().push('@type', 'http://example.org/something')
  t.equals(findKeypathProblem(node4, List.of('@type', 3)), null)
  t.equals(findKeypathProblem(node4, List.of('@type', 0, 'anything')),
    'invalid node object keypath: [ @type, 0, anything ]')

  const node5 = JSONLDNode().push('name', JSONLDValue())
  t.equals(findKeypathProblem(node5, List.of('name', 0, '@value')), null)
})

test('validateKeypath works with arrays too', t => {
  t.plan(4)
  const value = JSONLDValue()
  t.equals(findKeypathProblem(value, []), null)
  t.equals(findKeypathProblem(value, ['@value']), null)
  const node = JSONLDNode()
  t.equals(findKeypathProblem(node, []), null)
  t.equals(findKeypathProblem(node, ['@id']), null)
})

test('key path entries can only be numbers and strings', t => {
  t.plan(10)

  t.equals(findKeypathProblem(JSONLDValue(), [undefined]),
    'invalid value object keypath: [  ]')
  t.equals(findKeypathProblem(JSONLDValue(), [{}]),
    'invalid value object keypath: [ [object Object] ]')
  t.equals(findKeypathProblem(JSONLDValue(), [[]]),
    'invalid value object keypath: [  ]')
  t.equals(findKeypathProblem(JSONLDValue(), [true]),
    'invalid value object keypath: [ true ]')
  t.equals(findKeypathProblem(JSONLDValue(), [Symbol('foo')]),
    'invalid value object keypath: [ Symbol(foo) ]')

  t.equals(findKeypathProblem(JSONLDNode(), [undefined]),
    'invalid node object keypath: [  ]')
  t.equals(findKeypathProblem(JSONLDNode(), [{}]),
    'invalid node object keypath: [ [object Object] ]')
  t.equals(findKeypathProblem(JSONLDNode(), [[]]),
    'invalid node object keypath: [  ]')
  t.equals(findKeypathProblem(JSONLDNode(), [true]),
    'invalid node object keypath: [ true ]')
  t.equals(findKeypathProblem(JSONLDNode(), [Symbol('foo')]),
    'invalid node object keypath: [ Symbol(foo) ]')
})

test('validateKeypath throws if findKeypathProblem returns not null', t => {
  t.plan(1)
  t.throws(() => validateKeypath(JSONLDValue(), List.of('x')),
    /invalid value object keypath: \[ x \]/)
})

import reverse_expanded from '../../test/data/reverse-expanded.json'
test('valid @reverse keypaths work', t => {
  const node = fromExpandedJSONLD(reverse_expanded)
  t.plan(1)
  t.equal(findKeypathProblem(node,
    ['@reverse'
    , 'http://example.com/vocab#parent'
    , 1
    , '@id'
    ]), null)
})

import list_expanded from '../../test/data/list-expanded.json'
test('valid @list keypaths work', t => {
  const node = fromExpandedJSONLD(list_expanded)
  t.plan(1)
  t.equal(findKeypathProblem(node,
    ['http://xmlns.com/foaf/0.1/nick'
    , '@list'
    , 1
    , 'value'
    ]), null)
})
