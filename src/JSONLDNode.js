'use strict'

import {Map, Set, List, Iterable} from 'immutable'
import ns from 'rdf-ns'

const IS_JSONLD_NODE_SENTINEL = '@@__IMMUTABLE_JSONLD_NODE__@@'
    , KEYWORDS = Set.of(
      '@context', '@id', '@graph', '@type', '@reverse', '@index')
    , DELETE = 'delete'
    , NOT_SET = {}

const invariant = (condition, error) => {
  if (!condition) throw new Error(error)
}
const assertNotInfinite = size => {
  invariant(
    size !== Infinity,
    'Cannot perform this action with an infinite size.'
  )
}

export function JSONLDNode(value) {
  return value === null || value === undefined ? emptyJSONLDNode() :
    isJSONLDNode(value) ? value :
      emptyJSONLDNode().withMutations(map => {
        var iter = Iterable.Keyed(value)
        assertNotInfinite(iter.size)
        iter.forEach((v, k) => map.set(k, v))
      })
}

JSONLDNode.prototype = Object.create(Map.prototype)
JSONLDNode.prototype.constructor = JSONLDNode
JSONLDNode.prototype[IS_JSONLD_NODE_SENTINEL] = true

JSONLDNode.prototype.toString = function () {
  return this.__toString('JSONLDNode {', '}')
}

JSONLDNode.prototype.get = function (k, notSetValue) {
  return this._map.get(k, notSetValue)
}

JSONLDNode.prototype.getAt = function (propertyPath, notSetValue) {
  var nested = Set.of(this)
  for (let prop of propertyPath) {
    nested = nested.flatMap(node => node.get(prop, notSetValue).toSet())
  }
  return nested
}

JSONLDNode.prototype.propertySeq = function () {
  return this._map.entrySeq().filterNot(([k, ]) => KEYWORDS.includes(k))
}

JSONLDNode.prototype.childNodes = function () {
  return this.propertySeq()
    .reduce((childNodes, [predicate, list]) => {
      let nodes = list.filter(child => isJSONLDNode(child))
      return childNodes.concat(nodes.map(node => List.of(predicate, node)))
    }, List())
}

const skos = ns('http://www.w3.org/2004/02/skos/core#')
const rdfs = ns('http://www.w3.org/2000/01/rdf-schema#')

JSONLDNode.prototype.preferredLabel = function (
  language, labelPredicates = [skos('prefLabel'), rdfs('label')]) {
  const predicates = List(labelPredicates)
  const result = this.propertySeq()
    // include only properties with preferred label predicates
    .filter(([predicate, ]) => predicates.includes(predicate))
    // include only properties with preferred language
    .filter(([ , list]) => language
      ? list.some(label => label.language === language)
      : true)
    // iterate over [predicate, label] pairs
    .flatMap(([predicate, list]) => list.map(label => [predicate, label]))
    // sort by preference order over label predicates
    .sort(([predicateA, ], [predicateB, ]) => {
      let indexA = predicates.indexOf(predicateA)
        , indexB = predicates.indexOf(predicateB)
      return indexA < indexB ? -1 : indexA > indexB ? 1 : 0
    })
    // sort by preference order
    .sort(([predicateA, labelA], [predicateB, labelB]) => {
      let indexA = predicates.indexOf(predicateA)
        , indexB = predicates.indexOf(predicateB)
      return indexA < indexB
        ? -1
        : indexA > indexB
            ? 1
            : labelA.language === labelB.language
                ? 0
                : labelA.language === language
                    ? -1
                    : labelB.language === language
                        ? 1
                        : 0
    })
    // return the first label
    .first()
  return result ? result[1] : undefined
}

JSONLDNode.prototype.push = function(predicate, object) {
  return this.update(predicate, List(), list => list.push(object))
}

function descendantNodesOf(node, propertyPath=List()) {
  return List.of(List.of(propertyPath, node)).concat(
    node.childNodes()
      .flatMap(([predicate, child]) =>
               descendantNodesOf(child, propertyPath.push(predicate))))
}

JSONLDNode.prototype.descendantNodes = function () {
  return descendantNodesOf(this)
}

JSONLDNode.prototype.clear = function () {
  if (this.size === 0) {
    return this
  }
  if (this.__ownerID) {
    this.size = 0
    this._map.clear()
    return this
  }
  return emptyJSONLDNode()
}

JSONLDNode.prototype.set = function (k, v) {
  return updateJSONLDNode(this, k, v)
}

JSONLDNode.prototype.remove = function (k) {
  return updateJSONLDNode(this, k, NOT_SET)
}

JSONLDNode.prototype[DELETE] = JSONLDNode.prototype.remove

JSONLDNode.prototype.wasAltered = function () {
  return this._map.wasAltered()
}

JSONLDNode.prototype.__iterate = function (fn, reverse) {
  return this._map.__iterate(fn, reverse)
}

JSONLDNode.prototype.__iterator = function (type, reverse) {
  return this._map.__iterator(type, reverse)
}

JSONLDNode.prototype.__ensureOwner = function(ownerID) {
  if (ownerID === this.__ownerID) {
    return this
  }
  var newMap = this._map.__ensureOwner(ownerID)
  if (!ownerID) {
    this.__ownerID = ownerID
    this._map = newMap
    return this
  }
  return makeJSONLDNode(newMap, ownerID, this.__hash)
}

function isJSONLDNode(maybeJSONLDNode) {
  return !!(maybeJSONLDNode && maybeJSONLDNode[IS_JSONLD_NODE_SENTINEL])
}
JSONLDNode.isJSONLDNode = isJSONLDNode

function makeJSONLDNode(map, ownerID, hash) {
  var node = Object.create(JSONLDNode.prototype)
  node.size = map ? map.size : 0
  node._map = map
  node.__ownerID = ownerID
  node.__hash = hash
  Object.defineProperties(node,
    { id: {get: () => map.get('@id')}
    , types: {get: () => map.get('@type', Set()).toSet()}
    }
  )
  return node
}

var EMPTY_JSONLD_NODE
function emptyJSONLDNode() {
  return (EMPTY_JSONLD_NODE ||
    (EMPTY_JSONLD_NODE = makeJSONLDNode(Map())))
}

function updateJSONLDNode(node, k, v) {
  var map = node._map
  var i = map.get(k)
  var has = i !== undefined
  var newMap
  if (v === NOT_SET) { // removed
    if (!has) {
      return node
    }
    newMap = map.remove(k)
  } else {
    newMap = map.set(k, v)
  }
  if (node.__ownerID) {
    node.size = newMap.size
    node._map = newMap
    node.__hash = undefined
    return node
  }
  return makeJSONLDNode(newMap)
}
