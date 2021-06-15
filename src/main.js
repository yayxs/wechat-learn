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
  const { signature, timestamp, nonce, echostr } = ctx.query
  const token = `vast`
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
