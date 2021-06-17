/**
 * 获取access_token
 * @param {*} param0 
 * @returns 
 */
function _genAccessTokenApi({appid,secret}){
    return `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`
}

function _genGetMenuApi(access_token){
    return `https://api.weixin.qq.com/cgi-bin/menu/get?access_token=${access_token}`
}
module.exports = {
    _genAccessTokenApi,
    _genGetMenuApi
}