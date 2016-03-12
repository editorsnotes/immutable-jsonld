'use strict'

import Immutable from 'immutable'
import {JSONLDNode} from './JSONLDNode'
import {JSONLDValue} from './JSONLDValue'

export function JSONLDReviver(k, v) {
  let isIndexed = Immutable.Iterable.isIndexed(v)
  return isIndexed ? v.toList() :
    v.has('@value') ? JSONLDValue(v) : JSONLDNode(v)
}

export function fromExpandedJSONLD(jsonld) {
  if (jsonld === null || jsonld === undefined) {
    return Immutable.List()
  } else {
    let any = Immutable.fromJS(jsonld, JSONLDReviver)
    return Immutable.List.isList(any) ? any : Immutable.List.of(any)
  }
}
