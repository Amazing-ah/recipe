// pages/pbmenu/pbmenu.js
import Api from '../../utils/api'
import Config from '../../utils/config'
Page({

  data: {
    menuType: [],//菜谱分类 --》_id _openid typeName
    files: [],//当前的图片列表
  },


  onShow: function () {
    this._getAllMenuType();
  },
  /* 获取所有的菜谱分类 */
  async _getAllMenuType() {
    let result = await Api.findAll(Config.tables.menuType)
    
    this.setData({
      menuType: result.data
    })

  },
  /* 图片 */
  _selectImg(e) {
    // 图片的地址--程序端
    let tempFilePaths = e.detail.tempFilePaths;
    let files = tempFilePaths.map(item => {
      return { url: item }
    })
    // 进行拼接
    files = this.data.files.concat(files);
    this.setData({
      files
    })

  },

  /* 删除图片 */
  _delImg(e) {
    let index = e.detail.index;//图片下标
    let files = this.data.files;//所有图片
    files.splice(index, 1);
    this.setData({
      files
    })
  },

  /* 发布菜谱 */
 async _releaseMenu(e) {
    // 判断菜单名称，菜谱分类，菜谱图片，菜品做法是否为空
    let { menuName, recipeTypeid, recipesMake } = e.detail.value;
    if (menuName == '' || recipeTypeid == "" || recipesMake == "" || this.data.files.length <= 0) {
      wx.showToast({
        title: '内容不能为空',
        icon: "none"
      })
      return
    }
    // 上传
    let fileId = await this._upload(this.data.files)
    fileId= fileId.map(item=>{
      return item.fileID
    })
    //  关注人数 ，浏览次数，星星评级  时间
    let  follows = 0,views=0,status=1,time = new Date().getTime();
    let data = {
      menuName,recipeTypeid,recipesMake,fileId,follows,views,status,time
    }
    // 插入数据库
    let  result =  await  Api.add( Config.tables.rePubMenu, data);
    if (result.errMsg=="collection.add:ok") {
      wx.showToast({
        title: '添加成功',
      })
      setTimeout(()=>{
        wx.navigateBack({
          delta: 1,
        })
      },1500)
    }else {
      wx.showToast({
        title: '添加失败，请检查网路',
        icon:"none"
      })
    }


  },
  /* 上传 */
  async _upload(files) {
    // let files = this.data.files;
    let allFilesPromise=[];
    files.forEach((item, index) => {
      // 获取后缀名 
      let suffix =files[index].url.split('.').pop()
   
      let cloudPath =new Date().getTime()+'_'+index+'.'+suffix
      // 上传
      let fileId = wx.cloud.uploadFile({
        cloudPath:"re-recipes/"+cloudPath, // 上传至云端的路径
        filePath:item.url, // 小程序临时文件路径
      })
      
      allFilesPromise.push(fileId);
      
    })
    return await Promise.all(allFilesPromise)
  }
})
