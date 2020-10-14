const { default: api } = require("../../utils/api");
const { default: config } = require("../../utils/config");

// pages/search/search.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hotSearch: [],//热门搜索
    recentSearch: [],//近期搜索
    isShow:false
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 热门搜索
    this._getHotSearch(),
      //近期搜索
      this._getRecentSearch()
  },
  /* 热门搜索 */
    // 获取热门搜索内容
    async _getHotSearch() {

      let result = await api.find(config.tables.rePubMenu,{
        status: 1
      }, 1, 6, {
        field: "views",
        sort: "desc"
      })
  
      //存放所有的用户信息
    let usersAllPromise = [];
    result.data.map((item, index) => {
      // item._openid
      let userspromise = api.findAll(config.tables.userTable, {
        _openid: item._openid
      });

      usersAllPromise.push(userspromise)
    })
    
    let users = await Promise.all(usersAllPromise)
    
    result.data.map((item, index) => {
      item.userInfo = users[index].data[0]._userInfo
    })
    let hotSearch = result.data;

    this.setData({
      hotSearch
    })
      
    },
  
  /* 近期搜索 */
  _getRecentSearch() {
  let recentSearch=  wx.getStorageSync('recentSearch')||[]
  this.setData({
    recentSearch
  })
  if (recentSearch.length>0) {
    this.setData({
      isShow:true
    })
  }
  
  },

  /* 
    点击搜索跳转到菜谱列表
    获取搜索内容 存入缓存中

   */
  _goRecipeList(e) {
    let { title = this.data.searchVal, id, type } = e.currentTarget.dataset
    // 搜索条件
    if (title == '' || title == null && type == 'search') {
      wx.showToast({
        title: '请输入查询内容',
        icon: "none"
      })
      return
    }
    // 查询缓存中是否有值
    let recentSearch  =  wx.getStorageSync('recentSearch') || [];

    let finIndex = recentSearch.findIndex((item) => {
      return item == title;
    })
    // -1 返回-1证明缓存中不存在
    if (finIndex == -1) {
      recentSearch.unshift(title)
    } else {
      recentSearch.splice(finIndex, 1);
      recentSearch.unshift(title)
    }

    //存入缓存中，
    wx.setStorageSync('recentSearch', recentSearch)



    //跳转
    wx.navigateTo({
      url: `../recipelist/recipelist?title=${title}&id=${id}&type=${type}`,
    })
    // 清空
    this.setData({
      searchVal: ''
    })

  },
  /*搜索 */
  _search(e) {
    let { value } = e.detail
    this.setData({
      searchVal: value
    })
  },
   // 跳转
   _gorecipeDetail(e){
    let {id,nickname,title}=e.currentTarget.dataset
    wx.navigateTo({
      url: `../recipeDetail/recipeDetail?id=${id}&nickName=${nickname}&title=${title}`,
    })
  }

})