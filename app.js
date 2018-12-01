//app.js
App({
  onLaunch: function () {
  },
  clearXing(){
    const xing = this.globalData.xing
    Object.keys(xing).forEach(val => xing[val] = '')
  },
  
  globalData: {
    //跳转页面时
    xing: {
      text: '',//储存文字
      index: '',//储存下标
    },
    userInfo: null,
  }
})