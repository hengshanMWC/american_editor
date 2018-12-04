// components/xing-editor.js
const app = getApp();
let createX = {
  duration: 600,
}
let aX = [[{
  name: 'translateX',
  num: 0,
}]]
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    //上传相关属性，参考wx.uploadFile
    imageUploadUrl: String,
    imageUploadName: String,
    imageUploadHeader: Object,
    imageUploadFormData: Object,
    imageUploadKeyChain: String, //例：'image.url'

     videoUploadUrl: String,
     videoUploadName: String,
     videoUploadHeader: Object,
     videoUploadFormData: Object,
     videoUploadKeyChain: String, //例：'video.url'

    //图片和照片公共
    uploadUrl: String,
    uploadHeader: Object,
    uploadFormData: Object,

    //是否在选择图片后立即上传
    // uploadImageWhenChoose: {
    //   type: Boolean,
    //   value: false,
    // },

    //输入内容
    nodes: Array,
    html: String,

    //内容输出格式，参考rich-text组件，默认为节点列表
    outputType: {
      type: String,
      value: 'html',
    },

    buttonBackgroundColor: {
      type: String,
      value: '#409EFF',
    },

    buttonTextColor: {
      type: String,
      value: '#fff',
    },

    title: {
      type:String,
      value: '',
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    windowHeight: 0,
    pixelRatio: 0,
    //
    nodeList: [],
    //元素：p的content，其他为undefined
    aShow: [{
      b: true,//显示隐藏
      direction: 'bottom',//箭头方向
      // animation: () => 
    }],
    //新增动画
    runOver: [],
  },

  pageLifetimes :{
    show() {
      let { text, index, type } = app.globalData.xing;
      let nodeList = this.data.nodeList;
      if (text && type === 'addText'){
        this.addText();//添加
      } else if (text && nodeList[index]){
        this.editorData(index, text);//修改
      //因为触发一些获取图片之类的api会触发show生命周期
      } else if (index !== '' && type !== 'addText'){
        this.editorData(index);//删除
      }
    }
  },

  attached: function () {
    //获得手机高度设置成组件的最少高度
    const { windowHeight, pixelRatio } = wx.getSystemInfoSync();
    let { aShow, runOver } = this.data
    this.setData({
      windowHeight,
      pixelRatio,
    })
    //判断用的是nodes还是html
    if (this.properties.nodes && this.properties.nodes.length > 0) {
      this.analysis(this.properties.nodes, aShow, runOver)
    } else if (this.properties.html) {
      const nodeList = this.HTMLtoNodeList();
      this.analysis(nodeList, aShow, runOver)
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * attached生命周期的nodes和html的初始化
     */
    analysis(nodeList, aShow, runOver) {
      aShow[0].b = false;
      nodeList.forEach(node => {
        aShow.push({ 
          b: false, 
          direction: 'bottom' 
        })
        runOver.push(this.dance(aX, createX))
      })
      this.setData({
        nodeList,
        aShow,
      })
      this.timeout({ runOver });
    },

    timeout(options, interval = 30){
      setTimeout(() => this.setData(options), interval);
    },

    toString(val) {
      return Object.prototype.toString.call(val)
    },

    /**
     * {name:动画名称,num:动作幅度}只有一种动画效果一个step
     * [{name:动画名称,num:动作幅度}]//只有一个step
     * [[{name:动画名称,num:动作幅度}]]//有多个step
     * 
     */
    dance(effect, create = {}) {
      let animation = wx.createAnimation(create);
      if (Array.isArray(effect)) {
        let len = effect.length - 1;
        effect.forEach((section, effectI) => {
          if (Array.isArray(section)) {
            len = section.length - 1;
            section.reduce((total, action, actionI) => {
              total[action.name](action.num);
              if (len == actionI) {
                return animation.step(action.step || {})
              } else {
                return animation
              }
            }, animation)
          } else {
            animation[section.name](section.num);
            if (len == effectI) {
              animation.step(section.step || {})
            }
          }

        })
      } else {
        animation[effect.name](effect.num).step(effect.step || {})
      }
      
      return animation.export();               
    },

    /**
     * 每次修改nodeList
     */
    editorData(index, node) {
      let { nodeList, aShow, runOver } = this.data
      const arr = [nodeList, aShow];
      //是否添加
      if (this.toString(node) === '[object Object]'){
        //img和video的text为undefined
        const element = [node, {
          b: false,
          direction: 'bottom'
        }]
        arr.push(runOver)
        arr.forEach((val, i) => val.splice(index + 1, 0, element[i]))
        aShow = this.hide();
        runOver[Number(index) + 1] = this.dance(aX, createX);
        // this.goBottom('#editor-wrapper')
      //是否修改
      } else if (this.toString(node) === '[object String]') {
        nodeList[index].children[0].text = node;
        runOver[index] = this.dance(aX, createX);
        // this.goBottom('#editor-wrapper')
      } else {
        arr.push(runOver)
        arr.forEach(val => val.splice(index, 1))
      }
      this.setData({
        nodeList,
        aShow,
      })
      this.timeout({ runOver });
      app.clearXing();
    },

    /**
     * 标签的id，
     * 到底部
     * bug：如果我想在顶部添加，还是会弹到底部，这并不是我想要的
     * 解决：要加判断，先不解决
     */
    goBottom(id) {
      wx.createSelectorQuery().in(this)
        .select(id).boundingClientRect()
        .selectViewport().scrollOffset()
        .exec(res => {
          let height = res[0].height
          if (height - res[1].scrollTop - this.data.windowHeight > 0) {
            wx.pageScrollTo({
              scrollTop: height
            })
          }
        })
    },

    hide(i) {
      return this.data.aShow.map( (val, index) => {
        if(i === index) return val;
        return {
          b: false,//显示隐藏
          direction: 'bottom',//箭头方向
        }
      });
    },

    tapHide(){
      this.setData({
        aShow: this.hide()
      })
    },

    editor(e) {
      let windowHeight = this.data.windowHeight
      let { index: i, query } = e.detail;
      query
      .select('#add-bottom').boundingClientRect()
      .select('#add-box').boundingClientRect()
      .select('#arrow').boundingClientRect()
      .exec( res => {
        const aShow = this.hide(i);
        aShow[i] = {
          b: !aShow[i].b,
          //三角形 + margin-top
          direction: res[0].top + res[1].height + res[2].height + 120 > windowHeight ? 'top' : 'bottom'
        };
        this.setData({
          aShow
        })
      })
    },

    onInput(e) {
      this.triggerEvent('input', e.detail.value);
    },

    /**
     * 事件：进入文本页面
     */
    toText: function (e) {
      const xing = app.globalData.xing;
      xing.type = e.type;
      //addText为添加，否则为修改
      if (xing.type === 'addText') {
        xing.index = e.detail
      } else {
        xing.index = e.currentTarget.dataset.index
        xing.text = this.data.nodeList[xing.index].children[0].text;
      }
      wx.navigateTo({
        url: `/pages/editor-text/editor-text`
      });
    },

    addText(){
      let { text, index } = app.globalData.xing;
      const node = {
        name: 'p',
        attrs: {
          class: 'xing-p',
          //  _id: Math.random()
        },
        children: [{
          type: 'text',
          text: text,
        }]
      }
      this.editorData(index, node);
    },

    /**
     * 事件：添加图片
     */
    addImage: function (e) {
      // this.writeTextToNode();
      const index = e.detail;

      wx.chooseImage({
        success: res => {
          const tempFilePath = res.tempFilePaths[0];
          wx.getImageInfo({
            src: tempFilePath,
            success: res => {
              const node = {
                name: 'image',
                attrs: {
                  class: 'xing-img',
                  style: 'width: 100%',
                  src: tempFilePath,
                  // _id: Math.random(),
                  /**
                   * 父组件传的参数是html或者nodes都是_height(被比例过的)
                   * onFinish提交出来的html也是_height(被比例过的)
                   */
                  _height: res.height / res.width,
                },
              }
              this.editorData(index, node);
            }
          })
        },
      })
    },

    /**
     * 事件：添加视频
     */
    addVideo(e) {
      const index = e.detail;
      wx.chooseVideo({
        success: res => {
          const node = {
            name: 'video',
            attrs: {
              class: 'xing-img',
              style: 'width: 100%',
              src: res.tempFilePath,
              // _id: Math.random(),
              /**
               * 父组件传的参数是html或者nodes都是_height(被比例过的)
               * onFinish提交出来的html也是_height(被比例过的)
               */
              _height: res.height / res.width,
            },
          }
          this.editorData(index, node);
        }
      })
    },

    /**
     * 事件：删除节点
     */
    deleteNode: function (e) {
      // this.writeTextToNode();
      const index = e.currentTarget.dataset.index;
      this.editorData(index);
    },

    /**
     * 交换数据
     */
    exchange(e) {
      let dataset = e.currentTarget.dataset;
      let { index, up } = dataset;
      //根据up判断是否为向上交换
      let contrast = up ? index - 1 : index;
      let { nodeList } = this.data;
      let i = 0;
      function fnSort(a, b){
        if (i++ == contrast) {
          return 1;
        }
        return 0;
      }
      nodeList.sort(fnSort)
      this.setData({
        nodeList,
      })
    },

    /**
     * 事件：提交内容
     */
    onFinish: function (e) {
      wx.showLoading({
        title: '正在保存',
      })
      this.handleOutput();
    },

    /**
     * 方法：HTML转义
     */
    htmlEncode: function (str) {
      var s = "";
      if (str.length == 0) return "";
      s = str.replace(/&/g, "&gt;");
      s = s.replace(/</g, "&lt;");
      s = s.replace(/>/g, "&gt;");
      s = s.replace(/ /g, "&nbsp;");
      s = s.replace(/\'/g, "&#39;");
      s = s.replace(/\"/g, "&quot;");
      s = s.replace(/\n/g, "<br>");
      return s;
    },

    /**
     * 方法：HTML转义
     */
    htmlDecode: function (str) {
      var s = "";
      if(str.length == 0) return "";
      s = str.replace(/&gt;/g, "&");
      s = s.replace(/&lt;/g, "<");
      s = s.replace(/&gt;/g, ">");
      s = s.replace(/&nbsp;/g, " ");
      s = s.replace(/&#39;/g, "\'");
      s = s.replace(/&quot;/g, "\"");
      s = s.replace(/<br>/g, "\n");
      return s;
    },

    /**
     * 方法：将HTML转为节点
     */
    HTMLtoNodeList: function () {
      let html = this.properties.html;
      let htmlNodeList = [];
      while (html.length > 0) {
        const endTag = html.match(/<\/[a-z0-9]+>/);
        if (!endTag) break;
        const htmlNode = html.substring(0, endTag.index + endTag[0].length);
        htmlNodeList.push(htmlNode);
        html = html.substring(endTag.index + endTag[0].length);
      }
      return htmlNodeList.map(htmlNode => {
        let node = {attrs: {}};
        const startTag = htmlNode.match(/<[^<>]+>/);
        const startTagStr = startTag[0].substring(1, startTag[0].length - 1).trim();
        node.name = startTagStr.split(/\s+/)[0];
        startTagStr.match(/[^\s]+="[^"]+"/g).forEach(attr => {
          const [name, value] = attr.split('=');
          node.attrs[name] = value.replace(/"/g, '');
        })
        if (node.name === 'p') {
          const endTag = htmlNode.match(/<\/[a-z0-9]+>/);
          const text = this.htmlDecode(htmlNode.substring(startTag.index + startTag[0].length, endTag.index).trim());
          node.children = [{
            text,
            type: 'text',
          }]
        }
        return node;
      })
    },

    /**
     * 方法：将节点转为HTML
     */
    nodeListToHTML: function () {
      return this.data.nodeList.map(node => `<${node.name} ${Object.keys(node.attrs).map(key => `${key}="${node.attrs[key]}"`).join(' ')}>${node.children ? this.htmlEncode(node.children[0].text) : ''}</${node.name}>`).join('');
    },

    /**
     * 方法：上传文件
     */
    upload: function (node, nodeName) {
      const properties = this.properties;
      let url = properties[nodeName + 'UploadUrl'] || properties.uploadUrl;
      let name = properties[nodeName + 'UploadName'];
      let header = properties[nodeName + 'UploadHeader'] || properties.uplHeader;
      let formData = properties[nodeName + 'UploadFormData'] || properties.uploaFormData;
      return new Promise(resolve => {
        let options = {
          filePath: node.attrs.src,
          url,
          name,
          header,
          formData
        }

        options.success = res => {
          //解析对象属性
          const keyChain = properties[nodeName+'UploadKeyChain'].split('.');
          let url = JSON.parse(res.data);
          keyChain.forEach(key => {
            url = url[key];
          })
          node.attrs.src = url;
          node.attrs._uploaded = true;
          resolve();
        }
        wx.uploadFile(options);
      })
    },

    /**
     * 方法：处理节点，递归
     */
    handleOutput: function (index = 0) {
      let nodeList = this.data.nodeList;
      if (index >= nodeList.length) {
        wx.hideLoading();
        if (this.properties.outputType.toLowerCase() === 'array') {
          this.triggerEvent('finish', { content: this.data.nodeList });
        }
        if (this.properties.outputType.toLowerCase() === 'html') {
          this.triggerEvent('finish', { content: this.nodeListToHTML() });
        }
        return;
      }
      const node = nodeList[index];
      //_uploaded判断是否已经上传过
      if (node.name !== 'p' && !node.attrs._uploaded) {
        this.upload(node, node.name).then(() => {
          this.handleOutput(index + 1)
        });
      } else {
        this.handleOutput(index + 1);
      }
    },
  }
})
