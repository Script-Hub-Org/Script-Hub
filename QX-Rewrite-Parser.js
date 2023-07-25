/****************************
支持将QX重写解析至Surge Shadowrocket Loon Stash
说明
原脚本作者@小白脸 脚本修改@chengkongyiban
感谢@xream 提供的replace-Header.js
               echo-response.js
感谢@mieqq 提供的replace-body.js
插件图标用的 @Keikinn 的 StickerOnScreen项目 以及 @Toperlock 的图标库项目，感谢，感谢
宝可梦插件图标游戏 由ChatGPT @chengkongyiban @Toperlock 共同完成 再次感谢@xream佬
***************************/

const url = $request.url;
var req = url.split(/file\/_start_\//)[1].split(/\/_end_\//)[0];
	//console.log("原始链接：" + req);
var urlArg = url.split(/\/_end_\//)[1];

//获取参数
const queryObject = parseQueryString(urlArg);
//console.log("参数:" + toStr(queryObject));

//目标app
const isSurgeiOS = queryObject.target == "surge-module";
const isStashiOS = queryObject.target == "stash-stoverride";
const isLooniOS = queryObject.target == "loon-plugin";
const isShadowrocket = queryObject.target == "shadowrocket-module";

//本机app
const isEgernL = 'object' == typeof egern;
const isLanceXL = 'undefined' != typeof $native;
if (isEgernL || isLanceXL){
	$environment = {"language":"zh-Hans","system":"iOS","surge-build":"2806","surge-version":"5.20.0"}
};
const isStashiOSL = 'undefined' !== typeof $environment && $environment['stash-version'];
const isSurgeiOSL = 'undefined' !== typeof $environment && $environment['surge-version'];
const isShadowrocketL = 'undefined' !== typeof $rocket;
const isLooniOSL = 'undefined' != typeof $loon;

var evJsori = queryObject.evalScriptori;
var evJsmodi = queryObject.evalScriptmodi;
var evUrlori = queryObject.evalUrlori;
var evUrlmodi = queryObject.evalUrlmodi;

var nName = queryObject.n != undefined ? queryObject.n.split("+") : null;
var Pin0 = queryObject.y != undefined ? queryObject.y.split("+") : null;
var Pout0 = queryObject.x != undefined ? queryObject.x.split("+") : null;
var hnAdd = queryObject.hnadd != undefined ? queryObject.hnadd.split(/ *, */) : null;
var hnDel = queryObject.hndel != undefined ? queryObject.hndel.split(/ *, */) : null;
var delNoteSc = istrue(queryObject.del);
var nCron = queryObject.cron != undefined ? queryObject.cron.split("+") : null;
var nCronExp = queryObject.cronexp != undefined ? queryObject.cronexp.replace(/\./g," ").split("+") : null;
var cachExp = queryObject.cachexp != undefined ? queryObject.cachexp : null;
var noCache = istrue(queryObject.nocache);
var jsConverter = queryObject.jsc != undefined ? queryObject.jsc.split("+") : null;
var jsConverter2 = queryObject.jsc2 != undefined ? queryObject.jsc2.split("+") : null;
var compatibilityOnly = istrue(queryObject.compatibilityOnly);
const iconStatus = getval("启用插件随机图标") ?? "启用";
const iconReplace = getval("替换原始插件图标");
const iconLibrary1 = getval("插件随机图标合集") ?? "Doraemon(100P)";
const iconLibrary2 = iconLibrary1.split("(")[0];
const iconFormat = iconLibrary2.search(/gif/i) == -1 ? ".png" : ".gif";

var pluginPokemonIcon
var pluginPokemonAuthor
var pluginPokemonHomepage

//查询js binarymode相关
let binaryInfo = getval("Parser_binary_info");
if (binaryInfo != null && binaryInfo !=""){
	binaryInfo = toObj(binaryInfo);
}else{binaryInfo = [];};

//宝可梦插件图标game
!(async () => {
if (isLooniOS && iconLibrary2 == "Pokemon" && iconStatus == "启用"){
var pokemonJsVersion = "1.03";
var pokemonVersion = getval("Pokemon_version") ?? 1.00;
const poDataUrl = "https://github.com/chengkongyiban/stash/raw/main/js/Pokemon/pokemonData.json";
var poDataObj = {};
if (pokemonJsVersion * 1 > pokemonVersion * 1){
poDataObj = toObj(await http(poDataUrl));
setval(toStr(poDataObj),"Pokemon_data");
}else{
	poDataObj = toObj(getval("Pokemon_data"));};
//初阶宝可梦
beginnerPokemon = poDataObj.beginnerPokemon;
cloudPcp = poDataObj.cloudPcp;
// 创建宝可梦资料
pokemonList = poDataObj.pokemonList;

var pokemonPBUrl = "https://www.pokemon.cn/play/pokedex/";

//玩家已解锁的宝可梦卡池
var pokemonCdp = [];

//抽卡记录
var count = {};

//读取卡池
if (getval("Pokemon_card_pool") == null || getval("Pokemon_card_pool") == ""){
	pokemonCdp = beginnerPokemon;
	 setval(toStr(pokemonCdp), "Pokemon_card_pool")
}else{
    pokemonCdp = toObj(getval("Pokemon_card_pool"))
    if (pokemonJsVersion * 1 > pokemonVersion * 1){
	var filteredPokemonCdp = pokemonCdp.filter(function (pokemon) {
  return pokemon >= 1301 && pokemon <= 1800 && cloudPcp.includes(pokemon);
});
pokemonCdp = beginnerPokemon.concat(filteredPokemonCdp);
setval(toStr(pokemonCdp), "Pokemon_card_pool");

count = toObj(getval("Pokemon_count"));
for (var key in count) {
  if (!pokemonCdp.includes(parseInt(key))) {
    delete count[key];
  }
};
setval(toStr(count), "Pokemon_count");

setval(pokemonJsVersion, "Pokemon_version");
}
};

//抽卡并记录抽卡数据
if (getval("Pokemon_count") == null || getval("Pokemon_count") == ""){
    var result = getArrayItems(pokemonCdp, 1);
    var num = result[0];
    count[num] = (count[num] || 0) + 1;
setval(toStr(count), "Pokemon_count");
	var pokemonInfo = getPokemonByIcon(result[0]);
    pluginPokemonIcon = "https://raw.githubusercontent.com/Toperlock/Quantumult/main/icon/Pokemon/Pokemon-" + result + ".png";
	pluginPokemonAuthor = "#!author=" + pokemonInfo.name;
	pluginPokemonHomepage = "#!homepage=" + pokemonPBUrl + pokemonInfo.number;
}else{
	getval("Pokemon_count")
	count = toObj(getval("Pokemon_count"))
	var result = getArrayItems(pokemonCdp, 1);
    var num = result[0];
    count[num] = (count[num] || 0) + 1;
	setval(toStr(count), "Pokemon_count")
	var pokemonInfo = getPokemonByIcon(result[0]);
    pluginPokemonIcon = "https://raw.githubusercontent.com/Toperlock/Quantumult/main/icon/Pokemon/Pokemon-" + result + ".png";
	pluginPokemonAuthor = "#!author=" + pokemonInfo.name;
	pluginPokemonHomepage = "#!homepage=" + pokemonPBUrl + pokemonInfo.number;
};


// 当初阶宝可梦到了一定数量时解锁其一阶形态
for (var index in pokemonCdp) {
    var num = pokemonCdp[index];
    if (count[num] >= 30 && (parseInt(num) <= 1022 || (parseInt(num) >= 1101 && parseInt(num) <= 1110) || parseInt(num) ==1199 || parseInt(num) == 1200)) {
        var evolvedNum = parseInt(num) + 300;
        if (!pokemonCdp.includes(evolvedNum)) {
            pokemonCdp.push(evolvedNum);
            setval(toStr(pokemonCdp), "Pokemon_card_pool");
						
						var pokemonInfo = getPokemonByIcon(evolvedNum);
						
            $notification.post("恭喜您解锁了新的宝可梦", pokemonInfo.name, "当前已解锁" + pokemonCdp.length + "只宝可梦",pokemonPBUrl + pokemonInfo.number);
        }
    }
};


// 当一阶宝可梦到了一定数量时解锁其二阶形态
for (var index in pokemonCdp) {
    var num = pokemonCdp[index];
    if (count[num] >= 50 && (parseInt(num) >= 1401 && parseInt(num) <= 1410)) {
        var evolvedNum = parseInt(num) + 100;
        if (!pokemonCdp.includes(evolvedNum)) {
            pokemonCdp.push(evolvedNum);
            setval(toStr(pokemonCdp), "Pokemon_card_pool");
						
						var pokemonInfo = getPokemonByIcon(evolvedNum);
						
            $notification.post("恭喜您解锁了新的宝可梦", pokemonInfo.name, "当前已解锁" + pokemonCdp.length + "只宝可梦",pokemonPBUrl + pokemonInfo.number);
        }
    }
};

// 巴大蝶
for (var index in pokemonCdp) {
  var num = pokemonCdp[index];
  if (count[num] >= 50 && parseInt(num) == 1499) {
    if (!pokemonCdp.includes(1596)) {
			var unlockedPokemon = [];
      pokemonCdp.push(1596,1597);
			unlockedPokemon.push(1596,1597);
setval(toStr(pokemonCdp), "Pokemon_card_pool");
      unlockedPokemon.forEach(pokemonNumber => {
        var pokemonInfo = getPokemonByIcon(pokemonNumber);
        if (pokemonInfo !== null) {
          $notification.post("恭喜您解锁了新的宝可梦", pokemonInfo.name, "当前已解锁" + pokemonCdp.length + "只宝可梦",  pokemonPBUrl + pokemonInfo.number );
        }
      });
    }
  }
}


// 火恐龙
for (var index in pokemonCdp) {
  var num = pokemonCdp[index];
  if (count[num] >= 50 && parseInt(num) == 1500) {
    if (!pokemonCdp.includes(1598)) {
			var unlockedPokemon = [];
      pokemonCdp.push(1598,1599,1600);
			unlockedPokemon.push(1598,1599,1600);
setval(toStr(pokemonCdp), "Pokemon_card_pool");
      unlockedPokemon.forEach(pokemonNumber => {
        var pokemonInfo = getPokemonByIcon(pokemonNumber);
        if (pokemonInfo !== null) {
          $notification.post("恭喜您解锁了新的宝可梦", pokemonInfo.name, "当前已解锁" + pokemonCdp.length + "只宝可梦",  pokemonPBUrl + pokemonInfo.number );
        }
      });
    }
  }
}


//伊布
for (var index in pokemonCdp) {
  var num = pokemonCdp[index];
  if (count[num] >= 30 && parseInt(num) == 1100) {
    if (!pokemonCdp.includes(1393)) {
			var unlockedPokemon = [];
      pokemonCdp.push(1393, 1394, 1395, 1396, 1397, 1398, 1399, 1400);
			unlockedPokemon.push(1393, 1394, 1395, 1396, 1397, 1398, 1399, 1400);
setval(toStr(pokemonCdp), "Pokemon_card_pool");
      unlockedPokemon.forEach(pokemonNumber => {
        var pokemonInfo = getPokemonByIcon(pokemonNumber);
        if (pokemonInfo !== null) {
          $notification.post("恭喜您解锁了新的宝可梦", pokemonInfo.name, "当前已解锁" + pokemonCdp.length + "只宝可梦",  pokemonPBUrl + pokemonInfo.number );
        }
      });
    }
  }
}

// 当卡池中的宝可梦数量达到96只，并且每只宝可梦都出现了100次以上时，解锁1701到1716编号的宝可梦
if (pokemonCdp.length >= 96 && pokemonCdp.length < 100 && Object.values(count).every(count => count >= 100)) {
  var unlockedPokemon = [];

  for (var i = 1701; i <= 1716; i++) {
    if (!pokemonCdp.includes(i)) {
      pokemonCdp.push(i);
      unlockedPokemon.push(i);
    }
  }

  unlockedPokemon.forEach(pokemonNumber => {
    var pokemonInfo = getPokemonByIcon(pokemonNumber);
    $notification.post("恭喜您解锁了新的宝可梦", pokemonInfo.name, "您已解锁全部112只宝可梦",  pokemonPBUrl + pokemonInfo.number );
  });
 setval(toStr(pokemonCdp), "Pokemon_card_pool");
}

function getArrayItems(arr, num) {
    var temp_array = new Array();
    for (var index in arr) {
        temp_array.push(arr[index]);
    }
    var return_array = new Array();
    for (var i = 0; i < num; i++) {
        if (temp_array.length > 0) {
            var arrIndex = Math.floor(Math.random() * temp_array.length);
            return_array[i] = temp_array[arrIndex];
            temp_array.splice(arrIndex, 1);
        } else {
            break;
        }
    }
    return return_array;
};

function getPokemonByIcon(icon) {
  for (let i = 0; i < pokemonList.length; i++) {
    if (pokemonList[i].icon === icon) {
      return {
        name: pokemonList[i].name,
        number: pokemonList[i].number
      };
    }
  }
  return null;
}

}//宝可梦game

if (evUrlori){
evUrlori = await http(evUrlori);
};
if (evUrlmodi){
evUrlmodi = await http(evUrlmodi);
};
var name = "";
var desc = "";
var icon = "";
var rewriteName = req.substring(req.lastIndexOf('/') + 1).split('.')[0];
var resFile = urlArg.split("?")[0];
var resFileName = 
resFile.substring(0,resFile.lastIndexOf('.'));
var notifyName
if (nName != null && nName[0] != ""){notifyName = nName[0];}else{notifyName = resFileName;};

//缓存有效期相关
var currentTime = new Date();
var seconds = Math.floor(currentTime.getTime() / 1000); // 将毫秒转换为秒
var boxjsSetExp = getval("Parser_cache_exp") ?? "1";
//设置有效期时间
var expirationTime
if (cachExp != null){
  expirationTime = cachExp * 1 * 60 * 60;
}else{
  expirationTime = boxjsSetExp * 1 * 60 * 60;
};
//console.log(expirationTime);
var nCache = [{"url":"","body":"","time":""}];
var oCache = getval("parser_cache");
//检查是否有缓存
if (oCache != "" && oCache != null){
  oCache = toObj(oCache);
}else{oCache = null;};

//修改名字和简介
if (nName === null){
	name = rewriteName;
    desc = name;
}else{
	name = nName[0] != "" ? nName[0] : rewriteName;
	desc = nName[1] != undefined ? nName[1] : name;
};
if (isShadowrocket || isLooniOS ||isSurgeiOS){
	name = "#!name=" + name;
	desc = "#!desc=" + desc;
}else if (isStashiOS){
	name = 'name: ' + '"' + name + '"';
	desc = 'desc: ' + '"' + desc + '"';
};
let npluginDesc = name + "\n" + desc;

//随机图标开关，不传入参数默认为开
if(isLooniOS && iconStatus == "启用" && iconLibrary2 != "Pokemon"){
	const stickerStartNum = 1001;
const stickerSum = iconLibrary1.split("(")[1].split("P")[0];
let randomStickerNum = parseInt(stickerStartNum + Math.random() * stickerSum).toString();
   icon = "#!icon=" + "https://github.com/Toperlock/Quantumult/raw/main/icon/" + iconLibrary2 + "/" + iconLibrary2 + "-" + randomStickerNum + iconFormat;
}else if (isLooniOS && iconStatus == "启用" && iconLibrary2 == "Pokemon"){
    icon = "#!icon=" + pluginPokemonIcon;
};
const pluginIcon = icon;
//console.log("插件图标：" + pluginIcon);

  let body

  if (noCache == true){
	body = await http(req);
}else if (oCache == null){
    //console.log("一个缓存也没有")
  body = await http(req);
  nCache[0].url = req;
  nCache[0].body = body;
  nCache[0].time = seconds;
  setval(toStr(nCache), 'parser_cache');
  }else{
    //删除大于一天的缓存防止缓存越来越大
    oCache = oCache.filter(obj => {
  return seconds - obj.time < 86400 ;
});
setval(toStr(oCache), 'parser_cache');

 if (!oCache.some(obj => obj.url === req)){
     //console.log("有缓存但是没有这个URL的")
  body = await http(req);
  nCache[0].url = req;
  nCache[0].body = body;
  nCache[0].time = seconds;
  var mergedCache = oCache.concat(nCache);
setval(toStr(mergedCache), 'parser_cache');
  }else if (oCache.some(obj => obj.url === req)){
    const objIndex = oCache.findIndex(obj => obj.url === req);
    if (seconds - oCache[objIndex].time > expirationTime){
      //console.log("有缓存且有url,但是过期了")
  body = await http(req);
  oCache[objIndex].body = body;
  oCache[objIndex].time = seconds;
setval(toStr(oCache), 'parser_cache');
    }else{
      //console.log("有缓存且有url且没过期")
    if (oCache[objIndex].body == null || oCache[objIndex].body == ""){
        //console.log("但是body为null")
        body = await http(req);
        oCache[objIndex].body = body;
        oCache[objIndex].time = seconds;        setval(toStr(oCache), "parser_cache");
    }else{
        //console.log("获取到缓存body")
        body = oCache[objIndex].body;
    }
      };
  };
};
eval(evJsori);
eval(evUrlori)
//判断是否断网
if(body == null || body == ""){
	notify(`QX转换："${notifyName}"未获取到body`,"请检查网络及节点是否畅通\n" + "源链接为" + $request.url,"认为是bug?点击通知反馈","https://t.me/zhangpeifu")
 $done({ response: { status: 404 ,body:{} } });
}else{//以下开始重写及脚本转换

if (body.match(/\/\*+\n[\s\S]*\n\*+\/\n/)){
body = body.replace(/[\s\S]*(\/\*+\n[\s\S]*\n\*+\/\n)[\s\S]*/,"$1").match(/[^\r\n]+/g);
}else{
    body = body.match(/[^\r\n]+/g);};

let pluginDesc = [];
let httpFrame = "";
let URLRewrite = [];
let script = [];
let MapLocal = [];
let MITM = "";
let cron = []; 
let providers = [];  
let others = [];       //不支持的内容


let scname = "";       //脚本重写名
let js = "";           //脚本链接
let jsname = "";       //脚本文件名
let sctype = "";       //脚本类型
let ptn = "";          //正则
let rebody = "";       //是否需要body
let size = "";         //允许最大body大小
let proto = "";        //是否开启binary-body-mode
let cronExp = "";      //cron表达式
let croName = "";      //cron任务名
let cronJs = "";       //cron脚本链接
let rejectType = "";   //重写reject类型
let urlInNum = "";     //重写中"url"字样出现的位置
let reHdType = "";     //request|response-header
let reHdPtn = "";      //re-header 正则
let reHdArg1 = "";     //用以匹配的headers
let reHdArg2 = "";     //替换
let arg = "";          //echo-response 返回内容
let mockPtn = "";      //echo-res转mock 正则
let dataCon = "";      //echo-res转mock 返回内容
let reBdType = "";     //request|response-body
let reBdPtn = "";      //re-header 正则
let reBdArg1 = "";     //用以匹配的headers
let reBdArg2 = "";     //替换
let scriptBox = [];    //存放脚本信息待下一步处理

for await (var [y, x] of body.entries()) {
	x = x.replace(/^ *(#|;|\/\/)/,'#').replace(/\x20.+url-and-header\x20/,' url ').replace(/\x20+url\x20+/," url ").replace(/^hostname\x20*=/,"hostname=").replace(/(^[^#].+)\x20+\/\/.+/,"$1");
//去掉注释
if (Pin0 != null)	{
	for (let i=0; i < Pin0.length; i++) {
  const elem = Pin0[i];
	if (x.indexOf(elem) != -1){
		x = x.replace(/^#/,"")
	}else{};
};//循环结束
}else{};//去掉注释结束

//增加注释
if (Pout0 != null){
	for (let i=0; i < Pout0.length; i++) {
  const elem = Pout0[i];
	if (x.indexOf(elem) != -1 && x.search(/^hostname=/) == -1){
		x = "#" + x;
	}else{};
};//循环结束
}else{};//增加注释结束

//添加主机名
if (hnAdd != null){
	if (x.search(/^hostname=/) != -1){
		x = x.replace(/\x20/g,"").replace(/(.+)/,`$1,${hnAdd}`).replace(/,{2,}/g,",");
	}else{};
}else{};//添加主机名结束

//删除主机名
if (hnDel != null && x.search(/^hostname=/) != -1){
    x = x.replace(/\x20/g,"").replace(/^hostname=/,"").replace(/%.*%/,"").replace(/,{2,}/g,",").split(",");
	for (let i=0; i < hnDel.length; i++) {
  const elem = hnDel[i];
if (x.indexOf(elem) != -1){
  let hnInNum = x.indexOf(elem);
  delete x[hnInNum];
}else{};
  };//循环结束
x = "hostname=" + x
}else{};//删除主机名结束

//剔除已注释重写
if (delNoteSc === true && x.match(/^#/) && x.indexOf("#!") == -1){
		x = "";
};//剔除已注释重写结束

let jscStatus,jsc2Status
if (jsConverter != null){
	jscStatus = isJsCon(jsConverter);}
if (jsConverter2 != null){
	jsc2Status = isJsCon(jsConverter2);}
if (jsc2Status == true){jscStatus = false};

let jsPre = "";
let jsSuf = "";
let oriType = queryObject.type.split("-")[0];
let jsTarget = queryObject.target.split("-")[0];
if (jscStatus == true || jsc2Status == true){
jsPre = "http://script.hub/convert/_start_/";
};
if (jscStatus == true){
jsSuf = `/_end_/_yuliu_.js?type=${oriType}-script&target=${jsTarget}-script`;
}else if (jsc2Status == true){
jsSuf = `/_end_/_yuliu_.js?type=${oriType}-script&target=${jsTarget}-script&wrap_response=true`;
};
if (compatibilityOnly == true && (jscStatus == true || jsc2Status == true)){
jsSuf = jsSuf + "&compatibilityOnly=true"
};
function isJsCon (arr) {
	if (arr != null){
		for (let i=0; i < arr.length; i++) {
  const elem = arr[i];
	if (x.indexOf(elem) != -1){return true};
	};//循环结束
  };//if (arr != null)
}//isJsCon结束

	let type = x.match(
		/^#!|\x20url\x20script-|\x20url\x20reject$|\x20url\x20reject-|\x20echo-response\x20|\-header\x20|^hostname| url 30|\x20(request|response)-body|[^\s]+ [^u\s]+ [^\s]+ [^\s]+ [^\s]+ ([^\s]+ )?(https?|ftp|file)/
	)?.[0];

//判断注释
if (isLooniOS || isSurgeiOS || isShadowrocket){
	
	if (x.match(/^[^#]/)){
	var noteK = "";
	}else{
	var noteK = "#";
	};
}else if (isStashiOS){
	if (x.match(/^[^#]/)){
	var noteKn8 = "\n        ";
	var noteKn6 = "\n      ";
	var noteKn4 = "\n    ";
	var noteK4 = "    ";
	var noteK2 = "  ";
	}else{
	var noteKn8 = "\n#        ";
	var noteKn6 = "\n#      ";
	var noteKn4 = "\n#    ";
	var noteK4 = "#    ";
	var noteK2 = "#  ";
	};
};//判断注释结束

	if (type) {
		switch (type) {
//简介            
			case "#!":
               if (isStashiOS){
               x = x.replace(/^#! *(name|desc) *= *(.*)/,'$1: "$2"');
            
            if (nName != null){
                x = x.replace(/^name:.*/,name).replace(/^desc:.*/,desc);
            };
            pluginDesc.push(x);
            };
            
			if (isLooniOS && iconStatus == "启用" && iconLibrary2 == "Pokemon"){
				if (nName != null){
                x = x.replace(/^#!name *=.*/,name).replace(/^#!desc *=.*/,desc);};
            if (iconReplace == "启用"){
                x = x.replace(/^#!icon *=.*/,pluginIcon);
            };
			x = x.replace(/^(#!author *=).*/i,pluginPokemonAuthor)
			x = x.replace(/^(#!homepage *=).*/i,pluginPokemonHomepage)
            pluginDesc.push(x);
				
			}else if (isLooniOS || isSurgeiOS || isShadowrocket){
            if (nName != null){
                x = x.replace(/^#!name *=.*/,name).replace(/^#!desc *=.*/,desc);};
            if (iconReplace == "启用"){
                x = x.replace(/^#!icon *=.*/,pluginIcon);
            };
            pluginDesc.push(x);
            };
            
            break;
            
			case " url script-":
//脚本
				sctype = x.match(' script-response') ? 'response' : 'request';
				
				urlInNum = x.replace(/\x20{2,}/g," ").split(" ").indexOf("url");
				
				ptn = x.replace(/\x20{2,}/g," ").split(" ")[urlInNum - 1].replace(/^#/,"");

				js = x.replace(/\x20{2,}/g," ").split(" ")[urlInNum + 2];
				
				scname = js.substring(js.lastIndexOf('/') + 1, js.lastIndexOf('.') );
				
				jsname = scname;

				if (isSurgeiOS){
					ptn = ptn.replace(/(.+,.+)/,'"$1"');};
				
				rebody = x.match(/\x20script[^\s]*(-body|-analyze)/) ? ', requires-body=true' : '';
				
				size = x.match(/\x20script[^\s]*(-body|-analyze)/) ? ', max-size=3145728' : '';
				
				proto = await isBinaryMode(js);
			
				if ((isSurgeiOS || isLooniOS || isShadowrocket) && proto == "true"){
					proto = ", binary-body-mode=true";
				}else if ((isSurgeiOS || isLooniOS || isShadowrocket) && proto == "false"){proto = "";};

                if (isStashiOS){
					
				rebody = x.match(/\x20script[^\s]*(-body|-analyze)/) ? 'true' : 'false';
				
				size = x.match(/\x20script[^\s]*(-body|-analyze)/) ? '3145728' : '0';
				};
//开启脚本转换				
				js = jsPre + js + jsSuf.replace(/_yuliu_/,jsname);
				
				if (isLooniOS){			
				body[y - 1]?.match(/^#/) && script.push(body[y - 1]);
					script.push(
						`${noteK}http-${sctype} ${ptn} script-path=${js}${rebody}${proto}, timeout=60 ,tag=${scname}_${y}`);
				}else if (isSurgeiOS || isShadowrocket){	
									
				body[y - 1]?.match(/^#/) && script.push(body[y - 1]);

					script.push(
						`${noteK}${scname}_${y} = type=http-${sctype}, pattern=${ptn}${rebody}${size}${proto}, script-path=${js}, timeout=60, script-update-interval=0`);
				}else if (isStashiOS){
			
			let noteKstatus = noteKn4.match(/#/) ? 'true' : 'false';
			scriptBox.push({"noteK":noteKstatus,"jsurl":js,"matchptn":ptn,"name":scname + "_" + y,"type":sctype,"requirebody":rebody,"maxsize":size,"binarymode":proto})
				};
				
				break;
				
//reject-

			case " url reject-":
				
				if (isShadowrocket || isLooniOS){
				body[y - 1]?.match(/^#/) && URLRewrite.push(body[y - 1]);
				URLRewrite.push(x.replace(/\x20{2,}/g," ").replace(/(^#)?(.*?)\x20url\x20(reject-200|reject-img|reject-dict|reject-array)/, `${noteK}$2 - $3`));
				}else if(isSurgeiOS){
					body[y - 1]?.match(/^#/) && MapLocal.push(body[y - 1]);
                    
				if (x.match(/dict$/)){
					rejectType = "https://raw.githubusercontent.com/mieqq/mieqq/master/reject-dict.json"
				}else if (x.match(/array$/)){
					rejectType = "https://raw.githubusercontent.com/mieqq/mieqq/master/reject-array.json"
				}else if (x.match(/200$/)){
					rejectType = "https://raw.githubusercontent.com/mieqq/mieqq/master/reject-200.txt"
				}else if (x.match(/img$/)){
					rejectType = "https://raw.githubusercontent.com/mieqq/mieqq/master/reject-img.gif"
				};
				MapLocal.push(x.replace(/\x20{2,}/g," ").replace(/(^#)?(.+?)\x20url\x20reject-.+/, `${noteK}$2 data="${rejectType}"`));	
				}else if (isStashiOS){
				body[y - 1]?.match(/^#/) && URLRewrite.push("    " + body[y - 1]);
				URLRewrite.push(x.replace(/\x20{2,}/g," ").replace(/(^#)?(.*?)\x20url\x20(reject-200|reject-img|reject-dict|reject-array)/, `${noteK4}- >-${noteKn6}$2 - $3`));
				};
				break;
				
				case " url reject":
                
				if (isSurgeiOS || isShadowrocket || isLooniOS){
				body[y - 1]?.match(/^#/) && URLRewrite.push(body[y - 1]);
				
				URLRewrite.push(x.replace(/\x20{2,}/g," ").replace(/(^#)?(.+?)\x20url\x20reject$/, `${noteK}$2 - reject`));
				}else if (isStashiOS){
				body[y - 1]?.match(/^#/) && URLRewrite.push("    " + body[y - 1]);
				
				URLRewrite.push(x.replace(/\x20{2,}/g," ").replace(/(^#)?(.+?)\x20url\x20reject$/, `${noteK4}- >-${noteKn6}$2 - reject`));
				}; 
				break;
				
//(request|response)-header
			case "-header ":
				
				reHdType = x.match(' response-header ') ? 'response' : 'request';
				
				reHdPtn = x.replace(/\x20{2,}/g," ").split(" url re")[0].replace(/^#/,"");
				if (isSurgeiOS){
					reHdPtn = reHdPtn.replace(/(.+,.+)/,'"$1"');};
				
				reHdArg1 = x.split(" " + reHdType + "-header ")[1];
				
				reHdArg2 = x.split(" " + reHdType + "-header ")[2];
				
				if (isLooniOS){
				body[y - 1]?.match(/^#/) && script.push(body[y - 1]);
				script.push(`${noteK}http-${reHdType} ${reHdPtn} script-path=https://raw.githubusercontent.com/Script-Hub-Org/Script-Hub/main/scripts/replace-header.js, timeout=60, tag=replaceHeader_${y}, argument="${reHdArg1}->${reHdArg2}"`);				
				}else if (isSurgeiOS || isShadowrocket){
				body[y - 1]?.match(/^#/) && script.push(body[y - 1]);
				script.push(`${noteK}replaceHeader_${y} = type=http-${reHdType}, pattern=${reHdPtn}, script-path=https://raw.githubusercontent.com/Script-Hub-Org/Script-Hub/main/scripts/replace-header.js, timeout=60, argument="${reHdArg1}->${reHdArg2}"`);
				
				}else if (isStashiOS){
				body[y - 1]?.match(/^#/) && script.push("    " + body[y - 1]);
				script.push(`${noteK4}- match: ${reHdPtn}${noteKn6}name: "replace-Header"${noteKn6}type: ${reHdType}${noteKn6}timeout: 30${noteKn6}argument: |-${noteKn8}${reHdArg1}->${reHdArg2}`);
				providers.push(`${noteK2}"replace-Header":${noteKn4}url: https://raw.githubusercontent.com/Script-Hub-Org/Script-Hub/main/scripts/replace-header.js${noteKn4}interval: 86400`	);				
				};
				break;
				
			case " echo-response ":
			
				arg = x.split(" echo-response ")[2];
			
			if(/^(https?|ftp|file):\/\/.*/.test(arg)){
				
				urlInNum = x.replace(/\x20{2,}/g," ").split(" ").indexOf("url");
				
				ptn = x.replace(/\x20{2,}/g," ").split(" ")[urlInNum - 1].replace(/^#/,"");
                
				scname = arg.substring(arg.lastIndexOf('/') + 1, arg.lastIndexOf('.') );
				if (isLooniOS){
				body[y - 1]?.match(/^#/) && script.push(body[y - 1]);
				
				script.push(
					`${noteK}http-request ${ptn} script-path=https://raw.githubusercontent.com/Script-Hub-Org/Script-Hub/main/scripts/echo-response.js, timeout=60, tag=${scname}_${y}, argument=type=text/json&url=${arg}`);
				}else if (isSurgeiOS){
				body[y - 1]?.match(/^#/) && MapLocal.push(body[y - 1]);

				mockPtn = x.replace(/\x20{2,}/g," ").split(" url echo-response")[0].replace(/^#/,"");
				
				dataCon = x.replace(/\x20{2,}/g," ").split(" echo-response ")[2];
				
				MapLocal.push(`${noteK}${mockPtn} data="${dataCon}"`);
				}else if (isShadowrocket){
				body[y - 1]?.match(/^#/) && script.push(body[y - 1]);
				
				script.push(
					`${noteK}${scname}_${y} = type=http-request, pattern=${ptn}, script-path=https://raw.githubusercontent.com/Script-Hub-Org/Script-Hub/main/scripts/echo-response.js, timeout=60, argument=type=text/json&url=${arg}`)
				}else if (isStashiOS){
				body[y - 1]?.match(/^#/) && script.push("    " + body[y - 1]);
				
				script.push(
					`${noteK4}- match: ${ptn}${noteKn6}name: "echo-response"${noteKn6}type: request${noteKn6}timeout: 30${noteKn6}argument: |-${noteKn8}type=text/json&url=${arg}`)
				
				providers.push(
							`${noteK2}"echo-response":${noteKn4}url: https://raw.githubusercontent.com/Script-Hub-Org/Script-Hub/main/scripts/echo-response.js${noteKn4}interval: 86400`);
				}; 

			}else{others.push(x)};
			
				break;

//mitm
			case "hostname":
			
			    if (isLooniOS){
					
				MITM = x.replace(/%.*%/g," ").replace(/\x20/g,"").replace(/,*\x20*$/,"").replace(/hostname=(.*)/, `[MITM]\n\nhostname = $1`).replace(/=\x20,+/,"= ");
				}else if (isSurgeiOS || isShadowrocket){
					
				MITM = x.replace(/%.*%/g,"").replace(/\x20/g,"").replace(/,{2,}/g,",").replace(/,*\x20*$/,"").replace(/hostname=(.*)/, `[MITM]\n\nhostname = %APPEND% $1`).replace(/%\x20,+/,"% ");
				}else if (isStashiOS){
					
				MITM = x.replace(/%.*%/g,"").replace(/\x20/g,"").replace(/,{2,}/g,",").replace(/,*\x20*$/,"").replace(/hostname=(.*)/, `t&2;mitm:\nt&hn;"$1"`).replace(/",+/,'"');
				};
				break;
				
//302/307		
				
			case " url 30":
				
				if (isLooniOS || isSurgeiOS || isShadowrocket){
					body[y - 1]?.match(/^#/) && URLRewrite.push(body[y - 1]);
					URLRewrite.push(x.replace(/\x20{2,}/g," ").replace(/(^#)?(.*?)\x20url\x20(302|307)\x20(.+)/, `${noteK}$2 $4 $3`));
				}else if (isStashiOS){
				body[y - 1]?.match(/^#/) && URLRewrite.push("    " + body[y - 1]);
					URLRewrite.push(x.replace(/\x20{2,}/g," ").replace(/(^#)?(.*?)\x20url\x20(302|307)\x20(.+)/, `${noteK4}- >-${noteKn6}$2 $4 $3`));
				};
				break;
		
			default:
            
            if (type.match(/\x20(request|response)-body/)){
                
//(response|request)-body
				reBdType = x.match(' response-body ') ? 'response' : 'request';
				
				reBdPtn = x.replace(/\x20{2,}/g," ").split(" url re")[0].replace(/^#/,"");
				if (isSurgeiOS){
					reBdPtn = reBdPtn.replace(/(.+,.+)/,'"$1"');};
				reBdArg1 = x.split(" " + reBdType + "-body ")[1];
				
				reBdArg2 = x.split(" " + reBdType + "-body ")[2];
					if (isLooniOS){
					body[y - 1]?.match(/^#/) && script.push(body[y - 1]);
						
					script.push(
							`${noteK}http-${reBdType} ${reBdPtn} script-path=https://raw.githubusercontent.com/Script-Hub-Org/Script-Hub/main/scripts/replace-body.js, requires-body=true, timeout=60 ,tag=replaceBody_${y}, argument="${reBdArg1}->${reBdArg2}"`);
					}else if (isSurgeiOS || isShadowrocket){
					body[y - 1]?.match(/^#/) && script.push(body[y - 1]);
					script.push(
							`${noteK}replaceBody_${y} = type=http-${reBdType}, pattern=${reBdPtn}, requires-body=true, max-size=3145728, script-path=https://raw.githubusercontent.com/Script-Hub-Org/Script-Hub/main/scripts/replace-body.js, timeout=60, argument="${reBdArg1}->${reBdArg2}"`);
					}else if (isStashiOS){
					body[y - 1]?.match(/^#/) && script.push("    " + body[y - 1]);
					
					script.push(
							`${noteK4}- match: ${reBdPtn}${noteKn6}name: "replace-Body"${noteKn6}type: ${reBdType}${noteKn6}timeout: 30${noteKn6}require-body: true${noteKn6}max-size: 3145728${noteKn6}argument: |-${noteKn8}${reBdArg1}->${reBdArg2}`);
					providers.push(
							`${noteK2}"replace-Body":${noteKn4}url: https://raw.githubusercontent.com/Script-Hub-Org/Script-Hub/main/scripts/replace-body.js${noteKn4}interval: 86400`);	
					};
                    }else if (type.match(/\x20(https?|ftp|file)/)){
//定时任务                    
				cronExp = x.replace(/\x20{2,}/g," ").split(/\x20(https?|ftp|file)/)[0].replace(/^#/,'');
				
				cronJs = x.replace(/^#/,"")
				.replace(/\x20{2,}/g," ")
				.replace(cronExp,"")
				.split(/ *, */)[0];
				
            if (nCron != null){
	for (let i=0; i < nCron.length; i++) {
  const elem = nCron[i];
	if (x.indexOf(elem) != -1){
        cronExp = nCronExp[i];   
            };};};
                
				if (isStashiOS){
					cronExp = cronExp.replace(/[^\s]+ ([^\s]+ [^\s]+ [^\s]+ [^\s]+ [^\s]+)/,'$1');}
				
				croName = cronJs.substring(cronJs.lastIndexOf('/') + 1, cronJs.lastIndexOf('.') );
				
				jsname = croName;
				
				cronJs = jsPre + cronJs + jsSuf.replace(/_yuliu_/,jsname);
				
				if (isSurgeiOS || isShadowrocket){
				body[y - 1]?.match(/^#/) && script.push(body[y - 1]);
				script.push(
						`${noteK}${croName} = type=cron, cronexp="${cronExp}", script-path=${cronJs}, timeout=60, wake-system=1`);	
				}else if (isLooniOS){
				body[y - 1]?.match(/^#/) && script.push(body[y - 1]);
				script.push(
						`${noteK}cron "${cronExp}" script-path=${cronJs}, timeout=60, tag=${croName}`);
				}else if (isStashiOS){
					let noteKstatus = noteKn4.match(/#/) ? 'true' : 'false';
					
scriptBox.push({"noteK":noteKstatus,"jsurl":cronJs,"name":croName + "_" + y,"cron":cronExp});	};
                    };//定时任务转换结束
				}
		} //switch结束
	
}; //循环结束

if (isLooniOS){
    pluginDesc = (pluginDesc[0] || '') && `${pluginDesc.join("\n")}`;
    
    if (pluginDesc !="" && pluginDesc.search(/#! *name *=/) != -1){
        //没有图标的插入图标
        if (pluginDesc.search(/#! *icon *= *.+/) == -1){
        pluginDesc = pluginDesc + "\n" + pluginIcon;
            
        }else{pluginDesc = pluginDesc;};
		
        //Pokemon没有作者的插入作者
        if (iconLibrary2 == "Pokemon" && pluginDesc.search(/#! *author *= *.+/i) == -1){
        pluginDesc = pluginDesc + "\n" + pluginPokemonAuthor;
        }else{pluginDesc = pluginDesc;};
		
        //Pokemon没有homepage的插入homepage
        if (iconLibrary2 == "Pokemon" && pluginDesc.search(/#! *homepage *= *.+/i) == -1){
        pluginDesc = pluginDesc + "\n" + pluginPokemonHomepage;
        }else{pluginDesc = pluginDesc;};
		
    }else{
        if (iconLibrary2 == "Pokemon"){
            pluginDesc = npluginDesc + "\n" + pluginIcon + "\n" + pluginPokemonAuthor + "\n" + pluginPokemonHomepage;
        }else{
                    pluginDesc = npluginDesc + "\n" + pluginIcon;
        };
    };
    
    if (iconReplace == "启用" && pluginDesc.search(/#!icon=/) == -1 ){
        pluginDesc = pluginDesc + "\n" + pluginIcon};
    
	script = (script[0] || '') && `[Script]\n\n${script.join("\n\n")}`;
	
	URLRewrite = (URLRewrite[0] || '') && `[Rewrite]\n\n${URLRewrite.join("\n")}`;
	
	others = (others[0] || '') && `${others.join("\n\n")}`;
	
body = `${pluginDesc}


${URLRewrite}


${script}


${MITM}`
		.replace(/(#.+\n)\n+(?!\[)/g,'$1')
		.replace(/\n{2,}/g,'\n\n')
}else if (isSurgeiOS || isShadowrocket){
    
    pluginDesc = (pluginDesc[0] || '') && `${pluginDesc.join("\n")}`;
    
    if (pluginDesc !="" && pluginDesc.search(/#! *name *=/) != -1){
        pluginDesc = pluginDesc;
    }else{
        pluginDesc = npluginDesc;
    };
    
	script = (script[0] || '') && `[Script]\n\n${script.join("\n\n")}`;
	
	URLRewrite = (URLRewrite[0] || '') && `[URL Rewrite]\n\n${URLRewrite.join("\n")}`;
	
	MapLocal = (MapLocal[0] || '') && `[Map Local]\n\n${MapLocal.join("\n\n")}`;
	
	others = (others[0] || '') && `${others.join("\n\n")}`;

body = `${pluginDesc}


${URLRewrite}


${script}


${MapLocal}


${MITM}`
		.replace(/(#.+\n)\n+(?!\[)/g,'$1')
		.replace(/\n{2,}/g,'\n\n')

}else if (isStashiOS){
    
    pluginDesc = (pluginDesc[0] || '') && `${pluginDesc.join("\n")}`;
    
    if (pluginDesc !="" && pluginDesc.search(/name: /) != -1){
        pluginDesc = pluginDesc;
    }else{
        pluginDesc = npluginDesc;
    };
	
	URLRewrite = (URLRewrite[0] || '') && `  rewrite:\n${URLRewrite.join("\n")}`;
	
	
	
//处理脚本名字
let urlMap = {};

for (let i = 0; i < scriptBox.length; i++) {
  let url = scriptBox[i].jsurl;

  if (urlMap[url]) {
    scriptBox[i].name = urlMap[url];
  } else {
    urlMap[url] = scriptBox[i].name;
  }
};

for (let i = 0; i < scriptBox.length; i++) {
	let noteKn4,noteKn6,noteK2
	if (scriptBox[i].noteK == "true"){
		noteKn4 = "\n#    ";noteKn6 = "\n#      ";noteK2 = "#  ";
	}else{noteKn4 = "\n    ";noteKn6 = "\n      ";noteK2 = "  ";}
	if (scriptBox[i].matchptn !== undefined){
	script.push(`${noteKn4}- match: ` + scriptBox[i].matchptn + `${noteKn6}name: "` + scriptBox[i].name + `"${noteKn6}type: ` + scriptBox[i].type + `${noteKn6}timeout: 30` + `${noteKn6}require-body: ` + scriptBox[i].requirebody + `${noteKn6}max-size: ` + scriptBox[i].maxsize + `${noteKn6}binary-mode: ` + scriptBox[i].binarymode);
	
	providers.push(`${noteK2}"` + scriptBox[i].name + '":' + `${noteKn4}url: ` + scriptBox[i].jsurl + `${noteKn4}interval: 86400`);
	}else{
		cron.push(`${noteKn4}- name: "` + scriptBox[i].name + `"${noteKn6}cron: "` + scriptBox[i].cron + `"${noteKn6}timeout: 60`);
		
		providers.push(`${noteK2}"` + scriptBox[i].name + '":' + `${noteKn4}url: ` + scriptBox[i].jsurl + `${noteKn4}interval: 86400`);
	}

};

providers = [...new Set(providers)];
    
	script = (script[0] || '') && `  script:\n${script.join("\n\n")}`;
    
    	MITM = MITM.replace(/\x20/g,'')
           .replace(/\,/g,'"\n    - "')
		   .replace(/t&2;/g,'  ')
		   .replace(/t&hn;/g,'    - ')
	
    if (URLRewrite != "" || script != "" || MITM !=""){
httpFrame = `http:
${URLRewrite}

${script}

${MITM}`
    };

	cron = (cron[0] || '') && `cron:\n  script:\n${cron.join("\n")}`;
	
	providers = (providers[0] || '') && `script-providers:\n${providers.join("\n")}`;
	
	others = (others[0] || '') && `${others.join("\n\n")}`;

body = `${pluginDesc}


${httpFrame}

${cron}

${providers}`
		.replace(/script-providers:\n+$/g,'')
		.replace(/#      \n/gi,'\n')
		.replace(/      \n/g,"")
		.replace(/(#.+\n)\n+(?!\[)/g,'$1')
		.replace(/\n{2,}/g,'\n\n')
};

others !="" && notify("不支持的类型已跳过",others,"点击查看原文，长按可展开查看剩余不支持内容",req)

eval(evJsmodi);
eval(evUrlmodi);

 $done({ response: { status: 200 ,body:body ,headers: {'Content-Type': 'text/plain; charset=utf-8'} } });
}//判断是否断网的反括号


})()
.catch((e) => {
		notify(`Script Hub: QX转换`,`${e}`,'','https://t.me/zhetengsha_group');
		result = {
      response: {
        status: 500,
        body: `${e}\n\n\n\n\n\nScript Hub QX转换: ❌  可自行翻译错误信息或复制错误信息后点击通知进行反馈
`,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST,GET,OPTIONS,PUT,DELETE',
          'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
        },
      },
    }
	})

function notify ( title , subt , desc , opts ){
	if (isShadowrocketL || isLooniOSL){		$notification.post(title,subt,desc,opts);
	}else{
		$notification.post(title,subt,desc,{url:opts});};
};

function getval(key) {
          return $persistentStore.read(key)
    };

function setval(val, key) {
          return $persistentStore.write(val, key)
    };
		
function toObj(str, defaultValue = null) {
      try {
        return JSON.parse(str)
      } catch {
        return defaultValue
      }
    };

function toStr(obj, defaultValue = null) {
      try {
        return JSON.stringify(obj)
      } catch {
        return defaultValue
      }
    };
	
function http(req) {
  return new Promise((resolve, reject) =>
    $httpClient.get(req, (err, resp,data) => {
  resolve(data)
  })
)
};

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


async function isBinaryMode(url) {

if (url.search(/proto/i) != -1) {
	return "true"
  } else if (url.search(/(tieba|youtube|bili|spotify)/i) != -1){
		if (binaryInfo != "" && binaryInfo.some(item=>item.url===url)){
			for (let i = 0; i < binaryInfo.length; i++) {
  if (binaryInfo[i].url === url) {
    binarymode = binaryInfo[i].binarymode;
		return binarymode;
    break;
  }
}
		} else {
			const res = await http(url);
	if (res == undefined){
		//console.log("Script Hub QX 转换器 查询脚本链接失败");
		return "false";
	}else if (res.includes(".bodyBytes")){
		binaryInfo.push({"url":url,"binarymode":"true"});
		setval(toStr(binaryInfo), "Parser_binary_info")
		return "true";
	}else{binaryInfo.push({"url":url,"binarymode":"false"});
		setval(toStr(binaryInfo), "Parser_binary_info")
		return "false";}     }//没有信息或者没有url的信息
		
	}else {return "false"}
};