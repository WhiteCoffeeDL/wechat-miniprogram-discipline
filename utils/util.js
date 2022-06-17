function retPunched(itemDict, checkDate) {
    checkDate = checkDate ? checkDate : formatDate(new Date());
    var checkIndex = getSumDays(itemDict.itemInfo.beginDate, checkDate) - 1;
    if (checkIndex < 0 || checkIndex >= itemDict.itemDetail.history.length) {
        return false;
    }
    return Boolean(itemDict.itemDetail.history[checkIndex][1]);
}

function retDateObj(date) {

  if (typeof date == 'object') {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  } else {
    var obj = {};

    if (date.length > 0) {
      var date = date.split(' ')[0].split('-');
      obj = new Date(date[0], date[1] - 1, date[2]);
    }
    return obj;
  }
}

function formatTime(date) {
  var year, month, day, hour, minute, second;
  if (typeof date == 'object') {
    year = date.getFullYear();
    month = date.getMonth() + 1;
    day = date.getDate();
    hour = date.getHours();
    minute = date.getMinutes();
    second = date.getSeconds();
  } else {
    var temp = date.split(' ');
    var dd = temp[0].split('-');
    var tt = temp[1].split(':');
    year = dd[0];
    month = dd[1];
    day = dd[2];
    hour = tt[0] ? tt[0] : 0;
    minute = tt[1] ? tt[1] : 0;
    second = tt[2] ? tt[2] : 0;
  }
  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatDate(date) {
  var year, month, day;
  if (date.getFullYear) {
    year = date.getFullYear(),
      month = date.getMonth() + 1,
      day = date.getDate()
  } else {
    var date = date.split(' ')[0].split('-');
    year = parseInt(date[0]);
    month = parseInt(date[1]);
    day = parseInt(date[2]);
  }
  return [year, month, day].map(formatNumber).join('-')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function getSumDays(begin, end) {
  var days = 0;
  begin = retDateObj(begin);
  end = retDateObj(end);
  if (begin && end) {
    begin = begin.getTime();
    end = end.getTime();
    days = (end - begin) / (1000 * 60 * 60 * 24) + 1;
  }
  return days;
}

// 2 大于  1 等于  0 小于
function compareDate(begin, end) {

  var state = -1;

  begin = retDateObj(begin);
  end = retDateObj(end);


  if (begin && end) {
    begin = begin.getTime();
    end = end.getTime();

    if (begin > end) {
      state = 2;
    } else if (begin === end) {
      state = 1;
    } else {
      state = 0;
    }
  }
  return state;
}

function refreshItem(itemDict) { 
  // if saveIdx OK, save using Idx
  var itemInfo = itemDict.itemInfo;
  var itemDetail = itemDict.itemDetail;
  if (itemInfo.status == -2) { 
    // 已完成状态不更新
    return;
  }
  if (itemInfo.status == -1) {
    // 未开始，check时间是否已经开始
    var ret = compareDate(itemInfo.beginDate, formatDate(new Date()));
    if (ret <= 1) {
      // beginDate < new Date() -- 0
      // beginDate == new Date() -- 1
      itemInfo.status = 1;
    } 
  }
  if (itemInfo.status == 0) {
    // 暂停状态
    var tmpTotalDaySum = getSumDays(itemInfo.beginDate, formatDate(new Date()));
    var tmpEmptyDayNum = tmpTotalDaySum - itemDetail.totalDayNum;
    for (var i = 0; i < tmpEmptyDayNum; i++) {
      itemDetail.history.push([-1, -1]);
    }
    itemDetail.totalDayNum += tmpEmptyDayNum; // 总打卡天数
    itemDetail.pauseDayNum += tmpEmptyDayNum; // 总暂停天数
  }
  if (itemInfo.status == 1) {
    // 正常开始状态 period != 1 还未处理
    var tmpTotalDaySum = getSumDays(itemInfo.beginDate, formatDate(new Date()));
    var tmpEmptyDayNum = tmpTotalDaySum - itemDetail.totalDayNum;
    var tmpStageInPeriod = 0;
    var tmpPunchStatus = 0;
    if (itemDetail.history.length != 0) {
        var lastHistoryPair = itemDetail.history[itemDetail.history.length - 1];
        tmpStageInPeriod = (lastHistoryPair[0] + 1) % itemInfo.period;
        tmpPunchStatus = (tmpStageInPeriod != 0) ? lastHistoryPair[1] : 0;
    }
    for (var i = 0; i < tmpEmptyDayNum; i++) {
        itemDetail.history.push([tmpStageInPeriod, tmpPunchStatus]);
        if (tmpPunchStatus == 1) {
            itemDetail.punchDayNum += 1;
        }
        tmpStageInPeriod = (tmpStageInPeriod + 1) % itemInfo.period;
        if (tmpStageInPeriod == 0) {
            tmpPunchStatus = 0;
        }
    }
    itemDetail.totalDayNum += tmpEmptyDayNum; // 总打卡天数
  }
  itemDetail.successPunchRatio = itemDetail.punchDayNum / (itemDetail.totalDayNum - itemDetail.pauseDayNum);
}

function getItemByID(id) {
  var arr = wx.getStorageSync('activity');
  var itemDict = {};
  for (var i = 0; i < arr.length; i++) {
    if (arr[i].id == id) {
      itemDict.itemInfo = arr[i];
      itemDict.itemInfo.tmpIdx = i;
    }
  }
  itemDict.itemDetail = wx.getStorageSync('activity'+id);
  refreshItem(itemDict);
  arr[itemDict.itemInfo.tmpIdx] = itemDict.itemInfo;
  wx.setStorageSync('activity', arr);
  wx.setStorageSync('activity' + id, itemDict.itemDetail);
  return itemDict;
}

function updateItem(itemDict) {
    var lastIndex = itemDict.itemDetail.history.length - 1;
    if (itemDict.itemDetail.history[lastIndex][0] != -1) {
        if (itemDict.itemDetail.history[lastIndex][0] > itemDict.itemInfo.period) {
            itemDict.itemDetail.history[lastIndex][0] = 0;
        }
    }
    var arr = wx.getStorageSync('activity');
    arr[itemDict.itemInfo.tmpIdx] = itemDict.itemInfo;
    wx.setStorageSync('activity', arr);
    wx.setStorageSync('activity' + itemDict.itemInfo.id, itemDict.itemDetail);
}

function createItem(newItemDict) {
  refreshItem(newItemDict);
  var arr = wx.getStorageSync('activity');
  if (!arr) { arr = []; }
  arr.push(newItemDict.itemInfo);
  wx.setStorageSync('activity', arr);
  wx.setStorageSync('activity' + newItemDict.itemInfo.id, newItemDict.itemDetail)
}

function deleteItemByID(id) {
  var arr = wx.getStorageSync('activity');
  var data = [];
  if (arr.length) {
    arr.forEach(
      (item) => {
        if (item.id != id) {
          data.push(item);
        }
      }
    )
    wx.setStorageSync('activity', data);
  }
  wx.removeStorageSync('activity' + id);
}

function punch(itemDict, punchDate) {
    if (retPunched(itemDict)) {
        wx.showToast({
            title: '已打卡',
            icon: 'success',
            duration: 1000
        })
        return false;
    }

    punchDate = punchDate ? punchDate : formatDate(new Date());
    var punchIndex = getSumDays(itemDict.itemInfo.beginDate, punchDate) - 1;
    var history = itemDict.itemDetail.history;
    if (history[punchIndex][0] == -1) {
        wx.showToast({
            title: '该日期为暂停日期无法补打卡',
            icon: 'success',
            duration: 1000
        })
        return false;
    }
    if (history[punchIndex][1] == 1) {
        wx.showToast({
            title: '成功打卡无需补打卡',
            icon: 'success',
            duration: 1000
        })
        return false;
    }
    var tmpStageInPeriod = history[punchIndex][0];
    for (var i = tmpStageInPeriod; i >= 0; i--) {
        history[punchIndex - i][1] = 1;
        itemDict.itemDetail.punchDayNum += 1;
    }
    // 保存数据
    refreshItem(itemDict)
    updateItem(itemDict)
    console.log(itemDict)

    wx.showToast({
      title: '打卡成功',
      icon: 'success',
      duration: 1000
    })
  return true;
}

function initDefaultItem() {
  var arr = wx.getStorageSync('activity');
  var maxID = -1;
  if (arr.length) {
    arr.forEach((item, i) => {
      if (item.id > maxID) {
        maxID = item.id;
      }
    })
  }
  var itemInfo = {};
  itemInfo.content = ''; // 活动内容
  itemInfo.beginDate = ''; // 开始日期
  itemInfo.createTime = ''; // 开始时间
  itemInfo.period = 1; // 打卡周期
  itemInfo.id = maxID + 1; // 任务ID
  itemInfo.status = -1; // -2已完成 -1未开始 0暂停 1正常
  itemInfo.tmpIdx = -1; // 动态改变，仅用于加速避免过多遍历
  var itemDetail = {};
  itemDetail.totalDayNum = 0; // 总打卡天数
  itemDetail.pauseDayNum = 0; // 总暂停天数
  itemDetail.punchDayNum = 0; // 成功打卡天数
  itemDetail.successPunchRatio = 0; // 成功打卡比例
  // history = [[stage, state], [], ...], 从beginDate开始有长度
  //    stage: -1, 0, 1, 2, ..., period-1, 当前周期阶段（-1暂停）
  //    state: -1暂停，0未打卡，1打卡, 打卡状态
  itemDetail.history = []; 
  return {itemInfo: itemInfo, itemDetail: itemDetail};
}

function getStateInfo(status, punched) {
    var stateInfo = {};
    switch(status) {
        case -2:
            stateInfo.chn = '已完成';
            stateInfo.btn = '已完成';
            stateInfo.color = 'c-finish';
            break;
        case -1:
            stateInfo.chn = '未开始';
            stateInfo.btn = '未开始';
            stateInfo.color = 'c-coming';
            break;
        case 0:
            stateInfo.chn = '暂停中';
            stateInfo.btn = '暂停中';
            stateInfo.color = 'c-pause';
            break;
        case 1:
            stateInfo.chn = '进行中';
            stateInfo.btn = punched ? '已打卡' : '打卡';
            stateInfo.color = 'c-doing';
            break;
    }
    return stateInfo;
}

function getAllActivities() {
    var arr = wx.getStorageSync('activity');
    var activityList = [];
    for (var i = 0; i < arr.length; i++) {
        activityList.push(getItemByID(arr[i].id))
    }
    return activityList;
}

module.exports = {
    retPunched: retPunched,
    formatTime: formatTime,
    formatDate: formatDate,
    getSumDays: getSumDays,
    getStateInfo: getStateInfo,
    compareDate: compareDate,
    deleteItemByID: deleteItemByID,
    initDefaultItem: initDefaultItem,
    createItem: createItem,
    getItemByID: getItemByID,
    updateItem: updateItem,
    punch: punch,
    getAllActivities: getAllActivities
}