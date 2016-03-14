'use strict'

import {Map, Set, Iterable} from 'immutable'

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
JSONLDNode.prototype[DELETE] = JSONLDNode.prototype.remove

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
  return this._map.keySeq().filterNot(key => KEYWORDS.includes(key))
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
