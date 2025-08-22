const NAME = `script-hub`

const $ = new Env(NAME)

$.isRequest = () => typeof $request !== 'undefined'
const isReloadRequest = () => $.isRequest() && /^https?:\/\/script\.hub\/reload/.test($request.url)
const reloaded = () => {
  if ($.isSurge()) {
    $.done({
      response: {
        status: 200,
        body: `<meta charset="UTF-8" /><h1>✅ Surge 重载完成<h1><a href="surge://">点此打开 Surge</a>`,
        headers: {
          'Content-Type': 'text/html;charset=UTF-8',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST,GET,OPTIONS,PUT,DELETE',
          'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
        },
      },
    })
  } else {
    $.done({
      response: {
        status: 200,
        body: `<meta charset="UTF-8" /><h1>🈚️ 暂时仅支持 Surge<h1>`,
        headers: {
          'Content-Type': 'text/html;charset=UTF-8',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST,GET,OPTIONS,PUT,DELETE',
          'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
        },
      },
    })
  }
}

if (isReloadRequest()) {
  if ($.isSurge()) {
    $.msg(
      'Surge 重载',
      '即将进行(由于重载机制, 可能没有后续通知)',
      '点此通知打开 Surge (⚠️ 更新已有模块时 可能仍需要杀掉 Surge 的后台重新打开才能生效)',
      'surge://'
    )
    httpAPI('/v1/profiles/reload', 'POST', {}).then(() => {
      $.msg(
        'Surge 重载',
        '✅ 完成',
        '点此通知打开 Surge (⚠️ 更新已有模块时 可能仍需要杀掉 Surge 的后台重新打开才能生效)',
        'surge://'
      )
      // 重载后这里不会执行...所以下面又写了一段
      reloaded()
    })
  } else {
    $.msg('重载', '🈚️ 不支持的环境', '暂时仅支持 Surge')
    reloaded()
  }
}
// 重载后会执行到这里
if (isReloadRequest()) {
  reloaded()
}

const html = `
<!DOCTYPE html>
<html lang="zh-CN">

  <head>
    <meta charset="UTF-8" />
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <link rel="icon" type="image/png" href="https://raw.githubusercontent.com/Script-Hub-Org/Script-Hub/main/assets/icon.png" />
    <link rel="apple-touch-icon" href="https://raw.githubusercontent.com/Script-Hub-Org/Script-Hub/main/assets/icon-dark.png">
    
    <!-- (viewport-fit=cover,填充整个屏幕导致全屏布局不一样) <link rel="stylesheet" href="https://unpkg.com/simpledotcss/simple.min.css">-->
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, shrink-to-fit=no", viewport-fit=auto />
    <meta name="HandheldFriendly" content="true">
    <title>Script Hub</title>
    <style>
    /* Global variables. */
:root {
  /* Set sans-serif & mono fonts */
  --sans-font: -apple-system, BlinkMacSystemFont, "Avenir Next", Avenir,
    "Nimbus Sans L", Roboto, "Noto Sans", "Segoe UI", Arial, Helvetica,
    "Helvetica Neue", sans-serif;
  --mono-font: Consolas, Menlo, Monaco, "Andale Mono", "Ubuntu Mono", monospace;
  --standard-border-radius: 13px;

  /* Default (light) theme */
  --bg: #eef1f5;
  --kbg: #6e8ed712;
  --accent-bg: #d8e3f17a;
  --text: #484848;
  --text-light: #585858;
  --border: #dadce7;
  --accent: #5c88c9;
  --code: #af5050;
  --preformatted: #272727;
  --marked: #ffdd33;
  --disabled: #efefef;
  --inputs:#d2d7e2b0;
  --selectc:#e4e4ee85;
}

/* Dark theme */
@media (prefers-color-scheme: dark) {
  ::backdrop,
  :root {
    color-scheme: dark;
    --bg: #1a1a1f;
    --kbg: #27272ca3;
    --accent-bg: #313139a3;
    --text: #d3cdcd;
    --text-light: #ababab;
    --accent: #9093ce;
    --code: #ba8a6d;
    --preformatted: #ccc;
    --disabled: #111;
    --border: none;
    --inputs:#41414657;
    --selectc:#1f1f21;
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
  font-size: 1.05rem;
  line-height: 1.5;
  display: grid;
  grid-template-columns: 1fr min(45rem, 92%) 1fr;
  margin: 0px;
  

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
  margin-top: 40px;
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
  border: none;
}

summary {
  cursor: pointer;
  font-weight: bold;
  padding: 0.7rem 1rem;
  margin: -0.7rem -1rem;
  word-break: break-all;
  font-size: 0.9rem;
}

details[open] > summary + * {
  margin-top: 0;
}

details[open] > summary {
  margin-bottom: 0.5rem;
  font-size: 1.15rem;
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
  /* font-family: inherit; */
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  color: var(--text);
  /* background-color: var(--bg); */
  background-color: var(--inputs);
  border: none;
  /* border: 1px solid var(--border); */
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
  input[type="radio"] {
  vertical-align: middle;
  position: relative;
  width: min-content;
} 

input[type="checkbox"] + label,
 input[type="radio"] + label {
  display: inline-block;
} 

 input[type="radio"] {
  border-radius: 100%;
} 

input[type="checkbox"]:checked,
 input[type="radio"]:checked {
  background-color: var(--accent);
} 
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
  /* Creates a rectangle with colored right and bottom borders which is rotated to look like a check mark 对号*/
  content: " ";
  width: 0.18em;
  height: 0.32em;
  border-radius: 0;
  position: absolute;
  top: 0.08em;
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
  background: var(--selectc);
  display: flex;
  border-radius: 15px;
  padding: 0.5rem 0rem 0.5rem 0.25rem;
  margin-top: 12px;

}

.flex-container>div {
    margin-right: 12%;
    font-size: 0.95rem;
}

textarea {
    min-height: 100px; 
    max-height: 500px; 
    overflow-y: auto;
    resize: vertical;  
}
textarea::-webkit-resizer {
  background: transparent;
}
.button-over {
  position: relative;
  top: -2px;
  font-size: 14px;
  font-weight: bold;
}

.divstyle {
  display: flex; 
  align-items: flex-start;
}

</style>
  </head>
  
  <body style="margin-bottom: 80px;"><script>
`

// <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>

const htmls = `

</script>
  <div id="app"><a href="https://github.com/Script-Hub-Org/Script-Hub"><h1 style="margin-bottom: 0;">Script Hub</h1></a>
      <p>重写 & 规则集转换 <small>&#9432; <a href="https://github.com/Script-Hub-Org/Script-Hub/wiki" target="_blank">查看文档</a></small></p>

      <div style=" margin-top: 30px;">
      <!--<code>输入类型:</code> -->
        <span style="position: relative; top: -9px;" v-for="item in inputTypes">
            <input type="radio" :id="'input-type-' + item.value" :value="item.value" v-model.lazy="inputType" :disabled="item.disabled"/>
            <label :for="'input-type-' + item.value" class="radio-label">{{item.label}}</label>
        </span>
        <textarea ref="textTextarea" @input="autoResize('textTextarea')" v-if=" inputType === 'local-text' " style=" position: relative; top: 4px; " id="localtext" v-model.lazy="localtext" placeholder="请填写本地文件内容"></textarea>
        <textarea ref="textTextarea" @input="autoResize('textTextarea')" v-else style=" position: relative; top: 4px; " id="src" v-model.lazy="src" placeholder="请填写来源 URL 链接(多个 URL 用 😂 连接)"></textarea>
      </div>
      <!--font-size: 16px;  style=" position: relative; top: -3px; "-->
      <small style=" position: relative; top: 7px; ">&nbsp;&#9432; <a href="https://github.com/Script-Hub-Org/Script-Hub/wiki/%E6%88%91%E5%BA%94%E8%AF%A5%E6%80%8E%E4%B9%88%E9%80%89%E6%8B%A9%E6%9D%A5%E6%BA%90%E7%B1%BB%E5%9E%8B%E5%92%8C%E7%9B%AE%E6%A0%87%E7%B1%BB%E5%9E%8B" target="_blank">如何选择类型</a></small>
      <div class="flex-container">
      <div style="white-space: nowrap;">
      
        <code>&nbsp;来源类型: </code>
        <div v-for="item in types">
            <input type="radio" :id="'type-' + item.value" :value="item.value" v-model.lazy="type" :disabled="item.disabled"/>
            <label :for="'type-' + item.value" class="radio-label">{{item.label}}</label>
        </div>

      </div>

      <div>
        <code>&nbsp;目标类型: </code>
        <template v-for="item in targets">
          <div v-if="type === 'rule-set' ? (item.value.endsWith('rule-set') || item.value.includes('domain-set')) : ( (item.value.endsWith('-rule-set')||item.value.includes('domain-set')) ? false : ( type.endsWith('-script') ? item.value.endsWith('-script') : !item.value.endsWith('-script') ) ) ">
            <input type="radio" :id="'target-' + item.value" :value="item.value" v-model.lazy="target" :disabled="item.disabled || (type.endsWith('-script') && !item.value.endsWith('-script')) || (type === 'rule-set' && (!item.value.endsWith('rule-set') && !item.value.includes('domain-set'))) || (type === 'plain-text' && item.value !== 'plain-text') " />
            <label :for="'target-' + item.value" class="radio-label">{{item.label}}</label>
          </div>
        </template>
      </div>
    </div>
    <br/>

    <details v-if="!target || type === 'qx-script' || target.endsWith('-script')">
      <summary>
      QX 专属脚本说明：
      <br/>
      你一般<code>不需要用它</code>, 因为这是 <code>脚本转脚本</code>
      <br/>
      通常情况下, 你需要的是 <code>QX 重写 转换到 模块/覆写/插件</code>
      <br/>
      专属脚本转换的使用场景:
      <br/>
      你想在你的模块/覆写/插件中, 单独引用一条转换的 QX 专属脚本
      </summary>
      <span>
      <!--无-->
      </span>
      
    </details>

    <!-- position: fixed; -->
    <div style="padding: 1rem;bottom: 0rem;margin-right: 0rem;background-color: var(--kbg);/* border: 1px solid var(--border); */border-radius: var(--standard-border-radius);">
        <span v-if="result" style="color: red">请勿打开链接之后复制浏览器地址栏的链接 浏览器地址栏中的链接可能未编码 可能会导致导入参数异常</span><br/><span v-if="src && src.includes('.lpx')" style="color: red">⚠️ 你填入的可能是 Loon 加密的私有插件(.lpx) Script Hub 无法处理</span><br/>
        <a v-if="result" :href="result" target="_blank" style="margin: 0 0.5rem 0 0">打开链接</a>
        <a v-if="previewResult" :href="previewResult" target="_blank" style="margin: 0 0.5rem 0 0">预览结果</a>
        <a v-if="result && target === 'shadowrocket-module' " :href=" 'https://api.boxjs.app/shadowrocket/install?module=' + encodeURIComponent(result) " target="_blank" style="margin: 0 0.5rem 0 0">导入(Shadowrocket)</a>
        <a v-if="result && target === 'loon-plugin' " :href=" 'https://www.nsloon.com/openloon/import?plugin=' + encodeURIComponent(result) " target="_blank" style="margin: 0 0.5rem 0 0">导入(Loon)</a>
        <a v-if="result && target === 'stash-stoverride' " :href=" 'stash://install-override?url=' + encodeURIComponent(result) " target="_blank" style="margin: 0 0.5rem 0 0">导入(Stash)</a>
        <template v-if="result && target === 'surge-module' ">
          <a :href=" 'surge:///install-module?url=' + encodeURIComponent(result) + '&name=' + encodeURIComponent(filename) " target="_blank" style="margin: 0 0.5rem 0 0">导入 Surge(远程模块)</a>
          <a :href=" 'scriptable:///run/SurgeModuleTool?url=' + encodeURIComponent(result) + '&name=' + encodeURIComponent(filename) " target="_blank" style="margin: 0 0.5rem 0 0">导入 Surge(本地模块 需配合 Scriptable)</a>
          <small>&#9432; <a href="https://github.com/Script-Hub-Org/Script-Hub/wiki/%E7%9B%B8%E5%85%B3%E7%94%9F%E6%80%81:-Surge-%E6%A8%A1%E5%9D%97%E5%B7%A5%E5%85%B7" target="_blank">如何配合 Scriptable 导入</a></small>
          <a :href=" 'egern:///modules/new?url=' + encodeURIComponent(result) + '&name=' + encodeURIComponent(filename) " target="_blank" style="margin: 0 0.5rem 0 0">导入 Egern(远程模块)</a>
        </template>
        <template v-if="result">
          <br/>
          <small>&#9432; 将此链接中的 <code>file</code> 或 <code>convert</code> 改为 <code>edit</code> 即可在浏览器中再次对当前内容进行编辑</small>
        </template>
        <textarea v-if="frontendConvert" id="frontendConvertResult" :value="frontendConvertResult" placeholder="结果" readonly></textarea>
        <textarea v-else id="result" :value="result" placeholder="结果(请输入来源链接并选择类型)" readonly></textarea>
        <div>
          <input type="checkbox" id="frontendConvert" v-model.lazy="frontendConvert" :disabled="frontendConvertDisabled"/>
          <label class="button-over" for="frontendConvert">开启纯前端转换</label>
          <br/>
          <small>使用限制: 1. 使用网页部署前端 2. 使用 <code>本地文本内容</code> 3. 转换类型为 <code>重写/模块/覆写/插件 </code> 4. 不会进行内部的 <code>脚本转换</code> 5. 不会进行网络请求 例: 无法使用 <code>可莉图标订阅</code> 但是可以使用完整图标文件链接</small>
        </div>
        <button v-if="copyInfo">{{copyInfo}}</button>
        <button v-else @click="copy" :disabled="!result">复制</button>
            <!-- <button v-else @click="copy">全选{{isHttps ? "&复制" : ""}}</button> -->
            <!-- <small v-if="!isHttps"> https://script.hub 可复制</small> -->
            &nbsp;&nbsp;
            <button v-if="resetInfo">{{resetInfo}}</button>
            <button v-else @click="reset">重置</button>
      </div>
      <br/>

      <template v-if="!target || !type || (!target.endsWith('rule-set') && !target.includes('domain-set') && !target.endsWith('-script') && target !== 'plain-text' )">
        <small style=" position: relative; top: -4px;">&nbsp;&#9432; <a href="https://github.com/Script-Hub-Org/Script-Hub/wiki/%E6%88%91%E5%BA%94%E8%AF%A5%E6%80%8E%E4%B9%88%E9%80%89%E6%8B%A9%E6%9D%A5%E6%BA%90%E7%B1%BB%E5%9E%8B%E5%92%8C%E7%9B%AE%E6%A0%87%E7%B1%BB%E5%9E%8B#%E4%BB%80%E4%B9%88%E6%97%B6%E5%80%99%E8%A6%81%E5%BC%80%E5%90%AF%E8%84%9A%E6%9C%AC%E8%BD%AC%E6%8D%A2" target="_blank">什么时候应该启用脚本转换</a></small>
        <details>
          <summary>启用脚本转换</summary>
          <small> &#9432; <a href="https://github.com/Script-Hub-Org/Script-Hub/wiki/%E6%88%91%E5%BA%94%E8%AF%A5%E6%80%8E%E4%B9%88%E9%80%89%E6%8B%A9%E6%9D%A5%E6%BA%90%E7%B1%BB%E5%9E%8B%E5%92%8C%E7%9B%AE%E6%A0%87%E7%B1%BB%E5%9E%8B#%E4%BB%80%E4%B9%88%E6%97%B6%E5%80%99%E8%A6%81%E5%BC%80%E5%90%AF%E8%84%9A%E6%9C%AC%E8%BD%AC%E6%8D%A2" target="_blank">脚本转换 1 和 2 怎么选</a></small>
          <details>
            <summary>启用脚本转换 1</summary>
            <span>根据关键词为脚本启用脚本转换(多关键词以 <code>+</code> 分隔，主要用途 将使用了QX独有api的脚本转换为通用脚本，谨慎开启，大部分脚本本身就通用，无差别启用，只会徒增功耗)</span>
            <textarea id="jsc" v-model.lazy="jsc" placeholder=""></textarea>
            <div>
              <input type="checkbox" id="jsc_all" v-model.lazy="jsc_all" />
              <label for="jsc_all">全部转换</label>
            </div>
            <div>
              <input type="checkbox" id="compatibilityOnly" v-model.lazy="compatibilityOnly" />
              <label class="button-over" for="compatibilityOnly">仅进行兼容性转换<small style=" position: relative; top: -4px;">&nbsp;&#9432; <a href="https://github.com/Script-Hub-Org/Script-Hub/wiki/%E6%88%91%E5%BA%94%E8%AF%A5%E6%80%8E%E4%B9%88%E9%80%89%E6%8B%A9%E6%9D%A5%E6%BA%90%E7%B1%BB%E5%9E%8B%E5%92%8C%E7%9B%AE%E6%A0%87%E7%B1%BB%E5%9E%8B#%E4%BB%80%E4%B9%88%E6%98%AF-%E4%BB%85%E8%BF%9B%E8%A1%8C%E5%85%BC%E5%AE%B9%E6%80%A7%E8%BD%AC%E6%8D%A2" target="_blank">什么是 <code>仅进行兼容性转换</code></a></small></label>
            </div>
            <details>
              <summary>在脚本开头添加代码</summary>
              <span>下面的代码会添加到被转换的脚本的开头 可用于更复杂的操作</span>
              <textarea id="prepend" v-model.lazy="prepend" placeholder="console.log(new Date().toLocaleString('zh'))"></textarea>
            </details>
            <details>
              <summary>高级操作(使用代码处理脚本的内容)</summary>
              <details>
                <summary>处理原始内容(代码)</summary>
                <span>使用 <code>eval</code> 执行, 内容变量为 <code>body</code></span>
                <textarea id="evJsori" v-model.lazy="evJsori" placeholder="body = body.replace(/ffffoooooo/gi, 'bbbaaarrr')"></textarea>
              </details>

              <details>
                <summary>处理转换后的内容(代码)</summary>
                <span>使用 <code>eval</code> 执行, 内容变量为 <code>body</code></span>
                <textarea id="evJsmodi" v-model.lazy="evJsmodi" placeholder="body = body.replace(/ffffoooooo/gi, 'bbbaaarrr')"></textarea>
              </details>
              
              <details>
                <summary>处理原始内容(链接)</summary>
                <span>使用 <code>eval</code> 执行, 内容变量为 <code>body</code></span>
                <textarea id="evUrlori" v-model.lazy="evUrlori" placeholder="URL 链接"></textarea>
              </details>

              <details>
                <summary>处理转换后的内容(链接)</summary>
                <span>使用 <code>eval</code> 执行, 内容变量为 <code>body</code></span>
                <textarea id="evUrlmodi" v-model.lazy="evUrlmodi" placeholder="URL 链接"></textarea>
              </details>
            </details>
          </details>

          <details>
            <summary>启用脚本转换 2</summary>
            <span>根据关键词为脚本启用脚本转换(与 <code>启用脚本转换 1</code> 的区别: 总是会在 <code>$done</code><code>(body)</code> 里包一个response)</span>
            <textarea id="jsc2" v-model.lazy="jsc2" placeholder=""></textarea>
            <div>
              <input type="checkbox" id="jsc2_all" v-model.lazy="jsc2_all" />
              <label for="jsc2_all">全部转换</label>
            </div>
            <div>
              <input type="checkbox" id="compatibilityOnly" v-model.lazy="compatibilityOnly" />
              <label class="button-over" for="compatibilityOnly">仅进行兼容性转换<small style=" position: relative; top: -4px;">&nbsp;&#9432; <a href="https://github.com/Script-Hub-Org/Script-Hub/wiki/%E6%88%91%E5%BA%94%E8%AF%A5%E6%80%8E%E4%B9%88%E9%80%89%E6%8B%A9%E6%9D%A5%E6%BA%90%E7%B1%BB%E5%9E%8B%E5%92%8C%E7%9B%AE%E6%A0%87%E7%B1%BB%E5%9E%8B#%E4%BB%80%E4%B9%88%E6%98%AF-%E4%BB%85%E8%BF%9B%E8%A1%8C%E5%85%BC%E5%AE%B9%E6%80%A7%E8%BD%AC%E6%8D%A2" target="_blank">什么是 <code>仅进行兼容性转换</code></a></small></label>
            </div>
            <details>
              <summary>在脚本开头添加代码</summary>
              <span>下面的代码会添加到被转换的脚本的开头 可用于更复杂的操作</span>
              <textarea id="prepend" v-model.lazy="prepend" placeholder="console.log(new Date().toLocaleString('zh'))"></textarea>
            </details>
            <details>
              <summary>高级操作(使用代码处理脚本的内容)</summary>
              <details>
                <summary>处理原始内容(代码)</summary>
                <span>使用 <code>eval</code> 执行, 内容变量为 <code>body</code></span>
                <textarea id="evJsori" v-model.lazy="evJsori" placeholder="body = body.replace(/ffffoooooo/gi, 'bbbaaarrr')"></textarea>
              </details>

              <details>
                <summary>处理转换后的内容(代码)</summary>
                <span>使用 <code>eval</code> 执行, 内容变量为 <code>body</code></span>
                <textarea id="evJsmodi" v-model.lazy="evJsmodi" placeholder="body = body.replace(/ffffoooooo/gi, 'bbbaaarrr')"></textarea>
              </details>
              
              <details>
                <summary>处理原始内容(链接)</summary>
                <span>使用 <code>eval</code> 执行, 内容变量为 <code>body</code></span>
                <textarea id="evUrlori" v-model.lazy="evUrlori" placeholder="URL 链接"></textarea>
              </details>

              <details>
                <summary>处理转换后的内容(链接)</summary>
                <span>使用 <code>eval</code> 执行, 内容变量为 <code>body</code></span>
                <textarea id="evUrlmodi" v-model.lazy="evUrlmodi" placeholder="URL 链接"></textarea>
              </details>
            </details>
          </details>
        </details>
      </template>

      <details v-if="!target || (!target.endsWith('rule-set') && !target.includes('domain-set') && !target.endsWith('-script') && target !== 'plain-text' )">
        <summary>名称 简介</summary>
        <span>名字+简介 ，名字和简介以 <code>+</code> 相连，可缺省名字或简介. 名字或简介中想使用 <code>+</code> 请用 <code>➕</code> 代替</span>
        <textarea id="n" v-model.lazy="n" placeholder=""></textarea>
      </details>
      
      <details>
        <summary>文件名(避免重名, 默认从来源取)</summary>
        <textarea id="filename" v-model.lazy="filename" :placeholder=" target === 'plain-text' ? '当前为纯文本类型, 此处为包含后缀的完整文件名' : '不包含后缀' "></textarea>
      </details>

      <details v-if="!target || (!target.endsWith('rule-set') && !target.includes('domain-set') && !target.endsWith('-script') && target !== 'plain-text' )">
        <summary>分类</summary>
        <textarea id="category" v-model.lazy="category" placeholder="指定 category"></textarea>
      </details>

      <details v-if="!target || (!target.endsWith('rule-set') && !target.includes('domain-set') && !target.endsWith('-script') && target !== 'plain-text' )">
        <summary>图标</summary>
        <p>可指定 <a href="https://raw.githubusercontent.com/luestr/IconResource/main/KeLee_icon.json" target="_blank">可莉图标订阅</a> 里的图标名或图标链接</p>
        <textarea id="icon" v-model.lazy="icon" placeholder="指定 icon"></textarea>
      </details>

      <details v-if="!target || (!target.endsWith('rule-set') && !target.includes('domain-set') && !target.endsWith('-script') && target !== 'plain-text' )">
        <summary>重写相关</summary>

        <details>
          <summary>保留重写</summary>
          <span>根据关键词保留重写(即去掉注释符#) 多关键词以 <code>+</code> 分隔</span>
          <textarea id="y" v-model.lazy="y" placeholder=""></textarea>
        </details>
        <details>
          <summary>排除重写</summary>
          <span>根据关键词排除重写(即添加注释符#) 多关键词以 <code>+</code> 分隔</span>
          <textarea id="x" v-model.lazy="x" placeholder=""></textarea>
        </details>
        <div>
          <input type="checkbox" id="synMitm" v-model.lazy="synMitm" />
          <label for="synMitm">将 MitM 主机名同步至 <code>force-http-engine-hosts</code></label>
        </div>
        <div>
          <input type="checkbox" id="del" v-model.lazy="del" />
          <label for="del">从转换结果中剔除被注释的重写</label>
        </div>
        <div class="divstyle">
          <input type="checkbox" id="del" v-model.lazy="keepHeader" />
          <label for="keepHeader">保留 <code>Map Local</code>/<code>echo-response</code> 中的 <code>header</code>/<code>content-type</code>(占用内存多 但响应快)</label>
        </div>
        <div>
          <input type="checkbox" id="del" v-model.lazy="jsDelivr" />
          <label for="jsDelivr">GitHub 转 jsDelivr(修复 content-type)</label>
        </div>
      </details>

      <details v-if="!target || (target.endsWith('rule-set') || target.includes('domain-set'))">
        <summary>规则相关</summary>
        <details>
          <summary>保留规则</summary>
          <span>根据关键词保留规则(即去掉注释符#) 多关键词以 <code>+</code> 分隔</span>
          <textarea id="y" v-model.lazy="y" placeholder=""></textarea>
        </details>
        <details>
          <summary>排除规则</summary>
          <span>根据关键词排除规则(即添加注释符#) 多关键词以 <code>+</code> 分隔</span>
          <textarea id="x" v-model.lazy="x" placeholder=""></textarea>
        </details>
      </details>

      <details v-if="!target || (!target.endsWith('rule-set') && !target.includes('domain-set') && !target.endsWith('-script') && target !== 'plain-text' )">
        <summary>指定策略</summary>
        <span>为 <code>[Rule]</code> 字段下未指定策略或指定的策略不是 app 内置策略的规则指定一个策略，如未指定将自动跳过该规则</span>
        <textarea id="policy" v-model.lazy="policy" placeholder=""></textarea>
      </details>



      <details v-if="!target || (!target.endsWith('rule-set') && !target.includes('domain-set') && !target.endsWith('-script') && target !== 'plain-text' )">
        <summary>修改 MitM 主机名</summary>
        <details>
          <summary>添加 MitM 主机名</summary>
          <span>添加 MitM 主机名 多主机名以 <code>,</code> 分隔</span>
          <textarea id="hnadd" v-model.lazy="hnadd" placeholder=""></textarea>
        </details>

        <details>
          <summary>删除 MitM 主机名</summary>
          <span>1. 从已有 MitM 主机名中删除主机名 多主机名以 <code>,</code> 分隔(需要传入完整主机名)</span>
          <textarea id="hndel" v-model.lazy="hndel" placeholder=""></textarea>
          <span>2. 使用 <code>正则表达式</code> 从已有 MitM 主机名中删除主机名</span>
          <textarea id="hnregdel" v-model.lazy="hnregdel" placeholder=""></textarea>
        </details>
      </details>
      

      <details v-if="!target || (!target.endsWith('rule-set') && !target.includes('domain-set') && !target.endsWith('-script') && target !== 'plain-text' )">
        <summary>修改脚本名</summary>
        <div>请务必阅读 <a href="https://t.me/zhetengsha/1372" target="_blank">此示例</a> 学习如何使用</div>
        <details>
          <summary>关键词锁定脚本(njsnametarget)</summary>
          <span>根据关键词锁定脚本, 配合参数 <code>njsname</code> 修改脚本名. 多关键词用 <code>+</code> 分隔, <code>njsnametarget</code> 传入了几项,  <code>njsname</code> 也必须对应传入几项</span>
          <textarea id="njsnametarget" v-model.lazy="njsnametarget" placeholder=""></textarea>
        </details>
        <details>
          <summary>新的脚本名(njsname)</summary>
          <span>见 <code>njsnametarget</code> 参数说明</span>
          <textarea id="njsname" v-model.lazy="njsname" placeholder=""></textarea>
        </details>
      </details>
      <details v-if="!target || (!target.endsWith('rule-set') && !target.includes('domain-set') && !target.endsWith('-script') && target !== 'plain-text' )">
        <summary>修改脚本超时</summary>
        <div>请务必阅读 <a href="https://t.me/zhetengsha/1372" target="_blank">此示例</a> 学习如何使用</div>
        <details>
          <summary>关键词锁定脚本(timeoutt)</summary>
          <span>根据关键词锁定脚本, 配合参数 <code>timeoutv</code> 修改脚本超时. 多关键词用 <code>+</code> 分隔, <code>timeoutt</code> 传入了几项,  <code>timeoutv</code> 也必须对应传入几项</span>
          <textarea id="timeoutt" v-model.lazy="timeoutt" placeholder=""></textarea>
        </details>
        <details>
          <summary>超时(timeoutv)</summary>
          <span>见 <code>timeoutt</code> 参数说明</span>
          <textarea id="timeoutv" v-model.lazy="timeoutv" placeholder=""></textarea>
        </details>
      </details>

      <details v-if="!target || target === 'surge-module' ">
        <summary>修改脚本引擎(Surge)</summary>
        <div>请务必阅读 <a href="https://t.me/zhetengsha/1372" target="_blank">此示例</a> 学习如何使用</div>
        <details>
          <summary>关键词锁定脚本(enginet)</summary>
          <span>根据关键词锁定脚本, 配合参数 <code>enginev</code> 修改 <a href="https://t.me/SurgeTestFlightFeed/114" target="_blank">脚本引擎</a>. 多关键词用 <code>+</code> 分隔, <code>enginet</code> 传入了几项,  <code>enginev</code> 也必须对应传入几项</span>
          <textarea id="enginet" v-model.lazy="enginet" placeholder=""></textarea>
        </details>
        <details>
          <summary>引擎(enginev)</summary>
          <span>见 <code>enginet</code> 参数说明</span>
          <textarea id="enginev" v-model.lazy="enginev" placeholder=""></textarea>
        </details>
      </details>

      <details v-if="!target || (!target.endsWith('rule-set') && !target.includes('domain-set') && !target.endsWith('-script') && target !== 'plain-text' )">
        <summary>修改定时任务</summary>
        <div>请务必阅读 <a href="https://t.me/zhetengsha/1372" target="_blank">此示例</a> 学习如何使用</div>
        <details>
          <summary>关键词锁定定时任务(cron)</summary>
          <span>根据关键词锁定 <code>cron</code> 脚本配合参数 <code>cronexp</code> 修改定时任务的cron表达式 多关键词用 <code>+</code> 分隔, <code>cron</code> 传入了几项, <code>cronexp</code> 也必须对应传入几项。 cron 表达式中空格可用 "." 替代</span>
          <textarea id="cron" v-model.lazy="cron" placeholder=""></textarea>
        </details>
        <details>
          <summary>修改定时任务(cronexp)</summary>
          <span>见 <code>cron</code> 参数说明</span>
          <textarea id="cronexp" v-model.lazy="cronexp" placeholder=""></textarea>
        </details>
      </details>


      <details v-if="!target || (!target.endsWith('rule-set') && !target.includes('domain-set') && !target.endsWith('-script') && target !== 'plain-text' )">
        <summary>修改参数</summary>
        <div>请务必阅读 <a href="https://t.me/zhetengsha/1372" target="_blank">此示例</a> 学习如何使用</div>
        <details>
          <summary>修改参数(arg)</summary>
          <span>arg= 根据关键词锁定脚本配合参数argv= 修改argument=的值 多关键词用 <code>+</code> 分隔，arg=传入了几项，argv=也必须对应传入几项。 argument中  <code>+</code> 必须用"t;add;"替代。</span>
          <textarea id="arg" v-model.lazy="arg" placeholder=""></textarea>
        </details>
        <details>
          <summary>修改参数(argv)</summary>
          <span>见 arg= 参数说明</span>
          <textarea id="argv" v-model.lazy="argv" placeholder=""></textarea>
        </details>
      </details>

      <details v-if="!target || target === 'stash-stoverride'">
        <summary>Stash Tiles 面板相关</summary>
        <div>请务必阅读 <a href="https://t.me/zhetengsha/1372" target="_blank">此示例</a> 学习如何使用</div>
        <details>
          <summary>根据关键词锁定 Surge 的 Panel 脚本(Stash 专用参数)</summary>
          <span>tiles= Stash专用参数，根据关键词锁定Surge的panel脚本，配合tcolor= 参数修改转换成tiles后的背景颜色，HEX码中的"#"必须用"@"替代</span>
          <textarea id="tiles" v-model.lazy="tiles" placeholder=""></textarea>
        </details>
        <details>
          <summary>Tiles 颜色(Stash 专用参数)</summary>
          <span>tcolor= 见 tiles 参数说明 请传入8位HEX颜色代码</span>
          <textarea id="tcolor" v-model.lazy="tcolor" placeholder=""></textarea>
        </details>
      </details>

      <details v-if="false">
        <summary>缓存(默认开启)</summary>
        <span>cachexp= 设置缓存有效期，单位：小时，不传入此参数默认有效期一小时。也可以用 BoxJs 修改 <code>Parser_cache_exp</code> 的值来修改全局有效期。单位：小时，支持小数，设置为0.0001即立即过期。</span>
        <input id="cachexp" v-model.number.lazy="cachexp" placeholder=""></input>
        <div>
          <input type="checkbox" id="nocache" v-model.lazy="nocache" />
          <label for="nocache">不缓存该条链接</label>
        </div>
      </details>

      <div>
        <input type="checkbox" id="nore" v-model.lazy="nore" />
        <label class="button-over" for="nore">IP 规则开启不解析域名(即 no-resolve)</label>
      </div>

      <details v-if="!target || target.startsWith('surge') ">
        <summary>SNI 扩展匹配(extended-matching)</summary>
        <span>根据关键词开启 Surge 的 SNI 扩展匹配(extended-matching) 多关键词以 <code>+</code> 分隔</span>
        <textarea id="sni" v-model.lazy="sni" placeholder=""></textarea>
      </details>
      <details v-if="!target || target.startsWith('surge') ">
        <summary>pre-matching</summary>
        <span>根据关键词开启 Surge 的 pre-matching 多关键词以 <code>+</code> 分隔</span>
        <textarea id="pm" v-model.lazy="pm" placeholder=""></textarea>
      </details>
      <div v-if="!target || target.startsWith('surge') ">
        <input type="checkbox" id="jqEnabled" v-model.lazy="jqEnabled" />
        <label class="button-over" for="jqEnabled">开启 JQ(需新版 Surge 订阅功能)</label>
      </div>

      <div v-if="!target || target.endsWith('-script') ">
        <input type="checkbox" id="wrap_response" v-model.lazy="wrap_response" />
        <label class="button-over" for="wrap_response">总是会在 <code>$done</code><code>(body)</code> 里包一个 response</label>
      </div>

      <div v-if="!target || target.endsWith('-script') ">
        <input type="checkbox" id="compatibilityOnly" v-model.lazy="compatibilityOnly" />
        <label class="button-over" for="compatibilityOnly">仅进行兼容性转换<small style=" position: relative; top: -4px;">&nbsp;&#9432; <a href="https://github.com/Script-Hub-Org/Script-Hub/wiki/%E6%88%91%E5%BA%94%E8%AF%A5%E6%80%8E%E4%B9%88%E9%80%89%E6%8B%A9%E6%9D%A5%E6%BA%90%E7%B1%BB%E5%9E%8B%E5%92%8C%E7%9B%AE%E6%A0%87%E7%B1%BB%E5%9E%8B#%E4%BB%80%E4%B9%88%E6%98%AF-%E4%BB%85%E8%BF%9B%E8%A1%8C%E5%85%BC%E5%AE%B9%E6%80%A7%E8%BD%AC%E6%8D%A2" target="_blank">什么是 <code>仅进行兼容性转换</code></a></small></label>
      </div>


      <details v-if="inputType !== 'local-text'">
        <summary>自定义请求的 Headers</summary>
        <span>格式(使用英文冒号 不要加无意义的空格): <code>Field:Value</code> 可换行输入多个. <br/>默认为 <code>User-Agent:script-hub/1.0.0</code></span>
        <textarea id="headers" v-model.lazy="headers" placeholder="User-Agent:script-hub/1.0.0\nAuthorization:token xxx"></textarea>
      </details>
      <details>
        <summary>高级操作(使用代码处理内容)</summary>
        <details>
          <summary>处理原始内容(代码)</summary>
          <span>使用 <code>eval</code> 执行, 内容变量为 <code>body</code></span>
          <textarea id="evalScriptori" v-model.lazy="evalScriptori" placeholder="body = body.replace(/ffffoooooo/gi, 'bbbaaarrr')"></textarea>
        </details>

        <details>
          <summary>处理转换后的内容(代码)</summary>
          <span>使用 <code>eval</code> 执行, 内容变量为 <code>body</code></span>
          <textarea id="evalScriptmodi" v-model.lazy="evalScriptmodi" placeholder="body = body.replace(/ffffoooooo/gi, 'bbbaaarrr')"></textarea>
        </details>
        
        <details>
          <summary>处理原始内容(链接)</summary>
          <span>使用 <code>eval</code> 执行, 内容变量为 <code>body</code></span>
          <textarea id="evalUrlori" v-model.lazy="evalUrlori" placeholder="URL 链接"></textarea>
        </details>

        <details>
          <summary>处理转换后的内容(链接)</summary>
          <span>使用 <code>eval</code> 执行, 内容变量为 <code>body</code></span>
          <textarea id="evalUrlmodi" v-model.lazy="evalUrlmodi" placeholder="URL 链接"></textarea>
        </details>
      </details>

      <div>
        <input type="checkbox" id="noNtf" v-model.lazy="noNtf" />
        <label class="button-over" for="noNtf">关闭通知</label>
      </div>


    </div>
    <footer>
      <p>Made With &hearts; By <a href="https://github.com/Script-Hub-Org/Script-Hub">Script Hub v1.14.14</a></p>
    </footer>
    <script>
      const openAllDetails = () => document.querySelectorAll('details').forEach(i => i.setAttribute('open', ""))
    
      const { createApp, ref } = Vue
  const init = {
    // baseUrl: location.protocol + '//script.hub/',
    baseUrl: 'http://script.hub/',
    inputTypes: [{value: 'remote-url', label: '来源链接'}, {value: 'local-text', label: '本地文本内容'}],
    types: [{value: 'qx-rewrite', label: 'QX 重写'}, {value: 'surge-module', label: 'Surge 模块'}, {value: 'loon-plugin', label: 'Loon 插件'}, {value: 'rule-set', label: '规则集'}, {value: 'qx-script', label: 'QX 专属脚本'}, {value: 'plain-text', label: '纯文本'}],
    type: 'qx-rewrite',
    inputType: '',
    targets: [{value: 'surge-module', label: 'Surge/Egern 模块', suffix: '.sgmodule'}, {value: 'stash-stoverride', label: 'Stash 覆写', suffix: '.stoverride'}, {value: 'shadowrocket-module', label: 'Shadowrocket 模块', suffix: '.sgmodule'}, {value: 'loon-plugin', label: 'Loon 插件', suffix: '.plugin'}, {value: 'loon-rule-set', label: '规则集(Loon)', suffix: '.list' }, {value: 'shadowrocket-rule-set', label: '规则集(Shadowrocket)', suffix: '.list' }, {value: 'surge-rule-set', label: '规则集(Surge)', suffix: '.list' }, {value: 'surge-domain-set', label: '域名集¹(Surge)', suffix: '.list' }, {value: 'surge-domain-set2', label: '无法转换为域名集¹的剩余规则集(Surge)', suffix: '.list' }, {value: 'stash-rule-set', label: '规则集(Stash)', suffix: '.list' }, {value: 'stash-domain-set', label: '域名集²(Stash)', suffix: '.list' }, {value: 'stash-domain-set2', label: '无法转换为域名集²的剩余规则集(Stash)', suffix: '.list' }, {value: 'surge-script', label: 'Surge 脚本(兼容)', suffix: '.js'}, {value: 'plain-text', label: '纯文本'}],
    target: '',
    src: '',
    headers: '',
    localtext: '',
    n: '',
    filename: '',
    category: '',
    icon: '',
    y: '',
    x: '',
    del: true,
    hnadd: '',
    hndel: '',
    hnregdel: '',
    jsc: '',
    jsc_all: '',
    jsc2: '',
    jsc2_all: '',
    cron: '',
    cronexp: '',
    njsname: '',
    njsnametarget: '',
    timeoutt: '',
    timeoutv: '',
    enginet: '',
    enginev: '',
    policy: '',
    arg: '',
    argv: '',
    tiles: '',
    tcolor: '',
    cachexp: '',
    nocache: '',
    copyInfo: '',
    resetInfo: '',
    evalScriptori: '',
    evalScriptmodi: '',
    evalUrlori: '',
    evalUrlmodi: '',
    evJsori: '',
    evJsmodi: '',
    evUrlori: '',
    evUrlmodi: '',
    prepend: '',
    frontendConvertResult: '',
    keepHeader: false,
    nore: false,
    synMitm: false,
    noNtf: false,
    jqEnabled: true,
    frontendConvert: false,
    sni: '',
    pm: '',
    wrap_response: false,
    jsDelivr: false,
    compatibilityOnly: false,
    env: "${$.getEnv() || ''}",
    editMode: false,
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

  const params = [ 'headers', 'n', 'type', 'target', 'x', 'y', 'hnadd', 'hndel', 'hnregdel', 'jsc', 'jsc2', 'cron', 'cronexp', 'njsname', 'njsnametarget', 'timeoutt', 'timeoutv', 'enginet', 'enginev', 'policy', 'arg', 'argv', 'tiles', 'tcolor', 'cachexp', 'nocache', 'del', 'nore', 'synMitm', 'noNtf','jqEnabled', 'wrap_response', 'compatibilityOnly', 'evalScriptori', 'evalScriptmodi', 'evalUrlmodi', 'evalUrlori', 'evJsori', 'evJsmodi', 'evUrlori', 'evUrlmodi','prepend', 'keepHeader', 'jsDelivr', 'sni', 'pm', 'localtext', 'icon', 'category']
  
  init.editMode = location.pathname.indexOf('/edit') === 0

  const href = location.href;
  
  
  const startStr = href.split('/edit/_start_/')[1]
  if(startStr) {
    const endArray = startStr.split('/_end_/')
    if (endArray) {
      const src = endArray[0]
      if(src) {
        init.src = decodeURIComponent(src)
      }
      const filenameStr = endArray[1]
      if(filenameStr) {
        const fullnameArray = filenameStr.split('?')
        if (fullnameArray) {
          const fullname = fullnameArray[0]
          if(fullname) {
            init.filename = decodeURIComponent(fullname.substring(0, fullname.lastIndexOf('.')))
          }
          const searchStr = filenameStr.substring(filenameStr.lastIndexOf('?')+1)
          if (searchStr) {
            const urlParams = new URLSearchParams("?" + searchStr);

            params.forEach(i => {
              const param = urlParams.get(i)

              if (param != null && param !== '' && param !== false) {
                if (i === 'jsc' && param === '.') {
                  init.jsc_all = true
                } else if (i === 'jsc2' && param === '.') {
                  init.jsc2_all = true
                } else {
                  init[i] = param
                }
                
              }
            })
          }
          if(fullname && init.target === 'plain-text') {
            init.filename = fullname
          }
          
        }
      }
    }
  }

  if (init.localtext) {
    init.inputType = 'local-text'
  } else {
    init.inputType = 'remote-url'
  }

  console.log("init", init)

  const envDom = document.createElement("small");
  envDom.textContent = "运行环境: " + init.env;

  document.querySelector('footer').appendChild(envDom);

  createApp({
    data() {
      return { ...init }
    },
    methods: {
      reset(){
        const initData = { ...init }
        this.resetInfo = '已重置'
        Object.keys(initData).map(key => {
          if (key !== 'type' && key !== 'target' && key !== 'resetInfo') {
            this[key] = initData[key]
          }
        })
        
        setTimeout(() => {
          this.resetInfo = ''
        }, 1000)
      },
      copy(){
        const copyText = document.getElementById(this.frontendConvert ? "frontendConvertResult" : "result");
        copyText.select();
        copyText.setSelectionRange(0, 99999); // For mobile devices
        // navigator.clipboard.writeText(copyText.value);
        document.execCommand("copy");
        this.copyInfo = '成功'
        setTimeout(() => {
          this.copyInfo = ''
        }, 2000)
        // if (this.isHttps) {
        //   alert("✅ 已复制");
        // }
      },
      autoResize(refName) {
        const el = this.$refs[refName]
        if (el) {
          el.style.height = 'auto'
          el.style.height = Math.min(el.scrollHeight, 500) + 'px'
        }
      },
    },
    watch: {
      async result(v) {
        try {
          const { scriptMap, rewriteParser, ruleParser } = "__SCRIPT__"
          let $request = {
            method: 'GET',
            headers: {},
            url: v,
          }
          const $notification = {
            post: (...arg) => {
              console.log(...arg)
            }
          }
          const $done = res => {
            console.log(res.response.body)
            this.frontendConvertResult = res.response.body
          }
          eval(rewriteParser)
        } catch (e) {
          console.error(e)
        }
      },
      type(v) {
        if(v === 'rule-set' && !this.target.endsWith('rule-set')){
          // this.target='rule-set'
          if (this.env === 'Surge') {
            this.target = 'surge-rule-set'
          } else if (this.env === 'Loon') {
            this.target = 'loon-rule-set'
          } else if (this.env === 'Stash') {
            this.target = 'stash-rule-set'
          } else if (this.env === 'Shadowrocket') {
            this.target = 'shadowrocket-rule-set'
          } else {
            this.target=''
          }
        } else if(v !== 'rule-set' && this.target.endsWith('rule-set')){
          this.target=''
        } else if(v.endsWith('-script') && !this.target.endsWith('-script')){
          // this.target='surge-script'
          if (this.env === 'Surge') {
            this.target = 'surge-script'
          } else if (this.env === 'Loon') {
            this.target = 'loon-script'
          } else if (this.env === 'Stash') {
            this.target = 'stash-script'
          } else if (this.env === 'Shadowrocket') {
            this.target = 'shadowrocket-script'
          } else {
            this.target=''
          }
        } else if(!v.endsWith('-script') && this.target.endsWith('-script')){
          this.target=''
        } else if(v === 'plain-text' && this.target !== 'plain-text'){
          this.target='plain-text'
        } else if(v !== 'plain-text' && this.target === 'plain-text'){
          this.target=''
        } 
      },
      target(v) {
        if(v.endsWith('rule-set') && this.type !== 'rule-set'){
          this.type='rule-set'
        } else if(v.endsWith('-script') && !this.type.endsWith('-script')){
          // this.type='qx-script'
          if (this.env === 'Surge') {
            this.type = 'surge-script'
          } else if (this.env === 'Loon') {
            this.type = 'loon-script'
          } else if (this.env === 'Stash') {
            this.type = 'stash-script'
          } else if (this.env === 'Shadowrocket') {
            this.type = 'shadowrocket-script'
          } else {
            this.type=''
          }
        } else if(v === 'plain-text' && this.type !== 'plain-text'){
          this.type='plain-text'
        }
      },
      inputType() {
        this.$nextTick(() => {
          this.autoResize(this.inputType === 'local-text' ? 'textTextarea' : 'srcTextarea')
        })
      },
  },
    computed: {
      frontendConvertDisabled: function () {
        return !/^Node\.js/i.test(init.env)
      },
      result: function () {
        if (this.src && this.src.startsWith('https://quantumult.app/x/open-app/add-resource')) {
          return '⚠️⚠️⚠️ 你填入的是 QX 导入链接. 请安装 https://t.me/h5683577/211 然后在浏览器中预览资源 分别转换规则集和重写'
        }
        if (this.src && this.src.startsWith('https://www.nsloon.com/')) {
          return '⚠️⚠️⚠️ 你填入的是 Loon 导入链接. 请自行提取资源文件链接填入. 一般是类似 https://www.nsloon.com/openloon/import?plugin= 后面的部分(可能需要 URL 解码)'
        }
				const fields = {}
        if (this.jsc_all) {
          fields.jsc = '.'
        }
        if (this.jsc2_all) {
          fields.jsc2 = '.'
        }
        
        params.forEach(field => {
         if (this[field]!==''&&this[field]!==false) {
            fields[field] = this[field]
          }
        })

        const type = this.types.find(i => i.value === this.type)
        const target = this.targets.find(i => i.value === this.target)
        let src = this.src
        if (this.inputType === 'local-text') {
          if (this.localtext) {
            src = 'http://local.text'
          } else {
            return ''
          }
        } else {
          delete fields.localtext
        }
        if (src && target && type) {
          const suffix = target.suffix || ''
          const pathType = (this.target.endsWith('-script') || this.target === 'plain-text') ? 'convert' : 'file'
        
          const plainUrl = src.split('?')[0]
          const plainUrlFilename = plainUrl.substring(plainUrl.lastIndexOf('/') + 1)

          let filename = this.filename || (this.target === 'plain-text' ? plainUrlFilename : plainUrlFilename.split('.')[0])
          if (!filename) {
            filename = 'untitled-' + Date.now()
          }

          return this.baseUrl + pathType + '/_start_/' + src.replace(/#.*$/, '').replace(/😂/g, '%F0%9F%98%82') + '/_end_/' + encodeURIComponent(filename) + suffix + '?' + Object.keys(fields).map(i => i + '=' + encodeURIComponent(fields[i])).join('&')

          // let url = new URL(this.baseUrl + pathType + '/_start_/' + src + '/_end_/' + encodeURIComponent(filename) + suffix)
          
          // Object.keys(fields).map(i => {
          //  url.searchParams.append(i, fields[i])
          // })
          // return url.href
        }

        return ''
        
      },
      previewResult: function () {
        try {
          const array = this.result.split('/_end_/')
          return array[0] + '/_end_/' + array[1].replace('?', '.txt?')
        } catch (e) {
          return ''
        }
      },
      isHttps: function () {
        return location.protocol === 'https:'
      }
    },
    mounted() {
      if (this.editMode) {
        openAllDetails(),
        this.$nextTick(() => {
          this.autoResize('textTextarea')
        })
      }
  }
  }).mount('#app')
</script>
  </body>

</html>
`

const vuelo =
  '{"script":"var Vue=function(e){\\"use strict\\";function t(e,t){const n=Object.create(null);const o=e.split(\\",\\");for(let e=0;e<o.length;e++){n[o[e]]=true}return t?e=>!!n[e.toLowerCase()]:e=>!!n[e]}const n=Object.freeze({});const o=Object.freeze([]);const s=()=>{};const r=()=>false;const i=/^on[^a-z]/;const l=e=>i.test(e);const c=e=>e.startsWith(\\"onUpdate:\\");const a=Object.assign;const f=(e,t)=>{const n=e.indexOf(t);if(n>-1){e.splice(n,1)}};const u=Object.prototype.hasOwnProperty;const p=(e,t)=>u.call(e,t);const d=Array.isArray;const h=e=>k(e)===\\"[object Map]\\";const m=e=>k(e)===\\"[object Set]\\";const g=e=>k(e)===\\"[object Date]\\";const y=e=>k(e)===\\"[object RegExp]\\";const v=e=>typeof e===\\"function\\";const b=e=>typeof e===\\"string\\";const _=e=>typeof e===\\"symbol\\";const w=e=>e!==null&&typeof e===\\"object\\";const x=e=>w(e)&&v(e.then)&&v(e.catch);const S=Object.prototype.toString;const k=e=>S.call(e);const C=e=>k(e).slice(8,-1);const $=e=>k(e)===\\"[object Object]\\";const T=e=>b(e)&&e!==\\"NaN\\"&&e[0]!==\\"-\\"&&\\"\\"+parseInt(e,10)===e;const E=t(\\",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted\\");const N=t(\\"bind,cloak,else-if,else,for,html,if,model,on,once,pre,show,slot,text,memo\\");const O=e=>{const t=Object.create(null);return n=>{const o=t[n];return o||(t[n]=e(n))}};const A=/-(\\\\w)/g;const R=O((e=>e.replace(A,((e,t)=>t?t.toUpperCase():\\"\\"))));const P=/\\\\B([A-Z])/g;const I=O((e=>e.replace(P,\\"-$1\\").toLowerCase()));const M=O((e=>e.charAt(0).toUpperCase()+e.slice(1)));const F=O((e=>e?`on${M(e)}`:``));const j=(e,t)=>!Object.is(e,t);const V=(e,t)=>{for(let n=0;n<e.length;n++){e[n](t)}};const L=(e,t,n)=>{Object.defineProperty(e,t,{configurable:true,enumerable:false,value:n})};const B=e=>{const t=parseFloat(e);return isNaN(t)?e:t};const U=e=>{const t=b(e)?Number(e):NaN;return isNaN(t)?e:t};let D;const H=()=>D||(D=typeof globalThis!==\\"undefined\\"?globalThis:typeof self!==\\"undefined\\"?self:typeof window!==\\"undefined\\"?window:typeof global!==\\"undefined\\"?global:{});const W={[1]:`TEXT`,[2]:`CLASS`,[4]:`STYLE`,[8]:`PROPS`,[16]:`FULL_PROPS`,[32]:`HYDRATE_EVENTS`,[64]:`STABLE_FRAGMENT`,[128]:`KEYED_FRAGMENT`,[256]:`UNKEYED_FRAGMENT`,[512]:`NEED_PATCH`,[1024]:`DYNAMIC_SLOTS`,[2048]:`DEV_ROOT_FRAGMENT`,[-1]:`HOISTED`,[-2]:`BAIL`};const z={[1]:\\"STABLE\\",[2]:\\"DYNAMIC\\",[3]:\\"FORWARDED\\"};const K=\\"Infinity,undefined,NaN,isFinite,isNaN,parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,BigInt,console\\";const G=t(K);const J=2;function q(e,t=0,n=e.length){let o=e.split(/(\\\\r?\\\\n)/);const s=o.filter(((e,t)=>t%2===1));o=o.filter(((e,t)=>t%2===0));let r=0;const i=[];for(let e=0;e<o.length;e++){r+=o[e].length+(s[e]&&s[e].length||0);if(r>=t){for(let l=e-J;l<=e+J||n>r;l++){if(l<0||l>=o.length)continue;const c=l+1;i.push(`${c}${\\" \\".repeat(Math.max(3-String(c).length,0))}|  ${o[l]}`);const a=o[l].length;const f=s[l]&&s[l].length||0;if(l===e){const e=t-(r-(a+f));const o=Math.max(1,n>r?a-e:n-t);i.push(`   |  `+\\" \\".repeat(e)+\\"^\\".repeat(o))}else if(l>e){if(n>r){const e=Math.max(Math.min(n-r,a),1);i.push(`   |  `+\\"^\\".repeat(e))}r+=a+f}}break}}return i.join(\\"\\\\n\\")}function Y(e){if(d(e)){const t={};for(let n=0;n<e.length;n++){const o=e[n];const s=b(o)?ee(o):Y(o);if(s){for(const e in s){t[e]=s[e]}}}return t}else if(b(e)){return e}else if(w(e)){return e}}const Z=/;(?![^(]*\\\\))/g;const X=/:([^]+)/;const Q=/\\\\/\\\\*[^]*?\\\\*\\\\//g;function ee(e){const t={};e.replace(Q,\\"\\").split(Z).forEach((e=>{if(e){const n=e.split(X);n.length>1&&(t[n[0].trim()]=n[1].trim())}}));return t}function te(e){let t=\\"\\";if(b(e)){t=e}else if(d(e)){for(let n=0;n<e.length;n++){const o=te(e[n]);if(o){t+=o+\\" \\"}}}else if(w(e)){for(const n in e){if(e[n]){t+=n+\\" \\"}}}return t.trim()}function ne(e){if(!e)return null;let{class:t,style:n}=e;if(t&&!b(t)){e.class=te(t)}if(n){e.style=Y(n)}return e}const oe=\\"html,body,base,head,link,meta,style,title,address,article,aside,footer,header,hgroup,h1,h2,h3,h4,h5,h6,nav,section,div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,ruby,s,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,embed,object,param,source,canvas,script,noscript,del,ins,caption,col,colgroup,table,thead,tbody,td,th,tr,button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,output,progress,select,textarea,details,dialog,menu,summary,template,blockquote,iframe,tfoot\\";const se=\\"svg,animate,animateMotion,animateTransform,circle,clipPath,color-profile,defs,desc,discard,ellipse,feBlend,feColorMatrix,feComponentTransfer,feComposite,feConvolveMatrix,feDiffuseLighting,feDisplacementMap,feDistantLight,feDropShadow,feFlood,feFuncA,feFuncB,feFuncG,feFuncR,feGaussianBlur,feImage,feMerge,feMergeNode,feMorphology,feOffset,fePointLight,feSpecularLighting,feSpotLight,feTile,feTurbulence,filter,foreignObject,g,hatch,hatchpath,image,line,linearGradient,marker,mask,mesh,meshgradient,meshpatch,meshrow,metadata,mpath,path,pattern,polygon,polyline,radialGradient,rect,set,solidcolor,stop,switch,symbol,text,textPath,title,tspan,unknown,use,view\\";const re=\\"area,base,br,col,embed,hr,img,input,link,meta,param,source,track,wbr\\";const ie=t(oe);const le=t(se);const ce=t(re);const ae=`itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly`;const fe=t(ae);function ue(e){return!!e||e===\\"\\"}function pe(e,t){if(e.length!==t.length)return false;let n=true;for(let o=0;n&&o<e.length;o++){n=de(e[o],t[o])}return n}function de(e,t){if(e===t)return true;let n=g(e);let o=g(t);if(n||o){return n&&o?e.getTime()===t.getTime():false}n=_(e);o=_(t);if(n||o){return e===t}n=d(e);o=d(t);if(n||o){return n&&o?pe(e,t):false}n=w(e);o=w(t);if(n||o){if(!n||!o){return false}const s=Object.keys(e).length;const r=Object.keys(t).length;if(s!==r){return false}for(const n in e){const o=e.hasOwnProperty(n);const s=t.hasOwnProperty(n);if(o&&!s||!o&&s||!de(e[n],t[n])){return false}}}return String(e)===String(t)}function he(e,t){return e.findIndex((e=>de(e,t)))}const me=e=>b(e)?e:e==null?\\"\\":d(e)||w(e)&&(e.toString===S||!v(e.toString))?JSON.stringify(e,ge,2):String(e);const ge=(e,t)=>{if(t&&t.__v_isRef){return ge(e,t.value)}else if(h(t)){return{[`Map(${t.size})`]:[...t.entries()].reduce(((e,[t,n])=>{e[`${t} =>`]=n;return e}),{})}}else if(m(t)){return{[`Set(${t.size})`]:[...t.values()]}}else if(w(t)&&!d(t)&&!$(t)){return String(t)}return t};function ye(e,...t){console.warn(`[Vue warn] ${e}`,...t)}let ve;class be{constructor(e=false){this.detached=e;this._active=true;this.effects=[];this.cleanups=[];this.parent=ve;if(!e&&ve){this.index=(ve.scopes||(ve.scopes=[])).push(this)-1}}get active(){return this._active}run(e){if(this._active){const t=ve;try{ve=this;return e()}finally{ve=t}}else{ye(`cannot run an inactive effect scope.`)}}on(){ve=this}off(){ve=this.parent}stop(e){if(this._active){let t,n;for(t=0,n=this.effects.length;t<n;t++){this.effects[t].stop()}for(t=0,n=this.cleanups.length;t<n;t++){this.cleanups[t]()}if(this.scopes){for(t=0,n=this.scopes.length;t<n;t++){this.scopes[t].stop(true)}}if(!this.detached&&this.parent&&!e){const e=this.parent.scopes.pop();if(e&&e!==this){this.parent.scopes[this.index]=e;e.index=this.index}}this.parent=void 0;this._active=false}}}function _e(e){return new be(e)}function we(e,t=ve){if(t&&t.active){t.effects.push(e)}}function xe(){return ve}function Se(e){if(ve){ve.cleanups.push(e)}else{ye(`onScopeDispose() is called when there is no active effect scope to be associated with.`)}}const ke=e=>{const t=new Set(e);t.w=0;t.n=0;return t};const Ce=e=>(e.w&Ae)>0;const $e=e=>(e.n&Ae)>0;const Te=({deps:e})=>{if(e.length){for(let t=0;t<e.length;t++){e[t].w|=Ae}}};const Ee=e=>{const{deps:t}=e;if(t.length){let n=0;for(let o=0;o<t.length;o++){const s=t[o];if(Ce(s)&&!$e(s)){s.delete(e)}else{t[n++]=s}s.w&=~Ae;s.n&=~Ae}t.length=n}};const Ne=new WeakMap;let Oe=0;let Ae=1;const Re=30;let Pe;const Ie=Symbol(\\"iterate\\");const Me=Symbol(\\"Map key iterate\\");class Fe{constructor(e,t=null,n){this.fn=e;this.scheduler=t;this.active=true;this.deps=[];this.parent=void 0;we(this,n)}run(){if(!this.active){return this.fn()}let e=Pe;let t=Be;while(e){if(e===this){return}e=e.parent}try{this.parent=Pe;Pe=this;Be=true;Ae=1<<++Oe;if(Oe<=Re){Te(this)}else{je(this)}return this.fn()}finally{if(Oe<=Re){Ee(this)}Ae=1<<--Oe;Pe=this.parent;Be=t;this.parent=void 0;if(this.deferStop){this.stop()}}}stop(){if(Pe===this){this.deferStop=true}else if(this.active){je(this);if(this.onStop){this.onStop()}this.active=false}}}function je(e){const{deps:t}=e;if(t.length){for(let n=0;n<t.length;n++){t[n].delete(e)}t.length=0}}function Ve(e,t){if(e.effect){e=e.effect.fn}const n=new Fe(e);if(t){a(n,t);if(t.scope)we(n,t.scope)}if(!t||!t.lazy){n.run()}const o=n.run.bind(n);o.effect=n;return o}function Le(e){e.effect.stop()}let Be=true;const Ue=[];function De(){Ue.push(Be);Be=false}function He(){const e=Ue.pop();Be=e===void 0?true:e}function We(e,t,n){if(Be&&Pe){let o=Ne.get(e);if(!o){Ne.set(e,o=new Map)}let s=o.get(n);if(!s){o.set(n,s=ke())}const r={effect:Pe,target:e,type:t,key:n};ze(s,r)}}function ze(e,t){let n=false;if(Oe<=Re){if(!$e(e)){e.n|=Ae;n=!Ce(e)}}else{n=!e.has(Pe)}if(n){e.add(Pe);Pe.deps.push(e);if(Pe.onTrack){Pe.onTrack(a({effect:Pe},t))}}}function Ke(e,t,n,o,s,r){const i=Ne.get(e);if(!i){return}let l=[];if(t===\\"clear\\"){l=[...i.values()]}else if(n===\\"length\\"&&d(e)){const e=Number(o);i.forEach(((t,n)=>{if(n===\\"length\\"||n>=e){l.push(t)}}))}else{if(n!==void 0){l.push(i.get(n))}switch(t){case\\"add\\":if(!d(e)){l.push(i.get(Ie));if(h(e)){l.push(i.get(Me))}}else if(T(n)){l.push(i.get(\\"length\\"))}break;case\\"delete\\":if(!d(e)){l.push(i.get(Ie));if(h(e)){l.push(i.get(Me))}}break;case\\"set\\":if(h(e)){l.push(i.get(Ie))}break}}const c={target:e,type:t,key:n,newValue:o,oldValue:s,oldTarget:r};if(l.length===1){if(l[0]){{Ge(l[0],c)}}}else{const e=[];for(const t of l){if(t){e.push(...t)}}{Ge(ke(e),c)}}}function Ge(e,t){const n=d(e)?e:[...e];for(const e of n){if(e.computed){Je(e,t)}}for(const e of n){if(!e.computed){Je(e,t)}}}function Je(e,t){if(e!==Pe||e.allowRecurse){if(e.onTrigger){e.onTrigger(a({effect:e},t))}if(e.scheduler){e.scheduler()}else{e.run()}}}function qe(e,t){var n;return(n=Ne.get(e))==null?void 0:n.get(t)}const Ye=t(`__proto__,__v_isRef,__isVue`);const Ze=new Set(Object.getOwnPropertyNames(Symbol).filter((e=>e!==\\"arguments\\"&&e!==\\"caller\\")).map((e=>Symbol[e])).filter(_));const Xe=rt();const Qe=rt(false,true);const et=rt(true);const tt=rt(true,true);const nt=ot();function ot(){const e={};[\\"includes\\",\\"indexOf\\",\\"lastIndexOf\\"].forEach((t=>{e[t]=function(...e){const n=en(this);for(let e=0,t=this.length;e<t;e++){We(n,\\"get\\",e+\\"\\")}const o=n[t](...e);if(o===-1||o===false){return n[t](...e.map(en))}else{return o}}}));[\\"push\\",\\"pop\\",\\"shift\\",\\"unshift\\",\\"splice\\"].forEach((t=>{e[t]=function(...e){De();const n=en(this)[t].apply(this,e);He();return n}}));return e}function st(e){const t=en(this);We(t,\\"has\\",e);return t.hasOwnProperty(e)}function rt(e=false,t=false){return function n(o,s,r){if(s===\\"__v_isReactive\\"){return!e}else if(s===\\"__v_isReadonly\\"){return e}else if(s===\\"__v_isShallow\\"){return t}else if(s===\\"__v_raw\\"&&r===(e?t?Dt:Ut:t?Bt:Lt).get(o)){return o}const i=d(o);if(!e){if(i&&p(nt,s)){return Reflect.get(nt,s,r)}if(s===\\"hasOwnProperty\\"){return st}}const l=Reflect.get(o,s,r);if(_(s)?Ze.has(s):Ye(s)){return l}if(!e){We(o,\\"get\\",s)}if(t){return l}if(ln(l)){return i&&T(s)?l:l.value}if(w(l)){return e?Gt(l):zt(l)}return l}}const it=ct();const lt=ct(true);function ct(e=false){return function t(n,o,s,r){let i=n[o];if(Zt(i)&&ln(i)&&!ln(s)){return false}if(!e){if(!Xt(s)&&!Zt(s)){i=en(i);s=en(s)}if(!d(n)&&ln(i)&&!ln(s)){i.value=s;return true}}const l=d(n)&&T(o)?Number(o)<n.length:p(n,o);const c=Reflect.set(n,o,s,r);if(n===en(r)){if(!l){Ke(n,\\"add\\",o,s)}else if(j(s,i)){Ke(n,\\"set\\",o,s,i)}}return c}}function at(e,t){const n=p(e,t);const o=e[t];const s=Reflect.deleteProperty(e,t);if(s&&n){Ke(e,\\"delete\\",t,void 0,o)}return s}function ft(e,t){const n=Reflect.has(e,t);if(!_(t)||!Ze.has(t)){We(e,\\"has\\",t)}return n}function ut(e){We(e,\\"iterate\\",d(e)?\\"length\\":Ie);return Reflect.ownKeys(e)}const pt={get:Xe,set:it,deleteProperty:at,has:ft,ownKeys:ut};const dt={get:et,set(e,t){{ye(`Set operation on key \\"${String(t)}\\" failed: target is readonly.`,e)}return true},deleteProperty(e,t){{ye(`Delete operation on key \\"${String(t)}\\" failed: target is readonly.`,e)}return true}};const ht=a({},pt,{get:Qe,set:lt});const mt=a({},dt,{get:tt});const gt=e=>e;const yt=e=>Reflect.getPrototypeOf(e);function vt(e,t,n=false,o=false){e=e[\\"__v_raw\\"];const s=en(e);const r=en(t);if(!n){if(t!==r){We(s,\\"get\\",t)}We(s,\\"get\\",r)}const{has:i}=yt(s);const l=o?gt:n?on:nn;if(i.call(s,t)){return l(e.get(t))}else if(i.call(s,r)){return l(e.get(r))}else if(e!==s){e.get(t)}}function bt(e,t=false){const n=this[\\"__v_raw\\"];const o=en(n);const s=en(e);if(!t){if(e!==s){We(o,\\"has\\",e)}We(o,\\"has\\",s)}return e===s?n.has(e):n.has(e)||n.has(s)}function _t(e,t=false){e=e[\\"__v_raw\\"];!t&&We(en(e),\\"iterate\\",Ie);return Reflect.get(e,\\"size\\",e)}function wt(e){e=en(e);const t=en(this);const n=yt(t);const o=n.has.call(t,e);if(!o){t.add(e);Ke(t,\\"add\\",e,e)}return this}function xt(e,t){t=en(t);const n=en(this);const{has:o,get:s}=yt(n);let r=o.call(n,e);if(!r){e=en(e);r=o.call(n,e)}else{Vt(n,o,e)}const i=s.call(n,e);n.set(e,t);if(!r){Ke(n,\\"add\\",e,t)}else if(j(t,i)){Ke(n,\\"set\\",e,t,i)}return this}function St(e){const t=en(this);const{has:n,get:o}=yt(t);let s=n.call(t,e);if(!s){e=en(e);s=n.call(t,e)}else{Vt(t,n,e)}const r=o?o.call(t,e):void 0;const i=t.delete(e);if(s){Ke(t,\\"delete\\",e,void 0,r)}return i}function kt(){const e=en(this);const t=e.size!==0;const n=h(e)?new Map(e):new Set(e);const o=e.clear();if(t){Ke(e,\\"clear\\",void 0,void 0,n)}return o}function Ct(e,t){return function n(o,s){const r=this;const i=r[\\"__v_raw\\"];const l=en(i);const c=t?gt:e?on:nn;!e&&We(l,\\"iterate\\",Ie);return i.forEach(((e,t)=>o.call(s,c(e),c(t),r)))}}function $t(e,t,n){return function(...o){const s=this[\\"__v_raw\\"];const r=en(s);const i=h(r);const l=e===\\"entries\\"||e===Symbol.iterator&&i;const c=e===\\"keys\\"&&i;const a=s[e](...o);const f=n?gt:t?on:nn;!t&&We(r,\\"iterate\\",c?Me:Ie);return{next(){const{value:e,done:t}=a.next();return t?{value:e,done:t}:{value:l?[f(e[0]),f(e[1])]:f(e),done:t}},[Symbol.iterator](){return this}}}}function Tt(e){return function(...t){{const n=t[0]?`on key \\"${t[0]}\\" `:``;console.warn(`${M(e)} operation ${n}failed: target is readonly.`,en(this))}return e===\\"delete\\"?false:this}}function Et(){const e={get(e){return vt(this,e)},get size(){return _t(this)},has:bt,add:wt,set:xt,delete:St,clear:kt,forEach:Ct(false,false)};const t={get(e){return vt(this,e,false,true)},get size(){return _t(this)},has:bt,add:wt,set:xt,delete:St,clear:kt,forEach:Ct(false,true)};const n={get(e){return vt(this,e,true)},get size(){return _t(this,true)},has(e){return bt.call(this,e,true)},add:Tt(\\"add\\"),set:Tt(\\"set\\"),delete:Tt(\\"delete\\"),clear:Tt(\\"clear\\"),forEach:Ct(true,false)};const o={get(e){return vt(this,e,true,true)},get size(){return _t(this,true)},has(e){return bt.call(this,e,true)},add:Tt(\\"add\\"),set:Tt(\\"set\\"),delete:Tt(\\"delete\\"),clear:Tt(\\"clear\\"),forEach:Ct(true,true)};const s=[\\"keys\\",\\"values\\",\\"entries\\",Symbol.iterator];s.forEach((s=>{e[s]=$t(s,false,false);n[s]=$t(s,true,false);t[s]=$t(s,false,true);o[s]=$t(s,true,true)}));return[e,n,t,o]}const[Nt,Ot,At,Rt]=Et();function Pt(e,t){const n=t?e?Rt:At:e?Ot:Nt;return(t,o,s)=>{if(o===\\"__v_isReactive\\"){return!e}else if(o===\\"__v_isReadonly\\"){return e}else if(o===\\"__v_raw\\"){return t}return Reflect.get(p(n,o)&&o in t?n:t,o,s)}}const It={get:Pt(false,false)};const Mt={get:Pt(false,true)};const Ft={get:Pt(true,false)};const jt={get:Pt(true,true)};function Vt(e,t,n){const o=en(n);if(o!==n&&t.call(e,o)){const t=C(e);console.warn(`Reactive ${t} contains both the raw and reactive versions of the same object${t===`Map`?` as keys`:``}, which can lead to inconsistencies. Avoid differentiating between the raw and reactive versions of an object and only use the reactive version if possible.`)}}const Lt=new WeakMap;const Bt=new WeakMap;const Ut=new WeakMap;const Dt=new WeakMap;function Ht(e){switch(e){case\\"Object\\":case\\"Array\\":return 1;case\\"Map\\":case\\"Set\\":case\\"WeakMap\\":case\\"WeakSet\\":return 2;default:return 0}}function Wt(e){return e[\\"__v_skip\\"]||!Object.isExtensible(e)?0:Ht(C(e))}function zt(e){if(Zt(e)){return e}return qt(e,false,pt,It,Lt)}function Kt(e){return qt(e,false,ht,Mt,Bt)}function Gt(e){return qt(e,true,dt,Ft,Ut)}function Jt(e){return qt(e,true,mt,jt,Dt)}function qt(e,t,n,o,s){if(!w(e)){{console.warn(`value cannot be made reactive: ${String(e)}`)}return e}if(e[\\"__v_raw\\"]&&!(t&&e[\\"__v_isReactive\\"])){return e}const r=s.get(e);if(r){return r}const i=Wt(e);if(i===0){return e}const l=new Proxy(e,i===2?o:n);s.set(e,l);return l}function Yt(e){if(Zt(e)){return Yt(e[\\"__v_raw\\"])}return!!(e&&e[\\"__v_isReactive\\"])}function Zt(e){return!!(e&&e[\\"__v_isReadonly\\"])}function Xt(e){return!!(e&&e[\\"__v_isShallow\\"])}function Qt(e){return Yt(e)||Zt(e)}function en(e){const t=e&&e[\\"__v_raw\\"];return t?en(t):e}function tn(e){L(e,\\"__v_skip\\",true);return e}const nn=e=>w(e)?zt(e):e;const on=e=>w(e)?Gt(e):e;function sn(e){if(Be&&Pe){e=en(e);{ze(e.dep||(e.dep=ke()),{target:e,type:\\"get\\",key:\\"value\\"})}}}function rn(e,t){e=en(e);const n=e.dep;if(n){{Ge(n,{target:e,type:\\"set\\",key:\\"value\\",newValue:t})}}}function ln(e){return!!(e&&e.__v_isRef===true)}function cn(e){return fn(e,false)}function an(e){return fn(e,true)}function fn(e,t){if(ln(e)){return e}return new un(e,t)}class un{constructor(e,t){this.__v_isShallow=t;this.dep=void 0;this.__v_isRef=true;this._rawValue=t?e:en(e);this._value=t?e:nn(e)}get value(){sn(this);return this._value}set value(e){const t=this.__v_isShallow||Xt(e)||Zt(e);e=t?e:en(e);if(j(e,this._rawValue)){this._rawValue=e;this._value=t?e:nn(e);rn(this,e)}}}function pn(e){rn(e,e.value)}function dn(e){return ln(e)?e.value:e}function hn(e){return v(e)?e():dn(e)}const mn={get:(e,t,n)=>dn(Reflect.get(e,t,n)),set:(e,t,n,o)=>{const s=e[t];if(ln(s)&&!ln(n)){s.value=n;return true}else{return Reflect.set(e,t,n,o)}}};function gn(e){return Yt(e)?e:new Proxy(e,mn)}class yn{constructor(e){this.dep=void 0;this.__v_isRef=true;const{get:t,set:n}=e((()=>sn(this)),(()=>rn(this)));this._get=t;this._set=n}get value(){return this._get()}set value(e){this._set(e)}}function vn(e){return new yn(e)}function bn(e){if(!Qt(e)){console.warn(`toRefs() expects a reactive object but received a plain one.`)}const t=d(e)?new Array(e.length):{};for(const n in e){t[n]=Sn(e,n)}return t}class _n{constructor(e,t,n){this._object=e;this._key=t;this._defaultValue=n;this.__v_isRef=true}get value(){const e=this._object[this._key];return e===void 0?this._defaultValue:e}set value(e){this._object[this._key]=e}get dep(){return qe(en(this._object),this._key)}}class wn{constructor(e){this._getter=e;this.__v_isRef=true;this.__v_isReadonly=true}get value(){return this._getter()}}function xn(e,t,n){if(ln(e)){return e}else if(v(e)){return new wn(e)}else if(w(e)&&arguments.length>1){return Sn(e,t,n)}else{return cn(e)}}function Sn(e,t,n){const o=e[t];return ln(o)?o:new _n(e,t,n)}class kn{constructor(e,t,n,o){this._setter=t;this.dep=void 0;this.__v_isRef=true;this[\\"__v_isReadonly\\"]=false;this._dirty=true;this.effect=new Fe(e,(()=>{if(!this._dirty){this._dirty=true;rn(this)}}));this.effect.computed=this;this.effect.active=this._cacheable=!o;this[\\"__v_isReadonly\\"]=n}get value(){const e=en(this);sn(e);if(e._dirty||!e._cacheable){e._dirty=false;e._value=e.effect.run()}return e._value}set value(e){this._setter(e)}}function Cn(e,t,n=false){let o;let s;const r=v(e);if(r){o=e;s=()=>{console.warn(\\"Write operation failed: computed value is readonly\\")}}else{o=e.get;s=e.set}const i=new kn(o,s,r||!s,n);if(t&&!n){i.effect.onTrack=t.onTrack;i.effect.onTrigger=t.onTrigger}return i}const $n=[];function Tn(e){$n.push(e)}function En(){$n.pop()}function Nn(e,...t){De();const n=$n.length?$n[$n.length-1].component:null;const o=n&&n.appContext.config.warnHandler;const s=On();if(o){jn(o,n,11,[e+t.join(\\"\\"),n&&n.proxy,s.map((({vnode:e})=>`at <${Cc(n,e.type)}>`)).join(\\"\\\\n\\"),s])}else{const n=[`[Vue warn]: ${e}`,...t];if(s.length&&true){n.push(`\\\\n`,...An(s))}console.warn(...n)}He()}function On(){let e=$n[$n.length-1];if(!e){return[]}const t=[];while(e){const n=t[0];if(n&&n.vnode===e){n.recurseCount++}else{t.push({vnode:e,recurseCount:0})}const o=e.component&&e.component.parent;e=o&&o.vnode}return t}function An(e){const t=[];e.forEach(((e,n)=>{t.push(...n===0?[]:[`\\\\n`],...Rn(e))}));return t}function Rn({vnode:e,recurseCount:t}){const n=t>0?`... (${t} recursive calls)`:``;const o=e.component?e.component.parent==null:false;const s=` at <${Cc(e.component,e.type,o)}`;const r=`>`+n;return e.props?[s,...Pn(e.props),r]:[s+r]}function Pn(e){const t=[];const n=Object.keys(e);n.slice(0,3).forEach((n=>{t.push(...In(n,e[n]))}));if(n.length>3){t.push(` ...`)}return t}function In(e,t,n){if(b(t)){t=JSON.stringify(t);return n?t:[`${e}=${t}`]}else if(typeof t===\\"number\\"||typeof t===\\"boolean\\"||t==null){return n?t:[`${e}=${t}`]}else if(ln(t)){t=In(e,en(t.value),true);return n?t:[`${e}=Ref<`,t,`>`]}else if(v(t)){return[`${e}=fn${t.name?`<${t.name}>`:``}`]}else{t=en(t);return n?t:[`${e}=`,t]}}function Mn(e,t){if(e===void 0){return}else if(typeof e!==\\"number\\"){Nn(`${t} is not a valid number - got ${JSON.stringify(e)}.`)}else if(isNaN(e)){Nn(`${t} is NaN - the duration expression might be incorrect.`)}}const Fn={[\\"sp\\"]:\\"serverPrefetch hook\\",[\\"bc\\"]:\\"beforeCreate hook\\",[\\"c\\"]:\\"created hook\\",[\\"bm\\"]:\\"beforeMount hook\\",[\\"m\\"]:\\"mounted hook\\",[\\"bu\\"]:\\"beforeUpdate hook\\",[\\"u\\"]:\\"updated\\",[\\"bum\\"]:\\"beforeUnmount hook\\",[\\"um\\"]:\\"unmounted hook\\",[\\"a\\"]:\\"activated hook\\",[\\"da\\"]:\\"deactivated hook\\",[\\"ec\\"]:\\"errorCaptured hook\\",[\\"rtc\\"]:\\"renderTracked hook\\",[\\"rtg\\"]:\\"renderTriggered hook\\",[0]:\\"setup function\\",[1]:\\"render function\\",[2]:\\"watcher getter\\",[3]:\\"watcher callback\\",[4]:\\"watcher cleanup function\\",[5]:\\"native event handler\\",[6]:\\"component event handler\\",[7]:\\"vnode hook\\",[8]:\\"directive hook\\",[9]:\\"transition hook\\",[10]:\\"app errorHandler\\",[11]:\\"app warnHandler\\",[12]:\\"ref function\\",[13]:\\"async component loader\\",[14]:\\"scheduler flush. This is likely a Vue internals bug. Please open an issue at https://new-issue.vuejs.org/?repo=vuejs/core\\"};function jn(e,t,n,o){let s;try{s=o?e(...o):e()}catch(e){Ln(e,t,n)}return s}function Vn(e,t,n,o){if(v(e)){const s=jn(e,t,n,o);if(s&&x(s)){s.catch((e=>{Ln(e,t,n)}))}return s}const s=[];for(let r=0;r<e.length;r++){s.push(Vn(e[r],t,n,o))}return s}function Ln(e,t,n,o=true){const s=t?t.vnode:null;if(t){let o=t.parent;const s=t.proxy;const r=Fn[n];while(o){const t=o.ec;if(t){for(let n=0;n<t.length;n++){if(t[n](e,s,r)===false){return}}}o=o.parent}const i=t.appContext.config.errorHandler;if(i){jn(i,null,10,[e,s,r]);return}}Bn(e,n,s,o)}function Bn(e,t,n,o=true){{const s=Fn[t];if(n){Tn(n)}Nn(`Unhandled error${s?` during execution of ${s}`:``}`);if(n){En()}if(o){throw e}else{console.error(e)}}}let Un=false;let Dn=false;const Hn=[];let Wn=0;const zn=[];let Kn=null;let Gn=0;const Jn=Promise.resolve();let qn=null;const Yn=100;function Zn(e){const t=qn||Jn;return e?t.then(this?e.bind(this):e):t}function Xn(e){let t=Wn+1;let n=Hn.length;while(t<n){const o=t+n>>>1;const s=ro(Hn[o]);s<e?t=o+1:n=o}return t}function Qn(e){if(!Hn.length||!Hn.includes(e,Un&&e.allowRecurse?Wn+1:Wn)){if(e.id==null){Hn.push(e)}else{Hn.splice(Xn(e.id),0,e)}eo()}}function eo(){if(!Un&&!Dn){Dn=true;qn=Jn.then(lo)}}function to(e){const t=Hn.indexOf(e);if(t>Wn){Hn.splice(t,1)}}function no(e){if(!d(e)){if(!Kn||!Kn.includes(e,e.allowRecurse?Gn+1:Gn)){zn.push(e)}}else{zn.push(...e)}eo()}function oo(e,t=(Un?Wn+1:0)){{e=e||new Map}for(;t<Hn.length;t++){const n=Hn[t];if(n&&n.pre){if(co(e,n)){continue}Hn.splice(t,1);t--;n()}}}function so(e){if(zn.length){const t=[...new Set(zn)];zn.length=0;if(Kn){Kn.push(...t);return}Kn=t;{e=e||new Map}Kn.sort(((e,t)=>ro(e)-ro(t)));for(Gn=0;Gn<Kn.length;Gn++){if(co(e,Kn[Gn])){continue}Kn[Gn]()}Kn=null;Gn=0}}const ro=e=>e.id==null?Infinity:e.id;const io=(e,t)=>{const n=ro(e)-ro(t);if(n===0){if(e.pre&&!t.pre)return-1;if(t.pre&&!e.pre)return 1}return n};function lo(e){Dn=false;Un=true;{e=e||new Map}Hn.sort(io);const t=t=>co(e,t);try{for(Wn=0;Wn<Hn.length;Wn++){const e=Hn[Wn];if(e&&e.active!==false){if(t(e)){continue}jn(e,null,14)}}}finally{Wn=0;Hn.length=0;so(e);Un=false;qn=null;if(Hn.length||zn.length){lo(e)}}}function co(e,t){if(!e.has(t)){e.set(t,1)}else{const n=e.get(t);if(n>Yn){const e=t.ownerInstance;const n=e&&kc(e.type);Nn(`Maximum recursive updates exceeded${n?` in component <${n}>`:``}. This means you have a reactive effect that is mutating its own dependencies and thus recursively triggering itself. Possible sources include component template, render function, updated hook or watcher source function.`);return true}else{e.set(t,n+1)}}}let ao=false;const fo=new Set;{H().__VUE_HMR_RUNTIME__={createRecord:_o(mo),rerender:_o(yo),reload:_o(vo)}}const uo=new Map;function po(e){const t=e.type.__hmrId;let n=uo.get(t);if(!n){mo(t,e.type);n=uo.get(t)}n.instances.add(e)}function ho(e){uo.get(e.type.__hmrId).instances.delete(e)}function mo(e,t){if(uo.has(e)){return false}uo.set(e,{initialDef:go(t),instances:new Set});return true}function go(e){return $c(e)?e.__vccOpts:e}function yo(e,t){const n=uo.get(e);if(!n){return}n.initialDef.render=t;[...n.instances].forEach((e=>{if(t){e.render=t;go(e.type).render=t}e.renderCache=[];ao=true;e.update();ao=false}))}function vo(e,t){const n=uo.get(e);if(!n)return;t=go(t);bo(n.initialDef,t);const o=[...n.instances];for(const e of o){const o=go(e.type);if(!fo.has(o)){if(o!==n.initialDef){bo(o,t)}fo.add(o)}e.appContext.propsCache.delete(e.type);e.appContext.emitsCache.delete(e.type);e.appContext.optionsCache.delete(e.type);if(e.ceReload){fo.add(o);e.ceReload(t.styles);fo.delete(o)}else if(e.parent){Qn(e.parent.update)}else if(e.appContext.reload){e.appContext.reload()}else if(typeof window!==\\"undefined\\"){window.location.reload()}else{console.warn(\\"[HMR] Root or manually mounted instance modified. Full reload required.\\")}}no((()=>{for(const e of o){fo.delete(go(e.type))}}))}function bo(e,t){a(e,t);for(const n in e){if(n!==\\"__file\\"&&!(n in t)){delete e[n]}}}function _o(e){return(t,n)=>{try{return e(t,n)}catch(e){console.error(e);console.warn(`[HMR] Something went wrong during Vue component hot-reload. Full reload required.`)}}}e.devtools=void 0;let wo=[];let xo=false;function So(t,...n){if(e.devtools){e.devtools.emit(t,...n)}else if(!xo){wo.push({event:t,args:n})}}function ko(t,n){var o,s;e.devtools=t;if(e.devtools){e.devtools.enabled=true;wo.forEach((({event:t,args:n})=>e.devtools.emit(t,...n)));wo=[]}else if(typeof window!==\\"undefined\\"&&window.HTMLElement&&!((s=(o=window.navigator)==null?void 0:o.userAgent)==null?void 0:s.includes(\\"jsdom\\"))){const t=n.__VUE_DEVTOOLS_HOOK_REPLAY__=n.__VUE_DEVTOOLS_HOOK_REPLAY__||[];t.push((e=>{ko(e,n)}));setTimeout((()=>{if(!e.devtools){n.__VUE_DEVTOOLS_HOOK_REPLAY__=null;xo=true;wo=[]}}),3e3)}else{xo=true;wo=[]}}function Co(e,t){So(\\"app:init\\",e,t,{Fragment:yl,Text:vl,Comment:bl,Static:_l})}function $o(e){So(\\"app:unmount\\",e)}const To=Ao(\\"component:added\\");const Eo=Ao(\\"component:updated\\");const No=Ao(\\"component:removed\\");const Oo=t=>{if(e.devtools&&typeof e.devtools.cleanupBuffer===\\"function\\"&&!e.devtools.cleanupBuffer(t)){No(t)}};function Ao(e){return t=>{So(e,t.appContext.app,t.uid,t.parent?t.parent.uid:void 0,t)}}const Ro=Io(\\"perf:start\\");const Po=Io(\\"perf:end\\");function Io(e){return(t,n,o)=>{So(e,t.appContext.app,t.uid,t,n,o)}}function Mo(e,t,n){So(\\"component:emit\\",e.appContext.app,e,t,n)}function Fo(e,t,...o){if(e.isUnmounted)return;const s=e.vnode.props||n;{const{emitsOptions:n,propsOptions:[s]}=e;if(n){if(!(t in n)&&true){if(!s||!(F(t)in s)){Nn(`Component emitted event \\"${t}\\" but it is neither declared in the emits option nor as an \\"${F(t)}\\" prop.`)}}else{const e=n[t];if(v(e)){const n=e(...o);if(!n){Nn(`Invalid event arguments: event validation failed for event \\"${t}\\".`)}}}}}let r=o;const i=t.startsWith(\\"update:\\");const l=i&&t.slice(7);if(l&&l in s){const e=`${l===\\"modelValue\\"?\\"model\\":l}Modifiers`;const{number:t,trim:i}=s[e]||n;if(i){r=o.map((e=>b(e)?e.trim():e))}if(t){r=o.map(B)}}{Mo(e,t,r)}{const n=t.toLowerCase();if(n!==t&&s[F(n)]){Nn(`Event \\"${n}\\" is emitted in component ${Cc(e,e.type)} but the handler is registered for \\"${t}\\". Note that HTML attributes are case-insensitive and you cannot use v-on to listen to camelCase events when using in-DOM templates. You should probably use \\"${I(t)}\\" instead of \\"${t}\\".`)}}let c;let a=s[c=F(t)]||s[c=F(R(t))];if(!a&&i){a=s[c=F(I(t))]}if(a){Vn(a,e,6,r)}const f=s[c+`Once`];if(f){if(!e.emitted){e.emitted={}}else if(e.emitted[c]){return}e.emitted[c]=true;Vn(f,e,6,r)}}function jo(e,t,n=false){const o=t.emitsCache;const s=o.get(e);if(s!==void 0){return s}const r=e.emits;let i={};let l=false;if(!v(e)){const o=e=>{const n=jo(e,t,true);if(n){l=true;a(i,n)}};if(!n&&t.mixins.length){t.mixins.forEach(o)}if(e.extends){o(e.extends)}if(e.mixins){e.mixins.forEach(o)}}if(!r&&!l){if(w(e)){o.set(e,null)}return null}if(d(r)){r.forEach((e=>i[e]=null))}else{a(i,r)}if(w(e)){o.set(e,i)}return i}function Vo(e,t){if(!e||!l(t)){return false}t=t.slice(2).replace(/Once$/,\\"\\");return p(e,t[0].toLowerCase()+t.slice(1))||p(e,I(t))||p(e,t)}let Lo=null;let Bo=null;function Uo(e){const t=Lo;Lo=e;Bo=e&&e.type.__scopeId||null;return t}function Do(e){Bo=e}function Ho(){Bo=null}const Wo=e=>zo;function zo(e,t=Lo,n){if(!t)return e;if(e._n){return e}const o=(...n)=>{if(o._d){$l(-1)}const s=Uo(t);let r;try{r=e(...n)}finally{Uo(s);if(o._d){$l(1)}}{Eo(t)}return r};o._n=true;o._c=true;o._d=true;return o}let Ko=false;function Go(){Ko=true}function Jo(e){const{type:t,vnode:n,proxy:o,withProxy:s,props:r,propsOptions:[i],slots:a,attrs:f,emit:u,render:p,renderCache:d,data:h,setupState:m,ctx:g,inheritAttrs:y}=e;let v;let b;const _=Uo(e);{Ko=false}try{if(n.shapeFlag&4){const e=s||o;v=Gl(p.call(e,e,d,r,m,h,g));b=f}else{const e=t;if(f===r){Go()}v=Gl(e.length>1?e(r,true?{get attrs(){Go();return f},slots:a,emit:u}:{attrs:f,slots:a,emit:u}):e(r,null));b=t.props?f:Zo(f)}}catch(t){wl.length=0;Ln(t,e,1);v=Ll(bl)}let w=v;let x=void 0;if(v.patchFlag>0&&v.patchFlag&2048){[w,x]=qo(v)}if(b&&y!==false){const e=Object.keys(b);const{shapeFlag:t}=w;if(e.length){if(t&(1|6)){if(i&&e.some(c)){b=Xo(b,i)}w=Dl(w,b)}else if(!Ko&&w.type!==bl){const e=Object.keys(f);const t=[];const n=[];for(let o=0,s=e.length;o<s;o++){const s=e[o];if(l(s)){if(!c(s)){t.push(s[2].toLowerCase()+s.slice(3))}}else{n.push(s)}}if(n.length){Nn(`Extraneous non-props attributes (${n.join(\\", \\")}) were passed to component but could not be automatically inherited because component renders fragment or text root nodes.`)}if(t.length){Nn(`Extraneous non-emits event listeners (${t.join(\\", \\")}) were passed to component but could not be automatically inherited because component renders fragment or text root nodes. If the listener is intended to be a component custom event listener only, declare it using the \\"emits\\" option.`)}}}}if(n.dirs){if(!Qo(w)){Nn(`Runtime directive used on component with non-element root node. The directives will not function as intended.`)}w=Dl(w);w.dirs=w.dirs?w.dirs.concat(n.dirs):n.dirs}if(n.transition){if(!Qo(w)){Nn(`Component inside <Transition> renders non-element root node that cannot be animated.`)}w.transition=n.transition}if(x){x(w)}else{v=w}Uo(_);return v}const qo=e=>{const t=e.children;const n=e.dynamicChildren;const o=Yo(t);if(!o){return[e,void 0]}const s=t.indexOf(o);const r=n?n.indexOf(o):-1;const i=o=>{t[s]=o;if(n){if(r>-1){n[r]=o}else if(o.patchFlag>0){e.dynamicChildren=[...n,o]}}};return[Gl(o),i]};function Yo(e){let t;for(let n=0;n<e.length;n++){const o=e[n];if(Ol(o)){if(o.type!==bl||o.children===\\"v-if\\"){if(t){return}else{t=o}}}else{return}}return t}const Zo=e=>{let t;for(const n in e){if(n===\\"class\\"||n===\\"style\\"||l(n)){(t||(t={}))[n]=e[n]}}return t};const Xo=(e,t)=>{const n={};for(const o in e){if(!c(o)||!(o.slice(9)in t)){n[o]=e[o]}}return n};const Qo=e=>e.shapeFlag&(6|1)||e.type===bl;function es(e,t,n){const{props:o,children:s,component:r}=e;const{props:i,children:l,patchFlag:c}=t;const a=r.emitsOptions;if((s||l)&&ao){return true}if(t.dirs||t.transition){return true}if(n&&c>=0){if(c&1024){return true}if(c&16){if(!o){return!!i}return ts(o,i,a)}else if(c&8){const e=t.dynamicProps;for(let t=0;t<e.length;t++){const n=e[t];if(i[n]!==o[n]&&!Vo(a,n)){return true}}}}else{if(s||l){if(!l||!l.$stable){return true}}if(o===i){return false}if(!o){return!!i}if(!i){return true}return ts(o,i,a)}return false}function ts(e,t,n){const o=Object.keys(t);if(o.length!==Object.keys(e).length){return true}for(let s=0;s<o.length;s++){const r=o[s];if(t[r]!==e[r]&&!Vo(n,r)){return true}}return false}function ns({vnode:e,parent:t},n){while(t&&t.subTree===e){(e=t.vnode).el=n;t=t.parent}}const os=e=>e.__isSuspense;const ss={name:\\"Suspense\\",__isSuspense:true,process(e,t,n,o,s,r,i,l,c,a){if(e==null){ls(t,n,o,s,r,i,l,c,a)}else{cs(e,t,n,o,s,i,l,c,a)}},hydrate:us,create:fs,normalize:ps};const rs=ss;function is(e,t){const n=e.props&&e.props[t];if(v(n)){n()}}function ls(e,t,n,o,s,r,i,l,c){const{p:a,o:{createElement:f}}=c;const u=f(\\"div\\");const p=e.suspense=fs(e,s,o,t,u,n,r,i,l,c);a(null,p.pendingBranch=e.ssContent,u,null,o,p,r,i);if(p.deps>0){is(e,\\"onPending\\");is(e,\\"onFallback\\");a(null,e.ssFallback,t,n,o,null,r,i);ms(p,e.ssFallback)}else{p.resolve(false,true)}}function cs(e,t,n,o,s,r,i,l,{p:c,um:a,o:{createElement:f}}){const u=t.suspense=e.suspense;u.vnode=t;t.el=e.el;const p=t.ssContent;const d=t.ssFallback;const{activeBranch:h,pendingBranch:m,isInFallback:g,isHydrating:y}=u;if(m){u.pendingBranch=p;if(Al(p,m)){c(m,p,u.hiddenContainer,null,s,u,r,i,l);if(u.deps<=0){u.resolve()}else if(g){c(h,d,n,o,s,null,r,i,l);ms(u,d)}}else{u.pendingId++;if(y){u.isHydrating=false;u.activeBranch=m}else{a(m,s,u)}u.deps=0;u.effects.length=0;u.hiddenContainer=f(\\"div\\");if(g){c(null,p,u.hiddenContainer,null,s,u,r,i,l);if(u.deps<=0){u.resolve()}else{c(h,d,n,o,s,null,r,i,l);ms(u,d)}}else if(h&&Al(p,h)){c(h,p,n,o,s,u,r,i,l);u.resolve(true)}else{c(null,p,u.hiddenContainer,null,s,u,r,i,l);if(u.deps<=0){u.resolve()}}}}else{if(h&&Al(p,h)){c(h,p,n,o,s,u,r,i,l);ms(u,p)}else{is(t,\\"onPending\\");u.pendingBranch=p;u.pendingId++;c(null,p,u.hiddenContainer,null,s,u,r,i,l);if(u.deps<=0){u.resolve()}else{const{timeout:e,pendingId:t}=u;if(e>0){setTimeout((()=>{if(u.pendingId===t){u.fallback(d)}}),e)}else if(e===0){u.fallback(d)}}}}}let as=false;function fs(e,t,n,o,s,r,i,l,c,a,f=false){if(!as){as=true;console[console.info?\\"info\\":\\"log\\"](`<Suspense> is an experimental feature and its API will likely change.`)}const{p:u,m:p,um:d,n:h,o:{parentNode:m,remove:g}}=a;let y;const v=gs(e);if(v){if(t==null?void 0:t.pendingBranch){y=t.pendingId;t.deps++}}const b=e.props?U(e.props.timeout):void 0;{Mn(b,`Suspense timeout`)}const _={vnode:e,parent:t,parentComponent:n,isSVG:i,container:o,hiddenContainer:s,anchor:r,deps:0,pendingId:0,timeout:typeof b===\\"number\\"?b:-1,activeBranch:null,pendingBranch:null,isInFallback:true,isHydrating:f,isUnmounted:false,effects:[],resolve(e=false,n=false){{if(!e&&!_.pendingBranch){throw new Error(`suspense.resolve() is called without a pending branch.`)}if(_.isUnmounted){throw new Error(`suspense.resolve() is called on an already unmounted suspense boundary.`)}}const{vnode:o,activeBranch:s,pendingBranch:r,pendingId:i,effects:l,parentComponent:c,container:a}=_;if(_.isHydrating){_.isHydrating=false}else if(!e){const e=s&&r.transition&&r.transition.mode===\\"out-in\\";if(e){s.transition.afterLeave=()=>{if(i===_.pendingId){p(r,a,t,0)}}}let{anchor:t}=_;if(s){t=h(s);d(s,c,_,true)}if(!e){p(r,a,t,0)}}ms(_,r);_.pendingBranch=null;_.isInFallback=false;let f=_.parent;let u=false;while(f){if(f.pendingBranch){f.effects.push(...l);u=true;break}f=f.parent}if(!u){no(l)}_.effects=[];if(v){if(t&&t.pendingBranch&&y===t.pendingId){t.deps--;if(t.deps===0&&!n){t.resolve()}}}is(o,\\"onResolve\\")},fallback(e){if(!_.pendingBranch){return}const{vnode:t,activeBranch:n,parentComponent:o,container:s,isSVG:r}=_;is(t,\\"onFallback\\");const i=h(n);const a=()=>{if(!_.isInFallback){return}u(null,e,s,i,o,null,r,l,c);ms(_,e)};const f=e.transition&&e.transition.mode===\\"out-in\\";if(f){n.transition.afterLeave=a}_.isInFallback=true;d(n,o,null,true);if(!f){a()}},move(e,t,n){_.activeBranch&&p(_.activeBranch,e,t,n);_.container=e},next(){return _.activeBranch&&h(_.activeBranch)},registerDep(e,t){const n=!!_.pendingBranch;if(n){_.deps++}const o=e.vnode.el;e.asyncDep.catch((t=>{Ln(t,e,0)})).then((s=>{if(e.isUnmounted||_.isUnmounted||_.pendingId!==e.suspenseId){return}e.asyncResolved=true;const{vnode:r}=e;{Tn(r)}pc(e,s,false);if(o){r.el=o}const l=!o&&e.subTree.el;t(e,r,m(o||e.subTree.el),o?null:h(e.subTree),_,i,c);if(l){g(l)}ns(e,r.el);{En()}if(n&&--_.deps===0){_.resolve()}}))},unmount(e,t){_.isUnmounted=true;if(_.activeBranch){d(_.activeBranch,n,e,t)}if(_.pendingBranch){d(_.pendingBranch,n,e,t)}}};return _}function us(e,t,n,o,s,r,i,l,c){const a=t.suspense=fs(t,o,n,e.parentNode,document.createElement(\\"div\\"),null,s,r,i,l,true);const f=c(e,a.pendingBranch=t.ssContent,n,a,r,i);if(a.deps===0){a.resolve(false,true)}return f}function ps(e){const{shapeFlag:t,children:n}=e;const o=t&32;e.ssContent=ds(o?n.default:n);e.ssFallback=o?ds(n.fallback):Ll(bl)}function ds(e){let t;if(v(e)){const n=Cl&&e._c;if(n){e._d=false;Sl()}e=e();if(n){e._d=true;t=xl;kl()}}if(d(e)){const t=Yo(e);if(!t){Nn(`<Suspense> slots expect a single root node.`)}e=t}e=Gl(e);if(t&&!e.dynamicChildren){e.dynamicChildren=t.filter((t=>t!==e))}return e}function hs(e,t){if(t&&t.pendingBranch){if(d(e)){t.effects.push(...e)}else{t.effects.push(e)}}else{no(e)}}function ms(e,t){e.activeBranch=t;const{vnode:n,parentComponent:o}=e;const s=n.el=t.el;if(o&&o.subTree===n){o.vnode.el=s;ns(o,s)}}function gs(e){var t;return((t=e.props)==null?void 0:t.suspensible)!=null&&e.props.suspensible!==false}function ys(e,t){return xs(e,null,t)}function vs(e,t){return xs(e,null,a({},t,{flush:\\"post\\"}))}function bs(e,t){return xs(e,null,a({},t,{flush:\\"sync\\"}))}const _s={};function ws(e,t,n){if(!v(t)){Nn(`\\\\`watch(fn, options?)\\\\` signature has been moved to a separate API. Use \\\\`watchEffect(fn, options?)\\\\` instead. \\\\`watch\\\\` now only supports \\\\`watch(source, cb, options?) signature.`)}return xs(e,t,n)}function xs(e,t,{immediate:o,deep:r,flush:i,onTrack:l,onTrigger:c}=n){var a;if(!t){if(o!==void 0){Nn(`watch() \\"immediate\\" option is only respected when using the watch(source, callback, options?) signature.`)}if(r!==void 0){Nn(`watch() \\"deep\\" option is only respected when using the watch(source, callback, options?) signature.`)}}const u=e=>{Nn(`Invalid watch source: `,e,`A watch source can only be a getter/effect function, a ref, a reactive object, or an array of these types.`)};const p=xe()===((a=tc)==null?void 0:a.scope)?tc:null;let h;let m=false;let g=false;if(ln(e)){h=()=>e.value;m=Xt(e)}else if(Yt(e)){h=()=>e;r=true}else if(d(e)){g=true;m=e.some((e=>Yt(e)||Xt(e)));h=()=>e.map((e=>{if(ln(e)){return e.value}else if(Yt(e)){return Cs(e)}else if(v(e)){return jn(e,p,2)}else{u(e)}}))}else if(v(e)){if(t){h=()=>jn(e,p,2)}else{h=()=>{if(p&&p.isUnmounted){return}if(y){y()}return Vn(e,p,3,[b])}}}else{h=s;u(e)}if(t&&r){const e=h;h=()=>Cs(e())}let y;let b=e=>{y=S.onStop=()=>{jn(e,p,4)}};let _=g?new Array(e.length).fill(_s):_s;const w=()=>{if(!S.active){return}if(t){const e=S.run();if(r||m||(g?e.some(((e,t)=>j(e,_[t]))):j(e,_))||false){if(y){y()}Vn(t,p,3,[e,_===_s?void 0:g&&_[0]===_s?[]:_,b]);_=e}}else{S.run()}};w.allowRecurse=!!t;let x;if(i===\\"sync\\"){x=w}else if(i===\\"post\\"){x=()=>tl(w,p&&p.suspense)}else{w.pre=true;if(p)w.id=p.uid;x=()=>Qn(w)}const S=new Fe(h,x);{S.onTrack=l;S.onTrigger=c}if(t){if(o){w()}else{_=S.run()}}else if(i===\\"post\\"){tl(S.run.bind(S),p&&p.suspense)}else{S.run()}const k=()=>{S.stop();if(p&&p.scope){f(p.scope.effects,S)}};return k}function Ss(e,t,n){const o=this.proxy;const s=b(e)?e.includes(\\".\\")?ks(o,e):()=>o[e]:e.bind(o,o);let r;if(v(t)){r=t}else{r=t.handler;n=t}const i=tc;sc(this);const l=xs(s,r.bind(o),n);if(i){sc(i)}else{rc()}return l}function ks(e,t){const n=t.split(\\".\\");return()=>{let t=e;for(let e=0;e<n.length&&t;e++){t=t[n[e]]}return t}}function Cs(e,t){if(!w(e)||e[\\"__v_skip\\"]){return e}t=t||new Set;if(t.has(e)){return e}t.add(e);if(ln(e)){Cs(e.value,t)}else if(d(e)){for(let n=0;n<e.length;n++){Cs(e[n],t)}}else if(m(e)||h(e)){e.forEach((e=>{Cs(e,t)}))}else if($(e)){for(const n in e){Cs(e[n],t)}}return e}function $s(e){if(N(e)){Nn(\\"Do not use built-in directive ids as custom directive id: \\"+e)}}function Ts(e,t){const o=Lo;if(o===null){Nn(`withDirectives can only be used inside render functions.`);return e}const s=wc(o)||o.proxy;const r=e.dirs||(e.dirs=[]);for(let e=0;e<t.length;e++){let[o,i,l,c=n]=t[e];if(o){if(v(o)){o={mounted:o,updated:o}}if(o.deep){Cs(i)}r.push({dir:o,instance:s,value:i,oldValue:void 0,arg:l,modifiers:c})}}return e}function Es(e,t,n,o){const s=e.dirs;const r=t&&t.dirs;for(let i=0;i<s.length;i++){const l=s[i];if(r){l.oldValue=r[i].value}let c=l.dir[o];if(c){De();Vn(c,n,8,[e.el,l,e,t]);He()}}}function Ns(){const e={isMounted:false,isLeaving:false,isUnmounting:false,leavingVNodes:new Map};or((()=>{e.isMounted=true}));ir((()=>{e.isUnmounting=true}));return e}const Os=[Function,Array];const As={mode:String,appear:Boolean,persisted:Boolean,onBeforeEnter:Os,onEnter:Os,onAfterEnter:Os,onEnterCancelled:Os,onBeforeLeave:Os,onLeave:Os,onAfterLeave:Os,onLeaveCancelled:Os,onBeforeAppear:Os,onAppear:Os,onAfterAppear:Os,onAppearCancelled:Os};const Rs={name:`BaseTransition`,props:As,setup(e,{slots:t}){const n=nc();const o=Ns();let s;return()=>{const r=t.default&&Ls(t.default(),true);if(!r||!r.length){return}let i=r[0];if(r.length>1){let e=false;for(const t of r){if(t.type!==bl){if(e){Nn(\\"<transition> can only be used on a single element or component. Use <transition-group> for lists.\\");break}i=t;e=true}}}const l=en(e);const{mode:c}=l;if(c&&c!==\\"in-out\\"&&c!==\\"out-in\\"&&c!==\\"default\\"){Nn(`invalid <transition> mode: ${c}`)}if(o.isLeaving){return Fs(i)}const a=js(i);if(!a){return Fs(i)}const f=Ms(a,l,o,n);Vs(a,f);const u=n.subTree;const p=u&&js(u);let d=false;const{getTransitionKey:h}=a.type;if(h){const e=h();if(s===void 0){s=e}else if(e!==s){s=e;d=true}}if(p&&p.type!==bl&&(!Al(a,p)||d)){const e=Ms(p,l,o,n);Vs(p,e);if(c===\\"out-in\\"){o.isLeaving=true;e.afterLeave=()=>{o.isLeaving=false;if(n.update.active!==false){n.update()}};return Fs(i)}else if(c===\\"in-out\\"&&a.type!==bl){e.delayLeave=(e,t,n)=>{const s=Is(o,p);s[String(p.key)]=p;e._leaveCb=()=>{t();e._leaveCb=void 0;delete f.delayedLeave};f.delayedLeave=n}}}return i}}};const Ps=Rs;function Is(e,t){const{leavingVNodes:n}=e;let o=n.get(t.type);if(!o){o=Object.create(null);n.set(t.type,o)}return o}function Ms(e,t,n,o){const{appear:s,mode:r,persisted:i=false,onBeforeEnter:l,onEnter:c,onAfterEnter:a,onEnterCancelled:f,onBeforeLeave:u,onLeave:p,onAfterLeave:h,onLeaveCancelled:m,onBeforeAppear:g,onAppear:y,onAfterAppear:v,onAppearCancelled:b}=t;const _=String(e.key);const w=Is(n,e);const x=(e,t)=>{e&&Vn(e,o,9,t)};const S=(e,t)=>{const n=t[1];x(e,t);if(d(e)){if(e.every((e=>e.length<=1)))n()}else if(e.length<=1){n()}};const k={mode:r,persisted:i,beforeEnter(t){let o=l;if(!n.isMounted){if(s){o=g||l}else{return}}if(t._leaveCb){t._leaveCb(true)}const r=w[_];if(r&&Al(e,r)&&r.el._leaveCb){r.el._leaveCb()}x(o,[t])},enter(e){let t=c;let o=a;let r=f;if(!n.isMounted){if(s){t=y||c;o=v||a;r=b||f}else{return}}let i=false;const l=e._enterCb=t=>{if(i)return;i=true;if(t){x(r,[e])}else{x(o,[e])}if(k.delayedLeave){k.delayedLeave()}e._enterCb=void 0};if(t){S(t,[e,l])}else{l()}},leave(t,o){const s=String(e.key);if(t._enterCb){t._enterCb(true)}if(n.isUnmounting){return o()}x(u,[t]);let r=false;const i=t._leaveCb=n=>{if(r)return;r=true;o();if(n){x(m,[t])}else{x(h,[t])}t._leaveCb=void 0;if(w[s]===e){delete w[s]}};w[s]=e;if(p){S(p,[t,i])}else{i()}},clone(e){return Ms(e,t,n,o)}};return k}function Fs(e){if(Ws(e)){e=Dl(e);e.children=null;return e}}function js(e){return Ws(e)?e.children?e.children[0]:void 0:e}function Vs(e,t){if(e.shapeFlag&6&&e.component){Vs(e.component.subTree,t)}else if(e.shapeFlag&128){e.ssContent.transition=t.clone(e.ssContent);e.ssFallback.transition=t.clone(e.ssFallback)}else{e.transition=t}}function Ls(e,t=false,n){let o=[];let s=0;for(let r=0;r<e.length;r++){let i=e[r];const l=n==null?i.key:String(n)+String(i.key!=null?i.key:r);if(i.type===yl){if(i.patchFlag&128)s++;o=o.concat(Ls(i.children,t,l))}else if(t||i.type!==bl){o.push(l!=null?Dl(i,{key:l}):i)}}if(s>1){for(let e=0;e<o.length;e++){o[e].patchFlag=-2}}return o}function Bs(e,t){return v(e)?(()=>a({name:e.name},t,{setup:e}))():e}const Us=e=>!!e.type.__asyncLoader;function Ds(e){if(v(e)){e={loader:e}}const{loader:t,loadingComponent:n,errorComponent:o,delay:s=200,timeout:r,suspensible:i=true,onError:l}=e;let c=null;let a;let f=0;const u=()=>{f++;c=null;return p()};const p=()=>{let e;return c||(e=c=t().catch((e=>{e=e instanceof Error?e:new Error(String(e));if(l){return new Promise(((t,n)=>{const o=()=>t(u());const s=()=>n(e);l(e,o,s,f+1)}))}else{throw e}})).then((t=>{if(e!==c&&c){return c}if(!t){Nn(`Async component loader resolved to undefined. If you are using retry(), make sure to return its return value.`)}if(t&&(t.__esModule||t[Symbol.toStringTag]===\\"Module\\")){t=t.default}if(t&&!w(t)&&!v(t)){throw new Error(`Invalid async component load result: ${t}`)}a=t;return t})))};return Bs({name:\\"AsyncComponentWrapper\\",__asyncLoader:p,get __asyncResolved(){return a},setup(){const e=tc;if(a){return()=>Hs(a,e)}const t=t=>{c=null;Ln(t,e,13,!o)};if(i&&e.suspense||false){return p().then((t=>()=>Hs(t,e))).catch((e=>{t(e);return()=>o?Ll(o,{error:e}):null}))}const l=cn(false);const f=cn();const u=cn(!!s);if(s){setTimeout((()=>{u.value=false}),s)}if(r!=null){setTimeout((()=>{if(!l.value&&!f.value){const e=new Error(`Async component timed out after ${r}ms.`);t(e);f.value=e}}),r)}p().then((()=>{l.value=true;if(e.parent&&Ws(e.parent.vnode)){Qn(e.parent.update)}})).catch((e=>{t(e);f.value=e}));return()=>{if(l.value&&a){return Hs(a,e)}else if(f.value&&o){return Ll(o,{error:f.value})}else if(n&&!u.value){return Ll(n)}}}})}function Hs(e,t){const{ref:n,props:o,children:s,ce:r}=t.vnode;const i=Ll(e,o,s);i.ref=n;i.ce=r;delete t.vnode.ce;return i}const Ws=e=>e.type.__isKeepAlive;const zs={name:`KeepAlive`,__isKeepAlive:true,props:{include:[String,RegExp,Array],exclude:[String,RegExp,Array],max:[String,Number]},setup(e,{slots:t}){const n=nc();const o=n.ctx;const s=new Map;const r=new Set;let i=null;{n.__v_cache=s}const l=n.suspense;const{renderer:{p:c,m:a,um:f,o:{createElement:u}}}=o;const p=u(\\"div\\");o.activate=(e,t,n,o,s)=>{const r=e.component;a(e,t,n,0,l);c(r.vnode,e,t,n,r,l,o,e.slotScopeIds,s);tl((()=>{r.isDeactivated=false;if(r.a){V(r.a)}const t=e.props&&e.props.onVnodeMounted;if(t){Zl(t,r.parent,e)}}),l);{To(r)}};o.deactivate=e=>{const t=e.component;a(e,p,null,1,l);tl((()=>{if(t.da){V(t.da)}const n=e.props&&e.props.onVnodeUnmounted;if(n){Zl(n,t.parent,e)}t.isDeactivated=true}),l);{To(t)}};function d(e){Xs(e);f(e,n,l,true)}function h(e){s.forEach(((t,n)=>{const o=kc(t.type);if(o&&(!e||!e(o))){m(n)}}))}function m(e){const t=s.get(e);if(!i||!Al(t,i)){d(t)}else if(i){Xs(i)}s.delete(e);r.delete(e)}ws((()=>[e.include,e.exclude]),(([e,t])=>{e&&h((t=>Gs(e,t)));t&&h((e=>!Gs(t,e)))}),{flush:\\"post\\",deep:true});let g=null;const y=()=>{if(g!=null){s.set(g,Qs(n.subTree))}};or(y);rr(y);ir((()=>{s.forEach((e=>{const{subTree:t,suspense:o}=n;const s=Qs(t);if(e.type===s.type&&e.key===s.key){Xs(s);const e=s.component.da;e&&tl(e,o);return}d(e)}))}));return()=>{g=null;if(!t.default){return null}const n=t.default();const o=n[0];if(n.length>1){{Nn(`KeepAlive should contain exactly one component child.`)}i=null;return n}else if(!Ol(o)||!(o.shapeFlag&4)&&!(o.shapeFlag&128)){i=null;return o}let l=Qs(o);const c=l.type;const a=kc(Us(l)?l.type.__asyncResolved||{}:c);const{include:f,exclude:u,max:p}=e;if(f&&(!a||!Gs(f,a))||u&&a&&Gs(u,a)){i=l;return o}const d=l.key==null?c:l.key;const h=s.get(d);if(l.el){l=Dl(l);if(o.shapeFlag&128){o.ssContent=l}}g=d;if(h){l.el=h.el;l.component=h.component;if(l.transition){Vs(l,l.transition)}l.shapeFlag|=512;r.delete(d);r.add(d)}else{r.add(d);if(p&&r.size>parseInt(p,10)){m(r.values().next().value)}}l.shapeFlag|=256;i=l;return os(o.type)?o:l}}};const Ks=zs;function Gs(e,t){if(d(e)){return e.some((e=>Gs(e,t)))}else if(b(e)){return e.split(\\",\\").includes(t)}else if(y(e)){return e.test(t)}return false}function Js(e,t){Ys(e,\\"a\\",t)}function qs(e,t){Ys(e,\\"da\\",t)}function Ys(e,t,n=tc){const o=e.__wdc||(e.__wdc=()=>{let t=n;while(t){if(t.isDeactivated){return}t=t.parent}return e()});er(t,o,n);if(n){let e=n.parent;while(e&&e.parent){if(Ws(e.parent.vnode)){Zs(o,t,n,e)}e=e.parent}}}function Zs(e,t,n,o){const s=er(t,e,o,true);lr((()=>{f(o[t],s)}),n)}function Xs(e){e.shapeFlag&=~256;e.shapeFlag&=~512}function Qs(e){return e.shapeFlag&128?e.ssContent:e}function er(e,t,n=tc,o=false){if(n){const s=n[e]||(n[e]=[]);const r=t.__weh||(t.__weh=(...o)=>{if(n.isUnmounted){return}De();sc(n);const s=Vn(t,n,e,o);rc();He();return s});if(o){s.unshift(r)}else{s.push(r)}return r}else{const t=F(Fn[e].replace(/ hook$/,\\"\\"));Nn(`${t} is called when there is no active component instance to be associated with. Lifecycle injection APIs can only be used during execution of setup().`+` If you are using async setup(), make sure to register lifecycle hooks before the first await statement.`)}}const tr=e=>(t,n=tc)=>(!ac||e===\\"sp\\")&&er(e,((...e)=>t(...e)),n);const nr=tr(\\"bm\\");const or=tr(\\"m\\");const sr=tr(\\"bu\\");const rr=tr(\\"u\\");const ir=tr(\\"bum\\");const lr=tr(\\"um\\");const cr=tr(\\"sp\\");const ar=tr(\\"rtg\\");const fr=tr(\\"rtc\\");function ur(e,t=tc){er(\\"ec\\",e,t)}const pr=\\"components\\";const dr=\\"directives\\";function hr(e,t){return vr(pr,e,true,t)||e}const mr=Symbol.for(\\"v-ndc\\");function gr(e){if(b(e)){return vr(pr,e,false)||e}else{return e||mr}}function yr(e){return vr(dr,e)}function vr(e,t,n=true,o=false){const s=Lo||tc;if(s){const r=s.type;if(e===pr){const e=kc(r,false);if(e&&(e===t||e===R(t)||e===M(R(t)))){return r}}const i=br(s[e]||r[e],t)||br(s.appContext[e],t);if(!i&&o){return r}if(n&&!i){const n=e===pr?`\\\\nIf this is a native custom element, make sure to exclude it from component resolution via compilerOptions.isCustomElement.`:``;Nn(`Failed to resolve ${e.slice(0,-1)}: ${t}${n}`)}return i}else{Nn(`resolve${M(e.slice(0,-1))} can only be used in render() or setup().`)}}function br(e,t){return e&&(e[t]||e[R(t)]||e[M(R(t))])}function _r(e,t,n,o){let s;const r=n&&n[o];if(d(e)||b(e)){s=new Array(e.length);for(let n=0,o=e.length;n<o;n++){s[n]=t(e[n],n,void 0,r&&r[n])}}else if(typeof e===\\"number\\"){if(!Number.isInteger(e)){Nn(`The v-for range expect an integer value but got ${e}.`)}s=new Array(e);for(let n=0;n<e;n++){s[n]=t(n+1,n,void 0,r&&r[n])}}else if(w(e)){if(e[Symbol.iterator]){s=Array.from(e,((e,n)=>t(e,n,void 0,r&&r[n])))}else{const n=Object.keys(e);s=new Array(n.length);for(let o=0,i=n.length;o<i;o++){const i=n[o];s[o]=t(e[i],i,o,r&&r[o])}}}else{s=[]}if(n){n[o]=s}return s}function wr(e,t){for(let n=0;n<t.length;n++){const o=t[n];if(d(o)){for(let t=0;t<o.length;t++){e[o[t].name]=o[t].fn}}else if(o){e[o.name]=o.key?(...e)=>{const t=o.fn(...e);if(t)t.key=o.key;return t}:o.fn}}return e}function xr(e,t,n={},o,s){if(Lo.isCE||Lo.parent&&Us(Lo.parent)&&Lo.parent.isCE){if(t!==\\"default\\")n.name=t;return Ll(\\"slot\\",n,o&&o())}let r=e[t];if(r&&r.length>1){Nn(`SSR-optimized slot function detected in a non-SSR-optimized render function. You need to mark this component with $dynamic-slots in the parent template.`);r=()=>[]}if(r&&r._c){r._d=false}Sl();const i=r&&Sr(r(n));const l=Nl(yl,{key:n.key||i&&i.key||`_${t}`},i||(o?o():[]),i&&e._===1?64:-2);if(!s&&l.scopeId){l.slotScopeIds=[l.scopeId+\\"-s\\"]}if(r&&r._c){r._d=true}return l}function Sr(e){return e.some((e=>{if(!Ol(e))return true;if(e.type===bl)return false;if(e.type===yl&&!Sr(e.children))return false;return true}))?e:null}function kr(e,t){const n={};if(!w(e)){Nn(`v-on with no argument expects an object value.`);return n}for(const o in e){n[t&&/[A-Z]/.test(o)?`on:${o}`:F(o)]=e[o]}return n}const Cr=e=>{if(!e)return null;if(cc(e))return wc(e)||e.proxy;return Cr(e.parent)};const $r=a(Object.create(null),{$:e=>e,$el:e=>e.vnode.el,$data:e=>e.data,$props:e=>Jt(e.props),$attrs:e=>Jt(e.attrs),$slots:e=>Jt(e.slots),$refs:e=>Jt(e.refs),$parent:e=>Cr(e.parent),$root:e=>Cr(e.root),$emit:e=>e.emit,$options:e=>oi(e),$forceUpdate:e=>e.f||(e.f=()=>Qn(e.update)),$nextTick:e=>e.n||(e.n=Zn.bind(e.proxy)),$watch:e=>Ss.bind(e)});const Tr=e=>e===\\"_\\"||e===\\"$\\";const Er=(e,t)=>e!==n&&!e.__isScriptSetup&&p(e,t);const Nr={get({_:e},t){const{ctx:o,setupState:s,data:r,props:i,accessCache:l,type:c,appContext:a}=e;if(t===\\"__isVue\\"){return true}let f;if(t[0]!==\\"$\\"){const c=l[t];if(c!==void 0){switch(c){case 1:return s[t];case 2:return r[t];case 4:return o[t];case 3:return i[t]}}else if(Er(s,t)){l[t]=1;return s[t]}else if(r!==n&&p(r,t)){l[t]=2;return r[t]}else if((f=e.propsOptions[0])&&p(f,t)){l[t]=3;return i[t]}else if(o!==n&&p(o,t)){l[t]=4;return o[t]}else if(Xr){l[t]=0}}const u=$r[t];let d,h;if(u){if(t===\\"$attrs\\"){We(e,\\"get\\",t);Go()}else if(t===\\"$slots\\"){We(e,\\"get\\",t)}return u(e)}else if((d=c.__cssModules)&&(d=d[t])){return d}else if(o!==n&&p(o,t)){l[t]=4;return o[t]}else if(h=a.config.globalProperties,p(h,t)){{return h[t]}}else if(Lo&&(!b(t)||t.indexOf(\\"__v\\")!==0)){if(r!==n&&Tr(t[0])&&p(r,t)){Nn(`Property ${JSON.stringify(t)} must be accessed via $data because it starts with a reserved character (\\"$\\" or \\"_\\") and is not proxied on the render context.`)}else if(e===Lo){Nn(`Property ${JSON.stringify(t)} was accessed during render but is not defined on instance.`)}}},set({_:e},t,o){const{data:s,setupState:r,ctx:i}=e;if(Er(r,t)){r[t]=o;return true}else if(r.__isScriptSetup&&p(r,t)){Nn(`Cannot mutate <script setup> binding \\"${t}\\" from Options API.`);return false}else if(s!==n&&p(s,t)){s[t]=o;return true}else if(p(e.props,t)){Nn(`Attempting to mutate prop \\"${t}\\". Props are readonly.`);return false}if(t[0]===\\"$\\"&&t.slice(1)in e){Nn(`Attempting to mutate public property \\"${t}\\". Properties starting with $ are reserved and readonly.`);return false}else{if(t in e.appContext.config.globalProperties){Object.defineProperty(i,t,{enumerable:true,configurable:true,value:o})}else{i[t]=o}}return true},has({_:{data:e,setupState:t,accessCache:o,ctx:s,appContext:r,propsOptions:i}},l){let c;return!!o[l]||e!==n&&p(e,l)||Er(t,l)||(c=i[0])&&p(c,l)||p(s,l)||p($r,l)||p(r.config.globalProperties,l)},defineProperty(e,t,n){if(n.get!=null){e._.accessCache[t]=0}else if(p(n,\\"value\\")){this.set(e,t,n.value,null)}return Reflect.defineProperty(e,t,n)}};{Nr.ownKeys=e=>{Nn(`Avoid app logic that relies on enumerating keys on a component instance. The keys will be empty in production mode to avoid performance overhead.`);return Reflect.ownKeys(e)}}const Or=a({},Nr,{get(e,t){if(t===Symbol.unscopables){return}return Nr.get(e,t,e)},has(e,t){const n=t[0]!==\\"_\\"&&!G(t);if(!n&&Nr.has(e,t)){Nn(`Property ${JSON.stringify(t)} should not start with _ which is a reserved prefix for Vue internals.`)}return n}});function Ar(e){const t={};Object.defineProperty(t,`_`,{configurable:true,enumerable:false,get:()=>e});Object.keys($r).forEach((n=>{Object.defineProperty(t,n,{configurable:true,enumerable:false,get:()=>$r[n](e),set:s})}));return t}function Rr(e){const{ctx:t,propsOptions:[n]}=e;if(n){Object.keys(n).forEach((n=>{Object.defineProperty(t,n,{enumerable:true,configurable:true,get:()=>e.props[n],set:s})}))}}function Pr(e){const{ctx:t,setupState:n}=e;Object.keys(en(n)).forEach((e=>{if(!n.__isScriptSetup){if(Tr(e[0])){Nn(`setup() return property ${JSON.stringify(e)} should not start with \\"$\\" or \\"_\\" which are reserved prefixes for Vue internals.`);return}Object.defineProperty(t,e,{enumerable:true,configurable:true,get:()=>n[e],set:s})}}))}const Ir=e=>Nn(`${e}() is a compiler-hint helper that is only usable inside <script setup> of a single file component. Its arguments should be compiled away and passing it at runtime has no effect.`);function Mr(){{Ir(`defineProps`)}return null}function Fr(){{Ir(`defineEmits`)}return null}function jr(e){{Ir(`defineExpose`)}}function Vr(e){{Ir(`defineOptions`)}}function Lr(){{Ir(`defineSlots`)}return null}function Br(){{Ir(\\"defineModel\\")}}function Ur(e,t){{Ir(`withDefaults`)}return null}function Dr(){return zr().slots}function Hr(){return zr().attrs}function Wr(e,t,n){const o=nc();if(!o){Nn(`useModel() called without active instance.`);return cn()}if(!o.propsOptions[0][t]){Nn(`useModel() called with prop \\"${t}\\" which is not declared.`);return cn()}if(n&&n.local){const n=cn(e[t]);ws((()=>e[t]),(e=>n.value=e));ws(n,(n=>{if(n!==e[t]){o.emit(`update:${t}`,n)}}));return n}else{return{__v_isRef:true,get value(){return e[t]},set value(e){o.emit(`update:${t}`,e)}}}}function zr(){const e=nc();if(!e){Nn(`useContext() called without active instance.`)}return e.setupContext||(e.setupContext=_c(e))}function Kr(e){return d(e)?e.reduce(((e,t)=>(e[t]=null,e)),{}):e}function Gr(e,t){const n=Kr(e);for(const e in t){if(e.startsWith(\\"__skip\\"))continue;let o=n[e];if(o){if(d(o)||v(o)){o=n[e]={type:o,default:t[e]}}else{o.default=t[e]}}else if(o===null){o=n[e]={default:t[e]}}else{Nn(`props default key \\"${e}\\" has no corresponding declaration.`)}if(o&&t[`__skip_${e}`]){o.skipFactory=true}}return n}function Jr(e,t){if(!e||!t)return e||t;if(d(e)&&d(t))return e.concat(t);return a({},Kr(e),Kr(t))}function qr(e,t){const n={};for(const o in e){if(!t.includes(o)){Object.defineProperty(n,o,{enumerable:true,get:()=>e[o]})}}return n}function Yr(e){const t=nc();if(!t){Nn(`withAsyncContext called without active current instance. This is likely a bug.`)}let n=e();rc();if(x(n)){n=n.catch((e=>{sc(t);throw e}))}return[n,()=>sc(t)]}function Zr(){const e=Object.create(null);return(t,n)=>{if(e[n]){Nn(`${t} property \\"${n}\\" is already defined in ${e[n]}.`)}else{e[n]=t}}}let Xr=true;function Qr(e){const t=oi(e);const n=e.proxy;const o=e.ctx;Xr=false;if(t.beforeCreate){ti(t.beforeCreate,e,\\"bc\\")}const{data:r,computed:i,methods:l,watch:c,provide:a,inject:f,created:u,beforeMount:p,mounted:h,beforeUpdate:m,updated:g,activated:y,deactivated:b,beforeDestroy:_,beforeUnmount:S,destroyed:k,unmounted:C,render:$,renderTracked:T,renderTriggered:E,errorCaptured:N,serverPrefetch:O,expose:A,inheritAttrs:R,components:P,directives:I,filters:M}=t;const F=Zr();{const[t]=e.propsOptions;if(t){for(const e in t){F(\\"Props\\",e)}}}if(f){ei(f,o,F)}if(l){for(const e in l){const t=l[e];if(v(t)){{Object.defineProperty(o,e,{value:t.bind(n),configurable:true,enumerable:true,writable:true})}{F(\\"Methods\\",e)}}else{Nn(`Method \\"${e}\\" has type \\"${typeof t}\\" in the component definition. Did you reference the function correctly?`)}}}if(r){if(!v(r)){Nn(`The data option must be a function. Plain object usage is no longer supported.`)}const t=r.call(n,n);if(x(t)){Nn(`data() returned a Promise - note data() cannot be async; If you intend to perform data fetching before component renders, use async setup() + <Suspense>.`)}if(!w(t)){Nn(`data() should return an object.`)}else{e.data=zt(t);{for(const e in t){F(\\"Data\\",e);if(!Tr(e[0])){Object.defineProperty(o,e,{configurable:true,enumerable:true,get:()=>t[e],set:s})}}}}}Xr=true;if(i){for(const e in i){const t=i[e];const r=v(t)?t.bind(n,n):v(t.get)?t.get.bind(n,n):s;if(r===s){Nn(`Computed property \\"${e}\\" has no getter.`)}const l=!v(t)&&v(t.set)?t.set.bind(n):()=>{Nn(`Write operation failed: computed property \\"${e}\\" is readonly.`)};const c=Tc({get:r,set:l});Object.defineProperty(o,e,{enumerable:true,configurable:true,get:()=>c.value,set:e=>c.value=e});{F(\\"Computed\\",e)}}}if(c){for(const e in c){ni(c[e],o,n,e)}}if(a){const e=v(a)?a.call(n):a;Reflect.ownKeys(e).forEach((t=>{yi(t,e[t])}))}if(u){ti(u,e,\\"c\\")}function j(e,t){if(d(t)){t.forEach((t=>e(t.bind(n))))}else if(t){e(t.bind(n))}}j(nr,p);j(or,h);j(sr,m);j(rr,g);j(Js,y);j(qs,b);j(ur,N);j(fr,T);j(ar,E);j(ir,S);j(lr,C);j(cr,O);if(d(A)){if(A.length){const t=e.exposed||(e.exposed={});A.forEach((e=>{Object.defineProperty(t,e,{get:()=>n[e],set:t=>n[e]=t})}))}else if(!e.exposed){e.exposed={}}}if($&&e.render===s){e.render=$}if(R!=null){e.inheritAttrs=R}if(P)e.components=P;if(I)e.directives=I}function ei(e,t,n=s){if(d(e)){e=ci(e)}for(const o in e){const s=e[o];let r;if(w(s)){if(\\"default\\"in s){r=vi(s.from||o,s.default,true)}else{r=vi(s.from||o)}}else{r=vi(s)}if(ln(r)){Object.defineProperty(t,o,{enumerable:true,configurable:true,get:()=>r.value,set:e=>r.value=e})}else{t[o]=r}{n(\\"Inject\\",o)}}}function ti(e,t,n){Vn(d(e)?e.map((e=>e.bind(t.proxy))):e.bind(t.proxy),t,n)}function ni(e,t,n,o){const s=o.includes(\\".\\")?ks(n,o):()=>n[o];if(b(e)){const n=t[e];if(v(n)){ws(s,n)}else{Nn(`Invalid watch handler specified by key \\"${e}\\"`,n)}}else if(v(e)){ws(s,e.bind(n))}else if(w(e)){if(d(e)){e.forEach((e=>ni(e,t,n,o)))}else{const o=v(e.handler)?e.handler.bind(n):t[e.handler];if(v(o)){ws(s,o,e)}else{Nn(`Invalid watch handler specified by key \\"${e.handler}\\"`,o)}}}else{Nn(`Invalid watch option: \\"${o}\\"`,e)}}function oi(e){const t=e.type;const{mixins:n,extends:o}=t;const{mixins:s,optionsCache:r,config:{optionMergeStrategies:i}}=e.appContext;const l=r.get(t);let c;if(l){c=l}else if(!s.length&&!n&&!o){{c=t}}else{c={};if(s.length){s.forEach((e=>si(c,e,i,true)))}si(c,t,i)}if(w(t)){r.set(t,c)}return c}function si(e,t,n,o=false){const{mixins:s,extends:r}=t;if(r){si(e,r,n,true)}if(s){s.forEach((t=>si(e,t,n,true)))}for(const s in t){if(o&&s===\\"expose\\"){Nn(`\\"expose\\" option is ignored when declared in mixins or extends. It should only be declared in the base component itself.`)}else{const o=ri[s]||n&&n[s];e[s]=o?o(e[s],t[s]):t[s]}}return e}const ri={data:ii,props:ui,emits:ui,methods:fi,computed:fi,beforeCreate:ai,created:ai,beforeMount:ai,mounted:ai,beforeUpdate:ai,updated:ai,beforeDestroy:ai,beforeUnmount:ai,destroyed:ai,unmounted:ai,activated:ai,deactivated:ai,errorCaptured:ai,serverPrefetch:ai,components:fi,directives:fi,watch:pi,provide:ii,inject:li};function ii(e,t){if(!t){return e}if(!e){return t}return function n(){return a(v(e)?e.call(this,this):e,v(t)?t.call(this,this):t)}}function li(e,t){return fi(ci(e),ci(t))}function ci(e){if(d(e)){const t={};for(let n=0;n<e.length;n++){t[e[n]]=e[n]}return t}return e}function ai(e,t){return e?[...new Set([].concat(e,t))]:t}function fi(e,t){return e?a(Object.create(null),e,t):t}function ui(e,t){if(e){if(d(e)&&d(t)){return[...new Set([...e,...t])]}return a(Object.create(null),Kr(e),Kr(t!=null?t:{}))}else{return t}}function pi(e,t){if(!e)return t;if(!t)return e;const n=a(Object.create(null),e);for(const o in t){n[o]=ai(e[o],t[o])}return n}function di(){return{app:null,config:{isNativeTag:r,performance:false,globalProperties:{},optionMergeStrategies:{},errorHandler:void 0,warnHandler:void 0,compilerOptions:{}},mixins:[],components:{},directives:{},provides:Object.create(null),optionsCache:new WeakMap,propsCache:new WeakMap,emitsCache:new WeakMap}}let hi=0;function mi(e,t){return function n(o,s=null){if(!v(o)){o=a({},o)}if(s!=null&&!w(s)){Nn(`root props passed to app.mount() must be an object.`);s=null}const r=di();{Object.defineProperty(r.config,\\"unwrapInjectedRef\\",{get(){return true},set(){Nn(`app.config.unwrapInjectedRef has been deprecated. 3.3 now alawys unwraps injected refs in Options API.`)}})}const i=new Set;let l=false;const c=r.app={_uid:hi++,_component:o,_props:s,_container:null,_context:r,_instance:null,version:Ic,get config(){return r.config},set config(e){{Nn(`app.config cannot be replaced. Modify individual options instead.`)}},use(e,...t){if(i.has(e)){Nn(`Plugin has already been applied to target app.`)}else if(e&&v(e.install)){i.add(e);e.install(c,...t)}else if(v(e)){i.add(e);e(c,...t)}else{Nn(`A plugin must either be a function or an object with an \\"install\\" function.`)}return c},mixin(e){{if(!r.mixins.includes(e)){r.mixins.push(e)}else{Nn(\\"Mixin has already been applied to target app\\"+(e.name?`: ${e.name}`:\\"\\"))}}return c},component(e,t){{lc(e,r.config)}if(!t){return r.components[e]}if(r.components[e]){Nn(`Component \\"${e}\\" has already been registered in target app.`)}r.components[e]=t;return c},directive(e,t){{$s(e)}if(!t){return r.directives[e]}if(r.directives[e]){Nn(`Directive \\"${e}\\" has already been registered in target app.`)}r.directives[e]=t;return c},mount(n,i,a){if(!l){if(n.__vue_app__){Nn(`There is already an app instance mounted on the host container.\\\\n If you want to mount another app on the same host container, you need to unmount the previous app by calling \\\\`app.unmount()\\\\` first.`)}const f=Ll(o,s);f.appContext=r;{r.reload=()=>{e(Dl(f),n,a)}}if(i&&t){t(f,n)}else{e(f,n,a)}l=true;c._container=n;n.__vue_app__=c;{c._instance=f.component;Co(c,Ic)}return wc(f.component)||f.component.proxy}else{Nn(`App has already been mounted.\\\\nIf you want to remount the same app, move your app creation logic into a factory function and create fresh app instances for each mount - e.g. \\\\`const createMyApp = () => createApp(App)\\\\``)}},unmount(){if(l){e(null,c._container);{c._instance=null;$o(c)}delete c._container.__vue_app__}else{Nn(`Cannot unmount an app that is not mounted.`)}},provide(e,t){if(e in r.provides){Nn(`App already provides property with key \\"${String(e)}\\". It will be overwritten with the new value.`)}r.provides[e]=t;return c},runWithContext(e){gi=c;try{return e()}finally{gi=null}}};return c}}let gi=null;function yi(e,t){if(!tc){{Nn(`provide() can only be used inside setup().`)}}else{let n=tc.provides;const o=tc.parent&&tc.parent.provides;if(o===n){n=tc.provides=Object.create(o)}n[e]=t}}function vi(e,t,n=false){const o=tc||Lo;if(o||gi){const s=o?o.parent==null?o.vnode.appContext&&o.vnode.appContext.provides:o.parent.provides:gi._context.provides;if(s&&e in s){return s[e]}else if(arguments.length>1){return n&&v(t)?t.call(o&&o.proxy):t}else{Nn(`injection \\"${String(e)}\\" not found.`)}}else{Nn(`inject() can only be used inside setup() or functional components.`)}}function bi(){return!!(tc||Lo||gi)}function _i(e,t,n,o=false){const s={};const r={};L(r,Ml,1);e.propsDefaults=Object.create(null);Si(e,t,s,r);for(const t in e.propsOptions[0]){if(!(t in s)){s[t]=void 0}}{Oi(t||{},s,e)}if(n){e.props=o?s:Kt(s)}else{if(!e.type.props){e.props=r}else{e.props=s}}e.attrs=r}function wi(e){while(e){if(e.type.__hmrId)return true;e=e.parent}}function xi(e,t,n,o){const{props:s,attrs:r,vnode:{patchFlag:i}}=e;const l=en(s);const[c]=e.propsOptions;let a=false;if(!wi(e)&&(o||i>0)&&!(i&16)){if(i&8){const n=e.vnode.dynamicProps;for(let o=0;o<n.length;o++){let i=n[o];if(Vo(e.emitsOptions,i)){continue}const f=t[i];if(c){if(p(r,i)){if(f!==r[i]){r[i]=f;a=true}}else{const t=R(i);s[t]=ki(c,l,t,f,e,false)}}else{if(f!==r[i]){r[i]=f;a=true}}}}}else{if(Si(e,t,s,r)){a=true}let o;for(const r in l){if(!t||!p(t,r)&&((o=I(r))===r||!p(t,o))){if(c){if(n&&(n[r]!==void 0||n[o]!==void 0)){s[r]=ki(c,l,r,void 0,e,true)}}else{delete s[r]}}}if(r!==l){for(const e in r){if(!t||!p(t,e)&&true){delete r[e];a=true}}}}if(a){Ke(e,\\"set\\",\\"$attrs\\")}{Oi(t||{},s,e)}}function Si(e,t,o,s){const[r,i]=e.propsOptions;let l=false;let c;if(t){for(let n in t){if(E(n)){continue}const a=t[n];let f;if(r&&p(r,f=R(n))){if(!i||!i.includes(f)){o[f]=a}else{(c||(c={}))[f]=a}}else if(!Vo(e.emitsOptions,n)){if(!(n in s)||a!==s[n]){s[n]=a;l=true}}}}if(i){const t=en(o);const s=c||n;for(let n=0;n<i.length;n++){const l=i[n];o[l]=ki(r,t,l,s[l],e,!p(s,l))}}return l}function ki(e,t,n,o,s,r){const i=e[n];if(i!=null){const e=p(i,\\"default\\");if(e&&o===void 0){const e=i.default;if(i.type!==Function&&!i.skipFactory&&v(e)){const{propsDefaults:r}=s;if(n in r){o=r[n]}else{sc(s);o=r[n]=e.call(null,t);rc()}}else{o=e}}if(i[0]){if(r&&!e){o=false}else if(i[1]&&(o===\\"\\"||o===I(n))){o=true}}}return o}function Ci(e,t,s=false){const r=t.propsCache;const i=r.get(e);if(i){return i}const l=e.props;const c={};const f=[];let u=false;if(!v(e)){const n=e=>{u=true;const[n,o]=Ci(e,t,true);a(c,n);if(o)f.push(...o)};if(!s&&t.mixins.length){t.mixins.forEach(n)}if(e.extends){n(e.extends)}if(e.mixins){e.mixins.forEach(n)}}if(!l&&!u){if(w(e)){r.set(e,o)}return o}if(d(l)){for(let e=0;e<l.length;e++){if(!b(l[e])){Nn(`props must be strings when using array syntax.`,l[e])}const t=R(l[e]);if($i(t)){c[t]=n}}}else if(l){if(!w(l)){Nn(`invalid props options`,l)}for(const e in l){const t=R(e);if($i(t)){const n=l[e];const o=c[t]=d(n)||v(n)?{type:n}:a({},n);if(o){const e=Ni(Boolean,o.type);const n=Ni(String,o.type);o[0]=e>-1;o[1]=n<0||e<n;if(e>-1||p(o,\\"default\\")){f.push(t)}}}}}const h=[c,f];if(w(e)){r.set(e,h)}return h}function $i(e){if(e[0]!==\\"$\\"){return true}else{Nn(`Invalid prop name: \\"${e}\\" is a reserved property.`)}return false}function Ti(e){const t=e&&e.toString().match(/^\\\\s*(function|class) (\\\\w+)/);return t?t[2]:e===null?\\"null\\":\\"\\"}function Ei(e,t){return Ti(e)===Ti(t)}function Ni(e,t){if(d(t)){return t.findIndex((t=>Ei(t,e)))}else if(v(t)){return Ei(t,e)?0:-1}return-1}function Oi(e,t,n){const o=en(t);const s=n.propsOptions[0];for(const t in s){let n=s[t];if(n==null)continue;Ai(t,o[t],n,!p(e,t)&&!p(e,I(t)))}}function Ai(e,t,n,o){const{type:s,required:r,validator:i,skipCheck:l}=n;if(r&&o){Nn(\'Missing required prop: \\"\'+e+\'\\"\');return}if(t==null&&!r){return}if(s!=null&&s!==true&&!l){let n=false;const o=d(s)?s:[s];const r=[];for(let e=0;e<o.length&&!n;e++){const{valid:s,expectedType:i}=Pi(t,o[e]);r.push(i||\\"\\");n=s}if(!n){Nn(Ii(e,t,r));return}}if(i&&!i(t)){Nn(\'Invalid prop: custom validator check failed for prop \\"\'+e+\'\\".\')}}const Ri=t(\\"String,Number,Boolean,Function,Symbol,BigInt\\");function Pi(e,t){let n;const o=Ti(t);if(Ri(o)){const s=typeof e;n=s===o.toLowerCase();if(!n&&s===\\"object\\"){n=e instanceof t}}else if(o===\\"Object\\"){n=w(e)}else if(o===\\"Array\\"){n=d(e)}else if(o===\\"null\\"){n=e===null}else{n=e instanceof t}return{valid:n,expectedType:o}}function Ii(e,t,n){let o=`Invalid prop: type check failed for prop \\"${e}\\". Expected ${n.map(M).join(\\" | \\")}`;const s=n[0];const r=C(t);const i=Mi(t,s);const l=Mi(t,r);if(n.length===1&&Fi(s)&&!ji(s,r)){o+=` with value ${i}`}o+=`, got ${r} `;if(Fi(r)){o+=`with value ${l}.`}return o}function Mi(e,t){if(t===\\"String\\"){return`\\"${e}\\"`}else if(t===\\"Number\\"){return`${Number(e)}`}else{return`${e}`}}function Fi(e){const t=[\\"string\\",\\"number\\",\\"boolean\\"];return t.some((t=>e.toLowerCase()===t))}function ji(...e){return e.some((e=>e.toLowerCase()===\\"boolean\\"))}const Vi=e=>e[0]===\\"_\\"||e===\\"$stable\\";const Li=e=>d(e)?e.map(Gl):[Gl(e)];const Bi=(e,t,n)=>{if(t._n){return t}const o=zo(((...n)=>{if(tc){Nn(`Slot \\"${e}\\" invoked outside of the render function: this will not track dependencies used in the slot. Invoke the slot function inside the render function instead.`)}return Li(t(...n))}),n);o._c=false;return o};const Ui=(e,t,n)=>{const o=e._ctx;for(const n in e){if(Vi(n))continue;const s=e[n];if(v(s)){t[n]=Bi(n,s,o)}else if(s!=null){{Nn(`Non-function value encountered for slot \\"${n}\\". Prefer function slots for better performance.`)}const e=Li(s);t[n]=()=>e}}};const Di=(e,t)=>{if(!Ws(e.vnode)&&true){Nn(`Non-function value encountered for default slot. Prefer function slots for better performance.`)}const n=Li(t);e.slots.default=()=>n};const Hi=(e,t)=>{if(e.vnode.shapeFlag&32){const n=t._;if(n){e.slots=en(t);L(t,\\"_\\",n)}else{Ui(t,e.slots={})}}else{e.slots={};if(t){Di(e,t)}}L(e.slots,Ml,1)};const Wi=(e,t,o)=>{const{vnode:s,slots:r}=e;let i=true;let l=n;if(s.shapeFlag&32){const n=t._;if(n){if(ao){a(r,t);Ke(e,\\"set\\",\\"$slots\\")}else if(o&&n===1){i=false}else{a(r,t);if(!o&&n===1){delete r._}}}else{i=!t.$stable;Ui(t,r)}l=t}else if(t){Di(e,t);l={default:1}}if(i){for(const e in r){if(!Vi(e)&&!(e in l)){delete r[e]}}}};function zi(e,t,o,s,r=false){if(d(e)){e.forEach(((e,n)=>zi(e,t&&(d(t)?t[n]:t),o,s,r)));return}if(Us(s)&&!r){return}const i=s.shapeFlag&4?wc(s.component)||s.component.proxy:s.el;const l=r?null:i;const{i:c,r:a}=e;if(!c){Nn(`Missing ref owner context. ref cannot be used on hoisted vnodes. A vnode with ref must be created inside the render function.`);return}const u=t&&t.r;const h=c.refs===n?c.refs={}:c.refs;const m=c.setupState;if(u!=null&&u!==a){if(b(u)){h[u]=null;if(p(m,u)){m[u]=null}}else if(ln(u)){u.value=null}}if(v(a)){jn(a,c,12,[l,h])}else{const t=b(a);const n=ln(a);if(t||n){const s=()=>{if(e.f){const n=t?p(m,a)?m[a]:h[a]:a.value;if(r){d(n)&&f(n,i)}else{if(!d(n)){if(t){h[a]=[i];if(p(m,a)){m[a]=h[a]}}else{a.value=[i];if(e.k)h[e.k]=a.value}}else if(!n.includes(i)){n.push(i)}}}else if(t){h[a]=l;if(p(m,a)){m[a]=l}}else if(n){a.value=l;if(e.k)h[e.k]=l}else{Nn(\\"Invalid template ref type:\\",a,`(${typeof a})`)}};if(l){s.id=-1;tl(s,o)}else{s()}}else{Nn(\\"Invalid template ref type:\\",a,`(${typeof a})`)}}}let Ki=false;const Gi=e=>/svg/.test(e.namespaceURI)&&e.tagName!==\\"foreignObject\\";const Ji=e=>e.nodeType===8;function qi(e){const{mt:t,p:n,o:{patchProp:o,createText:s,nextSibling:r,parentNode:i,remove:c,insert:a,createComment:f}}=e;const u=(e,t)=>{if(!t.hasChildNodes()){Nn(`Attempting to hydrate existing markup but container is empty. Performing full mount instead.`);n(null,e,t);so();t._vnode=e;return}Ki=false;p(t.firstChild,e,null,null,null);so();t._vnode=e;if(Ki&&true){console.error(`Hydration completed but contains mismatches.`)}};const p=(n,o,l,c,f,u=false)=>{const v=Ji(n)&&n.data===\\"[\\";const b=()=>g(n,o,l,c,f,v);const{type:_,ref:w,shapeFlag:x,patchFlag:S}=o;let k=n.nodeType;o.el=n;if(S===-2){u=false;o.dynamicChildren=null}let C=null;switch(_){case vl:if(k!==3){if(o.children===\\"\\"){a(o.el=s(\\"\\"),i(n),n);C=n}else{C=b()}}else{if(n.data!==o.children){Ki=true;Nn(`Hydration text mismatch:\\\\n- Client: ${JSON.stringify(n.data)}\\\\n- Server: ${JSON.stringify(o.children)}`);n.data=o.children}C=r(n)}break;case bl:if(k!==8||v){C=b()}else{C=r(n)}break;case _l:if(v){n=r(n);k=n.nodeType}if(k===1||k===3){C=n;const e=!o.children.length;for(let t=0;t<o.staticCount;t++){if(e)o.children+=C.nodeType===1?C.outerHTML:C.data;if(t===o.staticCount-1){o.anchor=C}C=r(C)}return v?r(C):C}else{b()}break;case yl:if(!v){C=b()}else{C=m(n,o,l,c,f,u)}break;default:if(x&1){if(k!==1||o.type.toLowerCase()!==n.tagName.toLowerCase()){C=b()}else{C=d(n,o,l,c,f,u)}}else if(x&6){o.slotScopeIds=f;const e=i(n);t(o,e,null,l,c,Gi(e),u);C=v?y(n):r(n);if(C&&Ji(C)&&C.data===\\"teleport end\\"){C=r(C)}if(Us(o)){let t;if(v){t=Ll(yl);t.anchor=C?C.previousSibling:e.lastChild}else{t=n.nodeType===3?Wl(\\"\\"):Ll(\\"div\\")}t.el=n;o.component.subTree=t}}else if(x&64){if(k!==8){C=b()}else{C=o.type.hydrate(n,o,l,c,f,u,e,h)}}else if(x&128){C=o.type.hydrate(n,o,l,c,Gi(i(n)),f,u,e,p)}else{Nn(\\"Invalid HostVNode type:\\",_,`(${typeof _})`)}}if(w!=null){zi(w,null,c,o)}return C};const d=(e,t,n,s,r,i)=>{i=i||!!t.dynamicChildren;const{type:a,props:f,patchFlag:u,shapeFlag:p,dirs:d}=t;const m=a===\\"input\\"&&d||a===\\"option\\";{if(d){Es(t,null,n,\\"created\\")}if(f){if(m||!i||u&(16|32)){for(const t in f){if(m&&t.endsWith(\\"value\\")||l(t)&&!E(t)){o(e,t,null,f[t],false,void 0,n)}}}else if(f.onClick){o(e,\\"onClick\\",null,f.onClick,false,void 0,n)}}let a;if(a=f&&f.onVnodeBeforeMount){Zl(a,n,t)}if(d){Es(t,null,n,\\"beforeMount\\")}if((a=f&&f.onVnodeMounted)||d){hs((()=>{a&&Zl(a,n,t);d&&Es(t,null,n,\\"mounted\\")}),s)}if(p&16&&!(f&&(f.innerHTML||f.textContent))){let o=h(e.firstChild,t,e,n,s,r,i);let l=false;while(o){Ki=true;if(!l){Nn(`Hydration children mismatch in <${t.type}>: server rendered element contains more child nodes than client vdom.`);l=true}const e=o;o=o.nextSibling;c(e)}}else if(p&8){if(e.textContent!==t.children){Ki=true;Nn(`Hydration text content mismatch in <${t.type}>:\\\\n- Client: ${e.textContent}\\\\n- Server: ${t.children}`);e.textContent=t.children}}}return e.nextSibling};const h=(e,t,o,s,r,i,l)=>{l=l||!!t.dynamicChildren;const c=t.children;const a=c.length;let f=false;for(let t=0;t<a;t++){const a=l?c[t]:c[t]=Gl(c[t]);if(e){e=p(e,a,s,r,i,l)}else if(a.type===vl&&!a.children){continue}else{Ki=true;if(!f){Nn(`Hydration children mismatch in <${o.tagName.toLowerCase()}>: server rendered element contains fewer child nodes than client vdom.`);f=true}n(null,a,o,null,s,r,Gi(o),i)}}return e};const m=(e,t,n,o,s,l)=>{const{slotScopeIds:c}=t;if(c){s=s?s.concat(c):c}const u=i(e);const p=h(r(e),t,u,n,o,s,l);if(p&&Ji(p)&&p.data===\\"]\\"){return r(t.anchor=p)}else{Ki=true;a(t.anchor=f(`]`),u,p);return p}};const g=(e,t,o,s,l,a)=>{Ki=true;Nn(`Hydration node mismatch:\\\\n- Client vnode:`,t.type,`\\\\n- Server rendered DOM:`,e,e.nodeType===3?`(text)`:Ji(e)&&e.data===\\"[\\"?`(start of fragment)`:``);t.el=null;if(a){const t=y(e);while(true){const n=r(e);if(n&&n!==t){c(n)}else{break}}}const f=r(e);const u=i(e);c(e);n(null,t,u,f,o,s,Gi(u),l);return f};const y=e=>{let t=0;while(e){e=r(e);if(e&&Ji(e)){if(e.data===\\"[\\")t++;if(e.data===\\"]\\"){if(t===0){return r(e)}else{t--}}}}return e};return[u,p]}let Yi;let Zi;function Xi(e,t){if(e.appContext.config.performance&&el()){Zi.mark(`vue-${t}-${e.uid}`)}{Ro(e,t,el()?Zi.now():Date.now())}}function Qi(e,t){if(e.appContext.config.performance&&el()){const n=`vue-${t}-${e.uid}`;const o=n+`:end`;Zi.mark(o);Zi.measure(`<${Cc(e,e.type)}> ${t}`,n,o);Zi.clearMarks(n);Zi.clearMarks(o)}{Po(e,t,el()?Zi.now():Date.now())}}function el(){if(Yi!==void 0){return Yi}if(typeof window!==\\"undefined\\"&&window.performance){Yi=true;Zi=window.performance}else{Yi=false}return Yi}const tl=hs;function nl(e){return sl(e)}function ol(e){return sl(e,qi)}function sl(e,t){const r=H();r.__VUE__=true;{ko(r.__VUE_DEVTOOLS_GLOBAL_HOOK__,r)}const{insert:i,remove:l,patchProp:c,createElement:a,createText:f,createComment:u,setText:p,setElementText:d,parentNode:h,nextSibling:m,setScopeId:g=s,insertStaticContent:y}=e;const v=(e,t,n,o=null,s=null,r=null,i=false,l=null,c=(ao?false:!!t.dynamicChildren))=>{if(e===t){return}if(e&&!Al(e,t)){o=Y(e);z(e,s,r,true);e=null}if(t.patchFlag===-2){c=false;t.dynamicChildren=null}const{type:a,ref:f,shapeFlag:u}=t;switch(a){case vl:b(e,t,n,o);break;case bl:_(e,t,n,o);break;case _l:if(e==null){w(t,n,o,i)}else{x(e,t,n,i)}break;case yl:P(e,t,n,o,s,r,i,l,c);break;default:if(u&1){C(e,t,n,o,s,r,i,l,c)}else if(u&6){I(e,t,n,o,s,r,i,l,c)}else if(u&64){a.process(e,t,n,o,s,r,i,l,c,X)}else if(u&128){a.process(e,t,n,o,s,r,i,l,c,X)}else{Nn(\\"Invalid VNode type:\\",a,`(${typeof a})`)}}if(f!=null&&s){zi(f,e&&e.ref,r,t||e,!t)}};const b=(e,t,n,o)=>{if(e==null){i(t.el=f(t.children),n,o)}else{const n=t.el=e.el;if(t.children!==e.children){p(n,t.children)}}};const _=(e,t,n,o)=>{if(e==null){i(t.el=u(t.children||\\"\\"),n,o)}else{t.el=e.el}};const w=(e,t,n,o)=>{[e.el,e.anchor]=y(e.children,t,n,o,e.el,e.anchor)};const x=(e,t,n,o)=>{if(t.children!==e.children){const s=m(e.anchor);k(e);[t.el,t.anchor]=y(t.children,n,s,o)}else{t.el=e.el;t.anchor=e.anchor}};const S=({el:e,anchor:t},n,o)=>{let s;while(e&&e!==t){s=m(e);i(e,n,o);e=s}i(t,n,o)};const k=({el:e,anchor:t})=>{let n;while(e&&e!==t){n=m(e);l(e);e=n}l(t)};const C=(e,t,n,o,s,r,i,l,c)=>{i=i||t.type===\\"svg\\";if(e==null){$(t,n,o,s,r,i,l,c)}else{O(e,t,s,r,i,l,c)}};const $=(e,t,n,o,s,r,l,f)=>{let u;let p;const{type:h,props:m,shapeFlag:g,transition:y,dirs:v}=e;u=e.el=a(e.type,r,m&&m.is,m);if(g&8){d(u,e.children)}else if(g&16){N(e.children,u,null,o,s,r&&h!==\\"foreignObject\\",l,f)}if(v){Es(e,null,o,\\"created\\")}T(u,e,e.scopeId,l,o);if(m){for(const t in m){if(t!==\\"value\\"&&!E(t)){c(u,t,null,m[t],r,e.children,o,s,q)}}if(\\"value\\"in m){c(u,\\"value\\",null,m.value)}if(p=m.onVnodeBeforeMount){Zl(p,o,e)}}{Object.defineProperty(u,\\"__vnode\\",{value:e,enumerable:false});Object.defineProperty(u,\\"__vueParentComponent\\",{value:o,enumerable:false})}if(v){Es(e,null,o,\\"beforeMount\\")}const b=(!s||s&&!s.pendingBranch)&&y&&!y.persisted;if(b){y.beforeEnter(u)}i(u,t,n);if((p=m&&m.onVnodeMounted)||b||v){tl((()=>{p&&Zl(p,o,e);b&&y.enter(u);v&&Es(e,null,o,\\"mounted\\")}),s)}};const T=(e,t,n,o,s)=>{if(n){g(e,n)}if(o){for(let t=0;t<o.length;t++){g(e,o[t])}}if(s){let n=s.subTree;if(n.patchFlag>0&&n.patchFlag&2048){n=Yo(n.children)||n}if(t===n){const t=s.vnode;T(e,t,t.scopeId,t.slotScopeIds,s.parent)}}};const N=(e,t,n,o,s,r,i,l,c=0)=>{for(let a=c;a<e.length;a++){const c=e[a]=l?Jl(e[a]):Gl(e[a]);v(null,c,t,n,o,s,r,i,l)}};const O=(e,t,o,s,r,i,l)=>{const a=t.el=e.el;let{patchFlag:f,dynamicChildren:u,dirs:p}=t;f|=e.patchFlag&16;const h=e.props||n;const m=t.props||n;let g;o&&rl(o,false);if(g=m.onVnodeBeforeUpdate){Zl(g,o,t,e)}if(p){Es(t,e,o,\\"beforeUpdate\\")}o&&rl(o,true);if(ao){f=0;l=false;u=null}const y=r&&t.type!==\\"foreignObject\\";if(u){A(e.dynamicChildren,u,a,o,s,y,i);{il(e,t)}}else if(!l){B(e,t,a,null,o,s,y,i,false)}if(f>0){if(f&16){R(a,t,h,m,o,s,r)}else{if(f&2){if(h.class!==m.class){c(a,\\"class\\",null,m.class,r)}}if(f&4){c(a,\\"style\\",h.style,m.style,r)}if(f&8){const n=t.dynamicProps;for(let t=0;t<n.length;t++){const i=n[t];const l=h[i];const f=m[i];if(f!==l||i===\\"value\\"){c(a,i,l,f,r,e.children,o,s,q)}}}}if(f&1){if(e.children!==t.children){d(a,t.children)}}}else if(!l&&u==null){R(a,t,h,m,o,s,r)}if((g=m.onVnodeUpdated)||p){tl((()=>{g&&Zl(g,o,t,e);p&&Es(t,e,o,\\"updated\\")}),s)}};const A=(e,t,n,o,s,r,i)=>{for(let l=0;l<t.length;l++){const c=e[l];const a=t[l];const f=c.el&&(c.type===yl||!Al(c,a)||c.shapeFlag&(6|64))?h(c.el):n;v(c,a,f,null,o,s,r,i,true)}};const R=(e,t,o,s,r,i,l)=>{if(o!==s){if(o!==n){for(const n in o){if(!E(n)&&!(n in s)){c(e,n,o[n],null,l,t.children,r,i,q)}}}for(const n in s){if(E(n))continue;const a=s[n];const f=o[n];if(a!==f&&n!==\\"value\\"){c(e,n,f,a,l,t.children,r,i,q)}}if(\\"value\\"in s){c(e,\\"value\\",o.value,s.value)}}};const P=(e,t,n,o,s,r,l,c,a)=>{const u=t.el=e?e.el:f(\\"\\");const p=t.anchor=e?e.anchor:f(\\"\\");let{patchFlag:d,dynamicChildren:h,slotScopeIds:m}=t;if(ao||d&2048){d=0;a=false;h=null}if(m){c=c?c.concat(m):m}if(e==null){i(u,n,o);i(p,n,o);N(t.children,n,p,s,r,l,c,a)}else{if(d>0&&d&64&&h&&e.dynamicChildren){A(e.dynamicChildren,h,n,s,r,l,c);{il(e,t)}}else{B(e,t,n,p,s,r,l,c,a)}}};const I=(e,t,n,o,s,r,i,l,c)=>{t.slotScopeIds=l;if(e==null){if(t.shapeFlag&512){s.ctx.activate(t,n,o,i,c)}else{M(t,n,o,s,r,i,c)}}else{F(e,t,c)}};const M=(e,t,n,o,s,r,i)=>{const l=e.component=ec(e,o,s);if(l.type.__hmrId){po(l)}{Tn(e);Xi(l,`mount`)}if(Ws(e)){l.ctx.renderer=X}{{Xi(l,`init`)}fc(l);{Qi(l,`init`)}}if(l.asyncDep){s&&s.registerDep(l,j);if(!e.el){const e=l.subTree=Ll(bl);_(null,e,t,n)}return}j(l,e,t,n,s,r,i);{En();Qi(l,`mount`)}};const F=(e,t,n)=>{const o=t.component=e.component;if(es(e,t,n)){if(o.asyncDep&&!o.asyncResolved){{Tn(t)}L(o,t,n);{En()}return}else{o.next=t;to(o.update);o.update()}}else{t.el=e.el;o.vnode=t}};const j=(e,t,n,o,s,r,i)=>{const l=()=>{if(!e.isMounted){let i;const{el:l,props:c}=t;const{bm:a,m:f,parent:u}=e;const p=Us(t);rl(e,false);if(a){V(a)}if(!p&&(i=c&&c.onVnodeBeforeMount)){Zl(i,u,t)}rl(e,true);if(l&&ee){const n=()=>{{Xi(e,`render`)}e.subTree=Jo(e);{Qi(e,`render`)}{Xi(e,`hydrate`)}ee(l,e.subTree,e,s,null);{Qi(e,`hydrate`)}};if(p){t.type.__asyncLoader().then((()=>!e.isUnmounted&&n()))}else{n()}}else{{Xi(e,`render`)}const i=e.subTree=Jo(e);{Qi(e,`render`)}{Xi(e,`patch`)}v(null,i,n,o,e,s,r);{Qi(e,`patch`)}t.el=i.el}if(f){tl(f,s)}if(!p&&(i=c&&c.onVnodeMounted)){const e=t;tl((()=>Zl(i,u,e)),s)}if(t.shapeFlag&256||u&&Us(u.vnode)&&u.vnode.shapeFlag&256){e.a&&tl(e.a,s)}e.isMounted=true;{To(e)}t=n=o=null}else{let{next:t,bu:n,u:o,parent:l,vnode:c}=e;let a=t;let f;{Tn(t||e.vnode)}rl(e,false);if(t){t.el=c.el;L(e,t,i)}else{t=c}if(n){V(n)}if(f=t.props&&t.props.onVnodeBeforeUpdate){Zl(f,l,t,c)}rl(e,true);{Xi(e,`render`)}const u=Jo(e);{Qi(e,`render`)}const p=e.subTree;e.subTree=u;{Xi(e,`patch`)}v(p,u,h(p.el),Y(p),e,s,r);{Qi(e,`patch`)}t.el=u.el;if(a===null){ns(e,u.el)}if(o){tl(o,s)}if(f=t.props&&t.props.onVnodeUpdated){tl((()=>Zl(f,l,t,c)),s)}{Eo(e)}{En()}}};const c=e.effect=new Fe(l,(()=>Qn(a)),e.scope);const a=e.update=()=>c.run();a.id=e.uid;rl(e,true);{c.onTrack=e.rtc?t=>V(e.rtc,t):void 0;c.onTrigger=e.rtg?t=>V(e.rtg,t):void 0;a.ownerInstance=e}a()};const L=(e,t,n)=>{t.component=e;const o=e.vnode.props;e.vnode=t;e.next=null;xi(e,t.props,o,n);Wi(e,t.children,n);De();oo();He()};const B=(e,t,n,o,s,r,i,l,c=false)=>{const a=e&&e.children;const f=e?e.shapeFlag:0;const u=t.children;const{patchFlag:p,shapeFlag:h}=t;if(p>0){if(p&128){D(a,u,n,o,s,r,i,l,c);return}else if(p&256){U(a,u,n,o,s,r,i,l,c);return}}if(h&8){if(f&16){q(a,s,r)}if(u!==a){d(n,u)}}else{if(f&16){if(h&16){D(a,u,n,o,s,r,i,l,c)}else{q(a,s,r,true)}}else{if(f&8){d(n,\\"\\")}if(h&16){N(u,n,o,s,r,i,l,c)}}}};const U=(e,t,n,s,r,i,l,c,a)=>{e=e||o;t=t||o;const f=e.length;const u=t.length;const p=Math.min(f,u);let d;for(d=0;d<p;d++){const o=t[d]=a?Jl(t[d]):Gl(t[d]);v(e[d],o,n,null,r,i,l,c,a)}if(f>u){q(e,r,i,true,false,p)}else{N(t,n,s,r,i,l,c,a,p)}};const D=(e,t,n,s,r,i,l,c,a)=>{let f=0;const u=t.length;let p=e.length-1;let d=u-1;while(f<=p&&f<=d){const o=e[f];const s=t[f]=a?Jl(t[f]):Gl(t[f]);if(Al(o,s)){v(o,s,n,null,r,i,l,c,a)}else{break}f++}while(f<=p&&f<=d){const o=e[p];const s=t[d]=a?Jl(t[d]):Gl(t[d]);if(Al(o,s)){v(o,s,n,null,r,i,l,c,a)}else{break}p--;d--}if(f>p){if(f<=d){const e=d+1;const o=e<u?t[e].el:s;while(f<=d){v(null,t[f]=a?Jl(t[f]):Gl(t[f]),n,o,r,i,l,c,a);f++}}}else if(f>d){while(f<=p){z(e[f],r,i,true);f++}}else{const h=f;const m=f;const g=new Map;for(f=m;f<=d;f++){const e=t[f]=a?Jl(t[f]):Gl(t[f]);if(e.key!=null){if(g.has(e.key)){Nn(`Duplicate keys found during update:`,JSON.stringify(e.key),`Make sure keys are unique.`)}g.set(e.key,f)}}let y;let b=0;const _=d-m+1;let w=false;let x=0;const S=new Array(_);for(f=0;f<_;f++)S[f]=0;for(f=h;f<=p;f++){const o=e[f];if(b>=_){z(o,r,i,true);continue}let s;if(o.key!=null){s=g.get(o.key)}else{for(y=m;y<=d;y++){if(S[y-m]===0&&Al(o,t[y])){s=y;break}}}if(s===void 0){z(o,r,i,true)}else{S[s-m]=f+1;if(s>=x){x=s}else{w=true}v(o,t[s],n,null,r,i,l,c,a);b++}}const k=w?ll(S):o;y=k.length-1;for(f=_-1;f>=0;f--){const e=m+f;const o=t[e];const p=e+1<u?t[e+1].el:s;if(S[f]===0){v(null,o,n,p,r,i,l,c,a)}else if(w){if(y<0||f!==k[y]){W(o,n,p,2)}else{y--}}}}};const W=(e,t,n,o,s=null)=>{const{el:r,type:l,transition:c,children:a,shapeFlag:f}=e;if(f&6){W(e.component.subTree,t,n,o);return}if(f&128){e.suspense.move(t,n,o);return}if(f&64){l.move(e,t,n,X);return}if(l===yl){i(r,t,n);for(let e=0;e<a.length;e++){W(a[e],t,n,o)}i(e.anchor,t,n);return}if(l===_l){S(e,t,n);return}const u=o!==2&&f&1&&c;if(u){if(o===0){c.beforeEnter(r);i(r,t,n);tl((()=>c.enter(r)),s)}else{const{leave:e,delayLeave:o,afterLeave:s}=c;const l=()=>i(r,t,n);const a=()=>{e(r,(()=>{l();s&&s()}))};if(o){o(r,l,a)}else{a()}}}else{i(r,t,n)}};const z=(e,t,n,o=false,s=false)=>{const{type:r,props:i,ref:l,children:c,dynamicChildren:a,shapeFlag:f,patchFlag:u,dirs:p}=e;if(l!=null){zi(l,null,n,e,true)}if(f&256){t.ctx.deactivate(e);return}const d=f&1&&p;const h=!Us(e);let m;if(h&&(m=i&&i.onVnodeBeforeUnmount)){Zl(m,t,e)}if(f&6){J(e.component,n,o)}else{if(f&128){e.suspense.unmount(n,o);return}if(d){Es(e,null,t,\\"beforeUnmount\\")}if(f&64){e.type.remove(e,t,n,s,X,o)}else if(a&&(r!==yl||u>0&&u&64)){q(a,t,n,false,true)}else if(r===yl&&u&(128|256)||!s&&f&16){q(c,t,n)}if(o){K(e)}}if(h&&(m=i&&i.onVnodeUnmounted)||d){tl((()=>{m&&Zl(m,t,e);d&&Es(e,null,t,\\"unmounted\\")}),n)}};const K=e=>{const{type:t,el:n,anchor:o,transition:s}=e;if(t===yl){if(e.patchFlag>0&&e.patchFlag&2048&&s&&!s.persisted){e.children.forEach((e=>{if(e.type===bl){l(e.el)}else{K(e)}}))}else{G(n,o)}return}if(t===_l){k(e);return}const r=()=>{l(n);if(s&&!s.persisted&&s.afterLeave){s.afterLeave()}};if(e.shapeFlag&1&&s&&!s.persisted){const{leave:t,delayLeave:o}=s;const i=()=>t(n,r);if(o){o(e.el,r,i)}else{i()}}else{r()}};const G=(e,t)=>{let n;while(e!==t){n=m(e);l(e);e=n}l(t)};const J=(e,t,n)=>{if(e.type.__hmrId){ho(e)}const{bum:o,scope:s,update:r,subTree:i,um:l}=e;if(o){V(o)}s.stop();if(r){r.active=false;z(i,e,t,n)}if(l){tl(l,t)}tl((()=>{e.isUnmounted=true}),t);if(t&&t.pendingBranch&&!t.isUnmounted&&e.asyncDep&&!e.asyncResolved&&e.suspenseId===t.pendingId){t.deps--;if(t.deps===0){t.resolve()}}{Oo(e)}};const q=(e,t,n,o=false,s=false,r=0)=>{for(let i=r;i<e.length;i++){z(e[i],t,n,o,s)}};const Y=e=>{if(e.shapeFlag&6){return Y(e.component.subTree)}if(e.shapeFlag&128){return e.suspense.next()}return m(e.anchor||e.el)};const Z=(e,t,n)=>{if(e==null){if(t._vnode){z(t._vnode,null,null,true)}}else{v(t._vnode||null,e,t,null,null,null,n)}oo();so();t._vnode=e};const X={p:v,um:z,m:W,r:K,mt:M,mc:N,pc:B,pbc:A,n:Y,o:e};let Q;let ee;if(t){[Q,ee]=t(X)}return{render:Z,hydrate:Q,createApp:mi(Z,Q)}}function rl({effect:e,update:t},n){e.allowRecurse=t.allowRecurse=n}function il(e,t,n=false){const o=e.children;const s=t.children;if(d(o)&&d(s)){for(let e=0;e<o.length;e++){const t=o[e];let r=s[e];if(r.shapeFlag&1&&!r.dynamicChildren){if(r.patchFlag<=0||r.patchFlag===32){r=s[e]=Jl(s[e]);r.el=t.el}if(!n)il(t,r)}if(r.type===vl){r.el=t.el}if(r.type===bl&&!r.el){r.el=t.el}}}}function ll(e){const t=e.slice();const n=[0];let o,s,r,i,l;const c=e.length;for(o=0;o<c;o++){const c=e[o];if(c!==0){s=n[n.length-1];if(e[s]<c){t[o]=s;n.push(o);continue}r=0;i=n.length-1;while(r<i){l=r+i>>1;if(e[n[l]]<c){r=l+1}else{i=l}}if(c<e[n[r]]){if(r>0){t[o]=n[r-1]}n[r]=o}}}r=n.length;i=n[r-1];while(r-- >0){n[r]=i;i=t[i]}return n}const cl=e=>e.__isTeleport;const al=e=>e&&(e.disabled||e.disabled===\\"\\");const fl=e=>typeof SVGElement!==\\"undefined\\"&&e instanceof SVGElement;const ul=(e,t)=>{const n=e&&e.to;if(b(n)){if(!t){Nn(`Current renderer does not support string target for Teleports. (missing querySelector renderer option)`);return null}else{const e=t(n);if(!e){Nn(`Failed to locate Teleport target with selector \\"${n}\\". Note the target element must exist before the component is mounted - i.e. the target cannot be rendered by the component itself, and ideally should be outside of the entire Vue component tree.`)}return e}}else{if(!n&&!al(e)){Nn(`Invalid Teleport target: ${n}`)}return n}};const pl={__isTeleport:true,process(e,t,n,o,s,r,i,l,c,a){const{mc:f,pc:u,pbc:p,o:{insert:d,querySelector:h,createText:m,createComment:g}}=a;const y=al(t.props);let{shapeFlag:v,children:b,dynamicChildren:_}=t;if(ao){c=false;_=null}if(e==null){const e=t.el=g(\\"teleport start\\");const a=t.anchor=g(\\"teleport end\\");d(e,n,o);d(a,n,o);const u=t.target=ul(t.props,h);const p=t.targetAnchor=m(\\"\\");if(u){d(p,u);i=i||fl(u)}else if(!y){Nn(\\"Invalid Teleport target on mount:\\",u,`(${typeof u})`)}const _=(e,t)=>{if(v&16){f(b,e,t,s,r,i,l,c)}};if(y){_(n,a)}else if(u){_(u,p)}}else{t.el=e.el;const o=t.anchor=e.anchor;const f=t.target=e.target;const d=t.targetAnchor=e.targetAnchor;const m=al(e.props);const g=m?n:f;const v=m?o:d;i=i||fl(f);if(_){p(e.dynamicChildren,_,g,s,r,i,l);il(e,t,true)}else if(!c){u(e,t,g,v,s,r,i,l,false)}if(y){if(!m){dl(t,n,o,a,1)}}else{if((t.props&&t.props.to)!==(e.props&&e.props.to)){const e=t.target=ul(t.props,h);if(e){dl(t,e,null,a,0)}else{Nn(\\"Invalid Teleport target on update:\\",f,`(${typeof f})`)}}else if(m){dl(t,f,d,a,1)}}}gl(t)},remove(e,t,n,o,{um:s,o:{remove:r}},i){const{shapeFlag:l,children:c,anchor:a,targetAnchor:f,target:u,props:p}=e;if(u){r(f)}if(i||!al(p)){r(a);if(l&16){for(let e=0;e<c.length;e++){const o=c[e];s(o,t,n,true,!!o.dynamicChildren)}}}},move:dl,hydrate:hl};function dl(e,t,n,{o:{insert:o},m:s},r=2){if(r===0){o(e.targetAnchor,t,n)}const{el:i,anchor:l,shapeFlag:c,children:a,props:f}=e;const u=r===2;if(u){o(i,t,n)}if(!u||al(f)){if(c&16){for(let e=0;e<a.length;e++){s(a[e],t,n,2)}}}if(u){o(l,t,n)}}function hl(e,t,n,o,s,r,{o:{nextSibling:i,parentNode:l,querySelector:c}},a){const f=t.target=ul(t.props,c);if(f){const c=f._lpa||f.firstChild;if(t.shapeFlag&16){if(al(t.props)){t.anchor=a(i(e),t,l(e),n,o,s,r);t.targetAnchor=c}else{t.anchor=i(e);let l=c;while(l){l=i(l);if(l&&l.nodeType===8&&l.data===\\"teleport anchor\\"){t.targetAnchor=l;f._lpa=t.targetAnchor&&i(t.targetAnchor);break}}a(c,t,f,n,o,s,r)}}gl(t)}return t.anchor&&i(t.anchor)}const ml=pl;function gl(e){const t=e.ctx;if(t&&t.ut){let n=e.children[0].el;while(n!==e.targetAnchor){if(n.nodeType===1)n.setAttribute(\\"data-v-owner\\",t.uid);n=n.nextSibling}t.ut()}}const yl=Symbol.for(\\"v-fgt\\");const vl=Symbol.for(\\"v-txt\\");const bl=Symbol.for(\\"v-cmt\\");const _l=Symbol.for(\\"v-stc\\");const wl=[];let xl=null;function Sl(e=false){wl.push(xl=e?null:[])}function kl(){wl.pop();xl=wl[wl.length-1]||null}let Cl=1;function $l(e){Cl+=e}function Tl(e){e.dynamicChildren=Cl>0?xl||o:null;kl();if(Cl>0&&xl){xl.push(e)}return e}function El(e,t,n,o,s,r){return Tl(Vl(e,t,n,o,s,r,true))}function Nl(e,t,n,o,s){return Tl(Ll(e,t,n,o,s,true))}function Ol(e){return e?e.__v_isVNode===true:false}function Al(e,t){if(t.shapeFlag&6&&fo.has(t.type)){e.shapeFlag&=~256;t.shapeFlag&=~512;return false}return e.type===t.type&&e.key===t.key}let Rl;function Pl(e){Rl=e}const Il=(...e)=>Bl(...Rl?Rl(e,Lo):e);const Ml=`__vInternal`;const Fl=({key:e})=>e!=null?e:null;const jl=({ref:e,ref_key:t,ref_for:n})=>{if(typeof e===\\"number\\"){e=\\"\\"+e}return e!=null?b(e)||ln(e)||v(e)?{i:Lo,r:e,k:t,f:!!n}:e:null};function Vl(e,t=null,n=null,o=0,s=null,r=(e===yl?0:1),i=false,l=false){const c={__v_isVNode:true,__v_skip:true,type:e,props:t,key:t&&Fl(t),ref:t&&jl(t),scopeId:Bo,slotScopeIds:null,children:n,component:null,suspense:null,ssContent:null,ssFallback:null,dirs:null,transition:null,el:null,anchor:null,target:null,targetAnchor:null,staticCount:0,shapeFlag:r,patchFlag:o,dynamicProps:s,dynamicChildren:null,appContext:null,ctx:Lo};if(l){ql(c,n);if(r&128){e.normalize(c)}}else if(n){c.shapeFlag|=b(n)?8:16}if(c.key!==c.key){Nn(`VNode created with invalid key (NaN). VNode type:`,c.type)}if(Cl>0&&!i&&xl&&(c.patchFlag>0||r&6)&&c.patchFlag!==32){xl.push(c)}return c}const Ll=Il;function Bl(e,t=null,n=null,o=0,s=null,r=false){if(!e||e===mr){if(!e){Nn(`Invalid vnode type when creating vnode: ${e}.`)}e=bl}if(Ol(e)){const o=Dl(e,t,true);if(n){ql(o,n)}if(Cl>0&&!r&&xl){if(o.shapeFlag&6){xl[xl.indexOf(e)]=o}else{xl.push(o)}}o.patchFlag|=-2;return o}if($c(e)){e=e.__vccOpts}if(t){t=Ul(t);let{class:e,style:n}=t;if(e&&!b(e)){t.class=te(e)}if(w(n)){if(Qt(n)&&!d(n)){n=a({},n)}t.style=Y(n)}}const i=b(e)?1:os(e)?128:cl(e)?64:w(e)?4:v(e)?2:0;if(i&4&&Qt(e)){e=en(e);Nn(`Vue received a Component which was made a reactive object. This can lead to unnecessary performance overhead, and should be avoided by marking the component with \\\\`markRaw\\\\` or using \\\\`shallowRef\\\\` instead of \\\\`ref\\\\`.`,`\\\\nComponent that was made reactive: `,e)}return Vl(e,t,n,o,s,i,r,true)}function Ul(e){if(!e)return null;return Qt(e)||Ml in e?a({},e):e}function Dl(e,t,n=false){const{props:o,ref:s,patchFlag:r,children:i}=e;const l=t?Yl(o||{},t):o;const c={__v_isVNode:true,__v_skip:true,type:e.type,props:l,key:l&&Fl(l),ref:t&&t.ref?n&&s?d(s)?s.concat(jl(t)):[s,jl(t)]:jl(t):s,scopeId:e.scopeId,slotScopeIds:e.slotScopeIds,children:r===-1&&d(i)?i.map(Hl):i,target:e.target,targetAnchor:e.targetAnchor,staticCount:e.staticCount,shapeFlag:e.shapeFlag,patchFlag:t&&e.type!==yl?r===-1?16:r|16:r,dynamicProps:e.dynamicProps,dynamicChildren:e.dynamicChildren,appContext:e.appContext,dirs:e.dirs,transition:e.transition,component:e.component,suspense:e.suspense,ssContent:e.ssContent&&Dl(e.ssContent),ssFallback:e.ssFallback&&Dl(e.ssFallback),el:e.el,anchor:e.anchor,ctx:e.ctx,ce:e.ce};return c}function Hl(e){const t=Dl(e);if(d(e.children)){t.children=e.children.map(Hl)}return t}function Wl(e=\\" \\",t=0){return Ll(vl,null,e,t)}function zl(e,t){const n=Ll(_l,null,e);n.staticCount=t;return n}function Kl(e=\\"\\",t=false){return t?(Sl(),Nl(bl,null,e)):Ll(bl,null,e)}function Gl(e){if(e==null||typeof e===\\"boolean\\"){return Ll(bl)}else if(d(e)){return Ll(yl,null,e.slice())}else if(typeof e===\\"object\\"){return Jl(e)}else{return Ll(vl,null,String(e))}}function Jl(e){return e.el===null&&e.patchFlag!==-1||e.memo?e:Dl(e)}function ql(e,t){let n=0;const{shapeFlag:o}=e;if(t==null){t=null}else if(d(t)){n=16}else if(typeof t===\\"object\\"){if(o&(1|64)){const n=t.default;if(n){n._c&&(n._d=false);ql(e,n());n._c&&(n._d=true)}return}else{n=32;const o=t._;if(!o&&!(Ml in t)){t._ctx=Lo}else if(o===3&&Lo){if(Lo.slots._===1){t._=1}else{t._=2;e.patchFlag|=1024}}}}else if(v(t)){t={default:t,_ctx:Lo};n=32}else{t=String(t);if(o&64){n=16;t=[Wl(t)]}else{n=8}}e.children=t;e.shapeFlag|=n}function Yl(...e){const t={};for(let n=0;n<e.length;n++){const o=e[n];for(const e in o){if(e===\\"class\\"){if(t.class!==o.class){t.class=te([t.class,o.class])}}else if(e===\\"style\\"){t.style=Y([t.style,o.style])}else if(l(e)){const n=t[e];const s=o[e];if(s&&n!==s&&!(d(n)&&n.includes(s))){t[e]=n?[].concat(n,s):s}}else if(e!==\\"\\"){t[e]=o[e]}}}return t}function Zl(e,t,n,o=null){Vn(e,t,7,[n,o])}const Xl=di();let Ql=0;function ec(e,t,o){const s=e.type;const r=(t?t.appContext:e.appContext)||Xl;const i={uid:Ql++,vnode:e,type:s,parent:t,appContext:r,root:null,next:null,subTree:null,effect:null,update:null,scope:new be(true),render:null,proxy:null,exposed:null,exposeProxy:null,withProxy:null,provides:t?t.provides:Object.create(r.provides),accessCache:null,renderCache:[],components:null,directives:null,propsOptions:Ci(s,r),emitsOptions:jo(s,r),emit:null,emitted:null,propsDefaults:n,inheritAttrs:s.inheritAttrs,ctx:n,data:n,props:n,attrs:n,slots:n,refs:n,setupState:n,setupContext:null,attrsProxy:null,slotsProxy:null,suspense:o,suspenseId:o?o.pendingId:0,asyncDep:null,asyncResolved:false,isMounted:false,isUnmounted:false,isDeactivated:false,bc:null,c:null,bm:null,m:null,bu:null,u:null,um:null,bum:null,da:null,a:null,rtg:null,rtc:null,ec:null,sp:null};{i.ctx=Ar(i)}i.root=t?t.root:i;i.emit=Fo.bind(null,i);if(e.ce){e.ce(i)}return i}let tc=null;const nc=()=>tc||Lo;let oc;{oc=e=>{tc=e}}const sc=e=>{oc(e);e.scope.on()};const rc=()=>{tc&&tc.scope.off();oc(null)};const ic=t(\\"slot,component\\");function lc(e,t){const n=t.isNativeTag||r;if(ic(e)||n(e)){Nn(\\"Do not use built-in or reserved HTML elements as component id: \\"+e)}}function cc(e){return e.vnode.shapeFlag&4}let ac=false;function fc(e,t=false){ac=t;const{props:n,children:o}=e.vnode;const s=cc(e);_i(e,n,s,t);Hi(e,o);const r=s?uc(e,t):void 0;ac=false;return r}function uc(e,t){var n;const o=e.type;{if(o.name){lc(o.name,e.appContext.config)}if(o.components){const t=Object.keys(o.components);for(let n=0;n<t.length;n++){lc(t[n],e.appContext.config)}}if(o.directives){const e=Object.keys(o.directives);for(let t=0;t<e.length;t++){$s(e[t])}}if(o.compilerOptions&&gc()){Nn(`\\"compilerOptions\\" is only supported when using a build of Vue that includes the runtime compiler. Since you are using a runtime-only build, the options should be passed via your build tool config instead.`)}}e.accessCache=Object.create(null);e.proxy=tn(new Proxy(e.ctx,Nr));{Rr(e)}const{setup:s}=o;if(s){const r=e.setupContext=s.length>1?_c(e):null;sc(e);De();const i=jn(s,e,0,[Jt(e.props),r]);He();rc();if(x(i)){i.then(rc,rc);if(t){return i.then((n=>{pc(e,n,t)})).catch((t=>{Ln(t,e,0)}))}else{e.asyncDep=i;if(!e.suspense){const e=(n=o.name)!=null?n:\\"Anonymous\\";Nn(`Component <${e}>: setup function returned a promise, but no <Suspense> boundary was found in the parent component tree. A component with async setup() must be nested in a <Suspense> in order to be rendered.`)}}}else{pc(e,i,t)}}else{yc(e,t)}}function pc(e,t,n){if(v(t)){{e.render=t}}else if(w(t)){if(Ol(t)){Nn(`setup() should not return VNodes directly - return a render function instead.`)}{e.devtoolsRawSetupState=t}e.setupState=gn(t);{Pr(e)}}else if(t!==void 0){Nn(`setup() should return an object. Received: ${t===null?\\"null\\":typeof t}`)}yc(e,n)}let dc;let hc;function mc(e){dc=e;hc=e=>{if(e.render._rc){e.withProxy=new Proxy(e.ctx,Or)}}}const gc=()=>!dc;function yc(e,t,n){const o=e.type;if(!e.render){if(!t&&dc&&!o.render){const t=o.template||oi(e).template;if(t){{Xi(e,`compile`)}const{isCustomElement:n,compilerOptions:s}=e.appContext.config;const{delimiters:r,compilerOptions:i}=o;const l=a(a({isCustomElement:n,delimiters:r},s),i);o.render=dc(t,l);{Qi(e,`compile`)}}}e.render=o.render||s;if(hc){hc(e)}}{sc(e);De();Qr(e);He();rc()}if(!o.render&&e.render===s&&!t){if(!dc&&o.template){Nn(`Component provided template option but runtime compilation is not supported in this build of Vue.`+` Use \\"vue.global.js\\" instead.`)}else{Nn(`Component is missing template or render function.`)}}}function vc(e){return e.attrsProxy||(e.attrsProxy=new Proxy(e.attrs,{get(t,n){Go();We(e,\\"get\\",\\"$attrs\\");return t[n]},set(){Nn(`setupContext.attrs is readonly.`);return false},deleteProperty(){Nn(`setupContext.attrs is readonly.`);return false}}))}function bc(e){return e.slotsProxy||(e.slotsProxy=new Proxy(e.slots,{get(t,n){We(e,\\"get\\",\\"$slots\\");return t[n]}}))}function _c(e){const t=t=>{{if(e.exposed){Nn(`expose() should be called only once per setup().`)}if(t!=null){let e=typeof t;if(e===\\"object\\"){if(d(t)){e=\\"array\\"}else if(ln(t)){e=\\"ref\\"}}if(e!==\\"object\\"){Nn(`expose() should be passed a plain object, received ${e}.`)}}}e.exposed=t||{}};{return Object.freeze({get attrs(){return vc(e)},get slots(){return bc(e)},get emit(){return(t,...n)=>e.emit(t,...n)},expose:t})}}function wc(e){if(e.exposed){return e.exposeProxy||(e.exposeProxy=new Proxy(gn(tn(e.exposed)),{get(t,n){if(n in t){return t[n]}else if(n in $r){return $r[n](e)}},has(e,t){return t in e||t in $r}}))}}const xc=/(?:^|[-_])(\\\\w)/g;const Sc=e=>e.replace(xc,(e=>e.toUpperCase())).replace(/[-_]/g,\\"\\");function kc(e,t=true){return v(e)?e.displayName||e.name:e.name||t&&e.__name}function Cc(e,t,n=false){let o=kc(t);if(!o&&t.__file){const e=t.__file.match(/([^/\\\\\\\\]+)\\\\.\\\\w+$/);if(e){o=e[1]}}if(!o&&e&&e.parent){const n=e=>{for(const n in e){if(e[n]===t){return n}}};o=n(e.components||e.parent.type.components)||n(e.appContext.components)}return o?Sc(o):n?`App`:`Anonymous`}function $c(e){return v(e)&&\\"__vccOpts\\"in e}const Tc=(e,t)=>Cn(e,t,ac);function Ec(e,t,n){const o=arguments.length;if(o===2){if(w(t)&&!d(t)){if(Ol(t)){return Ll(e,null,[t])}return Ll(e,t)}else{return Ll(e,null,t)}}else{if(o>3){n=Array.prototype.slice.call(arguments,2)}else if(o===3&&Ol(n)){n=[n]}return Ll(e,t,n)}}const Nc=Symbol.for(\\"v-scx\\");const Oc=()=>{{Nn(`useSSRContext() is not supported in the global build.`)}};function Ac(){if(typeof window===\\"undefined\\"){return}const e={style:\\"color:#3ba776\\"};const t={style:\\"color:#0b1bc9\\"};const o={style:\\"color:#b62e24\\"};const s={style:\\"color:#9d288c\\"};const r={header(t){if(!w(t)){return null}if(t.__isVue){return[\\"div\\",e,`VueInstance`]}else if(ln(t)){return[\\"div\\",{},[\\"span\\",e,p(t)],\\"<\\",c(t.value),`>`]}else if(Yt(t)){return[\\"div\\",{},[\\"span\\",e,Xt(t)?\\"ShallowReactive\\":\\"Reactive\\"],\\"<\\",c(t),`>${Zt(t)?` (readonly)`:``}`]}else if(Zt(t)){return[\\"div\\",{},[\\"span\\",e,Xt(t)?\\"ShallowReadonly\\":\\"Readonly\\"],\\"<\\",c(t),\\">\\"]}return null},hasBody(e){return e&&e.__isVue},body(e){if(e&&e.__isVue){return[\\"div\\",{},...i(e.$)]}}};function i(e){const t=[];if(e.type.props&&e.props){t.push(l(\\"props\\",en(e.props)))}if(e.setupState!==n){t.push(l(\\"setup\\",e.setupState))}if(e.data!==n){t.push(l(\\"data\\",en(e.data)))}const o=f(e,\\"computed\\");if(o){t.push(l(\\"computed\\",o))}const r=f(e,\\"inject\\");if(r){t.push(l(\\"injected\\",r))}t.push([\\"div\\",{},[\\"span\\",{style:s.style+\\";opacity:0.66\\"},\\"$ (internal): \\"],[\\"object\\",{object:e}]]);return t}function l(e,t){t=a({},t);if(!Object.keys(t).length){return[\\"span\\",{}]}return[\\"div\\",{style:\\"line-height:1.25em;margin-bottom:0.6em\\"},[\\"div\\",{style:\\"color:#476582\\"},e],[\\"div\\",{style:\\"padding-left:1.25em\\"},...Object.keys(t).map((e=>[\\"div\\",{},[\\"span\\",s,e+\\": \\"],c(t[e],false)]))]]}function c(e,n=true){if(typeof e===\\"number\\"){return[\\"span\\",t,e]}else if(typeof e===\\"string\\"){return[\\"span\\",o,JSON.stringify(e)]}else if(typeof e===\\"boolean\\"){return[\\"span\\",s,e]}else if(w(e)){return[\\"object\\",{object:n?en(e):e}]}else{return[\\"span\\",o,String(e)]}}function f(e,t){const n=e.type;if(v(n)){return}const o={};for(const s in e.ctx){if(u(n,s,t)){o[s]=e.ctx[s]}}return o}function u(e,t,n){const o=e[n];if(d(o)&&o.includes(t)||w(o)&&t in o){return true}if(e.extends&&u(e.extends,t,n)){return true}if(e.mixins&&e.mixins.some((e=>u(e,t,n)))){return true}}function p(e){if(Xt(e)){return`ShallowRef`}if(e.effect){return`ComputedRef`}return`Ref`}if(window.devtoolsFormatters){window.devtoolsFormatters.push(r)}else{window.devtoolsFormatters=[r]}}function Rc(e,t,n,o){const s=n[o];if(s&&Pc(s,e)){return s}const r=t();r.memo=e.slice();return n[o]=r}function Pc(e,t){const n=e.memo;if(n.length!=t.length){return false}for(let e=0;e<n.length;e++){if(j(n[e],t[e])){return false}}if(Cl>0&&xl){xl.push(e)}return true}const Ic=\\"3.3.4\\";const Mc=null;const Fc=null;const jc=null;const Vc=\\"http://www.w3.org/2000/svg\\";const Lc=typeof document!==\\"undefined\\"?document:null;const Bc=Lc&&Lc.createElement(\\"template\\");const Uc={insert:(e,t,n)=>{t.insertBefore(e,n||null)},remove:e=>{const t=e.parentNode;if(t){t.removeChild(e)}},createElement:(e,t,n,o)=>{const s=t?Lc.createElementNS(Vc,e):Lc.createElement(e,n?{is:n}:void 0);if(e===\\"select\\"&&o&&o.multiple!=null){s.setAttribute(\\"multiple\\",o.multiple)}return s},createText:e=>Lc.createTextNode(e),createComment:e=>Lc.createComment(e),setText:(e,t)=>{e.nodeValue=t},setElementText:(e,t)=>{e.textContent=t},parentNode:e=>e.parentNode,nextSibling:e=>e.nextSibling,querySelector:e=>Lc.querySelector(e),setScopeId(e,t){e.setAttribute(t,\\"\\")},insertStaticContent(e,t,n,o,s,r){const i=n?n.previousSibling:t.lastChild;if(s&&(s===r||s.nextSibling)){while(true){t.insertBefore(s.cloneNode(true),n);if(s===r||!(s=s.nextSibling))break}}else{Bc.innerHTML=o?`<svg>${e}</svg>`:e;const s=Bc.content;if(o){const e=s.firstChild;while(e.firstChild){s.appendChild(e.firstChild)}s.removeChild(e)}t.insertBefore(s,n)}return[i?i.nextSibling:t.firstChild,n?n.previousSibling:t.lastChild]}};function Dc(e,t,n){const o=e._vtc;if(o){t=(t?[t,...o]:[...o]).join(\\" \\")}if(t==null){e.removeAttribute(\\"class\\")}else if(n){e.setAttribute(\\"class\\",t)}else{e.className=t}}function Hc(e,t,n){const o=e.style;const s=b(n);if(n&&!s){if(t&&!b(t)){for(const e in t){if(n[e]==null){Kc(o,e,\\"\\")}}}for(const e in n){Kc(o,e,n[e])}}else{const r=o.display;if(s){if(t!==n){o.cssText=n}}else if(t){e.removeAttribute(\\"style\\")}if(\\"_vod\\"in e){o.display=r}}}const Wc=/[^\\\\\\\\];\\\\s*$/;const zc=/\\\\s*!important$/;function Kc(e,t,n){if(d(n)){n.forEach((n=>Kc(e,t,n)))}else{if(n==null)n=\\"\\";{if(Wc.test(n)){Nn(`Unexpected semicolon at the end of \'${t}\' style value: \'${n}\'`)}}if(t.startsWith(\\"--\\")){e.setProperty(t,n)}else{const o=qc(e,t);if(zc.test(n)){e.setProperty(I(o),n.replace(zc,\\"\\"),\\"important\\")}else{e[o]=n}}}}const Gc=[\\"Webkit\\",\\"Moz\\",\\"ms\\"];const Jc={};function qc(e,t){const n=Jc[t];if(n){return n}let o=R(t);if(o!==\\"filter\\"&&o in e){return Jc[t]=o}o=M(o);for(let n=0;n<Gc.length;n++){const s=Gc[n]+o;if(s in e){return Jc[t]=s}}return t}const Yc=\\"http://www.w3.org/1999/xlink\\";function Zc(e,t,n,o,s){if(o&&t.startsWith(\\"xlink:\\")){if(n==null){e.removeAttributeNS(Yc,t.slice(6,t.length))}else{e.setAttributeNS(Yc,t,n)}}else{const o=fe(t);if(n==null||o&&!ue(n)){e.removeAttribute(t)}else{e.setAttribute(t,o?\\"\\":n)}}}function Xc(e,t,n,o,s,r,i){if(t===\\"innerHTML\\"||t===\\"textContent\\"){if(o){i(o,s,r)}e[t]=n==null?\\"\\":n;return}const l=e.tagName;if(t===\\"value\\"&&l!==\\"PROGRESS\\"&&!l.includes(\\"-\\")){e._value=n;const o=l===\\"OPTION\\"?e.getAttribute(\\"value\\"):e.value;const s=n==null?\\"\\":n;if(o!==s){e.value=s}if(n==null){e.removeAttribute(t)}return}let c=false;if(n===\\"\\"||n==null){const o=typeof e[t];if(o===\\"boolean\\"){n=ue(n)}else if(n==null&&o===\\"string\\"){n=\\"\\";c=true}else if(o===\\"number\\"){n=0;c=true}}try{e[t]=n}catch(e){if(!c){Nn(`Failed setting prop \\"${t}\\" on <${l.toLowerCase()}>: value ${n} is invalid.`,e)}}c&&e.removeAttribute(t)}function Qc(e,t,n,o){e.addEventListener(t,n,o)}function ea(e,t,n,o){e.removeEventListener(t,n,o)}function ta(e,t,n,o,s=null){const r=e._vei||(e._vei={});const i=r[t];if(o&&i){i.value=o}else{const[n,l]=oa(t);if(o){const i=r[t]=la(o,s);Qc(e,n,i,l)}else if(i){ea(e,n,i,l);r[t]=void 0}}}const na=/(?:Once|Passive|Capture)$/;function oa(e){let t;if(na.test(e)){t={};let n;while(n=e.match(na)){e=e.slice(0,e.length-n[0].length);t[n[0].toLowerCase()]=true}}const n=e[2]===\\":\\"?e.slice(3):I(e.slice(2));return[n,t]}let sa=0;const ra=Promise.resolve();const ia=()=>sa||(ra.then((()=>sa=0)),sa=Date.now());function la(e,t){const n=e=>{if(!e._vts){e._vts=Date.now()}else if(e._vts<=n.attached){return}Vn(ca(e,n.value),t,5,[e])};n.value=e;n.attached=ia();return n}function ca(e,t){if(d(t)){const n=e.stopImmediatePropagation;e.stopImmediatePropagation=()=>{n.call(e);e._stopped=true};return t.map((e=>t=>!t._stopped&&e&&e(t)))}else{return t}}const aa=/^on[a-z]/;const fa=(e,t,n,o,s=false,r,i,a,f)=>{if(t===\\"class\\"){Dc(e,o,s)}else if(t===\\"style\\"){Hc(e,n,o)}else if(l(t)){if(!c(t)){ta(e,t,n,o,i)}}else if(t[0]===\\".\\"?(t=t.slice(1),true):t[0]===\\"^\\"?(t=t.slice(1),false):ua(e,t,o,s)){Xc(e,t,o,r,i,a,f)}else{if(t===\\"true-value\\"){e._trueValue=o}else if(t===\\"false-value\\"){e._falseValue=o}Zc(e,t,o,s)}};function ua(e,t,n,o){if(o){if(t===\\"innerHTML\\"||t===\\"textContent\\"){return true}if(t in e&&aa.test(t)&&v(n)){return true}return false}if(t===\\"spellcheck\\"||t===\\"draggable\\"||t===\\"translate\\"){return false}if(t===\\"form\\"){return false}if(t===\\"list\\"&&e.tagName===\\"INPUT\\"){return false}if(t===\\"type\\"&&e.tagName===\\"TEXTAREA\\"){return false}if(aa.test(t)&&b(n)){return false}return t in e}function pa(e,t){const n=Bs(e);class o extends ma{constructor(e){super(n,e,t)}}o.def=n;return o}const da=e=>pa(e,xf);const ha=typeof HTMLElement!==\\"undefined\\"?HTMLElement:class{};class ma extends ha{constructor(e,t={},n){super();this._def=e;this._props=t;this._instance=null;this._connected=false;this._resolved=false;this._numberProps=null;if(this.shadowRoot&&n){n(this._createVNode(),this.shadowRoot)}else{if(this.shadowRoot){Nn(`Custom element has pre-rendered declarative shadow root but is not defined as hydratable. Use \\\\`defineSSRCustomElement\\\\`.`)}this.attachShadow({mode:\\"open\\"});if(!this._def.__asyncLoader){this._resolveProps(this._def)}}}connectedCallback(){this._connected=true;if(!this._instance){if(this._resolved){this._update()}else{this._resolveDef()}}}disconnectedCallback(){this._connected=false;Zn((()=>{if(!this._connected){wf(null,this.shadowRoot);this._instance=null}}))}_resolveDef(){this._resolved=true;for(let e=0;e<this.attributes.length;e++){this._setAttr(this.attributes[e].name)}new MutationObserver((e=>{for(const t of e){this._setAttr(t.attributeName)}})).observe(this,{attributes:true});const e=(e,t=false)=>{const{props:n,styles:o}=e;let s;if(n&&!d(n)){for(const e in n){const t=n[e];if(t===Number||t&&t.type===Number){if(e in this._props){this._props[e]=U(this._props[e])}(s||(s=Object.create(null)))[R(e)]=true}}}this._numberProps=s;if(t){this._resolveProps(e)}this._applyStyles(o);this._update()};const t=this._def.__asyncLoader;if(t){t().then((t=>e(t,true)))}else{e(this._def)}}_resolveProps(e){const{props:t}=e;const n=d(t)?t:Object.keys(t||{});for(const e of Object.keys(this)){if(e[0]!==\\"_\\"&&n.includes(e)){this._setProp(e,this[e],true,false)}}for(const e of n.map(R)){Object.defineProperty(this,e,{get(){return this._getProp(e)},set(t){this._setProp(e,t)}})}}_setAttr(e){let t=this.getAttribute(e);const n=R(e);if(this._numberProps&&this._numberProps[n]){t=U(t)}this._setProp(n,t,false)}_getProp(e){return this._props[e]}_setProp(e,t,n=true,o=true){if(t!==this._props[e]){this._props[e]=t;if(o&&this._instance){this._update()}if(n){if(t===true){this.setAttribute(I(e),\\"\\")}else if(typeof t===\\"string\\"||typeof t===\\"number\\"){this.setAttribute(I(e),t+\\"\\")}else if(!t){this.removeAttribute(I(e))}}}}_update(){wf(this._createVNode(),this.shadowRoot)}_createVNode(){const e=Ll(this._def,a({},this._props));if(!this._instance){e.ce=e=>{this._instance=e;e.isCE=true;{e.ceReload=e=>{if(this._styles){this._styles.forEach((e=>this.shadowRoot.removeChild(e)));this._styles.length=0}this._applyStyles(e);this._instance=null;this._update()}}const t=(e,t)=>{this.dispatchEvent(new CustomEvent(e,{detail:t}))};e.emit=(e,...n)=>{t(e,n);if(I(e)!==e){t(I(e),n)}};let n=this;while(n=n&&(n.parentNode||n.host)){if(n instanceof ma){e.parent=n._instance;e.provides=n._instance.provides;break}}}}return e}_applyStyles(e){if(e){e.forEach((e=>{const t=document.createElement(\\"style\\");t.textContent=e;this.shadowRoot.appendChild(t);{(this._styles||(this._styles=[])).push(t)}}))}}}function ga(e=\\"$style\\"){{{Nn(`useCssModule() is not supported in the global build.`)}return n}}function ya(e){const t=nc();if(!t){Nn(`useCssVars is called without current active component instance.`);return}const n=t.ut=(n=e(t.proxy))=>{Array.from(document.querySelectorAll(`[data-v-owner=\\"${t.uid}\\"]`)).forEach((e=>ba(e,n)))};const o=()=>{const o=e(t.proxy);va(t.subTree,o);n(o)};vs(o);or((()=>{const e=new MutationObserver(o);e.observe(t.subTree.el.parentNode,{childList:true});lr((()=>e.disconnect()))}))}function va(e,t){if(e.shapeFlag&128){const n=e.suspense;e=n.activeBranch;if(n.pendingBranch&&!n.isHydrating){n.effects.push((()=>{va(n.activeBranch,t)}))}}while(e.component){e=e.component.subTree}if(e.shapeFlag&1&&e.el){ba(e.el,t)}else if(e.type===yl){e.children.forEach((e=>va(e,t)))}else if(e.type===_l){let{el:n,anchor:o}=e;while(n){ba(n,t);if(n===o)break;n=n.nextSibling}}}function ba(e,t){if(e.nodeType===1){const n=e.style;for(const e in t){n.setProperty(`--${e}`,t[e])}}}const _a=\\"transition\\";const wa=\\"animation\\";const xa=(e,{slots:t})=>Ec(Ps,Ta(e),t);xa.displayName=\\"Transition\\";const Sa={name:String,type:String,css:{type:Boolean,default:true},duration:[String,Number,Object],enterFromClass:String,enterActiveClass:String,enterToClass:String,appearFromClass:String,appearActiveClass:String,appearToClass:String,leaveFromClass:String,leaveActiveClass:String,leaveToClass:String};const ka=xa.props=a({},As,Sa);const Ca=(e,t=[])=>{if(d(e)){e.forEach((e=>e(...t)))}else if(e){e(...t)}};const $a=e=>e?d(e)?e.some((e=>e.length>1)):e.length>1:false;function Ta(e){const t={};for(const n in e){if(!(n in Sa)){t[n]=e[n]}}if(e.css===false){return t}const{name:n=\\"v\\",type:o,duration:s,enterFromClass:r=`${n}-enter-from`,enterActiveClass:i=`${n}-enter-active`,enterToClass:l=`${n}-enter-to`,appearFromClass:c=r,appearActiveClass:f=i,appearToClass:u=l,leaveFromClass:p=`${n}-leave-from`,leaveActiveClass:d=`${n}-leave-active`,leaveToClass:h=`${n}-leave-to`}=e;const m=Ea(s);const g=m&&m[0];const y=m&&m[1];const{onBeforeEnter:v,onEnter:b,onEnterCancelled:_,onLeave:w,onLeaveCancelled:x,onBeforeAppear:S=v,onAppear:k=b,onAppearCancelled:C=_}=t;const $=(e,t,n)=>{Aa(e,t?u:l);Aa(e,t?f:i);n&&n()};const T=(e,t)=>{e._isLeaving=false;Aa(e,p);Aa(e,h);Aa(e,d);t&&t()};const E=e=>(t,n)=>{const s=e?k:b;const i=()=>$(t,e,n);Ca(s,[t,i]);Ra((()=>{Aa(t,e?c:r);Oa(t,e?u:l);if(!$a(s)){Ia(t,o,g,i)}}))};return a(t,{onBeforeEnter(e){Ca(v,[e]);Oa(e,r);Oa(e,i)},onBeforeAppear(e){Ca(S,[e]);Oa(e,c);Oa(e,f)},onEnter:E(false),onAppear:E(true),onLeave(e,t){e._isLeaving=true;const n=()=>T(e,t);Oa(e,p);Va();Oa(e,d);Ra((()=>{if(!e._isLeaving){return}Aa(e,p);Oa(e,h);if(!$a(w)){Ia(e,o,y,n)}}));Ca(w,[e,n])},onEnterCancelled(e){$(e,false);Ca(_,[e])},onAppearCancelled(e){$(e,true);Ca(C,[e])},onLeaveCancelled(e){T(e);Ca(x,[e])}})}function Ea(e){if(e==null){return null}else if(w(e)){return[Na(e.enter),Na(e.leave)]}else{const t=Na(e);return[t,t]}}function Na(e){const t=U(e);{Mn(t,\\"<transition> explicit duration\\")}return t}function Oa(e,t){t.split(/\\\\s+/).forEach((t=>t&&e.classList.add(t)));(e._vtc||(e._vtc=new Set)).add(t)}function Aa(e,t){t.split(/\\\\s+/).forEach((t=>t&&e.classList.remove(t)));const{_vtc:n}=e;if(n){n.delete(t);if(!n.size){e._vtc=void 0}}}function Ra(e){requestAnimationFrame((()=>{requestAnimationFrame(e)}))}let Pa=0;function Ia(e,t,n,o){const s=e._endId=++Pa;const r=()=>{if(s===e._endId){o()}};if(n){return setTimeout(r,n)}const{type:i,timeout:l,propCount:c}=Ma(e,t);if(!i){return o()}const a=i+\\"end\\";let f=0;const u=()=>{e.removeEventListener(a,p);r()};const p=t=>{if(t.target===e&&++f>=c){u()}};setTimeout((()=>{if(f<c){u()}}),l+1);e.addEventListener(a,p)}function Ma(e,t){const n=window.getComputedStyle(e);const o=e=>(n[e]||\\"\\").split(\\", \\");const s=o(`${_a}Delay`);const r=o(`${_a}Duration`);const i=Fa(s,r);const l=o(`${wa}Delay`);const c=o(`${wa}Duration`);const a=Fa(l,c);let f=null;let u=0;let p=0;if(t===_a){if(i>0){f=_a;u=i;p=r.length}}else if(t===wa){if(a>0){f=wa;u=a;p=c.length}}else{u=Math.max(i,a);f=u>0?i>a?_a:wa:null;p=f?f===_a?r.length:c.length:0}const d=f===_a&&/\\\\b(transform|all)(,|$)/.test(o(`${_a}Property`).toString());return{type:f,timeout:u,propCount:p,hasTransform:d}}function Fa(e,t){while(e.length<t.length){e=e.concat(e)}return Math.max(...t.map(((t,n)=>ja(t)+ja(e[n]))))}function ja(e){return Number(e.slice(0,-1).replace(\\",\\",\\".\\"))*1e3}function Va(){return document.body.offsetHeight}const La=new WeakMap;const Ba=new WeakMap;const Ua={name:\\"TransitionGroup\\",props:a({},ka,{tag:String,moveClass:String}),setup(e,{slots:t}){const n=nc();const o=Ns();let s;let r;rr((()=>{if(!s.length){return}const t=e.moveClass||`${e.name||\\"v\\"}-move`;if(!Ga(s[0].el,n.vnode.el,t)){return}s.forEach(Wa);s.forEach(za);const o=s.filter(Ka);Va();o.forEach((e=>{const n=e.el;const o=n.style;Oa(n,t);o.transform=o.webkitTransform=o.transitionDuration=\\"\\";const s=n._moveCb=e=>{if(e&&e.target!==n){return}if(!e||/transform$/.test(e.propertyName)){n.removeEventListener(\\"transitionend\\",s);n._moveCb=null;Aa(n,t)}};n.addEventListener(\\"transitionend\\",s)}))}));return()=>{const i=en(e);const l=Ta(i);let c=i.tag||yl;s=r;r=t.default?Ls(t.default()):[];for(let e=0;e<r.length;e++){const t=r[e];if(t.key!=null){Vs(t,Ms(t,l,o,n))}else{Nn(`<TransitionGroup> children must be keyed.`)}}if(s){for(let e=0;e<s.length;e++){const t=s[e];Vs(t,Ms(t,l,o,n));La.set(t,t.el.getBoundingClientRect())}}return Ll(c,null,r)}}};const Da=e=>delete e.mode;Da(Ua.props);const Ha=Ua;function Wa(e){const t=e.el;if(t._moveCb){t._moveCb()}if(t._enterCb){t._enterCb()}}function za(e){Ba.set(e,e.el.getBoundingClientRect())}function Ka(e){const t=La.get(e);const n=Ba.get(e);const o=t.left-n.left;const s=t.top-n.top;if(o||s){const t=e.el.style;t.transform=t.webkitTransform=`translate(${o}px,${s}px)`;t.transitionDuration=\\"0s\\";return e}}function Ga(e,t,n){const o=e.cloneNode();if(e._vtc){e._vtc.forEach((e=>{e.split(/\\\\s+/).forEach((e=>e&&o.classList.remove(e)))}))}n.split(/\\\\s+/).forEach((e=>e&&o.classList.add(e)));o.style.display=\\"none\\";const s=t.nodeType===1?t:t.parentNode;s.appendChild(o);const{hasTransform:r}=Ma(o);s.removeChild(o);return r}const Ja=e=>{const t=e.props[\\"onUpdate:modelValue\\"]||false;return d(t)?e=>V(t,e):t};function qa(e){e.target.composing=true}function Ya(e){const t=e.target;if(t.composing){t.composing=false;t.dispatchEvent(new Event(\\"input\\"))}}const Za={created(e,{modifiers:{lazy:t,trim:n,number:o}},s){e._assign=Ja(s);const r=o||s.props&&s.props.type===\\"number\\";Qc(e,t?\\"change\\":\\"input\\",(t=>{if(t.target.composing)return;let o=e.value;if(n){o=o.trim()}if(r){o=B(o)}e._assign(o)}));if(n){Qc(e,\\"change\\",(()=>{e.value=e.value.trim()}))}if(!t){Qc(e,\\"compositionstart\\",qa);Qc(e,\\"compositionend\\",Ya);Qc(e,\\"change\\",Ya)}},mounted(e,{value:t}){e.value=t==null?\\"\\":t},beforeUpdate(e,{value:t,modifiers:{lazy:n,trim:o,number:s}},r){e._assign=Ja(r);if(e.composing)return;if(document.activeElement===e&&e.type!==\\"range\\"){if(n){return}if(o&&e.value.trim()===t){return}if((s||e.type===\\"number\\")&&B(e.value)===t){return}}const i=t==null?\\"\\":t;if(e.value!==i){e.value=i}}};const Xa={deep:true,created(e,t,n){e._assign=Ja(n);Qc(e,\\"change\\",(()=>{const t=e._modelValue;const n=of(e);const o=e.checked;const s=e._assign;if(d(t)){const e=he(t,n);const r=e!==-1;if(o&&!r){s(t.concat(n))}else if(!o&&r){const n=[...t];n.splice(e,1);s(n)}}else if(m(t)){const e=new Set(t);if(o){e.add(n)}else{e.delete(n)}s(e)}else{s(sf(e,o))}}))},mounted:Qa,beforeUpdate(e,t,n){e._assign=Ja(n);Qa(e,t,n)}};function Qa(e,{value:t,oldValue:n},o){e._modelValue=t;if(d(t)){e.checked=he(t,o.props.value)>-1}else if(m(t)){e.checked=t.has(o.props.value)}else if(t!==n){e.checked=de(t,sf(e,true))}}const ef={created(e,{value:t},n){e.checked=de(t,n.props.value);e._assign=Ja(n);Qc(e,\\"change\\",(()=>{e._assign(of(e))}))},beforeUpdate(e,{value:t,oldValue:n},o){e._assign=Ja(o);if(t!==n){e.checked=de(t,o.props.value)}}};const tf={deep:true,created(e,{value:t,modifiers:{number:n}},o){const s=m(t);Qc(e,\\"change\\",(()=>{const t=Array.prototype.filter.call(e.options,(e=>e.selected)).map((e=>n?B(of(e)):of(e)));e._assign(e.multiple?s?new Set(t):t:t[0])}));e._assign=Ja(o)},mounted(e,{value:t}){nf(e,t)},beforeUpdate(e,t,n){e._assign=Ja(n)},updated(e,{value:t}){nf(e,t)}};function nf(e,t){const n=e.multiple;if(n&&!d(t)&&!m(t)){Nn(`<select multiple v-model> expects an Array or Set value for its binding, but got ${Object.prototype.toString.call(t).slice(8,-1)}.`);return}for(let o=0,s=e.options.length;o<s;o++){const s=e.options[o];const r=of(s);if(n){if(d(t)){s.selected=he(t,r)>-1}else{s.selected=t.has(r)}}else{if(de(of(s),t)){if(e.selectedIndex!==o)e.selectedIndex=o;return}}}if(!n&&e.selectedIndex!==-1){e.selectedIndex=-1}}function of(e){return\\"_value\\"in e?e._value:e.value}function sf(e,t){const n=t?\\"_trueValue\\":\\"_falseValue\\";return n in e?e[n]:t}const rf={created(e,t,n){cf(e,t,n,null,\\"created\\")},mounted(e,t,n){cf(e,t,n,null,\\"mounted\\")},beforeUpdate(e,t,n,o){cf(e,t,n,o,\\"beforeUpdate\\")},updated(e,t,n,o){cf(e,t,n,o,\\"updated\\")}};function lf(e,t){switch(e){case\\"SELECT\\":return tf;case\\"TEXTAREA\\":return Za;default:switch(t){case\\"checkbox\\":return Xa;case\\"radio\\":return ef;default:return Za}}}function cf(e,t,n,o,s){const r=lf(e.tagName,n.props&&n.props.type);const i=r[s];i&&i(e,t,n,o)}const af=[\\"ctrl\\",\\"shift\\",\\"alt\\",\\"meta\\"];const ff={stop:e=>e.stopPropagation(),prevent:e=>e.preventDefault(),self:e=>e.target!==e.currentTarget,ctrl:e=>!e.ctrlKey,shift:e=>!e.shiftKey,alt:e=>!e.altKey,meta:e=>!e.metaKey,left:e=>\\"button\\"in e&&e.button!==0,middle:e=>\\"button\\"in e&&e.button!==1,right:e=>\\"button\\"in e&&e.button!==2,exact:(e,t)=>af.some((n=>e[`${n}Key`]&&!t.includes(n)))};const uf=(e,t)=>(n,...o)=>{for(let e=0;e<t.length;e++){const o=ff[t[e]];if(o&&o(n,t))return}return e(n,...o)};const pf={esc:\\"escape\\",space:\\" \\",up:\\"arrow-up\\",left:\\"arrow-left\\",right:\\"arrow-right\\",down:\\"arrow-down\\",delete:\\"backspace\\"};const df=(e,t)=>n=>{if(!(\\"key\\"in n)){return}const o=I(n.key);if(t.some((e=>e===o||pf[e]===o))){return e(n)}};const hf={beforeMount(e,{value:t},{transition:n}){e._vod=e.style.display===\\"none\\"?\\"\\":e.style.display;if(n&&t){n.beforeEnter(e)}else{mf(e,t)}},mounted(e,{value:t},{transition:n}){if(n&&t){n.enter(e)}},updated(e,{value:t,oldValue:n},{transition:o}){if(!t===!n)return;if(o){if(t){o.beforeEnter(e);mf(e,true);o.enter(e)}else{o.leave(e,(()=>{mf(e,false)}))}}else{mf(e,t)}},beforeUnmount(e,{value:t}){mf(e,t)}};function mf(e,t){e.style.display=t?e._vod:\\"none\\"}const gf=a({patchProp:fa},Uc);let yf;let vf=false;function bf(){return yf||(yf=nl(gf))}function _f(){yf=vf?yf:ol(gf);vf=true;return yf}const wf=(...e)=>{bf().render(...e)};const xf=(...e)=>{_f().hydrate(...e)};const Sf=(...e)=>{const t=bf().createApp(...e);{Cf(t);$f(t)}const{mount:n}=t;t.mount=e=>{const o=Tf(e);if(!o)return;const s=t._component;if(!v(s)&&!s.render&&!s.template){s.template=o.innerHTML}o.innerHTML=\\"\\";const r=n(o,false,o instanceof SVGElement);if(o instanceof Element){o.removeAttribute(\\"v-cloak\\");o.setAttribute(\\"data-v-app\\",\\"\\")}return r};return t};const kf=(...e)=>{const t=_f().createApp(...e);{Cf(t);$f(t)}const{mount:n}=t;t.mount=e=>{const t=Tf(e);if(t){return n(t,true,t instanceof SVGElement)}};return t};function Cf(e){Object.defineProperty(e.config,\\"isNativeTag\\",{value:e=>ie(e)||le(e),writable:false})}function $f(e){if(gc()){const t=e.config.isCustomElement;Object.defineProperty(e.config,\\"isCustomElement\\",{get(){return t},set(){Nn(`The \\\\`isCustomElement\\\\` config option is deprecated. Use \\\\`compilerOptions.isCustomElement\\\\` instead.`)}});const n=e.config.compilerOptions;const o=`The \\\\`compilerOptions\\\\` config option is only respected when using a build of Vue.js that includes the runtime compiler (aka \\"full build\\"). Since you are using the runtime-only build, \\\\`compilerOptions\\\\` must be passed to \\\\`@vue/compiler-dom\\\\` in the build setup instead.\\\\n- For vue-loader: pass it via vue-loader\'s \\\\`compilerOptions\\\\` loader option.\\\\n- For vue-cli: see https://cli.vuejs.org/guide/webpack.html#modifying-options-of-a-loader\\\\n- For vite: pass it via @vitejs/plugin-vue options. See https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue#example-for-passing-options-to-vuecompiler-sfc`;Object.defineProperty(e.config,\\"compilerOptions\\",{get(){Nn(o);return n},set(){Nn(o)}})}}function Tf(e){if(b(e)){const t=document.querySelector(e);if(!t){Nn(`Failed to mount app: mount target selector \\"${e}\\" returned null.`)}return t}if(window.ShadowRoot&&e instanceof window.ShadowRoot&&e.mode===\\"closed\\"){Nn(`mounting on a ShadowRoot with \\\\`{mode: \\"closed\\"}\\\\` may lead to unpredictable bugs`)}return e}const Ef=s;function Nf(){{{console.info(`You are running a development build of Vue.\\\\nMake sure to use the production build (*.prod.js) when deploying for production.`)}Ac()}}function Of(e){throw e}function Af(e){console.warn(`[Vue warn] ${e.message}`)}function Rf(e,t,n,o){const s=(n||Pf)[e]+(o||``);const r=new SyntaxError(String(s));r.code=e;r.loc=t;return r}const Pf={[0]:\\"Illegal comment.\\",[1]:\\"CDATA section is allowed only in XML context.\\",[2]:\\"Duplicate attribute.\\",[3]:\\"End tag cannot have attributes.\\",[4]:\\"Illegal \'/\' in tags.\\",[5]:\\"Unexpected EOF in tag.\\",[6]:\\"Unexpected EOF in CDATA section.\\",[7]:\\"Unexpected EOF in comment.\\",[8]:\\"Unexpected EOF in script.\\",[9]:\\"Unexpected EOF in tag.\\",[10]:\\"Incorrectly closed comment.\\",[11]:\\"Incorrectly opened comment.\\",[12]:\\"Illegal tag name. Use \'&lt;\' to print \'<\'.\\",[13]:\\"Attribute value was expected.\\",[14]:\\"End tag name was expected.\\",[15]:\\"Whitespace was expected.\\",[16]:\\"Unexpected \'\\\\x3c!--\' in comment.\\",[17]:`Attribute name cannot contain U+0022 (\\"), U+0027 (\'), and U+003C (<).`,[18]:\\"Unquoted attribute value cannot contain U+0022 (\\\\\\"), U+0027 (\'), U+003C (<), U+003D (=), and U+0060 (`).\\",[19]:\\"Attribute name cannot start with \'=\'.\\",[21]:\\"\'<?\' is allowed only in XML context.\\",[20]:`Unexpected null character.`,[22]:\\"Illegal \'/\' in tags.\\",[23]:\\"Invalid end tag.\\",[24]:\\"Element is missing end tag.\\",[25]:\\"Interpolation end sign was not found.\\",[27]:\\"End bracket for dynamic directive argument was not found. Note that dynamic directive argument cannot contain spaces.\\",[26]:\\"Legal directive name was expected.\\",[28]:`v-if/v-else-if is missing expression.`,[29]:`v-if/else branches must use unique keys.`,[30]:`v-else/v-else-if has no adjacent v-if or v-else-if.`,[31]:`v-for is missing expression.`,[32]:`v-for has invalid expression.`,[33]:`<template v-for> key should be placed on the <template> tag.`,[34]:`v-bind is missing expression.`,[35]:`v-on is missing expression.`,[36]:`Unexpected custom directive on <slot> outlet.`,[37]:`Mixed v-slot usage on both the component and nested <template>. When there are multiple named slots, all slots should use <template> syntax to avoid scope ambiguity.`,[38]:`Duplicate slot names found. `,[39]:`Extraneous children found when component already has explicitly named default slot. These children will be ignored.`,[40]:`v-slot can only be used on components or <template> tags.`,[41]:`v-model is missing expression.`,[42]:`v-model value must be a valid JavaScript member expression.`,[43]:`v-model cannot be used on v-for or v-slot scope variables because they are not writable.`,[44]:`v-model cannot be used on a prop, because local prop bindings are not writable.\\\\nUse a v-bind binding combined with a v-on listener that emits update:x event instead.`,[45]:`Error parsing JavaScript expression: `,[46]:`<KeepAlive> expects exactly one child component.`,[47]:`\\"prefixIdentifiers\\" option is not supported in this build of compiler.`,[48]:`ES module mode is not supported in this build of compiler.`,[49]:`\\"cacheHandlers\\" option is only supported when the \\"prefixIdentifiers\\" option is enabled.`,[50]:`\\"scopeId\\" option is only supported in module mode.`,[51]:`@vnode-* hooks in templates are deprecated. Use the vue: prefix instead. For example, @vnode-mounted should be changed to @vue:mounted. @vnode-* hooks support will be removed in 3.4.`,[52]:`v-is=\\"component-name\\" has been deprecated. Use is=\\"vue:component-name\\" instead. v-is support will be removed in 3.4.`,[53]:``};const If=Symbol(`Fragment`);const Mf=Symbol(`Teleport`);const Ff=Symbol(`Suspense`);const jf=Symbol(`KeepAlive`);const Vf=Symbol(`BaseTransition`);const Lf=Symbol(`openBlock`);const Bf=Symbol(`createBlock`);const Uf=Symbol(`createElementBlock`);const Df=Symbol(`createVNode`);const Hf=Symbol(`createElementVNode`);const Wf=Symbol(`createCommentVNode`);const zf=Symbol(`createTextVNode`);const Kf=Symbol(`createStaticVNode`);const Gf=Symbol(`resolveComponent`);const Jf=Symbol(`resolveDynamicComponent`);const qf=Symbol(`resolveDirective`);const Yf=Symbol(`resolveFilter`);const Zf=Symbol(`withDirectives`);const Xf=Symbol(`renderList`);const Qf=Symbol(`renderSlot`);const eu=Symbol(`createSlots`);const tu=Symbol(`toDisplayString`);const nu=Symbol(`mergeProps`);const ou=Symbol(`normalizeClass`);const su=Symbol(`normalizeStyle`);const ru=Symbol(`normalizeProps`);const iu=Symbol(`guardReactiveProps`);const lu=Symbol(`toHandlers`);const cu=Symbol(`camelize`);const au=Symbol(`capitalize`);const fu=Symbol(`toHandlerKey`);const uu=Symbol(`setBlockTracking`);const pu=Symbol(`pushScopeId`);const du=Symbol(`popScopeId`);const hu=Symbol(`withCtx`);const mu=Symbol(`unref`);const gu=Symbol(`isRef`);const yu=Symbol(`withMemo`);const vu=Symbol(`isMemoSame`);const bu={[If]:`Fragment`,[Mf]:`Teleport`,[Ff]:`Suspense`,[jf]:`KeepAlive`,[Vf]:`BaseTransition`,[Lf]:`openBlock`,[Bf]:`createBlock`,[Uf]:`createElementBlock`,[Df]:`createVNode`,[Hf]:`createElementVNode`,[Wf]:`createCommentVNode`,[zf]:`createTextVNode`,[Kf]:`createStaticVNode`,[Gf]:`resolveComponent`,[Jf]:`resolveDynamicComponent`,[qf]:`resolveDirective`,[Yf]:`resolveFilter`,[Zf]:`withDirectives`,[Xf]:`renderList`,[Qf]:`renderSlot`,[eu]:`createSlots`,[tu]:`toDisplayString`,[nu]:`mergeProps`,[ou]:`normalizeClass`,[su]:`normalizeStyle`,[ru]:`normalizeProps`,[iu]:`guardReactiveProps`,[lu]:`toHandlers`,[cu]:`camelize`,[au]:`capitalize`,[fu]:`toHandlerKey`,[uu]:`setBlockTracking`,[pu]:`pushScopeId`,[du]:`popScopeId`,[hu]:`withCtx`,[mu]:`unref`,[gu]:`isRef`,[yu]:`withMemo`,[vu]:`isMemoSame`};function _u(e){Object.getOwnPropertySymbols(e).forEach((t=>{bu[t]=e[t]}))}const wu={source:\\"\\",start:{line:1,column:1,offset:0},end:{line:1,column:1,offset:0}};function xu(e,t=wu){return{type:0,children:e,helpers:new Set,components:[],directives:[],hoists:[],imports:[],cached:0,temps:0,codegenNode:void 0,loc:t}}function Su(e,t,n,o,s,r,i,l=false,c=false,a=false,f=wu){if(e){if(l){e.helper(Lf);e.helper(Mu(e.inSSR,a))}else{e.helper(Iu(e.inSSR,a))}if(i){e.helper(Zf)}}return{type:13,tag:t,props:n,children:o,patchFlag:s,dynamicProps:r,directives:i,isBlock:l,disableTracking:c,isComponent:a,loc:f}}function ku(e,t=wu){return{type:17,loc:t,elements:e}}function Cu(e,t=wu){return{type:15,loc:t,properties:e}}function $u(e,t){return{type:16,loc:wu,key:b(e)?Tu(e,true):e,value:t}}function Tu(e,t=false,n=wu,o=0){return{type:4,loc:n,content:e,isStatic:t,constType:t?3:o}}function Eu(e,t=wu){return{type:8,loc:t,children:e}}function Nu(e,t=[],n=wu){return{type:14,loc:n,callee:e,arguments:t}}function Ou(e,t=void 0,n=false,o=false,s=wu){return{type:18,params:e,returns:t,newline:n,isSlot:o,loc:s}}function Au(e,t,n,o=true){return{type:19,test:e,consequent:t,alternate:n,newline:o,loc:wu}}function Ru(e,t,n=false){return{type:20,index:e,value:t,isVNode:n,loc:wu}}function Pu(e){return{type:21,body:e,loc:wu}}function Iu(e,t){return e||t?Df:Hf}function Mu(e,t){return e||t?Bf:Uf}function Fu(e,{helper:t,removeHelper:n,inSSR:o}){if(!e.isBlock){e.isBlock=true;n(Iu(o,e.isComponent));t(Lf);t(Mu(o,e.isComponent))}}const ju=e=>e.type===4&&e.isStatic;const Vu=(e,t)=>e===t||e===I(t);function Lu(e){if(Vu(e,\\"Teleport\\")){return Mf}else if(Vu(e,\\"Suspense\\")){return Ff}else if(Vu(e,\\"KeepAlive\\")){return jf}else if(Vu(e,\\"BaseTransition\\")){return Vf}}const Bu=/^\\\\d|[^\\\\$\\\\w]/;const Uu=e=>!Bu.test(e);const Du=/[A-Za-z_$\\\\xA0-\\\\uFFFF]/;const Hu=/[\\\\.\\\\?\\\\w$\\\\xA0-\\\\uFFFF]/;const Wu=/\\\\s+[.[]\\\\s*|\\\\s*[.[]\\\\s+/g;const zu=e=>{e=e.trim().replace(Wu,(e=>e.trim()));let t=0;let n=[];let o=0;let s=0;let r=null;for(let i=0;i<e.length;i++){const l=e.charAt(i);switch(t){case 0:if(l===\\"[\\"){n.push(t);t=1;o++}else if(l===\\"(\\"){n.push(t);t=2;s++}else if(!(i===0?Du:Hu).test(l)){return false}break;case 1:if(l===`\'`||l===`\\"`||l===\\"`\\"){n.push(t);t=3;r=l}else if(l===`[`){o++}else if(l===`]`){if(!--o){t=n.pop()}}break;case 2:if(l===`\'`||l===`\\"`||l===\\"`\\"){n.push(t);t=3;r=l}else if(l===`(`){s++}else if(l===`)`){if(i===e.length-1){return false}if(!--s){t=n.pop()}}break;case 3:if(l===r){t=n.pop();r=null}break}}return!o&&!s};const Ku=zu;function Gu(e,t,n){const o=e.source.slice(t,t+n);const s={source:o,start:Ju(e.start,e.source,t),end:e.end};if(n!=null){s.end=Ju(e.start,e.source,t+n)}return s}function Ju(e,t,n=t.length){return qu(a({},e),t,n)}function qu(e,t,n=t.length){let o=0;let s=-1;for(let e=0;e<n;e++){if(t.charCodeAt(e)===10){o++;s=e}}e.offset+=n;e.line+=o;e.column=s===-1?e.column+n:n-s;return e}function Yu(e,t){if(!e){throw new Error(t||`unexpected compiler condition`)}}function Zu(e,t,n=false){for(let o=0;o<e.props.length;o++){const s=e.props[o];if(s.type===7&&(n||s.exp)&&(b(t)?s.name===t:t.test(s.name))){return s}}}function Xu(e,t,n=false,o=false){for(let s=0;s<e.props.length;s++){const r=e.props[s];if(r.type===6){if(n)continue;if(r.name===t&&(r.value||o)){return r}}else if(r.name===\\"bind\\"&&(r.exp||o)&&Qu(r.arg,t)){return r}}}function Qu(e,t){return!!(e&&ju(e)&&e.content===t)}function ep(e){return e.props.some((e=>e.type===7&&e.name===\\"bind\\"&&(!e.arg||e.arg.type!==4||!e.arg.isStatic)))}function tp(e){return e.type===5||e.type===2}function np(e){return e.type===7&&e.name===\\"slot\\"}function op(e){return e.type===1&&e.tagType===3}function sp(e){return e.type===1&&e.tagType===2}const rp=new Set([ru,iu]);function ip(e,t=[]){if(e&&!b(e)&&e.type===14){const n=e.callee;if(!b(n)&&rp.has(n)){return ip(e.arguments[0],t.concat(e))}}return[e,t]}function lp(e,t,n){let o;let s=e.type===13?e.props:e.arguments[2];let r=[];let i;if(s&&!b(s)&&s.type===14){const e=ip(s);s=e[0];r=e[1];i=r[r.length-1]}if(s==null||b(s)){o=Cu([t])}else if(s.type===14){const e=s.arguments[0];if(!b(e)&&e.type===15){if(!cp(t,e)){e.properties.unshift(t)}}else{if(s.callee===lu){o=Nu(n.helper(nu),[Cu([t]),s])}else{s.arguments.unshift(Cu([t]))}}!o&&(o=s)}else if(s.type===15){if(!cp(t,s)){s.properties.unshift(t)}o=s}else{o=Nu(n.helper(nu),[Cu([t]),s]);if(i&&i.callee===iu){i=r[r.length-2]}}if(e.type===13){if(i){i.arguments[0]=o}else{e.props=o}}else{if(i){i.arguments[0]=o}else{e.arguments[2]=o}}}function cp(e,t){let n=false;if(e.key.type===4){const o=e.key.content;n=t.properties.some((e=>e.key.type===4&&e.key.content===o))}return n}function ap(e,t){return`_${t}_${e.replace(/[^\\\\w]/g,((t,n)=>t===\\"-\\"?\\"_\\":e.charCodeAt(n).toString()))}`}function fp(e){if(e.type===14&&e.callee===yu){return e.arguments[1].returns}else{return e}}const up=/&(gt|lt|amp|apos|quot);/g;const pp={gt:\\">\\",lt:\\"<\\",amp:\\"&\\",apos:\\"\'\\",quot:\'\\"\'};const dp={delimiters:[`{{`,`}}`],getNamespace:()=>0,getTextMode:()=>0,isVoidTag:r,isPreTag:r,isCustomElement:r,decodeEntities:e=>e.replace(up,((e,t)=>pp[t])),onError:Of,onWarn:Af,comments:true};function hp(e,t={}){const n=mp(e,t);const o=Rp(n);return xu(gp(n,0,[]),Pp(n,o))}function mp(e,t){const n=a({},dp);let o;for(o in t){n[o]=t[o]===void 0?dp[o]:t[o]}return{options:n,column:1,line:1,offset:0,originalSource:e,source:e,inPre:false,inVPre:false,onWarn:n.onWarn}}function gp(e,t,n){const o=Ip(n);const s=o?o.ns:0;const r=[];while(!Bp(e,t,n)){const i=e.source;let l=void 0;if(t===0||t===1){if(!e.inVPre&&Mp(i,e.options.delimiters[0])){l=Np(e,t)}else if(t===0&&i[0]===\\"<\\"){if(i.length===1){Lp(e,5,1)}else if(i[1]===\\"!\\"){if(Mp(i,\\"\\\\x3c!--\\")){l=bp(e)}else if(Mp(i,\\"<!DOCTYPE\\")){l=_p(e)}else if(Mp(i,\\"<![CDATA[\\")){if(s!==0){l=vp(e,n)}else{Lp(e,1);l=_p(e)}}else{Lp(e,11);l=_p(e)}}else if(i[1]===\\"/\\"){if(i.length===2){Lp(e,5,2)}else if(i[2]===\\">\\"){Lp(e,14,2);Fp(e,3);continue}else if(/[a-z]/i.test(i[2])){Lp(e,23);kp(e,xp.End,o);continue}else{Lp(e,12,2);l=_p(e)}}else if(/[a-z]/i.test(i[1])){l=wp(e,n)}else if(i[1]===\\"?\\"){Lp(e,21,1);l=_p(e)}else{Lp(e,12,1)}}}if(!l){l=Op(e,t)}if(d(l)){for(let e=0;e<l.length;e++){yp(r,l[e])}}else{yp(r,l)}}let i=false;if(t!==2&&t!==1){const t=e.options.whitespace!==\\"preserve\\";for(let n=0;n<r.length;n++){const o=r[n];if(o.type===2){if(!e.inPre){if(!/[^\\\\t\\\\r\\\\n\\\\f ]/.test(o.content)){const e=r[n-1];const s=r[n+1];if(!e||!s||t&&(e.type===3&&s.type===3||e.type===3&&s.type===1||e.type===1&&s.type===3||e.type===1&&s.type===1&&/[\\\\r\\\\n]/.test(o.content))){i=true;r[n]=null}else{o.content=\\" \\"}}else if(t){o.content=o.content.replace(/[\\\\t\\\\r\\\\n\\\\f ]+/g,\\" \\")}}else{o.content=o.content.replace(/\\\\r\\\\n/g,\\"\\\\n\\")}}else if(o.type===3&&!e.options.comments){i=true;r[n]=null}}if(e.inPre&&o&&e.options.isPreTag(o.tag)){const e=r[0];if(e&&e.type===2){e.content=e.content.replace(/^\\\\r?\\\\n/,\\"\\")}}}return i?r.filter(Boolean):r}function yp(e,t){if(t.type===2){const n=Ip(e);if(n&&n.type===2&&n.loc.end.offset===t.loc.start.offset){n.content+=t.content;n.loc.end=t.loc.end;n.loc.source+=t.loc.source;return}}e.push(t)}function vp(e,t){Fp(e,9);const n=gp(e,3,t);if(e.source.length===0){Lp(e,6)}else{Fp(e,3)}return n}function bp(e){const t=Rp(e);let n;const o=/--(\\\\!)?>/.exec(e.source);if(!o){n=e.source.slice(4);Fp(e,e.source.length);Lp(e,7)}else{if(o.index<=3){Lp(e,0)}if(o[1]){Lp(e,10)}n=e.source.slice(4,o.index);const t=e.source.slice(0,o.index);let s=1,r=0;while((r=t.indexOf(\\"\\\\x3c!--\\",s))!==-1){Fp(e,r-s+1);if(r+4<t.length){Lp(e,16)}s=r+1}Fp(e,o.index+o[0].length-s+1)}return{type:3,content:n,loc:Pp(e,t)}}function _p(e){const t=Rp(e);const n=e.source[1]===\\"?\\"?1:2;let o;const s=e.source.indexOf(\\">\\");if(s===-1){o=e.source.slice(n);Fp(e,e.source.length)}else{o=e.source.slice(n,s);Fp(e,s+1)}return{type:3,content:o,loc:Pp(e,t)}}function wp(e,t){const n=e.inPre;const o=e.inVPre;const s=Ip(t);const r=kp(e,xp.Start,s);const i=e.inPre&&!n;const l=e.inVPre&&!o;if(r.isSelfClosing||e.options.isVoidTag(r.tag)){if(i){e.inPre=false}if(l){e.inVPre=false}return r}t.push(r);const c=e.options.getTextMode(r,s);const a=gp(e,c,t);t.pop();r.children=a;if(Up(e.source,r.tag)){kp(e,xp.End,s)}else{Lp(e,24,0,r.loc.start);if(e.source.length===0&&r.tag.toLowerCase()===\\"script\\"){const t=a[0];if(t&&Mp(t.loc.source,\\"\\\\x3c!--\\")){Lp(e,8)}}}r.loc=Pp(e,r.loc.start);if(i){e.inPre=false}if(l){e.inVPre=false}return r}var xp=(e=>{e[e[\\"Start\\"]=0]=\\"Start\\";e[e[\\"End\\"]=1]=\\"End\\";return e})(xp||{});const Sp=t(`if,else,else-if,for,slot`);function kp(e,t,n){const o=Rp(e);const s=/^<\\\\/?([a-z][^\\\\t\\\\r\\\\n\\\\f />]*)/i.exec(e.source);const r=s[1];const i=e.options.getNamespace(r,n);Fp(e,s[0].length);jp(e);const l=Rp(e);const c=e.source;if(e.options.isPreTag(r)){e.inPre=true}let f=$p(e,t);if(t===0&&!e.inVPre&&f.some((e=>e.type===7&&e.name===\\"pre\\"))){e.inVPre=true;a(e,l);e.source=c;f=$p(e,t).filter((e=>e.name!==\\"v-pre\\"))}let u=false;if(e.source.length===0){Lp(e,9)}else{u=Mp(e.source,\\"/>\\");if(t===1&&u){Lp(e,4)}Fp(e,u?2:1)}if(t===1){return}let p=0;if(!e.inVPre){if(r===\\"slot\\"){p=2}else if(r===\\"template\\"){if(f.some((e=>e.type===7&&Sp(e.name)))){p=3}}else if(Cp(r,f,e)){p=1}}return{type:1,ns:i,tag:r,tagType:p,props:f,isSelfClosing:u,children:[],loc:Pp(e,o),codegenNode:void 0}}function Cp(e,t,n){const o=n.options;if(o.isCustomElement(e)){return false}if(e===\\"component\\"||/^[A-Z]/.test(e)||Lu(e)||o.isBuiltInComponent&&o.isBuiltInComponent(e)||o.isNativeTag&&!o.isNativeTag(e)){return true}for(let e=0;e<t.length;e++){const n=t[e];if(n.type===6){if(n.name===\\"is\\"&&n.value){if(n.value.content.startsWith(\\"vue:\\")){return true}}}else{if(n.name===\\"is\\"){return true}else if(n.name===\\"bind\\"&&Qu(n.arg,\\"is\\")&&false){return true}}}}function $p(e,t){const n=[];const o=new Set;while(e.source.length>0&&!Mp(e.source,\\">\\")&&!Mp(e.source,\\"/>\\")){if(Mp(e.source,\\"/\\")){Lp(e,22);Fp(e,1);jp(e);continue}if(t===1){Lp(e,3)}const s=Tp(e,o);if(s.type===6&&s.value&&s.name===\\"class\\"){s.value.content=s.value.content.replace(/\\\\s+/g,\\" \\").trim()}if(t===0){n.push(s)}if(/^[^\\\\t\\\\r\\\\n\\\\f />]/.test(e.source)){Lp(e,15)}jp(e)}return n}function Tp(e,t){var n;const o=Rp(e);const s=/^[^\\\\t\\\\r\\\\n\\\\f />][^\\\\t\\\\r\\\\n\\\\f />=]*/.exec(e.source);const r=s[0];if(t.has(r)){Lp(e,2)}t.add(r);if(r[0]===\\"=\\"){Lp(e,19)}{const t=/[\\"\'<]/g;let n;while(n=t.exec(r)){Lp(e,17,n.index)}}Fp(e,r.length);let i=void 0;if(/^[\\\\t\\\\r\\\\n\\\\f ]*=/.test(e.source)){jp(e);Fp(e,1);jp(e);i=Ep(e);if(!i){Lp(e,13)}}const l=Pp(e,o);if(!e.inVPre&&/^(v-[A-Za-z0-9-]|:|\\\\.|@|#)/.test(r)){const t=/(?:^v-([a-z0-9-]+))?(?:(?::|^\\\\.|^@|^#)(\\\\[[^\\\\]]+\\\\]|[^\\\\.]+))?(.+)?$/i.exec(r);let s=Mp(r,\\".\\");let c=t[1]||(s||Mp(r,\\":\\")?\\"bind\\":Mp(r,\\"@\\")?\\"on\\":\\"slot\\");let a;if(t[2]){const s=c===\\"slot\\";const i=r.lastIndexOf(t[2],r.length-(((n=t[3])==null?void 0:n.length)||0));const l=Pp(e,Vp(e,o,i),Vp(e,o,i+t[2].length+(s&&t[3]||\\"\\").length));let f=t[2];let u=true;if(f.startsWith(\\"[\\")){u=false;if(!f.endsWith(\\"]\\")){Lp(e,27);f=f.slice(1)}else{f=f.slice(1,f.length-1)}}else if(s){f+=t[3]||\\"\\"}a={type:4,content:f,isStatic:u,constType:u?3:0,loc:l}}if(i&&i.isQuoted){const e=i.loc;e.start.offset++;e.start.column++;e.end=Ju(e.start,i.content);e.source=e.source.slice(1,-1)}const f=t[3]?t[3].slice(1).split(\\".\\"):[];if(s)f.push(\\"prop\\");return{type:7,name:c,exp:i&&{type:4,content:i.content,isStatic:false,constType:0,loc:i.loc},arg:a,modifiers:f,loc:l}}if(!e.inVPre&&Mp(r,\\"v-\\")){Lp(e,26)}return{type:6,name:r,value:i&&{type:2,content:i.content,loc:i.loc},loc:l}}function Ep(e){const t=Rp(e);let n;const o=e.source[0];const s=o===`\\"`||o===`\'`;if(s){Fp(e,1);const t=e.source.indexOf(o);if(t===-1){n=Ap(e,e.source.length,4)}else{n=Ap(e,t,4);Fp(e,1)}}else{const t=/^[^\\\\t\\\\r\\\\n\\\\f >]+/.exec(e.source);if(!t){return void 0}const o=/[\\"\'<=`]/g;let s;while(s=o.exec(t[0])){Lp(e,18,s.index)}n=Ap(e,t[0].length,4)}return{content:n,isQuoted:s,loc:Pp(e,t)}}function Np(e,t){const[n,o]=e.options.delimiters;const s=e.source.indexOf(o,n.length);if(s===-1){Lp(e,25);return void 0}const r=Rp(e);Fp(e,n.length);const i=Rp(e);const l=Rp(e);const c=s-n.length;const a=e.source.slice(0,c);const f=Ap(e,c,t);const u=f.trim();const p=f.indexOf(u);if(p>0){qu(i,a,p)}const d=c-(f.length-u.length-p);qu(l,a,d);Fp(e,o.length);return{type:5,content:{type:4,isStatic:false,constType:0,content:u,loc:Pp(e,i,l)},loc:Pp(e,r)}}function Op(e,t){const n=t===3?[\\"]]>\\"]:[\\"<\\",e.options.delimiters[0]];let o=e.source.length;for(let t=0;t<n.length;t++){const s=e.source.indexOf(n[t],1);if(s!==-1&&o>s){o=s}}const s=Rp(e);const r=Ap(e,o,t);return{type:2,content:r,loc:Pp(e,s)}}function Ap(e,t,n){const o=e.source.slice(0,t);Fp(e,t);if(n===2||n===3||!o.includes(\\"&\\")){return o}else{return e.options.decodeEntities(o,n===4)}}function Rp(e){const{column:t,line:n,offset:o}=e;return{column:t,line:n,offset:o}}function Pp(e,t,n){n=n||Rp(e);return{start:t,end:n,source:e.originalSource.slice(t.offset,n.offset)}}function Ip(e){return e[e.length-1]}function Mp(e,t){return e.startsWith(t)}function Fp(e,t){const{source:n}=e;qu(e,n,t);e.source=n.slice(t)}function jp(e){const t=/^[\\\\t\\\\r\\\\n\\\\f ]+/.exec(e.source);if(t){Fp(e,t[0].length)}}function Vp(e,t,n){return Ju(t,e.originalSource.slice(t.offset,n),n)}function Lp(e,t,n,o=Rp(e)){if(n){o.offset+=n;o.column+=n}e.options.onError(Rf(t,{start:o,end:o,source:\\"\\"}))}function Bp(e,t,n){const o=e.source;switch(t){case 0:if(Mp(o,\\"</\\")){for(let e=n.length-1;e>=0;--e){if(Up(o,n[e].tag)){return true}}}break;case 1:case 2:{const e=Ip(n);if(e&&Up(o,e.tag)){return true}break}case 3:if(Mp(o,\\"]]>\\")){return true}break}return!o}function Up(e,t){return Mp(e,\\"</\\")&&e.slice(2,2+t.length).toLowerCase()===t.toLowerCase()&&/[\\\\t\\\\r\\\\n\\\\f />]/.test(e[2+t.length]||\\">\\")}function Dp(e,t){Wp(e,t,Hp(e,e.children[0]))}function Hp(e,t){const{children:n}=e;return n.length===1&&t.type===1&&!sp(t)}function Wp(e,t,n=false){const{children:o}=e;const s=o.length;let r=0;for(let e=0;e<o.length;e++){const s=o[e];if(s.type===1&&s.tagType===0){const e=n?0:zp(s,t);if(e>0){if(e>=2){s.codegenNode.patchFlag=-1+` /* HOISTED */`;s.codegenNode=t.hoist(s.codegenNode);r++;continue}}else{const e=s.codegenNode;if(e.type===13){const n=Yp(e);if((!n||n===512||n===1)&&Jp(s,t)>=2){const n=qp(s);if(n){e.props=t.hoist(n)}}if(e.dynamicProps){e.dynamicProps=t.hoist(e.dynamicProps)}}}}if(s.type===1){const e=s.tagType===1;if(e){t.scopes.vSlot++}Wp(s,t);if(e){t.scopes.vSlot--}}else if(s.type===11){Wp(s,t,s.children.length===1)}else if(s.type===9){for(let e=0;e<s.branches.length;e++){Wp(s.branches[e],t,s.branches[e].children.length===1)}}}if(r&&t.transformHoist){t.transformHoist(o,t,e)}if(r&&r===s&&e.type===1&&e.tagType===0&&e.codegenNode&&e.codegenNode.type===13&&d(e.codegenNode.children)){e.codegenNode.children=t.hoist(ku(e.codegenNode.children))}}function zp(e,t){const{constantCache:n}=t;switch(e.type){case 1:if(e.tagType!==0){return 0}const o=n.get(e);if(o!==void 0){return o}const s=e.codegenNode;if(s.type!==13){return 0}if(s.isBlock&&e.tag!==\\"svg\\"&&e.tag!==\\"foreignObject\\"){return 0}const r=Yp(s);if(!r){let o=3;const r=Jp(e,t);if(r===0){n.set(e,0);return 0}if(r<o){o=r}for(let s=0;s<e.children.length;s++){const r=zp(e.children[s],t);if(r===0){n.set(e,0);return 0}if(r<o){o=r}}if(o>1){for(let s=0;s<e.props.length;s++){const r=e.props[s];if(r.type===7&&r.name===\\"bind\\"&&r.exp){const s=zp(r.exp,t);if(s===0){n.set(e,0);return 0}if(s<o){o=s}}}}if(s.isBlock){for(let t=0;t<e.props.length;t++){const o=e.props[t];if(o.type===7){n.set(e,0);return 0}}t.removeHelper(Lf);t.removeHelper(Mu(t.inSSR,s.isComponent));s.isBlock=false;t.helper(Iu(t.inSSR,s.isComponent))}n.set(e,o);return o}else{n.set(e,0);return 0}case 2:case 3:return 3;case 9:case 11:case 10:return 0;case 5:case 12:return zp(e.content,t);case 4:return e.constType;case 8:let i=3;for(let n=0;n<e.children.length;n++){const o=e.children[n];if(b(o)||_(o)){continue}const s=zp(o,t);if(s===0){return 0}else if(s<i){i=s}}return i;default:return 0}}const Kp=new Set([ou,su,ru,iu]);function Gp(e,t){if(e.type===14&&!b(e.callee)&&Kp.has(e.callee)){const n=e.arguments[0];if(n.type===4){return zp(n,t)}else if(n.type===14){return Gp(n,t)}}return 0}function Jp(e,t){let n=3;const o=qp(e);if(o&&o.type===15){const{properties:e}=o;for(let o=0;o<e.length;o++){const{key:s,value:r}=e[o];const i=zp(s,t);if(i===0){return i}if(i<n){n=i}let l;if(r.type===4){l=zp(r,t)}else if(r.type===14){l=Gp(r,t)}else{l=0}if(l===0){return l}if(l<n){n=l}}}return n}function qp(e){const t=e.codegenNode;if(t.type===13){return t.props}}function Yp(e){const t=e.patchFlag;return t?parseInt(t,10):void 0}function Zp(e,{filename:t=\\"\\",prefixIdentifiers:o=false,hoistStatic:r=false,cacheHandlers:i=false,nodeTransforms:l=[],directiveTransforms:c={},transformHoist:a=null,isBuiltInComponent:f=s,isCustomElement:u=s,expressionPlugins:p=[],scopeId:d=null,slotted:h=true,ssr:m=false,inSSR:g=false,ssrCssVars:y=``,bindingMetadata:v=n,inline:_=false,isTS:w=false,onError:x=Of,onWarn:S=Af,compatConfig:k}){const C=t.replace(/\\\\?.*$/,\\"\\").match(/([^/\\\\\\\\]+)\\\\.\\\\w+$/);const $={selfName:C&&M(R(C[1])),prefixIdentifiers:o,hoistStatic:r,cacheHandlers:i,nodeTransforms:l,directiveTransforms:c,transformHoist:a,isBuiltInComponent:f,isCustomElement:u,expressionPlugins:p,scopeId:d,slotted:h,ssr:m,inSSR:g,ssrCssVars:y,bindingMetadata:v,inline:_,isTS:w,onError:x,onWarn:S,compatConfig:k,root:e,helpers:new Map,components:new Set,directives:new Set,hoists:[],imports:[],constantCache:new Map,temps:0,cached:0,identifiers:Object.create(null),scopes:{vFor:0,vSlot:0,vPre:0,vOnce:0},parent:null,currentNode:e,childIndex:0,inVOnce:false,helper(e){const t=$.helpers.get(e)||0;$.helpers.set(e,t+1);return e},removeHelper(e){const t=$.helpers.get(e);if(t){const n=t-1;if(!n){$.helpers.delete(e)}else{$.helpers.set(e,n)}}},helperString(e){return`_${bu[$.helper(e)]}`},replaceNode(e){{if(!$.currentNode){throw new Error(`Node being replaced is already removed.`)}if(!$.parent){throw new Error(`Cannot replace root node.`)}}$.parent.children[$.childIndex]=$.currentNode=e},removeNode(e){if(!$.parent){throw new Error(`Cannot remove root node.`)}const t=$.parent.children;const n=e?t.indexOf(e):$.currentNode?$.childIndex:-1;if(n<0){throw new Error(`node being removed is not a child of current parent`)}if(!e||e===$.currentNode){$.currentNode=null;$.onNodeRemoved()}else{if($.childIndex>n){$.childIndex--;$.onNodeRemoved()}}$.parent.children.splice(n,1)},onNodeRemoved:()=>{},addIdentifiers(e){},removeIdentifiers(e){},hoist(e){if(b(e))e=Tu(e);$.hoists.push(e);const t=Tu(`_hoisted_${$.hoists.length}`,false,e.loc,2);t.hoisted=e;return t},cache(e,t=false){return Ru($.cached++,e,t)}};return $}function Xp(e,t){const n=Zp(e,t);td(e,n);if(t.hoistStatic){Dp(e,n)}if(!t.ssr){Qp(e,n)}e.helpers=new Set([...n.helpers.keys()]);e.components=[...n.components];e.directives=[...n.directives];e.imports=n.imports;e.hoists=n.hoists;e.temps=n.temps;e.cached=n.cached}function Qp(e,t){const{helper:n}=t;const{children:o}=e;if(o.length===1){const n=o[0];if(Hp(e,n)&&n.codegenNode){const o=n.codegenNode;if(o.type===13){Fu(o,t)}e.codegenNode=o}else{e.codegenNode=n}}else if(o.length>1){let s=64;let r=W[64];if(o.filter((e=>e.type!==3)).length===1){s|=2048;r+=`, ${W[2048]}`}e.codegenNode=Su(t,n(If),void 0,e.children,s+` /* ${r} */`,void 0,void 0,true,void 0,false)}else;}function ed(e,t){let n=0;const o=()=>{n--};for(;n<e.children.length;n++){const s=e.children[n];if(b(s))continue;t.parent=e;t.childIndex=n;t.onNodeRemoved=o;td(s,t)}}function td(e,t){t.currentNode=e;const{nodeTransforms:n}=t;const o=[];for(let s=0;s<n.length;s++){const r=n[s](e,t);if(r){if(d(r)){o.push(...r)}else{o.push(r)}}if(!t.currentNode){return}else{e=t.currentNode}}switch(e.type){case 3:if(!t.ssr){t.helper(Wf)}break;case 5:if(!t.ssr){t.helper(tu)}break;case 9:for(let n=0;n<e.branches.length;n++){td(e.branches[n],t)}break;case 10:case 11:case 1:case 0:ed(e,t);break}t.currentNode=e;let s=o.length;while(s--){o[s]()}}function nd(e,t){const n=b(e)?t=>t===e:t=>e.test(t);return(e,o)=>{if(e.type===1){const{props:s}=e;if(e.tagType===3&&s.some(np)){return}const r=[];for(let i=0;i<s.length;i++){const l=s[i];if(l.type===7&&n(l.name)){s.splice(i,1);i--;const n=t(e,l,o);if(n)r.push(n)}}return r}}}const od=`/*#__PURE__*/`;const sd=e=>`${bu[e]}: _${bu[e]}`;function rd(e,{mode:t=\\"function\\",prefixIdentifiers:n=t===\\"module\\",sourceMap:o=false,filename:s=`template.vue.html`,scopeId:r=null,optimizeImports:i=false,runtimeGlobalName:l=`Vue`,runtimeModuleName:c=`vue`,ssrRuntimeModuleName:a=\\"vue/server-renderer\\",ssr:f=false,isTS:u=false,inSSR:p=false}){const d={mode:t,prefixIdentifiers:n,sourceMap:o,filename:s,scopeId:r,optimizeImports:i,runtimeGlobalName:l,runtimeModuleName:c,ssrRuntimeModuleName:a,ssr:f,isTS:u,inSSR:p,source:e.loc.source,code:``,column:1,line:1,offset:0,indentLevel:0,pure:false,map:void 0,helper(e){return`_${bu[e]}`},push(e,t){d.code+=e},indent(){h(++d.indentLevel)},deindent(e=false){if(e){--d.indentLevel}else{h(--d.indentLevel)}},newline(){h(d.indentLevel)}};function h(e){d.push(\\"\\\\n\\"+`  `.repeat(e))}return d}function id(e,t={}){const n=rd(e,t);if(t.onContextCreated)t.onContextCreated(n);const{mode:o,push:s,prefixIdentifiers:r,indent:i,deindent:l,newline:c,scopeId:a,ssr:f}=n;const u=Array.from(e.helpers);const p=u.length>0;const d=!r&&o!==\\"module\\";const h=false;const m=h?rd(e,t):n;{ld(e,m)}const g=f?`ssrRender`:`render`;const y=f?[\\"_ctx\\",\\"_push\\",\\"_parent\\",\\"_attrs\\"]:[\\"_ctx\\",\\"_cache\\"];const v=y.join(\\", \\");{s(`function ${g}(${v}) {`)}i();if(d){s(`with (_ctx) {`);i();if(p){s(`const { ${u.map(sd).join(\\", \\")} } = _Vue`);s(`\\\\n`);c()}}if(e.components.length){cd(e.components,\\"component\\",n);if(e.directives.length||e.temps>0){c()}}if(e.directives.length){cd(e.directives,\\"directive\\",n);if(e.temps>0){c()}}if(e.temps>0){s(`let `);for(let t=0;t<e.temps;t++){s(`${t>0?`, `:``}_temp${t}`)}}if(e.components.length||e.directives.length||e.temps){s(`\\\\n`);c()}if(!f){s(`return `)}if(e.codegenNode){dd(e.codegenNode,n)}else{s(`null`)}if(d){l();s(`}`)}l();s(`}`);return{ast:e,code:n.code,preamble:h?m.code:``,map:n.map?n.map.toJSON():void 0}}function ld(e,t){const{ssr:n,prefixIdentifiers:o,push:s,newline:r,runtimeModuleName:i,runtimeGlobalName:l,ssrRuntimeModuleName:c}=t;const a=l;const f=Array.from(e.helpers);if(f.length>0){{s(`const _Vue = ${a}\\\\n`);if(e.hoists.length){const e=[Df,Hf,Wf,zf,Kf].filter((e=>f.includes(e))).map(sd).join(\\", \\");s(`const { ${e} } = _Vue\\\\n`)}}}ad(e.hoists,t);r();s(`return `)}function cd(e,t,{helper:n,push:o,newline:s,isTS:r}){const i=n(t===\\"component\\"?Gf:qf);for(let n=0;n<e.length;n++){let l=e[n];const c=l.endsWith(\\"__self\\");if(c){l=l.slice(0,-6)}o(`const ${ap(l,t)} = ${i}(${JSON.stringify(l)}${c?`, true`:``})${r?`!`:``}`);if(n<e.length-1){s()}}}function ad(e,t){if(!e.length){return}t.pure=true;const{push:n,newline:o,helper:s,scopeId:r,mode:i}=t;o();for(let s=0;s<e.length;s++){const r=e[s];if(r){n(`const _hoisted_${s+1} = ${``}`);dd(r,t);o()}}t.pure=false}function fd(e){return b(e)||e.type===4||e.type===2||e.type===5||e.type===8}function ud(e,t){const n=e.length>3||e.some((e=>d(e)||!fd(e)));t.push(`[`);n&&t.indent();pd(e,t,n);n&&t.deindent();t.push(`]`)}function pd(e,t,n=false,o=true){const{push:s,newline:r}=t;for(let i=0;i<e.length;i++){const l=e[i];if(b(l)){s(l)}else if(d(l)){ud(l,t)}else{dd(l,t)}if(i<e.length-1){if(n){o&&s(\\",\\");r()}else{o&&s(\\", \\")}}}}function dd(e,t){if(b(e)){t.push(e);return}if(_(e)){t.push(t.helper(e));return}switch(e.type){case 1:case 9:case 11:Yu(e.codegenNode!=null,`Codegen node is missing for element/if/for node. Apply appropriate transforms first.`);dd(e.codegenNode,t);break;case 2:hd(e,t);break;case 4:md(e,t);break;case 5:gd(e,t);break;case 12:dd(e.codegenNode,t);break;case 8:yd(e,t);break;case 3:bd(e,t);break;case 13:_d(e,t);break;case 14:xd(e,t);break;case 15:Sd(e,t);break;case 17:kd(e,t);break;case 18:Cd(e,t);break;case 19:$d(e,t);break;case 20:Td(e,t);break;case 21:pd(e.body,t,true,false);break;case 22:break;case 23:break;case 24:break;case 25:break;case 26:break;case 10:break;default:{Yu(false,`unhandled codegen node type: ${e.type}`);const t=e;return t}}}function hd(e,t){t.push(JSON.stringify(e.content),e)}function md(e,t){const{content:n,isStatic:o}=e;t.push(o?JSON.stringify(n):n,e)}function gd(e,t){const{push:n,helper:o,pure:s}=t;if(s)n(od);n(`${o(tu)}(`);dd(e.content,t);n(`)`)}function yd(e,t){for(let n=0;n<e.children.length;n++){const o=e.children[n];if(b(o)){t.push(o)}else{dd(o,t)}}}function vd(e,t){const{push:n}=t;if(e.type===8){n(`[`);yd(e,t);n(`]`)}else if(e.isStatic){const t=Uu(e.content)?e.content:JSON.stringify(e.content);n(t,e)}else{n(`[${e.content}]`,e)}}function bd(e,t){const{push:n,helper:o,pure:s}=t;if(s){n(od)}n(`${o(Wf)}(${JSON.stringify(e.content)})`,e)}function _d(e,t){const{push:n,helper:o,pure:s}=t;const{tag:r,props:i,children:l,patchFlag:c,dynamicProps:a,directives:f,isBlock:u,disableTracking:p,isComponent:d}=e;if(f){n(o(Zf)+`(`)}if(u){n(`(${o(Lf)}(${p?`true`:``}), `)}if(s){n(od)}const h=u?Mu(t.inSSR,d):Iu(t.inSSR,d);n(o(h)+`(`,e);pd(wd([r,i,l,c,a]),t);n(`)`);if(u){n(`)`)}if(f){n(`, `);dd(f,t);n(`)`)}}function wd(e){let t=e.length;while(t--){if(e[t]!=null)break}return e.slice(0,t+1).map((e=>e||`null`))}function xd(e,t){const{push:n,helper:o,pure:s}=t;const r=b(e.callee)?e.callee:o(e.callee);if(s){n(od)}n(r+`(`,e);pd(e.arguments,t);n(`)`)}function Sd(e,t){const{push:n,indent:o,deindent:s,newline:r}=t;const{properties:i}=e;if(!i.length){n(`{}`,e);return}const l=i.length>1||i.some((e=>e.value.type!==4));n(l?`{`:`{ `);l&&o();for(let e=0;e<i.length;e++){const{key:o,value:s}=i[e];vd(o,t);n(`: `);dd(s,t);if(e<i.length-1){n(`,`);r()}}l&&s();n(l?`}`:` }`)}function kd(e,t){ud(e.elements,t)}function Cd(e,t){const{push:n,indent:o,deindent:s}=t;const{params:r,returns:i,body:l,newline:c,isSlot:a}=e;if(a){n(`_${bu[hu]}(`)}n(`(`,e);if(d(r)){pd(r,t)}else if(r){dd(r,t)}n(`) => `);if(c||l){n(`{`);o()}if(i){if(c){n(`return `)}if(d(i)){ud(i,t)}else{dd(i,t)}}else if(l){dd(l,t)}if(c||l){s();n(`}`)}if(a){n(`)`)}}function $d(e,t){const{test:n,consequent:o,alternate:s,newline:r}=e;const{push:i,indent:l,deindent:c,newline:a}=t;if(n.type===4){const e=!Uu(n.content);e&&i(`(`);md(n,t);e&&i(`)`)}else{i(`(`);dd(n,t);i(`)`)}r&&l();t.indentLevel++;r||i(` `);i(`? `);dd(o,t);t.indentLevel--;r&&a();r||i(` `);i(`: `);const f=s.type===19;if(!f){t.indentLevel++}dd(s,t);if(!f){t.indentLevel--}r&&c(true)}function Td(e,t){const{push:n,helper:o,indent:s,deindent:r,newline:i}=t;n(`_cache[${e.index}] || (`);if(e.isVNode){s();n(`${o(uu)}(-1),`);i()}n(`_cache[${e.index}] = `);dd(e.value,t);if(e.isVNode){n(`,`);i();n(`${o(uu)}(1),`);i();n(`_cache[${e.index}]`);r()}n(`)`)}const Ed=new RegExp(\\"\\\\\\\\b\\"+\\"arguments,await,break,case,catch,class,const,continue,debugger,default,delete,do,else,export,extends,finally,for,function,if,import,let,new,return,super,switch,throw,try,var,void,while,with,yield\\".split(\\",\\").join(\\"\\\\\\\\b|\\\\\\\\b\\")+\\"\\\\\\\\b\\");const Nd=/\'(?:[^\'\\\\\\\\]|\\\\\\\\.)*\'|\\"(?:[^\\"\\\\\\\\]|\\\\\\\\.)*\\"|`(?:[^`\\\\\\\\]|\\\\\\\\.)*\\\\$\\\\{|\\\\}(?:[^`\\\\\\\\]|\\\\\\\\.)*`|`(?:[^`\\\\\\\\]|\\\\\\\\.)*`/g;function Od(e,t,n=false,o=false){const s=e.content;if(!s.trim()){return}try{new Function(o?` ${s} `:`return ${n?`(${s}) => {}`:`(${s})`}`)}catch(n){let o=n.message;const r=s.replace(Nd,\\"\\").match(Ed);if(r){o=`avoid using JavaScript keyword as property name: \\"${r[0]}\\"`}t.onError(Rf(45,e.loc,void 0,o))}}const Ad=(e,t)=>{if(e.type===5){e.content=Rd(e.content,t)}else if(e.type===1){for(let n=0;n<e.props.length;n++){const o=e.props[n];if(o.type===7&&o.name!==\\"for\\"){const e=o.exp;const n=o.arg;if(e&&e.type===4&&!(o.name===\\"on\\"&&n)){o.exp=Rd(e,t,o.name===\\"slot\\")}if(n&&n.type===4&&!n.isStatic){o.arg=Rd(n,t)}}}}};function Rd(e,t,n=false,o=false,s=Object.create(t.identifiers)){{{Od(e,t,n,o)}return e}}const Pd=nd(/^(if|else|else-if)$/,((e,t,n)=>Id(e,t,n,((e,t,o)=>{const s=n.parent.children;let r=s.indexOf(e);let i=0;while(r-- >=0){const e=s[r];if(e&&e.type===9){i+=e.branches.length}}return()=>{if(o){e.codegenNode=Fd(t,i,n)}else{const o=Ld(e.codegenNode);o.alternate=Fd(t,i+e.branches.length-1,n)}}}))));function Id(e,t,n,o){if(t.name!==\\"else\\"&&(!t.exp||!t.exp.content.trim())){const o=t.exp?t.exp.loc:e.loc;n.onError(Rf(28,t.loc));t.exp=Tu(`true`,false,o)}if(t.exp){Od(t.exp,n)}if(t.name===\\"if\\"){const s=Md(e,t);const r={type:9,loc:e.loc,branches:[s]};n.replaceNode(r);if(o){return o(r,s,true)}}else{const s=n.parent.children;const r=[];let i=s.indexOf(e);while(i-- >=-1){const l=s[i];if(l&&l.type===3){n.removeNode(l);r.unshift(l);continue}if(l&&l.type===2&&!l.content.trim().length){n.removeNode(l);continue}if(l&&l.type===9){if(t.name===\\"else-if\\"&&l.branches[l.branches.length-1].condition===void 0){n.onError(Rf(30,e.loc))}n.removeNode();const s=Md(e,t);if(r.length&&!(n.parent&&n.parent.type===1&&Vu(n.parent.tag,\\"transition\\"))){s.children=[...r,...s.children]}{const e=s.userKey;if(e){l.branches.forEach((({userKey:t})=>{if(Vd(t,e)){n.onError(Rf(29,s.userKey.loc))}}))}}l.branches.push(s);const i=o&&o(l,s,false);td(s,n);if(i)i();n.currentNode=null}else{n.onError(Rf(30,e.loc))}break}}}function Md(e,t){const n=e.tagType===3;return{type:10,loc:e.loc,condition:t.name===\\"else\\"?void 0:t.exp,children:n&&!Zu(e,\\"for\\")?e.children:[e],userKey:Xu(e,`key`),isTemplateIf:n}}function Fd(e,t,n){if(e.condition){return Au(e.condition,jd(e,t,n),Nu(n.helper(Wf),[\'\\"v-if\\"\',\\"true\\"]))}else{return jd(e,t,n)}}function jd(e,t,n){const{helper:o}=n;const s=$u(`key`,Tu(`${t}`,false,wu,2));const{children:r}=e;const i=r[0];const l=r.length!==1||i.type!==1;if(l){if(r.length===1&&i.type===11){const e=i.codegenNode;lp(e,s,n);return e}else{let t=64;let i=W[64];if(!e.isTemplateIf&&r.filter((e=>e.type!==3)).length===1){t|=2048;i+=`, ${W[2048]}`}return Su(n,o(If),Cu([s]),r,t+` /* ${i} */`,void 0,void 0,true,false,false,e.loc)}}else{const e=i.codegenNode;const t=fp(e);if(t.type===13){Fu(t,n)}lp(t,s,n);return e}}function Vd(e,t){if(!e||e.type!==t.type){return false}if(e.type===6){if(e.value.content!==t.value.content){return false}}else{const n=e.exp;const o=t.exp;if(n.type!==o.type){return false}if(n.type!==4||n.isStatic!==o.isStatic||n.content!==o.content){return false}}return true}function Ld(e){while(true){if(e.type===19){if(e.alternate.type===19){e=e.alternate}else{return e}}else if(e.type===20){e=e.value}}}const Bd=nd(\\"for\\",((e,t,n)=>{const{helper:o,removeHelper:s}=n;return Ud(e,t,n,(t=>{const r=Nu(o(Xf),[t.source]);const i=op(e);const l=Zu(e,\\"memo\\");const c=Xu(e,`key`);const a=c&&(c.type===6?Tu(c.value.content,true):c.exp);const f=c?$u(`key`,a):null;const u=t.source.type===4&&t.source.constType>0;const p=u?64:c?128:256;t.codegenNode=Su(n,o(If),void 0,r,p+` /* ${W[p]} */`,void 0,void 0,true,!u,false,e.loc);return()=>{let c;const{children:p}=t;if(i){e.children.some((e=>{if(e.type===1){const t=Xu(e,\\"key\\");if(t){n.onError(Rf(33,t.loc));return true}}}))}const d=p.length!==1||p[0].type!==1;const h=sp(e)?e:i&&e.children.length===1&&sp(e.children[0])?e.children[0]:null;if(h){c=h.codegenNode;if(i&&f){lp(c,f,n)}}else if(d){c=Su(n,o(If),f?Cu([f]):void 0,e.children,64+` /* ${W[64]} */`,void 0,void 0,true,void 0,false)}else{c=p[0].codegenNode;if(i&&f){lp(c,f,n)}if(c.isBlock!==!u){if(c.isBlock){s(Lf);s(Mu(n.inSSR,c.isComponent))}else{s(Iu(n.inSSR,c.isComponent))}}c.isBlock=!u;if(c.isBlock){o(Lf);o(Mu(n.inSSR,c.isComponent))}else{o(Iu(n.inSSR,c.isComponent))}}if(l){const e=Ou(Gd(t.parseResult,[Tu(`_cached`)]));e.body=Pu([Eu([`const _memo = (`,l.exp,`)`]),Eu([`if (_cached`,...a?[` && _cached.key === `,a]:[],` && ${n.helperString(vu)}(_cached, _memo)) return _cached`]),Eu([`const _item = `,c]),Tu(`_item.memo = _memo`),Tu(`return _item`)]);r.arguments.push(e,Tu(`_cache`),Tu(String(n.cached++)))}else{r.arguments.push(Ou(Gd(t.parseResult),c,true))}}}))}));function Ud(e,t,n,o){if(!t.exp){n.onError(Rf(31,t.loc));return}const s=zd(t.exp,n);if(!s){n.onError(Rf(32,t.loc));return}const{addIdentifiers:r,removeIdentifiers:i,scopes:l}=n;const{source:c,value:a,key:f,index:u}=s;const p={type:11,loc:t.loc,source:c,valueAlias:a,keyAlias:f,objectIndexAlias:u,parseResult:s,children:op(e)?e.children:[e]};n.replaceNode(p);l.vFor++;const d=o&&o(p);return()=>{l.vFor--;if(d)d()}}const Dd=/([\\\\s\\\\S]*?)\\\\s+(?:in|of)\\\\s+([\\\\s\\\\S]*)/;const Hd=/,([^,\\\\}\\\\]]*)(?:,([^,\\\\}\\\\]]*))?$/;const Wd=/^\\\\(|\\\\)$/g;function zd(e,t){const n=e.loc;const o=e.content;const s=o.match(Dd);if(!s)return;const[,r,i]=s;const l={source:Kd(n,i.trim(),o.indexOf(i,r.length)),value:void 0,key:void 0,index:void 0};{Od(l.source,t)}let c=r.trim().replace(Wd,\\"\\").trim();const a=r.indexOf(c);const f=c.match(Hd);if(f){c=c.replace(Hd,\\"\\").trim();const e=f[1].trim();let s;if(e){s=o.indexOf(e,a+c.length);l.key=Kd(n,e,s);{Od(l.key,t,true)}}if(f[2]){const r=f[2].trim();if(r){l.index=Kd(n,r,o.indexOf(r,l.key?s+e.length:a+c.length));{Od(l.index,t,true)}}}}if(c){l.value=Kd(n,c,a);{Od(l.value,t,true)}}return l}function Kd(e,t,n){return Tu(t,false,Gu(e,n,t.length))}function Gd({value:e,key:t,index:n},o=[]){return Jd([e,t,n,...o])}function Jd(e){let t=e.length;while(t--){if(e[t])break}return e.slice(0,t+1).map(((e,t)=>e||Tu(`_`.repeat(t+1),false)))}const qd=Tu(`undefined`,false);const Yd=(e,t)=>{if(e.type===1&&(e.tagType===1||e.tagType===3)){const n=Zu(e,\\"slot\\");if(n){n.exp;t.scopes.vSlot++;return()=>{t.scopes.vSlot--}}}};const Zd=(e,t,n)=>Ou(e,t,false,true,t.length?t[0].loc:n);function Xd(e,t,n=Zd){t.helper(hu);const{children:o,loc:s}=e;const r=[];const i=[];let l=t.scopes.vSlot>0||t.scopes.vFor>0;const c=Zu(e,\\"slot\\",true);if(c){const{arg:e,exp:t}=c;if(e&&!ju(e)){l=true}r.push($u(e||Tu(\\"default\\",true),n(t,o,s)))}let a=false;let f=false;const u=[];const p=new Set;let d=0;for(let e=0;e<o.length;e++){const s=o[e];let h;if(!op(s)||!(h=Zu(s,\\"slot\\",true))){if(s.type!==3){u.push(s)}continue}if(c){t.onError(Rf(37,h.loc));break}a=true;const{children:m,loc:g}=s;const{arg:y=Tu(`default`,true),exp:v,loc:b}=h;let _;if(ju(y)){_=y?y.content:`default`}else{l=true}const w=n(v,m,g);let x;let S;let k;if(x=Zu(s,\\"if\\")){l=true;i.push(Au(x.exp,Qd(y,w,d++),qd))}else if(S=Zu(s,/^else(-if)?$/,true)){let n=e;let s;while(n--){s=o[n];if(s.type!==3){break}}if(s&&op(s)&&Zu(s,\\"if\\")){o.splice(e,1);e--;let t=i[i.length-1];while(t.alternate.type===19){t=t.alternate}t.alternate=S.exp?Au(S.exp,Qd(y,w,d++),qd):Qd(y,w,d++)}else{t.onError(Rf(30,S.loc))}}else if(k=Zu(s,\\"for\\")){l=true;const e=k.parseResult||zd(k.exp,t);if(e){i.push(Nu(t.helper(Xf),[e.source,Ou(Gd(e),Qd(y,w),true)]))}else{t.onError(Rf(32,k.loc))}}else{if(_){if(p.has(_)){t.onError(Rf(38,b));continue}p.add(_);if(_===\\"default\\"){f=true}}r.push($u(y,w))}}if(!c){const e=(e,t)=>{const o=n(e,t,s);return $u(`default`,o)};if(!a){r.push(e(void 0,o))}else if(u.length&&u.some((e=>th(e)))){if(f){t.onError(Rf(39,u[0].loc))}else{r.push(e(void 0,u))}}}const h=l?2:eh(e.children)?3:1;let m=Cu(r.concat($u(`_`,Tu(h+` /* ${z[h]} */`,false))),s);if(i.length){m=Nu(t.helper(eu),[m,ku(i)])}return{slots:m,hasDynamicSlots:l}}function Qd(e,t,n){const o=[$u(`name`,e),$u(`fn`,t)];if(n!=null){o.push($u(`key`,Tu(String(n),true)))}return Cu(o)}function eh(e){for(let t=0;t<e.length;t++){const n=e[t];switch(n.type){case 1:if(n.tagType===2||eh(n.children)){return true}break;case 9:if(eh(n.branches))return true;break;case 10:case 11:if(eh(n.children))return true;break}}return false}function th(e){if(e.type!==2&&e.type!==12)return true;return e.type===2?!!e.content.trim():th(e.content)}const nh=new WeakMap;const oh=(e,t)=>function n(){e=t.currentNode;if(!(e.type===1&&(e.tagType===0||e.tagType===1))){return}const{tag:o,props:s}=e;const r=e.tagType===1;let i=r?sh(e,t):`\\"${o}\\"`;const l=w(i)&&i.callee===Jf;let c;let a;let f;let u=0;let p;let d;let h;let m=l||i===Mf||i===Ff||!r&&(o===\\"svg\\"||o===\\"foreignObject\\");if(s.length>0){const n=rh(e,t,void 0,r,l);c=n.props;u=n.patchFlag;d=n.dynamicPropNames;const o=n.directives;h=o&&o.length?ku(o.map((e=>ch(e,t)))):void 0;if(n.shouldUseBlock){m=true}}if(e.children.length>0){if(i===jf){m=true;u|=1024;if(e.children.length>1){t.onError(Rf(46,{start:e.children[0].loc.start,end:e.children[e.children.length-1].loc.end,source:\\"\\"}))}}const n=r&&i!==Mf&&i!==jf;if(n){const{slots:n,hasDynamicSlots:o}=Xd(e,t);a=n;if(o){u|=1024}}else if(e.children.length===1&&i!==Mf){const n=e.children[0];const o=n.type;const s=o===5||o===8;if(s&&zp(n,t)===0){u|=1}if(s||o===2){a=n}else{a=e.children}}else{a=e.children}}if(u!==0){{if(u<0){f=u+` /* ${W[u]} */`}else{const e=Object.keys(W).map(Number).filter((e=>e>0&&u&e)).map((e=>W[e])).join(`, `);f=u+` /* ${e} */`}}if(d&&d.length){p=ah(d)}}e.codegenNode=Su(t,i,c,a,f,p,h,!!m,false,r,e.loc)};function sh(e,t,n=false){let{tag:o}=e;const s=fh(o);const r=Xu(e,\\"is\\");if(r){if(s||false){const e=r.type===6?r.value&&Tu(r.value.content,true):r.exp;if(e){return Nu(t.helper(Jf),[e])}}else if(r.type===6&&r.value.content.startsWith(\\"vue:\\")){o=r.value.content.slice(4)}}const i=!s&&Zu(e,\\"is\\");if(i&&i.exp){{t.onWarn(Rf(52,i.loc))}return Nu(t.helper(Jf),[i.exp])}const l=Lu(o)||t.isBuiltInComponent(o);if(l){if(!n)t.helper(l);return l}t.helper(Gf);t.components.add(o);return ap(o,`component`)}function rh(e,t,n=e.props,o,s,r=false){const{tag:i,loc:c,children:a}=e;let f=[];const u=[];const p=[];const d=a.length>0;let h=false;let m=0;let g=false;let y=false;let v=false;let b=false;let w=false;let x=false;const S=[];const k=e=>{if(f.length){u.push(Cu(ih(f),c));f=[]}if(e)u.push(e)};const C=({key:e,value:n})=>{if(ju(e)){const r=e.content;const i=l(r);if(i&&(!o||s)&&r.toLowerCase()!==\\"onclick\\"&&r!==\\"onUpdate:modelValue\\"&&!E(r)){b=true}if(i&&E(r)){x=true}if(n.type===20||(n.type===4||n.type===8)&&zp(n,t)>0){return}if(r===\\"ref\\"){g=true}else if(r===\\"class\\"){y=true}else if(r===\\"style\\"){v=true}else if(r!==\\"key\\"&&!S.includes(r)){S.push(r)}if(o&&(r===\\"class\\"||r===\\"style\\")&&!S.includes(r)){S.push(r)}}else{w=true}};for(let s=0;s<n.length;s++){const l=n[s];if(l.type===6){const{loc:e,name:n,value:o}=l;let s=true;if(n===\\"ref\\"){g=true;if(t.scopes.vFor>0){f.push($u(Tu(\\"ref_for\\",true),Tu(\\"true\\")))}}if(n===\\"is\\"&&(fh(i)||o&&o.content.startsWith(\\"vue:\\")||false)){continue}f.push($u(Tu(n,true,Gu(e,0,n.length)),Tu(o?o.content:\\"\\",s,o?o.loc:e)))}else{const{name:n,arg:s,exp:a,loc:m}=l;const g=n===\\"bind\\";const y=n===\\"on\\";if(n===\\"slot\\"){if(!o){t.onError(Rf(40,m))}continue}if(n===\\"once\\"||n===\\"memo\\"){continue}if(n===\\"is\\"||g&&Qu(s,\\"is\\")&&(fh(i)||false)){continue}if(y&&r){continue}if(g&&Qu(s,\\"key\\")||y&&d&&Qu(s,\\"vue:before-update\\")){h=true}if(g&&Qu(s,\\"ref\\")&&t.scopes.vFor>0){f.push($u(Tu(\\"ref_for\\",true),Tu(\\"true\\")))}if(!s&&(g||y)){w=true;if(a){if(g){k();u.push(a)}else{k({type:14,loc:m,callee:t.helper(lu),arguments:o?[a]:[a,`true`]})}}else{t.onError(Rf(g?34:35,m))}continue}const v=t.directiveTransforms[n];if(v){const{props:n,needRuntime:o}=v(l,e,t);!r&&n.forEach(C);if(y&&s&&!ju(s)){k(Cu(n,c))}else{f.push(...n)}if(o){p.push(l);if(_(o)){nh.set(l,o)}}}else if(!N(n)){p.push(l);if(d){h=true}}}}let $=void 0;if(u.length){k();if(u.length>1){$=Nu(t.helper(nu),u,c)}else{$=u[0]}}else if(f.length){$=Cu(ih(f),c)}if(w){m|=16}else{if(y&&!o){m|=2}if(v&&!o){m|=4}if(S.length){m|=8}if(b){m|=32}}if(!h&&(m===0||m===32)&&(g||x||p.length>0)){m|=512}if(!t.inSSR&&$){switch($.type){case 15:let e=-1;let n=-1;let o=false;for(let t=0;t<$.properties.length;t++){const s=$.properties[t].key;if(ju(s)){if(s.content===\\"class\\"){e=t}else if(s.content===\\"style\\"){n=t}}else if(!s.isHandlerKey){o=true}}const s=$.properties[e];const r=$.properties[n];if(!o){if(s&&!ju(s.value)){s.value=Nu(t.helper(ou),[s.value])}if(r&&(v||r.value.type===4&&r.value.content.trim()[0]===`[`||r.value.type===17)){r.value=Nu(t.helper(su),[r.value])}}else{$=Nu(t.helper(ru),[$])}break;case 14:break;default:$=Nu(t.helper(ru),[Nu(t.helper(iu),[$])]);break}}return{props:$,directives:p,patchFlag:m,dynamicPropNames:S,shouldUseBlock:h}}function ih(e){const t=new Map;const n=[];for(let o=0;o<e.length;o++){const s=e[o];if(s.key.type===8||!s.key.isStatic){n.push(s);continue}const r=s.key.content;const i=t.get(r);if(i){if(r===\\"style\\"||r===\\"class\\"||l(r)){lh(i,s)}}else{t.set(r,s);n.push(s)}}return n}function lh(e,t){if(e.value.type===17){e.value.elements.push(t.value)}else{e.value=ku([e.value,t.value],e.loc)}}function ch(e,t){const n=[];const o=nh.get(e);if(o){n.push(t.helperString(o))}else{{t.helper(qf);t.directives.add(e.name);n.push(ap(e.name,`directive`))}}const{loc:s}=e;if(e.exp)n.push(e.exp);if(e.arg){if(!e.exp){n.push(`void 0`)}n.push(e.arg)}if(Object.keys(e.modifiers).length){if(!e.arg){if(!e.exp){n.push(`void 0`)}n.push(`void 0`)}const t=Tu(`true`,false,s);n.push(Cu(e.modifiers.map((e=>$u(e,t))),s))}return ku(n,e.loc)}function ah(e){let t=`[`;for(let n=0,o=e.length;n<o;n++){t+=JSON.stringify(e[n]);if(n<o-1)t+=\\", \\"}return t+`]`}function fh(e){return e===\\"component\\"||e===\\"Component\\"}const uh=(e,t)=>{if(sp(e)){const{children:n,loc:o}=e;const{slotName:s,slotProps:r}=ph(e,t);const i=[t.prefixIdentifiers?`_ctx.$slots`:`$slots`,s,\\"{}\\",\\"undefined\\",\\"true\\"];let l=2;if(r){i[2]=r;l=3}if(n.length){i[3]=Ou([],n,false,false,o);l=4}if(t.scopeId&&!t.slotted){l=5}i.splice(l);e.codegenNode=Nu(t.helper(Qf),i,o)}};function ph(e,t){let n=`\\"default\\"`;let o=void 0;const s=[];for(let t=0;t<e.props.length;t++){const o=e.props[t];if(o.type===6){if(o.value){if(o.name===\\"name\\"){n=JSON.stringify(o.value.content)}else{o.name=R(o.name);s.push(o)}}}else{if(o.name===\\"bind\\"&&Qu(o.arg,\\"name\\")){if(o.exp)n=o.exp}else{if(o.name===\\"bind\\"&&o.arg&&ju(o.arg)){o.arg.content=R(o.arg.content)}s.push(o)}}}if(s.length>0){const{props:n,directives:r}=rh(e,t,s,false,false);o=n;if(r.length){t.onError(Rf(36,r[0].loc))}}return{slotName:n,slotProps:o}}const dh=/^\\\\s*([\\\\w$_]+|(async\\\\s*)?\\\\([^)]*?\\\\))\\\\s*(:[^=]+)?=>|^\\\\s*(async\\\\s+)?function(?:\\\\s+[\\\\w$]+)?\\\\s*\\\\(/;const hh=(e,t,n,o)=>{const{loc:s,modifiers:r,arg:i}=e;if(!e.exp&&!r.length){n.onError(Rf(35,s))}let l;if(i.type===4){if(i.isStatic){let e=i.content;if(e.startsWith(\\"vnode\\")){n.onWarn(Rf(51,i.loc))}if(e.startsWith(\\"vue:\\")){e=`vnode-${e.slice(4)}`}const o=t.tagType!==0||e.startsWith(\\"vnode\\")||!/[A-Z]/.test(e)?F(R(e)):`on:${e}`;l=Tu(o,true,i.loc)}else{l=Eu([`${n.helperString(fu)}(`,i,`)`])}}else{l=i;l.children.unshift(`${n.helperString(fu)}(`);l.children.push(`)`)}let c=e.exp;if(c&&!c.content.trim()){c=void 0}let a=n.cacheHandlers&&!c&&!n.inVOnce;if(c){const e=Ku(c.content);const t=!(e||dh.test(c.content));const o=c.content.includes(`;`);{Od(c,n,false,o)}if(t||a&&e){c=Eu([`${t?`$event`:`${``}(...args)`} => ${o?`{`:`(`}`,c,o?`}`:`)`])}}let f={props:[$u(l,c||Tu(`() => {}`,false,s))]};if(o){f=o(f)}if(a){f.props[0].value=n.cache(f.props[0].value)}f.props.forEach((e=>e.key.isHandlerKey=true));return f};const mh=(e,t,n)=>{const{exp:o,modifiers:s,loc:r}=e;const i=e.arg;if(i.type!==4){i.children.unshift(`(`);i.children.push(`) || \\"\\"`)}else if(!i.isStatic){i.content=`${i.content} || \\"\\"`}if(s.includes(\\"camel\\")){if(i.type===4){if(i.isStatic){i.content=R(i.content)}else{i.content=`${n.helperString(cu)}(${i.content})`}}else{i.children.unshift(`${n.helperString(cu)}(`);i.children.push(`)`)}}if(!n.inSSR){if(s.includes(\\"prop\\")){gh(i,\\".\\")}if(s.includes(\\"attr\\")){gh(i,\\"^\\")}}if(!o||o.type===4&&!o.content.trim()){n.onError(Rf(34,r));return{props:[$u(i,Tu(\\"\\",true,r))]}}return{props:[$u(i,o)]}};const gh=(e,t)=>{if(e.type===4){if(e.isStatic){e.content=t+e.content}else{e.content=`\\\\`${t}\\\\${${e.content}}\\\\``}}else{e.children.unshift(`\'${t}\' + (`);e.children.push(`)`)}};const yh=(e,t)=>{if(e.type===0||e.type===1||e.type===11||e.type===10){return()=>{const n=e.children;let o=void 0;let s=false;for(let e=0;e<n.length;e++){const t=n[e];if(tp(t)){s=true;for(let s=e+1;s<n.length;s++){const r=n[s];if(tp(r)){if(!o){o=n[e]=Eu([t],t.loc)}o.children.push(` + `,r);n.splice(s,1);s--}else{o=void 0;break}}}}if(!s||n.length===1&&(e.type===0||e.type===1&&e.tagType===0&&!e.props.find((e=>e.type===7&&!t.directiveTransforms[e.name]))&&true)){return}for(let e=0;e<n.length;e++){const o=n[e];if(tp(o)||o.type===8){const s=[];if(o.type!==2||o.content!==\\" \\"){s.push(o)}if(!t.ssr&&zp(o,t)===0){s.push(1+` /* ${W[1]} */`)}n[e]={type:12,content:o,loc:o.loc,codegenNode:Nu(t.helper(zf),s)}}}}}};const vh=new WeakSet;const bh=(e,t)=>{if(e.type===1&&Zu(e,\\"once\\",true)){if(vh.has(e)||t.inVOnce||t.inSSR){return}vh.add(e);t.inVOnce=true;t.helper(uu);return()=>{t.inVOnce=false;const e=t.currentNode;if(e.codegenNode){e.codegenNode=t.cache(e.codegenNode,true)}}}};const _h=(e,t,n)=>{const{exp:o,arg:s}=e;if(!o){n.onError(Rf(41,e.loc));return wh()}const r=o.loc.source;const i=o.type===4?o.content:r;const l=n.bindingMetadata[r];if(l===\\"props\\"||l===\\"props-aliased\\"){n.onError(Rf(44,o.loc));return wh()}const c=false;if(!i.trim()||!Ku(i)&&!c){n.onError(Rf(42,o.loc));return wh()}const a=s?s:Tu(\\"modelValue\\",true);const f=s?ju(s)?`onUpdate:${R(s.content)}`:Eu([\'\\"onUpdate:\\" + \',s]):`onUpdate:modelValue`;let u;const p=n.isTS?`($event: any)`:`$event`;{u=Eu([`${p} => ((`,o,`) = $event)`])}const d=[$u(a,e.exp),$u(f,u)];if(e.modifiers.length&&t.tagType===1){const t=e.modifiers.map((e=>(Uu(e)?e:JSON.stringify(e))+`: true`)).join(`, `);const n=s?ju(s)?`${s.content}Modifiers`:Eu([s,\' + \\"Modifiers\\"\']):`modelModifiers`;d.push($u(n,Tu(`{ ${t} }`,false,e.loc,2)))}return wh(d)};function wh(e=[]){return{props:e}}const xh=new WeakSet;const Sh=(e,t)=>{if(e.type===1){const n=Zu(e,\\"memo\\");if(!n||xh.has(e)){return}xh.add(e);return()=>{const o=e.codegenNode||t.currentNode.codegenNode;if(o&&o.type===13){if(e.tagType!==1){Fu(o,t)}e.codegenNode=Nu(t.helper(yu),[n.exp,Ou(void 0,o),`_cache`,String(t.cached++)])}}}};function kh(e){return[[bh,Pd,Sh,Bd,...[],...[Ad],uh,oh,Yd,yh],{on:hh,bind:mh,model:_h}]}function Ch(e,t={}){const n=t.onError||Of;const o=t.mode===\\"module\\";{if(t.prefixIdentifiers===true){n(Rf(47))}else if(o){n(Rf(48))}}const s=false;if(t.cacheHandlers){n(Rf(49))}if(t.scopeId&&!o){n(Rf(50))}const r=b(e)?hp(e,t):e;const[i,l]=kh();Xp(r,a({},t,{prefixIdentifiers:s,nodeTransforms:[...i,...t.nodeTransforms||[]],directiveTransforms:a({},l,t.directiveTransforms||{})}));return id(r,a({},t,{prefixIdentifiers:s}))}const $h=()=>({props:[]});const Th=Symbol(`vModelRadio`);const Eh=Symbol(`vModelCheckbox`);const Nh=Symbol(`vModelText`);const Oh=Symbol(`vModelSelect`);const Ah=Symbol(`vModelDynamic`);const Rh=Symbol(`vOnModifiersGuard`);const Ph=Symbol(`vOnKeysGuard`);const Ih=Symbol(`vShow`);const Mh=Symbol(`Transition`);const Fh=Symbol(`TransitionGroup`);_u({[Th]:`vModelRadio`,[Eh]:`vModelCheckbox`,[Nh]:`vModelText`,[Oh]:`vModelSelect`,[Ah]:`vModelDynamic`,[Rh]:`withModifiers`,[Ph]:`withKeys`,[Ih]:`vShow`,[Mh]:`Transition`,[Fh]:`TransitionGroup`});let jh;function Vh(e,t=false){if(!jh){jh=document.createElement(\\"div\\")}if(t){jh.innerHTML=`<div foo=\\"${e.replace(/\\"/g,\\"&quot;\\")}\\">`;return jh.children[0].getAttribute(\\"foo\\")}else{jh.innerHTML=e;return jh.textContent}}const Lh=t(\\"style,iframe,script,noscript\\",true);const Bh={isVoidTag:ce,isNativeTag:e=>ie(e)||le(e),isPreTag:e=>e===\\"pre\\",decodeEntities:Vh,isBuiltInComponent:e=>{if(Vu(e,`Transition`)){return Mh}else if(Vu(e,`TransitionGroup`)){return Fh}},getNamespace(e,t){let n=t?t.ns:0;if(t&&n===2){if(t.tag===\\"annotation-xml\\"){if(e===\\"svg\\"){return 1}if(t.props.some((e=>e.type===6&&e.name===\\"encoding\\"&&e.value!=null&&(e.value.content===\\"text/html\\"||e.value.content===\\"application/xhtml+xml\\")))){n=0}}else if(/^m(?:[ions]|text)$/.test(t.tag)&&e!==\\"mglyph\\"&&e!==\\"malignmark\\"){n=0}}else if(t&&n===1){if(t.tag===\\"foreignObject\\"||t.tag===\\"desc\\"||t.tag===\\"title\\"){n=0}}if(n===0){if(e===\\"svg\\"){return 1}if(e===\\"math\\"){return 2}}return n},getTextMode({tag:e,ns:t}){if(t===0){if(e===\\"textarea\\"||e===\\"title\\"){return 1}if(Lh(e)){return 2}}return 0}};const Uh=e=>{if(e.type===1){e.props.forEach(((t,n)=>{if(t.type===6&&t.name===\\"style\\"&&t.value){e.props[n]={type:7,name:`bind`,arg:Tu(`style`,true,t.loc),exp:Dh(t.value.content,t.loc),modifiers:[],loc:t.loc}}}))}};const Dh=(e,t)=>{const n=ee(e);return Tu(JSON.stringify(n),false,t,3)};function Hh(e,t){return Rf(e,t,Wh)}const Wh={[53]:`v-html is missing expression.`,[54]:`v-html will override element children.`,[55]:`v-text is missing expression.`,[56]:`v-text will override element children.`,[57]:`v-model can only be used on <input>, <textarea> and <select> elements.`,[58]:`v-model argument is not supported on plain elements.`,[59]:`v-model cannot be used on file inputs since they are read-only. Use a v-on:change listener instead.`,[60]:`Unnecessary value binding used alongside v-model. It will interfere with v-model\'s behavior.`,[61]:`v-show is missing expression.`,[62]:`<Transition> expects exactly one child element or component.`,[63]:`Tags with side effect (<script> and <style>) are ignored in client component templates.`};const zh=(e,t,n)=>{const{exp:o,loc:s}=e;if(!o){n.onError(Hh(53,s))}if(t.children.length){n.onError(Hh(54,s));t.children.length=0}return{props:[$u(Tu(`innerHTML`,true,s),o||Tu(\\"\\",true))]}};const Kh=(e,t,n)=>{const{exp:o,loc:s}=e;if(!o){n.onError(Hh(55,s))}if(t.children.length){n.onError(Hh(56,s));t.children.length=0}return{props:[$u(Tu(`textContent`,true),o?zp(o,n)>0?o:Nu(n.helperString(tu),[o],s):Tu(\\"\\",true))]}};const Gh=(e,t,n)=>{const o=_h(e,t,n);if(!o.props.length||t.tagType===1){return o}if(e.arg){n.onError(Hh(58,e.arg.loc))}function s(){const e=Xu(t,\\"value\\");if(e){n.onError(Hh(60,e.loc))}}const{tag:r}=t;const i=n.isCustomElement(r);if(r===\\"input\\"||r===\\"textarea\\"||r===\\"select\\"||i){let l=Nh;let c=false;if(r===\\"input\\"||i){const o=Xu(t,`type`);if(o){if(o.type===7){l=Ah}else if(o.value){switch(o.value.content){case\\"radio\\":l=Th;break;case\\"checkbox\\":l=Eh;break;case\\"file\\":c=true;n.onError(Hh(59,e.loc));break;default:s();break}}}else if(ep(t)){l=Ah}else{s()}}else if(r===\\"select\\"){l=Oh}else{s()}if(!c){o.needRuntime=n.helper(l)}}else{n.onError(Hh(57,e.loc))}o.props=o.props.filter((e=>!(e.key.type===4&&e.key.content===\\"modelValue\\")));return o};const Jh=t(`passive,once,capture`);const qh=t(`stop,prevent,self,ctrl,shift,alt,meta,exact,middle`);const Yh=t(\\"left,right\\");const Zh=t(`onkeyup,onkeydown,onkeypress`,true);const Xh=(e,t,n,o)=>{const s=[];const r=[];const i=[];for(let n=0;n<t.length;n++){const o=t[n];if(Jh(o)){i.push(o)}else{if(Yh(o)){if(ju(e)){if(Zh(e.content)){s.push(o)}else{r.push(o)}}else{s.push(o);r.push(o)}}else{if(qh(o)){r.push(o)}else{s.push(o)}}}}return{keyModifiers:s,nonKeyModifiers:r,eventOptionModifiers:i}};const Qh=(e,t)=>{const n=ju(e)&&e.content.toLowerCase()===\\"onclick\\";return n?Tu(t,true):e.type!==4?Eu([`(`,e,`) === \\"onClick\\" ? \\"${t}\\" : (`,e,`)`]):e};const em=(e,t,n)=>hh(e,t,n,(t=>{const{modifiers:o}=e;if(!o.length)return t;let{key:s,value:r}=t.props[0];const{keyModifiers:i,nonKeyModifiers:l,eventOptionModifiers:c}=Xh(s,o,n,e.loc);if(l.includes(\\"right\\")){s=Qh(s,`onContextmenu`)}if(l.includes(\\"middle\\")){s=Qh(s,`onMouseup`)}if(l.length){r=Nu(n.helper(Rh),[r,JSON.stringify(l)])}if(i.length&&(!ju(s)||Zh(s.content))){r=Nu(n.helper(Ph),[r,JSON.stringify(i)])}if(c.length){const e=c.map(M).join(\\"\\");s=ju(s)?Tu(`${s.content}${e}`,true):Eu([`(`,s,`) + \\"${e}\\"`])}return{props:[$u(s,r)]}}));const tm=(e,t,n)=>{const{exp:o,loc:s}=e;if(!o){n.onError(Hh(61,s))}return{props:[],needRuntime:n.helper(Ih)}};const nm=(e,t)=>{if(e.type===1&&e.tagType===1){const n=t.isBuiltInComponent(e.tag);if(n===Mh){return()=>{if(!e.children.length){return}if(om(e)){t.onError(Hh(62,{start:e.children[0].loc.start,end:e.children[e.children.length-1].loc.end,source:\\"\\"}))}const n=e.children[0];if(n.type===1){for(const t of n.props){if(t.type===7&&t.name===\\"show\\"){e.props.push({type:6,name:\\"persisted\\",value:void 0,loc:e.loc})}}}}}}};function om(e){const t=e.children=e.children.filter((e=>e.type!==3&&!(e.type===2&&!e.content.trim())));const n=t[0];return t.length!==1||n.type===11||n.type===9&&n.branches.some(om)}const sm=(e,t)=>{if(e.type===1&&e.tagType===0&&(e.tag===\\"script\\"||e.tag===\\"style\\")){t.onError(Hh(63,e.loc));t.removeNode()}};const rm=[Uh,...[nm]];const im={cloak:$h,html:zh,text:Kh,model:Gh,on:em,show:tm};function lm(e,t={}){return Ch(e,a({},Bh,t,{nodeTransforms:[sm,...rm,...t.nodeTransforms||[]],directiveTransforms:a({},im,t.directiveTransforms||{}),transformHoist:null}))}{Nf()}const cm=Object.create(null);function am(e,t){if(!b(e)){if(e.nodeType){e=e.innerHTML}else{Nn(`invalid template option: `,e);return s}}const n=e;const o=cm[n];if(o){return o}if(e[0]===\\"#\\"){const t=document.querySelector(e);if(!t){Nn(`Template element not found or is empty: ${e}`)}e=t?t.innerHTML:``}const r=a({hoistStatic:true,onError:l,onWarn:e=>l(e,true)},t);if(!r.isCustomElement&&typeof customElements!==\\"undefined\\"){r.isCustomElement=e=>!!customElements.get(e)}const{code:i}=lm(e,r);function l(t,n=false){const o=n?t.message:`Template compilation error: ${t.message}`;const s=t.loc&&q(e,t.loc.start.offset,t.loc.end.offset);Nn(s?`${o}\\\\n${s}`:o)}const c=new Function(i)();c._rc=true;return cm[n]=c}mc(am);e.BaseTransition=Ps;e.BaseTransitionPropsValidators=As;e.Comment=bl;e.EffectScope=be;e.Fragment=yl;e.KeepAlive=Ks;e.ReactiveEffect=Fe;e.Static=_l;e.Suspense=rs;e.Teleport=ml;e.Text=vl;e.Transition=xa;e.TransitionGroup=Ha;e.VueElement=ma;e.assertNumber=Mn;e.callWithAsyncErrorHandling=Vn;e.callWithErrorHandling=jn;e.camelize=R;e.capitalize=M;e.cloneVNode=Dl;e.compatUtils=jc;e.compile=am;e.computed=Tc;e.createApp=Sf;e.createBlock=Nl;e.createCommentVNode=Kl;e.createElementBlock=El;e.createElementVNode=Vl;e.createHydrationRenderer=ol;e.createPropsRestProxy=qr;e.createRenderer=nl;e.createSSRApp=kf;e.createSlots=wr;e.createStaticVNode=zl;e.createTextVNode=Wl;e.createVNode=Ll;e.customRef=vn;e.defineAsyncComponent=Ds;e.defineComponent=Bs;e.defineCustomElement=pa;e.defineEmits=Fr;e.defineExpose=jr;e.defineModel=Br;e.defineOptions=Vr;e.defineProps=Mr;e.defineSSRCustomElement=da;e.defineSlots=Lr;e.effect=Ve;e.effectScope=_e;e.getCurrentInstance=nc;e.getCurrentScope=xe;e.getTransitionRawChildren=Ls;e.guardReactiveProps=Ul;e.h=Ec;e.handleError=Ln;e.hasInjectionContext=bi;e.hydrate=xf;e.initCustomFormatter=Ac;e.initDirectivesForSSR=Ef;e.inject=vi;e.isMemoSame=Pc;e.isProxy=Qt;e.isReactive=Yt;e.isReadonly=Zt;e.isRef=ln;e.isRuntimeOnly=gc;e.isShallow=Xt;e.isVNode=Ol;e.markRaw=tn;e.mergeDefaults=Gr;e.mergeModels=Jr;e.mergeProps=Yl;e.nextTick=Zn;e.normalizeClass=te;e.normalizeProps=ne;e.normalizeStyle=Y;e.onActivated=Js;e.onBeforeMount=nr;e.onBeforeUnmount=ir;e.onBeforeUpdate=sr;e.onDeactivated=qs;e.onErrorCaptured=ur;e.onMounted=or;e.onRenderTracked=fr;e.onRenderTriggered=ar;e.onScopeDispose=Se;e.onServerPrefetch=cr;e.onUnmounted=lr;e.onUpdated=rr;e.openBlock=Sl;e.popScopeId=Ho;e.provide=yi;e.proxyRefs=gn;e.pushScopeId=Do;e.queuePostFlushCb=no;e.reactive=zt;e.readonly=Gt;e.ref=cn;e.registerRuntimeCompiler=mc;e.render=wf;e.renderList=_r;e.renderSlot=xr;e.resolveComponent=hr;e.resolveDirective=yr;e.resolveDynamicComponent=gr;e.resolveFilter=Fc;e.resolveTransitionHooks=Ms;e.setBlockTracking=$l;e.setDevtoolsHook=ko;e.setTransitionHooks=Vs;e.shallowReactive=Kt;e.shallowReadonly=Jt;e.shallowRef=an;e.ssrContextKey=Nc;e.ssrUtils=Mc;e.stop=Le;e.toDisplayString=me;e.toHandlerKey=F;e.toHandlers=kr;e.toRaw=en;e.toRef=xn;e.toRefs=bn;e.toValue=hn;e.transformVNodeArgs=Pl;e.triggerRef=pn;e.unref=dn;e.useAttrs=Hr;e.useCssModule=ga;e.useCssVars=ya;e.useModel=Wr;e.useSSRContext=Oc;e.useSlots=Dr;e.useTransitionState=Ns;e.vModelCheckbox=Xa;e.vModelDynamic=rf;e.vModelRadio=ef;e.vModelSelect=tf;e.vModelText=Za;e.vShow=hf;e.version=Ic;e.warn=Nn;e.watch=ws;e.watchEffect=ys;e.watchPostEffect=vs;e.watchSyncEffect=bs;e.withAsyncContext=Yr;e.withCtx=zo;e.withDefaults=Ur;e.withDirectives=Ts;e.withKeys=df;e.withMemo=Rc;e.withModifiers=uf;e.withScopeId=Wo;return e}({});"}'

const vuelocal = JSON.parse(vuelo).script
$.done({
  response: {
    status: 200,
    body: html + vuelocal + htmls,
    headers: {
      'Content-Type': 'text/html;charset=UTF-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST,GET,OPTIONS,PUT,DELETE',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
    },
  },
})
function httpAPI(path = '', method = 'POST', body = null) {
  return new Promise(resolve => {
    $httpAPI(method, path, body, result => {
      resolve(result)
    })
  })
}

// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise(((e,r)=>{s.call(this,t,((t,s,a)=>{t?r(t):e(s)}))}))}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",Object.assign(this,e)}getEnv(){return"undefined"!=typeof $environment&&$environment["surge-version"]?"Surge":"undefined"!=typeof $environment&&$environment["stash-version"]?"Stash":"undefined"!=typeof module&&module.exports?"Node.js":"undefined"!=typeof $task?"Quantumult X":"undefined"!=typeof $loon?"Loon":"undefined"!=typeof $rocket?"Shadowrocket":void 0}isNode(){return"Node.js"===this.getEnv()}isQuanX(){return"Quantumult X"===this.getEnv()}isSurge(){return"Surge"===this.getEnv()}isLoon(){return"Loon"===this.getEnv()}isShadowrocket(){return"Shadowrocket"===this.getEnv()}isStash(){return"Stash"===this.getEnv()}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const r=this.getdata(t);if(r)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise((e=>{this.get({url:t},((t,s,r)=>e(r)))}))}runScript(t,e){return new Promise((s=>{let r=this.getdata("@chavy_boxjs_userCfgs.httpapi");r=r?r.replace(/\n/g,"").trim():r;let a=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");a=a?1*a:20,a=e&&e.timeout?e.timeout:a;const[o,i]=r.split("@"),n={url:`http://${i}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:a},headers:{"X-Key":o,Accept:"*/*"},timeout:a};this.post(n,((t,e,r)=>s(r)))})).catch((t=>this.logErr(t)))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),r=!s&&this.fs.existsSync(e);if(!s&&!r)return{};{const r=s?t:e;try{return JSON.parse(this.fs.readFileSync(r))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),r=!s&&this.fs.existsSync(e),a=JSON.stringify(this.data);s?this.fs.writeFileSync(t,a):r?this.fs.writeFileSync(e,a):this.fs.writeFileSync(t,a)}}lodash_get(t,e,s){const r=e.replace(/\[(\d+)\]/g,".$1").split(".");let a=t;for(const t of r)if(a=Object(a)[t],void 0===a)return s;return a}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce(((t,s,r)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[r+1])>>0==+e[r+1]?[]:{}),t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,r]=/^@(.*?)\.(.*?)$/.exec(t),a=s?this.getval(s):"";if(a)try{const t=JSON.parse(a);e=t?this.lodash_get(t,r,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,r,a]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(r),i=r?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(i);this.lodash_set(e,a,t),s=this.setval(JSON.stringify(e),r)}catch(e){const o={};this.lodash_set(o,a,t),s=this.setval(JSON.stringify(o),r)}}else s=this.setval(t,e);return s}getval(t){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.read(t);case"Quantumult X":return $prefs.valueForKey(t);case"Node.js":return this.data=this.loaddata(),this.data[t];default:return this.data&&this.data[t]||null}}setval(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.write(t,e);case"Quantumult X":return $prefs.setValueForKey(t,e);case"Node.js":return this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0;default:return this.data&&this.data[e]||null}}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){switch(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"],delete t.headers["content-type"],delete t.headers["content-length"]),t.params&&(t.url+="?"+this.queryStr(t.params)),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,((t,s,r)=>{!t&&s&&(s.body=r,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,r)}));break;case"Quantumult X":this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then((t=>{const{statusCode:s,statusCode:r,headers:a,body:o,bodyBytes:i}=t;e(null,{status:s,statusCode:r,headers:a,body:o,bodyBytes:i},o,i)}),(t=>e(t&&t.error||"UndefinedError")));break;case"Node.js":let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",((t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}})).then((t=>{const{statusCode:r,statusCode:a,headers:o,rawBody:i}=t,n=s.decode(i,this.encoding);e(null,{status:r,statusCode:a,headers:o,rawBody:i,body:n},n)}),(t=>{const{message:r,response:a}=t;e(r,a,a&&s.decode(a.rawBody,this.encoding))}))}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";switch(t.body&&t.headers&&!t.headers["Content-Type"]&&!t.headers["content-type"]&&(t.headers["content-type"]="application/x-www-form-urlencoded"),t.headers&&(delete t.headers["Content-Length"],delete t.headers["content-length"]),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,((t,s,r)=>{!t&&s&&(s.body=r,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,r)}));break;case"Quantumult X":;t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then((t=>{const{statusCode:s,statusCode:r,headers:a,body:o,bodyBytes:i}=t;e(null,{status:s,statusCode:r,headers:a,body:o,bodyBytes:i},o,i)}),(t=>e(t&&t.error||"UndefinedError")));break;case"Node.js":let r=require("iconv-lite");this.initGotEnv(t);const{url:a,...o}=t;this.got[s](a,o).then((t=>{const{statusCode:s,statusCode:a,headers:o,rawBody:i}=t,n=r.decode(i,this.encoding);e(null,{status:s,statusCode:a,headers:o,rawBody:i,body:n},n)}),(t=>{const{message:s,response:a}=t;e(s,a,a&&r.decode(a.rawBody,this.encoding))}))}}time(t,e=null){const s=e?new Date(e):new Date;let r={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in r)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?r[e]:("00"+r[e]).substr((""+r[e]).length)));return t}queryStr(t){let e="";for(const s in t){let r=t[s];null!=r&&""!==r&&("object"==typeof r&&(r=JSON.stringify(r)),e+=`${s}=${r}&`)}return e=e.substring(0,e.length-1),e}msg(e=t,s="",r="",a){const o=t=>{switch(typeof t){case void 0:return t;case"string":switch(this.getEnv()){case"Surge":case"Stash":default:return{url:t};case"Loon":case"Shadowrocket":return t;case"Quantumult X":return{"open-url":t};case"Node.js":return}case"object":switch(this.getEnv()){case"Surge":case"Stash":case"Shadowrocket":default:{let e=t.url||t.openUrl||t["open-url"];return{url:e}}case"Loon":{let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}case"Quantumult X":{let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl,r=t["update-pasteboard"]||t.updatePasteboard;return{"open-url":e,"media-url":s,"update-pasteboard":r}}case"Node.js":return}default:return}};if(!this.isMute)switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:$notification.post(e,s,r,o(a));break;case"Quantumult X":$notify(e,s,r,o(a));break;case"Node.js":}if(!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),r&&t.push(r),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:this.log("",`❗️${this.name}, 错误!`,t);break;case"Node.js":this.log("",`❗️${this.name}, 错误!`,t.stack)}}wait(t){return new Promise((e=>setTimeout(e,t)))}done(t={}){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:$done(t);break;case"Node.js":process.exit(1)}}}(t,e)}
