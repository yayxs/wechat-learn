'use strict'
const crypto = require('crypto')
const fs = require('fs')
const Router = require('@koa/router')
const xml2js = require('xml2js')
const axios = require('axios')
const {
  test_wechat: { appID, appsecret, URL, Token },
  scopes: { snsapi_userinfo },
} = require('../config')

const router = new Router()
const OAuth = require('co-wechat-oauth')
const WechatAPI = require('co-wechat-api')

const { genAccessTokenApi } = require('../api')
// docs https://github.com/node-webot/co-wechat-oauth
const client = new OAuth(appID, appsecret)
// docs https://github.com/node-webot/co-wechat-api
const api = new WechatAPI(appID, appsecret)

/**
 * @docs https://developers.weixin.qq.com/doc/offiaccount/Basic_Information/Get_access_token.html
 */
router.get(`/getAccessToken`, async (ctx, next) => {
  const res = await axios(
    genAccessTokenApi({
      appid: appID,
      secret: appsecret,
    })
  )
  console.log(res.data)
  fs.writeFileSync('./token.txt', res.data.access_token, 'utf-8')
  ctx.body = res.data
})

/**
 * @docs https://developers.weixin.qq.com/doc/offiaccount/Basic_Information/Get_the_WeChat_server_IP_address.html
 */
router.get(`/getWxIps`, async (ctx, next) => {
  let token = fs.readFileSync('./token.txt', 'utf-8')
  console.log(token)
  const URL = `https://api.weixin.qq.com/cgi-bin/get_api_domain_ip?access_token=${token}`
  console.log(URL)
  const res = await axios(URL)
  console.log(res)
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
  console.log(`cryptoSignature`, cryptoSignature)
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

router.get(`/getTempList`, async (ctx, next) => {
  let token = fs.readFileSync('./token.txt', 'utf-8')
  let url = `https://api.weixin.qq.com/cgi-bin/template/get_all_private_template?access_token=${token}`
  const res = await axios(url)
  // console.log(res)
  ctx.body = res.data
})
/**
 * @docs  https://developers.weixin.qq.com/doc/offiaccount/Message_Management/Template_Message_Interface.html#5
 * @description 发送模板消息
 */
router.get(`/sendMsgTemp`, async (ctx, next) => {
  let token = fs.readFileSync('./token.txt', 'utf-8')
  let url = `https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${token}`
  const tempIdRes = await axios({
    method: 'post',
    url: `https://api.weixin.qq.com/cgi-bin/template/api_add_template?access_token=${token}`,
    data: {
      template_id_short: 'AhYMiwh0exHqZOYj6-ASXKEuNdGxE4-jqfDojKQGKyI',
    },
  })
  console.log(tempIdRes.data)
  const data = {
    touser: 'oMDoU6O88NYxsCsCaoGYxTmazu-4',
    template_id: 'AhYMiwh0exHqZOYj6-ASXKEuNdGxE4-jqfDojKQGKyI',
    url: 'http://vast.free.idcfengye.com',
    data: {
      first: {
        value: '恭喜你购买成功！',
        color: '#173177',
      },
      keyword1: {
        value: '巧克力',
        color: '#173177',
      },
      keyword2: {
        value: '39.8元',
        color: '#173177',
      },
      keyword3: {
        value: '2014年9月22日',
        color: '#173177',
      },
      remark: {
        value: '欢迎再次购买！',
        color: '#173177',
      },
    },
  }
  const res = await axios({
    method: 'post',
    url,
    data,
  })

  console.log(res)
  ctx.body = `123`
})

/**
 * @docs https://developers.weixin.qq.com/doc/offiaccount/Custom_Menus/Creating_Custom-Defined_Menu.html
 */

router.get(`/createMenu`, async (ctx, next) => {
  let token = fs.readFileSync('./token.txt', 'utf-8')
  let url = ` https://api.weixin.qq.com/cgi-bin/menu/create?access_token=${token}`
  const data = {
    button: [
      {
        type: 'click',
        name: '今日歌曲',
        key: 'V1001_TODAY_MUSIC',
      },
    ],
  }
  const res = await axios({
    method: 'post',
    url,
    data,
  })
  console.log(res.data)
  ctx.body = res.data
})

module.exports = router
