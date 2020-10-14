import Api from '../../utils/api'
import Config from '../../utils/config'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        typeName: [],//菜谱分类
        hotMenu: [],//商品列表
        searchVal:null
    },

    onShow: function () {
        this._getMenuType();
        this._hotMenu()
    },
    /* 菜谱分类栏 */
    async _getMenuType() {
        let result = await Api.find(Config.tables.menuType, {}, 1, 2)
        this.setData({
            typeName: result.data
        })
    },
    /* 菜谱分类跳转 */
    _goTypeList() {
        wx.navigateTo({
            url: '../typelist/typelist',
        })
    },

    /* 首页热门菜谱 */
    async _hotMenu() {
        let where = { status: 1 };
        let orderBy = { field: 'views', sort: "desc" }
        let result = await Api.find(Config.tables.rePubMenu, where, 1, 4, orderBy)
        // console.log(result);

        let userAllInfo = [];
        // 用户信息
        result.data.map(item => {
           let userAllInfoPromise =Api.findAll(Config.tables.userTable,{_openid:item._openid})
           userAllInfo.push(userAllInfoPromise)
        })
        // console.log(userAllInfo);
        let  users = await  Promise.all( userAllInfo )  
        // console.log(users);
        result.data.map((item,index)=>{
             item.userInfo=users[index].data[0]._userInfo
        })

        this.setData({
            hotMenu: result.data
        })

        // console.log(this.data.hotMenu);
        
    },
    /* 跳转到详情页面 */
    _goRecipeDetail(e){
        // console.log(e);
        let {id,title,nickname}=e.currentTarget.dataset
        
        wx.navigateTo({
          url: `../recipeDetail/recipeDetail?id=${id}&title=${title}&nickName=${nickname}`,
        })
    },
    /* 跳转到菜谱列表 */
    _goRecipeList(e){
        // console.log(e);
        let {title=this.data.searchVal,id,type }=e.currentTarget.dataset
        // 搜索条件
        if (title==''||title == null && type == 'search') {
            wx.showToast({
              title: '请输入查询内容',
              icon:"none"
            })
            return
        }
        wx.navigateTo({
          url: `../recipelist/recipelist?title=${title}&id=${id}&type=${type}`,
        })
        this.setData({
            searchVal:''
        })
        
    },
    /*搜索 */
    _search(e){
        let {value}=e.detail
        this.setData({
            searchVal:value
        })
    }
})