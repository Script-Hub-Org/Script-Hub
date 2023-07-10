const NAME = `script-hub`

const $ = new Env(NAME)

const html = `
<!DOCTYPE html>
<html lang="zh-CN">

  <head>
    <meta charset="UTF-8" />
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <link rel="icon" type="image/png" href="https://raw.githubusercontent.com/Script-Hub-Org/Script-Hub/main/assets/icon.png" />
    <link rel="apple-touch-icon" href="https://raw.githubusercontent.com/Script-Hub-Org/Script-Hub/main/assets/icon-dark.png">
    
    <!--  <link rel="stylesheet" href="https://unpkg.com/simpledotcss/simple.min.css">-->
    
    <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1" />
    <title>Script Hub</title>
    <style>
    /* Global variables. */
:root {
  /* Set sans-serif & mono fonts */
  --sans-font: -apple-system, BlinkMacSystemFont, "Avenir Next", Avenir,
    "Nimbus Sans L", Roboto, "Noto Sans", "Segoe UI", Arial, Helvetica,
    "Helvetica Neue", sans-serif;
  --mono-font: Consolas, Menlo, Monaco, "Andale Mono", "Ubuntu Mono", monospace;
  --standard-border-radius: 5px;

  /* Default (light) theme */
  --bg: #eef1f5;
  --accent-bg: #d8e3f17a;
  --text: #484848;
  --text-light: #585858;
  --border: #dadce7;
  --accent: #5c88c9;
  --code: #af5050;
  --preformatted: #272727;
  --marked: #ffdd33;
  --disabled: #efefef;
}

/* Dark theme */
@media (prefers-color-scheme: dark) {
  ::backdrop,
  :root {
    color-scheme: dark;
    --bg: #1a1a1f;
    --accent-bg: #333339;
    --text: #d3cdcd;
    --text-light: #ababab;
    --accent: #9093ce;
    --code: #ba8a6d;
    --preformatted: #ccc;
    --disabled: #111;
    --border: #54566692;
  }
  /* Add a bit of transparency so light media isn't so glaring in dark mode */
  img,
  video {
    opacity: 0.8;
  }
}

/* Reset box-sizing */
*, *::before, *::after {
  box-sizing: border-box;
  text-decoration: none;
}

/* Reset default appearance */
textarea,
select,
input,
progress {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
}

html {
  /* Set the font globally */
  font-family: var(--sans-font);
  scroll-behavior: smooth;
}

/* Make the body a nice central block */
body {
  color: var(--text);
  background-color: var(--bg);
  font-size: 1.15rem;
  line-height: 1.5;
  display: grid;
  grid-template-columns: 1fr min(45rem, 90%) 1fr;
  margin: 0;
}
body > * {
  grid-column: 2;
}

/* Make the header bg full width, but the content inline with body */
body > header {
  background-color: var(--accent-bg);
  border-bottom: 1px solid var(--border);
  text-align: center;
  padding: 0 0.5rem 2rem 0.5rem;
  grid-column: 1 / -1;
}

body > header h1 {
  max-width: 1200px;
  margin: 1rem auto;
}

body > header p {
  max-width: 40rem;
  margin: 1rem auto;
}

/* Add a little padding to ensure spacing is correct between content and header > nav */
main {
  padding-top: 1.5rem;
}

body > footer {
  margin-top: 4rem;
  padding: 2rem 1rem 1.5rem 1rem;
  color: var(--text-light);
  font-size: 0.9rem;
  text-align: center;
  border-top: 1px solid var(--border);
}

/* Format headers */
h1 {
  font-size: 3rem;
}

h2 {
  font-size: 2.6rem;
  margin-top: 3rem;
}

h3 {
  font-size: 2rem;
  margin-top: 3rem;
}

h4 {
  font-size: 1.44rem;
}

h5 {
  font-size: 1.15rem;
}

h6 {
  font-size: 0.96rem;
}

/* Prevent long strings from overflowing container */
p, h1, h2, h3, h4, h5, h6 {
  overflow-wrap: break-word;
}

/* Fix line height when title wraps */
h1,
h2,
h3 {
  line-height: 1.1;
}

/* Reduce header size on mobile */
@media only screen and (max-width: 720px) {
  h1 {
    font-size: 2.5rem;
  }

  h2 {
    font-size: 2.1rem;
  }

  h3 {
    font-size: 1.75rem;
  }

  h4 {
    font-size: 1.25rem;
  }
}

/* Format links & buttons */
a,
a:visited {
  color: var(--accent);
}

a:hover {
  text-decoration: none;
}

button,
[role="button"],
input[type="submit"],
input[type="reset"],
input[type="button"],
label[type="button"] {
  border: none;
  border-radius: var(--standard-border-radius);
  background-color: var(--accent);
  font-size: 1rem;
  color: var(--bg);
  padding: 0.7rem 0.9rem;
  margin: 0.5rem 0;

  /* Ensure buttons use correct font */
  font-family: inherit;
}

button[disabled],
[role="button"][aria-disabled="true"],
input[type="submit"][disabled],
input[type="reset"][disabled],
input[type="button"][disabled],
input[type="checkbox"][disabled],
input[type="radio"][disabled],
select[disabled] {
  cursor: not-allowed;
}

input:disabled,
textarea:disabled,
select:disabled,
button[disabled] {
  cursor: not-allowed;
  background-color: var(--disabled);
  color: var(--text-light)
}

input[type="range"] {
  padding: 0;
}

/* Set the cursor to '?' on an abbreviation and style the abbreviation to show that there is more information underneath */
abbr[title] {
  cursor: help;
  text-decoration-line: underline;
  text-decoration-style: dotted;
}

button:enabled:hover,
[role="button"]:not([aria-disabled="true"]):hover,
input[type="submit"]:enabled:hover,
input[type="reset"]:enabled:hover,
input[type="button"]:enabled:hover,
label[type="button"]:hover {
  filter: brightness(1.4);
  cursor: pointer;
}

button:focus-visible:where(:enabled, [role="button"]:not([aria-disabled="true"])),
input:enabled:focus-visible:where(
  [type="submit"],
  [type="reset"],
  [type="button"]
) {
  outline: 2px solid var(--accent);
  outline-offset: 1px;
}

/* Format navigation */
header > nav {
  font-size: 1rem;
  line-height: 2;
  padding: 1rem 0 0 0;
}

/* Use flexbox to allow items to wrap, as needed */
header > nav ul,
header > nav ol {
  align-content: space-around;
  align-items: center;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  list-style-type: none;
  margin: 0;
  padding: 0;
}

/* List items are inline elements, make them behave more like blocks */
header > nav ul li,
header > nav ol li {
  display: inline-block;
}

header > nav a,
header > nav a:visited {
  margin: 0 0.5rem 1rem 0.5rem;
  border: 1px solid var(--border);
  border-radius: var(--standard-border-radius);
  color: var(--text);
  display: inline-block;
  padding: 0.1rem 1rem;
  text-decoration: none;
}

header > nav a:hover,
header > nav a.current {
  border-color: var(--accent);
  color: var(--accent);
  cursor: pointer;
}

/* Reduce nav side on mobile */
@media only screen and (max-width: 720px) {
  header > nav a {
    border: none;
    padding: 0;
    text-decoration: underline;
    line-height: 1;
  }
}

/* Consolidate box styling */
aside, details, pre, progress {
  background-color: var(--accent-bg);
  border: 1px solid var(--border);
  border-radius: var(--standard-border-radius);
  margin-bottom: 1rem;
}

aside {
  font-size: 1rem;
  width: 30%;
  padding: 0 15px;
  margin-inline-start: 15px;
  float: right;
}
*[dir="rtl"] aside {
  float: left;
}

/* Make aside full-width on mobile */
@media only screen and (max-width: 720px) {
  aside {
    width: 100%;
    float: none;
    margin-inline-start: 0;
  }
}

article, fieldset, dialog {
  border: 1px solid var(--border);
  padding: 1rem;
  border-radius: var(--standard-border-radius);
  margin-bottom: 1rem;
}

article h2:first-child,
section h2:first-child {
  margin-top: 1rem;
}

section {
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  padding: 2rem 1rem;
  margin: 3rem 0;
}

/* Don't double separators when chaining sections */
section + section,
section:first-child {
  border-top: 0;
  padding-top: 0;
}

section:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

details {
  padding: 0.7rem 1rem;
}

summary {
  cursor: pointer;
  font-weight: bold;
  padding: 0.7rem 1rem;
  margin: -0.7rem -1rem;
  word-break: break-all;
}

details[open] > summary + * {
  margin-top: 0;
}

details[open] > summary {
  margin-bottom: 0.5rem;
}

details[open] > :last-child {
  margin-bottom: 0;
}

/* Format tables */
table {
  border-collapse: collapse;
  margin: 1.5rem 0;
}

td,
th {
  border: 1px solid var(--border);
  text-align: start;
  padding: 0.5rem;
}

th {
  background-color: var(--accent-bg);
  font-weight: bold;
}

tr:nth-child(even) {
  /* Set every other cell slightly darker. Improves readability. */
  background-color: var(--accent-bg);
}

table caption {
  font-weight: bold;
  margin-bottom: 0.5rem;
}

/* Format forms */
textarea,
select,
input {
  font-size: inherit;
  font-family: inherit;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  color: var(--text);
  background-color: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--standard-border-radius);
  box-shadow: none;
  max-width: 100%;
  display: inline-block;
}
label {
  display: block;
}
textarea:not([cols]) {
  width: 100%;
}

/* Add arrow to drop-down */
select:not([multiple]) {
  background-image: linear-gradient(45deg, transparent 49%, var(--text) 51%),
    linear-gradient(135deg, var(--text) 51%, transparent 49%);
  background-position: calc(100% - 15px), calc(100% - 10px);
  background-size: 5px 5px, 5px 5px;
  background-repeat: no-repeat;
  padding-inline-end: 25px;
}
*[dir="rtl"] select:not([multiple]) {
  background-position: 10px, 15px;
}

/* checkbox and radio button style */
input[type="checkbox"],
/* input[type="radio"] {
  vertical-align: middle;
  position: relative;
  width: min-content;
} */

input[type="checkbox"] + label,
/* input[type="radio"] + label {
  display: inline-block;
} */

/* input[type="radio"] {
  border-radius: 100%;
} */

input[type="checkbox"]:checked,
/* input[type="radio"]:checked {
  background-color: var(--accent);
} */
input[type="radio"] {
      display: none;
    }
label.radio-label {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 11px;
      background-color: var(--bg--accent);
      color: var(--accent);
      cursor: pointer;
      /* border: 10px solid transparent; */
    }

input[type="radio"]:checked+label.radio-label {
    background-color: var(--accent);
    color: var(--bg);
    /* border-color: var(--accent); */
}

input[type="checkbox"]:checked::after {
  /* Creates a rectangle with colored right and bottom borders which is rotated to look like a check mark */
  content: " ";
  width: 0.18em;
  height: 0.32em;
  border-radius: 0;
  position: absolute;
  top: 0.05em;
  left: 0.17em;
  background-color: transparent;
  border-right: solid var(--bg) 0.08em;
  border-bottom: solid var(--bg) 0.08em;
  font-size: 1.8em;
  transform: rotate(45deg);
}
input[type="radio"]:checked::after {
  /* creates a colored circle for the checked radio button  */
  content: " ";
  width: 0.25em;
  height: 0.25em;
  border-radius: 100%;
  position: absolute;
  top: 0.125em;
  background-color: var(--bg);
  left: 0.125em;
  font-size: 32px;
}

/* Makes input fields wider on smaller screens */
@media only screen and (max-width: 720px) {
  textarea,
  select,
  input {
    width: 100%;
  }
}

/* Set a height for color input */
input[type="color"] {
  height: 2.5rem;
  padding:  0.2rem;
}

/* do not show border around file selector button */
input[type="file"] {
  border: 0;
}

/* Misc body elements */
hr {
  border: none;
  height: 1px;
  background: var(--border);
  margin: 1rem auto;
}

mark {
  padding: 2px 5px;
  border-radius: var(--standard-border-radius);
  background-color: var(--marked);
  color: black;
}

img,
video {
  max-width: 100%;
  height: auto;
  border-radius: var(--standard-border-radius);
}

figure {
  margin: 0;
  display: block;
  overflow-x: auto;
}

figcaption {
  text-align: center;
  font-size: 0.9rem;
  color: var(--text-light);
  margin-bottom: 1rem;
}

blockquote {
  margin-inline-start: 2rem;
  margin-inline-end: 0;
  margin-block: 2rem;
  padding: 0.4rem 0.8rem;
  border-inline-start: 0.35rem solid var(--accent);
  color: var(--text-light);
  font-style: italic;
}

cite {
  font-size: 0.9rem;
  color: var(--text-light);
  font-style: normal;
}

dt {
    color: var(--text-light);
}

/* Use mono font for code elements */
code,
pre,
pre span,
kbd,
samp {
  font-family: var(--mono-font);
  color: var(--code);
}

kbd {
  color: var(--preformatted);
  border: 1px solid var(--preformatted);
  border-bottom: 3px solid var(--preformatted);
  border-radius: var(--standard-border-radius);
  padding: 0.1rem 0.4rem;
}

pre {
  padding: 1rem 1.4rem;
  max-width: 100%;
  overflow: auto;
  color: var(--preformatted);
}

/* Fix embedded code within pre */
pre code {
  color: var(--preformatted);
  background: none;
  margin: 0;
  padding: 0;
}

/* Progress bars */
/* Declarations are repeated because you */
/* cannot combine vendor-specific selectors */
progress {
  width: 100%;
}

progress:indeterminate {
  background-color: var(--accent-bg);
}

progress::-webkit-progress-bar {
  border-radius: var(--standard-border-radius);
  background-color: var(--accent-bg);
}

progress::-webkit-progress-value {
  border-radius: var(--standard-border-radius);
  background-color: var(--accent);
}

progress::-moz-progress-bar {
  border-radius: var(--standard-border-radius);
  background-color: var(--accent);
  transition-property: width;
  transition-duration: 0.3s;
}

progress:indeterminate::-moz-progress-bar {
  background-color: var(--accent-bg);
}

dialog {
  max-width: 40rem;
  margin: auto;
}

dialog::backdrop {
  background-color: var(--bg);
  opacity: 0.8;
}

@media only screen and (max-width: 720px) {
  dialog {
    max-width: 100%;
    margin: auto 1em;
  }
}

/* Classes for buttons and notices */
.button,
.button:visited {
  display: inline-block;
  text-decoration: none;
  border: none;
  border-radius: 5px;
  background: var(--accent);
  font-size: 1rem;
  color: var(--bg);
  padding: 0.7rem 0.9rem;
  margin: 0.5rem 0;
}

.button:hover,
.button:focus {
  filter: brightness(1.4);
  cursor: pointer;
}

.notice {
  background: var(--accent-bg);
  border: 2px solid var(--border);
  border-radius: 5px;
  padding: 1.5rem;
  margin: 2rem 0;
}

.flex-container {
      display: flex;
}

.flex-container>div {
    margin-right: 12%;
    font-size: 0.95rem;
}

textarea {
      height: 6em;
}

.parent-container {
  display: flex;
  /* justify-content: center; */
  margin-left: 10px;
}


</style>
  </head>
  
  <body style="margin-bottom: 160px;">
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>


    <div id="app">

      <a href="https://github.com/Script-Hub-Org/Script-Hub"><h1 style="margin-bottom: 0;">Script Hub</h1></a>
      <p>重写 & 规则集转换</p>

      <div>
        <code>来源: </code>
        <textarea id="src" v-model="src" placeholder=""></textarea>
      </div>
      
    <div class="flex-container">
      <div>
        <code>&nbsp;来源类型: </code>
        <div v-for="item in types">
            <input type="radio" :id="'type-' + item.value" :value="item.value" v-model="type" />
            <label :for="'type-' + item.value" class="radio-label">{{item.label}}</label>
        </div>
      </div>

      <div>
        <code>&nbsp;目标类型: </code>
        <div v-for="item in targets">
            <input type="radio" :id="'target-' + item.value" :value="item.value" v-model="target" />
            <label :for="'target-' + item.value" class="radio-label">{{item.label}}</label>
        </div>
      </div>
    </div>
    <br>

    <!-- position: fixed; -->
    <div style="padding: 1rem;  bottom: 0rem; margin-right: 1rem; background-color: var(--bg); border: 1px solid var(--border); border-radius: var(--standard-border-radius);">
        <a v-if="result" :href="result" target="_blank" style="margin: 0 0.5rem 0 0">打开链接</a>
        <a v-if="result && target === 'shadowrocket-module' " :href=" 'https://api.boxjs.app/shadowrocket/install?module=' + encodeURIComponent(result) " target="_blank" style="margin: 0 0.5rem 0 0">一键导入(Shadowrocket)</a>
        <a v-if="result && target === 'loon-plugin' " :href=" 'https://www.nsloon.com/openloon/import?plugin=' + encodeURIComponent(result) " target="_blank" style="margin: 0 0.5rem 0 0">一键导入(Loon)</a>
        <textarea id="result" :value="result" placeholder="结果"></textarea>
        
        <button v-if="copyInfo">{{copyInfo}}</button>
        <div class="parent-container">
            <button v-else @click="copy">全选{{isHttps ? "&复制" : ""}}</button>
            <!-- <small v-if="!isHttps"> https://script.hub 可复制</small> -->
            &nbsp;&nbsp;
            <button v-if="resetInfo">{{resetInfo}}</button>
            <button v-else @click="reset">重置</button>
        </div>
      </div>
      <br>

      <details v-if="!target || (target !== 'rule-set' && target !== 'surge-script' )">
        <summary>名称 简介</summary>
        <span>名字+简介 ，名字和简介以"+"相连，可缺省名字或简介</span>
        <textarea id="n" v-model="n" placeholder=""></textarea>
      </details>

      <details>
        <summary>文件名(避免重名, 默认从来源取)</summary>
        <textarea id="filename" v-model="filename" placeholder=""></textarea>
      </details>

      <details v-if="!target || (target !== 'rule-set' && target !== 'surge-script' )">
        <summary>重写相关</summary>
        <details>
          <summary>保留重写</summary>
          <span>根据关键词保留重写(即去掉注释符#) 多关键词以"+"分隔</span>
          <textarea id="y" v-model="y" placeholder=""></textarea>
        </details>
        <details>
          <summary>排除重写</summary>
          <span>根据关键词排除重写(即添加注释符#) 多关键词以"+"分隔</span>
          <textarea id="x" v-model="x" placeholder=""></textarea>
        </details>
        <div>
          <input type="checkbox" id="del" v-model="del" />
          <label for="del">从转换结果中剔除被注释的重写</label>
        </div>
      </details>

      <details v-if="!target || target === 'rule-set'">
        <summary>规则相关</summary>
        <details>
          <summary>保留规则</summary>
          <span>根据关键词保留规则(即去掉注释符#) 多关键词以"+"分隔</span>
          <textarea id="y" v-model="y" placeholder=""></textarea>
        </details>
        <details>
          <summary>排除规则</summary>
          <span>根据关键词排除规则(即添加注释符#) 多关键词以"+"分隔</span>
          <textarea id="x" v-model="x" placeholder=""></textarea>
        </details>
      </details>





      <details v-if="!target || (target !== 'rule-set' && target !== 'surge-script' )">
        <summary>修改 MITM 主机名</summary>
        <details>
          <summary>添加 MITM 主机名</summary>
          <span>添加 MITM 主机名 多主机名以","分隔</span>
          <textarea id="hnadd" v-model="hnadd" placeholder=""></textarea>
        </details>

        <details>
          <summary>删除 MITM 主机名</summary>
          <span>从已有MITM主机名中删除主机名 多主机名以","分隔(需要传入完整主机名)</span>
          <textarea id="hndel" v-model="hndel" placeholder=""></textarea>
        </details>
      </details>


      <details v-if="!target || type === 'qx-rewrite'">
        <summary>启用脚本转换(仅在转换 QX 资源时可用)</summary>
        <details>
          <summary>启用脚本转换 1(仅在转换 QX 资源时可用)</summary>
          <span>根据关键词为脚本启用脚本转换(多关键词以"+"分隔，主要用途 将使用了QX独有api的脚本转换为通用脚本，谨慎开启，大部分脚本本身就通用，无差别启用，只会徒增功耗)</span>
          <textarea id="jsc" v-model="jsc" placeholder=""></textarea>
          <div>
            <input type="checkbox" id="jsc_all" v-model="jsc_all" />
            <label for="jsc_all">全部转换</label>
          </div>
        </details>

        <details v-if="!target || (target !== 'rule-set' && target !== 'surge-script' )">
          <summary>启用脚本转换 2(仅在转换 QX 资源时可用)</summary>
          <span>根据关键词为脚本启用脚本转换(与 <code>启用脚本转换 1</code> 的区别: 总是会在$done(body)里包一个response)</span>
          <textarea id="jsc2" v-model="jsc2" placeholder=""></textarea>
          <div>
            <input type="checkbox" id="jsc2_all" v-model="jsc2_all" />
            <label for="jsc2_all">全部转换</label>
          </div>
        </details>
      </details>


      <details v-if="!target || (target !== 'rule-set' && target !== 'surge-script' )">
        <summary>修改定时任务</summary>
        <details>
          <summary>修改定时任务(cron)</summary>
          <span>根据关键词锁定cron脚本配合参数cronexp= 修改定时任务的cron表达式 多关键词用"+"分隔，cron=传入了几项，cronexp=也必须对应传入几项。 cron表达式中空格可用"."或"%20"替代</span>
          <textarea id="cron" v-model="cron" placeholder=""></textarea>
        </details>
        <details>
          <summary>修改定时任务(cronexp)</summary>
          <span>见 cron= 参数说明</span>
          <textarea id="cronexp" v-model="cronexp" placeholder=""></textarea>
        </details>
      </details>


      <details v-if="!target || (target !== 'rule-set' && target !== 'surge-script' )">
        <summary>修改参数</summary>
        <details>
          <summary>修改参数(arg)</summary>
          <span>arg= 根据关键词锁定脚本配合参数argv= 修改argument=的值 多关键词用"+"分隔，arg=传入了几项，argv=也必须对应传入几项。 argument中的"&"必须用"t;amp;"替代，"+"必须用"t;add;"替代。</span>
          <textarea id="arg" v-model="arg" placeholder=""></textarea>
        </details>
        <details>
          <summary>修改参数(argv)</summary>
          <span>见 arg= 参数说明</span>
          <textarea id="argv" v-model="argv" placeholder=""></textarea>
        </details>
      </details>

      <details v-if="!target || target === 'stash-stoverride'">
        <summary>Stash Tiles 面板相关</summary>
        <details>
          <summary>根据关键词锁定 Surge 的 Panel 脚本(Stash 专用参数)</summary>
          <span>tiles= Stash专用参数，根据关键词锁定Surge的panel脚本，配合tcolor= 参数修改转换成tiles后的背景颜色，HEX码中的"#"必须用"@"替代</span>
          <textarea id="tiles" v-model="tiles" placeholder=""></textarea>
        </details>
        <details>
          <summary>Tiles 颜色(Stash 专用参数)</summary>
          <span>tcolor= 见 tiles 参数说明 请传入8位HEX颜色代码</span>
          <textarea id="tcolor" v-model="tcolor" placeholder=""></textarea>
        </details>
      </details>

      <details v-if="!target || target !== 'surge-script' ">
        <summary>缓存有效期</summary>
        <span>cachexp= 设置缓存有效期，单位：小时，不传入此参数默认有效期一小时。也可以用boxjs修改"Parser_cache_exp"的值来修改全局有效期。单位：小时，支持小数，设置为0.0001即立即过期。</span>
        <textarea id="cachexp" v-model="cachexp" placeholder=""></textarea>
      </details>

      <div v-if="!target || target === 'rule-set' ">
        <input type="checkbox" id="nore" v-model="nore" />
        <label for="nore">IP 规则开启不解析域名(即 no-resolve)</label>
      </div>

      <div v-if="!target || target === 'surge-script' ">
        <input type="checkbox" id="wrap_response" v-model="wrap_response" />
        <label for="wrap_response">总是会在 $done(body) 里包一个 response</label>
      </div>


    </div>
    <footer>
      <p>Made With &hearts; By <a href="https://github.com/Script-Hub-Org/Script-Hub">Script Hub</a></p>
    </footer>
    <script>
      const { createApp, ref } = Vue
  const init = {
    baseUrl: location.protocol + '//script.hub',
    types: [{value: 'qx-rewrite', label: 'QX 重写'}, {value: 'surge-module', label: 'Surge 模块'}, {value: 'loon-plugin', label: 'Loon 插件'}, {value: 'qx-script', label: 'QX 专属脚本'}, {value: 'rule-set', label: '规则集'}],
    type: '',
    targets: [{value: 'surge-module', label: 'Surge 模块', suffix: '.sgmodule'}, {value: 'stash-stoverride', label: 'Stash 覆写', suffix: '.stoverride'}, {value: 'shadowrocket-module', label: 'Shadowrocket 模块', suffix: '.sgmodule'}, {value: 'loon-plugin', label: 'Loon 插件', suffix: '.plugin'}, {value: 'surge-script', label: 'Surge 脚本(兼容)', suffix: '.js'}, {value: 'rule-set', label: '规则集', suffix: '.list' }],
    target: '',
    src: '',
    n: '',
    filename: '',
    y: '',
    x: '',
    del: false,
    hnadd: '',
    hndel: '',
    jsc: '',
    jsc_all: '',
    jsc2: '',
    jsc2_all: '',
    cron: '',
    cronexp: '',
    arg: '',
    argv: '',
    tiles: '',
    tcolor: '',
    cachexp: '',
    copyInfo: '',
    resetInfo: '',
    nore: false,
    wrap_response: false,
    env: "${$.getEnv() || ''}"
  }
  
  if (init.env === 'Surge') {
    init.target = 'surge-module'
  } else if (init.env === 'Loon') {
    init.target = 'loon-plugin'
  } else if (init.env === 'Stash') {
    init.target = 'stash-stoverride'
  } else if (init.env === 'Shadowrocket') {
    init.target = 'shadowrocket-module'
  }

  console.log("init", init)

  createApp({
    data() {
      return { ...init }
    },
    methods: {
      reset(){
        const initData = { ...init }
        Object.keys(initData).map(key => {
          if (key !== 'type' && key !== 'target') {
            this[key] = initData[key]
          }
        })
        // alert("✅ 已重置");
        this.resetInfo = '✅'
        setTimeout(() => {
          this.resetInfo = ''
        }, 1000)
      },
      copy(){
        const copyText = document.getElementById("result");

        copyText.select();
        copyText.setSelectionRange(0, 99999); // For mobile devices

        navigator.clipboard.writeText(copyText.value);
        this.copyInfo = '✅'
        setTimeout(() => {
          this.copyInfo = ''
        }, 1000)
        // if (this.isHttps) {
        //   alert("✅ 已复制");
        // }
      
      }
    },
    watch: {
      type(v) {
        if(v === 'rule-set' && this.target !== 'rule-set'){
          this.target='rule-set'
        } else if(v === 'qx-script' && this.target !== 'surge-script'){
          this.target='surge-script'
        }
      },
      target(v) {
        if(v === 'rule-set' && this.type !== 'rule-set'){
          this.type='rule-set'
        } else if(v === 'surge-script' && this.type !== 'qx-script'){
          this.type='qx-script'
        }
      }
  },
    computed: {
      result: function () {
				const fields = {}
        if (this.jsc_all) {
          fields.jsc = '.'
        }
        if (this.jsc2_all) {
          fields.jsc2 = '.'
        }
        const _fields = [ 'n', 'type', 'target', 'x', 'y', 'hnadd', 'hndel', 'jsc', 'jsc2', 'cron', 'cronexp', 'arg', 'argv', 'tiles', 'tcolor', 'cachexp', 'del', 'nore', 'wrap_response']
        _fields.forEach(field => {
         if (this[field]!==''&&this[field]!==false) {
            fields[field] = this[field]
          }
        })

        const type = this.types.find(i => i.value === this.type)
        const target = this.targets.find(i => i.value === this.target)
        if (this.src && target && type) {
          const suffix = target.suffix || ''
          const filename = this.filename || this.src.substring(this.src.lastIndexOf('/') + 1).split('.')[0]
          const pathType = this.target === 'surge-script' ? '/convert' : '/file'

          return this.baseUrl + pathType + '/_start_/' + this.src + '/_end_/' + filename + suffix + '?' + Object.keys(fields).map(i => i + '=' + encodeURIComponent(fields[i])).join('&')

          // let url = new URL(this.baseUrl + pathType + '/_start_/' + this.src + '/_end_/' + filename + suffix)
          
          // Object.keys(fields).map(i => {
          //  url.searchParams.append(i, fields[i])
          // })
          // return url.href
        }

        return ''
        
      },
      isHttps: function () {
        return location.protocol === 'https:'
      }
    }
  }).mount('#app')
</script>
  </body>

</html>
`

$.done({
  response: {
    status: 200,
    body: html,
    headers: {
      'Content-Type': 'text/html;charset=UTF-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST,GET,OPTIONS,PUT,DELETE',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
    },
  },
})

// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,a)=>{s.call(this,t,(t,s,r)=>{t?a(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}getEnv(){return"undefined"!=typeof $environment&&$environment["surge-version"]?"Surge":"undefined"!=typeof $environment&&$environment["stash-version"]?"Stash":"undefined"!=typeof module&&module.exports?"Node.js":"undefined"!=typeof $task?"Quantumult X":"undefined"!=typeof $loon?"Loon":"undefined"!=typeof $rocket?"Shadowrocket":void 0}isNode(){return"Node.js"===this.getEnv()}isQuanX(){return"Quantumult X"===this.getEnv()}isSurge(){return"Surge"===this.getEnv()}isLoon(){return"Loon"===this.getEnv()}isShadowrocket(){return"Shadowrocket"===this.getEnv()}isStash(){return"Stash"===this.getEnv()}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const a=this.getdata(t);if(a)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,a)=>e(a))})}runScript(t,e){return new Promise(s=>{let a=this.getdata("@chavy_boxjs_userCfgs.httpapi");a=a?a.replace(/\n/g,"").trim():a;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[i,o]=a.split("@"),n={url:`http://${o}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":i,Accept:"*/*"},timeout:r};this.post(n,(t,e,a)=>s(a))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),a=!s&&this.fs.existsSync(e);if(!s&&!a)return{};{const a=s?t:e;try{return JSON.parse(this.fs.readFileSync(a))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),a=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):a?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const a=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of a)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,a)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[a+1])>>0==+e[a+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,a]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,a,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,a,r]=/^@(.*?)\.(.*?)$/.exec(e),i=this.getval(a),o=a?"null"===i?null:i||"{}":"{}";try{const e=JSON.parse(o);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),a)}catch(e){const i={};this.lodash_set(i,r,t),s=this.setval(JSON.stringify(i),a)}}else s=this.setval(t,e);return s}getval(t){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.read(t);case"Quantumult X":return $prefs.valueForKey(t);case"Node.js":return this.data=this.loaddata(),this.data[t];default:return this.data&&this.data[t]||null}}setval(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.write(t,e);case"Quantumult X":return $prefs.setValueForKey(t,e);case"Node.js":return this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0;default:return this.data&&this.data[e]||null}}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){switch(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"],delete t.headers["content-type"],delete t.headers["content-length"]),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,a)=>{!t&&s&&(s.body=a,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,a)});break;case"Quantumult X":this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:a,headers:r,body:i,bodyBytes:o}=t;e(null,{status:s,statusCode:a,headers:r,body:i,bodyBytes:o},i,o)},t=>e(t&&t.error||"UndefinedError"));break;case"Node.js":let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:a,statusCode:r,headers:i,rawBody:o}=t,n=s.decode(o,this.encoding);e(null,{status:a,statusCode:r,headers:i,rawBody:o,body:n},n)},t=>{const{message:a,response:r}=t;e(a,r,r&&s.decode(r.rawBody,this.encoding))})}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";switch(t.body&&t.headers&&!t.headers["Content-Type"]&&!t.headers["content-type"]&&(t.headers["content-type"]="application/x-www-form-urlencoded"),t.headers&&(delete t.headers["Content-Length"],delete t.headers["content-length"]),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,(t,s,a)=>{!t&&s&&(s.body=a,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,a)});break;case"Quantumult X":t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:a,headers:r,body:i,bodyBytes:o}=t;e(null,{status:s,statusCode:a,headers:r,body:i,bodyBytes:o},i,o)},t=>e(t&&t.error||"UndefinedError"));break;case"Node.js":let a=require("iconv-lite");this.initGotEnv(t);const{url:r,...i}=t;this.got[s](r,i).then(t=>{const{statusCode:s,statusCode:r,headers:i,rawBody:o}=t,n=a.decode(o,this.encoding);e(null,{status:s,statusCode:r,headers:i,rawBody:o,body:n},n)},t=>{const{message:s,response:r}=t;e(s,r,r&&a.decode(r.rawBody,this.encoding))})}}time(t,e=null){const s=e?new Date(e):new Date;let a={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in a)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?a[e]:("00"+a[e]).substr((""+a[e]).length)));return t}queryStr(t){let e="";for(const s in t){let a=t[s];null!=a&&""!==a&&("object"==typeof a&&(a=JSON.stringify(a)),e+=`${s}=${a}&`)}return e=e.substring(0,e.length-1),e}msg(e=t,s="",a="",r){const i=t=>{switch(typeof t){case void 0:return t;case"string":switch(this.getEnv()){case"Surge":case"Stash":default:return{url:t};case"Loon":case"Shadowrocket":return t;case"Quantumult X":return{"open-url":t};case"Node.js":return}case"object":switch(this.getEnv()){case"Surge":case"Stash":case"Shadowrocket":default:{let e=t.url||t.openUrl||t["open-url"];return{url:e}}case"Loon":{let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}case"Quantumult X":{let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl,a=t["update-pasteboard"]||t.updatePasteboard;return{"open-url":e,"media-url":s,"update-pasteboard":a}}case"Node.js":return}default:return}};if(!this.isMute)switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:$notification.post(e,s,a,i(r));break;case"Quantumult X":$notify(e,s,a,i(r));break;case"Node.js":}if(!this.isMuteLog){let t=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];t.push(e),s&&t.push(s),a&&t.push(a),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t);break;case"Node.js":this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack)}}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;switch(this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:$done(t);break;case"Node.js":process.exit(1)}}}(t,e)}
