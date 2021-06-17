/**
 * @description 解析XML
 * @docs https://www.npmjs.com/package/xml2js
 */
const xml2js = require('xml2js')

function XML2JSON (xml){
    return new Promise((resolve,reject)=>{
        const parseString = require('xml2js').parseString;
        parseString(xml, function (err, result) {
            console.dir(result);
            if(err){
                reject(err)
            }else{
                resolve(result)
            }
        });
    })
}

function json2XML(jsonObj){
    const builder = new xml2js.Builder();
    return builder.buildObject(jsonObj);
}

function _message(msg,content){
    return json2XML({
        xml:{
            ToUserName: msg.FromUserName,
            FromUserName: msg.ToUserName,
            CreateTime: Date.now(),
            //   MsgType: msg.MsgType,
            MsgType: 'text',
            Content: content
        }
    })
}


function text(msg,content){
    return _message(msg,content)
}

module.exports = {
    XML2JSON,json2XML,text
}