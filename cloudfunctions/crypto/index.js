const cloud = require('wx-server-sdk');
const bcrypt = require('bcryptjs');
// const config = require('polaris/utils/config.js');
cloud.init({
  env: "cloud1-6g8720d46b015985"
})

const db = cloud.database();

/**
 * 注册或更新用户信息
 */
exports.main = async (event, context) => {
  const { studentId, nickName, avatarUrl, password } = event;

  // 对密码进行哈希处理
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const result = await db.collection('mini_member').where({ studentId }).get();
    if (result.data.length > 0) { // 用户已存在，更新信息
      const existingUser = result.data[0];
      // 验证密码
      const isPasswordValid = await bcrypt.compare(password, existingUser.password);
      if (!isPasswordValid) {
        return { success: false, message: '密码错误' };
      }

      await db.collection('mini_member').doc(existingUser._id).update({
        data: {
          nickName,
          avatarUrl,
        }
      });
      return { success: true, message: '用户信息更新成功' };
    } else { // 用户不存在，创建新用户
      await db.collection('mini_member').add({
        data: {
          studentId,
          nickName,
          avatarUrl,
          password: hashedPassword,
        }
      });
      return { success: true, message: '用户注册成功' };
    }
  } catch (error) {
    console.error(error);
    return { success: false, message: '操作失败，请重试' };
  }
};