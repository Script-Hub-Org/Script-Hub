/***************************
支持将 QX重写 Surge模块 Loon插件 解析至Surge Shadowrocket Loon Stash

远程重写支持多链接输入，链接间用😂连接 可以 重写 模块 插件 混合传入

说明
原脚本作者@小白脸 脚本修改@chengkongyiban
感谢@xream 提供的replace-Header.js
               echo-response.js
感谢@mieqq 提供的replace-body.js
插件图标用的 @Keikinn 的 StickerOnScreen项目 以及 @Toperlock 的图标库项目，感谢

项目地址:
https://github.com/Script-Hub-Org/Script-Hub
***************************/

const script_start = Date.now()
const JS_NAME = 'Script Hub: 重写转换'
const $ = new Env(JS_NAME)

let arg
if (typeof $argument != 'undefined') {
  arg = Object.fromEntries($argument.split('&').map(item => item.split('=')))
} else {
  arg = {}
}
// 超时设置 与 script-converter.js 相同
const HTTP_TIMEOUT = ($.getval('Parser_http_timeout') ?? 20) * 1000

const url = $request.url
const req = url.split(/file\/_start_\//)[1].split(/\/_end_\//)[0]
const reqArr = req.match('%F0%9F%98%82') ? req.split('%F0%9F%98%82') : [req]
//$.log("原始链接：" + req);
const urlArg = url.split(/\/_end_\//)[1]

//获取参数
const queryObject = parseQueryString(urlArg)
//$.log("参数:" + $.toStr(queryObject));

// 来源
const fromType = queryObject.type
//目标app
const targetApp = queryObject.target
const app = targetApp.split('-')[0]
const isSurgeiOS = targetApp == 'surge-module'
const isStashiOS = targetApp == 'stash-stoverride'
const isLooniOS = targetApp == 'loon-plugin'
const isShadowrocket = targetApp == 'shadowrocket-module'

const evJsori = queryObject.evalScriptori
const evJsmodi = queryObject.evalScriptmodi
const evUrlori = queryObject.evalUrlori
const evUrlmodi = queryObject.evalUrlmodi

const prepend = queryObject.prepend
const scEvJsori = queryObject.evJsori
const scEvJsmodi = queryObject.evJsmodi
const scEvUrlori = queryObject.evUrlori
const scEvUrlmodi = queryObject.evUrlmodi

let noNtf = queryObject.noNtf ? istrue(queryObject.noNtf) : false //默认开启通知

let localsetNtf = $.lodash_get(arg, 'Notify') || $.getval('ScriptHub通知') || ''
noNtf = localsetNtf == '开启通知' ? false : localsetNtf == '关闭通知' ? true : noNtf

let jqEnabled = istrue(queryObject.jqEnabled)
let openMsgHtml = istrue(queryObject.openMsgHtml)

noNtf = openMsgHtml ? true : noNtf

let nName = queryObject.n != undefined ? getArgArr(queryObject.n) : null //名字简介
let category = queryObject.category ?? null
let icon = queryObject.icon ?? null
let Pin0 = queryObject.y != undefined ? getArgArr(queryObject.y) : null //保留
let Pout0 = queryObject.x != undefined ? getArgArr(queryObject.x) : null //排除
let hnAdd = queryObject.hnadd != undefined ? queryObject.hnadd.split(/\s*,\s*/) : null //加
let hnDel = queryObject.hndel != undefined ? queryObject.hndel.split(/\s*,\s*/) : null //减
let hnRegDel = queryObject.hnregdel != undefined ? new RegExp(queryObject.hnregdel) : null //正则删除hostname
let synMitm = istrue(queryObject.synMitm) //将force与mitm同步
let delNoteSc = istrue(queryObject.del)
let nCron = queryObject.cron != undefined ? getArgArr(queryObject.cron) : null //替换cron目标
let ncronexp = queryObject.cronexp != undefined ? queryObject.cronexp.replace(/\./g, ' ').split('+') : null //新cronexp
let nArgTarget = queryObject.arg != undefined ? getArgArr(queryObject.arg) : null //arg目标
let nArg = queryObject.argv != undefined ? getArgArr(queryObject.argv) : null //arg参数
let nTilesTarget = queryObject.tiles != undefined ? getArgArr(queryObject.tiles) : null
let ntilescolor = queryObject.tcolor != undefined ? getArgArr(queryObject.tcolor) : null
let nPolicy = queryObject.policy != undefined ? queryObject.policy : null
let njsnametarget = queryObject.njsnametarget != undefined ? getArgArr(queryObject.njsnametarget) : null //修改脚本名目标
let njsname = queryObject.njsname != undefined ? getArgArr(queryObject.njsname) : null //修改脚本名
let timeoutt = queryObject.timeoutt != undefined ? getArgArr(queryObject.timeoutt) : null //修改超时目标
let timeoutv = queryObject.timeoutv != undefined ? getArgArr(queryObject.timeoutv) : null //修改超时的值
let enginet = queryObject.enginet != undefined ? getArgArr(queryObject.enginet) : null //修改引擎目标
let enginev = queryObject.enginev != undefined ? getArgArr(queryObject.enginev) : null //修改引擎的值
let jsConverter = queryObject.jsc != undefined ? getArgArr(queryObject.jsc) : null //脚本转换1
let jsConverter2 = queryObject.jsc2 != undefined ? getArgArr(queryObject.jsc2) : null //脚本转换2
let compatibilityOnly = istrue(queryObject.compatibilityOnly) //兼容转换
let keepHeader = istrue(queryObject.keepHeader) //保留mock header
let jsDelivr = istrue(queryObject.jsDelivr) //开启jsDelivr
let localText = queryObject.localtext != undefined ? '\n' + queryObject.localtext : '' //纯文本输入
let ipNoResolve = istrue(queryObject.nore) //ip规则不解析域名
let sni = queryObject.sni != undefined ? getArgArr(queryObject.sni) : null //sni嗅探
let pm = queryObject.pm != undefined ? getArgArr(queryObject.pm) : null // pre-matching
let sufkeepHeader = keepHeader == true ? '&keepHeader=true' : '' //用于保留header的后缀
let sufjsDelivr = jsDelivr == true ? '&jsDelivr=true' : '' //用于开启jsDeliver的后缀

//用于自定义发送请求的请求头
const reqHeaders = {
  headers: {
    'User-Agent': 'script-hub/1.0.0',
  },
}

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

//插件图标区域
const iconStatus = $.getval('启用插件随机图标') ?? '启用'
const iconReplace = $.getval('替换原始插件图标') ?? '禁用'
const iconLibrary1 = $.getval('插件随机图标合集') ?? 'Doraemon(100P)'
const iconLibrary2 = iconLibrary1.split('(')[0]
const iconFormat = /gif/i.test(iconLibrary2) ? '.gif' : '.png'

//统一前置声明变量
let name,
  desc,
  randomicon,
  body,
  jscStatus,
  jsc2Status,
  jsPre,
  jsSuf,
  mark,
  noteK,
  ruletype,
  rulenore,
  rulesni,
  rulepm,
  rulePandV,
  rulepolicy,
  rulevalue,
  modistatus,
  hostdomain,
  hostvalue,
  panelname,
  title,
  content,
  style,
  scriptname,
  jsurl,
  jsname,
  img,
  jsfrom,
  jstype,
  eventname,
  size,
  proto,
  engine,
  jsenable,
  jsptn,
  jsarg,
  rebody,
  wakesys,
  cronexp,
  ability,
  updatetime,
  timeout,
  tilesicon,
  tilescolor,
  urlInNum,
  noteK2,
  noteK4,
  noteKn4,
  noteKn6,
  noteKn8,
  rwtype,
  rwptn,
  rwvalue,
  ori,
  MITM,
  force,
  result

let Rewrite = isLooniOS ? '[Rewrite]' : '[URL Rewrite]'

//随机插件图标
if ((isStashiOS || isLooniOS) && iconStatus == '启用') {
  const stickerStartNum = 1001
  const stickerSum = iconLibrary1.split('(')[1].split('P')[0]
  let randomStickerNum = parseInt(stickerStartNum + Math.random() * stickerSum).toString()
  randomicon =
    'https://github.com/Toperlock/Quantumult/raw/main/icon/' +
    iconLibrary2 +
    '/' +
    iconLibrary2 +
    '-' +
    randomStickerNum +
    iconFormat
}

//通知名区域
let rewriteName = req.substring(req.lastIndexOf('/') + 1).split('.')[0]
let resFile = urlArg.split('?')[0]
let resFileName = resFile.substring(0, resFile.lastIndexOf('.'))
let notifyName
if (nName != null && nName[0] != '') {
  notifyName = nName[0]
} else {
  notifyName = resFileName
}

//修改名字和简介
if (nName === null) {
  name = rewriteName
  desc = name
} else {
  name = nName[0] != '' ? nName[0] : rewriteName
  desc = nName[1] != undefined ? nName[1] : name
}

let modInfoObj = {
  name: name,
  desc: desc,
  author: '',
  icon: randomicon,
  category: '',
}

//信息中转站
let bodyBox = [] //存储待转换的内容
let otherRule = [] //不支持的规则&脚本
let notBuildInPolicy = [] //不是内置策略的规则
let inBox = [] //被释放的重写或规则
let outBox = [] //被排除的重写或规则
let modInfoBox = [] //模块简介等信息
let modInputBox = [] //loon插件的可交互按钮
let hostBox = [] //host
let ruleBox = [] //规则
let rwBox = [] //重写
let rwhdBox = [] //HeaderRewrite
let rwbodyBox = [] // Body Rewrite
let panelBox = [] //Panel信息
let jsBox = [] //脚本
let mockBox = [] //MapLocal或echo-response
let hnBox = [] //MITM主机名
let fheBox = [] //force-http-engine
let skipBox = [] //skip-ip
let realBox = [] //real-ip
let hndelBox = [] //正则剔除的主机名
let sgArg = [] //surge模块参数

let hnaddMethod = '%APPEND%'
let fheaddMethod = '%APPEND%'
let skipaddMethod = '%APPEND%'
let realaddMethod = '%APPEND%'

let hn2 = false //surge模块中带有禁用MITM参数时无法捕捉hostname，此变量用以判断有无此类参数，以便后续解析
let hn2name = 'hostname'

//待输出
let modInfo = [] //模块简介
let loonArg = [] //[Argument]
let httpFrame = '' //Stash的http:父框架
let tiles = [] //磁贴覆写
let General = []
let Panel = []
let host = []
let rules = []
let URLRewrite = []
let HeaderRewrite = []
let BodyRewrite = []
let MapLocal = []
let script = []
let cron = []
let providers = []

hnBox = hnAdd != null ? hnAdd : []

const jsRegex =
  /\s*[=,]\s*(?:script-path|pattern|timeout|argument|script-update-interval|requires-body|max-size|ability|binary-body-mode|cronexpr?|wake-system|enabled?|engine|tag|type|img-url|debug|event-name|desc)\s*=\s*/

const panelRegex = /\s*[=,]\s*(?:title|content|style|script-name|update-interval)\s*=\s*/

const policyRegex = /^(direct|reject-?(img|video|dict|array|drop|200|tinygif)?(-no-drop)?|\{\{\{[^,]+\}\}\})$/i

const mockRegex = /\s+(?:data-type|status-code|header|data|data-path|mock-data-is-base64)\s*=/

//查询js binarymode相关
let binaryInfo = $.getval('Parser_binary_info')
if (binaryInfo != null && binaryInfo.length > 0) {
  binaryInfo = $.toObj(binaryInfo)
} else {
  binaryInfo = []
}

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
      reStatus == 404 && $.msg(JS_NAME, '来源链接已失效', '404: Not Found ---> ' + reqArr[i], '')

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

  // [Body Rewrite] 部分 rwbodyBox
  let bodyRewrite = body.match(/(^|\n)\[Body Rewrite\]\n([\s\S]*?)\s*(\n\[|$)/)?.[2]

  if (bodyRewrite) {
    for await (let [y, x] of bodyRewrite.match(/[^\r\n]+/g).entries()) {
      if (/^(#|;|\/\/)\s*/.test(x)) continue
      const [_, type, regex, value] = x.match(/^((?:http-request|http-response)(?:-jq)?)\s+?(.*?)\s+?(.*?)$/)
      rwbodyBox.push({ type, regex, value })
    }
  }

  body = body.match(/[^\r\n]+/g)

  for await (let [y, x] of body.entries()) {
    // 保持原始 x
    const _x = x
    //简单处理方便后续操作
    x = x
      .trim()
      .replace(/^(#|;|\/\/)\s*/, '#')
      .replace(/\s+[^\s]+\s+url-and-header\s+/, ' url ')
      .replace(/(^[^#].+)\x20+\/\/.+/, '$1')
      .replace(/^#!PROFILE-VERSION-REQUIRED\s+[0-9]+\s+/i, '')
      .replace(/^(#)?host(-suffix|-keyword|-wildcard)?\s*,\s*/i, '$1DOMAIN$2,')
      .replace(/^(#)?ip6-cidr\s*,\s*/i, '$1IP-CIDR6,')
    if (!/^(#|\/\/|;)/.test(x)) {
      x = x.replace(/\s+?(?:#|\/\/|;).*?$/, '')
    }
    //去掉注释
    if (Pin0 != null) {
      for (let i = 0; i < Pin0.length; i++) {
        const elem = Pin0[i].trim()
        if (x.indexOf(elem) != -1 && /^#/.test(x)) {
          x = x.replace(/^#/, '')
          inBox.push(x)
          break
        }
      } //循环结束
    } //去掉注释结束

    //增加注释
    if (Pout0 != null) {
      for (let i = 0; i < Pout0.length; i++) {
        const elem = Pout0[i].trim()
        if (
          x.indexOf(elem) != -1 &&
          !/^(hostname|force-http-engine-hosts|skip-proxy|always-real-ip|real-ip)\s*=/.test(x) &&
          !/^#/.test(x)
        ) {
          x = '#' + x
          outBox.push(x)
          break
        }
      } //循环结束
    } //增加注释结束

    //剔除被注释的重写
    if (delNoteSc == true && /^#/.test(x) && !/^#!/.test(x)) {
      x = ''
    }

    let flags = {}
    //sni嗅探
    if (sni != null) {
      for (let i = 0; i < sni.length; i++) {
        const elem = sni[i].trim()
        // 加入对逻辑规则的判断
        if (isSurgeiOS && x.indexOf(elem) != -1) {
          if (/^(DOMAIN(-\w+)?|RULE-SET|URL-REGEX)/i.test(x) && !/,\s*?extended-matching/i.test(x)) {
            x = x + ',extended-matching'
            break
          } else if (/^(AND|OR|NOT)\s*?,/i.test(x)) {
            // x = x.replace(
            //   /(\(\s*?(?:DOMAIN(?:-\w+)?|RULE-SET|URL-REGEX)\s*?,\s*?(?:(?!,\s*?extended-matching\s*?(?:,|\))).)+?\s*?)((\)\s*?)+?,)/g,
            //   '$1,extended-matching$2'
            // )
            // x = modifyRule(x, 'surge', { extendedMatching: true })
            flags.extendedMatching = true
            break
          }
        }
      } //循环结束
    } //启用sni嗅探结束

    // pre-matching
    if (pm != null) {
      for (let i = 0; i < pm.length; i++) {
        const elem = pm[i].trim()
        // 加入对逻辑规则的判断
        const _rulepolicy = x.match(/,\s*([^,]+?)\s*(\s*,\s*(pre-matching|no-resolve|extended-matching)\s*)*?\s*$/)?.[1]
        if (
          isSurgeiOS &&
          x.indexOf(elem) != -1 &&
          !/,\s*pre-matching/i.test(x) &&
          /^REJECT(-[A-Z]+)*$/i.test(_rulepolicy)
        ) {
          if (
            /^(DOMAIN|DOMAIN|DOMAIN-SUFFIX|DOMAIN-KEYWORD|DOMAIN-SET|DOMAIN-WILDCARD|IP-CIDR|IP-CIDR6|GEOIP|IP-ASN|SUBNET|DEST-PORT|SRC-PORT|SRC-IP|RULE-SET)\s*?,/i.test(
              x
            )
          ) {
            x = x + ',pre-matching'
            break
          } else if (/^(AND|OR|NOT)\s*?,/i.test(x)) {
            // const pre_matching_regex = /\(\s*?(((?!(AND|NOT|OR))(\w|-))+?)\s*?,\s*?.+?\s*?((\)\s*?)+?,)/g
            // let not_matched = false
            // while ((matched = pre_matching_regex.exec(x))) {
            //   if (
            //     !/^(DOMAIN|DOMAIN|DOMAIN-SUFFIX|DOMAIN-KEYWORD|DOMAIN-SET|DOMAIN-WILDCARD|IP-CIDR|IP-CIDR6|GEOIP|IP-ASN|SUBNET|DEST-PORT|SRC-PORT|SRC-IP|RULE-SET)$/i.test(
            //       matched?.[1]
            //     )
            //   ) {
            //     not_matched = true
            //     break
            //   }
            // }
            // if (!not_matched) {
            //   x = x + ',pre-matching'
            //   break
            // }
            // x = modifyRule(x, 'surge', { preMatching: true })
            flags.preMatching = true
          }
        }
      } //循环结束
    } //启用 pre-matching 结束
    //ip规则不解析域名
    if (ipNoResolve == true) {
      if (/^(IP(-\w+)?|RULE-SET|GEOIP)/i.test(x) && !/,\s*?no-resolve/i.test(x)) {
        x = x + ',no-resolve'
      } else if (/^(AND|OR|NOT)\s*?,/i.test(x)) {
        // x = x.replace(
        //   /(\(\s*?(?:IP(?:-\w+)?|RULE-SET|GEOIP)\s*?,\s*?(?:(?!,\s*?no-resolve\s*?(?:,|\))).)+?\s*?)((\)\s*?)+?,)/g,
        //   '$1,no-resolve$2'
        // )
        // x = modifyRule(x, 'surge', { noResolve: true })
        flags.noResolve = true
      }
    } //增加ip规则不解析域名结束

    if (/^(AND|OR|NOT)\s*?,/i.test(x)) {
      x = modifyRule(x, 'surge', flags)
    }

    if (jsConverter != null) {
      jscStatus = isJsCon(x, jsConverter)
    }
    if (jsConverter2 != null) {
      jsc2Status = isJsCon(x, jsConverter2)
    }
    if (jsc2Status == true) {
      jscStatus = false
    }

    jsPre = ''
    jsSuf = ''
    if (jscStatus == true || jsc2Status == true) {
      jsPre = 'http://script.hub/convert/_start_/'
    }
    if (jscStatus == true) {
      jsSuf = `/_end_/_yuliu_.js?type=_js_from_-script&target=${app}-script`
    } else if (jsc2Status == true) {
      jsSuf = `/_end_/_yuliu_.js?type=_js_from_-script&target=${app}-script&wrap_response=true`
    }

    if (compatibilityOnly == true && (jscStatus == true || jsc2Status == true)) {
      jsSuf = jsSuf + '&compatibilityOnly=true'
    }
    if (prepend && (jscStatus == true || jsc2Status == true)) {
      jsSuf = jsSuf + `&prepend=${encodeURIComponent(prepend)}`
    }
    if (scEvJsori && (jscStatus == true || jsc2Status == true)) {
      jsSuf = jsSuf + `&evalScriptori=${encodeURIComponent(scEvJsori)}`
    }
    if (scEvJsmodi && (jscStatus == true || jsc2Status == true)) {
      jsSuf = jsSuf + `&evalScriptmodi=${encodeURIComponent(scEvJsmodi)}`
    }
    if (scEvUrlori && (jscStatus == true || jsc2Status == true)) {
      jsSuf = jsSuf + `&evalUrlori=${encodeURIComponent(scEvUrlori)}`
    }
    if (scEvUrlmodi && (jscStatus == true || jsc2Status == true)) {
      jsSuf = jsSuf + `&evalUrlmodi=${encodeURIComponent(scEvUrlmodi)}`
    }

    //模块信息
    if (/^#!.+?=\s*$/.test(x)) {
    } else if (isLooniOS && /^#!(?:select|input)\s*=\s*.+/.test(x)) {
      getInputInfo(x, modInputBox)
    } else if (/^#!.+?=.+/.test(x) && !/^#!(?:select|input|arguments)\s*=\s*.+/.test(x)) {
      getModInfo(x)
    }

    //#!arguments参数
    if (/^#!arguments\s*=\s*.+/.test(x) || /^[^#].+?=\s*(input|select|switch)\s*,/.test(x)) {
      parseArguments(x)
    }

    //hostname
    if (/^hostname\s*=.+/.test(x)) hnaddMethod = getHn(x, hnBox, hnaddMethod)

    if (hn2 == true && x.match(hn2name)) hnaddMethod = getHn(x, hnBox, hnaddMethod)

    if (/^force-http-engine-hosts\s*=.+/.test(x)) fheaddMethod = getHn(x, fheBox, fheaddMethod)

    if (/^skip-proxy\s*=.+/.test(x)) skipaddMethod = getHn(x, skipBox, skipaddMethod)

    if (/^(?:always-)?real-ip\s*=.+/.test(x)) realaddMethod = getHn(x, realBox, realaddMethod)

    //reject 解析
    if (
      /.+reject(?:-\w+)?$/i.test(x) &&
      !/^#?(DOMAIN.*?\s*,|IP-CIDR6?\s*,|IP-ASN\s*,|OR\s*,|AND\s*,|NOT\s*,|USER-AGENT\s*,|URL-REGEX\s*,|RULE-SET\s*,|DE?ST-PORT\s*,|PROTOCOL\s*,)/i.test(
        x
      ) &&
      !/^#!/.test(x)
    ) {
      mark = getMark(y, body)
      rw_reject(x, mark)
    }

    //重定向 解析
    if (/(?:\s(?:302|307|header)(?:$|\s)|url\s+30(?:2|7)\s)/.test(x)) {
      mark = getMark(y, body)
      rw_redirect(x, mark)
    }

    if (/\s((request|response)-body-json-jq)\s|\surl\sjsonjq-(response|request)-body/.test(_x)) {
      let [_, regex, type, value] = _x.match(
        /^(.*?)\s+?(?:url\s+?jsonjq-)?(request|response)-body(?:-json-jq)?\s+?(.*?)\s*$/
      )
      if (jqEnabled && (isSurgeiOS || isStashiOS || isShadowrocket)) {
        const jqPath = value.match(/jq-path="(.+?)"/)?.[1]
        if (jqPath) {
          if (/^https?:\/\//.test(jqPath)) {
            value = `'${(await http(jqPath, reqHeaders)).body.replace(/^\s*#.*$/gm, '').replace(/$\r?\n/gm, ' ')}'`
          } else {
            value = undefined
            const e = `暂不支持本地 JQ 文件:\n${x}`
            console.log(e)
            shNotify(e)
          }
        }
        if (value) {
          value = value.replace(/\s+\/\//g, '//')
          rwbodyBox.push({ type: `http-${type}-jq`, regex, value })
        }
      } else if (isLooniOS) {
        ;/body-json-jq/.test(_x) ? URLRewrite.push(_x) : URLRewrite.push(`${regex} ${type}-body-json-jq ${value}`)
      }
    }

    if (/\s((request|response)-body-(json-(add|del|replace)|replace-regex))\s/.test(x)) {
      let [_, regex, __, httpType, action, ___, suffix] = x.match(
        /^(.*?)\s+?((request|response)-body-(json-(add|del|replace)|replace-regex))\s+?(.*?)\s*$/
      )
      const suffixArray = suffix.split(/\s+/)
      let newSuffixArray = []
      if (action === 'json-del') {
        if (suffix) {
          newSuffixArray = suffixArray.map(item => {
            return parseLoonKey(item)
          })
        }
      } else {
        for (let index = 0; index < suffixArray.length; index += 2) {
          const key = suffixArray[index]
          let value = suffixArray[index + 1]

          if (value != null) {
            newSuffixArray.push([
              parseLoonKey(key),
              ['json-add', 'json-replace'].includes(action) ? parseLoonValue(value) : parseLoonKey(value),
            ])
          }
        }
      }
      const jsurl = 'https://raw.githubusercontent.com/Script-Hub-Org/Script-Hub/main/scripts/body-rewrite.js'
      let jstype = `http-${httpType}`
      const jsptn = regex
      let args = [[action, newSuffixArray]]

      if (jqEnabled && (isSurgeiOS || isStashiOS || isShadowrocket)) {
        if (action === 'json-add') {
          newSuffixArray.forEach(item => {
            const paths = parseJsonPath(item[0])
            rwbodyBox.push({
              type: `${jstype}-jq`,
              regex: jsptn,
              value: `'setpath(${JSON.stringify(paths)}; ${JSON.stringify(item[1])})'`,
            })
          })
        } else if (action === 'json-del') {
          newSuffixArray.forEach(item => {
            const paths = parseJsonPath(item)
            rwbodyBox.push({ type: `${jstype}-jq`, regex: jsptn, value: `'delpaths([${JSON.stringify(paths)}])'` })
          })
        } else if (action === 'json-replace') {
          newSuffixArray.forEach(item => {
            const paths = parseJsonPath(item[0])
            const parant = [...paths]
            const last = parant.pop()
            rwbodyBox.push({
              type: `${jstype}-jq`,
              regex: jsptn,
              value: `'if (getpath(${JSON.stringify(parant)}) | has(${
                /^\d+$/.test(last) ? last : `"${last}"`
              })) then (setpath(${JSON.stringify(paths)}; ${JSON.stringify(item[1])})) else . end'`,
            })
          })
        } else {
          newSuffixArray = newSuffixArray.map(item => item.join(' '))
          rwbodyBox.push({ type: jstype, regex: jsptn, value: newSuffixArray.join(' ') })
        }
      } else if (jqEnabled && isLooniOS) {
        URLRewrite.push(x)
      } else {
        // console.log(JSON.stringify(args, null, 2))
        const index = jsBox.findIndex(i => i.jsurl === jsurl && i.jstype === jstype && i.jsptn === jsptn)
        if (index === -1) {
          jsBox.push({
            jsname: `body_rewrite_${y}`,
            jstype,
            jsptn,
            jsurl,
            rebody: true,
            size: -1,
            timeout: '30',
            jsarg: encodeURIComponent(JSON.stringify(args)),
            ori: x,
            num: y,
          })
        } else {
          let jsargs = JSON.parse(decodeURIComponent(jsBox[index].jsarg))
          jsBox[index].jsarg = encodeURIComponent(JSON.stringify([...jsargs, args[0]]))
        }
      }
    }

    //header rewrite 解析
    if (/\s(response-)?header-(?:del|add|replace|replace-regex)\s/.test(x)) {
      mark = getMark(y, body)
      noteK = isNoteK(x)
      x = x.replace(/^#/, '')
      if (fromType === 'loon-plugin') {
        let [_, __, prefix, isResponseHeaderRewrite, action, suffix] = x.match(
          /^((.*?\s)(response-)?(header-(?:del|add|replace|replace-regex)\s))\s*(.*?)\s*$/
        )
        prefix = `${isResponseHeaderRewrite ? 'http-response' : 'http-request'} ${prefix}${action}`
        const suffixArray = suffix.split(/\s+/)
        const newSuffixArray = []
        if (/\s(response-)?header-del\s/.test(prefix)) {
          for (let index = 0; index < suffixArray.length; index++) {
            const key = suffixArray[index]
            newSuffixArray.push(`'${parseLoonKey(key)}'`)
          }
        } else if (/\s(response-)?header-replace-regex\s/.test(prefix)) {
          for (let index = 0; index < suffixArray.length; index += 3) {
            const key = suffixArray[index]
            const value = `${`'${parseLoonKey(suffixArray[index + 1])}'`} ${`'${parseLoonKey(
              suffixArray[index + 2]
            )}'`}`
            if (value != null) {
              newSuffixArray.push(`'${parseLoonKey(key)}' ${value}`)
            }
          }
        } else {
          for (let index = 0; index < suffixArray.length; index += 2) {
            const key = suffixArray[index]
            const value = suffixArray[index + 1]
            if (value != null) {
              newSuffixArray.push(`'${parseLoonKey(key)}' '${parseLoonKey(value)}'`)
            }
          }
        }
        // console.log({ mark, noteK, x })
        for (let index = 0; index < newSuffixArray.length; index++) {
          let i = newSuffixArray[index]
          rwhdBox.push({ mark, noteK, x: `${prefix}${i}` })
        }
      } else {
        rwhdBox.push({ mark, noteK, x })
      }
    }

    //(request|response)-(header|body) 解析
    if (/\surl\s+(?:request|response)-(?:header|body)\s/i.test(x)) {
      mark = getMark(y, body)
      getQxReInfo(x, y, mark)
    }

    //rule解析
    if (
      /^(#|\/\/|;)?\s*?(domain|domain-suffix|domain-keyword|domain-set|domain-wildcard|ip-cidr|ip-cidr6|geoip|ip-asn|rule-set|url-regex|user-agent|process-name|subnet|dest-port|dst-port|in-port|src-port|src-ip|protocol|network|script|hostname-type|cellular-radio|device-name|domain-regex|geosite|ip-suffix|src-geoip|src-ip-asn|src-ip-cidr|src-ip-suffix|in-type|in-user|in-name|process-path|process-path-regex|process-name-regex|uid|dscp|sub-rule|match|and|or|not)\s*?,.+/i.test(
        x
      )
    ) {
      mark = getMark(y, body)
      noteK = isNoteK(x)
      ruletype = x.split(/\s*,\s*/)[0].replace(/^#/, '')
      rulenore = /,\s*no-resolve/.test(x) ? ',no-resolve' : ''
      rulesni = /,\s*extended-matching/.test(x) ? ',extended-matching' : ''
      rulepm = /,\s*pre-matching/.test(x) ? ',pre-matching' : ''
      rulePandV = x
        .replace(/^#/, '')
        .replace(ruletype, '')
        .replace(/\s*,\s*no-resolve/, '')
        .replace(/\s*,\s*extended-matching/, '')
        .replace(/\s*,\s*pre-matching/, '')
        .replace(/^\s*,\s*/, '')
      rulepolicy = getPolicy(rulePandV)
      rulevalue = rulePandV
        .replace(rulepolicy, '')
        .replace(/\s*,\s*$/, '')
        .replace(/"/g, '')

      if (nPolicy != null && !policyRegex.test(rulepolicy)) {
        rulepolicy = nPolicy
        modistatus = 'yes'
      } else {
        modistatus = 'no'
      }
      ruleBox.push({ mark, noteK, ruletype, rulevalue, rulepolicy, rulenore, rulesni, rulepm, ori: x, modistatus })
    } //rule解析结束

    //host解析
    if (
      /^#?(?:\*|localhost|[-*?0-9a-z]+\.[-*.?0-9a-z]+)\s*=\s*(?:sever\s*:\s*|script\s*:\s*)?[\s0-9a-z:/,.]+$/g.test(x)
    ) {
      noteK = isNoteK(x)
      mark = getMark(y, body)
      hostdomain = x.split(/\s*=\s*/)[0]
      hostvalue = x.split(/\s*=\s*/)[1]
      hostBox.push({ mark, noteK, hostdomain, hostvalue, ori: x })
    }

    //Panel信息
    if (/[=,]\s*script-name\s*=.+/.test(x)) {
      mark = getMark(y, body)
      noteK = isNoteK(x)
      panelname = x.split(/\s*=/)[0].replace(/^#/, '')
      title = getJsInfo(x, /[=,\s]\s*title\s*=\s*/)
      content = getJsInfo(x, /[=,\s]\s*content\s*=\s*/)
      style = getJsInfo(x, /[=,\s]\s*style\s*=\s*/)
      scriptname = getJsInfo(x, /[=,\s]\s*script-name\s*=\s*/)
      updatetime = getJsInfo(x, /[=,\s]\s*update-interval\s*=\s*/)
      panelBox.push({
        mark,
        noteK,
        panelname,
        title,
        content,
        style,
        scriptname,
        updatetime,
        ori: x,
        num: y,
      })
    } //Panel信息解析结束

    //脚本解析
    if (/script-path\s*=.+/.test(x)) {
      mark = getMark(y, body)
      noteK = isNoteK(x)
      jsurl = getJsInfo(x, /script-path\s*=\s*/)
      jsname = /[=,]\s*type\s*=\s*/.test(x)
        ? x.split(/\s*=/)[0].replace(/^#/, '')
        : /,\s*tag\s*=\s*/.test(x)
        ? getJsInfo(x, /,\s*tag\s*=\s*/)
        : jsurl.substring(jsurl.lastIndexOf('/') + 1, jsurl.lastIndexOf('.'))
      img = getJsInfo(x, /[,\s]\s*img-url\s*=\s*/)
      jsfrom = 'surge'
      jsurl = toJsc(jsurl, jscStatus, jsc2Status, jsfrom)
      jstype = /[=,]\s*type\s*=\s*/.test(x) ? getJsInfo(x, /[=,]\s*type\s*=\s*/) : x.split(/\s+/)[0].replace(/^#/, '')
      eventname = getJsInfo(x, /[=,\s]\s*event-name\s*=\s*/)
      size = getJsInfo(x, /[=,\s]\s*max-size\s*=\s*/)
      proto = getJsInfo(x, /[=,\s]\s*binary-body-mode\s*=\s*/)
      jsptn = /[=,]\s*pattern\s*=\s*/.test(x)
        ? getJsInfo(x, /[=,]\s*pattern\s*=\s*/).replace(/"/g, '')
        : x.split(/\s+/)[1]
      jsptn = /cron|event|network-changed|generic|dns|rule/i.test(jstype) ? '' : jsptn
      jsarg = getJsInfo(x, /[=,\s]\s*argument\s*=\s*/)
      rebody = getJsInfo(x, /[=,\s]\s*requires-body\s*=\s*/)
      wakesys = getJsInfo(x, /[=,\s]\s*wake-system\s*=\s*/)
      cronexp = /cronexpr?\s*=\s*/.test(x)
        ? getJsInfo(x, /[=,\s]\s*cronexpr?\s*=\s*/)
        : /cron\s+"/.test(x)
        ? x.split('"')[1]
        : /cron\s+[^\s]+?\s+/
        ? x.split(/\s/)[1]
        : ''
      ability = getJsInfo(x, /[=,\s]\s*ability\s*=\s*/)
      engine = getJsInfo(x, /[=,\s]\s*engine\s*=\s*/)
      jsenable = getJsInfo(x, /[=,\s]\s*enable\s*=\s*/)
      updatetime = getJsInfo(x, /[=,\s]\s*script-update-interval\s*=\s*/)
      timeout = getJsInfo(x, /[=,\s]\s*timeout\s*=\s*/)
      tilesicon = jstype == 'generic' && /icon=/.test(x) ? x.split('icon=')[1].split('&')[0] : ''
      tilescolor = jstype == 'generic' && /icon-color=/.test(x) ? x.split('icon-color=')[1].split('&')[0] : '#5d84f8'
      if (nCron != null && jstype != 'cron') {
        for (let i = 0; i < nCron.length; i++) {
          let elem = nCron[i].trim()
          if (x.indexOf(elem) != -1) {
            let jsname = jsurl.substring(jsurl.lastIndexOf('/') + 1, jsurl.lastIndexOf('.')) + '-cron'
            jsBox.push({
              mark,
              noteK,
              jsname,
              img,
              jstype: 'cron',
              jsptn: '',
              jsurl,
              updatetime,
              wakesys: '1',
              timeout: '120',
              jsarg: '',
              rebody: '',
              jsenable,
              ori: x,
              num: y,
            })
          }
        } //for
      }
      // 注释不加
      if (!/^(#|;|\/\/)\s*/.test(x)) {
        jsBox.push({
          mark,
          noteK,
          jsname,
          img,
          jstype,
          jsptn,
          jsurl,
          rebody,
          proto,
          size,
          ability,
          updatetime,
          timeout,
          jsarg,
          cronexp,
          wakesys,
          tilesicon,
          tilescolor,
          eventname,
          engine,
          jsenable,
          ori: x,
          num: y,
        })
      }
    } //脚本解析结束

    //qx脚本解析
    if (/\surl\s+script-/.test(x)) {
      x = x.replace(/\s{2,}/g, ' ')
      mark = getMark(y, body)
      noteK = isNoteK(x)
      jstype = x.match(' url script-response') ? 'http-response' : 'http-request'
      urlInNum = x.split(/\s/).indexOf('url')
      jsptn = x.split(/\s/)[urlInNum - 1].replace(/^#/, '')
      jsurl = x.split(/\s/)[urlInNum + 2]
      jsfrom = 'qx'
      jsname = jsurl.substring(jsurl.lastIndexOf('/') + 1, jsurl.lastIndexOf('.'))
      jsarg = ''
      proto = await isBinaryMode(jsurl, jsname)
      jsurl = toJsc(jsurl, jscStatus, jsc2Status, jsfrom)
      rebody = /\sscript[^\s]*(-body|-analyze)/.test(x) ? 'true' : ''
      size = rebody == 'true' ? '-1' : ''

      if (nCron != null) {
        for (let i = 0; i < nCron.length; i++) {
          let elem = nCron[i].trim()
          if (x.indexOf(elem) != -1) {
            let jsname = jsurl.substring(jsurl.lastIndexOf('/') + 1, jsurl.lastIndexOf('.')) + '-cron'
            jsBox.push({
              mark,
              noteK,
              jsname,
              jstype: 'cron',
              jsptn: '',
              jsurl,
              wakesys: '1',
              timeout: '120',
              jsarg: '',
              rebody: '',
              ori: x,
              num: y,
            })
          }
        } //for
      }

      jsBox.push({
        mark,
        noteK,
        jsname,
        jstype,
        jsptn,
        jsurl,
        rebody,
        proto,
        size,
        timeout: '60',
        jsarg,
        ori: x,
        num: y,
      })
    } //qx脚本解析结束

    //qx cron脚本解析
    if (
      /^(?!^(?:#!arguments-desc\s*=|#!desc\s*=))[^\s]+\s+[^u\s]+\s+[^\s]+\s+[^\s]+\s+[^\s]+\s+([^\s]+\s+)?(https?|ftp|file):\/\//.test(
        x
      )
    ) {
      mark = getMark(y, body)
      noteK = isNoteK(x)
      cronexp = x
        .replace(/\s{2,}/g, ' ')
        .split(/\s(https?|ftp|file)/)[0]
        .replace(/^#/, '')
      jsurl = x
        .replace(/^#/, '')
        .replace(/\x20{2,}/g, ' ')
        .replace(cronexp, '')
        .split(/\s*,\s*/)[0]
        .trim()
      jsname = /,\s*tag\s*=/.test(x)
        ? getJsInfo(x, /[,\s]\s*tag\s*=\s*/, jsRegex)
        : jsurl.substring(jsurl.lastIndexOf('/') + 1, jsurl.lastIndexOf('.'))
      img = getJsInfo(x, /[,\s]\s*img-url\s*=\s*/, jsRegex)
      jsfrom = 'qx'
      jsurl = toJsc(jsurl, jscStatus, jsc2Status, jsfrom)
      jsBox.push({
        mark,
        noteK,
        jsname,
        img,
        jstype: 'cron',
        jsptn: '',
        cronexp,
        jsurl,
        jsarg: '',
        wakesys: '1',
        timeout: '120',
        rebody: '',
        ori: x,
        num: y,
      })
    } //qx cron 脚本解析结束

    //mock 解析
    if (/url\s+echo-response\s|\sdata\s*=\s*"|\sdata-type\s*=/.test(x)) {
      mark = getMark(y, body)
      getMockInfo(x, mark, y)
    }
  } //for await循环结束
  //console.log($.toStr(jsBox))
  //去重
  let obj = {}

  inBox = [...new Set(inBox)]

  outBox = [...new Set(outBox)]

  hnBox = [...new Set(hnBox)]

  fheBox = [...new Set(fheBox)]

  skipBox = [...new Set(skipBox)]

  realBox = [...new Set(realBox)]

  ruleBox = [...new Set(ruleBox)]

  modInputBox = modInputBox.reduce((curr, next) => {
    /*判断对象中是否已经有该属性  没有的话 push 到 curr数组*/
    obj[next.a + next.b] ? '' : (obj[next.a + next.b] = curr.push(next))
    return curr
  }, [])

  hostBox = hostBox.reduce((curr, next) => {
    /*判断对象中是否已经有该属性  没有的话 push 到 curr数组*/
    obj[next.hostdomain] ? '' : (obj[next.hostdomain] = curr.push(next))
    return curr
  }, [])

  rwBox = rwBox.reduce((curr, next) => {
    /*判断对象中是否已经有该属性  没有的话 push 到 curr数组*/
    obj[next.rwptn] ? '' : (obj[next.rwptn] = curr.push(next))
    return curr
  }, [])

  // BodyRewrite 需不要去重 会顺序执行
  rwbodyBox = [...new Set(rwbodyBox)]

  panelBox = panelBox.reduce((curr, next) => {
    /*判断对象中是否已经有该属性  没有的话 push 到 curr数组*/
    obj[next.scriptname] ? '' : (obj[next.scriptname] = curr.push(next))
    return curr
  }, [])

  jsBox = jsBox.reduce((curr, next) => {
    /*判断对象中是否已经有该属性  没有的话 push 到 curr数组*/
    obj[next.jstype + next.jsptn + next.jsurl + next.jsarg + next.rebody]
      ? ''
      : (obj[next.jstype + next.jsptn + next.jsurl + next.jsarg + next.rebody] = curr.push(next))
    return curr
  }, [])

  mockBox = mockBox.reduce((curr, next) => {
    /*判断对象中是否已经有该属性  没有的话 push 到 curr数组*/
    obj[next.mockptn] ? '' : (obj[next.mockptn] = curr.push(next))
    return curr
  }, []) //去重结束

  //$.log($.toStr(hnBox))

  inBox = (inBox[0] || '') && `已根据关键词保留以下内容:\n${inBox.join('\n\n')}`
  outBox = (outBox[0] || '') && `已根据关键词排除以下内容:\n${outBox.join('\n')}`

  shNotify(inBox)
  shNotify(outBox)

  //mitm删除主机名
  if (hnDel != null && hnBox.length > 0) hnBox = hnBox.filter(item => hnDel.indexOf(item) == -1)

  //mitm正则删除主机名
  if (hnRegDel != null) {
    hndelBox = hnBox.filter(item => hnRegDel.test(item))
    hnBox = hnBox.filter(item => !hnRegDel.test(item))
  }
  hndelBox.length > 0 && noNtf == false && $.msg(JS_NAME, notifyName + ' 已根据正则剔除主机名', `${hndelBox}`)

  hnBox = pieceHn(hnBox)
  fheBox = pieceHn(fheBox)
  skipBox = pieceHn(skipBox)
  realBox = pieceHn(realBox)
  if (synMitm) fheBox = hnBox

  if ((isSurgeiOS || isShadowrocket) && sgArg.length > 0) {
    let sgargArr = []
    for (let i = 0; i < sgArg.length; i++) {
      let key = sgArg[i].key
      let value = sgArg[i].value.split(',')[0].trim()
      let a = key + ':' + value
      sgargArr.push(a)
    }
    modInfoObj['arguments'] = (sgargArr[0] || '') && `${sgargArr.join(',')}`
  }

  //模块信息输出
  switch (targetApp) {
    case 'surge-module':
    case 'shadowrocket-module':
    case 'loon-plugin':
    case 'stash-stoverride':
      modInfoObj['name'] = nName == null ? modInfoObj['name'] : name
      modInfoObj['desc'] = nName == null ? modInfoObj['desc'] : desc
      modInfoObj['category'] = category == null ? modInfoObj['category'] : category
      if (icon == null) {
        modInfoObj['icon'] = iconReplace == '禁用' ? modInfoObj['icon'] : randomicon
      } else {
        modInfoObj['icon'] = /\//.test(icon) ? icon : await getIcon(icon)
      }

      for (let key in modInfoObj) {
        if (modInfoObj[key]) {
          let value = modInfoObj[key],
            delsystem = false
          if (key == 'system' && isSurgeiOS) {
            value = value.toLowerCase()
            value = value.includes('mac') ? (value.includes('ios') ? ((delsystem = true), 'mac') : 'mac') : 'ios'
          } else if (isLooniOS && key == 'category') {
            key = 'tag'
          } else if (!isLooniOS && key == 'keyword') {
            key = 'category'
          }
          let info = !isStashiOS ? '#!' + key + '=' + value : key + ': |-\n  ' + value
          !delsystem && modInfo.push(info)
        }
      }

      for (let i = 0; i < modInputBox.length; i++) {
        let info = '#!' + modInputBox[i].a + modInputBox[i].b
        modInfo.push(info)
      } //for
      break
  } //模块信息输出结束

  //surge模块参数转[Argument]输出
  if (isLooniOS && sgArg.length > 0) {
    for (let i = 0; i < sgArg.length; i++) {
      let key = sgArg[i].key
      let type = sgArg[i].type
      let value = sgArg[i].value
      if (type == 'switch') value = /^true/.test(value) ? '"true","false"' : '"false","true"'
      let tag = sgArg[i].tag
      loonArg.push(key + '=' + type + ',' + value + ',' + tag)
    }
  }

  //rule输出 switch不适合
  for (let i = 0; i < ruleBox.length; i++) {
    noteK = ruleBox[i].noteK ? '#' : ''
    mark = ruleBox[i].mark ? ruleBox[i].mark : ''
    if (noteK != '#' && isStashiOS) {
      noteKn8 = '\n        '
      noteKn6 = '\n      '
      noteKn4 = '\n    '
      noteK4 = '    '
      noteK2 = '  '
    } else {
      noteKn8 = '\n#        '
      noteKn6 = '\n#      '
      noteKn4 = '\n#    '
      noteK4 = '#    '
      noteK2 = '#  '
    }
    ruletype = ruleBox[i].ruletype.toUpperCase()
    rulevalue = ruleBox[i].rulevalue ? ruleBox[i].rulevalue : ''
    rulepolicy = ruleBox[i].rulepolicy ? ruleBox[i].rulepolicy : ''
    rulepolicy =
      policyRegex.test(rulepolicy) && !/\{\{\{[^,]+\}\}\}/.test(rulepolicy) ? rulepolicy.toUpperCase() : rulepolicy
    rulenore = ruleBox[i].rulenore ? ruleBox[i].rulenore : ''
    rulesni = ruleBox[i].rulesni ? ruleBox[i].rulesni : ''
    rulesni = isLooniOS || isStashiOS ? '' : rulesni

    modistatus = ruleBox[i].modistatus
    ori = ruleBox[i].ori
    if (/de?st-port/i.test(ruletype)) {
      ruletype = isSurgeiOS || isLooniOS ? 'DEST-PORT' : 'DST-PORT'
    }
    if (/reject-video/i.test(rulepolicy) && !isLooniOS) {
      rulepolicy = 'REJECT-TINYGIF'
    }
    if (/reject-tinygif/i.test(rulepolicy) && isLooniOS) {
      rulepolicy = 'REJECT-IMG'
    }
    if (/reject-(?:dict|array|img)/i.test(rulepolicy) && isSurgeiOS) {
      rulepolicy = 'REJECT-TINYGIF'
    }
    if (/reject-/i.test(rulepolicy) && !/url-regex/i.test(ruletype) && isStashiOS) {
      rulepolicy = 'REJECT'
    }
    if (/reject-[^-]+-no-drop/i.test(rulepolicy) && !isLooniOS) {
      rulepolicy = rulepolicy.replace(/-no-drop/i, '')
    }
    rulepm = ruleBox[i].rulepm ? ruleBox[i].rulepm : ''
    rulepm = isLooniOS || isStashiOS ? '' : rulepm
    if (
      !/^(DOMAIN|DOMAIN-SUFFIX|DOMAIN-KEYWORD|DOMAIN-SET|DOMAIN-WILDCARD|IP-CIDR|IP-CIDR6|GEOIP|IP-ASN|SUBNET|DEST-PORT|SRC-PORT|SRC-IP|RULE-SET)$/i.test(
        ruletype
      ) ||
      !isSurgeiOS ||
      !/^REJECT(-\w+)?/i.test(rulepolicy)
    ) {
      rulepm = ''
    }
    if (rulepolicy == '') {
      notBuildInPolicy.push(ori)
    } else if (/^proxy$/i.test(rulepolicy) && modistatus == 'no' && (isSurgeiOS || isStashiOS)) {
      notBuildInPolicy.push(ori)
    } else if (!policyRegex.test(rulepolicy) && !/^proxy$/i.test(rulepolicy) && modistatus == 'no') {
      notBuildInPolicy.push(ori)
    } else if (/^in-port|domain-wildcard$/i.test(ruletype) && isSurgeiOS) {
      rules.push(mark + noteK + ruletype + ',' + rulevalue + ',' + rulepolicy + rulenore + rulesni + rulepm)
    } else if (/^protocol$/i.test(ruletype) && (isLooniOS || isSurgeiOS)) {
      rules.push(mark + noteK + ruletype + ',' + rulevalue + ',' + rulepolicy + rulenore)
    } else if (/^(?:domain-set|rule-set)$/i.test(ruletype) && (isSurgeiOS || isShadowrocket)) {
      rules.push(mark + noteK + ruletype + ',' + rulevalue + ',' + rulepolicy + rulenore + rulesni + rulepm)
    } else if (
      /^(?:domain(-suffix|-keyword)?|ip(-asn|-cidr6?)|geoip|user-agent|url-regex|de?st-port)$/i.test(ruletype) &&
      !isStashiOS
    ) {
      rulevalue = /,/.test(rulevalue) && !/[()]/.test(rulevalue) ? '"' + rulevalue + '"' : rulevalue
      if (/^(url-regex|user-agent)$/i.test(ruletype) && !/^['"].*['"]$/.test(rulevalue)) {
        rulevalue = `"${rulevalue}"`
      }
      rules.push(mark + noteK + ruletype + ',' + rulevalue + ',' + rulepolicy + rulenore + rulesni + rulepm)
    } else if (/^(?:and|or|not)$/i.test(ruletype) && !isStashiOS) {
      rules.push(ori)
    } else if (/^(?:and|or|not)$/i.test(ruletype) && isStashiOS) {
      rules.push(mark + noteK2 + '- ' + ori)
    } else if (/(?:^domain$|domain-suffix|domain-keyword|ip-|de?st-port)/i.test(ruletype) && isStashiOS) {
      rules.push(mark + noteK2 + '- ' + ruletype + ',' + rulevalue + ',' + rulepolicy + rulenore)
    } else if (/src-port/i.test(ruletype) && (isSurgeiOS || isLooniOS)) {
      rules.push(mark + noteK + ruletype + ',' + rulevalue + ',' + rulepolicy + rulepm)
    } else if (
      /src-ip|subnet|protocol|network|script|hostname-type|cellular-radio|device-name/i.test(ruletype) &&
      isSurgeiOS
    ) {
      rules.push(mark + noteK + ruletype + ',' + rulevalue + ',' + rulepolicy + rulepm)
    } else if (/url-regex/i.test(ruletype) && isStashiOS && /reject/i.test(rulepolicy)) {
      let Urx2Reject
      if (/DICT/i.test(rulepolicy)) {
        Urx2Reject = '-dict'
      } else if (/ARRAY/i.test(rulepolicy)) {
        Urx2Reject = '-array'
      } else if (/DROP|video/i.test(rulepolicy)) {
        Urx2Reject = '-200'
      } else if (/IMG$|TINYGIF$/i.test(rulepolicy)) {
        Urx2Reject = '-img'
      } else if (/REJECT$/i.test(rulepolicy)) {
        Urx2Reject = ''
      }

      URLRewrite.push(mark + noteK4 + '- >-' + noteKn6 + rulevalue + ' - reject' + Urx2Reject)
    } else {
      otherRule.push(ori)
    }
  } //for rule输出结束

  //reject redirect输出
  for (let i = 0; i < rwBox.length; i++) {
    noteK = rwBox[i].noteK ? '#' : ''
    mark = rwBox[i].mark ? rwBox[i].mark : ''
    rwtype = rwBox[i].rwtype
    rwptn = rwBox[i].rwptn
    rwvalue = rwBox[i].rwvalue

    switch (targetApp) {
      case 'loon-plugin':
      case 'shadowrocket-module':
        rwtype =
          isShadowrocket && /-video/.test(rwtype)
            ? 'reject-img'
            : isLooniOS && /-tinygif/.test(rwtype)
            ? 'reject-img'
            : rwtype
        URLRewrite.push(mark + noteK + rwptn + ' ' + rwvalue + ' ' + rwtype)
        break

      case 'stash-stoverride':
        if (noteK != '#') {
          noteKn8 = '\n        '
          noteKn6 = '\n      '
          noteKn4 = '\n    '
          noteK4 = '    '
          noteK2 = '  '
        } else {
          noteKn8 = '\n#        '
          noteKn6 = '\n#      '
          noteKn4 = '\n#    '
          noteK4 = '#    '
          noteK2 = '#  '
        }
        URLRewrite.push(
          mark + noteK4 + '- >-' + noteKn6 + rwptn + ' ' + rwvalue + ' ' + rwtype.replace(/-video|-tinygif/, '-img')
        )
        break

      case 'surge-module':
        if (/(?:reject|302|307|header)$/.test(rwtype))
          URLRewrite.push(mark + noteK + rwptn + ' ' + rwvalue + ' ' + rwtype)
        if (/reject-dict/.test(rwtype))
          MapLocal.push(
            mark + noteK + rwptn + ' data-type=text data="{}" status-code=200 header="Content-Type:application/json"'
          )
        if (/reject-array/.test(rwtype))
          MapLocal.push(mark + noteK + rwptn + ' data-type=text data="[]" status-code=200')
        if (/reject-200/.test(rwtype)) MapLocal.push(mark + noteK + rwptn + ' data-type=text data=" " status-code=200')
        if (/reject-(?:img|tinygif|video)/.test(rwtype))
          MapLocal.push(mark + noteK + rwptn + ' data-type=tiny-gif status-code=200')
        break
    } //switch
  } //reject redirect输出for

  for (let i = 0; i < rwbodyBox.length; i++) {
    const { type, regex, value } = rwbodyBox[i]
    if (isSurgeiOS || isShadowrocket) {
      BodyRewrite.push(`${type} ${regex} ${value}`)
    } else if (isLooniOS) {
      let type2
      switch (type) {
        case 'http-request':
          type2 = 'request-body-replace-regex'
          break
        case 'http-response':
          type2 = 'response-body-replace-regex'
          break
        case 'http-request-jq':
          type2 = 'request-body-json-jq'
          break
        case 'http-response-jq':
          type2 = 'response-body-json-jq'
          break
      }
      URLRewrite.push(`${regex} ${type2} ${value}`)
    }
  }

  //headerRewrite输出
  for (let i = 0; i < rwhdBox.length; i++) {
    noteK = rwhdBox[i].noteK ? '#' : ''
    mark = rwhdBox[i].mark ? rwhdBox[i].mark : ''
    x = rwhdBox[i].x
    const isResponseHeaderRewrite = /^http-response\s/.test(x)
    switch (targetApp) {
      case 'surge-module':
      case 'shadowrocket-module':
        HeaderRewrite.push(mark + noteK + x)
        break

      case 'loon-plugin':
        x = x.replace(/^http-(request|response)\s+/, '')
        if (isResponseHeaderRewrite) {
          x = x.replace(/\sheader-/, ' response-header-')
        }
        URLRewrite.push(mark + noteK + x)
        break

      case 'stash-stoverride':
        if (noteK != '#') {
          noteKn8 = '\n        '
          noteKn6 = '\n      '
          noteKn4 = '\n    '
          noteK4 = '    '
          noteK2 = '  '
        } else {
          noteKn8 = '\n#        '
          noteKn6 = '\n#      '
          noteKn4 = '\n#    '
          noteK4 = '#    '
          noteK2 = '#  '
        }
        let hdtype = isResponseHeaderRewrite ? ' response-' : ' request-'
        x = x.replace(/^http-(?:request|response)\s+/, '').replace(/\s+header-/, hdtype)
        HeaderRewrite.push(mark + `${noteK4}- >-${noteKn6}` + x)
        break
    } //headerRewrite输出结束
  } //for

  //host输出
  for (let i = 0; i < hostBox.length; i++) {
    noteK = hostBox[i].noteK ? '#' : ''
    mark = hostBox[i].mark ? hostBox[i].mark : ''
    hostdomain = hostBox[i].hostdomain
    hostvalue = hostBox[i].hostvalue
    ori = hostBox[i].ori
    if (isStashiOS) {
      otherRule.push(ori)
    } else if (isLooniOS && /script\s*:\s*/.test(hostvalue)) {
      otherRule.push(ori)
    } else if (isSurgeiOS || isShadowrocket || isLooniOS) {
      host.push(mark + noteK + hostdomain + ' = ' + hostvalue)
    }
  } //for

  //Mock输出
  for (let i = 0; i < mockBox.length; i++) {
    noteK = mockBox[i].noteK ? '#' : ''
    mark = mockBox[i].mark ? mockBox[i].mark : ''
    mockptn = mockBox[i].mockptn
    mocktype = mockBox[i].mocktype ? ' data-type=' + mockBox[i].mocktype : ''
    mockurl = mockBox[i].mockurl
      ? ' data="' + mockBox[i].mockurl + '"'
      : mocktype == ' data-type=text'
      ? ' data=""'
      : ''
    mockstatus = mockBox[i].mockstatus ? ' status-code=' + mockBox[i].mockstatus : ''

    switch (targetApp) {
      case 'surge-module':
        mockheader =
          mockBox[i].mockheader && !/&contentType=/.test(mockBox[i].mockheader)
            ? ' header="' + mockBox[i].mockheader + '"'
            : ''
        MapLocal.push(mark + noteK + mockptn + mocktype + mockurl + mockstatus + mockheader)
        break

      case 'shadowrocket-module':
        mockheader =
          mockBox[i].mockheader && !/&contentType=/.test(mockBox[i].mockheader)
            ? ' header="' + mockBox[i].mockheader + '"'
            : ''
        MapLocal.push(mark + noteK + mockptn + mocktype + mockurl + mockheader)
        break

      case 'loon-plugin':
        URLRewrite.push(
          mark +
            noteK +
            mockptn +
            ' mock-response-body' +
            mocktype +
            (mockBox[i].datapath
              ? ` data-path=${mockBox[i].datapath}`
              : mockBox[i].data
              ? ` data="${mockBox[i].data}"`
              : mockBox[i].mockurl
              ? ` data-path=${mockBox[i].mockurl}`
              : '') +
            mockstatus +
            (mockBox[i].mockbase64 ? ' mock-data-is-base64=true' : '')
        )
        break
    } //switch
  } //Mock输出for

  //Panel输出
  if (isSurgeiOS && panelBox.length > 0) {
    for (let i = 0; i < panelBox.length; i++) {
      noteK = panelBox[i].noteK ? '#' : ''
      mark = panelBox[i].mark ? panelBox[i].mark : ''
      panelname = panelBox[i].panelname
      title = panelBox[i].title ? ', title=' + panelBox[i].title : ''
      content = panelBox[i].content ? ', content=' + panelBox[i].content : ''
      style = panelBox[i].style ? ',style=' + panelBox[i].style : ''
      scriptname = panelBox[i].scriptname
      updatetime = panelBox[i].updatetime ? ', update-interval=' + panelBox[i].updatetime : ''
      ori = panelBox[i].ori
      scriptname = reJsValue(njsnametarget || 'null', njsname, scriptname, ori, scriptname)
      Panel.push(mark + noteK + panelname + ' = ' + 'script-name=' + scriptname + title + content + style + updatetime)
    } //for
  } //panel输出结束

  //脚本输出
  if (!isStashiOS && jsBox.length > 0) {
    for (let i = 0; i < jsBox.length; i++) {
      noteK = jsBox[i].noteK ? '#' : ''
      mark = jsBox[i].mark ? jsBox[i].mark : ''
      jstype = jsBox[i].jstype
      jsptn = /generic|event|dns|rule|network-changed/.test(jstype) ? '' : jsBox[i].jsptn
      jsptn = isLooniOS && jsptn ? ' ' + jsptn : jsptn
      if (/,/.test(jsptn) && isSurgeiOS) jsptn = '"' + jsptn + '"'
      if ((isSurgeiOS || isShadowrocket) && jsptn != '') jsptn = ', pattern=' + jsptn
      jsname = jsBox[i].jsname
      img = jsBox[i].img ? ', img-url=' + jsBox[i].img : ''
      eventname = jsBox[i].eventname ? ', event-name=' + jsBox[i].eventname : ', event-name=network-changed'
      jstype =
        isLooniOS && /event/.test(jstype)
          ? 'network-changed'
          : !isLooniOS && /network-changed/.test(jstype)
          ? 'event'
          : jstype
      jsurl = jsBox[i].jsurl
      rebody = jsBox[i].rebody ? istrue(jsBox[i].rebody) : ''
      proto = jsBox[i].proto ? istrue(jsBox[i].proto) : ''
      engine = jsBox[i].engine ? jsBox[i].engine : ''
      jsenable = jsBox[i].jsenable ? jsBox[i].jsenable : ''
      size = jsBox[i].size ? jsBox[i].size : ''
      ability = jsBox[i].ability ? ', ability=' + jsBox[i].ability : ''
      updatetime = jsBox[i].updatetime ? ', script-update-interval=' + jsBox[i].updatetime : ''
      cronexp = jsBox[i].cronexp ? jsBox[i].cronexp.replace(/"/g, '') : null
      wakesys = jsBox[i].wakesys ? ', wake-system=' + jsBox[i].wakesys : ''
      timeout = jsBox[i].timeout ? jsBox[i].timeout : ''
      jsarg = jsBox[i].jsarg ? jsBox[i].jsarg : ''
      ori = jsBox[i].ori

      jsarg = reJsValue(nArgTarget || 'null', nArg, jsname, ori, jsarg)
        .replace(/t;amp;/g, '&')
        .replace(/t;add;/g, '+')

      cronexp = reJsValue(nCron || 'null', ncronexp, jsname, ori, cronexp)

      cronexp = /,/.test(cronexp) ? '"' + cronexp + '"' : cronexp

      jsname = reJsValue(njsnametarget || 'null', njsname, jsname, ori, jsname)

      timeout = reJsValue(timeoutt || 'null', timeoutv, jsname, ori, timeout)

      engine = reJsValue(enginet || 'null', enginev, jsname, ori, engine)

      switch (targetApp) {
        case 'surge-module':
        case 'shadowrocket-module':
        case 'loon-plugin':
          rebody = rebody ? ', requires-body=' + rebody : ''
          proto = proto ? ', binary-body-mode=' + proto : ''
          size = size ? ', max-size=' + size : ''
          timeout = timeout ? ', timeout=' + timeout : ''
          engine = engine && isSurgeiOS ? ', engine=' + engine : ''
          jsenable = jsenable && isLooniOS ? ', enable=' + jsenable : ''
          if (jsarg != '' && /,/.test(jsarg) && !/^".+"$/.test(jsarg)) jsarg = ', argument="' + jsarg + '"'
          if (jsarg != '' && (!/,/.test(jsarg) || /^".+"$/.test(jsarg))) jsarg = ', argument=' + jsarg

          if (/generic/.test(jstype) && isShadowrocket) {
            otherRule.push(ori)
          } else if (/request|response|network-changed|generic/.test(jstype) && isLooniOS) {
            ;/[=,]\s*type\s*=\s*generic/.test(ori)
              ? otherRule.push(ori)
              : script.push(
                  mark +
                    noteK +
                    jstype +
                    jsptn +
                    ' script-path=' +
                    jsurl +
                    rebody +
                    proto +
                    timeout +
                    ', tag=' +
                    jsname +
                    jsenable +
                    img +
                    jsarg
                )
          } else if (/request|response|generic/.test(jstype) && (isSurgeiOS || isShadowrocket)) {
            ;/^generic\s/.test(ori)
              ? otherRule.push(ori)
              : script.push(
                  mark +
                    noteK +
                    jsname +
                    ' = type=' +
                    jstype +
                    jsptn +
                    ', script-path=' +
                    jsurl +
                    rebody +
                    proto +
                    engine +
                    size +
                    ability +
                    updatetime +
                    timeout +
                    jsarg
                )
          } else if (jstype == 'event' && (isSurgeiOS || isShadowrocket)) {
            script.push(
              mark +
                noteK +
                jsname +
                ' = type=' +
                jstype +
                eventname +
                ', script-path=' +
                jsurl +
                ability +
                engine +
                updatetime +
                timeout +
                jsarg
            )
          } else if (jstype == 'cron' && (isSurgeiOS || isShadowrocket)) {
            script.push(
              mark +
                noteK +
                jsname +
                ' = type=' +
                jstype +
                ', cronexp=' +
                cronexp +
                ', script-path=' +
                jsurl +
                updatetime +
                engine +
                timeout +
                wakesys +
                jsarg
            )
          } else if (jstype == 'cron' && isLooniOS) {
            script.push(
              mark +
                noteK +
                jstype +
                ' ' +
                `"${cronexp.replace(/"/g, '')}"` +
                ' script-path=' +
                jsurl +
                timeout +
                ', tag=' +
                jsname +
                jsenable +
                img +
                jsarg
            )
          } else if (/dns|rule/.test(jstype) && (isSurgeiOS || isShadowrocket)) {
            script.push(
              mark +
                noteK +
                jsname +
                ' = type=' +
                jstype +
                ', script-path=' +
                jsurl +
                updatetime +
                engine +
                timeout +
                jsarg
            )
          } else {
            otherRule.push(ori)
          }
          break
      } //switch
    } //脚本输出for
  } //不是Stash的脚本输出

  if (isStashiOS && jsBox.length > 0) {
    //处理脚本名字
    let urlMap = {}

    for (let i = 0; i < jsBox.length; i++) {
      let url = jsBox[i].jsurl
      jsBox[i].jsname = jsBox[i].jsname + '_' + jsBox[i].num

      if (urlMap[url]) {
        jsBox[i].jsname = urlMap[url]
      } else {
        urlMap[url] = jsBox[i].jsname
      }
    }

    for (let i = 0; i < jsBox.length; i++) {
      if (jsBox[i].noteK != '#') {
        noteKn8 = '\n        '
        noteKn6 = '\n      '
        noteKn4 = '\n    '
        noteK4 = '    '
        noteK2 = '  '
      } else {
        noteKn8 = '\n#        '
        noteKn6 = '\n#      '
        noteKn4 = '\n#    '
        noteK4 = '#    '
        noteK2 = '#  '
      }
      jstype = jsBox[i].jstype.replace(/http-/, '')
      mark = jsBox[i].mark ? jsBox[i].mark : ''
      jsptn = jsBox[i].jsptn
      jsname = jsBox[i].jsname
      jsurl = jsBox[i].jsurl
      rebody = jsBox[i].rebody ? noteKn6 + 'require-body: ' + istrue(jsBox[i].rebody) : ''
      proto = jsBox[i].proto ? noteKn6 + 'binary-mode: ' + istrue(jsBox[i].proto) : ''
      size = jsBox[i].size ? noteKn6 + 'max-size: ' + jsBox[i].size : ''
      cronexp = jsBox[i].cronexp ? jsBox[i].cronexp.replace(/"/g, '') : null
      timeout = jsBox[i].timeout ? jsBox[i].timeout : ''
      jsarg = jsBox[i].jsarg ? jsBox[i].jsarg.replace(/^"(.+)"$/, '$1') : ''
      tilesicon = jsBox[i].tilesicon ? jsBox[i].tilesicon : ''
      tilescolor = jsBox[i].tilescolor ? jsBox[i].tilescolor : ''
      ori = jsBox[i].ori

      tilescolor = reJsValue(nTilesTarget || 'null', ntilescolor, jsname, ori, tilescolor).replace(/@/g, '#')

      jsarg = reJsValue(nArgTarget || 'null', nArg, jsname, ori, jsarg)
        .replace(/t;amp;/g, '&')
        .replace(/t;add;/g, '+')

      cronexp = reJsValue(nCron || 'null', ncronexp, jsname, ori, cronexp)

      jsname = reJsValue(njsnametarget || 'null', njsname, jsname, ori, jsname)

      timeout = reJsValue(timeoutt || 'null', timeoutv, jsname, ori, timeout)

      engine = reJsValue(enginet || 'null', enginev, jsname, ori, engine)

      jsarg =
        jsarg && jstype == 'generic'
          ? noteKn4 + 'argument: |-' + noteKn6 + jsarg
          : jsarg && jstype != 'generic'
          ? noteKn6 + 'argument: |-' + noteKn8 + jsarg
          : ''

      timeout =
        timeout && jstype == 'generic'
          ? noteKn4 + 'timeout: ' + timeout
          : timeout && jstype != 'generic'
          ? noteKn6 + 'timeout: ' + timeout
          : ''

      if (/request|response/.test(jstype)) {
        script.push(
          mark +
            noteK4 +
            '- match: ' +
            jsptn +
            noteKn6 +
            'name: "' +
            jsname +
            '"' +
            noteKn6 +
            'type: ' +
            jstype +
            rebody +
            size +
            proto +
            timeout +
            jsarg
        )
        providers.push(`${noteK2}"` + jsname + '":' + `${noteKn4}url: ` + jsurl + `${noteKn4}interval: 86400`)
      }
      if (jstype == 'cron') {
        cron.push(mark + `${noteK4}- name: "` + jsname + `"${noteKn6}cron: ` + cronexp + `${timeout}` + jsarg)
        providers.push(`${noteK2}"` + jsname + '":' + `${noteKn4}url: ` + jsurl + `${noteKn4}interval: 86400`)
      }
      if (jstype == 'generic') {
        ;/^generic\s/.test(ori)
          ? otherRule.push(ori)
          : tiles.push(
              mark +
                `${noteK2}- name: "${jsname}"${noteKn4}interval: 3600${noteKn4}title: "${jsname}"${noteKn4}icon: "${tilesicon}"${noteKn4}backgroundColor: "${tilescolor}"${timeout}${jsarg}`
            )
        ;/^generic\s/.test(ori)
          ? ''
          : providers.push(`${noteK2}"${jsname}":${noteKn4}url: ${jsurl}${noteKn4}interval: 86400`)
      }
      ;/network-changed|event|rule|dns/i.test(jstype) && otherRule.push(ori)
    } //for循环
  } //是Stash的脚本输出

  //输出内容
  switch (targetApp) {
    case 'surge-module':
    case 'shadowrocket-module':
    case 'loon-plugin':
      modInfo = (modInfo[0] || '') && `${modInfo.join('\n')}`

      loonArg = (loonArg[0] || '') && `[Argument]\n${loonArg.join('\n')}`

      rules = (rules[0] || '') && `[Rule]\n${rules.join('\n')}`

      Panel = (Panel[0] || '') && `[Panel]\n${Panel.join('\n\n')}`

      URLRewrite = (URLRewrite[0] || '') && Rewrite + `\n${URLRewrite.join('\n')}`

      HeaderRewrite = (HeaderRewrite[0] || '') && `[Header Rewrite]\n${HeaderRewrite.join('\n')}`

      BodyRewrite = (BodyRewrite[0] || '') && `[Body Rewrite]\n${BodyRewrite.join('\n')}`

      MapLocal = (MapLocal[0] || '') && `[Map Local]\n${MapLocal.join('\n\n')}`

      host = (host[0] || '') && `[Host]\n${host.join('\n')}`

      script = (script[0] || '') && `[Script]\n${script.join('\n\n')}`

      if (isLooniOS) {
        MITM = hnBox.length > 0 ? `[MITM]\n${hn2name} = ` + hnBox : ''
        fheBox.length > 0 && General.push('force-http-engine-hosts = ' + fheBox)
        skipBox.length > 0 && General.push('skip-proxy = ' + skipBox)
        realBox.length > 0 && General.push('real-ip = ' + realBox)
        General = (General[0] || '') && `[General]\n${General.join('\n\n')}`
      }

      if (isSurgeiOS || isShadowrocket) {
        MITM = hnBox.length > 0 ? `[MITM]\n${hn2name} = ${hnaddMethod} ` + hnBox : ''
        fheBox.length > 0 && General.push(`force-http-engine-hosts = ${fheaddMethod} ` + fheBox)
        skipBox.length > 0 && General.push(`skip-proxy = ${skipaddMethod} ` + skipBox)
        realBox.length > 0 && General.push(`always-real-ip = ${realaddMethod} ` + realBox)
        General = (General[0] || '') && `[General]\n${General.join('\n\n')}`
      }

      body = `${modInfo}

${loonArg}

${General}

${rules}

${URLRewrite}

${HeaderRewrite}

${BodyRewrite}

${MapLocal}

${Panel}

${host}

${script}

${MITM}

`
      break

    case 'stash-stoverride':
      modInfo = (modInfo[0] || '') && `${modInfo.join('\n')}`

      tiles = (tiles[0] || '') && `tiles:\n${tiles.join('\n\n')}`

      MITM = hnBox.length > 0 ? '  mitm:\n    - "' + hnBox + '"' : ''

      force = fheBox.length > 0 ? '  force-http-engine:\n    - "' + fheBox + '"' : ''

      rules = (rules[0] || '') && `rules:\n${rules.join('\n')}`

      URLRewrite = (URLRewrite[0] || '') && `  url-rewrite:\n${URLRewrite.join('\n')}`

      HeaderRewrite = (HeaderRewrite[0] || '') && `  header-rewrite:\n${HeaderRewrite.join('\n')}`
      script = (script[0] || '') && `  script:\n${script.join('\n\n')}`

      let StashBodyRewrite = []
      for (let i = 0; i < rwbodyBox.length; i++) {
        const { type, regex, value } = rwbodyBox[i]
        StashBodyRewrite.push(
          `    - >-\n      ${regex} ${type.replace(/^http-/, '').replace(/^(request|response)$/, '$1-replace-regex')} ${
            value.replace(/^"(.+)"$/, '$1').replace(/^'(.+)'$/, '$1')
            //.split(' ')
            //.map(i => i.replace(/^"(.+)"$/, '$1').replace(/^'(.+)'$/, '$1'))
            //.join(' ')
          }`
        )
      }
      if (StashBodyRewrite.length > 0) {
        StashBodyRewrite = `  body-rewrite:\n${StashBodyRewrite.join('\n')}`
      }

      if (
        StashBodyRewrite.length > 0 ||
        URLRewrite.length > 0 ||
        script.length > 0 ||
        HeaderRewrite.length > 0 ||
        MITM.length > 0 ||
        force.length > 0
      ) {
        httpFrame = `http:

${force}

${MITM}

${HeaderRewrite}

${URLRewrite}

${StashBodyRewrite}

${script}
`
      }

      providers = [...new Set(providers)]

      cron = (cron[0] || '') && `cron:\n  script:\n${cron.join('\n')}`

      providers = (providers[0] || '') && `script-providers:\n${providers.join('\n')}`

      body = `${modInfo}

${rules}

${httpFrame}

${tiles}

${cron}

${providers}

`
      break
  } //输出内容结束
  body = body.replace(/\n{2,}/g, '\n\n')
  if (isStashiOS && sgArg.length > 0) {
    body = body.replaceAll('{{{', '{').replaceAll('}}}', '}')
    for (let i = 0; i < sgArg.length; i++) {
      let e = '{' + sgArg[i].key + '}'
      let r = sgArg[i].value.split(',')[0]
      body = body.replaceAll(e, r)
    } //for
  } else if (isSurgeiOS || isShadowrocket) {
    body = body.replaceAll('{{{', '{').replaceAll('}}}', '}')
    for (let i = 0; i < sgArg.length; i++) {
      let e = '{' + sgArg[i].key + '}'
      let r = '{{{' + sgArg[i].key + '}}}'
      body = body.replaceAll(e, r)
    } //for
  } else if (isLooniOS) {
    body = body.replaceAll('{{{', '{').replaceAll('}}}', '}')
  }

  eval(evJsmodi)
  eval(evUrlmodi)

  otherRule = (otherRule[0] || '') && `${app}不支持以下内容:\n${otherRule.join('\n')}`

  notBuildInPolicy =
    (notBuildInPolicy[0] || '') && `不是${app}内置策略且未指定策略的规则:\n${notBuildInPolicy.join('\n')}`

  shNotify(otherRule)
  shNotify(notBuildInPolicy)

  if (openMsgHtml) {
    result = {
      body: (JS_NAME + '\n\n' + inBox + '\n\n' + outBox + '\n\n' + otherRule + '\n\n' + notBuildInPolicy).replace(
        /\n{2,}/g,
        '\n\n'
      ),
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    }
    $.isQuanX() ? (result.status = 'HTTP/1.1 200') : (result.status = 200)
    done($.isQuanX() ? result : { response: result })
  } else {
    result = {
      body: body,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    }
    $.isQuanX() ? (result.status = 'HTTP/1.1 200') : (result.status = 200)
    done($.isQuanX() ? result : { response: result })
  }
})().catch(e => {
  noNtf == false ? $.msg(JS_NAME, `${notifyName}：${e}\n${url}`, '', 'https://t.me/zhetengsha_group') : $.log(e)

  result = {
    body: `${notifyName}：${e}\n\n\n\n\n\nScript Hub 重写转换: ❌  可自行翻译错误信息或复制错误信息后点击通知进行反馈
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

//判断是否被注释
function isNoteK(x) {
  return /^#/.test(x) ? '#' : ''
}

//获取当前内容的注释
function getMark(index, obj) {
  let mark = obj[index - 1]?.match(/^#(?!!)/) ? obj[index - 1] + '\n' : ''
  // let mark = ''

  // for (let i = index - 1; i >= 0; i--) {
  //   const line = obj[i].trim()

  //   if (/(^#(?!!)|^\s*$)/.test(line)) {
  //     mark = line + '\n' + mark
  //   } else {
  //     break
  //   }
  // }

  return mark
}

function getArgArr(str) {
  let arr = str.split('+')
  return arr.map(item => item.replace(/➕/g, '+'))
}

//loon的input select互动按钮解析
function getInputInfo(x, box) {
  x = x.replace(/\s*=\s*/, '=')
  ;/^#!.+=.+/.test(x) ? (a = x.replace(/^#!/, '').match(/.+?=/)[0]) : ''
  ;/^#!.+=.+/.test(x) ? (b = x.replace(/^#!/, '').replace(a, '')) : ''
  box.push({ a, b })
}

//名字简介解析
function getModInfo(x) {
  const regex = /^#!\s*([^\s]+?)\s*=\s*(.+)/
  let key = x.match(regex)[1] == 'keyword' ? 'category' : x.match(regex)[1]
  let value = x.match(regex)[2]
  modInfoObj[key] = value
  //console.log(key)
}

//获取可莉图标集
async function getIcon(icon) {
  let url = 'https://raw.githubusercontent.com/luestr/IconResource/main/KeLee_icon.json'
  let kicon = $.getjson('Parser_Kelee_icon')
  if (!kicon) {
    kicon = $.toObj((await http(url)).body)['icons']
    $.setjson(kicon, 'Parser_Kelee_icon')
  }
  for (let i = 0; i < kicon.length; i++) {
    if (kicon[i].name == icon) return kicon[i].url
  }
  kicon = $.toObj((await http(url)).body)['icons']
  $.setjson(kicon, 'Parser_Kelee_icon')
  for (let i = 0; i < kicon.length; i++) {
    if (kicon[i].name == icon) return kicon[i].url
  }
  return 'icon not found'
}

//reject
function rw_reject(x, mark) {
  let noteK = isNoteK(x)
  let rwptn = x
    .replace(/^#/, '')
    .split(/\s+/)[0]
    .replace(/^"(.+)"$/, '$1')
  let rwtype = x.match(/reject(-\w+)?$/i)[0].toLowerCase()

  rwBox.push({ mark, noteK, rwptn, rwvalue: '-', rwtype })
}

//重定向
function rw_redirect(x, mark) {
  let noteK = isNoteK(x)
  x = x.replace(/\s{2,}/g, ' ')
  let redirect_type = x.match(/\s302|\s307|\sheader\s|\sheader$/)[0].replace(/\s/g, '')
  let xArr = x.split(/\s/)
  let rw_typeInNum = xArr.indexOf(redirect_type)
  let rwptn, rwvalue, rwtype
  if (rw_typeInNum == '2' && xArr.length == 3) {
    rwptn = xArr[0].replace(/^#/, '').replace(/^"(.+)"$/, '$1')
    rwvalue = xArr[1]
    rwtype = xArr[2]
  }

  if (rw_typeInNum == '1' && xArr.length == 3) {
    rwptn = xArr[0].replace(/^#/, '').replace(/^"(.+)"$/, '$1')
    rwvalue = xArr[2]
    rwtype = xArr[1]
  }

  if (rw_typeInNum == '2' && xArr.length == 4) {
    rwptn = xArr[0].replace(/^#/, '').replace(/^"(.+)"$/, '$1')
    rwvalue = xArr[3]
    rwtype = xArr[2]
  }
  rwBox.push({ mark, noteK, rwptn, rwvalue, rwtype })
}

//script
function getJsInfo(x, regex, parserRegex) {
  parserRegex =
    typeof parserRegex != 'undefined'
      ? parserRegex
      : /script-name\s*=/.test(x)
      ? panelRegex
      : /script-path\s*=/.test(x)
      ? jsRegex
      : /\s(data-type|data|data-path)\s*=/.test(x)
      ? mockRegex
      : ''
  if (regex.test(x)) {
    return x.split(regex)[1].split(parserRegex)[0]
  } else {
    return ''
  }
}

function reJsValue(target, nvalue, jsname, ori, orivalue) {
  let q = orivalue
  if (target != 'null') {
    for (let i = 0; i < target.length; i++) {
      let elem = target[i].trim()
      if (jsname.indexOf(elem) != -1 || ori.indexOf(elem) != -1) {
        q = nvalue[i]
        return q
      }
    } //for
  }
  return q
} //reJsValue

function getQxReInfo(x, y, mark) {
  let noteK = isNoteK(x)
  let retype = /\surl\s+request-/i.test(x) ? 'request' : 'response'
  let jstype = 'http-' + retype
  let hdorbd = /\surl\s+re[^\s]+?-header\s/i.test(x) ? 'header' : 'body'
  let breakpoint = retype + '-' + hdorbd
  let jsptn = x.split(/\s+url\s+re/)[0].replace(/^#/, '')
  let jsname = /body/.test(hdorbd) ? 'replaceBody' : 'replaceHeader'
  let jsurl = /header/.test(hdorbd)
    ? 'https://raw.githubusercontent.com/Script-Hub-Org/Script-Hub/main/scripts/replace-header.js'
    : 'https://raw.githubusercontent.com/Script-Hub-Org/Script-Hub/main/scripts/replace-body.js'
  let rearg1 = x.split(breakpoint)[1].trim()
  let rearg2 = x.split(breakpoint)[2].trim()
  let jsarg = encodeURIComponent(rearg1 + '->' + rearg2)
  let rebody = /body/.test(hdorbd) ? 'true' : ''
  let size = /body/.test(hdorbd) ? '-1' : ''
  jsBox.push({ mark, noteK, jsname, jstype, jsptn, jsurl, rebody, size, timeout: '30', jsarg, ori: x, num: y })
}

function getHn(x, arr, addMethod) {
  let hnBox2 = x
    .replace(/\s|%.+%/g, '')
    .split('=')[1]
    .split(/,/)
  for (let i = 0; i < hnBox2.length; i++) {
    hnBox2[i].length > 0 && arr.push(hnBox2[i])
  } //for
  if (/%INSERT%/i.test(x)) return '%INSERT%'
  else return addMethod
}

function pieceHn(arr) {
  if (!isStashiOS && arr.length > 0) return arr.join(', ')
  else if (isStashiOS && arr.length > 0) return arr.join(`"\n    - "`)
  else return []
}

//查binary
async function isBinaryMode(url, name) {
  if (/proto/i.test(name)) {
    return 'true'
  } else if (/(?:tieba|youtube|bili|spotify|wyres|netease|DualSubs\.Subtitles\.Translate\.response)/i.test(url)) {
    if (binaryInfo.length > 0 && binaryInfo.some(item => item.url === url)) {
      for (let i = 0; i < binaryInfo.length; i++) {
        if (binaryInfo[i].url === url) {
          return binaryInfo[i].binarymode
          break
        }
      }
    } else {
      const res = (await http(url)).body
      if (res == undefined || res == null) {
        //$.log(JS_NAME);
        return ''
      } else if (res.includes('.bodyBytes')) {
        binaryInfo.push({ url, binarymode: 'true' })

        $.setjson(binaryInfo, 'Parser_binary_info')
        return 'true'
      } else {
        binaryInfo.push({ url, binarymode: '' })
        $.setjson(binaryInfo, 'Parser_binary_info')
        return ''
      }
    } //没有信息或者没有url的信息
  } else {
    return ''
  }
} //查binary

//获取mock参数
function getMockInfo(x, mark, y) {
  let noteK = isNoteK(x)
  let mockptn, mockurl, mockheader, mocktype, mockstatus, oritype, datapath, data, mockbase64
  if (/url\s+echo-response\s/.test(x)) {
    mockptn = x.split(/\s+url\s+/)[0]
    mockurl = x.split(/\s+echo-response\s+/)[2]
    mocktype = 'file'
    mockheader = '&contentType=' + encodeURIComponent(x.split(/\s+echo-response\s+/)[1])
    oritype = mocktype
  }

  if (/\sdata\s*=\s*"|\sdata-type=/.test(x)) {
    mockptn = x
      .split(/\s+/)[0]
      .replace(/^#/g, '')
      .replace(/^"(.+)"$/, '$1')
    datapath = getJsInfo(x, /\s+data-path\s*=\s*/).replace(/^"(.*)"$/, '$1')
    data = getJsInfo(x, /\s+data\s*=\s*/).replace(/^"(.*)"$/, '$1')
    mockurl = data || datapath
    mockbase64 = getJsInfo(x, /\s+mock-data-is-base64\s*=\s*/)
    mocktype = getJsInfo(x, /\s+data-type\s*=\s*/) || 'file'
    oritype = mocktype
    mockstatus = getJsInfo(x, /\s+status-code\s*=\s*/)
    mockheader = getJsInfo(x, /\s+header\s*=\s*/).replace(/^"(.+)"$/, '$1')
    if (/\smock-response-body\s/.test(x)) {
      // Loon data-type: body的类型，json,text,css,html,javascript,plain,png,gif,jpeg,tiff,svg,mp4,form-data 应该设置对应的 Content-Type
      switch (mocktype) {
        case 'json':
          mockheader = 'Content-Type:application/json'
          break
        case 'text':
          mockheader = 'Content-Type:text/plain'
          break
        case 'css':
          mockheader = 'Content-Type:text/css'
          break
        case 'html':
          mockheader = 'Content-Type:text/html'
          break
        case 'javascript':
          mockheader = 'Content-Type:text/javascript'
          break
        case 'plain':
          mockheader = 'Content-Type:text/plain'
          break
        case 'png':
          mockheader = 'Content-Type:image/png'
          break
        case 'gif':
          mockheader = 'Content-Type:image/gif'
          break
        case 'jpeg':
          mockheader = 'Content-Type:image/jpeg'
          break
        case 'tiff':
          mockheader = 'Content-Type:image/tiff'
          break
        case 'svg':
          mockheader = 'Content-Type:image/svg+xml'
          break
        case 'mp4':
          mockheader = 'Content-Type:video/mp4'
          break
        case 'form-data':
          mockheader = 'Content-Type:application/x-www-form-urlencoded'
          break
      }
      mocktype = datapath ? 'file' : 'text'
      if (mockbase64) {
        // Surge 的 base64 仅支持内容
        mocktype = 'base64'
      }
    } else if (/\smock-request-body\s/.test(x)) {
      if (targetApp === 'surge-module' || targetApp === 'shadowrocket-module') {
        const e = `暂不支持 Mock Request Body:\n${x}`
        console.log(e)
        shNotify(e)
        return
      }
    }
    if (oritype === 'base64') {
      mockbase64 = true
    }
  }
  switch (targetApp) {
    case 'surge-module':
    case 'shadowrocket-module':
      if (mockbase64 && datapath) {
        const e = `暂不支持远程 base64:\n${x}`
        console.log(e)
        shNotify(e)
        return
      } else {
        mockBox.push({ mark, noteK, mockptn, mockurl, mockheader, mockstatus, mocktype, ori: x, mocknum: y })
      }
      break
    case 'loon-plugin':
      mockBox.push({
        mark,
        noteK,
        mockptn,
        data,
        datapath,
        mockurl,
        mockstatus,
        mocktype: oritype,
        mockbase64,
        ori: x,
        mocknum: y,
      })
      break
    case 'stash-stoverride':
      let mfile = mocktype == 'file' ? mockurl.substring(mockurl.lastIndexOf('/') + 1) : mockurl
      let m2rType
      if (/dict|^\{\}$/i.test(mfile)) m2rType = 'reject-dict'
      else if (/array|^\[\]$/i.test(mfile)) m2rType = 'reject-array'
      else if (/200|blank|^[\s\S]?$/i.test(mfile)) m2rType = 'reject-200'
      else if (/img|tinygif/i.test(mfile) || mocktype == 'tiny-gif') m2rType = 'reject-img'
      else m2rType = null
      let jsname =
        mocktype == 'file' ? mockurl.substring(mockurl.lastIndexOf('/') + 1, mockurl.lastIndexOf('.')) : 'echoResponse'
      m2rType != null && rwBox.push({ mark, noteK, rwptn: mockptn, rwvalue: '-', rwtype: m2rType })

      let proto
      if (m2rType == null && mocktype == 'file') {
        proto = isStashiOS ? 'true' : ''
        mockheader =
          mockheader != '' && !/&contentType=/.test(mockheader)
            ? '&header=' + encodeURIComponent(mockheader)
            : mockheader != '' && /&contentType=/.test(mockheader)
            ? mockheader
            : ''
        if (keepHeader == false) mockheader = ''

        mockurl = `http://script.hub/convert/_start_/${mockurl}/_end_/${mfile}?type=mock&target-app=${targetApp}${mockheader}${sufkeepHeader}${sufjsDelivr}`
        jsBox.push({
          mark,
          noteK,
          jsname,
          jstype: 'http-request',
          jsptn: mockptn,
          jsurl: mockurl,
          proto,
          timeout: '60',
          ori: x,
          num: y,
        })
      } else if (m2rType == null && mocktype != 'file') {
        jsurl = 'https://raw.githubusercontent.com/Script-Hub-Org/Script-Hub/main/scripts/echo-response.js'
        mockstatus = mockstatus ? '&status-code=' + mockstatus : ''
        jsarg = `${mocktype}=` + encodeURIComponent(mockurl) + mockstatus
        jsBox.push({
          mark,
          noteK,
          jsname,
          jstype: 'http-request',
          jsptn: mockptn,
          jsurl,
          jsarg,
          timeout: '60',
          ori: x,
          num: y,
        })
      }
      break
  } //switch
} //获取Mock参数

function istrue(str) {
  if (str == true || str == 1 || str == 'true' || str == '1') {
    return true
  } else {
    return false
  }
}

function isJsCon(x, arr) {
  if (arr != null) {
    for (let i = 0; i < arr.length; i++) {
      const elem = arr[i].trim()
      if (x.indexOf(elem) != -1) {
        return true
      }
    } //循环结束
  } //if (arr != null)
} //isJsCon结束

function toJsc(jsurl, jscStatus, jsc2Status, jsfrom) {
  if (jscStatus == true || jsc2Status == true) {
    let jsFileName = jsurl.substring(jsurl.lastIndexOf('/') + 1, jsurl.lastIndexOf('.'))
    return (jsurl = jsPre + jsurl + jsSuf.replace(/_yuliu_/, jsFileName).replace(/_js_from_/, jsfrom))
  } else {
    return jsurl
  }
}

function shNotify(box) {
  noNtf == false &&
    box.length > 0 &&
    $.msg(JS_NAME, notifyName + ' 点击通知查看详情', box, { url: url + '&openMsgHtml=true' })
}

function getPolicy(str) {
  let commaNum = str.lastIndexOf(',')
  let bracesNum = str.lastIndexOf('}')
  let roundNum = str.lastIndexOf(')')
  if (/,\s*\{\{\{[^,]+\}\}\}$/.test(str)) {
    return str.match(/\{\{\{[^,]+\}\}\}$/)[0]
  } else if (commaNum > bracesNum && commaNum > roundNum) {
    return str.substring(str.lastIndexOf(',') + 1).trim()
  } else {
    return ''
  }
}

function parseArguments(str) {
  if (/#!arguments/.test(str)) {
    const queryString = str.split(/#!arguments\s*=\s*/)[1] //获取查询字符串部分
    const regex = /([^:,]+):(\s*".+?"|[^,]*)/g //匹配键值对的正则表达式
    let match

    while ((match = regex.exec(queryString))) {
      const key = match[1].trim().replace(/^"(.+)"$/, '$1') //去除头尾空白符和引号
      const value = match[2].trim().replace(/^"(.+)"$/, '$1') //去除头尾空白符和引号
      const type = /^(true|false)$/.test(value) ? 'switch' : 'input'
      const tag = `tag=${key}, desc=${key}`

      sgArg.push({ key, value, type, tag }) //将键值对添加到对象中

      if (value == 'hostname') {
        hn2 = true
        hn2name = '{{{' + key + '}}}'
      }
    }
  } else {
    const regex = /(^.*?)\s*=\s*(.*?)\s*,(.*?),\s*([^,]*\s*=.+)/ //获取信息
    const key = str.match(regex)[1]
    const type = str.match(regex)[2]
    const value = str.match(regex)[3]
    const tag = str.match(regex)[4]

    sgArg.push({ key, value, type, tag })

    if (value == 'hostname') {
      hn2 = true
      hn2name = '{{{' + key + '}}}'
    }
  }
}

function parseQueryString(url) {
  const queryString = url.split('?')[1] //获取查询字符串部分
  const regex = /([^=&]+)=([^&]*)/g //匹配键值对的正则表达式
  const params = {}
  let match

  while ((match = regex.exec(queryString))) {
    const key = decodeURIComponent(match[1]) //解码键
    const value = decodeURIComponent(match[2]) //解码值
    params[key] = value //将键值对添加到对象中
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
function parseJsonPath(_path) {
  const path = _path.trim()
  const output = []
  const regex = /\.?([^\.\[\]]+)|\[(['"])(.*?)\2\]|\[(\d+)\]/g
  let match

  while ((match = regex.exec(path)) !== null) {
    if (match[1] !== undefined) {
      // 匹配点符号或初始键
      output.push(match[1])
    } else if (match[3] !== undefined) {
      // 匹配带引号的括号表示法
      output.push(match[3])
    } else if (match[4] !== undefined) {
      // 数组索引，转换为整数
      output.push(parseInt(match[4], 10))
    }
  }
  return output
}

// 解析规则
function parseRule(input) {
  // 分析器
  class Tokenizer {
    constructor(input) {
      this.input = input
      this.position = 0
      this.tokens = []
    }

    isWhitespace(char) {
      return /\s/.test(char)
    }

    isDelimiter(char) {
      return ['(', ')', ','].includes(char)
    }

    tokenize() {
      // console.log('=== 开始词法分析 ===')
      while (this.position < this.input.length) {
        let currentChar = this.input[this.position]

        if (this.isWhitespace(currentChar)) {
          this.position++
          continue
        }

        if (currentChar === '(') {
          this.tokens.push({ type: 'LPAREN', value: '(' })
          // console.log(`Token: LPAREN '(' at position ${this.position}`)
          this.position++
          continue
        }

        if (currentChar === ')') {
          this.tokens.push({ type: 'RPAREN', value: ')' })
          // console.log(`Token: RPAREN ')' at position ${this.position}`)
          this.position++
          continue
        }

        if (currentChar === ',') {
          this.tokens.push({ type: 'COMMA', value: ',' })
          // console.log(`Token: COMMA ',' at position ${this.position}`)
          this.position++
          continue
        }

        // 收集单词
        let start = this.position
        while (
          this.position < this.input.length &&
          !this.isWhitespace(this.input[this.position]) &&
          !this.isDelimiter(this.input[this.position])
        ) {
          this.position++
        }
        let value = this.input.slice(start, this.position)
        this.tokens.push({ type: 'WORD', value })
        // console.log(`Token: WORD '${value}' from position ${start} to ${this.position}`)
      }
      // console.log('=== 词法分析完成 ===')
      return this.tokens
    }
  }

  // 语法分析器
  class Parser {
    constructor(tokens) {
      this.tokens = tokens
      this.position = 0

      // 定义逻辑运算符及其元数
      this.LOGICAL_OPERATORS = {
        AND: 'n',
        OR: 'n',
        NOT: 1,
      }

      // 定义值运算符
      this.VALUE_OPERATORS = [
        'DOMAIN',
        'DOMAIN-SUFFIX',
        'DOMAIN-KEYWORD',
        'DOMAIN-SET',
        'DOMAIN-WILDCARD',
        'IP-CIDR',
        'IP-CIDR6',
        'GEOIP',
        'IP-ASN',
        'RULE-SET',
        'URL-REGEX',
        'USER-AGENT',
        'PROCESS-NAME',
        'SUBNET',
        'DEST-PORT',
        'DST-PORT',
        'IN-PORT',
        'SRC-PORT',
        'SRC-IP',
        'PROTOCOL',
        'NETWORK',
        'SCRIPT',
        'CELLULAR-RADIO',
        'HOSTNAME-TYPE',
        'DEVICE-NAME',
        'DOMAIN-REGEX',
        'GEOSITE',
        'IP-SUFFIX',
        'SRC-GEOIP',
        'SRC-IP-ASN',
        'SRC-IP-CIDR',
        'SRC-IP-SUFFIX',
        'IN-TYPE',
        'IN-USER',
        'IN-NAME',
        'PROCESS-PATH',
        'PROCESS-PATH-REGEX',
        'PROCESS-NAME-REGEX',
        'UID',
        'DSCP',
        'SUB-RULE',
        'MATCH',
      ]

      // 路由策略
      this.ROUTING_POLICIES = [
        input.match(/,\s*([^,]+?)\s*(\s*,\s*(pre-matching|no-resolve|extended-matching)\s*)*?\s*$/)?.[1],
      ]

      // 规则匹配参数
      this.MATCHING_PARAMETERS = [
        { name: 'no-resolve', flag: 'noResolve' },
        { name: 'extended-matching', flag: 'extendedMatching' },
        { name: 'src', flag: 'src' },
        { name: 'pre-matching', flag: 'preMatching' },
      ]
    }

    peek(offset = 0) {
      return this.tokens[this.position + offset]
    }

    consume() {
      const token = this.tokens[this.position++]
      // console.log(`Consume: ${token.type} '${token.value}' at position ${this.position - 1}`)
      return token
    }

    expect(type, value = null) {
      const token = this.consume()
      if (!token || token.type !== type || (value !== null && token.value !== value)) {
        throw new Error(
          `期望 ${value !== null ? `'${value}'` : type}，但得到 '${token ? token.value : 'EOF'}'，在位置 ${
            this.position
          }`
        )
      }
      return token
    }

    parse() {
      // console.log('=== 开始语法分析 ===')
      if (this.tokens.length === 0) {
        throw new Error('输入为空')
      }
      const expr = this.parseExpression()

      // 检查是否有剩余的路由策略
      if (this.position < this.tokens.length) {
        const remainingTokens = this.tokens.slice(this.position)
        if (
          remainingTokens.length >= 2 &&
          remainingTokens[0].type === 'COMMA' &&
          this.ROUTING_POLICIES.includes(remainingTokens[1].value.toUpperCase())
        ) {
          this.consume() // 消费逗号
          const routingPolicyToken = this.consume()
          expr.routingPolicy = routingPolicyToken.value.toUpperCase()
        } else {
          throw new Error(`意外的令牌 '${this.peek().value}' 在位置 ${this.position}`)
        }
      }

      // console.log('=== 语法分析完成 ===')
      return expr
    }

    parseExpression() {
      const token = this.peek()
      // console.log(`Parsing expression at position ${this.position}: ${token ? token.value : 'EOF'}`)

      if (!token) {
        throw new Error('意外的输入结束')
      }

      if (token.type === 'LPAREN') {
        this.consume() // 消费 '('
        const exprList = this.parseExpressionList()
        this.expect('RPAREN') // 消费 ')'

        // 如果表达式列表只有一个元素，返回该元素，否则返回列表
        if (exprList.length === 1) {
          return exprList[0]
        } else {
          return exprList
        }
      } else if (token.type === 'WORD') {
        const operator = this.consume().value.toUpperCase()

        // 检查是否是逻辑运算符
        if (operator in this.LOGICAL_OPERATORS) {
          const node = { operator, type: 'LOGICAL', children: [] }

          // 消费逗号
          this.expect('COMMA')

          // 解析参数列表
          while (true) {
            const arg = this.parseExpression()
            node.children.push(arg)

            const nextToken = this.peek()
            if (nextToken && nextToken.type === 'COMMA') {
              // 前瞻检查逗号后是否为匹配参数或路由策略
              if (
                this.peek(1) &&
                this.peek(1).type === 'WORD' &&
                (this.ROUTING_POLICIES.includes(this.peek(1).value.toUpperCase()) ||
                  this.isMatchingParameter(this.peek(1).value))
              ) {
                break
              } else {
                this.consume()
              }
            } else {
              break
            }
          }

          // 处理匹配参数或路由策略
          while (this.peek() && this.peek().type === 'COMMA') {
            this.consume()
            const paramToken = this.consume()
            const paramName = paramToken.value.toLowerCase()

            if (this.ROUTING_POLICIES.includes(paramName.toUpperCase())) {
              node.routingPolicy = paramName.toUpperCase()
            } else if (this.isMatchingParameter(paramName)) {
              const matchingParam = this.MATCHING_PARAMETERS.find(p => p.name === paramName)
              node.flags = node.flags || {}
              // 初始化 flags 对象
              if (!node.flagsInitialized) {
                this.MATCHING_PARAMETERS.forEach(param => {
                  node.flags[param.flag] = false
                })
                node.flagsInitialized = true
              }
              // 设置对应的 flags 值为 true
              node.flags[matchingParam.flag] = true
            } else {
              console.warn(`未知的规则匹配参数: ${paramName}`)
            }
          }

          return node
        }

        // 检查是否是值运算符
        if (this.VALUE_OPERATORS.includes(operator)) {
          let value = null

          // 初始化 flags 对象，默认包含所有匹配参数，值为 false
          let flags = {}
          this.MATCHING_PARAMETERS.forEach(param => {
            flags[param.flag] = false
          })

          // 消费逗号
          this.expect('COMMA')

          value = this.collectValue()

          while (this.peek() && this.peek().type === 'COMMA') {
            // 前瞻检查逗号后是否为匹配参数或路由策略
            if (
              this.peek(1) &&
              this.peek(1).type === 'WORD' &&
              (this.ROUTING_POLICIES.includes(this.peek(1).value.toUpperCase()) ||
                this.isMatchingParameter(this.peek(1).value))
            ) {
              this.consume()
              const paramToken = this.consume()
              const paramName = paramToken.value.toLowerCase()

              if (this.ROUTING_POLICIES.includes(paramName.toUpperCase())) {
                flags.routingPolicy = paramName.toUpperCase()
              } else if (this.isMatchingParameter(paramName)) {
                const matchingParam = this.MATCHING_PARAMETERS.find(p => p.name === paramName)
                flags[matchingParam.flag] = true
              } else {
                console.warn(`未知的规则匹配参数: ${paramName}`)
              }
            } else {
              break
            }
          }

          const node = { operator, type: 'VALUE', value, flags }
          // console.log(`Parsed value condition: ${JSON.stringify(node)}`)
          return node
        }

        throw new Error(`未知的操作符 '${operator}' 在位置 ${this.position}`)
      } else {
        throw new Error(`意外的令牌 '${token.value}' 在位置 ${this.position}`)
      }
    }

    parseExpressionList() {
      const expressions = []

      while (true) {
        const expr = this.parseExpression()
        expressions.push(expr)

        if (this.peek() && this.peek().type === 'COMMA') {
          this.consume()
          if (this.peek() && this.peek().type === 'RPAREN') {
            break
          }
        } else {
          break
        }
      }

      return expressions
    }

    isMatchingParameter(paramName) {
      return this.MATCHING_PARAMETERS.some(p => p.name === paramName.toLowerCase())
    }

    collectValue() {
      let value = ''
      let depth = 0
      // console.log(`Collecting value starting at position ${this.position}`)
      while (this.position < this.tokens.length) {
        const token = this.peek()
        if (token.type === 'LPAREN') {
          depth++
          this.consume()
          value += '('
        } else if (token.type === 'RPAREN') {
          if (depth === 0) {
            break
          }
          depth--
          this.consume()
          value += ')'
        } else if (token.type === 'COMMA' && depth === 0) {
          break
        } else {
          value += token.value
          this.consume()
        }
      }
      // console.log(`Collected value: '${value}'`)
      return value
    }
  }

  function checkBalancedParentheses(input) {
    let stack = []
    for (let i = 0; i < input.length; i++) {
      const char = input[i]
      if (char === '(') {
        stack.push(i)
      } else if (char === ')') {
        if (stack.length === 0) {
          return { balanced: false, position: i }
        }
        stack.pop()
      }
    }
    if (stack.length > 0) {
      return { balanced: false, position: stack.pop() }
    }
    return { balanced: true }
  }
  // console.log('=== 开始解析规则 ===')
  const balanceCheck = checkBalancedParentheses(input)
  if (!balanceCheck.balanced) {
    throw new Error(`括号不匹配，在位置 ${balanceCheck.position} 处发现错误。`)
  }

  try {
    const tokenizer = new Tokenizer(input)
    const tokens = tokenizer.tokenize()

    const parser = new Parser(tokens)
    const tree = parser.parse()
    return tree
  } catch (e) {
    throw new Error(`解析错误: ${e.message}`)
    return null
  }
}
// 生成规则
function generateRule(node, platform, flags = {}) {
  // 平台特性配置（保持不变）
  const platformFeatures = {
    mihomo: {
      supportsExtendedMatching: true,
      supportsNoResolve: true,
      supportsPreMatching: true,
      supportsSrc: true,
      rejectPolicyRegex: /^REJECT(-[A-Z]+)*$/,
    },
    surge: {
      supportsExtendedMatching: false,
      supportsNoResolve: true,
      supportsPreMatching: true,
      supportsSrc: false,
      rejectPolicyRegex: /^REJECT(-[A-Z]+)*$/,
    },
    loon: {
      supportsExtendedMatching: false,
      supportsNoResolve: false,
      supportsPreMatching: false,
      supportsSrc: false,
      rejectPolicyRegex: /^REJECT(-[A-Z]+)*$/,
    },
  }

  const FLAG_SUPPORTED_TYPES = {
    extendedMatching: ['RULE-SET', 'DOMAIN-SET', 'DOMAIN-KEYWORD', 'DOMAIN-SUFFIX', 'DOMAIN', 'URL-REGEX'],
    noResolve: ['IP-CIDR', 'IP-CIDR6', 'GEOIP', 'IP-ASN', 'RULE-SET'],
    src: ['IP-CIDR', 'IP-CIDR6', 'GEOIP', 'IP-ASN', 'IP-SUFFIX'],
    preMatching: [
      'DOMAIN',
      'DOMAIN-SUFFIX',
      'DOMAIN-KEYWORD',
      'DOMAIN-SET',
      'DOMAIN-WILDCARD',
      'IP-CIDR',
      'IP-CIDR6',
      'GEOIP',
      'IP-ASN',
      'SUBNET',
      'DEST-PORT',
      'SRC-PORT',
      'SRC-IP',
      'RULE-SET',

      'AND',
      'OR',
      'NOT',
    ],
  }

  const LOGICAL_OPERATORS_ARITY = {
    AND: 'n',
    OR: 'n',
    NOT: 1,
  }

  const LOGICAL_OPERATORS_PRECEDENCE = {
    NOT: 3,
    AND: 2,
    OR: 1,
  }
  let hasPreMatching
  function traverseTree(node, platform, parentOperator = null) {
    node.flags = { ...node.flags, ...flags }
    const features = platformFeatures[platform]
    if (!features) {
      throw new Error(`未知的平台：${platform}`)
    }

    if (!node || !node.type) {
      console.log('节点缺少 type 属性或节点为 null:', node)
      return ''
    }

    if (node.type === 'LOGICAL') {
      const operator = node.operator
      const arity = LOGICAL_OPERATORS_ARITY[operator]

      // 检查是否有 pre-matching 标志
      // const hasPreMatching = node.flags && node.flags.preMatching;
      if (node.routingPolicy) {
        hasPreMatching = node.flags && node.flags.preMatching
      }
      if (hasPreMatching && node.routingPolicy) {
        // 验证 routingPolicy 是否符合 ^REJECT(-[A-Z]+)*$ 的格式
        if (!features.rejectPolicyRegex.test(node.routingPolicy)) {
          console.log(`pre-matching 只能与 REJECT 系列策略一起使用，当前策略为：${node.routingPolicy}`)
          hasPreMatching = false
        }
      }

      if (hasPreMatching) {
        // 检查所有子规则是否属于支持 pre-matching 的类型
        const notSupportedTypes = []
        const allChildrenSupported = node.children.every(childArray => {
          return Array.isArray(childArray)
            ? childArray.every(child => {
                const isSupported = FLAG_SUPPORTED_TYPES.preMatching.includes(child.operator)
                if (!isSupported) {
                  notSupportedTypes.push(child.operator)
                }
                return isSupported
              })
            : true
        })

        if (!allChildrenSupported) {
          console.log(
            `逻辑运算符 ${operator} 中的所有子规则必须是支持 pre-matching 的类型, 但 ${notSupportedTypes.join(
              ', '
            )} 不支持`
          )
          hasPreMatching = false
        }
      }

      let childrenOutputs = []
      node.children.forEach(child => {
        flattenChildren(child).forEach(subChild => {
          const output = traverseTree(subChild, platform, operator)
          if (output !== '') {
            childrenOutputs.push(output)
          }
        })
      })

      let result = ''
      let modifiers = []

      if (arity === 1) {
        if (childrenOutputs.length !== 1) {
          throw new Error(`操作符 ${operator} 期望有 1 个子节点，但得到 ${childrenOutputs.length} 个`)
        }
        // 仅允许添加 pre-matching 标志
        if (node.flags) {
          const { extendedMatching, noResolve, preMatching, src } = node.flags
          if (extendedMatching || noResolve || src) {
            console.log(`操作符 ${operator} 不能添加 extended-matching、no-resolve 或 src 标志`)
          }
        }
        result = `${operator},(${childrenOutputs[0]})`
      } else if (arity === 'n') {
        const formattedChildren = childrenOutputs.map(output => {
          return needsParentheses({ operator: output.split(',')[0] }, operator) ? `(${output})` : output
        })
        result = `${operator},(${formattedChildren.join(',')})`
      } else {
        throw new Error(`未知的运算符元数：${arity}，操作符：${operator}`)
      }

      if (node.routingPolicy) {
        result += `,${node.routingPolicy}`
        if (hasPreMatching) {
          result += `,pre-matching`
        }
      }

      if (needsParentheses(node, parentOperator)) {
        result = `(${result})`
      }

      // console.log(`Processed LOGICAL node: ${node.operator}, result: ${result}`)

      return result
    } else if (node.type === 'VALUE') {
      if (['URL-REGEX', 'USER-AGENT'].includes(node.operator) && !/^['"].*['"]$/.test(node.value)) {
        node.value = `"${node.value}"`
      }
      let result = `${node.operator},${node.value}`

      if (node.flags) {
        let flagStrings = []

        for (const [flag, isSet] of Object.entries(node.flags)) {
          if (isSet) {
            const supportedTypes = FLAG_SUPPORTED_TYPES[flag]
            if (!supportedTypes.includes(node.operator)) {
              console.log(`标志 ${flag} 不支持应用于规则类型 ${node.operator}`)
            } else {
              // 添加标志到 flagStrings
              switch (flag) {
                case 'extendedMatching':
                  flagStrings.push('extended-matching')
                  break
                case 'noResolve':
                  flagStrings.push('no-resolve')
                  break
                case 'preMatching':
                  // flagStrings.push('pre-matching')
                  break
                case 'src':
                  flagStrings.push('src')
                  break
                default:
                  console.log(`未知的标志类型：${flag}`)
              }
            }
          }
        }

        if (flagStrings.length > 0) {
          result += `,${flagStrings.join(',')}`
        }
      }

      // 根据标志类型决定是否包裹括号
      // ⚠️ extended-matching、no-resolve 不能附加到逻辑运算符上，但可以附加到规则类型上
      // pre-matching 可以附加到逻辑运算符上，已在 LOGICAL 节点处理
      result = `(${result})`

      // console.log(`Processed VALUE node: ${node.operator}, result: ${result}`)

      return result
    } else {
      console.log(`未知的节点类型: ${node.type}`)
      return ''
    }
  }

  function needsParentheses(node, parentOperator) {
    if (!parentOperator) {
      return false
    }

    const currentPrecedence = LOGICAL_OPERATORS_PRECEDENCE[node.operator]
    const parentPrecedence = LOGICAL_OPERATORS_PRECEDENCE[parentOperator]

    if (currentPrecedence === undefined) {
      return false
    }

    if (currentPrecedence <= parentPrecedence) {
      return true
    }
    if (node.operator === 'NOT') {
      return true
    }
    return false
  }

  function flattenChildren(children) {
    const result = []
    if (Array.isArray(children)) {
      children.forEach(child => {
        result.push(...flattenChildren(child))
      })
    } else if (children) {
      result.push(children)
    }
    return result
  }
  return traverseTree(node, platform)
}

function modifyRule(input, platform, flags) {
  try {
    const tree = parseRule(input)
    if (tree) {
      return generateRule(tree, platform, flags)
    }
  } catch (e) {
    console.log(e)
    shNotify(`修改规则发生错误 ${e.message} 请查看日志`)
  }
}

// Surge 现在支持使用 ' 或 " 来包裹字段。当使用 ' 时，" 为合法字符，反之亦然

// Loon JQ 表达式 单引号包裹
// 1. 必须用单引号包裹
// 2. 无脑用单引号把 jq 表达式取出来, 里面是啥就是啥

// Loon json-replace 处理对象时是跟 json-add 一样的，处理数组时不一样(3K 会改)
// 123 是 "123"
// "123" 是 "\"123\""
// a 是 "a"
// "a" 是 "\"a\""
function parseLoonKey(v) {
  return v.replace(/\\x20/g, ' ')
}
// 123 是 123
// "123" 是 "123"
// a 是 "a"
// "a" 是 "a"
// 由于在解析配置是用空格分割各个参数，如果配置的参数中有空格，请使用\x20代替
function parseLoonValue(_v) {
  let v = _v.replace(/\\x20/g, ' ')
  if (/^".*"$/.test(v)) {
    // 双引号包裹的肯定是字符串
    v = v.replace(/^"(.*?)"$/, '$1')
  } else {
    try {
      v = JSON.parse(v)
    } catch (e) {
      console.log(`解析 Loon 值 ${v} 失败: ${e}`)
    }
  }
  return v
}
function done(...args) {
  $.log(`⏱ 总耗时：${Math.round(((Date.now() - script_start) / 1000) * 100) / 100} 秒`)
  $.done(...args)
}
// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise(((e,r)=>{s.call(this,t,((t,s,a)=>{t?r(t):e(s)}))}))}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",Object.assign(this,e)}getEnv(){return"undefined"!=typeof $environment&&$environment["surge-version"]?"Surge":"undefined"!=typeof $environment&&$environment["stash-version"]?"Stash":"undefined"!=typeof module&&module.exports?"Node.js":"undefined"!=typeof $task?"Quantumult X":"undefined"!=typeof $loon?"Loon":"undefined"!=typeof $rocket?"Shadowrocket":void 0}isNode(){return"Node.js"===this.getEnv()}isQuanX(){return"Quantumult X"===this.getEnv()}isSurge(){return"Surge"===this.getEnv()}isLoon(){return"Loon"===this.getEnv()}isShadowrocket(){return"Shadowrocket"===this.getEnv()}isStash(){return"Stash"===this.getEnv()}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const r=this.getdata(t);if(r)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise((e=>{this.get({url:t},((t,s,r)=>e(r)))}))}runScript(t,e){return new Promise((s=>{let r=this.getdata("@chavy_boxjs_userCfgs.httpapi");r=r?r.replace(/\n/g,"").trim():r;let a=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");a=a?1*a:20,a=e&&e.timeout?e.timeout:a;const[o,i]=r.split("@"),n={url:`http://${i}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:a},headers:{"X-Key":o,Accept:"*/*"},timeout:a};this.post(n,((t,e,r)=>s(r)))})).catch((t=>this.logErr(t)))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),r=!s&&this.fs.existsSync(e);if(!s&&!r)return{};{const r=s?t:e;try{return JSON.parse(this.fs.readFileSync(r))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),r=!s&&this.fs.existsSync(e),a=JSON.stringify(this.data);s?this.fs.writeFileSync(t,a):r?this.fs.writeFileSync(e,a):this.fs.writeFileSync(t,a)}}lodash_get(t,e,s){const r=e.replace(/\[(\d+)\]/g,".$1").split(".");let a=t;for(const t of r)if(a=Object(a)[t],void 0===a)return s;return a}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce(((t,s,r)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[r+1])>>0==+e[r+1]?[]:{}),t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,r]=/^@(.*?)\.(.*?)$/.exec(t),a=s?this.getval(s):"";if(a)try{const t=JSON.parse(a);e=t?this.lodash_get(t,r,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,r,a]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(r),i=r?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(i);this.lodash_set(e,a,t),s=this.setval(JSON.stringify(e),r)}catch(e){const o={};this.lodash_set(o,a,t),s=this.setval(JSON.stringify(o),r)}}else s=this.setval(t,e);return s}getval(t){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.read(t);case"Quantumult X":return $prefs.valueForKey(t);case"Node.js":return this.data=this.loaddata(),this.data[t];default:return this.data&&this.data[t]||null}}setval(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.write(t,e);case"Quantumult X":return $prefs.setValueForKey(t,e);case"Node.js":return this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0;default:return this.data&&this.data[e]||null}}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){switch(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"],delete t.headers["content-type"],delete t.headers["content-length"]),t.params&&(t.url+="?"+this.queryStr(t.params)),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,((t,s,r)=>{!t&&s&&(s.body=r,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,r)}));break;case"Quantumult X":this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then((t=>{const{statusCode:s,statusCode:r,headers:a,body:o,bodyBytes:i}=t;e(null,{status:s,statusCode:r,headers:a,body:o,bodyBytes:i},o,i)}),(t=>e(t&&t.error||"UndefinedError")));break;case"Node.js":let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",((t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}})).then((t=>{const{statusCode:r,statusCode:a,headers:o,rawBody:i}=t,n=s.decode(i,this.encoding);e(null,{status:r,statusCode:a,headers:o,rawBody:i,body:n},n)}),(t=>{const{message:r,response:a}=t;e(r,a,a&&s.decode(a.rawBody,this.encoding))}))}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";switch(t.body&&t.headers&&!t.headers["Content-Type"]&&!t.headers["content-type"]&&(t.headers["content-type"]="application/x-www-form-urlencoded"),t.headers&&(delete t.headers["Content-Length"],delete t.headers["content-length"]),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,((t,s,r)=>{!t&&s&&(s.body=r,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,r)}));break;case"Quantumult X":;t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then((t=>{const{statusCode:s,statusCode:r,headers:a,body:o,bodyBytes:i}=t;e(null,{status:s,statusCode:r,headers:a,body:o,bodyBytes:i},o,i)}),(t=>e(t&&t.error||"UndefinedError")));break;case"Node.js":let r=require("iconv-lite");this.initGotEnv(t);const{url:a,...o}=t;this.got[s](a,o).then((t=>{const{statusCode:s,statusCode:a,headers:o,rawBody:i}=t,n=r.decode(i,this.encoding);e(null,{status:s,statusCode:a,headers:o,rawBody:i,body:n},n)}),(t=>{const{message:s,response:a}=t;e(s,a,a&&r.decode(a.rawBody,this.encoding))}))}}time(t,e=null){const s=e?new Date(e):new Date;let r={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in r)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?r[e]:("00"+r[e]).substr((""+r[e]).length)));return t}queryStr(t){let e="";for(const s in t){let r=t[s];null!=r&&""!==r&&("object"==typeof r&&(r=JSON.stringify(r)),e+=`${s}=${r}&`)}return e=e.substring(0,e.length-1),e}msg(e=t,s="",r="",a){const o=t=>{switch(typeof t){case void 0:return t;case"string":switch(this.getEnv()){case"Surge":case"Stash":default:return{url:t};case"Loon":case"Shadowrocket":return t;case"Quantumult X":return{"open-url":t};case"Node.js":return}case"object":switch(this.getEnv()){case"Surge":case"Stash":case"Shadowrocket":default:{let e=t.url||t.openUrl||t["open-url"];return{url:e}}case"Loon":{let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}case"Quantumult X":{let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl,r=t["update-pasteboard"]||t.updatePasteboard;return{"open-url":e,"media-url":s,"update-pasteboard":r}}case"Node.js":return}default:return}};if(!this.isMute)switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:$notification.post(e,s,r,o(a));break;case"Quantumult X":$notify(e,s,r,o(a));break;case"Node.js":}if(!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),r&&t.push(r),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:this.log("",`❗️${this.name}, 错误!`,t);break;case"Node.js":this.log("",`❗️${this.name}, 错误!`,t.stack)}}wait(t){return new Promise((e=>setTimeout(e,t)))}done(t={}){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:$done(t);break;case"Node.js":process.exit(1)}}}(t,e)}
