'use strict'

import {Set, List} from 'immutable'
import {JSONLDNode, JSONLDValue} from './ImmutableJSONLD'

const valueKeys = Set.of('@value', '@type', '@language', '@index')

const disallowedNodeKeys = Set.of('@value', '@list', '@set')

const disallowedExpandedNodeKeys = Set.of('@context', '@graph')

const show = list => `[ ${list.join(', ')} ]`

const invalidValue = keyPath => `invalid value object keypath: ${show(keyPath)}`
const invalidNode = keyPath => `invalid node object keypath: ${show(keyPath)}`
const invalidExpandedNode = keyPath => (
  `invalid expanded node object keypath: ${show(keyPath)}`
)

const problemReducer = ({node, keyPath, problem}, key, keyPathIndex) => {
  if (problem !== null) {
    return {node, keyPath, problem}
  }
  if (! (typeof(key) === 'string' || typeof(key) === 'number')) {
    return {node, keyPath, problem: invalidNode(keyPath)}
  }
  if (disallowedNodeKeys.includes(key)) {
    return {node, keyPath, problem: invalidNode(keyPath)}
  }
  if (disallowedExpandedNodeKeys.includes(key)) {
    return {node, keyPath, problem: invalidExpandedNode(keyPath)}
  }
  if (key === '@id' && keyPathIndex !== keyPath.size - 1) {
    return {node, keyPath, problem: invalidNode(keyPath)}
  }
  if (key === '@type' && keyPathIndex < keyPath.size - 2) {
    return {node, keyPath, problem: invalidNode(keyPath)}
  }
  if (key === '@type'
      && keyPathIndex !== keyPath.size - 1
      && typeof(keyPath.get(keyPathIndex + 1)) !== 'number'
     ) {
    return {node, keyPath, problem: invalidNode(keyPath)}
  }
  if (key === '@index' && keyPathIndex !== keyPath.size - 1) {
    return {node, keyPath, problem: invalidNode(keyPath)}
  }
  if (key === '@reverse'
      && keyPathIndex !== keyPath.size - 1
      && typeof(keyPath.get(keyPathIndex + 1)) !== 'string'
     ) {
    return {node, keyPath, problem: invalidNode(keyPath)}
  }
  if (key !== '@reverse'
      && typeof(key) === 'string'
      && keyPathIndex !== keyPath.size - 1
      && typeof(keyPath.get(keyPathIndex + 1)) !== 'number'
     ) {
    return {node, keyPath, problem: invalidNode(keyPath)}
  }
  if (typeof(key) === 'number'
      && keyPathIndex !== keyPath.size - 1
      && typeof(keyPath.get(keyPathIndex + 1)) !== 'string'
     ) {
    return {node, keyPath, problem: invalidNode(keyPath)}
  }
  if (typeof(key) === 'number'
      && keyPathIndex !== 0
      && keyPathIndex !== keyPath.size - 1
      && keyPath.get(keyPathIndex - 1) === '@type'
     ) {
    return {node, keyPath, problem: invalidNode(keyPath)}
  }
  if (key !== '@id'
      && key !== '@index'
      && key !== '@reverse'
      && typeof(key) === 'string'
      && keyPathIndex !== keyPath.size - 1
     ) {
    const path = keyPath.slice(0, keyPathIndex + 1)
    if (! List.isList(node.getIn(path))) {
      return (
        { node
        , keyPath
        , problem: `no Immutable.List exists at keypath: ${show(path)}`
        }
      )
    }
  }
  if (typeof(key) === 'number'
      && keyPathIndex !== keyPath.size - 1
     ) {
    const path = keyPath.slice(0, keyPathIndex + 1)
    if (! JSONLDNode.isJSONLDNode(node.getIn(path))) {
      return (
        { node
        , keyPath
        , problem: `no JSONLDNode exists at keypath: ${show(path)}`
        }
      )
    }
  }
  return {node, keyPath, problem: null}
}

export const findJSONLDNodeKeypathProblem = (node, keyPath) => {
  if (keyPath.isEmpty()) {
    return null
  }
  if (typeof(keyPath.first()) === 'number') {
    return invalidNode(keyPath)
  }
  return keyPath.reduceRight(
    problemReducer, {node, keyPath, problem: null}).problem
}

export const findJSONLDValueKeypathProblem = (value, keyPath) => {
  if (keyPath.isEmpty()) {
    return null
  }
  if (keyPath.size > 1) {
    return invalidValue(keyPath)
  }
  const key = keyPath.first()
  if (! valueKeys.includes(key)) {
    return invalidValue(keyPath)
  }
  if (value.has('@type') && key === '@language') {
    return 'typed values cannot have an @language key'
  }
  if (value.has('@language') && key === '@type') {
    return 'language tagged strings cannot have an @type key'
  }
  return null
}

export const findKeypathProblem = (map, keypath) => (
  JSONLDNode.isJSONLDNode(map)
    ? findJSONLDNodeKeypathProblem (map, List(keypath))
    : JSONLDValue.isJSONLDValue(map)
      ? findJSONLDValueKeypathProblem(map, List(keypath))
      : null
)

export const validateKeypath = (map, keypath) => {
  const problem = findKeypathProblem(map, keypath)
  if (problem !== null) {
    throw problem
  }
}
