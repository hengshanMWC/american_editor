// pages/editor-text/editor-text.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    text: '',
    show: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      text: app.globalData.xing.text,
    })
  },

  appear() {
    this.setShow(true)
  },

  goAway() {
    this.setShow(false)
  },

  setShow(b) {
    this.setData({
      show: b,
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

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },
})