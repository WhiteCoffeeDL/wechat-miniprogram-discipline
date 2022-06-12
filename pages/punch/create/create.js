var util = require('../../../utils/util.js');

Page({
  data: {
    content: '',
    period: 1
  },

  // 加载时初始化一下  时间 
  onLoad() {
    this.setData({
      createTime: util.formatTime(new Date()),
      beginDate: util.formatFutureTime(new Date(), 0)//, date.beginDate,
    })
  },

  // 设置计划天数
  periodChange(e) {
    oriPeriod = this.data.period;
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

  bindBeginDateChange(e) {
    var beginDate = e.detail.value,
      now = new Date();

    if (util.compareDate(beginDate, now) > 0) {
      this.setData({
        beginDate: beginDate,
      })
    } else {
      wx.showModal({
        title: 'Sorry',
        content: '开始时间不可早于今天',
        showCancel: false
      })
    }
  },

  contentChange(e) {
    this.setData({
      content: e.detail.value
    })
  },

  // 创建新活动。创建成功跳转至创建成功页
  createActivity() {

    // 活动名称自然不可为空
    if (this.data.content.length == 0) {

      wx.showModal({
        title: 'Hey, 别急',
        content: '请先给计划起个名字',
        showCancel: false
      })
      return;
    }

    // 数据保存
    // 缓存中的数据类型是string  console.log(typeof(arr))
    var arr = wx.getStorageSync('activity');
    var data = [];
    var maxID = -1;
    if (arr.length) {
      arr.forEach((item, i) => {
        if (item.id > maxID)
          maxID = item.id;
        data.push(item);
      })
    }

    // 新增数据跟在尾巴上
    var id = maxID + 1;
    this.setData({
      id: id
    })

    data.push(this.data);
    wx.setStorageSync('activity', data);
    console.log(data)

    // 页面跳转  关闭当前页面
    wx.redirectTo({
      url: '../detail/detail?id=' + id
    })
  }
})