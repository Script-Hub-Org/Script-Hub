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

const $ = new Env(`Script Hub: 重写转换`);

const url = $request.url;
var req = url.split(/file\/_start_\//)[1].split(/\/_end_\//)[0];
var reqArr = req.match("%F0%9F%98%82") ? req.split("%F0%9F%98%82") : [req];
	//$.log("原始链接：" + req);

var urlArg = url.split(/\/_end_\//)[1];

//获取参数
const queryObject = parseQueryString(urlArg);
//$.log("参数:" + $.toStr(queryObject));

//目标app
const targetApp = queryObject.target;
const app = targetApp.split("-")[0];
const isSurgeiOS = targetApp == "surge-module";
const isStashiOS = targetApp == "stash-stoverride";
const isLooniOS = targetApp == "loon-plugin";
const isShadowrocket = targetApp == "shadowrocket-module";

var evJsori = queryObject.evalScriptori;
var evJsmodi = queryObject.evalScriptmodi;
var evUrlori = queryObject.evalUrlori;
var evUrlmodi = queryObject.evalUrlmodi;

var noNtf = queryObject.noNtf ? istrue(queryObject.noNtf) : false;//默认开启通知
var localsetNtf = $.getdata("ScriptHub通知");
noNtf = localsetNtf == "开启通知" ? false : localsetNtf == "关闭通知" ? true : noNtf ;

var openInBoxHtml = istrue(queryObject.openInBoxHtml);
var openOutBoxHtml = istrue(queryObject.openOutBoxHtml);
var openOtherRuleHtml = istrue(queryObject.openOtherRuleHtml);

noNtf = openInBoxHtml ||openOutBoxHtml||openOtherRuleHtml ? true : noNtf;

var nName = queryObject.n != undefined ? queryObject.n.split("+") : null;//名字简介
var Pin0 = queryObject.y != undefined ? queryObject.y.split("+") : null;//保留
var Pout0 = queryObject.x != undefined ? queryObject.x.split("+") : null;//排除
var hnAdd = queryObject.hnadd != undefined ? queryObject.hnadd.split(/\s*,\s*/) : null;//加
var hnDel = queryObject.hndel != undefined ? queryObject.hndel.split(/\s*,\s*/) : null;//减
var hnRegDel = queryObject.hnregdel != undefined ? new RegExp(queryObject.hnregdel) : null;//正则删除hostname
var synMitm = istrue(queryObject.synMitm);//将force与mitm同步
var delNoteSc = istrue(queryObject.del);
var nCron = queryObject.cron != undefined ? queryObject.cron.split("+") : null;//替换cron目标
var ncronexp = queryObject.cronexp != undefined ? queryObject.cronexp.replace(/\./g," ").split("+") : null;//新cronexp
var nArgTarget = queryObject.arg != undefined ? queryObject.arg.split("+") : null;//arg目标
var nArg = queryObject.argv != undefined ? queryObject.argv.split("+") : null;//arg参数
var nTilesTarget = queryObject.tiles != undefined ? queryObject.tiles.split("+") : null;
var ntilescolor = queryObject.tcolor != undefined ? queryObject.tcolor.split("+") : null;
var nPolicy = queryObject.policy != undefined ? queryObject.policy : null;
var jsConverter = queryObject.jsc != undefined ? queryObject.jsc.split("+") : null;//脚本转换1
var jsConverter2 = queryObject.jsc2 != undefined ? queryObject.jsc2.split("+") : null;//脚本转换2
var compatibilityOnly = istrue(queryObject.compatibilityOnly);//兼容转换
var keepHeader = istrue(queryObject.keepHeader);//保留mock header
var jsDelivr = istrue(queryObject.jsDelivr);//开启jsDelivr
var localText = queryObject.localtext != undefined ? "\n" + queryObject.localtext : "";//纯文本输入
var ipNoResolve = istrue(queryObject.nore);//ip规则不解析域名
var sni = queryObject.sni != undefined ? queryObject.sni.split("+") : null;//sni嗅探
var sufkeepHeader = keepHeader == true ? '&keepHeader=true' : '';//用于保留header的后缀
var sufjsDelivr = jsDelivr == true ? '&jsDelivr=true' : '';//用于开启jsDeliver的后缀

//插件图标区域
const iconStatus = $.getval("启用插件随机图标") ?? "启用";
const iconReplace = $.getval("替换原始插件图标");
const iconLibrary1 = $.getval("插件随机图标合集") ?? "Doraemon(100P)";
const iconLibrary2 = iconLibrary1.split("(")[0];
const iconFormat = iconLibrary2.search(/gif/i) == -1 ? ".png" : ".gif";
if (iconStatus == "禁用" && iconReplace == "禁用"){iconLibrary2 = "Doraemon"};

//随机插件图标
var icon = "";
if(isLooniOS && iconStatus == "启用"){
	const stickerStartNum = 1001;
const stickerSum = iconLibrary1.split("(")[1].split("P")[0];
var randomStickerNum = parseInt(stickerStartNum + Math.random() * stickerSum).toString();
   icon = "#!icon=" + "https://github.com/Toperlock/Quantumult/raw/main/icon/" + iconLibrary2 + "/" + iconLibrary2 + "-" + randomStickerNum + iconFormat;
};

//通知名区域
var rewriteName = req.substring(req.lastIndexOf('/') + 1).split('.')[0];
var resFile = urlArg.split("?")[0];
var resFileName = 
resFile.substring(0,resFile.lastIndexOf('.'));
var notifyName
if (nName != null && nName[0] != ""){notifyName = nName[0];}else{notifyName = resFileName;};

//修改名字和简介
if (nName === null){
	name = rewriteName;
    desc = name;
}else{
	name = nName[0] != "" ? nName[0] : rewriteName;
	desc = nName[1] != undefined ? nName[1] : name;
};

//信息中转站
var bodyBox = [];      //存储待转换的内容
var otherRule = [];    //不支持的规则&脚本
var inBox = [];        //被释放的重写或规则
var outBox = [];       //被排除的重写或规则
var modInfoBox = [];   //模块简介等信息
var modInputBox = [];  //loon插件的可交互按钮
var hostBox = [];      //host
var ruleBox = [];      //规则
var rwBox = [];        //重写
var rwhdBox = [];      //HeaderRewrite
var jsBox = [];        //脚本
var mockBox = [];      //MapLocal或echo-response
var hnBox = [];        //MITM主机名
var fheBox = [];       //force-http-engine
var skipBox = [];      //skip-ip
var realBox = [];      //real-ip
var hndelBox = [];     //正则剔除的主机名

var hnaddMethod = "%APPEND%";
var fheaddMethod = "%APPEND%";
var skipaddMethod = "%APPEND%";
var realaddMethod = "%APPEND%";

//待输出
var modInfo = [];      //模块简介
var httpFrame = [];    //Stash的http:父框架
var tiles = [];        //磁贴覆写
var General = [];      
var Panel = [];
var host = [];        
var rules = [];
var URLRewrite = [];
var HeaderRewrite = [];
var MapLocal = [];
var script = [];
var cron = [];
var providers = [];

hnBox = hnAdd != null ? hnAdd : [];

const jsRegx = /[=,]\s*(?:script-path|pattern|timeout|argument|script-update-interval|requires-body|max-size|ability|binary-body-mode|cronexpr?|wake-system|enabled?|tag|type|img-url|debug|event-name|desc)\s*=/;

//查询js binarymode相关
var binaryInfo = $.getval("Parser_binary_info");
if (binaryInfo != null && binaryInfo.length != 0){
	binaryInfo = $.toObj(binaryInfo);
}else{binaryInfo = [];};

!(async () => {

if (req == 'http://local.text'){
	body = localText;
}else{
	for (let i=0; i<reqArr.length; i++){
		body = (await $.http.get(reqArr[i])).body;
		if (body.match(/^(?:\s)*\/\*[\s\S]*?(?:\r|\n)\s*\*+\//)){

body = body.match(/^(?:\n|\r)*\/\*([\s\S]*?)(?:\r|\n)\s*\*+\//)[1];
		bodyBox.push(body);

		}else{bodyBox.push(body)}
		
	};//for
	body = bodyBox.join("\n\n")+localText;};

eval(evJsori);
eval(evUrlori);

    body = body.match(/[^\r\n]+/g);

for await (var [y, x] of body.entries()) {

//简单处理方便后续操作
	x = x.replace(/^\s*(#|;|\/\/)\s*/,'#').replace(/\s+[^\s]+\s+url-and-header\s+/,' url ').replace(/(^[^#].+)\x20+\/\/.+/,"$1").replace(/^#!PROFILE-VERSION-REQUIRED\s+[0-9]+\s+/i,'').replace(/^(#)?host-wildcard\s*,.+/i,'').replace(/^(#)?host(-suffix|-keyword|)?\s*,\s*/i,'$1DOMAIN$2,').replace(/^(#)?ip6-cidr\s*,\s*/i,'$1IP-CIDR6,');
	
//去掉注释
if (Pin0 != null) {
	for (let i=0; i < Pin0.length; i++) {
  const elem = Pin0[i];
	if (x.indexOf(elem) != -1&&/^#/.test(x)){
		x = x.replace(/^#/,"")
		inBox.push(x);
	};
};//循环结束
};//去掉注释结束

//增加注释
if (Pout0 != null){
	for (let i=0; i < Pout0.length; i++) {
  const elem = Pout0[i];
	if (x.indexOf(elem) != -1 && x.search(/^(hostname|force-http-engine-hosts|skip-proxy|always-real-ip|real-ip)\s*=/) == -1&&!/^#/.test(x)){
		x = "#" + x;
		outBox.push(x);
	};
};//循环结束
};//增加注释结束

//剔除被注释的重写
if (delNoteSc === true && x.match(/^#/) && x.indexOf("#!") == -1){
		x = "";
};

//sni嗅探
if (sni != null){
	for (let i=0; i < sni.length; i++) {
  const elem = sni[i];
	if (x.indexOf(elem) != -1 && /^(DOMAIN|RULE-SET)/i.test(x) && !/,\s*extended-matching/i.test(x)){
		x = x + ",extended-matching";
	};
};//循环结束
};//启用sni嗅探结束

//ip规则不解析域名
if(ipNoResolve === true){
	if (/^(?:ip-[ca]|RULE-SET)/i.test(x) && !/,\s*no-resolve/.test(x)){
		x = x + ",no-resolve";
	};
};//增加ip规则不解析域名结束

jscStatus = false;
jsc2Status = false;

if (jsConverter != null){
	jscStatus = isJsCon(x, jsConverter);}
if (jsConverter2 != null){
	jsc2Status = isJsCon(x, jsConverter2);}
if (jsc2Status == true){jscStatus = false};

jsPre = "";
jsSuf = "";
jsTarget = targetApp.split("-")[0];

if (jscStatus == true || jsc2Status == true){
jsPre = "http://script.hub/convert/_start_/";
};
if (jscStatus == true){
jsSuf = `/_end_/_yuliu_.js?type=_js_from_-script&target=${jsTarget}-script`;
}else if (jsc2Status == true){
jsSuf = `/_end_/_yuliu_.js?type=_js_from_-script&target=${jsTarget}-script&wrap_response=true`;
};

if (compatibilityOnly == true && (jscStatus == true || jsc2Status == true)){
jsSuf = jsSuf + "&compatibilityOnly=true"
};

//模块信息 
if (/^#!.+?=\s*$/.test(x)){
	
} else if (isLooniOS&&/^#!(?:select|input)\s*=\s*.+/.test(x)){
	getModInfo(x,modInputBox);
}else if (reqArr.length>1&&/^#!(?:name|desc|date|author)\s*=.+/.test(x) && (isSurgeiOS || isShadowrocket || isStashiOS)){getModInfo(x,modInfoBox);
	
}else if (reqArr.length==1&&/^#!(?:name|desc|date|author|system)\s*=.+/.test(x) && (isSurgeiOS || isShadowrocket || isStashiOS)) {
	getModInfo(x,modInfoBox);
}else if (isLooniOS && /^#!.+?=.+/.test(x)){
	getModInfo(x,modInfoBox);
};

//hostname
if (/^hostname\s*=.+/.test(x)) hnaddMethod=getHn(x,hnBox,hnaddMethod);

if (/^force-http-engine-hosts\s*=.+/.test(x)) fheaddMethod=getHn(x,fheBox,fheaddMethod);

if (/^skip-proxy\s*=.+/.test(x)) skipaddMethod=getHn(x,skipBox,skipaddMethod);

if (/^(?:always-)?real-ip\s*=.+/.test(x)) realaddMethod=getHn(x,realBox,realaddMethod);

//reject 解析
	if (/.+reject(?:-\w+)?$/i.test(x) && !/^#?(DOMAIN.*?\s*,|IP-CIDR6?\s*,|IP-ASN\s*,|OR\s*,|AND\s*,|NOT\s*,|USER-AGENT\s*,|URL-REGEX\s*,|RULE-SET\s*,|DE?ST-PORT\s*,|PROTOCOL\s*,)/i.test(x) && !/^#!/.test(x)) {
		mark = getMark(y,body);
		rw_reject(x,mark);
	};
	
//重定向 解析
	if (/(?:\s(?:302|307|header)(?:$|\s)|url\s+30(?:2|7)\s)/.test(x)) {
		mark = getMark(y,body);
		rw_redirect(x,mark);
	};
	
//header rewrite 解析
	if (/\sheader-(?:del|add|replace|replace-regex)\s/.test(x)) {
		mark = getMark(y,body);
		rwhdBox.push(mark,x);
};

//(request|response)-(header|body) 解析
if (/\surl\s+(?:request|response)-(?:header|body)\s/i.test(x)) {
		mark = getMark(y,body);
		getQxReInfo(x,y,mark);
};

//rule解析
if (/^#?(?:domain(?:-suffix|-keyword|-set)?|ip-cidr6?|ip-asn|rule-set|user-agent|url-regex|de?st-port|and|not|or|protocol)\s*,.+/i.test(x)){
		mark = getMark(y,body);
	x = x.replace(/\s/g,"");
	noteK = isNoteK(x);
	ruletype = x.split(/\s*,\s*/)[0].replace(/^#/,"");
	rulenore = /,no-resolve/.test(x) ? ",no-resolve" : "";
	rulesni = /,extended-matching/.test(x) ? ",extended-matching" : "";
	rulePandV = x.replace(/^#/,'').replace(ruletype,'').replace(rulenore,'').replace(rulesni,'').replace(/^,/,'');
	rulepolicy = rulePandV.substring(rulePandV.lastIndexOf(',') + 1);
	rulepolicy = /\)|\}/.test(rulepolicy) ? "" : rulepolicy;
	rulevalue = rulePandV.replace(rulepolicy,'').replace(/,$/,'').replace(/"/g,'');
	if (rulepolicy != '' && rulevalue == '') {
		rulevalue = rulepolicy;
		rulepolicy = ''
	};
	
	if (nPolicy!=null&&!/direct|reject/.test(rulepolicy)){
		rulepolicy = nPolicy;
		modistatus = "yes";
	}else{modistatus = "no";}
	ruleBox.push({mark,noteK,ruletype,rulevalue,rulepolicy,rulenore,rulesni,"ori":x,modistatus})

};//rule解析结束

//host解析
if (/^#?(?:\*|localhost|[-*?0-9a-z]+\.[-*.?0-9a-z]+)\s*=\s*(?:sever\s*:\s*|script\s*:\s*)?[\s0-9a-z:/,.]+$/g.test(x)) {
		noteK = isNoteK(x);
		mark = getMark(y,body);
		hostdomain = x.split(/\s*=\s*/)[0];
		hostvalue = x.split(/\s*=\s*/)[1];
		hostBox.push({mark,noteK,hostdomain,hostvalue,"ori":x})
};

//脚本解析
	if (/script-path\s*=.+/.test(x)){
		mark = getMark(y,body);
		noteK = isNoteK(x);
		jsurl = getJsInfo(x, /script-path\s*=\s*/);
		jsname = /[=,]\s*type\s*=\s*/.test(x) ? x.split(/\s*=/)[0].replace(/^#/,"") : /,\s*tag\s*=\s*/.test(x) ? getJsInfo(x, /,\s*tag\s*=\s*/) : jsurl.substring(jsurl.lastIndexOf('/') + 1, jsurl.lastIndexOf('.') );
		jsfrom = "surge";
		jsurl = toJsc(jsurl,jscStatus,jsc2Status,jsfrom);
		jstype = /[=,]\s*type\s*=\s*/.test(x) ? getJsInfo(x, /[=,]\s*type\s*=/) : x.split(/\s+/)[0].replace(/^#/,"");
		eventname = getJsInfo(x, /[=,\s]\s*event-name\s*=\s*/);
		size = getJsInfo(x, /[=,\s]\s*max-size\s*=\s*/);
		proto = getJsInfo(x, /[=,\s]\s*binary-body-mode\s*=\s*/);
		jsptn = /[=,]\s*pattern\s*=\s*/.test(x) ? getJsInfo(x, /[=,]\s*pattern\s*=\s*/).replace(/"/g,'') : x.split(/\s+/)[1];
		jsptn = /cron|event|network-changed|generic|dns|rule/i.test(jstype) ? "" : jsptn;
		jsarg = getJsInfo(x, /[=,\s]\s*argument\s*=\s*/);
		rebody = getJsInfo(x, /[=,\s]\s*requires-body\s*=\s*/);
		wakesys = getJsInfo(x, /[=,\s]\s*wake-system\s*=\s*/);
		cronexp = /cronexpr?\s*=\s*/.test(x) ? getJsInfo(x, /[=,\s]\s*cronexpr?\s*=\s*/) : /cron\s*"/.test(x) ? x.split('"')[1] : '';
		ability = getJsInfo(x, /[=,\s]\s*ability\s*=\s*/);
		updatetime = getJsInfo(x, /[=,\s]\s*script-update-interval\s*=\s*/);
		timeout = getJsInfo(x, /[=,\s]\s*timeout\s*=\s*/);
		tilesicon = (jstype=="generic"&&/icon=/.test(x)) ? x.split("icon=")[1].split("&")[0] : "";
		tilescolor = (jstype=="generic"&&/icon-color=/.test(x)) ? x.split("icon-color=")[1].split("&")[0] : "";
		if (nTilesTarget != null){
	for (let i=0; i < nTilesTarget.length; i++) {
  const elem = nTilesTarget[i];
	if (x.indexOf(elem) != -1){
        tilescolor = ntilescolor[i].replace(/@/g,"#");   
            };};};
			
		if (nArgTarget != null){
	for (let i=0; i < nArgTarget.length; i++) {
  const elem = nArgTarget[i];
	if (x.indexOf(elem) != -1){
        jsarg = nArg[i].replace(/t;amp;/g,"&").replace(/t;add;/g,"+");   
            };};};
			
			if (nCron != null){
	for (let i=0; i < nCron.length; i++) {
  const elem = nCron[i];
	if (x.indexOf(elem) != -1){
        cronexp = ncronexp[i];   
            };};};
			jsBox.push({mark,noteK,jsname,jstype,jsptn,jsurl,rebody,proto,size,ability,updatetime,timeout,jsarg,cronexp,wakesys,tilesicon,tilescolor,eventname,"ori":x,"num":y})

};//脚本解析结束

//qx脚本解析
if (/\surl\s+script-/.test(x)){
	x = x.replace(/\s{2,}/g," ");
	mark = getMark(y,body);
	noteK = isNoteK(x);
	jstype = x.match(' url script-response') ? 'http-response' : 'http-request';
	urlInNum = x.split(/\s/).indexOf("url");
	jsptn = x.split(/\s/)[urlInNum - 1].replace(/^#/,"");
	jsurl = x.split(/\s/)[urlInNum + 2];
	jsfrom = "qx";
	jsname = jsurl.substring(jsurl.lastIndexOf('/') + 1, jsurl.lastIndexOf('.') );
	jsarg = "";
		jsurl = toJsc(jsurl,jscStatus,jsc2Status,jsfrom);
	rebody = /\sscript[^\s]*(-body|-analyze)/.test(x) ? 'true' : '';
	size = rebody == 'true' ? '-1' : '';
	proto = await isBinaryMode(jsurl,jsname);
			
		if (nArgTarget != null){
	for (let i=0; i < nArgTarget.length; i++) {
  const elem = nArgTarget[i];
	if (x.indexOf(elem) != -1){
        jsarg = nArg[i].replace(/t;amp;/g,"&").replace(/t;add;/g,"+");   
            };};};
	jsBox.push({mark,noteK,jsname,jstype,jsptn,jsurl,rebody,proto,size,"timeout":"60",jsarg,"ori":x,"num":y})
};//qx脚本解析结束

//qx cron脚本解析
if (/^[^\s]+\s+[^u\s]+\s+[^\s]+\s+[^\s]+\s+[^\s]+\s+([^\s]+\s+)?(https?|ftp|file):\/\//.test(x)){
	mark = getMark(y,body);
	noteK = isNoteK(x);
	cronexp = x.replace(/\s{2,}/g," ").split(/\s(https?|ftp|file)/)[0].replace(/^#/,'');
	jsurl = x.replace(/^#/,"")
				.replace(/\x20{2,}/g," ")
				.replace(cronexp,"")
				.split(/\s*,\s*/)[0]
				.trim();
	jsname = jsurl.substring(jsurl.lastIndexOf('/') + 1, jsurl.lastIndexOf('.') );
	jsfrom = "qx";
	jsurl = toJsc(jsurl,jscStatus,jsc2Status,jsfrom);
	jsarg = "";
		
		if (nCron != null){
	for (let i=0; i < nCron.length; i++) {
  const elem = nCron[i];
	if (x.indexOf(elem) != -1){
        cronexp = ncronexp[i];   
            };};};
			
			if (nArgTarget != null){
	for (let i=0; i < nArgTarget.length; i++) {
  const elem = nArgTarget[i];
	if (x.indexOf(elem) != -1){
        jsarg = nArg[i].replace(/t;amp;/g,"&").replace(/t;add;/g,"+");   
            };};};
	jsBox.push({mark,noteK,jsname,"jstype":"cron","jsptn":"",cronexp,jsurl,"wakesys":"1","timeout":"60",jsarg,"ori":x,"num":y})

};//qx cron 脚本解析结束

//mock 解析
if (/url\s+echo-response\s|\sdata\s*=\s*"/.test(x)){
		mark = getMark(y,body);
		getMockInfo(x,mark,y);
};

};//for await循环结束

//去重
	let obj = {};
	
	inBox = [...new Set(inBox)];
	
	outBox = [...new Set(outBox)];
	
	hnBox = [...new Set(hnBox)];
	
	fheBox = [...new Set(fheBox)];
	
	skipBox = [...new Set(skipBox)];
	
	realBox = [...new Set(realBox)];
	
	ruleBox = [...new Set(ruleBox)];
	
	
		modInfoBox = modInfoBox.reduce((curr, next) => {
      /*判断对象中是否已经有该属性  没有的话 push 到 curr数组*/
      obj[next.a] ? '' : obj[next.a] = curr.push(next);
      return curr;
    }, []);
	
    modInputBox = modInputBox.reduce((curr, next) => {
      /*判断对象中是否已经有该属性  没有的话 push 到 curr数组*/
      obj[next.a + next.b] ? '' : obj[next.a + next.b] = curr.push(next);
      return curr;
    }, []);
	
    hostBox = hostBox.reduce((curr, next) => {
      /*判断对象中是否已经有该属性  没有的话 push 到 curr数组*/
      obj[next.hostdomain] ? '' : obj[next.hostdomain] = curr.push(next);
      return curr;
    }, []);
	
    rwBox = rwBox.reduce((curr, next) => {
      /*判断对象中是否已经有该属性  没有的话 push 到 curr数组*/
      obj[next.rwptn] ? '' : obj[next.rwptn] = curr.push(next);
      return curr;
    }, []);
	
    jsBox = jsBox.reduce((curr, next) => {
      /*判断对象中是否已经有该属性  没有的话 push 到 curr数组*/
      obj[next.jstype + next.jsptn + next.jsurl] ? '' : obj[next.jstype + next.jsptn + next.jsurl] = curr.push(next);
      return curr;
    }, []);
	
    mockBox = mockBox.reduce((curr, next) => {
      /*判断对象中是否已经有该属性  没有的话 push 到 curr数组*/
      obj[next.mockptn] ? '' : obj[next.mockptn] = curr.push(next);
      return curr;
    }, []);//去重结束

//$.log($.toStr(hnBox))
	
inBox = (inBox[0] || '') && `已根据关键词保留以下内容:\n${inBox.join("\n\n")}`;
outBox = (outBox[0] || '') && `已根据关键词排除以下内容:\n${outBox.join("\n")}`;

inBox.length != 0 && noNtf == false && $.msg('Script Hub: 重写转换','点击通知查看详情',`${inBox}`,{url:url+'&openInBoxHtml=true'});
outBox.length != 0 && noNtf == false && $.msg('Script Hub: 重写转换','点击通知查看详情',`${outBox}`,{url:url+'&openOutBoxHtml=true'});

//mitm删除主机名
if (hnDel != null && hnBox.length != 0) hnBox=hnBox.filter(function(item) {
    return hnDel.indexOf(item) == -1
});

//mitm正则删除主机名
if (hnRegDel != null) {
	
	hndelBox=hnBox.filter(function(item) {
    return hnRegDel.test(item)
});
	hnBox=hnBox.filter(function(item) {
    return !hnRegDel.test(item)
});
};
hndelBox.length != 0 && noNtf == false && $.msg('Script Hub: 重写转换','已根据正则剔除主机名',`${hndelBox}`);

	hnBox = pieceHn(hnBox);
	fheBox = pieceHn(fheBox);
	skipBox = pieceHn(skipBox);
	realBox = pieceHn(realBox);
	if (synMitm) fheBox = hnBox;
	
//模块信息输出
switch (targetApp){
	case "surge-module":
	case "shadowrocket-module":
	case "loon-plugin":
	for (let i=0;i<modInfoBox.length;i++){
		info = "#!"+modInfoBox[i].a+modInfoBox[i].b;
		if (nName!=null && /#!name\s*=/.test(info)) info = "#!name="+name;
		if (nName!=null && /#!desc\s*=/.test(info)) info = "#!desc="+desc;
		if (isLooniOS && iconReplace=="启用" && /#!icon\s*=.+/.test(info)) info = icon;
		modInfo.push(info);
	};//for

	for (let i=0;i<modInputBox.length;i++){
		info = "#!"+modInputBox[i].a+modInputBox[i].b;
		modInfo.push(info);
	};//for

	if ($.toStr(modInfo).search(/#!name=/) == -1) modInfo.push("#!name="+name);
	if ($.toStr(modInfo).search(/#!desc=/) == -1) modInfo.push("#!desc="+desc);
	if (isLooniOS && modInfo.length != 0 && $.toStr(modInfo).search(/#!icon=/) == -1) modInfo.push(icon);
	break;
	
	case "stash-stoverride":
	for (let i=0;i<modInfoBox.length;i++){
		info = modInfoBox[i].a.replace(/\s*=\s*/,'')+': "'+modInfoBox[i].b+'"';
		if (nName!=null && /^name:\s*"/.test(info)) info = 'name: "'+name+'"';
		if (nName!=null && /^desc:\s*"/.test(info)) info = 'desc: "'+desc+'"';
		modInfo.push(info);
		};//for
	if ($.toStr(modInfo).search(/name:\s/) == -1) modInfo.push('name: "'+name+'"');
	if ($.toStr(modInfo).search(/desc:\s/) == -1) modInfo.push('desc: "'+desc+'"');

	break;
};//模块信息输出结束

//rule输出 switch不适合
	for (let i=0;i<ruleBox.length;i++){
		noteK = ruleBox[i].noteK ? "#" : "";
		mark = ruleBox[i].mark ? ruleBox[i].mark+"\n" : "";	
		if (noteK != "#" && isStashiOS){
noteKn8 = "\n        ";noteKn6 = "\n      ";noteKn4 = "\n    ";noteK4 = "    ";noteK2 = "  ";
	}else{noteKn8 = "\n#        ";noteKn6 = "\n#      ";noteKn4 = "\n#    ";noteK4 = "#    ";noteK2 = "#  ";};
		ruletype = ruleBox[i].ruletype.toUpperCase();
		rulevalue = ruleBox[i].rulevalue ? ruleBox[i].rulevalue : "";
		rulepolicy = ruleBox[i].rulepolicy ? ruleBox[i].rulepolicy : "";
		rulepolicy = /direct|reject/i.test(rulepolicy) ? rulepolicy.toUpperCase() : rulepolicy;
		rulenore = ruleBox[i].rulenore ? ruleBox[i].rulenore : "";
		rulesni = ruleBox[i].rulesni ? ruleBox[i].rulesni : "";
		rulesni = isLooniOS ||isStashiOS ? "" : rulesni;
		modistatus = ruleBox[i].modistatus;
		if (/de?st-port/i.test(ruletype)){
			ruletype = isSurgeiOS ? "DEST-PORT" : "DST-PORT";
		};
		if (/reject-video/i.test(rulepolicy)&& !isLooniOS){
			rulepolicy = "REJECT-TINYGIF";
		};
		if (/reject-tinygif|reject-no-drop/i.test(rulepolicy)&& isLooniOS){
			rulepolicy = "REJECT-IMG";
		};
		if (/reject-(?:dict|array|img)/i.test(rulepolicy)&&isSurgeiOS){
			rulepolicy = "REJECT-TINYGIF"
		};
		if (/reject-/i.test(rulepolicy)&& !/url-regex/i.test(ruletype)&&isStashiOS){
			rulepolicy = "REJECT";
		};

		if (rulevalue=="" || rulepolicy==""){
			otherRule.push(ruleBox[i].ori)
		} else if(/proxy/i.test(rulepolicy)&&modistatus=="no"&&(isSurgeiOS||isStashiOS||isShadowrocket)){
otherRule.push(ruleBox[i].ori)
		} else if(!/direct|reject|proxy/i.test(rulepolicy)&&modistatus=="no"){
otherRule.push(ruleBox[i].ori)
		} else if (/^(?:and|or|not|protocol|domain-set|rule-set)$/i.test(ruletype) && isSurgeiOS) {
			rules.push(mark+noteK+ruletype+","+rulevalue+","+rulepolicy+rulenore+rulesni)
		}else if (/^(?:and|or|not|domain-set|rule-set)$/i.test(ruletype) && isShadowrocket) {
			rules.push(mark+noteK+ruletype+","+rulevalue+","+rulepolicy+rulenore+rulesni)
		}else if (/(?:^domain$|domain-suffix|domain-keyword|ip-|user-agent|url-regex)/i.test(ruletype)&&!isStashiOS){
			rulevalue = /,/.test(rulevalue) ? '"'+rulevalue+'"' : rulevalue;
			rules.push(mark+noteK+ruletype+','+rulevalue+','+rulepolicy+rulenore+rulesni)
		}else if (/(?:^domain$|domain-suffix|domain-keyword|ip-|de?st-port)/i.test(ruletype)&&isStashiOS){
			rules.push(mark+noteK2+'- '+ruletype+','+rulevalue+','+rulepolicy+rulenore)}else if (/de?st-port/.test(ruletype)&&(isSurgeiOS&&isShadowrocket)){rules.push(mark+noteK+ruletype+','+rulevalue+','+rulepolicy)}else if (/url-regex/i.test(ruletype)&&isStashiOS&&/reject/i.test(rulepolicy)){
				if (/DICT/i.test(rulepolicy)){
                    Urx2Reject = '-dict';
                }else if (/ARRAY/i.test(rulepolicy)){
                    Urx2Reject = '-array';
                }else if (/DROP|video/i.test(rulepolicy)){
                    Urx2Reject = '-200';
                }else if (/IMG$|TINYGIF$/i.test(rulepolicy)){
                    Urx2Reject = '-img';
                }else if (/REJECT$/i.test(rulepolicy)){
                    Urx2Reject = '';
                };
				
				URLRewrite.push(mark+noteK4+'- >-'+noteKn6+rulevalue+' - reject'+Urx2Reject)
			}else{otherRule.push(ruleBox[i].ori)};
		
	};//for rule输出结束

//reject redirect输出
for (let i=0;i<rwBox.length;i++){
		noteK = rwBox[i].noteK ? "#" : "";
		mark = rwBox[i].mark ? rwBox[i].mark+"\n" : "";
		rwtype = rwBox[i].rwtype;
		rwptn = rwBox[i].rwptn;
		rwvalue = rwBox[i].rwvalue;
		
switch (targetApp){
	case "loon-plugin":
	case "shadowrocket-module":
	rwtype = isShadowrocket && /-video/.test(rwtype) ? 'reject-img' : isLooniOS && /-tinygif/.test(rwtype) ? 'reject-img' : rwtype;
	URLRewrite.push(mark+noteK+rwptn+" "+rwvalue+" "+rwtype);
	break;
	
	case "stash-stoverride":
		if (noteK != "#"){
noteKn8 = "\n        ";noteKn6 = "\n      ";noteKn4 = "\n    ";noteK4 = "    ";noteK2 = "  ";
	}else{noteKn8 = "\n#        ";noteKn6 = "\n#      ";noteKn4 = "\n#    ";noteK4 = "#    ";noteK2 = "#  ";};
	URLRewrite.push(mark+noteK4+"- >-"+noteKn6+rwptn+" "+rwvalue+" "+rwtype.replace(/-video|-tinygif/,"-img"));
	break;
	
	case "surge-module":
		if (/(?:reject|302|307|header)$/.test(rwtype)) 	URLRewrite.push(mark+noteK+rwptn+" "+rwvalue+" "+rwtype);
		if (/reject-dict/.test(rwtype)) MapLocal.push(mark+noteK+rwptn+' data="https://raw.githubusercontent.com/mieqq/mieqq/master/reject-dict.json"');
		if (/reject-array/.test(rwtype)) MapLocal.push(mark+noteK+rwptn+' data="https://raw.githubusercontent.com/mieqq/mieqq/master/reject-array.json"');
		if (/reject-200/.test(rwtype)) MapLocal.push(mark+noteK+rwptn+' data="https://raw.githubusercontent.com/mieqq/mieqq/master/reject-200.txt"');
		if (/reject-(?:img|tinygif|video)/.test(rwtype)) MapLocal.push(mark+noteK+rwptn+' data="https://raw.githubusercontent.com/mieqq/mieqq/master/reject-img.gif"');
	break;
}//switch
};//reject redirect输出for

//headerRewrite输出
switch (targetApp){
	case "surge-module":
	HeaderRewrite = rwhdBox;
	break;
	
	case "loon-plugin":
	for (let i=0;i<rwhdBox.length;i++){
		URLRewrite.push(rwhdBox[i].replace(/^(#)?http-(?:request|response)\s*/,"$1"));
	};//for
	break;
	
	case "stash-stoverride":
	for (let i=0;i<rwhdBox.length;i++){
		if (!/^#/.test(rwhdBox[i])){
noteKn8 = "\n        ";noteKn6 = "\n      ";noteKn4 = "\n    ";noteK4 = "    ";noteK2 = "  ";
	}else{noteKn8 = "\n#        ";noteKn6 = "\n#      ";noteKn4 = "\n#    ";noteK4 = "#    ";noteK2 = "#  ";};
		hdtype = /^#?http-response\s/.test(x) ? ' response-' : ' request-';
		HeaderRewrite.push(`${noteK4}- >-${noteKn6}`+rwhdBox[i].replace(/^#?http-(?:request|response)\s*/,"").replace(/\sheader-/,hdtype));
	};//for
	break;
	
	case "shadowrocket-module":
	
rwhdBox = (rwhdBox[0] || '') && `${rwhdBox.join("\n")}`;
	rwhdBox.length != 0 && noNtf == false && $.msg('Script Hub: 重写转换','❌小火箭不支持HeaderRewrite',`${rwhdBox}`);
	break;
};//headerRewrite输出结束

//host输出
	for (let i=0;i<hostBox.length;i++){
		noteK = hostBox[i].noteK ? "#" : "";
		mark = hostBox[i].mark ? hostBox[i].mark+"\n" : "";
		hostdomain = hostBox[i].hostdomain;
		hostvalue = hostBox[i].hostvalue;
		if (isStashiOS) {
			otherRule.push(hostBox[i].ori)
		}else if (isLooniOS && /script\s*:\s*/.test(hostvalue)){
			otherRule.push(hostBox[i].ori)
		}else if (isSurgeiOS || isShadowrocket || isLooniOS){
	host.push(mark+noteK+hostdomain+' = '+hostvalue)
		};
	};//for

//脚本输出
if (!isStashiOS && jsBox.length>0){

for (let i=0;i<jsBox.length;i++){
		noteK = jsBox[i].noteK ? "#" : "";
		mark = jsBox[i].mark ? jsBox[i].mark+"\n" : "";	
		jstype = jsBox[i].jstype;
		jsptn = /generic|event|dns|rule|network-changed/.test(jstype) ? "" : jsBox[i].jsptn;
		jsptn = isLooniOS && jsptn ? " " + jsptn : jsptn;
		if (/,/.test(jsptn) && isSurgeiOS) jsptn = '"'+jsptn+'"';
		if ((isSurgeiOS||isShadowrocket)&&jsptn!="") jsptn = ', pattern='+jsptn;
		jsname = jsBox[i].jsname;
		eventname = jsBox[i].eventname ? ', event-name='+jsBox[i].eventname :', event-name=network-changed';
		jstype = isLooniOS && /event/.test(jstype) ? 'network-changed' : !isLooniOS && /network-changed/.test(jstype) ? 'event' : jstype;
		jsurl = jsBox[i].jsurl;
		rebody = jsBox[i].rebody ? istrue(jsBox[i].rebody) : "";
		proto = jsBox[i].proto ? istrue(jsBox[i].proto) : "";
		size = jsBox[i].size ? jsBox[i].size : "";
		ability = jsBox[i].ability ? ", ability="+jsBox[i].ability : "";
		updatetime = jsBox[i].updatetime ? ", script-update-interval="+jsBox[i].updatetime : "";
		cronexp = jsBox[i].cronexp;
		wakesys = jsBox[i].wakesys ? ", wake-system="+jsBox[i].wakesys : "";
		timeout = jsBox[i].timeout ? jsBox[i].timeout : "";
		jsarg = jsBox[i].jsarg ? jsBox[i].jsarg : "";

switch (targetApp){
	case "surge-module":
	case "shadowrocket-module":
	case "loon-plugin":
	
		rebody = rebody ? ", requires-body="+rebody : "";
		proto = proto ? ", binary-body-mode="+proto : "";
		size = size ? ", max-size="+size : "";
		ability = ability ? ", ability="+ability : "";
		updatetime = updatetime ? ", script-update-interval="+updatetime : "";
		wakesys = wakesys ? ", wake-system="+wakesys : "";
		timeout = timeout ? ", timeout="+timeout : "";
		if (jsarg != "" && /,/.test(jsarg)) jsarg = ', argument="'+jsarg+'"';
		if (jsarg != "" && !/,/.test(jsarg)) jsarg = ', argument='+jsarg;
		
		if (/generic/.test(jstype) && isShadowrocket){
			otherRule.push(jsBox[i].ori);
		}else if (/request|response|network-changed|generic/.test(jstype) && isLooniOS) {
			script.push(mark+noteK+jstype+jsptn+" script-path="+jsurl+rebody+proto+timeout+", tag="+jsname+jsarg);
		}else if (/request|response|generic/.test(jstype) && (isSurgeiOS || isShadowrocket)){
			script.push(mark+noteK+jsname+" = type="+jstype+jsptn+", script-path="+jsurl+rebody+proto+size+ability+updatetime+timeout+jsarg);
		}else if (jstype == "event" && (isSurgeiOS || isShadowrocket)){
			 script.push(mark+noteK+jsname+" = type="+jstype+eventname+", script-path="+jsurl+ability+updatetime+timeout+jsarg);
		}else if (jstype =="cron" && (isSurgeiOS || isShadowrocket)){
			 script.push(mark+noteK+jsname+' = type='+jstype+', cronexp="'+cronexp+'"'+', script-path='+jsurl+updatetime+timeout+wakesys+jsarg);
		}else if (jstype =="cron" && isLooniOS){
			script.push(mark+noteK+jstype+' "'+cronexp+'"'+" script-path="+jsurl+timeout+', tag='+jsname+jsarg);
		}else if(/dns|rule/.test(jstype)&&(isSurgeiOS||isShadowrocket)){
			script.push(mark+noteK+jsname+" = type="+jstype+", script-path="+jsurl+updatetime+timeout+jsarg)
		}else{
			otherRule.push(jsBox[i].ori)};
			
		if (isSurgeiOS && jstype == "generic"){
			 Panel.push(noteK+jsname+" = script-name="+jsname+", update-interval=3600")
		};
	break;
	}//switch
}//脚本输出for
};//不是Stash的脚本输出

if (isStashiOS && jsBox.length>0) {
//处理脚本名字
let urlMap = {};

for (let i = 0; i < jsBox.length; i++) {
  let url = jsBox[i].jsurl;
  jsBox[i].jsname = jsBox[i].jsname + '_' + jsBox[i].num;

  if (urlMap[url]) {
    jsBox[i].jsname = urlMap[url];
  } else {
    urlMap[url] = jsBox[i].jsname;
  }
};

for (let i = 0; i < jsBox.length; i++) {
		if (jsBox[i].noteK != "#"){
noteKn8 = "\n        ";noteKn6 = "\n      ";noteKn4 = "\n    ";noteK4 = "    ";noteK2 = "  ";
	}else{noteKn8 = "\n#        ";noteKn6 = "\n#      ";noteKn4 = "\n#    ";noteK4 = "#    ";noteK2 = "#  ";};
		jstype = jsBox[i].jstype.replace(/http-/,'');
		mark = jsBox[i].mark ? jsBox[i].mark+"\n" : "";	
		jsptn = jsBox[i].jsptn;
		jsname = jsBox[i].jsname;
		jsurl = jsBox[i].jsurl;
		rebody = jsBox[i].rebody ? noteKn6+"require-body: "+istrue(jsBox[i].rebody) : "";
		proto = jsBox[i].proto ? noteKn6+"binary-mode: "+istrue(jsBox[i].proto) : "";
		size = jsBox[i].size ? noteKn6+"max-size: "+jsBox[i].size : "";
		cronexp = jsBox[i].cronexp;
		timeout = jsBox[i].timeout ? noteKn6+"timeout: "+jsBox[i].timeout : "";
		jsarg = jsBox[i].jsarg ? jsBox[i].jsarg : "";
		jsarg = jsarg && jstype == "generic" ? noteKn4+"argument: |-"+noteKn6+jsarg : jsarg && jstype != "generic" ? noteKn6+"argument: |-"+noteKn8+jsarg : "";
		tilesicon = jsBox[i].tilesicon ? jsBox[i].tilesicon : "";
		tilescolor = jsBox[i].tilescolor ? jsBox[i].tilescolor : "";
		
		if (/request|response/.test(jstype)){
			script.push(mark+noteKn4+'- match: '+jsptn+noteKn6+'name: "'+jsname+'"'+noteKn6+'type: '+jstype+rebody+size+proto+timeout+jsarg);
		providers.push(`${noteK2}"`+jsname+'":'+`${noteKn4}url: `+jsurl+`${noteKn4}interval: 86400`);
		};
		if (jstype=="cron"){
			cron.push(mark+`${noteKn4}- name: "` + jsname + `"${noteKn6}cron: "` + cronexp + `"${timeout}` + jsarg);
		providers.push(`${noteK2}"` + jsname + '":' + `${noteKn4}url: ` + jsurl + `${noteKn4}interval: 86400`);
		};
		if (jstype=="generic") {
			tiles.push(
					mark+`${noteK2}- name: "${jsname}"${noteKn4}interval: 3600${noteKn4}title: "${jsname}"${noteKn4}icon: "${tilesicon}"${noteKn4}backgroundColor: "${tilescolor}"${noteKn4}timeout: 30${jsarg}`);
			providers.push(
					`${noteK2}"${jsname}":${noteKn4}url: ${jsurl}${noteKn4}interval: 86400`);
		};
			/event|rule|dns/i.test(jstype) && otherRule.push(jsBox[i].ori);
};//for循环

}//是Stash的脚本输出

//Mock输出
for (let i=0;i<mockBox.length;i++){
		noteK = mockBox[i].noteK ? "#" : "";
		mark = mockBox[i].mark ? mockBox[i].mark+"\n" : "";	
		mockptn = mockBox[i].mockptn;
		mockurl = mockBox[i].mockurl;

switch (targetApp){
	case "surge-module":
		mockheader = keepHeader == true && mockBox[i].mockheader && !/&contentType=/.test(mockBox[i].mockheader) ? ' header="'+mockBox[i].mockheader+'"' : "";
	MapLocal.push(mark+noteK+mockptn+' data="'+mockurl+'"'+mockheader)
	break;

	case "shadowrocket-module":
	case "loon-plugin":
	case "stash-stoverride":
		if (isStashiOS && noteK!="#"){
noteKn8 = "\n        ";noteKn6 = "\n      ";noteKn4 = "\n    ";noteK4 = "    ";noteK2 = "  ";
	}else{noteKn8 = "\n#        ";noteKn6 = "\n#      ";noteKn4 = "\n#    ";noteK4 = "#    ";noteK2 = "#  ";};
		mockheader = mockBox[i].mockheader ? mockBox[i].mockheader : "";
		mfile = mockurl.substring(mockurl.lastIndexOf('/') + 1);
		mfName = mockurl.substring(mockurl.lastIndexOf('/') + 1, mockurl.lastIndexOf('.') );
		mocknum = mockBox[i].mocknum;
		if (/dict/i.test(mfName)) m2rType="-dict"
		else if (/array/i.test(mfName)) m2rType="-array"
		else if (/200|blank/i.test(mfName)) m2rType="-200"
		else if (/img|tinygif/i.test(mfName)) m2rType="-img"
		else m2rType = null;
		
		m2rType != null && !isStashiOS && URLRewrite.push(mark+noteK+mockptn+' - reject'+m2rType);
		m2rType != null && isStashiOS && URLRewrite.push(mark+noteK4+'- >-'+noteKn6+mockptn+' - reject'+m2rType);
		mockheader = m2rType == null && mockheader != "" && !/&contentType=/.test(mockheader) ? '&header=' + encodeURIComponent(mockheader) : m2rType == null && mockheader != "" && /&contentType=/.test(mockheader) ? mockheader : "" ;
		if (keepHeader == false) mockheader="";
		
		mockurl = m2rType == null ? `http://script.hub/convert/_start_/${mockurl}/_end_/${mfile}?type=mock&target-app=${targetApp}${mockheader}${sufkeepHeader}${sufjsDelivr}` : "";
		
		if (isStashiOS && m2rType==null) {
		script.push(mark+`${noteK4}- match: ${mockptn}${noteKn6}name: "${mfName}_${mocknum}"${noteKn6}type: request${noteKn6}timeout: 60${noteKn6}binary-mode: true`)
		
		providers.push(`${noteK2}"${mfName}_${mocknum}":${noteKn4}url: ${mockurl}${noteKn4}interval: 86400`)};
		
		if ((isLooniOS || isShadowrocket)&&m2rType==null){
		script.push(mark+`${noteK}http-request ${mockptn} script-path=${mockurl}, timeout=60, tag=${mfName}`)
		};
	break;
	
	}//switch
}//Mock输出for

//输出内容
switch (targetApp){
	case "surge-module":
	case "shadowrocket-module":
	case "loon-plugin":
	
	modInfo = (modInfo[0] || '') && `${modInfo.join("\n")}`.replace(/([\s\S]*)(#!desc=.+\n?)([\s\S]*)/,'$2\n$1\n$3').replace(/([\s\S]*)(#!name=.+\n?)([\s\S]*)/,'$2\n$1\n$3').replace(/\n{2,}/g,'\n');
    
    rules = (rules[0] || '') && `[Rule]\n\n${rules.join("\n")}`;
	
    Panel = (Panel[0] || '') && `[Panel]\n\n${Panel.join("\n\n")}`;
	
	URLRewrite = (URLRewrite[0] || '') && `[URL Rewrite]\n\n${URLRewrite.join("\n")}`;
	
	HeaderRewrite = (HeaderRewrite[0] || '') && `[Header Rewrite]\n\n${HeaderRewrite.join("\n")}`;
	
	MapLocal = (MapLocal[0] || '') && `[Map Local]\n\n${MapLocal.join("\n\n")}`;
	
    host = (host[0] || '') && `[Host]\n\n${host.join("\n")}`;
	
    script = (script[0] || '') && `[Script]\n\n${script.join("\n\n")}`;
	
	if (isLooniOS) {
		MITM = hnBox.length != 0 ? "[MITM]\n\nhostname = "+hnBox : "";
		fheBox.length != 0 && General.push('force-http-engine-hosts = '+fheBox);
		skipBox.length != 0 && General.push('skip-proxy = '+skipBox);
		realBox.length != 0 && General.push('real-ip = '+realBox);
    General = (General[0] || '') && `[General]\n\n${General.join("\n\n")}`;
	};
	
	if (isSurgeiOS||isShadowrocket) {
		MITM = hnBox.length != 0 ? `[MITM]\n\nhostname = ${hnaddMethod} `+hnBox : "";
		fheBox.length != 0 && General.push(`force-http-engine-hosts = ${fheaddMethod} `+fheBox);
		skipBox.length != 0 && General.push(`skip-proxy = ${skipaddMethod} `+skipBox);
		realBox.length != 0 && General.push(`always-real-ip = ${realaddMethod} `+realBox);
    General = (General[0] || '') && `[General]\n\n${General.join("\n\n")}`;
	};
	

body = `${modInfo}

${General}

${MITM}

${rules}

${URLRewrite}

${HeaderRewrite}

${MapLocal}

${Panel}

${host}

${script}

`.replace(/^(#.+\n)\n+(?!\[)/g,'$1')
		.replace(/\n{2,}/g,'\n\n')	
	
	break;
	
	case "stash-stoverride":
	
	modInfo = (modInfo[0] || '') && `${modInfo.join("\n")}`.replace(/([\s\S]*)(desc: .+\n?)([\s\S]*)/,'$2\n$1\n$3').replace(/([\s\S]*)(name: .+\n?)([\s\S]*)/,'$2\n$1\n$3').replace(/\n{2,}/g,'\n');;
	
	tiles = (tiles[0] || '') && `tiles:\n${tiles.join("\n\n")}`;
	
	MITM = hnBox.length != 0 ? '  mitm:\n    - "'+hnBox+'"' : "";
	
	force = fheBox.length != 0 ? '  force-http-engine:\n    - "'+fheBox+'"' : "";
    
    rules = (rules[0] || '') && `rules:\n${rules.join("\n")}`;
		
	URLRewrite = (URLRewrite[0] || '') && `  url-rewrite:\n${URLRewrite.join("\n")}`;
	
	HeaderRewrite = (HeaderRewrite[0] || '') && `  header-rewrite:\n${HeaderRewrite.join("\n")}`;
	script = (script[0] || '') && `  script:\n${script.join("\n\n")}`;
	
	if (URLRewrite.length != 0 || script.length != 0 || HeaderRewrite.length != 0 || MITM.length != 0 || force.length != 0){
httpFrame = `http:

${force}

${MITM}

${HeaderRewrite}

${URLRewrite}

${script}
`
};
	providers = [...new Set(providers)];

cron = (cron[0] || '') && `cron:\n  script:\n${cron.join("\n")}`;

providers = (providers[0] || '') && `script-providers:\n${providers.join("\n")}`;
	

body = `${modInfo}

${rules}

${httpFrame}

${tiles}

${cron}

${providers}

`.replace(/^(#.+\n)\n+(?!\[)/g,'$1')
		.replace(/\n{2,}/g,'\n\n')	
	
	break;

};//输出内容结束

eval(evJsmodi);
eval(evUrlmodi);
		
otherRule = (otherRule[0] || '') && `${app}不支持以下内容:\n${otherRule.join("\n")}`;

noNtf == false && otherRule.length != 0 && $.msg('Script Hub: 重写转换',`点击通知查看详情`,`${otherRule}`,{url:url+'&openOtherRuleHtml=true'});

if (openInBoxHtml||openOutBoxHtml||openOtherRuleHtml){
	$.done({
  response: {
    status: 200,
    body: inBox+'\n\n'+outBox+'\n\n'+otherRule,
    headers: {'Content-Type': 'text/plain; charset=utf-8'},
  },
})
}else{
	
$.done({ response: { status: 200 ,body:body ,headers: {'Content-Type': 'text/plain; charset=utf-8'} } });
};


})()
.catch((e) => {
	noNtf == false && $.msg(`Script Hub: 重写转换`,`${notifyName}：${e}\n${url}`,'','https://t.me/zhetengsha_group');
		result = {
      response: {
        status: 500,
        body: `${notifyName}：${e}\n\n\n\n\n\nScript Hub 重写转换: ❌  可自行翻译错误信息或复制错误信息后点击通知进行反馈
`,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST,GET,OPTIONS,PUT,DELETE',
          'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
        },
      },
    }
	$.done(result);
	})

//判断是否被注释
function isNoteK (x) {
		return /^#/.test(x) ? "#" : "";
}

//获取当前内容的注释
function getMark (index,obj) {
		return obj[index - 1]?.match(/^#(?!!)/) ? obj[index - 1] : "";
}

//名字简介解析
function getModInfo (x,box) {
	x = x.replace(/\s*=\s*/,'=');
	/^#!.+=.+/.test(x) ? a = x.replace(/^#!/,"").match(/.+?=/)[0] : "";
	/^#!.+=.+/.test(x) ? b = x.replace(/^#!/,"").replace(a,"") : "";
	box.push({a,b});
};

//reject
function rw_reject (x,mark) {
	noteK = isNoteK(x);
	rwptn = x.replace(/^#/,"").split(/\s/)[0];
	rwtype = x.match(/reject(-\w+)?$/i)[0].toLowerCase();
	
rwBox.push({mark,noteK,rwptn,"rwvalue":"-",rwtype});
};

//重定向
function rw_redirect (x,mark) {
	noteK = isNoteK(x);
	x = x.replace(/\s{2,}/g," ");
	redirect_type = x.match(/\s302|\s307|\sheader$/)[0].replace(/\s/,"");
	xArr = x.split(/\s/);
	rw_typeInNum = xArr.indexOf(redirect_type);
	if (rw_typeInNum == "2" && xArr.length == 3) {
		rwptn = xArr[0].replace(/^#/,"");
		rwvalue = xArr[1];
		rwtype = xArr[2];
	};
	
	if (rw_typeInNum == "1" && xArr.length == 3) {
		rwptn = xArr[0].replace(/^#/,"");
		rwvalue = xArr[2];
		rwtype = xArr[1];
	};
	
	if (rw_typeInNum == "2" && xArr.length == 4) {
		rwptn = xArr[0].replace(/^#/,"");
		rwvalue = xArr[3];
		rwtype = xArr[2];
	};
rwBox.push({mark,noteK,rwptn,rwvalue,rwtype});
};

//script
function getJsInfo (x, regx) {
	if (regx.test(x)){
		return x.split(regx)[1].split(jsRegx)[0].replace(/^"(.+)"$/,"$1");
	}else{return ""}
};

function getQxReInfo (x,y,mark) {
	noteK = isNoteK(x);
	retype = /\surl\s+request-/i.test(x) ? 'request' : 'response';
	jstype = 'http-'+retype;
	hdorbd = /\surl\s+re[^\s]+?-header\s/i.test(x) ? 'header' : 'body';
	breakpoint = retype+'-'+hdorbd;
	jsptn = x.split(/\s+url\s+re/)[0].replace(/^#/,'');
	jsname = /body/.test(hdorbd) ? 'replaceBody' : 'replaceHeader';
	jsurl = /header/.test(hdorbd) ? 'https://raw.githubusercontent.com/Script-Hub-Org/Script-Hub/main/scripts/replace-header.js' : 'https://raw.githubusercontent.com/Script-Hub-Org/Script-Hub/main/scripts/replace-body.js';
	rearg1 = x.split(breakpoint)[1].trim().replace(/^"(.+)"$/,"$1");
	rearg2 = x.split(breakpoint)[2].trim().replace(/^"(.+)"$/,"$1");
	jsarg = rearg1+'->'+rearg2;
	rebody = /body/.test(hdorbd) ? 'true' : '';
	size = /body/.test(hdorbd) ? '3145728' : '';
	jsBox.push({mark,noteK,jsname,jstype,jsptn,jsurl,rebody,size,"timeout":"30",jsarg,"num":y})
};

function getHn (x,arr,addMethod) {
	hnBox2 = x.replace(/\s|%.+%/g,"").split("=")[1].split(/,/);
	for (let i=0;i<hnBox2.length;i++){
		arr.push(hnBox2[i]);
	};//for
	if (/%INSERT%/i.test(x)) return "%INSERT%"
	else return addMethod;
};

function pieceHn (arr){
	if (!isStashiOS && arr.length > 0) return arr.join(', ');
	else if (isStashiOS && arr.length > 0) return arr.join(`"\n    - "`);
	else return [];
};

//查binary
async function isBinaryMode(url,name) {

if (/proto/i.test(name)) {
	return "true"
  } else if (/(?:tieba|youtube|bili|spotify|wyreqparam)/i.test(url)){
		if (binaryInfo.length != 0 && binaryInfo.some(item=>item.url===url)){
			for (let i = 0; i < binaryInfo.length; i++) {
  if (binaryInfo[i].url === url) {
    binarymode = binaryInfo[i].binarymode;
		return binarymode;
    break;
  }
}
		} else {
			const res = (await $.http.get(url)).body;
	if (res == undefined || res == null){
		//$.log("Script Hub: 重写转换");
		return "";
	}else if (res.includes(".bodyBytes")){
		binaryInfo.push({url,"binarymode":"true"});
		$.setjson(binaryInfo, "Parser_binary_info")
		return "true";
	}else{binaryInfo.push({url,"binarymode":""});
		$.setjson(binaryInfo, "Parser_binary_info")
		return "";}     }//没有信息或者没有url的信息
		
	}else {return ""}
};//查binary

//获取mock参数
function getMockInfo (x,mark,y) {
	noteK = isNoteK(x);
	if (/url\s+echo-response\s/.test(x)){
		x = x.replace(/\s{2,}/g," ");
		mockptn = x.split(" url ")[0];
		mockurl = x.split(" echo-response ")[2];
		mockheader = '&contentType=' + encodeURIComponent(x.split(" echo-response ")[1]);
	};
		
	if (/\sdata\s*=\s*"/.test(x)){
		mockptn = x.replace(/\s{2,}/g," ").split(/\sdata=/)[0].replace(/^#|"/g,"");
		mockurl = x.split(' data="')[1].split('"')[0];
		/\sheader="/.test(x) ? mockheader = x.split(' header="')[1].split('"')[0] : mockheader = "";
		}
mockBox.push({mark,noteK,mockptn,mockurl,mockheader,"mocknum":y});
};//获取Mock参数

function istrue(str) {
	if (str == true || str == 1 || str == "true"|| str == "1"){
		return true;
	}else{return false;}
};

function isJsCon (x, arr) {
	if (arr != null){
		for (let i=0; i < arr.length; i++) {
  const elem = arr[i];
	if (x.indexOf(elem) != -1){return true};
	};//循环结束
  };//if (arr != null)
}//isJsCon结束

function toJsc (jsurl,jscStatus,jsc2Status,jsfrom) {
	if (jscStatus == true || jsc2Status == true){
				jsFileName = jsurl.substring(jsurl.lastIndexOf('/') + 1, jsurl.lastIndexOf('.') );
                		jsfrom = jsfrom;
				return jsurl = jsPre + jsurl + jsSuf.replace(/_yuliu_/,jsFileName).replace(/_js_from_/,jsfrom);
		
	}else{return jsurl}
};

function parseQueryString(url) {
  const queryString = url.split('?')[1]; //获取查询字符串部分
  const regex = /([^=&]+)=([^&]*)/g; //匹配键值对的正则表达式
  const params = {};
  let match;

  while ((match = regex.exec(queryString))) {
    const key = decodeURIComponent(match[1]); //解码键
    const value = decodeURIComponent(match[2]); //解码值
    params[key] = value; //将键值对添加到对象中
  }

  return params;
};

//Env.js 
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,a)=>{s.call(this,t,(t,s,r)=>{t?a(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}getEnv(){return"undefined"!=typeof $environment&&$environment["surge-version"]?"Surge":"undefined"!=typeof $environment&&$environment["stash-version"]?"Stash":"undefined"!=typeof module&&module.exports?"Node.js":"undefined"!=typeof $task?"Quantumult X":"undefined"!=typeof $loon?"Loon":"undefined"!=typeof $rocket?"Shadowrocket":void 0}isNode(){return"Node.js"===this.getEnv()}isQuanX(){return"Quantumult X"===this.getEnv()}isSurge(){return"Surge"===this.getEnv()}isLoon(){return"Loon"===this.getEnv()}isShadowrocket(){return"Shadowrocket"===this.getEnv()}isStash(){return"Stash"===this.getEnv()}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const a=this.getdata(t);if(a)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,a)=>e(a))})}runScript(t,e){return new Promise(s=>{let a=this.getdata("@chavy_boxjs_userCfgs.httpapi");a=a?a.replace(/\n/g,"").trim():a;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[i,o]=a.split("@"),n={url:`http://${o}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":i,Accept:"*/*"},timeout:r};this.post(n,(t,e,a)=>s(a))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),a=!s&&this.fs.existsSync(e);if(!s&&!a)return{};{const a=s?t:e;try{return JSON.parse(this.fs.readFileSync(a))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),a=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):a?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const a=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of a)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,a)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[a+1])>>0==+e[a+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,a]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,a,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,a,r]=/^@(.*?)\.(.*?)$/.exec(e),i=this.getval(a),o=a?"null"===i?null:i||"{}":"{}";try{const e=JSON.parse(o);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),a)}catch(e){const i={};this.lodash_set(i,r,t),s=this.setval(JSON.stringify(i),a)}}else s=this.setval(t,e);return s}getval(t){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.read(t);case"Quantumult X":return $prefs.valueForKey(t);case"Node.js":return this.data=this.loaddata(),this.data[t];default:return this.data&&this.data[t]||null}}setval(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.write(t,e);case"Quantumult X":return $prefs.setValueForKey(t,e);case"Node.js":return this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0;default:return this.data&&this.data[e]||null}}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){switch(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"],delete t.headers["content-type"],delete t.headers["content-length"]),t.params&&(t.url+="?"+this.queryStr(t.params)),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,a)=>{!t&&s&&(s.body=a,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,a)});break;case"Quantumult X":this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:a,headers:r,body:i,bodyBytes:o}=t;e(null,{status:s,statusCode:a,headers:r,body:i,bodyBytes:o},i,o)},t=>e(t&&t.error||"UndefinedError"));break;case"Node.js":let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:a,statusCode:r,headers:i,rawBody:o}=t,n=s.decode(o,this.encoding);e(null,{status:a,statusCode:r,headers:i,rawBody:o,body:n},n)},t=>{const{message:a,response:r}=t;e(a,r,r&&s.decode(r.rawBody,this.encoding))})}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";switch(t.body&&t.headers&&!t.headers["Content-Type"]&&!t.headers["content-type"]&&(t.headers["content-type"]="application/x-www-form-urlencoded"),t.headers&&(delete t.headers["Content-Length"],delete t.headers["content-length"]),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,(t,s,a)=>{!t&&s&&(s.body=a,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,a)});break;case"Quantumult X":t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:a,headers:r,body:i,bodyBytes:o}=t;e(null,{status:s,statusCode:a,headers:r,body:i,bodyBytes:o},i,o)},t=>e(t&&t.error||"UndefinedError"));break;case"Node.js":let a=require("iconv-lite");this.initGotEnv(t);const{url:r,...i}=t;this.got[s](r,i).then(t=>{const{statusCode:s,statusCode:r,headers:i,rawBody:o}=t,n=a.decode(o,this.encoding);e(null,{status:s,statusCode:r,headers:i,rawBody:o,body:n},n)},t=>{const{message:s,response:r}=t;e(s,r,r&&a.decode(r.rawBody,this.encoding))})}}time(t,e=null){const s=e?new Date(e):new Date;let a={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in a)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?a[e]:("00"+a[e]).substr((""+a[e]).length)));return t}queryStr(t){let e="";for(const s in t){let a=t[s];null!=a&&""!==a&&("object"==typeof a&&(a=JSON.stringify(a)),e+=`${s}=${a}&`)}return e=e.substring(0,e.length-1),e}msg(e=t,s="",a="",r){const i=t=>{switch(typeof t){case void 0:return t;case"string":switch(this.getEnv()){case"Surge":case"Stash":default:return{url:t};case"Loon":case"Shadowrocket":return t;case"Quantumult X":return{"open-url":t};case"Node.js":return}case"object":switch(this.getEnv()){case"Surge":case"Stash":case"Shadowrocket":default:{let e=t.url||t.openUrl||t["open-url"];return{url:e}}case"Loon":{let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}case"Quantumult X":{let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl,a=t["update-pasteboard"]||t.updatePasteboard;return{"open-url":e,"media-url":s,"update-pasteboard":a}}case"Node.js":return}default:return}};if(!this.isMute)switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:$notification.post(e,s,a,i(r));break;case"Quantumult X":$notify(e,s,a,i(r));break;case"Node.js":}if(!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),a&&t.push(a),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:this.log("",`❗️${this.name}, 错误!`,t);break;case"Node.js":this.log("",`❗️${this.name}, 错误!`,t.stack)}}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;switch(this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:$done(t);break;case"Node.js":process.exit(1)}}}(t,e)}