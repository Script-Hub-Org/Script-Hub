const fs = require('fs')
const path = require('path')
const Koa = require('koa')
const { scriptMap, scriptMapBeta } = require('./scriptMap.js')
const PORT = process.env.PORT || 9000
const BETA_PORT = process.env.BETA_PORT || 9001
const HOST = process.env.HOST || '0.0.0.0'
const EXPORT_HTML = process.env.EXPORT_HTML

const generateHTML = (config, info = '') => {
  const content = fs.readFileSync(config[1], { encoding: 'utf8' })
  let html =
    content.match(/<!DOCTYPE html>([\s\S]*?<body style="margin-bottom: 80px;"><script>)/i)[1] +
    '</script><script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>' +
    content.match(/(<div id="app">[\s\S]*?)<\/html>/i)[1].replace("${$.getEnv() || ''}", 'Node.js' + info)
  const rewriteParser = fs.readFileSync(config[2], { encoding: 'utf8' })
  const ruleParser = fs.readFileSync(config[3], { encoding: 'utf8' })
  const scriptConverter = fs.readFileSync(config[4], { encoding: 'utf8' })
  return html.replace(
    '"__SCRIPT__"',
    JSON.stringify({ scriptConverter, rewriteParser, ruleParser, scriptMap: config[5] })
  )
}

if (EXPORT_HTML) {
  // fs.rmdirSync(path.join(__dirname, './dist'), { recursive: true })
  fs.mkdirSync(path.join(__dirname, './dist/beta'), { recursive: true })
  fs.writeFileSync(
    path.join(__dirname, './dist/index.html'),
    generateHTML([
      scriptMap,
      path.join(__dirname, './script-hub.js'),
      path.join(__dirname, 'Rewrite-Parser.js'),
      path.join(__dirname, 'rule-parser.js'),
      path.join(__dirname, 'script-converter.js'),
    ]),
    {
      encoding: 'utf8',
    }
  )
  fs.writeFileSync(
    path.join(__dirname, './dist/beta/index.html'),
    generateHTML(
      [
        scriptMapBeta,
        path.join(__dirname, './script-hub.beta.js'),
        path.join(__dirname, 'Rewrite-Parser.beta.js'),
        path.join(__dirname, 'rule-parser.beta.js'),
        path.join(__dirname, 'script-converter.beta.js'),
      ],
      '(β)'
    ),
    {
      encoding: 'utf8',
    }
  )
} else {
  const app = new Koa()

  app.use(async ctx => {
    const html = generateHTML([
      scriptMap,
      path.join(__dirname, './script-hub.js'),
      path.join(__dirname, 'Rewrite-Parser.js'),
      path.join(__dirname, 'rule-parser.js'),
      path.join(__dirname, 'script-converter.js'),
    ])
    ctx.type = 'html'
    ctx.body = html
  })

  app.listen(PORT, HOST, async ctx => {
    console.log(`listening on port ${HOST}:${PORT}, http://127.0.0.1:${PORT}`)
  })

  const appBeta = new Koa()

  appBeta.use(async ctx => {
    const html = generateHTML(
      [
        scriptMapBeta,
        path.join(__dirname, './script-hub.beta.js'),
        path.join(__dirname, 'Rewrite-Parser.beta.js'),
        path.join(__dirname, 'rule-parser.beta.js'),
        path.join(__dirname, 'script-converter.beta.js'),
      ],
      '(β)'
    )
    ctx.type = 'html'
    ctx.body = html
  })

  appBeta.listen(BETA_PORT, HOST, async ctx => {
    console.log(`β listening on port ${HOST}:${BETA_PORT}, http://127.0.0.1:${BETA_PORT}`)
  })
}
