const Koa = require('koa')
const sha1 = require('sha1') // 加密模块
const Router = require('@koa/router')
// const config = {
//   wechat: {
//     appID: ``, // 开发者 id
//     AppSecret: ``,
//     token: ``,
//   },
// }
const app = new Koa()
const router = new Router()
router.get('/wx', async (ctx, next) => {
  /**
   * @description 验证消息来自微信服务器 开发者提交信息后，微信服务器将发送GET请求到填写的服务器地址URL上，GET请求携带参数如下
   *
   */
  const { signature, timestamp, nonce, echostr } = ctx.query
  const token = `vast`
  // 将token、timestamp、nonce三个参数进行字典序排序
  // 将三个参数字符串拼接成一个字符串进行sha1加密
  // 开发者获得加密后的字符串可与signature对比，标识该请求来源于微信
  const str = [token, timestamp, nonce].sort().join('')

  const res = sha1(str)
  let rt
  if (res === signature) {
    rt = ctx.query.echostr
  } else {
    rt = {
      code: -1,
      msg: 'fail',
    }
  }
  ctx.body = rt
  await next()
})

app.use(router.routes()).use(router.allowedMethods())

app.listen(80, () => {
  console.log(`http://127.0.0.1:80`)
})
