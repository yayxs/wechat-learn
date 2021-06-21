const axios = require('axios')
const {
  test_wechat: { appID, appsecret, URL, Token },
  scopes: { snsapi_userinfo },
} = require('../config')
class WebController {
  /**
   * @description 用户同意授权，获取code
   * @param {*} ctx
   * @param {*} next
   */
  async handleWxCallback(ctx, next) {
    // 用户同意授权，获取code
    const { code } = ctx.query
    // ctx.body = `callback page code is:${code}`
    // 如果用户同意授权，页面将跳转至 redirect_uri/?code=CODE&state=STATE。
    // http://vast.free.idcfengye.com/wxCallback?code=071i4k0w3b4OAW2FlU1w30wmE33i4k0b&state=123

    const URL = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appID}&secret=${appsecret}&code=${code}&grant_type=authorization_code`
    const res = await axios(URL)
    console.log(res.data)
    // ctx.body = `callback page res is:${JSON.stringify(res.data)}`
    ctx.redirect(
      `/?openid=${res.data.openid}&access_token=${res.data.access_token}`
    )
  }
}

module.exports = new WebController()
