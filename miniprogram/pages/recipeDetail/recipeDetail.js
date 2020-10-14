const { default: api } = require("../../utils/api");
const { default: config } = require("../../utils/config");

const _ = api.db.command
// pages/recipeDetail/recipeDetail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: '',
    title: '',//菜谱名称
    nickName: "",//用户昵称
    img: [],//图片
    views: '',//浏览次数
    follows: '',//关注次数
    recipesMake: '',//菜谱的做法
    isFollows: false//是否关注
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(options);
    let {
      id, title, nickName
    } = options
    wx.setNavigationBarTitle({
      title
    })
    this.setData({
      id,
      nickName
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 获取用户信息
    this._getUserInfo()
  },

  async _getUserInfo() {
    let id = this.data.id;

    let result = await api.findById(config.tables.rePubMenu, id)
    // console.log(result);
    // 浏览次数的修改
    let upViews = await api.change(config.tables.rePubMenu, id, { views: _.inc(1) })
    result.data.views++;
    // 是否登录
    let _openid = wx.getStorageSync('openId') || null;
    if (_openid == null) {
      this.setData({
        isFollows: false
      })
    } else {
      // 登录了，判断用户是否关注了这个菜单
      let where = {
        _openid,
        recipeID: id
      }
      let _follows = await api.findAll(config.tables.reFollows, where)
      console.log(_follows);
      if (_follows.data.length<=0) {
        this.setData({
          isFollows:false
        })
      }else {
        this.setData({
          isFollows:true
        })
      }
      
    }

    this.setData({
      img: result.data.fileId,
      views: result.data.views,
      follows: result.data.follows,
      recipesMake: result.data.recipesMake
    })
  },

  /* 关注的点击 */
  async _changeFollows() {
    // 判断是否登录
    let _openid = wx.getStorageSync('openId') || null;
    let id = this.data.id
    if (_openid == null) {
      wx.showModal({
        cancelColor: 'cancelColor',
        title: "前往登录",
        content: "当前账号未登录，是否前往登录界面",
        success(res) {
          if (res.confirm) {
            // 用户点击了确定，前往登录
            wx.switchTab({
              url: '../personal/personal',
            })
          } else if (res.cancel) {
            wx.showToast({
              title: '账号未登录，无法进行关注',
              icon: 'none'
            })
          }
        }
      })
      return;
    }
    // 用户登录了
    if (this.data.isFollows) {
      // 如果为真，就是关注了，点击取消关注
      // console.log(this.data.isFollows);
      // 数据库
      let where = {
        _openid,
        recipeID: id
      }
      let result = await api.removeByWhere(config.tables.reFollows, where)
      // console.log(result);
      if (result.errMsg == "collection.remove:ok") {
        wx.showToast({
          title: '取消关注成功'
        })
        api.change(config.tables.rePubMenu, id, { follows: _.inc(-1) })
        this.data.follows--;
        if (this.data.follows <= 0) {
          this.data.follows = 0
        }
        this.setData({
          isFollows: false,
          follows: this.data.follows
        })
      }


    } else {
      // 关注
      let result = await api.add(config.tables.reFollows, { recipeID: id })
      // console.log(result);
      if (result._id) {
        // 更新菜谱表中的follows字段
        api.change(config.tables.rePubMenu, id, { follows: _.inc(1) })

        wx.showToast({
          title: '关注成功',
        })
        this.data.follows++;
        this.setData({
          isFollows: true,
          follows: this.data.follows++
        })
      }
    }

  }

})