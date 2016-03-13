'use strict'

import {Map, Iterable} from 'immutable'

const IS_JSONLD_VALUE_SENTINEL = '@@__IMMUTABLE_JSONLD_VALUE__@@'
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

export function JSONLDValue(value) {
  return value === null || value === undefined ? emptyJSONLDValue() :
    isJSONLDValue(value) ? value :
      emptyJSONLDValue().withMutations(map => {
        var iter = Iterable.Keyed(value)
        assertNotInfinite(iter.size)
        iter.forEach((v, k) => map.set(k, v))
      })
}

JSONLDValue.prototype = Object.create(Map.prototype)
JSONLDValue.prototype.constructor = JSONLDValue
JSONLDValue.prototype[IS_JSONLD_VALUE_SENTINEL] = true
JSONLDValue.prototype[DELETE] = JSONLDValue.prototype.remove

JSONLDValue.prototype.toString = function () {
  return this.__toString('JSONLDValue {', '}')
}

JSONLDValue.prototype.get = function (k, notSetValue) {
  return this._map.get(k, notSetValue)
}

JSONLDValue.prototype.clear = function () {
  if (this.size === 0) {
    return this
  }
  if (this.__ownerID) {
    this.size = 0
    this._map.clear()
    return this
  }
  return emptyJSONLDValue()
}

JSONLDValue.prototype.set = function (k, v) {
  return updateJSONLDValue(this, k, v)
}

JSONLDValue.prototype.remove = function (k) {
  return updateJSONLDValue(this, k, NOT_SET)
}

JSONLDValue.prototype.wasAltered = function () {
  return this._map.wasAltered()
}

JSONLDValue.prototype.__iterate = function (fn, reverse) {
  return this._map.__iterate(fn, reverse)
}

JSONLDValue.prototype.__iterator = function (type, reverse) {
  return this._map.__iterator(type, reverse)
}

JSONLDValue.prototype.__ensureOwner = function(ownerID) {
  if (ownerID === this.__ownerID) {
    return this
  }
  var newMap = this._map.__ensureOwner(ownerID)
  if (!ownerID) {
    this.__ownerID = ownerID
    this._map = newMap
    return this
  }
  return makeJSONLDValue(newMap, ownerID, this.__hash)
}

function isJSONLDValue(maybeJSONLDValue) {
  return !!(maybeJSONLDValue && maybeJSONLDValue[IS_JSONLD_VALUE_SENTINEL])
}
JSONLDValue.isJSONLDValue = isJSONLDValue

function makeJSONLDValue(map, ownerID, hash) {
  var value = Object.create(JSONLDValue.prototype)
  value.size = map ? map.size : 0
  value._map = map
  value.__ownerID = ownerID
  value.__hash = hash
  Object.defineProperties(value,
    { language: {get: () => map.get('@language')}
    , type: {get: () => map.get('@type')}
    , value: {get: () => map.get('@value')}
    })
  return value
}

var EMPTY_JSONLD_VALUE
function emptyJSONLDValue() {
  return (EMPTY_JSONLD_VALUE ||
    (EMPTY_JSONLD_VALUE = makeJSONLDValue(Map())))
}

function updateJSONLDValue(value, k, v) {
  var map = value._map
  var i = map.get(k)
  var has = i !== undefined
  var newMap
  if (v === NOT_SET) { // removed
    if (!has) {
      return value
    }
    newMap = map.remove(k)
  } else {
    newMap = map.set(k, v)
  }
  if (value.__ownerID) {
    value.size = newMap.size
    value._map = newMap
    value.__hash = undefined
    return value
  }
  return makeJSONLDValue(newMap)
}
