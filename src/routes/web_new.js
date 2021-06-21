'use strict'
const crypto = require('crypto')
const fs = require('fs')
const Router = require('@koa/router')
const controllers = require('../controllers')
const xml2js = require('xml2js')
const axios = require('axios')
const {
  test_wechat: { appID, appsecret, URL, Token },
  scopes: { snsapi_userinfo },
} = require('./config')

const router = new Router()
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
