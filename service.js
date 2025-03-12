const _ = require('lodash')
const fs = require('fs')
const path = require('path')
const Koa = require('koa')
const { scriptMap, scriptMapBeta } = require('./scriptMap.js')
const workspace = path.join(__dirname, './tmp')
fs.mkdirSync(workspace, { recursive: true })

const PORT = process.env.PORT || 9100
const BETA_PORT = process.env.BETA_PORT || 9101
const HOST = process.env.HOST || '0.0.0.0'
const BASE_URL = process.env.BASE_URL || `http://127.0.0.1:${PORT}`
const BETA_BASE_URL = process.env.BETA_BASE_URL || `http://127.0.0.1:${BETA_PORT}`

const evalFn = async ({ $request, scriptFilePath }) => {
  let content = fs.readFileSync(scriptFilePath, { encoding: 'utf8' })
  content = content.replace(/\$\.?done\(/g, '$eval_env.resolve(')
  if (content.indexOf('$eval_env.resolve(') === -1) throw new Error('脚本文件内容不包含 $done 的逻辑')

  console.log('ℹ️ 执行脚本')
  return await new Promise(resolve => {
    const $eval_env = {
      resolve: async result => {
        // console.log('ℹ️ 执行结果')
        // console.log(result)
        console.log('ℹ️ 执行完毕')
        resolve(result)
      },
    }
    eval(content)
  })
}
const reqFn = async ({ ctx, scriptMap, baseUrl }) => {
  let scriptFilePath
  let url = `http://script.hub${ctx.req.url}`

  for (const [k, v] of Object.entries(scriptMap)) {
    if (v.test(url)) {
      scriptFilePath = k
    }
  }

  console.log(`url`, url)
  console.log(`scriptFilePath`, scriptFilePath)
  let $request = {
    method: ctx.req.method,
    headers: ctx.req.headers,
    url,
  }
  const result = await evalFn({ $request, scriptFilePath })
  // console.log(`result`, result)
  ctx.response.status = Number(result?.response?.status || 200)
  for (const [k, v] of Object.entries(result?.response?.headers)) {
    // if (!/^content-length|content-encoding$/i.test(k)) {
    ctx.set(k, v)
    // }
  }
  let body = result?.response?.body

  ctx.body = typeof body === 'string' ? body.replace(/https?:\/\/script.hub\//g, `${baseUrl}/`) : body
}

const app = new Koa()

app.use(async ctx => {
  await reqFn({ ctx, scriptMap, baseUrl: BASE_URL })
})

app.listen(PORT, HOST, async ctx => {
  console.log(`listening on port ${HOST}:${PORT}, http://127.0.0.1:${PORT}, BASE URL: ${BASE_URL}`)
})

const appBeta = new Koa()

appBeta.use(async ctx => {
  await reqFn({ ctx, scriptMap: scriptMapBeta, baseUrl: BETA_BASE_URL })
})

appBeta.listen(BETA_PORT, HOST, async ctx => {
  console.log(`β listening on port ${HOST}:${BETA_PORT}, http://127.0.0.1:${BETA_PORT}, BASE URL: ${BETA_BASE_URL}`)
})
