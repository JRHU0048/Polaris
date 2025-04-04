const db = wx.cloud.database()
const _ = db.command

/**
 * 获取通知的分享明细
 * @param {} openId 
 * @param {*} date 
 */
function getShareDetailList(openId, date) {
  return db.collection('mini_share_detail')
    .where({
      shareOpenId: openId,
      date: date
    })
    .limit(5)
    .get()
}

/**
 * 获取指定openid的用户信息
 * @param {} openId 
 */
function getMemberInfo(openId) {
  return db.collection('mini_member')
    .where({
      _openid: openId
    })
    .limit(1)
    .get()
}

/**
 * 获取已发布的文章信息
 * @param {} createTime 
 */
function getPostId(createTime) {
  return db.collection('mini_posts')
    .where({
      _createTime: createTime
    })
    .limit(1)
    .get()
}

/**
 * 获取已注册的用户列表
 * @param {*} applyStatus 
 * @param {*} page 
 */
function getMemberInfoList(page, applyStatus) {
  return db.collection('mini_member')
    .where({
      applyStatus: applyStatus
    })
    .orderBy('modifyTime', 'desc')
    .skip((page - 1) * 10)
    .limit(10)
    .get()
}

/**
 * 获取评论列表
 */
function getCommentsList(page, flag) {
  return db.collection('mini_comments')
    .where({
      flag: flag
    })
    .orderBy('timestamp', 'desc')
    .skip((page - 1) * 10)
    .limit(10)
    .get()
}

/**
 * 根据id获取文章明细
 * @param {*} page 
 */
function getPostsById(id) {
  return db.collection('mini_posts')
    .doc(id)
    .get()
}

/**
 * 获取版本发布日志
 * @param {*} page 
 */
function getReleaseLogsList(page) {
  return db.collection('mini_logs')
    .where({
      key: 'releaseLogKey'
    })
    .orderBy('_createTime', 'desc')
    .skip((page - 1) * 10)
    .limit(10)
    .get()
}

/**
 * 获取文章列表
 * @param {*} page 
 */
function getNewPostsList(page, filter, orderBy) {
  let where = {}
  if (filter.title != undefined) {
    where.title = db.RegExp({
      regexp: filter.title,
      options: 'i',
    })
  }
  if (filter.isShow != undefined) {
    where.isShow = filter.isShow
  }
  if (filter.classify != undefined) {
    where.classify = filter.classify
  }

  if (filter.hasClassify == 1) {
    where.classify = _.nin(["", 0, undefined])
  }

  if (filter.hasClassify == 2) {
    where.classify = _.in(["", 0, undefined])
  }

  if (orderBy == undefined || orderBy == "") {
    orderBy = "createTime"
  }

  if (filter.hasLabel == 1) {
    where.label = _.neq([])
  }

  if (filter.hasLabel == 2) {
    where.label = _.eq([])
  }

  //不包含某个标签
  if (filter.containLabel == 2) {
    where.label = _.nin([filter.label])
  }

  //包含某个标签
  if (filter.containLabel == 1) {
    where.label = db.RegExp({
      regexp: filter.label,
      options: 'i',
    })
  }

  //不包含某个类别
  if (filter.containKind == 2) {
    where.kind = _.nin([filter.kind])
  }

  //包含某个类别
  if (filter.containKind == 1) {
    where.kind = db.RegExp({
      regexp: filter.kind,
      options: 'i',
    })
  }

  //不包含某个主题
  if (filter.containClassify == 2) {
    where.classify = _.neq(filter.classify)
  }

  //包含某个主题
  if (filter.containClassify == 1) {
    where.classify = _.eq(filter.classify)
  }

  return db.collection('mini_posts')
    .where(where)
    .orderBy(orderBy, 'desc')
    .skip((page - 1) * 10)
    .limit(10)
    .field({
      _id: true,
      author: true,
      createTime: true,
      defaultImageUrl: true,
      title: true,
      totalComments: true,
      totalVisits: true,
      totalZans: true,
      isShow: true,
      classify: true,
      label: true,
      digest: true,
      info: true,
      abstract: true,
      _createTime: true
    }).get()
}

/**
 * 获取类别列表
 * @param {*} page 
 */
function getNewPostsKind(classify) {

  return db.collection('mini_config')
    .where({
      'value.classifyName': classify
    })
    .get()
}

/**
 * 获取标签列表
 * @param {*} page 
 */
function getNewPostsLable(kind) {

  return db.collection('mini_config')
    .where({
      'value.kind': kind
    })
    .get()
}

/**
 * 获取文章列表
 * @param {} page 
 * @param {number} page - 当前页码
 * @param {string} filter - 标题过滤关键字
 * @param {number} isShow - 显示状态过滤（-1 表示不过滤）
 * @param {string} orderBy - 排序字段
 * @param {string} label - 标签过滤关键字
 * @param {string} classify - 分类过滤关键字
 */
function getPostsList(page, filter, isShow, orderBy, label, classify) {
  let where = {}
  if (filter !== '') {
    where.title = db.RegExp({
      regexp: filter,
      options: 'i',
    })
  }
  if (isShow !== -1) {
    where.isShow = isShow
  }

  if (orderBy == undefined || orderBy == "") {
    // orderBy = "_createTime"
    orderBy = "formattedDate"; // 默认按日期排序
  }
  
  // 分类过滤
  if (classify != undefined && classify != "") {
    where.classify = classify;
  }

  if (label != undefined && label != "") {
    where.label = db.RegExp({
      regexp: label,
      options: 'i',
    })
  }

  return db.collection('mini_posts')
    .where(where)
    .orderBy(orderBy, 'desc')
    .skip((page - 1) * 6)
    .limit(6)
    .field({
      _id: true,
      defaultImageUrl: true,
      title: true,
      totalComments: true,
      totalVisits: true,
      totalZans: true,
      classify: true,
      label: true,
      abstract: true,
      // _createTime: true
      formattedDate: true // 查询格式化后的日期字段
    }).get()
}


/**
 * 获取组队信息列表
 * @param {number} page - 当前页码
 * @param {string} filter - 过滤条件
 * @param {number} isShow - 是否显示标志
 * @param {string} orderBy - 排序字段
 * @param {string} label - 标签过滤条件
 */
function getInvitationsList(page, filter,isShow, orderBy) {
  let where = {};
  if (filter !== '') {
    where.title = db.RegExp({
      regexp: filter,
      options: 'i',
    });
  }
  if (isShow !== -1) {
    where.isShow = isShow;
  }

  if (orderBy == undefined || orderBy == '') {
    orderBy = "createTime";
  }

  // if (label !== undefined && label !== '') {
  //   where.labels = db.RegExp({
  //     regexp: label,
  //     options: 'i',
  //   });
  // }

  return db.collection('invitation')
    .where(where)
    .orderBy(orderBy, 'desc')   //orderBy 是排序字段名，'desc' 表示降序排序
    .skip((page - 1) * 6)  //每页显示 6 条记录
    .limit(6)   //限制返回的记录数量
    .field({  //列出了需要返回的字段名
      _id: true,
      comments: true,
      createTime: true,
      description: true,
      imageURL: true,
      labels: true,
      links: true,
      title: true
    })
    .get();
}


/**
 * 获取评论列表
 * @param {} page 
 * @param {*} postId 
 */
function getPostComments(page, postId) {
  return db.collection('mini_comments')
    .where({
      postId: postId,
      flag: 0
    })
    .orderBy('timestamp', 'desc')
    .skip((page - 1) * 10)
    .limit(10)
    .get()
}

/**
 * 获取收藏、点赞列表
 * @param {} page 
 */
function getPostRelated(where, page) {
  return db.collection('mini_posts_related')
    .where(where)
    .orderBy('createTime', 'desc')
    .skip((page - 1) * 10)
    .limit(10)
    .get()
}

/**
 * 获取文章详情
 * @param {} id 
 */
function getPostDetail(id, dbName) {
  return wx.cloud.callFunction({
    name: 'miniBlog',
    data: {
      type: 'postsService',
      action: "getPostsDetail",
      id: id,
      dbName: dbName,
      typeKind: 1
    }
  })
}

/**
 * 新增用户收藏文章
 */
function addPostCollection(data) {
  return wx.cloud.callFunction({
    name: 'miniBlog',
    data: {
      type: 'postsService',
      action: "addPostCollection",
      postId: data.postId,
      postTitle: data.postTitle,
      postUrl: data.postUrl,
      postDigest: data.postDigest,
      typeKind: data.type,
      postClassify: data.postClassify,
      openId: data.openId
    }
  })
}

/**
 * 取消喜欢或收藏
 */
function deletePostCollectionOrZan(postId, type, openId) {
  return wx.cloud.callFunction({
    name: 'miniBlog',
    data: {
      type: 'postsService',
      action: "deletePostCollectionOrZan",
      postId: postId,
      typeKind: type,
      openId: openId
    }
  })
}

/**
 * 新增评论
 */
function addPostComment(commentContent, accept) {
  return wx.cloud.callFunction({
    name: 'miniBlog',
    data: {
      type: 'postsService',
      action: "addPostComment",
      commentContent: commentContent,
      accept: accept
    }
  })
}

/**
 * 新增用户点赞
 * @param {} data 
 */
function addPostZan(data) {
  return wx.cloud.callFunction({
    name: 'miniBlog',
    data: {
      type: 'postsService',
      action: "addPostZan",
      postId: data.postId,
      postTitle: data.postTitle,
      postUrl: data.postUrl,
      postDigest: data.postDigest,
      typeKind: data.type,
      postClassify: data.postClassify,
      openId: data.openId
    }
  })
}

/**
 * 新增子评论
 * @param {} id 
 * @param {*} comments 
 */
function addPostChildComment(id, postId, comments, accept) {
  return wx.cloud.callFunction({
    name: 'miniBlog',
    data: {
      type: 'postsService',
      action: "addPostChildComment",
      id: id,
      comments: comments,
      postId: postId,
      accept: accept
    }
  })
}

/**
 * 新增文章二维码并返回临时url
 * @param {*} id 
 * @param {*} postId 
 * @param {*} comments 
 */
function addPostQrCode(postId, timestamp, dbName) {
  return wx.cloud.callFunction({
    name: 'miniBlog',
    data: {
      type: 'postsService',
      action: "addPostQrCode",
      timestamp: timestamp,
      dbName: dbName,
      postId: postId
    }
  })
}

/**
 * 评论内容安全审核
 * @param {*} content 
 */
function checkPostComment(content) {
  return wx.cloud.callFunction({
    name: 'miniBlog',
    data: {
      type: 'postsService',
      action: "checkPostComment",
      content: content
    }
  })
}

/**
 * 获取海报的文章二维码url
 * @param {*} id 
 */
function getReportQrCodeUrl(id) {
  return wx.cloud.getTempFileURL({
    fileList: [{
      fileID: id,
      maxAge: 60 * 60, // one hour
    }]
  })
}

/**
 * 验证是否是管理员
 */
function checkAuthor(openId) {
  return wx.cloud.callFunction({
    name: 'miniBlog',
    data: {
      type: 'adminService',
      action: "checkAuthor",
      openId: openId
    }
  })
}

/**
 * 新增版本日志
 * @param {} log 
 */
function addReleaseLog(log, title, openId) {
  return wx.cloud.callFunction({
    name: 'miniBlog',
    data: {
      type: 'adminService',
      action: "addReleaseLog",
      log: log,
      title: title,
      openId: openId
    }
  })
}

/**
 * 更新文章状态
 * @param {*} id 
 * @param {*} isShow 
 */
function updatePostsShowStatus(id, isShow, openId) {
  return wx.cloud.callFunction({
    name: 'miniBlog',
    data: {
      type: 'adminService',
      action: "updatePostsShowStatus",
      id: id,
      isShow: isShow,
      openId: openId
    }
  })
}

/**
 * 更新文章专题
 * @param {*} id 
 * @param {*} isShow 
 */
// 通过调用云函数来实现对特定文章专题分类的更新操作
function updatePostsClassify(id, classify, openId) {
  return wx.cloud.callFunction({
    name: 'miniBlog',
    data: {
      type: 'adminService',
      action: "updatePostsClassify",
      id: id,
      classify: classify,
      openId: openId
    }
  })
}

/**
 * 更新文章标签
 * @param {*} id 
 * @param {*} isShow 
 */
function updatePostsLabel(id, label, openId) {
  return wx.cloud.callFunction({
    name: 'miniBlog',
    data: {
      type: 'adminService',
      action: "updatePostsLabel",
      id: id,
      label: label,
      openId: openId
    }
  })
}

/**
 * 更新文章标签
 * @param {*} id 
 * @param {*} isShow 
 */
function upsertPosts(id, data, openId) {
  return wx.cloud.callFunction({
    name: 'miniBlog',
    data: {
      type: 'adminService',
      action: "upsertPosts",
      id: id,
      post: data,
      openId: openId
    }
  })
}

/**
 * 新增基础标签
 */
function addBaseLabel(labelName, openId, kind) {
  return wx.cloud.callFunction({
    name: 'miniBlog',
    data: {
      type: 'adminService',
      action: "addBaseLabel",
      labelName: labelName,
      kind: kind,
      openId: openId
    }
  })
}

/**
 * 新增基础主题
 */
function addBaseClassify(classifyName, classifyDesc, openId) {
  return wx.cloud.callFunction({
    name: 'miniBlog',
    data: {
      type: 'adminService',
      action: "addBaseClassify",
      classifyName: classifyName,
      classifyDesc: classifyDesc,
      openId: openId
    }
  })
}

/**
 * 删除配置
 */
function deleteConfigById(id, openId) {
  return wx.cloud.callFunction({
    name: 'miniBlog',
    data: {
      type: 'adminService',
      action: "deleteConfigById",
      id: id,
      openId: openId
    }
  })
}

/**
 * 删除文章
 */
function deletePostById(id, openId) {
  return wx.cloud.callFunction({
    name: 'miniBlog',
    data: {
      type: 'adminService',
      action: "deletePostById",
      id: id,
      openId: openId
    }
  })
}

/**
 * 更新评论状态
 * @param {*} id 
 * @param {*} flag 
 */
function changeCommentFlagById(id, flag, postId, count, openId) {
  return wx.cloud.callFunction({
    name: 'miniBlog',
    data: {
      type: 'adminService',
      action: "changeCommentFlagById",
      id: id,
      flag: flag,
      postId: postId,
      count: count,
      openId: openId
    }
  })
}

/**
 * 获取label集合
 */
function getLabelList(openId, kind) {

  return wx.cloud.callFunction({
    name: 'miniBlog',
    data: {
      type: 'adminService',
      action: "getLabelList",
      kind: kind,
      openId: openId
    }
  })
}

/**
 * 获取Classify集合
 */
function getClassifyList() {
  return wx.cloud.callFunction({
    name: 'miniBlog',
    data: {
      type: 'adminService',
      action: "getClassifyList"
    }
  })
}

/**
 * 更新Classify集合
 */
function updateBatchPostsClassify(classify, operate, posts, openId) {
  return wx.cloud.callFunction({
    name: 'miniBlog',
    data: {
      type: 'adminService',
      action: "updateBatchPostsClassify",
      posts: posts,
      operate: operate,
      classify: classify,
      openId: openId
    }
  })
}

/**
 * 更新label集合
 */
function updateBatchPostsLabel(label, operate, posts, openId, kind) {
  return wx.cloud.callFunction({
    name: 'miniBlog',
    data: {
      type: 'adminService',
      action: "updateBatchPostsLabel",
      posts: posts,
      operate: operate,
      label: label,
      kind: kind,
      openId: openId
    }
  })
}

// 更新显示配置信息
function upsertShowConfig(isShow) {
  return wx.cloud.callFunction({
    name: 'miniBlog',
    data: {
      type: 'adminService',
      action: "upsertShowConfig",
      isShow: isShow
    }
  })
}

/**
 * 获取登录详情
 * @param id
 */
function getSignedDetail(openId, year, month) {
  return wx.cloud.callFunction({
    name: 'miniBlog',
    data: {
      type: 'memberService',
      action: "getSignedDetail",
      openId: openId,
      year: year,
      month: month
    }
  })
}

/**
 * 上传文件
 */
function uploadFile(cloudPath, filePath) {
  return wx.cloud.uploadFile({
    cloudPath: cloudPath,
    filePath: filePath, // 文件路径
  })
}

/**
 * 获取swiperList
 * @param {} openId 
 */
function getSwiperList() {
  return db.collection('mini_swiper')
    .orderBy('id', 'asc')
    .limit(5)
    .get()
}

// 获取管理员信息，可能探索的功能
function getAdmin() {
  return db.collection('mini_config')
    .where({
      key: "admin"
    })
    .get()
}

module.exports = {
  getPostsList: getPostsList,
  getInvitationsList:getInvitationsList,
  getPostDetail: getPostDetail,
  getPostRelated: getPostRelated,
  addPostCollection: addPostCollection,
  addPostZan: addPostZan,
  deletePostCollectionOrZan: deletePostCollectionOrZan,
  addPostComment: addPostComment,
  getPostComments: getPostComments,
  addPostChildComment: addPostChildComment,
  getReportQrCodeUrl: getReportQrCodeUrl,
  addPostQrCode: addPostQrCode,
  checkAuthor: checkAuthor,
  addReleaseLog: addReleaseLog,
  getReleaseLogsList: getReleaseLogsList,
  getPostsById: getPostsById,
  deleteConfigById: deleteConfigById,
  addBaseClassify: addBaseClassify,
  addBaseLabel: addBaseLabel,
  upsertPosts: upsertPosts,
  updatePostsShowStatus: updatePostsShowStatus,
  getCommentsList: getCommentsList,
  changeCommentFlagById: changeCommentFlagById,
  getLabelList: getLabelList,
  getClassifyList: getClassifyList,
  getNewPostsList: getNewPostsList,
  getNewPostsKind: getNewPostsKind,
  getNewPostsLable: getNewPostsLable,
  deletePostById: deletePostById,
  uploadFile: uploadFile,
  updateBatchPostsLabel: updateBatchPostsLabel,
  updateBatchPostsClassify: updateBatchPostsClassify,
  checkPostComment: checkPostComment,
  getMemberInfo: getMemberInfo,
  getPostId: getPostId,
  getSignedDetail: getSignedDetail,
  getMemberInfoList: getMemberInfoList,
  getShareDetailList: getShareDetailList,
  getSwiperList: getSwiperList,
  getAdmin: getAdmin,
  upsertShowConfig: upsertShowConfig
}