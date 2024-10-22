/*
Stash 脚本实现 QX 的 echo-response 重写类型
# 不支持
^https?:\/\/echo-response\.com url echo-response text/html echo-response index.html
# 支持
https?:\/\/a\.b\.app\/c\?id=\d{5,10} url echo-response text/json echo-response https://github.com/ddgksf2013/dev/raw/main/NicegramProCrack.js
改写为
[Script]
n = type=http-request,pattern=https?:\/\/a\.b\.app\/c\?id=\d{5,10},requires-body=0,max-size=0,timeout=30,script-update-interval=86400,script-path=https://raw.githubusercontent.com/xream/scripts/main/surge/modules/echo-response/index.js, argument=type=text/json&url=https://github.com/a/dev/raw/main/b.js

[MITM]
hostname = %APPEND% restore-access.indream.app
不指定 type 时, 自动跳转
指定 type 时, 下载并设置 type

新参数 header=Content-Type: image/png|field2: value2
status-code=200
text=encodeURIComponent过的文本
base64=base64内容
*/
//用于自定义发送请求的请求头
const reqHeaders = {
  headers: {
    'User-Agent': 'script-hub/1.0.0',
  },
}
const NAME = 'echo-response'
const TITLE = 'echo-response'
const $ = new Env(NAME)

const shouldFixCharset = true
const shouldFixLoonRedirectBody = true

let arg
let url
if (typeof $argument != 'undefined') {
  let argument = $argument ?? ''
  try {
    argument = decodeURIComponent(argument)
  } catch (e) {}
  // const urlMatch = argument.match(/(^|&)(url=(.*?))$/)
  // url = urlMatch?.[3]
  // if (url) {
  //   try {
  //     url = decodeURIComponent(url)
  //   } catch (e) {}
  // }
  // $.log('url', url)
  // argument = argument.replace(/(^|&)(url=(.*?))$/, '')
  $.log('argument', argument)
  arg = Object.fromEntries(argument.split('&').map(item => item.split('=')))
}

let result = {}
!(async () => {
  let statusCode = $.lodash_get(arg, 'status-code')
  let base64 = $.lodash_get(arg, 'base64') || ''
  let text = $.lodash_get(arg, 'text')
  let url = $.lodash_get(arg, 'url') || ''
  let content = ''
  if (text != null) {
    try {
      content = decodeURIComponent(text)
    } catch (e) {}
  } else if (base64) {
    try {
      content = decodeURIComponent(base64)
    } catch (e) {}
  } else {
    try {
      url = decodeURIComponent(url)
    } catch (e) {}
    if (!url || !/^(https?|ftp|file):\/\/.*/.test(url)) {
      throw new Error('不支持的 url')
    }
  }

  let type = decodeURIComponent($.lodash_get(arg, 'type') || '')
  let header = $.lodash_get(arg, 'header') || ''
  // let cachExp = $.lodash_get(arg, 'cachexp')
  // let noCache = istrue($.lodash_get(arg, 'nocache'))

  // // 缓存对象
  // const cache = {}

  // // 缓存大小
  // const maxCacheSize = $.getval('Parser_cache_size') ?? 1 * 1024 * 1024

  // // 全局有效时长，默认为 24 小时
  // const globalMaxAge = ($.getval('Parser_cache_exp') ?? 24) * 60 * 60 * 1000

  // // 设置缓存
  // function setCache(key, value, maxAge) {
  //   // 如果没有指定有效时长，则使用全局有效时长
  //   if (maxAge == null || maxAge == '' || maxAge.length === 0) {
  //     maxAge = globalMaxAge
  //   }
  //   // 将值转换为JSON字符串
  //   const stringValue = JSON.stringify(value)
  //   // 如果超过最大缓存大小，则不缓存
  //   if (stringValue.length > maxCacheSize) {
  //     return
  //   }
  //   // 如果缓存已存在，则调整缓存位置
  //   if (cache[key]) {
  //     delete cache[key]
  //   }
  //   // 设置缓存对象的属性
  //   cache[key] = {
  //     value: stringValue,
  //     // 记录缓存的过期时间
  //     expireTime: Date.now() + maxAge,
  //   }
  //   // 检查缓存大小是否超过最大缓存大小
  //   checkCacheSize()
  // }

  // // 获取缓存
  // function getCache(key) {
  //   // 如果缓存不存在，则返回undefined
  //   if (!cache[key]) {
  //     return undefined
  //   }
  //   // 判断缓存是否过期
  //   if (cache[key].expireTime < Date.now()) {
  //     // 如果过期，则删除缓存
  //     delete cache[key]
  //     return undefined
  //   }

  //   return JSON.parse(cache[key].value)
  // }

  // // 从对象初始化缓存并清理过期缓存
  // function initCacheFromObject(obj) {
  //   // 获取当前时间
  //   const now = Date.now()
  //   // 遍历对象并设置缓存
  //   for (const key in obj) {
  //     if (obj.hasOwnProperty(key)) {
  //       // 判断缓存是否过期
  //       if (cache[key] && cache[key].expireTime < now) {
  //         // 如果过期，则删除缓存
  //         delete cache[key]
  //       } else {
  //         // 否则设置缓存
  //         cache[key] = obj[key]
  //       }
  //     }
  //   }
  // }

  // // 检查缓存大小是否超过最大缓存大小
  // function checkCacheSize() {
  //   let cacheSize = 0
  //   for (const key in cache) {
  //     if (cache.hasOwnProperty(key)) {
  //       // 计算缓存大小
  //       cacheSize += cache[key].value.length
  //     }
  //   }
  //   // 如果缓存大小超过最大缓存大小，则删除最早的缓存
  //   while (cacheSize > maxCacheSize) {
  //     const oldestKey = Object.keys(cache)[0]
  //     cacheSize -= cache[oldestKey].value.length
  //     delete cache[oldestKey]
  //   }
  // }

  // if (!noCache) {
  //   initCacheFromObject($.getjson('parser_cache_mock') || {})
  //   $.setjson(cache, 'parser_cache_mock')
  // }

  let newHeaders = {}
  header.split(/\s*\|\s*/g).forEach(i => {
    if (/.+:.+/.test(i)) {
      const kv = i.split(/\s*\:\s*/)
      if (kv.length === 2) {
        newHeaders[kv[0]] = kv[1]
      }
    }
  })

  if (Object.keys(newHeaders).length > 0) {
    $.log(`指定 headers`, $.toStr(newHeaders))
  } else if (type) {
    $.log('指定 Content-Type', type)
  }
  if (url) {
    if (type || Object.keys(newHeaders).length > 0) {
      const getRes = async () => {
        $.log('需下载', url)
        const res = await $.http.get({
          url,
          headers: reqHeaders.headers,
          // headers: $.lodash_get($request, 'headers'),
        })
        // $.log('ℹ️ res', $.toStr(res))
        const status = $.lodash_get(res, 'status') || $.lodash_get(res, 'statusCode') || 200
        $.log('ℹ️ res status', status)
        const headers = $.lodash_get(res, 'headers')
        // $.log('ℹ️ res headers', $.toStr(headers))

        // if (!type) {
        const type = $.lodash_get(headers, 'content-type') || $.lodash_get(headers, 'Content-Type')

        // $.log('ℹ️ res type', type)
        // }

        let body = $.lodash_get(res, 'body') || $.lodash_get(res, 'rawBody')

        // $.log('ℹ️ res body', body)
        return { body, type, status, headers, shouldCache: typeof body === 'string' }
      }

      // let res
      // if (noCache) {
      //   res = await getRes()
      // } else {
      //   res = getCache(url)
      //   if (!res) {
      //     res = await getRes()
      //     if ($.lodash_get(res, 'shouldCache')) {
      //       setCache(url, res, cachExp)
      //       $.setjson(cache, 'parser_cache_mock')
      //     }
      //   }
      // }

      let res = await getRes()

      const { body, type: cachedType, status, headers } = res
      // console.log(Object.keys(res))

      const newTypeHeaders = {
        ...headers,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST,GET,OPTIONS,PUT,DELETE',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
      }
      if (!type) {
        type = cachedType
      }
      if (type) {
        if (newTypeHeaders['Content-Type']) {
          newTypeHeaders['Content-Type'] = type
        } else {
          newTypeHeaders['content-type'] = type
        }
      }
      if (
        shouldFixLoonRedirectBody &&
        /^3\d{2}$/.test(status) &&
        $.isLoon() &&
        (body == null || body == '' || body.length === 0)
      ) {
        body = 'loon'
      }
      const respHeaders = Object.keys(newHeaders).length > 0 ? newHeaders : newTypeHeaders

      if (respHeaders['Content-Type']) {
        respHeaders['Content-Type'] = utf8ContentType(respHeaders['Content-Type'])
      } else if (respHeaders['content-type']) {
        respHeaders['content-type'] = utf8ContentType(respHeaders['content-type'])
      }

      $.log('response', $.toStr(respHeaders))

      result = {
        response: {
          status: statusCode ? Number.parseInt(statusCode, 10) : status,
          headers: respHeaders,
          body,
        },
      }
    } else {
      $.log('未指定 Content-Type, 自动跳转', url)
      result = {
        response: {
          status: 302,
          body: shouldFixLoonRedirectBody && $.isLoon() ? 'loon' : undefined,
          headers: {
            location: url,
          },
        },
      }
    }
  } else {
    const newTypeHeaders = {
      'Content-Type': base64 ? 'application/octet-stream' : 'text/plain',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST,GET,OPTIONS,PUT,DELETE',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
    }
    if (type) {
      if (newTypeHeaders['Content-Type']) {
        newTypeHeaders['Content-Type'] = type
      } else {
        newTypeHeaders['content-type'] = type
      }
    }
    if (
      shouldFixLoonRedirectBody &&
      /^3\d{2}$/.test(statusCode) &&
      $.isLoon() &&
      (body == null || body == '' || body.length === 0)
    ) {
      body = 'loon'
    }
    const respHeaders = Object.keys(newHeaders).length > 0 ? newHeaders : newTypeHeaders

    if (respHeaders['Content-Type']) {
      respHeaders['Content-Type'] = utf8ContentType(respHeaders['Content-Type'])
    } else if (respHeaders['content-type']) {
      respHeaders['content-type'] = utf8ContentType(respHeaders['content-type'])
    }

    $.log('response', $.toStr(respHeaders))

    result = {
      response: {
        status: statusCode ? Number.parseInt(statusCode, 10) : 200,
        headers: respHeaders,
        body: content,
      },
    }
  }
})()
  .catch(async e => {
    $.logErr(e)
    $.logErr($.toStr(e))
    await notify(TITLE, '❌', `${$.lodash_get(e, 'message') || $.lodash_get(e, 'error') || e}`)
  })
  .finally(async () => {
    $.log($.toStr(result))
    $.done(result)
  })

// 加 UTF-8
function utf8ContentType(type) {
  if (shouldFixCharset && /^(text|application)\/.+/i.test(type) && !/;\s*?charset\s*?=\s*?/i.test(type)) {
    let newType = `${type}; charset=UTF-8`
    $.log('增加 UTF-8', newType)
    return newType
  }
  return type
}

// 通知
async function notify(title, subt, desc, opts) {
  $.msg(title, subt, desc, opts)
}

// 是否为真 与其他脚本逻辑一致
function istrue(str) {
  if (str == true || str == 1 || str == 'true' || str == '1') {
    return true
  } else {
    return false
  }
}

// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise(((e,r)=>{s.call(this,t,((t,s,a)=>{t?r(t):e(s)}))}))}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",Object.assign(this,e)}getEnv(){return"undefined"!=typeof $environment&&$environment["surge-version"]?"Surge":"undefined"!=typeof $environment&&$environment["stash-version"]?"Stash":"undefined"!=typeof module&&module.exports?"Node.js":"undefined"!=typeof $task?"Quantumult X":"undefined"!=typeof $loon?"Loon":"undefined"!=typeof $rocket?"Shadowrocket":void 0}isNode(){return"Node.js"===this.getEnv()}isQuanX(){return"Quantumult X"===this.getEnv()}isSurge(){return"Surge"===this.getEnv()}isLoon(){return"Loon"===this.getEnv()}isShadowrocket(){return"Shadowrocket"===this.getEnv()}isStash(){return"Stash"===this.getEnv()}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const r=this.getdata(t);if(r)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise((e=>{this.get({url:t},((t,s,r)=>e(r)))}))}runScript(t,e){return new Promise((s=>{let r=this.getdata("@chavy_boxjs_userCfgs.httpapi");r=r?r.replace(/\n/g,"").trim():r;let a=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");a=a?1*a:20,a=e&&e.timeout?e.timeout:a;const[o,i]=r.split("@"),n={url:`http://${i}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:a},headers:{"X-Key":o,Accept:"*/*"},timeout:a};this.post(n,((t,e,r)=>s(r)))})).catch((t=>this.logErr(t)))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),r=!s&&this.fs.existsSync(e);if(!s&&!r)return{};{const r=s?t:e;try{return JSON.parse(this.fs.readFileSync(r))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),r=!s&&this.fs.existsSync(e),a=JSON.stringify(this.data);s?this.fs.writeFileSync(t,a):r?this.fs.writeFileSync(e,a):this.fs.writeFileSync(t,a)}}lodash_get(t,e,s){const r=e.replace(/\[(\d+)\]/g,".$1").split(".");let a=t;for(const t of r)if(a=Object(a)[t],void 0===a)return s;return a}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce(((t,s,r)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[r+1])>>0==+e[r+1]?[]:{}),t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,r]=/^@(.*?)\.(.*?)$/.exec(t),a=s?this.getval(s):"";if(a)try{const t=JSON.parse(a);e=t?this.lodash_get(t,r,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,r,a]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(r),i=r?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(i);this.lodash_set(e,a,t),s=this.setval(JSON.stringify(e),r)}catch(e){const o={};this.lodash_set(o,a,t),s=this.setval(JSON.stringify(o),r)}}else s=this.setval(t,e);return s}getval(t){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.read(t);case"Quantumult X":return $prefs.valueForKey(t);case"Node.js":return this.data=this.loaddata(),this.data[t];default:return this.data&&this.data[t]||null}}setval(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.write(t,e);case"Quantumult X":return $prefs.setValueForKey(t,e);case"Node.js":return this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0;default:return this.data&&this.data[e]||null}}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){switch(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"],delete t.headers["content-type"],delete t.headers["content-length"]),t.params&&(t.url+="?"+this.queryStr(t.params)),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,((t,s,r)=>{!t&&s&&(s.body=r,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,r)}));break;case"Quantumult X":this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then((t=>{const{statusCode:s,statusCode:r,headers:a,body:o,bodyBytes:i}=t;e(null,{status:s,statusCode:r,headers:a,body:o,bodyBytes:i},o,i)}),(t=>e(t&&t.error||"UndefinedError")));break;case"Node.js":let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",((t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}})).then((t=>{const{statusCode:r,statusCode:a,headers:o,rawBody:i}=t,n=s.decode(i,this.encoding);e(null,{status:r,statusCode:a,headers:o,rawBody:i,body:n},n)}),(t=>{const{message:r,response:a}=t;e(r,a,a&&s.decode(a.rawBody,this.encoding))}))}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";switch(t.body&&t.headers&&!t.headers["Content-Type"]&&!t.headers["content-type"]&&(t.headers["content-type"]="application/x-www-form-urlencoded"),t.headers&&(delete t.headers["Content-Length"],delete t.headers["content-length"]),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,((t,s,r)=>{!t&&s&&(s.body=r,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,r)}));break;case"Quantumult X":;t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then((t=>{const{statusCode:s,statusCode:r,headers:a,body:o,bodyBytes:i}=t;e(null,{status:s,statusCode:r,headers:a,body:o,bodyBytes:i},o,i)}),(t=>e(t&&t.error||"UndefinedError")));break;case"Node.js":let r=require("iconv-lite");this.initGotEnv(t);const{url:a,...o}=t;this.got[s](a,o).then((t=>{const{statusCode:s,statusCode:a,headers:o,rawBody:i}=t,n=r.decode(i,this.encoding);e(null,{status:s,statusCode:a,headers:o,rawBody:i,body:n},n)}),(t=>{const{message:s,response:a}=t;e(s,a,a&&r.decode(a.rawBody,this.encoding))}))}}time(t,e=null){const s=e?new Date(e):new Date;let r={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in r)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?r[e]:("00"+r[e]).substr((""+r[e]).length)));return t}queryStr(t){let e="";for(const s in t){let r=t[s];null!=r&&""!==r&&("object"==typeof r&&(r=JSON.stringify(r)),e+=`${s}=${r}&`)}return e=e.substring(0,e.length-1),e}msg(e=t,s="",r="",a){const o=t=>{switch(typeof t){case void 0:return t;case"string":switch(this.getEnv()){case"Surge":case"Stash":default:return{url:t};case"Loon":case"Shadowrocket":return t;case"Quantumult X":return{"open-url":t};case"Node.js":return}case"object":switch(this.getEnv()){case"Surge":case"Stash":case"Shadowrocket":default:{let e=t.url||t.openUrl||t["open-url"];return{url:e}}case"Loon":{let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}case"Quantumult X":{let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl,r=t["update-pasteboard"]||t.updatePasteboard;return{"open-url":e,"media-url":s,"update-pasteboard":r}}case"Node.js":return}default:return}};if(!this.isMute)switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:$notification.post(e,s,r,o(a));break;case"Quantumult X":$notify(e,s,r,o(a));break;case"Node.js":}if(!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),r&&t.push(r),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:this.log("",`❗️${this.name}, 错误!`,t);break;case"Node.js":this.log("",`❗️${this.name}, 错误!`,t.stack)}}wait(t){return new Promise((e=>setTimeout(e,t)))}done(t={}){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:$done(t);break;case"Node.js":process.exit(1)}}}(t,e)}
