/****************************
   支持QX & Surge & Clash 规则集解析
   适用app: Surge Shadowrocket Stash Loon
***************************/
const isEgern = 'object' == typeof egern;
const isLanceX = 'undefined' != typeof $native;
if (isEgern || isLanceX){
	$environment = {"language":"zh-Hans","system":"iOS","surge-build":"2806","surge-version":"5.20.0"}
};
const isStashiOS = 'undefined' !== typeof $environment && $environment['stash-version'];
const isSurgeiOS = 'undefined' !== typeof $environment && $environment['surge-version'];
const isShadowrocket = 'undefined' !== typeof $rocket;
const isLooniOS = 'undefined' != typeof $loon;

var req = $request.url.replace(/r_parser.list$|r_parser.list\?.+/,'');
var urlArg

    req = decodeURIComponent($request.url.split(/https?:\/\/script\.hub\/file\/.+\?src=/)[1].split(/&type=/)[0]);
    //console.log(req);
    if ($request.url.search(/&target=.+&.+/) != -1){
        urlArg = "&" + $request.url.split(/&target=[^&]+&/)[1];
    }else{urlArg = ""};
	
var original = [];//用于获取原文行号
//获取参数
var Rin0 = urlArg.search(/&y=/) != -1 ? (urlArg.split(/&y=/)[1].split("&")[0].split("+")).map(decodeURIComponent) : null;
var Rout0 = urlArg.search(/&x=/) != -1 ? (urlArg.split(/&x=/)[1].split("&")[0].split("+")).map(decodeURIComponent) : null;
var ipNoResolve = urlArg.search(/&nore=/) != -1 ? true : false;
var cachExp = urlArg.search(/&cachexp=/) != -1 ? (urlArg.split(/&cachexp=/)[1].split("&")[0]) : null;

//缓存有效期相关
var currentTime = new Date();
var seconds = Math.floor(currentTime.getTime() / 1000); // 将毫秒转换为秒
var boxjsSetExp = $persistentStore.read("Parser_cache_exp") ?? "1";
//设置有效期时间
var expirationTime
if (cachExp != null){
  expirationTime = cachExp * 1 * 60 * 60;
}else{
  expirationTime = boxjsSetExp * 1 * 60 * 60;
};
//console.log(expirationTime);
var nCache = [{"url":"","body":"","time":""}];
var oCache = $persistentStore.read("parser_cache");
//检查是否有缓存
if (oCache != "" && oCache != null){
  oCache = JSON.parse(oCache);
}else{oCache = null;};

!(async () => {
  let body
  
  if (oCache == null){
    //console.log("一个缓存也没有")
  body = await http(req);
  nCache[0].url = req;
  nCache[0].body = body;
  nCache[0].time = seconds;
  $persistentStore.write(JSON.stringify(nCache), 'parser_cache');
  }else{
    //删除大于一天的缓存防止缓存越来越大
    oCache = oCache.filter(obj => {
  return seconds - obj.time < 86400 ;
});
$persistentStore.write(JSON.stringify(oCache), 'parser_cache');

 if (!oCache.some(obj => obj.url === req)){
     //console.log("有缓存但是没有这个URL的")
  body = await http(req);
  nCache[0].url = req;
  nCache[0].body = body;
  nCache[0].time = seconds;
  var mergedCache = oCache.concat(nCache);
$persistentStore.write(JSON.stringify(mergedCache), 'parser_cache');
  }else if (oCache.some(obj => obj.url === req)){
    const objIndex = oCache.findIndex(obj => obj.url === req);
    if (seconds - oCache[objIndex].time > expirationTime){
      //console.log("有缓存且有url,但是过期了")
  body = await http(req);
  oCache[objIndex].body = body;
  oCache[objIndex].time = seconds;
$persistentStore.write(JSON.stringify(oCache), 'parser_cache');
    }else{
      //console.log("有缓存且有url且没过期")
    if (oCache[objIndex].body == null || oCache[objIndex].body == ""){
        //console.log("但是body为null")
        body = await http(req);
        oCache[objIndex].body = body;
        oCache[objIndex].time = seconds;        $persistentStore.write(JSON.stringify(oCache), "parser_cache");
    }else{
        //console.log("获取到缓存body")
        body = oCache[objIndex].body;
    }
      };
  };
};
  
//判断是否断网
if(body == null || body == ""){if(isSurgeiOS || isStashiOS){
  console.log("规则集转换：未获取到body的链接为" + $request.url)
	$notification.post("规则集转换：未获取到body","请检查网络及节点是否畅通\n" + "源链接为" + $request.url,"认为是bug?点击通知反馈",{url:"https://t.me/zhangpeifu"})
 $done({ response: { status: 404 ,body:{} } });}else if (isLooniOS || isShadowrocket){
  console.log("规则集转换：未获取到body的链接为" + $request.url)
  $notification.post("规则集转换：未获取到body","请检查网络及节点是否畅通\n" + "源链接为" + $request.url,"认为是bug?点击通知反馈","https://t.me/zhangpeifu")
 $done({ response: { status: 404 ,body:{} } });
}//识别客户端通知
}else{//以下开始规则集解析

original = body.replace(/^ *(#|;|\/\/)/g,'#').replace(/  - /g,'').replace(/(^[^#].+)\x20+\/\/.+/g,'$1').replace(/(\{[0-9]+)\,([0-9]*\})/g,'$1t&zd;$2').replace(/^host-wildcard/gi,'HO-ST-WILDCARD').replace(/^dest-port/gi,'DST-PORT').split("\n");
	body = body.match(/[^\r\n]+/g);
	
let others = [];       //不支持的规则
let ruleSet = [];      //解析过后的规则
let outRules = [];     //被排除的规则

let noResolve          //ip规则是否开启不解析域名
let ruleType           //规则类型
let ruleValue          //规则
let lineNum            //行数

body.forEach((x, y, z) => {
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
        lineNum = original.indexOf(x.replace(/^;#/,"")) + 1;
		outRules.push("原文第" + lineNum + "行 " + x.replace(/^HO-ST/i,'HOST'))
	}else if (x.match(/^(HO-ST|U|PROTOCOL)/i)){
		
		lineNum = original.indexOf(x) + 1;
		others.push("原文第" + lineNum + "行 " + x.replace(/^HO-ST/i,'HOST'))

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
		lineNum = original.indexOf(x.replace(/^;#/,"")) + 1;
		outRules.push("原文第" + lineNum + "行 " + x.replace(/^HO-ST/i,'HOST'))
	}else if (x.match(/^(HO-ST|DST-PORT|PROTOCOL|PROCESS-NAME)/i)){
		
		lineNum = original.indexOf(x) + 1;
		others.push(lineNum + "行 " + x.replace(/^HO-ST/i,'HOST'))

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
		lineNum = original.indexOf(x.replace(/^;#/,"")) + 1;
		outRules.push("原文第" + lineNum + "行 " + x.replace(/^HO-ST/i,'HOST'))
	}else if (x.match(/^HO-ST/i)){
		lineNum = original.indexOf(x) + 1;
		others.push(lineNum + "行 " + x.replace(/^HO-ST/i,'HOST'))

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
	
}); //循环结束

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

 $done({ response: { status: 200 ,body:body ,headers: {'Content-Type': 'text/plain; charset=utf-8'} } });
}//判断是否断网的反括号

})()
.catch((e) => {
		$notification.post(`${e}`,'','');
		$done()
	})

function http(req) {
  return new Promise((resolve, reject) =>
    $httpClient.get(req, (err, resp,data) => {
  resolve(data)
  })
)
                                                     }
