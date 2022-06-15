var util = require("../../../utils/util.js");

Page({

  data: {

    // 活动状态 0(未开始) 1(进行中) 2(已结束)
    state: 0,
    btnState: '',
    disabled: false,

    // 打卡详情
    punchCount: 0,
    sumDays: 0,
    activity: []
  },

  // 加载初始化
  onLoad(e) {
    this.initBaseData(e.id);
    this.initPunchData(e.id);
  },

  // 基础数据
  initBaseData(id) {
    var arr = wx.getStorageSync('activity');

    if (arr.length) {
      arr.forEach((item) => {

        if (item.id == id) {
          var iTaskState = util.retTaskState(item.beginDate);
          var bPunched = util.retPunched(item.id);

          this.setData({
            id: id,
            content: item.content,
            createTime: item.createTime,
            beginDate: item.beginDate,
            sumDays: item.sumDays,

            state: iTaskState,
            stateColorClass: util.getTaskColorClass(iTaskState),
            btnState: util.getBtnText(iTaskState, bPunched),
            disabled: iTaskState != 1 || bPunched,
          })
        }
      })
    }
  },
  // 打卡记录、勋章
  initPunchData(id) {

    var data = wx.getStorageSync('activity' + id);

    // 每次打卡详细记录 data.arrRecord
    var arrRecord = data.arrRecord ? data.arrRecord : [];

    // 打卡情况总览 date.reconds
    var records = data.records ? data.records : [];

    // 已打卡天数
    var punchCount = data.punchCount ? data.punchCount : 0;

    // 打卡已持续天数 data.lastedDays
    var lastedDays = util.getSumDays(this.data.beginDate, util.formatDate(new Date()));

    var d = [];
    for (var i = 0; i < lastedDays; i++) {
      if (records && records[i]) {
        d.push(true);
      } else {
        d.push(false);
      }
    }
    // console.log('打卡记录总览赋值', d);

    this.setData({
      punchCount: punchCount,
      activity: d, // TODO: 日历形式展示
      arrRecord: arrRecord
    })
  },

  // 编辑活动
  editActivity() {
    wx.redirectTo({
      url: '../edit/edit?id=' + this.data.id +'&state='+this.data.state,
    })
  },

  // 创建者结束活动
  stopActivity() {

    var that = this;
    wx.showModal({
      title: '提示',
      content: '将删除相关数据，继续操作？',
      showCancel: true,

      success: function(res) {
        if (res.confirm) {

          that.DeleteActivity(that.data.id);
          // 活动被销毁，返回main
          wx.navigateBack({
            url: '../main/main?update=true'
          })
        }
      }
    })
  },

  DeleteActivity(id) {
    util.deleteItemByID(id);
  },

  signIn() {

    var id = this.data.id;
    var bSucceed = util.signIn(id, this.data.beginDate);
    if (bSucceed) {
      this.initPunchData(id);
      this.setData({
        btnState: util.getBtnText(1, true),
        disabled: true
      })
    }
  }
})