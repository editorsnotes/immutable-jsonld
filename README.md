## `fromJSONLD`

Use `fromJSONLD` to asynchronously load JSON-LD from a URL or JavaScript objects or arrays. Returns an [`Immutable.List`](http://facebook.github.io/immutable-js/docs/#/List) of `JSONLDNodes`.

```javascript
var IJLD = require('immutable-jsonld')
IJLD.fromJSONLD({'@context': {name: 'http://xmlns.com/foaf/0.1/name'},
                 '@id': 'http://viaf.org/viaf/61794068', 'name': 'Kanye'})
    .then(function(nodes) { console.log(nodes) })
```
> List [ JSONLDNode { "@id": "http://viaf.org/viaf/61794068", "http://xmlns.com/foaf/0.1/name": List [ JSONLDValue { "@value": "Kanye" } ] } ]

## `JSONLDValue`

A `JSONLDValue` is just an [`Immutable.Map`](http://facebook.github.io/immutable-js/docs/#/Map) interface to the [expanded form](https://www.w3.org/TR/json-ld/#expanded-document-form) of a JSON-LD [value object](https://www.w3.org/TR/json-ld/#value-objects), with a few convenience methods and getters added:

```javascript
var IJLD = require('immutable-jsonld')
var value = IJLD.JSONLDValue(
  { '@value': '頑張れ日本'
  , '@type': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString'
  , '@language': 'ja'
  }
)
console.log(value.value)
console.log(value.type)
console.log(value.language)
```
> 頑張れ日本

> http://www.w3.org/1999/02/22-rdf-syntax-ns#langString

> ja

## `JSONLDNode`

A `JSONLDNode` is just an [`Immutable.Map`](http://facebook.github.io/immutable-js/docs/#/Map) interface to the [expanded form](https://www.w3.org/TR/json-ld/#expanded-document-form) of a JSON-LD [node object](https://www.w3.org/TR/json-ld/#node-objects), with a few convenience methods and getters added:

```javascript
var IJLD = require('immutable-jsonld')
IJLD.fromJSONLD({'@context': {name: 'http://xmlns.com/foaf/0.1/name'},
                 '@id': 'http://viaf.org/viaf/61794068', 'name': 'Kanye',
                 '@type': 'http://xmlns.com/foaf/0.1/Person'})
    .then(function(nodes) {
      node = nodes.first()
      console.log(node.id)
      console.log(node.types)
      console.log(nodes.propertySeq())
    })
```
> http://viaf.org/viaf/61794068

> Set { "http://xmlns.com/foaf/0.1/Person" }

> Seq [ http://xmlns.com/foaf/0.1/name, List [ JSONLDValue { "@value": "Kanye" } ] ]

`childNodes()` returns an [`Immutable.List`](http://facebook.github.io/immutable-js/docs/#/List) of predicate-`JSONLDNode` pairs (these pairs are also `Immutable.List`s), one for each node object value of the node's properties. (See the [source JSON-LD](https://gist.github.com/rybesh/3cbacf6cbc539b7c22f7) for these examples.)

```javascript
var IJLD = require('immutable-jsonld')
var url = 'https://gist.githubusercontent.com/rybesh/3cbacf6cbc539b7c22f7/raw/2c15ecbd3e878dd40523fa1ad8c70f004a1bb193/stupid.json'
IJLD.fromJSONLD(url).then(function(nodes) {
  console.log(nodes.first().childNodes())
})
```
> List [ List [ "http://stupid.com/wheels", JSONLDNode { "http://stupid.com/hubcap": List [ JSONLDNode { "http://stupid.com/color": List [ JSONLDValue { "@value": "black" } ] } ], "http://stupid.com/location": List [ JSONLDValue { "@value": "front right" } ] } ], List [ "http://stupid.com/wheels", JSONLDNode { "http://stupid.com/hubcap": List [ JSONLDNode { "http://stupid.com/color": List [ JSONLDValue { "@value": "unknown" } ], "http://stupid.com/status": List [ JSONLDValue { "@value": "missing" } ] } ], "http://stupid.com/location": List [ JSONLDValue { "@value": "front left" } ] } ], List [ "http://stupid.com/wheels", JSONLDNode { "http://stupid.com/hubcap": List [ JSONLDNode { "http://stupid.com/color": List [ JSONLDValue { "@value": "black" } ] } ], "http://stupid.com/location": List [ JSONLDValue { "@value": "rear right" } ] } ], List [ "http://stupid.com/wheels", JSONLDNode { "http://stupid.com/hubcap": List [ JSONLDNode { "http://stupid.com/color": List [ JSONLDValue { "@value": "black" } ] } ], "http://stupid.com/location": List [ JSONLDValue { "@value": "rear left" } ] } ] ]

`descendantNodes()` returns an [`Immutable.List`](http://facebook.github.io/immutable-js/docs/#/List) of [property path](https://www.w3.org/TR/sparql11-query/#propertypaths)-`JSONLDNode` pairs (these pairs are `Immutable.List`s), one for the node itself (i.e. the node reached via the empty property path), and one for every other node nested within it (in depth-first order). The property paths are also `Immutable.List`s.

```javascript
var IJLD = require('immutable-jsonld')
var url = 'https://gist.githubusercontent.com/rybesh/3cbacf6cbc539b7c22f7/raw/2c15ecbd3e878dd40523fa1ad8c70f004a1bb193/stupid.json'
IJLD.fromJSONLD(url).then(function(nodes) {
  console.log(nodes.first().descendantNodes()
                           .map(function (pair) { return pair.get(0) }))
})
```
> List [ List [], List [ "http://stupid.com/wheels" ], List [ "http://stupid.com/wheels", "http://stupid.com/hubcap" ], List [ "http://stupid.com/wheels" ], List [ "http://stupid.com/wheels", "http://stupid.com/hubcap" ], List [ "http://stupid.com/wheels" ], List [ "http://stupid.com/wheels", "http://stupid.com/hubcap" ], List [ "http://stupid.com/wheels" ], List [ "http://stupid.com/wheels", "http://stupid.com/hubcap" ] ]

`getAt()` takes a [property path](https://www.w3.org/TR/sparql11-query/#propertypaths) and returns an [`Immutable.Set`](http://facebook.github.io/immutable-js/docs/#/Set) of `JSONLDNode`s.

```javascript
var IJLD = require('immutable-jsonld')
var url = 'https://gist.githubusercontent.com/rybesh/3cbacf6cbc539b7c22f7/raw/2c15ecbd3e878dd40523fa1ad8c70f004a1bb193/stupid.json'
IJLD.fromJSONLD(url).then(function(nodes) {
  console.log(nodes.first().getAt(
    [ 'http://stupid.com/wheels'
    , 'http://stupid.com/hubcap'
    , 'http://stupid.com/color'
    ]))
})
```
> Set { JSONLDValue { "@value": "black" }, JSONLDValue { "@value": "unknown" } }

`push()` takes a predicate URI or JSON-LD keyword and appends the supplied object to the appropriate property.

```javascript
JSONLDNode().push('http://xmlns.com/foaf/0.1/name', JSONLDValue { "@value": "Coltrane" })

```
> JSONLDNode { "http://xmlns.com/foaf/0.1/name": List [ JSONLDValue { "@value": "Coltrane" } ] }

```javascript
JSONLDNode().push('@type', 'http://xmlns.com/foaf/0.1/Agent')

```
> JSONLDNode { "http://xmlns.com/foaf/0.1/Agent": List [ "http://xmlns.com/foaf/0.1/Agent" ] }

`preferredLabel()` returns a usable label, if one exists.

```javascript
JSONLDNode()
  .push('http://www.w3.org/2000/01/rdf-schema#label', JSONLDValue { "@value": "something" })
  .preferredLabel()
```
> something

```javascript
JSONLDNode()
  .push('http://www.w3.org/2000/01/rdf-schema#label', JSONLDValue { "@value": "something" })
  .push('http://www.w3.org/2004/02/skos/core#prefLabel', JSONLDValue { "@value": "something else" })
  .preferredLabel()
```
> something else

```javascript
JSONLDNode()
  .push('http://www.w3.org/2000/01/rdf-schema#label',
        JSONLDValue { "@value": "English", "@language": "en" })
  .push('http://www.w3.org/2000/01/rdf-schema#label',
        JSONLDValue { "@value": "日本語", "@language": "ja" })
  .preferredLabel('ja')
```
> 日本語

See the [tests](test) for more examples.

## Key path validation

Using `fromJSONLD()` will always return a list of `JSONLDNode`s that, when serialized back to JSON, will result in valid JSON-LD. However, it is possible to programmatically create a `JSONLDNode` that, when serialized back to JSON, is *not* valid JSON-LD. To help you avoid doing this, the `JSONLDNode` methods for making persistent changes will do some validation of the key path you provide, and throw an exception if your change would result in an invalid serialization. If the `NODE_ENV` environment variable is set to `production`, this validation will not be performed.

## `setIn()` and `updateIn()` key path handling

With the implementations of `setIn()` and `updateIn()` in `Immutable.Map`, a new Immutable.Map is created at each key that does not exist. The implementations of `setIn()` and `updateIn()` in `JSONLDNode` differ such that if any keys in the key path (prior to the last) do not exist, an exception will be thrown. This is to help prevent the creation of structures that would result in invalid expanded JSON-LD. If the `NODE_ENV` environment variable is set to `production`, these checks will not be performed.
