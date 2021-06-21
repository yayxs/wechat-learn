const fs = require('fs')
const Koa = require('koa')
const sha1 = require('sha1') // 加密模块

const Router = require('@koa/router')

const config = require('./config')
const { genAccessTokenApi, genGetMenuApi } = require('./api')
const { XML2JSON, json2XML, text } = require('./utils/xmlParse')

const app = new Koa()
const router = new Router()

/**
 * @description 微信验证
 */
router.get('/wx', async (ctx, next) => {
  /**
   * @description 验证消息来自微信服务器 开发者提交信息后，微信服务器将发送GET请求到填写的服务器地址URL上，GET请求携带参数如下
   */
  const { signature, timestamp, nonce, echostr } = ctx.query
  const token = `vast`
  // 将token、timestamp、nonce三个参数进行字典序排序
  // 将三个参数字符串拼接成一个字符串进行sha1加密
  // 开发者获得加密后的字符串可与signature对比，标识该请求来源于微信
  const str = [token, timestamp, nonce].sort().join('')

  const res = sha1(str)
  if (res === signature) {
    ctx.body = echostr
  } else {
    ctx.body = `not wechat`
  }
  ctx.body = rt
  await next()
})

router.get('/getAccessToken', async (ctx, next) => {
  // 获取本地的信息
  const tokenInfo = fs.existsSync('token_info.json')
    ? JSON.parse(fs.readFileSync('token_info.json', 'utf-8'))
    : null
  let expires_time = tokenInfo ? tokenInfo.expires_time : ''
  let cache_access_token =
    tokenInfo && tokenInfo.access_token ? tokenInfo.access_token : ''
  if (
    parseInt(Date.now() / 1000) > expires_time + 3600 ||
    tokenInfo == null ||
    cache_access_token == ''
  ) {
    let tokenNew = await new Promise((resolve, reject) => {
      request.get(
        genAccessTokenApi({
          appid: config.wechat.appID,
          secret: config.wechat.AppSecret,
        }),
        (err, res, body) => {
          if (!err && res.statusCode === 200) {
            resolve(body)
          } else {
            reject(err)
          }
        }
      )
    })
    tokenNew = JSON.parse(tokenNew)
    cache_access_token = tokenNew.access_token
    expires_time = parseInt(Date.now() / 1000)
    fs.writeFileSync(
      'token_info.json',
      JSON.stringify({
        access_token: cache_access_token,
        expires_time: expires_time,
      })
    )
    ctx.body = { access_token: cache_access_token, expires_time: expires_time }
  } else {
    ctx.body = tokenNew
  }
  await next()
})

/**
 * @description 获取自定义菜单配置
 * @docs https://developers.weixin.qq.com/doc/offiaccount/Custom_Menus/Getting_Custom_Menu_Configurations.html
 */
router.get('/getMenu', async (ctx, next) => {
  const res = await request.get(
    genGetMenuApi(
      '46_pQKcVbzOfB5mvuta8b0WWWnfjt6ic_mvpg0u58FkyLbTE4p_aQUZhGRIgGlNDixP_Szg1i-gDlYnlvfuLk-HcFFl2I1nelO9JHxnOEKJg275qEbXAEw8X9tIzVOMn1EGShXUR4rnQeoGfwkhSNUeAFAEZG'
    )
  )
  console.log(res)
})
app.use(router.routes()).use(router.allowedMethods())
app.listen(80, () => {
  console.log(`http://127.0.0.1:80`)
})
