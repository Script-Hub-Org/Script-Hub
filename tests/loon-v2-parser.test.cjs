const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const test = require('node:test')

const parser = fs.readFileSync(path.join(__dirname, '..', 'Rewrite-Parser.beta.js'), 'utf8')

async function convert(source, target, httpBodies = {}) {
  let doneValue
  const notifications = []
  const encoded = encodeURIComponent(source)
  const requestUrl = `https://script.hub/file/_start_/http://local.text/_end_/?type=loon-plugin&target=${target}&localtext=${encoded}`

  const context = {
    console,
    Date,
    Error,
    JSON,
    Math,
    RegExp,
    String,
    Number,
    Object,
    Array,
    Map,
    Set,
    URL,
    URLSearchParams,
    Promise,
    Uint8Array,
    TextEncoder,
    TextDecoder,
    encodeURIComponent,
    decodeURIComponent,
    parseInt,
    parseFloat,
    isFinite,
    setTimeout,
    clearTimeout,
    $request: { url: requestUrl, method: 'GET', headers: {} },
    $response: { body: '' },
    $done: value => {
      doneValue = value
    },
    $argument: '',
    $environment: { 'surge-version': 'test' },
    $persistentStore: {
      read: () => null,
      write: () => true,
    },
    $notification: {
      post: (...args) => notifications.push(args),
    },
    $httpClient: {
      get: (options, callback) => {
        const body = Object.prototype.hasOwnProperty.call(httpBodies, options?.url) ? httpBodies[options.url] : ''
        callback(null, { status: 200, statusCode: 200, headers: {} }, body)
      },
      post: (options, callback) => callback(null, { status: 200, statusCode: 200, headers: {} }, ''),
    },
  }
  context.globalThis = context

  vm.runInNewContext(parser, context, { filename: 'Rewrite-Parser.beta.js' })
  for (let i = 0; i < 100 && !doneValue; i++) await new Promise(resolve => setTimeout(resolve, 5))
  assert.ok(doneValue, `${target} conversion did not finish`)
  const body = doneValue?.response?.body ?? doneValue?.body ?? ''
  return { body, notifications }
}

function sectionLines(body, sectionName) {
  const headers = ['[Rule]', '[Rewrite]', '[Script]', '[Body Rewrite]', '[Header Rewrite]', '[Map Local]', '[MITM]']
  const header = `[${sectionName}]`
  const start = body.indexOf(header)
  assert.ok(start >= 0, `${header} is missing`)
  const next = headers
    .map(candidate => body.indexOf(candidate, start + header.length))
    .filter(index => index >= 0)
    .sort((a, b) => a - b)[0] ?? body.length
  return body
    .slice(start + header.length, next)
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'))
}

test('Loon v2 response maps to Surge without guessing body buffering', async () => {
  const { body } = await convert(
    'response if ${url} ~= /\\/api\\/v1\\/data/i then script("https://example.com/a.js") with requires_body=true, binary_body_mode=true, timeout=12',
    'surge-module'
  )
  assert.match(body, /type=http-response/)
  assert.match(body, /requires-body=true/)
  assert.match(body, /binary-body-mode=true/)
  assert.match(body, /timeout=12/)
  assert.doesNotMatch(body, /engine=webview/)
})

test('Loon v2 response maps to Shadowrocket without Surge-only engine', async () => {
  const { body } = await convert(
    'response if ${url} ~= /\\/api\\/v1\\/data/i then script("https://example.com/a.js") with requires_body=true, binary_body_mode=true',
    'shadowrocket-module'
  )
  assert.match(body, /type=http-response/)
  assert.match(body, /requires-body=true/)
  assert.match(body, /binary-body-mode=true/)
  assert.doesNotMatch(body, /engine=/)
})

test('Loon v2 response maps to a Loon plugin', async () => {
  const { body } = await convert(
    'response if ${url} == "https://example.com/data" then script("https://example.com/a.js", {${region}, ${level}}) with tag="wallet", requires_body=true, binary_body_mode=true, img_url="https://example.com/icon.png"',
    'loon-plugin'
  )
  assert.match(body, /\[Script\]/)
  assert.match(body, /response if \$\{url\} == "https:\/\/example\.com\/data"/)
  assert.match(body, /script\("https:\/\/example\.com\/a\.js", \{\$\{region\}, \$\{level\}\}\)/)
  assert.match(body, /requires_body=true/)
  assert.match(body, /binary_body_mode=true/)
  assert.match(body, /tag="wallet"/)
  assert.match(body, /img_url="https:\/\/example\.com\/icon\.png"/)
})

test('Loon keeps v2 compound conditions when Loon is the target', async () => {
  const { body, notifications } = await convert(
    'response if ${url} ~= /\\/api\\/v1/i && ${response.status} == 200 && ${response.header[\'Content-Type\']} ~= /application\\/json/i then script("https://example.com/a.js") with requires_body=true, binary_body_mode=true',
    'loon-plugin'
  )
  assert.ok(body.includes("response if ${url} ~= /\\/api\\/v1/i && ${response.status} == 200"))
  assert.ok(body.includes("${response.header['Content-Type']} ~= /application\\/json/i"))
  assert.match(body, /requires_body=true, binary_body_mode=true/)
  assert.doesNotMatch(JSON.stringify(notifications), /无法等价转换|不支持以下内容/)
})

test('Loon v2 response maps to Stash and Generic maps to a tile', async () => {
  const { body } = await convert(
    [
      'response if ${url} ~= /\\/api\\/v1\\/data/i then script("https://example.com/a.js") with requires_body=true, binary_body_mode=true, timeout=9',
      'generic then script("https://example.com/tile.js", "hello") with tag="Tile", timeout=15, img_url="https://example.com/icon.png"',
    ].join('\n'),
    'stash-stoverride'
  )
  assert.ok(body.includes('- match: (?i)\\/api\\/v1\\/data'))
  assert.match(body, /require-body: true/)
  assert.match(body, /binary-mode: true/)
  assert.match(body, /- name: "Tile_\d+"/)
  assert.match(body, /icon: "https:\/\/example\.com\/icon\.png"/)
  assert.match(body, /providers:/)
})

test('Loon v2 cron preserves dynamic cron and timeout parameters', async () => {
  const { body } = await convert(
    'cron ${cron_expr} then script("https://example.com/cron.js") with timeout=${timeout_seconds}, enable=${cron_enabled}',
    'surge-module'
  )
  assert.match(body, /type=cron/)
  assert.match(body, /cronexp="\{\{\{cron_expr\}\}\}"/)
  assert.match(body, /timeout=\{\{\{timeout_seconds\}\}\}/)
  assert.match(body, /\{\{\{cron_enabled\}\}\}/)
})

test('Loon argument options are preserved in Surge arguments-desc', async () => {
  const { body } = await convert(
    [
      'blockUpload=switch, false, true, tag=隐藏上传按钮, desc=用于隐藏YouTube底栏的上传按钮',
      'captionLang=select, zh-Hans, zh-Hant, tag=字幕语言, desc=字幕语言',
    ].join('\n'),
    'surge-module'
  )
  assert.match(body, /#!arguments=blockUpload:false,captionLang:zh-Hans/)
  assert.match(body, /blockUpload: 隐藏上传按钮\\n用于隐藏YouTube底栏的上传按钮\\n可选值: false, true/)
  assert.match(body, /captionLang: 字幕语言\\n字幕语言\\n可选值: zh-Hans, zh-Hant/)
})

test('Loon v2 network-changed maps to a Surge event script', async () => {
  const { body } = await convert(
    'network-changed then script("https://example.com/network.js") with tag="Network"',
    'surge-module'
  )
  assert.match(body, /type=event/)
  assert.match(body, /event-name=network-changed/)
  assert.match(body, /script-path=https:\/\/example\.com\/network\.js/)
})

test('Stash reports Loon v2 network-changed instead of silently dropping it', async () => {
  const { body, notifications } = await convert(
    'network-changed then script("https://example.com/network.js")',
    'stash-stoverride'
  )
  assert.doesNotMatch(body, /- match:/)
  assert.match(JSON.stringify(notifications), /network-changed.*Stash.*诊断项/)
})

test('Loon keeps native v2 and legacy Script order when mixed', async () => {
  const { body } = await convert(
    [
      'response if ${url} ~= /\\/v2-first/ then script("https://example.com/v2-first.js")',
      'http-response /\\/legacy/ script-path=https://example.com/legacy.js',
      'response if ${url} ~= /\\/v2-last/ then script("https://example.com/v2-last.js")',
    ].join('\n'),
    'loon-plugin'
  )
  const first = body.indexOf('https://example.com/v2-first.js')
  const legacy = body.indexOf('https://example.com/legacy.js')
  const last = body.indexOf('https://example.com/v2-last.js')
  assert.ok(first >= 0 && legacy >= 0 && last >= 0)
  assert.ok(first < legacy && legacy < last)
})

test('legacy binary-body-mode keeps Surge compatibility fallback', async () => {
  const { body } = await convert(
    'http-response /\\/wasm\\/ script-path=https://example.com/wasm.js, binary-body-mode=true',
    'surge-module'
  )
  assert.match(body, /requires-body=true/)
  assert.match(body, /engine=webview/)
})

test('Stash comments an unsupported dynamic disable instead of silently enabling it', async () => {
  const { body } = await convert(
    'response if ${url} ~= /\\/api/ then script("https://example.com/a.js") with enable=${enabled}',
    'stash-stoverride'
  )
  assert.match(body, /#    - match:/)
  assert.doesNotMatch(body, /providers:\n(?:(?!#).)*"a_/s)
})

test('unsupported Loon v2 compound conditions are reported', async () => {
  const { body, notifications } = await convert(
    'response if ${url} ~= /\\/api/ && ${response.status} == 200 then script("https://example.com/a.js")',
    'surge-module'
  )
  assert.doesNotMatch(body, /type=http-response/)
  const notificationText = JSON.stringify(notifications)
  assert.match(notificationText, /Loon v2/)
  assert.match(notificationText, /无法等价转换|只转换单一/)
})

test('Loon v2 native reject and JSON actions map completely to Surge', async () => {
  const jqUrl = 'https://example.com/filter.jq'
  const { body, notifications } = await convert(
    [
      'request if ${url} ~= /^https:\\/\\/example\\.com\\/dict/i then reject_dict(200)',
      'request if ${url} ~= /^https:\\/\\/example\\.com\\/missing/i then reject(404)',
      'response if ${url} ~= /^https:\\/\\/example\\.com\\/update/i then response.json.replace(["data.a", "data.b"], [0, 0])',
      'response if ${url} ~= /^https:\\/\\/example\\.com\\/update/i then response.json.delete(["data.ad", "data.banner"])',
      'response if ${url} ~= /^https:\\/\\/example\\.com\\/update/i then response.json.jq(".data.rows |= map(select(.model_type != \\"ads\\"))")',
      `response if \${url} ~= /^https:\\/\\/example\\.com\\/home/i then response.json.jq_file("${jqUrl}")`,
    ].join('\n'),
    'surge-module',
    { [jqUrl]: '.data.items |= map(select(.ad | not))' }
  )

  assert.match(body, /\[Map Local\]/)
  assert.ok(body.includes('data-type=text data="{}" status-code=200 header="Content-Type:application/json"'))
  assert.ok(body.includes('data-type=text data="" status-code=404'))
  assert.match(body, /\[Body Rewrite\]/)
  assert.ok(body.includes('getpath(["data"]) // {}') && body.includes('has("a")'))
  assert.ok(body.includes('delpaths([["data","ad"]])'))
  assert.ok(body.includes('model_type != "ads"'))
  assert.ok(body.includes('.data.items |= map(select(.ad | not))'))
  assert.doesNotMatch(JSON.stringify(notifications), /不支持以下内容|Loon v2.*失败/)
})

test('Loon v2 native Rewrite is preserved in the Loon target section', async () => {
  const { body } = await convert(
    'response if ${url} ~= /^https:\\/\\/example\\.com\\/data/i then response.json.delete("data.ad")',
    'loon-plugin'
  )
  assert.match(body, /\[Rewrite\]/)
  assert.ok(body.includes('response if ${url} ~=') && body.includes('response.json.delete("data.ad")'))
  assert.doesNotMatch(body, /\[Script\][\s\S]*response if \$\{url\}/)
})

test('Loon v2 keeps jq fallback operators inside quoted actions', async () => {
  const source = 'response if ${url} ~= /^https:\\/\\/acs\\.m\\.goofish\\.com\\/gw\\/adapter\\//i then response.json.jq(".data.items |= map(select((.template.name? // \\"\\") | test(\\"^my_fy[0-9]+_header$\\")))")'
  const { body, notifications } = await convert(source, 'surge-module')
  assert.equal(sectionLines(body, 'Body Rewrite').length, 1)
  assert.ok(body.includes('.template.name? //'))
  assert.doesNotMatch(JSON.stringify(notifications), /不支持以下内容|Action 缺少结束括号/)
})

test('real 什么值得买 Loon plugin converts all native actions for Surge', async () => {
  const source = fs.readFileSync(path.join(__dirname, 'fixtures', 'smzdm_remove_ads.lpx'), 'utf8')
  const jqUrl = 'https://kelee.one/Resource/JQLang/smzdm/home_smzdm_remove_ads.jq'
  const jq = fs.readFileSync(path.join(__dirname, 'fixtures', 'smzdm_home_remove_ads.jq'), 'utf8')
  const { body, notifications } = await convert(source, 'surge-module', { [jqUrl]: jq })
  assert.equal(sectionLines(body, 'Rule').length, 1)
  assert.equal(sectionLines(body, 'Body Rewrite').length, 28)
  assert.equal(sectionLines(body, 'Map Local').length, 7)
  assert.equal(sectionLines(body, 'MITM').length, 1)
  assert.match(body, /zz_content/)
  assert.match(body, /Content-Type:application\/json/)
  assert.doesNotMatch(JSON.stringify(notifications), /无法等价转换|不支持以下内容|失败/)
})

test('Beta host modules route the Shadowrocket target into the converter', () => {
  const moduleFiles = [
    '../modules/script-hub.beta.surge.sgmodule',
    '../modules/script-hub.beta.egern.yaml',
    '../modules/script-hub.beta.loon.plugin',
    '../modules/script-hub.beta.rocket.module',
    '../modules/script-hub.beta.stash.stoverride',
    '../modules/script-hub.beta.qx.conf',
  ]
  for (const relative of moduleFiles) {
    const moduleText = fs.readFileSync(path.join(__dirname, relative), 'utf8')
    assert.match(moduleText, /shadowrocket-module/, relative)
    assert.match(moduleText, /Rewrite-Parser\.beta\.js/, relative)
  }
})

test('the default fork Surge module uses the repaired parser', () => {
  const moduleText = fs.readFileSync(path.join(__dirname, '../modules/script-hub.surge.sgmodule'), 'utf8')
  assert.match(moduleText, /ranzhigg\/Script-Hub\/feat\/loon-v2-cross-platform\/Rewrite-Parser\.beta\.js/)
  assert.match(moduleText, /shadowrocket-module/)
})
