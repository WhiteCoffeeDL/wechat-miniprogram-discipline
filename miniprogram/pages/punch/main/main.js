var util = require("../../../utils/util.js");

Page({
  data: {
      listDoing: [],
      listPause: [],
      listComing: [],
      listFnish: []
  },

  onLoad() {
    this.initData();
  },
  onShow(options) {
    this.initData();
  },
  onPullDownRefresh(){
    this.initData();
  },

  detail(e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../detail/detail?id=' + id
    })
  },

  punch(e) {
    var itemDict = util.getItemByID(e.currentTarget.dataset.id);
    if (util.punch(itemDict)) {
        this.initData();
    }
  },

  create() {
    wx.navigateTo({
        url: '../create/create'
    })
  },


  // 登录时，返回所有参与的活动（自己创建的+参与别人的） 
  // 保存在本地缓存中
  // 有修改或者别的，修改远程数据库，但是数据仍读取本地
  initData() {

    var arr = wx.getStorageSync('activity');
    var listDoing = [];
    var listPause = [];
    var listComing = [];
    var listFnish = [];

    var activityList = util.getAllActivities();
    var itemDict;
    for (var i = 0; i < activityList.length; i++) {
        itemDict = activityList[i];
        var punched = util.retPunched(itemDict);
        var stateInfo = util.getStateInfo(itemDict.itemInfo.status, punched);
        var tmpInfoShow = {
            id: itemDict.itemInfo.id,
            content: itemDict.itemInfo.content,
            beginDate: itemDict.itemInfo.beginDate,
            btnState: stateInfo.btn,
            disabled: itemDict.itemInfo.status != 1 || punched,
        };
        switch (itemDict.itemInfo.status) {
          case -2:
            listFnish.push(tmpInfoShow);
            break;
          case -1:
            listComing.push(tmpInfoShow);
            break;
          case 0:
            listPause.push(tmpInfoShow);
            break;
          case 1:
            listDoing.push(tmpInfoShow);
            break;
        }
    }
    this.setData({
      listDoing: listDoing,
      listPause: listPause,
      listComing: listComing,
      listFinish: listFnish
    })
  }
})