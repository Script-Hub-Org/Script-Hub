/****************************
   支持QX & Surge & Clash 规则集解析
   适用app: Surge Shadowrocket Stash Loon
***************************/

const $ = new Env("rule-parser");

//目标app
const isEgern = 'object' == typeof egern;
const isLanceX = 'undefined' != typeof $native;
if (isLanceX || isEgern){
	$environment = {"language":"zh-Hans","system":"iOS","surge-build":"2806","surge-version":"5.20.0"};
};

const url = $request.url;
var req = url.split(/file\/_start_\//)[1].split(/\/_end_\//)[0];
	//$.log("原始链接：" + req);
var urlArg = url.split(/\/_end_\//)[1];

var resFile = urlArg.split("?")[0];
var resFileName = 
resFile.substring(0,resFile.lastIndexOf('.'));

//通过请求头中的UA识别app
const appUa = $request.headers['user-agent'] || $request.headers['User-Agent'];

//获取参数
const queryObject = parseQueryString(urlArg);
//$.log("参数:" + $.toStr(queryObject));

//目标类型
const isSurgetarget = queryObject.target == "surge-rule-set";
const isStashtarget = queryObject.target == "stash-rule-set";
const isLoontarget = queryObject.target == "loon-rule-set";
const isRockettarget = queryObject.target == "shadowrocket-rule-set";

if (queryObject.target == 'rule-set'){
	if (appUa.search(/Surge|LanceX|Egern|Stash|Loon|Shadowrocket/i) != -1){
	isSurgeiOS = appUa.search(/Surge|LanceX|Egern/i) != -1;
	isStashiOS = appUa.search(/Stash/i) != -1;
	isLooniOS = appUa.search(/Loon/i) != -1;
	isShadowrocket = appUa.search(/Shadowrocket/i) != -1;
	}else{
	isSurgeiOS = $.isSurge();
	isStashiOS = $.isStash();
	isLooniOS = $.isLoon();
	isShadowrocket = $.isShadowrocket();	
	};
}else{
	isSurgeiOS = isSurgetarget;
	isStashiOS = isStashtarget;
	isLooniOS = isLoontarget;
	isShadowrocket = isRockettarget;
};

var Rin0 = queryObject.y != undefined ? queryObject.y.split("+") : null;
var Rout0 = queryObject.x != undefined ? queryObject.x.split("+") : null;
var ipNoResolve = istrue(queryObject.nore);

var evJsori = queryObject.evalScriptori;
var evJsmodi = queryObject.evalScriptmodi;
var evUrlori = queryObject.evalUrlori;
var evUrlmodi = queryObject.evalUrlmodi;

!(async () => {
	
if (evUrlori){
evUrlori = (await $.http.get(evUrlori)).body;
};
if (evUrlmodi){
evUrlmodi = (await $.http.get(evUrlmodi)).body;
};

let body = (await $.http.get(req)).body;
  
eval(evJsori);
eval(evUrlori);

	body = body.match(/[^\r\n]+/g);
	
let others = [];       //不支持的规则
let ruleSet = [];      //解析过后的规则
let outRules = [];     //被排除的规则

let noResolve          //ip规则是否开启不解析域名
let ruleType           //规则类型
let ruleValue          //规则

for await (var [y, x] of body.entries()) {
	x = x.replace(/^payload:/,'').replace(/^ *(#|;|\/\/)/,'#').replace(/  - /,'').replace(/(^[^#].+)\x20+\/\/.+/,'$1').replace(/(\{[0-9]+)\,([0-9]*\})/g,'$1t&zd;$2').replace(/^[^,]+$/,"").replace(/(^[^U].*(\[|=|{|\\|\/.*\.js).*)/i,"");
	
//去掉注释
if(Rin0 != null)	{
	for (let i=0; i < Rin0.length; i++) {
  const elem = Rin0[i];
	if (x.indexOf(elem) != -1){
		x = x.replace(/^#/,"")
	};
};//循环结束
};//去掉注释结束

//增加注释
if(Rout0 != null){
	for (let i=0; i < Rout0.length; i++) {
  const elem = Rout0[i];
	if (x.indexOf(elem) != -1){
		x = x.replace(/(.+)/,";#$1")
	};
};//循环结束
};//增加注释结束

//ip规则不解析域名
if(ipNoResolve === true){
	if (x.match(/^ip6?-c/i) != null){
		x = x.replace(/(.+)/,"$1,no-resolve")
	}else{};
}else{};//增加ip规则不解析域名结束

	x = x.replace(/^#.+/,'').replace(/^host-wildcard/i,'HO-ST-WILDCARD').replace(/^host/i,'DOMAIN').replace(/^dest-port/i,'DST-PORT').replace(/^ip6-cidr/i,'IP-CIDR6')
	
	if (isStashiOS){
	
	if (x.match(/^;#/)){
		outRules.push(x.replace(/^;#/,"").replace(/^HO-ST/i,'HOST'))
	}else if (x.match(/^(HO-ST|U|PROTOCOL)/i)){
		
		others.push(x.replace(/^HO-ST/i,'HOST'))

	}else if (x!=""){
		
		noResolve = x.replace(/\x20/g,"").match(/,no-resolve/i) ? ",no-resolve" : '';
        if (x.match(/^PROCESS/i)){
        ruleType = x.split(",")[1].match("/") ? "PROCESS-PATH" : "PROCESS-NAME";
        }else{
            ruleType = x.replace(/\x20/g,"").split(",")[0].toUpperCase();};
		
		ruleValue = x.split(/ *, */)[1];
		
		ruleSet.push(
			`  - ${ruleType},${ruleValue}${noResolve}`
			)
	};
	}else if (isLooniOS){
	
	if (x.match(/^;#/)){
		
		outRules.push(x.replace(/^;#/,"").replace(/^HO-ST/i,'HOST'))
	}else if (x.match(/^(HO-ST|DST-PORT|PROTOCOL|PROCESS-NAME)/i)){
		others.push(x.replace(/^HO-ST/i,'HOST'))

	}else if (x!=""){
		
		noResolve = x.replace(/\x20/g,"").match(/,no-resolve/i) ? ",no-resolve" : '';
		
		ruleType = x.split(/ *, */)[0].toUpperCase();
		
		ruleValue = x.split(/ *, */)[1];
		
		ruleSet.push(
			`${ruleType},${ruleValue}${noResolve}`
			)
	};
	}else if (isSurgeiOS || isShadowrocket){
		
		if (x.match(/^;#/)){
		
		outRules.push(x.replace(/^;#/,"").replace(/^HO-ST/i,'HOST'))
	}else if (x.match(/^HO-ST/i)){
		
		others.push(x.replace(/^HO-ST/i,'HOST'))

	}else if (x!=""){
		
		noResolve = x.replace(/\x20/g,"").match(/,no-resolve/i) ? ",no-resolve" : '';
		
		ruleType = x.split(/ *, */)[0].toUpperCase().replace(/^PROCESS-PATH/i,"PROCESS-NAME");
        
        if (isSurgeiOS){
            ruleType = ruleType.replace(/^DST-PORT/i,"DEST-PORT");
        };
		
		ruleValue = x.split(/ *, */)[1];
		
		ruleSet.push(
			`${ruleType},${ruleValue}${noResolve}`)
	};
	};
	
}; //循环结束

let ruleNum = ruleSet.length;
let notSupport = others.length;
let outRuleNum = outRules.length;
others = (others[0] || '') && `\n#不支持的规则:\n#${others.join("\n#")}`;
outRules = (outRules[0] || '') && `\n#已排除规则:\n#${outRules.join("\n#")}`;

if (isStashiOS){
	ruleSet = (ruleSet[0] || '') && `#规则数量:${ruleNum}\n#不支持的规则数量:${notSupport}\n#已排除的规则数量:${outRuleNum}${others}${outRules}\n\n#-----------------以下为解析后的规则-----------------#\n\npayload:\n${ruleSet.join("\n")}`;
}else if (isSurgeiOS || isShadowrocket || isLooniOS){
	ruleSet = (ruleSet[0] || '') && `#规则数量:${ruleNum}\n#不支持的规则数量:${notSupport}\n#已排除的规则数量:${outRuleNum}${others}${outRules}\n\n#-----------------以下为解析后的规则-----------------#\n\n${ruleSet.join("\n")}`;
}

body = `${ruleSet}`.replace(/t&zd;/g,',').replace(/ ;#/g," ");

eval(evJsmodi);
eval(evUrlmodi);

 $.done({ response: { status: 200 ,body:body ,headers: {'Content-Type': 'text/plain; charset=utf-8'} } });

})()
.catch((e) => {
		$.msg(`Script Hub: 规则集转换`,`${resFileName}：${e}\n${url}`,'','https://t.me/zhetengsha_group');
		result = {
      response: {
        status: 500,
        body: `${resFileName}：${e}\n\n\n\n\n\nScript Hub 规则集转换: ❌  可自行翻译错误信息或复制错误信息后点击通知进行反馈
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
	
function istrue(str) {
	if (str == true || str == 1 || str == "true"|| str == "1"){
		return true;
	}else{return false;}
};

function parseQueryString(url) {
  const queryString = url.split('?')[1]; // 获取查询字符串部分
  const regex = /([^=&]+)=([^&]*)/g; // 匹配键值对的正则表达式
  const params = {};
  let match;

  while ((match = regex.exec(queryString))) {
    const key = decodeURIComponent(match[1]); // 解码键
    const value = decodeURIComponent(match[2]); // 解码值
    params[key] = value; // 将键值对添加到对象中
  }

  return params;
};

function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,a)=>{s.call(this,t,(t,s,r)=>{t?a(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}getEnv(){return"undefined"!=typeof $environment&&$environment["surge-version"]?"Surge":"undefined"!=typeof $environment&&$environment["stash-version"]?"Stash":"undefined"!=typeof module&&module.exports?"Node.js":"undefined"!=typeof $task?"Quantumult X":"undefined"!=typeof $loon?"Loon":"undefined"!=typeof $rocket?"Shadowrocket":void 0}isNode(){return"Node.js"===this.getEnv()}isQuanX(){return"Quantumult X"===this.getEnv()}isSurge(){return"Surge"===this.getEnv()}isLoon(){return"Loon"===this.getEnv()}isShadowrocket(){return"Shadowrocket"===this.getEnv()}isStash(){return"Stash"===this.getEnv()}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const a=this.getdata(t);if(a)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,a)=>e(a))})}runScript(t,e){return new Promise(s=>{let a=this.getdata("@chavy_boxjs_userCfgs.httpapi");a=a?a.replace(/\n/g,"").trim():a;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[i,o]=a.split("@"),n={url:`http://${o}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":i,Accept:"*/*"},timeout:r};this.post(n,(t,e,a)=>s(a))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),a=!s&&this.fs.existsSync(e);if(!s&&!a)return{};{const a=s?t:e;try{return JSON.parse(this.fs.readFileSync(a))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),a=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):a?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const a=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of a)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,a)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[a+1])>>0==+e[a+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,a]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,a,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,a,r]=/^@(.*?)\.(.*?)$/.exec(e),i=this.getval(a),o=a?"null"===i?null:i||"{}":"{}";try{const e=JSON.parse(o);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),a)}catch(e){const i={};this.lodash_set(i,r,t),s=this.setval(JSON.stringify(i),a)}}else s=this.setval(t,e);return s}getval(t){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.read(t);case"Quantumult X":return $prefs.valueForKey(t);case"Node.js":return this.data=this.loaddata(),this.data[t];default:return this.data&&this.data[t]||null}}setval(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.write(t,e);case"Quantumult X":return $prefs.setValueForKey(t,e);case"Node.js":return this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0;default:return this.data&&this.data[e]||null}}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){switch(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"],delete t.headers["content-type"],delete t.headers["content-length"]),t.params&&(t.url+="?"+this.queryStr(t.params)),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,a)=>{!t&&s&&(s.body=a,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,a)});break;case"Quantumult X":this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:a,headers:r,body:i,bodyBytes:o}=t;e(null,{status:s,statusCode:a,headers:r,body:i,bodyBytes:o},i,o)},t=>e(t&&t.error||"UndefinedError"));break;case"Node.js":let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:a,statusCode:r,headers:i,rawBody:o}=t,n=s.decode(o,this.encoding);e(null,{status:a,statusCode:r,headers:i,rawBody:o,body:n},n)},t=>{const{message:a,response:r}=t;e(a,r,r&&s.decode(r.rawBody,this.encoding))})}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";switch(t.body&&t.headers&&!t.headers["Content-Type"]&&!t.headers["content-type"]&&(t.headers["content-type"]="application/x-www-form-urlencoded"),t.headers&&(delete t.headers["Content-Length"],delete t.headers["content-length"]),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,(t,s,a)=>{!t&&s&&(s.body=a,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,a)});break;case"Quantumult X":t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:a,headers:r,body:i,bodyBytes:o}=t;e(null,{status:s,statusCode:a,headers:r,body:i,bodyBytes:o},i,o)},t=>e(t&&t.error||"UndefinedError"));break;case"Node.js":let a=require("iconv-lite");this.initGotEnv(t);const{url:r,...i}=t;this.got[s](r,i).then(t=>{const{statusCode:s,statusCode:r,headers:i,rawBody:o}=t,n=a.decode(o,this.encoding);e(null,{status:s,statusCode:r,headers:i,rawBody:o,body:n},n)},t=>{const{message:s,response:r}=t;e(s,r,r&&a.decode(r.rawBody,this.encoding))})}}time(t,e=null){const s=e?new Date(e):new Date;let a={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in a)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?a[e]:("00"+a[e]).substr((""+a[e]).length)));return t}queryStr(t){let e="";for(const s in t){let a=t[s];null!=a&&""!==a&&("object"==typeof a&&(a=JSON.stringify(a)),e+=`${s}=${a}&`)}return e=e.substring(0,e.length-1),e}msg(e=t,s="",a="",r){const i=t=>{switch(typeof t){case void 0:return t;case"string":switch(this.getEnv()){case"Surge":case"Stash":default:return{url:t};case"Loon":case"Shadowrocket":return t;case"Quantumult X":return{"open-url":t};case"Node.js":return}case"object":switch(this.getEnv()){case"Surge":case"Stash":case"Shadowrocket":default:{let e=t.url||t.openUrl||t["open-url"];return{url:e}}case"Loon":{let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}case"Quantumult X":{let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl,a=t["update-pasteboard"]||t.updatePasteboard;return{"open-url":e,"media-url":s,"update-pasteboard":a}}case"Node.js":return}default:return}};if(!this.isMute)switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:$notification.post(e,s,a,i(r));break;case"Quantumult X":$notify(e,s,a,i(r));break;case"Node.js":}if(!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),a&&t.push(a),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:this.log("",`❗️${this.name}, 错误!`,t);break;case"Node.js":this.log("",`❗️${this.name}, 错误!`,t.stack)}}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;switch(this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:$done(t);break;case"Node.js":process.exit(1)}}}(t,e)}

