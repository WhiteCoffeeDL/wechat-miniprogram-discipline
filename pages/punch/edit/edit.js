var util = require("../../../utils/util.js");

Page({

  data: {
    content: '',
    period: 1,
    beginDate: '',
    id: -1,
    state: -2,
    tmpItemDict: {}
  },

  // 加载时初始化一下  时间 
  onLoad(options) {
    this.data.tmpItemDict = util.getItemByID(options.id);
    this.setData({
      content: this.data.tmpItemDict.itemInfo.content,
      period: this.data.tmpItemDict.itemInfo.period,
      beginDate: this.data.tmpItemDict.itemInfo.beginDate,
      id: this.data.tmpItemDict.itemInfo.id,
      state: this.data.tmpItemDict.itemInfo.status
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

  // 编辑提交
  editActivity() {
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
    util.updateItem(this.data.tmpItemDict);

    // 页面跳转  关闭当前页面
    wx.redirectTo({
      url: '../detail/detail?id=' + this.data.id
    })
  }
})