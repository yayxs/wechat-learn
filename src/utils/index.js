const { createHash } = require('crypto')
/**
 * @description 生成随机字符串
 */

function genNoncestr(len) {
  let res = ''
  do {
    res += Math.random().toString(36).split('.')[1]
  } while (res.length < len)

  console.log(res)

  return res.substr(0, len)
}

function mySha1(wd) {
  let hash = createHash('sha1')
  hash.update(wd)
  return hash.digest('hex')
}

module.exports = {
  genNoncestr,
  mySha1,
}
