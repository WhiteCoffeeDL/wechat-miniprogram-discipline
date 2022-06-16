var util = require("../../../utils/util.js");

Page({
  data: {
    // 活动状态 0(未开始) 1(进行中) 2(已结束)
    taskState: 0,
    btnState: '',
    canEditFlag: false,
    disablePunch: false,

    // 暂存itemDict
    itemDict: {},

    // 打卡详情
    punchDayNum: 0,
    pauseDayNum: 0,
    totalDayNum: 0,
    successPunchRatio: 0,
    activityDetail: []
  },

  // 加载初始化
  onLoad(e) {
    this.initBaseData(e.id);
    this.initPunchData(e.id);
  },

  // 基础数据
  initBaseData(id) {
    this.data.itemDict = util.getItemByID(id);

    var bPunched = util.retPunched(id);
    var stateInfo = util.getStateInfo(this.data.itemDict.itemInfo.status, bPunched);
    console.log(stateInfo);
    console.log(this.data.itemDict.itemInfo.status);
    console.log(bPunched);
    this.setData({
      content: this.data.itemDict.itemInfo.content,
      createTime: this.data.itemDict.itemInfo.createTime,
      period: this.data.itemDict.itemInfo.period,
      punchDayNum: this.data.itemDict.itemDetail.punchDayNum,
      pauseDayNum: this.data.itemDict.itemDetail.pauseDayNum,
      totalDayNum: this.data.itemDict.itemDetail.totalDayNum,
      successPunchRatio: (this.data.totalDayNum - this.data.pauseDayNum) ? this.data.punchDayNum / this.data.totalDayNum : null,

      statInfoColor: stateInfo.color,
      stateInfoBtn: stateInfo.btn,
      disablePunch: this.data.itemDict.itemInfo.status != 1 || bPunched,
      canEditFlag: true
    })
  },
  // 打卡记录、勋章
  initPunchData(id) {
    this.setData({
      history: ['TODO:', 'Using beautiful calendar with icon']
      // history: this.data.itemDict.itemDetail.history
    })
  },

  // 编辑活动
  editActivity() {
    wx.redirectTo({
      url: '../edit/edit?id=' + this.data.itemDict.itemInfo.id +'&state='+this.data.itemDict.itemInfo.status,
    })
  },

  stopActivity() {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '将删除相关数据，继续操作？',
      showCancel: true,
      success: function(res) {
        if (res.confirm) {
          that.DeleteActivity(that.data.itemDict.itemInfo.id);
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

  signIn() { // 打卡后要刷新当前页面

    var id = this.data.itemDict.itemInfo.id;
    var bSucceed = util.signIn(id, this.data.itemDict.itemInfo.beginDate);
    if (bSucceed) {
      this.initPunchData(id);
      this.setData({
        btnState: util.getStateInfo(1, true).btn,
        disabled: true
      })
    }
  }
})