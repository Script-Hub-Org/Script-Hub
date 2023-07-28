const fs = require('fs')
const path = require('path')
const Koa = require('koa')

const PORT = process.env.PORT || 9000
const BETA_PORT = process.env.BETA_PORT || 9001
const HOST = process.env.HOST || '0.0.0.0'
const EXPORT_HTML = process.env.EXPORT_HTML

const generateHTML = (filePath, info = '') => {
  const content = fs.readFileSync(filePath, { encoding: 'utf8' })
  return (
    content.match(/<!DOCTYPE html>([\s\S]*?<body style="margin-bottom: 80px;"><script>)/i)[1] +
    '</script><script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>' +
    content.match(/(<div id="app">[\s\S]*?)<\/html>/i)[1].replace("${$.getEnv() || ''}", 'Node' + info)
  )
}

if (EXPORT_HTML) {
  // fs.rmdirSync(path.join(__dirname, './dist'), { recursive: true })
  fs.mkdirSync(path.join(__dirname, './dist/beta'), { recursive: true })
  fs.writeFileSync(path.join(__dirname, './dist/index.html'), generateHTML(path.join(__dirname, './script-hub.js')), {
    encoding: 'utf8',
  })
  fs.writeFileSync(
    path.join(__dirname, './dist/beta/index.html'),
    generateHTML(path.join(__dirname, './script-hub.beta.js'), '(β)'),
    {
      encoding: 'utf8',
    }
  )
} else {
  const app = new Koa()

  app.use(async ctx => {
    const html = generateHTML(path.join(__dirname, './script-hub.js'))
    ctx.type = 'html'
    ctx.body = html
  })

  app.listen(PORT, HOST, async ctx => {
    console.log(`listening on port ${HOST}:${PORT}, http://127.0.0.1:${PORT}`)
  })

  const appBeta = new Koa()

  appBeta.use(async ctx => {
    const html = generateHTML(path.join(__dirname, './script-hub.beta.js'), '(β)')
    ctx.type = 'html'
    ctx.body = html
  })

  appBeta.listen(BETA_PORT, HOST, async ctx => {
    console.log(`β listening on port ${HOST}:${BETA_PORT}, http://127.0.0.1:${BETA_PORT}`)
  })
}
