import config from '../../utils/config'
import api from '../../utils/api'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    addMenuType:'',
    menu:[],//用户所有菜单信息
    willChangeMenu:'',//点击修改后修改输入框的内容
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  this._getAllTypeList()
  },
  _addMenuType(e){
    // (e);
    this.setData({
      addMenuType:e.detail.value
    })
  },
  // 点击添加按钮
  async _doAddType(){
    // 获取输入的菜谱分类
    let typeName=this.data.addMenuType;
    // (typeName);
    // 所有菜单
    let allTypeMenu =this.data.menu;
    // (allTypeMenu);
    // 菜谱内容是否为空
    if (typeName=='') {
      wx.showToast({
        title: '内容不能为空',
        icon:"none"
      })
      return
    }
    // 判断是否已经存在分类名称
    let isHave =allTypeMenu.findIndex(item=>{
      return item.typeName==typeName
    })
    if (isHave!=-1) {
      wx.showToast({
        title: '菜谱分类已经存在',
        icon:'none',
      })
      return
    }
    
    // 添加
    let result =await api.add(config.tables.menuType,{typeName})
    if (result.errMsg=="collection.add:ok") {
      wx.showToast({
        title: '添加成功',
      })
      this.setData({
        addMenuType:typeName
      })
      // 刷新界面
      this._getAllTypeList()
    }
    
  },

  // 点击了删除
 async _doMenuTypeDel(e){
    // (e);
    let id=e.currentTarget.dataset.id;
    // (id);
    let result =await api.del(config.tables.menuType,id)
    // (result);
    if (result.errMsg=="document.remove:ok") {
      wx.showToast({
        title: '删除成功',
      })
    }
    // 刷新页面
    this._getAllTypeList()
  },

  // 点击了上方修改
  async _doMenuTypeChage(e){
    (e);
    let id=e.currentTarget.dataset.id;
    // 获取 分类名称
    let info =await api.findById(config.tables.menuType,id)
    // (info);
    let {typeName}=info.data
    // (typeName);
    // (this.data.menu);
    this.setData({
      willChangeMenu:typeName,
      id:id
    })
  },
  _changeMenuType(e){
    // (e);
    this.setData({
      willChangeMenu:e.detail.value
    })
  },
  // 修改
 async _changeTypeName(){
  //  (this.data.id);
    let id=this.data.id;
    let typeName=this.data.willChangeMenu
    (typeName);
      // 所有菜单
      let allTypeMenu =this.data.menu;
      (allTypeMenu);
      // 菜谱内容是否为空
      if (typeName=='') {
        wx.showToast({
          title: '内容不能为空',
          icon:"none"
        })
        return
      }
     // 判断是否已经存在分类名称
     let isHave =allTypeMenu.findIndex(item=>{
       (item);
       
      return item.typeName==typeName
    })
    if (isHave!=-1) {
      wx.showToast({
        title: '菜谱分类已经存在',
        icon:'none',
      })
      return
    }
    let result =await api.change(config.tables.menuType,id,{typeName})
    // (result);
    if (result.errMsg=="document.update:ok") {
      wx.showToast({
        title: '修改成功',
      })
      this.setData({
        willChangeMenu:''
      })
      // 刷新 列表
      this._getAllTypeList()
    }
    
  },
  // 在数据库中查询
  async _getAllTypeList() {
    let result =await api.findAll(config.tables.menuType);
    // (result);
    this.setData({
      menu:result.data
    })
  }
 
})