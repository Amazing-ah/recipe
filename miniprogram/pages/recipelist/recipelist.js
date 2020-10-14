const { default: api } = require("../../utils/api");
const { default: config } = require("../../utils/config");

// pages/recipelist/recipelist.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    typeId: '',
    type: "",
    recipelist: [],
    isShow: false
  },
  onLoad(options) {
    wx.setNavigationBarTitle({
      title: options.title,
    })
    this.setData({
      typeId: options.title,
      type: options.type
    })

  
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 获取所有列表
    this._getAllRecipeList();
  },

  async _getAllRecipeList() {
    let typeId = this.data.typeId
    let type = this.data.type
    let where = {};
    let orderBy = {}
    switch (type) {
      case 'ptcp':
        where = {
          status: 1,
          recipeTypeid: typeId
        },
          orderBy = {
            field: "time",
            sort: "desc"
          }
        break;

        case 'tjcp':
          where ={
            status: 1,
          },
          orderBy = {
            field: "follows",
            sort: "desc"
          }
          break;
        case 'rmcp':
          where ={
            status: 1,
          },
          orderBy = {
            field: "views",
            sort: "desc"
          }
          break;
        case 'search':
          let title = this.data.typeId;
          where = {
            status: 1,
            menuName:api.db.RegExp({
              regexp: title,
              options: 'i',
            }),
          }
          orderBy = {
            field: "time",
            sort: "desc"
          }
  
          break;
        case 'yhcp':
          where ={
            status: 1,
            recipeTypeid:typeId
          },
          orderBy = {
            field: "views",
            sort: "desc"
          }
          break;
      default:
        break;
    }
    
    let result = await api.findAll(config.tables.rePubMenu, where, orderBy)

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
    let recipelist = result.data;
    if (recipelist.length<=0) {
      this.setData({
        isShow:true
      })
    }
    this.setData({
      recipelist
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