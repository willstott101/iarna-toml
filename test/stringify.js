'use strict'
const test = require('tap').test
const TOML = require('..')

const roundtrip = {
  'toJSON is not a function': {obj: {a: {toJSON: 'EXAMPLE'}}, toml: `[a]\ntoJSON = "EXAMPLE"\n`},
  'array of arrays': {obj: {a: [[5], [23]]}, toml: 'a = [ [ 5 ], [ 23 ] ]\n',
  'array of tables': {obj: {a: [{b: 5}, {b: 23}]}, toml: '[[a]]\nb = 5\n\n[[a]]\nb = 23\n'}},
  'inline objects': {obj: {a: [[{a: 23}, {}]]}, toml: `a = [ [ { a = 23 }, { } ] ]\n`},
  'keys with quotes': {obj: {'a"b': 123}, toml: `"a\\"b" = 123\n`}
}
const good = {
  'toJSON overrides': {obj: {a: {toJSON: () => 'EXAMPLE'}}, toml: `a = "EXAMPLE"\n`},
  'toJSON on the top level object': {obj: {toJSON: () => ({c: 23})}, toml: `c = 23\n`},
  'toJSON on top level returns null, get null': {obj: {toJSON: () => null}, toml: null},
  'null is removed': {obj: {a: null, b: 'hi'}, toml: `b = "hi"\n`},
  'undefined is removed': {obj: {a: undefined, b: 'hi'}, toml: `b = "hi"\n`},
  'NaN is removed': {obj: {a: NaN, b: 'hi'}, toml: `b = "hi"\n`},
  'null is removed from arrays': {obj: {a: [null]}, toml: `a = [ ]\n`},
  'undefined is removed from arrays': {obj: {a: [23, undefined]}, toml: `a = [ 23 ]\n`},
  'NaN is removed from arrays': {obj: {a: [NaN, 23]}, toml: `a = [ 23 ]\n`},
  'Invalid Date': {obj: {a: [new Date('nope')]}, toml: `a = [ ]\n`},
}
const bad = {
  'mixed types': {a: [123, 'abc']},
  'stringify null': null,
  'stringify undefined': undefined,
  'stringify number': 23,
  'stringify date': new Date(),
  'stringify bool': true,
  'stringify array': [1, 2, 3],
  'no infinity': {a: Infinity},
  'mixed array of complex': {a: [{b: 5}, [23]]}
}

test('stringify', t => {
  Object.keys(bad).forEach(msg => {
    try {
      const result = TOML.stringify(bad[msg])
      t.comment(result)
      t.fail(msg)
    } catch (ex) {
      t.comment(ex.message)
      t.pass(msg)
    }
  })
  Object.keys(good).forEach(msg => {
    try {
      const result = TOML.stringify(good[msg].obj)
      t.is(result, good[msg].toml, msg)
    } catch (ex) {
      t.comment(ex.message)
      t.fail(msg)
    }
  })
  Object.keys(roundtrip).forEach(msg => {
    try {
      const result = TOML.stringify(roundtrip[msg].obj)
      t.is(result, roundtrip[msg].toml, msg)
      t.isDeeply(TOML.parse(result), roundtrip[msg].obj, msg + ' roundtrip')
    } catch (ex) {
      t.comment(ex.message)
      t.fail(msg)
    }
  })
  t.done()
})
