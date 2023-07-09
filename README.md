# Script-Hub

Advanced Script Converter for QX, Loon, Surge, Stash, Egern, LanceX and ShadowRocket

重写 & 规则集转换

## 社群

👏🏻 欢迎加入社群进行交流讨论

👥 群组 [张佩服应该判几年](https://t.me/zhangpeifu) & [折腾啥(群组)](https://t.me/zhetengsha_group)

📢 频道 [那天我用石头砸了一下张佩服的头](https://t.me/h5683577) & [折腾啥(频道)](https://t.me/zhetengsha)

## 简介

支持将 QX 重写解析至 Surge Shadowrocket Loon Stash

支持将 Surge 模块解析至 Loon Stash

支持将 Loon 插件解析至 Surge Shadowrocket Stash

支持 QX & Surge & Loon & Shadowrocket & Clash 规则集解析，适用 app: Surge Shadowrocket Stash Loon (**注**：不支持 域名集 IP-CIDR 集)

<details>
<summary>安装</summary>

# Surge Egern LanceX 模块

[https://raw.githubusercontent.com/Script-Hub-Org/Script-Hub/main/modules/script-hub.surge.sgmodule](https://raw.githubusercontent.com/Script-Hub-Org/Script-Hub/main/modules/script-hub.surge.sgmodule)

# Shadowrocket 模块

[https://raw.githubusercontent.com/Script-Hub-Org/Script-Hub/main/modules/script-hub.surge.sgmodule](https://raw.githubusercontent.com/Script-Hub-Org/Script-Hub/main/modules/script-hub.surge.sgmodule)

# Stash 覆写

[https://raw.githubusercontent.com/Script-Hub-Org/Script-Hub/main/modules/script-hub.stash.stoverride](https://raw.githubusercontent.com/Script-Hub-Org/Script-Hub/main/modules/script-hub.stash.stoverride)

# Loon 插件

[https://raw.githubusercontent.com/Script-Hub-Org/Script-Hub/main/modules/script-hub.loon.plugin](https://raw.githubusercontent.com/Script-Hub-Org/Script-Hub/main/modules/script-hub.loon.plugin)

</details>

<details>
<summary>使用</summary>

# 打开网页

> 如果你已经完成了信任证书 开启 MitM 等常规操作

应该可以正常访问 [https://script.hub](https://script.hub)

> 如果你实在搞不定什么是信任证书 开启 MitM

访问 [http://script.hub](http://script.hub) 也可以, 不保证功能完整性

# 关于需要开启 binary-mode 的脚本说明:

因为 qx 重写中对此类脚本没有特殊标记，仅能靠脚本名判断，如 Maasea 佬的 YouTube 去广告脚本没有以 proto.js 结尾，故转换后不会正确识别并开启  
 surge 模块及 loon 插件里的此类脚本可以正确识别并开启

</details>

## 鸣谢

原脚本作者@小白脸  
脚本修改[_@chengkongyiban_](https://github.com/chengkongyiban)  
大量借鉴[_@KOP-XIAO_](https://github.com/KOP-XIAO)佬的[resource-parser.js](https://github.com/KOP-XIAO/QuantumultX/raw/master/Scripts/resource-parser.js)  
感谢[_@xream_](https://github.com/xream) 佬提供的 `本项目 Script Hub 网页前端`, [replace-header.js](https://github.com/xream/scripts/raw/main/surge/modules/replace-header/index.js)，[echo-response.js](https://github.com/xream/scripts/raw/main/surge/modules/echo-response/index.js)，[script-converter.js](https://raw.githubusercontent.com/xream/scripts/main/surge/modules/script-converter/script-converter.js)  
感谢[_@mieqq_](https://github.com/mieqq) 佬提供的[replace-body.js](https://github.com/mieqq/mieqq/raw/master/replace-body.js)  
插件图标用的 [_@Keikinn_](https://github.com/Keikinn) 佬的 [StickerOnScreen](https://github.com/KeiKinn/StickerOnScreen)项目，以及 [_@Toperlock_](https://github.com/Toperlock) 佬的 [QX 图标库](https://github.com/Toperlock/Quantumult/tree/main/icon)项目，感谢

## 开发

`pnpm preview` html 内容的本地预览
