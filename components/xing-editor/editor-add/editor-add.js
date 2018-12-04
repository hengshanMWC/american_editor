// components/xing-editor/editor-add/editor-add.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    show: {
      type: Object,
      observer(newVal, oldVal) {
        const { b, direction } = newVal;
        // this.animation.scale(0, 0)
        let oExport;
        if(b) {
          if (direction === 'bottom') {
            oExport = this.animation.scale(1).step().export();
          } else {
            oExport = this.animation.scale(1).translateY(-60).step().export();
          }
        } else {
          oExport = this.animation.scale(0).translateY(0).step().export();
        }
        setTimeout(() => this.setData({ animation: oExport }),30)
      },
    },
    pixelRatio: Number,
    index: null
  },

  /**
   * 组件的初始数据
   */
  data: {
    scale: null,
  },

  created(){
    this.animation = wx.createAnimation()
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
