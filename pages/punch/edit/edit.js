var util = require("../../../utils/util.js");

Page({

  data: {
    index: -1
  },

  // 加载时初始化一下  时间 
  onLoad(options) {

    var id = options.id;
    var state = options.state;
    var arr = wx.getStorageSync('activity');

    if (arr.length) {

      var i = 0;
      var len = arr.length;
      var item;

      for (i = 0; i < len; i++) {
        item = arr[i];
        if (item.id == id) {
          this.setData({
            content: item.content,
            period: item.period,
            beginDate: item.beginDate,
            endDate: item.endDate,
            index: i,
            id: id,
            state: state
          })
          break;
        }
      }
    }
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
    // 数据保存
    // 缓存中的数据类型是string  console.log(typeof(arr))
    var arr = wx.getStorageSync('activity');
    var index = this.data.index;
    var editItem = arr[index];

    editItem.content = this.data.content;
    editItem.period = this.data.period;

    arr[index] = editItem

    wx.setStorageSync('activity', arr);

    // 页面跳转  关闭当前页面
    wx.redirectTo({
      url: '../detail/detail?id=' + this.data.id
    })
  }
})