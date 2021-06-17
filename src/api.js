function _genAccessTokenApi({appid,secret}){
    return `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`
}

module.exports = {
    _genAccessTokenApi
}