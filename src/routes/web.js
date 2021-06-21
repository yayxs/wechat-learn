'use strict'
const fs = require('fs')
const urlencode = require('urlencode')
const Router = require('@koa/router')
const xml2js = require('xml2js')
const axios = require('axios')

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

module.exports = router
