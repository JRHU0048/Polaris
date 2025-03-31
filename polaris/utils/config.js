// 云数据库中的文件地址
var fileIdPre = 'cloud://test-we0f3.7465-test-we0f3-1301386292/'

/**
 * 云开发环境
 */
var env = "cloud1-6g8720d46b015985"

/**
 * 用户可以实现的操作枚举
 */
var postRelatedType = {
  COLLECTION: 1,
  ZAN: 2,
  properties: {
    1: {
      desc: "收藏"
    },
    2: {
      desc: "点赞"
    }
  }
};

module.exports = {
  postRelatedType: postRelatedType,
  env: env,
  fileIdPre: fileIdPre,
}