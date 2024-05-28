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

let noNtf = queryObject.noNtf ? istrue(queryObject.noNtf) : false //默认开启通知

let localsetNtf = $.lodash_get(arg, 'Notify') || $.getval('ScriptHub通知') || ''
noNtf = localsetNtf == '开启通知' ? false : localsetNtf == '关闭通知' ? true : noNtf

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
let sufkeepHeader = keepHeader == true ? '&keepHeader=true' : '' //用于保留header的后缀
let sufjsDelivr = jsDelivr == true ? '&jsDelivr=true' : '' //用于开启jsDeliver的后缀

//用于自定义发送请求的请求头
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

//待输出
let modInfo = [] //模块简介
let httpFrame = '' //Stash的http:父框架
let tiles = [] //磁贴覆写
let General = []
let Panel = []
let host = []
let rules = []
let URLRewrite = []
let HeaderRewrite = []
let MapLocal = []
let script = []
let cron = []
let providers = []

hnBox = hnAdd != null ? hnAdd : []

const jsRegex =
  /\s*[=,]\s*(?:script-path|pattern|timeout|argument|script-update-interval|requires-body|max-size|ability|binary-body-mode|cronexpr?|wake-system|enabled?|engine|tag|type|img-url|debug|event-name|desc)\s*=\s*/

const panelRegex = /\s*[=,]\s*(?:title|content|style|script-name|update-interval)\s*=\s*/

const policyRegex = /^(direct|reject-?(img|video|dict|array|drop|200|tinygif)?(-no-drop)?|\{\{\{[^,]+\}\}\})$/i

const mockRegex = /\s+(?:data-type|status-code|header|data)\s*=/

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

  body = body.match(/[^\r\n]+/g)

  for await (let [y, x] of body.entries()) {
    //简单处理方便后续操作
    x = x
      .trim()
      .replace(/^(#|;|\/\/)\s*/, '#')
      .replace(/\s+[^\s]+\s+url-and-header\s+/, ' url ')
      .replace(/(^[^#].+)\x20+\/\/.+/, '$1')
      .replace(/^#!PROFILE-VERSION-REQUIRED\s+[0-9]+\s+/i, '')
      .replace(/^(#)?host(-suffix|-keyword|-wildcard)?\s*,\s*/i, '$1DOMAIN$2,')
      .replace(/^(#)?ip6-cidr\s*,\s*/i, '$1IP-CIDR6,')

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

    //sni嗅探
    if (sni != null) {
      for (let i = 0; i < sni.length; i++) {
        const elem = sni[i].trim()
        if (x.indexOf(elem) != -1 && /^(DOMAIN|RULE-SET)/i.test(x) && !/,\s*extended-matching/i.test(x)) {
          x = x + ',extended-matching'
          break
        }
      } //循环结束
    } //启用sni嗅探结束

    //ip规则不解析域名
    if (ipNoResolve == true) {
      if (/^(?:ip-[ca]|RULE-SET)/i.test(x) && !/,\s*no-resolve/.test(x)) {
        x = x + ',no-resolve'
      }
    } //增加ip规则不解析域名结束

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

    //模块信息
    if (/^#!.+?=\s*$/.test(x)) {
    } else if (isLooniOS && /^#!(?:select|input)\s*=\s*.+/.test(x)) {
      getInputInfo(x, modInputBox)
    } else if (/^#!.+?=.+/.test(x) && !/^#!(?:select|input)\s*=\s*.+/.test(x)) {
      getModInfo(x)
    }

    //#!arguments参数
    if (!isSurgeiOS && /^#!arguments\s*=\s*.+/.test(x)) {
      parseArguments(x)
    }

    //hostname
    if (/^hostname\s*=.+/.test(x)) hnaddMethod = getHn(x, hnBox, hnaddMethod)

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

    //header rewrite 解析
    if (/\sheader-(?:del|add|replace|replace-regex)\s/.test(x)) {
      mark = getMark(y, body)
      noteK = isNoteK(x)
      x = x.replace(/^#/, '')
      rwhdBox.push({ mark, noteK, x })
    }

    //(request|response)-(header|body) 解析
    if (/\surl\s+(?:request|response)-(?:header|body)\s/i.test(x)) {
      mark = getMark(y, body)
      getQxReInfo(x, y, mark)
    }

    //rule解析
    if (
      /^#?(?:domain(?:-suffix|-keyword|-wildcard|-set)?|ip-cidr6?|ip-asn|rule-set|user-agent|url-regex|(de?st|in|src)-port|and|not|or|protocol)\s*,.+/i.test(
        x
      )
    ) {
      mark = getMark(y, body)
      noteK = isNoteK(x)
      ruletype = x.split(/\s*,\s*/)[0].replace(/^#/, '')
      rulenore = /,\s*no-resolve/.test(x) ? ',no-resolve' : ''
      rulesni = /,\s*extended-matching/.test(x) ? ',extended-matching' : ''
      rulePandV = x
        .replace(/^#/, '')
        .replace(ruletype, '')
        .replace(/\s*,\s*no-resolve/, '')
        .replace(/\s*,\s*extended-matching/, '')
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
      ruleBox.push({ mark, noteK, ruletype, rulevalue, rulepolicy, rulenore, rulesni, ori: x, modistatus })
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
        : ''
      ability = getJsInfo(x, /[=,\s]\s*ability\s*=\s*/)
      engine = getJsInfo(x, /[=,\s]\s*engine\s*=\s*/)
      updatetime = getJsInfo(x, /[=,\s]\s*script-update-interval\s*=\s*/)
      timeout = getJsInfo(x, /[=,\s]\s*timeout\s*=\s*/)
      tilesicon = jstype == 'generic' && /icon=/.test(x) ? x.split('icon=')[1].split('&')[0] : ''
      tilescolor = jstype == 'generic' && /icon-color=/.test(x) ? x.split('icon-color=')[1].split('&')[0] : ''
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
        jstype:'cron',
        jsptn:'',
        jsurl,
        updatetime,
        wakesys: '1',
        timeout:'120',
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
        ori: x,
        num: y,
      })
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
        jstype:'cron',
        jsptn:'',
        jsurl,
        wakesys: '1',
        timeout: '120',
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
        jsptn:'',
        cronexp,
        jsurl,
        wakesys: '1',
        timeout: '120',
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

  panelBox = panelBox.reduce((curr, next) => {
    /*判断对象中是否已经有该属性  没有的话 push 到 curr数组*/
    obj[next.scriptname] ? '' : (obj[next.scriptname] = curr.push(next))
    return curr
  }, [])

  jsBox = jsBox.reduce((curr, next) => {
    /*判断对象中是否已经有该属性  没有的话 push 到 curr数组*/
    obj[next.jstype + next.jsptn + next.jsurl + next.jsarg] ? '' : (obj[next.jstype + next.jsptn + next.jsurl + next.jsarg] = curr.push(next))
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
          let info = !isStashiOS ? '#!' + key + '=' + modInfoObj[key] : key + ': |-\n  ' + modInfoObj[key]
          modInfo.push(info)
        }
      }

      for (let i = 0; i < modInputBox.length; i++) {
        let info = '#!' + modInputBox[i].a + modInputBox[i].b
        modInfo.push(info)
      } //for
      break
  } //模块信息输出结束

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

    if (rulepolicy == '') {
      notBuildInPolicy.push(ori)
    } else if (/^proxy$/i.test(rulepolicy) && modistatus == 'no' && (isSurgeiOS || isStashiOS)) {
      notBuildInPolicy.push(ori)
    } else if (!policyRegex.test(rulepolicy) && !/^proxy$/i.test(rulepolicy) && modistatus == 'no') {
      notBuildInPolicy.push(ori)
    } else if (/^in-port|domain-wildcard$/i.test(ruletype) && isSurgeiOS) {
      rules.push(mark + noteK + ruletype + ',' + rulevalue + ',' + rulepolicy + rulenore + rulesni)
    } else if (/^protocol$/i.test(ruletype) && (isLooniOS || isSurgeiOS)) {
      rules.push(mark + noteK + ruletype + ',' + rulevalue + ',' + rulepolicy + rulenore)
    } else if (/^(?:domain-set|rule-set)$/i.test(ruletype) && (isSurgeiOS || isShadowrocket)) {
      rules.push(mark + noteK + ruletype + ',' + rulevalue + ',' + rulepolicy + rulenore + rulesni)
    } else if (
      /^(?:domain(-suffix|-keyword)?|ip(-asn|-cidr6?)|user-agent|url-regex|de?st-port|and|or|not)$/i.test(ruletype) &&
      !isStashiOS
    ) {
      rulevalue = /,/.test(rulevalue) && !/[()]/.test(rulevalue) ? '"' + rulevalue + '"' : rulevalue
      rules.push(mark + noteK + ruletype + ',' + rulevalue + ',' + rulepolicy + rulenore + rulesni)
    } else if (/(?:^domain$|domain-suffix|domain-keyword|ip-|de?st-port)/i.test(ruletype) && isStashiOS) {
      rules.push(mark + noteK2 + '- ' + ruletype + ',' + rulevalue + ',' + rulepolicy + rulenore)
    } else if (/src-port/i.test(ruletype) && (isSurgeiOS || isLooniOS)) {
      rules.push(mark + noteK + ruletype + ',' + rulevalue + ',' + rulepolicy)
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
          MapLocal.push(mark + noteK + rwptn + ' data-type=text data="{}" status-code=200')
        if (/reject-array/.test(rwtype))
          MapLocal.push(mark + noteK + rwptn + ' data-type=text data="[]" status-code=200')
        if (/reject-200/.test(rwtype)) MapLocal.push(mark + noteK + rwptn + ' data-type=text data=" " status-code=200')
        if (/reject-(?:img|tinygif|video)/.test(rwtype))
          MapLocal.push(mark + noteK + rwptn + ' data-type=tiny-gif status-code=200')
        break
    } //switch
  } //reject redirect输出for

  //headerRewrite输出
  for (let i = 0; i < rwhdBox.length; i++) {
    noteK = rwhdBox[i].noteK ? '#' : ''
    mark = rwhdBox[i].mark ? rwhdBox[i].mark : ''
    x = rwhdBox[i].x
    switch (targetApp) {
      case 'surge-module':
        HeaderRewrite.push(mark + noteK + x)
        break

      case 'loon-plugin':
        x = x.replace(/^http-(request|response)\s+/, '')
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
        let hdtype = /^http-response\s/.test(x) ? ' response-' : ' request-'
        x = x.replace(/^http-(?:request|response)\s+/, '').replace(/\s+header-/, hdtype)
        HeaderRewrite.push(mark + `${noteK4}- >-${noteKn6}` + x)
        break

      case 'shadowrocket-module':
        otherRule.push(noteK + x)
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
    mockurl = mockBox[i].mockurl ? ' data="' + mockBox[i].mockurl + '"' : mocktype == ' data-type=text' ? ' data=""' : ''
    mockstatus = mockBox[i].mockstatus ? ' status-code=' + mockBox[i].mockstatus : ''

    switch (targetApp) {
      case 'surge-module':
        mockheader =
          keepHeader == true && mockBox[i].mockheader && !/&contentType=/.test(mockBox[i].mockheader)
            ? ' header="' + mockBox[i].mockheader + '"'
            : ''
        MapLocal.push(mark + noteK + mockptn + mocktype + mockurl + mockstatus + mockheader)
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
                ', cronexp="' +
                cronexp +
                '"' +
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
                ' "' +
                cronexp +
                '"' +
                ' script-path=' +
                jsurl +
                timeout +
                ', tag=' +
                jsname +
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
        cron.push(mark + `${noteK4}- name: "` + jsname + `"${noteKn6}cron: "` + cronexp + `"${timeout}` + jsarg)
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

      rules = (rules[0] || '') && `[Rule]\n${rules.join('\n')}`

      Panel = (Panel[0] || '') && `[Panel]\n${Panel.join('\n\n')}`

      URLRewrite = (URLRewrite[0] || '') && Rewrite + `\n${URLRewrite.join('\n')}`

      HeaderRewrite = (HeaderRewrite[0] || '') && `[Header Rewrite]\n${HeaderRewrite.join('\n')}`

      MapLocal = (MapLocal[0] || '') && `[Map Local]\n${MapLocal.join('\n\n')}`

      host = (host[0] || '') && `[Host]\n${host.join('\n')}`

      script = (script[0] || '') && `[Script]\n${script.join('\n\n')}`

      if (isLooniOS) {
        MITM = hnBox.length > 0 ? '[MITM]\nhostname = ' + hnBox : ''
        fheBox.length > 0 && General.push('force-http-engine-hosts = ' + fheBox)
        skipBox.length > 0 && General.push('skip-proxy = ' + skipBox)
        realBox.length > 0 && General.push('real-ip = ' + realBox)
        General = (General[0] || '') && `[General]\n${General.join('\n\n')}`
      }

      if (isSurgeiOS || isShadowrocket) {
        MITM = hnBox.length > 0 ? `[MITM]\nhostname = ${hnaddMethod} ` + hnBox : ''
        fheBox.length > 0 && General.push(`force-http-engine-hosts = ${fheaddMethod} ` + fheBox)
        skipBox.length > 0 && General.push(`skip-proxy = ${skipaddMethod} ` + skipBox)
        realBox.length > 0 && General.push(`always-real-ip = ${realaddMethod} ` + realBox)
        General = (General[0] || '') && `[General]\n${General.join('\n\n')}`
      }

      body = `${modInfo}

${General}

${rules}

${URLRewrite}

${HeaderRewrite}

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

      if (
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
  if (sgArg.length > 0) {
    for (let i = 0; i < sgArg.length; i++) {
      let e = '{{{' + sgArg[i].key + '}}}'
      let r = sgArg[i].value
      body = body.replaceAll(e, r)
    } //for
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
  let key = x.match(regex)[1]
  let value = x.match(regex)[2]
  modInfoObj[key] = value
}

//获取可莉图标集
async function getIcon(icon) {
  let url = 'https://gitlab.com/lodepuly/iconlibrary/-/raw/main/KeLee_icon.json'
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
  let redirect_type = x.match(/\s302|\s307|\sheader$/)[0].replace(/\s/, '')
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
      : /\s(data-type|data)\s*=/.test(x)
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
  } else if (/(?:tieba|youtube|bili|spotify|wyres|DualSubs\.Subtitles\.Translate\.response)/i.test(url)) {
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
  let mockptn, mockurl, mockheader, mocktype, mockstatus
  if (/url\s+echo-response\s/.test(x)) {
    mockptn = x.split(/\s+url\s+/)[0]
    mockurl = x.split(/\s+echo-response\s+/)[2]
    mocktype = 'file'
    mockheader = '&contentType=' + encodeURIComponent(x.split(/\s+echo-response\s+/)[1])
  }

  if (/\sdata\s*=\s*"|\sdata-type=/.test(x)) {
    mockptn = x
      .split(/\s+/)[0]
      .replace(/^#/g, '')
      .replace(/^"(.+)"$/, '$1')
    mockurl = getJsInfo(x, /\s+data\s*=\s*/).replace(/^"(.*)"$/, '$1')
    mocktype = getJsInfo(x, /\s+data-type\s*=\s*/) || 'file'
    mockstatus = getJsInfo(x, /\s+status-code\s*=\s*/)
    mockheader = getJsInfo(x, /\s+header\s*=\s*/).replace(/^"(.+)"$/, '$1')
  }

  switch (targetApp) {
    case 'surge-module':
      mockBox.push({ mark, noteK, mockptn, mockurl, mockheader, mockstatus, mocktype, ori: x, mocknum: y })
      break

    case 'shadowrocket-module':
    case 'loon-plugin':
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
  const queryString = str.split(/#!arguments\s*=\s*/)[1] //获取查询字符串部分
  const regex = /([^:,]+):(\s*".+?"|[^,]*)/g //匹配键值对的正则表达式
  let match

  while ((match = regex.exec(queryString))) {
    const key = match[1].trim().replace(/^"(.+)"$/, '$1') //去除头尾空白符和引号
    const value = match[2].trim().replace(/^"(.+)"$/, '$1') //去除头尾空白符和引号
    sgArg.push({ key, value }) //将键值对添加到对象中
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
function done(...args) {
  $.log(`⏱ 总耗时：${Math.round(((Date.now() - script_start) / 1000) * 100) / 100} 秒`)
  $.done(...args)
}
// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise(((e,r)=>{s.call(this,t,((t,s,a)=>{t?r(t):e(s)}))}))}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",Object.assign(this,e)}getEnv(){return"undefined"!=typeof $environment&&$environment["surge-version"]?"Surge":"undefined"!=typeof $environment&&$environment["stash-version"]?"Stash":"undefined"!=typeof module&&module.exports?"Node.js":"undefined"!=typeof $task?"Quantumult X":"undefined"!=typeof $loon?"Loon":"undefined"!=typeof $rocket?"Shadowrocket":void 0}isNode(){return"Node.js"===this.getEnv()}isQuanX(){return"Quantumult X"===this.getEnv()}isSurge(){return"Surge"===this.getEnv()}isLoon(){return"Loon"===this.getEnv()}isShadowrocket(){return"Shadowrocket"===this.getEnv()}isStash(){return"Stash"===this.getEnv()}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const r=this.getdata(t);if(r)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise((e=>{this.get({url:t},((t,s,r)=>e(r)))}))}runScript(t,e){return new Promise((s=>{let r=this.getdata("@chavy_boxjs_userCfgs.httpapi");r=r?r.replace(/\n/g,"").trim():r;let a=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");a=a?1*a:20,a=e&&e.timeout?e.timeout:a;const[o,i]=r.split("@"),n={url:`http://${i}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:a},headers:{"X-Key":o,Accept:"*/*"},timeout:a};this.post(n,((t,e,r)=>s(r)))})).catch((t=>this.logErr(t)))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),r=!s&&this.fs.existsSync(e);if(!s&&!r)return{};{const r=s?t:e;try{return JSON.parse(this.fs.readFileSync(r))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),r=!s&&this.fs.existsSync(e),a=JSON.stringify(this.data);s?this.fs.writeFileSync(t,a):r?this.fs.writeFileSync(e,a):this.fs.writeFileSync(t,a)}}lodash_get(t,e,s){const r=e.replace(/\[(\d+)\]/g,".$1").split(".");let a=t;for(const t of r)if(a=Object(a)[t],void 0===a)return s;return a}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce(((t,s,r)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[r+1])>>0==+e[r+1]?[]:{}),t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,r]=/^@(.*?)\.(.*?)$/.exec(t),a=s?this.getval(s):"";if(a)try{const t=JSON.parse(a);e=t?this.lodash_get(t,r,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,r,a]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(r),i=r?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(i);this.lodash_set(e,a,t),s=this.setval(JSON.stringify(e),r)}catch(e){const o={};this.lodash_set(o,a,t),s=this.setval(JSON.stringify(o),r)}}else s=this.setval(t,e);return s}getval(t){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.read(t);case"Quantumult X":return $prefs.valueForKey(t);case"Node.js":return this.data=this.loaddata(),this.data[t];default:return this.data&&this.data[t]||null}}setval(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.write(t,e);case"Quantumult X":return $prefs.setValueForKey(t,e);case"Node.js":return this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0;default:return this.data&&this.data[e]||null}}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){switch(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"],delete t.headers["content-type"],delete t.headers["content-length"]),t.params&&(t.url+="?"+this.queryStr(t.params)),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,((t,s,r)=>{!t&&s&&(s.body=r,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,r)}));break;case"Quantumult X":this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then((t=>{const{statusCode:s,statusCode:r,headers:a,body:o,bodyBytes:i}=t;e(null,{status:s,statusCode:r,headers:a,body:o,bodyBytes:i},o,i)}),(t=>e(t&&t.error||"UndefinedError")));break;case"Node.js":let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",((t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}})).then((t=>{const{statusCode:r,statusCode:a,headers:o,rawBody:i}=t,n=s.decode(i,this.encoding);e(null,{status:r,statusCode:a,headers:o,rawBody:i,body:n},n)}),(t=>{const{message:r,response:a}=t;e(r,a,a&&s.decode(a.rawBody,this.encoding))}))}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";switch(t.body&&t.headers&&!t.headers["Content-Type"]&&!t.headers["content-type"]&&(t.headers["content-type"]="application/x-www-form-urlencoded"),t.headers&&(delete t.headers["Content-Length"],delete t.headers["content-length"]),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,((t,s,r)=>{!t&&s&&(s.body=r,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,r)}));break;case"Quantumult X":;t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then((t=>{const{statusCode:s,statusCode:r,headers:a,body:o,bodyBytes:i}=t;e(null,{status:s,statusCode:r,headers:a,body:o,bodyBytes:i},o,i)}),(t=>e(t&&t.error||"UndefinedError")));break;case"Node.js":let r=require("iconv-lite");this.initGotEnv(t);const{url:a,...o}=t;this.got[s](a,o).then((t=>{const{statusCode:s,statusCode:a,headers:o,rawBody:i}=t,n=r.decode(i,this.encoding);e(null,{status:s,statusCode:a,headers:o,rawBody:i,body:n},n)}),(t=>{const{message:s,response:a}=t;e(s,a,a&&r.decode(a.rawBody,this.encoding))}))}}time(t,e=null){const s=e?new Date(e):new Date;let r={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in r)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?r[e]:("00"+r[e]).substr((""+r[e]).length)));return t}queryStr(t){let e="";for(const s in t){let r=t[s];null!=r&&""!==r&&("object"==typeof r&&(r=JSON.stringify(r)),e+=`${s}=${r}&`)}return e=e.substring(0,e.length-1),e}msg(e=t,s="",r="",a){const o=t=>{switch(typeof t){case void 0:return t;case"string":switch(this.getEnv()){case"Surge":case"Stash":default:return{url:t};case"Loon":case"Shadowrocket":return t;case"Quantumult X":return{"open-url":t};case"Node.js":return}case"object":switch(this.getEnv()){case"Surge":case"Stash":case"Shadowrocket":default:{let e=t.url||t.openUrl||t["open-url"];return{url:e}}case"Loon":{let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}case"Quantumult X":{let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl,r=t["update-pasteboard"]||t.updatePasteboard;return{"open-url":e,"media-url":s,"update-pasteboard":r}}case"Node.js":return}default:return}};if(!this.isMute)switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:$notification.post(e,s,r,o(a));break;case"Quantumult X":$notify(e,s,r,o(a));break;case"Node.js":}if(!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),r&&t.push(r),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:this.log("",`❗️${this.name}, 错误!`,t);break;case"Node.js":this.log("",`❗️${this.name}, 错误!`,t.stack)}}wait(t){return new Promise((e=>setTimeout(e,t)))}done(t={}){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:$done(t);break;case"Node.js":process.exit(1)}}}(t,e)}
