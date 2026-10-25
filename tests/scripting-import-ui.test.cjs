const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')

test('Beta Scripting local import uses a configured script name', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'script-hub.beta.js'), 'utf8')

  assert.match(source, /v-model\.trim="scriptingScriptName"/)
  assert.match(source, /localStorage\.getItem\('script-hub-scripting-script-name'\)/)
  assert.match(source, /encodeURIComponent\(scriptName\)/)
  assert.match(source, /scripting:\/\/run\/\s*' \+ encodeURIComponent\(scriptName\)/)
  assert.doesNotMatch(source, /run(?:_single)?\/\s*' \+ encodeURIComponent\('Surge 模块管理'\)/)
})
