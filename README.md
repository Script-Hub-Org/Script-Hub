<div align="center">
<br>
<img width="200" src="https://raw.githubusercontent.com/Script-Hub-Org/Script-Hub/main/assets/icon-dark.png" alt="Script Hub">
<br>
<br>
<h1 align="center">Script Hub<h1>
</div>

<p align="center" color="#6a737d">
Advanced Script Converter for QX, Loon, Surge, Stash, Egern, LanceX and Shadowrocket
</p>
<p align="center" color="#6a737d">
重写 & 规则集转换
</p>

## 社群

👏🏻 欢迎加入社群进行交流讨论

👥 群组 [张佩服(群组)](https://t.me/zhangpeifu) & [折腾啥(群组)](https://t.me/zhetengsha_group)

📢 频道 [张佩服(频道)](https://t.me/h5683577) & [折腾啥(频道)](https://t.me/zhetengsha)

## 简介

• 支持将 QX 重写解析至 Surge Shadowrocket Loon Stash

• 支持将 Surge 模块解析至 Loon Stash

• 支持将 Loon 插件解析至 Surge Shadowrocket Stash

• Beta 支持将 Loon 3.5.1+ Script v2 转换为 Surge/Egern、Shadowrocket、Stash 或 Loon 插件

• 支持 QX & Surge & Loon & Shadowrocket & Clash 规则集解析，适用 app: Surge Shadowrocket Stash Loon

• 支持 将 QX 脚本转换成 Surge 脚本(兼容)

• 可以修改参数 argument

• 支持一键导入 Shadowrocket / Loon / Stash

• 高级功能 OR 修改任意文本

• 如果某些模块需要 `加参数才能使用` 但只想用远程链接，不想拉取到本地模块的情况 可以直接使用 `纯文本` -> `高级操作`、`修改参数` 功能修改远程链接 `任意内容` 或者 `argument` 参数, 不用再复制到本地模块

• [🆕 不需要代理 app 的全服务器部署版(测试中)](<https://github.com/Script-Hub-Org/Script-Hub/wiki/%E5%85%A8%E6%9C%8D%E5%8A%A1%E5%99%A8%E7%89%88(%E6%B5%8B%E8%AF%95%E4%B8%AD)>)

• 相关生态: [Surge 模块工具](https://github.com/Script-Hub-Org/Script-Hub/wiki/%E7%9B%B8%E5%85%B3%E7%94%9F%E6%80%81:-Surge-%E6%A8%A1%E5%9D%97%E5%B7%A5%E5%85%B7) 支持一键导入 Surge， 需要下载「Scriptable」app. 如果想把其他非 Script Hub 转换的 模块放在本地, 也可单独用此脚本

## 文档

[安装体验请查看文档](https://github.com/Script-Hub-Org/Script-Hub/wiki)

## Loon Script v2 跨端转换（Beta）

Loon Script v2 的 `request`、`response`、`cron`、`network-changed`、`generic` 触发器可以通过 Beta 解析器转换为 Surge/Egern、Shadowrocket 和 Stash 格式；目标仍为 Loon 时保留原生 v2 语法。

转换器会保留 `timeout`、`enable`、`requires_body`、`binary_body_mode`、脚本参数等可映射字段。`binary_body_mode` 不会被误认为 `requires_body`；需要完整响应体的脚本应在源脚本中显式设置 `requires_body=true`。原脚本中的 WASM、加密逻辑和脚本内容不会被解密或改写，只转换宿主配置。

针对 Loon 原生 Rewrite Action，Surge/Shadowrocket 目标还支持 `reject*`、`response.json.*`、`*.body.*`、`*.header.*`、`redirect` 和 `url.replace`；其中 JSON 操作会映射到 Body Rewrite 的 jq，`jq_file` 会由转换器服务端读取并内联。无法等价表达的组合条件或参数会保留诊断，不会静默丢失。

不同软件无法等价表示的 Loon 条件（例如方法、响应状态码、Header 的组合条件）、`debug` 等内容会进入转换提示，不会静默丢弃。`network-changed` 会映射为 Surge/Shadowrocket 的 `event-name=network-changed`，Stash 则保留诊断提示。`img_url` 在 Loon 保留，Stash Generic 映射为 Tile 的 `icon`，其他目标提示无法等价表示。Shadowrocket 不支持 Generic/Tile Script；Stash 对动态 `enable` 会安全转换为注释。Loon 原生 v2 与旧式 Script 混排时保持源顺序。

Beta 模块使用 `feat/loon-v2-cross-platform` 分支的解析器，回归测试：

```bash
npm run test:loon-v2
```

参考：[Loon Script v2 文档](https://nsloon.app/docs/Script/script_v2/)

## 鸣谢

Powered by [_@Chavy‘s_](https://github.com/chavyleung) [Env.js](https://github.com/chavyleung/scripts)  
原脚本作者 @小白脸  
脚本修改[_@chengkongyiban_](https://github.com/chengkongyiban)  
大量借鉴[_@KOP-XIAO_](https://github.com/KOP-XIAO)佬的[resource-parser.js](https://github.com/KOP-XIAO/QuantumultX/raw/master/Scripts/resource-parser.js)  
感谢[_@xream_](https://github.com/xream) 佬提供与 [_@keywos_](https://github.com/keywos) 修改 `本项目 Script Hub 网页前端`, [replace-header.js](https://raw.githubusercontent.com/Script-Hub-Org/Script-Hub/main/scripts/replace-header.js)，[echo-response.js](https://raw.githubusercontent.com/Script-Hub-Org/Script-Hub/main/scripts/echo-response.js)，[script-converter.js](https://raw.githubusercontent.com/Script-Hub-Org/Script-Hub/main/script-converter.js)  
感谢[_@mieqq_](https://github.com/mieqq) 佬提供的[replace-body.js](https://github.com/mieqq/mieqq/raw/master/replace-body.js), 本项目中已进行修改  
感谢[_@Maasea_](https://github.com/Maasea) 佬的指导  
项目 logo 感谢 [_@Toperlock_](https://github.com/Toperlock)  
插件图标用的 [_@Keikinn_](https://github.com/Keikinn) 佬的 [StickerOnScreen](https://github.com/KeiKinn/StickerOnScreen)项目，以及 [_@Toperlock_](https://github.com/Toperlock) 佬的 [QX 图标库](https://github.com/Toperlock/Quantumult/tree/main/icon)项目，感谢

## 开发

`pnpm preview` html 内容的本地预览

## 赞助

支持我们的工作

[Patreon](https://www.patreon.com/scripthuborg)
