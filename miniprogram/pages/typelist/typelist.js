// pages/typelist/typelist.js
import Api from '../../utils/api'
import Config from '../../utils/config'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    typeList: [],
    searchVal:null
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 获取所有菜谱
    this._getTypeList()
  },
  async _getTypeList() {
    let result = await Api.findAll(Config.tables.menuType, {})
    // console.log(result);
    this.setData({
      typeList: result.data
    })
  },
  /* 跳转到菜谱列表 */
  _goRecipeList(e) {
    // console.log(e);
    let { title, id, type } = e.currentTarget.dataset
    wx.navigateTo({
      url: `../recipelist/recipelist?title=${title}&id=${id}&type=${type}`,
    })

  },
  /* 跳转到菜谱列表 */
  _goRecipeList(e) {
    // console.log(e);
    let { title = this.data.searchVal, id, type } = e.currentTarget.dataset

    // 搜索条件
    if (title==''||title == null && type == 'search') {
      wx.showToast({
        title: '请输入查询内容',
        icon: "none"
      })
      return
    }
    wx.navigateTo({
      url: `../recipelist/recipelist?title=${title}&id=${id}&type=${type}`,
    })
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
  }
})