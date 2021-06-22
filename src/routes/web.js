'use strict'
const fs = require('fs')
const urlencode = require('urlencode')
const Router = require('@koa/router')
const axios = require('axios')
const { genNoncestr, mySha1 } = require('../utils/index')

const { handleWxCallback } = require('../controllers/web')
const {
  test_wechat: { appID, appsecret, URL, Token },
  scopes: { snsapi_userinfo },
} = require('../config')
const router = new Router()

router.get('/wxCallback', handleWxCallback) // 微信回调地址

router.get(`/wxAuthorize1`, async (ctx, next) => {
  const state = 123
  console.log(ctx.href) // http://vast.free.idcfengye.com/wxAuthorize1
  let redirectUrl = ctx.href.replace('wxAuthorize1', 'wxCallback') // http://vast.free.idcfengye.com/wxCallback
  console.log(urlencode(redirectUrl))
  ctx.redirect(
    `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appID}&redirect_uri=${urlencode(
      redirectUrl
    )}&response_type=code&scope=snsapi_userinfo&state=${state}#wechat_redirect`
  )
})
/**
 * @description 获取用户信息
 */
router.get(`/getUser1`, async (ctx, next) => {
  const { openid, access_token } = ctx.query
  const url = `https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openid}&lang=zh_CN`
  console.log(url)
  const res = await axios(url)
  ctx.body = res.data
})
/**
 * @description 获取jsapi_ticket
 * @docs  https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/JS-SDK.html#62
 */

router.get(`/getJsapiTicket`, async (ctx, next) => {
  const token = fs.readFileSync('./token.txt', 'utf8')
  const URL = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${token}&type=jsapi`
  const res = await axios(URL)
  console.log(res.data)
  try {
    fs.writeFileSync('./ticket.txt', res.data.ticket, 'utf8')
  } catch (error) {}
  ctx.body = res.data
})

/**
 * @description 获取jssdk 获得jsapi_ticket之后，就可以生成JS-SDK权限验证的签名
 * 传入生成签名的地址 window.location.href.split('#')[0]
 * @docs https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/JS-SDK.html#62
 */

router.get(`/jssdk`, async (ctx, next) => {
  const { url } = ctx.query
  const jsapi_ticket = fs.readFileSync('./ticket.txt', 'utf8')
  const noncestr = genNoncestr(16)
  const timestamp = +new Date()

  const data = {
    jsapi_ticket,
    noncestr,
    timestamp,
    url,
  }
  let signature = Object.keys(data)
    .sort()
    .map((item) => `${item}=${data[item]}`)
    .join('&')
  signature = mySha1(signature)
  console.log(data)
  ctx.body = { noncestr: noncestr, timestamp, signature }
})
module.exports = router
