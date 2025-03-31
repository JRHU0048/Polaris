const cloud = require('wx-server-sdk');
// const config = require('polaris/utils/config.js');
cloud.init({
  env: "cloud1-6g8720d46b015985"
})

const db = cloud.database();
const bcrypt = require('bcryptjs');

exports.main = async (event, context) => {
  const { currentPassword, newPassword, studentId } = event;
  // const OPENID = cloud.getWXContext().OPENID;

  try {
    // 查找用户
    const user = await db.collection('mini_member').where({
      studentId: studentId
    }).get();

    if (user.data.length === 0) {
      throw new Error('用户不存在');
    }

    const userData = user.data[0];

    // 验证当前密码
    const isPasswordValid = await bcrypt.compare(currentPassword, userData.password);
    if (!isPasswordValid) {
      throw new Error('当前密码错误');
    }

    // 生成新密码的哈希值
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // 更新密码
    await db.collection('mini_member').doc(userData._id).update({
      data: {
        password: hashedNewPassword
      }
    });

    return {
      success: true,
      message: '密码修改成功'
    };
  } catch (error) {
    console.error('密码修改失败:', error);
    return {
      success: false,
      message: error.message
    };
  }
};