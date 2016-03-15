'use strict'

import Immutable from 'immutable'
import JSONLD from 'jsonld'
import {JSONLDNode} from './JSONLDNode'
import {JSONLDValue} from './JSONLDValue'

const ensureJS = x => Immutable.Iterable.isIterable(x) ? x.toJS() : x

export function JSONLDReviver(k, v) {
  let isIndexed = Immutable.Iterable.isIndexed(v)
  return isIndexed ? v.toList() :
    v.has('@value') ? JSONLDValue(v) : JSONLDNode(v)
}

export function fromExpandedJSONLD(jsonld) {
  if (jsonld === null || jsonld === undefined) {
    return Immutable.List()
  } else {
    let any = Immutable.fromJS(ensureJS(jsonld), JSONLDReviver)
    return Immutable.List.isList(any) ? any : Immutable.List.of(any)
  }
}

export function fromJSONLD(jsonld) {
  return new Promise((resolve, reject) => {
    JSONLD.promises.expand(ensureJS(jsonld))
      .then(expanded => resolve(fromExpandedJSONLD(expanded)))
      .catch(reject)
  })
}
