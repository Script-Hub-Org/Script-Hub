const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')

test('Beta Scripting local import uses a configured script name', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'script-hub.beta.js'), 'utf8')

  assert.match(source, /v-model\.trim="scriptingScriptName"/)
  assert.match(source, /localStorage\.getItem\('script-hub-scripting-script-name'\)/)
  assert.match(source, /encodeURIComponent\(scriptName\)/)
  assert.match(source, /scripting:\/\/run_single\/\s*' \+ encodeURIComponent\(scriptName\)/)
  assert.match(source, /sh_module_url=/)
  assert.doesNotMatch(source, /\?action=import-surge-module&url=/)
  assert.match(source, /<details v-if="target === 'surge-module'">\s*<summary>Scripting 导入设置<\/summary>/)
  assert.ok(source.indexOf('<summary>Scripting 导入设置</summary>') > source.indexOf('什么时候应该启用脚本转换'))
  assert.doesNotMatch(source, /请先填写下方 Scripting 脚本名/)
  assert.doesNotMatch(source, /run(?:_single)?\/\s*' \+ encodeURIComponent\('Surge 模块管理'\)/)
})
