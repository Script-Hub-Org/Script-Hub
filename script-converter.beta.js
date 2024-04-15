const TITLE = `Script Hub: 脚本转换`
const NAME = `script-converter`

const shouldFixCharset = true
const shouldFixLoonRedirectBody = true

const $ = new Env(NAME)

$.isRequest = () => typeof $request !== 'undefined'
$.isResponse = () => typeof $response !== 'undefined'
$.isEgern = () => 'object' == typeof egern
$.isLanceX = () => 'undefined' != typeof $native

if ($.isEgern() || $.isLanceX()) {
  var $rocket = {}
}

const MAX_BODY_LENGTH = ($.getval('Parser_body_max') ?? 600) * 1024
const HTTP_TIMEOUT = ($.getval('Parser_http_timeout') ?? 20) * 1000

let arg
if (typeof $argument != 'undefined') {
  arg = Object.fromEntries($argument.split('&').map(item => item.split('=')))
}

let result = {}

let jsDelivr
let shouldRedirect
let url

!(async () => {
  if (!$.isRequest()) throw new Error('不是 request')
  let req = $request.url.split(/convert\/_start_\//)[1].split(/\/_end_\//)[0]
  // console.log(req)
  let urlArg = $request.url.split(/\/_end_\//)[1]
  // console.log(urlArg)
  let filename = urlArg.split('?')[0]
  // console.log(filename)
  const queryObject = parseQueryString(urlArg)
  console.log('参数:' + JSON.stringify(queryObject))

  jsDelivr = queryObject.jsDelivr

  const localtext = queryObject.localtext ?? ''
  const type = queryObject.type ?? ''
  const target = queryObject.target ?? ''
  const targetApp = queryObject['target-app'] ?? ''

  const keepHeader = queryObject.keepHeader
  const setHeader = queryObject.header ?? ''
  const setContentType = queryObject.contentType ?? ''
  const evJsori = queryObject.evalScriptori ?? ''
  const evJsmodi = queryObject.evalScriptmodi ?? ''
  const evUrlori = queryObject.evalUrlori ?? ''
  const evUrlmodi = queryObject.evalUrlmodi ?? ''
  const wrap_response = queryObject.wrap_response
  const compatibilityOnly = queryObject.compatibilityOnly

  const subconverter = queryObject.subconverter

  const reqHeaders = { headers: {} }
  if (queryObject.headers) {
    decodeURIComponent(queryObject.headers)
      .split(/\r?\n/)
      .map(i => {
        if (/.+:.+/.test(i)) {
          const [_, key, value] = i.match(/^(.*?):(.*)$/)
          if (key?.length > 0 && value?.length > 0) {
            reqHeaders.headers[key] = value
          }
        }
      })
  }
  // let cachExp = queryObject.cachexp != undefined ? queryObject.cachexp : null
  // let noCache = istrue(queryObject.nocache)

  let setHeaders = {}
  if (setHeader) {
    setHeader.split(/\s*\|\s*/g).forEach(i => {
      if (/.+:.+/.test(i)) {
        const kv = i.split(/\s*\:\s*/)
        if (kv.length === 2) {
          setHeaders[kv[0]] = kv[1]
        }
      }
    })
  }

  if (Object.keys(setHeaders).length > 0) {
    $.log(`指定 headers`, $.toStr(setHeaders))
  } else if (setContentType) {
    $.log('指定 Content-Type', setContentType)
  }

  let prefix = `
// 转换时间: ${new Date().toLocaleString('zh')}
// 兼容性转换
if (typeof $request !== 'undefined') {
  const lowerCaseRequestHeaders = Object.fromEntries(
    Object.entries($request.headers).map(([k, v]) => [k.toLowerCase(), v])
  );

  $request.headers = new Proxy(lowerCaseRequestHeaders, {
    get: function (target, propKey, receiver) {
      return Reflect.get(target, propKey.toLowerCase(), receiver);
    },
    set: function (target, propKey, value, receiver) {
      return Reflect.set(target, propKey.toLowerCase(), value, receiver);
    },
  });
}
if (typeof $response !== 'undefined') {
  const lowerCaseResponseHeaders = Object.fromEntries(
    Object.entries($response.headers).map(([k, v]) => [k.toLowerCase(), v])
  );

  $response.headers = new Proxy(lowerCaseResponseHeaders, {
    get: function (target, propKey, receiver) {
      return Reflect.get(target, propKey.toLowerCase(), receiver);
    },
    set: function (target, propKey, value, receiver) {
      return Reflect.set(target, propKey.toLowerCase(), value, receiver);
    },
  });
}
Object.getOwnPropertyNames($httpClient).forEach(method => {
  if(typeof $httpClient[method] === 'function') {
    $httpClient[method] = new Proxy($httpClient[method], {
      apply: (target, ctx, args) => {
        for (let field in args?.[0]?.headers) {
          if (['host'].includes(field.toLowerCase())) {
            delete args[0].headers[field];
          } else if (['number'].includes(typeof args[0].headers[field])) {
            args[0].headers[field] = args[0].headers[field].toString();
          }
        }
        return Reflect.apply(target, ctx, args);
      }
    });
  }
})
`
  const qxMock = `
// QX 相关
var setInterval = () => {}
var clearInterval = () => {}
var $task = {
  fetch: url => {
    return new Promise((resolve, reject) => {
      if (url.method == 'POST') {
        $httpClient.post(url, (error, response, data) => {
          if (response) {
            response.body = data
            resolve(response, {
              error: error,
            })
          } else {
            resolve(null, {
              error: error,
            })
          }
        })
      } else {
        $httpClient.get(url, (error, response, data) => {
          if (response) {
            response.body = data
            resolve(response, {
              error: error,
            })
          } else {
            resolve(null, {
              error: error,
            })
          }
        })
      }
    })
  },
}

var $prefs = {
  removeValueForKey: key => {
    let result
    try {
      result = $persistentStore.write('', key)
    } catch (e) {
    }
    if ($persistentStore.read(key) == null) return result
    try {
      result = $persistentStore.write(null, key)
    } catch (e) {
    }
    if ($persistentStore.read(key) == null) return result
    const err = '无法模拟 removeValueForKey 删除 key: ' + key
    console.log(err)
    $notification.post('Script Hub: 脚本转换', '❌ ${filename ?? ''}', err)
    return result
  },
  valueForKey: key => {
    return $persistentStore.read(key)
  },
  setValueForKey: (val, key) => {
    return $persistentStore.write(val, key)
  },
}

var $notify = (title = '', subt = '', desc = '', opts) => {
  const toEnvOpts = (rawopts) => {
    if (!rawopts) return rawopts 
    if (typeof rawopts === 'string') {
      if ('undefined' !== typeof $loon) return rawopts
      else if('undefined' !== typeof $rocket) return rawopts
      else return { url: rawopts }
    } else if (typeof rawopts === 'object') {
      if ('undefined' !== typeof $loon) {
        let openUrl = rawopts.openUrl || rawopts.url || rawopts['open-url']
        let mediaUrl = rawopts.mediaUrl || rawopts['media-url']
        return { openUrl, mediaUrl }
      } else {
        let openUrl = rawopts.url || rawopts.openUrl || rawopts['open-url']
        if('undefined' !== typeof $rocket) return openUrl
        return { url: openUrl }
      }
    } else {
      return undefined
    }
  }
  console.log(title, subt, desc, toEnvOpts(opts))
  $notification.post(title, subt, desc, toEnvOpts(opts))
}
var _scriptSonverterOriginalDone = $done
var _scriptSonverterDone = (val = {}) => {
  let result
  if (
    (typeof $request !== 'undefined' &&
    typeof val === 'object' &&
    typeof val.status !== 'undefined' &&
    typeof val.headers !== 'undefined' &&
    typeof val.body !== 'undefined') || ${wrap_response || $.lodash_get(arg, 'wrap_response') || false}
  ) {
    try {
      for (const part of val?.status?.split(' ')) {
        const statusCode = parseInt(part, 10)
        if (!isNaN(statusCode)) {
          val.status = statusCode
          break
        }
      }
    } catch (e) {}
    if (!val.status) {
      val.status = 200
    }
    if (!val.headers) {
      val.headers = {
        'Content-Type': 'text/plain; charset=UTF-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST,GET,OPTIONS,PUT,DELETE',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
      }
    }
    result = { response: val }
  } else {
    result = val
  }
  console.log('$done')
  try {
    console.log(JSON.stringify(result))
  } catch (e) {
    console.log(result)
  }
  _scriptSonverterOriginalDone(result)
}
var window = globalThis
window.$done = _scriptSonverterDone
var global = globalThis
global.$done = _scriptSonverterDone
`

  let body
  let status
  let headers
  let contentType
  let shouldCache

  if (subconverter) {
    body = $.lodash_get(
      await http(subconverter, {
        ...reqHeaders,
        params: {
          insert: false,
          append_type: false,
          strict: false,
          sort: true,
          emoji: false,
          list: true,
          udp: true,
          tfo: false,
          expand: true,
          scv: true,
          fdn: true,
          'surge.doh': true,
          'clash.doh': true,
          new_name: true,
          url: localtext || req,
          ...queryObject,
          type: undefined,
          evalScriptori: undefined,
          evalScriptmodi: undefined,
          evalUrlori: undefined,
          evalUrlmodi: undefined,
        },
      }),
      'body'
    )
  } else {
    if (!compatibilityOnly && type === 'qx-script') {
      prefix = `${prefix}\n${qxMock}`
    }
    url = req || $request.url.replace(/_script-converter-(stash|surge|loon|shadowrocket)\.js$/i, '')
    let res
    if (localtext) {
      res = {
        body: localtext,
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=UTF-8',
        },
      }
    } else {
      if (type === 'mock') {
        if (keepHeader) {
          res = await http(url, { ...reqHeaders, 'binary-mode': true }, type)
        } else {
          shouldRedirect = true
          res = redirect(url)
        }
      } else {
        res = await http(url, { ...reqHeaders })
      }
    }

    body = $.lodash_get(res, 'body')
    status = $.lodash_get(res, 'status')
    headers = $.lodash_get(res, 'headers')
    contentType = $.lodash_get(res, 'contentType')
    shouldCache = $.lodash_get(res, 'shouldCache')
  }

  if (evJsori) {
    eval(evJsori)
  }
  if (evUrlori) {
    eval($.lodash_get(await http(evUrlori, { ...reqHeaders }), 'body'))
  }
  if (type === 'qx-script' || compatibilityOnly) {
    body = `${prefix}\n${compatibilityOnly ? body : body.replace(/\$done\(/g, '_scriptSonverterDone(')}`
  }

  status = status ?? 200

  if (!shouldRedirect && Object.keys(setHeaders).length > 0) {
    headers = setHeaders
  } else {
    headers = {
      ...headers,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST,GET,OPTIONS,PUT,DELETE',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
    }
    if (target === 'plain-text' || filename.endsWith('.txt')) {
      if (headers['Content-Type']) {
        headers['Content-Type'] = 'text/plain; charset=utf-8'
      } else {
        headers['content-type'] = 'text/plain; charset=utf-8'
      }
    }
    if (setContentType) {
      if (headers['Content-Type']) {
        headers['Content-Type'] = setContentType
      } else {
        headers['content-type'] = setContentType
      }
    }
  }

  if (headers['Content-Type']) {
    headers['Content-Type'] = utf8ContentType(headers['Content-Type'])
  } else if (headers['content-type']) {
    headers['content-type'] = utf8ContentType(headers['content-type'])
  }
  if (
    shouldFixLoonRedirectBody &&
    /^3\d{2}$/.test(status) &&
    targetApp.startsWith('loon') &&
    (body == null || body == '' || body.length === 0)
  ) {
    body = 'loon'
  }

  if (type === 'mock') {
    const scriptBody =
      typeof body === 'string'
        ? `
// 转换时间: ${new Date().toLocaleString('zh')}
let done = $done

let result = {
  response: {
      status: ${status},
      body: ${JSON.stringify(body)},
      headers: ${JSON.stringify(headers)},
    },
}
done(result)`
        : `
// 转换时间: ${new Date().toLocaleString('zh')}
function strToArray(str) {
  var ret = new Uint8Array(str.length)
  for (var i = 0; i < str.length; i++) {
    ret[i] = str.charCodeAt(i)
  }
  return ret
}

let done = $done
let result = {
  response: {
      status: ${status},
      headers: ${JSON.stringify(headers)},
      body: strToArray(${JSON.stringify(binArrayToStr(body))}),
    },
}
done(result)
      `
    headers = {
      'Content-Type': 'text/plain; charset=UTF-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST,GET,OPTIONS,PUT,DELETE',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
    }
    body = scriptBody
    status = 200
  }

  try {
    delete headers['content-length']
    delete headers['Content-Length']
    delete headers['content-encoding']
    delete headers['Content-Encoding']
    delete headers['content-security-policy']
    delete headers['Content-Security-Policy']
  } catch (e) {}

  if (evJsmodi) {
    eval(evJsmodi)
  }
  if (evUrlmodi) {
    eval($.lodash_get(await http(evUrlmodi, { ...reqHeaders }), 'body'))
  }

  let response = {
    status,
    headers,
    body,
  }

  result = {
    response,
  }
  // $.log(result)
  // $.log($.toStr(headers))
})()
  .catch(async e => {
    $.logErr(e)
    const msg = `${$.lodash_get(e, 'message') || $.lodash_get(e, 'error') || e}`
    if ($.isShadowrocket() && msg.includes(`未能完成操作`)) {
      $.log(TITLE, `⚠️`, msg, url)
    } else {
      await notify(TITLE, `❌`, msg, url)
    }
    result = {
      response: {
        status: 500,
        body: msg,
        headers: {
          'Content-Type': 'text/plain; charset=UTF-8',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST,GET,OPTIONS,PUT,DELETE',
          'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
        },
      },
    }
  })
  .finally(async () => {
    $.done(result)
  })
function strToArray(str) {
  var ret = new Uint8Array(str.length)
  for (var i = 0; i < str.length; i++) {
    ret[i] = str.charCodeAt(i)
  }
  return ret
}

function binArrayToStr(binArray) {
  var str = ''
  for (var i = 0; i < binArray.length; i++) {
    str += String.fromCharCode(parseInt(binArray[i]))
  }
  return str
}
// 加 UTF-8
function utf8ContentType(type) {
  if (shouldFixCharset && /^(text|application)\/.+/i.test(type) && !/;\s*?charset\s*?=\s*?/i.test(type)) {
    let newType = `${type}; charset=UTF-8`
    $.log('增加 UTF-8', newType)
    return newType
  }
  return type
}
// 参数 与其他脚本逻辑一致
function parseQueryString(url) {
  const queryString = url.split('?')[1] // 获取查询字符串部分
  const regex = /([^=&]+)=([^&]*)/g // 匹配键值对的正则表达式
  const params = {}
  let match

  while ((match = regex.exec(queryString))) {
    const key = decodeURIComponent(match[1]) // 解码键
    const value = decodeURIComponent(match[2]) // 解码值
    params[key] = value // 将键值对添加到对象中
  }

  return params
}
// 是否为真 与其他脚本逻辑一致
function istrue(str) {
  if (str == true || str == 1 || str == 'true' || str == '1') {
    return true
  } else {
    return false
  }
}
function redirect(url) {
  return {
    body: '',
    contentType: '',
    status: 302,
    headers: {
      Location: jsDelivr ? migratingFromGitHubToJsDelivr(url) : url,
    },
    shouldCache: true,
  }
}
// 请求
async function http(url, opts = {}, type) {
  const start = Date.now()
  let timeout = HTTP_TIMEOUT + 1 * 1000
  timeout = $.isSurge() ? timeout / 1000 : timeout
  let reqOpts = {
    url,
    // headers: {
    //   'Cache-Control': 'no-cache',
    //   Pragma: 'no-cache',
    // },
    ...opts,
  }
  $.log(`🔗 链接`, reqOpts.url)
  let isBinary = $.lodash_get(opts, 'binary-mode')
  if (isBinary) {
    $.log(`二进制模式`)
  }
  let res
  let body
  let bodyLength
  // if (type === 'mock') {
  //   $.lodash_set(opts, 'binary-mode', true)
  // }
  try {
    res = await Promise.race([
      $.http.get(reqOpts),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), HTTP_TIMEOUT)),
    ])
    // $.log('ℹ️ res', res)
    // $.log('ℹ️ res', $.toStr(res))
    // $.log('ℹ️ res', $.toStr(res))
    const status = $.lodash_get(res, 'status') || $.lodash_get(res, 'statusCode') || 200
    $.log('ℹ️ res status', status)

    const headers = $.lodash_get(res, 'headers')
    // $.log('ℹ️ res headers', $.toStr(headers))
    const contentType = $.lodash_get(headers, 'content-type') || $.lodash_get(headers, 'Content-Type')

    if (isBinary) {
      body = $.lodash_get(res, 'rawBody') || $.lodash_get(res, 'body')
    } else {
      body = $.lodash_get(res, 'body') || $.lodash_get(res, 'rawBody')
    }

    // $.log('ℹ️ res body', body)
    // $.log(body)
    // $.log($.toStr(body))
    // console.log(body)
    try {
      $.log(`ℹ️ req body type`, typeof body)
      // $.log(`ℹ️ req body constructor`, body.constructor)
    } catch (e) {}
    $.log(`⏱ 请求耗时：${Math.round(((Date.now() - start) / 1000) * 100) / 100} 秒\n  └ ${reqOpts.url}`)
    bodyLength = body?.length
    $.log('ℹ️ res body length', bodyLength)
    if (type === 'mock' && bodyLength > MAX_BODY_LENGTH) {
      throw new Error('too large')
    }
    return { body, contentType, status, headers, shouldCache: typeof body === 'string' }
  } catch (e) {
    $.logErr(e)
    let msg = String($.lodash_get(e, 'message') || e)
    let info
    if (msg.includes('timeout')) {
      info = `请求超时(${round(HTTP_TIMEOUT / 1000)} 秒)`
    } else if (msg.includes('too large')) {
      info = `响应体过大(${round(bodyLength / 1024)} KB)`
    } else {
      throw new Error(e)
    }
    if (type === 'mock') {
      notify(TITLE, `⚠️ ${info} 将启用 302 跳转`, `无法使用自定义 content-type/header\n${reqOpts.url}`, reqOpts.url)
      shouldRedirect = true
      return redirect(reqOpts.url)
    } else {
      throw new Error(info)
    }
  }
}
// 通知
async function notify(title, subt, desc, opts) {
  $.msg(title, subt, desc, opts)
}

function createRound(methodName) {
  const func = Math[methodName]
  return (number, precision) => {
    precision = precision == null ? 0 : precision >= 0 ? Math.min(precision, 292) : Math.max(precision, -292)
    if (precision) {
      // Shift with exponential notation to avoid floating-point issues.
      // See [MDN](https://mdn.io/round#Examples) for more details.
      let pair = `${number}e`.split('e')
      const value = func(`${pair[0]}e${+pair[1] + precision}`)

      pair = `${value}e`.split('e')
      return +`${pair[0]}e${+pair[1] - precision}`
    }
    return func(number)
  }
}
function round(...args) {
  return createRound('round')(...args)
}

function migratingFromGitHubToJsDelivr(url) {
  // 如果是jsdelivr的原始链接,直接返回
  if (url.startsWith('https://cdn.jsdelivr.net/')) {
    return url
  }

  // 提取Github仓库信息
  const match = url.match(/https:\/\/(raw.githubusercontent.com|github.com)\/([^/]+)\/([^/]+)\/?(.*)/)

  if (!match) {
    // 非Github链接,不做转换
    return url
  }

  const [, , user, repo, path] = match

  // 构建jsdelivr链接
  return `https://cdn.jsdelivr.net/gh/${user}/${repo}@${path ? path : 'main'}`
}

// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise(((e,r)=>{s.call(this,t,((t,s,a)=>{t?r(t):e(s)}))}))}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",Object.assign(this,e)}getEnv(){return"undefined"!=typeof $environment&&$environment["surge-version"]?"Surge":"undefined"!=typeof $environment&&$environment["stash-version"]?"Stash":"undefined"!=typeof module&&module.exports?"Node.js":"undefined"!=typeof $task?"Quantumult X":"undefined"!=typeof $loon?"Loon":"undefined"!=typeof $rocket?"Shadowrocket":void 0}isNode(){return"Node.js"===this.getEnv()}isQuanX(){return"Quantumult X"===this.getEnv()}isSurge(){return"Surge"===this.getEnv()}isLoon(){return"Loon"===this.getEnv()}isShadowrocket(){return"Shadowrocket"===this.getEnv()}isStash(){return"Stash"===this.getEnv()}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const r=this.getdata(t);if(r)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise((e=>{this.get({url:t},((t,s,r)=>e(r)))}))}runScript(t,e){return new Promise((s=>{let r=this.getdata("@chavy_boxjs_userCfgs.httpapi");r=r?r.replace(/\n/g,"").trim():r;let a=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");a=a?1*a:20,a=e&&e.timeout?e.timeout:a;const[o,i]=r.split("@"),n={url:`http://${i}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:a},headers:{"X-Key":o,Accept:"*/*"},timeout:a};this.post(n,((t,e,r)=>s(r)))})).catch((t=>this.logErr(t)))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),r=!s&&this.fs.existsSync(e);if(!s&&!r)return{};{const r=s?t:e;try{return JSON.parse(this.fs.readFileSync(r))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),r=!s&&this.fs.existsSync(e),a=JSON.stringify(this.data);s?this.fs.writeFileSync(t,a):r?this.fs.writeFileSync(e,a):this.fs.writeFileSync(t,a)}}lodash_get(t,e,s){const r=e.replace(/\[(\d+)\]/g,".$1").split(".");let a=t;for(const t of r)if(a=Object(a)[t],void 0===a)return s;return a}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce(((t,s,r)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[r+1])>>0==+e[r+1]?[]:{}),t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,r]=/^@(.*?)\.(.*?)$/.exec(t),a=s?this.getval(s):"";if(a)try{const t=JSON.parse(a);e=t?this.lodash_get(t,r,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,r,a]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(r),i=r?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(i);this.lodash_set(e,a,t),s=this.setval(JSON.stringify(e),r)}catch(e){const o={};this.lodash_set(o,a,t),s=this.setval(JSON.stringify(o),r)}}else s=this.setval(t,e);return s}getval(t){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.read(t);case"Quantumult X":return $prefs.valueForKey(t);case"Node.js":return this.data=this.loaddata(),this.data[t];default:return this.data&&this.data[t]||null}}setval(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.write(t,e);case"Quantumult X":return $prefs.setValueForKey(t,e);case"Node.js":return this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0;default:return this.data&&this.data[e]||null}}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){switch(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"],delete t.headers["content-type"],delete t.headers["content-length"]),t.params&&(t.url+="?"+this.queryStr(t.params)),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,((t,s,r)=>{!t&&s&&(s.body=r,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,r)}));break;case"Quantumult X":this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then((t=>{const{statusCode:s,statusCode:r,headers:a,body:o,bodyBytes:i}=t;e(null,{status:s,statusCode:r,headers:a,body:o,bodyBytes:i},o,i)}),(t=>e(t&&t.error||"UndefinedError")));break;case"Node.js":let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",((t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}})).then((t=>{const{statusCode:r,statusCode:a,headers:o,rawBody:i}=t,n=s.decode(i,this.encoding);e(null,{status:r,statusCode:a,headers:o,rawBody:i,body:n},n)}),(t=>{const{message:r,response:a}=t;e(r,a,a&&s.decode(a.rawBody,this.encoding))}))}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";switch(t.body&&t.headers&&!t.headers["Content-Type"]&&!t.headers["content-type"]&&(t.headers["content-type"]="application/x-www-form-urlencoded"),t.headers&&(delete t.headers["Content-Length"],delete t.headers["content-length"]),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,((t,s,r)=>{!t&&s&&(s.body=r,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,r)}));break;case"Quantumult X":;t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then((t=>{const{statusCode:s,statusCode:r,headers:a,body:o,bodyBytes:i}=t;e(null,{status:s,statusCode:r,headers:a,body:o,bodyBytes:i},o,i)}),(t=>e(t&&t.error||"UndefinedError")));break;case"Node.js":let r=require("iconv-lite");this.initGotEnv(t);const{url:a,...o}=t;this.got[s](a,o).then((t=>{const{statusCode:s,statusCode:a,headers:o,rawBody:i}=t,n=r.decode(i,this.encoding);e(null,{status:s,statusCode:a,headers:o,rawBody:i,body:n},n)}),(t=>{const{message:s,response:a}=t;e(s,a,a&&r.decode(a.rawBody,this.encoding))}))}}time(t,e=null){const s=e?new Date(e):new Date;let r={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in r)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?r[e]:("00"+r[e]).substr((""+r[e]).length)));return t}queryStr(t){let e="";for(const s in t){let r=t[s];null!=r&&""!==r&&("object"==typeof r&&(r=JSON.stringify(r)),e+=`${s}=${r}&`)}return e=e.substring(0,e.length-1),e}msg(e=t,s="",r="",a){const o=t=>{switch(typeof t){case void 0:return t;case"string":switch(this.getEnv()){case"Surge":case"Stash":default:return{url:t};case"Loon":case"Shadowrocket":return t;case"Quantumult X":return{"open-url":t};case"Node.js":return}case"object":switch(this.getEnv()){case"Surge":case"Stash":case"Shadowrocket":default:{let e=t.url||t.openUrl||t["open-url"];return{url:e}}case"Loon":{let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}case"Quantumult X":{let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl,r=t["update-pasteboard"]||t.updatePasteboard;return{"open-url":e,"media-url":s,"update-pasteboard":r}}case"Node.js":return}default:return}};if(!this.isMute)switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:$notification.post(e,s,r,o(a));break;case"Quantumult X":$notify(e,s,r,o(a));break;case"Node.js":}if(!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),r&&t.push(r),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:this.log("",`❗️${this.name}, 错误!`,t);break;case"Node.js":this.log("",`❗️${this.name}, 错误!`,t.stack)}}wait(t){return new Promise((e=>setTimeout(e,t)))}done(t={}){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:$done(t);break;case"Node.js":process.exit(1)}}}(t,e)}
