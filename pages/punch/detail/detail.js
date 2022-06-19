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
    this.refreshBaseInfo(e.id);
    this.showPunchDetail();
  },

  // 基础数据
  refreshBaseInfo(id) {
    this.data.itemDict = util.getItemByID(id);

    var punched = util.retPunched(this.data.itemDict);
    var stateInfo = util.getStateInfo(this.data.itemDict.itemInfo.status, punched);
    this.setData({
      content: this.data.itemDict.itemInfo.content,
      beginDate: this.data.itemDict.itemInfo.beginDate,
      period: this.data.itemDict.itemInfo.period,
      punchDayNum: this.data.itemDict.itemDetail.punchDayNum,
      pauseDayNum: this.data.itemDict.itemDetail.pauseDayNum,
      totalDayNum: this.data.itemDict.itemDetail.totalDayNum,
      successPunchRatio: this.data.itemDict.itemDetail.successPunchRatio,

      statInfoColor: stateInfo.color,
      stateInfoBtn: stateInfo.btn,
      disablePunch: this.data.itemDict.itemInfo.status != 1 || punched,
      canEditFlag: true
    })
  },
  // 打卡记录、勋章
  showPunchDetail() {
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

  punch() { // 打卡后要刷新当前页面
    var succeed = util.punch(this.data.itemDict);
    var punched = util.retPunched(this.data.itemDict);
    if (succeed) {
        this.refreshBaseInfo(this.data.itemDict.itemInfo.id);
        this.showPunchDetail();
        this.setData({
            btnState: util.getStateInfo(1, punched).btn,
            disablePunch: true
        })
    }
  }
})