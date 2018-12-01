// components/xing-editor/editor-add/editor-add.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    show: Boolean,
    index: null
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    editor(e) {
      this.triggerEvent('editor', ++e.currentTarget.dataset.index);
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
