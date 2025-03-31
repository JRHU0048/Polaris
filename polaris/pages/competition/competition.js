// pages/chatroom/chatroom.js
import { getInvitationsList } from '../../utils/api';
const api = require('../../utils/api.js'); 
const app = getApp(); 
const db = wx.cloud.database();

Page({ // 定义一个页面，包含页面的初始数据、生命周期函数和各种自定义方法
  data: {
    page: 1,  //当前页码
    posts: [],
    filter: "", //搜索过滤条件
    nodata: false, // 是否没有数据
    nomore: false,// 是否没有更多数据
    loading: false, // 加载状态
    cancel: false, //是否是取消状态
    orderBy:"createTime", // 排序字段
    defaultSearchValue: "", // 将输入框的值绑定到 defaultSearchValue 属性
    modalVisible: false,
    modalTitle: '',
    modalContent: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    let that = this;
    wx.setBackgroundTextStyle({
      textStyle: 'dark'
    })
    await that.getPostsList('', 'formattedDate') // 获取文章内容
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: async function () {
    let that = this;
    that.setData({
      page: 1,
      posts: [],
      filter: "",
      nomore: false,
      nodata: false,
      cancel: false,
      defaultSearchValue: "",
    })
    await this.getPostsList('', 'formattedDate')
    wx.stopPullDownRefresh();
  },

    /**
   * 搜索功能
   * @param {} e 
   */
  bindconfirm: async function (e) {
    let that = this;
    let page = 1
    that.setData({
      page: page,
      posts: [],
      filter: e.detail.value,
      nomore: false,
      nodata: false,
      cancel: true
    })
    await this.getPostsList(e.detail.value, 'formattedDate')
    // await this.getPostsList('', 'formattedDate')
  },

    /**
   * 读取通知列表
   */
  getPostsList: async function (filter, orderBy, label) {
    let that = this
    that.setData({  //设置 loading 为 true，表明正在加载数据
      loading: true
    })
    let page = that.data.page
    if (that.data.nomore) { //nomore 为 true，表明没有更多数据，设置 loading 为 false 并返回
      that.setData({
        loading: false
      })
      return
    }
    let result = await api.getPostsList(page, filter, 1, orderBy, label,'学科竞赛')//api.getPostsList 获取数据
    //如果结果为空，则设置 nomore 为 true 并关闭加载状态
    if (result.data.length === 0) { 
      that.setData({
        nomore: true,
        loading: false
      })
      //如果是第一页且无数据，则设置 nodata 为 true
      if (page === 1) {
        that.setData({
          nodata: true,
          loading: false
        })
      }
    } else {//更新页码，合并新数据到 posts 数组，并关闭加载状态
      that.setData({
        page: page + 1,
        posts: that.data.posts.concat(result.data),
        loading: false
      })
    }
  },

  // 点击查看详细通知
  bindPostDetail: function (e) {
    let blogId = e.currentTarget.id;
    let dbName = e.currentTarget.dataset.db;
    wx.navigateTo({
      url: '../detail/detail?id=' + blogId + '&dbName=' + dbName
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
  }
})