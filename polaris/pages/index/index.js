const api = require('../../utils/api.js');
const app = getApp(); 

Page({
  data: {
    posts: [],//文章列表
    page: 1, //当前页码
    filter: "",//搜索过滤条件
    nodata: false,
    nomore: false,
    defaultSearchValue: "",  //默认搜索值
    navItems: [{  //导航栏选项
      name: '最 新',
      index: 1
    }, {
      name: '热 门',
      index: 2
    }],
    swiperList: [],//轮播图数据
    tabCur: 1,
    scrollLeft: 0,
    showHot: false,
    showLabels: false,
    hotItems: ["浏览最多", "点赞最多"],
    hotCur: 0,
    labelList: [],
    labelCur: "全部",
    whereItem: ['', 'formattedDate', ''], //下拉查询条件
    loading: true,
    cancel: false,
    iconList: [
  ],
    finishLoadFlag: false,
    errorFlag: false,
    imgPath: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    let that = this
    wx.setBackgroundTextStyle({
      textStyle: 'dark'
    })
    await this.getSwiperList()  //调用getSwiperList获取顶部轮播图数据
    await that.getPostsList('', 'formattedDate') // 获取文章内容
  },

  //changeFlag 函数是切换远程图片地址要更改当前图片加载状态
  changeFlag(e) {
    let finishLoadFlag = e.detail.finishLoadFlag;
    let errorFlag = e.detail.errorFlag;
    this.setData({
      finishLoadFlag,
      errorFlag
    })
  },

  /**
   * 获取 SwiperList
   * @param {*} e 
   */
  getSwiperList: async function () {
    let that = this
    let swiperList = await api.getSwiperList(app.globalData.openid)
    that.setData({
      swiperList: swiperList.data
    })
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
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: async function () { //用户下拉刷新
    let that = this;
    that.setData({
      page: 1,
      posts: [],
      filter: "",
      nomore: false,
      nodata: false,
      defaultSearchValue: "",
      tabCur: 1,
      showLabels: false,
      showHot: false,
      cancel: false,
      labelCur: "全部",
      hotCur: 0
    })
    await this.getPostsList('', 'formattedDate')
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: async function () {//页面上拉触底时执行的函数。调用getPostsList进行加载更多数据操作
    let whereItem = this.data.whereItem
    // let filter = this.data.filter
    await this.getPostsList(whereItem[0], whereItem[1], whereItem[2])
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '有内容的小程序',
      imageUrl: 'https://6669-final-6gypsolb231307a9-1304273986.tcb.qcloud.la/others/share.jpg',
      path: '/pages/index/index'
    }
  },

  /**
   * tab切换
   * @param {} e 
   */
  tabSelect: async function (e) {
    let that = this;
    let tabCur = e.currentTarget.dataset.id
    switch (tabCur) {
      case 1: {
        that.setData({
          tabCur: e.currentTarget.dataset.id,
          scrollLeft: (e.currentTarget.dataset.id - 1) * 60,
          nomore: false,
          nodata: false,
          showHot: false,
          showLabels: false,
          defaultSearchValue: "",
          posts: [],
          page: 1,
          whereItem: ['', 'formattedDate', ''],
          cancel: false
        })
        await that.getPostsList("", 'formattedDate')
        break
      }
      case 2: {
        that.setData({
          posts: [],
          tabCur: e.currentTarget.dataset.id,
          scrollLeft: (e.currentTarget.dataset.id - 1) * 60,
          showHot: true,
          showLabels: false,
          defaultSearchValue: "",
          page: 1,
          nomore: false,
          nodata: false,
          whereItem: ['', 'totalVisits', ''],
          cancel: false
        })
        await that.getPostsList("", "totalVisits")
        break
      }
    }
  },

  /**
   * 热门按钮切换
   * @param {*} e 
   */
  hotSelect: async function (e) {
    let that = this
    let hotCur = e.currentTarget.dataset.id
    let orderBy = "formattedDate"
    switch (hotCur) {
      case 0: {   //浏览最多
        orderBy = "totalVisits"
        break
      }
      case 1: {  //点赞最多
        orderBy = "totalZans"
        break
      }
    }
    that.setData({
      posts: [],
      hotCur: hotCur,
      defaultSearchValue: "",
      page: 1,
      nomore: false,
      nodata: false,
      whereItem: ['', orderBy, '']
    })
    await that.getPostsList("", orderBy)
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
    let result = await api.getPostsList(page, filter, 1, orderBy, label,'学子风采')//api.getPostsList 获取数据
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
  }
})