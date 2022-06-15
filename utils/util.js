var arrTaskState = ['未开始', '进行中', '暂停中'];
var arrBtnState = ['尚未开始', '打卡', '暂停中'];
var arrTaskColor = ['c-coming', 'c-doing', 'c-completed'];

// 按钮文字
function getBtnText(iTaskState, bPunched) {
  var text = '';
  if (iTaskState == 1) {
    text = bPunched ? '已打卡' : '打卡';
  } else {
    text = arrBtnState[iTaskState];
  }
  return text;
}

// 任务状态
function getTaskState(iTaskState) {
  return arrTaskState[iTaskState];
}

// 任务状态对应颜色class
function getTaskColorClass(iTaskState) {
  return arrTaskColor[iTaskState];
}

// 創建任務

// date 之后的 n天
// 返回：结束时间
function formatFutureTime(date, n) {

  n = parseInt(n);

  if (n <= 0) {
    // 返回格式化的当前时间
    return formatDate(date);

  } else {
    // 返回未来 n 天之后的日期
    var newD = retDateObj(date);
    var dd = newD.getTime();
    dd += n * (1000 * 60 * 60 * 24);
    newD.setTime(dd);
    return formatDate(newD);
  }
}


// 年-月-日 时：分：秒
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

// 年-月-日
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

// 补0
function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

// 时间间隔：多少天
function getSumDays(begin, end) {

  var days = 0;

  begin = retDateObj(begin);
  end = retDateObj(end);


  if (begin && end) {
    begin = begin.getTime();
    end = end.getTime();

    days = (end - begin) / (1000 * 60 * 60 * 24) + 1;

  }
  // console.log("getSumDays 间隔天数：" + days);
  return days;
}



// 活动状态判定   用标准时间比较，只比较年月日，不涉及时分秒
// 未开始 0 now < begin  
// 进行中 1 begin <= now
// 异常情况 -1 
function retTaskState(begin) {
  var state = -1;
  
  var now = retDateObj(new Date()).getTime();
  var parse_begin = retDateObj(begin);
    
  if (parse_begin) {
    parse_begin = parse_begin.getTime();
    if (now < parse_begin) {
      state = 0;
    } else {
      state = 1;
    }
  }
  return state;
}

// 返回时间对象   str -> object
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


// 今天是否已打卡
function retPunched(id, arrRecord) {
  var arrRecord = arrRecord ? arrRecord : wx.getStorageSync('activity' + id).arrRecord;
  var re = false;

  if (arrRecord && arrRecord.length > 0) {
    var len = arrRecord.length;
    for (var i = len - 1; i >= 0; i--) {
      if (formatDate(arrRecord[i].date) == formatDate(new Date())) {
        re = true;
        break;
      }
    }
  }
  return re;
}

// 返回连续打卡信息
function retserialInfo(records) {

  var maxTemp = 0;
  var max = 0;

  for (var i = 0, len = records.length; i < len; i++) {
    if (records[i]) {

      maxTemp += 1;
      if (maxTemp > max) {
        max = maxTemp;
      }
    } else {
      maxTemp = 0;
    }
  }

  return {
    serialMaxDays: max,
  }
}

// 打卡
function signIn(id, begin) {

  var now = new Date();
  var data = wx.getStorageSync('activity' + id);

  // 每次打卡详细记录 data.arrRecord
  var arrRecord = data.arrRecord ? data.arrRecord : [];

  // 为防止插入数据错乱，再次验证。
  if (retPunched(id, records)){
    wx.showToast({
      title: '已打卡',
      icon: 'success',
      duration: 1000
    })
    return false;
  }

  // 打卡活动已持续天数 data.lastedDays
  var lastedDays = getSumDays(begin, formatDate(now));

  if (lastedDays > 0) {

    // 打卡情况总览 date.reconds
    var records = data.records ? data.records : [];
    // 已打卡次数
    var punchCount = data.punchCount ? data.punchCount : 0;

    // 打卡时间记录
    arrRecord.push({
      date: formatTime(now),
      index: lastedDays
    });

    // 打卡总览记录
    records[lastedDays - 1] = true;

    // 获取连续打卡信息
    var serialInfo = retserialInfo(records);

    // 保存数据
    var data2 = {
      arrRecord: arrRecord,
      records: records,
      punchCount: punchCount + 1,
      serialMaxDays: serialInfo.serialMaxDays,
    }
    wx.setStorageSync('activity' + id, data2);

    wx.showToast({
      title: '打卡成功',
      icon: 'success',
      duration: 1000
    })
  }
  return true;
}


// 创建活动时间验证， 只验证 年月日
function checkTime(begin, end) {

  var now = formatDate(new Date());
  var msg = '';

  if (compareDate(begin, end) == 2)
    msg = '结束时间比开始时间小啦'
  else if (compareDate(now, end) == 2)
    msg = '噢，这都是过去啦'
  else if (compareDate(now, begin) == 2)
    msg = '当前时间大于开始时间啦'
  else if (compareDate(now, begin) == -1)
    msg = '数据乱了...'

  return msg
}

// 比较两个时间的大小
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

function checkStatus(curTime) {

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
      itemInfo.status == 1;
    }
  }
  if (itemInfo.status == 0) {
    // 暂停状态
    var tmpTotalDaySum = getSumDays(itemInfo.beginDate, formatDate(new Date()));
    var tmpEmptyDayNum = tmpTotalDaySum - itemDetail.totalDayNum;
    for (var i = 0; i < tmpEmptyDayNum; i++) {
      itemDetail.history.push(-1);
    }
    itemDetail.totalDayNum += tmpEmptyDayNum; // 总打卡天数
    itemDetail.pauseDayNum += tmpEmptyDayNum; // 总暂停天数
    itemDetail.punchDayNum += 0; // 成功打卡天数
  }
  if (itemInfo.status == 1) {
    // 正常开始状态 period != 1 还未处理
    var tmpTotalDaySum = getSumDays(itemInfo.beginDate, formatDate(new Date()));
    var tmpEmptyDayNum = tmpTotalDaySum - itemDetail.totalDayNum;
    for (var i = 0; i < tmpEmptyDayNum; i++) {
      itemDetail.history.push(0);
    }
    itemDetail.totalDayNum += tmpEmptyDayNum; // 总打卡天数
    itemDetail.pauseDayNum += 0; // 总暂停天数
    itemDetail.punchDayNum += 0; // 成功打卡天数
  }
  
}

// extern func: getItemByID  输入ID，输出item信息
// 找到item
// refreshItem
// 刷新到缓存 wx.setStorageSync('activity' + id, data2);
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

// extern func: updateItem 输入item_data，系统更新，并进行刷新，也先refreshItem再更新到
function updateItem(itemDict) {
  // refreshItem(tmpItem)
  // wx.setStorageSync('activity'+id, data)
  refreshItem(itemDict);
  var arr = wx.getStorageSync('activity');
  arr[itemDict.itemInfo.tmpIdx] = itemDict.itemInfo;
  wx.setStorageSync('activity', arr);
  wx.setStorageSync('activity' + itemDict.itemInfo.id, itemDict.itemDetail);
}

// extern func: createItem(newItem) 传入new_item，刷新到系统中
function createItem(newItemDict) {
  refreshItem(newItemDict);
  var arr = wx.getStorageSync('activity');
  if (!arr) { arr = []; }
  arr.push(newItemDict.itemInfo);
  wx.setStorageSync('activity', arr);
  wx.setStorageSync('activity' + newItemDict.itemInfo.id, newItemDict.itemDetail)
}

// extern func:[signIn] punch(id, punchTime)，输入ID，打卡时间戳
// getItemByID
// check 没有重复打卡
// 更新当前tmpItem
// updateItem
function punch(id, punchTime) {

}

// extern func: initDefaultItem 为create函数搞的，其中的id自动+1
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
  // TODO: 总天数，暂停天数，和成功打卡天数，考虑>1天周期场景
  itemDetail.totalDayNum = 0; // 总打卡天数
  itemDetail.pauseDayNum = 0; // 总暂停天数
  itemDetail.punchDayNum = 0; // 成功打卡天数
  itemDetail.history = []; // 打卡记录；-1暂停，0未打卡，1打卡
  return {itemInfo: itemInfo, itemDetail: itemDetail};
}

// extern func: deleteItemByID 根据ID删除对应Item
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

module.exports = {
  formatTime: formatTime,
  formatDate: formatDate,
  formatFutureTime: formatFutureTime,
  retTaskState: retTaskState,
  signIn: signIn,
  getSumDays: getSumDays,
  checkTime: checkTime,
  retPunched: retPunched,
  getBtnText: getBtnText,
  getTaskState: getTaskState,
  getTaskColorClass: getTaskColorClass,
  compareDate: compareDate,
  deleteItemByID: deleteItemByID,
  initDefaultItem: initDefaultItem,
  createItem: createItem,
  getItemByID: getItemByID,
  updateItem: updateItem
}