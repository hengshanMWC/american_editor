// pages/editor-text/editor-text.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    text: '',
    show: false,
    soil: null,//定时器
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      text: app.globalData.xing.text,
    })
  },
  
  complete() {
    app.globalData.xing.text = this.data.text;
    wx.navigateBack({
      delta: 1
    })
  },

  onTextareaInput: function (e) {
    this.setData({
      text: e.detail.value
    })
  },
})