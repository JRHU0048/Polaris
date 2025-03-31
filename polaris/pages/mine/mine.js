const config = require('../../utils/config.js');
const util = require('../../utils/util.js');
const api = require('../../utils/api.js');
const app = getApp();  // 获取应用实例
const db = wx.cloud.database();
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    nickName: '',
    avatarUrl: defaultAvatarUrl,
    openId: "",
    studentId:"",
    isLoggedIn: false,
    iconList: [
      // {
      //   icon: 'favorfill',
      //   color: 'orange',
      //   badge: 0,
      //   name: '我的收藏',
      //   bindtap: "bindCollect"
      // },
      // {
      //   icon: 'likefill',
      //   color: 'red',
      //   badge: 0,
      //   name: '我的点赞',
      //   bindtap: "bindZan"
      // },
      // {
      //   icon: 'mark',
      //   color: 'yellow',
      //   badge: 0,
      //   name: '我的消息',
      //   bindtap: "bindNotice"
      // },
      {
        icon: 'upload',
        color: 'orange',
        badge: 0,
        name: '上传材料',
        bindtap: "Workupload"
      },
      // {
      //   icon: 'file',
      //   color: 'orange',
      //   badge: 0,
      //   name: '报销管理',
      //   bindtap: "showResource"
      // },
      {
        icon:'settingsfill',
        color:'blue',
        badge:0,
        name:'修改密码',
        bindtap:"changePassword",
      }
    ],
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: async function () {
    const globalData = app.globalData;
    // 从全局变量中读取头像和昵称
    this.setData({
      avatarUrl: globalData.avatarUrl,
      nickName: globalData.nickName,
      isLoggedIn: app.globalData.isLoggedIn,
    });
    this.checkLoginStatus();
  },

  /**
   * 生命周期函数--监听页面加载
  */
  onLoad: async function (options) {
    const globalData = app.globalData;
    // 从全局变量中读取头像和昵称
    this.setData({
      avatarUrl: globalData.avatarUrl,
      nickName: globalData.nickName,
      isLoggedIn: app.globalData.isLoggedIn,
    });
    // this.checkLoginStatus();//这里不执行也行
  },

  /**
   * 检查登录状态
   */
  checkLoginStatus: async function () {
    if(!this.data.isLoggedIn)
    {
      await this.registerUser();
    }
    else{
      console.log("您已登录")
    }
  },

  /**
   * 注册新用户
   */
  registerUser: async function () {
    const that = this;
    wx.showModal({
      title: '提示',
      content: '您尚未登录，请填写学号和姓名',
      showCancel: false,
      confirmText: '确定',
      success: async function (res) {
        if (res.confirm) {
          // bindAvatar();替换为下面的方式：
          // 使用 that 绑定 bindAvatar 方法
          await that.bindAvatar();
        }
      }
    });
  },

  /**
   * 跳转修改头像和昵称
   * @param {*} e 
   */
  bindAvatar: async function (e) {
    wx.navigateTo({
      url: '../mine/login/login'
    });
  },

  /**
   * 跳转我的收藏
   * @param {*} e 
   */
  bindCollect: async function (e) {
    wx.navigateTo({
      url: '../mine/collection/collection?type=1'
    });
  },

  /**
   * 跳转我的点赞 
   * @param {*} e 
   */
  bindZan: async function (e) {
    wx.navigateTo({
      url: '../mine/collection/collection?type=2'
    });
  },

  /**
   * 我的消息
   * @param {*} e 
   */
  bindNotice: async function (e) {
    wx.navigateTo({
      url: '../mine/notice/notice'
    });
  },

  /**
   * 作品上传
   * @param {} e 
   */
  Workupload: async function (e) {
    wx.navigateTo({
      url: '../mine/workupload/workupload'
    });
  },

  /**
   * 报销管理
   * @param {} e 
   */
  showResource: async function (e) {
    wx.navigateTo({
      url: '../mine/resource/resource'
    });
  },

  /**
   * 修改密码
   * @param {} e 
   */
  changePassword: async function (e) {
    if (this.data.isLoggedIn) {
      wx.navigateTo({
        url: '../mine/changePassword/changePassword'
      });
    } else {
      wx.showModal({
        title: '提示',
        content: '您尚未登录，请先登录',
        showCancel: false,
        confirmText: '确定'
      });
    }
  },


  /**
   * 后台设置
   * @param {} e 
   */
  showAdmin: async function (e) {
    wx.navigateTo({
      url: '../admin/index'
    });
  },

  /**
   * 历史版本
   * @param {} e 
   */
  showRelease: async function (e) {
    wx.navigateTo({
      url: '../mine/release/release'
    });
  },

  /**
   * 关于
   * @param {} e 
   */
  bindAbout: async function (e) {
    wx.navigateTo({
      url: '../mine/about/about'
    });
  },

  /**
   * 自定义分享
   */
  onShareAppMessage() {
    return {
      title: '有内容的小程序',
      imageUrl: 'https://6669-final-6gypsolb231307a9-1304273986.tcb.qcloud.la/others/share.jpg',
      path: '/pages/index/index'
    };
  }
});