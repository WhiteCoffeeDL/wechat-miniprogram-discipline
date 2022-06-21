var util = require("../../../utils/util.js");

Page({

  data: {
    content: '',
    period: 1,
    beginDate: '',
    id: -1,
    state: -2,
    tmpItemDict: {},
    pauseFlag: -1 // -1不能设置, 0取消pause, 1设置pause
  },

  // 加载时初始化一下  时间 
  onLoad(options) {
    this.initData(options.id);
  },

  initData(id) {
    this.data.tmpItemDict = util.getItemByID(id);
    var pauseFlag = this.data.tmpItemDict.itemInfo.status;
    if (this.data.tmpItemDict.itemInfo.status < 0) {
        pauseFlag = -1;
    }
    this.setData({
      content: this.data.tmpItemDict.itemInfo.content,
      period: this.data.tmpItemDict.itemInfo.period,
      beginDate: this.data.tmpItemDict.itemInfo.beginDate,
      id: this.data.tmpItemDict.itemInfo.id,
      state: this.data.tmpItemDict.itemInfo.status,
      pauseFlag: pauseFlag
    })
  },

  // 设置计划天数
  periodChange(e) {
    var oriPeriod = this.data.period;
    var period = parseInt(e.detail.value);
    if (period && period > 0) {
      this.setData({
        period: period,
      })
    } else {
      wx.showModal({
        title: 'Sorry',
        content: '周期设置错误',
        showCancel: false
      })
      this.setData({
        period: oriPeriod
      })
    }
  },

  contentChange(e) {
    this.setData({
      content: e.detail.value
    })
  },

  PauseActivity() {
    var itemDict = this.data.tmpItemDict;
    itemDict.itemInfo.status = 0;
    itemDict.itemDetail.history[itemDict.itemDetail.totalDayNum - 1][0] = -1;
    util.updateItem(itemDict);
  },

  DePauseActivity() {
    var itemDict = this.data.tmpItemDict;
      itemDict.itemInfo.status = 1;
      var tmpStage = 0;
      var totalDayNum = itemDict.itemDetail.totalDayNum;
      if (totalDayNum > 1) {
          tmpStage = (itemDict.itemDetail.history[totalDayNum - 2][0] + 1) % itemDict.itemInfo.period;
      }
      itemDict.itemDetail.history[itemDict.itemDetail.totalDayNum - 1][0] = tmpStage;
  },

  updatePauseState(pauseFlag) {
      if (pauseFlag) { // 取消暂停
          this.DePauseActivity();
      }
      else {
          this.PauseActivity();
      }
  },

  DeleteActivity(itemDict) {
    util.deleteItemByID(itemDict.itemInfo.id);
  },

  bindSwithChange(e) {
    this.setData({
        pauseFlag: e.detail.value
    })
  },

  deleteActivity() {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '将删除相关数据，继续操作？',
      showCancel: true,
      success: function(res) {
        if (res.confirm) {
          that.DeleteActivity(that.data.tmpItemDict);
          wx.navigateBack({
            url: '../main/main?update=true'
          })
        }
      }
    })
  },

  commitEditActivity() {
    // var data = this.data;
    if (this.data.content.length == 0) {
      wx.showModal({
        title: 'Hey, 别急',
        content: '计划名称不得为空',
        showCancel: false
      })
      return;
    }

    this.data.tmpItemDict.itemInfo.content = this.data.content;
    this.data.tmpItemDict.itemInfo.period = this.data.period;
    this.updatePauseState(this.data.pauseFlag);
    util.updateItem(this.data.tmpItemDict);

    // 页面跳转  关闭当前页面
    wx.redirectTo({
      url: '../detail/detail?id=' + this.data.id
    })
  }
})