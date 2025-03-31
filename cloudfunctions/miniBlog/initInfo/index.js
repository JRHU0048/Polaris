const cloud = require('wx-server-sdk');
// const config = require('polaris/utils/config.js');
cloud.init({
  env: "cloud1-6g8720d46b015985"
})

const db = cloud.database()

/**
 * 获取用户openid，并注册用户信息
 * event 参数包含小程序端调用传入的 data
 */
exports.main = async (event, context) => {

  // 获取 WX Context (微信调用上下文)，包括 OPENID、APPID、及 UNIONID（需满足 UNIONID 获取条件）
  const wxContext = cloud.getWXContext()
  const openId = wxContext.OPENID //提取用户的 openid
  // 查找用户是否存在
  const result = await db//查询 mini_member 集合中是否有 _openid 等于当前用户 openid 的记录
    .collection('mini_member')
    .where({
      _openid: openId
    })
    .get()
  // admin功能---处理管理员配置：
  const resultAdmin = await db
    .collection('mini_config')
    .where({
      key: "admin"
    })
    .get()
  let idDataAdmin = {
    "isShow": true
  }
  if (resultAdmin.data.length < 1) {
    let isShowList = {//如果记录不存在，添加一条新的记录，设置 isShow 为 true
      "isShow": true
    }
    await db.collection('mini_config').add({
      data: {
        key: "admin",
        _createTime: Date.now(),
        value: isShowList
      }
    });
  } else {
    idDataAdmin = resultAdmin.data[0].value //如果记录存在，提取 isShow 的值
  }

  const idData = result.data[0]
  var avatarUrl = ""
  var nickName = ""
  var admin = false
  if (result.data.length < 1) { //查询结果为空
    // 用户不存在，创建匿名用户
    avatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'//设置默认头像
    nickName = "匿名用户";
    let date = new Date().toLocaleDateString().split('/').join('-');//获取当前日期
    await db.collection('mini_member').add({//向 mini_member 集合中添加一条新记录，包含用户的初始信息。
      data: {
        _openid: openId,
        totalSignedCount: 0, //累计签到数
        continueSignedCount: 0, //持续签到
        totalPoints: 0, //积分
        lastSignedDate: date, //最后一次签到日期
        level: 1, //会员等级（预留）
        unreadMessgeCount: 0, //未读消息（预留）
        modifyTime: new Date().getTime(),
        avatarUrl: avatarUrl, //头像
        nickName: nickName, //昵称
        applyStatus: 0 //申请状态 0:默认 1:申请中 2:申请通过 3:申请驳回
      },
      success: function (res) {
        // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
        console.log(res)
      }
    })
  } else {
    // 用户已存在，获取用户信息
    avatarUrl = idData.avatarUrl
    nickName = idData.nickName
    studentId = idData.studentId
  }
  admin = idDataAdmin['isShow']//设置管理员状态
  // 返回用户信息
  return {
    event,
    userId: idData && idData._id && idData._openid ? idData._id : null,
    openId: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
    avatarUrl: avatarUrl,
    nickName: nickName,
    admin: admin,
    studentId:studentId,
  }
}