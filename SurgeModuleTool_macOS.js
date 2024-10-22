//用于自定义发送请求的请求头
const reqHeaders = {
  headers: {
    'User-Agent': 'script-hub/1.0.0',
  },
}

const https = require('https')
const http = require('http')
const os = require('os')
const path = require('path')
const fs = require('fs')

const homedir = os.homedir()
const moduledir = path.join(homedir, '/Library/Mobile Documents/iCloud~com~nssurge~inc/Documents')

console.log(`检测目录: ${moduledir}`)

let report = {
  success: 0,
  fail: [],
  noUrl: 0,
}

const modules = []

function readdir(dirPath) {
  const files = fs.readdirSync(dirPath)

  files.forEach(file => {
    const filePath = path.join(dirPath, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      readdir(filePath)
    } else if (file && !/\.(conf|txt|js|list)$/i.test(file) && !/^\./i.test(file)) {
      modules.push({ file, filePath })
    }
  })
}
!(async () => {
  readdir(moduledir)

  for await (const { file, filePath } of modules) {
    // console.log(`处理: ${file} ${filePath}`)
    let originalName
    let originalDesc
    let noUrl
    try {
      let content = fs.readFileSync(filePath, 'utf8')
      const originalNameMatched = `${content}`.match(/^#\!name\s*?=\s*(.*?)\s*(\n|$)/im)
      if (originalNameMatched) {
        originalName = originalNameMatched[1]
      }
      const originalDescMatched = `${content}`.match(/^#\!desc\s*?=\s*(.*?)\s*(\n|$)/im)
      if (originalDescMatched) {
        originalDesc = originalDescMatched[1]
        if (originalDesc) {
          originalDesc = originalDesc.replace(/^🔗.*?]\s*/i, '')
        }
      }
      const matched = `${content}`.match(/^#SUBSCRIBED\s+(.*?)\s*(\n|$)/im)
      if (!matched) {
        noUrl = true
        throw new Error('无订阅链接')
      }
      const subscribed = matched[0]
      const url = matched[1]
      if (!url) {
        noUrl = true
        throw new Error('无订阅链接')
      }

      let res = await fetchContent(url, { headers: reqHeaders.headers })
      if (!res) {
        throw new Error(`未获取到模块内容`)
      }

      const nameMatched = `${res}`.match(/^#\!name\s*?=\s*?\s*(.*?)\s*(\n|$)/im)
      if (!nameMatched) {
        throw new Error(`不是合法的模块内容`)
      }
      const name = nameMatched[1]
      if (!name) {
        throw new Error('模块无名称字段')
      }
      const descMatched = `${res}`.match(/^#\!desc\s*?=\s*?\s*(.*?)\s*(\n|$)/im)
      let desc
      if (descMatched) {
        desc = descMatched[1]
      }
      if (!desc) {
        res = `#!desc=\n${res}`
      }
      res = res.replace(/^(#SUBSCRIBED|# 🔗 模块链接)(.*?)(\n|$)/gim, '')
      // console.log(res);
      res = addLineAfterLastOccurrence(res, `\n\n# 🔗 模块链接\n${subscribed.replace(/\n/g, '')}\n`)
      content = `${res}`.replace(/^#\!desc\s*?=\s*/im, `#!desc=🔗 [${new Date().toLocaleString()}] `)

      fs.writeFileSync(filePath, content, { encoding: 'utf8' })

      let nameInfo = `${name}`
      let descInfo = `${desc}`
      if (originalName && name !== originalName) {
        nameInfo = `${originalName} -> ${name}`
      }
      if (originalDesc && desc !== originalDesc) {
        descInfo = `${originalDesc} -> ${desc}`
      }
      console.log(`\n✅ ${nameInfo}\n${descInfo}\n${file}`)
      report.success += 1
      await delay(1 * 1000)
    } catch (e) {
      // console.error(`❌ ${file}: ${e.message ?? e}`)
      if (noUrl) {
        report.noUrl += 1
      } else {
        report.fail.push(originalName || file)
      }

      if (noUrl) {
        console.log(`\n🈚️ ${originalName || ''}\n${file}`)
        console.log(e.message ?? e)
      } else {
        console.log(`\n❌ ${originalName || ''}\n${file}`)
        console.error(`${originalName || file}: ${e.message ?? e}`)
      }
    }
  }
})()
  .catch(async e => {
    console.error(e)
  })
  .finally(() => {
    let upErrk = report.fail.length > 0 ? `❌ 更新失败: ${report.fail.length}` : '',
      noUrlErrk = report.noUrl > 0 ? `🈚️ 无链接: ${report.noUrl}` : ''
    const title = `📦 模块总数: ${report.success + report.fail.length + report.noUrl}`
    const message = `${noUrlErrk}\n✅ 更新成功: ${report.success}\n${upErrk}${
      report.fail.length > 0 ? `\n${report.fail.join(', ')}` : ''
    }`
    console.log(`\n${title}\n${message}`)
  })

function fetchContent(url, options = {}, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https://') ? https : http

    const request = client.get(url, options, response => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        const redirectUrl = new URL(response.headers.location, url)
        resolve(fetchContent(redirectUrl.toString(), options, timeout))
      } else {
        let data = ''
        response.setEncoding('utf8')
        response.on('data', chunk => {
          data += chunk
        })
        response.on('end', () => {
          resolve(data)
        })
      }
    })

    request.on('error', error => {
      reject(error)
    })

    request.on('timeout', () => {
      request.abort()
      reject(new Error('请求超时'))
    })

    request.setTimeout(timeout)
  })
}
function convertToValidFileName(str) {
  // 替换非法字符为下划线
  const invalidCharsRegex = /[\/:*?"<>|]/g
  const validFileName = str.replace(invalidCharsRegex, '_')

  // 删除多余的点号
  const multipleDotsRegex = /\.{2,}/g
  const fileNameWithoutMultipleDots = validFileName.replace(multipleDotsRegex, '.')

  // 删除文件名开头和结尾的点号和空格
  const leadingTrailingDotsSpacesRegex = /^[\s.]+|[\s.]+$/g
  const finalFileName = fileNameWithoutMultipleDots.replace(leadingTrailingDotsSpacesRegex, '')

  return finalFileName
}
function addLineAfterLastOccurrence(text, addition) {
  const regex = /^#!.+?$/gm
  const matchArray = text.match(regex)
  const lastIndex = matchArray ? matchArray.length - 1 : -1

  if (lastIndex >= 0) {
    const lastMatch = matchArray[lastIndex]
    const insertIndex = text.indexOf(lastMatch) + lastMatch.length
    const newText = text.slice(0, insertIndex) + addition + text.slice(insertIndex)
    return newText
  }

  return text
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
