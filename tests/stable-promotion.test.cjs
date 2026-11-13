const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')

const root = path.join(__dirname, '..')
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8')

test('stable runtime files are promoted from the current Beta implementation', () => {
  for (const name of ['script-hub', 'rule-parser', 'script-converter', 'Rewrite-Parser']) {
    assert.equal(read(name + '.js'), read(name + '.beta.js'), name + '.js must match its Beta implementation')
  }
})

test('stable modules target stable runtime files while retaining Beta target coverage', () => {
  const modules = [
    'modules/script-hub.surge.sgmodule',
    'modules/script-hub.egern.yaml',
    'modules/script-hub.loon.plugin',
    'modules/script-hub.rocket.module',
    'modules/script-hub.stash.stoverride',
    'modules/script-hub.qx.conf',
  ]
  for (const relative of modules) {
    const moduleText = read(relative)
    assert.doesNotMatch(moduleText, /\.beta\.js|β/, relative)
    assert.match(moduleText, /shadowrocket-module/, relative)
  }
})

test('Beta modules remain on Beta runtime files', () => {
  const modules = [
    'modules/script-hub.beta.surge.sgmodule',
    'modules/script-hub.beta.egern.yaml',
    'modules/script-hub.beta.loon.plugin',
    'modules/script-hub.beta.rocket.module',
    'modules/script-hub.beta.stash.stoverride',
    'modules/script-hub.beta.qx.conf',
  ]
  for (const relative of modules) {
    const moduleText = read(relative)
    assert.match(moduleText, /\.beta\.js/, relative)
    assert.match(moduleText, /shadowrocket-module/, relative)
  }
})
