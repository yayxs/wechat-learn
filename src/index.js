const crypto = require('crypto')
const Koa = require('koa')
const Router = require('@koa/router')
// const bodyParser = require('koa-bodyparser')
const static = require('koa-static')
const xmlBody = require('koa-xml-body')
const xml2js = require('xml2js')
// const sha1 = require('sha1') // 加密模块

const {
  test_wechat: { appID, appsecret, URL, Token },
} = require('./config')
const app = new Koa()

const router = new Router()
// app.use(bodyParser())
app.use(xmlBody())
app.use(static(__dirname + '/'))
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

app.use(router.routes()).use(router.allowedMethods())
app.listen(80, () => {
  console.log(`http://127.0.0.1:80`)
})
