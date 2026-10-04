/****************************
   支持QX & Surge & Clash 规则集解析
   适用app: Surge Shadowrocket Stash Loon
***************************/
const script_start = Date.now()
const JS_NAME = 'Script Hub: 规则集转换'
const $ = new Env(JS_NAME)

let arg
if (typeof $argument != 'undefined') {
  arg = Object.fromEntries($argument.split('&').map(item => item.split('=')))
} else {
  arg = {}
}
// 超时设置 与 script-converter.js 相同
const HTTP_TIMEOUT = ($.getval('Parser_http_timeout') ?? 20) * 1000

//目标app
const isEgern = 'object' == typeof egern
const isLanceX = 'undefined' != typeof $native
if (isLanceX || isEgern) {
  $environment = { language: 'zh-Hans', system: 'iOS', 'surge-build': '2806', 'surge-version': '5.20.0' }
}

const url = $request.url
let req = url.split(/file\/_start_\//)[1].split(/\/_end_\//)[0]
let reqArr = req.match('%F0%9F%98%82') ? req.split('%F0%9F%98%82') : [req]
//$.log("原始链接：" + req);
let urlArg = url.split(/\/_end_\//)[1]

let resFile = urlArg.split('?')[0]
let resFileName = resFile.substring(0, resFile.lastIndexOf('.'))

//通过请求头中的UA识别app
const appUa = $request.headers['user-agent'] || $request.headers['User-Agent']

//获取参数
const queryObject = parseQueryString(urlArg)
//$.log("参数:" + $.toStr(queryObject));

//目标类型
const isSurgetarget = queryObject.target == 'surge-rule-set'
const isStashtarget = queryObject.target == 'stash-rule-set'
const isLoontarget = queryObject.target == 'loon-rule-set'
const isRockettarget = queryObject.target == 'shadowrocket-rule-set'
const isSurgedomainset = queryObject.target == 'surge-domain-set'
const isSurgedomainset2 = queryObject.target == 'surge-domain-set2'
const isStashdomainset = queryObject.target == 'stash-domain-set'
const isStashdomainset2 = queryObject.target == 'stash-domain-set2'

let localText = queryObject.localtext != undefined ? '\n' + queryObject.localtext : '' //纯文本输入

let noNtf = queryObject.noNtf ? istrue(queryObject.noNtf) : false //默认开启通知

const localsetNtf = ($.lodash_get(arg, 'Notify') || $.getval('ScriptHub通知') || '').trim()
if (/^开启(?:通知)?$/.test(localsetNtf)) noNtf = false
else if (/^关闭(?:通知)?$/.test(localsetNtf)) noNtf = true

let bodyBox = []

if (queryObject.target == 'rule-set') {
  if (appUa.search(/Surge|LanceX|Egern|Stash|Loon|Shadowrocket/i) != -1) {
    isSurgeiOS = appUa.search(/Surge|LanceX|Egern/i) != -1
    isStashiOS = appUa.search(/Stash/i) != -1
    isLooniOS = appUa.search(/Loon/i) != -1
    isShadowrocket = appUa.search(/Shadowrocket/i) != -1
  } else {
    isSurgeiOS = $.isSurge()
    isStashiOS = $.isStash()
    isLooniOS = $.isLoon()
    isShadowrocket = $.isShadowrocket()
  }
} else {
  isSurgeiOS = isSurgetarget
  isStashiOS = isStashtarget
  isLooniOS = isLoontarget
  isShadowrocket = isRockettarget
}

let Rin0 = queryObject.y != undefined ? getArgArr(queryObject.y).filter(item => item.trim()) : null
let Rout0 = queryObject.x != undefined ? getArgArr(queryObject.x).filter(item => item.trim()) : null
let ipNoResolve = istrue(queryObject.nore)
let sni = queryObject.sni != undefined ? getArgArr(queryObject.sni) : null

let evJsori = queryObject.evalScriptori
let evJsmodi = queryObject.evalScriptmodi
let evUrlori = queryObject.evalUrlori
let evUrlmodi = queryObject.evalUrlmodi

//用于自定义发送请求的请求头
const reqHeaders = { headers: { 'User-Agent': 'script-hub/1.0.0' } }

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

let other = [] //不支持的规则
let ruleSet = [] //解析过后的规则
let domainSet = [] //域名集
let outRules = [] //被排除的规则

let noResolve //ip规则是否开启不解析域名
let ruleType //规则类型
let ruleValue //规则

!(async () => {
  if (evUrlori) {
    evUrlori = (await $.http.get(evUrlori)).body
  }
  if (evUrlmodi) {
    evUrlmodi = (await $.http.get(evUrlmodi)).body
  }

  if (req == 'http://local.text') {
    body = localText
  } else {
    for (let i = 0; i < reqArr.length; i++) {
      let res = await http(reqArr[i], reqHeaders)
      let reStatus = res.status
      body = reStatus == 200 ? res.body : reStatus == 404 ? '#!error=404: Not Found' : ''
      reStatus == 404 && noNtf == false && $.msg(JS_NAME, '来源链接已失效', '404: Not Found ---> ' + reqArr[i], '')

      if (body.match(/^(?:\s)*\/\*[\s\S]*?(?:\r|\n)\s*\*+\//)) {
        body = body.match(/^(?:\n|\r)*\/\*([\s\S]*?)(?:\r|\n)\s*\*+\//)[1]
        bodyBox.push(body)
      } else {
        bodyBox.push(body)
      }
    } //for
    body = bodyBox.join('\n\n') + localText
  }

  eval(evJsori)
  eval(evUrlori)

  body = body.match(/[^\r\n]+/g)

  for await (let [y, x] of body.entries()) {
    x = x
      .replace(/^payload:/, '')
      .replace(/^ *(#|;|\/\/)/, '#')
      .replace(/^ *- */, '')
      .replace(/(^[^#].+)\x20+\/\/.+/, '$1')
      .replace(/(\{[0-9]+)\,([0-9]*\})/g, '$1t&zd;$2')
      .replace(/(^[^U].*(\[|=|{|\\|\/.*\.js).*)/i, '')
      .replace(/'|"/g, '')
      .replace(/^(\.|\*|\+)\.?/, 'DOMAIN-SUFFIX,')
      .replace(/^\[.*|^\s*$/, '')

    if (!x.match(/^ *#/) && !x.match(/,/) && x != '') {
      if (x.search(/[0-9]\/[0-9]/) != -1) {
        x = 'IP-CIDR,' + x
      } else if (x.search(/([0-9]|[a-z]):([0-9]|[a-z])/) != -1) {
        x = 'IP-CIDR6,' + x
      } else {
        x = 'DOMAIN,' + x
      }
    }
    //去掉注释
    if (Rin0 != null) {
      for (let i = 0; i < Rin0.length; i++) {
        const elem = Rin0[i]
        if (x.indexOf(elem) != -1) {
          x = x.replace(/^#/, '')
        }
      } //循环结束
    } //去掉注释结束

    //增加注释
    if (Rout0 != null) {
      for (let i = 0; i < Rout0.length; i++) {
        const elem = Rout0[i]
        if (x.indexOf(elem) != -1) {
          x = x.replace(/(.+)/, ';#$1')
        }
      } //循环结束
    } //增加注释结束

    //ip规则不解析域名
    if (ipNoResolve === true) {
      if (x.match(/^ip6?-[ca]/i) != null) {
        x = x + ',no-resolve'
      } else {
      }
    } else {
    } //增加ip规则不解析域名结束

    //sni嗅探
    if (sni != null) {
      for (let i = 0; i < sni.length; i++) {
        const elem = sni[i]
        if (x.indexOf(elem) != -1 && x.search(/^ip6?-[ca]/i) == -1) {
          x = x + ',extended-matching'
        }
      } //循环结束
    } //启用sni嗅探结束

    x = x
      .replace(/^#.+/, '')
      .replace(/^host-wildcard/i, 'HO-ST-WILDCARD')
      .replace(/^host/i, 'DOMAIN')
      .replace(/^dest-port/i, 'DST-PORT')
      .replace(/^ip6-cidr/i, 'IP-CIDR6')

    if (isLooniOS) {
      x = x
        .replace(/(^|[,(]\s*)DST-PORT(?=\s*,)/gi, '$1DEST-PORT')
        .replace(/(^|[,(]\s*)NETWORK(?=\s*,)/gi, '$1PROTOCOL')
    }

    if (isStashiOS || isStashdomainset || isStashdomainset2) {
      if (x.match(/^;#/)) {
        outRules.push(x.replace(/^;#/, '').replace(/^HO-ST/i, 'HOST'))
      } else if (x.match(/^(HO-ST|U|PROTOCOL|OR|AND|NOT)/i)) {
        other.push(x.replace(/^HO-ST/i, 'HOST'))
      } else if (x != '') {
        noResolve = x.replace(/\x20/g, '').match(/,no-resolve/i) ? ',no-resolve' : ''
        if (x.match(/^PROCESS/i)) {
          ruleType = x.split(',')[1].match('/') ? 'PROCESS-PATH' : 'PROCESS-NAME'
        } else {
          ruleType = x.replace(/\x20/g, '').split(',')[0].toUpperCase()
        }

        ruleValue = x.split(/ *, */)[1]

        ruleSet.push(`  - ${ruleType},${ruleValue}${noResolve}`)
      }
    } else if (isLooniOS) {
      if (x.match(/^;#/)) {
        outRules.push(x.replace(/^;#/, '').replace(/^HO-ST/i, 'HOST'))
      } else if (/(^|[,(]\s*)(?:HO-ST|PROCESS-NAME)(?=\s*,)/i.test(x)) {
        other.push(x.replace(/^HO-ST/i, 'HOST'))
      } else if (x != '') {
        if (/^(?:AND|OR|NOT)\s*,/i.test(x)) {
          ruleSet.push(x)
          continue
        }
        noResolve = x.replace(/\x20/g, '').match(/,no-resolve/i) ? ',no-resolve' : ''

        ruleType = x.split(/ *, */)[0].toUpperCase()

        ruleValue = x.split(/ *, */)[1]

        ruleSet.push(`${ruleType},${ruleValue}${noResolve}`)
      }
    } else if (isSurgeiOS || isShadowrocket || isSurgedomainset || isSurgedomainset2) {
      if (x.match(/^;#/)) {
        outRules.push(x.replace(/^;#/, '').replace(/^HO-ST/i, 'HOST'))
      } else if (x.match(/^HO-ST/i)) {
        other.push(x.replace(/^HO-ST/i, 'HOST'))
      } else if (x.match(/^(OR|AND|NOT)/i)) {
        ruleSet.push(x)
      } else if (x != '') {
        noResolve = x.replace(/\x20/g, '').match(/,no-resolve/i) ? ',no-resolve' : ''
        dSni = x.replace(/\x20/g, '').match(/,extended-matching/i) ? ',extended-matching' : ''

        ruleType = x
          .split(/ *, */)[0]
          .toUpperCase()
          .replace(/^PROCESS-PATH/i, 'PROCESS-NAME')

        if (isSurgeiOS) {
          ruleType = ruleType.replace(/^DST-PORT/i, 'DEST-PORT')
        }

        ruleValue = x.split(/ *, */)[1]

        ruleSet.push(`${ruleType},${ruleValue}${noResolve}${dSni}`)
      }
    }
  } //循环结束

  let ruleNum = ruleSet.length
  let notSupport = other.length
  let outRuleNum = outRules.length
  other = (other[0] || '') && `\n#不支持的规则:\n#${other.join('\n#')}`
  outRules = (outRules[0] || '') && `\n#已排除规则:\n#${outRules.join('\n#')}`

  if (isStashiOS) {
    ruleSet =
      (ruleSet[0] || '') &&
      `#规则数量:${ruleNum}\n#不支持的规则数量:${notSupport}\n#已排除的规则数量:${outRuleNum}${other}${outRules}\n\n#-----------------以下为解析后的规则-----------------#\n\npayload:\n${ruleSet.join(
        '\n'
      )}`
  } else if (isSurgeiOS || isShadowrocket || isLooniOS) {
    ruleSet =
      (ruleSet[0] || '') &&
      `#规则数量:${ruleNum}\n#不支持的规则数量:${notSupport}\n#已排除的规则数量:${outRuleNum}${other}${outRules}\n\n#-----------------以下为解析后的规则-----------------#\n\n${ruleSet.join(
        '\n'
      )}`
    if (isSurgeiOS) {
      const stname = 'SurgeTool_Rule_NUM'
      let SurgeTool = {}
      try {
        SurgeTool = $.getjson(stname)
        if (!SurgeTool && SurgeTool?.length > 10000) {
          clearcr()
        } else {
          SurgeTool[url] = ruleNum
          $.setjson(SurgeTool, stname)
        }
      } catch (error) {
        clearcr()
      }
      function clearcr() {
        SurgeTool = {}
        SurgeTool[url] = ruleNum
        $.setjson(SurgeTool, stname)
      }
    }
  } else if (isSurgedomainset || isSurgedomainset2) {
    domainSet = ruleSet.filter(ruleSet => ruleSet.search(/^DOMAIN(,|-SUFFIX)/) != -1)

    ruleSet = ruleSet.filter(ruleSet => ruleSet.search(/^DOMAIN(,|-SUFFIX)/) == -1)

    ruleNum2 = ruleSet.length
    domainNum = domainSet.length

    if (isSurgedomainset) {
      ruleSet =
        (domainSet[0] || '') &&
        `#总规则数量:${ruleNum}\n#域名规则数量:${domainNum}\n#不支持的规则数量:${notSupport}\n#已排除的规则数量:${outRuleNum}${other}${outRules}\n\n#-----------------以下为解析后的规则-----------------#\n\n` +
          domainSet
            .join('\n')
            .replace(/^DOMAIN,/gm, '')
            .replace(/^DOMAIN-SUFFIX,/gm, '.')
    } else if (isSurgedomainset2) {
      ruleSet =
        (ruleSet[0] || '') &&
        `#总规则数量:${ruleNum}\n#非域名规则数量:${ruleNum2}\n#不支持的规则数量:${notSupport}\n#已排除的规则数量:${outRuleNum}${other}${outRules}\n\n#-----------------以下为解析后的规则-----------------#\n\n${ruleSet.join(
          '\n'
        )}`
    }
  } else if (isStashdomainset || isStashdomainset2) {
    domainSet = ruleSet.filter(ruleSet => ruleSet.search(/  - DOMAIN(,|-SUFFIX)/) != -1)

    ruleSet = ruleSet.filter(ruleSet => ruleSet.search(/  - DOMAIN(,|-SUFFIX)/) == -1)

    ruleNum2 = ruleSet.length
    domainNum = domainSet.length

    if (isStashdomainset) {
      ruleSet =
        (domainSet[0] || '') &&
        domainSet
          .join('\n')
          .replace(/  - DOMAIN,/gm, '')
          .replace(/  - DOMAIN-SUFFIX,/gm, '.')
          .replace(/^([^,]*),?.*/gim, '$1')
    } else if (isStashdomainset2) {
      ruleSet =
        (ruleSet[0] || '') &&
        `#总规则数量:${ruleNum}\n#非域名规则数量:${ruleNum2}\n#不支持的规则数量:${notSupport}\n#已排除的规则数量:${outRuleNum}${other}${outRules}\n\n#-----------------以下为解析后的规则-----------------#\n\npayload:\n${ruleSet.join(
          '\n'
        )}`
    }
  }

  body = `${ruleSet}`.replace(/t&zd;/g, ',').replace(/ ;#/g, ' ')

  eval(evJsmodi)
  eval(evUrlmodi)

  result = {
    body: body,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  }
  $.isQuanX() ? (result.status = 'HTTP/1.1 200') : (result.status = 200)
  done($.isQuanX() ? result : { response: result })
})().catch(e => {
  noNtf == false ? $.msg(JS_NAME, `${resFileName}：${e}\n${url}`, '', 'https://t.me/zhetengsha_group') : $.log(e)
  result = {
    body: `${resFileName}：${e}\n\n\n\n\n\nScript Hub 规则集转换: ❌  可自行翻译错误信息或复制错误信息后点击通知进行反馈
`,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST,GET,OPTIONS,PUT,DELETE',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
    },
  }
  $.isQuanX() ? (result.status = 'HTTP/1.1 500') : (result.status = 500)
  done($.isQuanX() ? result : { response: result })
})

function istrue(str) {
  if (str == true || str == 1 || str == 'true' || str == '1') {
    return true
  } else {
    return false
  }
}

function getArgArr(str) {
  let arr = str.split('+')
  return arr.map(item => item.replace(/➕/g, '+'))
}

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

// 请求
async function http(url, opts = {}) {
  const http_start = Date.now()
  let timeout = HTTP_TIMEOUT + 1 * 1000
  timeout = $.isSurge() ? timeout / 1000 : timeout
  const reqOpts = {
    timeout,
    url,
    ...opts,
  }
  try {
    const res = await Promise.race([
      $.http.get(reqOpts),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), HTTP_TIMEOUT)),
    ])
    $.log(`⏱ 请求耗时：${Math.round(((Date.now() - http_start) / 1000) * 100) / 100} 秒\n  └ ${reqOpts.url}`)
    return res
  } catch (e) {
    $.logErr(e)
    let msg = String($.lodash_get(e, 'message') || e)
    let info
    if (msg.includes('timeout')) {
      info = `请求超时(${Math.round((HTTP_TIMEOUT / 1000) * 100) / 100} 秒)`
    } else {
      throw new Error(e)
    }
    throw new Error(info)
  }
}
function done(...args) {
  $.log(`⏱ 总耗时：${Math.round(((Date.now() - script_start) / 1000) * 100) / 100} 秒`)
  $.done(...args)
}

// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise(((e,r)=>{s.call(this,t,((t,s,a)=>{t?r(t):e(s)}))}))}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",Object.assign(this,e)}getEnv(){return"undefined"!=typeof $environment&&$environment["surge-version"]?"Surge":"undefined"!=typeof $environment&&$environment["stash-version"]?"Stash":"undefined"!=typeof module&&module.exports?"Node.js":"undefined"!=typeof $task?"Quantumult X":"undefined"!=typeof $loon?"Loon":"undefined"!=typeof $rocket?"Shadowrocket":void 0}isNode(){return"Node.js"===this.getEnv()}isQuanX(){return"Quantumult X"===this.getEnv()}isSurge(){return"Surge"===this.getEnv()}isLoon(){return"Loon"===this.getEnv()}isShadowrocket(){return"Shadowrocket"===this.getEnv()}isStash(){return"Stash"===this.getEnv()}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const r=this.getdata(t);if(r)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise((e=>{this.get({url:t},((t,s,r)=>e(r)))}))}runScript(t,e){return new Promise((s=>{let r=this.getdata("@chavy_boxjs_userCfgs.httpapi");r=r?r.replace(/\n/g,"").trim():r;let a=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");a=a?1*a:20,a=e&&e.timeout?e.timeout:a;const[o,i]=r.split("@"),n={url:`http://${i}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:a},headers:{"X-Key":o,Accept:"*/*"},timeout:a};this.post(n,((t,e,r)=>s(r)))})).catch((t=>this.logErr(t)))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),r=!s&&this.fs.existsSync(e);if(!s&&!r)return{};{const r=s?t:e;try{return JSON.parse(this.fs.readFileSync(r))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),r=!s&&this.fs.existsSync(e),a=JSON.stringify(this.data);s?this.fs.writeFileSync(t,a):r?this.fs.writeFileSync(e,a):this.fs.writeFileSync(t,a)}}lodash_get(t,e,s){const r=e.replace(/\[(\d+)\]/g,".$1").split(".");let a=t;for(const t of r)if(a=Object(a)[t],void 0===a)return s;return a}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce(((t,s,r)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[r+1])>>0==+e[r+1]?[]:{}),t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,r]=/^@(.*?)\.(.*?)$/.exec(t),a=s?this.getval(s):"";if(a)try{const t=JSON.parse(a);e=t?this.lodash_get(t,r,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,r,a]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(r),i=r?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(i);this.lodash_set(e,a,t),s=this.setval(JSON.stringify(e),r)}catch(e){const o={};this.lodash_set(o,a,t),s=this.setval(JSON.stringify(o),r)}}else s=this.setval(t,e);return s}getval(t){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.read(t);case"Quantumult X":return $prefs.valueForKey(t);case"Node.js":return this.data=this.loaddata(),this.data[t];default:return this.data&&this.data[t]||null}}setval(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.write(t,e);case"Quantumult X":return $prefs.setValueForKey(t,e);case"Node.js":return this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0;default:return this.data&&this.data[e]||null}}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){switch(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"],delete t.headers["content-type"],delete t.headers["content-length"]),t.params&&(t.url+="?"+this.queryStr(t.params)),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,((t,s,r)=>{!t&&s&&(s.body=r,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,r)}));break;case"Quantumult X":this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then((t=>{const{statusCode:s,statusCode:r,headers:a,body:o,bodyBytes:i}=t;e(null,{status:s,statusCode:r,headers:a,body:o,bodyBytes:i},o,i)}),(t=>e(t&&t.error||"UndefinedError")));break;case"Node.js":let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",((t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}})).then((t=>{const{statusCode:r,statusCode:a,headers:o,rawBody:i}=t,n=s.decode(i,this.encoding);e(null,{status:r,statusCode:a,headers:o,rawBody:i,body:n},n)}),(t=>{const{message:r,response:a}=t;e(r,a,a&&s.decode(a.rawBody,this.encoding))}))}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";switch(t.body&&t.headers&&!t.headers["Content-Type"]&&!t.headers["content-type"]&&(t.headers["content-type"]="application/x-www-form-urlencoded"),t.headers&&(delete t.headers["Content-Length"],delete t.headers["content-length"]),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,((t,s,r)=>{!t&&s&&(s.body=r,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,r)}));break;case"Quantumult X":;t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then((t=>{const{statusCode:s,statusCode:r,headers:a,body:o,bodyBytes:i}=t;e(null,{status:s,statusCode:r,headers:a,body:o,bodyBytes:i},o,i)}),(t=>e(t&&t.error||"UndefinedError")));break;case"Node.js":let r=require("iconv-lite");this.initGotEnv(t);const{url:a,...o}=t;this.got[s](a,o).then((t=>{const{statusCode:s,statusCode:a,headers:o,rawBody:i}=t,n=r.decode(i,this.encoding);e(null,{status:s,statusCode:a,headers:o,rawBody:i,body:n},n)}),(t=>{const{message:s,response:a}=t;e(s,a,a&&r.decode(a.rawBody,this.encoding))}))}}time(t,e=null){const s=e?new Date(e):new Date;let r={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in r)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?r[e]:("00"+r[e]).substr((""+r[e]).length)));return t}queryStr(t){let e="";for(const s in t){let r=t[s];null!=r&&""!==r&&("object"==typeof r&&(r=JSON.stringify(r)),e+=`${s}=${r}&`)}return e=e.substring(0,e.length-1),e}msg(e=t,s="",r="",a){const o=t=>{switch(typeof t){case void 0:return t;case"string":switch(this.getEnv()){case"Surge":case"Stash":default:return{url:t};case"Loon":case"Shadowrocket":return t;case"Quantumult X":return{"open-url":t};case"Node.js":return}case"object":switch(this.getEnv()){case"Surge":case"Stash":case"Shadowrocket":default:{let e=t.url||t.openUrl||t["open-url"];return{url:e}}case"Loon":{let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}case"Quantumult X":{let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl,r=t["update-pasteboard"]||t.updatePasteboard;return{"open-url":e,"media-url":s,"update-pasteboard":r}}case"Node.js":return}default:return}};if(!this.isMute)switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:$notification.post(e,s,r,o(a));break;case"Quantumult X":$notify(e,s,r,o(a));break;case"Node.js":}if(!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),r&&t.push(r),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:this.log("",`❗️${this.name}, 错误!`,t);break;case"Node.js":this.log("",`❗️${this.name}, 错误!`,t.stack)}}wait(t){return new Promise((e=>setTimeout(e,t)))}done(t={}){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:$done(t);break;case"Node.js":process.exit(1)}}}(t,e)}
