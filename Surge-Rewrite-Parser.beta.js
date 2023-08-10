/****************************
支持将Surge重写解析至Loon Stash Surge Shadowrocket
说明
原脚本作者@小白脸 脚本修改@chengkongyiban
感谢@xream 提供的echo-response.js
插件图标用的 @Keikinn 的 StickerOnScreen项目 以及 @Toperlock 的图标库项目，感谢
宝可梦插件图标游戏 由ChatGPT @chengkongyiban @Toperlock 共同完成 再次感谢@xream佬
***************************/

const $ = new Env("Surge-Rewrite-Parser");

const url = $request.url;
var req = url.split(/file\/_start_\//)[1].split(/\/_end_\//)[0];
	//$.log("原始链接：" + req);
var urlArg = url.split(/\/_end_\//)[1];
//获取参数
const queryObject = parseQueryString(urlArg);
//$.log("参数:" + $.toStr(queryObject));

//目标app
const targetApp = queryObject.target;
const isSurgeiOS = targetApp == "surge-module";
const isStashiOS = targetApp == "stash-stoverride";
const isLooniOS = targetApp == "loon-plugin";
const isShadowrocket = targetApp == "shadowrocket-module";

var evJsori = queryObject.evalScriptori;
var evJsmodi = queryObject.evalScriptmodi;
var evUrlori = queryObject.evalUrlori;
var evUrlmodi = queryObject.evalUrlmodi;
//$.log("修改原文参数" + evJsori);
//$.log("修改转换后参数" + evJsmodi);
var nName = queryObject.n != undefined ? queryObject.n.split("+") : null;
var Pin0 = queryObject.y != undefined ? queryObject.y.split("+") : null;
var Pout0 = queryObject.x != undefined ? queryObject.x.split("+") : null;
var hnAdd = queryObject.hnadd != undefined ? queryObject.hnadd.split(/ *, */) : null;
var hnDel = queryObject.hndel != undefined ? queryObject.hndel.split(/ *, */) : null;
var delNoteSc = istrue(queryObject.del);
var nCron = queryObject.cron != undefined ? queryObject.cron.split("+") : null;
var nCronExp = queryObject.cronexp != undefined ? queryObject.cronexp.replace(/\./g," ").split("+") : null;
var nArgTarget = queryObject.arg != undefined ? queryObject.arg.split("+") : null;
var nArg = queryObject.argv != undefined ? queryObject.argv.split("+") : null;
var nTilesTarget = queryObject.tiles != undefined ? queryObject.tiles.split("+") : null;
var nTilesColor = queryObject.tcolor != undefined ? queryObject.tcolor.split("+") : null;
var jsConverter = queryObject.jsc != undefined ? queryObject.jsc.split("+") : null;
var jsConverter2 = queryObject.jsc2 != undefined ? queryObject.jsc2.split("+") : null;
var compatibilityOnly = istrue(queryObject.compatibilityOnly);
var keepHeader = istrue(queryObject.keepHeader);
var jsDelivr = istrue(queryObject.jsDelivr);

var sufkeepHeader = keepHeader == true ? '&keepHeader=true' : '';
var sufjsDelivr = jsDelivr == true ? '&jsDelivr=true' : '';

const iconStatus = $.getval("启用插件随机图标") ?? "启用";
const iconReplace = $.getval("替换原始插件图标");
const iconLibrary1 = $.getval("插件随机图标合集") ?? "Doraemon(100P)";
var iconLibrary2 = iconLibrary1.split("(")[0];
const iconFormat = iconLibrary2.search(/gif/i) == -1 ? ".png" : ".gif";
if (iconStatus == "禁用" && iconReplace == "禁用"){iconLibrary2 = "Doraemon"};

var pluginPokemonIcon
var pluginPokemonAuthor
var pluginPokemonHomepage

var rewriteName = req.substring(req.lastIndexOf('/') + 1).split('.')[0];
var resFile = urlArg.split("?")[0];
var resFileName = 
resFile.substring(0,resFile.lastIndexOf('.'));
var notifyName
if (nName != null && nName[0] != ""){notifyName = nName[0];}else{notifyName = resFileName;};

//宝可梦插件图标game
!(async () => {
if (isLooniOS && iconLibrary2 == "Pokemon" && iconStatus == "启用"){
var pokemonJsVersion = "1.03";
var pokemonVersion = $.getval("Pokemon_version") ?? 1.00;

const poDataUrl = "https://github.com/chengkongyiban/stash/raw/main/js/Pokemon/pokemonData.json";
var poDataObj = {};
if (pokemonJsVersion * 1 > pokemonVersion * 1){
poDataObj = $.toObj((await $.http.get(poDataUrl)).body);
$.setjson(poDataObj,"Pokemon_data");
}else{
	poDataObj = $.getjson("Pokemon_data");};
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
if ($.getval("Pokemon_card_pool") == null || $.getval("Pokemon_card_pool") == ""){
	pokemonCdp = beginnerPokemon;
	 $.setjson(pokemonCdp, "Pokemon_card_pool")
}else{
    pokemonCdp = $.getjson("Pokemon_card_pool")
    if (pokemonJsVersion * 1 > pokemonVersion * 1){
	var filteredPokemonCdp = pokemonCdp.filter(function (pokemon) {
  return pokemon >= 1301 && pokemon <= 1800 && cloudPcp.includes(pokemon);
});
pokemonCdp = beginnerPokemon.concat(filteredPokemonCdp);
$.setjson(pokemonCdp, "Pokemon_card_pool");

count = $.getjson("Pokemon_count");
for (var key in count) {
  if (!pokemonCdp.includes(parseInt(key))) {
    delete count[key];
  }
};
$.setjson(count, "Pokemon_count");

$.setval(pokemonJsVersion, "Pokemon_version");
}
};

//抽卡并记录抽卡数据
if ($.getval("Pokemon_count") == null || $.getval("Pokemon_count") == ""){
    var result = getArrayItems(pokemonCdp, 1);
    var num = result[0];
    count[num] = (count[num] || 0) + 1;
$.setjson(count, "Pokemon_count");
	var pokemonInfo = getPokemonByIcon(result[0]);
    pluginPokemonIcon = "https://raw.githubusercontent.com/Toperlock/Quantumult/main/icon/Pokemon/Pokemon-" + result + ".png";
	pluginPokemonAuthor = "#!author=" + pokemonInfo.name;
	pluginPokemonHomepage = "#!homepage=" + pokemonPBUrl + pokemonInfo.number;
}else{
	$.getval("Pokemon_count")
	count = $.getjson("Pokemon_count")
	var result = getArrayItems(pokemonCdp, 1);
    var num = result[0];
    count[num] = (count[num] || 0) + 1;
	$.setjson(count, "Pokemon_count")
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
            $.setjson(pokemonCdp, "Pokemon_card_pool");
						
						var pokemonInfo = getPokemonByIcon(evolvedNum);
						
            $.msg("恭喜您解锁了新的宝可梦", pokemonInfo.name, "当前已解锁" + pokemonCdp.length + "只宝可梦",pokemonPBUrl + pokemonInfo.number);
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
            $.setjson(pokemonCdp, "Pokemon_card_pool");
						
						var pokemonInfo = getPokemonByIcon(evolvedNum);
						
            $.msg("恭喜您解锁了新的宝可梦", pokemonInfo.name, "当前已解锁" + pokemonCdp.length + "只宝可梦",pokemonPBUrl + pokemonInfo.number);
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
$.setjson(pokemonCdp, "Pokemon_card_pool");
      unlockedPokemon.forEach(pokemonNumber => {
        var pokemonInfo = getPokemonByIcon(pokemonNumber);
        if (pokemonInfo !== null) {
          $.msg("恭喜您解锁了新的宝可梦", pokemonInfo.name, "当前已解锁" + pokemonCdp.length + "只宝可梦",  pokemonPBUrl + pokemonInfo.number );
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
$.setjson(pokemonCdp, "Pokemon_card_pool");
      unlockedPokemon.forEach(pokemonNumber => {
        var pokemonInfo = getPokemonByIcon(pokemonNumber);
        if (pokemonInfo !== null) {
          $.msg("恭喜您解锁了新的宝可梦", pokemonInfo.name, "当前已解锁" + pokemonCdp.length + "只宝可梦",  pokemonPBUrl + pokemonInfo.number );
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
$.setjson(pokemonCdp, "Pokemon_card_pool");
      unlockedPokemon.forEach(pokemonNumber => {
        var pokemonInfo = getPokemonByIcon(pokemonNumber);
        if (pokemonInfo !== null) {
          $.msg("恭喜您解锁了新的宝可梦", pokemonInfo.name, "当前已解锁" + pokemonCdp.length + "只宝可梦",  pokemonPBUrl + pokemonInfo.number );
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
    $.msg("恭喜您解锁了新的宝可梦", pokemonInfo.name, "您已解锁全部112只宝可梦",  pokemonPBUrl + pokemonInfo.number );
  });
 $.setjson(pokemonCdp, "Pokemon_card_pool");
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
evUrlori = (await $.http.get(evUrlori)).body;
};
if (evUrlmodi){
evUrlmodi = (await $.http.get(evUrlmodi)).body;
};
var name = "";
var desc = "";
var icon = "";

//修改名字和简介
if (nName === null){
	name = rewriteName;
    desc = name;
}else{
	name = nName[0] != "" ? nName[0] : rewriteName;
	desc = nName[1] != undefined ? nName[1] : name;
};
if (isLooniOS || isSurgeiOS || isShadowrocket){
	name = "#!name=" + name;
	desc = "#!desc=" + desc;
}else if (isStashiOS){
	name = 'name: ' + '"' + name + '"';
	desc = 'desc: ' + '"' + desc + '"';
};

let npluginDesc = name + "\n" + desc;

//随机图标在插件中设置，默认启用
if(isLooniOS && iconStatus == "启用" && iconLibrary2 != "Pokemon"){
	const stickerStartNum = 1001;
const stickerSum = iconLibrary1.split("(")[1].split("P")[0];
let randomStickerNum = parseInt(stickerStartNum + Math.random() * stickerSum).toString();
   icon = "#!icon=" + "https://github.com/Toperlock/Quantumult/raw/main/icon/" + iconLibrary2 + "/" + iconLibrary2 + "-" + randomStickerNum + iconFormat;
}else if (isLooniOS && iconStatus == "启用" && iconLibrary2 == "Pokemon"){
    icon = "#!icon=" + pluginPokemonIcon;
};
const pluginIcon = icon;
//$.log("插件图标：" + pluginIcon);

let body = (await $.http.get(req)).body;

eval(evJsori);
eval(evUrlori);

if (body.match(/^(?:\s)*\/\*[\s\S]*?(?:\r|\n)\s*\*+\//)){
body = body.match(/(^(?:\n|\r)*\/\*[\s\S]*?(?:\r|\n)\s*\*+\/)/)[1].match(/[^\r\n]+/g);
}else{
    body = body.match(/[^\r\n]+/g);};

let pluginDesc = [];
let httpFrame = "";
let General = [];
let Panel = [];
let rules = [];
let script = [];
let URLRewrite = [];
let HeaderRewrite = [];
let MapLocal = [];
let tiles = [];
let cron = [];
let providers = [];
let MITM = "";
let others = [];       //不支持的内容

let scname = "";       //脚本重写名
let oriJs = "";        //原脚本链接
let js = "";           //转换后的脚本链接
let jsname = "";       //脚本名
let arg = "";          //用户传入的argument
let originalArg = "";  //原始argument
let sctype = "";       //脚本类型
let ptn = "";          //正则
let rebody = "";       //是否需要body
let size = "";         //允许最大body大小
let proto = "";        //是否开启binary-body-mode
let hdtype = "";       //HeaderRewrite 类型
let oricronExp = "";   //原始cron表达式
let cronExp = "";      //cron表达式
let croName = "";      //cron任务名
let rejectType = "";   //重写reject类型
let rejectPtn = "";    //重写reject正则
let mock2Reject = "";  //Mock转reject类型
let tilesIcon = "";    //Stash磁贴图标
let tilesColor = "";   //Stash磁贴颜色
let Urx2Reject = "";   //URL-REGEX转reject
let scriptBox = [];    //存放脚本信息待下一步处理

for await (var [y, x] of body.entries()) {
	x = x.replace(/^ *(#|;|\/\/)/,'#').replace(/(^[^#].+)\x20+\/\/.+/,"$1").replace(/, *REJECT([^,\s]*)$/i,',REJECT$1').replace(/, *DIRECT$/i,',DIRECT').replace(/ reject/i,' reject').replace(/^ *(hostname|force-http-engine-hosts|skip-proxy|always-real-ip)\x20*=/,'$1=').replace(/cronexpr?\x20*=\x20*/gi,'cronexp=').replace(/type *= *generic *,/i,"type=generic,").replace(/script-name *=/,"script-name=");
//去掉注释
if(Pin0 != null)	{
	for (let i=0; i < Pin0.length; i++) {
  const elem = Pin0[i];
	if (x.indexOf(elem) != -1){
		x = x.replace(/^#/,"")
	}else{};
};//循环结束
}else{};//去掉注释结束

//增加注释
if(Pout0 != null){
	for (let i=0; i < Pout0.length; i++) {
  const elem = Pout0[i];
	if (x.indexOf(elem) != -1 && x.search(/^(hostname|force-http-engine-hosts|skip-proxy|always-real-ip)=/) == -1){
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
x = "hostname=" + x;
}else{};//删除主机名结束

if (delNoteSc === true && x.match(/^#/) && x.indexOf("#!") == -1){
		x = "";
};

let jscStatus,jsc2Status
if (jsConverter != null){
	jscStatus = isJsCon(jsConverter);}
if (jsConverter2 != null){
	jsc2Status = isJsCon(jsConverter2);}
if (jsc2Status == true){jscStatus = false};

let jsPre = "";
let jsSuf = "";
let oriType = queryObject.type.split("-")[0];
let jsTarget = targetApp.split("-")[0];

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
		/^#!|http-re|\x20header-|type=generic,|script-name=|cronexp=|\x20reject|\x20data=|^hostname|^force-http-engine-hosts|^skip-proxy|^always-real-ip|\x20(302|307|header)$|,REJECT[^,\s]*$|,DIRECT/
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
//Panel脚本            
            case "type=generic,":
                    
				scname = x.split(/ *=/)[0].replace(/^#/,'');
				
				oriJs = x.replace(/\x20/g,"").split("script-path=")[1].split(",")[0];
				
				js = toJsc(oriJs);
				
                if (x.match(/icon=/)){
                tilesIcon = x.split("icon=")[1].split("&")[0];};
                
                if (x.match(/icon-color=/)){
                tilesColor = x.split("icon-color=")[1].split("&")[0];};
                
//获取argument
				if (isSurgeiOS){
					if (x.match(/,\x20*argument\x20*=.+/)){
						if (x.match(/,\x20*argument\x20*=\x20*"+.*?,.*?"+/)
	){
				originalArg = x.match(/(,\x20*argument\x20*=\x20*"+.*?,.*?"+)/)[1];
	}else{
				originalArg = x.match(/(,\x20*argument\x20*=[^,]*),?/)[1];}
				}else if (x.match(/,\x20*argument\x20*=\x20*(?:$|,)/)){
					originalArg = x.match(/(,\x20*argument\x20*=\x20*(?:$|,))/)[1];};

				}else if (isStashiOS){
					if (x.match(/,\x20*argument\x20*=.+/)){
						if (x.match(/,\x20*argument\x20*=\x20*"+.*?,.*?"+/)
	){
				arg = x.match(/,\x20*argument\x20*=\x20*("+.*?,.*?"+)/)[1];
				
				if (arg.match(/^".+"$/)){
				arg = `${noteKn6}argument: |-${noteKn8}` + arg.replace(/^"(.+)"$/,'$1');};
	}else{
				arg = `${noteKn6}argument: |-${noteKn8}` + x.replace(/,\x20*argument\x20*=/gi,",argument=").split(",argument=")[1].split(",")[0];}
				
				}else{};

				};//获取argument结束
            
            if (isSurgeiOS){
                
            if (nArgTarget != null){
	for (let i=0; i < nArgTarget.length; i++) {
  const elem = nArgTarget[i];
	if (x.indexOf(elem) != -1){
        arg = ', argument="' + nArg[i].replace(/t;amp;/g,"&").replace(/t;add;/g,"+") + '"';   
            };};};
                
				body[y - 1]?.match(/^#/) &&  script.push(body[y - 1]);
                if (arg == "" && oriJs == js){
					script.push(x);
				}else if (arg != ""){
		script.push(
			x.replace(originalArg,"")
			.replace(oriJs,js) + arg);
				}else if (arg == ""){
		script.push(
			x.replace(oriJs,js));
				};
                
            }else if (isStashiOS){
                
            if (nArgTarget != null){
	for (let i=0; i < nArgTarget.length; i++) {
  const elem = nArgTarget[i];
	if (x.indexOf(elem) != -1){
        arg = `${noteKn4}argument: |-${noteKn6}` + nArg[i].replace(/t;amp;/g,"&").replace(/t;add;/g,"+");   
            };};};
                
            if (nTilesTarget != null){
	for (let i=0; i < nTilesTarget.length; i++) {
  const elem = nTilesTarget[i];
	if (x.indexOf(elem) != -1){
        tilesColor = nTilesColor[i].replace(/@/g,"#");   
            };};};

				body[y - 1]?.match(/^#/) && tiles.push("    " + body[y - 1]);
				
				tiles.push(
					`${noteK2}- name: "${scname}_${y}"${noteKn4}interval: 3600${noteKn4}title: "${scname}"${noteKn4}icon: "${tilesIcon}"${noteKn4}backgroundColor: "${tilesColor}"${noteKn4}timeout: 30${arg}`);
			providers.push(
					`${noteK2}"${scname}_${y}":${noteKn4}url: ${js}${noteKn4}interval: 86400`);
            };
            
            break;
//Panel配置            
            case "script-name=":
            
            if (isSurgeiOS){
                
				body[y - 1]?.match(/^#/) &&  [Panel].push(body[y - 1]);
                Panel.push(x);
            };

            break;
			
			case "http-re":
//Surge5脚本			
			if (x.match(/=\x20*http-re/)) {
				
				sctype = x.match('http-response') ? 'response' : 'request';
				
				scname = x.replace(/\x20/g,'').split("=")[0].replace(/^#/,'');
				
				ptn = x.replace(/(\{[0-9]+)\,([0-9]*\})/g,'$1t&zd;$2').replace(/\x20/g,"").split("pattern=")[1].split(",")[0].replace(/"/gi,'');
				
				oriJs = x.replace(/\x20/g,"").split("script-path=")[1].split(",")[0];
				
				js = toJsc(oriJs);

				proto = x.replace(/\x20/gi,'').match('binary-body-mode=(true|1)') ? ', binary-body-mode=true' : '';
				
				rebody = x.replace(/\x20/gi,'').match('requires-body=(true|1)') ? ', requires-body=true' : '';
				
				size = x.replace(/\x20/g,'').match('requires-body=(true|1)') ? ', max-size=3145728' : '';
				
				if (isLooniOS || isSurgeiOS || isShadowrocket){
					if (x.match(/,\x20*argument\x20*=.+/)){
						if (x.match(/,\x20*argument\x20*=\x20*"+.*?,.*?"+/)
	){
				originalArg = x.match(/(,\x20*argument\x20*=\x20*"+.*?,.*?"+)/)[1];
	}else{
				originalArg = x.match(/(,\x20*argument\x20*=[^,]*),?/)[1];}
				}else if (x.match(/,\x20*argument\x20*=\x20*(?:$|,)/)){
					originalArg = x.match(/(,\x20*argument\x20*=\x20*(?:$|,))/)[1];};

				}else if (isStashiOS){
					if (x.match(/,\x20*argument\x20*=.+/)){
						if (x.match(/,\x20*argument\x20*=\x20*"+.*?,.*?"+/)
	){
				arg = x.match(/,\x20*argument\x20*=\x20*("+.*?,.*?"+)/)[1];
				
				if (arg.match(/^".+"$/)){
				arg = `${noteKn6}argument: |-${noteKn8}` + arg.replace(/^"(.+)"$/,'$1');};
	}else{
				arg = `${noteKn6}argument: |-${noteKn8}` + x.replace(/,\x20*argument\x20*=/gi,",argument=").split(",argument=")[1].split(",")[0];}
				
				}else{};

				};
                
			if (isLooniOS){
                arg = originalArg;
            if (nArgTarget != null){
	for (let i=0; i < nArgTarget.length; i++) {
  const elem = nArgTarget[i];
	if (x.indexOf(elem) != -1){
        arg = ', argument="' + nArg[i].replace(/t;amp;/g,"&").replace(/t;add;/g,"+") + '"';   
            };};};

				body[y - 1]?.match(/^#/) && script.push(body[y - 1]);

				script.push(
					`${noteK}http-${sctype} ${ptn} script-path=${js}${rebody}${proto}, tag=${scname}_${y}${arg}`);

				}else if (isStashiOS){
					
				rebody = x.replace(/\x20/g,'').match('requires-body=(true|1)') ? 'true' : 'false';
				
				size = x.replace(/\x20/g,'').match('requires-body=(true|1)') ? '3145728' : '0';
					
				proto = x.replace(/\x20/g,'').match('binary-body-mode=(true|1)') ? 'true' : 'false';
                
            if (nArgTarget != null){
	for (let i=0; i < nArgTarget.length; i++) {
  const elem = nArgTarget[i];
	if (x.indexOf(elem) != -1){
        arg = `${noteKn6}argument: |-${noteKn8}` + nArg[i].replace(/t;amp;/g,"&").replace(/t;add;/g,"+");   
            };};};

			let noteKstatus = noteKn4.match(/#/) ? 'true' : 'false';
			scriptBox.push({"noteK":noteKstatus,"jsurl":js,"matchptn":ptn,"name":scname + "_" + y,"type":sctype,"requirebody":rebody,"maxsize":size,"binarymode":proto,"argument":arg})
			
				}else if (isSurgeiOS || isShadowrocket){

				body[y - 1]?.match(/^#/) && script.push(body[y - 1]);
                
            if (nArgTarget != null){
	for (let i=0; i < nArgTarget.length; i++) {
  const elem = nArgTarget[i];
	if (x.indexOf(elem) != -1){
        arg = ', argument="' + nArg[i].replace(/t;amp;/g,"&").replace(/t;add;/g,"+") + '"';   
            };};};
			
                if (arg == "" && oriJs == js){
					script.push(x);
				}else if (arg != ""){
		script.push(
			x.replace(originalArg,"")
			.replace(oriJs,js) + arg);
				}else if (arg == ""){
		script.push(
			x.replace(oriJs,js));
				};
                };
				
				}else if (x.match(/\x20header-/)){
//HeaderRewrite	
			if (isLooniOS){
				body[y - 1]?.match(/^#/) &&  URLRewrite.push(body[y - 1]);
				
					
			URLRewrite.push(`${noteK}` + x.replace(/#?http-(response|request)\x20/,""))
					
					}else if (isStashiOS){

				body[y - 1]?.match(/^#/) &&  HeaderRewrite.push("    " + body[y - 1]);
				
				hdtype = x.match(/http-response/) ? 'response ' : 'request';
				
				HeaderRewrite.push(`${noteK4}- >-${noteKn6}` + x.replace(/#?http-(response|request)\x20+/,"").replace("\x20header-",`\x20${hdtype}-`))
					}else if (isSurgeiOS){

				body[y - 1]?.match(/^#/) &&  HeaderRewrite.push(body[y - 1]);
                HeaderRewrite.push(x);};

				}else if (x.match(/http-(response|request)\x20/)){
//Surge4脚本
				ptn = x.replace(/\x20{2,}/g," ").split(" ")[1].replace(/"/gi,'');
					
				oriJs = x.replace(/\x20/gi,"").split("script-path=")[1].split(",")[0];
                
            if (x.search(/, *tag *=/) != -1){
				scname = x.replace(/\x20/g,"").split("tag=")[1].split(",")[0];
            }else{
				scname = oriJs.substring(oriJs.lastIndexOf('/') + 1, oriJs.lastIndexOf('.'));};
				
				js = toJsc(oriJs);
					
				sctype = x.match('http-response') ? 'response' : 'request';
				
				proto = x.replace(/\x20/gi,'').match('binary-body-mode=(true|1)') ? ', binary-body-mode=true' : '';
				
				rebody = x.replace(/\x20/gi,'').match('requires-body=(true|1)') ? ', requires-body=true' : '';
				
				size = x.replace(/\x20/g,'').match('requires-body=(true|1)') ? ', max-size=3145728' : '';
				
			if (isLooniOS || isSurgeiOS || isShadowrocket){
					if (x.match(/,\x20*argument\x20*=.+/)){
						if (x.match(/,\x20*argument\x20*=\x20*"+.*?,.*?"+/)
	){
				originalArg = x.match(/(,\x20*argument\x20*=\x20*"+.*?,.*?"+)/)[1];
	}else{
				originalArg = x.match(/(,\x20*argument\x20*=[^,]*),?/)[1];}
				}else if (x.match(/,\x20*argument\x20*=\x20*(?:$|,)/)){
					originalArg = x.match(/(,\x20*argument\x20*=\x20*(?:$|,))/)[1];};

				}else if (isStashiOS){
					if (x.match(/,\x20*argument\x20*=.+/)){
						if (x.match(/,\x20*argument\x20*=\x20*"+.*?,.*?"+/)
	){
				arg = x.match(/,\x20*argument\x20*=\x20*("+.*?,.*?"+)/)[1];
				
				if (arg.match(/^".+"$/)){
				arg = `${noteKn6}argument: |-${noteKn8}` + arg.replace(/^"(.+)"$/,'$1');};
	}else{
				arg = `${noteKn6}argument: |-${noteKn8}` + x.replace(/,\x20*argument\x20*=/gi,",argument=").split(",argument=")[1].split(",")[0];}
				
				}else{};

				};
	
				if (isLooniOS){
				arg = originalArg;
				body[y - 1]?.match(/^#/) && script.push(body[y - 1]);
                
            if (nArgTarget != null){
	for (let i=0; i < nArgTarget.length; i++) {
  const elem = nArgTarget[i];
	if (x.indexOf(elem) != -1){
        arg = ', argument="' + nArg[i].replace(/t;amp;/g,"&").replace(/t;add;/g,"+") + '"';   
            };};};

				script.push(
					`${noteK}http-${sctype} ${ptn} script-path=${js}${rebody}${proto}, tag=${scname}_${y}${arg}`);

				}else if (isStashiOS){

				proto = x.replace(/\x20/g,'').match('binary-body-mode=(true|1)') ? 'true' : 'false';

				rebody = x.replace(/\x20/g,'').match('requires-body=(true|1)') ? 'true' : 'false';
				
				size = x.replace(/\x20/g,'').match('requires-body=(true|1)') ? '3145728' : '0';
                
            if (nArgTarget != null){
	for (let i=0; i < nArgTarget.length; i++) {
  const elem = nArgTarget[i];
	if (x.indexOf(elem) != -1){
        arg = `${noteKn6}argument: |-${noteKn8}` + nArg[i].replace(/t;amp;/g,"&").replace(/t;add;/g,"+");   
            };};};
			
			let noteKstatus = noteKn4.match(/#/) ? 'true' : 'false';
			scriptBox.push({"noteK":noteKstatus,"jsurl":js,"matchptn":ptn,"name":scname + "_" + y,"type":sctype,"requirebody":rebody,"maxsize":size,"binarymode":proto,"argument":arg})
			
				}else if (isSurgeiOS || isShadowrocket){
                    
				body[y - 1]?.match(/^#/) &&  script.push(body[y - 1]);
                
            if (nArgTarget != null){
	for (let i=0; i < nArgTarget.length; i++) {
  const elem = nArgTarget[i];
	if (x.indexOf(elem) != -1){
        arg = ', argument="' + nArg[i].replace(/t;amp;/g,"&").replace(/t;add;/g,"+") + '"';   
            };};};
			
                if (arg == "" && oriJs == js){
					script.push(x);
				}else if (arg != ""){
		script.push(
	x.replace(originalArg,"")
	.replace(oriJs,js) + arg);
				}else if (arg == ""){
		script.push(
			x.replace(oriJs,js));
				};
                };

				}else{others.push(x)};//整个http-re结束
				
				break;
				
//不是以http-re开头的HeaderRewrite				
			case " header-":
					
					if (isLooniOS){
				body[y - 1]?.match(/^#/) &&  URLRewrite.push(body[y - 1]);
					
			URLRewrite.push(`${noteK}` + x.replace(/#?http-(response|request)\x20/,""))
					
					}else if (isStashiOS){

				body[y - 1]?.match(/^#/) &&  HeaderRewrite.push("    " + body[y - 1]);
				
				hdtype = x.match(/http-response/) ? 'response ' : 'request';
				
				HeaderRewrite.push(`${noteK4}- >-${noteKn6}` + x.replace(/#?http-(response|request)\x20+/,"").replace("\x20header-",`\x20${hdtype}-`))
					}else if (isSurgeiOS){
                        
				body[y - 1]?.match(/^#/) &&  HeaderRewrite.push(body[y - 1]);
                HeaderRewrite.push(x);
                    };//HeaderRewrite结束
				
				break;

//定时任务
			case "cronexp=":

            if (x.match(/cronexp=(.+?),[^,]+?=/)){
                oricronExp = x.match(/cronexp=(.+?),[^,]+?=/)[1];
            }else{
                oricronExp = x.split("cronexp=")[1];
            };
			
		cronExp = oricronExp.replace(/"/g,'');
			
            if (isStashiOS){
				
				cronExp = cronExp.replace(/[^\s]+ ([^\s]+ [^\s]+ [^\s]+ [^\s]+ [^\s]+)/,'$1');
            };
            
            if (nCron != null){
	for (let i=0; i < nCron.length; i++) {
  const elem = nCron[i];
	if (x.indexOf(elem) != -1){
        cronExp = nCronExp[i];   
            };};};
            
				croName = x.split("=")[0].replace(/\x20/g,"").replace(/^#/,'');
				
				oriJs = x.replace(/\x20/gi,"").split("script-path=")[1].split(",")[0];
				
				js = toJsc(oriJs);
				
			if (isLooniOS || isSurgeiOS || isShadowrocket){
					if (x.match(/,\x20*argument\x20*=.+/)){
						if (x.match(/,\x20*argument\x20*=\x20*"+.*?,.*?"+/)
	){
				originalArg = x.match(/(,\x20*argument\x20*=\x20*"+.*?,.*?"+)/)[1];
	}else{
				originalArg = x.match(/(,\x20*argument\x20*=[^,]*),?/)[1];}
				}else if (x.match(/,\x20*argument\x20*=\x20*(?:$|,)/)){
					originalArg = x.match(/(,\x20*argument\x20*=\x20*(?:$|,))/)[1];};

				}else if (isStashiOS){
					if (x.match(/,\x20*argument\x20*=.+/)){
						if (x.match(/,\x20*argument\x20*=\x20*"+.*?,.*?"+/)
	){
				arg = x.match(/,\x20*argument\x20*=\x20*("+.*?,.*?"+)/)[1];
				
				if (arg.match(/^".+"$/)){
				arg = `${noteKn6}argument: |-${noteKn8}` + arg.replace(/^"(.+)"$/,'$1');};
	}else{
				arg = `${noteKn6}argument: |-${noteKn8}` + x.replace(/,\x20*argument\x20*=/gi,",argument=").split(",argument=")[1].split(",")[0];}
				
				}else{};

				};
                
				if (isLooniOS){
				arg = originalArg;
                
            if (nArgTarget != null){
	for (let i=0; i < nArgTarget.length; i++) {
  const elem = nArgTarget[i];
	if (x.indexOf(elem) != -1){
        arg = ', argument="' + nArg[i].replace(/t;amp;/g,"&").replace(/t;add;/g,"+") + '"';   
            };};};
				
				script.push(
						`${noteK}cron "${cronExp}" script-path=${js}, timeout=60, tag=${croName}${arg}`);
                }else if (isStashiOS){
                
            if (nArgTarget != null){
	for (let i=0; i < nArgTarget.length; i++) {
  const elem = nArgTarget[i];
	if (x.indexOf(elem) != -1){
        arg = `${noteKn6}argument: |-${noteKn8}` + nArg[i].replace(/t;amp;/g,"&").replace(/t;add;/g,"+");   
            };};};
					let noteKstatus = noteKn4.match(/#/) ? 'true' : 'false';
					
scriptBox.push({"noteK":noteKstatus,"jsurl":js,"name":croName + "_" + y,"cron":cronExp,"argument":arg});	
                }else if(isSurgeiOS || isShadowrocket){
                
            if (nArgTarget != null){
	for (let i=0; i < nArgTarget.length; i++) {
  const elem = nArgTarget[i];
	if (x.indexOf(elem) != -1){
        arg = ', argument="' + nArg[i].replace(/t;amp;/g,"&").replace(/t;add;/g,"+") + '"';   
            };};};
			
			if (arg != ""){
				script.push(
		x.replace(originalArg,"")
		.replace(oriJs,js)
		.replace(oricronExp,'"' + cronExp + '"') + arg);
			}else if (arg == ""){
				script.push(
		x.replace(oriJs,js)
		.replace(oricronExp,'"' + cronExp + '"')
		);
			};
                };
				break;

//REJECT

			case " reject":
            
            rejectType = x.split(" ")[x.split(" ").length - 1].toLowerCase().replace(/tinygif/,"img");
            
            rejectPtn = x.split(" ")[0].replace(/^#/,"");
            
            if (x.search(/ reject(-200|-img|-dict|-array|-tinygif)?$/i) == -1){
                
            }else if (isLooniOS || isShadowrocket){
                
				body[y - 1]?.match(/^#/) && URLRewrite.push(body[y - 1]);
                
				URLRewrite.push(
                    `${noteK}${rejectPtn} - ${rejectType}`);
                
            }else if (isStashiOS){
                
				body[y - 1]?.match(/^#/) && URLRewrite.push("    " + body[y - 1]);
				
				URLRewrite.push(
                    `${noteK4}- >-${noteKn6}${rejectPtn} - ${rejectType}`);
                
            }else if (isSurgeiOS){
                
                if (rejectType.match("-")){
//reject-                    
                
				body[y - 1]?.match(/^#/) && MapLocal.push(body[y - 1]);
                    
				if (rejectType.match(/dict$/)){
					rejectType = "https://raw.githubusercontent.com/mieqq/mieqq/master/reject-dict.json"
				}else if (rejectType.match(/array$/)){
					rejectType = "https://raw.githubusercontent.com/mieqq/mieqq/master/reject-array.json"
				}else if (rejectType.match(/200$/)){
					rejectType = "https://raw.githubusercontent.com/mieqq/mieqq/master/reject-200.txt"
				}else if (rejectType.match(/img$/)){
					rejectType = "https://raw.githubusercontent.com/mieqq/mieqq/master/reject-img.gif"
				};
                MapLocal.push(
                    `${rejectPtn} data="${rejectType}"`);
                  
                }else{//reject
                
				body[y - 1]?.match(/^#/) && URLRewrite.push(body[y - 1]);
				
				URLRewrite.push(
                    `${noteK}${rejectPtn} - reject`);
                    
                }
                
            };
				break;
			
//Mock转reject/request

			case " data=":
				
				ptn = x.replace(/\x20{2,}/g," ").split(" data=")[0].replace(/^#|"/g,"");
				js = x.split(' data="')[1].split('"')[0];
				scname = js.substring(js.lastIndexOf('/') + 1);
				
				x.search(/ header="/) != -1 ? mockHeader = x.split(' header="')[1].split('"')[0] : mockHeader = "";
				
				if (mockHeader != ""){
					if (isSurgeiOS && keepHeader == true){
						mockHeader = ` header="${mockHeader}"`;
					}else if (isSurgeiOS && keepHeader == false){
						mockHeader = "";
					}else{
						mockHeader = '&header=' + encodeURIComponent(mockHeader);
					}
				};
				
				js = isSurgeiOS ? js : `http://script.hub/convert/_start_/${js}/_end_/${scname}?type=mock&target-app=${targetApp}${mockHeader}${sufkeepHeader}${sufjsDelivr}`;
				
                if (isSurgeiOS){
                    
				body[y - 1]?.match(/^#/) &&  MapLocal.push(body[y - 1]);
                MapLocal.push(`${noteK}${ptn} data="${js}"${mockHeader}`);
                }else if (scname.match(/(img|dict|array|200|blank|tinygif)\.[^.]+$/i)){
                
                
                if (scname.match(/dict\.[^.]+$/i)){
                    mock2Reject = "-dict";
                    
                }else if (scname.match(/array\.[^.]+$/i)){
                    mock2Reject = "-array";
                    
                }else if (scname.match(/(200|blank)\.[^.]+$/i)){
                    mock2Reject = "-200";
                    
                }else if (scname.match(/(img|tinygif)\.[^.]+$/i)){
                    mock2Reject = "-img";
                };
                
                if (isLooniOS || isShadowrocket){
                    
				body[y - 1]?.match(/^#/) && URLRewrite.push(body[y - 1]);
                
				URLRewrite.push(
						`${noteK}${ptn} - reject${mock2Reject}`)
                }else if (isStashiOS){
                    
                body[y - 1]?.match(/^#/) && URLRewrite.push("    " + body[y - 1]);
                
                URLRewrite.push(
						`${noteK4}- >-${noteKn6}${ptn} - reject${mock2Reject}`);}else{
                
				body[y - 1]?.match(/^#/) &&  URLRewrite.push(body[y - 1]);
                URLRewrite.push(x);};
				
				}else{
                    
                if (isLooniOS || isShadowrocket){   
                body[y - 1]?.match(/^#/) && script.push(body[y - 1]);
                
                script.push(
			`${noteK}http-request ${ptn} script-path=${js}, timeout=60 ,tag=${scname}_${y}`)
                        
                }else if (isStashiOS){
                    
                body[y - 1]?.match(/^#/) && script.push("    " + body[y - 1]);
		
		script.push(
			`${noteK4}- match: ${ptn}${noteKn6}name: "${scname}_${y}"${noteKn6}type: request${noteKn6}timeout: 60${noteKn6}binary-mode: true`)
				
				providers.push(
							`${noteK2}"${scname}_${y}":${noteKn4}url: ${js}${noteKn4}interval: 86400`);    
                };
		};
				break;
				
//hostname				
			case "hostname":
            
            if (isLooniOS){
                MITM = x.replace(/%.*%/g," ").replace(/\x20/g,"").replace(/,{2,}/g,",").replace(/,*\x20*$/,"").replace(/hostname=(.*)/, `[MITM]\n\nhostname = $1`).replace(/=\x20,+/,"= ");
            }else if (isStashiOS){
                MITM = x.replace(/%.*%/g,"").replace(/\x20/g,"").replace(/,{2,}/g,",").replace(/,*\x20*$/,"").replace(/hostname=(.*)/, `t&2;mitm:\nt&hn;"$1"`).replace(/",+/,'"');
            }else if (isSurgeiOS || isShadowrocket){
                MITM = x.replace(/%.*%/g,"").replace(/\x20/g,"").replace(/,{2,}/g,",").replace(/,*\x20*$/,"").replace(/hostname=(.*)/, `[MITM]\n\nhostname = %APPEND% $1`).replace(/%\x20,+/,"% ");};
				break;

//general          

            case "force-http-engine-hosts":
            
            if (isLooniOS){
                General.push(x.replace(/%.*%/g,"").replace(/ *= */," = "));
            }else if (isStashiOS){
                General.push(x.replace(/%.*%/g,"").replace(/\x20/g,"").replace(/,{2,}/g,",").replace(/,*\x20*$/,"").replace(/force-http-engine-hosts=(.*)/, `t&2;force-http-engine:\nt&hn;"$1"`).replace(/",+/,'"'))
            }else if (isSurgeiOS || isShadowrocket){General.push(x);};
				break;
                                
            case "skip-proxy":
            
            if (isLooniOS){
                General.push(x.replace(/%.*%/g,"").replace(/ *= */," = "));
            }else if (isStashiOS){}else if (isSurgeiOS || isShadowrocket){General.push(x);};
				break;
           
            case "always-real-ip":
            
            if (isLooniOS){
                General.push(x.replace(/%.*%/g,"").replace(/ *= */," = "));
            }else if (isStashiOS){
                General.push(x.replace(/%.*%/g,"").replace(/\x20/g,"").replace(/,{2,}/g,",").replace(/,*\x20*$/,"").replace(/always-real-ip=(.*)/, `t&2;fake-ip-filter:\nt&hn;"$1"`).replace(/",+/,'"'))
            }else if (isSurgeiOS || isShadowrocket){General.push(x);};
				break;

			default:
//重定向
				if (type.match(/ (302|307|header)/)){
                    if (isLooniOS){
                        body[y - 1]?.match(/^#/)  && URLRewrite.push(body[y - 1]);
				
					URLRewrite.push(
						x.replace(/\x20{2,}/g," ").replace(/(^#)?([^\s]+)\x20([^\s]+)\x20(302|307|header)/, `${noteK}$2 $3 $4`));
                    }else if (isStashiOS){
                        
                      body[y - 1]?.match(/^#/)  && URLRewrite.push("    " + body[y - 1]);
				
					URLRewrite.push(x.replace(/\x20{2,}/g," ").replace(/(^#)?(.+?)\x20(.+?)\x20(302|307|header)/, `${noteK4}- >-${noteKn6}$2 $3 $4`));  
                    }else if (isSurgeiOS || isShadowrocket){
                
				body[y - 1]?.match(/^#/) &&  URLRewrite.push(body[y - 1]);
                URLRewrite.push(x);};
                
//重定向处理完毕 开始处理Loon Stash不支持的rule	
				}else if ((isLooniOS || isStashiOS) && x.match(/^#?(AND|NOT|OR|RULE-SET|DOMAIN-SET|SCRIPT) *,/)){
                    
                }else if (isLooniOS && x.match(/^#?DE?ST-PORT/)){
                    
                }else if (isStashiOS && x.match(/^#?USER-AGENT *,/)){
                    
                }else if (isStashiOS && x.match(/^#?URL-REGEX *,/)){
//开始处理stash URL-REGEX转reject                    
                    if (x.match(/, *REJECT([^,\s]*)$/)){
                
                    body[y - 1]?.match(/^#/) && URLRewrite.push("    " + body[y - 1]);
                x = x.replace(/\x20/,"");
                
                if (x.match(/DICT$/i)){
                    Urx2Reject = '-dict';
                }else if (x.match(/ARRAY$/i)){
                    Urx2Reject = '-array';
                }else if (x.match(/DROP$/i)){
                    Urx2Reject = '-200';
                }else if (x.match(/IMG$|TINYGIF$/i)){
                    Urx2Reject = '-img';
                }else if (x.match(/REJECT$/i)){
                    Urx2Reject = '';
                };
				
				URLRewrite.push(
					x.replace(/.*URL-REGEX,([^\s]+),[^,]+/,
					`${noteK4}- >-${noteKn6}$1 - reject${Urx2Reject}`)
				);
//转reject结束          
            }else{others.push(x)};//Stash URL-REGEX处理完毕         
                }else if (isSurgeiOS || isShadowrocket || isLooniOS){
                    x = x.replace(/" "/g,"");
				body[y - 1]?.match(/^#/) &&  rules.push(body[y - 1]);
                if (isLooniOS){
                    rules.push(x.replace(/,REJECT-NO-DROP$/,",REJECT-DROP").replace(/,REJECT-(200|TINYGIF)/,",REJECT-IMG"));
                    
                }else if(isShadowrocket){
                    rules.push(x.replace(/^#?DEST-PORT *,/,`${noteK}DST-PORT,`));}else if (isSurgeiOS){rules.push(x.replace(/-(?:200|DICT|ARRAY|VIDEO|IMG)$/i,"-TINYGIF"));}//Loon Surge 火箭 rule处理完毕
                
                }else if (isStashiOS){
                    x = x.replace(/" "/g,"");
                    body[y - 1]?.match(/^#/) && rules.push("    " + body[y - 1]);
                 rules.push(
                    x.replace(/^#?(.+),(DIRECT$|REJECT)[^,]*$/,`${noteK2}- $1,$2`).replace(/- DEST-PORT/,"- DST-PORT"));   
                };//整个rule结束
//开启脚本转换
function toJsc (js) {
	if (jscStatus == true || jsc2Status == true){
				jsname = js.substring(js.lastIndexOf('/') + 1, js.lastIndexOf('.') );
                		
				return js = jsPre + js + jsSuf.replace(/_yuliu_/,jsname);
		
	}else{return js}
};						             
		} //switch结束
	}
	
}; //循环结束

if (isLooniOS){
    
    pluginDesc = (pluginDesc[0] || '') && `${pluginDesc.join("\n")}`;
    
    if (pluginDesc != "" && pluginDesc.search(/#! *name *=/) != -1){
        //没有图标的插入图标
        if (pluginDesc.search(/#! *icon *= *.*/) == -1){
        pluginDesc = pluginDesc + "\n" + pluginIcon;
            
        };
		
        //Pokemon修改author和homepage为图鉴
        if (iconLibrary2 == "Pokemon" && pluginDesc.search(/^#! *icon *= *.+Pokemon-[0-9]+\.png$/mi) != -1){
        pluginDesc = pluginDesc.replace(/^#!(?:author|homepage) *= *.*/gmi,'') + "\n" + pluginPokemonAuthor + "\n" + pluginPokemonHomepage;
        };
		
    }else{
        if (iconLibrary2 == "Pokemon"){
            pluginDesc = npluginDesc + "\n" + pluginIcon + "\n" + pluginPokemonAuthor + "\n" + pluginPokemonHomepage;
        }else{
                    pluginDesc = npluginDesc + "\n" + pluginIcon;
        };
    };
	
    General = (General[0] || '') && `[General]\n\n${General.join("\n\n")}`;
    
    script = (script[0] || '') && `[Script]\n\n${script.join("\n\n")}`;

URLRewrite = (URLRewrite[0] || '') && `[Rewrite]\n\n${URLRewrite.join("\n")}`;

URLRewrite = URLRewrite.replace(/"/gi,'')

rules = (rules[0] || '') && `[Rule]\n\n${rules.join("\n")}`;

others = (others[0] || '') && `${others.join("\n")}`;

body = `${pluginDesc}


${General}


${rules}


${URLRewrite}


${script}


${MITM}`
		.replace(/t&zd;/g,',')
		.replace(/(#.+\n)\n+(?!\[)/g,'$1')
		.replace(/\n{2,}/g,'\n\n')
}else if (isStashiOS){
    
    pluginDesc = (pluginDesc[0] || '') && `${pluginDesc.join("\n")}`;
    
    if (pluginDesc !="" && pluginDesc.search(/name: /) != -1){
        pluginDesc = pluginDesc;
    }else{
        pluginDesc = npluginDesc;
    };
    
    General = (General[0] || '') && `${General.join("\n")}`;
    
    rules = (rules[0] || '') && `rules:\n${rules.join("\n")}`;

tiles = (tiles[0] || '') && `tiles:\n${tiles.join("\n\n")}`;

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
	script.push(`${noteKn4}- match: ` + scriptBox[i].matchptn + `${noteKn6}name: "` + scriptBox[i].name + `"${noteKn6}type: ` + scriptBox[i].type + `${noteKn6}timeout: 30` + `${noteKn6}require-body: ` + scriptBox[i].requirebody + `${noteKn6}max-size: ` + scriptBox[i].maxsize + `${noteKn6}binary-mode: ` + scriptBox[i].binarymode + `${noteKn6}` + scriptBox[i].argument);
	
	providers.push(`${noteK2}"` + scriptBox[i].name + '":' + `${noteKn4}url: ` + scriptBox[i].jsurl + `${noteKn4}interval: 86400`);
	}else{
		cron.push(`${noteKn4}- name: "` + scriptBox[i].name + `"${noteKn6}cron: "` + scriptBox[i].cron + `"${noteKn6}timeout: 60` + `${noteKn6}` + scriptBox[i].argument);
		
		providers.push(`${noteK2}"` + scriptBox[i].name + '":' + `${noteKn4}url: ` + scriptBox[i].jsurl + `${noteKn4}interval: 86400`);
	}

};

providers = [...new Set(providers)];

script = (script[0] || '') && `  script:\n${script.join("\n\n")}`;

providers = (providers[0] || '') && `script-providers:\n${providers.join("\n")}`;

cron = (cron[0] || '') && `cron:\n  script:\n${cron.join("\n")}`;

URLRewrite = (URLRewrite[0] || '') && `  rewrite:\n${URLRewrite.join("\n")}`;

URLRewrite = URLRewrite.replace(/"/gi,'')

HeaderRewrite = (HeaderRewrite[0] || '') && `  header-rewrite:\n${HeaderRewrite.join("\n")}`;

HeaderRewrite = HeaderRewrite.replace(/"/gi,'')

others = (others[0] || '') && `${others.join("\n")}`;

General = General.replace(/t&2;/g,'  ')
           .replace(/t&hn;/g,'    - ')
           .replace(/\,/g,'"\n    - "')

MITM = MITM.replace(/t&2;/g,'  ')
           .replace(/t&hn;/g,'    - ')
           .replace(/\,/g,'"\n    - "')

    if (URLRewrite != "" || script != "" || HeaderRewrite != "" || MITM != "" || General != ""){
httpFrame = `http:
${General}

${HeaderRewrite}

${URLRewrite}

${script}

${MITM}`
};

body = `${pluginDesc}


${rules}

${httpFrame}

${tiles}

${cron}

${providers}`
		.replace(/t&zd;/g,',')
		.replace(/script-providers:\n+$/g,'')
		.replace(/#      \n/gi,'\n')
		.replace(/      \n/g,"")
		.replace(/(#.+\n)\n+(?!\[)/g,'$1')
		.replace(/\n{2,}/g,'\n\n')
}else if (isSurgeiOS || isShadowrocket){
    pluginDesc = (pluginDesc[0] || '') && `${pluginDesc.join("\n")}`;
    
    if (pluginDesc !="" && pluginDesc.search(/#! *name *=/) != -1){
        pluginDesc = pluginDesc;
    }else{
        pluginDesc = npluginDesc;
    };
    General = (General[0] || '') && `[General]\n\n${General.join("\n\n")}`;
    
    Panel = (Panel[0] || '') && `[Panel]\n\n${Panel.join("\n\n")}`;
    
    rules = (rules[0] || '') && `[Rule]\n\n${rules.join("\n")}`;
    
	script = (script[0] || '') && `[Script]\n\n${script.join("\n\n")}`;
	
	HeaderRewrite = (HeaderRewrite[0] || '') && `[Header Rewrite]\n\n${HeaderRewrite.join("\n")}`;
	
	URLRewrite = (URLRewrite[0] || '') && `[URL Rewrite]\n\n${URLRewrite.join("\n")}`;
	
	MapLocal = (MapLocal[0] || '') && `[Map Local]\n\n${MapLocal.join("\n\n")}`;
	
	others = (others[0] || '') && `${others.join("\n\n")}`;

body = `${pluginDesc}


${General}


${Panel}


${rules}


${HeaderRewrite}


${URLRewrite}


${script}


${MapLocal}


${MITM}`
		.replace(/(#.+\n)\n+(?!\[)/g,'$1')
		.replace(/\n{2,}/g,'\n\n')
}

eval(evJsmodi);
eval(evUrlmodi);

others !="" && $.msg("不支持的类型已跳过",others,"点击查看原文，长按可展开查看剩余不支持内容",req)

 $.done({ response: { status: 200 ,body:body ,headers: {'Content-Type': 'text/plain; charset=utf-8'} } });


})()
.catch((e) => {
		$.msg(`Script Hub: Surge转换`,`${notifyName}：${e}\n${url}`,'','https://t.me/zhetengsha_group');
		result = {
      response: {
        status: 500,
        body: `${notifyName}：${e}\n\n\n\n\n\nScript Hub Surge转换: ❌  可自行翻译错误信息或复制错误信息后点击通知进行反馈
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