'use strict'
const Koa = require('koa')
const koaStatic = require('koa-static')
const xmlBody = require('koa-xml-body')
// const sha1 = require('sha1') // 加密模块
// const bodyParser = require('koa-bodyparser')

const serverRouter = require('./routes/server')
const webRouter = require('./routes/web')

const app = new Koa()
// app.use(bodyParser())
app.use(xmlBody())
app.use(koaStatic(__dirname + '/views'))

// Routes
app.use(serverRouter.routes()).use(serverRouter.allowedMethods())
app.use(webRouter.routes()).use(webRouter.allowedMethods())

app.listen(80, () => {
  console.log(`http://127.0.0.1:80`)
})
