'use strict'

import Immutable from 'immutable'
import {JSONLDNode} from './JSONLDNode'
import {JSONLDValue} from './JSONLDValue'

export function JSONLDReviver(k, v) {
  let isIndexed = Immutable.Iterable.isIndexed(v)
  return isIndexed ? v.toSet() :
    v.has('@value') ? JSONLDValue(v) : JSONLDNode(v)
}

export function fromExpandedJSONLD(jsonld) {
  if (jsonld === null || jsonld === undefined) {
    return Immutable.Set()
  } else {
    let any = Immutable.fromJS(jsonld, JSONLDReviver)
    return Immutable.Set.isSet(any) ? any : Immutable.Set.of(any)
  }
}
