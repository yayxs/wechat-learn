const crypto = require('crypto')
const Koa = require('koa')
const axios = require('axios')
const Router = require('@koa/router')
// const bodyParser = require('koa-bodyparser')
const static = require('koa-static')
const xmlBody = require('koa-xml-body')
const xml2js = require('xml2js')
// const sha1 = require('sha1') // 加密模块
const OAuth = require('co-wechat-oauth')
const WechatAPI = require('co-wechat-api')
const {
  test_wechat: { appID, appsecret, URL, Token },
  scopes: { snsapi_userinfo },
} = require('./config')

const { genAccessTokenApi } = require('./api')
const app = new Koa()
const router = new Router()
// app.use(bodyParser())
app.use(xmlBody())
app.use(static(__dirname + '/'))

// docs https://github.com/node-webot/co-wechat-oauth
const client = new OAuth(appID, appsecret)
// docs https://github.com/node-webot/co-wechat-api
const api = new WechatAPI(appID, appsecret)

router.get(`/getAccessToken`, async (ctx, next) => {
  const res = await axios(
    genAccessTokenApi({
      appid: appID,
      secret: appsecret,
    })
  )
  // console.log(res.data)
  ctx.body = res.data
})
/**
 * @description 验证消息来自微信服务器 开发者提交信息后，
 * 微信服务器将发送GET请求到填写的服务器地址URL上，GET请求携带参数如下
 * GET /wx
 */
router.get('/wx', async (ctx, next) => {
  const { signature, timestamp, nonce, echostr } = ctx.query
  // 将token、timestamp、nonce三个参数进行字典序排序
  // 将三个参数字符串拼接成一个字符串进行sha1加密
  // 开发者获得加密后的字符串可与signature对比，标识该请求来源于微信
  const str = [Token, timestamp, nonce].sort().join('')

  // const res = sha1(str)
  const cryptoSignature = crypto.createHash('sha1').update(str).digest('hex')
  console.log(`cryptoSignature`, res)
  // cryptoSignature b532934c036d173610d881a460920534d0df8105
  if (cryptoSignature === signature) {
    ctx.body = echostr
  } else {
    ctx.body = `not wechat`
  }
  await next()
})

/**
 * @description 测试微信服务器交互
 */
router.post('/wx', async (ctx, next) => {
  console.log(ctx.request.body)

  const {
    request: {
      body: {
        xml: { ToUserName, FromUserName, CreateTime, MsgType, Content, MsgId },
      },
    },
  } = ctx
  const builder = new xml2js.Builder()
  try {
    ctx.body = builder.buildObject({
      xml: {
        ToUserName: FromUserName,
        FromUserName: ToUserName,
        CreateTime: Date.now(),
        MsgType: MsgType,
        Content: Content,
      },
    })
  } catch (error) {
    ctx.body = `err`
  }
})
/**
 * @description 微信认证-生成引导用户点击的 URL
 */
router.get(`/wxAuthorize`, async (ctx, next) => {
  const state = 123
  const scope = 'snsapi_userinfo'
  let redirectUrl = ctx.href.replace('wxAuthorize', 'wxCallback')
  console.log(redirectUrl)
  const url = client.getAuthorizeURL(redirectUrl, state, scope)
  ctx.redirect(url)
})
/**
 * @docs 用户点击上步生成的 URL 后会被重定向到上步设置的 redirectUrl，并且会带有 code 参数，我们可以使用这个 code 换取 access_token 和用户的openid
 * @description
 */
router.get(`/wxCallback`, async (ctx, next) => {
  const code = ctx.query.code
  const token = await client.getAccessToken(code)
  const accessToken = token.data.access_token
  const openid = token.data.openid

  console.log('accessToken', accessToken)
  console.log('openid', openid)
  ctx.redirect(`/?openid=${openid}`)
})
/**
 * @description 获取用户信息
 */

router.get(`/getUser`, async (ctx, next) => {
  const openid = ctx.query.openid
  const userInfo = await client.getUser(openid)
  ctx.body = userInfo
})

/**
 * @docs https://doxmate.cool/node-webot/co-wechat-api/api.html#api_js_exports_getJsConfig
 * @description 获取微信JS SDK Config的所需参数 * Examples:
 */
router.get('/getJsConfig', async (ctx) => {
  try {
    ctx.body = await api.getJsConfig(ctx.query)
  } catch (error) {}
})
app.use(router.routes()).use(router.allowedMethods())
app.listen(80, () => {
  console.log(`http://127.0.0.1:80`)
})
