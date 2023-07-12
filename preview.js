import { readFile } from 'node:fs/promises'
import Koa from 'koa'

const PORT = process.env.PORT || 9000
const HOST = process.env.HOST || '0.0.0.0'

const app = new Koa()

app.use(async ctx => {
  const filePath = new URL('./script-hub.js', import.meta.url)
  const content = await readFile(filePath, { encoding: 'utf8' })
  ctx.type = 'html'
  // ctx.body = content.match(/<!DOCTYPE html>([\s\S]*?)<\/html>/i)[1]
  ctx.body = content.match(/<!DOCTYPE html>([\s\S]*?<body style="margin-bottom: 80px;"><script>)/i)[1] + '</script><script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>'  + content.match(/(<div id="app">[\s\S]*?)<\/html>/i)[1]
})

app.listen(PORT, HOST, async ctx => {
  console.log(`listening on port ${HOST}:${PORT}, http://127.0.0.1:${PORT}`)
})
