/**
 * 获取access_token
 * @param {appid}
 * @param {secret}
 * @returns
 */
function genAccessTokenApi({ appid, secret }) {
  return `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`
}

function genGetMenuApi(access_token) {
  return `https://api.weixin.qq.com/cgi-bin/menu/get?access_token=${access_token}`
}
module.exports = {
  genAccessTokenApi,
  genGetMenuApi,
}
