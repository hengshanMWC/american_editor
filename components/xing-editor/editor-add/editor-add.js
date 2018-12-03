// components/xing-editor/editor-add/editor-add.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    show: Object,
    index: null
  },

  /**
   * 组件的初始数据
   */
  data: {
    scale: null,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    editor(e) {
      const query = wx.createSelectorQuery().in(this);
      // query.selectViewport().scrollOffset()
      this.triggerEvent('editor', { 
        index: ++e.currentTarget.dataset.index,
        query
      });
      // this.setData({
      //   scale: wx.createAnimation({
      //     duration: 1000
      //   }).scale(0, 0)
      // })
    },
    add(e) {
      const text = e.currentTarget.dataset.text;
      let map = {
        'addText': '文字',
        'addImage': '图片',
        'addVideo': '视频',
      }
      let eventType = Object.keys(map).find( key => map[key] == text);
      this.triggerEvent(eventType, e.currentTarget.dataset.index);
    },
  }
})
