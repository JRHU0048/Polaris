const api = require('../../utils/api.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    classifyList: [],
    nodata: false,
    loading: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    await this.getClassifyList()
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: async function () {
    let that = this;
    that.setData({
      classifyList: []
    })
    await this.getClassifyList()
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 获取专题集合
   * @param {*} e 
   */
  getClassifyList: async function () {
    let that = this
    let classifyList = await api.getClassifyList()
    if (classifyList.result.data.length == 0) {
      that.setData({
        nodata: true,
        loading: false
      })
    } else {
      that.setData({
        classifyList: classifyList.result.data,
        loading: false
      })
    }

  },

  /**
   * 跳转至专题详情---这个暂时不用
   * @param {} e 
   */
  // openTopicPosts: async function (e) {
  //   let classify = e.currentTarget.dataset.tname;
  //   wx.navigateTo({
  //     url: '../topic/topiclist/topiclist?classify=' + classify
  //   })
  // },



    // 不同的处理函数
    discover: function(event) {
      console.log('竞赛通知');
      // 执行相关逻辑
      let classify = event.currentTarget.dataset.tname;
      wx.navigateTo({
        url: '../topic/topiclist/topiclist?classify=' + classify
      })
    },
  
    github: function(event) {
      console.log('答疑社区');
      // 执行相关逻辑
      wx.navigateTo({
        url: '/pages/topic/topiclist/QAcommunity/QAcommunity'
      })
    },

    tagfill: function(event) {
      console.log('算法基础');
      // 执行相关逻辑
      let classify = event.currentTarget.dataset.tname;
      wx.navigateTo({
        url: '../topic/topiclist/topiclist?classify=' + classify
      })
    },

    profile: function(event) {
      console.log('竞赛指导');
      // 执行相关逻辑
      let classify = event.currentTarget.dataset.tname;
      wx.navigateTo({
        url: '../topic/topiclist/topiclist?classify=' + classify
        // url:'/pages/topic/topiclist/registration/registration'//竞赛报名
      })
    },

    medal: function(event){
      console.log('竞赛报名');
      // 执行相关逻辑
      wx.navigateTo({
        url:'/pages/topic/topiclist/registration/registration'//竞赛报名
      })
    },











  /**
   * 自定义分享
   */
  onShareAppMessage() {
    return {
      title: '有内容的小程序',
      imageUrl: 'https://6669-final-6gypsolb231307a9-1304273986.tcb.qcloud.la/others/share.jpg',
      path: '/pages/index/index'
    }
  },
})