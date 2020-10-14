import api from '../../utils/api';
import config from '../../utils/config'
Page({
  data: {
    isLogin: false, //登录的状态
    userInfo: {},//用户信息
    isAdmin: false,//是否是管理员
    activeIndex: 0,//选项卡默认
    allUserMenu: [],//用户所有的菜单
    userSelfType: [],
    userSelfFollws:[]
  },

  onShow: function () {
    this._checkSession();
    this._getAllMenu();
    this._getSelfMenuFollows()
  },
  /* 检测是否登录 */
  _checkSession() {
    wx.checkSession({
      // 已经登录
      success: (res) => {
        // 获取用户信息-->缓存中
        let userInfo = wx.getStorageSync('userInfo');
        let openId = wx.getStorageSync('openId');
        // 管理员?
        // (openId);
        let admin = openId == config.isAdmin ? true : false
        // (userInfo , openId);
        this.setData({
          isLogin: true,
          userInfo: userInfo,
          isAdmin: admin
        })
      },
      // 未登录
      fail: () => {
        this.setData({
          isLogin: false
        })
        //弹框提醒
        wx.showToast({
          title: '登录才能享受完整体验',
          icon: 'none'
        })
        wx.clearStorageSync();
      }
    })
  },
  /* 登录 */
  _doLogin(e) {
    let _this = this;

    // 选择了拒绝
    if (e.detail.errMsg === "getUserInfo:fail auth deny") {
      wx.showToast({
        title: '登录才能享受完整体验',
        icon: 'none'
      })

      return;
    }
    //选择允许
    wx.login({
      success() {
        wx.cloud.callFunction({
          name: 'login',
          async success(res) {

            // 获取openid  用户唯一标识
            let _openid = res.result.openid;
            // 获取用户信息
            let _userInfo = e.detail.userInfo;
            (_this.data);

            /* 
             *判断用户有没有访问过
             *访问过--> 
             *没有访问过--->往数据库中添加信息
             */
            let userResult = await api.findAll(config.tables.userTable, { _openid })
            // (userResult);

            if (userResult.data.length <= 0) {
              //添加
              let result = await api.add(config.tables.userTable, { _userInfo })
            }
            wx.showToast({
              title: '登录成功'
            })

            //判断是用户登录还是管理员登录
            let isAdmin = _openid == config.isAdmin ? true : false;
            _this.setData({
              isLogin: true,
              userInfo: _userInfo,
              isAdmin
            })


            // 将openid 和 用户信息存入缓存中
            wx.setStorageSync('userInfo', _userInfo);
            wx.setStorageSync('openId', _openid);
          },
          fail() {
            wx.showToast({
              title: '网络故障，请重新登录',
              icon: "none"
            })
          }
        })
      }
    })
  },
  /* 是否是管理员登录 */
  _admin() {
    // openid
    (this.data.isAdmin);
    if (this.data.isAdmin) {
      wx.navigateTo({
        url: '../pbmenutype/pbmenutype',
      })
    }

  },

  /* 菜单点击添加 */
  _goPuMenu() {
    wx.navigateTo({
      url: '../pbmenu/pbmenu',
    })
  },

  /* 选项卡改变index */
  changeActiveIndex(e) {
    let activeIndex = e.currentTarget.dataset.index;
    this.setData({
      activeIndex
    }, () => {
      this._switchActiveIndex()
    })
  },

  /* 选项卡 */
  _switchActiveIndex() {
    let index = this.data.activeIndex;
    switch (index) {
      case '0':
        // 获取菜单信息
        this._getAllMenu()
        break;
      case '1':
        this._getSelfMenuType()
      case '2':
        this._getSelfMenuFollows()
        break
      default:
        break;
    }
  },
  async _getAllMenu() {
    let _openid = wx.getStorageSync('openId')
    // 查询用户自己发布的菜单,添加一个标识  status  1 正常的  2删除的
    let where = { status: 1, _openid }
    let orderBy = { field: 'time', sort: 'desc' }
    let result = await api.findAll(config.tables.rePubMenu, where, orderBy)
    this.setData({
      allUserMenu: result.data
    })

  },
  // 跳转
  _gorecipeDetail(e) {
    let { id, nickname, title } = e.currentTarget.dataset
    wx.navigateTo({
      url: `../recipeDetail/recipeDetail?id=${id}&nickName=${nickname}&title=${title}`,
    })
  },
  // 删除
  delCdlb(e) {
    let _this = this;
    // console.log(e);
    wx.showModal({
      title: "删除提示",
      content: "您确定删除当前菜谱么？",
      async success(res) {
        // console.log(res);
        // 点击了确认
        if (res.confirm) {
          let { id } = e.currentTarget.dataset
          let result = await api.change(config.tables.rePubMenu, id, { status: 2 })
          console.log(result);
          if (result.errMsg == "document.update:ok") {
            _this._getAllMenu()
          }
        }
      }
    })
  },
  // 用户自己发布的菜谱
  async _getSelfMenuType() {
    let _openid = wx.getStorageSync('openId')
    let where = {
      _openid,
      status: 1
    }
    let result = await api.findAll(config.tables.rePubMenu, where)
    console.log(result);
    let _menuType = result.data.map(item => {
      return item.recipeTypeid
    })
    let selfMenuType = Array.from(new Set(_menuType))
    console.log(selfMenuType);

    this.setData({
      userSelfType: selfMenuType
    })
  },
  // 菜谱点击查看
  _goRecipeList(e) {
    console.log(e);
    let { title, type } = e.currentTarget.dataset
    let id = wx.getStorageSync('openId')
    // title id type 
    wx.navigateTo({
      url: `../recipelist/recipelist?title=${title}&id=${id}&type=${type}`,
    })

  },
  async _getSelfMenuFollows() {
    let _openid = wx.getStorageSync('openId')
    let result = await api.findAll(config.tables.reFollows, { _openid })
    console.log(result);
    // 根据菜谱id。获取菜谱信息
    let allPromise = [];
    result.data.forEach((item) => {
      let promsie = api.findById(config.tables.rePubMenu, item.recipeID);
      allPromise.push(promsie)
    })
    let selfFollowRecipes = await Promise.all(allPromise);
    let usersAllPromise = []; //存放所有的用户信息
    selfFollowRecipes.map((item, index) => {
      // item._openid
      let userspromise = api.findAll(config.tables.userTable, { _openid: item.data._openid });
      
      usersAllPromise.push(userspromise)
    })
    let users = await Promise.all(usersAllPromise)
    
    selfFollowRecipes.map((item, index) => {
      item.data.userInfo = users[index].data[0]._userInfo
    })
    this.setData({
      userSelfFollws: selfFollowRecipes
    })
  }

})