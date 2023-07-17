/****************************
支持将Surge重写解析至Loon Stash Surge Shadowrocket
说明
原脚本作者@小白脸 脚本修改@chengkongyiban
感谢@xream 提供的echo-response.js
插件图标用的 @Keikinn 的 StickerOnScreen项目 以及 @Toperlock 的图标库项目，感谢
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
//console.log("修改原文参数" + evJsori);
//console.log("修改转换后参数" + evJsmodi);
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
var cachExp = queryObject.cachexp != undefined ? queryObject.cachexp : null;
var noCache = istrue(queryObject.nocache);

const iconStatus = getval("启用插件随机图标") ?? "启用";
const iconReplace = getval("替换原始插件图标");
const iconLibrary1 = getval("插件随机图标合集") ?? "Doraemon(100P)";
const iconLibrary2 = iconLibrary1.split("(")[0];
const iconFormat = iconLibrary2.search(/gif/i) == -1 ? ".png" : ".gif";

var pluginPokemonIcon
var pluginPokemonAuthor
var pluginPokemonHomepage
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
//判断是否断网
if(body == null || body == ""){
	notify(`Surge转换："${notifyName}"未获取到body`,"请检查网络及节点是否畅通\n" + "源链接为" + $request.url,"认为是bug?点击通知反馈","https://t.me/zhangpeifu")
	
 $done({ response: { status: 404 ,body:{} } });

}else{//以下开始重写及脚本转换

if (body.match(/\/\*+\n[\s\S]*\n\*+\/\n/)){
body = body.replace(/[\s\S]*(\/\*+\n[\s\S]*\n\*+\/\n)[\s\S]*/,"$1").match(/[^\r\n]+/g);
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

let scname = "";       //脚本名
let js = "";           //脚本链接
let arg = "";          //用户传入的argument
let originalArg = "";  //原始argument
let sctype = "";       //脚本类型
let ptn = "";          //正则
let rebody = "";       //是否需要body
let size = "";         //允许最大body大小
let proto = "";        //是否开启binary-body-mode
let hdtype = "";       //HeaderRewrite 类型
let cronExp = "";      //cron表达式
let croName = "";      //cron任务名
let cronJs = "";       //cron脚本链接
let rejectType = "";   //重写reject类型
let rejectPtn = "";    //重写reject正则
let file = "";         //Mock的文件链接
let fileName = "";     //文件名
let mock2Reject = "";  //Mock转reject类型
let tilesIcon = "";    //Stash磁贴图标
let tilesColor = "";   //Stash磁贴颜色
let Urx2Reject = "";   //URL-REGEX转reject
let scriptBox = [];    //存放脚本信息待下一步处理

for await (var [y, x] of body.entries()) {
	x = x.replace(/^ *(#|;|\/\/)/,'#').replace(/(^[^#].+)\x20+\/\/.+/,"$1").replace(/, *REJECT([^,\s]*)$/i,',REJECT$1').replace(/, *DIRECT$/i,',DIRECT').replace(/ reject/i,' reject').replace(/(hostname|force-http-engine-hosts|skip-proxy|always-real-ip)\x20*=/,'$1=').replace(/cronexpr?\x20*=\x20*/gi,'cronexp=').replace(/type *= *generic *,/i,"type=generic,").replace(/script-name *=/,"script-name=");
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
//Panel脚本            
            case "type=generic,":
                    
				scname = x.split(/ *=/)[0].replace(/^#/,'');
				
				js = x.replace(/\x20/g,"").split("script-path=")[1].split(",")[0];
                
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
				}else{};

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
                if (arg == ""){
					script.push(x);
				}else{
		script.push(x.replace(originalArg,"") + arg);};
                
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
				
				js = x.replace(/\x20/g,"").split("script-path=")[1].split(",")[0];

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
				}else{};

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
			
                if (arg == ""){
					script.push(x);
				}else{
		script.push(x.replace(originalArg,"") + arg);};
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
					
				js = x.replace(/\x20/gi,"").split("script-path=")[1].split(",")[0];
					
				sctype = x.match('http-response') ? 'response' : 'request';
					
				scname = js.substring(js.lastIndexOf('/') + 1, js.lastIndexOf('.') );

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
				}else{};

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
                if (arg == ""){
					script.push(x);
				}else{
		script.push(x.replace(originalArg,"") + arg);};
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
                cronExp = x.match(/cronexp=(.+?),[^,]+?=/)[1].replace(/"/g,'');
            }else{
                cronExp = x.split("cronexp=")[1].replace(/"/g,'');
            };
            
            if (isStashiOS){
				
				cronExp = cronExp.replace(/[^\s]+ ([^\s]+ [^\s]+ [^\s]+ [^\s]+ [^\s]+)/,'$1');
            };
            
            if (nCron != null){
	for (let i=0; i < nCron.length; i++) {
  const elem = nCron[i];
	if (x.indexOf(elem) != -1){
        cronExp = nCronExp[i];   
            };};};
            
				croName = x.split("=")[0].replace(/\x20/g,"").replace(/^#/,'')
				
				cronJs = x.replace(/\x20/gi,"").split("script-path=")[1].split(",")[0];
                
				if (isLooniOS){
				
				script.push(
						`${noteK}cron "${cronExp}" script-path=${cronJs}, timeout=60, tag=${croName}`);
                }else if (isStashiOS){
					let noteKstatus = noteKn4.match(/#/) ? 'true' : 'false';
					
scriptBox.push({"noteK":noteKstatus,"jsurl":cronJs,"name":croName + "_" + y,"cron":cronExp});	
                }else if(isSurgeiOS || isShadowrocket){

				body[y - 1]?.match(/^#/) &&  script.push(body[y - 1]);
				if (x.match(/cronexp=(.+?),[^,]+?=/)){
				script.push(
	x.replace(/(.+cronexp=).+?(,[^,]+?=.*)/,`$1"${cronExp}"$2`).replace(/"{2,}/g,'"'));}else{
		script.push(
			x.replace(/(.+cronexp=).*/,`$1"${cronExp}"`).replace(/"{2,}/g,'"')
				)}
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
				file = x.split(' data="')[1].split('"')[0];
				fileName = file.substring(file.lastIndexOf('/') + 1);
				scname = fileName.split(".")[0];
                if (isSurgeiOS){
                    
				body[y - 1]?.match(/^#/) &&  MapLocal.push(body[y - 1]);
                MapLocal.push(`${noteK}${ptn} data="${file}"`);
                }else if (fileName.match(/(img|dict|array|200|blank|tinygif)\.[^.]+$/i)){
                
                
                if (fileName.match(/dict\.[^.]+$/i)){
                    mock2Reject = "-dict";
                    
                }else if (fileName.match(/array\.[^.]+$/i)){
                    mock2Reject = "-array";
                    
                }else if (fileName.match(/(200|blank)\.[^.]+$/i)){
                    mock2Reject = "-200";
                    
                }else if (fileName.match(/(img|tinygif)\.[^.]+$/i)){
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
			`${noteK}http-request ${ptn} script-path=https://raw.githubusercontent.com/Script-Hub-Org/Script-Hub/main/scripts/echo-response.js, tag=${scname}_${y}, argument=type=text/json&url=${file}`)
                        
                }else if (isStashiOS){
                    
                body[y - 1]?.match(/^#/) && script.push("    " + body[y - 1]);
		
		script.push(
			`${noteK4}- match: ${ptn}${noteKn6}name: "echo-response"${noteKn6}type: request${noteKn6}timeout: 30${noteKn6}argument: |-${noteKn8}type=text/json&url=${file}`)
				
				providers.push(
							`${noteK2}"echo-response":${noteKn4}url: https://raw.githubusercontent.com/Script-Hub-Org/Script-Hub/main/scripts/echo-response.js${noteKn4}interval: 86400`);    
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
                    rules.push(x.replace(/^#?DEST-PORT *,/,`${noteK}DST-PORT,`));}else{rules.push(x);}//Loon Surge 火箭 rule处理完毕
                
                }else if (isStashiOS){
                    x = x.replace(/" "/g,"");
                    body[y - 1]?.match(/^#/) && rules.push("    " + body[y - 1]);
                 rules.push(
                    x.replace(/^#?(.+),(DIRECT$|REJECT)[^,]*$/,`${noteK2}- $1,$2`).replace(/- DEST-PORT/,"- DST-PORT"));   
                };//整个rule结束
                
		} //switch结束
	}
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
		cron.push(`${noteKn4}- name: "` + scriptBox[i].name + `"${noteKn6}cron: "` + scriptBox[i].cron + `"${noteKn6}timeout: 60`);
		
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

others !="" && notify("不支持的类型已跳过",others,"点击查看原文，长按可展开查看剩余不支持内容",req)

 $done({ response: { status: 200 ,body:body ,headers: {'Content-Type': 'text/plain; charset=utf-8'} } });
}//判断是否断网的反括号


})()
.catch((e) => {
		notify(`Script Hub: Surge转换`,`${e}`,'','https://t.me/zhetengsha_group');
		result = {
      response: {
        status: 500,
        body: `${e}\n\n\n\n\n\nScript Hub Surge转换: ❌  可自行翻译错误信息或复制错误信息后点击通知进行反馈
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
