const config = require('../../utils/config.js')
const api = require('../../utils/api.js');
const util = require('../../utils/util.js');
const app = getApp();
import Poster from '../../components/test/poster/poster'

Page({
  data: {
    post: {},
    isShow: false,
    collection: {
      status: false,
      text: "收藏",
      icon: "favor"
    },
    zan: {
      status: false,
      text: "点赞",
      icon: "like"
    },
    commentContent: "",
    commentPage: 1,
    commentList: [],
    nomore: false,
    nodata: false,
    commentId: "",
    placeholder: "评论...",
    focus: false,
    toName: "",
    toOpenId: "",
    nodata_str: "暂无评论，赶紧抢沙发吧",
    showBanner: false,
    showBannerId: "",
    hideArticle: '750rpx', //640rpx
    dbName: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    let that = this;
    let blogId = options.id;
    let dbName = options.dbName;
    if (dbName == 'mini_posts') {
      that.setData({
        isPost: true
      })
    }
    if (dbName == 'mini_resource') {
      that.setData({
        isResource: true
      })
    }
    if (options.scene) {
      createTime = decodeURIComponent(options.scene)
      let res = await api.getPostId(createTime.split('=')[1])
      blogId = res.data[0]._id
      dbName == 'mini_posts'
      that.setData({
        isPost: true
      })
    }
  
    let res = await api.getMemberInfo(app.globalData.openid)
    if (res.data.length > 0) {
      that.setData({
        isAdmin: app.globalData.admin,
        nickName: res.data[0].nickName,
        avatarUrl: res.data[0].avatarUrl,
        openId: res.data[0]._openid,
        dbName: options.dbName
      })
    }
    if (!that.data.isAdmin) {
      that.setData({
        hideArticle: ''
      })
    }

    //获取文章详情&关联信息
    await that.getDetail(blogId, dbName)
    await that.getPostRelated(that.data.post._id)
  },

  /**
   * 
   */
  onUnload: function () {
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: async function () {
    let that = this;
    if (that.data.isPost) {
      wx.showLoading({
        title: '加载评论...',
      })
      try {
        if (that.data.nomore === true)
          return;
        let page = that.data.commentPage;
        let commentList = await api.getPostComments(page, that.data.post._id)
        if (commentList.data.length === 0) {
          that.setData({
            nomore: true
          })
          if (page === 1) {
            that.setData({
              nodata: true
            })
          }
        } else {
          that.setData({
            commentPage: page + 1,
            commentList: that.data.commentList.concat(commentList.data),
          })
        }
      } catch (err) {
        console.info(err)
      } finally {
        wx.hideLoading()
      }
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  },

  /**
   * 获取文章详情
   */
  getDetail: async function (blogId, dbName) {
    let that = this
    let postDetail = await api.getPostDetail(blogId, dbName);
    let content = app.towxml(postDetail.result.content, 'html');//这里设为html格式才能显示
    postDetail.result.content = content
    that.setData({
      post: postDetail.result
    })
    wx.setNavigationBarTitle({
      title: that.data.post.title
    })
  },

  /**
   * 显示隐藏功能
   */
  showMenuBox: function () {
    this.setData({
      isShow: !this.data.isShow
    })
  },

  /**
   * 收藏功能
   */
  postCollection: async function () {
    wx.showLoading({
      title: '加载中...',
    })
    try {
      let that = this;
      let collection = that.data.collection;
      if (collection.status === true) {
        let result = await api.deletePostCollectionOrZan(that.data.post._id, config.postRelatedType.COLLECTION, app.globalData.openid)
        that.setData({
          collection: {
            status: false,
            text: "收藏",
            icon: "favor"
          }
        })
        wx.showToast({
          title: '已取消收藏',
          icon: 'success',
          duration: 1500
        })
      } else {
        let data = {
          postId: that.data.post._id,
          postTitle: that.data.post.title,
          postUrl: that.data.post.defaultImageUrl,
          postDigest: that.data.post.abstract,
          postClassify: that.data.post.classify,
          type: config.postRelatedType.COLLECTION,
          openId: app.globalData.openid
        }
        await api.addPostCollection(data)
        that.setData({
          collection: {
            status: true,
            text: "已收藏",
            icon: "favorfill"
          }
        })
        wx.showToast({
          title: '已收藏',
          icon: 'success',
          duration: 1500
        })
      }
    } catch (err) {
      wx.showToast({
        title: '程序有一点点小异常，操作失败啦',
        icon: 'none',
        duration: 1500
      })
      console.info(err)
    } finally {
      wx.hideLoading()
    }
  },

  /**
   * 点赞功能
   */
  postZan: async function () {
    wx.showLoading({
      title: '加载中...',
    })
    try {
      let that = this;
      let zan = that.data.zan;
      if (zan.status === true) {
        let result = await api.deletePostCollectionOrZan(that.data.post._id, config.postRelatedType.ZAN, app.globalData.openid)
        that.setData({
          zan: {
            status: false,
            text: "点赞",
            icon: "like"
          }
        })
        wx.showToast({
          title: '已取消点赞',
          icon: 'success',
          duration: 1500
        })
      } else {
        let data = {
          postId: that.data.post._id,
          postTitle: that.data.post.title,
          postUrl: that.data.post.defaultImageUrl,
          postDigest: that.data.post.abstract,
          postClassify: that.data.post.classify,
          type: config.postRelatedType.ZAN,
          openId: app.globalData.openid
        }
        await api.addPostZan(data)
        that.setData({
          zan: {
            status: true,
            text: "已赞",
            icon: "likefill"
          }
        })
        wx.showToast({
          title: '已赞',
          icon: 'success',
          duration: 1500
        })
      }
    } catch (err) {
      wx.showToast({
        title: '程序有一点点小异常，操作失败啦',
        icon: 'none',
        duration: 1500
      })
      console.info(err)
    } finally {
      wx.hideLoading()
    }
  },

  /**
   * 获取收藏和喜欢的状态
   */
  getPostRelated: async function (blogId) {
    let where = {
      postId: blogId,
      openId: app.globalData.openid
    }
    let postRelated = await api.getPostRelated(where, 1);
    let that = this;
    for (var item of postRelated.data) {
      if (config.postRelatedType.COLLECTION === item.type) {
        that.setData({
          collection: {
            status: true,
            text: "已收藏",
            icon: "favorfill"
          }
        })
        continue;
      }
      if (config.postRelatedType.ZAN === item.type) {
        that.setData({
          zan: {
            status: true,
            text: "已赞",
            icon: "likefill"
          }
        })
        continue;
      }
    }
  },


  /**
   * 生成海报成功-回调
   * @param {} e 
   */
  onPosterSuccess(e) {
    const {
      detail
    } = e;
    this.setData({
      posterImageUrl: detail,
      isShowPosterModal: true
    })
  },

  /**
   * 生成海报失败-回调
   * @param {*} err 
   */
  onPosterFail(err) {
    console.info(err)
  },

  /**
   * 生成海报
   */
  onCreatePoster: async function () {
    wx.showLoading({
      mask: true,
      title: '配置参数'
    });
    let that = this;
    if (that.data.posterImageUrl !== "") {
      that.setData({
        isShowPosterModal: true
      })
      return;
    }
    let posterConfig = {
      width: 750,
      height: 720,
      backgroundColor: '#fff',
      debug: false
    }
    // 海报block配置
    var blocks = [{
      width: 650,
      height: 74,
      x: 50,
      y: 640,
      backgroundColor: '#fff',
      opacity: 0.5,
      zIndex: 100,
    }]
    // 海报文字配置
    var texts = [];
    texts = [{
        x: 113,
        y: 61,
        baseLine: 'middle',
        text: that.data.nickName + " 向您推荐",
        fontSize: 32,
        color: '#8d8d8d',
        width: 570,
        lineNum: 1
      },
      {
        x: 36,
        y: 113,
        baseLine: 'top',
        text: that.data.post.title,
        fontSize: 38,
        color: '#080808',
      },
      {
        x: 59,
        y: 620,
        baseLine: 'middle',
        text: that.data.post.abstract,
        fontSize: 28,
        color: '#929292',
        width: 600,
        lineNum: 2,
        lineHeight: 40
      },
      {
        x: 315,
        y: 780,
        baseLine: 'top',
        text: '长按识别小程序码,立即阅读',
        fontSize: 28,
        color: '#929292',
      }
    ];

    let imageUrl = that.data.post.defaultImageUrl

    imageUrl = imageUrl.replace('http://', 'https://')
    let qrCodeUrl = ""
    if (that.data.post.qrCode != "") {
      let qrCode = await api.getReportQrCodeUrl(that.data.post.qrCode);
      qrCodeUrl = qrCode.fileList[0].tempFileURL
    }
    if (qrCodeUrl == "") {
      let addReult = await api.addPostQrCode(that.data.post._id, that.data.post._createTime, that.data.dbName)
      qrCodeUrl = addReult.result[0].tempFileURL
    }
    // 海报图片配置
    var images = [{
        width: 62,
        height: 62,
        x: 32,
        y: 30,
        borderRadius: 62,
        url: that.data.avatarUrl, //用户头像
      },
      {
        width: 640,
        height: 400,
        x: 50,
        y: 180,
        url: imageUrl, //海报主图
      },
      {
        width: 200,
        height: 200,
        x: 60,
        y: 700,
        url: qrCodeUrl, //二维码的图
      }
    ];

    posterConfig.blocks = blocks; //海报内图片的外框
    posterConfig.texts = texts; //海报的文字
    posterConfig.images = images;

    wx.hideLoading()

    that.setData({
      posterConfig: posterConfig
    }, () => {
      Poster.create(true, this); //生成海报图片
    });

  },

  /**
   * 点击放大预览图片
   * @param {} e 
   */
  posterImageClick: function (e) {
    wx.previewImage({
      urls: [this.data.posterImageUrl],
    });
  },

  /**
   * 隐藏海报弹窗
   * @param {*} e 
   */
  hideModal(e) {
    this.setData({
      isShowPosterModal: false
    })
  },

  /**
   * 保存海报图片
   */
  savePosterImage: function () {
    let that = this
    wx.saveImageToPhotosAlbum({
      filePath: that.data.posterImageUrl,
      success(result) {
        wx.showModal({
          title: '提示',
          content: '二维码海报已存入手机相册，赶快分享到朋友圈吧',
          showCancel: false,
          success: function (res) {
            that.setData({
              isShowPosterModal: false,
              isShow: false
            })
          }
        })
      },
      fail: function (err) {
        console.log(err);
        if (err.errMsg === "saveImageToPhotosAlbum:fail auth deny") {
          console.log("再次发起授权");
          wx.showModal({
            title: '用户未授权',
            content: '如需保存海报图片到相册，需获取授权.是否在授权管理中选中“保存到相册”?',
            showCancel: true,
            success: function (res) {
              if (res.confirm) {
                console.log('用户点击确定')
                wx.openSetting({
                  success: function success(res) {
                    console.log('打开设置', res.authSetting);
                    wx.openSetting({
                      success(settingdata) {
                        console.log(settingdata)
                        if (settingdata.authSetting['scope.writePhotosAlbum']) {
                          console.log('获取保存到相册权限成功');
                        } else {
                          console.log('获取保存到相册权限失败');
                        }
                      }
                    })

                  }
                });
              }
            }
          })
        }
      }
    });
  },

  /**
   * 跳转原文
   */
  showoriginalUrl: function () {
    let url = this.data.post.originalUrl
    let data = escape(url)
    wx.navigateTo({
      url: '../detail/original?url=' + data
    })
  },

  /**
   * towxml点击事件
   * @param {} e 
   */
  _tap: function (e) {
    try {
      if (e.target.dataset._el.attr.src != undefined) {
        wx.previewImage({
          urls: [e.target.dataset._el.attr.src],
        });
      }
    } catch (e) {
      console.info(e)
    }
  },


  /**
   * 阅读更多
   */
  readMore: function () {
    let that = this
    that.setData({
      hideArticle: ''
    })

    rewardedVideoAd.show()
      .catch(() => {
        rewardedVideoAd.load()
          .then(() => rewardedVideoAd.show())
          .catch(err => {
            that.setData({
              hideArticle: ''
            })
          })
      })
  },
})